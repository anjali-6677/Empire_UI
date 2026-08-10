import React, { useState } from 'react';
import { PurchaseOrder } from '../../../domain/types';
import { getProjectCategoryBudgetSummary } from '../../../domain/selectors';
import { useERPStore } from '../../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../../utils/format';
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck, X } from 'lucide-react';

interface POApprovalModalProps {
  po: PurchaseOrder;
  mode: 'approve' | 'reject';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export const POApprovalModal: React.FC<POApprovalModalProps> = ({
  po,
  mode,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { state } = useERPStore();
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract primary category from PO items
  const lines = po.lines || [];
  const primaryCategoryName = (lines[0] as any)?.categoryName || 'General Works';
  const primaryCategoryId = (lines[0] as any)?.categoryId || 'cat_general';

  // Calculate PO Amount
  const poAmount = po.grandTotal || po.totalAmount || 0;

  // Calculate Category Budget
  const budgetSummary = getProjectCategoryBudgetSummary(
    state,
    po.projectId,
    primaryCategoryId,
    poAmount,
    po.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'reject' && !rejectionReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    onConfirm(rejectionReason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            {mode === 'approve' ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'approve' ? 'Confirm Purchase Order Approval' : 'Reject Purchase Order'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">{po.documentNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {mode === 'approve' ? (
            <>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Are you sure you want to approve Purchase Order <strong className="font-mono text-slate-900">{po.documentNumber}</strong> for vendor{' '}
                <strong className="text-slate-900">{po.vendorName}</strong>?
              </p>

              {/* Budget Summary Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Category Budget Summary ({primaryCategoryName})
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400">Allocated</div>
                    <div className="font-bold text-slate-900">{formatIndianCurrency(budgetSummary.allocatedBudget)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Committed</div>
                    <div className="font-bold text-slate-700">{formatIndianCurrency(budgetSummary.committedCost)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Remaining</div>
                    <div className="font-bold text-emerald-700">{formatIndianCurrency(budgetSummary.remainingBudget)}</div>
                  </div>
                </div>
              </div>

              {/* Budget Exceeded Alert */}
              {budgetSummary.isExceeded && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" /> BUDGET EXCEEDED WARNING
                  </div>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    This PO of <strong className="font-mono">{formatIndianCurrency(poAmount)}</strong> exceeds the remaining budget category baseline by{' '}
                    <strong className="font-mono text-rose-700">{formatIndianCurrency(budgetSummary.exceededBy)}</strong>.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Rejecting Purchase Order <strong className="font-mono text-slate-900">{po.documentNumber}</strong> will prevent vendor issuance and mark the document as rejected.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Rejection Reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Provide explicit reason for rejecting this PO..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-900 font-medium placeholder:text-slate-400"
                />
                {error && <p className="mt-1 text-[11px] text-rose-600 font-bold">{error}</p>}
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 ${
                mode === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {mode === 'approve' ? (
                <>
                  <ShieldCheck className="h-4 w-4 stroke-[2.5]" /> Approve Purchase Order
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 stroke-[2.5]" /> Reject Purchase Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
