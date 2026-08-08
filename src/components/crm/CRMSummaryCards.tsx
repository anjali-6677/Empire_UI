import React from 'react';
import { FileText, Calculator, Send, RotateCcw, Award, XCircle } from 'lucide-react';
import { Enquiry } from '../../domain/types';

interface CRMSummaryCardsProps {
  enquiries: Enquiry[];
}

export const CRMSummaryCards: React.FC<CRMSummaryCardsProps> = ({ enquiries }) => {
  const total = enquiries.length;
  const inProgress = enquiries.filter((e) => e.status === 'estimating' || e.status === 'quotation_ready' || e.status === 'new').length;
  const sent = enquiries.filter((e) => e.status === 'sent_to_client').length;
  const revisions = enquiries.filter((e) => e.status === 'revision_requested').length;
  const won = enquiries.filter((e) => e.status === 'won').length;
  const lost = enquiries.filter((e) => e.status === 'lost' || e.status === 'cancelled').length;

  const cards = [
    { title: 'Total Enquiries', value: total, subtitle: 'All customer leads', icon: FileText, border: 'border-l-4 border-l-blue-500', iconBg: 'bg-blue-50 text-blue-600' },
    { title: 'Estimates in Progress', value: inProgress, subtitle: 'Drafting BOQ & rates', icon: Calculator, border: 'border-l-4 border-l-amber-500', iconBg: 'bg-amber-50 text-amber-600' },
    { title: 'Quotations Sent', value: sent, subtitle: 'Awaiting client decision', icon: Send, border: 'border-l-4 border-l-sky-500', iconBg: 'bg-sky-50 text-sky-600' },
    { title: 'Revision Requested', value: revisions, subtitle: 'Changes requested by client', icon: RotateCcw, border: 'border-l-4 border-l-orange-500', iconBg: 'bg-orange-50 text-orange-600' },
    { title: 'Tenders Won', value: won, subtitle: 'Accepted proposals', icon: Award, border: 'border-l-4 border-l-emerald-500', iconBg: 'bg-emerald-50 text-emerald-600' },
    { title: 'Opportunities Lost', value: lost, subtitle: 'Rejected or cancelled', icon: XCircle, border: 'border-l-4 border-l-rose-500', iconBg: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className={`p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md ${card.border}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.title}</span>
              <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tight">{card.value}</div>
            <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
};
