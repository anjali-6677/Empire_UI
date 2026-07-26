import { safeFormatCurrency } from './formatStatus';

export type UnitType = 'currency' | 'number' | 'percentage' | 'quantity';

export interface ReportChartDatum {
  label: string;
  [metricKey: string]: string | number;
}

export interface ReportChartSeries {
  key: string;
  label: string;
  color: string;
  unit: UnitType;
}

export interface ReportChartConfig {
  title: string;
  type: 'bar' | 'grouped_bar' | 'stacked_bar' | 'horizontal_bar' | 'line';
  xAxisKey: string;
  yAxisUnit?: UnitType;
  series: ReportChartSeries[];
  data: ReportChartDatum[];
}

/**
 * Safely parses any value (numbers, strings with Rupee symbols, commas, %, Lakhs/Crores, null, undefined)
 * into a finite JavaScript number.
 */
export function toFiniteNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : 0;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return 0;

    const isCrore = /\bcr\b/i.test(trimmed);
    const isLakh = /\bl\b/i.test(trimmed);

    // Extract raw numeric characters and optional decimal/negative signs
    const cleaned = trimmed
      .replace(/₹/g, '')
      .replace(/,/g, '')
      .replace(/%/g, '')
      .replace(/\bcr\b/gi, '')
      .replace(/\bl\b/gi, '')
      .replace(/[^\d.-]/g, '')
      .trim();

    const parsed = Number.parseFloat(cleaned);
    if (!Number.isFinite(parsed)) return 0;

    if (isCrore) return parsed * 10_000_000;
    if (isLakh) return parsed * 100_000;
    return parsed;
  }
  return 0;
}

/**
 * Formats values for Tooltips based on UnitType
 */
export function formatTooltipValue(val: unknown, unit: UnitType = 'number'): string {
  const num = toFiniteNumber(val);
  if (unit === 'currency') {
    return safeFormatCurrency(num);
  }
  if (unit === 'percentage') {
    return `${num.toFixed(1)}%`;
  }
  if (unit === 'quantity') {
    return `${num.toLocaleString('en-IN')} units`;
  }
  return num.toLocaleString('en-IN');
}

/**
 * Formats Y-axis tick values neatly
 */
export function formatYAxisTick(val: unknown, unit: UnitType = 'number'): string {
  const num = toFiniteNumber(val);
  if (unit === 'currency') {
    if (Math.abs(num) >= 10_000_000) {
      return `₹${(num / 10_000_000).toFixed(1)}Cr`;
    }
    if (Math.abs(num) >= 100_000) {
      return `₹${(num / 100_000).toFixed(0)}L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(0)}k`;
    }
    return `₹${num}`;
  }
  if (unit === 'percentage') {
    return `${num}%`;
  }
  if (Math.abs(num) >= 1000) {
    return `${(num / 1000).toFixed(0)}k`;
  }
  return String(num);
}

/**
 * Factory that returns explicit, report-specific chart configs for any tab
 */
