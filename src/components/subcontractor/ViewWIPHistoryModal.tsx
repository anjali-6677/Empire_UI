/**
 * View WIP History Modal Component
 * Location: src/components/subcontractor/ViewWIPHistoryModal.tsx
 */

import React from 'react';
import { X, History, HardHat, Calendar, CheckCircle2, Clock, XCircle, ArrowUpRight } from 'lucide-react';
import { SubcontractWorkOrder, SubcontractorWIP } from '../../domain/types';
import { calculateWIPTotalsForWO, normalizeSubcontractWorkOrder } from '../../utils/subcontractorHelpers';

interface ViewWIPHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: SubcontractWorkOrder;
  allWips: SubcontractorWIP[];
  onReviewPendingWip?: (wip: SubcontractorWIP) => void;
}

export const ViewWIPHistoryModal: React.FC<ViewWIPHistoryModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  allWips,
  onReviewPendingWip,
}) => {
  if (!isOpen || !workOrder) return null;

  const normWO = normalizeSubcontractWorkOrder(workOrder);
  const metrics = calculateWIPTotalsForWO(normWO, allWips);
  const linkedWips = metrics.linkedWips;

  const getStatusBadge = (status: string) => {
    const st = (status || '').toLowerCase();
    if (st === 'approved') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Approved</span>
        </span>
      );
    }
    if (st === 'submitted' || st === 'site_verification' || st === 'pending_approval') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Pending Approval</span>
        </span>
      );
    }
    if (st === 'rejected') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <XCircle className="w-3 h-3 text-red-600" />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">WIP Submissions & Progress History</h3>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded">
                  {normWO.documentNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Subcontractor: <span className="font-semibold text-white">{normWO.subcontractorName}</span> · {normWO.projectName}
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

        {/* Progress Overview Bar */}
        <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-6 text-slate-700">
            <div>
              <span className="text-slate-500 font-medium">Total WIP Claims:</span>{' '}
              <span className="font-semibold text-slate-900">{linkedWips.length}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Cumulative Approved Value:</span>{' '}
              <span className="font-bold text-emerald-700">₹{metrics.cumulativeApprovedValue.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Contract Value:</span>{' '}
              <span className="font-semibold text-slate-900">₹{normWO.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-500 font-medium">Overall Progress:</span>
            <div className="flex items-center space-x-2">
              <div className="w-28 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.progressPercent}%` }}
                />
              </div>
              <span className="font-bold text-amber-900 text-xs">{metrics.progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* WIP Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {linkedWips.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <HardHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No WIP Claims Recorded Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Subcontractor progress claims submitted for this Work Order will appear here in chronological order.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {linkedWips.map((wip, idx) => {
                const isPending =
                  (wip.status || '').toLowerCase() === 'submitted' ||
                  (wip.status || '').toLowerCase() === 'site_verification' ||
                  (wip.status || '').toLowerCase() === 'pending_approval';

                return (
                  <div
                    key={wip.id || idx}
                    className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    {/* WIP Card Header */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold text-slate-900 text-xs">{wip.wipNumber || wip.documentNumber}</span>
                        {getStatusBadge(wip.status)}
                        <span className="text-slate-400 text-xs">|</span>
                        <span className="text-xs text-slate-600 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{wip.wipDate || wip.createdAt?.split('T')[0]}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-xs text-right">
                          <span className="text-slate-500">Value: </span>
                          <span className="font-bold text-slate-900">
                            ₹{(Number(wip.totalApprovedValue || wip.totalClaimedValue || 0)).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {isPending && onReviewPendingWip && (
                          <button
                            onClick={() => onReviewPendingWip(wip)}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <span>Review & Approve</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* WIP Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100/60 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">WORK ITEM</th>
                            <th className="py-2 px-3 text-right">WO QTY</th>
                            <th className="py-2 px-3 text-right">PREV APPROVED</th>
                            <th className="py-2 px-3 text-right">CLAIMED</th>
                            <th className="py-2 px-3 text-right">MEASURED</th>
                            <th className="py-2 px-3 text-right">APPROVED QTY</th>
                            <th className="py-2 px-3 text-right">APPROVED VALUE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(wip.items || []).map((item: any, iIdx: number) => {
                            const claimed = Number(item.claimedQty || 0);
                            const measured = Number(item.measuredQty ?? claimed);
                            const appQty = Number(item.approvedQty ?? 0);
                            const rate = Number(item.rate || 0);
                            const appVal = Number(item.approvedValue ?? appQty * rate);

                            return (
                              <tr key={item.id || iIdx} className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-medium text-slate-900">{item.scopeDescription}</td>
                                <td className="py-2 px-3 text-right text-slate-600">
                                  {Number(item.woQty || 0).toLocaleString('en-IN')} {item.unitSymbol}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-600">
                                  {Number(item.previouslyApprovedQty || 0).toLocaleString('en-IN')} {item.unitSymbol}
                                </td>
                                <td className="py-2 px-3 text-right text-amber-700 font-medium">
                                  {claimed.toLocaleString('en-IN')} {item.unitSymbol}
                                </td>
                                <td className="py-2 px-3 text-right text-blue-700 font-medium">
                                  {measured.toLocaleString('en-IN')} {item.unitSymbol}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold text-emerald-800">
                                  {appQty.toLocaleString('en-IN')} {item.unitSymbol}
                                </td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">
                                  ₹{appVal.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {wip.remarks && (
                      <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-600 italic">
                        Notes: {wip.remarks}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
