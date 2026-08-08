import React from 'react';
import { CRMEstimateStatus } from '../../domain/types';

interface EstimateStatusBadgeProps {
  status: CRMEstimateStatus;
  className?: string;
}

export const EstimateStatusBadge: React.FC<EstimateStatusBadgeProps> = ({ status, className = '' }) => {
  const configMap: Record<CRMEstimateStatus, { label: string; bg: string; text: string; border: string }> = {
    draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    quotation_ready: { label: 'Quotation Ready', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    sent_to_client: { label: 'Sent to Client', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    revision_requested: { label: 'Revision Requested', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    accepted: { label: 'Quotation Accepted', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    rejected: { label: 'Quotation Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    superseded: { label: 'Superseded Revision', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
  };

  const config = configMap[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};
