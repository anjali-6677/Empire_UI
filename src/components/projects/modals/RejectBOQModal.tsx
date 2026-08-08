import React, { useState } from 'react';
import { X, XCircle, AlertCircle } from 'lucide-react';
import { Project } from '../../../domain/types';

interface RejectBOQModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (projectId: string, reason: string) => void;
}

export const RejectBOQModal: React.FC<RejectBOQModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !project) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a mandatory reason for rejecting this BOQ.');
      return;
    }
    setError('');
    onConfirmReject(project.id, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-rose-50 border-b border-rose-100">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <XCircle className="h-5 w-5 text-rose-600" />
            <span>Reject BOQ Submission</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-rose-600 hover:text-rose-900 rounded-lg hover:bg-rose-100/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-sans">
            <div className="text-slate-500 font-medium">Project Name:</div>
            <div className="font-bold text-slate-900">{project.projectName} ({project.projectCode})</div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Rejection Reason & Feedback <span className="text-rose-600">*</span>:
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Specify mandatory reasons for rejection (e.g. category budgets exceed commercial limits, missing sub-contractor rates)..."
              rows={4}
              className={`w-full p-2.5 bg-slate-50 border rounded-lg text-xs focus:outline-none ${
                error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 focus:border-rose-500'
              }`}
            />
            {error && (
              <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}
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
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-rose-500/30"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};
