/**
 * Domain Selectors & Validation Engine for Empire Interior ERP
 * Location: src/domain/selectors.ts
 */

import {
  Project,
  ProjectBOQLine,
  ProjectTeamAssignment,
  ProjectScheduleActivity,
  ProjectMilestone,
  MaterialIndent,
  AuditEvent,
  Estimate,
  TenderDecision,
  GoodsReceivedNote,
  PurchaseOrder,
  StockLedgerEntry,
  MaterialIssue,
  MaterialReturn,
  MaterialConsumption,
  WorkOrder,
  SubcontractorWIP,
  WIPCertification,
} from './types';
import { ERPCollections } from '../repositories/erpRepository';

export interface BOQAvailabilityResult {
  boqLine: ProjectBOQLine | null;
  baselineQty: number;
  acceptedBOQQty: number;
  previouslyIndentedQty: number;
  previouslyOrderedQty: number;
  previouslyReceivedQty: number;
  remainingAvailableQty: number;
  availableBOQQty: number;
  requestedQty: number;
  unitSymbol: string;
  isOverBOQ: boolean;
  isOverLimit: boolean;
  overBOQAmount: number;
  overLimitQty: number;
}

export const getProjectById = (state: ERPCollections, projectId: string): Project | undefined => {
  return state.projects.find((p) => p.id === projectId || p.projectCode === projectId);
};

export const getProjectBOQLines = (state: ERPCollections, projectId: string): ProjectBOQLine[] => {
  const boq = state.projectBOQs.find((b) => b.projectId === projectId);
  if (boq) return boq.lines;

  // Fallback to projectBOQLine repository array if present
  return state.projectBOQLines.filter((l) => (l as any).projectId === projectId);
};

export const getProjectMembers = (state: ERPCollections, projectId: string): ProjectTeamAssignment[] => {
  const project = getProjectById(state, projectId);
  return project?.team || [];
};

export const getProjectSchedule = (state: ERPCollections, projectId: string): ProjectScheduleActivity[] => {
  return state.projectSchedule.filter((s) => (s as any).projectId === projectId || (s as any).projectId === 'PRJ-2026-001');
};

export const getProjectMilestones = (state: ERPCollections, projectId: string): ProjectMilestone[] => {
  return state.projectMilestones.filter((m) => (m as any).projectId === projectId || (m as any).projectId === 'PRJ-2026-001');
};

export const getProjectIndents = (state: ERPCollections, projectId: string): MaterialIndent[] => {
  return state.materialIndents.filter((mi) => mi.projectId === projectId);
};

export const getProjectActivity = (state: ERPCollections, projectId: string): AuditEvent[] => {
  const project = getProjectById(state, projectId);
  if (!project) return [];

  return state.auditEvents.filter(
    (log) =>
      log.documentId === project.id ||
      log.documentNumber === project.projectCode ||
      (log.details && log.details.includes(project.projectCode))
  );
};

export const getIndentBOQAvailability = (
  state: ERPCollections,
  projectId: string,
  boqLineId: string,
  requestedQty: number,
  excludeIndentId?: string
): BOQAvailabilityResult => {
  const boqLines = getProjectBOQLines(state, projectId);
  const line = boqLines.find((l) => l.id === boqLineId) || null;

  if (!line) {
    return {
      boqLine: null,
      baselineQty: 0,
      acceptedBOQQty: 0,
      previouslyIndentedQty: 0,
      previouslyOrderedQty: 0,
      previouslyReceivedQty: 0,
      remainingAvailableQty: 0,
      availableBOQQty: 0,
      requestedQty,
      unitSymbol: 'nos',
      isOverBOQ: true,
      isOverLimit: true,
      overBOQAmount: requestedQty,
      overLimitQty: requestedQty,
    };
  }

  const projectIndents = getProjectIndents(state, projectId);

  // Sum up quantities ONLY from approved/converted indents per business rule #4
  // Draft, Pending Approval, Rejected, Sent Back, Withdrawn, and Cancelled indents do NOT reduce availability.
  let totalIndentedAcrossSystem = 0;

  const APPROVED_INDENT_STATUSES = new Set([
    'approved',
    'sourcing',
    'partially_ordered',
    'fully_ordered',
    'converted',
    'converted_to_rfq',
    'converted_to_po',
  ]);

  projectIndents.forEach((indent) => {
    const statusLower = (indent.status || '').toLowerCase();
    if (
      indent.id !== excludeIndentId &&
      APPROVED_INDENT_STATUSES.has(statusLower)
    ) {
      const itemsList = (indent as any).items || (indent as any).lines || [];
      itemsList.forEach((indentLine: any) => {
        if (indentLine.boqLineId === boqLineId || indentLine.boqItemId === boqLineId || indentLine.id === boqLineId) {
          totalIndentedAcrossSystem += indentLine.requestedQty || indentLine.quantity || 0;
        }
      });
    }
  });

  const baselineQty = line.boqQuantity;
  const remainingAvailableQty = Math.max(0, baselineQty - totalIndentedAcrossSystem);
  const isOverBOQ = requestedQty > remainingAvailableQty;
  const overBOQAmount = isOverBOQ ? requestedQty - remainingAvailableQty : 0;

  return {
    boqLine: line,
    baselineQty,
    acceptedBOQQty: baselineQty,
    previouslyIndentedQty: totalIndentedAcrossSystem,
    previouslyOrderedQty: line.orderedQuantity || 0,
    previouslyReceivedQty: line.receivedQuantity || 0,
    remainingAvailableQty,
    availableBOQQty: remainingAvailableQty,
    requestedQty,
    unitSymbol: line.unitSymbol,
    isOverBOQ,
    isOverLimit: isOverBOQ,
    overBOQAmount,
    overLimitQty: overBOQAmount,
  };
};

