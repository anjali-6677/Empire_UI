/**
 * View Issue Consumptions Modal
 * Location: src/components/inventory/ViewIssueConsumptionsModal.tsx
 */

import React from 'react';
import { MaterialIssue } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { normalizeMaterialIssue } from '../../utils/materialIssueHelpers';
import { getMaterialConsumptionStatusBadge } from '../../utils/statusStyles';
import { X, Flame } from 'lucide-react';
import { Button } from '../ui/Button';

interface ViewIssueConsumptionsModalProps {
  issue: MaterialIssue;
  onClose: () => void;
}

export const ViewIssueConsumptionsModal: React.FC<ViewIssueConsumptionsModalProps> = ({ issue, onClose }) => {
  const { state } = useERPStore();
  const norm = normalizeMaterialIssue(issue);

  const docNum = norm.documentNumber || norm.issueNumber || norm.id;
  const linkedConsumptions = (state.materialConsumptions || []).filter(
    (c: any) => c && (c.originalIssueId === norm.id || c.issueId === norm.id || c.documentNumber === docNum)
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-orange-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Flame className="w-5 h-5 text-orange-100" />
            <div>
              <h2 className="text-sm font-bold">Site Consumption History</h2>
              <p className="text-[11px] text-orange-100">
                Issue #{docNum} | {norm.projectName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-orange-700/50 text-orange-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {linkedConsumptions.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <Flame className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="font-semibold text-stone-600">No Site Consumptions recorded for this issue</p>
            </div>
          ) : (
            linkedConsumptions.map((con) => (
              <div key={con.id} className="border border-stone-200 rounded-lg p-3 space-y-3 bg-stone-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-orange-700 text-sm">{con.documentNumber}</span>
                    <span className="text-stone-400 text-[10px] ml-2">Date: {con.consumptionDate}</span>
                  </div>
                  <div>{getMaterialConsumptionStatusBadge(con.status)}</div>
                </div>

                <div className="text-[11px] text-stone-600">
                  <span className="font-semibold text-stone-800">Recorded By:</span> {con.recordedBy || 'Site Engineer'} |{' '}
                  <span className="font-semibold text-stone-800">Work Package:</span> {(con as any).workPackageName || 'General Work'}
                </div>

                <table className="w-full text-left border-collapse bg-white rounded border border-stone-200">
                  <thead>
                    <tr className="bg-stone-100 text-stone-600 font-semibold text-[10px] uppercase">
                      <th className="py-1.5 px-2">Product</th>
                      <th className="py-1.5 px-2 text-right">Consumed Qty</th>
                      <th className="py-1.5 px-2">Activity Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                    {(con.lines || []).map((l: any) => (
                      <tr key={l.id || l.productId}>
                        <td className="py-1.5 px-2 font-medium">{l.productName || l.productId}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold text-orange-700">
                          {l.consumedQty ?? l.accountedQty ?? 0} {l.unitSymbol}
                        </td>
                        <td className="py-1.5 px-2 text-stone-500 text-[11px]">{l.remarks || l.activityDescription || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
