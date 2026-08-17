/**
 * Record Site Consumption Modal
 * Location: src/components/inventory/RecordSiteConsumptionModal.tsx
 */

import React, { useState } from 'react';
import { MaterialIssue, MaterialConsumption } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { calculateIssueItemTotals, normalizeMaterialIssue } from '../../utils/materialIssueHelpers';
import { X, Flame, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface RecordSiteConsumptionModalProps {
  issue: MaterialIssue;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordSiteConsumptionModal: React.FC<RecordSiteConsumptionModalProps> = ({
  issue,
  onClose,
  onSuccess,
}) => {
  const { state, createMaterialConsumption } = useERPStore();
  const norm = normalizeMaterialIssue(issue);
  const calcs = calculateIssueItemTotals(norm, state.materialReturns || [], state.materialConsumptions || []);

  const [workPackageName, setWorkPackageName] = useState<string>('WP-01 Site Execution');
  const [activityDescription, setActivityDescription] = useState<string>('Material installation & site work execution');
  const [recordedBy, setRecordedBy] = useState<string>('Site Engineer');
  const [remarks, setRemarks] = useState<string>('');

  const [consumedQtys, setConsumedQtys] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    calcs.items.forEach((item) => {
      initial[item.productId] = item.siteBalanceQty;
    });
    return initial;
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleQtyChange = (productId: string, val: string, maxQty: number) => {
    setError(null);
    const num = Math.max(0, Number(val) || 0);
    if (num > maxQty) {
      setError(`Cannot consume more than available site balance (${maxQty}).`);
    }
    setConsumedQtys((prev) => ({
      ...prev,
      [productId]: num,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const activeLines = calcs.items
      .map((item) => {
        const qty = consumedQtys[item.productId] || 0;
        return {
          id: `con-line-${Date.now()}-${item.productId}`,
          issueLineId: item.productId,
          productId: item.productId,
          productCode: item.productId,
          productName: item.productName,
          unitSymbol: item.unitSymbol,
          issuedQty: item.issuedQty,
          consumedQty: qty,
          unitRate: item.unitRate,
          activityDescription,
          remarks,
        };
      })
      .filter((l) => l.consumedQty > 0);

    if (activeLines.length === 0) {
      setError('Please enter consumption quantity for at least one item.');
      return;
    }

    // Validate available site balance
    for (const item of calcs.items) {
      const inputQty = consumedQtys[item.productId] || 0;
      if (inputQty > item.siteBalanceQty) {
        setError(
          `Consumption qty for '${item.productName}' (${inputQty}) exceeds available site balance (${item.siteBalanceQty} ${item.unitSymbol}).`
        );
        return;
      }
    }

    const docCount = (state.materialConsumptions || []).length + 1;
    const documentNumber = `CON-${new Date().getFullYear()}-${docCount.toString().padStart(3, '0')}`;
    const now = new Date().toISOString();

    const consumptionRecord: MaterialConsumption = {
      id: `con-${Date.now()}`,
      documentNumber,
      projectId: norm.projectId,
      projectName: norm.projectName,
      consumptionDate: now.split('T')[0],
      recordedBy,
      lines: activeLines,
      status: 'posted',
      createdAt: now,
      createdBy: recordedBy,
      ...( {
        originalIssueId: norm.id,
        issueId: norm.id,
        workPackageName,
        remarks,
      } as any),
    };

    setIsSubmitting(true);
    const res = createMaterialConsumption(consumptionRecord, recordedBy);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to record site consumption');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-orange-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Flame className="w-5 h-5 text-orange-100" />
            <div>
              <h2 className="text-sm font-bold">Record Site Consumption</h2>
              <p className="text-[11px] text-orange-100">
                Issue #{norm.documentNumber || norm.issueNumber} | {norm.projectName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-orange-700/50 text-orange-100 transition-colors"
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

          {/* Details Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200 text-stone-700">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Project Site</div>
              <div className="font-semibold text-stone-900">{norm.projectName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Site Area</div>
              <div className="font-semibold text-stone-900">{norm.destinationAreaName || norm.destinationStoreName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Date</div>
              <div className="font-semibold text-stone-900">{new Date().toISOString().split('T')[0]}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Item Material</th>
                  <th className="py-2.5 px-3 text-center">UOM</th>
                  <th className="py-2.5 px-3 text-right">Received</th>
                  <th className="py-2.5 px-3 text-right">Prev Consumed</th>
                  <th className="py-2.5 px-3 text-right">Site Balance</th>
                  <th className="py-2.5 px-3 text-right">Consume Now Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                {calcs.items.map((item) => (
                  <tr key={item.productId} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{item.productName}</td>
                    <td className="py-2.5 px-3 text-center text-stone-500 uppercase">{item.unitSymbol}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{item.receivedQty}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-orange-700">{item.consumedQty}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                      {item.siteBalanceQty}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max={item.siteBalanceQty}
                        step="any"
                        value={consumedQtys[item.productId] ?? 0}
                        onChange={(e) => handleQtyChange(item.productId, e.target.value, item.siteBalanceQty)}
                        disabled={item.siteBalanceQty <= 0}
                        className="w-24 px-2 py-1 bg-white border border-stone-300 rounded font-mono font-bold text-right text-stone-900 focus:ring-1 focus:ring-orange-500 outline-none disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Work Package / Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={workPackageName}
                onChange={(e) => setWorkPackageName(e.target.value)}
                placeholder="e.g. WP-01 Interior Fitout"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Activity Description
              </label>
              <input
                type="text"
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                placeholder="e.g. Drywall partition framing"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Recorded By / Engineer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                placeholder="e.g. Vikram Singh (Site Engineer)"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Consumption Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Accounted under Phase 1 BOQ"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-orange-500"
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
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? 'Posting...' : 'Record Site Consumption'}
          </Button>
        </div>
      </div>
    </div>
  );
};