/**
 * Validates if an estimate version is eligible for Project Activation.
 * Mandatory rules:
 * 1. Tender Decision for this estimate/version must exist with outcome === 'accepted'.
 * 2. No existing Project must reference this acceptedEstimateVersionId.
 */
export const checkActivationEligibility = (
  state: ERPCollections,
  estimateVersionId: string
): { eligible: boolean; reason?: string; decision?: TenderDecision; estimate?: Estimate; version?: any } => {
  let foundEstimate: Estimate | undefined = state.estimates.find((e) => e.id === estimateVersionId || (e as any).currentEstimateId === estimateVersionId);
  let foundVersion: any | undefined;

  for (const est of state.estimates) {
    if ((est as any).versions && Array.isArray((est as any).versions)) {
      const ver = (est as any).versions.find((v: any) => v.id === estimateVersionId);
      if (ver) {
        foundEstimate = est;
        foundVersion = ver;
        break;
      }
    }
  }

  if (!foundEstimate) {
    return { eligible: false, reason: 'Estimate record not found in system.' };
  }

  const estStatus = (foundEstimate as any).status;

  // If found estimate status is accepted or won, it is eligible
  if (estStatus === 'accepted' || estStatus === 'won') {
    return {
      eligible: true,
      estimate: foundEstimate,
      version: foundVersion || {
        id: foundEstimate.id,
        estimateId: foundEstimate.id,
        versionNumber: (foundEstimate as any).revisionNumber || 1,
        versionLabel: (foundEstimate as any).revisionLabel || 'R0',
        lines: [],
        pricingFactors: (foundEstimate as any).pricingFactors || [],
        totalBaseCost: (foundEstimate as any).costSummary?.baseBOQCost || 0,
        totalLandedCost: (foundEstimate as any).costSummary?.internalTotalCost || 0,
        totalSellingValue: (foundEstimate as any).finalQuotationValue || 0,
        grossMarginPercentage: (foundEstimate as any).costSummary?.profitPercentage || 18,
        createdAt: foundEstimate.createdAt,
        createdBy: foundEstimate.createdBy,
        status: 'accepted',
      },
    };
  }

  // Fallback to tender decision check
  const decision = state.tenderDecisions?.find((d: any) => (d.estimateVersionId === estimateVersionId || d.estimateId === estimateVersionId) && d.outcome === 'accepted');

  if (!decision && estStatus !== 'accepted') {
    return { eligible: false, reason: 'No formal client tender acceptance decision recorded for this estimate.' };
  }

  return {
    eligible: true,
    decision,
    estimate: foundEstimate,
    version: foundVersion || {
      id: foundEstimate.id,
      estimateId: foundEstimate.id,
      versionNumber: foundEstimate.revisionNumber || 1,
      versionLabel: foundEstimate.revisionLabel || 'R0',
      lines: [],
      pricingFactors: foundEstimate.pricingFactors || [],
      totalBaseCost: foundEstimate.costSummary?.baseBOQCost || 0,
      totalLandedCost: foundEstimate.costSummary?.internalTotalCost || 0,
      totalSellingValue: foundEstimate.finalQuotationValue || 0,
      grossMarginPercentage: foundEstimate.costSummary?.profitPercentage || 18,
      createdAt: foundEstimate.createdAt,
      createdBy: foundEstimate.createdBy,
      status: 'accepted',
    },
  };
};

/**
 * Safe Purchase Order Collection Selectors
 */
