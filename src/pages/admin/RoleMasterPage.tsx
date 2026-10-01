import React, { useState, useRef } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Role } from '../../domain/types';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { SummaryKpiCard } from '../../components/common/SummaryKpiCard';
import { RowActionMenu, RowActionMenuItem } from '../../components/common/RowActionMenu';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Users,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  Slash,
  AlertCircle,
  Plus,
  Shield,
  X,
  UserCheck,
} from 'lucide-react';

export const RoleMasterPage: React.FC = () => {
  const {
    state,
    createRole,
    updateRole,
    deactivateRole,
    activateRole,
  } = useERPStore();

  const roles = state.roles || [];
  const employees = state.employees || [];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Menu Trigger State for RowActionMenu
  const [activeMenuRoleId, setActiveMenuRoleId] = useState<string | null>(null);
  const menuTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatingRole, setDeactivatingRole] = useState<Role | null>(null);

  // Form Input State
  const [formRoleName, setFormRoleName] = useState('');
  const [formRoleCode, setFormRoleCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-generate normalized code from role name if user hasn't explicitly edited code
  const handleNameChange = (val: string) => {
    setFormRoleName(val);
    if (!editingRole && !formRoleCode) {
      const generated = val
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_');
      setFormRoleCode(generated);
    }
  };

  const handleCodeChange = (val: string) => {
    const normalized = val
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_');
    setFormRoleCode(normalized);
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormRoleName('');
    setFormRoleCode('');
    setFormDescription('');
    setFormStatus('Active');
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setFormRoleName(role.roleName || role.name || '');
    setFormRoleCode(role.roleId || '');
    setFormDescription(role.description || '');
    setFormStatus(role.status === 'Inactive' || role.status === 'inactive' ? 'Inactive' : 'Active');
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenView = (role: Role) => {
    setViewingRole(role);
    setShowViewModal(true);
  };

  const handleOpenDeactivate = (role: Role) => {
    setDeactivatingRole(role);
    setShowDeactivateModal(true);
  };

  // Helper: calculate live user count for a role
  const getRoleUserCount = (role: Role) => {
    const activeAssignedEmployees = employees.filter(
      (e) => (e.roleId === role.roleId || e.roleId === role.id) && (e.status === 'active' || e.status === 'Active')
    );
    return Math.max(role.userCount || 0, activeAssignedEmployees.length);
  };

  // Submit Form Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formRoleName.trim()) {
      setFormError('Role Name is required.');
      return;
    }

    if (!formRoleCode.trim()) {
      setFormError('Role Code is required.');
      return;
    }

    if (editingRole) {
      const res = updateRole(
        editingRole.id || editingRole.roleId,
        {
          roleName: formRoleName.trim(),
          description: formDescription.trim(),
          status: formStatus,
        },
        'Admin User'
      );

      if (!res.success) {
        setFormError(res.error || 'Failed to update role.');
        return;
      }

      showToast(`Role '${formRoleName}' updated successfully.`);
      setShowFormModal(false);
    } else {
      const res = createRole(
        {
          roleId: formRoleCode.trim(),
          roleName: formRoleName.trim(),
          description: formDescription.trim(),
          status: formStatus,
        },
        'Admin User'
      );

      if (!res.success) {
        setFormError(res.error || 'Failed to create role.');
        return;
      }

      showToast(`New Role '${formRoleName}' created successfully.`);
      setShowFormModal(false);
    }
  };

  // Confirm Deactivate / Activate Action
  const handleConfirmStatusToggle = () => {
    if (!deactivatingRole) return;

    const isCurrentlyActive = deactivatingRole.status === 'Active' || deactivatingRole.status === 'active' || !deactivatingRole.status;

    if (isCurrentlyActive) {
      const res = deactivateRole(deactivatingRole.id || deactivatingRole.roleId, 'Deactivated by admin', 'Admin User');
      if (!res.success) {
        showToast(res.error || 'Failed to deactivate role.', 'error');
        setShowDeactivateModal(false);
        return;
      }
      showToast(`Role '${deactivatingRole.roleName || deactivatingRole.name}' deactivated.`);
    } else {
      const res = activateRole(deactivatingRole.id || deactivatingRole.roleId, 'Admin User');
      if (!res.success) {
        showToast(res.error || 'Failed to activate role.', 'error');
        setShowDeactivateModal(false);
        return;
      }
      showToast(`Role '${deactivatingRole.roleName || deactivatingRole.name}' activated.`);
    }

    setShowDeactivateModal(false);
    setDeactivatingRole(null);
  };

  // Filtered Roles Dataset
  const filteredRoles = roles.filter((role) => {
    const q = searchQuery.toLowerCase().trim();
    const roleCode = (role.roleId || '').toLowerCase();
    const roleName = (role.roleName || role.name || '').toLowerCase();
    const desc = (role.description || '').toLowerCase();

    const matchesSearch = !q || roleCode.includes(q) || roleName.includes(q) || desc.includes(q);

    const isRoleActive = role.status === 'Active' || role.status === 'active' || !role.status;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && isRoleActive) ||
      (statusFilter === 'Inactive' && !isRoleActive);

    return matchesSearch && matchesStatus;
  });

  // Calculate Summary KPI Stats
  const totalRolesCount = roles.length;
  const activeRolesCount = roles.filter((r) => r.status === 'Active' || r.status === 'active' || !r.status).length;
  const inactiveRolesCount = totalRolesCount - activeRolesCount;
  const totalAssignedUsers = roles.reduce((acc, r) => acc + getRoleUserCount(r), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-[1300] px-4 py-3 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-slide-in ${
            toastType === 'success'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-rose-950 border-rose-800 text-rose-100'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle className="h-4 w-4 text-[#AB9570]" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span>Administration</span>
            <span>/</span>
            <span>Access Control</span>
            <span>/</span>
            <span className="text-[#AB9570]">Role</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-[#AB9570]" />
            Role Master
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage enterprise access control roles, system privilege flags, and assigned personnel.
          </p>
        </div>

        <div>
          <PrimaryActionButton
            label="Add Role"
            onClick={handleOpenCreate}
            icon={Plus}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryKpiCard
          title="TOTAL ROLES"
          value={totalRolesCount}
          subtitle="System security roles"
          icon={Shield}
          variant="gold"
        />
        <SummaryKpiCard
          title="ACTIVE ROLES"
          value={activeRolesCount}
          subtitle="In active use"
          icon={CheckCircle}
          variant="active"
        />
        <SummaryKpiCard
          title="INACTIVE ROLES"
          value={inactiveRolesCount}
          subtitle="Disabled roles"
          icon={XCircle}
          variant="neutral"
        />
        <SummaryKpiCard
          title="TOTAL ASSIGNED USERS"
          value={totalAssignedUsers}
          subtitle="Personnel linked to roles"
          icon={Users}
          variant="blue"
        />
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white border border-[#E2E6EC] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#AB9570] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-[#AB9570] cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Roles Register Table */}
      <div className="bg-white border border-[#E2E6EC] rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="px-4 py-3.5">Role Code</th>
                <th className="px-4 py-3.5">Role Name</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5 text-center">Assigned Users</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 space-y-1">
                    <ShieldCheck className="h-8 w-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                    <p className="text-sm font-bold text-slate-700">No Access Roles Found</p>
                    <p className="text-xs text-slate-400">
                      {searchQuery
                        ? `No roles match search criteria '${searchQuery}'.`
                        : 'Click + Add Role to create the first access control role.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => {
                  const roleKey = role.id || role.roleId;
                  const userCount = getRoleUserCount(role);
                  const isRoleActive = role.status === 'Active' || role.status === 'active' || !role.status;

                  return (
                    <tr key={roleKey} className="hover:bg-slate-50/80 transition-colors h-14">
                      <td className="px-4 py-3 align-middle">
                        <span className="font-mono font-extrabold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs">
                          {role.roleId}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <span className="font-extrabold text-slate-900 block text-xs">
                          {role.roleName || role.name}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle max-w-xs truncate text-slate-600">
                        {role.description || <span className="italic text-slate-400">No description provided</span>}
                      </td>

                      <td className="px-4 py-3 text-center align-middle">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-800">
                          <UserCheck className="h-3 w-3" />
                          {userCount} {userCount === 1 ? 'User' : 'Users'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center align-middle">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                            isRoleActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isRoleActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-slate-400" /> Inactive
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right align-middle">
                        <button
                          ref={(el) => {
                            menuTriggerRefs.current[roleKey] = el;
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuRoleId(activeMenuRoleId === roleKey ? null : roleKey);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        <RowActionMenu
                          isOpen={activeMenuRoleId === roleKey}
                          onClose={() => setActiveMenuRoleId(null)}
                          triggerRef={{ current: menuTriggerRefs.current[roleKey] }}
                        >
                          <RowActionMenuItem
                            icon={<Eye className="h-4 w-4 text-slate-600" />}
                            label="View Role Details"
                            onClick={() => {
                              setActiveMenuRoleId(null);
                              handleOpenView(role);
                            }}
                          />
                          <RowActionMenuItem
                            icon={<Edit2 className="h-4 w-4 text-slate-600" />}
                            label="Edit Role"
                            onClick={() => {
                              setActiveMenuRoleId(null);
                              handleOpenEdit(role);
                            }}
                          />
                          <RowActionMenuItem
                            icon={<Slash className="h-4 w-4 text-slate-600" />}
                            label={isRoleActive ? 'Deactivate Role' : 'Activate Role'}
                            variant={isRoleActive ? 'danger' : 'default'}
                            onClick={() => {
                              setActiveMenuRoleId(null);
                              handleOpenDeactivate(role);
                            }}
                          />
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

      {/* CREATE / EDIT ROLE MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#AB9570]" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                    {editingRole ? 'Edit Role Details' : 'Create New Access Control Role'}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    {editingRole
                      ? `Update role parameters for '${editingRole.roleName || editingRole.roleId}'.`
                      : 'Define code, name, and privileges for new enterprise role.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Procurement Approver"
                  value={formRoleName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#AB9570] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingRole}
                  placeholder="e.g. PROC_APPROVER"
                  value={formRoleCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className={`w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold ${
                    editingRole ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 focus:border-[#AB9570]'
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {editingRole
                    ? 'Role Code is normalized and immutable once registered.'
                    : 'Auto-normalized uppercase key (e.g., PROC_APPROVER). Must be unique.'}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe module permissions and approval authority limits..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#AB9570] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#AB9570] bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ROLE MODAL */}
      {showViewModal && viewingRole && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#AB9570]" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Role Details Overview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[9.5px]">Role Code</span>
                  <span className="font-mono font-extrabold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs">
                    {viewingRole.roleId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[9.5px]">Role Name</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {viewingRole.roleName || viewingRole.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[9.5px]">Status</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                    {viewingRole.status || 'Active'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[9.5px]">Assigned Personnel</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
                    {getRoleUserCount(viewingRole)} Active Users
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase text-[9.5px] block mb-1">Description & Scope</span>
                <p className="text-slate-700 font-medium bg-white border border-slate-200 p-3 rounded-xl leading-relaxed">
                  {viewingRole.description || 'No detailed scope description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEACTIVATE / ACTIVATE CONFIRMATION MODAL */}
      {showDeactivateModal && deactivatingRole && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Confirm Status Change</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Are you sure you want to change the status of role{' '}
                <strong className="text-slate-900">{deactivatingRole.roleName || deactivatingRole.roleId}</strong>?
              </p>

              {getRoleUserCount(deactivatingRole) > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Warning: This role is currently assigned to {getRoleUserCount(deactivatingRole)} active personnel. Reassign users before deactivating.
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusToggle}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
