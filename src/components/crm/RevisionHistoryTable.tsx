import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Eye, GitCompare, Lock } from 'lucide-react';
import { Estimate } from '../../domain/types';
import { EstimateStatusBadge } from './EstimateStatusBadge';
import { formatIndianCurrency } from '../../utils/format';

interface RevisionHistoryTableProps {
  estimates: Estimate[];
  currentEstimateId?: string;
  enquiryId: string;
}

export const RevisionHistoryTable: React.FC<RevisionHistoryTableProps> = ({
  estimates,
  currentEstimateId,
  enquiryId,
}) => {
  if (estimates.length === 0) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
        No estimate revisions created yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-amber-400" /> Estimate Revisions History ({estimates.length} Revisions)
        </h3>

        {estimates.length > 1 && (
          <Link
            to={`/crm/revisions/compare/${enquiryId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
          >
            <GitCompare className="h-3.5 w-3.5" /> Compare Revision Diffs
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Revision</th>
              <th className="py-3 px-4">Quotation Number</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Quotation Value</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {estimates.map((est) => {
              const isAccepted = est.status === 'accepted';
              const isCurrent = est.id === currentEstimateId;

              return (
                <tr key={est.id} className={`hover:bg-slate-50 ${isCurrent ? 'bg-amber-50/40' : ''}`}>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {est.revisionLabel}
                      {isAccepted && <Lock className="h-3 w-3 text-emerald-600" />}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{est.quotationNumber}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(est.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <EstimateStatusBadge status={est.status} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatIndianCurrency(est.finalQuotationValue)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/crm/estimates/${est.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
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
