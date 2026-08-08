/**
 * Create Material Issue Page
 * Location: src/pages/inventory/CreateMaterialIssuePage.tsx
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { MaterialIssue } from '../../domain/types';
import { Button } from '../../components/ui/Button';
import {
  Truck,
  ArrowLeft,
  AlertTriangle,
  Boxes,
  Plus,
  Trash2,
} from 'lucide-react';

interface IssueFormLine {
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  requestedQty: number;
  issuedQty: number;
  availableStock: number;
  notes?: string;
}

export const CreateMaterialIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, createMaterialIssue } = useERPStore();

  const projects = state.projects || [];
  const stockLedger = state.stockLedger || [];
  const locations = (state as any).locations || [
    { id: 'loc-001', name: 'Central Site Store - Basement 1' },
    { id: 'loc-002', name: 'Secondary Store Yard' },
  ];

  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [sourceLocationId, setSourceLocationId] = useState<string>(locations[0]?.id || 'loc-001');
  const [destinationAreaName, setDestinationAreaName] = useState<string>('Block A - Floor 4 Work Package');
  const [issuedBy, setIssuedBy] = useState<string>('Ramesh Kumar (Storekeeper)');
  const [receivedByPerson, setReceivedByPerson] = useState<string>('Suresh Nair (Site Supervisor)');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute Available Stock per Product at selected source location
  const availableStockMap = useMemo(() => {
    const map = new Map<string, { productCode: string; productName: string; unitSymbol: string; available: number }>();

    stockLedger.forEach((entry) => {
      if (entry.locationId === sourceLocationId) {
        const existing = map.get(entry.productId) || {
          productCode: entry.productCode,
          productName: entry.productName,
          unitSymbol: entry.unitSymbol || 'units',
          available: 0,
        };
        existing.available += (entry.inQuantity || 0) - (entry.outQuantity || 0);
        map.set(entry.productId, existing);
      }
    });

    return map;
  }, [stockLedger, sourceLocationId]);

  const availableProductsList = useMemo(() => {
    return Array.from(availableStockMap.entries()).map(([prodId, info]) => ({
      id: prodId,
      ...info,
    }));
  }, [availableStockMap]);

  const [formLines, setFormLines] = useState<IssueFormLine[]>([]);

  const handleAddLine = () => {
    if (availableProductsList.length === 0) {
      setErrorMessage('No stock available at the selected source location.');
      return;
    }

    const firstProd = availableProductsList[0];
    setFormLines((prev) => [
      ...prev,
      {
        productId: firstProd.id,
        productCode: firstProd.productCode,
        productName: firstProd.productName,
        unitSymbol: firstProd.unitSymbol,
        requestedQty: 10,
        issuedQty: 10,
        availableStock: Math.max(0, firstProd.available),
        notes: '',
      },
    ]);
  };

  const handleProductChange = (index: number, prodId: string) => {
    const prodInfo = availableStockMap.get(prodId);
    if (!prodInfo) return;

    const updated = [...formLines];
    updated[index] = {
      ...updated[index],
      productId: prodId,
      productCode: prodInfo.productCode,
      productName: prodInfo.productName,
      unitSymbol: prodInfo.unitSymbol,
      availableStock: Math.max(0, prodInfo.available),
    };
    setFormLines(updated);
  };

  const handleQtyChange = (index: number, val: number) => {
    const updated = [...formLines];
    const qty = Math.max(0, val);
    updated[index].issuedQty = qty;
    updated[index].requestedQty = qty;
    setFormLines(updated);
  };

  const handleRemoveLine = (index: number) => {
    setFormLines(formLines.filter((_, i) => i !== index));
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!projectId) {
      setErrorMessage('Please select a target Project.');
      return;
    }

    if (formLines.length === 0) {
      setErrorMessage('Please add at least one material line to issue.');
      return;
    }

    // Guard: Validate stock availability
    for (const line of formLines) {
      if (line.issuedQty <= 0) {
        setErrorMessage(`Issued quantity for ${line.productName} must be greater than 0.`);
        return;
      }
      if (line.issuedQty > line.availableStock) {
        setErrorMessage(
          `Stock Guard Violation: Cannot issue ${line.issuedQty} ${line.unitSymbol} of ${line.productName}. Available stock at source is only ${line.availableStock}.`
        );
        return;
      }
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    const selectedSourceLoc = locations.find((l: any) => l.id === sourceLocationId);
    const docNum = `ISSUE-${new Date().getFullYear()}-${String((state.materialIssues?.length || 0) + 1).padStart(3, '0')}`;

    const newIssue: MaterialIssue = {
      id: `issue-${Date.now()}`,
      documentNumber: docNum,
      projectId,
      projectName: selectedProj?.projectName || 'Project Site',
      sourceLocationId,
      sourceLocationName: selectedSourceLoc?.name || 'Central Store',
      destinationLocationId: 'loc-dest-001',
      destinationAreaName,
      issueDate,
      issuedBy,
      receiverName: receivedByPerson,
      status: 'issued',
      lines: formLines.map((l: IssueFormLine, idx: number) => ({
        id: `issue-line-${Date.now()}-${idx}`,
        productId: l.productId,
        productCode: l.productCode,
        productName: l.productName,
        unitSymbol: l.unitSymbol,
        requestedQty: l.requestedQty,
        issuedQty: l.issuedQty,
        unitRate: 0,
        notes: l.notes,
      })),
      createdAt: new Date().toISOString(),
      createdBy: issuedBy,
    };

    const res = createMaterialIssue(newIssue, issuedBy);
    if (res.success) {
      navigate('/inventory/material-movement');
    } else {
      setErrorMessage(res.error || 'Failed to record Material Issue.');
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
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Truck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-100">Create Material Issue Note</h1>
            <p className="text-stone-400 text-xs mt-0.5">
              Transfer material stock from central store yard to project work package areas.
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

      <form onSubmit={handleSubmitIssue} className="space-y-6">
        {/* Issue Details Card */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
            Issue & Destination Information
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
              <label className="block text-stone-700 font-semibold mb-1">Source Store Location *</label>
              <select
                value={sourceLocationId}
                onChange={(e) => setSourceLocationId(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 outline-none"
              >
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Destination Area / Work Package *</label>
              <input
                type="text"
                value={destinationAreaName}
                onChange={(e) => setDestinationAreaName(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Issue Date *</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Issued By *</label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Received By (Site Supervisor) *</label>
              <input
                type="text"
                value={receivedByPerson}
                onChange={(e) => setReceivedByPerson(e.target.value)}
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
              <Boxes className="w-4 h-4 text-amber-600" />
              Materials to Issue
            </h2>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddLine}
              className="text-xs flex items-center gap-1 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Material Line
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Select Material</th>
                  <th className="py-2.5 px-3 text-right">Available Stock at Source</th>
                  <th className="py-2.5 px-3 text-right">Issue Qty *</th>
                  <th className="py-2.5 px-3">Remarks</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {formLines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400 font-medium">
                      Click "+ Add Material Line" to select items available at the source store.
                    </td>
                  </tr>
                ) : (
                  formLines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-3 px-3">
                        <select
                          value={line.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full p-1.5 bg-stone-50 border border-stone-300 rounded font-semibold text-stone-900 text-xs outline-none"
                        >
                          {availableProductsList.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.productName} ({prod.productCode})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                        {line.availableStock} {line.unitSymbol}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min={1}
                          max={line.availableStock}
                          value={line.issuedQty}
                          onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                          className="w-24 p-1.5 bg-stone-50 border border-stone-300 rounded text-right font-bold text-stone-900 outline-none"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="Purpose / Area remark"
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
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Actions */}
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
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2"
          >
            Post Material Issue
          </Button>
        </div>
      </form>
    </div>
  );
};
