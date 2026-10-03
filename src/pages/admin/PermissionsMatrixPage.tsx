import React, { useState } from 'react';
import PrimaryActionButton from '../../components/common/PrimaryActionButton';
import {
  ShieldCheck,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  Search,
  CheckCircle,
  Filter,
  Users,
} from 'lucide-react';

export interface PermissionRow {
  id: string;
  moduleGroup: string;
  featureName: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  reject: boolean;
  export: boolean;
  print: boolean;
}

export interface RolePermissions {
  roleId: string;
  roleName: string;
  description: string;
  permissions: Record<string, PermissionRow>; // featureId -> PermissionRow
}

const MODULE_GROUPS = [
  '1. OVERVIEW & DASHBOARDS',
  '2. CRM & COMMERCIAL ESTIMATION',
  '3. PROJECTS & PLANNING',
  '4. PROCUREMENT',
  '5. INVENTORY & EXECUTION',
  '6. FINANCE, BILLING & PAYMENTS',
  '7. MASTER DATA',
  '8. REPORTS',
  '9. ADMINISTRATION',
];

const INITIAL_FEATURES = [
  // Overview
  { id: 'ov-dash', group: '1. OVERVIEW & DASHBOARDS', name: 'Executive Dashboard' },
  { id: 'ov-tasks', group: '1. OVERVIEW & DASHBOARDS', name: 'My Assigned Tasks' },
  { id: 'ov-notif', group: '1. OVERVIEW & DASHBOARDS', name: 'System Activity & Notifications' },
  { id: 'ov-cal', group: '1. OVERVIEW & DASHBOARDS', name: 'Company Calendar' },

  // CRM
  { id: 'crm-enq', group: '2. CRM & COMMERCIAL ESTIMATION', name: 'Client Enquiries' },
  { id: 'crm-est', group: '2. CRM & COMMERCIAL ESTIMATION', name: 'Cost Estimates & Builder' },
  { id: 'crm-rates', group: '2. CRM & COMMERCIAL ESTIMATION', name: 'Rate Analysis & Pricing Factors' },
  { id: 'crm-[#AB9570]', group: '2. CRM & COMMERCIAL ESTIMATION', name: 'Tender Decisions (Won / Lost)' },

  // Projects
  { id: 'prj-list', group: '3. PROJECTS & PLANNING', name: 'Active Projects Registry' },
  { id: 'prj-ws', group: '3. PROJECTS & PLANNING', name: 'Site Workspace & Timeline' },
  { id: 'prj-team', group: '3. PROJECTS & PLANNING', name: 'Project Team Assignments' },

  // Procurement
  { id: 'pro-ind', group: '4. PROCUREMENT', name: 'Material Requisition Indents' },
  { id: 'pro-rfq', group: '4. PROCUREMENT', name: 'RFQs & Vendor Quotations' },
  { id: 'pro-comp', group: '4. PROCUREMENT', name: 'Rate Comparison Matrix' },
  { id: 'pro-po', group: '4. PROCUREMENT', name: 'Purchase Orders Register' },
  { id: 'pro-wo', group: '4. PROCUREMENT', name: 'Subcontractor Work Orders' },

  // Inventory
  { id: 'inv-tok', group: '5. INVENTORY & EXECUTION', name: 'Material Entry Gate Tokens' },
  { id: 'inv-grn', group: '5. INVENTORY & EXECUTION', name: 'Goods Received Notes (GRN)' },
  { id: 'inv-qc', group: '5. INVENTORY & EXECUTION', name: 'Quality Control (QC) Inspections' },
  { id: 'inv-stock', group: '5. INVENTORY & EXECUTION', name: 'On-Site Stock Ledger' },
  { id: 'inv-[#AB9570]', group: '5. INVENTORY & EXECUTION', name: 'Inter-Site Material Movements' },

  // Finance
  { id: 'fin-ap', group: '6. FINANCE, BILLING & PAYMENTS', name: 'Vendor Accounts Payable' },
  { id: 'fin-sub', group: '6. FINANCE, BILLING & PAYMENTS', name: 'Subcontractor Bills Certification' },
  { id: 'fin-[#AB9570]', group: '6. FINANCE, BILLING & PAYMENTS', name: 'Client RA Billing' },
  { id: 'fin-inv', group: '6. FINANCE, BILLING & PAYMENTS', name: 'Direct Invoice Register' },
  { id: 'fin-util', group: '6. FINANCE, BILLING & PAYMENTS', name: 'Utility Bills & Overheads' },
  { id: 'fin-[#AB9570]', group: '6. FINANCE, BILLING & PAYMENTS', name: 'Staff Payroll & Salary Allocations' },

  // Masters
  { id: 'mst-cli', group: '7. MASTER DATA', name: 'Corporate Clients & Sponsors' },
  { id: 'mst-ven', group: '7. MASTER DATA', name: 'Vendors & Subcontractors' },
  { id: 'mst-itm', group: '7. MASTER DATA', name: 'Material & Item Catalog' },
  { id: 'mst-[#AB9570]', group: '7. MASTER DATA', name: 'Item Categories & UOMs' },
  { id: 'mst-bnk', group: '7. MASTER DATA', name: 'Corporate Bank Accounts' },
  { id: 'mst-[#AB9570]', group: '7. MASTER DATA', name: 'Project Sites & Locations' },

  // Reports
  { id: 'rep-prj', group: '8. REPORTS', name: 'Commercial & Project Reports' },
  { id: 'rep-pro', group: '8. REPORTS', name: 'Procurement & Material Reports' },
  { id: 'rep-[#AB9570]', group: '8. REPORTS', name: 'Stock & Inventory Reports' },
  { id: 'rep-[#AB9570]', group: '8. REPORTS', name: 'Financial Outlay Reports' },
  { id: 'rep-adm', group: '8. REPORTS', name: 'Admin Reports & Audit Logs' },

  // Admin
  { id: 'adm-dpt', group: '9. ADMINISTRATION', name: 'Department Master' },
  { id: 'adm-[#AB9570]', group: '9. ADMINISTRATION', name: 'Designation Master' },
  { id: 'adm-[#AB9570]', group: '9. ADMINISTRATION', name: 'Role Master & User Accounts' },
  { id: 'adm-[#AB9570]', group: '9. ADMINISTRATION', name: 'Permissions Matrix' },
  { id: 'adm-app', group: '9. ADMINISTRATION', name: 'Approval Matrix Rules' },
  { id: 'adm-set', group: '9. ADMINISTRATION', name: 'System Configuration' },
];