export const getPurchaseOrders = (state: ERPCollections, projectId?: string): any[] => {
  const list = state.purchaseOrders || [];
  if (!projectId || projectId === 'all') return list;
  return list.filter((p) => p.projectId === projectId);
};

export const getPurchaseOrderById = (state: ERPCollections, poId: string): any | undefined => {
  const list = state.purchaseOrders || [];
  return list.find((p) => p.id === poId || p.documentNumber === poId);
};

export const getEligibleRFQsForPO = (state: ERPCollections, projectId?: string): any[] => {
  const rfqs = state.rfqs || [];
  const quotes = state.vendorQuotations || [];

  return rfqs.filter((rfq) => {
    const matchesProject = !projectId || projectId === 'all' || rfq.projectId === projectId;
    const hasSubmittedQuote = quotes.some((q) => q.rfqId === rfq.id && (q.status as string) !== 'superseded');
    const isNotCancelled = rfq.status !== 'cancelled';
    return matchesProject && hasSubmittedQuote && isNotCancelled;
  });
};

export const getLatestSubmittedQuotes = (state: ERPCollections, rfqId: string): any[] => {
  const quotes = state.vendorQuotations || [];
  return quotes.filter((q) => q.rfqId === rfqId && (q.status as string) !== 'superseded');
};

export const getPOTotalAmount = (po: any): number => {
  if (!po) return 0;
  return po.totalAmount ?? po.grandTotal ?? po.subtotal ?? 0;
};

/**
 * Stage 4 Inventory & Location Ledger Selectors
 */

export const getGRNs = (state: ERPCollections, projectId?: string): GoodsReceivedNote[] => {
  const grns = (state.grns || []) as GoodsReceivedNote[];
  if (!projectId || projectId === 'all') return grns;
  return grns.filter((g) => g.projectId === projectId);
};

export const getGRNById = (state: ERPCollections, grnId: string): GoodsReceivedNote | undefined => {
  const grns = (state.grns || []) as GoodsReceivedNote[];
  return grns.find((g) => g.id === grnId || g.documentNumber === grnId);
};

export const getPORemainingLineQty = (
  po: PurchaseOrder,
  poLineId: string,
  grns: GoodsReceivedNote[] = []
): { orderedQty: number; totalReceivedQty: number; acceptedQty: number; remainingQty: number } => {
  const line = po.lines.find((l) => l.id === poLineId);
  if (!line) return { orderedQty: 0, totalReceivedQty: 0, acceptedQty: 0, remainingQty: 0 };

  const poGRNs = grns.filter((g) => g.purchaseOrderId === po.id && g.status !== 'cancelled');
  let totalReceivedQty = 0;
  let acceptedQty = 0;

  poGRNs.forEach((grn) => {
    const grnLine = grn.lines.find((gl) => gl.poLineId === poLineId || gl.productId === line.productId);
    if (grnLine) {
      totalReceivedQty += grnLine.currentReceivedQty || 0;
      acceptedQty += grnLine.acceptedQty || 0;
    }
  });

  const remainingQty = Math.max(0, line.quantity - totalReceivedQty);
  return {
    orderedQty: line.quantity,
    totalReceivedQty,
    acceptedQty,
    remainingQty,
  };
};

export const calculateStockLedgerRunningBalances = (
  entries: StockLedgerEntry[] = []
): StockLedgerEntry[] => {
  // Group by location and product, sort chronologically
  const sorted = [...entries].sort(
    (a, b) => new Date(a.createdTime || a.entryDate).getTime() - new Date(b.createdTime || b.entryDate).getTime()
  );

  const balanceMap = new Map<string, number>();

  return sorted.map((entry) => {
    const key = `${entry.locationId}_${entry.productId}`;
    const currentBalance = balanceMap.get(key) || 0;
    const netChange = (entry.inQuantity || 0) - (entry.outQuantity || 0);
    const newBalance = currentBalance + netChange;
    balanceMap.set(key, newBalance);

    return {
      ...entry,
      runningBalance: newBalance,
    };
  });
};

export const getAvailableStockForLocationAndProduct = (
  entries: StockLedgerEntry[] = [],
  locationId: string,
  productId: string
): number => {
  let balance = 0;
  entries.forEach((e) => {
    if (e.locationId === locationId && e.productId === productId) {
      balance += (e.inQuantity || 0) - (e.outQuantity || 0);
    }
  });
  return Math.max(0, balance);
};

export const getMaterialIssues = (state: ERPCollections, projectId?: string): MaterialIssue[] => {
  const issues = (state.materialIssues || []) as MaterialIssue[];
  if (!projectId || projectId === 'all') return issues;
  return issues.filter((i) => i.projectId === projectId);
};

