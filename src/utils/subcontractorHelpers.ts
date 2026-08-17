/**
 * Helper utilities for Subcontractor Work Orders & WIP Register
 * Location: src/utils/subcontractorHelpers.ts
 */

import { SubcontractWorkOrder, SubcontractorWIP, SubcontractWOItem } from '../domain/types';

export interface NormalizedSubcontractWorkOrder extends SubcontractWorkOrder {
  documentNumber: string;
  items: SubcontractWOItem[];
  grandTotal: number;
}

export interface WOScopeSummary {
  title: string;
  subtitle: string;
  itemCount: number;
}

export interface WOProgressMetrics {
  totalWOQty: number;
  cumulativeApprovedQty: number;
  remainingWOQty: number;
  totalWOValue: number;
  cumulativeApprovedValue: number;
  progressPercent: number;
  primaryUnit: string;
  isMultiUOM: boolean;
  linkedWips: SubcontractorWIP[];
  latestWIP: SubcontractorWIP | null;
  hasPendingWIP: boolean;
  itemCalculations: Array<{
    itemId: string;
    scopeDescription: string;
    woQty: number;
    unitSymbol: string;
    rate: number;
    lineTotal: number;
    cumulativeApprovedQty: number;
    remainingQty: number;
    cumulativeApprovedValue: number;
  }>;
}

export interface SubcontractorKPIMetrics {
  totalWorkOrders: number;
  approvalPending: number;
  activeWork: number;
  wipPendingApproval: number;
  completed: number;
  totalWOValue: number;
}

/**
 * Normalizes a Subcontract Work Order object ensuring required fields exist
 */
export function normalizeSubcontractWorkOrder(raw: any): NormalizedSubcontractWorkOrder {
  if (!raw) {
    return {
      id: `swo-${Date.now()}`,
      documentNumber: 'SWO-2026-000',
      projectId: '',
      projectName: 'Unspecified Project',
      subcontractorId: '',
      subcontractorName: 'Unspecified Subcontractor',
      startDate: new Date().toISOString().split('T')[0],
      completionDate: new Date().toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      status: 'draft',
      createdBy: 'System',
      createdAt: new Date().toISOString(),
    };
  }

  const docNum = raw.documentNumber || raw.woNumber || raw.id || 'SWO-2026-000';
  const items: SubcontractWOItem[] = Array.isArray(raw.items) ? raw.items : Array.isArray(raw.lines) ? raw.lines : [];

  let subtotal = Number(raw.subtotal || 0);
  let grandTotal = Number(raw.grandTotal || raw.totalAmount || raw.finalContractValue || 0);

  if (items.length > 0 && grandTotal === 0) {
    subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || Number(item.quantity) * Number(item.rate) || 0), 0);
    const tax = Number(raw.taxTotal || 0);
    grandTotal = subtotal + tax;
  }

  return {
    ...raw,
    id: raw.id || docNum,
    documentNumber: docNum,
    projectName: raw.projectName || 'Unspecified Project',
    subcontractorName: raw.subcontractorName || raw.vendorName || 'Unspecified Subcontractor',
    workCategory: raw.workCategory || (items.length > 0 ? items[0].categoryName : 'Subcontract Work'),
    items,
    subtotal,
    taxTotal: Number(raw.taxTotal || 0),
    grandTotal,
    status: raw.status || 'draft',
  };
}

/**
 * Calculates high-density scope text for Work Order table display
 */
export function getWorkOrderScopeSummary(wo: SubcontractWorkOrder): WOScopeSummary {
  const norm = normalizeSubcontractWorkOrder(wo);
  const items = norm.items || [];

  if (items.length === 0) {
    return {
      title: norm.workCategory || 'Subcontract Work',
      subtitle: '0 items',
      itemCount: 0,
    };
  }

  const firstItem = items[0];
  const firstTitle = firstItem.scopeDescription || firstItem.categoryName || 'Subcontract Line';
  const firstQty = Number(firstItem.quantity || 0);
  const firstUnit = firstItem.unitSymbol || firstItem.unit || 'units';

  if (items.length === 1) {
    return {
      title: firstTitle,
      subtitle: `${firstQty.toLocaleString('en-IN')} ${firstUnit}`,
      itemCount: 1,
    };
  }

  return {
    title: firstTitle,
    subtitle: `+ ${items.length - 1} more work items`,
    itemCount: items.length,
  };
}

/**
 * Calculates cumulative approved WIP, remaining quantities, latest WIP record, and progress %
 */
