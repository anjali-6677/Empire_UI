import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { ProjectApprovalConfig } from '../../../domain/types';

export interface Step3Data {
  approvalsSetup: ProjectApprovalConfig;
}

interface Step3ApprovalSetupProps {
  data: Step3Data;
  onChange: (field: keyof Step3Data, value: any) => void;
}

export const Step3ApprovalSetup: React.FC<Step3ApprovalSetupProps> = ({ data, onChange }) => {
  const config = data.approvalsSetup || {
    boqApprovalRequired: true,
    requireDualSignoff: true,
    indentApprovalLimit: 100000,
    directPurchaseLimit: 50000,
  };

  const updateConfig = (key: keyof ProjectApprovalConfig, val: any) => {
    onChange('approvalsSetup', {
      ...config,
      [key]: val,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-500" /> Step 3: Governance & Approval Workflows
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Configure financial authorization limits, BOQ sign-off requirements, and indent approval thresholds.
        </p>
      </div>

      <div className="space-y-4">
        {/* BOQ Sign-Off Policy */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>BOQ Approval & Baseline Sign-Off Policy</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.boqApprovalRequired}
                onChange={(e) => updateConfig('boqApprovalRequired', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            When enabled, BOQs must be formally approved before site engineers can raise material indents or initiate procurement RFQs.
          </p>

          {config.boqApprovalRequired && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-4">
              <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.requireDualSignoff}
                  onChange={(e) => updateConfig('requireDualSignoff', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500/20"
                />
                <span>Require Dual Sign-Off (Project Head + Chairman)</span>
              </label>
            </div>
          )}
        </div>

        {/* Financial Threshold Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-slate-800 font-bold">
              Material Indent L1 Threshold (INR)
            </label>
            <p className="text-[11px] text-slate-500">
              Indents exceeding this amount require Project Director approval.
            </p>
            <input
              type="number"
              value={config.indentApprovalLimit}
              onChange={(e) => updateConfig('indentApprovalLimit', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-slate-800 font-bold">
              Direct Purchase Approval Limit (INR)
            </label>
            <p className="text-[11px] text-slate-500">
              Direct site purchases above this amount require Accounts sign-off.
            </p>
            <input
              type="number"
              value={config.directPurchaseLimit}
              onChange={(e) => updateConfig('directPurchaseLimit', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
