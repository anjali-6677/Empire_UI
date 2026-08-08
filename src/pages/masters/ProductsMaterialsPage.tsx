import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Product } from '../../domain/types';
import { Package, Plus, Search } from 'lucide-react';

export const ProductsMaterialsPage: React.FC = () => {
  const { state, addItem } = useERPStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitSymbol, setUnitSymbol] = useState('sqft');
  const [basePrice, setBasePrice] = useState<number>(100);
  const [brand, setBrand] = useState('');

  const filteredProducts = state.products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCatId === 'all' || p.categoryId === selectedCatId;
    return matchesSearch && matchesCat;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !categoryId) return;
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      code,
      name,
      categoryId,
      unitId: `unit-${unitSymbol}`,
      unitSymbol,
      basePrice,
      basePriceEffectiveDate: new Date().toISOString().split('T')[0],
      brand,
      isActive: true,
    };
    addItem('products', newProduct);
    setShowModal(false);
    setCode('');
    setName('');
    setBrand('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-600" />
            Products & Raw Materials Master
          </h1>
          <p className="text-sm text-slate-600">
            Catalog of materials with base pricing, category linkages, unit rates, and price history tracking.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <Plus className="h-4 w-4" /> Add Product / Material
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search material code, name, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={selectedCatId}
          onChange={(e) => setSelectedCatId(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none"
        >
          <option value="all">All Categories</option>
          {state.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Material Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Brand</th>
              <th className="py-3 px-4">UOM</th>
              <th className="py-3 px-4">Base Rate</th>
              <th className="py-3 px-4">Last PO Rate</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredProducts.map((p) => {
              const cat = state.categories.find((c) => c.id === p.categoryId);
              return (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{p.code}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {p.name}
                    {p.specification && <span className="block text-xs text-slate-500 font-normal">{p.specification}</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">{cat?.name || p.categoryId}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700 font-medium">{p.brand || 'Generic'}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-600">{p.unitSymbol}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{p.basePrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-600">
                    {p.lastPurchaseRate ? `₹${p.lastPurchaseRate.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium">Active</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Create Product */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add New Product / Material</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Material Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRD-PLY-18"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product / Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BWP Marine Plywood 18mm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  >
                    <option value="">Select Category</option>
                    {state.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. CenturyPly"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Symbol</label>
                  <select
                    value={unitSymbol}
                    onChange={(e) => setUnitSymbol(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  >
                    {state.units.map((u) => (
                      <option key={u.id} value={u.symbol}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsMaterialsPage;
