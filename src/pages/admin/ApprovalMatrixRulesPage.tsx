import React, { useState, useRef } from 'react';
import PrimaryActionButton from '../../components/common/PrimaryActionButton';
import SummaryKpiCard from '../../components/common/SummaryKpiCard';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import {
  CheckCircle,
  XCircle,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  Copy,
  Slash,
  AlertCircle,
  Filter,
  Layers,
  FileCheck,
  Plus,
  Trash2,
  ArrowRight,
  Shield,
  IndianRupee,
} from 'lucide-react';

export interface ApprovalLevel {
  id: string;
  stepNumber: number;
  roleName: string;
  isMandatory: boolean;
  amountThreshold?: number;
}

export interface ApprovalRuleRecord {
  id: string;
  ruleCode: string;
  ruleName: string;
  module: string;
  transactionType: string;
  projectScope: 'All Projects' | 'Site Specific';
  siteName?: string;
  minAmount: number;
  maxAmount: number | null; // null = Unlimited
  levels: ApprovalLevel[];
  status: 'Active' | 'Inactive';
  createdAt: string;
  createdBy?: string;
}

const INITIAL_RULES: ApprovalRuleRecord[] = [
  {
    id: 'apr-1',
    ruleCode: 'APR-001',
    ruleName: 'Standard Purchase Order Signoff',
    module: 'Purchase Orders',
    transactionType: 'PO Authorization',
    projectScope: 'All Projects',
    minAmount: 0,
    maxAmount: 500000,
    levels: [
      { id: 'l1', stepNumber: 1, roleName: 'Procurement Head', isMandatory: true, amountThreshold: 0 },
      { id: 'l2', stepNumber: 2, roleName: 'Project Head', isMandatory: true, amountThreshold: 100000 },
    ],
    status: 'Active',
    createdAt: '2026-01-15',
    createdBy: 'System Admin',
  },
  {
    id: 'apr-2',
    ruleCode: 'APR-002',
    ruleName: 'High Value PO Board Approval',
    module: 'Purchase Orders',
    transactionType: 'PO Authorization',
    projectScope: 'All Projects',
    minAmount: 500000,
    maxAmount: null, // Unlimited
    levels: [
      { id: 'l1', stepNumber: 1, roleName: 'Procurement Head', isMandatory: true },
      { id: 'l2', stepNumber: 2, roleName: 'Project Head', isMandatory: true },
      { id: 'l3', stepNumber: 3, roleName: 'Chairman / Board Approver', isMandatory: true },
    ],
    status: 'Active',
    createdAt: '2026-01-16',
    createdBy: 'System Admin',
  },
  {
    id: 'apr-3',
    ruleCode: 'APR-003',
    ruleName: 'Material Indent Requisition Flow',
    module: 'Material Indents',
    transactionType: 'Indent Approval',
    projectScope: 'All Projects',
    minAmount: 0,
    maxAmount: null,
    levels: [
      { id: 'l1', stepNumber: 1, roleName: 'Project Head', isMandatory: true },
      { id: 'l2', stepNumber: 2, roleName: 'Procurement Head', isMandatory: true },
    ],
    status: 'Active',
    createdAt: '2026-01-20',
    createdBy: 'System Admin',
  },
  {
    id: 'apr-4',
    ruleCode: 'APR-004',
    ruleName: 'Subcontractor Bill Certification',
    module: 'Subcontractor Bills',
    transactionType: 'WIP Bill Signoff',
    projectScope: 'All Projects',
    minAmount: 0,
    maxAmount: null,
    levels: [
      { id: 'l1', stepNumber: 1, roleName: 'Billing & QS Engineer', isMandatory: true },
      { id: 'l2', stepNumber: 2, roleName: 'Project Head', isMandatory: true },
      { id: 'l3', stepNumber: 3, roleName: 'Finance Manager', isMandatory: true },
    ],
    status: 'Active',
    createdAt: '2026-02-01',
    createdBy: 'System Admin',
  },
  {
    id: 'apr-5',
    ruleCode: 'APR-005',
    ruleName: 'Direct AP Vendor Invoice Signoff',
    module: 'Vendor AP',
    transactionType: 'Invoice Clearance',
    projectScope: 'All Projects',
    minAmount: 0,
    maxAmount: 1000000,
    levels: [
      { id: 'l1', stepNumber: 1, roleName: 'Finance Manager', isMandatory: true },
    ],
    status: 'Active',
    createdAt: '2026-02-05',
    createdBy: 'System Admin',
  },
  {
    id: 'apr-6',
    ruleCode: 'APR-006',
    ruleName: 'Client RA Bill Final Release',
    module: 'Client RA Bills',
    transactionType: 'RA Bill Finalization',
    projectScope: 'All Projects',
    minAmount: 0,
    maxAmount: null,
    levels: [
      { id: 'l1', stepNumber: 1, roleName: 'Billing & QS Engineer', isMandatory: true },
      { id: 'l2', stepNumber: 2, roleName: 'Project Head', isMandatory: true },
    ],
    status: 'Inactive',
    createdAt: '2025-12-10',
    createdBy: 'System Admin',
  },
];

