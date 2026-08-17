/**
 * View Issue Returns Modal
 * Location: src/components/inventory/ViewIssueReturnsModal.tsx
 */

import React from 'react';
import { MaterialIssue } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { normalizeMaterialIssue } from '../../utils/materialIssueHelpers';
import { getMaterialReturnStatusBadge } from '../../utils/statusStyles';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ViewIssueReturnsModalProps {
  issue: MaterialIssue;
  onClose: () => void;
}

export const ViewIssueReturnsModal: React.FC<ViewIssueReturnsModalProps> = ({ issue, onClose }) => {
  const { state } = useERPStore();
  const norm = normalizeMaterialIssue(issue);

  const docNum = norm.documentNumber || norm.issueNumber || norm.id;
  const linkedReturns = (state.materialReturns || []).filter(
    (r: any) => r && (r.originalIssueId === norm.id || r.originalIssueNumber === docNum || r.issueId === norm.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-cyan-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <RotateCcw className="w-5 h-5 text-cyan-100" />
            <div>
              <h2 className="text-sm font-bold">Material Returns History</h2>
              <p className="text-[11px] text-cyan-100">
                Issue #{docNum} | {norm.projectName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-cyan-800/50 text-cyan-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {linkedReturns.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <RotateCcw className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="font-semibold text-stone-600">No Material Returns recorded for this issue</p>
            </div>
          ) : (
            linkedReturns.map((ret) => (
              <div key={ret.id} className="border border-stone-200 rounded-lg p-3 space-y-3 bg-stone-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-cyan-700 text-sm">{ret.documentNumber}</span>
                    <span className="text-stone-400 text-[10px] ml-2">Date: {ret.returnDate}</span>
                  </div>
                  <div>{getMaterialReturnStatusBadge(ret.status)}</div>
                </div>

                <div className="text-[11px] text-stone-600">
                  <span className="font-semibold text-stone-800">Returned By:</span> {ret.returnedBy || 'Site Supervisor'} |{' '}
                  <span className="font-semibold text-stone-800">Reason:</span> {ret.reason || 'Excess Material'}
                </div>

                <table className="w-full text-left border-collapse bg-white rounded border border-stone-200">
                  <thead>
                    <tr className="bg-stone-100 text-stone-600 font-semibold text-[10px] uppercase">
                      <th className="py-1.5 px-2">Product</th>
                      <th className="py-1.5 px-2 text-right">Return Qty</th>
                      <th className="py-1.5 px-2 text-right">Reusable Qty</th>
                      <th className="py-1.5 px-2 text-right">Damaged Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                    {(ret.lines || []).map((l: any) => (
                      <tr key={l.id || l.productId}>
                        <td className="py-1.5 px-2 font-medium">{l.productName || l.productId}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold text-cyan-700">{l.returnedQty ?? l.returnQty ?? 0} {l.unitSymbol}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-emerald-700">{l.reusableQty || 0}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-rose-600">{l.damagedQty || 0}</td>
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
