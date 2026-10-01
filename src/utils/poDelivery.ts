/**
 * Single source of truth helper functions for Purchase Order delivery tracking & calculation.
 * Location: src/utils/poDelivery.ts
 */

import { PurchaseOrder, PurchaseOrderLine } from '../domain/types';
import { getPOItemDisplayName } from './poHelpers';

export interface PODeliveryLineSummary {
  lineKey: string;
  poItemId: string;
  boqLineId?: string;
  description: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  remainingQty: number;
}

export interface PODeliverySummaryResult {
  linesSummary: PODeliveryLineSummary[];
  orderedQtyByLine: Record<string, number>;
  receivedQtyByLine: Record<string, number>;
  remainingQtyByLine: Record<string, number>;
  totalOrdered: number;
  totalReceived: number;
  totalRemaining: number;
  deliveryStatus: 'not_received' | 'partial' | 'received';
  deliveryCount: number;
  deliveries: any[];
}

/**
 * Calculates aggregated received (accepted) quantity for a specific PO line item from connected GRNs.
 * Ignores QC rejected quantities.
 */
export function getReceivedQtyForPOItemFromGRNs(
  line: PurchaseOrderLine | any,
  po: PurchaseOrder,
  grns: any[] = []
): number {
  if (!grns || grns.length === 0) return 0;

  const poId = po.id;
  const poDocNo = (po.documentNumber || po.poNumber || '').toLowerCase();

  const matchingGRNs = grns.filter((g) => {
    if (g.status === 'cancelled' || g.status === 'Cancelled') return false;
    const gPoId = g.poId || g.purchaseOrderId;
    const gPoNum = (g.poNumber || '').toLowerCase();
    return gPoId === poId || (poDocNo && gPoNum === poDocNo);
  });

  if (matchingGRNs.length === 0) return 0;

  const lineId = line.id || line.poLineId;
  const boqId = line.boqLineId;
  const prodId = line.productId;
  const lineDesc = (line.productName || line.description || '').toLowerCase().trim();

  let totalAccepted = 0;

  matchingGRNs.forEach((grn) => {
    const items = grn.items || grn.lines || [];
    items.forEach((item: any) => {
      const matchPoLine = (item.poLineId && lineId && item.poLineId === lineId) || (item.poLineId && boqId && item.poLineId === boqId);
      const matchProd = prodId && item.productId && item.productId === prodId;
      const itemDesc = (item.description || item.productDescription || item.productName || '').toLowerCase().trim();
      const matchDesc = lineDesc && itemDesc && (lineDesc.includes(itemDesc) || itemDesc.includes(lineDesc));

      if (matchPoLine || matchProd || matchDesc) {
        totalAccepted += Number(item.qcApprovedQty ?? item.acceptedQty ?? item.qtyReceived ?? 0);
      }
    });
  });

  return totalAccepted;
}

/**
 * Legacy/Fallback helper to calculate aggregated received quantity for a specific PO line item from manual delivery records.
 */
export function getReceivedQtyForPOItem(
  line: PurchaseOrderLine,
  deliveries: any[]
): number {
  if (!deliveries || deliveries.length === 0) return 0;
  
  const lineKey = line.id || line.poLineId || line.boqLineId;
  const boqId = line.boqLineId;
  const prodId = line.productId;

  let totalReceived = 0;

  deliveries.forEach((del) => {
    (del.items || []).forEach((item: any) => {
      const matchKey = item.poLineId || item.poItemId || item.id;
      if (
        (matchKey && lineKey && matchKey === lineKey) ||
        (boqId && item.boqLineId && item.boqLineId === boqId) ||
        (prodId && item.productId && item.productId === prodId)
      ) {
        totalReceived += Number(item.qcApprovedQty ?? item.acceptedQty ?? item.qtyReceived ?? item.receivedNowQty ?? item.quantity ?? 0);
      }
    });
  });

  return totalReceived;
}

