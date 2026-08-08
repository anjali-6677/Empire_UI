/**
 * Vendor Directory Master List Page
 * Location: src/pages/masters/VendorListPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Vendor } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import {
  Store,
  Plus,
  Search,
  Eye,
  Edit,
  ShieldCheck,
  Ban,
  CheckCircle,
} from 'lucide-react';

export const VendorListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateItem } = useERPStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const vendors = state.vendors || [];
  const categories = state.categories || [];

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || (v.category && v.category.includes(selectedCategory));
    const matchesStatus =
      statusFilter === 'all' || v.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleBlockVendor = (vendor: Vendor) => {
    if (vendor.status === 'blacklisted') {
      updateItem('vendors', vendor.id, { status: 'empanelled' });
    } else {
      const reason = window.prompt(`Reason for blocking/blacklisting vendor ${vendor.name}:`);
      if (reason) {
        updateItem('vendors', vendor.id, { status: 'blacklisted' });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Store className="h-6 w-6 text-[#B39A6A]" />
            Vendors
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage supplier details, categories, contacts and payment terms.
          </p>
        </div>
        <Button
          onClick={() => navigate('/masters/vendors/new')}
          className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Vendor
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor name, code, contact, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
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

      {/* Vendor Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Vendor Legal Name</th>
                <th className="py-3 px-4">Approved Categories</th>
                <th className="py-3 px-4">Primary Contact</th>
                <th className="py-3 px-4">City / Location</th>
                <th className="py-3 px-4">Credit Days</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Compliance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 text-sm">
                    No vendors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => {
                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'view',
                      label: 'View Vendor Profile',
                      icon: Eye,
                      onClick: () => navigate(`/masters/vendors/${v.id}`),
                    },
                    {
                      id: 'edit',
                      label: 'Edit Vendor Details',
                      icon: Edit,
                      onClick: () => navigate(`/masters/vendors/${v.id}/edit`),
                    },
                    {
                      id: 'toggle_block',
                      label: v.status === 'blacklisted' ? 'Unblock Vendor' : 'Block / Blacklist Vendor',
                      icon: v.status === 'blacklisted' ? CheckCircle : Ban,
                      variant: v.status === 'blacklisted' ? 'primary' : 'destructive',
                      onClick: () => handleToggleBlockVendor(v),
                    },
                  ];

                  return (
                    <tr
                      key={v.id}
                      onClick={() => navigate(`/masters/vendors/${v.id}`)}
                      className="hover:bg-slate-50/70 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{v.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {v.name}
                        {v.gstin && <span className="block text-[10px] text-slate-400 font-mono">GST: {v.gstin}</span>}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-medium">
                          {v.category || 'General Supplier'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-semibold text-slate-900 block">{v.contactPerson}</span>
                        <span className="text-slate-500">{v.phone}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">{v.city}</td>
                      <td className="py-3 px-4 text-xs font-mono font-semibold text-slate-700">
                        {v.paymentTermsDays ? `${v.paymentTermsDays} Days` : 'Net 30'}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-amber-600">{v.rating || '4.8 ★'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-semibold">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" /> Compliant
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                            v.status === 'empanelled'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : v.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <MasterRowActionsMenu ariaLabel={`Actions for ${v.name}`} actions={rowActions} />
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

export default VendorListPage;
