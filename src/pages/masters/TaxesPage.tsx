/**
 * Tax Definitions Master Page
 * Location: src/pages/masters/TaxesPage.tsx
 */

import React, { useState } from 'react';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import { Percent, Plus, Search, Edit, CheckCircle, XCircle } from 'lucide-react';

interface TaxDefinition {
  id: string;
  code: string;
  name: string;
  rate: number;
  type: 'CGST_SGST' | 'IGST' | 'TDS' | 'CESS';
  hsnsacRequired: boolean;
  isActive: boolean;
}

const DEFAULT_TAXES: TaxDefinition[] = [
  { id: 'tax-1', code: 'GST-18', name: 'GST 18% (CGST 9% + SGST 9%)', rate: 18, type: 'CGST_SGST', hsnsacRequired: true, isActive: true },
  { id: 'tax-2', code: 'IGST-18', name: 'IGST 18% (Interstate)', rate: 18, type: 'IGST', hsnsacRequired: true, isActive: true },
  { id: 'tax-3', code: 'GST-12', name: 'GST 12% (CGST 6% + SGST 6%)', rate: 12, type: 'CGST_SGST', hsnsacRequired: true, isActive: true },
  { id: 'tax-4', code: 'GST-5', name: 'GST 5% (CGST 2.5% + SGST 2.5%)', rate: 5, type: 'CGST_SGST', hsnsacRequired: true, isActive: true },
  { id: 'tax-5', code: 'TDS-194C', name: 'TDS 194C Contractor (2%)', rate: 2, type: 'TDS', hsnsacRequired: false, isActive: true },
  { id: 'tax-6', code: 'TDS-194J', name: 'TDS 194J Professional (10%)', rate: 10, type: 'TDS', hsnsacRequired: false, isActive: true },
];

export const TaxesPage: React.FC = () => {
  const [taxes, setTaxes] = useState<TaxDefinition[]>(DEFAULT_TAXES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxDefinition | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [rate, setRate] = useState<number>(18);
  const [type, setType] = useState<'CGST_SGST' | 'IGST' | 'TDS' | 'CESS'>('CGST_SGST');

  const filteredTaxes = taxes.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (tax?: TaxDefinition) => {
    if (tax) {
      setEditingTax(tax);
      setCode(tax.code);
      setName(tax.name);
      setRate(tax.rate);
      setType(tax.type);
    } else {
      setEditingTax(null);
      setCode('');
      setName('');
      setRate(18);
      setType('CGST_SGST');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    if (editingTax) {
      setTaxes(
        taxes.map((t) =>
          t.id === editingTax.id ? { ...t, code: code.toUpperCase(), name, rate, type } : t
        )
      );
    } else {
      const newTax: TaxDefinition = {
        id: `tax-${Date.now()}`,
        code: code.toUpperCase(),
        name,
        rate,
        type,
        hsnsacRequired: type !== 'TDS',
        isActive: true,
      };
      setTaxes([...taxes, newTax]);
    }
    setShowModal(false);
  };

  const handleToggleActive = (tax: TaxDefinition) => {
    setTaxes(
      taxes.map((t) => (t.id === tax.id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Percent className="h-6 w-6 text-[#B39A6A]" />
            Taxes
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage GST rates, TDS categories and tax definitions.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Tax Rate
        </Button>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search GST / TDS rate definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th className="py-3 px-4">Tax Code</th>
              <th className="py-3 px-4">Tax Name</th>
              <th className="py-3 px-4 text-center">Tax Rate (%)</th>
              <th className="py-3 px-4">Tax Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredTaxes.map((t) => {
              const rowActions: MasterActionItem[] = [
                {
                  id: 'edit',
                  label: 'Edit Tax Rule',
                  icon: Edit,
                  onClick: () => handleOpenModal(t),
                },
                {
                  id: 'toggle_active',
                  label: t.isActive ? 'Deactivate' : 'Activate',
                  icon: t.isActive ? XCircle : CheckCircle,
                  variant: t.isActive ? 'destructive' : 'primary',
                  onClick: () => handleToggleActive(t),
                },
              ];

              return (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{t.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                  <td className="py-3 px-4 text-center font-mono text-xs font-bold text-emerald-800">
                    {t.rate}%
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                    <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        t.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <MasterRowActionsMenu ariaLabel={`Actions for ${t.name}`} actions={rowActions} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingTax ? 'Edit Tax Definition' : 'Add Tax Definition'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GST-18"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Display Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GST 18% (CGST 9% + SGST 9%)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate Percentage (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Category *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="CGST_SGST">Intrastate (CGST + SGST)</option>
                  <option value="IGST">Interstate (IGST)</option>
                  <option value="TDS">Tax Deducted at Source (TDS)</option>
                  <option value="CESS">Compensation Cess</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Tax Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxesPage;
