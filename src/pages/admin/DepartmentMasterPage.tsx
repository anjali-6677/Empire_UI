import React, { useState, useRef } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Department } from '../../domain/types';
import PrimaryActionButton from '../../components/common/PrimaryActionButton';
import SummaryKpiCard from '../../components/common/SummaryKpiCard';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import {
  Building2,
  CheckCircle,
  XCircle,
  Users,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  History,
  Slash,
  UserCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const DepartmentMasterPage: React.FC = () => {
  const {
    state,
    createDepartment,
    updateDepartment,
    deactivateDepartment,
    activateDepartment,
  } = useERPStore();

  const departments = state.departments || [];
  const employees = state.employees || [];
  const designations = state.designations || [];
  const activityLogs = state.departmentActivityLogs || [];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatingDept, setDeactivatingDept] = useState<Department | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogsDept, setSelectedLogsDept] = useState<Department | null>(null);

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedUsersDept, setSelectedUsersDept] = useState<Department | null>(null);

  const [showDesigsModal, setShowDesigsModal] = useState(false);
  const [selectedDesigsDept, setSelectedDesigsDept] = useState<Department | null>(null);

  // Form Field State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Operations' as Department['type'],
    headEmployeeId: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // 3-Dot Row Action Menu State
  const [activeMenuDeptId, setActiveMenuDeptId] = useState<string | null>(null);
  const menuTriggerRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // KPI Calculations
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d) => d.status === 'Active').length;
  const inactiveDepartments = departments.filter((d) => d.status === 'Inactive').length;
  const activePercentage = totalDepartments > 0 ? Math.round((activeDepartments / totalDepartments) * 100) : 0;
  const totalUsersCount = employees.length;

  // Filtered Departments List
  const filteredDepartments = departments.filter((dept) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      dept.name.toLowerCase().includes(q) ||
      dept.code.toLowerCase().includes(q) ||
      (dept.headEmployeeName && dept.headEmployeeName.toLowerCase().includes(q)) ||
      (dept.description && dept.description.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'All' || dept.status === statusFilter;
    const matchesType = typeFilter === 'All' || dept.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handlers for Form Modal (Create / Edit)
  const handleOpenCreateModal = () => {
    setEditingDept(null);
    setFormData({
      code: '',
      name: '',
      type: 'Operations',
      headEmployeeId: '',
      description: '',
      status: 'Active',
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      type: dept.type || 'Operations',
      headEmployeeId: dept.headEmployeeId || '',
      description: dept.description || '',
      status: dept.status,
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const selectedHeadObj = employees.find((emp) => emp.id === formData.headEmployeeId);
    const headEmployeeName = selectedHeadObj ? selectedHeadObj.name : '';
    const headDesignationName = selectedHeadObj ? selectedHeadObj.designationName || '' : '';

    if (editingDept) {
      // Edit Department
      const res = updateDepartment(
        editingDept.id,
        {
          code: formData.code,
          name: formData.name,
          type: formData.type,
          headEmployeeId: formData.headEmployeeId,
          headEmployeeName: headEmployeeName,
          headDesignationName: headDesignationName,
          description: formData.description,
          status: formData.status,
        },
        'Admin User'
      );

      if (!res.success) {
        setFormError(res.error || 'Failed to update department.');
        return;
      }
    } else {
      // Create Department
      const res = createDepartment(
        {
          code: formData.code,
          name: formData.name,
          type: formData.type,
          headEmployeeId: formData.headEmployeeId,
          headEmployeeName: headEmployeeName,
          headDesignationName: headDesignationName,
          description: formData.description,
          status: formData.status,
        },
        'Admin User'
      );

      if (!res.success) {
        setFormError(res.error || 'Failed to create department.');
        return;
      }
    }

    setShowFormModal(false);
  };

  // Deactivation Handlers
  const handleOpenDeactivateModal = (dept: Department) => {
    setDeactivatingDept(dept);
    setDeactivationReason('');
    setDeactivateError(null);

    // Check if department has active employees assigned
    const activeEmployeesInDept = employees.filter(
      (e) => e.departmentId === dept.id && (e.status === 'active' || e.status === 'Active')
    );

    if (activeEmployeesInDept.length > 0) {
      setDeactivateError('Reassign active users before deactivating this department.');
    }

    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingDept) return;

    const res = deactivateDepartment(deactivatingDept.id, deactivationReason, 'Admin User');
    if (!res.success) {
      setDeactivateError(res.error || 'Failed to deactivate department.');
      return;
    }

    setShowDeactivateModal(false);
  };

  const handleActivateDepartment = (dept: Department) => {
    activateDepartment(dept.id, 'Admin User');
  };

  // Helper counts
  const getEmployeeCountForDept = (deptId: string) => {
    return employees.filter((e) => e.departmentId === deptId).length;
  };

  const getDesignationCountForDept = (deptId: string) => {
    return designations.filter((d) => d.departmentId === deptId).length;
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
            <Building2 className="h-6 w-6 text-[#AB9570]" />
            <h1 className="text-xl font-bold text-[#172033]">Department Master</h1>
          </div>
          <p className="text-xs text-[#6E7889] mt-1">
            Manage canonical organizational departments used across employees, designations, approval rules, and access control.
          </p>
        </div>
        <PrimaryActionButton
          label="Create Department"
          onClick={handleOpenCreateModal}
          id="btn-create-department"
        />
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryKpiCard
          title="TOTAL DEPARTMENTS"
          value={totalDepartments}
          subtitle="Configured Departments"
          icon={Building2}
          variant="gold"
        />
        <SummaryKpiCard
          title="ACTIVE"
          value={activeDepartments}
          subtitle={`${activePercentage}% Operational Rate`}
          icon={CheckCircle}
          variant="active"
        />
        <SummaryKpiCard
          title="INACTIVE"
          value={inactiveDepartments}
          subtitle="Deactivated Departments"
          icon={XCircle}
          variant="neutral"
        />
        <SummaryKpiCard
          title="TOTAL USERS"
          value={totalUsersCount}
          subtitle="Assigned Across Departments"
          icon={Users}
          variant="blue"
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
              placeholder="Search by name, code or department head..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#D9DEE7] rounded-lg text-xs text-[#172033] placeholder-[#6E7889] focus:outline-none focus:border-[#7186A2] transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-[#6E7889] shrink-0" />
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

          {/* Department Type Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-[#D9DEE7] rounded-lg text-xs text-[#172033] font-medium outline-none focus:border-[#7186A2]"
            >
              <option value="All">All Department Types</option>
              <option value="Corporate">Corporate</option>
              <option value="Project">Project</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#6E7889] whitespace-nowrap">
          Showing <span className="text-[#172033] font-bold">{filteredDepartments.length}</span> of {totalDepartments} Departments
        </div>
      </div>

      {/* 4. Department Register Table */}
      <div className="bg-white border border-[#D9DEE7] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F7F9] border-b border-[#D9DEE7] text-[11px] font-bold text-[#6E7889] uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Department Name</th>
                <th className="py-3.5 px-4">Department Head</th>
                <th className="py-3.5 px-4 text-center">Designations</th>
                <th className="py-3.5 px-4 text-center">Users</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created On</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F6] text-xs text-[#172033]">
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6E7889]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="h-8 w-8 text-[#9AA5B5]" />
                      <p className="font-semibold">No departments found matching your filter criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All');
                          setTypeFilter('All');
                        }}
                        className="text-xs text-[#AB9570] hover:underline font-bold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => {
                  const userCount = getEmployeeCountForDept(dept.id);
                  const desigCount = getDesignationCountForDept(dept.id);

                  return (
                    <tr key={dept.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Dept Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#172033]">
                        <span className="px-2 py-0.5 bg-[#F1F3F6] border border-[#D9DEE7] rounded text-[11px] tracking-wide">
                          {dept.code}
                        </span>
                      </td>

                      {/* Dept Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#172033]">{dept.name}</div>
                        {dept.type && (
                          <div className="text-[10px] font-medium text-[#6E7889] mt-0.5">
                            {dept.type}
                          </div>
                        )}
                      </td>

                      {/* Dept Head */}
                      <td className="py-3.5 px-4">
                        {dept.headEmployeeName ? (
                          <div>
                            <div className="font-semibold text-[#172033]">{dept.headEmployeeName}</div>
                            {dept.headDesignationName && (
                              <div className="text-[10px] text-[#6E7889]">{dept.headDesignationName}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#9AA5B5] italic text-[11px]">Not Assigned</span>
                        )}
                      </td>

                      {/* Designations Count */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedDesigsDept(dept);
                            setShowDesigsModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-50 border border-stone-200 text-stone-700 font-semibold text-[11px] hover:bg-stone-100 transition-colors"
                        >
                          <UserCheck className="h-3 w-3 text-[#AB9570]" />
                          <span>{desigCount}</span>
                        </button>
                      </td>

                      {/* Users Count */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedUsersDept(dept);
                            setShowUsersModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50/60 border border-blue-200/60 text-blue-700 font-semibold text-[11px] hover:bg-blue-100/60 transition-colors"
                        >
                          <Users className="h-3 w-3 text-blue-600" />
                          <span>{userCount}</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            dept.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              dept.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {dept.status}
                        </span>
                      </td>

                      {/* Created On */}
                      <td className="py-3.5 px-4 text-[#6E7889] text-[11px]">
                        {formatDate(dept.createdAt)}
                      </td>

                      {/* 3-Dot Actions Menu */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          ref={(el) => (menuTriggerRefs.current[dept.id] = el)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuDeptId(activeMenuDeptId === dept.id ? null : dept.id);
                          }}
                          className="p-1.5 rounded-lg text-[#6E7889] hover:text-[#172033] hover:bg-[#F1F3F6] transition-colors"
                          title="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Portal Action Menu */}
                        <RowActionMenu
                          isOpen={activeMenuDeptId === dept.id}
                          onClose={() => setActiveMenuDeptId(null)}
                          triggerRef={{ current: menuTriggerRefs.current[dept.id] }}
                        >
                          <RowActionMenuItem
                            label="View Details"
                            icon={<Eye className="h-4 w-4 text-slate-600" />}
                            onClick={() => {
                              setActiveMenuDeptId(null);
                              setViewingDept(dept);
                              setShowViewModal(true);
                            }}
                          />

                          <RowActionMenuItem
                            label="Edit Department"
                            icon={<Edit2 className="h-4 w-4 text-amber-600" />}
                            onClick={() => {
                              setActiveMenuDeptId(null);
                              handleOpenEditModal(dept);
                            }}
                          />

                          <RowActionMenuItem
                            label="View Linked Users"
                            icon={<Users className="h-4 w-4 text-blue-600" />}
                            onClick={() => {
                              setActiveMenuDeptId(null);
                              setSelectedUsersDept(dept);
                              setShowUsersModal(true);
                            }}
                          />

                          <RowActionMenuItem
                            label="View Designations"
                            icon={<UserCheck className="h-4 w-4 text-[#AB9570]" />}
                            onClick={() => {
                              setActiveMenuDeptId(null);
                              setSelectedDesigsDept(dept);
                              setShowDesigsModal(true);
                            }}
                          />

                          <RowActionMenuItem
                            label="Activity Log"
                            icon={<History className="h-4 w-4 text-purple-600" />}
                            onClick={() => {
                              setActiveMenuDeptId(null);
                              setSelectedLogsDept(dept);
                              setShowLogsModal(true);
                            }}
                          />

                          <RowActionMenuDivider />

                          {dept.status === 'Active' ? (
                            <RowActionMenuItem
                              label="Deactivate Department"
                              variant="danger"
                              icon={<Slash className="h-4 w-4" />}
                              onClick={() => {
                                setActiveMenuDeptId(null);
                                handleOpenDeactivateModal(dept);
                              }}
                            />
                          ) : (
                            <RowActionMenuItem
                              label="Activate Department"
                              variant="success"
                              icon={<CheckCircle className="h-4 w-4" />}
                              onClick={() => {
                                setActiveMenuDeptId(null);
                                handleActivateDepartment(dept);
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

      {/* Modal 1: Create / Edit Department */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[540px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#AB9570]" />
                <h2 className="text-base font-bold text-[#172033]">
                  {editingDept ? 'Edit Department' : 'Create Department'}
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

            {/* Form */}
            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Dept Code */}
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Department Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PROC"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2] uppercase placeholder:font-normal placeholder:normal-case"
                  />
                  <p className="text-[10px] text-[#6E7889] mt-1">Unique uppercase key code.</p>
                </div>

                {/* Dept Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Department Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2] font-medium"
                  >
                    <option value="Corporate">Corporate</option>
                    <option value="Project">Project</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              {/* Dept Name */}
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Department Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Procurement & Supply Chain"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2]"
                />
              </div>

              {/* Department Head */}
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Department Head
                </label>
                <select
                  value={formData.headEmployeeId}
                  onChange={(e) => setFormData({ ...formData, headEmployeeId: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2]"
                >
                  <option value="">-- Not Assigned --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} {emp.designationName ? `(${emp.designationName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of department scope and responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2] resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Status
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

              {/* Footer Actions */}
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
                  label={editingDept ? 'Update Department' : 'Save Department'}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Department Details */}
      {showViewModal && viewingDept && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[560px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#AB9570]" />
                <div>
                  <h2 className="text-base font-bold text-[#172033]">{viewingDept.name}</h2>
                  <span className="text-xs font-mono font-bold text-[#6E7889]">{viewingDept.code}</span>
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
                      viewingDept.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {viewingDept.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Department Type</span>
                  <span className="font-semibold text-[#172033]">{viewingDept.type || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Department Head</span>
                  <span className="font-bold text-[#172033]">{viewingDept.headEmployeeName || 'Not Assigned'}</span>
                  {viewingDept.headDesignationName && (
                    <div className="text-[10px] text-[#6E7889]">{viewingDept.headDesignationName}</div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Assigned Users</span>
                  <span className="font-bold text-blue-700">{getEmployeeCountForDept(viewingDept.id)} Employees</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-1">Description</span>
                <p className="p-3 bg-white border border-[#D9DEE7] rounded-lg text-xs leading-relaxed text-[#172033]">
                  {viewingDept.description || 'No description provided.'}
                </p>
              </div>

              <div className="border-t border-[#D9DEE7] pt-3 grid grid-cols-2 gap-2 text-[11px] text-[#6E7889]">
                <div>Created By: <span className="font-semibold text-[#172033]">{viewingDept.createdBy || 'System'}</span></div>
                <div>Created Date: <span className="font-semibold text-[#172033]">{formatDate(viewingDept.createdAt)}</span></div>
                {viewingDept.updatedBy && <div>Last Updated By: <span className="font-semibold text-[#172033]">{viewingDept.updatedBy}</span></div>}
                {viewingDept.updatedAt && <div>Last Updated Date: <span className="font-semibold text-[#172033]">{formatDate(viewingDept.updatedAt)}</span></div>}
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

      {/* Modal 3: Deactivation Confirmation */}
      {showDeactivateModal && deactivatingDept && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-rose-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600" />
                <h2 className="text-base font-bold text-rose-900">Deactivate Department</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="text-rose-700 hover:text-rose-950 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#172033]">
                Are you sure you want to deactivate department{' '}
                <strong className="text-[#172033]">{deactivatingDept.name}</strong> ({deactivatingDept.code})?
              </p>

              {deactivateError ? (
                <div className="p-3 bg-rose-100/70 border border-rose-300 rounded-lg text-rose-800 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>{deactivateError}</div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Deactivation Reason (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter reason for deactivating this department..."
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2] resize-none"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-[#D9DEE7] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6E7889] bg-white border border-[#D9DEE7] rounded-lg hover:bg-[#F6F7F9]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={Boolean(deactivateError)}
                  onClick={handleConfirmDeactivate}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deactivate Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Activity Log Modal */}
      {showLogsModal && selectedLogsDept && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[620px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600" />
                <div>
                  <h2 className="text-base font-bold text-[#172033]">Department Activity Log</h2>
                  <p className="text-xs text-[#6E7889]">{selectedLogsDept.name} ({selectedLogsDept.code})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="text-[#6E7889] hover:text-[#172033] p-1 rounded hover:bg-[#E9ECEF]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[460px] overflow-y-auto space-y-4">
              {activityLogs.filter((l) => l.departmentId === selectedLogsDept.id).length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6E7889]">
                  No activity logs recorded for this department yet.
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#D9DEE7] before:-z-0">
                  {activityLogs
                    .filter((l) => l.departmentId === selectedLogsDept.id)
                    .map((log) => (
                      <div key={log.id} className="relative flex items-start gap-3 pl-7">
                        <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-purple-600 border-2 border-white ring-1 ring-purple-200" />
                        <div className="bg-[#F9FAFB] p-3 rounded-lg border border-[#D9DEE7] w-full text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-purple-900">{log.action}</span>
                            <span className="text-[10px] text-[#6E7889]">{formatDate(log.timestamp)}</span>
                          </div>
                          <div className="text-[#6E7889] font-medium">Performed by: <span className="text-[#172033]">{log.user}</span></div>
                          {log.details && <p className="text-[#172033] pt-1">{log.details}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className="pt-4 border-t border-[#D9DEE7] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowLogsModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#172033] bg-[#F1F3F6] rounded-lg hover:bg-[#E9ECEF]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: View Users Modal */}
      {showUsersModal && selectedUsersDept && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[620px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="text-base font-bold text-[#172033]">Assigned Users & Staff</h2>
                  <p className="text-xs text-[#6E7889]">{selectedUsersDept.name} ({selectedUsersDept.code})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUsersModal(false)}
                className="text-[#6E7889] hover:text-[#172033] p-1 rounded hover:bg-[#E9ECEF]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {employees.filter((e) => e.departmentId === selectedUsersDept.id).length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6E7889]">
                  No active users or employees assigned to this department.
                </div>
              ) : (
                <div className="border border-[#D9DEE7] rounded-lg overflow-hidden max-h-[320px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F7F9] border-b border-[#D9DEE7] text-[10px] font-bold text-[#6E7889] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Emp Code</th>
                        <th className="py-2.5 px-3">Full Name</th>
                        <th className="py-2.5 px-3">Designation</th>
                        <th className="py-2.5 px-3">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F3F6]">
                      {employees
                        .filter((e) => e.departmentId === selectedUsersDept.id)
                        .map((emp) => (
                          <tr key={emp.id} className="hover:bg-[#F9FAFB]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#172033]">{emp.code}</td>
                            <td className="py-2.5 px-3 font-semibold text-[#172033]">{emp.name}</td>
                            <td className="py-2.5 px-3 text-[#6E7889]">{emp.designationName || 'N/A'}</td>
                            <td className="py-2.5 px-3 text-[#6E7889]">{emp.email}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-4 border-t border-[#D9DEE7] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUsersModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#172033] bg-[#F1F3F6] rounded-lg hover:bg-[#E9ECEF]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: View Designations Modal */}
      {showDesigsModal && selectedDesigsDept && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[580px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#AB9570]" />
                <div>
                  <h2 className="text-base font-bold text-[#172033]">Department Designations</h2>
                  <p className="text-xs text-[#6E7889]">{selectedDesigsDept.name} ({selectedDesigsDept.code})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDesigsModal(false)}
                className="text-[#6E7889] hover:text-[#172033] p-1 rounded hover:bg-[#E9ECEF]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {designations.filter((d) => d.departmentId === selectedDesigsDept.id).length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6E7889]">
                  No designations configured for this department yet.
                </div>
              ) : (
                <div className="border border-[#D9DEE7] rounded-lg overflow-hidden max-h-[320px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F7F9] border-b border-[#D9DEE7] text-[10px] font-bold text-[#6E7889] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3">Designation Title</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F3F6]">
                      {designations
                        .filter((d) => d.departmentId === selectedDesigsDept.id)
                        .map((desig) => (
                          <tr key={desig.id} className="hover:bg-[#F9FAFB]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#172033]">{desig.code}</td>
                            <td className="py-2.5 px-3 font-semibold text-[#172033]">{desig.name}</td>
                            <td className="py-2.5 px-3 text-[#6E7889]">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {desig.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-4 border-t border-[#D9DEE7] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDesigsModal(false)}
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

export default DepartmentMasterPage;