const MODULE_OPTIONS = [
  'Purchase Orders',
  'Material Indents',
  'Subcontractor Bills',
  'Client RA Bills',
  'Vendor AP',
  'Direct Invoices',
  'Budget Revisions',
];

const ROLE_OPTIONS = [
  'Project Head',
  'Procurement Head',
  'Finance Manager',
  'Billing & QS Engineer',
  'Chairman / Board Approver',
  'Store Manager',
  'QC Engineer',
  'Site Supervisor',
];

export const ApprovalMatrixRulesPage: React.FC = () => {
  const [rules, setRules] = useState<ApprovalRuleRecord[]>(INITIAL_RULES);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [scopeFilter, setScopeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRuleRecord | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRule, setViewingRule] = useState<ApprovalRuleRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    ruleCode: '',
    ruleName: '',
    module: MODULE_OPTIONS[0],
    transactionType: 'General Authorization',
    projectScope: 'All Projects' as 'All Projects' | 'Site Specific',
    siteName: '',
    minAmount: 0,
    isUnlimitedMax: true,
    maxAmount: 1000000,
    status: 'Active' as 'Active' | 'Inactive',
    levels: [
      { id: 'l-1', stepNumber: 1, roleName: 'Project Head', isMandatory: true, amountThreshold: 0 },
    ] as ApprovalLevel[],
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Row Action Menu State
  const [activeMenuRuleId, setActiveMenuRuleId] = useState<string | null>(null);
  const menuTriggerRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // KPI Calculations
  const totalRules = rules.length;
  const activeRules = rules.filter((r) => r.status === 'Active').length;
  const multiLevelRules = rules.filter((r) => r.levels.length > 1).length;
  const coveredModules = new Set(rules.map((r) => r.module)).size;

  // Filtered Rules List
  const filteredRules = rules.filter((rule) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      rule.ruleCode.toLowerCase().includes(q) ||
      rule.ruleName.toLowerCase().includes(q) ||
      rule.module.toLowerCase().includes(q) ||
      rule.transactionType.toLowerCase().includes(q);

    const matchesModule = moduleFilter === 'All' || rule.module === moduleFilter;
    const matchesScope = scopeFilter === 'All' || rule.projectScope === scopeFilter;
    const matchesStatus = statusFilter === 'All' || rule.status === statusFilter;

    return matchesSearch && matchesModule && matchesScope && matchesStatus;
  });

  // Handlers for Form Modal
  const handleOpenCreateModal = () => {
    setEditingRule(null);
    const nextNum = rules.length + 1;
    const autoCode = `APR-${nextNum < 10 ? '00' : nextNum < 100 ? '0' : ''}${nextNum}`;

    setFormData({
      ruleCode: autoCode,
      ruleName: '',
      module: MODULE_OPTIONS[0],
      transactionType: 'Authorization Signoff',
      projectScope: 'All Projects',
      siteName: '',
      minAmount: 0,
      isUnlimitedMax: true,
      maxAmount: 1000000,
      status: 'Active',
      levels: [
        { id: 'l-1', stepNumber: 1, roleName: 'Project Head', isMandatory: true, amountThreshold: 0 },
        { id: 'l-2', stepNumber: 2, roleName: 'Finance Manager', isMandatory: true, amountThreshold: 500000 },
      ],
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (rule: ApprovalRuleRecord) => {
    setEditingRule(rule);
    setFormData({
      ruleCode: rule.ruleCode,
      ruleName: rule.ruleName,
      module: rule.module,
      transactionType: rule.transactionType,
      projectScope: rule.projectScope,
      siteName: rule.siteName || '',
      minAmount: rule.minAmount,
      isUnlimitedMax: rule.maxAmount === null,
      maxAmount: rule.maxAmount || 1000000,
      status: rule.status,
      levels: rule.levels.map((l) => ({ ...l })),
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleDuplicateRule = (rule: ApprovalRuleRecord) => {
    const nextNum = rules.length + 1;
    const autoCode = `APR-${nextNum < 10 ? '00' : nextNum < 100 ? '0' : ''}${nextNum}`;

    const newRule: ApprovalRuleRecord = {
      ...rule,
      id: `apr-${Date.now()}`,
      ruleCode: autoCode,
      ruleName: `${rule.ruleName} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin User',
    };

    setRules((prev) => [newRule, ...prev]);
  };

  const handleAddLevel = () => {
    setFormData((prev) => {
      const nextStep = prev.levels.length + 1;
      return {
        ...prev,
        levels: [
          ...prev.levels,
          {
            id: `l-${Date.now()}`,
            stepNumber: nextStep,
            roleName: ROLE_OPTIONS[0],
            isMandatory: true,
            amountThreshold: 0,
          },
        ],
      };
    });
  };

  const handleRemoveLevel = (id: string) => {
    setFormData((prev) => {
      const updated = prev.levels.filter((l) => l.id !== id);
      const reindexed = updated.map((l, index) => ({ ...l, stepNumber: index + 1 }));
      return { ...prev, levels: reindexed };
    });
  };

  const handleUpdateLevel = (id: string, field: keyof ApprovalLevel, value: any) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.ruleCode.trim() || !formData.ruleName.trim()) {
      setFormError('Rule code and rule name are required.');
      return;
    }

    if (formData.levels.length === 0) {
      setFormError('At least one approval level is required for an approval rule.');
      return;
    }

    const finalMaxAmount = formData.isUnlimitedMax ? null : Number(formData.maxAmount);

    if (editingRule) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? {
                ...r,
                ruleCode: formData.ruleCode.toUpperCase(),
                ruleName: formData.ruleName,
                module: formData.module,
                transactionType: formData.transactionType,
                projectScope: formData.projectScope,
                siteName: formData.siteName,
                minAmount: Number(formData.minAmount),
                maxAmount: finalMaxAmount,
                levels: formData.levels,
                status: formData.status,
              }
            : r
        )
      );
    } else {
      const newRule: ApprovalRuleRecord = {
        id: `apr-${Date.now()}`,
        ruleCode: formData.ruleCode.toUpperCase(),
        ruleName: formData.ruleName,
        module: formData.module,
        transactionType: formData.transactionType,
        projectScope: formData.projectScope,
        siteName: formData.siteName,
        minAmount: Number(formData.minAmount),
        maxAmount: finalMaxAmount,
        levels: formData.levels,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Admin User',
      };
      setRules((prev) => [newRule, ...prev]);
    }

    setShowFormModal(false);
  };

  const handleToggleStatus = (rule: ApprovalRuleRecord) => {
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r))
    );
  };

  const formatCurrency = (amt: number | null) => {
    if (amt === null) return 'Unlimited';
    if (amt === 0) return '₹0';
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-[#AB9570]" />
            <h1 className="text-xl font-bold text-[#172033]">Approval Matrix Rules</h1>
          </div>
          <p className="text-xs text-[#6E7889] mt-1">
            Configure multi-tier role approvals, monetary limits, and transaction authorization workflows.
          </p>
        </div>
        <PrimaryActionButton
          label="Add Approval Rule"
          onClick={handleOpenCreateModal}
          id="btn-add-approval-rule"
        />
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryKpiCard
          title="TOTAL APPROVAL RULES"
          value={totalRules}
          subtitle="Configured Workflow Rules"
          icon={Layers}
          variant="gold"
        />
        <SummaryKpiCard
          title="ACTIVE RULES"
          value={activeRules}
          subtitle="Enforced in Workflows"
          icon={CheckCircle}
          variant="active"
        />
        <SummaryKpiCard
          title="MULTI-LEVEL RULES"
          value={multiLevelRules}
          subtitle="Multi-tier Authorization"
          icon={FileCheck}
          variant="amber"
        />
        <SummaryKpiCard
          title="MODULES COVERED"
          value={coveredModules}
          subtitle="Distinct ERP Modules"
          icon={Shield}
          variant="blue"
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 border border-[#D9DEE7] rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E7889]" />
            <input
              type="text"
              placeholder="Search code, rule name or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#D9DEE7] rounded-lg text-xs text-[#172033] placeholder-[#6E7889] focus:outline-none focus:border-[#7186A2] transition-colors"
            />
          </div>

          {/* Module Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-[#6E7889] shrink-0" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-[#D9DEE7] rounded-lg text-xs text-[#172033] font-medium outline-none focus:border-[#7186A2]"
            >
              <option value="All">All Modules</option>
              {MODULE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Scope Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-[#D9DEE7] rounded-lg text-xs text-[#172033] font-medium outline-none focus:border-[#7186A2]"
            >
              <option value="All">All Scopes</option>
              <option value="All Projects">All Projects</option>
              <option value="Site Specific">Site Specific</option>
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
          Showing <span className="text-[#172033] font-bold">{filteredRules.length}</span> of {totalRules} Rules
        </div>
      </div>

      {/* 4. Approval Rules Table */}
      <div className="bg-white border border-[#D9DEE7] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F7F9] border-b border-[#D9DEE7] text-[11px] font-bold text-[#6E7889] uppercase tracking-wider">
                <th className="py-3.5 px-4">Rule Code</th>
                <th className="py-3.5 px-4">Rule Name & Module</th>
                <th className="py-3.5 px-4">Transaction Type</th>
                <th className="py-3.5 px-4 text-center">Project Scope</th>
                <th className="py-3.5 px-4">Approval Chain</th>
                <th className="py-3.5 px-4 text-right">Monetary Range</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F6] text-xs text-[#172033]">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6E7889]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="h-8 w-8 text-[#9AA5B5]" />
                      <p className="font-semibold">No approval rules found matching your filter criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setModuleFilter('All');
                          setScopeFilter('All');
                          setStatusFilter('All');
                        }}
                        className="text-xs text-[#AB9570] hover:underline font-bold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => {
                  return (
                    <tr key={rule.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#172033]">
                        <span className="px-2 py-0.5 bg-[#F1F3F6] border border-[#D9DEE7] rounded text-[11px] tracking-wide">
                          {rule.ruleCode}
                        </span>
                      </td>

                      {/* Rule Name & Module */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#172033]">{rule.ruleName}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {rule.module}
                        </span>
                      </td>

                      {/* Transaction Type */}
                      <td className="py-3.5 px-4 font-medium text-[#172033]">
                        {rule.transactionType}
                      </td>

                      {/* Project Scope */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          {rule.projectScope}
                        </span>
                      </td>

                      {/* Approval Chain Summary */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold text-[10px]">
                            {rule.levels.length} {rule.levels.length === 1 ? 'Level' : 'Levels'}
                          </span>
                          <span className="text-[11px] text-[#6E7889]">
                            ({rule.levels.map((l) => l.roleName).join(' → ')})
                          </span>
                        </div>
                      </td>

                      {/* Monetary Range */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#172033]">
                        {formatCurrency(rule.minAmount)} – {formatCurrency(rule.maxAmount)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rule.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              rule.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {rule.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          ref={(el) => (menuTriggerRefs.current[rule.id] = el)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuRuleId(activeMenuRuleId === rule.id ? null : rule.id);
                          }}
                          className="p-1.5 rounded-lg text-[#6E7889] hover:text-[#172033] hover:bg-[#F1F3F6] transition-colors"
                          title="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        <RowActionMenu
                          isOpen={activeMenuRuleId === rule.id}
                          onClose={() => setActiveMenuRuleId(null)}
                          triggerRef={{ current: menuTriggerRefs.current[rule.id] }}
                        >
                          <RowActionMenuItem
                            label="View Approval Flow"
                            icon={<Eye className="h-4 w-4 text-slate-600" />}
                            onClick={() => {
                              setActiveMenuRuleId(null);
                              setViewingRule(rule);
                              setShowViewModal(true);
                            }}
                          />

                          <RowActionMenuItem
                            label="Edit Rule"
                            icon={<Edit2 className="h-4 w-4 text-amber-600" />}
                            onClick={() => {
                              setActiveMenuRuleId(null);
                              handleOpenEditModal(rule);
                            }}
                          />

                          <RowActionMenuItem
                            label="Duplicate Rule"
                            icon={<Copy className="h-4 w-4 text-blue-600" />}
                            onClick={() => {
                              setActiveMenuRuleId(null);
                              handleDuplicateRule(rule);
                            }}
                          />

                          <RowActionMenuDivider />

                          {rule.status === 'Active' ? (
                            <RowActionMenuItem
                              label="Deactivate Rule"
                              variant="danger"
                              icon={<Slash className="h-4 w-4" />}
                              onClick={() => {
                                setActiveMenuRuleId(null);
                                handleToggleStatus(rule);
                              }}
                            />
                          ) : (
                            <RowActionMenuItem
                              label="Activate Rule"
                              variant="success"
                              icon={<CheckCircle className="h-4 w-4" />}
                              onClick={() => {
                                setActiveMenuRuleId(null);
                                handleToggleStatus(rule);
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

      {/* Modal 1: Create / Edit Approval Rule */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[680px] max-h-[90vh] overflow-y-auto font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#AB9570]" />
                <h2 className="text-base font-bold text-[#172033]">
                  {editingRule ? 'Edit Approval Rule' : 'Add Approval Rule'}
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

            <form onSubmit={handleSaveRule} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Rule Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APR-007"
                    value={formData.ruleCode}
                    onChange={(e) => setFormData({ ...formData, ruleCode: e.target.value.toUpperCase() })}
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
                  Rule Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Direct Vendor Invoice Approval Flow"
                  value={formData.ruleName}
                  onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    ERP Module <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2] font-medium"
                  >
                    {MODULE_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Transaction Type
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Invoice Clearance"
                    value={formData.transactionType}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Project Scope
                  </label>
                  <select
                    value={formData.projectScope}
                    onChange={(e) => setFormData({ ...formData, projectScope: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2]"
                  >
                    <option value="All Projects">All Projects</option>
                    <option value="Site Specific">Site Specific</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Minimum Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F9FAFB] border border-[#D9DEE7] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#172033]">
                    Maximum Amount Limit
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#6E7889] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isUnlimitedMax}
                      onChange={(e) => setFormData({ ...formData, isUnlimitedMax: e.target.checked })}
                      className="h-3.5 w-3.5 rounded border-[#D9DEE7] text-[#AB9570]"
                    />
                    <span>Unlimited (No upper limit)</span>
                  </label>
                </div>
                {!formData.isUnlimitedMax && (
                  <input
                    type="number"
                    min={formData.minAmount}
                    placeholder="e.g. 500000"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono text-[#172033] bg-white border border-[#D9DEE7] rounded-lg outline-none focus:border-[#7186A2]"
                  />
                )}
              </div>

              {/* Dynamic Approval Levels Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-2">
                  <h3 className="text-xs font-bold uppercase text-[#6E7889] tracking-wider">
                    Approval Levels Chain ({formData.levels.length} Steps)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddLevel}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#AB9570] hover:text-[#8D7653]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Approval Level</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.levels.map((level, index) => (
                    <div
                      key={level.id}
                      className="p-3 bg-white border border-[#D9DEE7] rounded-lg flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {level.stepNumber}
                        </span>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-[#6E7889] block">
                            Approver Role
                          </label>
                          <select
                            value={level.roleName}
                            onChange={(e) => handleUpdateLevel(level.id, 'roleName', e.target.value)}
                            className="px-2.5 py-1.5 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2] font-semibold"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-[#172033] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={level.isMandatory}
                            onChange={(e) => handleUpdateLevel(level.id, 'isMandatory', e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-[#D9DEE7] text-[#AB9570]"
                          />
                          <span>Mandatory</span>
                        </label>

                        {formData.levels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLevel(level.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                            title="Remove Level"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#D9DEE7] flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6E7889] bg-white border border-[#D9DEE7] rounded-lg hover:bg-[#F6F7F9]"
                >
                  Cancel
                </button>
                <PrimaryActionButton
                  type="submit"
                  label={editingRule ? 'Update Rule' : 'Save Rule'}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Approval Flow */}
      {showViewModal && viewingRule && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9DEE7] shadow-2xl w-full max-w-[580px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#AB9570]" />
                <div>
                  <h2 className="text-base font-bold text-[#172033]">{viewingRule.ruleName}</h2>
                  <span className="text-xs font-mono font-bold text-[#6E7889]">{viewingRule.ruleCode}</span>
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

            <div className="p-6 space-y-5 text-xs text-[#172033]">
              <div className="grid grid-cols-2 gap-4 bg-[#F9FAFB] p-4 rounded-lg border border-[#D9DEE7]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Module</span>
                  <span className="font-bold text-[#172033]">{viewingRule.module}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Transaction</span>
                  <span className="font-semibold text-[#172033]">{viewingRule.transactionType}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Project Scope</span>
                  <span className="font-semibold text-[#172033]">{viewingRule.projectScope}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E7889] block mb-0.5">Monetary Threshold</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatCurrency(viewingRule.minAmount)} – {formatCurrency(viewingRule.maxAmount)}
                  </span>
                </div>
              </div>

              {/* Visual Approval Chain */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-[#6E7889] tracking-wider">
                  Sequential Approval Chain ({viewingRule.levels.length} Tiers)
                </h3>

                <div className="space-y-2">
                  {viewingRule.levels.map((level, idx) => (
                    <React.Fragment key={level.id}>
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-[#AB9570] text-white flex items-center justify-center font-bold text-xs">
                            L{level.stepNumber}
                          </span>
                          <div>
                            <div className="font-bold text-[#172033]">{level.roleName}</div>
                            <div className="text-[10px] text-[#6E7889]">
                              {level.isMandatory ? 'Mandatory Step' : 'Optional Step'}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Required Authority
                        </span>
                      </div>
                      {idx < viewingRule.levels.length - 1 && (
                        <div className="flex justify-center my-1">
                          <ArrowRight className="h-4 w-4 text-[#AB9570] rotate-90" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#D9DEE7] pt-3 flex justify-between items-center text-[11px] text-[#6E7889]">
                <div>Created: <span className="font-semibold text-[#172033]">{viewingRule.createdAt}</span></div>
                <div>Status: <span className="font-bold text-emerald-700">{viewingRule.status}</span></div>
              </div>

              <div className="pt-2 flex justify-end">
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
