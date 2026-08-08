/**
 * Units of Measurement Master Page
 * Location: src/pages/masters/UOMListPage.tsx
 */

import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Unit } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import {
  Ruler,
  Plus,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export const UOMListPage: React.FC = () => {
  const { state, addItem, updateItem } = useERPStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimalPrecision, setDecimalPrecision] = useState<number>(2);
  const [conversionFactor, setConversionFactor] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const units = state.units || [];
  const products = state.products || [];

  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleOpenModal = (unit?: Unit) => {
    setErrorMessage(null);
    if (unit) {
      setEditingUnit(unit);
      setCode(unit.code);
      setName(unit.name);
      setSymbol(unit.symbol);
    } else {
      setEditingUnit(null);
      setCode(`UOM-${String(units.length + 1).padStart(3, '0')}`);
      setName('');
      setSymbol('');
      setDecimalPrecision(2);
      setConversionFactor(1);
    }
    setShowModal(true);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code || !name || !symbol) {
      setErrorMessage('Code, Name, and Symbol are required.');
      return;
    }

    if (conversionFactor <= 0) {
      setErrorMessage('Conversion factor must be greater than 0.');
      return;
    }

    // Code uniqueness check
    const isDuplicate = units.some(
      (u) => u.code.toLowerCase() === code.trim().toLowerCase() && u.id !== editingUnit?.id
    );

    if (isDuplicate) {
      setErrorMessage(`UOM code '${code}' already exists. Code must be unique.`);
      return;
    }

    if (editingUnit) {
      updateItem('units', editingUnit.id, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        symbol: symbol.trim(),
      });
    } else {
      const newUnit: Unit = {
        id: `uom-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        symbol: symbol.trim(),
        isActive: true,
      };
      addItem('units', newUnit);
    }
    setShowModal(false);
  };

  const handleToggleActive = (unit: Unit) => {
    if (unit.isActive) {
      const isUsed = products.some((p) => p.unitId === unit.id || p.unitSymbol === unit.symbol);
      if (isUsed) {
        if (
          !window.confirm(
            `Unit '${unit.name}' is referenced in products. Are you sure you want to deactivate it?`
          )
        ) {
          return;
        }
      }
    }
    updateItem('units', unit.id, { isActive: !unit.isActive });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Ruler className="h-6 w-6 text-[#B39A6A]" />
            Units
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage units used for quantities, purchasing and stock.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Unit
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Unit Types:</span>
          <select
            value={unitTypeFilter}
            onChange={(e) => setUnitTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="all">All Types</option>
            <option value="Quantity">Quantity (Pcs, Nos, Boxes)</option>
            <option value="Area">Area (Sq.Ft, Sq.M)</option>
            <option value="Length">Length (Rft, Mtr, Feet)</option>
            <option value="Weight">Weight (Kg, MT, Ton)</option>
            <option value="Volume">Volume (Ltr, Cu.M)</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, name, symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* UOM Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Unit Name</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Unit Type</th>
                <th className="py-3 px-4 text-center">Decimal Precision</th>
                <th className="py-3 px-4 text-center">Conversion Factor</th>
                <th className="py-3 px-4 text-center">Products Used</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-sm">
                    No units of measurement found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u) => {
                  const usageCount = products.filter(
                    (p) => p.unitId === u.id || p.unitSymbol === u.symbol
                  ).length;

                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'edit',
                      label: 'Edit Unit',
                      icon: Edit,
                      onClick: () => handleOpenModal(u),
                    },
                    {
                      id: 'toggle_active',
                      label: u.isActive ? 'Deactivate Unit' : 'Activate Unit',
                      icon: u.isActive ? XCircle : CheckCircle,
                      variant: u.isActive ? 'destructive' : 'primary',
                      onClick: () => handleToggleActive(u),
                    },
                  ];

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{u.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold border border-slate-200">
                          {u.symbol}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 font-medium">Quantity / Standard</td>
                      <td className="py-3 px-4 text-center text-xs font-mono text-slate-700">2 Decimals</td>
                      <td className="py-3 px-4 text-center text-xs font-mono text-slate-700">1.00</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold">
                          {usageCount} items
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MasterRowActionsMenu ariaLabel={`Actions for UOM ${u.name}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit UOM */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingUnit ? 'Edit Unit of Measurement' : 'Create Unit of Measurement'}
            </h2>
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleSaveUnit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">UOM Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UOM-SQFT"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Square Feet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Symbol *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sq.ft"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Decimal Precision</label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={decimalPrecision}
                    onChange={(e) => setDecimalPrecision(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Conversion Factor</label>
                  <input
                    type="number"
                    step="0.001"
                    min={0.0001}
                    value={conversionFactor}
                    onChange={(e) => setConversionFactor(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Unit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UOMListPage;
