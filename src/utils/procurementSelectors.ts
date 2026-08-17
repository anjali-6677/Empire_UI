/**
 * Single Source of Truth Selectors & Canonical Resolution for Procurement Module
 * Location: src/utils/procurementSelectors.ts
 */

/**
 * Normalizes and extracts all candidate string identifiers for an RFQ object or ID string.
 */
export function getCanonicalRFQIds(rfqOrId: any): string[] {
  if (!rfqOrId) return [];

  if (typeof rfqOrId === 'string') {
    return [rfqOrId.trim().toLowerCase()];
  }

  const ids = new Set<string>();
  const add = (val?: string) => {
    if (val && typeof val === 'string' && val.trim()) {
      ids.add(val.trim().toLowerCase());
    }
  };

  add(rfqOrId.id);
  add(rfqOrId.documentNumber);
  add(rfqOrId.rfqNumber);
  add(rfqOrId.rfqNo);
  add(rfqOrId.code);
  add(rfqOrId.number);

  return Array.from(ids);
}

/**
 * Normalizes and extracts all candidate string RFQ identifiers from a Vendor Quotation.
 */
export function getQuotationRFQIds(q: any): string[] {
  if (!q) return [];
  const ids = new Set<string>();
  const add = (val?: string) => {
    if (val && typeof val === 'string' && val.trim()) {
      ids.add(val.trim().toLowerCase());
    }
  };

  add(q.rfqId);
  add(q.rfqNumber);
  add(q.rfqDocumentNumber);
  add(q.rfqNo);

  return Array.from(ids);
}

/**
 * Checks whether a quotation is a valid, submitted/received quotation.
 * Handles casing discrepancies ('submitted' vs 'Submitted') and numeric landed cost fallbacks.
 */
export function isValidReceivedQuotation(q: any): boolean {
  if (!q) return false;

  const rawStatus = (q.status || '').toString().toLowerCase().trim();
  const validStatuses = [
    'submitted',
    'received',
    'awarded',
    'under_review',
    'reviewed',
    'approved',
    'l1_selected',
    'selected',
    'active',
  ];

  if (validStatuses.includes(rawStatus)) {
    return true;
  }

  // Fallback: check if valid positive quotation amount exists
  const amount = getQuotationLandedAmount(q);
  return amount > 0;
}

/**
 * Returns normalized landed total cost for a quotation.
 */
export function getQuotationLandedAmount(q: any): number {
  if (!q) return 0;

  const landed = Number(
    q.landedTotal ??
      q.landedAmount ??
      q.totalAmount ??
      q.grandTotal ??
      q.basicTotal ??
      q.basicAmount ??
      q.totalCost ??
      0
  );

  if (landed > 0) return landed;

  // Fallback sum over quotation lines
  if (Array.isArray(q.lines) && q.lines.length > 0) {
    return q.lines.reduce((sum: number, line: any) => {
      const lineTotal = Number(line.lineTotal ?? line.totalAmount ?? 0);
      if (lineTotal > 0) return sum + lineTotal;
      const qty = Number(line.quantity ?? 1);
      const rate = Number(line.unitRate ?? line.basicRate ?? 0);
      return sum + qty * rate;
    }, 0);
  }

  return 0;
}

/**
 * Canonical selector to retrieve all valid vendor quotations linked to an RFQ.
 */
export function getVendorQuotationsForRFQ(
  targetRFQ: any,
  vendorQuotations: any[]
): any[] {
  if (!vendorQuotations || !Array.isArray(vendorQuotations)) return [];

  const targetIds = getCanonicalRFQIds(targetRFQ);
  if (targetIds.length === 0) return [];

  return vendorQuotations.filter((q) => {
    const qRfqIds = getQuotationRFQIds(q);
    const matchesRFQ = qRfqIds.some((qId) => targetIds.includes(qId));
    return matchesRFQ && isValidReceivedQuotation(q);
  });
}

/**
 * Calculates pending/awaiting RFQs out of a list of RFQs.
 * An RFQ is considered fully quoted if quotes received match invited vendors or status is awarded/completed.
 */
export function getPendingRFQs(rfqs: any[], vendorQuotations: any[]): any[] {
  if (!rfqs || !Array.isArray(rfqs)) return [];

  return rfqs.filter((rfq) => {
    const rfqStatus = (rfq.status || '').toString().toLowerCase().trim();
    if (rfqStatus === 'awarded' || rfqStatus === 'completed' || rfqStatus === 'quotations_received') {
      return false;
    }

    const quotes = getVendorQuotationsForRFQ(rfq, vendorQuotations);
    const invitedVendors: string[] = rfq.invitedVendorIds || rfq.invitedVendors || [];

    if (invitedVendors.length > 0) {
      const quotedVendorIds = new Set(quotes.map((q) => (q.vendorId || '').toLowerCase()));
      const unquotedCount = invitedVendors.filter((vId) => !quotedVendorIds.has((vId || '').toLowerCase())).length;
      return unquotedCount > 0;
    }

    return quotes.length === 0;
  });
}

/**
 * Calculates the accurate Indent Commercial Baseline amount.
 */
export function getIndentCommercialBaseline(indent: any): number {
  if (!indent) return 0;

  const directValue = Number(
    indent.totalEstimatedValue ??
      indent.estimatedTotalValue ??
      indent.approvedValue ??
      indent.totalEstimatedCost ??
      indent.totalValue ??
      0
  );

  if (directValue > 0) return directValue;

  const items = indent.items || indent.lines || [];
  if (Array.isArray(items) && items.length > 0) {
    return items.reduce((sum: number, item: any) => {
      const estTotal = Number(item.estimatedTotal ?? item.totalCost ?? item.total ?? 0);
      if (estTotal > 0) return sum + estTotal;
      const qty = Number(item.approvedQty ?? item.requestedQty ?? item.quantity ?? 0);
      const rate = Number(item.estimatedRate ?? item.rate ?? 0);
      return sum + qty * rate;
    }, 0);
  }

  return 0;
}
