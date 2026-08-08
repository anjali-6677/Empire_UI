/**
 * Payment Terms Master Page
 * Location: src/pages/masters/PaymentTermsPage.tsx
 */

import React, { useState } from 'react';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import { CreditCard, Plus, Search, Edit, CheckCircle, XCircle } from 'lucide-react';

interface PaymentTerm {
  id: string;
  code: string;
  name: string;
  days: number;
  description: string;
  isActive: boolean;
}

const DEFAULT_TERMS: PaymentTerm[] = [
  { id: 'pt-1', code: 'ADV-100', name: '100% Advance Payment', days: 0, description: '100% payment prior to dispatch', isActive: true },
  { id: 'pt-2', code: 'NET-15', name: 'Net 15 Days', days: 15, description: 'Payment due 15 days after invoice date', isActive: true },
  { id: 'pt-3', code: 'NET-30', name: 'Net 30 Days', days: 30, description: 'Standard commercial term: Net 30 days', isActive: true },
  { id: 'pt-4', code: 'NET-60', name: 'Net 60 Days', days: 60, description: 'Extended credit term for enterprise clients', isActive: true },
];

export const PaymentTermsPage: React.FC = () => {
  const [terms, setTerms] = useState<PaymentTerm[]>(DEFAULT_TERMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<PaymentTerm | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [days, setDays] = useState<number>(30);
  const [description, setDescription] = useState('');

  const filteredTerms = terms.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (term?: PaymentTerm) => {
    if (term) {
      setEditingTerm(term);
      setCode(term.code);
      setName(term.name);
      setDays(term.days);
      setDescription(term.description);
    } else {
      setEditingTerm(null);
      setCode(`NET-${days}`);
      setName('');
      setDays(30);
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    if (editingTerm) {
      setTerms(
        terms.map((t) =>
          t.id === editingTerm.id ? { ...t, code: code.toUpperCase(), name, days, description } : t
        )
      );
    } else {
      const newTerm: PaymentTerm = {
        id: `pt-${Date.now()}`,
        code: code.toUpperCase(),
        name,
        days,
        description,
        isActive: true,
      };
      setTerms([...terms, newTerm]);
    }
    setShowModal(false);
  };

  const handleToggleActive = (term: PaymentTerm) => {
    setTerms(
      terms.map((t) => (t.id === term.id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-[#B39A6A]" />
            Payment Terms
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage standard payment terms for clients and suppliers.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Payment Term
        </Button>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search payment terms..."
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
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Term Title</th>
              <th className="py-3 px-4 text-center">Credit Days</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredTerms.map((t) => {
              const rowActions: MasterActionItem[] = [
                {
                  id: 'edit',
                  label: 'Edit Term',
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
                  <td className="py-3 px-4 text-center font-mono text-xs font-bold text-slate-800">
                    {t.days} Days
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">{t.description}</td>
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
              {editingTerm ? 'Edit Payment Term' : 'Add Payment Term'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Term Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NET-45"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Term Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Net 45 Days"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Days *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Term
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTermsPage;
