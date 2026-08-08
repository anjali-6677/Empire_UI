/**
 * Create Material Consumption Page
 * Location: src/pages/inventory/CreateMaterialConsumptionPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { MaterialConsumption } from '../../domain/types';
import { Button } from '../../components/ui/Button';
import {
  Flame,
  ArrowLeft,
  AlertTriangle,
  Boxes,
  Plus,
  Trash2,
} from 'lucide-react';

interface ConsumptionFormLine {
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  consumedQty: number;
  wipReference?: string;
  notes?: string;
}

export const CreateMaterialConsumptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, createMaterialConsumption } = useERPStore();

  const projects = state.projects || [];
  const masterProducts = state.products || [];

  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [workPackageName, setWorkPackageName] = useState<string>('Interior Wall Panel Installation');
  const [consumptionDate, setConsumptionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [recordedBy, setRecordedBy] = useState<string>('Anand Verma (Site Engineer)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formLines, setFormLines] = useState<ConsumptionFormLine[]>([
    {
      productId: masterProducts[0]?.id || 'prod-001',
      productCode: masterProducts[0]?.code || 'MAT-PLY-18',
      productName: masterProducts[0]?.name || 'Marine Grade Plywood 18mm',
      unitSymbol: masterProducts[0]?.unitSymbol || 'sheets',
      consumedQty: 12,
      wipReference: 'WIP-WALL-SEC-01',
      notes: 'Consumed for Block A Reception framing',
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
        consumedQty: 10,
        wipReference: 'WIP-SEC-02',
        notes: '',
      },
    ]);
  };

  const handleQtyChange = (index: number, val: number) => {
    const updated = [...formLines];
    updated[index].consumedQty = Math.max(0, val);
    setFormLines(updated);
  };

  const handleSubmitConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!projectId) {
      setErrorMessage('Please select a target Project.');
      return;
    }

    if (formLines.length === 0) {
      setErrorMessage('Material Consumption must contain at least one line item.');
      return;
    }

    for (const line of formLines) {
      if (line.consumedQty <= 0) {
        setErrorMessage(`Consumed quantity for ${line.productName} must be greater than 0.`);
        return;
      }
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    const docNum = `CON-${new Date().getFullYear()}-${String((state.materialConsumptions?.length || 0) + 1).padStart(3, '0')}`;

    const newConsumption: MaterialConsumption = {
      id: `con-${Date.now()}`,
      documentNumber: docNum,
      projectId,
      projectName: selectedProj?.projectName || 'Project Site',
      locationId: 'loc-dest-001',
      locationName: 'Site Work Package',
      workPackageId: 'wp-001',
      workPackageName,
      consumptionDate,
      recordedBy,
      lines: formLines.map((l: ConsumptionFormLine, idx: number) => ({
        id: `con-line-${Date.now()}-${idx}`,
        productId: l.productId,
        productCode: l.productCode,
        productName: l.productName,
        unitSymbol: l.unitSymbol,
        consumedQty: l.consumedQty,
        unitRate: 0,
        wipReference: l.wipReference,
        notes: l.notes,
      })),
      status: 'posted',
      createdAt: new Date().toISOString(),
      createdBy: recordedBy,
    };

    const res = createMaterialConsumption(newConsumption, recordedBy);
    if (res.success) {
      navigate('/inventory/material-movement');
    } else {
      setErrorMessage(res.error || 'Failed to record Material Consumption.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Back Button */}
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
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-100">Record Site Material Consumption</h1>
            <p className="text-stone-400 text-xs mt-0.5">
              Record physical material consumption against project work packages. Deducts destination stock balance.
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

      <form onSubmit={handleSubmitConsumption} className="space-y-6">
        {/* Info Card */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
            Work Package & Consumption Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Target Project *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName || p.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Work Package / Task Name *</label>
              <input
                type="text"
                value={workPackageName}
                onChange={(e) => setWorkPackageName(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Consumption Date *</label>
              <input
                type="date"
                value={consumptionDate}
                onChange={(e) => setConsumptionDate(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Recorded By (Site Engineer) *</label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
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
              <Boxes className="w-4 h-4 text-orange-600" />
              Consumed Material Quantities
            </h2>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddLine}
              className="text-xs flex items-center gap-1 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Consumption Line
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Material Description</th>
                  <th className="py-2.5 px-3 text-right">Consumed Qty *</th>
                  <th className="py-2.5 px-3">WIP / BOQ Item Ref</th>
                  <th className="py-2.5 px-3">Notes</th>
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
                        value={line.consumedQty}
                        onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                        className="w-24 p-1.5 bg-stone-50 border border-stone-300 rounded text-right font-bold text-stone-900 outline-none"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="WIP Ref / BOQ Line"
                        value={line.wipReference || ''}
                        onChange={(e) => {
                          const updated = [...formLines];
                          updated[idx].wipReference = e.target.value;
                          setFormLines(updated);
                        }}
                        className="w-full p-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-800 outline-none"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="Consumption notes"
                        value={line.notes || ''}
                        onChange={(e) => {
                          const updated = [...formLines];
                          updated[idx].notes = e.target.value;
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
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2"
          >
            Post Material Consumption
          </Button>
        </div>
      </form>
    </div>
  );
};
