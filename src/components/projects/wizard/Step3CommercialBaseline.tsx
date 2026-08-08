import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, FileText, CheckCircle2 } from 'lucide-react';
import { CategoryBudgetRow } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';

export interface Step3BaselineData {
  sourceEnquiryId?: string;
  sourceEstimateId?: string;
  sourceEstimateRevisionId?: string;
  sourceQuotationNumber?: string;
  acceptedQuotationValue: number;
  internalEstimatedCost: number;
  materialCost: number;
  labourCost: number;
  installationCost: number;
  overheads: number;
  expectedMargin: number;
  categoryBudgets: CategoryBudgetRow[];
  paymentTerms?: string;
  clientPODetails?: {
    poNumber?: string;
    poDate?: string;
    poAmount?: number;
    notes?: string;
  };
}

interface Step3CommercialBaselineProps {
  data: Step3BaselineData;
  currentUserRole?: string; // e.g. 'Project Director', 'Estimator', 'Site Engineer'
}

export const Step3CommercialBaseline: React.FC<Step3CommercialBaselineProps> = ({
  data,
  currentUserRole = 'Project Director',
}) => {
  // Role-Based Visibility Toggle (Directors, Managers, and Management can view sensitive internal margins)
  const isPrivilegedRole = ['Project Director', 'Project Manager', 'Management', 'Accounts Officer', 'Estimator'].includes(currentUserRole);
  const [showInternalCosts, setShowInternalCosts] = useState(isPrivilegedRole);

  const totalAcceptedBudget = data.categoryBudgets.reduce((acc, cat) => acc + (cat.allocatedBudget || cat.budgetAmount || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#AB9570]" /> Step 3: Accepted BOQ & Commercial Baseline
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Read-only commercial baseline imported from accepted CRM Estimate Revision ({data.sourceQuotationNumber || 'N/A'}).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-bold text-slate-600">Internal Financial Visibility:</span>
          <button
            type="button"
            onClick={() => setShowInternalCosts(!showInternalCosts)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded shadow-xs border border-slate-200"
          >
            {showInternalCosts ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-amber-600" /> Hide Internal Margin
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-[#AB9570]" /> View Internal Margin
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lock Notice Banner */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
        <Lock className="h-4 w-4 text-[#AB9570] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-xs">Locked Commercial Baseline (Immutable)</div>
          <div className="text-[11px] text-amber-800 leading-relaxed">
            The CRM estimate has been approved by the client. Quotation value, rates, and internal cost baselines are read-only inside Projects. Any future cost increase must follow Budget Exception approval.
          </div>
        </div>
      </div>

      {/* High-Level Commercial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Accepted Client Value</span>
          <span className="text-lg font-mono font-black text-slate-900">{formatIndianCurrency(data.acceptedQuotationValue)}</span>
          <span className="text-[10px] text-slate-500 block font-medium">Billed Contract Amount (incl. GST)</span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Internal BOQ Budget Basis</span>
          <span className="text-lg font-mono font-black text-slate-900">
            {showInternalCosts ? formatIndianCurrency(data.internalEstimatedCost) : '••••••••'}
          </span>
          <span className="text-[10px] text-slate-500 block font-medium">Base BOQ + Wastage + Freight</span>
        </div>

        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">Total Category Procurement Budget</span>
          <span className="text-lg font-mono font-black text-emerald-950">{formatIndianCurrency(totalAcceptedBudget)}</span>
          <span className="text-[10px] text-emerald-800 block font-medium">Derived strictly from internal costs</span>
        </div>

        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Expected Gross Profit Margin</span>
          <span className="text-lg font-mono font-black text-amber-950">
            {showInternalCosts ? formatIndianCurrency(data.expectedMargin) : '••••••••'}
          </span>
          <span className="text-[10px] text-amber-800 block font-medium">Target Project Gross Margin</span>
        </div>
      </div>

      {/* Internal Cost Breakdown (Role-Based Visibility) */}
      {showInternalCosts && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[#AB9570]" /> Detailed Internal Direct Cost Distribution
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-sans text-[10px] text-slate-500 block">Material Cost</span>
              <span className="font-bold text-slate-900">{formatIndianCurrency(data.materialCost)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-sans text-[10px] text-slate-500 block">Labour Cost</span>
              <span className="font-bold text-slate-900">{formatIndianCurrency(data.labourCost)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-sans text-[10px] text-slate-500 block">Installation Cost</span>
              <span className="font-bold text-slate-900">{formatIndianCurrency(data.installationCost)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-sans text-[10px] text-slate-500 block">Site Overhead</span>
              <span className="font-bold text-slate-900">{formatIndianCurrency(data.overheads)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category-Wise Project Budget Table (Automatic Calculation) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Automatically Calculated Category Procurement Budgets
          </h3>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            Calculated from Internal BOQ Cost (Excludes Profit & GST)
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Category Name</th>
                <th className="py-2.5 px-4 text-right">Accepted Internal Budget</th>
                <th className="py-2.5 px-4 text-right">Committed Cost</th>
                <th className="py-2.5 px-4 text-right">Actual Cost</th>
                <th className="py-2.5 px-4 text-right">Remaining Budget</th>
                <th className="py-2.5 px-4 text-center">Budget Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {data.categoryBudgets.map((cat, idx) => {
                const budgetVal = cat.allocatedBudget || cat.budgetAmount || 0;
                const committed = cat.committedCost || 0;
                const actual = cat.actualCost || 0;
                const remaining = budgetVal - (committed || actual);

                return (
                  <tr key={cat.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">{cat.categoryName}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{formatIndianCurrency(budgetVal)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatIndianCurrency(committed)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatIndianCurrency(actual)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">{formatIndianCurrency(remaining)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> On Track
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
