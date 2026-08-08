/**
 * Create Material Return Page
 * Location: src/pages/inventory/CreateMaterialReturnPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { MaterialReturn } from '../../domain/types';
import { Button } from '../../components/ui/Button';
import {
  RotateCcw,
  ArrowLeft,
  AlertTriangle,
  Boxes,
  Plus,
  Trash2,
} from 'lucide-react';

interface ReturnFormLine {
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  returnedQty: number;
  reusableQty: number;
  scrapQty: number;
  reason?: string;
}

export const CreateMaterialReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, createMaterialReturn } = useERPStore();

  const issues = state.materialIssues || [];
  const projects = state.projects || [];
  const masterProducts = state.products || [];

  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || '');
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [returnedBy, setReturnedBy] = useState<string>('Suresh Nair (Site Supervisor)');
  const [receivedBy, setReceivedBy] = useState<string>('Ramesh Kumar (Storekeeper)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  const [formLines, setFormLines] = useState<ReturnFormLine[]>([
    {
      productId: masterProducts[0]?.id || 'prod-001',
      productCode: masterProducts[0]?.code || 'MAT-PLY-18',
      productName: masterProducts[0]?.name || 'Marine Grade Plywood 18mm',
      unitSymbol: masterProducts[0]?.unitSymbol || 'sheets',
      returnedQty: 5,
      reusableQty: 5,
      scrapQty: 0,
      reason: 'Surplus after work package completion',
    },
  ]);

  const handleAddLine = () => {
    const firstProd = masterProducts[0];
    setFormLines((prev) => [
      ...prev,
      {
        productId: firstProd?.id || `prod-${Date.now()}`,
        productCode: firstProd?.code || 'MAT-GEN',
        productName: firstProd?.name || 'General Material',
        unitSymbol: firstProd?.unitSymbol || 'units',
        returnedQty: 5,
        reusableQty: 5,
        scrapQty: 0,
        reason: '',
      },
    ]);
  };

  const handleQtyChange = (index: number, returned: number, scrap: number) => {
    const updated = [...formLines];
    const ret = Math.max(0, returned);
    const scr = Math.max(0, Math.min(ret, scrap));
    const reusable = Math.max(0, ret - scr);

    updated[index].returnedQty = ret;
    updated[index].scrapQty = scr;
    updated[index].reusableQty = reusable;
    setFormLines(updated);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formLines.length === 0) {
      setErrorMessage('Material Return must contain at least one line item.');
      return;
    }

    const docNum = `RET-${new Date().getFullYear()}-${String((state.materialReturns?.length || 0) + 1).padStart(3, '0')}`;

    const newReturn: MaterialReturn = {
      id: `ret-${Date.now()}`,
      documentNumber: docNum,
      originalIssueId: selectedIssue?.id || 'issue-001',
      originalIssueNumber: selectedIssue?.documentNumber || 'ISSUE-2026-001',
      projectId: selectedIssue?.projectId || projects[0]?.id || 'proj-001',
      projectName: selectedIssue?.projectName || projects[0]?.projectName || 'Project Site',
      returnDate,
      returnedBy,
      receivedBy,
      lines: formLines.map((l: ReturnFormLine, idx: number) => ({
        id: `ret-line-${Date.now()}-${idx}`,
        productId: l.productId,
        productCode: l.productCode,
        productName: l.productName,
        unitSymbol: l.unitSymbol,
        returnedQty: l.returnedQty,
        reusableQty: l.reusableQty,
        scrapQty: l.scrapQty,
        reason: l.reason,
      })),
      status: 'approved',
      createdAt: new Date().toISOString(),
      createdBy: returnedBy,
    };

    const res = createMaterialReturn(newReturn, returnedBy);
    if (res.success) {
      navigate('/inventory/material-movement');
    } else {
      setErrorMessage(res.error || 'Failed to record Material Return.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Back */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/inventory/material-movement')}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Material Movement
        </button>
      </div>

      {/* Header */}
      <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <RotateCcw className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-100">Record Material Return Note</h1>
            <p className="text-stone-400 text-xs mt-0.5">
              Return surplus or damaged materials back to store. Reusable quantities re-credit inventory stock.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitReturn} className="space-y-6">
        {/* Info Card */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
            Return Metadata & Source Issue Reference
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Select Reference Material Issue</label>
              <select
                value={selectedIssueId}
                onChange={(e) => setSelectedIssueId(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium outline-none"
              >
                {issues.length === 0 ? (
                  <option value="">No reference issues available</option>
                ) : (
                  issues.map((iss) => (
                    <option key={iss.id} value={iss.id}>
                      {iss.documentNumber} - {iss.projectName} ({iss.destinationAreaName})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Return Date *</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Returned By (Site Supervisor) *</label>
              <input
                type="text"
                value={returnedBy}
                onChange={(e) => setReturnedBy(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Received By Storekeeper *</label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Lines Card */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-600" />
              Returned Items Breakdown
            </h2>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddLine}
              className="text-xs flex items-center gap-1 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Return Line
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Material Description</th>
                  <th className="py-2.5 px-3 text-right">Total Returned Qty *</th>
                  <th className="py-2.5 px-3 text-right">Reusable Qty (Stock Credit)</th>
                  <th className="py-2.5 px-3 text-right">Scrap / Damaged Qty</th>
                  <th className="py-2.5 px-3">Return Reason</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {formLines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-stone-50 text-stone-800 text-xs">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900">{line.productName}</div>
                      <div className="text-[10px] font-mono text-stone-500">{line.productCode}</div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        min={1}
                        value={line.returnedQty}
                        onChange={(e) => handleQtyChange(idx, Number(e.target.value), line.scrapQty)}
                        className="w-20 p-1.5 bg-stone-50 border border-stone-300 rounded text-right font-bold text-stone-900 outline-none"
                      />
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/50">
                      {line.reusableQty} {line.unitSymbol}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        min={0}
                        max={line.returnedQty}
                        value={line.scrapQty}
                        onChange={(e) => handleQtyChange(idx, line.returnedQty, Number(e.target.value))}
                        className="w-20 p-1.5 bg-rose-50 border border-rose-300 rounded text-right font-bold text-rose-900 outline-none"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="Reason for return"
                        value={line.reason || ''}
                        onChange={(e) => {
                          const updated = [...formLines];
                          updated[idx].reason = e.target.value;
                          setFormLines(updated);
                        }}
                        className="w-full p-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-800 outline-none"
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setFormLines(formLines.filter((_, i) => i !== idx))}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/inventory/material-movement')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-2"
          >
            Post Material Return
          </Button>
        </div>
      </form>
    </div>
  );
};
