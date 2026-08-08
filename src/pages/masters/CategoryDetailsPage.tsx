import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { getProductsForCategory, getCategoryProductCounts, getVendorsByCategory } from '../../domain/selectors';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeft,
  Box,
  ExternalLink,
  Users,
  Percent,
  History,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const CategoryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useERPStore();

  const category = (state.categories || []).find((c) => c.id === id || c.code === id);

  if (!category) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#172033]">Category Not Found</h2>
        <p className="text-sm text-[#6E7889]">The requested category master record could not be found.</p>
        <Button variant="outline" onClick={() => navigate('/masters/categories-factors')}>
          Back to Categories
        </Button>
      </div>
    );
  }

  const productCounts = getCategoryProductCounts(state, category.id);
  const categoryProducts = getProductsForCategory(state, category.id);
  const eligibleVendors = getVendorsByCategory(state, category.id);
  const factors = (state.factors || []).filter((f) => category.defaultFactorIds?.includes(f.id));

  // Usage in Indents/RFQs
  const rfqUsage = (state.rfqs || []).filter((r) =>
    r.lines.some((l) => categoryProducts.some((p) => p.id === l.productId))
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto bg-[#F6F7F9] min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/masters/categories-factors')} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#B39A6A] bg-[#F1ECE2] px-2 py-0.5 rounded">
                {category.code}
              </span>
              <h1 className="text-2xl font-bold text-[#172033]">{category.name}</h1>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                  category.isActive
                    ? 'bg-[#EAF4EF] text-[#4F8A72] border border-[#4F8A72]/30'
                    : 'bg-[#F1F3F6] text-[#6E7889] border border-[#D9DEE7]'
                }`}
              >
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-[#6E7889] mt-0.5">
              {category.description || 'Master item category workspace'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/masters/products?categoryId=${category.id}&status=active`)}
          className="bg-[#B39A6A] hover:bg-[#9E865A] text-[#172033] font-semibold border-none gap-2"
        >
          <Box className="w-4 h-4" /> View Linked Products ({productCounts.active})
        </Button>
      </div>

      {/* KPI Cards (Muted Empire palette) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D9DEE7] rounded-lg p-4 shadow-sm">
          <div className="text-xs text-[#6E7889] font-medium flex items-center justify-between">
            <span>Active Products</span>
            <CheckCircle className="w-4 h-4 text-[#4F8A72]" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2">{productCounts.active}</div>
          <p className="text-[11px] text-[#6E7889] mt-1">Ready for estimate & purchase lines</p>
        </div>

        <div className="bg-white border border-[#D9DEE7] rounded-lg p-4 shadow-sm">
          <div className="text-xs text-[#6E7889] font-medium flex items-center justify-between">
            <span>Inactive Products</span>
            <XCircle className="w-4 h-4 text-[#6E7889]" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2">{productCounts.inactive}</div>
          <p className="text-[11px] text-[#6E7889] mt-1">Archived product specifications</p>
        </div>

        <div className="bg-white border border-[#D9DEE7] rounded-lg p-4 shadow-sm">
          <div className="text-xs text-[#6E7889] font-medium flex items-center justify-between">
            <span>Total Product Specifications</span>
            <Box className="w-4 h-4 text-[#B39A6A]" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2">{productCounts.total}</div>
          <p className="text-[11px] text-[#6E7889] mt-1">Derived from Product Master</p>
        </div>

        <div className="bg-white border border-[#D9DEE7] rounded-lg p-4 shadow-sm">
          <div className="text-xs text-[#6E7889] font-medium flex items-center justify-between">
            <span>Approved Category Vendors</span>
            <Users className="w-4 h-4 text-[#5C78A0]" />
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-2">{eligibleVendors.length}</div>
          <p className="text-[11px] text-[#6E7889] mt-1">Empanelled category suppliers</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Linked Products & Pricing Factors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Linked Products Table */}
          <div className="bg-white border border-[#D9DEE7] rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <Box className="w-4 h-4 text-[#B39A6A]" /> Linked Products ({categoryProducts.length})
              </h3>
              <button
                onClick={() => navigate(`/masters/products?categoryId=${category.id}&status=active`)}
                className="text-xs font-semibold text-[#B39A6A] hover:underline flex items-center gap-1"
              >
                Filtered Product Master <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {categoryProducts.length === 0 ? (
              <div className="py-8 text-center text-[#6E7889] text-xs">
                No products are currently assigned to this category.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F1F3F6] border-b border-[#D9DEE7] text-[#6E7889] uppercase font-bold">
                      <th className="py-2.5 px-3">Product Code</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Brand</th>
                      <th className="py-2.5 px-3">UOM</th>
                      <th className="py-2.5 px-3">Base Price</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F3F6]">
                    {categoryProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F6F7F9]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#172033]">{p.code}</td>
                        <td className="py-2.5 px-3 font-medium text-[#172033]">{p.name}</td>
                        <td className="py-2.5 px-3 text-[#6E7889]">{p.brand || '—'}</td>
                        <td className="py-2.5 px-3 text-[#6E7889]">{p.unitSymbol}</td>
                        <td className="py-2.5 px-3 font-bold text-[#172033]">₹{p.basePrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              p.isActive !== false ? 'bg-[#EAF4EF] text-[#4F8A72]' : 'bg-[#F1F3F6] text-[#6E7889]'
                            }`}
                          >
                            {p.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pricing Factors */}
          <div className="bg-white border border-[#D9DEE7] rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#B39A6A]" /> Linked Pricing Factors ({factors.length})
              </h3>
            </div>

            {factors.length === 0 ? (
              <div className="py-6 text-center text-[#6E7889] text-xs">
                No default pricing factors configured for this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {factors.map((f) => (
                  <div key={f.id} className="p-3 bg-[#F6F7F9] border border-[#D9DEE7] rounded-md flex justify-between items-center">
                    <div>
                      <span className="font-mono text-[11px] text-[#6E7889] font-bold">{f.code}</span>
                      <div className="text-xs font-bold text-[#172033]">{f.name}</div>
                    </div>
                    <div className="text-sm font-extrabold text-[#B39A6A]">
                      {f.calculationType === 'percentage' ? `${f.defaultValue}%` : `₹${f.defaultValue}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Approved Vendors & Usage */}
        <div className="space-y-6">
          {/* Approved Vendors */}
          <div className="bg-white border border-[#D9DEE7] rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5C78A0]" /> Approved Suppliers ({eligibleVendors.length})
              </h3>
            </div>

            {eligibleVendors.length === 0 ? (
              <div className="py-6 text-center text-[#6E7889] text-xs">
                No suppliers are approved for this category yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {eligibleVendors.map((v) => (
                  <div key={v.id} className="p-2.5 bg-[#F6F7F9] border border-[#D9DEE7] rounded-md flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-[#172033]">{v.name}</div>
                      <div className="text-[11px] text-[#6E7889]">{v.code} • {v.city}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-[#EAF4EF] text-[#4F8A72] rounded text-[10px] font-bold">
                      {v.rating || 'Approved'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-[#D9DEE7] rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-3 mb-3">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <History className="w-4 h-4 text-[#B39A6A]" /> Activity & Usage Summary
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F1F3F6]">
                <span className="text-[#6E7889]">RFQs Created with Category</span>
                <span className="font-bold text-[#172033]">{rfqUsage.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F1F3F6]">
                <span className="text-[#6E7889]">Category Record ID</span>
                <span className="font-mono text-[#172033]">{category.id}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6E7889]">System Status</span>
                <span className="font-semibold text-[#4F8A72]">Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsPage;
