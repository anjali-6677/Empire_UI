import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Project } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';

interface ApproveBOQModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove: (projectId: string, note?: string) => void;
}

export const ApproveBOQModal: React.FC<ApproveBOQModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirmApprove,
}) => {
  const [note, setNote] = useState('');

  if (!isOpen || !project) return null;

  const boqValue = project.currentBOQValue || project.budgetBaseline || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-emerald-50 border-b border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>Approve BOQ & Lock Baseline</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-600 hover:text-emerald-900 rounded-lg hover:bg-emerald-100/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 font-sans">
            <div className="text-slate-500 font-medium">Project Name:</div>
            <div className="font-bold text-slate-900 text-sm">{project.projectName} ({project.projectCode})</div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 mt-2">
              <span className="text-slate-600 font-medium">BOQ Baseline Value:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">{formatIndianCurrency(boqValue)}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>Immutable Baseline Warning</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800/90">
              Approving this BOQ will lock it as Revision R0. Material indents and procurement POs will be validated against these category cost baselines.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Approval Note / Remarks (Optional):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter sign-off comments or Board approval ref number..."
              rows={3}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmApprove(project.id, note);
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-emerald-500/30"
          >
            Confirm BOQ Approval
          </button>
        </div>
      </div>
    </div>
  );
};