const ROLES_LIST = [
  { id: 'role-superadmin', name: 'Super Admin', isSuperAdmin: true, description: 'Full system administration access.' },
  { id: 'role-projhead', name: 'Project Head', isSuperAdmin: false, description: 'Project delivery, indents, and site approvals.' },
  { id: 'role-projmgr', name: 'Project Manager', isSuperAdmin: false, description: 'Site operations and day-to-day coordination.' },
  { id: 'role-prochead', name: 'Procurement Head', isSuperAdmin: false, description: 'Vendor sourcing, RFQs, and PO approvals.' },
  { id: 'role-finmgr', name: 'Finance Manager', isSuperAdmin: false, description: 'Invoice verification, AP, and payroll signoffs.' },
  { id: 'role-[#AB9570]', name: 'Billing & QS Engineer', isSuperAdmin: false, description: 'Quantity surveying and RA billing.' },
  { id: 'role-[#AB9570]', name: 'Store Manager', isSuperAdmin: false, description: 'Inventory receiving and material issues.' },
  { id: 'role-[#AB9570]', name: 'QC Engineer', isSuperAdmin: false, description: 'Quality checks and material inspections.' },
  { id: 'role-siteexec', name: 'Site Supervisor', isSuperAdmin: false, description: 'Field labor and execution supervision.' },
];

