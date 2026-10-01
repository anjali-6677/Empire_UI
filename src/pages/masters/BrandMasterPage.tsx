/**
 * Brand Master Page
 * Location: src/pages/masters/BrandMasterPage.tsx
 */

import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Brand } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { Button } from '../../components/ui/Button';
import {
  Tag,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
} from 'lucide-react';

export const BrandMasterPage: React.FC = () => {
  const { state, createBrand, updateBrand, toggleBrandStatus } = useERPStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const brands = state.brands || [];
  const products = state.products || [];
  const categories = state.categories || [];

  const filteredBrands = brands.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalActive = brands.filter((b) => b.status === 'Active').length;
  const totalInactive = brands.filter((b) => b.status === 'Inactive').length;

  const handleOpenModal = (brand?: Brand) => {
    setErrorMessage(null);
    if (brand) {
      setEditingBrand(brand);
      setCode(brand.code);
      setName(brand.name);
      setCategory(brand.category || '');
      setDescription(brand.description || '');
    } else {
      setEditingBrand(null);
      setCode(`BRD-${String(brands.length + 1).padStart(3, '0')}`);
      setName('');
      setCategory(categories[0]?.name || 'General');
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim() || !name.trim()) {
      setErrorMessage('Brand Code and Name are required.');
      return;
    }

    if (editingBrand) {
      const res = updateBrand(editingBrand.id, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category: category.trim() || 'General',
        description: description.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update brand.');
        return;
      }
    } else {
      const res = createBrand({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category: category.trim() || 'General',
        description: description.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create brand.');
        return;
      }
    }
    setShowModal(false);
  };

  const handleToggleStatus = (b: Brand) => {
    if (b.status === 'Active') {
      const linkedProducts = products.filter((p) => p.brandId === b.id || p.brand === b.name);
      if (linkedProducts.length > 0) {
        if (!window.confirm(`Brand '${b.name}' is assigned to ${linkedProducts.length} products. Are you sure you want to deactivate it?`)) {
          return;
        }
      }
    }
    toggleBrandStatus(b.id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Tag className="h-6 w-6 text-[#B39A6A]" />
            Brand Master
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage material & equipment product brands across categories.
          </p>
        </div>
        <PrimaryActionButton
          label="Add New Brand"
          onClick={() => handleOpenModal()}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Brands</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{brands.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Active Brands</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totalActive}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Inactive Brands</div>
          <div className="text-2xl font-bold text-slate-400 mt-1">{totalInactive}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Brand Code</th>
                <th className="py-3 px-4">Brand Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Linked Products</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                    No brands found matching your search.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b) => {
                  const linkedCount = products.filter(
                    (p) => p.brandId === b.id || p.brand?.toLowerCase() === b.name.toLowerCase()
                  ).length;

                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'edit',
                      label: 'Edit Brand',
                      icon: Edit,
                      onClick: () => handleOpenModal(b),
                    },
                    {
                      id: 'toggle_status',
                      label: b.status === 'Active' ? 'Deactivate Brand' : 'Activate Brand',
                      icon: b.status === 'Active' ? XCircle : CheckCircle,
                      variant: b.status === 'Active' ? 'destructive' : 'primary',
                      onClick: () => handleToggleStatus(b),
                    },
                  ];

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{b.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{b.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{b.category || 'General'}</td>
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">{b.description || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                          <Package className="h-3 w-3" />
                          {linkedCount} items
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            b.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MasterRowActionsMenu ariaLabel={`Actions for ${b.name}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Brand */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingBrand ? 'Edit Brand' : 'Create New Brand'}
            </h2>
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BRD-001"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CenturyPly"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="General">General</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of brand products & specifications..."
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
                  {editingBrand ? 'Save Changes' : 'Create Brand'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandMasterPage;
