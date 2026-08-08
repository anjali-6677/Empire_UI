import React from 'react';
import { Check, ArrowDownUp } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';

interface VendorComparisonPanelProps {
  quotations: any[];
  selectedQuotationId: string;
  onSelectQuotation: (q: any) => void;
}

export const VendorComparisonPanel: React.FC<VendorComparisonPanelProps> = ({
  quotations,
  selectedQuotationId,
  onSelectQuotation,
}) => {
  if (!quotations || quotations.length === 0) return null;

  // Sort by Landed Amount ascending to calculate ranking and variance
  const sorted = [...quotations].sort(
    (a, b) => (a.landedAmount || a.totalAmount || 0) - (b.landedAmount || b.totalAmount || 0)
  );

  const l1Cost = sorted[0]?.landedAmount || sorted[0]?.totalAmount || 1;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 text-xs animate-in fade-in duration-150">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#AB9570]/20 text-[#AB9570] rounded-lg border border-[#AB9570]/30">
            <ArrowDownUp className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Detailed Vendor Commercial Comparison Matrix</h4>
            <p className="text-[11px] text-slate-400">
              Side-by-side analysis of landed cost, tax breakdowns, delivery schedules, and price variance vs L1 baseline.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Comparison Field</th>
              {quotations.map((q) => {
                const isSelected = q.id === selectedQuotationId;
                const rank = sorted.findIndex((s) => s.id === q.id) + 1;

                return (
                  <th key={q.id} className={`py-3 px-4 min-w-[200px] ${isSelected ? 'bg-[#AB9570]/10 text-white' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{q.vendorName}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[#AB9570] font-mono text-[10px]">
                        L{rank}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
            {/* Quote Ref */}
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-400">Quote Reference</td>
              {quotations.map((q) => (
                <td key={q.id} className="py-2.5 px-4 font-mono font-semibold text-slate-200">
                  {q.quotationNumber || q.quoteRef || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Basic Amount */}
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-400">Basic Ex-Factory Cost</td>
              {quotations.map((q) => (
                <td key={q.id} className="py-2.5 px-4 font-mono">
                  ₹{formatIndianCurrency(q.basicAmount || (q.landedAmount || 0) * 0.82)}
                </td>
              ))}
            </tr>

            {/* Discount */}
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-400">Discount Amount</td>
              {quotations.map((q) => (
                <td key={q.id} className="py-2.5 px-4 font-mono text-emerald-400">
                  - ₹{formatIndianCurrency(q.discountAmount || 0)}
                </td>
              ))}
            </tr>

            {/* Freight */}
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-400">Freight & Logistics</td>
              {quotations.map((q) => (
                <td key={q.id} className="py-2.5 px-4 font-mono">
                  ₹{formatIndianCurrency(q.freightAmount || 0)}
                </td>
              ))}
            </tr>

            {/* GST Tax */}
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-400">GST / Tax Amount</td>
              {quotations.map((q) => (
                <td key={q.id} className="py-2.5 px-4 font-mono">
                  ₹{formatIndianCurrency(q.taxAmount || (q.landedAmount || 0) * 0.18)}
                </td>
              ))}
            </tr>

            {/* Total Landed Cost */}
            <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <td className="py-3 px-4 text-white uppercase text-[11px] tracking-wider">Total Landed Amount</td>
              {quotations.map((q) => {
                const cost = q.landedAmount || q.totalAmount || 0;
                const isSelected = q.id === selectedQuotationId;

                return (
                  <td key={q.id} className={`py-3 px-4 font-mono text-sm font-black text-white ${isSelected ? 'text-[#AB9570]' : ''}`}>
                    ₹{formatIndianCurrency(cost)}
                  </td>
                );
              })}
            </tr>

            {/* Variance vs L1 */}
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-400">Variance vs L1 Landed Cost</td>
              {quotations.map((q) => {
                const cost = q.landedAmount || q.totalAmount || 0;
                const diff = cost - l1Cost;
                const pct = l1Cost > 0 ? ((diff / l1Cost) * 100).toFixed(1) : '0';

                return (
                  <td key={q.id} className="py-2.5 px-4 font-mono text-[11px]">
                    {diff === 0 ? (
                      <span className="text-emerald-400 font-bold">L1 Baseline (+0%)</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">+₹{formatIndianCurrency(diff)} (+{pct}%)</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Delivery Days */}
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-400">Delivery Lead Time</td>
              {quotations.map((q) => (
                <td key={q.id} className="py-2.5 px-4 font-semibold text-slate-200">
                  {q.deliveryDays || q.leadTimeDays || 5} Business Days
                </td>
              ))}
            </tr>

            {/* Payment Terms */}
            <tr>
              <td className="py-2.5 px-4 font-bold text-slate-400">Payment Terms</td>
              {quotations.map((q) => (
                <td key={q.id} className="py-2.5 px-4 text-slate-300">
                  {q.paymentTerms || 'Net 30 Days'}
                </td>
              ))}
            </tr>

            {/* Action Selection */}
            <tr>
              <td className="py-3 px-4 font-bold text-slate-400">Action</td>
              {quotations.map((q) => {
                const isSelected = q.id === selectedQuotationId;

                return (
                  <td key={q.id} className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onSelectQuotation(q)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all w-full flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-[#AB9570] text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? <><Check className="h-3.5 w-3.5 stroke-[3]" /> Selected</> : 'Select Vendor'}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
