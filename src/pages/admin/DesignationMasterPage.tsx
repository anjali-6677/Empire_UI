import React, { useState, useRef } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import PrimaryActionButton from '../../components/common/PrimaryActionButton';
import SummaryKpiCard from '../../components/common/SummaryKpiCard';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Building2,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  History,
  Slash,
  AlertCircle,
  Filter,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';

export interface DesignationRecord {
  id: string;
  code: string;
  name: string;
  departmentId?: string;
  departmentName: string;
  isProjectHead: boolean;
  description?: string;
  status: 'Active' | 'Inactive';
  userCount?: number;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
}

const INITIAL_DESIGNATIONS: DesignationRecord[] = [
  {
    id: 'des-1',
    code: 'DES-001',
    name: 'Project Director',
    departmentName: 'Project Execution & Engineering',
    isProjectHead: true,
    description: 'Executive head responsible for project delivery, site safety, and commercial signoffs.',
    status: 'Active',
    userCount: 3,
    createdAt: '2026-01-15',
    createdBy: 'System Admin',
  },
  {
    id: 'des-2',
    code: 'DES-002',
    name: 'Project Manager',
    departmentName: 'Project Execution & Engineering',
    isProjectHead: false,
    description: 'Manages day-to-day site operations, subcontractor progress, and material indents.',
    status: 'Active',
    userCount: 8,
    createdAt: '2026-01-18',
    createdBy: 'System Admin',
  },
  {
    id: 'des-3',
    code: 'DES-003',
    name: 'Procurement Head',
    departmentName: 'Procurement & Supply Chain',
    isProjectHead: false,
    description: 'Leads material sourcing, RFQ evaluations, rate comparison reviews, and PO signoffs.',
    status: 'Active',
    userCount: 2,
    createdAt: '2026-01-20',
    createdBy: 'System Admin',
  },
  {
    id: 'des-4',
    code: 'DES-004',
    name: 'Finance Manager',
    departmentName: 'Finance & Accounts',
    isProjectHead: false,
    description: 'Oversees vendor invoice verification, payment request approvals, and budget tracking.',
    status: 'Active',
    userCount: 4,
    createdAt: '2026-02-01',
    createdBy: 'System Admin',
  },
  {
    id: 'des-5',
    code: 'DES-005',
    name: 'Billing & QS Engineer',
    departmentName: 'Project Execution & Engineering',
    isProjectHead: false,
    description: 'Responsible for quantity surveying, joint measurement recording, and client RA billing.',
    status: 'Active',
    userCount: 6,
    createdAt: '2026-02-05',
    createdBy: 'System Admin',
  },
  {
    id: 'des-6',
    code: 'DES-006',
    name: 'Store Manager',
    departmentName: 'Stores & Inventory Management',
    isProjectHead: false,
    description: 'Manages site inventory receiving, gate token entry, material issues, and physical audits.',
    status: 'Active',
    userCount: 5,
    createdAt: '2026-02-10',
    createdBy: 'System Admin',
  },
  {
    id: 'des-7',
    code: 'DES-007',
    name: 'Quality Control Engineer',
    departmentName: 'Quality Control & Compliance',
    isProjectHead: false,
    description: 'Conducts material quality inspections, lab test checks, and site compliance signoffs.',
    status: 'Active',
    userCount: 4,
    createdAt: '2026-02-12',
    createdBy: 'System Admin',
  },
  {
    id: 'des-8',
    code: 'DES-008',
    name: 'Site Supervisor',
    departmentName: 'Project Execution & Engineering',
    isProjectHead: false,
    description: 'Directly supervises trade labor, joinery fitting work, and daily site progress.',
    status: 'Active',
    userCount: 12,
    createdAt: '2026-02-15',
    createdBy: 'System Admin',
  },
  {
    id: 'des-9',
    code: 'DES-009',
    name: 'Management Director',
    departmentName: 'Board Management',
    isProjectHead: true,
    description: 'Executive board member with full administrative and high-value financial approval rights.',
    status: 'Active',
    userCount: 2,
    createdAt: '2026-01-01',
    createdBy: 'System Admin',
  },
  {
    id: 'des-10',
    code: 'DES-010',
    name: 'Accounts Executive (Legacy)',
    departmentName: 'Finance & Accounts',
    isProjectHead: false,
    description: 'Legacy accounting entry role. Superceded by Finance Manager.',
    status: 'Inactive',
    userCount: 0,
    createdAt: '2025-11-10',
    createdBy: 'System Admin',
  },
];