/**
 * Canonical calculation of PO delivery status and quantities across line items.
 * Accepts connected GRNs (or custom delivery records) as input.
 */
export function getCanonicalPODeliverySummary(
  po: PurchaseOrder,
  records: any[] = []
): PODeliverySummaryResult {
  const lines = po?.lines || (po as any)?.items || [];

  // Check if records array contains GRNs or legacy delivery objects
  const isGRNList = records.some((r) => r.grnNumber || r.qcInspectionId || r.receivingCheckId || r.acceptedQty !== undefined);

  const orderedQtyByLine: Record<string, number> = {};
  const receivedQtyByLine: Record<string, number> = {};
  const remainingQtyByLine: Record<string, number> = {};
  const linesSummary: PODeliveryLineSummary[] = [];

  let totalOrdered = 0;
  let totalReceived = 0;

  lines.forEach((line: any, idx: number) => {
    const lineKey = line.id || line.poLineId || line.boqLineId || `line-${idx + 1}`;
    const ordered = Number(line.quantity ?? line.orderedQty ?? line.approvedQty ?? 0);
    const description = getPOItemDisplayName(line);
    const unit = line.unitSymbol || line.unit || 'sqft';

    // Calculate aggregated received quantity from GRNs (or legacy deliveries fallback)
    const received = isGRNList
      ? getReceivedQtyForPOItemFromGRNs(line, po, records)
      : getReceivedQtyForPOItem(line, records);

    const remaining = Math.max(0, ordered - received);

    orderedQtyByLine[lineKey] = ordered;
    receivedQtyByLine[lineKey] = received;
    remainingQtyByLine[lineKey] = remaining;

    totalOrdered += ordered;
    totalReceived += received;

    linesSummary.push({
      lineKey,
      poItemId: lineKey,
      boqLineId: line.boqLineId,
      description,
      unit,
      orderedQty: ordered,
      receivedQty: received,
      remainingQty: remaining,
    });
  });

  const totalRemaining = Math.max(0, totalOrdered - totalReceived);

  let deliveryStatus: 'not_received' | 'partial' | 'received' = 'not_received';
  if (totalReceived > 0 && totalRemaining > 0) {
    deliveryStatus = 'partial';
  } else if (totalOrdered > 0 && totalRemaining === 0) {
    deliveryStatus = 'received';
  }

  const matchingRecords = records.filter((r) => {
    const rPoId = r.poId || r.purchaseOrderId;
    const rPoNum = (r.poNumber || '').toLowerCase();
    const poDocNo = (po.documentNumber || po.poNumber || '').toLowerCase();
    return rPoId === po.id || (poDocNo && rPoNum === poDocNo);
  });

  return {
    linesSummary,
    orderedQtyByLine,
    receivedQtyByLine,
    remainingQtyByLine,
    totalOrdered,
    totalReceived,
    totalRemaining,
    deliveryStatus,
    deliveryCount: matchingRecords.length,
    deliveries: matchingRecords,
  };
}

/**
 * Resolves item display name for a delivery history record item.
 */
export function getDeliveryItemDisplayName(item: any, po: PurchaseOrder): string {
  if (item.description && item.description.trim() && item.description !== 'Material Item') {
    return item.description.trim();
  }
  if (item.productName && item.productName.trim() && item.productName !== 'Material Item') {
    return item.productName.trim();
  }

  const lines = po?.lines || (po as any)?.items || [];
  const itemKey = item.poLineId || item.poItemId || item.id;
  
  const matchedLine = lines.find((l: any) => 
    (l.id && l.id === itemKey) ||
    (l.poLineId && l.poLineId === itemKey) ||
    (l.boqLineId && item.boqLineId && l.boqLineId === item.boqLineId) ||
    (l.productId && item.productId && l.productId === item.productId)
  );

  return matchedLine ? getPOItemDisplayName(matchedLine) : 'Material Item';
}

