import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Product } from '../../domain/types';
import { getEligibleVendorsForCategory } from '../../domain/selectors';
import { Button } from '../../components/ui/Button';
import { CreatableCombobox } from '../../components/ui/CreatableCombobox';
import {
  Package,
  ArrowLeft,
  Save,
  AlertTriangle,
  Users,
  ShieldCheck,
  Star,
  HelpCircle,
} from 'lucide-react';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId?: string }>();
  const { state, addItem, updateItem } = useERPStore();

  const isEditMode = Boolean(productId);
  const products = state.products || [];
  const categories = state.categories || [];
  const units = state.units || [];

  const existingProduct = products.find((p) => p.id === productId);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [unitSymbol, setUnitSymbol] = useState('sqft');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [specification, setSpecification] = useState('');

  // Vendor selection state
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [primaryVendorId, setPrimaryVendorId] = useState<string>('');

  // Category reconciliation state
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [unapprovedVendors, setUnapprovedVendors] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && existingProduct) {
      setCode(existingProduct.code);
      setName(existingProduct.name);
      setCategoryId(existingProduct.categoryId);
      setBrand(existingProduct.brand || '');
      setUnitSymbol(existingProduct.unitSymbol);
      setBasePrice(existingProduct.basePrice);
      setSpecification(existingProduct.specification || '');
      setSelectedVendorIds(existingProduct.vendorIds || existingProduct.preferredVendorIds || []);
      setPrimaryVendorId(existingProduct.primaryPreferredVendorId || (existingProduct.vendorIds?.[0] || ''));
    } else {
      setCode(`PRD-${String(products.length + 1).padStart(3, '0')}`);
      if (categories.length > 0) setCategoryId(categories[0].id);
      if (units.length > 0) setUnitSymbol(units[0].symbol);
    }
  }, [isEditMode, existingProduct, products.length, categories, units]);

  // Eligible vendors for current category
  const eligibleVendors = categoryId ? getEligibleVendorsForCategory(state, categoryId) : [];

  // Handle Category Change with Reconciliation Check
  const handleCategoryChange = (newCatId: string) => {
    if (!newCatId || newCatId === categoryId) {
      setCategoryId(newCatId);
      return;
    }

    // Check if any currently selected vendors are NOT eligible for the new category
    const newCategoryEligibleVendors = getEligibleVendorsForCategory(state, newCatId);
    const eligibleIds = new Set(newCategoryEligibleVendors.map((v) => v.id));

    const invalidVendors = (state.vendors || []).filter(
      (v) => selectedVendorIds.includes(v.id) && !eligibleIds.has(v.id)
    );

    if (invalidVendors.length > 0) {
      setPendingCategoryId(newCatId);
      setUnapprovedVendors(invalidVendors.map((v) => ({ id: v.id, name: v.name, code: v.code })));
      setShowReconciliationModal(true);
    } else {
      setCategoryId(newCatId);
    }
  };

  const handleConfirmReconciliation = () => {
    if (pendingCategoryId) {
      const newCategoryEligibleVendors = getEligibleVendorsForCategory(state, pendingCategoryId);
      const eligibleIds = new Set(newCategoryEligibleVendors.map((v) => v.id));

      const filteredSelection = selectedVendorIds.filter((id) => eligibleIds.has(id));
      setSelectedVendorIds(filteredSelection);
      if (!eligibleIds.has(primaryVendorId)) {
        setPrimaryVendorId(filteredSelection[0] || '');
      }

      setCategoryId(pendingCategoryId);
    }
    setShowReconciliationModal(false);
    setPendingCategoryId(null);
    setUnapprovedVendors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim() || !name.trim() || !categoryId) {
      setErrorMessage('Product code, name, and category are required.');
      return;
    }

    if (basePrice < 0) {
      setErrorMessage('Base rate cannot be negative.');
      return;
    }

    // Code uniqueness check
    const isDuplicate = products.some(
      (p) => p.code.toLowerCase() === code.trim().toLowerCase() && p.id !== productId
    );

    if (isDuplicate) {
      setErrorMessage(`Product code '${code}' already exists. Code must be unique.`);
      return;
    }

    const matchedUnit = units.find((u) => u.symbol === unitSymbol);

    if (isEditMode && productId) {
      const priceHistory = existingProduct?.priceHistory || [];
      if (existingProduct && existingProduct.basePrice !== basePrice) {
        priceHistory.push({
          price: basePrice,
          effectiveDate: new Date().toISOString().split('T')[0],
        });
      }

      updateItem('products', productId, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        categoryId,
        brand: brand.trim(),
        unitId: matchedUnit?.id || `unit-${unitSymbol}`,
        unitSymbol,
        basePrice,
        basePriceEffectiveDate: new Date().toISOString().split('T')[0],
        specification: specification.trim(),
        vendorIds: selectedVendorIds,
        preferredVendorIds: selectedVendorIds,
        primaryPreferredVendorId: primaryVendorId || undefined,
        priceHistory,
      });
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        categoryId,
        brand: brand.trim(),
        unitId: matchedUnit?.id || `unit-${unitSymbol}`,
        unitSymbol,
        basePrice,
        basePriceEffectiveDate: new Date().toISOString().split('T')[0],
        specification: specification.trim(),
        vendorIds: selectedVendorIds,
        preferredVendorIds: selectedVendorIds,
        primaryPreferredVendorId: primaryVendorId || undefined,
        priceHistory: [{ price: basePrice, effectiveDate: new Date().toISOString().split('T')[0] }],
        isActive: true,
      };
      addItem('products', newProduct);
    }

    navigate('/masters/products');
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-[#F6F7F9] min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/masters/products')} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2">
              <Package className="h-6 w-6 text-[#B39A6A]" />
              {isEditMode ? `Edit Product: ${existingProduct?.name || ''}` : 'Add Product'}
            </h1>
            <p className="text-xs text-[#6E7889] mt-0.5">
              Define material specification, base rate, category linkages, and compliant vendor eligibility.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-[#F8E9EA] border border-[#B35E62]/30 rounded-md text-[#B35E62] text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form (Structured 4-Section Layout) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: PRODUCT IDENTITY */}
        <div className="bg-white border border-[#D9DEE7] rounded-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-[#D9DEE7] pb-2.5">
            <h2 className="text-sm font-bold text-[#172033]">1. Product Identity</h2>
            <p className="text-xs text-[#6E7889]">Basic master record identifiers and category classification</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Product Code <span className="text-[#B35E62]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PRD-PLY-18"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
              />
            </div>

            <div>
              <CreatableCombobox
                label="Item Category"
                required
                value={categoryId}
                options={categories.map((c) => ({
                  id: c.id,
                  label: `${c.code} - ${c.name}`,
                  description: c.description || 'Category',
                }))}
                searchPlaceholder="Search or select category..."
                onChange={(id) => handleCategoryChange(id)}
                onCreate={() => navigate('/masters/categories-factors')}
                createLabel={(q) => `+ Quick Add Category "${q}"`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Product / Material Name <span className="text-[#B35E62]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BWP Marine Grade Plywood 18mm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Brand / Manufacturer <span className="text-[#6E7889] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. CenturyPly / Greenlam"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: UNITS & PRICING */}
        <div className="bg-white border border-[#D9DEE7] rounded-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-[#D9DEE7] pb-2.5">
            <h2 className="text-sm font-bold text-[#172033]">2. Unit of Measurement & Pricing</h2>
            <p className="text-xs text-[#6E7889]">Base rate for estimation and rate benchmark</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <CreatableCombobox
                label="Base UOM"
                required
                value={units.find((u) => u.symbol === unitSymbol)?.id || ''}
                options={units.map((u) => ({
                  id: u.id,
                  label: `${u.name} (${u.symbol})`,
                  badge: u.symbol,
                }))}
                searchPlaceholder="Search unit..."
                onChange={(id) => {
                  const u = units.find((opt) => opt.id === id);
                  if (u) setUnitSymbol(u.symbol);
                }}
                canCreate={true}
                onCreate={() => navigate('/masters/uom')}
                createLabel={(q) => `+ Add Unit "${q}"`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Base Rate (₹) <span className="text-[#B35E62]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min={0}
                placeholder="0.00"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-bold text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: TECHNICAL DETAILS */}
        <div className="bg-white border border-[#D9DEE7] rounded-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-[#D9DEE7] pb-2.5">
            <h2 className="text-sm font-bold text-[#172033]">3. Technical Specifications</h2>
            <p className="text-xs text-[#6E7889]">Detailed material grade, compliance standards and notes</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Specification & Technical Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. IS:710 grade, boiling water proof, anti-termite treated"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none resize-none"
            />
          </div>
        </div>

        {/* SECTION 4: APPROVED & PREFERRED VENDORS (CATEGORY-BASED FILTERING) */}
        <div className="bg-white border border-[#D9DEE7] rounded-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-[#D9DEE7] pb-2.5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5C78A0]" />
                4. Approved & Preferred Category Suppliers
              </h2>
              <p className="text-xs text-[#6E7889]">
                Only active suppliers approved for{' '}
                <strong className="text-[#172033]">{selectedCategory?.name || 'the selected category'}</strong> are eligible.
              </p>
            </div>
            {categoryId && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#EAF4EF] text-[#4F8A72] rounded-md border border-[#4F8A72]/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {eligibleVendors.length} Eligible Suppliers
              </span>
            )}
          </div>

          {!categoryId ? (
            <div className="p-4 bg-[#F1F3F6] border border-[#D9DEE7] rounded-md text-xs text-[#6E7889] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#5C78A0] shrink-0" />
              <span>Select a category to view eligible suppliers.</span>
            </div>
          ) : eligibleVendors.length === 0 ? (
            <div className="p-4 bg-[#F8E9EA] border border-[#B35E62]/30 rounded-md text-xs text-[#B35E62]">
              No active suppliers are currently approved for category{' '}
              <strong>"{selectedCategory?.name}"</strong>. Update vendor category approvals in the Vendor Directory.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto border border-[#D9DEE7] rounded-md p-3 bg-[#F6F7F9]">
                {eligibleVendors.map((v) => {
                  const isSelected = selectedVendorIds.includes(v.id);
                  const isPrimary = primaryVendorId === v.id;

                  return (
                    <div
                      key={v.id}
                      className={`p-2.5 rounded-md border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-white border-[#B39A6A] shadow-2xs'
                          : 'bg-white/70 border-[#D9DEE7] hover:border-[#7186A2]'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSel = [...selectedVendorIds, v.id];
                              setSelectedVendorIds(newSel);
                              if (!primaryVendorId) setPrimaryVendorId(v.id);
                            } else {
                              const newSel = selectedVendorIds.filter((id) => id !== v.id);
                              setSelectedVendorIds(newSel);
                              if (primaryVendorId === v.id) setPrimaryVendorId(newSel[0] || '');
                            }
                          }}
                          className="rounded text-[#B39A6A] focus:ring-[#B39A6A]"
                        />
                        <div className="truncate">
                          <span className="text-xs font-bold text-[#172033] block truncate">{v.name}</span>
                          <span className="text-[11px] text-[#6E7889]">
                            {v.code} • {String(v.complianceStatus || 'Active')}
                          </span>
                        </div>
                      </label>

                      {isSelected && (
                        <button
                          type="button"
                          onClick={() => setPrimaryVendorId(v.id)}
                          className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition ${
                            isPrimary
                              ? 'bg-[#F1ECE2] text-[#B39A6A] border border-[#B39A6A]/40'
                              : 'text-[#6E7889] hover:text-[#172033] hover:bg-[#F1F3F6]'
                          }`}
                          title={isPrimary ? 'Primary Preferred Supplier' : 'Set as Primary Supplier'}
                        >
                          <Star className={`w-3 h-3 ${isPrimary ? 'fill-[#B39A6A] text-[#B39A6A]' : ''}`} />
                          {isPrimary ? 'Primary' : 'Make Primary'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9DEE7]">
          <Button type="button" variant="outline" onClick={() => navigate('/masters/products')}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#B39A6A] hover:bg-[#9E865A] text-[#172033] font-semibold border-none px-6 gap-2"
          >
            <Save className="h-4 w-4" /> Save Product
          </Button>
        </div>
      </form>

      {/* CATEGORY CHANGE RECONCILIATION CONFIRMATION MODAL (SECTION 4.2) */}
      {showReconciliationModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9DEE7] shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#B35E62]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#172033]">Vendor Eligibility Warning</h3>
            </div>

            <p className="text-xs text-[#263247] leading-relaxed">
              <strong className="text-[#B35E62]">{unapprovedVendors.length} selected suppliers</strong> are not approved for the new category (
              <strong className="text-[#172033]">
                {categories.find((c) => c.id === pendingCategoryId)?.name}
              </strong>
              ) and will be removed from preferred vendors:
            </p>

            <ul className="text-xs text-[#172033] bg-[#F8E9EA] p-3 rounded-md border border-[#B35E62]/30 space-y-1 font-medium max-h-36 overflow-y-auto">
              {unapprovedVendors.map((v) => (
                <li key={v.id} className="flex items-center justify-between">
                  <span>{v.name}</span>
                  <span className="font-mono text-[10px] text-[#B35E62]">{v.code}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-[#D9DEE7] flex flex-col gap-2">
              <Button
                className="w-full bg-[#B35E62] hover:bg-[#B35E62]/90 text-white font-semibold text-xs border-none justify-center"
                onClick={handleConfirmReconciliation}
              >
                Confirm & Remove Unapproved Vendors
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs font-semibold justify-center"
                onClick={() => {
                  setShowReconciliationModal(false);
                  setPendingCategoryId(null);
                  setUnapprovedVendors([]);
                }}
              >
                Revert Category Selection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProductPage;
