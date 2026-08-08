import React from 'react';
import { Award, Clock, AlertCircle, FileText, Check } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';

interface VendorQuotationCardsProps {
  rfqs: any[];
  vendorQuotations: any[];
  selectedQuotationId: string;
  onSelectQuotation: (quotation: any) => void;
  onToggleComparison: () => void;
  isComparisonOpen: boolean;
}

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
        <p className="text-slate-400 text-[11px]">You can switch to Direct Purchase Order mode if no vendor bidding RFQ was conducted.</p>
      </div>
    );
  }

  // Filter valid received quotations for these RFQs
  const receivedQuotes = vendorQuotations.filter((q) =>
    rfqs.some((r) => r.id === q.rfqId) && (q.status === 'received' || q.status === 'Submitted' || q.status === 'Received' || q.landedAmount > 0)
  );

  // Identify L1 (Lowest Landed Cost), Fastest Delivery, Best Payment Terms
  let lowestCostId = '';
  let minCost = Infinity;

  let fastestDeliveryId = '';
  let minDeliveryDays = Infinity;

  receivedQuotes.forEach((q) => {
    const cost = q.landedAmount || q.totalAmount || q.basicAmount || Infinity;
    if (cost < minCost) {
      minCost = cost;
      lowestCostId = q.id;
    }

    const delDays = q.deliveryDays || q.leadTimeDays || Infinity;
    if (delDays < minDeliveryDays) {
      minDeliveryDays = delDays;
      fastestDeliveryId = q.id;
    }
  });

  // Pending / Awaiting RFQs
  const pendingRFQs: any[] = [];
  rfqs.forEach((rfq) => {
    const hasQuote = vendorQuotations.some(
      (q) => q.rfqId === rfq.id && (q.status === 'received' || q.status === 'Submitted' || q.status === 'Received')
    );
    if (!hasQuote) {
      pendingRFQs.push(rfq);
    }
  });

  return (
    <div className="space-y-4 text-xs">
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
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isComparisonOpen ? 'Hide Detailed Comparison' : 'View Detailed Comparison'}
          </button>
        )}
      </div>

      {/* Received Vendor Quote Cards */}
      {receivedQuotes.length === 0 ? (
        <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium text-xs flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <span>
            <strong>No Vendor Quotations Received Yet:</strong> RFQs were created, but no supplier quotations have been recorded in received status. Please record vendor rates or use Direct PO mode.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receivedQuotes.map((q) => {
            const isSelected = q.id === selectedQuotationId;
            const isL1 = q.id === lowestCostId;
            const isFastest = q.id === fastestDeliveryId && minDeliveryDays < Infinity;
            const rfq = rfqs.find((r) => r.id === q.rfqId);

            const landedCost = q.landedAmount || q.totalAmount || q.basicAmount || 0;

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuotation(q)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-50/50 border-[#AB9570] shadow-md ring-2 ring-[#AB9570]/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Header & Radio */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {q.vendorName}
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Quote #{q.quotationNumber || q.quoteRef || 'Q-N/A'} • RFQ #{rfq?.rfqNumber || 'RFQ'}
                    </div>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? 'border-[#AB9570] bg-[#AB9570] text-slate-950' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {isL1 && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px] flex items-center gap-1 border border-emerald-300">
                      <Award className="h-3 w-3 text-emerald-700" /> Lowest Landed Cost (L1)
                    </span>
                  )}
                  {isFastest && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md text-[10px] flex items-center gap-1 border border-blue-200">
                      <Clock className="h-3 w-3" /> Fastest ({q.deliveryDays || 3} Days)
                    </span>
                  )}
                </div>

                {/* Financial Overview */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Basic Amount:</span>
                    <span className="font-mono font-medium text-slate-800">₹{formatIndianCurrency(q.basicAmount || landedCost * 0.82)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Freight / Taxes:</span>
                    <span className="font-mono font-medium text-slate-800">₹{formatIndianCurrency((q.freightAmount || 0) + (q.taxAmount || 0))}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span className="text-xs uppercase tracking-wider text-slate-700">Total Landed Amount:</span>
                    <span className="font-mono font-black text-sm text-slate-900">
                      ₹{formatIndianCurrency(landedCost)}
                    </span>
                  </div>
                </div>

                {/* Terms */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-0.5">
                  <div>Payment Terms: <span className="font-semibold text-slate-800">{q.paymentTerms || 'Standard 30 Days'}</span></div>
                  <div>Delivery: <span className="font-semibold text-slate-800">{q.deliveryTerms || `${q.deliveryDays || 5} Days`}</span></div>
                </div>
              </div>
            );
          })}
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
