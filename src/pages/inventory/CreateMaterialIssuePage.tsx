/**
 * Create Material Issue Page
 * Location: src/pages/inventory/CreateMaterialIssuePage.tsx
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { MaterialIssue } from '../../domain/types';
import { getAvailableStockForLocationAndProduct, isLocationMatch } from '../../domain/selectors';
import { Button } from '../../components/ui/Button';
import {
  Truck,
  ArrowLeft,
  AlertTriangle,
  Boxes,
  Plus,
  Trash2,
  Info,
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
  const productsMaster = state.products || [];

  // Unified store location options
  const locations = useMemo(() => {
    const defaultLocs = [
      { id: 'loc-001', name: 'Central Site Store - Basement 1' },
      { id: 'loc-002', name: 'Secondary Store Yard' },
      { id: 'wh-site-p1', name: 'Nouveau Penthouse Site Store' },
      { id: 'wh-site-p2', name: 'Corporate HQ Site Store' },
    ];
    const storeLocs = (state as any).warehouseLocations || (state as any).locations || [];
    if (storeLocs.length === 0) return defaultLocs;

    const merged = [...defaultLocs];
    storeLocs.forEach((sl: any) => {
      if (!merged.some((m) => m.id === sl.id || m.name === sl.name)) {
        merged.push({ id: sl.id, name: sl.name });
      }
    });
    return merged;
  }, [state]);

  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [sourceLocationId, setSourceLocationId] = useState<string>(locations[0]?.id || 'loc-001');
  const [destinationAreaName, setDestinationAreaName] = useState<string>('Block A - Floor 4 Work Package');
  const [issuedBy, setIssuedBy] = useState<string>('Ramesh Kumar (Storekeeper)');
  const [receivedByPerson, setReceivedByPerson] = useState<string>('Suresh Nair (Site Supervisor)');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute Available Stock per Product at selected source location directly from canonical Stock Ledger
  const availableStockMap = useMemo(() => {
    const map = new Map<string, { productCode: string; productName: string; unitSymbol: string; categoryName: string; available: number }>();

    // 1. Calculate running stock balances from Stock Ledger
    stockLedger.forEach((entry: any) => {
      const locId = entry.locationId || entry.warehouseId;
      if (isLocationMatch(locId, sourceLocationId) && entry.productId) {
        const pId = entry.productId;
        const qtyIn = Number(entry.inQuantity ?? entry.quantityIn ?? (entry.quantity && entry.quantity > 0 ? entry.quantity : 0));
        const qtyOut = Number(entry.outQuantity ?? entry.quantityOut ?? (entry.quantity && entry.quantity < 0 ? Math.abs(entry.quantity) : 0));
        const netChange = qtyIn - qtyOut;

        const existing = map.get(pId) || {
          productCode: entry.productCode || pId.slice(-6).toUpperCase(),
          productName: entry.productName || entry.productDescription || 'Material Item',
          unitSymbol: entry.unitSymbol || entry.unit || 'sqft',
          categoryName: entry.categoryName || 'General Works',
          available: 0,
        };
        existing.available += netChange;
        map.set(pId, existing);
      }
    });

    // 2. Also check products master to ensure metadata & fallback stock if ledger entries exist
    productsMaster.forEach((prod: any) => {
      const avail = getAvailableStockForLocationAndProduct(stockLedger, sourceLocationId, prod.id);
      if (avail > 0 || map.has(prod.id)) {
        const existing = map.get(prod.id);
        const currentAvail = existing ? Math.max(0, existing.available) : avail;
        if (currentAvail > 0) {
          map.set(prod.id, {
            productCode: prod.code || prod.id,
            productName: prod.name || prod.description || 'Material Item',
            unitSymbol: prod.unitSymbol || prod.unit || 'sqft',
            categoryName: prod.categoryName || 'General Works',
            available: currentAvail,
          });
        } else {
          map.delete(prod.id);
        }
      }
    });

    return map;
  }, [stockLedger, sourceLocationId, productsMaster]);

  const availableProductsList = useMemo(() => {
    return Array.from(availableStockMap.entries())
      .filter(([_, info]) => info.available > 0)
      .map(([prodId, info]) => ({
        id: prodId,
        ...info,
      }));
  }, [availableStockMap]);

  const [formLines, setFormLines] = useState<IssueFormLine[]>([]);

  // Clear form lines if location changes to prevent stale material selections
  useEffect(() => {
    setFormLines((prevLines) =>
      prevLines.filter((line) => {
        const currentInfo = availableStockMap.get(line.productId);
        return currentInfo && currentInfo.available > 0;
      })
    );
  }, [sourceLocationId, availableStockMap]);

  // Unselected available products to prevent duplicates
  const unselectedProducts = useMemo(() => {
    const selectedIds = new Set(formLines.map((l) => l.productId));
    return availableProductsList.filter((p) => !selectedIds.has(p.id));
  }, [availableProductsList, formLines]);

  const handleAddLine = () => {
    if (availableProductsList.length === 0) {
      setErrorMessage('No approved stock is available at the selected source location.');
      return;
    }

    if (unselectedProducts.length === 0) {
      setErrorMessage('All available materials at this source store have already been added.');
      return;
    }

    const nextProd = unselectedProducts[0];
    setFormLines((prev) => [
      ...prev,
      {
        productId: nextProd.id,
        productCode: nextProd.productCode,
        productName: nextProd.productName,
        unitSymbol: nextProd.unitSymbol,
        requestedQty: Math.min(10, nextProd.available),
        issuedQty: Math.min(10, nextProd.available),
        availableStock: Math.max(0, nextProd.available),
        notes: '',
      },
    ]);
    setErrorMessage(null);
  };

  const handleProductChange = (index: number, prodId: string) => {
    const prodInfo = availableStockMap.get(prodId);
    if (!prodInfo) return;

    const updated = [...formLines];
    const defaultQty = Math.min(10, prodInfo.available);
    updated[index] = {
      ...updated[index],
      productId: prodId,
      productCode: prodInfo.productCode,
      productName: prodInfo.productName,
      unitSymbol: prodInfo.unitSymbol,
      availableStock: Math.max(0, prodInfo.available),
      issuedQty: defaultQty,
      requestedQty: defaultQty,
    };
    setFormLines(updated);
    setErrorMessage(null);
  };

  const handleQtyChange = (index: number, val: number) => {
    const updated = [...formLines];
    const qty = Number(val) || 0;
    updated[index].issuedQty = qty;
    updated[index].requestedQty = qty;
    setFormLines(updated);
    setErrorMessage(null);
  };

  const handleRemoveLine = (index: number) => {
    setFormLines(formLines.filter((_, i) => i !== index));
    setErrorMessage(null);
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

    // Strict Guard: Validate stock availability for each line
    for (const line of formLines) {
      if (line.issuedQty <= 0) {
        setErrorMessage(`Issued quantity for ${line.productName} must be greater than 0.`);
        return;
      }
      if (line.issuedQty > line.availableStock) {
        const excess = line.issuedQty - line.availableStock;
        setErrorMessage(
          `Stock Guard Violation: Cannot issue ${line.issuedQty} ${line.unitSymbol} of '${line.productName}'. Issue quantity exceeds available stock by ${excess} ${line.unitSymbol}.`
        );
        return;
      }
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    const selectedSourceLoc = locations.find((l: any) => l.id === sourceLocationId);
    const docNum = `ISSUE-${new Date().getFullYear()}-${String((state.materialIssues?.length || 0) + 1).padStart(3, '0')}`;

    const newIssue: MaterialIssue = {
      id: `issue-${Date.now()}`,
      issueNumber: docNum,
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

  const isAddDisabled = availableProductsList.length === 0 || unselectedProducts.length === 0;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/inventory/material-movement')}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Material Movement
        </button>
      </div>

      {/* Header */}
      <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 text-white flex items-center justify-between shadow-sm">
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

      {availableProductsList.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2.5 font-medium">
          <Info className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">No approved stock available at selected store location.</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Select a store location with posted stock entries or receive items via QC to enable material issue lines.
            </p>
          </div>
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
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium outline-none"
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
              disabled={isAddDisabled}
              onClick={handleAddLine}
              title={
                availableProductsList.length === 0
                  ? 'No approved stock available at selected store location'
                  : unselectedProducts.length === 0
                  ? 'All available materials at this store have already been added'
                  : 'Add Material Line'
              }
              className={`text-xs flex items-center gap-1 font-bold ${
                isAddDisabled ? 'opacity-50 cursor-not-allowed bg-stone-100 text-stone-400' : ''
              }`}
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
                      {availableProductsList.length === 0
                        ? 'No stock available at the selected source location.'
                        : 'Click "+ Add Material Line" to select items available at the source store.'}
                    </td>
                  </tr>
                ) : (
                  formLines.map((line, idx) => {
                    const isExcess = line.issuedQty > line.availableStock;
                    const excessQty = line.issuedQty - line.availableStock;

                    return (
                      <tr key={idx} className={`hover:bg-stone-50 ${isExcess ? 'bg-rose-50/50' : ''}`}>
                        <td className="py-3 px-3">
                          <select
                            value={line.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            className="w-full p-1.5 bg-stone-50 border border-stone-300 rounded font-semibold text-stone-900 text-xs outline-none"
                          >
                            {availableProductsList.map((prod) => {
                              const isOtherSelected = formLines.some((l, i) => i !== idx && l.productId === prod.id);
                              if (isOtherSelected) return null;
                              return (
                                <option key={prod.id} value={prod.id}>
                                  {prod.productName} ({prod.productCode}) — Available: {prod.available} {prod.unitSymbol}
                                </option>
                              );
                            })}
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
                            value={line.issuedQty || ''}
                            onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                            className={`w-24 p-1.5 border rounded text-right font-bold outline-none ${
                              isExcess
                                ? 'bg-rose-50 border-rose-400 text-rose-900 focus:ring-1 focus:ring-rose-500'
                                : 'bg-stone-50 border-stone-300 text-stone-900'
                            }`}
                          />
                          {isExcess && (
                            <p className="text-[10px] text-rose-600 font-bold mt-1 text-right">
                              Exceeds stock by {excessQty} {line.unitSymbol}
                            </p>
                          )}
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
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
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
            disabled={formLines.length === 0 || formLines.some((l) => l.issuedQty <= 0 || l.issuedQty > l.availableStock)}
            className="bg-amber-500 hover:bg-amber-400 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed text-stone-950 font-bold px-6 py-2"
          >
            Post Material Issue
          </Button>
        </div>
      </form>
    </div>
  );
};
