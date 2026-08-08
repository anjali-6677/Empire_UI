import React from 'react';
import { CRMEnquiryStatus } from '../../domain/types';

interface EnquiryStatusBadgeProps {
  status: CRMEnquiryStatus;
  className?: string;
}

export const EnquiryStatusBadge: React.FC<EnquiryStatusBadgeProps> = ({ status, className = '' }) => {
  const configMap: Record<CRMEnquiryStatus, { label: string; bg: string; text: string; border: string }> = {
    new: { label: 'New Enquiry', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    estimating: { label: 'Estimation In Progress', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    quotation_ready: { label: 'Quotation Ready', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    sent_to_client: { label: 'Sent to Client', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    revision_requested: { label: 'Revision Requested', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    won: { label: 'Tender Won', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    lost: { label: 'Opportunity Lost', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    cancelled: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
  };

  const config = configMap[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};
