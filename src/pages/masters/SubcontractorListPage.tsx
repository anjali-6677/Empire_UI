/**
 * Subcontractor Directory Master List Page
 * Location: src/pages/masters/SubcontractorListPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Subcontractor } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  ShieldCheck,
  Ban,
  CheckCircle,
} from 'lucide-react';

export const SubcontractorListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateItem } = useERPStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const subcontractors = state.subcontractors || [];

  // Extract unique trades
  const trades = Array.from(
    new Set(subcontractors.map((s) => s.trade || s.tradeCategory).filter(Boolean))
  );

  const filteredSubcontractors = subcontractors.filter((s) => {
    const tradeVal = s.trade || s.tradeCategory || '';
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tradeVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrade = tradeFilter === 'all' || tradeVal === tradeFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesTrade && matchesStatus;
  });

  const handleToggleBlock = (subcontractor: Subcontractor) => {
    if (subcontractor.status === 'blacklisted') {
      updateItem('subcontractors', subcontractor.id, { status: 'empanelled' });
    } else {
      const reason = window.prompt(`Reason for blacklisting ${subcontractor.name}:`);
      if (reason) {
        updateItem('subcontractors', subcontractor.id, { status: 'blacklisted' });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#B39A6A]" />
            Subcontractors
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage subcontractor trades, contacts, rates and documents.
          </p>
        </div>
        <Button
          onClick={() => navigate('/masters/subcontractors/new')}
          className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Subcontractor
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subcontractor code, agency name, trade, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Trade Filter */}
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="all">All Trades</option>
            {trades.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="empanelled">Empanelled (Active)</option>
            <option value="pending">Pending Review</option>
            <option value="blacklisted">Blacklisted / Blocked</option>
          </select>
        </div>
      </div>

      {/* Subcontractor Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Agency / Contractor Name</th>
                <th className="py-3 px-4">Trade Specialization</th>
                <th className="py-3 px-4">Primary Contact</th>
                <th className="py-3 px-4 text-center">Labour Capacity</th>
                <th className="py-3 px-4">Rate Preference</th>
                <th className="py-3 px-4">Compliance</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredSubcontractors.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 text-sm">
                    No subcontractors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredSubcontractors.map((s) => {
                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'view',
                      label: 'View Subcontractor Profile',
                      icon: Eye,
                      onClick: () => navigate(`/masters/subcontractors/${s.id}`),
                    },
                    {
                      id: 'edit',
                      label: 'Edit Details',
                      icon: Edit,
                      onClick: () => navigate(`/masters/subcontractors/${s.id}/edit`),
                    },
                    {
                      id: 'toggle_block',
                      label: s.status === 'blacklisted' ? 'Unblock Contractor' : 'Block / Blacklist',
                      icon: s.status === 'blacklisted' ? CheckCircle : Ban,
                      variant: s.status === 'blacklisted' ? 'primary' : 'destructive',
                      onClick: () => handleToggleBlock(s),
                    },
                  ];

                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/masters/subcontractors/${s.id}`)}
                      className="hover:bg-slate-50/70 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{s.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {s.name}
                        {s.pan && <span className="block text-[10px] text-slate-400 font-mono">PAN: {s.pan}</span>}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-amber-900">
                        <span className="px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                          {s.trade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-semibold text-slate-900 block">{s.contactPerson}</span>
                        <span className="text-slate-500">{s.phone}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-xs font-mono font-bold text-slate-800">
                        {s.labourCapacity || 25} Workers
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {s.rateType || 'Item Rate'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-semibold">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" /> PF & ESI
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-amber-600">{s.rating || '4.7 ★'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                            s.status === 'empanelled'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : s.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <MasterRowActionsMenu ariaLabel={`Actions for ${s.name}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubcontractorListPage;
