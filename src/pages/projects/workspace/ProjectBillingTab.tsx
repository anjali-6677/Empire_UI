import React from 'react';
import { DollarSign } from 'lucide-react';
import { Project } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';

interface ProjectBillingTabProps {
  project: Project;
}

export const ProjectBillingTab: React.FC<ProjectBillingTabProps> = ({ project }) => {
  const contractVal = (project as any).contractValue || (project as any).acceptedQuotationValue || 0;
  const certifiedRev = (project as any).certifiedRevenue || 0;
  const receipts = (project as any).clientReceipts || 0;
  const outstanding = Math.max(0, certifiedRev - receipts);

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Contract Value</span>
          <div className="text-lg font-black text-slate-900 font-mono">{formatIndianCurrency(contractVal)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Accepted CRM Quotation</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Certified Revenue</span>
          <div className="text-lg font-black text-emerald-700 font-mono">{formatIndianCurrency(certifiedRev)}</div>
          <div className="text-[10px] text-emerald-600 mt-1">Approved RA Bills</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Client Receipts</span>
          <div className="text-lg font-black text-blue-700 font-mono">{formatIndianCurrency(receipts)}</div>
          <div className="text-[10px] text-blue-600 mt-1">Collections Received</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Outstanding Due</span>
          <div className="text-lg font-black text-amber-700 font-mono">{formatIndianCurrency(outstanding)}</div>
          <div className="text-[10px] text-amber-600 mt-1">Pending Collection</div>
        </div>
      </div>

      {/* Payment Terms & Milestone Triggers */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[#AB9570]" /> Commercial Payment Terms Baseline
        </h3>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 space-y-2">
          <div className="font-mono text-xs font-bold text-slate-900">
            {typeof (project as any).paymentTerms === 'string'
              ? (project as any).paymentTerms
              : 'Mobilization Advance: 20% | Running Bills: 70% against site progress | Final Handover: 10%'}
          </div>
          <p className="text-[11px] text-slate-500">
            Imported directly from accepted CRM quotation package. Governed by client PO reference {(project as any).clientPODetails?.poNumber || 'PO-ACCEPT-01'}.
          </p>
        </div>
      </div>
    </div>
  );
};