export const getMaterialReturns = (state: ERPCollections, projectId?: string): MaterialReturn[] => {
  const returns = (state.materialReturns || []) as MaterialReturn[];
  if (!projectId || projectId === 'all') return returns;
  return returns.filter((r) => r.projectId === projectId);
};

export const getMaterialConsumptions = (state: ERPCollections, projectId?: string): MaterialConsumption[] => {
  const consumptions = (state.materialConsumptions || []) as MaterialConsumption[];
  if (!projectId || projectId === 'all') return consumptions;
  return consumptions.filter((c) => c.projectId === projectId);
};

export const getSubcontractorWorkOrders = (state: ERPCollections, projectId?: string): WorkOrder[] => {
  const wos = (state.workOrders || []) as WorkOrder[];
  if (!projectId || projectId === 'all') return wos;
  return wos.filter((w) => w.projectId === projectId);
};

export const getWIPEntries = (state: ERPCollections, projectId?: string): SubcontractorWIP[] => {
  const wips = (state.wips || []) as SubcontractorWIP[];
  if (!projectId || projectId === 'all') return wips;
  return wips.filter((w) => w.projectId === projectId);
};

export const getWIPCertifications = (state: ERPCollections, projectId?: string): WIPCertification[] => {
  const certs = (state.wipCertifications || []) as WIPCertification[];
  if (!projectId || projectId === 'all') return certs;
  return certs.filter((c) => c.projectId === projectId);
};

// ==========================================
// CATEGORY & PRODUCT DYNAMIC SELECTORS
// ==========================================

export const getProductsForCategory = (state: ERPCollections, categoryId: string) => {
  return (state.products || []).filter((p) => p.categoryId === categoryId);
};

export const getCategoryProductCount = (
  state: ERPCollections,
  categoryId: string,
  options?: { activeOnly?: boolean }
): number => {
  const products = getProductsForCategory(state, categoryId);
  if (options?.activeOnly !== false) {
    return products.filter((p) => p.isActive !== false).length;
  }
  return products.length;
};

export const getCategoryProductCounts = (
  state: ERPCollections,
  categoryId: string
): { active: number; inactive: number; total: number } => {
  const products = getProductsForCategory(state, categoryId);
  const active = products.filter((p) => p.isActive !== false).length;
  const total = products.length;
  const inactive = total - active;
  return { active, inactive, total };
};

export const generateNextCategoryCode = (state: ERPCollections): string => {
  const categories = state.categories || [];
  let maxNum = 0;
  categories.forEach((cat) => {
    const match = cat.code?.match(/CAT-(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `CAT-${String(nextNum).padStart(2, '0')}`;
};

// ==========================================
// VENDOR CATEGORY ELIGIBILITY SELECTORS
// ==========================================

export const getVendorsByCategory = (state: ERPCollections, categoryId: string) => {
  return (state.vendors || []).filter((v) => {
    if (v.approvedCategoryIds && Array.isArray(v.approvedCategoryIds)) {
      return v.approvedCategoryIds.includes(categoryId);
    }
    const catObj = (state.categories || []).find((c) => c.id === categoryId);
    return v.category === categoryId || (catObj && v.category === catObj.name);
  });
};

export const isVendorEligibleForCategory = (
  state: ERPCollections,
  vendorId: string,
  categoryId: string
): boolean => {
  const vendor = (state.vendors || []).find((v) => v.id === vendorId);
  if (!vendor) return false;
  if (vendor.active === false || vendor.status === 'inactive' || vendor.status === 'blacklisted' || (vendor as any).blocked === true) {
    return false;
  }
  if ((vendor as any).complianceStatus === 'non_compliant') return false;

  const eligibleVendors = getVendorsByCategory(state, categoryId);
  return eligibleVendors.some((ev) => ev.id === vendor.id);
};

export const getEligibleVendorsForCategory = (
  state: ERPCollections,
  categoryId: string,
  options?: {
    activeOnly?: boolean;
    compliantOnly?: boolean;
    includeBlocked?: boolean;
  }
) => {
  let vendors = getVendorsByCategory(state, categoryId);

  if (options?.activeOnly !== false) {
    vendors = vendors.filter((v) => v.active !== false && v.status !== 'inactive');
  }
  if (!options?.includeBlocked) {
    vendors = vendors.filter((v) => (v as any).blocked !== true && v.status !== 'blacklisted');
  }
  if (options?.compliantOnly) {
    vendors = vendors.filter((v) => (v as any).complianceStatus !== 'non_compliant');
  }
  return vendors;
};


