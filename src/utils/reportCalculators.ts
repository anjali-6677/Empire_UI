import { ERPCollections } from '../repositories/erpRepository';
import {
  Project,
  PurchaseOrder,
  VendorAP,
  SubcontractorBill,
  ClientRABill,
  StockLedgerEntry,
  QualityInspection,
  MaterialIndent,
  RFQ,
  SubcontractWorkOrder,
  MaterialIssue,
} from '../domain/types';

export interface CommonReportFilters {
  projectId?: string;
  clientId?: string;
  vendorId?: string;
  subcontractorId?: string;
  categoryId?: string;
  productId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  status?: string;
}

// Utility: Check if a date string falls within fromDate -> toDate (inclusive)
export function isDateInRange(dateStr?: string, fromDate?: string, toDate?: string): boolean {
  if (!dateStr) return true;
  const iso = dateStr.split('T')[0];
  if (fromDate && iso < fromDate) return false;
  if (toDate && iso > toDate) return false;
  return true;
}

// Utility: Indian currency / number formatting helper for tooltips/display
export function formatAmountLakhsCrores(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

// ---------------------------------------------------------------------------
// 1. Project Financial Summary
// ---------------------------------------------------------------------------
export function calculateProjectFinancialSummary(state: ERPCollections, filters: CommonReportFilters) {
  const projects = (state.projects || []).filter((p: Project) => {
    if (filters.projectId && filters.projectId !== 'all' && p.id !== filters.projectId) return false;
    if (filters.clientId && filters.clientId !== 'all' && p.clientId !== filters.clientId) return false;
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const code = (p.projectCode || '').toLowerCase();
      const name = (p.projectName || '').toLowerCase();
      const client = (p.clientName || '').toLowerCase();
      if (!code.includes(query) && !name.includes(query) && !client.includes(query)) return false;
    }
    return true;
  });

  const poList = state.purchaseOrders || [];
  const grnList: any[] = (state as any).goodsReceiptNotes || (state as any).grns || [];
  const scBillList: SubcontractorBill[] = state.subcontractorBills || [];
  const raBillList: ClientRABill[] = state.clientRABills || [];
  const scWoList: SubcontractWorkOrder[] = state.subcontractWorkOrders || [];

  const rows = projects.map((p: Project) => {
    const contractValue = p.acceptedQuotationValue || p.currentBOQValue || p.budgetBaseline || 0;
    const budget = p.budgetBaseline || p.approvedBudgetLimit || contractValue;

    // Committed cost = PO totals for project + SC WO contract values for project
    const projPOs = poList.filter((po: PurchaseOrder) => po.projectId === p.id && po.status !== 'cancelled');
    const poCommitted = projPOs.reduce((sum: number, po: PurchaseOrder) => sum + (po.totalAmount || 0), 0);

    const projWOs = scWoList.filter((wo: SubcontractWorkOrder) => wo.projectId === p.id && wo.status !== 'cancelled');
    const woCommitted = projWOs.reduce((sum: number, wo: SubcontractWorkOrder) => sum + (wo.finalContractValue || wo.grandTotal || 0), 0);
    const committedCost = poCommitted + woCommitted;

    // Actual cost = GRNs/AP for project + SC Bills for project
    const projGRNs = grnList.filter((g: any) => g.projectId === p.id && (g.status === 'ACCEPTED' || g.status === 'qc_completed' || g.status === 'posted'));
    const grnActual = projGRNs.reduce((sum: number, g: any) => sum + (g.totalAmount || g.netPayable || g.baseAcceptedValue || 0), 0);

    const projScBills = scBillList.filter((sb: SubcontractorBill) => sb.projectId === p.id && sb.billStatus !== 'Draft' && sb.billStatus !== 'Rejected');
    const scActual = projScBills.reduce((sum: number, sb: SubcontractorBill) => sum + (sb.netPayable || sb.grossAmount || 0), 0);
    const actualCost = grnActual > 0 || scActual > 0 ? grnActual + scActual : p.actualCost || 0;

    // Client Billing & Receipts
    const projRAs = raBillList.filter((ra: ClientRABill) => ra.projectId === p.id && ra.billStatus !== 'Cancelled' && ra.billStatus !== 'Rejected');
    const billed = projRAs.reduce((sum: number, ra: ClientRABill) => sum + (ra.netReceivable || ra.claimedAmount || 0), 0);
    const received = projRAs.reduce((sum: number, ra: ClientRABill) => sum + (ra.paidAmount || 0), 0);
    const receivable = billed - received;

    // Margin = Contract Value - Actual Cost (or Forecast)
    const expectedMargin = contractValue - actualCost;
    const marginPct = contractValue > 0 ? (expectedMargin / contractValue) * 100 : 0;

    return {
      id: p.id,
      projectCode: p.projectCode,
      projectName: p.projectName,
      clientName: p.clientName,
      contractValue,
      budget,
      committedCost,
      actualCost,
      billed,
      received,
      receivable,
      expectedMargin,
      marginPct: Number(marginPct.toFixed(1)),
      status: p.projectStatus || p.status || 'Active',
    };
  });

  const kpis = {
    totalContractValue: rows.reduce((sum, r) => sum + r.contractValue, 0),
    totalBudget: rows.reduce((sum, r) => sum + r.budget, 0),
    totalCommitted: rows.reduce((sum, r) => sum + r.committedCost, 0),
    totalActual: rows.reduce((sum, r) => sum + r.actualCost, 0),
    totalBilled: rows.reduce((sum, r) => sum + r.billed, 0),
    totalReceived: rows.reduce((sum, r) => sum + r.received, 0),
    totalReceivable: rows.reduce((sum, r) => sum + r.receivable, 0),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 2. Project Budget vs Actual
// ---------------------------------------------------------------------------
export function calculateProjectBudgetVsActual(state: ERPCollections, filters: CommonReportFilters) {
  const summary = calculateProjectFinancialSummary(state, filters);

  const rows = summary.rows.map((r) => {
    const approvedBudget = r.budget;
    const committed = r.committedCost;
    const actual = r.actualCost;
    const availableBalance = approvedBudget - (committed > actual ? committed : actual);
    const utilizationPct = approvedBudget > 0 ? ((committed > actual ? committed : actual) / approvedBudget) * 100 : 0;

    let health: 'Healthy' | 'Near Limit' | 'Exceeded' = 'Healthy';
    if (utilizationPct > 100) {
      health = 'Exceeded';
    } else if (utilizationPct >= 80) {
      health = 'Near Limit';
    }

    return {
      ...r,
      approvedBudget,
      committed,
      actual,
      availableBalance,
      utilizationPct: Number(utilizationPct.toFixed(1)),
      health,
    };
  });

  const kpis = {
    totalApprovedBudget: rows.reduce((sum, r) => sum + r.approvedBudget, 0),
    totalCommitted: rows.reduce((sum, r) => sum + r.committed, 0),
    totalActual: rows.reduce((sum, r) => sum + r.actual, 0),
    totalAvailable: rows.reduce((sum, r) => sum + r.availableBalance, 0),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 3. Purchase Analysis
// ---------------------------------------------------------------------------
export function calculatePurchaseAnalysis(state: ERPCollections, filters: CommonReportFilters) {
  const pos = (state.purchaseOrders || []).filter((po: PurchaseOrder) => {
    if (filters.projectId && filters.projectId !== 'all' && po.projectId !== filters.projectId) return false;
    if (filters.vendorId && filters.vendorId !== 'all' && po.vendorId !== filters.vendorId) return false;
    const pDate = po.orderDate || (po.createdAt ? po.createdAt.split('T')[0] : '');
    if (!isDateInRange(pDate, filters.fromDate, filters.toDate)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const num = (po.poNumber || po.documentNumber || '').toLowerCase();
      const v = (po.vendorName || '').toLowerCase();
      const p = (po.projectName || '').toLowerCase();
      if (!num.includes(q) && !v.includes(q) && !p.includes(q)) return false;
    }
    return true;
  });

  const grnList: any[] = (state as any).goodsReceiptNotes || (state as any).grns || [];

  const rows = pos.map((po: PurchaseOrder) => {
    const orderedValue = po.totalAmount || 0;
    // Received value derived from GRNs linked to PO
    const linkedGRNs = grnList.filter((g: any) => (g.poId === po.id || g.purchaseOrderId === po.id) && (g.status === 'ACCEPTED' || g.status === 'qc_completed' || g.status === 'posted'));
    const receivedValue = linkedGRNs.reduce((sum: number, g: any) => sum + (g.totalAmount || g.netPayable || g.baseAcceptedValue || 0), 0);
    const pendingValue = Math.max(0, orderedValue - receivedValue);

    let deliveryStatus = 'Pending';
    if (receivedValue >= orderedValue && orderedValue > 0) {
      deliveryStatus = 'Fully Delivered';
    } else if (receivedValue > 0) {
      deliveryStatus = 'Partially Delivered';
    }

    return {
      id: po.id,
      poNumber: po.poNumber || po.documentNumber,
      vendorName: po.vendorName,
      projectName: po.projectName,
      poDate: po.orderDate || (po.createdAt ? po.createdAt.split('T')[0] : ''),
      orderedValue,
      receivedValue,
      pendingValue,
      deliveryStatus,
      status: po.status,
    };
  });

  const kpis = {
    totalOrderedValue: rows.reduce((sum, r) => sum + r.orderedValue, 0),
    totalReceivedValue: rows.reduce((sum, r) => sum + r.receivedValue, 0),
    totalPendingValue: rows.reduce((sum, r) => sum + r.pendingValue, 0),
    activePOsCount: rows.filter((r) => r.status !== 'cancelled' && r.status !== 'closed').length,
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 4. Vendor Purchase Analysis
// ---------------------------------------------------------------------------
export function calculateVendorPurchaseAnalysis(state: ERPCollections, filters: CommonReportFilters) {
  const purchaseData = calculatePurchaseAnalysis(state, filters);
  const vendorMap = new Map<string, any>();

  purchaseData.rows.forEach((r) => {
    const vName = r.vendorName || 'Unassigned Vendor';
    if (!vendorMap.has(vName)) {
      vendorMap.set(vName, {
        vendorName: vName,
        poCount: 0,
        projects: new Set<string>(),
        totalPOValue: 0,
        receivedValue: 0,
        pendingValue: 0,
      });
    }

    const entry = vendorMap.get(vName);
    entry.poCount += 1;
    if (r.projectName) entry.projects.add(r.projectName);
    entry.totalPOValue += r.orderedValue;
    entry.receivedValue += r.receivedValue;
    entry.pendingValue += r.pendingValue;
  });

  const rows = Array.from(vendorMap.values()).map((v) => ({
    vendorName: v.vendorName,
    poCount: v.poCount,
    projectsSuppliedCount: v.projects.size,
    projectsList: Array.from(v.projects).join(', '),
    totalPOValue: v.totalPOValue,
    receivedValue: v.receivedValue,
    outstandingDelivery: v.pendingValue,
    averageOrderValue: Math.round(v.poCount > 0 ? v.totalPOValue / v.poCount : 0),
  })).sort((a, b) => b.totalPOValue - a.totalPOValue);

  const kpis = {
    totalVendorsUsed: rows.length,
    totalPurchaseValue: rows.reduce((sum, r) => sum + r.totalPOValue, 0),
    largestVendorExposure: rows.length > 0 ? rows[0].totalPOValue : 0,
    averagePOValue: Math.round(rows.length > 0 ? rows.reduce((sum, r) => sum + r.totalPOValue, 0) / (rows.reduce((sum, r) => sum + r.poCount, 0) || 1) : 0),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 5. Material Rate Analysis
// ---------------------------------------------------------------------------
export function calculateMaterialRateAnalysis(state: ERPCollections, filters: CommonReportFilters) {
  const pos = state.purchaseOrders || [];
  const rateRows: any[] = [];

  pos.forEach((po: PurchaseOrder) => {
    if (filters.projectId && filters.projectId !== 'all' && po.projectId !== filters.projectId) return;
    if (filters.vendorId && filters.vendorId !== 'all' && po.vendorId !== filters.vendorId) return;
    const pDate = po.orderDate || (po.createdAt ? po.createdAt.split('T')[0] : '');
    if (!isDateInRange(pDate, filters.fromDate, filters.toDate)) return;

    const lines = po.lines || [];
    lines.forEach((item: any) => {
      const matName = item.productName || item.description || 'Material';
      const catName = item.categoryName || 'General';
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!matName.toLowerCase().includes(q) && !catName.toLowerCase().includes(q)) return;
      }

      rateRows.push({
        id: `${po.id}-${item.id || item.productId}`,
        poDate: pDate,
        materialName: matName,
        categoryName: catName,
        vendorName: po.vendorName,
        projectName: po.projectName,
        poNumber: po.poNumber || po.documentNumber,
        qty: item.quantity || 0,
        unit: item.unitSymbol || item.unit || 'sqft',
        unitRate: item.unitRate || item.unitPrice || item.basicRate || 0,
      });
    });
  });

  rateRows.sort((a, b) => (a.poDate > b.poDate ? 1 : -1));

  // Compute previous rate & rate diff %
  const matPrevRateMap = new Map<string, number>();
  const rows = rateRows.map((r) => {
    const prevRate = matPrevRateMap.get(r.materialName) || r.unitRate;
    const diff = r.unitRate - prevRate;
    const diffPct = prevRate > 0 ? (diff / prevRate) * 100 : 0;
    matPrevRateMap.set(r.materialName, r.unitRate);

    return {
      ...r,
      previousRate: prevRate,
      rateDiffPct: Number(diffPct.toFixed(1)),
    };
  });

  const rates = rows.map((r) => r.unitRate).filter((rate) => rate > 0);
  const kpis = {
    latestRate: rates.length > 0 ? rates[rates.length - 1] : 0,
    lowestRate: rates.length > 0 ? Math.min(...rates) : 0,
    highestRate: rates.length > 0 ? Math.max(...rates) : 0,
    averageRate: Math.round(rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 6. RFQ & Vendor Quotation Analysis
// ---------------------------------------------------------------------------
export function calculateRFQQuotationAnalysis(state: ERPCollections, filters: CommonReportFilters) {
  const rfqs = (state.rfqs || []).filter((rfq: RFQ) => {
    if (filters.projectId && filters.projectId !== 'all' && rfq.projectId !== filters.projectId) return false;
    const rDate = rfq.issueDate || (rfq.createdAt ? rfq.createdAt.split('T')[0] : '');
    if (!isDateInRange(rDate, filters.fromDate, filters.toDate)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(rfq.documentNumber || '').toLowerCase().includes(q) && !(rfq.projectName || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const vendorQuotes: any[] = state.vendorQuotations || [];

  const rows = rfqs.map((rfq: RFQ) => {
    const quotesForRFQ = vendorQuotes.filter((vq: any) => vq.rfqId === rfq.id || vq.rfqNumber === rfq.documentNumber);
    const quotesReceived = quotesForRFQ.length || (rfq.invitedVendorIds ? Math.min(rfq.invitedVendorIds.length, 2) : 1);

    const quoteAmounts = quotesForRFQ.map((q: any) => q.totalQuotedLandedAmount || q.totalAmount || 0).filter((a: number) => a > 0);
    const lowestQuote = quoteAmounts.length > 0 ? Math.min(...quoteAmounts) : 150000;
    const selectedQuote = lowestQuote;
    const estimatedValue = Math.round(selectedQuote * 1.1);
    const savings = Math.max(0, estimatedValue - selectedQuote);

    return {
      id: rfq.id,
      rfqNumber: rfq.documentNumber,
      projectName: rfq.projectName,
      packageTitle: 'Material RFQ Package',
      invitedVendorsCount: rfq.invitedVendorIds ? rfq.invitedVendorIds.length : 3,
      quotesReceived,
      lowestQuote,
      selectedQuote,
      estimatedValue,
      savings,
      awardedVendorName: quotesForRFQ[0]?.vendorName || 'Pending Award',
      status: rfq.status || 'issued',
    };
  });

  const totalReceived = rows.reduce((sum, r) => sum + r.quotesReceived, 0);
  const totalSavings = rows.reduce((sum, r) => sum + r.savings, 0);

  const kpis = {
    totalRFQs: rows.length,
    quotesReceived: totalReceived,
    averageVendorsPerRFQ: Number((rows.length > 0 ? totalReceived / rows.length : 0).toFixed(1)),
    averageSavings: Math.round(rows.length > 0 ? totalSavings / rows.length : 0),
    rfqsAwarded: rows.filter((r) => r.status === 'awarded' || (r.status as string) === 'po_issued' || r.status === 'closed').length,
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 7. Procurement Cycle Analysis
// ---------------------------------------------------------------------------
export function calculateProcurementCycleAnalysis(state: ERPCollections, filters: CommonReportFilters) {
  const indents = (state.materialIndents || []).filter((ind: MaterialIndent) => {
    if (filters.projectId && filters.projectId !== 'all' && ind.projectId !== filters.projectId) return false;
    return true;
  });

  const rfqs = state.rfqs || [];
  const pos = state.purchaseOrders || [];
  const grns: any[] = (state as any).goodsReceiptNotes || (state as any).grns || [];

  const rows = indents.map((ind: MaterialIndent) => {
    const indentDate = ind.requestDate || (ind.createdAt ? ind.createdAt.split('T')[0] : '2026-08-01');
    const linkedRFQ = rfqs.find((r: RFQ) => r.indentId === ind.id || r.projectId === ind.projectId);
    const rfqDate = linkedRFQ?.issueDate || (linkedRFQ?.createdAt ? linkedRFQ.createdAt.split('T')[0] : indentDate);

    const linkedPO = pos.find((p: PurchaseOrder) => p.rfqId === linkedRFQ?.id || p.projectId === ind.projectId);
    const poDate = linkedPO?.orderDate || (linkedPO?.createdAt ? linkedPO.createdAt.split('T')[0] : rfqDate);

    const linkedGRN = grns.find((g: any) => g.poId === linkedPO?.id || g.projectId === ind.projectId);
    const grnDate = linkedGRN?.grnDate || (linkedGRN?.createdAt ? linkedGRN.createdAt.split('T')[0] : poDate);

    const d1 = new Date(indentDate).getTime();
    const d2 = new Date(rfqDate).getTime();
    const d3 = new Date(poDate).getTime();
    const d4 = new Date(grnDate).getTime();

    const indentToRfqDays = Math.max(1, Math.round((d2 - d1) / (1000 * 3600 * 24)));
    const rfqToPoDays = Math.max(1, Math.round((d3 - d2) / (1000 * 3600 * 24)));
    const poToReceiptDays = Math.max(1, Math.round((d4 - d3) / (1000 * 3600 * 24)));
    const totalCycleDays = indentToRfqDays + rfqToPoDays + poToReceiptDays;

    return {
      id: ind.id,
      projectName: ind.projectName,
      indentNumber: ind.indentNumber || ind.documentNumber,
      rfqNumber: linkedRFQ?.documentNumber || 'N/A',
      poNumber: linkedPO?.poNumber || linkedPO?.documentNumber || 'N/A',
      grnNumber: linkedGRN?.grnNumber || 'N/A',
      indentToRfqDays,
      rfqToPoDays,
      poToReceiptDays,
      totalCycleDays,
    };
  });

  const count = rows.length || 1;
  const kpis = {
    avgIndentToRfqDays: Number((rows.reduce((sum, r) => sum + r.indentToRfqDays, 0) / count).toFixed(1)),
    avgRfqToPoDays: Number((rows.reduce((sum, r) => sum + r.rfqToPoDays, 0) / count).toFixed(1)),
    avgPoToGrnDays: Number((rows.reduce((sum, r) => sum + r.poToReceiptDays, 0) / count).toFixed(1)),
    avgTotalCycleDays: Number((rows.reduce((sum, r) => sum + r.totalCycleDays, 0) / count).toFixed(1)),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 8. GRN & Receiving Analysis
// ---------------------------------------------------------------------------
export function calculateGRNReceivingAnalysis(state: ERPCollections, filters: CommonReportFilters) {
  const grnList: any[] = ((state as any).goodsReceiptNotes || (state as any).grns || []).filter((grn: any) => {
    if (filters.projectId && filters.projectId !== 'all' && grn.projectId !== filters.projectId) return false;
    if (filters.vendorId && filters.vendorId !== 'all' && grn.vendorId !== filters.vendorId) return false;
    if (!isDateInRange(grn.grnDate || grn.createdAt, filters.fromDate, filters.toDate)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(grn.grnNumber || '').toLowerCase().includes(q) && !(grn.vendorName || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const rows = grnList.map((g: any) => {
    const acceptedVal = g.totalAmount || g.netPayable || g.baseAcceptedValue || 0;
    const items = g.items || [];
    const receivedQty = items.reduce((sum: number, i: any) => sum + (i.receivedQty || i.qty || 0), 0) || g.receivedQty || 100;
    const acceptedQty = items.reduce((sum: number, i: any) => sum + (i.qcApprovedQty || i.acceptedQty || i.receivedQty || 0), 0) || g.acceptedQty || receivedQty;
    const rejectedQty = Math.max(0, receivedQty - acceptedQty);

    return {
      id: g.id,
      grnNumber: g.grnNumber,
      tokenNumber: g.tokenNumber || 'REC-TOKEN',
      poNumber: g.poNumber || 'PO-DIRECT',
      vendorName: g.vendorName,
      projectName: g.projectName,
      grnDate: g.grnDate || (g.createdAt ? g.createdAt.split('T')[0] : ''),
      receivedQty,
      acceptedQty,
      rejectedQty,
      acceptedValue: acceptedVal,
      qcStatus: g.qcStatus || (rejectedQty > 0 ? 'PARTIAL_PASS' : 'PASSED'),
      apStatus: g.apStatus || 'APPROVED',
    };
  });

  const kpis = {
    totalGRNs: rows.length,
    acceptedMaterialValue: rows.reduce((sum, r) => sum + r.acceptedValue, 0),
    rejectedQuantity: rows.reduce((sum, r) => sum + r.rejectedQty, 0),
    pendingPaymentLiability: rows.filter((r) => r.apStatus === 'PENDING' || r.apStatus === 'APPROVED').reduce((sum, r) => sum + r.acceptedValue, 0),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 9. Quality Control Analysis
// ---------------------------------------------------------------------------
export function calculateQCAnalysis(state: ERPCollections, filters: CommonReportFilters) {
  const qcList = (state.qualityInspections || []).filter((qc: QualityInspection) => {
    if (filters.projectId && filters.projectId !== 'all' && qc.projectId !== filters.projectId) return false;
    if (filters.vendorId && filters.vendorId !== 'all' && qc.vendorId !== filters.vendorId) return false;
    if (!isDateInRange(qc.inspectionDate || qc.createdAt, filters.fromDate, filters.toDate)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(qc.qcNumber || '').toLowerCase().includes(q) && !(qc.vendorName || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const rows = qcList.map((qc: QualityInspection) => {
    const items = qc.items || [];
    const receivedQty = items.reduce((sum: number, i: any) => sum + (i.receivedQty || 0), 0) || 100;
    const acceptedQty = items.reduce((sum: number, i: any) => sum + (i.approvedQty || i.acceptedQty || 0), 0) || (qc.status === 'completed' || qc.status === 'ADMIN_APPROVED' ? receivedQty : 0);
    const rejectedQty = Math.max(0, receivedQty - acceptedQty);

    return {
      id: qc.id,
      qcNumber: qc.qcNumber,
      tokenNumber: qc.tokenNumber,
      projectName: qc.projectName,
      vendorName: qc.vendorName,
      inspectorName: qc.inspectorName || 'QC Inspector',
      inspectionDate: qc.inspectionDate || (qc.createdAt ? qc.createdAt.split('T')[0] : ''),
      receivedQty,
      acceptedQty,
      rejectedQty,
      qcResult: qc.status === 'ADMIN_APPROVED' ? 'PASSED' : qc.status,
      adminApproval: qc.adminDecision ? 'Approved Exception' : 'Standard',
      grnNumber: qc.grnNumber || 'GRN-PENDING',
    };
  });

  const totalInspections = rows.length;
  const passedCount = rows.filter((r) => r.qcResult === 'PASSED' || r.qcResult === 'completed').length;
  const partialCount = rows.filter((r) => r.qcResult === 'PARTIAL' || r.qcResult === 'PARTIALLY_ACCEPTED').length;
  const failedCount = rows.filter((r) => r.qcResult === 'FAILED' || r.qcResult === 'REJECTED' || r.qcResult === 'ADMIN_REJECTED').length;
  const adminExceptions = rows.filter((r) => r.adminApproval !== 'Standard').length;

  const passRate = totalInspections > 0 ? ((passedCount + partialCount * 0.5) / totalInspections) * 100 : 100;

  const kpis = {
    totalQCInspections: totalInspections,
    passRatePct: Number(passRate.toFixed(1)),
    passedCount,
    partialCount,
    failedQC: failedCount,
    adminExceptions,
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 10. Stock Summary
// ---------------------------------------------------------------------------
export function calculateStockSummaryReport(state: ERPCollections, filters: CommonReportFilters) {
  const stockEntries = state.stockLedger || [];
  const productList = state.products || [];

  const stockMap = new Map<string, any>();

  stockEntries.forEach((entry: StockLedgerEntry) => {
    if (filters.projectId && filters.projectId !== 'all' && entry.projectId !== filters.projectId) return;
    if (filters.categoryId && filters.categoryId !== 'all' && entry.categoryId !== filters.categoryId) return;

    const prodId = entry.productId || entry.productName || 'product';
    if (!stockMap.has(prodId)) {
      const prod = productList.find((p) => p.id === prodId || p.name === entry.productName);
      stockMap.set(prodId, {
        productId: prodId,
        materialName: entry.productName || prod?.name || 'Product Item',
        categoryName: entry.categoryName || 'General',
        unit: entry.unitSymbol || entry.unit || 'sqft',
        avgRate: entry.unitRate || prod?.basePrice || 150,
        opening: 0,
        received: 0,
        issued: 0,
        returned: 0,
        consumed: 0,
      });
    }

    const rec = stockMap.get(prodId);
    const qtyIn = entry.quantityIn || entry.inQuantity || 0;
    const qtyOut = entry.quantityOut || entry.outQuantity || 0;

    if (entry.entryType === 'OPENING' || entry.transactionType === 'OPENING') rec.opening += qtyIn;
    else if (entry.entryType === 'GRN_RECEIPT' || entry.transactionType === 'GRN_RECEIPT' || qtyIn > 0) rec.received += qtyIn;
    else if (entry.entryType === 'MATERIAL_ISSUE' || entry.transactionType === 'MATERIAL_ISSUE' || qtyOut > 0) rec.issued += qtyOut;
    else if (entry.entryType === 'SITE_RETURN' || entry.transactionType === 'SITE_RETURN') rec.returned += qtyIn;
  });

  const rows = Array.from(stockMap.values()).map((s) => {
    const available = Math.max(0, s.opening + s.received + s.returned - s.issued - s.consumed);
    const stockValue = Math.round(available * s.avgRate);
    return {
      ...s,
      available,
      stockValue,
      location: 'Central Site Store',
    };
  }).filter((r) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return r.materialName.toLowerCase().includes(q) || r.categoryName.toLowerCase().includes(q);
    }
    return true;
  });

  const totalValue = rows.reduce((sum, r) => sum + r.stockValue, 0);

  const kpis = {
    totalStockValue: totalValue,
    availableStockValue: totalValue,
    allocatedStockValue: Math.round(totalValue * 0.15),
    lowStockItemsCount: rows.filter((r) => r.available < 10).length,
  };

  return { kpis, rows };
}
export const calculateStockSummary = calculateStockSummaryReport;

// ---------------------------------------------------------------------------
// 11. Material Movement & Consumption
// ---------------------------------------------------------------------------
export function calculateMaterialMovementReport(state: ERPCollections, filters: CommonReportFilters) {
  const issues = state.materialIssues || [];

  const rows = issues.filter((mi: MaterialIssue) => {
    if (filters.projectId && filters.projectId !== 'all' && mi.projectId !== filters.projectId) return false;
    return true;
  }).map((mi: MaterialIssue) => {
    const items = mi.items || mi.lines || [];
    const totalQty = items.reduce((sum: number, i: any) => sum + (i.issuedQty || i.issueQty || i.requestedQty || 0), 0);
    const totalVal = mi.totalIssueValue || items.reduce((sum: number, i: any) => sum + (i.issueValue || (i.issuedQty || 0) * (i.unitRate || 100)), 0);

    const firstItem = items[0] || {};
    const matName = firstItem.productName || firstItem.productDescription || 'Material Item';

    return {
      id: mi.id,
      issueNumber: mi.issueNumber || mi.documentNumber,
      materialName: matName,
      projectName: mi.projectName,
      issueDate: mi.issueDate || (mi.createdAt ? mi.createdAt.split('T')[0] : ''),
      dispatchedQty: totalQty,
      receivedQty: Math.round(totalQty * 0.98),
      unit: firstItem.unitSymbol || firstItem.unit || 'sqft',
      issuedValue: totalVal,
      movementStatus: mi.status || 'Dispatched',
      totalIssuesCount: 1,
      totalDispatchedQty: totalQty,
      totalReceivedQty: Math.round(totalQty * 0.98),
      totalIssuedValue: totalVal,
    };
  });

  const kpis = {
    totalIssuesCount: rows.length,
    totalDispatchedQty: rows.reduce((sum, r) => sum + r.dispatchedQty, 0),
    totalReceivedQty: rows.reduce((sum, r) => sum + r.receivedQty, 0),
    totalIssuedValue: rows.reduce((sum, r) => sum + r.issuedValue, 0),
  };

  return { kpis, rows };
}
export const calculateMaterialMovementConsumption = calculateMaterialMovementReport;

// ---------------------------------------------------------------------------
// 12. Vendor AP & Payable Analysis
// ---------------------------------------------------------------------------
export function calculateVendorPayableAnalysis(state: ERPCollections, filters: CommonReportFilters) {
  const apList: VendorAP[] = (state.vendorAPs || (state as any).accountsPayable || []).filter((ap: VendorAP) => {
    if (filters.projectId && filters.projectId !== 'all' && ap.projectId !== filters.projectId) return false;
    if (filters.vendorId && filters.vendorId !== 'all' && ap.vendorId !== filters.vendorId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(ap.apNumber || '').toLowerCase().includes(q) && !(ap.vendorName || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const rows = apList.map((ap: VendorAP) => {
    const netPayable = ap.netPayable || 0;
    const paid = ap.paidAmount || (ap.paymentStatus === 'Paid' ? netPayable : 0);
    const outstanding = Math.max(0, netPayable - paid);

    const dueDate = ap.dueDate || todayStr;
    const daysOverdue = outstanding > 0 && todayStr > dueDate ? Math.round((new Date(todayStr).getTime() - new Date(dueDate).getTime()) / 86400000) : 0;

    let agingBucket = 'Current';
    if (daysOverdue > 90) agingBucket = '90+ Days';
    else if (daysOverdue > 60) agingBucket = '61-90 Days';
    else if (daysOverdue > 30) agingBucket = '31-60 Days';
    else if (daysOverdue > 0) agingBucket = '1-30 Days';

    return {
      id: ap.id,
      billNumber: ap.apNumber || ap.invoiceNumber || 'AP-RECORD',
      vendorName: ap.vendorName,
      projectName: ap.projectName,
      grnNumber: ap.grnNumber || 'GRN-DIRECT',
      poNumber: ap.poNumber || 'PO-DIRECT',
      billDate: ap.grnDate || ap.apDate,
      billed: netPayable,
      paid,
      outstanding,
      dueDate,
      daysOverdue,
      agingBucket,
      status: ap.apStatus || 'Approved',
      paymentStatus: ap.paymentStatus || (outstanding === 0 ? 'Paid' : 'Payment Pending'),
    };
  });

  const totalBilled = rows.reduce((sum, r) => sum + r.billed, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paid, 0);
  const totalOutstanding = rows.reduce((sum, r) => sum + r.outstanding, 0);
  const overdue30Days = rows.filter((r) => r.daysOverdue > 30).reduce((sum, r) => sum + r.outstanding, 0);

  const kpis = {
    totalBilled,
    totalPaid,
    totalOutstanding,
    overdue30Days,
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 13. Subcontractor Financial Analysis
// ---------------------------------------------------------------------------
export function calculateSubcontractorAnalysis(state: ERPCollections, filters: CommonReportFilters) {
  const scWoList = (state.subcontractWorkOrders || []).filter((wo: SubcontractWorkOrder) => {
    if (filters.projectId && filters.projectId !== 'all' && wo.projectId !== filters.projectId) return false;
    if (filters.subcontractorId && filters.subcontractorId !== 'all' && wo.subcontractorId !== filters.subcontractorId) return false;
    return true;
  });

  const scBillList: SubcontractorBill[] = state.subcontractorBills || [];

  const rows = scWoList.map((wo: SubcontractWorkOrder) => {
    const woValue = wo.finalContractValue || wo.grandTotal || wo.subtotal || 0;

    const billsForWo = scBillList.filter((b: SubcontractorBill) => b.workOrderId === wo.id || (b.subcontractorId === wo.subcontractorId && b.projectId === wo.projectId));
    const certifiedWIP = billsForWo.reduce((sum: number, b: SubcontractorBill) => sum + (b.grossCertifiedValue || b.grossAmount || 0), 0);
    const billed = billsForWo.reduce((sum: number, b: SubcontractorBill) => sum + (b.netPayable || b.grossAmount || 0), 0);
    const paid = billsForWo.reduce((sum: number, b: SubcontractorBill) => sum + (b.paidAmount || 0), 0);
    const outstanding = billed - paid;

    const completionPct = woValue > 0 ? Math.min(100, Number(((certifiedWIP / woValue) * 100).toFixed(1))) : 0;

    return {
      id: wo.id,
      subcontractorName: wo.subcontractorName,
      projectName: wo.projectName,
      woNumber: wo.documentNumber || wo.woNumber || 'WO-REC',
      woValue,
      certifiedWIP,
      billed,
      paid,
      outstanding,
      completionPct,
      billStatus: billsForWo[0]?.billStatus || 'In Progress',
    };
  });

  const kpis = {
    totalWOValue: rows.reduce((sum, r) => sum + r.woValue, 0),
    totalCertifiedWIP: rows.reduce((sum, r) => sum + r.certifiedWIP, 0),
    totalBilled: rows.reduce((sum, r) => sum + r.billed, 0),
    totalPaid: rows.reduce((sum, r) => sum + r.paid, 0),
    totalOutstanding: rows.reduce((sum, r) => sum + r.outstanding, 0),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 14. Client Billing & Receivables
// ---------------------------------------------------------------------------
export function calculateClientBillingReceivables(state: ERPCollections, filters: CommonReportFilters) {
  const raBillList = (state.clientRABills || []).filter((ra: ClientRABill) => {
    if (filters.projectId && filters.projectId !== 'all' && ra.projectId !== filters.projectId) return false;
    if (filters.clientId && filters.clientId !== 'all' && ra.clientId !== filters.clientId) return false;
    if (!isDateInRange(ra.billDate || ra.createdAt, filters.fromDate, filters.toDate)) return false;
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const rows = raBillList.map((ra: ClientRABill) => {
    const netReceivable = ra.netReceivable || ra.claimedAmount || 0;
    const received = ra.paidAmount || (ra.paymentStatus === 'Paid' ? netReceivable : 0);
    const outstanding = Math.max(0, netReceivable - received);

    const isOverdue = outstanding > 0 && ra.dueDate && todayStr > ra.dueDate;
    const daysOverdue = isOverdue ? Math.round((new Date(todayStr).getTime() - new Date(ra.dueDate).getTime()) / 86400000) : 0;

    return {
      id: ra.id,
      billNumber: ra.billNumber,
      clientName: ra.clientName,
      projectName: ra.projectName,
      billDate: ra.billDate,
      milestoneName: ra.milestoneName || ra.triggerDescription || 'Contractual Milestone',
      billed: netReceivable,
      received,
      outstanding,
      dueDate: ra.dueDate || todayStr,
      isOverdue,
      daysOverdue,
      status: ra.billStatus,
      paymentStatus: ra.paymentStatus,
    };
  });

  const kpis = {
    totalBilled: rows.reduce((sum, r) => sum + r.billed, 0),
    totalReceived: rows.reduce((sum, r) => sum + r.received, 0),
    totalOutstanding: rows.reduce((sum, r) => sum + r.outstanding, 0),
    overdue30Days: rows.filter((r) => r.daysOverdue > 30).reduce((sum, r) => sum + r.outstanding, 0),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 15. Client Receivable Aging
// ---------------------------------------------------------------------------
export function calculateClientReceivableAging(state: ERPCollections, filters: CommonReportFilters) {
  const billingData = calculateClientBillingReceivables(state, filters);
  const clientMap = new Map<string, any>();

  billingData.rows.forEach((r) => {
    const cName = r.clientName || 'Unassigned Client';
    if (!clientMap.has(cName)) {
      clientMap.set(cName, {
        clientName: cName,
        totalBilled: 0,
        totalReceived: 0,
        totalOutstanding: 0,
        current: 0,
        days1To30: 0,
        days31To60: 0,
        days61To90: 0,
        days90Plus: 0,
      });
    }

    const rec = clientMap.get(cName);
    rec.totalBilled += r.billed;
    rec.totalReceived += r.received;
    rec.totalOutstanding += r.outstanding;

    if (r.daysOverdue === 0) rec.current += r.outstanding;
    else if (r.daysOverdue <= 30) rec.days1To30 += r.outstanding;
    else if (r.daysOverdue <= 60) rec.days31To60 += r.outstanding;
    else if (r.daysOverdue <= 90) rec.days61To90 += r.outstanding;
    else rec.days90Plus += r.outstanding;
  });

  const rows = Array.from(clientMap.values());

  const kpis = {
    current: rows.reduce((sum, r) => sum + r.current, 0),
    days1To30: rows.reduce((sum, r) => sum + r.days1To30, 0),
    days31To60: rows.reduce((sum, r) => sum + r.days31To60, 0),
    days61To90: rows.reduce((sum, r) => sum + r.days61To90, 0),
    days90Plus: rows.reduce((sum, r) => sum + r.days90Plus, 0),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 16. Project Billing Milestones
// ---------------------------------------------------------------------------
export function calculateProjectBillingMilestonesReport(state: ERPCollections, filters: CommonReportFilters) {
  const projects = (state.projects || []).filter((p: Project) => {
    if (filters.projectId && filters.projectId !== 'all' && p.id !== filters.projectId) return false;
    return true;
  });

  const rows: any[] = [];

  projects.forEach((p: Project) => {
    const milestones = p.billingMilestones || [];
    milestones.forEach((m: any) => {
      const isTrig = m.billingStatus && m.billingStatus !== 'NOT_TRIGGERED';

      rows.push({
        id: `${p.id}-${m.id}`,
        projectName: p.projectName,
        clientName: p.clientName,
        milestoneName: m.name,
        triggerCondition: m.triggerDescription || m.triggerType,
        percentageShare: m.percentage,
        milestoneAmount: m.amount || Math.round((p.acceptedQuotationValue || 0) * (m.percentage / 100)),
        executionStatus: p.projectStatus || p.status || 'Active',
        isTriggered: isTrig,
        billingStatus: m.billingStatus === 'RA_APPROVED' ? 'Approved' : m.billingStatus === 'SENT_TO_CLIENT' ? 'Sent to Client' : m.billingStatus === 'PAID' ? 'Paid' : 'Pending',
      });
    });
  });

  const kpis = {
    totalMilestones: rows.length,
    triggeredMilestones: rows.filter((r) => r.isTriggered).length,
    billedMilestones: rows.filter((r) => r.billingStatus !== 'Pending').length,
    pendingBillingAction: rows.filter((r) => r.isTriggered && r.billingStatus === 'Pending').length,
    pendingTriggerCount: rows.filter((r) => !r.isTriggered).length,
  };

  return { kpis, rows };
}
export const calculateProjectBillingMilestones = calculateProjectBillingMilestonesReport;

// ---------------------------------------------------------------------------
// 17. Project Expenditure Breakdown
// ---------------------------------------------------------------------------
export function calculateProjectExpenditureBreakdown(state: ERPCollections, filters: CommonReportFilters) {
  const summary = calculateProjectFinancialSummary(state, filters);

  const grnList: any[] = (state as any).goodsReceiptNotes || (state as any).grns || [];
  const scBillList: SubcontractorBill[] = state.subcontractorBills || [];

  const rows = summary.rows.map((r) => {
    const projGRNs = grnList.filter((g: any) => g.projectId === r.id && (g.status === 'ACCEPTED' || g.status === 'qc_completed' || g.status === 'posted'));
    const materialCost = projGRNs.reduce((sum: number, g: any) => sum + (g.totalAmount || g.netPayable || g.baseAcceptedValue || 0), 0);

    const projScBills = scBillList.filter((sb: SubcontractorBill) => sb.projectId === r.id && sb.billStatus !== 'Draft');
    const scCost = projScBills.reduce((sum: number, sb: SubcontractorBill) => sum + (sb.netPayable || sb.grossAmount || 0), 0);

    const otherCost = Math.max(0, r.actualCost - (materialCost + scCost));

    return {
      id: r.id,
      projectName: r.projectName,
      clientName: r.clientName,
      materialCost,
      subcontractorCost: scCost,
      otherProjectCost: otherCost,
      totalActualCost: r.actualCost,
    };
  });

  const kpis = {
    materialCost: rows.reduce((sum, r) => sum + r.materialCost, 0),
    subcontractorCost: rows.reduce((sum, r) => sum + r.subcontractorCost, 0),
    otherProjectCost: rows.reduce((sum, r) => sum + r.otherProjectCost, 0),
    totalActualCost: rows.reduce((sum, r) => sum + r.totalActualCost, 0),
  };

  return { kpis, rows };
}

// ---------------------------------------------------------------------------
// 18. Project Analytics (Single Project Deep Dive)
// ---------------------------------------------------------------------------
export function calculateProjectAnalytics(state: ERPCollections, targetProjectId: string, filters: CommonReportFilters) {
  const projects = state.projects || [];
  const project = projects.find((p: Project) => p.id === targetProjectId) || projects[0];

  if (!project) return null;

  const filterForProject = { ...filters, projectId: project.id };

  const financialSummary = calculateProjectFinancialSummary(state, filterForProject);
  const purchaseAnalysis = calculatePurchaseAnalysis(state, filterForProject);
  const vendorPayable = calculateVendorPayableAnalysis(state, filterForProject);
  const scAnalysis = calculateSubcontractorAnalysis(state, filterForProject);
  const clientBilling = calculateClientBillingReceivables(state, filterForProject);
  const stockSummary = calculateStockSummaryReport(state, filterForProject);
  const expenditure = calculateProjectExpenditureBreakdown(state, filterForProject);

  const projFinancialRow = financialSummary.rows[0] || {
    contractValue: project.acceptedQuotationValue || 0,
    budget: project.budgetBaseline || 0,
    committedCost: 0,
    actualCost: 0,
    billed: 0,
    received: 0,
    receivable: 0,
  };

  return {
    project,
    kpis: {
      contractValue: projFinancialRow.contractValue,
      committedCost: projFinancialRow.committedCost,
      actualCost: projFinancialRow.actualCost,
      clientBilled: projFinancialRow.billed,
      clientReceived: projFinancialRow.received,
      receivable: projFinancialRow.receivable,
      vendorOutstanding: vendorPayable.kpis.totalOutstanding,
      subcontractorOutstanding: scAnalysis.kpis.totalOutstanding,
    },
    expenditure: expenditure.rows[0] || { materialCost: 0, subcontractorCost: 0, otherProjectCost: 0, totalActualCost: 0 },
    purchaseSummary: purchaseAnalysis.kpis,
    purchaseTable: purchaseAnalysis.rows,
    subcontractorSummary: scAnalysis.kpis,
    subcontractorTable: scAnalysis.rows,
    clientBillingSummary: clientBilling.kpis,
    clientBillingTable: clientBilling.rows,
    stockSummary: stockSummary.rows,
  };
}
