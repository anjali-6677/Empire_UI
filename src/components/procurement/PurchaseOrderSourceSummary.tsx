import React from 'react';
import { Building2, MapPin, AlertTriangle } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';

interface PurchaseOrderSourceSummaryProps {
  indent: any;
  project: any;
}

export const PurchaseOrderSourceSummary: React.FC<PurchaseOrderSourceSummaryProps> = ({
  indent,
  project,
}) => {
  if (!indent) return null;

  const totalValue = indent.estimatedTotalValue || indent.approvedValue || 0;
  const itemsCount = (indent.items || []).length;
  const hasBOQException = Boolean(indent.boqException || indent.hasBoqException);
  const hasBudgetException = Boolean(indent.budgetException || indent.hasBudgetException);

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#AB9570]/20 text-[#AB9570] rounded-lg">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Project & Indent Source Details</h3>
            <p className="text-[11px] text-slate-500">Auto-filled baseline from Approved Indent & Project Master</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] border border-emerald-200">
            Approved Indent
          </span>
          <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold rounded-lg text-[11px]">
            {indent.indentNumber}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Project Info */}
        <div className="space-y-1">
          <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Project</div>
          <div className="font-bold text-slate-900">{project?.projectName || indent.projectName || 'Fitout Project'}</div>
          <div className="text-slate-500 font-mono text-[11px]">{project?.projectCode || 'PRJ-N/A'}</div>
        </div>

        {/* Client & Address */}
        <div className="space-y-1">
          <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Client & Delivery Site</div>
          <div className="font-semibold text-slate-800">{project?.clientName || indent.clientName || 'N/A'}</div>
          <div className="text-slate-500 text-[11px] flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{project?.siteAddress || indent.deliveryAddress || 'Site Location'}</span>
          </div>
        </div>

        {/* Indents Metadata */}
        <div className="space-y-1">
          <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Requested & Priority</div>
          <div className="text-slate-800 font-medium">By: <span className="font-bold text-slate-900">{indent.requestedByName || indent.requestedBy || 'Project Manager'}</span></div>
          <div className="text-slate-500 text-[11px]">
            Priority: <span className="font-bold text-amber-700 uppercase">{indent.priority || 'Normal'}</span>
          </div>
        </div>

        {/* Financial Baseline */}
        <div className="space-y-1">
          <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Indent Commercial Baseline</div>
          <div className="font-mono font-black text-slate-900 text-sm">
            {formatIndianCurrency(totalValue)}
          </div>
          <div className="text-slate-500 text-[11px]">
            Line Items: <span className="font-bold text-slate-800">{itemsCount} items</span>
          </div>
        </div>
      </div>

      {/* Exception Badges */}
      {(hasBOQException || hasBudgetException) && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-amber-900 font-medium">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Indent Exception Note:</strong> {indent.boqExceptionReason || indent.budgetExceptionReason || 'Includes approved BOQ quantity or budget variance.'}
          </span>
        </div>
      )}
    </div>
  );
};
