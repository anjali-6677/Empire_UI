import React from 'react';
import { CheckCircle, Building2, Users, ShieldCheck, DollarSign, MapPin } from 'lucide-react';
import { Step1Data } from './Step1BasicDetails';
import { Step2Data } from './Step2ProjectTeam';
import { Step3Data } from './Step3ApprovalSetup';
import { Step4Data } from './Step4CommercialBudget';
import { Step5Data } from './Step5BOQCategoryBudget';
import { formatIndianCurrency } from '../../../utils/format';

interface Step6ReviewCreateProps {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const Step6ReviewCreate: React.FC<Step6ReviewCreateProps> = ({
  step1,
  step2,
  step3,
  step4,
  step5,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" /> Step 6: Review & Finalize Project Creation
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Verify all parameters before persisting this new project to the central unified ERP store.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Identity */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200/60 pb-2">
            <Building2 className="h-4 w-4 text-amber-500" />
            <span>Project Identity</span>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-sm">{step1.projectName}</div>
            <div className="font-mono text-slate-500 font-bold text-xs">{step1.projectCode}</div>
            <div className="text-slate-600">Client: <span className="font-semibold text-slate-800">{step1.clientName || 'N/A'}</span></div>
            <div className="text-slate-600">Entity: <span className="font-semibold text-slate-800">{step1.companyName}</span></div>
            <div className="flex items-center gap-1 text-slate-500 pt-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span>{step1.siteAddress ? `${step1.siteAddress}, ${step1.city}` : step1.city || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Team & Dates */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200/60 pb-2">
            <Users className="h-4 w-4 text-amber-500" />
            <span>Assigned Leadership</span>
          </div>
          <div className="space-y-1">
            <div>Project Director: <span className="font-bold text-slate-900">{step2.projectDirectorName || 'Unassigned'}</span></div>
            <div>Project Supervisor: <span className="font-bold text-slate-900">{step2.projectSupervisorName || 'Unassigned'}</span></div>
            <div>Start Date: <span className="font-semibold text-slate-800">{(step1 as any).startDate || (step2 as any).startDate || 'TBD'}</span></div>
            <div>Target Completion: <span className="font-semibold text-slate-800">{(step1 as any).targetCompletionDate || (step2 as any).targetCompletionDate || 'TBD'}</span></div>
            <div className="text-slate-500 pt-1">Roster Team Members: <span className="font-bold text-slate-800">{step2.team.length}</span></div>
          </div>
        </div>

        {/* Card 3: Governance */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200/60 pb-2">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            <span>Governance Controls</span>
          </div>
          <div className="space-y-1">
            <div>
              BOQ Sign-Off Policy:{' '}
              <span className={`font-bold ${step3.approvalsSetup.boqApprovalRequired ? 'text-emerald-700' : 'text-slate-500'}`}>
                {step3.approvalsSetup.boqApprovalRequired ? 'Required (Locked)' : 'Optional'}
              </span>
            </div>
            <div>
              Dual Sign-off:{' '}
              <span className="font-semibold text-slate-800">
                {step3.approvalsSetup.requireDualSignoff ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>Indent L1 Limit: <span className="font-mono font-bold text-slate-800">{formatIndianCurrency(step3.approvalsSetup.indentApprovalLimit || 0)}</span></div>
            <div>Direct Purchase Limit: <span className="font-mono font-bold text-slate-800">{formatIndianCurrency(step3.approvalsSetup.directPurchaseLimit || 0)}</span></div>
          </div>
        </div>

        {/* Card 4: Commercials */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200/60 pb-2">
            <DollarSign className="h-4 w-4 text-amber-500" />
            <span>Commercial Baseline</span>
          </div>
          <div className="space-y-1">
            <div>Contract Baseline: <span className="font-mono font-bold text-emerald-700 text-sm">{formatIndianCurrency(step4.budgetBaseline)}</span></div>
            <div>Approved Cap: <span className="font-mono font-bold text-slate-900">{formatIndianCurrency(step4.approvedBudgetLimit || step4.budgetBaseline)}</span></div>
            <div>BOQ File: <span className="font-medium text-slate-800">{step5.boqFileName || 'None (Manual)'}</span></div>
            <div>Categories Budgeted: <span className="font-bold text-slate-800">{step5.categoryBudgets.length} Trades</span></div>
          </div>
        </div>
      </div>

      {/* Confirmation & Submit Action */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-emerald-900 space-y-0.5 text-center sm:text-left">
          <div className="font-bold text-xs">Ready to Initialize Project</div>
          <div className="text-[11px] text-emerald-800/90">
            Clicking "Create & Save Project" will write the unified project record to localStorage.
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all focus:ring-2 focus:ring-amber-500/40 active:scale-[0.98] whitespace-nowrap"
        >
          {isSubmitting ? 'Creating Project...' : 'Create & Save Project'}
        </button>
      </div>
    </div>
  );
};