export function getReportChartConfig(tabId: string, schemaId: string, filteredRows: any[]): ReportChartConfig {
  // Return empty config if no rows available
  if (!filteredRows || filteredRows.length === 0) {
    return {
      title: 'Report Analytics',
      type: 'grouped_bar',
      xAxisKey: 'label',
      series: [],
      data: []
    };
  }

  // Pre-process rows to normalize numbers and labels
  const processedData: ReportChartDatum[] = filteredRows.map((r, idx) => {
    const rawLabel =
      r.site ||
      r.siteName ||
      r.vendor ||
      r.vendorName ||
      r.item ||
      r.itemName ||
      r.category ||
      r.itemCategory ||
      r.userName ||
      r.user ||
      r.month ||
      r.transferRef ||
      r.consumptionRef ||
      r.poNumber ||
      r.invoiceNo ||
      r.paymentRef ||
      `Record ${idx + 1}`;

    // Truncate long labels for chart axis readability
    const label = String(rawLabel).length > 25 ? `${String(rawLabel).substring(0, 22)}...` : String(rawLabel);

    return {
      ...r,
      label,
      // Common numeric conversions
      orderedValueNum: toFiniteNumber(r.orderedValue),
      receivedValueNum: toFiniteNumber(r.receivedValue),
      pendingValueNum: toFiniteNumber(r.pendingValue),
      purchaseValueNum: toFiniteNumber(r.purchaseValue),
      consumedQtyNum: toFiniteNumber(r.consumedQty),
      openingQtyNum: toFiniteNumber(r.openingQty),
      closingQtyNum: toFiniteNumber(r.closingQty),
      quantityNum: toFiniteNumber(r.quantity),
      basicRateNum: toFiniteNumber(r.basicRate),
      finalAmountNum: toFiniteNumber(r.finalAmount),
      appBudgetNum: toFiniteNumber(r.appBudget),
      committedNum: toFiniteNumber(r.committed),
      actualSpendNum: toFiniteNumber(r.actualSpend),
      availableNum: toFiniteNumber(r.available),
      appAllocationNum: toFiniteNumber(r.appAllocation),
      paidAmountNum: toFiniteNumber(r.paidAmount),
      remainingAllocNum: toFiniteNumber(r.remainingAlloc),
      appAmountNum: toFiniteNumber(r.appAmount),
      materialBudgetNum: toFiniteNumber(r.materialBudget),
      labourBudgetNum: toFiniteNumber(r.labourBudget),
      utilityBudgetNum: toFiniteNumber(r.utilityBudget),
      salaryBudgetNum: toFiniteNumber(r.salaryBudget),
      overheadBudgetNum: toFiniteNumber(r.overheadBudget),
      estimatedAmtNum: toFiniteNumber(r.estimatedAmt),
      savingAmountNum: toFiniteNumber(r.savingAmount),
      totalBilledNum: toFiniteNumber(r.totalBilled),
      totalCertifiedNum: toFiniteNumber(r.totalCertified),
      totalPaidNum: toFiniteNumber(r.totalPaid),
      outstandingNum: toFiniteNumber(r.outstanding || r.outstandingAmount),
      clientReceiptsNum: toFiniteNumber(r.clientReceipts),
      vendorPaymentsNum: toFiniteNumber(r.vendorPayments),
      netPositionNum: toFiniteNumber(r.netPosition),
      grossAmountNum: toFiniteNumber(r.grossAmount),
      certifiedAmountNum: toFiniteNumber(r.certifiedAmount || r.certified),
      approvedAmountNum: toFiniteNumber(r.approvedAmount),
      closingBalanceNum: toFiniteNumber(r.closingBalance),
      retentionHeldNum: toFiniteNumber(r.retentionHeld),
      contractValueNum: toFiniteNumber(r.contractValue),
      finalBalanceNum: toFiniteNumber(r.finalBalance),
      debitNum: toFiniteNumber(r.debit),
      creditNum: toFiniteNumber(r.credit),
      runningBalanceNum: toFiniteNumber(r.runningBalance),
      sessionDurationMinutesNum: toFiniteNumber(r.sessionDurationMinutes || (r.duration ? parseFloat(r.duration) * 60 : 0)),
      physicalProgressNum: toFiniteNumber(r.physicalProgress),
      billingProgressNum: toFiniteNumber(r.billingProgress),
      paymentProgressNum: toFiniteNumber(r.paymentProgress),
      timeProgressNum: toFiniteNumber(r.timeProgress),
      grossMarginNum: toFiniteNumber(r.grossMargin),
      vendorOutlayNum: toFiniteNumber(r.vendorOutlay)
    };
  });

  // ==========================================
  // 1. PURCHASE REPORTS
  // ==========================================
  if (tabId === 'purchase-analysis' || schemaId === 'reports-purchase-analysis') {
    return {
      title: 'Purchase Orders & Outlay by Site',
      type: 'grouped_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'orderedValueNum', label: 'Ordered Value', color: '#c5a572', unit: 'currency' },
        { key: 'receivedValueNum', label: 'Received Outlay', color: '#10b981', unit: 'currency' },
        { key: 'pendingValueNum', label: 'Pending Delivery', color: '#ef4444', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'item-analysis') {
    return {
      title: 'Material Item Purchase Value & Consumption',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'purchaseValueNum', label: 'Purchase Value', color: '#c5a572', unit: 'currency' },
        { key: 'consumedQtyNum', label: 'Consumed Qty', color: '#10b981', unit: 'quantity' }
      ],
      data: processedData
    };
  }

  if (tabId === 'vendor-vs-item') {
    return {
      title: 'Vendor Material Sourcing Amounts',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'finalAmountNum', label: 'Final Amount', color: '#c5a572', unit: 'currency' },
        { key: 'basicRateNum', label: 'Basic Unit Rate', color: '#64748b', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'transfer-log') {
    return {
      title: 'Inter-Site Material Transfer Quantities',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'quantity',
      series: [
        { key: 'quantityNum', label: 'Transferred Quantity', color: '#3b82f6', unit: 'quantity' }
      ],
      data: processedData
    };
  }

  if (tabId === 'consumption-log') {
    return {
      title: 'Site Stock Movement (Opening vs Consumed vs Closing)',
      type: 'grouped_bar',
      xAxisKey: 'label',
      yAxisUnit: 'quantity',
      series: [
        { key: 'openingQtyNum', label: 'Opening Stock', color: '#64748b', unit: 'quantity' },
        { key: 'consumedQtyNum', label: 'Consumed Qty', color: '#ef4444', unit: 'quantity' },
        { key: 'closingQtyNum', label: 'Closing Stock', color: '#10b981', unit: 'quantity' }
      ],
      data: processedData
    };
  }

  // ==========================================
  // 2. BUDGET REPORTS
  // ==========================================
  if (tabId === 'all-project' || schemaId === 'reports-budget-all') {
    return {
      title: 'All Project Budget Portfolio (Approved vs Committed vs Outlay)',
      type: 'grouped_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'appBudgetNum', label: 'Approved Budget', color: '#c5a572', unit: 'currency' },
        { key: 'committedNum', label: 'Committed Contract', color: '#3b82f6', unit: 'currency' },
        { key: 'actualSpendNum', label: 'Actual Outlay', color: '#1e293b', unit: 'currency' },
        { key: 'availableNum', label: 'Available Balance', color: '#10b981', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'vendor-budget') {
    return {
      title: 'Vendor Allocation & Disbursement Caps',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'appAllocationNum', label: 'Approved Allocation', color: '#c5a572', unit: 'currency' },
        { key: 'paidAmountNum', label: 'Disbursed Amount', color: '#10b981', unit: 'currency' },
        { key: 'remainingAllocNum', label: 'Remaining Cap', color: '#3b82f6', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'project-budget') {
    return {
      title: 'Category Budget Outlays & Available Balance',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'appAmountNum', label: 'Approved Amount', color: '#c5a572', unit: 'currency' },
        { key: 'actualSpendNum', label: 'Actual Outlay', color: '#1e293b', unit: 'currency' },
        { key: 'availableNum', label: 'Available Balance', color: '#10b981', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'budget-summary') {
    return {
      title: 'Site Expenditure Breakdown by Category',
      type: 'stacked_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'materialBudgetNum', label: 'Material Budget', color: '#c5a572', unit: 'currency' },
        { key: 'labourBudgetNum', label: 'Labour Budget', color: '#3b82f6', unit: 'currency' },
        { key: 'utilityBudgetNum', label: 'Utility Budget', color: '#f59e0b', unit: 'currency' },
        { key: 'salaryBudgetNum', label: 'Salary Budget', color: '#10b981', unit: 'currency' },
        { key: 'overheadBudgetNum', label: 'Overhead Budget', color: '#64748b', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'savings-analysis') {
    return {
      title: 'Procurement Cost Savings Achieved',
      type: 'grouped_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'estimatedAmtNum', label: 'Estimated Target', color: '#64748b', unit: 'currency' },
        { key: 'actualPurchaseNum', label: 'Actual Purchase', color: '#c5a572', unit: 'currency' },
        { key: 'savingAmountNum', label: 'Savings Achieved', color: '#10b981', unit: 'currency' }
      ],
      data: processedData
    };
  }

  // ==========================================
  // 3. FINANCE REPORTS
  // ==========================================
  if (tabId === 'bill-payment') {
    return {
      title: 'Bill Payment Summary & Disbursement Ledger',
      type: 'grouped_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'totalCertifiedNum', label: 'Certified Bills', color: '#c5a572', unit: 'currency' },
        { key: 'totalPaidNum', label: 'Settled Disbursals', color: '#10b981', unit: 'currency' },
        { key: 'outstandingNum', label: 'Outstanding Balance', color: '#ef4444', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'net-amount') {
    return {
      title: 'Site Cashflow & Net Liquidity Position',
      type: 'grouped_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'clientReceiptsNum', label: 'Client Inflows', color: '#10b981', unit: 'currency' },
        { key: 'vendorPaymentsNum', label: 'Vendor Outflows', color: '#ef4444', unit: 'currency' },
        { key: 'netPositionNum', label: 'Net Liquidity Position', color: '#c5a572', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'invoice-analysis') {
    return {
      title: 'Vendor Invoice Certification & Outstandings',
      type: 'grouped_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'grossAmountNum', label: 'Gross Bill Amount', color: '#c5a572', unit: 'currency' },
        { key: 'certifiedAmountNum', label: 'Certified Amount', color: '#10b981', unit: 'currency' },
        { key: 'outstandingNum', label: 'Outstanding Balance', color: '#ef4444', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'payment-analysis') {
    return {
      title: 'Disbursal Payment Banking Analysis',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'approvedAmountNum', label: 'Approved Disbursal', color: '#c5a572', unit: 'currency' },
        { key: 'paidAmountNum', label: 'Settled Disbursal', color: '#10b981', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'fund-flow') {
    return {
      title: 'Monthly Corporate Fund Flow Statement',
      type: 'line',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'clientReceiptsNum', label: 'Client Inflows', color: '#10b981', unit: 'currency' },
        { key: 'vendorPaymentsNum', label: 'Vendor Outflows', color: '#ef4444', unit: 'currency' },
        { key: 'closingBalanceNum', label: 'Closing Treasury Reserve', color: '#c5a572', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'vendor-liab') {
    return {
      title: 'Vendor Creditor Liability Exposure Ledger',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'certifiedAmountNum', label: 'Certified Billing', color: '#c5a572', unit: 'currency' },
        { key: 'paidAmountNum', label: 'Total Disbursed', color: '#10b981', unit: 'currency' },
        { key: 'retentionHeldNum', label: 'Retention Held (5%)', color: '#f59e0b', unit: 'currency' },
        { key: 'outstandingNum', label: 'Net Outstanding', color: '#ef4444', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'account-close') {
    return {
      title: 'Vendor Account Closure Contract Settlement',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'contractValueNum', label: 'Total PO Value', color: '#c5a572', unit: 'currency' },
        { key: 'totalBilledNum', label: 'Final Billing', color: '#10b981', unit: 'currency' },
        { key: 'finalBalanceNum', label: 'Final Settlement', color: '#3b82f6', unit: 'currency' }
      ],
      data: processedData
    };
  }

  if (tabId === 'vendor-ledger') {
    return {
      title: 'Vendor General Ledger T-Account Movement',
      type: 'line',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'debitNum', label: 'Debit (Paid)', color: '#10b981', unit: 'currency' },
        { key: 'creditNum', label: 'Credit (Billed)', color: '#ef4444', unit: 'currency' },
        { key: 'runningBalanceNum', label: 'Running Balance', color: '#c5a572', unit: 'currency' }
      ],
      data: processedData
    };
  }

  // ==========================================
  // 4. ADMINISTRATION REPORTS
  // ==========================================
  if (tabId === 'login-time') {
    return {
      title: 'User Active Session Duration (Hours & Minutes)',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'number',
      series: [
        { key: 'sessionDurationMinutesNum', label: 'Session Duration (Mins)', color: '#10b981', unit: 'number' }
      ],
      data: processedData
    };
  }

  if (tabId === 'activity-history') {
    // Generate counts per module
    const countsMap: Record<string, number> = {};
    filteredRows.forEach((r) => {
      const mod = r.module || 'Other';
      countsMap[mod] = (countsMap[mod] || 0) + 1;
    });
    const activityData = Object.entries(countsMap).map(([mod, count]) => ({
      label: mod,
      activityCount: count
    }));
    return {
      title: 'System Mutation Audit Trail by Module',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'number',
      series: [
        { key: 'activityCount', label: 'Activity Logs', color: '#c5a572', unit: 'number' }
      ],
      data: activityData
    };
  }

  if (tabId === 'contacts-diary') {
    const siteCountMap: Record<string, number> = {};
    filteredRows.forEach((r) => {
      const s = r.relatedSite || 'Corporate Office';
      siteCountMap[s] = (siteCountMap[s] || 0) + 1;
    });
    const contactData = Object.entries(siteCountMap).map(([s, count]) => ({
      label: s,
      contactCount: count
    }));
    return {
      title: 'Stakeholder Directory Contacts by Project Site',
      type: 'horizontal_bar',
      xAxisKey: 'label',
      yAxisUnit: 'number',
      series: [
        { key: 'contactCount', label: 'Registered Contacts', color: '#3b82f6', unit: 'number' }
      ],
      data: contactData
    };
  }

  if (tabId === 'project-progress') {
    return {
      title: 'Site Physical Execution vs Billing & Payment Progress (%)',
      type: 'grouped_bar',
      xAxisKey: 'label',
      yAxisUnit: 'percentage',
      series: [
        { key: 'physicalProgressNum', label: 'Physical Progress (%)', color: '#10b981', unit: 'percentage' },
        { key: 'billingProgressNum', label: 'Billing Progress (%)', color: '#c5a572', unit: 'percentage' },
        { key: 'paymentProgressNum', label: 'Payment Recd (%)', color: '#3b82f6', unit: 'percentage' },
        { key: 'timeProgressNum', label: 'Time Elapsed (%)', color: '#64748b', unit: 'percentage' }
      ],
      data: processedData
    };
  }

  if (tabId === 'site-analysis') {
    return {
      title: 'Site Profitability & Gross Margin Yield',
      type: 'grouped_bar',
      xAxisKey: 'label',
      yAxisUnit: 'currency',
      series: [
        { key: 'contractValueNum', label: 'Contract Value', color: '#c5a572', unit: 'currency' },
        { key: 'grossMarginNum', label: 'Gross Margin', color: '#10b981', unit: 'currency' },
        { key: 'vendorOutlayNum', label: 'Vendor Outlay', color: '#ef4444', unit: 'currency' }
      ],
      data: processedData
    };
  }

  // General Fallback Adapter
  const sample = processedData[0] || {};
  const sampleNumKey =
    sample.orderedValueNum !== undefined ? 'orderedValueNum' :
    sample.appBudgetNum !== undefined ? 'appBudgetNum' :
    sample.totalCertifiedNum !== undefined ? 'totalCertifiedNum' :
    sample.purchaseValueNum !== undefined ? 'purchaseValueNum' :
    sample.finalAmountNum !== undefined ? 'finalAmountNum' :
    sample.grossAmountNum !== undefined ? 'grossAmountNum' : 'contractValueNum';

  return {
    title: 'Report Data Overview',
    type: 'grouped_bar',
    xAxisKey: 'label',
    yAxisUnit: 'currency',
    series: [{ key: sampleNumKey, label: 'Report Value', color: '#c5a572', unit: 'currency' }],
    data: processedData
  };
}
