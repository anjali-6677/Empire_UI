/**
 * Reusable Quotation Comparison Panel
 * Location: src/components/procurement/QuotationComparisonPanel.tsx
 */

import React, { useState } from 'react';
import { Award, ChevronDown, ChevronUp, Sparkles, FileText } from 'lucide-react';
import { RFQ, VendorQuotation } from '../../domain/types';

export interface QuotationComparisonPanelProps {
  rfq: RFQ;
  quotations: VendorQuotation[];
  selectedVendorId?: string;
  onSelectVendor?: (vendorId: string) => void;
  showSelectRadio?: boolean;
}

export const QuotationComparisonPanel: React.FC<QuotationComparisonPanelProps> = ({
  rfq,
  quotations,
  selectedVendorId,
  onSelectVendor,
  showSelectRadio = true,
}) => {
  const [showDetailedMatrix, setShowDetailedMatrix] = useState<boolean>(false);

  if (!quotations || quotations.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500">
        <FileText className="h-8 w-8 mx-auto text-slate-400 mb-2" />
        <h4 className="font-bold text-slate-700">No Supplier Quotes Recorded Yet</h4>
        <p className="text-xs text-slate-500 mt-1">
          Record vendor quotes from the invited vendors tab to compare commercial landed rates.
        </p>
      </div>
    );
  }

  // Sort quotations by landed total ascending to determine L1, L2, L3 ranking
  const sortedQuotes = [...quotations].sort(
    (a, b) => (a.totalQuotedLandedAmount || 0) - (b.totalQuotedLandedAmount || 0)
  );

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Vendor Cards Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {quotations.map((quote) => {
          const rankIndex = sortedQuotes.findIndex((q) => q.id === quote.id);
          const isL1 = rankIndex === 0;
          const rankLabel = isL1 ? 'L1 Lowest' : `L${rankIndex + 1}`;
          const isSelected = selectedVendorId === quote.vendorId;

          return (
            <div
              key={quote.id}
              onClick={() => showSelectRadio && onSelectVendor && onSelectVendor(quote.vendorId)}
              className={`p-3.5 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/40 shadow-sm'
                  : isL1
                  ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* L1 / Rank Badge */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    isL1
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Award className="h-3 w-3" /> {rankLabel}
                </span>

                {showSelectRadio && (
                  <input
                    type="radio"
                    name="vendorSelection"
                    checked={isSelected}
                    onChange={() => onSelectVendor && onSelectVendor(quote.vendorId)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                )}
              </div>

              {/* Vendor Name & Ref */}
              <div className="font-bold text-slate-900 text-sm">{quote.vendorName}</div>
              <div className="text-[10px] font-mono text-slate-500 mb-2">Ref: {quote.documentNumber}</div>

              {/* Landed Amount */}
              <div className="bg-white/80 rounded-lg p-2 border border-slate-200/80 mb-2.5">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Landed Amount</div>
                <div className="text-base font-bold font-mono text-slate-900">
                  ₹{quote.totalQuotedLandedAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Commercial Terms Key Details */}
              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Lead Time:</span>
                  <strong className="font-mono text-slate-800">{quote.deliveryDays || 7} Days</strong>
                </div>
                <div className="flex justify-between">
                  <span>Payment Terms:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[140px]">{quote.paymentTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="font-mono text-slate-800">{quote.validUntil}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle Expand Detailed Comparison Matrix */}
      <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-lg border border-slate-200">
        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-700" /> Line-by-Line Commercial Comparison
        </span>

        <button
          type="button"
          onClick={() => setShowDetailedMatrix(!showDetailedMatrix)}
          className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
        >
          {showDetailedMatrix ? (
            <>
              Hide Detailed Matrix <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              View Detailed Comparison <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Detailed Line-by-Line Table */}
      {showDetailedMatrix && (
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm bg-white">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2.5 border-r border-slate-200">Material Item & Qty</th>
                {quotations.map((q) => {
                  const rankIndex = sortedQuotes.findIndex((sq) => sq.id === q.id);
                  const isL1 = rankIndex === 0;
                  return (
                    <th key={q.id} className="p-2.5 text-right border-r border-slate-200 min-w-[140px]">
                      <div className="flex items-center justify-end gap-1 font-bold text-slate-900">
                        {q.vendorName}
                        {isL1 && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] rounded">L1</span>}
                      </div>
                      <div className="text-[10px] font-normal text-slate-500 font-mono">Landed Unit Rate</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {rfq.lines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50">
                  <td className="p-2.5 border-r border-slate-200">
                    <div className="font-bold text-slate-900">{line.productName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {line.productCode} • Qty: {line.quantity} {line.unitSymbol}
                    </div>
                  </td>

                  {quotations.map((q) => {
                    const lineVal = q.lines.find((l) => l.rfqLineId === line.id || l.productId === line.productId);
                    const landedRate = lineVal?.landedRatePerUnit || 0;
                    const lineTotal = lineVal?.quotedLineTotal || 0;

                    return (
                      <td key={q.id} className="p-2.5 text-right border-r border-slate-200">
                        <div className="font-mono font-bold text-slate-900">₹{landedRate.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Total: ₹{lineTotal.toLocaleString('en-IN')}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
