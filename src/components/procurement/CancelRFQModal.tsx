/**
 * Cancel RFQ Confirmation Modal
 * Location: src/components/procurement/CancelRFQModal.tsx
 */

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CancelRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfqNumber: string;
  onConfirm: (reason: string) => void;
}

export const CancelRFQModal: React.FC<CancelRFQModalProps> = ({
  isOpen,
  onClose,
  rfqNumber,
  onConfirm,
}) => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Cancellation reason is required.');
      return;
    }
    setError(null);
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans text-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <AlertTriangle className="h-4 w-4 text-rose-600" /> Cancel Request for Quotation
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-slate-600">
            Are you sure you want to cancel RFQ <strong className="font-mono text-slate-900">{rfqNumber}</strong>?
            This will void out the quotation process for invited suppliers.
          </p>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Reason for Cancellation <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              placeholder="e.g. Material specifications changed, duplicate RFQ issued, project scope deferred..."
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
              required
            />
            {error && <div className="text-rose-600 text-[11px] font-medium mt-1">{error}</div>}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
            >
              Keep RFQ Active
            </button>

            <Button variant="danger" type="submit">
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