export const DesignationMasterPage: React.FC = () => {
  const { state } = useERPStore();
  const departments = state.departments || [];

  // Local state for designations
  const [designations, setDesignations] = useState<DesignationRecord[]>(INITIAL_DESIGNATIONS);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDesig, setEditingDesig] = useState<DesignationRecord | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDesig, setViewingDesig] = useState<DesignationRecord | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    departmentName: 'Project Execution & Engineering',
    isProjectHead: false,
    description: '',
    status: 'Active' as 'Active' | 'Inactive',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // 3-Dot Row Action Menu State
  const [activeMenuDesigId, setActiveMenuDesigId] = useState<string | null>(null);
  const menuTriggerRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // KPI Calculations
  const totalDesignations = designations.length;
  const activeDesignations = designations.filter((d) => d.status === 'Active').length;
  const inactiveDesignations = designations.filter((d) => d.status === 'Inactive').length;
  const projectHeadCount = designations.filter((d) => d.isProjectHead).length;
  const activePercentage = totalDesignations > 0 ? Math.round((activeDesignations / totalDesignations) * 100) : 0;

  // Department options for dropdown
  const departmentOptions = Array.from(
    new Set([
      'Project Execution & Engineering',
      'Procurement & Supply Chain',
      'Finance & Accounts',
      'Stores & Inventory Management',
      'Quality Control & Compliance',
      'Board Management',
      'Administration',
      ...departments.map((d) => d.name),
    ])
  );

  // Filtered Designations List
  const filteredDesignations = designations.filter((desig) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      desig.name.toLowerCase().includes(q) ||
      desig.code.toLowerCase().includes(q) ||
      desig.departmentName.toLowerCase().includes(q) ||
      (desig.description && desig.description.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'All' || desig.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || desig.departmentName === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Handlers for Form Modal
  const handleOpenCreateModal = () => {
    setEditingDesig(null);
    const nextNum = designations.length + 1;
    const autoCode = `DES-${nextNum < 10 ? '00' : nextNum < 100 ? '0' : ''}${nextNum}`;

    setFormData({
      code: autoCode,
      name: '',
      departmentName: departmentOptions[0] || 'Project Execution & Engineering',
      isProjectHead: false,
      description: '',
      status: 'Active',
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (desig: DesignationRecord) => {
    setEditingDesig(desig);
    setFormData({
      code: desig.code,
      name: desig.name,
      departmentName: desig.departmentName,
      isProjectHead: desig.isProjectHead,
      description: desig.description || '',
      status: desig.status,
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSaveDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.code.trim() || !formData.name.trim()) {
      setFormError('Designation code and name are required.');
      return;
    }

    if (editingDesig) {
      // Edit Designation
      setDesignations((prev) =>
        prev.map((d) =>
          d.id === editingDesig.id
            ? {
                ...d,
                code: formData.code.toUpperCase(),
                name: formData.name,
                departmentName: formData.departmentName,
                isProjectHead: formData.isProjectHead,
                description: formData.description,
                status: formData.status,
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : d
        )
      );
    } else {
      // Create Designation
      const newDesig: DesignationRecord = {
        id: `des-${Date.now()}`,
        code: formData.code.toUpperCase(),
        name: formData.name,
        departmentName: formData.departmentName,
        isProjectHead: formData.isProjectHead,
        description: formData.description,
        status: formData.status,
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Admin User',
      };
      setDesignations((prev) => [newDesig, ...prev]);
    }

    setShowFormModal(false);
  };

  const handleToggleStatus = (desig: DesignationRecord) => {
    const newStatus = desig.status === 'Active' ? 'Inactive' : 'Active';
    setDesignations((prev) =>
      prev.map((d) => (d.id === desig.id ? { ...d, status: newStatus } : d))
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-[#AB9570]" />
            <h1 className="text-xl font-bold text-[#172033]">Designations</h1>
          </div>
          <p className="text-xs text-[#6E7889] mt-1">
            Manage employee designations, reporting levels and project responsibility roles across departments.
          </p>
        </div>
        <PrimaryActionButton
          label="Create Designation"
          onClick={handleOpenCreateModal}
          id="btn-create-designation"
        />
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryKpiCard
          title="TOTAL DESIGNATIONS"
          value={totalDesignations}
          subtitle="Configured Master Roles"
          icon={UserCheck}
          variant="gold"
        />
        <SummaryKpiCard
          title="ACTIVE DESIGNATIONS"
          value={activeDesignations}
          subtitle={`${activePercentage}% Operational Rate`}
          icon={CheckCircle}
          variant="active"
        />
        <SummaryKpiCard
          title="PROJECT HEAD ROLES"
          value={projectHeadCount}
          subtitle="Key Signoff Authority"
          icon={Briefcase}
          variant="amber"
        />
        <SummaryKpiCard
          title="INACTIVE"
          value={inactiveDesignations}
          subtitle="Deactivated Roles"
          icon={XCircle}
          variant="neutral"
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 border border-[#D9DEE7] rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E7889]" />
            <input
              type="text"
              placeholder="Search by designation name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#D9DEE7] rounded-lg text-xs text-[#172033] placeholder-[#6E7889] focus:outline-none focus:border-[#7186A2] transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-[#6E7889] shrink-0" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-[#D9DEE7] rounded-lg text-xs text-[#172033] font-medium outline-none focus:border-[#7186A2]"
            >
              <option value="All">All Departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-[#D9DEE7] rounded-lg text-xs text-[#172033] font-medium outline-none focus:border-[#7186A2]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#6E7889] whitespace-nowrap">
          Showing <span className="text-[#172033] font-bold">{filteredDesignations.length}</span> of {totalDesignations} Designations
        </div>
      </div>

      {/* 4. Designation Table */}
      <div className="bg-white border border-[#D9DEE7] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F7F9] border-b border-[#D9DEE7] text-[11px] font-bold text-[#6E7889] uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Designation Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-center">Project Head</th>
                <th className="py-3.5 px-4 text-center">Assigned Users</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F6] text-xs text-[#172033]">
              {filteredDesignations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6E7889]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="h-8 w-8 text-[#9AA5B5]" />
                      <p className="font-semibold">No designations found matching your filter criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All');
                          setDepartmentFilter('All');
                        }}
                        className="text-xs text-[#AB9570] hover:underline font-bold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDesignations.map((desig) => {
                  return (
                    <tr key={desig.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#172033]">
                        <span className="px-2 py-0.5 bg-[#F1F3F6] border border-[#D9DEE7] rounded text-[11px] tracking-wide">
                          {desig.code}
                        </span>
                      </td>

                      {/* Name & Description */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#172033]">{desig.name}</div>
                        {desig.description && (
                          <div className="text-[10px] text-[#6E7889] truncate max-w-xs mt-0.5">
                            {desig.description}
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#172033]">{desig.departmentName}</span>
                      </td>

                      {/* Project Head Role */}
                      <td className="py-3.5 px-4 text-center">
                        {desig.isProjectHead ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            No
                          </span>
                        )}
                      </td>

                      {/* Assigned Users Count */}
                      <td className="py-3.5 px-4 text-center font-semibold text-[#172033]">
                        {desig.userCount ?? 0}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            desig.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              desig.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {desig.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-[#6E7889] text-[11px]">
                        {formatDate(desig.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          ref={(el) => (menuTriggerRefs.current[desig.id] = el)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuDesigId(activeMenuDesigId === desig.id ? null : desig.id);
                          }}
                          className="p-1.5 rounded-lg text-[#6E7889] hover:text-[#172033] hover:bg-[#F1F3F6] transition-colors"
                          title="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        <RowActionMenu
                          isOpen={activeMenuDesigId === desig.id}
                          onClose={() => setActiveMenuDesigId(null)}
                          triggerRef={{ current: menuTriggerRefs.current[desig.id] }}
                        >
                          <RowActionMenuItem
                            label="View Details"
                            icon={<Eye className="h-4 w-4 text-slate-600" />}
                            onClick={() => {
                              setActiveMenuDesigId(null);
                              setViewingDesig(desig);
                              setShowViewModal(true);
                            }}
                          />

                          <RowActionMenuItem
                            label="Edit Designation"
                            icon={<Edit2 className="h-4 w-4 text-amber-600" />}
                            onClick={() => {
                              setActiveMenuDesigId(null);
                              handleOpenEditModal(desig);
                            }}
                          />

                          <RowActionMenuDivider />

                          {desig.status === 'Active' ? (
                            <RowActionMenuItem
                              label="Deactivate Designation"
                              variant="danger"
                              icon={<Slash className="h-4 w-4" />}
                              onClick={() => {
                                setActiveMenuDesigId(null);
                                handleToggleStatus(desig);
                              }}
                            />
                          ) : (
                            <RowActionMenuItem
                              label="Activate Designation"
                              variant="success"
                              icon={<CheckCircle className="h-4 w-4" />}
                              onClick={() => {
                                setActiveMenuDesigId(null);
                                handleToggleStatus(desig);
                              }}
                            />
                          )}
                        </RowActionMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Modal 1: Create / Edit Designation */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[540px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#AB9570]" />
                <h2 className="text-base font-bold text-[#172033]">
                  {editingDesig ? 'Edit Designation' : 'Create Designation'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-[#6E7889] hover:text-[#172033] p-1 rounded hover:bg-[#E9ECEF]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDesignation} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Designation Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DES-011"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2] uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Status <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2] font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Designation Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Quantity Surveyor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Department <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2] font-medium"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-project-head"
                  checked={formData.isProjectHead}
                  onChange={(e) => setFormData({ ...formData, isProjectHead: e.target.checked })}
                  className="h-4 w-4 rounded border-[#D9DEE7] text-[#AB9570] focus:ring-[#AB9570]"
                />
                <label htmlFor="chk-project-head" className="text-xs font-semibold text-[#172033] cursor-pointer">
                  Is Project Head / Authority Signoff Role?
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Scope & Responsibilities Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of duties, signoff thresholds, and reporting lines..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2] resize-none"
                />
              </div>

              <div className="pt-4 border-t border-[#D9DEE7] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6E7889] bg-white border border-[#D9DEE7] rounded-lg hover:bg-[#F6F7F9]"
                >
                  Cancel
                </button>
                <PrimaryActionButton
                  type="submit"
                  label={editingDesig ? 'Update Designation' : 'Save Designation'}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Designation Details */}
      {showViewModal && viewingDesig && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#AB9570]" />
                <div>
                  <h2 className="text-base font-bold text-[#172033]">{viewingDesig.name}</h2>
                  <span className="text-xs font-mono font-bold text-[#6E7889]">{viewingDesig.code}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="text-[#6E7889] hover:text-[#172033] p-1 rounded hover:bg-[#E9ECEF]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-[#172033]">
              <div className="grid grid-cols-2 gap-4 bg-[#F9FAFB] p-4 rounded-lg border border-[#D9DEE7]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Status</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      viewingDesig.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {viewingDesig.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Project Head Role</span>
                  <span className="font-semibold text-[#172033]">{viewingDesig.isProjectHead ? 'Yes' : 'No'}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Department</span>
                  <span className="font-bold text-[#172033]">{viewingDesig.departmentName}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Assigned Users</span>
                  <span className="font-bold text-blue-700">{viewingDesig.userCount ?? 0} Staff</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-1">Description</span>
                <p className="p-3 bg-white border border-[#D9DEE7] rounded-lg text-xs leading-relaxed text-[#172033]">
                  {viewingDesig.description || 'No description provided.'}
                </p>
              </div>

              <div className="border-t border-[#D9DEE7] pt-3 grid grid-cols-2 gap-2 text-[11px] text-[#6E7889]">
                <div>Created By: <span className="font-semibold text-[#172033]">{viewingDesig.createdBy || 'System'}</span></div>
                <div>Created Date: <span className="font-semibold text-[#172033]">{formatDate(viewingDesig.createdAt)}</span></div>
              </div>

              <div className="pt-4 border-t border-[#D9DEE7] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#172033] bg-[#F1F3F6] rounded-lg hover:bg-[#E9ECEF]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
