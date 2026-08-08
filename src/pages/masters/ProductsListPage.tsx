/**
 * Products & Raw Materials Master List Page
 * Location: src/pages/masters/ProductsListPage.tsx
 */

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Product } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import {
  Package,
  Plus,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, updateItem } = useERPStore();

  const urlCategoryId = searchParams.get('categoryId') || 'all';
  const urlStatus = searchParams.get('status') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(urlCategoryId);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>(urlStatus);

  const products = state.products || [];
  const categories = state.categories || [];
  const vendors = state.vendors || [];

  // Extract unique brands for filter
  const brands = Array.from(
    new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive);

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  const handleToggleActive = (product: Product) => {
    updateItem('products', product.id, { isActive: !product.isActive });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Package className="h-6 w-6 text-[#B39A6A]" />
            Products & Materials
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage materials, specifications, units, rates and approved suppliers.
          </p>
        </div>
        <Button
          onClick={() => navigate('/masters/products/new')}
          className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, vendor codes, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
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
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Base UOM</th>
                <th className="py-3 px-4 text-right">Base Rate</th>
                <th className="py-3 px-4 text-right">Latest PO Rate</th>
                <th className="py-3 px-4">Preferred Vendors</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 text-sm">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const category = categories.find((c) => c.id === p.categoryId);
                  const preferredVendors = vendors.filter((v) => p.vendorIds?.includes(v.id));

                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'view',
                      label: 'View Product Details',
                      icon: Eye,
                      onClick: () => navigate(`/masters/products/${p.id}`),
                    },
                    {
                      id: 'edit',
                      label: 'Edit Product',
                      icon: Edit,
                      onClick: () => navigate(`/masters/products/${p.id}/edit`),
                    },
                    {
                      id: 'toggle_active',
                      label: p.isActive ? 'Deactivate Product' : 'Activate Product',
                      icon: p.isActive ? XCircle : CheckCircle,
                      variant: p.isActive ? 'destructive' : 'primary',
                      onClick: () => handleToggleActive(p),
                    },
                  ];

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/masters/products/${p.id}`)}
                      className="hover:bg-slate-50/70 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{p.code}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        {p.specification && (
                          <span className="text-xs text-slate-500 line-clamp-1">{p.specification}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-medium">
                          {category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-700">{p.brand || 'Generic'}</td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">{p.unitSymbol}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{p.basePrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-xs font-medium text-slate-600">
                        {p.lastPurchaseRate ? `₹${p.lastPurchaseRate.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {preferredVendors.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {preferredVendors.slice(0, 2).map((v) => (
                              <span
                                key={v.id}
                                className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200 font-semibold"
                              >
                                {v.name}
                              </span>
                            ))}
                            {preferredVendors.length > 2 && (
                              <span className="text-[10px] text-slate-500 font-bold">
                                +{preferredVendors.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <MasterRowActionsMenu ariaLabel={`Actions for ${p.name}`} actions={rowActions} />
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

export default ProductsListPage;
