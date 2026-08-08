import React, { useState } from 'react';
import { X, RotateCcw, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Project } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';

interface RequestRevisionModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRevision: (projectId: string, fileName: string, totalValue: number, comment: string) => void;
}

export const RequestRevisionModal: React.FC<RequestRevisionModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirmRevision,
}) => {
  const [comment, setComment] = useState('');
  const [newBOQValue, setNewBOQValue] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [error, setError] = useState('');

  if (!isOpen || !project) return null;

  const currentRevisionCount = project.boqRevisions ? project.boqRevisions.length : 1;
  const nextRevisionLabel = `R${currentRevisionCount}`;

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      if (!newBOQValue) {
        setNewBOQValue(String(project.currentBOQValue || project.budgetBaseline || 0));
      }
      setError('');
    }
  };

  const handleSubmit = () => {
    if (!uploadedFileName) {
      setError('Please select a revised BOQ Excel file to upload.');
      return;
    }
    const parsedVal = parseFloat(newBOQValue);
    if (isNaN(parsedVal) || parsedVal <= 0) {
      setError('Please enter a valid positive revision total budget amount.');
      return;
    }
    if (!comment.trim()) {
      setError('Please provide a mandatory revision request reason.');
      return;
    }

    setError('');
    onConfirmRevision(project.id, uploadedFileName, parsedVal, comment.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <RotateCcw className="h-5 w-5 text-amber-600" />
            <span>Request BOQ Revision ({nextRevisionLabel})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-amber-700 hover:text-amber-950 rounded-lg hover:bg-amber-100/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-sans">
            <div className="text-slate-500 font-medium">Project Name:</div>
            <div className="font-bold text-slate-900">{project.projectName} ({project.projectCode})</div>
            <div className="text-[11px] text-slate-500 pt-1">
              Current Baseline ({`R${currentRevisionCount - 1}`}):{' '}
              <span className="font-mono font-bold text-slate-800">
                {formatIndianCurrency(project.currentBOQValue || project.budgetBaseline || 0)}
              </span>
            </div>
          </div>

          {/* File Upload simulation */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Upload Revised BOQ Excel File <span className="text-rose-600">*</span>:
            </label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-amber-400 bg-slate-50/50 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSimulate}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
              {uploadedFileName ? (
                <div className="flex items-center justify-center gap-1.5 font-bold text-amber-800">
                  <FileSpreadsheet className="h-4 w-4 text-amber-600" />
                  <span>{uploadedFileName}</span>
                </div>
              ) : (
                <p className="text-slate-500 text-[11px]">
                  Click or drag revised BOQ file (<span className="font-mono">.xlsx</span>) to upload
                </p>
              )}
            </div>
          </div>

          {/* New Revised Value */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Revised BOQ Total Budget (INR) <span className="text-rose-600">*</span>:
            </label>
            <input
              type="number"
              value={newBOQValue}
              onChange={(e) => setNewBOQValue(e.target.value)}
              placeholder="e.g. 6500000"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Revision Reason */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Revision Reason & Scope Changes <span className="text-rose-600">*</span>:
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain mandatory scope modifications or client VO (Variation Order)..."
              rows={3}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}
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
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-amber-500/30"
          >
            Submit Revision ({nextRevisionLabel})
          </button>
        </div>
      </div>
    </div>
  );
};
