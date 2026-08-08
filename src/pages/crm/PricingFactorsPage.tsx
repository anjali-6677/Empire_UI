import React, { useState } from 'react';
import { ArrowLeft, Save, Shield, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { PricingFactor } from '../../domain/types';

export const PricingFactorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, setCompanyPricingFactors, logAudit } = useERPStore() as any;

  const [factors, setFactors] = useState<PricingFactor[]>(
    (state as any).companyPricingFactors && (state as any).companyPricingFactors.length > 0
      ? (state as any).companyPricingFactors
      : [
          { id: 'pf-wastage', name: 'Material Wastage Allowance', code: 'WASTAGE', companyDefaultValue: 5, estimateValue: 5, calculationType: 'percentage', isMandatory: true, categoryScope: 'all', appliesToCostBasis: 'material_cost', sortOrder: 1 },
          { id: 'pf-transport', name: 'Freight & Transportation', code: 'FREIGHT', companyDefaultValue: 3.5, estimateValue: 3.5, calculationType: 'percentage', isMandatory: false, categoryScope: 'all', appliesToCostBasis: 'material_cost', sortOrder: 2 },
          { id: 'pf-overhead', name: 'Site Supervision & Project Overhead', code: 'OVERHEAD', companyDefaultValue: 8, estimateValue: 8, calculationType: 'percentage', isMandatory: true, categoryScope: 'all', appliesToCostBasis: 'subtotal', sortOrder: 3 },
          { id: 'pf-profit', name: 'Target Gross Profit Margin', code: 'PROFIT', companyDefaultValue: 18, estimateValue: 18, calculationType: 'percentage', isMandatory: true, categoryScope: 'all', appliesToCostBasis: 'subtotal', sortOrder: 4 },
        ]
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleUpdateFactor = (id: string, val: number) => {
    setFactors(
      factors.map((f) => {
        if (f.id !== id) return f;
        return { ...f, companyDefaultValue: val, estimateValue: val };
      })
    );
  };

  const handleSaveDefaults = () => {
    setCompanyPricingFactors(factors);
    logAudit({
      documentType: 'system',
      documentId: 'pricing-factors',
      documentNumber: 'PRICING-CONFIG',
      action: 'UPDATED_PRICING_FACTORS',
      performedBy: 'Commercial Director',
      details: 'Updated standard company pricing factor default rules.',
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/crm')}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-600">Company Standards Master</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Commercial Pricing Factors Rules</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveDefaults}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md"
        >
          <Save className="h-4 w-4 stroke-[2.5]" /> Save Company Defaults
        </button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Standard company pricing factors saved successfully!
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" /> Executive Standard Rates
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Factor Code</th>
                <th className="py-3 px-4">Factor Description</th>
                <th className="py-3 px-4">Cost Basis</th>
                <th className="py-3 px-4 text-center">Company Default Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {factors.map((factor) => (
                <tr key={factor.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{factor.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{factor.name}</td>
                  <td className="py-3 px-4 capitalize font-semibold text-slate-600">{((factor as any).appliesToCostBasis || 'subtotal').replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1 justify-center">
                      <input
                        type="number"
                        value={factor.companyDefaultValue}
                        onChange={(e) => handleUpdateFactor(factor.id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg font-mono font-bold text-slate-900 text-center focus:border-amber-500"
                      />
                      <span className="font-bold text-slate-700">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
