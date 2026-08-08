import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Category, PricingFactor, ParentGroup } from '../../domain/types';
import { generateNextCategoryCode, getProductsForCategory } from '../../domain/selectors';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import { CreatableCombobox } from '../../components/ui/CreatableCombobox';
import { ControlledSelect } from '../../components/ui/ControlledSelect';
import { QuickCreateParentGroupModal } from '../../components/masters/QuickCreateParentGroupModal';
import {
  FolderTree,
  Plus,
  Edit,
  Percent,
  DollarSign,
  Layers,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

const DEFAULT_PARENT_GROUPS: ParentGroup[] = [
  { id: 'pg-civil', name: 'Civil & Architectural', description: 'Structural, tiling, masonry & external works' },
  { id: 'pg-mep', name: 'MEP Services', description: 'Mechanical, electrical, plumbing & HVAC' },
  { id: 'pg-joinery', name: 'Furniture & Joinery', description: 'Doors, wall panelling, millwork & fixed furniture' },
  { id: 'pg-materials', name: 'General Materials', description: 'Hardware, glass, adhesives & raw materials' },
  { id: 'pg-[#B39A6A]contracting', name: 'Subcontracting', description: 'Turnkey execution packages & labor services' },
];

export const CategoriesFactorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, createCategory, updateCategory, deactivateCategory, reactivateCategory, addItem, updateItem } =
    useERPStore();

  const [activeTab, setActiveTab] = useState<'categories' | 'factors'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [parentGroupFilter, setParentGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals & Drawers
  const [showCatModal, setShowCatModal] = useState(false);
  const [showParentGroupModal, setShowParentGroupModal] = useState(false);
  const [showDuplicateWarningModal, setShowDuplicateWarningModal] = useState(false);
  const [showDeactivationWarningModal, setShowDeactivationWarningModal] = useState(false);
  const [showFactorModal, setShowFactorModal] = useState(false);

  // Parent groups state
  const [parentGroups, setParentGroups] = useState<ParentGroup[]>(DEFAULT_PARENT_GROUPS);

  // Editing state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deactivatingCategory, setDeactivatingCategory] = useState<Category | null>(null);
  const [editingFactor, setEditingFactor] = useState<PricingFactor | null>(null);

  // Category Form Fields
  const [catCode, setCatCode] = useState('');
  const [catName, setCatName] = useState('');
  const [parentGroupId, setParentGroupId] = useState<string>('');
  const [catDesc, setCatDesc] = useState('');
  const [catStatus, setCatStatus] = useState<'Active' | 'Inactive'>('Active');
  const [selectedFactorIds, setSelectedFactorIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [deactivationReason, setDeactivationReason] = useState<string>('');

  // Duplicate Check Target Category
  const [duplicateCategory, setDuplicateCategory] = useState<Category | null>(null);

  // Factor Form Fields
  const [factName, setFactName] = useState('');
  const [factCode, setFactCode] = useState('');
  const [factType, setFactType] = useState<'percentage' | 'fixed'>('percentage');
  const [factVal, setFactVal] = useState<number>(5);

  const categories = state.categories || [];
  const factors = state.factors || [];

  // Filtered Categories
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesParent =
      parentGroupFilter === 'all' ||
      (parentGroupFilter === 'none' && !c.parentGroupId) ||
      c.parentGroupId === parentGroupFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.isActive) ||
      (statusFilter === 'inactive' && !c.isActive);

    return matchesSearch && matchesParent && matchesStatus;
  });

  const filteredFactors = factors.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCatModal = (category?: Category) => {
    setFormError(null);
    if (category) {
      setEditingCategory(category);
      setCatCode(category.code);
      setCatName(category.name);
      setParentGroupId(category.parentGroupId || '');
      setCatDesc(category.description || '');
      setCatStatus(category.isActive ? 'Active' : 'Inactive');
      setSelectedFactorIds(category.defaultFactorIds || []);
    } else {
      setEditingCategory(null);
      setCatCode(generateNextCategoryCode(state));
      setCatName('');
      setParentGroupId('');
      setCatDesc('');
      setCatStatus('Active');
      setSelectedFactorIds([]);
    }
    setShowCatModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = catName.trim().replace(/\s+/g, ' ');
    if (!trimmedName) {
      setFormError('Category Name is required.');
      return;
    }

    // Normalized duplicate check
    const normalizedNewName = trimmedName.toLowerCase();
    const existingDuplicate = categories.find(
      (c) =>
        c.id !== editingCategory?.id &&
        c.name.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedNewName &&
        (c.parentGroupId || '') === (parentGroupId || '')
    );

    if (existingDuplicate) {
      setDuplicateCategory(existingDuplicate);
      setShowDuplicateWarningModal(true);
      return;
    }

    // Save
    if (editingCategory) {
      const res = updateCategory(editingCategory.id, {
        name: trimmedName,
        parentGroupId: parentGroupId || undefined,
        description: catDesc.trim() || undefined,
        isActive: catStatus === 'Active',
        defaultFactorIds: selectedFactorIds,
        updatedAt: new Date().toISOString(),
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to update category.');
        return;
      }
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        code: catCode,
        name: trimmedName,
        parentGroupId: parentGroupId || undefined,
        description: catDesc.trim() || undefined,
        isActive: catStatus === 'Active',
        defaultFactorIds: selectedFactorIds,
        createdAt: new Date().toISOString(),
      };
      const res = createCategory(newCat);
      if (!res.success) {
        setFormError(res.error || 'Failed to create category.');
        return;
      }
    }

    setShowCatModal(false);
  };

  const handleDeactivateClick = (cat: Category) => {
    const products = getProductsForCategory(state, cat.id);
    const activeProducts = products.filter((p) => p.isActive !== false);

    if (activeProducts.length > 0) {
      setDeactivatingCategory(cat);
      setDeactivationReason('');
      setShowDeactivationWarningModal(true);
    } else {
      deactivateCategory(cat.id, 'Deactivated from categories ledger');
    }
  };

  const handleConfirmDeactivation = () => {
    if (!deactivatingCategory) return;
    if (!deactivationReason.trim()) {
      alert('Please provide a reason for deactivation.');
      return;
    }
    deactivateCategory(deactivatingCategory.id, deactivationReason.trim());
    setShowDeactivationWarningModal(false);
    setDeactivatingCategory(null);
  };

  const handleOpenFactorModal = (factor?: PricingFactor) => {
    setFormError(null);
    if (factor) {
      setEditingFactor(factor);
      setFactCode(factor.code);
      setFactName(factor.name);
      setFactType(factor.calculationType);
      setFactVal(factor.defaultValue);
    } else {
      setEditingFactor(null);
      setFactCode(`FACT-${String(factors.length + 1).padStart(3, '0')}`);
      setFactName('');
      setFactType('percentage');
      setFactVal(5);
    }
    setShowFactorModal(true);
  };

  const handleSaveFactor = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!factName || !factCode) {
      setFormError('Factor code and name are required.');
      return;
    }

    if (editingFactor) {
      updateItem('factors', editingFactor.id, {
        code: factCode.trim().toUpperCase(),
        name: factName.trim(),
        calculationType: factType,
        defaultValue: factVal,
      });
    } else {
      const newFactor: any = {
        id: `fact-${Date.now()}`,
        code: factCode.trim().toUpperCase(),
        name: factName.trim(),
        calculationType: factType,
        defaultValue: factVal,
        basis: 'materialCost',
        isActive: true,
        effectiveDate: new Date().toISOString().split('T')[0],
        displayOrder: factors.length + 1,
      };
      addItem('factors', newFactor);
    }
    setShowFactorModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto bg-[#F6F7F9] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <FolderTree className="h-6 w-6 text-[#B39A6A]" />
            Item Categories
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Group products, materials and services for estimates and purchasing.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'categories' ? (
            <Button
              onClick={() => handleOpenCatModal()}
              className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          ) : (
            <Button
              onClick={() => handleOpenFactorModal()}
              className="bg-[#c3a267] hover:bg-[#b58b20] active:bg-[#a67c14] text-[#18181b] font-bold border border-[#a8821d]/40 shadow-sm focus:ring-[#c3a267]/60 h-10 px-4 text-xs rounded-lg gap-1.5 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Add Pricing Factor
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D9DEE7] pb-3">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`pb-2.5 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'categories'
                ? 'border-[#B39A6A] text-[#172033]'
                : 'border-transparent text-[#6E7889] hover:text-[#172033]'
            }`}
          >
            <Layers className="h-4 w-4 text-[#B39A6A]" /> Item Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('factors')}
            className={`pb-2.5 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'factors'
                ? 'border-[#B39A6A] text-[#172033]'
                : 'border-transparent text-[#6E7889] hover:text-[#172033]'
            }`}
          >
            <Percent className="h-4 w-4 text-[#B39A6A]" /> Pricing Factors ({factors.length})
          </button>
        </div>

        {activeTab === 'categories' && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Parent Group Filter */}
            <select
              value={parentGroupFilter}
              onChange={(e) => setParentGroupFilter(e.target.value)}
              className="px-3 py-1.5 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2]"
            >
              <option value="all">All Parent Groups</option>
              <option value="none">No Parent Group</option>
              {parentGroups.map((pg) => (
                <option key={pg.id} value={pg.id}>
                  {pg.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E7889]" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D9DEE7] rounded-md text-xs text-[#172033] focus:border-[#7186A2] outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Categories Table View */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-[#D9DEE7] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1F3F6] border-b border-[#D9DEE7] text-[11px] font-bold text-[#6E7889] uppercase tracking-wider">
                  <th className="py-3 px-4">Category Code</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Parent Group</th>
                  <th className="py-3 px-4">Active Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F6] text-sm">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#6E7889] text-xs">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const products = getProductsForCategory(state, cat.id);
                    const activeCount = products.filter((p) => p.isActive !== false).length;
                    const parentGroup = parentGroups.find((pg) => pg.id === cat.parentGroupId);
                    const formattedDate = cat.updatedAt
                      ? new Date(cat.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'Recently';

                    const rowActions: MasterActionItem[] = [
                      {
                        id: 'view',
                        label: 'View',
                        icon: ExternalLink,
                        onClick: () => navigate(`/masters/categories/${cat.id}`),
                      },
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: Edit,
                        onClick: () => handleOpenCatModal(cat),
                      },
                      {
                        id: 'view_products',
                        label: 'View Products',
                        icon: ExternalLink,
                        onClick: () => navigate(`/masters/products?categoryId=${cat.id}&status=active`),
                      },
                      {
                        id: 'manage_factors',
                        label: 'Manage Pricing Factors',
                        icon: Percent,
                        onClick: () => setActiveTab('factors'),
                      },
                      {
                        id: 'view_activity',
                        label: 'View Activity',
                        icon: ExternalLink,
                        onClick: () => navigate(`/masters/categories/${cat.id}`),
                      },
                      {
                        id: 'toggle_active',
                        label: cat.isActive ? 'Deactivate' : 'Reactivate',
                        icon: cat.isActive ? XCircle : CheckCircle,
                        variant: cat.isActive ? 'destructive' : 'primary',
                        onClick: () => {
                          if (cat.isActive) {
                            handleDeactivateClick(cat);
                          } else {
                            reactivateCategory(cat.id);
                          }
                        },
                      },
                    ];

                    return (
                      <tr key={cat.id} className="hover:bg-[#F6F7F9]/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-[#172033] font-bold">{cat.code}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#172033]">{cat.name}</div>
                          {cat.description && (
                            <div className="text-xs text-[#6E7889] truncate max-w-xs">{cat.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#263247]">
                          {parentGroup ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F1F3F6] text-[#263247] font-medium border border-[#D9DEE7]">
                              {parentGroup.name}
                            </span>
                          ) : (
                            <span className="text-[#6E7889] italic">No Parent Group</span>
                          )}
                        </td>

                        {/* CLICKABLE ACTIVE PRODUCT COUNT */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => navigate(`/masters/products?categoryId=${cat.id}&status=active`)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#B39A6A] hover:text-[#9E865A] hover:underline focus:outline-none focus:ring-1 focus:ring-[#7186A2] rounded px-1.5 py-0.5 bg-[#F1ECE2]/50 border border-[#B39A6A]/30 transition-colors"
                            aria-label={`View ${activeCount} active products in ${cat.name}`}
                          >
                            <span>{activeCount} Active Items</span>
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                              cat.isActive
                                ? 'bg-[#EAF4EF] text-[#4F8A72] border border-[#4F8A72]/30'
                                : 'bg-[#F1F3F6] text-[#6E7889] border border-[#D9DEE7]'
                            }`}
                          >
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs text-[#6E7889]">
                          {formattedDate}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <MasterRowActionsMenu ariaLabel={`Actions for ${cat.name}`} actions={rowActions} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Factors Table View */}
      {activeTab === 'factors' && (
        <div className="bg-white border border-[#D9DEE7] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1F3F6] border-b border-[#D9DEE7] text-[11px] font-bold text-[#6E7889] uppercase tracking-wider">
                  <th className="py-3 px-4">Factor Code</th>
                  <th className="py-3 px-4">Factor Name</th>
                  <th className="py-3 px-4">Calculation Type</th>
                  <th className="py-3 px-4">Default Value</th>
                  <th className="py-3 px-4">Basis</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F6] text-sm">
                {filteredFactors.map((fact) => (
                  <tr key={fact.id} className="hover:bg-[#F6F7F9]/70">
                    <td className="py-3 px-4 font-mono text-xs text-[#172033] font-bold">{fact.code}</td>
                    <td className="py-3 px-4 font-bold text-[#172033]">{fact.name}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F1F3F6] text-[#263247] rounded border border-[#D9DEE7]">
                        {fact.calculationType === 'percentage' ? (
                          <Percent className="h-3 w-3 text-[#B39A6A]" />
                        ) : (
                          <DollarSign className="h-3 w-3 text-[#4F8A72]" />
                        )}
                        {fact.calculationType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#172033]">
                      {fact.calculationType === 'percentage' ? `${fact.defaultValue}%` : `₹${fact.defaultValue}`}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#6E7889]">{fact.basis}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          fact.isActive
                            ? 'bg-[#EAF4EF] text-[#4F8A72] border border-[#4F8A72]/30'
                            : 'bg-[#F1F3F6] text-[#6E7889]'
                        }`}
                      >
                        {fact.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <MasterRowActionsMenu
                        ariaLabel={`Actions for ${fact.name}`}
                        actions={[
                          { id: 'edit', label: 'Edit Factor', icon: Edit, onClick: () => handleOpenFactorModal(fact) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FINAL CREATE/EDIT CATEGORY MODAL (COMPACT 640px-720px LAYOUT - SECTION 19.4 & 19.8) */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-[#D9DEE7] shadow-xl w-full max-w-[680px] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#172033]">
                  {editingCategory ? 'Edit Item Category' : 'Add Item Category'}
                </h2>
                <p className="text-xs text-[#6E7889]">
                  Create a category for products, materials or services.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="text-[#6E7889] hover:text-[#172033] p-1 rounded hover:bg-[#F1F3F6]"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-[#F8E9EA] border border-[#B35E62]/30 rounded text-[#B35E62] text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {/* Row 1: Category Code (Auto/Read-only) & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">Category Code</label>
                  <input
                    type="text"
                    disabled
                    value={catCode}
                    className="w-full px-3 py-2 text-sm text-[#6E7889] bg-[#F1F3F6] border border-[#D9DEE7] rounded-md font-mono cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-[#6E7889]">Generated automatically</p>
                </div>

                <div>
                  <ControlledSelect
                    label="Status"
                    value={catStatus}
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' },
                    ]}
                    onChange={(val) => setCatStatus(val as any)}
                  />
                </div>
              </div>

              {/* Row 2: Category Name (Full width) */}
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Category Name <span className="text-[#B35E62]">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Electrical & Lighting"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none focus:ring-2 focus:ring-[#7186A2]/20"
                />
              </div>

              {/* Row 3: Parent Group (Searchable Combobox with No Parent Group & Quick Create) */}
              <div>
                <CreatableCombobox
                  label="Parent Group"
                  value={parentGroupId}
                  options={[
                    { id: '', label: 'No Parent Group', description: 'Top-level root category' },
                    ...parentGroups.map((pg) => ({ id: pg.id, label: pg.name, description: pg.description })),
                  ]}
                  getOptionId={(opt) => opt.id}
                  getOptionLabel={(opt) => opt.label}
                  getOptionDescription={(opt) => opt.description || ''}
                  searchPlaceholder="Search or create parent group..."
                  canCreate={true}
                  createLabel={(query) => `Quick Create Parent Group "${query}"`}
                  onChange={(id) => setParentGroupId(id)}
                  onCreate={() => {
                    setShowParentGroupModal(true);
                  }}
                  helperText="Assign to a parent group or leave as root category."
                />
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Description</label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Add a short note about the products or services included in this category."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none focus:ring-2 focus:ring-[#7186A2]/20 resize-none"
                />
                <p className="mt-1 text-[11px] text-[#6E7889]">Add a short note about the products or services included in this category. Maximum 500 characters.</p>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#D9DEE7] flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCatModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#B39A6A] hover:bg-[#9E865A] text-[#172033] font-semibold border-none px-5"
                >
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CREATE PARENT GROUP MODAL */}
      <QuickCreateParentGroupModal
        isOpen={showParentGroupModal}
        onClose={() => setShowParentGroupModal(false)}
        onSave={(newGroup) => {
          const created: ParentGroup = {
            id: `pg-${Date.now()}`,
            name: newGroup.name,
            description: newGroup.description,
          };
          setParentGroups((prev) => [...prev, created]);
          setParentGroupId(created.id);
        }}
      />

      {/* DUPLICATE NAME WARNING MODAL (SECTION 19.6) */}
      {showDuplicateWarningModal && duplicateCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9DEE7] shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#B35E62]">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#172033]">Duplicate Category Name Detected</h3>
            </div>
            <p className="text-xs text-[#263247] leading-relaxed">
              A category with the name <strong className="text-[#172033]">"{catName.trim()}"</strong> already exists in the selected parent group ({duplicateCategory.code}).
            </p>

            <div className="pt-3 border-t border-[#D9DEE7] flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full text-xs font-semibold justify-center"
                onClick={() => {
                  setShowDuplicateWarningModal(false);
                  setShowCatModal(false);
                  handleOpenCatModal(duplicateCategory);
                }}
              >
                View Existing Category ({duplicateCategory.code})
              </Button>

              <Button
                className="w-full bg-[#B39A6A] hover:bg-[#9E865A] text-[#172033] text-xs font-semibold border-none justify-center"
                onClick={() => setShowDuplicateWarningModal(false)}
              >
                Choose Different Name
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DEACTIVATION WARNING MODAL (SECTION 19.7) */}
      {showDeactivationWarningModal && deactivatingCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9DEE7] shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#B08443]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#172033]">
                Deactivate {deactivatingCategory.name}?
              </h3>
            </div>

            <p className="text-xs text-[#263247] leading-relaxed">
              <strong className="text-[#172033]">
                {getProductsForCategory(state, deactivatingCategory.id).filter((p) => p.isActive !== false).length} active products
              </strong>{' '}
              currently use this category. Inactive categories cannot be selected for new products or transactions.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Deactivation Reason <span className="text-[#B35E62]">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Reason for deactivating category with active products..."
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2]"
              />
            </div>

            <div className="pt-3 border-t border-[#D9DEE7] flex items-center justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowDeactivationWarningModal(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setShowDeactivationWarningModal(false);
                  navigate(`/masters/products?categoryId=${deactivatingCategory.id}&status=active`);
                }}
              >
                View Linked Products
              </Button>
              <Button
                className="bg-[#B35E62] hover:bg-[#B35E62]/90 text-white font-semibold text-xs border-none"
                onClick={handleConfirmDeactivation}
              >
                Continue with Deactivation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Factor Modal */}
      {showFactorModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-[#D9DEE7] space-y-4">
            <h2 className="text-base font-bold text-[#172033]">
              {editingFactor ? 'Edit Pricing Factor' : 'Create Pricing Factor'}
            </h2>
            <form onSubmit={handleSaveFactor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Factor Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FACT-WAST"
                  value={factCode}
                  onChange={(e) => setFactCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D9DEE7] rounded-md outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Factor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wastage & Scrap Factor"
                  value={factName}
                  onChange={(e) => setFactName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D9DEE7] rounded-md outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">Type</label>
                  <select
                    value={factType}
                    onChange={(e) => setFactType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-[#D9DEE7] rounded-md outline-none bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">Default Value *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={factVal}
                    onChange={(e) => setFactVal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-[#D9DEE7] rounded-md outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowFactorModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#B39A6A] hover:bg-[#9E865A] text-[#172033] font-semibold border-none">
                  Save Pricing Factor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesFactorsPage;
