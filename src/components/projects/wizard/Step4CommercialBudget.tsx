import React from 'react';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';
import { formatIndianCurrency } from '../../../utils/format';

export interface Step4Data {
  budgetBaseline: number;
  approvedBudgetLimit: number;
  mobilizationAdvance: number;
  retentionPercent: number;
  commercialNotes: string;
}

interface Step4CommercialBudgetProps {
  data: Step4Data;
  onChange: (field: keyof Step4Data, value: any) => void;
}

export const Step4CommercialBudget: React.FC<Step4CommercialBudgetProps> = ({ data, onChange }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-500" /> Step 4: Commercial & Contract Baseline Budget
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Establish overall contract baseline value, financial budget caps, and commercial terms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Contract Value */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Contract Baseline Value (INR) <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="number"
              value={data.budgetBaseline || ''}
              onChange={(e) => onChange('budgetBaseline', parseFloat(e.target.value) || 0)}
              placeholder="e.g. 7500000"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Formatted: {formatIndianCurrency(data.budgetBaseline || 0)}
          </p>
        </div>

        {/* Approved Budget Cap */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Approved Expenditure Cap (INR)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="number"
              value={data.approvedBudgetLimit || ''}
              onChange={(e) => onChange('approvedBudgetLimit', parseFloat(e.target.value) || 0)}
              placeholder="e.g. 7000000"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Formatted: {formatIndianCurrency(data.approvedBudgetLimit || 0)}
          </p>
        </div>

        {/* Mobilization Advance */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Mobilization Advance Amount (INR)
          </label>
          <input
            type="number"
            value={data.mobilizationAdvance || ''}
            onChange={(e) => onChange('mobilizationAdvance', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 1000000"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Retention Percentage */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Contract Retention Percentage (%)
          </label>
          <div className="relative">
            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="number"
              value={data.retentionPercent || 5}
              onChange={(e) => onChange('retentionPercent', parseFloat(e.target.value) || 0)}
              placeholder="5"
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Commercial Notes */}
        <div className="md:col-span-2">
          <label className="block text-slate-700 font-semibold mb-1">
            Commercial Notes & Payment Terms
          </label>
          <textarea
            value={data.commercialNotes}
            onChange={(e) => onChange('commercialNotes', e.target.value)}
            placeholder="Enter commercial exceptions, milestone payment schedule notes, or client billing terms..."
            rows={3}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
