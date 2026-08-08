import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, GitCompare } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { EstimateStatusBadge } from '../../components/crm/EstimateStatusBadge';
import { formatIndianCurrency } from '../../utils/format';
import { normalizeEstimate } from '../../utils/normalizeEstimate';

export const RevisionComparisonPage: React.FC = () => {
  const { enquiryId } = useParams<{ enquiryId: string }>();
  const navigate = useNavigate();
  const { state } = useERPStore();

  const enquiry = state.enquiries.find((e) => e.id === enquiryId || e.enquiryNumber === enquiryId);
  const rawEstimates = state.estimates.filter((e) => e.enquiryId === enquiry?.id || e.enquiryId === enquiryId);
  const estimates = rawEstimates.map(normalizeEstimate);

  if (!enquiry || estimates.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        No estimate revisions found for comparison.
      </div>
    );
  }

  // Sort revisions R0, R1, R2...
  const sortedRevisions = [...estimates].sort((a, b) => a.revisionNumber - b.revisionNumber);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs">
      <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/crm/enquiries/${enquiry.id}`)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
              <GitCompare className="h-4 w-4" /> Commercial Revision Comparison
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{enquiry.clientName}</h1>
            <p className="text-xs text-slate-400">{enquiry.projectRequirement}</p>
          </div>
        </div>
      </div>

      {/* Side by Side Revisions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedRevisions.map((est, idx) => {
          const prevEst = idx > 0 ? sortedRevisions[idx - 1] : null;
          const diffValue = prevEst ? est.finalQuotationValue - prevEst.finalQuotationValue : 0;
          const overheadTrans = (est.costSummary?.overheadAmount ?? 0) + (est.costSummary?.transportationAmount ?? 0);

          return (
            <div key={est.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="font-mono font-black text-amber-600 text-sm">{est.revisionLabel}</span>
                  <div className="text-[10px] text-slate-500 font-mono">{est.quotationNumber}</div>
                </div>
                <EstimateStatusBadge status={est.status} />
              </div>

              <div className="space-y-2 font-mono text-slate-800">
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Base BOQ:</span>
                  <span>{formatIndianCurrency(est.costSummary?.baseBOQCost ?? 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Overhead & Transport:</span>
                  <span>{formatIndianCurrency(overheadTrans)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Profit Margin:</span>
                  <span className="text-amber-700 font-bold">{est.costSummary?.profitPercentage ?? 0}% ({formatIndianCurrency(est.costSummary?.profitAmount ?? 0)})</span>
                </div>
                <div className="flex justify-between py-2 bg-slate-900 text-white px-3 rounded-lg font-black text-sm">
                  <span className="font-sans text-amber-400">Total Billed:</span>
                  <span className="text-amber-400">{formatIndianCurrency(est.finalQuotationValue)}</span>
                </div>
              </div>

              {prevEst && (
                <div className={`p-2.5 rounded-xl border flex items-center justify-between font-bold ${
                  diffValue > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <span className="font-sans text-[11px]">Variance vs {prevEst.revisionLabel}:</span>
                  <span className="font-mono">
                    {diffValue > 0 ? `+${formatIndianCurrency(diffValue)}` : formatIndianCurrency(diffValue)}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to={`/crm/estimates/${est.id}`}
                  className="block text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
                >
                  Inspect {est.revisionLabel} Package
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
