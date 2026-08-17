/**
 * Record Site Receipt Modal
 * Location: src/components/inventory/RecordSiteReceiptModal.tsx
 */

import React, { useState } from 'react';
import { MaterialIssue } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { calculateIssueItemTotals, normalizeMaterialIssue } from '../../utils/materialIssueHelpers';
import { X, CheckCircle, PackageCheck, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface RecordSiteReceiptModalProps {
  issue: MaterialIssue;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordSiteReceiptModal: React.FC<RecordSiteReceiptModalProps> = ({
  issue,
  onClose,
  onSuccess,
}) => {
  const { state, recordSiteReceipt } = useERPStore();
  const norm = normalizeMaterialIssue(issue);
  const calcs = calculateIssueItemTotals(norm, state.materialReturns || [], state.materialConsumptions || []);

  const [receiverName, setReceiverName] = useState<string>(norm.receiverName || 'Site Storekeeper');
  const [remarks, setRemarks] = useState<string>('');
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    calcs.items.forEach((item) => {
      const remainingInTransit = Math.max(0, item.issuedQty - item.receivedQty);
      initial[item.productId] = remainingInTransit;
    });
    return initial;
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleQtyChange = (productId: string, val: string, maxQty: number) => {
    setError(null);
    const num = Math.max(0, Number(val) || 0);
    if (num > maxQty) {
      setError(`Cannot receive more than remaining dispatched quantity (${maxQty}).`);
    }
    setReceiveQtys((prev) => ({
      ...prev,
      [productId]: num,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const receipts = Object.entries(receiveQtys).map(([productId, receiveNowQty]) => ({
      productId,
      receiveNowQty,
    }));

    const totalReceivingNow = receipts.reduce((sum, r) => sum + r.receiveNowQty, 0);
    if (totalReceivingNow <= 0) {
      setError('Please enter at least 1 item quantity to receive.');
      return;
    }

    // Guard max limits
    for (const item of calcs.items) {
      const remainingInTransit = Math.max(0, item.issuedQty - item.receivedQty);
      const inputQty = receiveQtys[item.productId] || 0;
      if (inputQty > remainingInTransit) {
        setError(`Quantity entered for '${item.productName}' (${inputQty}) exceeds remaining dispatched stock (${remainingInTransit} ${item.unitSymbol}).`);
        return;
      }
    }

    setIsSubmitting(true);
    const res = recordSiteReceipt(norm.id, receipts, receiverName, remarks);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to record site receipt');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <PackageCheck className="w-5 h-5 text-amber-100" />
            <div>
              <h2 className="text-sm font-bold">Record Site Receipt</h2>
              <p className="text-[11px] text-amber-100">
                Issue #{norm.documentNumber || norm.issueNumber} | {norm.projectName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-amber-700/50 text-amber-100 transition-colors"
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
              <div className="text-[10px] uppercase font-bold text-stone-400">Source Store</div>
              <div className="font-semibold text-stone-900">{norm.sourceLocationName || norm.sourceWarehouseName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Destination Site Store</div>
              <div className="font-semibold text-stone-900">{norm.destinationAreaName || norm.destinationStoreName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Issued Date</div>
              <div className="font-semibold text-stone-900">{norm.issueDate || 'N/A'}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Item Material</th>
                  <th className="py-2.5 px-3 text-center">UOM</th>
                  <th className="py-2.5 px-3 text-right">Dispatched</th>
                  <th className="py-2.5 px-3 text-right">Previously Received</th>
                  <th className="py-2.5 px-3 text-right">Receive Now Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                {calcs.items.map((item) => {
                  const remaining = Math.max(0, item.issuedQty - item.receivedQty);
                  return (
                    <tr key={item.productId} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-900">{item.productName}</td>
                      <td className="py-2.5 px-3 text-center text-stone-500 uppercase">{item.unitSymbol}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">{item.issuedQty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{item.receivedQty}</td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          max={remaining}
                          step="any"
                          value={receiveQtys[item.productId] ?? 0}
                          onChange={(e) => handleQtyChange(item.productId, e.target.value, remaining)}
                          disabled={remaining <= 0}
                          className="w-24 px-2 py-1 bg-white border border-stone-300 rounded font-mono font-bold text-right text-stone-900 focus:ring-1 focus:ring-amber-500 outline-none disabled:bg-stone-100 disabled:text-stone-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Received By / Storekeeper <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="e.g. Ramesh Kumar (Site Storekeeper)"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Receipt Remarks / Vehicle Condition
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Received in good condition, seal intact"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-amber-500"
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
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? 'Recording...' : 'Confirm Site Receipt'}
          </Button>
        </div>
      </div>
    </div>
  );
};
