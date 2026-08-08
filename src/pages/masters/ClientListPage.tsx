/**
 * Client Directory Master List Page
 * Location: src/pages/masters/ClientListPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Client } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const ClientListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateItem } = useERPStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const clients = state.clients || [];

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = clientTypeFilter === 'all' || (c.type || 'Corporate') === clientTypeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.isActive) ||
      (statusFilter === 'inactive' && !c.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleActive = (client: Client) => {
    updateItem('clients', client.id, { isActive: !client.isActive });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-[#B39A6A]" />
            Clients
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage client details, contacts, billing information and payment terms.
          </p>
        </div>
        <Button
          onClick={() => navigate('/masters/clients/new')}
          className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search client code, legal name, contact, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={clientTypeFilter}
            onChange={(e) => setClientTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="all">All Client Types</option>
            <option value="Corporate">Corporate / Enterprise</option>
            <option value="Real Estate Developer">Real Estate Developer</option>
            <option value="Individual Owner">Individual Owner</option>
            <option value="Government / PSU">Government / PSU</option>
            <option value="Architect / PMC">Architect / PMC Firm</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Client Legal Name</th>
                <th className="py-3 px-4">Client Type</th>
                <th className="py-3 px-4">Primary Contact</th>
                <th className="py-3 px-4">City / State</th>
                <th className="py-3 px-4">GSTIN</th>
                <th className="py-3 px-4">Credit Terms</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-sm">
                    No clients found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => {
                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'view',
                      label: 'View Client Profile',
                      icon: Eye,
                      onClick: () => navigate(`/masters/clients/${c.id}`),
                    },
                    {
                      id: 'edit',
                      label: 'Edit Client Details',
                      icon: Edit,
                      onClick: () => navigate(`/masters/clients/${c.id}/edit`),
                    },
                    {
                      id: 'toggle_active',
                      label: c.isActive ? 'Deactivate Client' : 'Activate Client',
                      icon: c.isActive ? XCircle : CheckCircle,
                      variant: c.isActive ? 'destructive' : 'primary',
                      onClick: () => handleToggleActive(c),
                    },
                  ];

                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/masters/clients/${c.id}`)}
                      className="hover:bg-slate-50/70 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{c.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {c.type || 'Corporate'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-semibold text-slate-900 block">{c.contactPerson}</span>
                        <span className="text-slate-500">{c.phone}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">{c.city}</td>
                      <td className="py-3 px-4 text-xs font-mono font-semibold text-slate-700">
                        {c.gstin || 'Unregistered'}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-semibold text-emerald-800">
                        Net 30 Days
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <MasterRowActionsMenu ariaLabel={`Actions for ${c.name}`} actions={rowActions} />
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

export default ClientListPage;