export const PermissionsMatrixPage: React.FC = () => {
  // Currently selected role
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-projhead');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper to build default permissions for a role
  const buildInitialPermissions = (roleId: string): Record<string, PermissionRow> => {
    const isSuper = roleId === 'role-superadmin';
    const isProjHead = roleId === 'role-projhead';
    const isFinMgr = roleId === 'role-finmgr';
    const isProcHead = roleId === 'role-prochead';

    const map: Record<string, PermissionRow> = {};

    INITIAL_FEATURES.forEach((feat) => {
      if (isSuper) {
        map[feat.id] = {
          id: feat.id,
          moduleGroup: feat.group,
          featureName: feat.name,
          view: true,
          create: true,
          edit: true,
          delete: true,
          approve: true,
          reject: true,
          export: true,
          print: true,
        };
      } else {
        const isFinance = feat.group.includes('FINANCE');
        const isProc = feat.group.includes('PROCUREMENT');
        const isAdmin = feat.group.includes('ADMINISTRATION');

        let canView = true;
        let canCreate = !isAdmin;
        let canEdit = !isAdmin;
        let canDelete = false;
        let canApprove = (isProjHead && !isFinance) || (isFinMgr && isFinance) || (isProcHead && isProc);
        let canReject = canApprove;

        if (isAdmin && !isSuper) {
          canCreate = false;
          canEdit = false;
          canDelete = false;
          canApprove = false;
          canReject = false;
        }

        map[feat.id] = {
          id: feat.id,
          moduleGroup: feat.group,
          featureName: feat.name,
          view: canView,
          create: canCreate,
          edit: canEdit,
          delete: canDelete,
          approve: canApprove,
          reject: canReject,
          export: true,
          print: true,
        };
      }
    });

    return map;
  };

  // State mapping roleId -> permissions matrix
  const [rolePermissionsState, setRolePermissionsState] = useState<
    Record<string, Record<string, PermissionRow>>
  >(() => {
    const stateMap: Record<string, Record<string, PermissionRow>> = {};
    ROLES_LIST.forEach((r) => {
      stateMap[r.id] = buildInitialPermissions(r.id);
    });
    return stateMap;
  });

  const selectedRoleObj = ROLES_LIST.find((r) => r.id === selectedRoleId) || ROLES_LIST[0];
  const isSuperAdmin = selectedRoleObj.isSuperAdmin;
  const currentMatrix = rolePermissionsState[selectedRoleId] || {};

  // Handlers for Toggling Checkboxes
  const handleCellToggle = (featureId: string, field: keyof PermissionRow) => {
    if (isSuperAdmin) return; // Super admin locked

    setRolePermissionsState((prev) => {
      const roleMap = { ...prev[selectedRoleId] };
      const row = { ...roleMap[featureId] };
      row[field] = !row[field] as any;
      roleMap[featureId] = row;
      return { ...prev, [selectedRoleId]: roleMap };
    });
  };

  const handleGroupAction = (groupName: string, action: 'selectAll' | 'clearAll') => {
    if (isSuperAdmin) return;

    setRolePermissionsState((prev) => {
      const roleMap = { ...prev[selectedRoleId] };
      INITIAL_FEATURES.filter((f) => f.group === groupName).forEach((f) => {
        const row = { ...roleMap[f.id] };
        const val = action === 'selectAll';
        row.view = val;
        row.create = val;
        row.edit = val;
        row.delete = val;
        row.approve = val;
        row.reject = val;
        row.export = val;
        row.print = val;
        roleMap[f.id] = row;
      });
      return { ...prev, [selectedRoleId]: roleMap };
    });
  };

  const handleColumnToggleAll = (field: keyof PermissionRow) => {
    if (isSuperAdmin) return;

    setRolePermissionsState((prev) => {
      const roleMap = { ...prev[selectedRoleId] };
      const allChecked = INITIAL_FEATURES.every((f) => roleMap[f.id]?.[field]);
      const newVal = !allChecked;

      INITIAL_FEATURES.forEach((f) => {
        if (roleMap[f.id]) {
          roleMap[f.id] = { ...roleMap[f.id], [field]: newVal as any };
        }
      });
      return { ...prev, [selectedRoleId]: roleMap };
    });
  };

  const handleSelectAllView = () => {
    if (isSuperAdmin) return;
    handleColumnToggleAll('view');
  };

  const handleSelectAllGlobal = () => {
    if (isSuperAdmin) return;
    setRolePermissionsState((prev) => {
      const roleMap = { ...prev[selectedRoleId] };
      INITIAL_FEATURES.forEach((f) => {
        roleMap[f.id] = {
          ...roleMap[f.id],
          view: true,
          create: true,
          edit: true,
          delete: true,
          approve: true,
          reject: true,
          export: true,
          print: true,
        };
      });
      return { ...prev, [selectedRoleId]: roleMap };
    });
  };

  const handleClearAllGlobal = () => {
    if (isSuperAdmin) return;
    setRolePermissionsState((prev) => {
      const roleMap = { ...prev[selectedRoleId] };
      INITIAL_FEATURES.forEach((f) => {
        roleMap[f.id] = {
          ...roleMap[f.id],
          view: false,
          create: false,
          edit: false,
          delete: false,
          approve: false,
          reject: false,
          export: false,
          print: false,
        };
      });
      return { ...prev, [selectedRoleId]: roleMap };
    });
  };

  const handleResetChanges = () => {
    setRolePermissionsState((prev) => ({
      ...prev,
      [selectedRoleId]: buildInitialPermissions(selectedRoleId),
    }));
  };

  const handleSavePermissions = () => {
    setToastMessage(`Permissions saved successfully for "${selectedRoleObj.name}".`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-emerald-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle className="h-5 w-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#AB9570]" />
            <h1 className="text-xl font-bold text-[#172033]">Permissions Matrix</h1>
          </div>
          <p className="text-xs text-[#6E7889] mt-1">
            Configure role-based access control (RBAC), operational page rights, and action permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChanges}
            className="px-3.5 py-2 text-xs font-semibold text-[#6E7889] bg-white border border-[#D9DEE7] rounded-lg hover:bg-[#F6F7F9] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <PrimaryActionButton
            label="Save Permissions"
            onClick={handleSavePermissions}
            icon={<Save className="h-4 w-4" />}
            id="btn-save-permissions"
          />
        </div>
      </div>

      {/* 2. Role Selector & Quick Action Bar */}
      <div className="bg-white p-4 border border-[#D9DEE7] rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#F1F3F6] pb-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Role Selection Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Users className="h-4 w-4 text-[#AB9570] shrink-0" />
              <label className="text-xs font-bold text-[#172033] whitespace-nowrap">
                Select Role:
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="px-3 py-2 bg-white border border-[#D9DEE7] rounded-lg text-xs font-bold text-[#172033] outline-none focus:border-[#7186A2] min-w-[220px]"
              >
                {ROLES_LIST.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isSuperAdmin ? '(System Locked)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Description */}
            <div className="text-xs text-[#6E7889] font-medium bg-[#F6F7F9] px-3 py-1.5 rounded-md border border-[#E9ECEF] w-full sm:w-auto">
              {selectedRoleObj.description}
            </div>
          </div>

          {/* Quick Action Matrix Toggles */}
          {!isSuperAdmin && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={handleSelectAllView}
                className="px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-semibold hover:bg-blue-100 transition-colors"
              >
                Toggle All View
              </button>
              <button
                onClick={handleSelectAllGlobal}
                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold hover:bg-emerald-100 transition-colors"
              >
                Select All Rights
              </button>
              <button
                onClick={handleClearAllGlobal}
                className="px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-semibold hover:bg-rose-100 transition-colors"
              >
                Clear All Rights
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter within permissions table */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E7889]" />
            <input
              type="text"
              placeholder="Search module or feature permission..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D9DEE7] rounded-lg text-xs text-[#172033] placeholder-[#6E7889] focus:outline-none focus:border-[#7186A2]"
            />
          </div>

          <div className="text-xs font-semibold text-[#6E7889]">
            Configuring <span className="text-[#172033] font-bold">{selectedRoleObj.name}</span>
          </div>
        </div>
      </div>

      {/* Super Admin Protected Alert */}
      {isSuperAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-3 shadow-xs">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-amber-900">Super Admin Permissions Protected</div>
            <div className="text-amber-800 text-[11px] mt-0.5">
              Super Admin permissions are locked by system policy to preserve administrative access across all ERP modules.
            </div>
          </div>
        </div>
      )}

      {/* 3. Grouped Permissions Table */}
      <div className="bg-white border border-[#D9DEE7] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F7F9] border-b border-[#D9DEE7] text-[11px] font-bold text-[#6E7889] uppercase tracking-wider select-none">
                <th className="py-3.5 px-4 min-w-[280px]">Module / Feature Name</th>
                <th className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => handleColumnToggleAll('view')}
                    disabled={isSuperAdmin}
                    className="hover:text-[#172033] transition-colors"
                  >
                    View
                  </button>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => handleColumnToggleAll('create')}
                    disabled={isSuperAdmin}
                    className="hover:text-[#172033] transition-colors"
                  >
                    Create
                  </button>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => handleColumnToggleAll('edit')}
                    disabled={isSuperAdmin}
                    className="hover:text-[#172033] transition-colors"
                  >
                    Edit
                  </button>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => handleColumnToggleAll('delete')}
                    disabled={isSuperAdmin}
                    className="hover:text-[#172033] transition-colors"
                  >
                    Delete
                  </button>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => handleColumnToggleAll('approve')}
                    disabled={isSuperAdmin}
                    className="hover:text-[#172033] transition-colors"
                  >
                    Approve
                  </button>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => handleColumnToggleAll('reject')}
                    disabled={isSuperAdmin}
                    className="hover:text-[#172033] transition-colors"
                  >
                    Reject
                  </button>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => handleColumnToggleAll('export')}
                    disabled={isSuperAdmin}
                    className="hover:text-[#172033] transition-colors"
                  >
                    Export
                  </button>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => handleColumnToggleAll('print')}
                    disabled={isSuperAdmin}
                    className="hover:text-[#172033] transition-colors"
                  >
                    Print
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F6] text-xs text-[#172033]">
              {MODULE_GROUPS.map((groupName) => {
                const groupFeatures = INITIAL_FEATURES.filter(
                  (f) =>
                    f.group === groupName &&
                    (searchQuery === '' ||
                      f.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
                );

                if (groupFeatures.length === 0) return null;

                return (
                  <React.Fragment key={groupName}>
                    {/* Group Header Row */}
                    <tr className="bg-[#F1F3F6]/80 font-bold text-[#172033] border-y border-[#D9DEE7]">
                      <td colSpan={9} className="py-2.5 px-4 text-xs tracking-wide">
                        <div className="flex items-center justify-between">
                          <span className="text-[#172033]">{groupName}</span>

                          {!isSuperAdmin && (
                            <div className="flex items-center gap-3 text-[11px] font-normal text-[#6E7889]">
                              <button
                                onClick={() => handleGroupAction(groupName, 'selectAll')}
                                className="text-blue-700 hover:underline font-semibold"
                              >
                                Select Group
                              </button>
                              <span>|</span>
                              <button
                                onClick={() => handleGroupAction(groupName, 'clearAll')}
                                className="text-rose-700 hover:underline font-semibold"
                              >
                                Clear Group
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Feature Rows */}
                    {groupFeatures.map((feat) => {
                      const perm = currentMatrix[feat.id] || {
                        view: false,
                        create: false,
                        edit: false,
                        delete: false,
                        approve: false,
                        reject: false,
                        export: false,
                        print: false,
                      };

                      return (
                        <tr key={feat.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#172033] pl-6">
                            {feat.name}
                          </td>

                          {(
                            [
                              'view',
                              'create',
                              'edit',
                              'delete',
                              'approve',
                              'reject',
                              'export',
                              'print',
                            ] as Array<keyof PermissionRow>
                          ).map((field) => (
                            <td key={field} className="py-3 px-3 text-center">
                              <button
                                type="button"
                                disabled={isSuperAdmin}
                                onClick={() => handleCellToggle(feat.id, field)}
                                className={`p-1 rounded transition-colors ${
                                  isSuperAdmin
                                    ? 'opacity-60 cursor-not-allowed text-emerald-600'
                                    : perm[field]
                                    ? 'text-[#AB9570] hover:text-[#8D7653]'
                                    : 'text-[#D9DEE7] hover:text-[#9AA5B5]'
                                }`}
                              >
                                {perm[field] ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
