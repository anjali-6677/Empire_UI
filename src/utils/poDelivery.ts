/**
 * Single source of truth helper functions for Purchase Order delivery tracking & calculation.
 * Location: src/utils/poDelivery.ts
 */

import { PurchaseOrder, PODeliveryRecord, PurchaseOrderLine } from '../domain/types';
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
  deliveries: PODeliveryRecord[];
}

/**
 * Gets all delivery records belonging to a Purchase Order, with automatic deduplication.
 */
export function getDeliveriesForPO(poId: string, deliveries: PODeliveryRecord[] = []): PODeliveryRecord[] {
  if (!deliveries || deliveries.length === 0) return [];
  
  const poDeliveries = deliveries.filter((d) => d.poId === poId || (d as any).purchaseOrderId === poId);

  // Safely deduplicate records generated accidentally within close execution windows or duplicate seed logic
  const seenKeys = new Set<string>();
  const deduplicated: PODeliveryRecord[] = [];

  for (const del of poDeliveries) {
    const inv = (del.invoiceNumber || (del as any).invoiceNo || '').trim().toLowerCase();
    const date = del.deliveryDate || (del.recordedAt ? del.recordedAt.split('T')[0] : '');
    const itemsSummary = (del.items || [])
      .map((i: any) => `${i.poLineId || i.productId || i.boqLineId}:${i.qtyReceived || i.quantity || 0}`)
      .sort()
      .join('|');

    const key = del.id ? `id:${del.id}` : `inv:${inv}_date:${date}_items:${itemsSummary}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduplicated.push(del);
    }
  }

  return deduplicated;
}

/**
 * Calculates aggregated received quantity for a specific PO line item across all delivery history.
 */
export function getReceivedQtyForPOItem(
  line: PurchaseOrderLine,
  deliveries: PODeliveryRecord[]
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
        totalReceived += Number(item.qtyReceived ?? item.receivedNowQty ?? item.quantity ?? 0);
      }
    });
  });

  return totalReceived;
}

/**
 * Canonical calculation of PO delivery status and quantities across line items.
 */
export function getCanonicalPODeliverySummary(
  po: PurchaseOrder,
  customDeliveries?: PODeliveryRecord[]
): PODeliverySummaryResult {
  const lines = po?.lines || (po as any)?.items || [];
  const rawDeliveries = customDeliveries || po?.deliveries || [];
  const deliveries = getDeliveriesForPO(po.id, rawDeliveries);

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

    // Calculate aggregated received from delivery history
    const received = getReceivedQtyForPOItem(line, deliveries);
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

  return {
    linesSummary,
    orderedQtyByLine,
    receivedQtyByLine,
    remainingQtyByLine,
    totalOrdered,
    totalReceived,
    totalRemaining,
    deliveryStatus,
    deliveryCount: deliveries.length,
    deliveries,
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
