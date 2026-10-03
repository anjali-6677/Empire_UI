import React from 'react';
import { Award, Clock, AlertCircle, FileText } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';
import {
  getCanonicalRFQIds,
  getQuotationRFQIds,
  isValidReceivedQuotation,
  getQuotationLandedAmount,
  getPendingRFQs,
} from '../../utils/procurementSelectors';

interface VendorQuotationCardsProps {
  rfqs: any[];
  vendorQuotations: any[];
  selectedQuotationId: string;
  onSelectQuotation: (quotation: any) => void;
  onToggleComparison: () => void;
  isComparisonOpen: boolean;
}

/**
 * Resolves a clean display quotation number (e.g., QT-2026-001) avoiding Q-N/A.
 */
const getQuotationDisplayNumber = (q: any, index: number): string => {
  if (!q) return `QT-2026-${String(index + 1).padStart(3, '0')}`;
  const num =
    q.quotationNumber ||
    q.quoteRef ||
    q.quotationNo ||
    q.quoteNumber ||
    q.documentNumber ||
    q.code;

  if (num && typeof num === 'string' && num.trim() !== '' && !num.toLowerCase().includes('n/a')) {
    return num.trim();
  }

  if (q.id && typeof q.id === 'string') {
    const rawId = q.id.trim();
    if (rawId.toLowerCase().startsWith('vq-') || rawId.toLowerCase().startsWith('qt-')) {
      return rawId.replace(/^(vq|qt)-/i, 'QT-').toUpperCase();
    }
  }

  return `QT-2026-${String(index + 1).padStart(3, '0')}`;
};

