/**
 * Record WIP Modal Component
 * Location: src/components/subcontractor/RecordWIPModal.tsx
 */

import React, { useState } from 'react';
import { X, HardHat, Calendar, User, FileText, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { SubcontractWorkOrder, SubcontractorWIP } from '../../domain/types';
import { calculateWIPTotalsForWO, normalizeSubcontractWorkOrder } from '../../utils/subcontractorHelpers';

interface RecordWIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: SubcontractWorkOrder;
  allWips: SubcontractorWIP[];
  onSubmitWIP: (wipData: SubcontractorWIP) => { success: boolean; error?: string };
}

export const RecordWIPModal: React.FC<RecordWIPModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  allWips,
  onSubmitWIP,
}) => {
  if (!isOpen || !workOrder) return null;

  const normWO = normalizeSubcontractWorkOrder(workOrder);
  const metrics = calculateWIPTotalsForWO(normWO, allWips);

  // Generate canonical WIP Number
  const existingWIPCount = metrics.linkedWips.length;
  const nextWIPSeq = String(existingWIPCount + 1).padStart(3, '0');
  const generatedWIPNumber = `WIP-2026-${nextWIPSeq}`;

  const [wipDate, setWipDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [siteEngineerName, setSiteEngineerName] = useState<string>('Amit Verma');
  const [measurementReference, setMeasurementReference] = useState<string>('');
  const [generalRemarks, setGeneralRemarks] = useState<string>('');

  // Track claimed & measured quantities per item
  const [itemStates, setItemStates] = useState<
    Record<
      string,
      {
        claimedQty: number;
        measuredQty: number;
        remarks: string;
      }
    >
  >(() => {
    const initial: Record<string, any> = {};
    metrics.itemCalculations.forEach((item) => {
      initial[item.itemId] = {
        claimedQty: 0,
        measuredQty: 0,
        remarks: '',
      };
    });
    return initial;
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQtyChange = (itemId: string, field: 'claimedQty' | 'measuredQty', value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: num,
      },
    }));
  };

  const handleRemarkChange = (itemId: string, val: string) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        remarks: val,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate that at least one item has claimed quantity > 0
    const hasAnyClaim = Object.values(itemStates).some((st) => st.claimedQty > 0);
    if (!hasAnyClaim) {
      setErrorMsg('Please enter a claimed quantity greater than 0 for at least one work item.');
      return;
    }

    // Check remaining quantity limits
    for (const itemCalc of metrics.itemCalculations) {
      const st = itemStates[itemCalc.itemId];
      if (st && st.claimedQty > itemCalc.remainingQty) {
        setErrorMsg(
          `Claimed quantity (${st.claimedQty} ${itemCalc.unitSymbol}) exceeds remaining WO quantity (${itemCalc.remainingQty} ${itemCalc.unitSymbol}) for "${itemCalc.scopeDescription}".`
        );
        return;
      }
    }

    const totalClaimedVal = metrics.itemCalculations.reduce((sum, itemCalc) => {
      const st = itemStates[itemCalc.itemId];
      const qty = st ? st.claimedQty : 0;
      return sum + qty * itemCalc.rate;
    }, 0);

    const wipItems = metrics.itemCalculations.map((itemCalc) => {
      const st = itemStates[itemCalc.itemId] || { claimedQty: 0, measuredQty: 0, remarks: '' };
      return {
        id: `wip-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        woItemId: itemCalc.itemId,
        scopeDescription: itemCalc.scopeDescription,
        unitSymbol: itemCalc.unitSymbol,
        unit: itemCalc.unitSymbol,
        woQty: itemCalc.woQty,
        previouslyApprovedQty: itemCalc.cumulativeApprovedQty,
        claimedQty: st.claimedQty,
        measuredQty: st.measuredQty || st.claimedQty,
        approvedQty: 0,
        remainingWOQty: Math.max(0, itemCalc.remainingQty - st.claimedQty),
        rate: itemCalc.rate,
        approvedValue: 0,
        remarks: st.remarks,
      };
    });

    const newWIP: SubcontractorWIP = {
      id: `wip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      wipNumber: generatedWIPNumber,
      documentNumber: generatedWIPNumber,
      workOrderId: normWO.id,
      woNumber: normWO.documentNumber,
      projectId: normWO.projectId,
      projectName: normWO.projectName,
      subcontractorId: normWO.subcontractorId,
      subcontractorName: normWO.subcontractorName,
      wipDate,
      siteEngineerName,
      measurementReference,
      remarks: generalRemarks,
      items: wipItems,
      totalClaimedValue: totalClaimedVal,
      totalApprovedValue: 0,
      status: 'submitted',
      createdBy: siteEngineerName,
      createdAt: new Date().toISOString(),
    };

    const res = onSubmitWIP(newWIP);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to submit WIP measurement.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Record Subcontractor WIP</h3>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded">
                  {generatedWIPNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                WO: <span className="font-mono text-amber-200">{normWO.documentNumber}</span> · {normWO.subcontractorName}
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

        {/* WO Summary Banner */}
        <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-6 text-slate-700">
            <div>
              <span className="text-slate-500 font-medium">Project:</span>{' '}
              <span className="font-semibold">{normWO.projectName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">WO Value:</span>{' '}
              <span className="font-semibold text-slate-900">₹{normWO.grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Approved WIP to Date:</span>{' '}
              <span className="font-semibold text-emerald-700">₹{metrics.cumulativeApprovedValue.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">WO Progress:</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 rounded-full">
              {metrics.progressPercent}%
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Meta Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WIP Submission Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  value={wipDate}
                  onChange={(e) => setWipDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site Engineer / Measured By <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={siteEngineerName}
                  onChange={(e) => setSiteEngineerName(e.target.value)}
                  placeholder="e.g. Amit Verma"
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Measurement Sheet / Ref #
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={measurementReference}
                  onChange={(e) => setMeasurementReference(e.target.value)}
                  placeholder="e.g. MS-BLK-A-FL4"
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Work Order Items Line Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Work Order Line Items & Measurement Claims</span>
              <span className="text-slate-500 font-normal">Only approved WIP updates progress</span>
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">WORK ITEM / SCOPE</th>
                    <th className="py-2.5 px-3 text-right">WO QTY</th>
                    <th className="py-2.5 px-3 text-right">PREV APPROVED</th>
                    <th className="py-2.5 px-3 text-right">REMAINING</th>
                    <th className="py-2.5 px-3 text-right w-28">CLAIMED NOW *</th>
                    <th className="py-2.5 px-3 text-right w-28">SITE MEASURED</th>
                    <th className="py-2.5 px-3 w-40">REMARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {metrics.itemCalculations.map((itemCalc) => {
                    const st = itemStates[itemCalc.itemId] || { claimedQty: 0, measuredQty: 0, remarks: '' };
                    return (
                      <tr key={itemCalc.itemId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{itemCalc.scopeDescription}</div>
                          <div className="text-slate-500 text-[11px]">
                            Rate: ₹{itemCalc.rate.toLocaleString('en-IN')} / {itemCalc.unitSymbol}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-800 whitespace-nowrap">
                          {itemCalc.woQty.toLocaleString('en-IN')} <span className="text-slate-500">{itemCalc.unitSymbol}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-emerald-700 whitespace-nowrap">
                          {itemCalc.cumulativeApprovedQty.toLocaleString('en-IN')} <span className="text-slate-500">{itemCalc.unitSymbol}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-amber-700 whitespace-nowrap">
                          {itemCalc.remainingQty.toLocaleString('en-IN')} <span className="text-slate-500">{itemCalc.unitSymbol}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            max={itemCalc.remainingQty}
                            step="any"
                            value={st.claimedQty || ''}
                            onChange={(e) => handleQtyChange(itemCalc.itemId, 'claimedQty', e.target.value)}
                            placeholder="0"
                            className="w-full text-right py-1 px-2 text-xs border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold text-amber-900"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={st.measuredQty || ''}
                            onChange={(e) => handleQtyChange(itemCalc.itemId, 'measuredQty', e.target.value)}
                            placeholder={st.claimedQty ? String(st.claimedQty) : '0'}
                            className="w-full text-right py-1 px-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={st.remarks}
                            onChange={(e) => handleRemarkChange(itemCalc.itemId, e.target.value)}
                            placeholder="Optional notes"
                            className="w-full py-1 px-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-slate-400"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">General WIP Notes & Site Conditions</label>
            <textarea
              rows={2}
              value={generalRemarks}
              onChange={(e) => setGeneralRemarks(e.target.value)}
              placeholder="Add any additional site observations or notes..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Workflow Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2 text-xs text-blue-800">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Verification & Approval Required</p>
              <p className="text-blue-700">
                Submitting this WIP will create status <span className="font-bold">Pending Verification</span>. It must be site-verified and approved by an authorized manager before progress and billable values are updated.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit WIP for Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
