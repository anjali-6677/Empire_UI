import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Rocket, AlertTriangle } from 'lucide-react';
import { validateProjectActivation } from '../../../utils/projectActivationValidator';
import { formatIndianCurrency } from '../../../utils/format';

interface Step5ReviewActivateProps {
  projectData: any;
  onActivate: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
}

export const Step5ReviewActivate: React.FC<Step5ReviewActivateProps> = ({
  projectData,
  onActivate,
  onSaveDraft,
  isSubmitting = false,
}) => {
  const activationStatus = validateProjectActivation(projectData);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Rocket className="h-4 w-4 text-[#AB9570]" /> Step 5: Review & Activate Project
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Verify project activation criteria. Once activated, procurement, indents, and RFQs can begin immediately.
        </p>
      </div>

      {/* Activation Status Summary Banner */}
      {activationStatus.canActivate ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-emerald-950">Project Ready for Direct Activation</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              All 9 standard activation requirements are satisfied. Click "Activate Project Now" to initialize execution status to Active and enable procurement.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-amber-950">
              Project Incomplete – {activationStatus.missingCount} Requirement(s) Pending
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              This project will be saved as a <span className="font-bold text-amber-950">Draft</span>. Complete all missing criteria below to activate the project.
            </p>
          </div>
        </div>
      )}

      {/* 9 Standard Activation Criteria Checklist */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
          Standard Project Activation Criteria Checklist (9 Items)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activationStatus.checks.map((check) => (
            <div
              key={check.code}
              className={`p-3 rounded-lg border flex items-start gap-2.5 transition-all ${
                check.passed
                  ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-600 opacity-80'
              }`}
            >
              {check.passed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-bold text-xs">{check.label}</div>
                <div className="text-[10px] text-slate-500">{check.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Recap Box */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[#AB9570]" /> Commercial & Operational Summary
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Project Title</span>
            <span className="font-bold text-slate-900">{projectData.projectName || 'Untitled Project'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Client Name</span>
            <span className="font-bold text-slate-900">{projectData.clientName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Accepted Quotation Value</span>
            <span className="font-mono font-bold text-slate-900">
              {formatIndianCurrency(projectData.acceptedQuotationValue || projectData.contractValue || 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Internal Procurement Budget</span>
            <span className="font-mono font-bold text-emerald-700">
              {formatIndianCurrency(projectData.internalEstimatedCost || projectData.budgetBaseline || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-xs"
        >
          Save Project as Draft
        </button>

        <button
          type="button"
          onClick={onActivate}
          disabled={isSubmitting || !activationStatus.canActivate}
          className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg shadow-sm transition-all ${
            activationStatus.canActivate
              ? 'bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Rocket className="h-4 w-4" /> {isSubmitting ? 'Activating...' : 'Activate Project Now'}
        </button>
      </div>
    </div>
  );
};
