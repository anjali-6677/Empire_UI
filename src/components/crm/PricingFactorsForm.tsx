import React from 'react';
import { AlertTriangle, Info, Shield } from 'lucide-react';
import { PricingFactor, CostSummary, BOQSection } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';

interface PricingFactorsFormProps {
  pricingFactors: PricingFactor[];
  onPricingFactorsChange: (factors: PricingFactor[]) => void;
  isCustomPricing: boolean;
  onIsCustomPricingChange: (val: boolean) => void;
  overrideReason: string;
  onOverrideReasonChange: (val: string) => void;
  boqSections: BOQSection[];
  costSummary: CostSummary;
  readOnly?: boolean;
}

export const PricingFactorsForm: React.FC<PricingFactorsFormProps> = ({
  pricingFactors,
  onPricingFactorsChange,
  isCustomPricing,
  onIsCustomPricingChange,
  overrideReason,
  onOverrideReasonChange,
  boqSections: _boqSections,
  costSummary,
  readOnly = false,
}) => {
  const handleFactorValueChange = (id: string, newVal: number) => {
    const updated = pricingFactors.map((f) => {
      if (f.id !== id) return f;
      const isOverridden = newVal !== f.companyDefaultValue;
      return { ...f, estimateValue: newVal, overridden: isOverridden };
    });
    onPricingFactorsChange(updated);
  };

  const handleResetToDefaults = () => {
    const reset = pricingFactors.map((f) => ({
      ...f,
      estimateValue: f.companyDefaultValue,
      overridden: false,
      overrideReason: undefined,
    }));
    onPricingFactorsChange(reset);
    onIsCustomPricingChange(false);
    onOverrideReasonChange('');
  };

  const hasAnyOverride = pricingFactors.some((f) => f.overridden);

  return (
    <div className="space-y-6 text-xs">
      {/* Mode Selector Header */}
      <div className="bg-white text-slate-900 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm border border-slate-200">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570]">Step 2: Commercial Pricing Factors</div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <Shield className="h-4 w-4 text-[#AB9570]" /> Apply Company Default vs Estimate Custom Factors
          </h3>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (hasAnyOverride) handleResetToDefaults();
                else onIsCustomPricingChange(false);
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                !isCustomPricing
                  ? 'bg-slate-900 text-[#AB9570] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard Company Defaults
            </button>
            <button
              type="button"
              onClick={() => onIsCustomPricingChange(true)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                isCustomPricing
                  ? 'bg-[#AB9570] text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Estimate Override
            </button>
          </div>
        )}
      </div>

      {/* Double Counting Protection Banner */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-xs">Calculation Rule (Double Counting Prevention Enforced)</div>
          <div className="text-[11px] text-blue-800 leading-relaxed">
            BOQ line-item Labour (<span className="font-mono font-bold">{formatIndianCurrency(costSummary.lineLabourSum)}</span>) and Installation (<span className="font-mono font-bold">{formatIndianCurrency(costSummary.lineInstallationSum)}</span>) are included directly in the Base BOQ Cost. Pricing Factors for Labour % and Installation % apply only to Material Cost when line-item costs are 0, preventing accidental double calculation.
          </div>
        </div>
      </div>

      {/* Mandatory Reason Box if Custom Pricing Active */}
      {isCustomPricing && !readOnly && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Custom Pricing Override Active
          </div>
          <p className="text-[11px] text-amber-800">
            Please specify a justification for modifying standard company factors or profit margins:
          </p>
          <input
            type="text"
            value={overrideReason}
            onChange={(e) => onOverrideReasonChange(e.target.value)}
            placeholder="e.g. Competitive bidding requirement, strategic client discount, high volume project..."
            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
            required
          />
        </div>
      )}

      {/* Factors Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Pricing Factor Parameter</th>
              <th className="py-3 px-4 text-center">Type</th>
              <th className="py-3 px-4 text-center">Company Default</th>
              <th className="py-3 px-4 text-center">Applied Estimate Value</th>
              <th className="py-3 px-4 text-right">Calculated Rupee Impact</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {pricingFactors.map((factor) => {
              const isOverridden = factor.estimateValue !== factor.companyDefaultValue;

              return (
                <tr key={factor.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{factor.name}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-600 capitalize">
                    {factor.calculationType}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600">
                    {factor.calculationType === 'percentage' ? `${factor.companyDefaultValue}%` : formatIndianCurrency(factor.companyDefaultValue)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isCustomPricing && !readOnly ? (
                      <div className="inline-flex items-center gap-1 justify-center">
                        <input
                          type="number"
                          value={factor.estimateValue}
                          onChange={(e) => handleFactorValueChange(factor.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-amber-50 border border-amber-300 rounded font-mono font-bold text-center text-slate-900 focus:border-amber-500"
                        />
                        {factor.calculationType === 'percentage' && <span className="font-bold text-slate-600">%</span>}
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-slate-900">
                        {factor.calculationType === 'percentage' ? `${factor.estimateValue}%` : formatIndianCurrency(factor.estimateValue)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatIndianCurrency(factor.amount || 0)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isOverridden ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Overridden
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Standard Default
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
