/**
 * Record Material Return Modal
 * Location: src/components/inventory/RecordMaterialReturnModal.tsx
 */

import React, { useState } from 'react';
import { MaterialIssue, MaterialReturn } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { calculateIssueItemTotals, normalizeMaterialIssue } from '../../utils/materialIssueHelpers';
import { X, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface RecordMaterialReturnModalProps {
  issue: MaterialIssue;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordMaterialReturnModal: React.FC<RecordMaterialReturnModalProps> = ({
  issue,
  onClose,
  onSuccess,
}) => {
  const { state, createMaterialReturn } = useERPStore();
  const norm = normalizeMaterialIssue(issue);
  const calcs = calculateIssueItemTotals(norm, state.materialReturns || [], state.materialConsumptions || []);

  const [returnedBy, setReturnedBy] = useState<string>('Site Supervisor');
  const [returnReason, setReturnReason] = useState<string>('Unused Excess Material');
  const [remarks, setRemarks] = useState<string>('');

  const [returnQtys, setReturnQtys] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    calcs.items.forEach((item) => {
      initial[item.productId] = item.siteBalanceQty;
    });
    return initial;
  });

  const [itemConditions, setItemConditions] = useState<Record<string, 'Reusable' | 'Damaged' | 'Scrap' | 'Requires Inspection'>>(() => {
    const initial: Record<string, any> = {};
    calcs.items.forEach((item) => {
      initial[item.productId] = 'Reusable';
    });
    return initial;
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleQtyChange = (productId: string, val: string, maxQty: number) => {
    setError(null);
    const num = Math.max(0, Number(val) || 0);
    if (num > maxQty) {
      setError(`Cannot return more than available site balance (${maxQty}).`);
    }
    setReturnQtys((prev) => ({
      ...prev,
      [productId]: num,
    }));
  };

  const handleConditionChange = (productId: string, cond: 'Reusable' | 'Damaged' | 'Scrap' | 'Requires Inspection') => {
    setItemConditions((prev) => ({
      ...prev,
      [productId]: cond,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const activeLines = calcs.items
      .map((item) => {
        const rQty = returnQtys[item.productId] || 0;
        const cond = itemConditions[item.productId] || 'Reusable';
        const reusableQty = cond === 'Reusable' ? rQty : 0;
        const damagedQty = cond === 'Damaged' ? rQty : 0;
        const scrapQty = cond === 'Scrap' ? rQty : 0;

        return {
          id: `ret-line-${Date.now()}-${item.productId}`,
          issueLineId: item.productId,
          productId: item.productId,
          productCode: item.productId,
          productName: item.productName,
          unitSymbol: item.unitSymbol,
          originallyIssuedQty: item.issuedQty,
          issuedQty: item.issuedQty,
          returnedQty: rQty,
          returnQty: rQty,
          reusableQty,
          damagedQty,
          scrapQty,
          reason: returnReason,
          remarks: `Condition: ${cond}. ${remarks}`.trim(),
        };
      })
      .filter((l) => l.returnedQty > 0);

    if (activeLines.length === 0) {
      setError('Please enter return quantity for at least one item.');
      return;
    }

    // Guard available balance limits
    for (const item of calcs.items) {
      const inputQty = returnQtys[item.productId] || 0;
      if (inputQty > item.siteBalanceQty) {
        setError(
          `Return qty for '${item.productName}' (${inputQty}) exceeds available site balance (${item.siteBalanceQty} ${item.unitSymbol}).`
        );
        return;
      }
    }

    const docCount = (state.materialReturns || []).length + 1;
    const documentNumber = `RET-${new Date().getFullYear()}-${docCount.toString().padStart(3, '0')}`;
    const now = new Date().toISOString();

    const returnRecord: MaterialReturn = {
      id: `ret-${Date.now()}`,
      documentNumber,
      originalIssueId: norm.id,
      originalIssueNumber: norm.documentNumber || norm.issueNumber,
      projectId: norm.projectId,
      projectName: norm.projectName,
      returnDate: now.split('T')[0],
      returnedBy,
      receivedBy: 'Stores Officer',
      lines: activeLines,
      status: 'approved',
      reason: returnReason,
      createdAt: now,
      createdBy: returnedBy,
    };

    setIsSubmitting(true);
    const res = createMaterialReturn(returnRecord, returnedBy);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to record material return');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-cyan-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <RotateCcw className="w-5 h-5 text-cyan-100" />
            <div>
              <h2 className="text-sm font-bold">Return Material to Stores</h2>
              <p className="text-[11px] text-cyan-100">
                Issue #{norm.documentNumber || norm.issueNumber} | {norm.projectName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-cyan-800/50 text-cyan-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 font-medium text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200 text-stone-700">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Return Source Site</div>
              <div className="font-semibold text-stone-900">{norm.projectName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Receiving Store</div>
              <div className="font-semibold text-stone-900">{norm.sourceLocationName || norm.sourceWarehouseName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Date</div>
              <div className="font-semibold text-stone-900">{new Date().toISOString().split('T')[0]}</div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Item Material</th>
                  <th className="py-2.5 px-3 text-center">UOM</th>
                  <th className="py-2.5 px-3 text-right">Site Balance</th>
                  <th className="py-2.5 px-3 text-right">Return Qty</th>
                  <th className="py-2.5 px-3">Material Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                {calcs.items.map((item) => (
                  <tr key={item.productId} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{item.productName}</td>
                    <td className="py-2.5 px-3 text-center text-stone-500 uppercase">{item.unitSymbol}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                      {item.siteBalanceQty}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max={item.siteBalanceQty}
                        step="any"
                        value={returnQtys[item.productId] ?? 0}
                        onChange={(e) => handleQtyChange(item.productId, e.target.value, item.siteBalanceQty)}
                        disabled={item.siteBalanceQty <= 0}
                        className="w-24 px-2 py-1 bg-white border border-stone-300 rounded font-mono font-bold text-right text-stone-900 focus:ring-1 focus:ring-cyan-500 outline-none disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={itemConditions[item.productId] || 'Reusable'}
                        onChange={(e) =>
                          handleConditionChange(
                            item.productId,
                            e.target.value as 'Reusable' | 'Damaged' | 'Scrap' | 'Requires Inspection'
                          )
                        }
                        className="w-full p-1 bg-white border border-stone-300 rounded text-stone-800 text-xs outline-none focus:border-cyan-500"
                      >
                        <option value="Reusable">Reusable (Adds Stock Back)</option>
                        <option value="Damaged">Damaged (Site Salvage)</option>
                        <option value="Scrap">Scrap Material</option>
                        <option value="Requires Inspection">Requires QC Inspection</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Return Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-cyan-500"
              >
                <option value="Unused Excess Material">Unused Excess Material</option>
                <option value="Defective / Damaged">Defective / Damaged Material</option>
                <option value="Wrong Specification">Wrong Specification Issued</option>
                <option value="Project Completed">Project Work Package Completed</option>
                <option value="Other">Other Reason</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Returned By / Supervisor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={returnedBy}
                onChange={(e) => setReturnedBy(e.target.value)}
                placeholder="e.g. Suresh Patel (Site Supervisor)"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Return Remarks & Notes
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Returned 2 unused plywood sheets after partition completion"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-end space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold px-4 py-2 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? 'Recording...' : 'Confirm Material Return'}
          </Button>
        </div>
      </div>
    </div>
  );
};