export const VendorQuotationCards: React.FC<VendorQuotationCardsProps> = ({
  rfqs,
  vendorQuotations,
  selectedQuotationId,
  onSelectQuotation,
  onToggleComparison,
  isComparisonOpen,
}) => {
  if (!rfqs || rfqs.length === 0) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-xs">
        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <div className="font-bold text-slate-700">No RFQs found for this Indent</div>
        <p className="text-slate-400 text-[11px]">
          You can switch to Direct Purchase Order mode if no vendor bidding RFQ was conducted.
        </p>
      </div>
    );
  }

  // Filter valid received quotations for these RFQs using canonical selectors
  const rawReceivedQuotes = (vendorQuotations || []).filter((q) => {
    const isForRFQ = rfqs.some((r) => {
      const canonicalIds = getCanonicalRFQIds(r);
      const qRfqIds = getQuotationRFQIds(q);
      return qRfqIds.some((qId) => canonicalIds.includes(qId));
    });
    return (isForRFQ || rfqs.length === 1) && isValidReceivedQuotation(q);
  });

  // Sort received quotes ascending by Landed Cost (L1, L2, L3...)
  const receivedQuotes = [...rawReceivedQuotes].sort(
    (a, b) => getQuotationLandedAmount(a) - getQuotationLandedAmount(b)
  );

  // Identify lowest landed cost and fastest delivery
  let lowestCostId = '';
  let minCost = Infinity;
  let fastestDeliveryId = '';
  let minDeliveryDays = Infinity;

  receivedQuotes.forEach((q) => {
    const cost = getQuotationLandedAmount(q) || Infinity;
    if (cost < minCost) {
      minCost = cost;
      lowestCostId = q.id;
    }

    const delDays = Number(q.deliveryDays ?? q.leadTimeDays ?? Infinity);
    if (delDays < minDeliveryDays) {
      minDeliveryDays = delDays;
      fastestDeliveryId = q.id;
    }
  });

  // Accurate Pending / Awaiting RFQs calculation
  const pendingRFQs = getPendingRFQs(rfqs, vendorQuotations);

  return (
    <div className="space-y-3 text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-[#AB9570]" /> Available Vendor Quotations
          </h3>
          <p className="text-[11px] text-slate-500">
            Select a vendor quotation to award the Purchase Order. Side-by-side comparison available below.
          </p>
        </div>

        {receivedQuotes.length > 1 && (
          <button
            type="button"
            onClick={onToggleComparison}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isComparisonOpen ? 'Hide Detailed Comparison' : 'View Detailed Comparison'}
          </button>
        )}
      </div>

      {/* Received Vendor Quote Compact List / Table */}
      {receivedQuotes.length === 0 ? (
        <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium text-xs flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <span>
            <strong>No Vendor Quotations Received Yet:</strong> RFQs were created, but no supplier quotations have been recorded in received status. Please record vendor rates or use Direct PO mode.
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center">Select</th>
                  <th className="py-2.5 px-4 min-w-[200px]">Vendor Details</th>
                  <th className="py-2.5 px-3 text-right">Basic Amount</th>
                  <th className="py-2.5 px-3 text-right">Freight / Taxes</th>
                  <th className="py-2.5 px-4 text-right font-bold text-slate-700">Total Landed Amount</th>
                  <th className="py-2.5 px-3">Payment Terms</th>
                  <th className="py-2.5 px-3">Delivery</th>
                  <th className="py-2.5 px-4 text-center min-w-[130px]">Ranking / Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {receivedQuotes.map((q, idx) => {
                  const isSelected = q.id === selectedQuotationId;
                  const isL1 = q.id === lowestCostId;
                  const isFastest = q.id === fastestDeliveryId && minDeliveryDays < Infinity;
                  const rank = idx + 1;

                  const landedCost = getQuotationLandedAmount(q);
                  const freightTax = Number((q.freightAmount || 0) + (q.taxAmount || 0));
                  const basicCost = Number(
                    q.basicTotal ??
                      q.basicAmount ??
                      (landedCost > 0 ? landedCost - freightTax : 0)
                  );
                  const quoteNum = getQuotationDisplayNumber(q, idx);

                  return (
                    <tr
                      key={q.id}
                      onClick={() => onSelectQuotation(q)}
                      className={`transition-colors cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-amber-50/70 ring-1 ring-inset ring-[#AB9570]/40'
                          : isL1
                          ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Select Radio */}
                      <td className="py-3 px-3 text-center align-middle">
                        <div className="flex items-center justify-center">
                          <input
                            type="radio"
                            name="selectedVendorQuotation"
                            checked={isSelected}
                            onChange={() => onSelectQuotation(q)}
                            className="h-4 w-4 text-[#AB9570] focus:ring-[#AB9570] border-slate-300 cursor-pointer"
                          />
                        </div>
                      </td>

                      {/* Vendor & Quote Number */}
                      <td className="py-3 px-4 align-middle">
                        <div className="font-semibold text-slate-900 text-xs">
                          {q.vendorName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Quote #{quoteNum}
                        </div>
                      </td>

                      {/* Basic Amount */}
                      <td className="py-3 px-3 text-right font-mono text-slate-700 align-middle">
                        {formatIndianCurrency(basicCost)}
                      </td>

                      {/* Freight / Taxes */}
                      <td className="py-3 px-3 text-right font-mono text-slate-500 align-middle">
                        {formatIndianCurrency(freightTax)}
                      </td>

                      {/* Total Landed Amount */}
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm align-middle">
                        {formatIndianCurrency(landedCost)}
                      </td>

                      {/* Payment Terms */}
                      <td className="py-3 px-3 text-slate-600 align-middle text-[11px]">
                        {q.paymentTerms || 'Net 30 Days'}
                      </td>

                      {/* Delivery */}
                      <td className="py-3 px-3 text-slate-600 align-middle text-[11px]">
                        {q.deliveryTerms || `${q.deliveryDays || 5} Days`}
                      </td>

                      {/* Ranking / Advantage Badges */}
                      <td className="py-3 px-4 align-middle text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {isL1 ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px] inline-flex items-center gap-1 border border-emerald-300 shadow-xs">
                              <Award className="h-3 w-3 text-emerald-700 shrink-0" /> L1 Lowest
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono font-bold rounded text-[10px] border border-slate-200">
                              L{rank}
                            </span>
                          )}

                          {isFastest && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md text-[10px] inline-flex items-center gap-1 border border-blue-200">
                              <Clock className="h-3 w-3 text-blue-700 shrink-0" /> Fastest
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending / Sent RFQs Warning Banner */}
      {pendingRFQs.length > 0 && (
        <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Pending RFQs ({pendingRFQs.length} Invited Vendors Awaiting Quotations)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Some invited vendors have not submitted their quotes yet. These pending entries are visible below for audit complete status, but cannot be selected for PO award until their quotes are recorded.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {pendingRFQs.map((rfq) => (
              <span
                key={rfq.id}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono text-[11px] text-slate-600 flex items-center gap-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                {rfq.vendorName || rfq.supplierName || 'Invited Vendor'} ({rfq.rfqNumber})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
