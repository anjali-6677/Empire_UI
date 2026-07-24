import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MapPin, 
  User, 
  SlidersHorizontal, 
  RotateCcw, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Copy, 
  CheckCircle2,
  FolderOpen,
  AlertCircle,
  FileSpreadsheet,
  Home,
  ChevronRight,
  Trash2,
  RefreshCw,
  Clock,
  Check,
  X,
  Building,
  HelpCircle,
  LayoutDashboard,
  CornerUpLeft,
  FileText
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { useSites } from '../context/SitesContext';
import { formatIndianCurrency } from '../utils/format';
import { ColumnDef } from '@tanstack/react-table';
import { SiteSchema, SiteApprovalRole, ApprovalDecisionStatus } from '../types';

export const Sites: React.FC = () => {
  const navigate = useNavigate();
  const { 
    sites, 
    setSelectedSiteId,
    duplicateSite, 
    moveToDeleted, 
    restoreSite, 
    requestApproval, 
    processApproval,
    withdrawApprovalRequest,
    returnToDraft
  } = useSites();

  // Local state for search & filtering
  const [search, setSearch] = React.useState('');
  const [selectedCity, setSelectedCity] = React.useState('');
  const [selectedManager, setSelectedManager] = React.useState('');
  const [selectedWorkflowStatus, setSelectedWorkflowStatus] = React.useState('');
  const [selectedExecutionStatus, setSelectedExecutionStatus] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'all' | 'draft' | 'tender' | 'pending_approval' | 'approved' | 'rejected' | 'deleted'>('all');
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Scroll reset key for DataTable
  const [scrollResetKey, setScrollResetKey] = React.useState(0);

  // Trigger scroll reset when filters/tabs change
  const triggerScrollReset = () => {
    setScrollResetKey((prev) => prev + 1);
  };

  // Dropdown menus tracking by site ID
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  // Detail Drawer and modals tracking
  const [selectedSite, setSelectedSite] = React.useState<SiteSchema | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = React.useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);

  // Approval form state
  const [approverNames, setApproverNames] = React.useState<Record<SiteApprovalRole, string>>({
    chairman: 'Sanjay Mehta (Chairman)',
    projectHead: 'Rajesh Kumar (Project Head)',
    engineeringHead: 'Amit Dev (Engineering Head)',
    accountingHead: 'Rohan Deshmukh (Accounting Head)'
  });
  const [noteToApprover, setNoteToApprover] = React.useState('');

  // Demo approval comments local state
  const [demoComment, setDemoComment] = React.useState('');

  // Escape key handler for drawers and modals
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDetailsOpen(false);
        setIsRequestModalOpen(false);
        setIsStatusModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const triggerToast = (text: string, type: 'success' | 'info' = 'info') => {
    setToastMessage({ text, type });
  };

  // Re-synchronize selected site when global context updates
  React.useEffect(() => {
    if (selectedSite) {
      const updated = sites.find((s) => s.id === selectedSite.id);
      if (updated) {
        setSelectedSite(updated);
      }
    }
  }, [sites, selectedSite]);

  // Calculate static counts for tabs
  const tabCounts = React.useMemo(() => {
    return {
      all: sites.filter((s) => s.workflowStatus !== 'deleted').length,
      draft: sites.filter((s) => s.workflowStatus === 'draft').length,
      tender: sites.filter((s) => s.workflowStatus === 'tender').length,
      pending_approval: sites.filter((s) => s.workflowStatus === 'pending_approval').length,
      approved: sites.filter((s) => s.workflowStatus === 'approved').length,
      rejected: sites.filter((s) => s.workflowStatus === 'rejected').length,
      deleted: sites.filter((s) => s.workflowStatus === 'deleted').length,
    };
  }, [sites]);

  // Summary lists derived dynamically (excluding deleted)
  const totalBudget = React.useMemo(() => {
    return sites
      .filter((s) => s.workflowStatus !== 'deleted')
      .reduce((sum, site) => sum + site.budget, 0);
  }, [sites]);

  // Unique helper values for filters
  const cities = React.useMemo(() => {
    const list = sites.map((s) => s.city);
    return Array.from(new Set(list));
  }, [sites]);

  const managers = React.useMemo(() => {
    const list = sites.map((s) => s.manager);
    return Array.from(new Set(list));
  }, [sites]);

  // Reset action
  const handleClearFilters = () => {
    setSearch('');
    setSelectedCity('');
    setSelectedManager('');
    setSelectedWorkflowStatus('');
    setSelectedExecutionStatus('');
    setActiveTab('all');
    triggerScrollReset();
    triggerToast('Filters reset successfully', 'info');
  };

  // Local filtering logic
  const filteredSites = React.useMemo(() => {
    return sites.filter((site) => {
      const matchesSearch = 
        site.name.toLowerCase().includes(search.toLowerCase()) || 
        site.code.toLowerCase().includes(search.toLowerCase()) || 
        site.client.toLowerCase().includes(search.toLowerCase());
      
      const matchesTab = activeTab === 'all' 
        ? site.workflowStatus !== 'deleted' 
        : site.workflowStatus === activeTab;
      
      const matchesCity = !selectedCity || site.city === selectedCity;
      const matchesManager = !selectedManager || site.manager === selectedManager;
      const matchesWorkflow = !selectedWorkflowStatus || site.workflowStatus === selectedWorkflowStatus;
      const matchesExecution = !selectedExecutionStatus || site.executionStatus === selectedExecutionStatus;
      
      return matchesSearch && matchesTab && matchesCity && matchesManager && matchesWorkflow && matchesExecution;
    });
  }, [sites, search, activeTab, selectedCity, selectedManager, selectedWorkflowStatus, selectedExecutionStatus]);

  // Action handlers
  const handleDuplicate = (siteId: string, siteName: string) => {
    setOpenMenuId(null);
    duplicateSite(siteId);
    triggerToast(`Duplicated config for ${siteName}`, 'success');
  };

  const handleMoveToDeleted = (siteId: string, siteName: string) => {
    setOpenMenuId(null);
    moveToDeleted(siteId);
    triggerToast(`Moved ${siteName} to deleted list`, 'info');
  };

  const handleRestore = (siteId: string, siteName: string) => {
    setOpenMenuId(null);
    restoreSite(siteId);
    triggerToast(`Restored site ${siteName} to workflow`, 'success');
  };

  const handleWithdrawApproval = (siteId: string, siteCode: string) => {
    setOpenMenuId(null);
    withdrawApprovalRequest(siteId);
    triggerToast(`Withdrew approval request for ${siteCode}`, 'info');
  };

  const handleEditAndResubmit = (siteId: string) => {
    setOpenMenuId(null);
    returnToDraft(siteId);
    navigate(`/settings?mod=site-edit&id=${siteId}`);
    triggerToast(`Site returned to Draft for editing`, 'info');
  };

  const handleOpenSiteDashboard = (siteId: string) => {
    setOpenMenuId(null);
    setSelectedSiteId(siteId);
    navigate('/');
    triggerToast(`Opened Site Dashboard for ${siteId}`, 'success');
  };

  // Stepper Approval dispatcher
  const handleSendForApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;
    if (!noteToApprover.trim()) return;
    if (!approverNames.accountingHead || !approverNames.chairman || !approverNames.projectHead || !approverNames.engineeringHead) return;

    requestApproval(selectedSite.id, approverNames, noteToApprover);
    setIsRequestModalOpen(false);
    setNoteToApprover('');
    triggerToast(`Sent ${selectedSite.code} for approval`, 'success');
  };

  const isValidRejectionComment = (comment: string) => {
    const trimmed = comment.trim();
    if (!trimmed) return false;
    if (/^['",.\s\-_\/]*$/.test(trimmed)) return false;
    return true;
  };

  const handleDemoApproval = (role: SiteApprovalRole, status: ApprovalDecisionStatus) => {
    if (!selectedSite) return;
    if (status === 'rejected' && !isValidRejectionComment(demoComment)) {
      triggerToast('A valid rejection comment is required. Placeholder or empty characters are not accepted.', 'info');
      return;
    }
    processApproval(selectedSite.id, role, status, demoComment.trim());
    setDemoComment('');
    triggerToast(`Decision updated for ${role}: ${status}`, status === 'approved' ? 'success' : 'info');
  };

  // Columns for Sites table
  const columns: ColumnDef<SiteSchema>[] = [
    {
      id: 'code',
      header: 'Site Code',
      cell: ({ row }) => (
        <span className="font-mono font-bold tracking-tight text-gray-800">
          {row.original.code}
        </span>
      )
    },
    {
      id: 'name',
      header: 'Site / Project Name',
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <span className="font-bold text-gray-900 block text-[11.5px] leading-tight truncate">
            {row.original.name}
          </span>
          <span className="text-[9.5px] text-gray-400 block font-semibold leading-normal">
            {row.original.category} • <span className="text-gray-450">{row.original.client}</span>
          </span>
        </div>
      )
    },
    {
      id: 'client',
      header: 'Client',
      accessorKey: 'client'
    },
    {
      id: 'city',
      header: 'City',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 font-medium text-gray-700">
          <MapPin className="h-3 w-3 text-gray-400 stroke-[1.5]" />
          {row.original.city}
        </span>
      )
    },
    {
      id: 'manager',
      header: 'Project Manager',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
          <User className="h-3 w-3 text-gray-400 stroke-[1.5]" />
          {row.original.manager}
        </span>
      )
    },
    {
      id: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => <span className="font-mono text-gray-650">{row.original.startDate}</span>
    },
    {
      id: 'targetCompletion',
      header: 'Target Completion',
      cell: ({ row }) => <span className="font-mono text-gray-655">{row.original.targetCompletion}</span>
    },
    {
      id: 'budget',
      header: 'Budget',
      cell: ({ row }) => (
        <span className="font-extrabold text-gray-900">
          {formatIndianCurrency(row.original.budget)}
        </span>
      )
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[85px]">
          <div className="flex-1 bg-gray-150 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${
                row.original.executionStatus === 'completed' 
                  ? 'bg-green-500' 
                  : row.original.executionStatus === 'on_hold' 
                  ? 'bg-amber-400' 
                  : 'bg-brand-500'
              }`}
              style={{ width: `${row.original.progress}%` }}
            ></div>
          </div>
          <span className="font-extrabold text-gray-800 text-[10px] w-6 shrink-0 text-right">
            {row.original.progress}%
          </span>
        </div>
      )
    },
    {
      id: 'executionStatus',
      header: 'Execution Status',
      cell: ({ row }) => {
        const status = row.original.executionStatus;
        return <StatusBadge status={status === 'not_started' ? 'not_started' : status} />;
      }
    },
    {
      id: 'status',
      header: 'Workflow Status',
      cell: ({ row }) => <StatusBadge status={row.original.workflowStatus} />
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const wStatus = row.original.workflowStatus;
        const isMenuOpen = openMenuId === row.original.id;

        return (
          <DropdownMenu.Root
            open={isMenuOpen}
            onOpenChange={(open) => setOpenMenuId(open ? row.original.id : null)}
          >
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="h-8 w-8 inline-flex items-center justify-center p-1 rounded text-gray-400 hover:text-gray-900 bg-white border border-transparent hover:border-gray-200 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500/50 cursor-pointer pointer-events-auto"
                aria-label={`Actions for ${row.original.code}`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                collisionPadding={12}
                className="z-[1000] min-w-[210px] bg-white border border-gray-200 rounded-md shadow-lg py-1 text-left font-sans text-xs focus:outline-none animate-in fade-in-80 zoom-in-95"
              >
                {/* 1. View Details (available for all statuses) */}
                <DropdownMenu.Item
                  onSelect={() => {
                    setOpenMenuId(null);
                    setSelectedSite(row.original);
                    setIsDetailsOpen(true);
                  }}
                  className="w-full px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-gray-50 border-b border-gray-100"
                >
                  <Eye className="h-3.5 w-3.5 text-gray-450 stroke-[1.75]" />
                  View Details
                </DropdownMenu.Item>

                {/* 2. DRAFT Status Actions */}
                {wStatus === 'draft' && (
                  <>
                    <DropdownMenu.Item
                      onSelect={() => {
                        setOpenMenuId(null);
                        navigate(`/settings?mod=site-edit&id=${row.original.id}`);
                      }}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-gray-50 border-b border-gray-100"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-gray-450 stroke-[1.75]" />
                      Edit Site
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleDuplicate(row.original.id, row.original.name)}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-gray-50 border-b border-gray-100"
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-450 stroke-[1.75]" />
                      Duplicate
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => {
                        setOpenMenuId(null);
                        setSelectedSite(row.original);
                        setIsRequestModalOpen(true);
                      }}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-indigo-50 border-b border-gray-100"
                    >
                      <Clock className="h-3.5 w-3.5 text-indigo-500 stroke-[1.75]" />
                      Request For Approval
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleMoveToDeleted(row.original.id, row.original.name)}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500 stroke-[1.75]" />
                      Move to Deleted
                    </DropdownMenu.Item>
                  </>
                )}

                {/* 3. TENDER Status Actions */}
                {wStatus === 'tender' && (
                  <>
                    <DropdownMenu.Item
                      onSelect={() => {
                        setOpenMenuId(null);
                        navigate(`/settings?mod=site-edit&id=${row.original.id}`);
                      }}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-gray-50 border-b border-gray-100"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-gray-450 stroke-[1.75]" />
                      Edit Tender Details
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => {
                        setOpenMenuId(null);
                        setSelectedSite(row.original);
                        setIsRequestModalOpen(true);
                      }}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-indigo-50 border-b border-gray-100"
                    >
                      <Clock className="h-3.5 w-3.5 text-indigo-500 stroke-[1.75]" />
                      Request For Approval
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleMoveToDeleted(row.original.id, row.original.name)}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500 stroke-[1.75]" />
                      Move to Deleted
                    </DropdownMenu.Item>
                  </>
                )}

                {/* 4. PENDING FOR APPROVAL Status Actions (No Edit, Duplicate, or Delete) */}
                {wStatus === 'pending_approval' && (
                  <>
                    <DropdownMenu.Item
                      onSelect={() => {
                        setOpenMenuId(null);
                        setSelectedSite(row.original);
                        setIsStatusModalOpen(true);
                      }}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-amber-50 border-b border-gray-100"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-amber-500 stroke-[1.75]" />
                      View Approval Status
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleWithdrawApproval(row.original.id, row.original.code)}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-orange-700 hover:bg-orange-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-orange-50"
                    >
                      <CornerUpLeft className="h-3.5 w-3.5 text-orange-500 stroke-[1.75]" />
                      Withdraw Approval Request
                    </DropdownMenu.Item>
                  </>
                )}

                {/* 5. APPROVED Status Actions */}
                {wStatus === 'approved' && (
                  <>
                    <DropdownMenu.Item
                      onSelect={() => handleOpenSiteDashboard(row.original.id)}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-emerald-750 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-emerald-50 border-b border-gray-100"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
                      Open Site Dashboard
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleDuplicate(row.original.id, row.original.name)}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-gray-50"
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-450 stroke-[1.75]" />
                      Duplicate
                    </DropdownMenu.Item>
                  </>
                )}

                {/* 6. REJECTED Status Actions */}
                {wStatus === 'rejected' && (
                  <>
                    <DropdownMenu.Item
                      onSelect={() => {
                        setOpenMenuId(null);
                        setSelectedSite(row.original);
                        setIsStatusModalOpen(true);
                      }}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-rose-50 border-b border-gray-100"
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500 stroke-[1.75]" />
                      View Rejection Details
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleEditAndResubmit(row.original.id)}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-indigo-50 border-b border-gray-100"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-indigo-500 stroke-[1.75]" />
                      Edit and Resubmit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleMoveToDeleted(row.original.id, row.original.name)}
                      className="w-full px-3 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500 stroke-[1.75]" />
                      Move to Deleted
                    </DropdownMenu.Item>
                  </>
                )}

                {/* 7. DELETED Status Actions */}
                {wStatus === 'deleted' && (
                  <DropdownMenu.Item
                    onSelect={() => handleRestore(row.original.id, row.original.name)}
                    className="w-full px-3 py-1.5 text-[11px] font-medium text-emerald-750 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer focus:outline-none focus:bg-emerald-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
                    Restore
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-10 select-none relative">
      
      {/* Toast Notification popup */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-[1100] px-4 py-2 border rounded shadow-md flex items-center gap-2 font-sans transition-all text-xs font-bold ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-brand-50 border-brand-200 text-brand-850'
          }`}
        >
          <div className={`h-1.5 w-1.5 rounded-full bg-current ${toastMessage.type === 'success' ? 'animate-ping' : ''}`}></div>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded focus:outline-none">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-455">Projects</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650 cursor-pointer">Sites</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-150 pb-4">
        <div className="space-y-0.5">
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight leading-tight">Sites</h1>
          <p className="text-[10.5px] text-gray-400 font-medium leading-normal">
            Manage project sites, approvals, workflows, budgets and current execution progress indicators.
          </p>
        </div>

        <button
          onClick={() => navigate('/sites/new')}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-[10.5px] font-bold rounded shadow-sm transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-brand-500/50 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer select-none shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Site
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Active/Workflow Sites */}
        <div className="bg-white border border-gray-150 rounded p-3 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-gray-50 border border-gray-100 rounded text-gray-500">
            <FolderOpen className="h-4.5 w-4.5 stroke-[1.5]" />
          </div>
          <div>
            <span className="text-[9.5px] uppercase tracking-wider text-gray-450 font-bold block">Portfolio Sites</span>
            <span className="font-extrabold text-[15px] text-gray-900 leading-tight block">
              {tabCounts.all} Sites
            </span>
          </div>
        </div>

        {/* Card 2: Active Execution Work */}
        <div className="bg-white border border-gray-150 rounded p-3 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded text-emerald-650">
            <CheckCircle2 className="h-4.5 w-4.5 stroke-[1.5]" />
          </div>
          <div>
            <span className="text-[9.5px] uppercase tracking-wider text-gray-450 font-bold block">Active Execution</span>
            <span className="font-extrabold text-[15px] text-emerald-800 leading-tight block">
              {sites.filter((s) => s.executionStatus === 'active' && s.workflowStatus !== 'deleted').length} Active
            </span>
          </div>
        </div>

        {/* Card 3: Pending Approval */}
        <div className="bg-white border border-gray-150 rounded p-3 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 border border-amber-100 rounded text-amber-650">
            <AlertCircle className="h-4.5 w-4.5 stroke-[1.5]" />
          </div>
          <div>
            <span className="text-[9.5px] uppercase tracking-wider text-gray-450 font-bold block">Pending Approval</span>
            <span className="font-extrabold text-[15px] text-amber-700 leading-tight block">
              {tabCounts.pending_approval} Awaiting
            </span>
          </div>
        </div>

        {/* Card 4: Total Portfolio Budget */}
        <div className="bg-white border border-gray-150 rounded p-3 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-brand-50 border border-brand-100 rounded text-brand-700">
            <FileSpreadsheet className="h-4.5 w-4.5 stroke-[1.5]" />
          </div>
          <div>
            <span className="text-[9.5px] uppercase tracking-wider text-gray-450 font-bold block">Portfolio Budget</span>
            <span className="font-extrabold text-[15px] text-zinc-900 leading-tight block">
              {formatIndianCurrency(totalBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs list with counts */}
      <div className="flex border-b border-gray-200 overflow-x-auto select-none mt-2 scrollbar-none">
        {(['all', 'draft', 'tender', 'pending_approval', 'approved', 'rejected', 'deleted'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = tabCounts[tab];
          
          let label = 'All';
          if (tab === 'draft') label = 'Draft';
          else if (tab === 'tender') label = 'Tender';
          else if (tab === 'pending_approval') label = 'Pending For Approval';
          else if (tab === 'approved') label = 'Approved';
          else if (tab === 'rejected') label = 'Rejected';
          else if (tab === 'deleted') label = 'Deleted';

          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                triggerScrollReset();
              }}
              className={`px-3.5 py-2 border-b-2 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-2 focus:outline-none transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-brand-500 text-brand-700 font-extrabold' 
                  : 'border-transparent text-gray-450 hover:text-gray-700'
              }`}
            >
              <span>{label}</span>
              <span
                className={`px-1.5 py-0.25 text-[8.5px] rounded-full border ${
                  isActive 
                    ? 'bg-brand-50 border-brand-150 text-brand-800' 
                    : 'bg-gray-50 border-gray-150 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Form Block */}
      <div className="bg-white border border-gray-150 rounded-lg p-3.5 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-gray-700 border-b border-gray-100 pb-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-450 stroke-[1.5]" />
          <span className="font-bold text-[10px] uppercase tracking-wider text-gray-650">Filter Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Global text search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search code, name, client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                triggerScrollReset();
              }}
              className="w-full bg-white border border-gray-250 rounded pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* 2. City Dropdown */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                triggerScrollReset();
              }}
              className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* 3. PM Dropdown */}
          <div>
            <select
              value={selectedManager}
              onChange={(e) => {
                setSelectedManager(e.target.value);
                triggerScrollReset();
              }}
              className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="">All Managers</option>
              {managers.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          {/* 4. Workflow status dropdown */}
          <div>
            <select
              value={selectedWorkflowStatus}
              onChange={(e) => {
                setSelectedWorkflowStatus(e.target.value);
                triggerScrollReset();
              }}
              className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="">Workflow Statuses</option>
              <option value="draft">Draft</option>
              <option value="tender">Tender</option>
              <option value="pending_approval">Pending For Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* 5. Reset button */}
          <button
            onClick={handleClearFilters}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-550 border border-gray-250 rounded hover:bg-gray-50 hover:text-gray-800 transition-colors focus:outline-none cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Sites Table Panel */}
      <div className="bg-white border border-gray-150 rounded-lg p-4 shadow-sm space-y-3">
        {filteredSites.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 my-4 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <SlidersHorizontal className="h-8 w-8 text-gray-300 stroke-[1.5] mb-3" />
            <h3 className="text-sm font-bold text-gray-800 mb-1">No Matching Sites Found</h3>
            <p className="text-[11px] text-gray-400 max-w-sm leading-relaxed mb-4">
              Your filter selections did not return any records. Try adjusting the search query or tab filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-bold text-brand-650 border border-brand-200 bg-white rounded shadow-sm hover:bg-brand-50 transition-colors focus:outline-none cursor-pointer"
            >
              Reset Filters Setup
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredSites}
            searchColumnId="name"
            searchPlaceholder="Filter listed table rows..."
            stickyActions={true}
            scrollResetKey={scrollResetKey}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. SITE DETAILS DRAWER (Slide-out Right Panel) */}
      {/* ========================================================================= */}
      {isDetailsOpen && selectedSite && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsDetailsOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col border-l border-gray-200 animate-slide-in">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-150 bg-gray-50">
              <div>
                <span className="font-mono text-[9px] font-bold uppercase text-brand-600 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded">
                  {selectedSite.code}
                </span>
                <h3 className="text-sm font-extrabold text-gray-900 mt-1">{selectedSite.name}</h3>
              </div>
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none cursor-pointer"
                aria-label="Close details drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 font-sans">
              
              {/* Section 1: Basic Specifications */}
              <div className="space-y-2.5 border-b pb-4 border-gray-100">
                <h4 className="text-[10px] font-extrabold text-gray-450 uppercase tracking-widest flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" /> Basic Specifications
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Site Code:</span>
                    <span className="font-bold text-gray-800 font-mono">{selectedSite.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Site Name:</span>
                    <span className="font-bold text-gray-800">{selectedSite.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Company Entity:</span>
                    <span className="font-bold text-gray-800">{selectedSite.company || 'Empire Interior Pvt Ltd'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Client:</span>
                    <span className="font-bold text-gray-800">{selectedSite.client}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Project Head:</span>
                    <span className="font-bold text-gray-800">{selectedSite.projectHead || selectedSite.manager}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Project Area and unit:</span>
                    <span className="font-bold text-gray-800">
                      {selectedSite.projectArea ? `${selectedSite.projectArea} ${selectedSite.projectAreaUnit || 'Sq Ft'}` : 'Not Specified'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[9.5px]">Full Address:</span>
                    <span className="font-bold text-gray-800">{selectedSite.address || 'Address not registered'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Total Budget:</span>
                    <span className="font-extrabold text-brand-700">{formatIndianCurrency(selectedSite.budget)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Approved Value:</span>
                    <span className="font-extrabold text-emerald-800">
                      {selectedSite.approvedValue ? formatIndianCurrency(selectedSite.approvedValue) : '--'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Dates */}
              <div className="space-y-2.5 border-b pb-4 border-gray-100">
                <h4 className="text-[10px] font-extrabold text-gray-450 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Key Project Dates
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Process Start Date:</span>
                    <span className="font-mono font-bold text-gray-700">{selectedSite.processStartDate || '--'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Start Date:</span>
                    <span className="font-mono font-bold text-gray-700">{selectedSite.startDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Submission Date:</span>
                    <span className="font-mono font-bold text-gray-700">{selectedSite.submissionDate || 'Not Submitted'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Approval Request Date:</span>
                    <span className="font-mono font-bold text-gray-700">{selectedSite.approvalRequestDate || 'Not Initiated'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Target Completion:</span>
                    <span className="font-mono font-bold text-gray-700">{selectedSite.targetCompletion}</span>
                  </div>
                  {selectedSite.deletedDate && (
                    <div>
                      <span className="text-gray-400 block text-[9.5px]">Deleted Date:</span>
                      <span className="font-mono font-bold text-rose-700">{selectedSite.deletedDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Workflow */}
              <div className="space-y-2.5 border-b pb-4 border-gray-100">
                <h4 className="text-[10px] font-extrabold text-gray-450 uppercase tracking-widest flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Workflow Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Workflow Status:</span>
                    <StatusBadge status={selectedSite.workflowStatus} />
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9.5px]">Execution Status:</span>
                    <StatusBadge status={selectedSite.executionStatus === 'not_started' ? 'not_started' : selectedSite.executionStatus} />
                  </div>
                  {selectedSite.previousWorkflowStatus && (
                    <div className="col-span-2">
                      <span className="text-gray-400 block text-[9.5px]">Previous Workflow Status:</span>
                      <StatusBadge status={selectedSite.previousWorkflowStatus} />
                    </div>
                  )}
                </div>
                {selectedSite.noteToApprover && (
                  <div className="bg-amber-50/55 border border-amber-100 rounded p-2.5 text-amber-900 leading-normal text-[10.5px]">
                    <span className="block font-bold text-[8.5px] uppercase text-amber-500 tracking-wider mb-0.5">Note To Approver:</span>
                    "{selectedSite.noteToApprover}"
                  </div>
                )}
              </div>

              {/* Section 4: Approval Decisions */}
              {selectedSite.approvalWorkflow && (
                <div className="space-y-2.5 border-b pb-4 border-gray-100">
                  <h4 className="text-[10px] font-extrabold text-gray-450 uppercase tracking-widest">
                    Approval Decisions
                  </h4>
                  <div className="space-y-2">
                    {(['accountingHead', 'chairman', 'projectHead', 'engineeringHead'] as SiteApprovalRole[]).map((role) => {
                      const decision = selectedSite.approvalWorkflow![role];
                      let roleLabel = 'Accounting Head';
                      if (role === 'chairman') roleLabel = 'Chairman';
                      else if (role === 'projectHead') roleLabel = 'Project Head';
                      else if (role === 'engineeringHead') roleLabel = 'Engineering Head';

                      return (
                        <div key={role} className="flex flex-col gap-1 p-2 rounded bg-gray-50 border border-gray-150">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-700 text-[10px] uppercase leading-none">{roleLabel}</span>
                            <StatusBadge status={decision.status} />
                          </div>
                          <div className="flex items-center justify-between text-[9.5px] text-gray-450 mt-1 leading-none">
                            <span className="font-medium text-gray-700">{decision.approverName}</span>
                            {decision.actionDate && (
                              <span className="font-mono font-semibold">Date: {decision.actionDate}</span>
                            )}
                          </div>
                          {decision.comment && (
                            <span className="text-[10px] italic text-gray-600 border-t border-gray-100 pt-1 mt-1 block">
                              Comment: "{decision.comment}"
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 5: Rejection Details (Only for rejected records) */}
              {selectedSite.workflowStatus === 'rejected' && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 space-y-1.5 text-rose-900 border-b pb-4">
                  <h4 className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Rejection Details
                  </h4>
                  <div className="text-[11px] space-y-1">
                    <div><span className="font-bold text-[9px] uppercase tracking-wide text-rose-500">Rejected By:</span> {selectedSite.rejectedBy}</div>
                    <div><span className="font-bold text-[9px] uppercase tracking-wide text-rose-500">Rejection Date:</span> <span className="font-mono">{selectedSite.rejectionDate}</span></div>
                    <div className="bg-white/80 border border-rose-150 rounded p-2 italic text-[10.5px] leading-relaxed">
                      "{selectedSite.rejectionComment}"
                    </div>
                  </div>
                </div>
              )}

              {/* Section 6: Deleted Details (Only for deleted records) */}
              {selectedSite.workflowStatus === 'deleted' && (
                <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 space-y-1.5 text-zinc-950">
                  <h4 className="text-[10px] font-extrabold text-zinc-700 uppercase tracking-widest flex items-center gap-1">
                    <Trash2 className="h-3.5 w-3.5 text-zinc-500" /> Deleted Details
                  </h4>
                  <div className="text-[11px] leading-relaxed space-y-2">
                    <div>
                      <span className="font-bold text-[9px] uppercase tracking-wide text-zinc-400 block">Previous Workflow Status:</span>{' '}
                      <StatusBadge status={selectedSite.previousWorkflowStatus || 'draft'} />
                    </div>
                    <div>
                      <span className="font-bold text-[9px] uppercase tracking-wide text-zinc-400 block">Deleted Date:</span>{' '}
                      <span className="font-mono font-bold text-gray-700">{selectedSite.deletedDate || '--'}</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        handleRestore(selectedSite.id, selectedSite.name);
                        setIsDetailsOpen(false);
                      }}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all shadow-sm focus:outline-none cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3 stroke-[2.5]" />
                      Restore Site
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REQUEST FOR APPROVAL MODAL */}
      {/* ========================================================================= */}
      {isRequestModalOpen && selectedSite && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 select-none">
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsRequestModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg border max-w-md w-full p-5 shadow-xl animate-scale-in flex flex-col gap-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-extrabold text-sm text-gray-900">Request For Approval</h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 focus:outline-none cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendForApprovalSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-500 font-bold mb-1 uppercase text-[8px] tracking-wider">SITE REFERENCE:</label>
                <div className="p-2 border border-gray-200 rounded bg-gray-50 font-semibold font-mono text-[10.5px] text-gray-800">
                  {selectedSite.code} - {selectedSite.name}
                </div>
              </div>

              {/* Selectable controls for designated board approvers */}
              <div className="space-y-2">
                <label className="block text-gray-500 font-bold uppercase text-[8px] tracking-wider">Designated Board Approvers:</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 block text-[8px] uppercase font-bold mb-0.5">Accounting Head:</span>
                    <select 
                      value={approverNames.accountingHead}
                      onChange={(e) => setApproverNames({ ...approverNames, accountingHead: e.target.value })}
                      className="w-full border border-gray-250 rounded p-1.5 focus:outline-none focus:border-brand-500 bg-white font-medium text-[10.5px] text-gray-800" 
                      required
                    >
                      <option value="Rohan Deshmukh (Accounting Head)">Rohan Deshmukh (Accounting Head)</option>
                      <option value="Karan Sharma (Accounting Head)">Karan Sharma (Accounting Head)</option>
                      <option value="Meera Patel (Accounting Head)">Meera Patel (Accounting Head)</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[8px] uppercase font-bold mb-0.5">Chairman:</span>
                    <select 
                      value={approverNames.chairman}
                      onChange={(e) => setApproverNames({ ...approverNames, chairman: e.target.value })}
                      className="w-full border border-gray-250 rounded p-1.5 focus:outline-none focus:border-brand-500 bg-white font-medium text-[10.5px] text-gray-800" 
                      required
                    >
                      <option value="Sanjay Mehta (Chairman)">Sanjay Mehta (Chairman)</option>
                      <option value="Vikram Shah (Chairman)">Vikram Shah (Chairman)</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[8px] uppercase font-bold mb-0.5">Project Head:</span>
                    <select 
                      value={approverNames.projectHead}
                      onChange={(e) => setApproverNames({ ...approverNames, projectHead: e.target.value })}
                      className="w-full border border-gray-250 rounded p-1.5 focus:outline-none focus:border-brand-500 bg-white font-medium text-[10.5px] text-gray-800" 
                      required
                    >
                      <option value="Rajesh Kumar (Project Head)">Rajesh Kumar (Project Head)</option>
                      <option value="Priya Verma (Project Head)">Priya Verma (Project Head)</option>
                      <option value="Anil Nair (Project Head)">Anil Nair (Project Head)</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[8px] uppercase font-bold mb-0.5">Engineering Head:</span>
                    <select 
                      value={approverNames.engineeringHead}
                      onChange={(e) => setApproverNames({ ...approverNames, engineeringHead: e.target.value })}
                      className="w-full border border-gray-250 rounded p-1.5 focus:outline-none focus:border-brand-500 bg-white font-medium text-[10.5px] text-gray-800" 
                      required
                    >
                      <option value="Amit Dev (Engineering Head)">Amit Dev (Engineering Head)</option>
                      <option value="Suresh Raina (Engineering Head)">Suresh Raina (Engineering Head)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1 uppercase text-[8px] tracking-wider">Note To Approver:</label>
                <textarea 
                  value={noteToApprover}
                  onChange={(e) => setNoteToApprover(e.target.value)}
                  placeholder="Enter comments, target deadline detail, or compliance note..."
                  rows={3}
                  className="w-full border border-gray-250 rounded p-1.5 focus:outline-none text-[11px] focus:border-brand-500 bg-white text-gray-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-250 rounded font-bold hover:bg-gray-50 text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !noteToApprover.trim() || 
                    !approverNames.accountingHead || 
                    !approverNames.chairman || 
                    !approverNames.projectHead || 
                    !approverNames.engineeringHead
                  }
                  className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white rounded shadow-sm cursor-pointer transition-colors"
                >
                  Send For Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW APPROVAL STATUS & BOARD DECISIONS MODAL */}
      {/* ========================================================================= */}
      {isStatusModalOpen && selectedSite && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 select-none">
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsStatusModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg border border-gray-200 max-w-lg w-full p-5 shadow-xl animate-scale-in flex flex-col gap-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 leading-tight">Board Approval Status</h3>
                <span className="text-[10px] text-gray-400 block mt-0.5">{selectedSite.code} • {selectedSite.name}</span>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer focus:outline-none"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Rejected View summary box */}
            {selectedSite.workflowStatus === 'rejected' && (
              <div className="bg-rose-50 border border-rose-150 rounded-lg p-3 space-y-1.5 text-rose-900">
                <h4 className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Rejection Details
                </h4>
                <div className="text-[11px] space-y-1">
                  <div><span className="font-bold text-[9px] uppercase tracking-wide text-rose-500">Rejected By:</span> {selectedSite.rejectedBy}</div>
                  <div><span className="font-bold text-[9px] uppercase tracking-wide text-rose-500">Rejection Date:</span> <span className="font-mono font-bold">{selectedSite.rejectionDate}</span></div>
                  <div><span className="font-bold text-[9px] uppercase tracking-wide text-rose-500">Rejection Comment:</span></div>
                  <div className="bg-white/80 border border-rose-150 rounded p-2 italic text-[10.5px] leading-relaxed">
                    "{selectedSite.rejectionComment}"
                  </div>
                </div>
              </div>
            )}

            {/* Approved View summary box */}
            {selectedSite.workflowStatus === 'approved' && (
              <div className="bg-emerald-50 border border-emerald-150 rounded-lg p-3 space-y-1.5 text-emerald-900">
                <h4 className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Site Fully Approved
                </h4>
                <p className="text-[10.5px] text-emerald-800">
                  All four board approvals have been recorded. Approved Site Value is set to {formatIndianCurrency(selectedSite.approvedValue || selectedSite.budget)}.
                </p>
              </div>
            )}

            {/* Note To Approver block */}
            {selectedSite.noteToApprover && (
              <div className="bg-amber-50 border border-amber-100 rounded p-2.5 text-amber-900 leading-normal">
                <span className="block font-bold text-[8.5px] uppercase text-amber-500 tracking-wider">Note To Approver:</span>
                "{selectedSite.noteToApprover}"
                <span className="block font-mono text-[8px] text-gray-450 mt-1 select-none font-bold">
                  APPROVAL REQUEST DATE: {selectedSite.approvalRequestDate}
                </span>
              </div>
            )}

            {/* Approval Checklist details */}
            <div className="space-y-3 mt-1">
              <h4 className="text-[9px] uppercase font-bold text-gray-450 tracking-wider">ROLE DECISIONS / CHECKLIST</h4>
              
              <div className="space-y-2">
                {(['accountingHead', 'chairman', 'projectHead', 'engineeringHead'] as SiteApprovalRole[]).map((role) => {
                  const decision = selectedSite.approvalWorkflow?.[role] || {
                    approverName: `${role.replace('Head', '')} Head`,
                    status: 'pending' as const
                  };

                  let roleLabel = 'Accounting Head';
                  if (role === 'chairman') roleLabel = 'Chairman';
                  else if (role === 'projectHead') roleLabel = 'Project Head';
                  else if (role === 'engineeringHead') roleLabel = 'Engineering Head';

                  return (
                    <div key={role} className="flex flex-col gap-1 p-2 bg-gray-50 border border-gray-150 rounded">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-gray-700 text-[10.5px]">{roleLabel}</span>
                          <span className="text-gray-400 block text-[9.5px] font-medium">{decision.approverName}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={decision.status} />
                          {decision.actionDate && (
                            <span className="font-mono text-[9px] text-gray-400">Date: {decision.actionDate}</span>
                          )}
                        </div>
                      </div>

                      {decision.comment && decision.comment.trim() && (
                        <div className="mt-1 text-[10px] text-gray-600 border-t border-gray-100 pt-1 leading-normal italic">
                          Comment: "{decision.comment.trim()}"
                        </div>
                      )}

                      {/* Demo decision controls in pending state only */}
                      {decision.status === 'pending' && selectedSite.workflowStatus === 'pending_approval' && (
                        <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-dashed border-gray-200">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDemoApproval(role, 'approved')}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[9.5px] font-bold inline-flex items-center gap-0.5 focus:outline-none cursor-pointer"
                            >
                              <Check className="h-3 w-3 stroke-[2.5]" /> Approve
                            </button>
                            <button
                              type="button"
                              disabled={!isValidRejectionComment(demoComment)}
                              onClick={() => handleDemoApproval(role, 'rejected')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded text-[9.5px] font-bold inline-flex items-center gap-0.5 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title={!isValidRejectionComment(demoComment) ? "Valid rejection comment required (no empty text, commas, or quotes)" : "Reject"}
                            >
                              <X className="h-3 w-3 stroke-[2.5]" /> Reject
                            </button>

                            <input
                              type="text"
                              placeholder="Add action review comment..."
                              value={demoComment}
                              onChange={(e) => setDemoComment(e.target.value)}
                              className="flex-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-[9.5px] focus:outline-none focus:border-brand-500 font-sans"
                            />
                          </div>
                          {demoComment && !isValidRejectionComment(demoComment) && (
                            <span className="text-[8.5px] font-bold text-rose-600">
                              Please enter a valid rejection reason (meaningless symbols or empty quotes are invalid).
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-150 mt-2">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-black font-bold text-white rounded cursor-pointer transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Sites;

