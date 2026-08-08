import React from 'react';
import { Calculator, ShieldCheck, Layers, TrendingUp, DollarSign } from 'lucide-react';
import { CostSummary } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';
import { createEmptyCostSummary } from '../../utils/normalizeEstimate';

interface CostSummaryCardProps {
  costSummary?: CostSummary;
}

export const CostSummaryCard: React.FC<CostSummaryCardProps> = ({ costSummary }) => {
  const safe = costSummary || createEmptyCostSummary();

  return (
    <div className="space-y-6 text-xs bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Header Banner (Light Card) */}
      <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-200">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570]">Step 3: Commercial Cost Summary</div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <Calculator className="h-4.5 w-4.5 text-[#AB9570]" /> Commercial Quotation & Profit Margin Hierarchy
          </h3>
        </div>
      </div>

      {/* Top 3 High Level KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Internal Cost Basis</div>
          <div className="text-xl font-mono font-black text-slate-900">
            {formatIndianCurrency(safe.internalTotalCost ?? 0)}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Base BOQ + Wastage + Freight + Overhead</div>
        </div>

        <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
            <span>Estimated Profit Margin</span>
            <TrendingUp className="h-3.5 w-3.5 text-[#AB9570]" />
          </div>
          <div className="text-xl font-mono font-black text-amber-950">
            {formatIndianCurrency(safe.profitAmount ?? 0)}{' '}
            <span className="text-xs font-bold text-[#AB9570]">({(safe.profitPercentage ?? 18).toFixed(1)}%)</span>
          </div>
          <div className="text-[10px] text-amber-800 font-medium">Target gross profit margin</div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-900 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-[#AB9570] uppercase tracking-wider">Final Client Quotation Value</div>
          <div className="text-2xl font-mono font-black text-[#AB9570]">
            {formatIndianCurrency(safe.finalQuotationValue ?? 0)}
          </div>
          <div className="text-[10px] text-slate-300 font-medium">Including 18% GST • Billed to Client</div>
        </div>
      </div>

      {/* Structured Commercial Calculation Blocks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Block A: Direct BOQ Costs */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Layers className="h-4 w-4 text-[#AB9570]" /> A. Direct BOQ Line Costs
            </span>
            <span className="font-mono font-bold text-slate-900">{formatIndianCurrency(safe.baseBOQCost ?? 0)}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">Material Subtotal</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{formatIndianCurrency(safe.materialCostSum ?? 0)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">Line Labour Subtotal</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{formatIndianCurrency(safe.lineLabourSum ?? 0)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">Installation Subtotal</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{formatIndianCurrency(safe.lineInstallationSum ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Block B: Pricing Factors & Allowances */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-800">
              <ShieldCheck className="h-4 w-4 text-[#AB9570]" /> B. Pricing Factors & Logistics Allowances
            </span>
            <span className="font-mono font-bold text-slate-800">
              +{formatIndianCurrency((safe.wastageAmount ?? 0) + (safe.transportationAmount ?? 0) + (safe.overheadAmount ?? 0))}
            </span>
          </h4>

          <div className="space-y-2 font-mono text-slate-800">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-sans font-medium text-slate-700">+ Material Wastage Allowance</span>
              <span className="font-semibold text-slate-900">{formatIndianCurrency(safe.wastageAmount ?? 0)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-sans font-medium text-slate-700">+ Freight, Transport & Handling</span>
              <span className="font-semibold text-slate-900">{formatIndianCurrency(safe.transportationAmount ?? 0)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-sans font-medium text-slate-700">+ Site Supervision & Project Overhead</span>
              <span className="font-semibold text-slate-900">{formatIndianCurrency(safe.overheadAmount ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Block C: Subtotal, Margin & Taxes */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-[#AB9570]" /> C. Subtotal, Margin & Tax Calculation
          </h4>

          <div className="space-y-2 font-mono text-slate-800">
            <div className="flex justify-between py-2 bg-slate-50 px-3 rounded-xl font-bold text-slate-900 border border-slate-200">
              <span className="font-sans">Subtotal (Internal Total Base Cost)</span>
              <span>{formatIndianCurrency(safe.subtotalBeforeProfit ?? 0)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-amber-900 font-bold border-b border-slate-100">
              <span className="font-sans">+ Gross Profit Margin ({safe.profitPercentage ?? 18}%)</span>
              <span>{formatIndianCurrency(safe.profitAmount ?? 0)}</span>
            </div>

            {(safe.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between py-1.5 text-rose-600 font-bold border-b border-slate-100">
                <span className="font-sans">- Commercial Discount</span>
                <span>-{formatIndianCurrency(safe.discountAmount ?? 0)}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-sans font-bold text-slate-900">Taxable Commercial Value</span>
              <span className="font-bold text-slate-900">{formatIndianCurrency(safe.taxableAmount ?? 0)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-600 border-b border-slate-100">
              <span className="font-sans font-medium">+ GST (18%)</span>
              <span className="font-semibold">{formatIndianCurrency(safe.gstAmount ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Block D: Final Client Commercial Total */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-900">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570]">Final Output</span>
            <div className="text-base font-bold text-white">CLIENT PROPOSAL TOTAL VALUE</div>
          </div>
          <div className="text-2xl font-mono font-black text-[#AB9570]">
            {formatIndianCurrency(safe.finalQuotationValue ?? 0)}
          </div>
        </div>
      </div>
    </div>
  );
};
