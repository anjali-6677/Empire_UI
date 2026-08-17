/**
 * Review Pending WIP Modal Component
 * Location: src/components/subcontractor/ReviewPendingWIPModal.tsx
 */

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import { SubcontractWorkOrder, SubcontractorWIP } from '../../domain/types';
import { calculateWIPTotalsForWO, normalizeSubcontractWorkOrder } from '../../utils/subcontractorHelpers';

interface ReviewPendingWIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: SubcontractWorkOrder;
  pendingWip: SubcontractorWIP;
  allWips: SubcontractorWIP[];
  onApproveWIP: (
    wipId: string,
    approvedLines: Array<{ itemId: string; approvedQty: number; approvedValue?: number }>,
    performedBy?: string
  ) => { success: boolean; error?: string };
  onRejectWIP: (wipId: string, reason?: string, performedBy?: string) => { success: boolean; error?: string };
}

export const ReviewPendingWIPModal: React.FC<ReviewPendingWIPModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  pendingWip,
  allWips,
  onApproveWIP,
  onRejectWIP,
}) => {
  if (!isOpen || !pendingWip || !workOrder) return null;

  const normWO = normalizeSubcontractWorkOrder(workOrder);
  const metrics = calculateWIPTotalsForWO(normWO, allWips);

  // Initialize state for approved quantities per item
  const [approvedQtyState, setApprovedQtyState] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    (pendingWip.items || []).forEach((item: any) => {
      const id = item.id || item.woItemId;
      const claimed = Number(item.claimedQty || 0);
      const measured = Number(item.measuredQty ?? claimed);
      initial[id] = measured;
    });
    return initial;
  });

  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectField, setShowRejectField] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApprovedQtyChange = (itemId: string, val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setApprovedQtyState((prev) => ({
      ...prev,
      [itemId]: num,
    }));
  };

  const calculateProposedTotalValue = () => {
    return (pendingWip.items || []).reduce((sum: number, item: any) => {
      const id = item.id || item.woItemId;
      const appQty = approvedQtyState[id] ?? Number(item.measuredQty ?? item.claimedQty ?? 0);
      const rate = Number(item.rate || 0);
      return sum + appQty * rate;
    }, 0);
  };

  const handleApprove = () => {
    setErrorMsg(null);

    // Validate approved quantities against line limits
    const linesToSubmit: Array<{ itemId: string; approvedQty: number; approvedValue?: number }> = [];

    const itemsList = pendingWip.items || [];
    for (let i = 0; i < itemsList.length; i++) {
      const item = itemsList[i];
      const id: string = item.id || item.woItemId || `line-${i}`;
      const appQty = approvedQtyState[id] ?? 0;
      const rate = Number(item.rate || 0);

      // Find WO item line remaining qty
      const woCalc = metrics.itemCalculations.find(
        (c) => c.itemId === item.woItemId || c.scopeDescription.toLowerCase() === (item.scopeDescription || '').toLowerCase()
      );

      const maxAllowed = woCalc ? woCalc.remainingQty : Number(item.woQty || 999999);

      if (appQty > maxAllowed + 0.001) {
        setErrorMsg(
          `Approved quantity (${appQty}) cannot exceed remaining WO quantity (${maxAllowed} ${item.unitSymbol || ''}) for "${item.scopeDescription}".`
        );
        return;
      }

      linesToSubmit.push({
        itemId: id,
        approvedQty: appQty,
        approvedValue: appQty * rate,
      });
    }

    const res = onApproveWIP(pendingWip.id || pendingWip.wipNumber || '', linesToSubmit, 'Project Director');
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to approve WIP.');
      return;
    }

    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setErrorMsg('Please specify a rejection reason before rejecting.');
      return;
    }

    const res = onRejectWIP(pendingWip.id || pendingWip.wipNumber || '', rejectReason, 'Project Director');
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to reject WIP.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Review & Approve WIP Measurement</h3>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded">
                  {pendingWip.wipNumber || pendingWip.documentNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                WO: <span className="font-mono text-white">{normWO.documentNumber}</span> · {normWO.subcontractorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Claim Summary Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-6 text-slate-700">
            <div>
              <span className="text-slate-500 font-medium">Submitted Date:</span>{' '}
              <span className="font-semibold">{pendingWip.wipDate || pendingWip.createdAt?.split('T')[0]}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Site Engineer:</span>{' '}
              <span className="font-semibold">{pendingWip.siteEngineerName || pendingWip.createdBy || 'Amit Verma'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Total Claimed Value:</span>{' '}
              <span className="font-semibold text-slate-900">₹{Number(pendingWip.totalClaimedValue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Proposed Approved Value:</span>
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-900 rounded-lg flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>₹{calculateProposedTotalValue().toLocaleString('en-IN')}</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Lines Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>WIP Line Items Verification</span>
              <span className="text-slate-500 font-normal">Adjust proposed approved quantity as needed</span>
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">WORK ITEM / SCOPE</th>
                    <th className="py-2.5 px-3 text-right">WO QTY</th>
                    <th className="py-2.5 px-3 text-right">PREV APPROVED</th>
                    <th className="py-2.5 px-3 text-right">CLAIMED NOW</th>
                    <th className="py-2.5 px-3 text-right">SITE MEASURED</th>
                    <th className="py-2.5 px-3 text-right w-32">APPROVED QTY *</th>
                    <th className="py-2.5 px-3 text-right">APPROVED VALUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(pendingWip.items || []).map((item: any) => {
                    const id = item.id || item.woItemId;
                    const claimed = Number(item.claimedQty || 0);
                    const measured = Number(item.measuredQty ?? claimed);
                    const appQty = approvedQtyState[id] ?? measured;
                    const rate = Number(item.rate || 0);
                    const lineVal = appQty * rate;

                    const woCalc = metrics.itemCalculations.find(
                      (c) => c.itemId === item.woItemId || c.scopeDescription.toLowerCase() === (item.scopeDescription || '').toLowerCase()
                    );
                    const prevApp = woCalc ? woCalc.cumulativeApprovedQty : Number(item.previouslyApprovedQty || 0);
                    const woQty = woCalc ? woCalc.woQty : Number(item.woQty || 0);

                    return (
                      <tr key={id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{item.scopeDescription}</div>
                          <div className="text-slate-500 text-[11px]">Rate: ₹{rate.toLocaleString('en-IN')} / {item.unitSymbol}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                          {woQty.toLocaleString('en-IN')} <span className="text-slate-500">{item.unitSymbol}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-emerald-700">
                          {prevApp.toLocaleString('en-IN')} <span className="text-slate-500">{item.unitSymbol}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-amber-700">
                          {claimed.toLocaleString('en-IN')} <span className="text-slate-500">{item.unitSymbol}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-blue-700">
                          {measured.toLocaleString('en-IN')} <span className="text-slate-500">{item.unitSymbol}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={appQty}
                            onChange={(e) => handleApprovedQtyChange(id, e.target.value)}
                            className="w-full text-right py-1 px-2 text-xs border border-emerald-400 rounded focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900 bg-emerald-50/50"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ₹{lineVal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks / Rejection Section */}
          {showRejectField ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
              <label className="block text-xs font-bold text-red-900">Reason for Rejection <span className="text-red-600">*</span></label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this WIP claim is being rejected..."
                className="w-full p-2 text-xs border border-red-300 rounded focus:ring-2 focus:ring-red-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRejectField(false)}
                  className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                >
                  Cancel Rejection
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded shadow-xs"
                >
                  Confirm Reject WIP
                </button>
              </div>
            </div>
          ) : null}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowRejectField(true)}
              className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Claim</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve & Update WO Progress</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
