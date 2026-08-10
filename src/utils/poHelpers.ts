/**
 * Single source of truth helper functions for Purchase Order items & status
 * Location: src/utils/poHelpers.ts
 */

import { PurchaseOrderLine } from '../domain/types';

/**
 * Normalizes and extracts the canonical display name for a Purchase Order item.
 * Supports legacy/demo schema variants: description, productName, materialName, itemName.
 */
export function getPOItemDisplayName(line: any): string {
  if (!line) return 'Material Item';
  const name =
    line.description ||
    line.productName ||
    line.materialName ||
    line.itemName ||
    (line.product && line.product.name) ||
    '';
  
  if (!name || name.trim() === '' || name.trim() === '.') {
    return line.boqLineId ? `BOQ Line (${line.boqLineId})` : 'Material Item';
  }

  return name.trim();
}

/**
 * Normalizes a PO Line Item object to carry canonical fields.
 */
export function normalizePOLineItem(line: any, index: number = 0): PurchaseOrderLine {
  const displayName = getPOItemDisplayName(line);
  const qty = Number(line.quantity ?? line.orderedQty ?? line.approvedQty ?? 0);
  const rate = Number(line.unitRate ?? line.basicRate ?? line.rate ?? 0);
  const tax = Number(line.taxPercent ?? line.gstPercent ?? 18);
  const subtotal = Number(line.lineSubtotal ?? (qty * rate));
  const taxAmount = Number(line.lineTaxAmount ?? (subtotal * (tax / 100)));
  const total = Number(line.lineTotal ?? (subtotal + taxAmount));

  return {
    ...line,
    id: line.id || line.poLineId || line.boqLineId || `po-line-${index + 1}`,
    description: displayName,
    productName: displayName,
    materialName: displayName,
    quantity: qty,
    unit: line.unit || line.unitSymbol || 'sqft',
    unitSymbol: line.unitSymbol || line.unit || 'sqft',
    rate: rate,
    unitRate: rate,
    basicRate: rate,
    gstPercent: tax,
    taxPercent: tax,
    lineSubtotal: subtotal,
    lineTaxAmount: taxAmount,
    lineTotal: total,
    amount: total,
  };
}
