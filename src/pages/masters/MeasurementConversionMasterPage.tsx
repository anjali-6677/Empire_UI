/**
 * Measurement Conversion Master Page
 * Location: src/pages/masters/MeasurementConversionMasterPage.tsx
 */

import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { MeasurementConversion } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { Button } from '../../components/ui/Button';
import {
  ArrowRightLeft,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export const MeasurementConversionMasterPage: React.FC = () => {
  const { state, createMeasurementConversion, updateMeasurementConversion, toggleConversionStatus } = useERPStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingConv, setEditingConv] = useState<MeasurementConversion | null>(null);

  // Form states
  const [conversionCode, setConversionCode] = useState('');
  const [fromUnitId, setFromUnitId] = useState('');
  const [toUnitId, setToUnitId] = useState('');
  const [conversionFactor, setConversionFactor] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const conversions = state.measurementConversions || [];
  const units = state.units || [];

  const filteredConversions = conversions.filter((c) => {
    const fromUnit = units.find((u) => u.id === c.fromUnitId);
    const toUnit = units.find((u) => u.id === c.toUnitId);
    const matchesSearch =
      c.conversionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.fromUnitSymbol && c.fromUnitSymbol.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.toUnitSymbol && c.toUnitSymbol.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (fromUnit && fromUnit.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (toUnit && toUnit.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const totalActive = conversions.filter((c) => c.status === 'Active').length;

  const handleOpenModal = (conv?: MeasurementConversion) => {
    setErrorMessage(null);
    if (conv) {
      setEditingConv(conv);
      setConversionCode(conv.conversionCode);
      setFromUnitId(conv.fromUnitId);
      setToUnitId(conv.toUnitId);
      setConversionFactor(conv.conversionFactor);
      setNotes(conv.notes || '');
    } else {
      setEditingConv(null);
      setConversionCode(`CONV-${String(conversions.length + 1).padStart(3, '0')}`);
      setFromUnitId(units[0]?.id || '');
      setToUnitId(units[1]?.id || units[0]?.id || '');
      setConversionFactor(1);
      setNotes('');
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fromUnitObj = units.find((u) => u.id === fromUnitId);
    const toUnitObj = units.find((u) => u.id === toUnitId);

    if (editingConv) {
      const res = updateMeasurementConversion(editingConv.id, {
        fromUnitId,
        fromUnitSymbol: fromUnitObj?.symbol || 'unit',
        toUnitId,
        toUnitSymbol: toUnitObj?.symbol || 'unit',
        conversionFactor,
        notes: notes.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update conversion.');
        return;
      }
    } else {
      const res = createMeasurementConversion({
        conversionCode,
        fromUnitId,
        fromUnitSymbol: fromUnitObj?.symbol || 'unit',
        toUnitId,
        toUnitSymbol: toUnitObj?.symbol || 'unit',
        conversionFactor,
        notes: notes.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create conversion.');
        return;
      }
    }
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <ArrowRightLeft className="h-6 w-6 text-[#B39A6A]" />
            Measurement Conversions
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Define canonical unit conversion factors for estimation and procurement.
          </p>
        </div>
        <PrimaryActionButton
          label="Add Conversion Rule"
          onClick={() => handleOpenModal()}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Rules Defined</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{conversions.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Active Conversion Rules</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totalActive}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, unit names or symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">From Unit</th>
                <th className="py-3 px-4 text-center">Conversion Equation</th>
                <th className="py-3 px-4">To Unit</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredConversions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                    No measurement conversion rules found.
                  </td>
                </tr>
              ) : (
                filteredConversions.map((c) => {
                  const fromUnit = units.find((u) => u.id === c.fromUnitId);
                  const toUnit = units.find((u) => u.id === c.toUnitId);

                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'edit',
                      label: 'Edit Conversion Rule',
                      icon: Edit,
                      onClick: () => handleOpenModal(c),
                    },
                    {
                      id: 'toggle_status',
                      label: c.status === 'Active' ? 'Deactivate Rule' : 'Activate Rule',
                      icon: c.status === 'Active' ? XCircle : CheckCircle,
                      variant: c.status === 'Active' ? 'destructive' : 'primary',
                      onClick: () => toggleConversionStatus(c.id),
                    },
                  ];

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{c.conversionCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {fromUnit?.name || c.fromUnitSymbol}
                        <span className="ml-2 font-mono text-xs text-slate-500">({c.fromUnitSymbol})</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs bg-slate-50/80 rounded py-1 px-2 border border-slate-200">
                        1 {c.fromUnitSymbol} = <span className="font-bold text-amber-800">{c.conversionFactor}</span> {c.toUnitSymbol}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {toUnit?.name || c.toUnitSymbol}
                        <span className="ml-2 font-mono text-xs text-slate-500">({c.toUnitSymbol})</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">{c.notes || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            c.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MasterRowActionsMenu ariaLabel={`Actions for ${c.conversionCode}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Conversion */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingConv ? 'Edit Measurement Conversion' : 'Create Measurement Conversion'}
            </h2>
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Conversion Rule Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CONV-001"
                  value={conversionCode}
                  onChange={(e) => setConversionCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Unit *</label>
                  <select
                    value={fromUnitId}
                    onChange={(e) => setFromUnitId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Unit *</label>
                  <select
                    value={toUnitId}
                    onChange={(e) => setToUnitId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Conversion Multiplier / Factor *</label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  placeholder="e.g. 10.7639"
                  value={conversionFactor}
                  onChange={(e) => setConversionFactor(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  1 From Unit = Factor x To Unit
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Metric standard square conversion"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingConv ? 'Save Rule' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementConversionMasterPage;
