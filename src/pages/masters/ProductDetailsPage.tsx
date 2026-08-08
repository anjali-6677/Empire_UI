/**
 * Product Master Details Page
 * Location: src/pages/masters/ProductDetailsPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import {
  Package,
  ArrowLeft,
  Edit,
  History,
  Store,
  Warehouse,
  Tag,
  Clock,
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { state } = useERPStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'vendors' | 'inventory'>('overview');

  const product = state.products?.find((p) => p.id === productId);
  const categories = state.categories || [];
  const vendors = state.vendors || [];
  const stockLedger = state.stockLedger || [];

  if (!product) {
    return (
      <div className="p-12 text-center space-y-4">
        <Package className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500">The product master record could not be found or may have been removed.</p>
        <Button onClick={() => navigate('/masters/products')} variant="primary">
          Return to Products Master
        </Button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const preferredVendors = vendors.filter((v) => product.vendorIds?.includes(v.id));

  // Compute total stock across locations
  const productStockEntries = stockLedger.filter((s) => s.productId === product.id);
  const totalStockQuantity = productStockEntries.reduce(
    (acc, curr) => acc + (curr.inQuantity || 0) - (curr.outQuantity || 0),
    0
  );

  const priceHistory = product.priceHistory || [
    { price: product.basePrice, effectiveDate: product.basePriceEffectiveDate || '2026-01-01' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/masters/products')}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold">
                {product.code}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  product.isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{product.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/masters/products/${product.id}/edit`)}
            variant="primary"
            className="gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Product
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'overview'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="h-4 w-4" /> Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'pricing'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="h-4 w-4" /> Pricing History ({priceHistory.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'vendors'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Store className="h-4 w-4" /> Approved Suppliers ({preferredVendors.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'inventory'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Warehouse className="h-4 w-4" /> Stock Usage ({totalStockQuantity} {product.unitSymbol})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Category</span>
                  <span className="font-semibold text-slate-900">{category?.name || 'Uncategorized'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Brand / Manufacturer</span>
                  <span className="font-semibold text-slate-900">{product.brand || 'Generic'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Base UOM</span>
                  <span className="font-mono font-semibold text-slate-900">{product.unitSymbol}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Base Price Rate</span>
                  <span className="font-bold text-emerald-700 text-base">
                    ₹{product.basePrice.toLocaleString('en-IN')} / {product.unitSymbol}
                  </span>
                </div>
              </div>

              {product.specification && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 block mb-1">Specifications & Technical Notes</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {product.specification}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-700" /> Procurement Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Base Rate:</span>
                  <span className="font-bold text-slate-900">₹{product.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last PO Purchase Rate:</span>
                  <span className="font-bold text-slate-900">
                    {product.lastPurchaseRate ? `₹${product.lastPurchaseRate}` : 'No PO yet'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Preferred Suppliers:</span>
                  <span className="font-bold text-slate-900">{preferredVendors.length} Suppliers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4 text-right">Price Rate (₹)</th>
                <th className="py-3 px-4">Source Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {priceHistory.map((h, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-xs font-mono text-slate-700 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {h.effectiveDate}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{h.price.toLocaleString('en-IN')} / {product.unitSymbol}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {h.sourcePoId ? `Purchase Order PO-${h.sourcePoId}` : 'Base Rate Master Record'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {preferredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    No preferred vendors linked to this product master.
                  </td>
                </tr>
              ) : (
                preferredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{v.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{v.name}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{v.contactPerson || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{v.city}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-amber-600">{v.rating || '4.5 ★'}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium capitalize">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Stock Balance across Warehouses & Sites
          </h3>
          <p className="text-sm text-slate-600">
            Total physical inventory balance for <span className="font-bold">{product.name}</span>:
          </p>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-900">Total Available Stock:</span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono">
              {totalStockQuantity} {product.unitSymbol}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