export function calculateWIPTotalsForWO(
  wo: SubcontractWorkOrder,
  allWips: SubcontractorWIP[] = []
): WOProgressMetrics {
  const norm = normalizeSubcontractWorkOrder(wo);
  const docNum = norm.documentNumber;

  // Filter linked WIP records for this Work Order
  const linkedWips = (allWips || []).filter(
    (w) => w && (w.workOrderId === norm.id || w.woNumber === docNum || (w as any).workOrderNumber === docNum)
  );

  // Sort WIPs by date descending
  linkedWips.sort((a, b) => new Date(b.wipDate || b.createdAt || 0).getTime() - new Date(a.wipDate || a.createdAt || 0).getTime());

  const latestWIP = linkedWips.length > 0 ? linkedWips[0] : null;

  const hasPendingWIP = linkedWips.some((w) => {
    const st = (w.status || '').toLowerCase();
    return st === 'draft' || st === 'submitted' || st === 'site_verification' || st === 'pending_approval';
  });

  // Approved WIPs only affect progress %
  const approvedWips = linkedWips.filter((w) => (w.status || '').toLowerCase() === 'approved');

  // Map WO items to track line-level cumulative approved quantities
  const itemCalculations = (norm.items || []).map((item) => {
    const itemId = item.id;
    const itemCode = item.itemCode;
    const scopeDesc = (item.scopeDescription || '').toLowerCase();
    const woQty = Number(item.quantity || 0);
    const rate = Number(item.rate || 0);
    const lineTotal = Number(item.amount || woQty * rate);
    const unitSymbol = item.unitSymbol || item.unit || 'units';

    let cumulativeApprovedQty = 0;

    // Aggregate approved qty from approved WIP items matching this WO item
    approvedWips.forEach((wip) => {
      (wip.items || []).forEach((wLine: any) => {
        const lineMatch =
          wLine.woItemId === itemId ||
          wLine.woLineId === itemId ||
          (itemCode && wLine.itemCode === itemCode) ||
          (wLine.scopeDescription || '').toLowerCase() === scopeDesc;

        if (lineMatch) {
          const appQty = Number(wLine.approvedQty ?? wLine.measuredQty ?? wLine.claimedQty ?? 0);
          cumulativeApprovedQty += appQty;
        }
      });
    });

    const remainingQty = Math.max(0, woQty - cumulativeApprovedQty);
    const cumulativeApprovedValue = cumulativeApprovedQty * rate;

    return {
      itemId,
      scopeDescription: item.scopeDescription || 'Work Item',
      woQty,
      unitSymbol,
      rate,
      lineTotal,
      cumulativeApprovedQty,
      remainingQty,
      cumulativeApprovedValue,
    };
  });

  const totalWOQty = itemCalculations.reduce((sum, i) => sum + i.woQty, 0);
  const cumulativeApprovedQty = itemCalculations.reduce((sum, i) => sum + i.cumulativeApprovedQty, 0);
  const remainingWOQty = Math.max(0, totalWOQty - cumulativeApprovedQty);
  const totalWOValue = norm.grandTotal || itemCalculations.reduce((sum, i) => sum + i.lineTotal, 0);
  const cumulativeApprovedValue = itemCalculations.reduce((sum, i) => sum + i.cumulativeApprovedValue, 0);

  const units = new Set(itemCalculations.map((i) => i.unitSymbol.toLowerCase()));
  const isMultiUOM = units.size > 1;
  const primaryUnit = itemCalculations.length > 0 ? itemCalculations[0].unitSymbol : 'units';

  let progressPercent = 0;
  if (!isMultiUOM && totalWOQty > 0) {
    progressPercent = Math.min(100, Math.round((cumulativeApprovedQty / totalWOQty) * 100));
  } else if (totalWOValue > 0) {
    progressPercent = Math.min(100, Math.round((cumulativeApprovedValue / totalWOValue) * 100));
  }

  return {
    totalWOQty,
    cumulativeApprovedQty,
    remainingWOQty,
    totalWOValue,
    cumulativeApprovedValue,
    progressPercent,
    primaryUnit,
    isMultiUOM,
    linkedWips,
    latestWIP,
    hasPendingWIP,
    itemCalculations,
  };
}

/**
 * Calculates global real-data KPI metrics for Subcontractor Work Orders
 */
export function calculateSubcontractorKPIs(
  workOrders: SubcontractWorkOrder[] = [],
  allWips: SubcontractorWIP[] = []
): SubcontractorKPIMetrics {
  let totalWorkOrders = 0;
  let approvalPending = 0;
  let activeWork = 0;
  let wipPendingApproval = 0;
  let completed = 0;
  let totalWOValue = 0;

  (workOrders || []).forEach((wo) => {
    if (!wo || typeof wo !== 'object') return;
    const norm = normalizeSubcontractWorkOrder(wo);
    const sLower = (norm.status || '').toLowerCase();

    if (sLower === 'cancelled') return;

    totalWorkOrders += 1;
    totalWOValue += norm.grandTotal;

    const metrics = calculateWIPTotalsForWO(norm, allWips);

    if (metrics.hasPendingWIP) {
      wipPendingApproval += 1;
    }

    if (sLower === 'pending_approval' || sLower === 'submitted' || sLower === 'draft') {
      approvalPending += 1;
    } else if (sLower === 'completed' || sLower === 'closed' || metrics.progressPercent >= 100) {
      completed += 1;
    } else if (sLower === 'approved' || sLower === 'issued' || sLower === 'work_started' || sLower === 'in_progress' || sLower === 'partially_completed') {
      activeWork += 1;
    }
  });

  return {
    totalWorkOrders,
    approvalPending,
    activeWork,
    wipPendingApproval,
    completed,
    totalWOValue,
  };
}
