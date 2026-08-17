/**
 * Work Order Details Modal Component
 * Location: src/components/subcontractor/WorkOrderDetailsModal.tsx
 */

import React from 'react';
import { X, Hammer, Download, Printer, HardHat, History } from 'lucide-react';
import { SubcontractWorkOrder, SubcontractorWIP } from '../../domain/types';
import { calculateWIPTotalsForWO, normalizeSubcontractWorkOrder } from '../../utils/subcontractorHelpers';

interface WorkOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: SubcontractWorkOrder;
  allWips: SubcontractorWIP[];
  onRecordWIP?: () => void;
  onViewWIPHistory?: () => void;
  onDownloadPDF?: () => void;
  onPrint?: () => void;
}

export const WorkOrderDetailsModal: React.FC<WorkOrderDetailsModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  allWips,
  onRecordWIP,
  onViewWIPHistory,
  onDownloadPDF,
  onPrint,
}) => {
  if (!isOpen || !workOrder) return null;

  const normWO = normalizeSubcontractWorkOrder(workOrder);
  const metrics = calculateWIPTotalsForWO(normWO, allWips);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{normWO.documentNumber}</h3>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {normWO.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300">{normWO.workCategory || 'Subcontract Work Order'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onDownloadPDF && (
              <button
                onClick={onDownloadPDF}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            )}
            {onPrint && (
              <button
                onClick={onPrint}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI & Metadata Ribbon */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Project & Site:</span>
            <span className="font-semibold text-slate-900">{normWO.projectName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Subcontractor:</span>
            <span className="font-semibold text-slate-900">{normWO.subcontractorName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Contract Value:</span>
            <span className="font-bold text-slate-900">₹{normWO.grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Verified Progress:</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${metrics.progressPercent}%` }} />
              </div>
              <span className="font-bold text-amber-900">{metrics.progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Dates & Commercial Terms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block">Start Date:</span>
              <span className="font-medium text-slate-800">{normWO.startDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Target Completion Date:</span>
              <span className="font-medium text-slate-800">{normWO.completionDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment / Retention Terms:</span>
              <span className="font-medium text-slate-800">
                Retention: {normWO.retentionPercentage || 5}% · Advance: {normWO.advancePercentage || 0}%
              </span>
            </div>
          </div>

          {/* Items & Work Scope Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Scope of Work & Unit Rates</h4>
            <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">WORK DESCRIPTION</th>
                    <th className="py-2.5 px-3 text-right">WO QTY</th>
                    <th className="py-2.5 px-3 text-right">RATE</th>
                    <th className="py-2.5 px-3 text-right">APPROVED WIP QTY</th>
                    <th className="py-2.5 px-3 text-right">REMAINING QTY</th>
                    <th className="py-2.5 px-3 text-right">TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {metrics.itemCalculations.map((itemCalc, idx) => (
                    <tr key={itemCalc.itemId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{itemCalc.scopeDescription}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                        {itemCalc.woQty.toLocaleString('en-IN')} <span className="text-slate-500">{itemCalc.unitSymbol}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                        ₹{itemCalc.rate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                        {itemCalc.cumulativeApprovedQty.toLocaleString('en-IN')} <span className="text-slate-500">{itemCalc.unitSymbol}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-amber-700">
                        {itemCalc.remainingQty.toLocaleString('en-IN')} <span className="text-slate-500">{itemCalc.unitSymbol}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{itemCalc.lineTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/70 border-t border-slate-300 font-bold text-slate-900">
                  <tr>
                    <td colSpan={6} className="py-2.5 px-3 text-right">Subtotal:</td>
                    <td className="py-2.5 px-3 text-right">₹{normWO.subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                  {normWO.taxTotal > 0 && (
                    <tr>
                      <td colSpan={6} className="py-2.5 px-3 text-right font-semibold text-slate-600">GST / Tax:</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700">₹{normWO.taxTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  <tr className="text-sm bg-slate-200/60">
                    <td colSpan={6} className="py-2.5 px-3 text-right">Grand Total Work Order Value:</td>
                    <td className="py-2.5 px-3 text-right text-amber-900">₹{normWO.grandTotal.toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
              {onViewWIPHistory && (
                <button
                  onClick={onViewWIPHistory}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View Full WIP History ({metrics.linkedWips.length})</span>
                </button>
              )}
            </div>

            {onRecordWIP && normWO.status !== 'cancelled' && normWO.status !== 'completed' && (
              <button
                onClick={onRecordWIP}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center space-x-2"
              >
                <HardHat className="w-4 h-4" />
                <span>Record New WIP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
