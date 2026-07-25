import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Home, 
  ChevronRight, 
  CheckCircle2, 
  Eye, 
  Copy,
  Power,
  X,
  Download,
  Printer,
  AlertCircle
} from 'lucide-react';
import { ModuleSchema } from '../config/moduleSchemas';
import { StatusBadge } from './StatusBadge';
import { safeFormatCurrency, safeFormatText, toSafeNumber } from '../utils/formatStatus';
import { useWorkflow, getCollectionIdFromRoute } from '../context/WorkflowContext';
import { useSites } from '../context/SitesContext';
import { filterBySiteScope, SiteScopeMode } from '../utils/siteScope';

interface GenericListPageProps {
  schema: ModuleSchema;
}



export const GenericListPage: React.FC<GenericListPageProps> = ({ schema }) => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  
  const initialTab = React.useMemo(() => {
    if (schema.tabs && schema.tabs.length > 0) {
      return schema.tabs[0].id;
    }
    return 'all';
  }, [schema.tabs]);

  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (schema.tabs && schema.tabs.length > 0 && !schema.tabs.some((t) => t.id === activeTab)) {
      setActiveTab(schema.tabs[0].id);
    }
  }, [schema.tabs, activeTab]);

  // Local mutable dataset state
  const { getCollection, addRecord, updateRecord, duplicateRecord: duplicateWorkflowRecord } = useWorkflow();
  const collectionId = getCollectionIdFromRoute(schema.route);
  const localRows = getCollection(collectionId);

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalFormData, setModalFormData] = React.useState<Record<string, any>>({});
  const [modalError, setModalError] = React.useState<string | null>(null);
  const triggerButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Escape key handler for modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        triggerButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Open modal
  const handleOpenCreateModal = () => {
    if (schema.primaryAction?.route) {
      navigate(schema.primaryAction.route);
      return;
    }
    const initialData: Record<string, any> = {};
    if (schema.createFields) {
      schema.createFields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          initialData[f.name] = f.defaultValue;
        }
      });
    }
    setModalFormData(initialData);
    setIsModalOpen(true);
  };

  // Form input change
  const handleFormChange = (name: string, val: any) => {
    setModalFormData((prev) => ({ ...prev, [name]: val }));
  };

  // Validate form
  const isFormValid = React.useMemo(() => {
    if (!schema.createFields) return true;
    return schema.createFields.every((f) => {
      if (!f.required) return true;
      const val = modalFormData[f.name];
      return val !== undefined && val !== null && String(val).trim() !== '';
    });
  }, [schema.createFields, modalFormData]);

  // Handle Save
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setModalError(null);

    const trimmedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(modalFormData)) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (key.toLowerCase().includes('email') && trimmed) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmed)) {
            setModalError(`Please enter a valid email address for '${key}'.`);
            return;
          }
        }
        trimmedData[key] = trimmed;
      } else {
        trimmedData[key] = value;
      }
    }

    const newRecord: Record<string, any> = {
      id: `REC-${Date.now()}`,
      ...trimmedData,
      status: trimmedData.status || 'active'
    };

    try {
      addRecord(collectionId, newRecord);
      setIsModalOpen(false);
      triggerButtonRef.current?.focus();
      triggerToast(`New record successfully registered`);
    } catch (err: any) {
      setModalError(err.message || 'Error saving record.');
    }
  };

  // Row Action Handlers
  const handleToggleRowStatus = (rowId: string) => {
    const r = localRows.find((rx) => rx.id === rowId);
    if (!r) return;
    const newStatus = r.status === 'active' || r.status === 'empanelled' ? 'inactive' : 'active';
    updateRecord(collectionId, rowId, { status: newStatus });
    triggerToast(`Record status updated to ${newStatus}`);
  };

  const handleDuplicateRow = (row: Record<string, any>) => {
    duplicateWorkflowRecord(collectionId, row.id);
    triggerToast('Record duplicated successfully');
  };

  const activeTabConfig = React.useMemo(() => {
    return schema.tabs?.find(t => t.id === activeTab);
  }, [schema.tabs, activeTab]);

  const activeColumns: any[] = React.useMemo(() => {
    if (activeTabConfig && (activeTabConfig as any).columns) return (activeTabConfig as any).columns;
    if ((schema as any).tabColumns && (schema as any).tabColumns[activeTab]) {
      return (schema as any).tabColumns[activeTab];
    }
    return schema.columns || [];
  }, [schema.columns, (schema as any).tabColumns, activeTabConfig, activeTab]);

  const displayTitle = (activeTabConfig as any)?.title || schema.title;
  const displayDescription = (activeTabConfig as any)?.description || schema.description;
  const displaySummaryCards = (activeTabConfig as any)?.summaryCards || schema.summaryCards;

  const isOnAccountPage = schema.route === '/finance/on-account' || schema.id === 'finance-on-account';

  const { selectedSiteId, sites } = useSites();
  const selectedSite = React.useMemo(() => {
    if (selectedSiteId === 'all') return null;
    return sites.find((s) => s.id === selectedSiteId) || null;
  }, [sites, selectedSiteId]);

  const siteScopeMode: SiteScopeMode = schema.siteScopeMode || 'portfolio';

  const siteFilteredRows = React.useMemo(() => {
    const rawRows = (activeTabConfig && (activeTabConfig as any).mockRows)
      ? (activeTabConfig as any).mockRows
      : localRows;

    return filterBySiteScope(rawRows, siteScopeMode, selectedSiteId);
  }, [activeTabConfig, localRows, siteScopeMode, selectedSiteId]);

  const isInventoryPage = schema.id === 'procurement-inventory' || schema.route === '/procurement/inventory';

  const calculatedSummaryCards = React.useMemo(() => {
    if (isInventoryPage && siteFilteredRows) {
      const totalStockValue = siteFilteredRows.reduce((acc: number, r: any) => acc + toSafeNumber(r.stockValue), 0);
      const lowStockAlerts = siteFilteredRows.filter((r: any) => r.healthStatus === 'low_stock' || r.healthStatus === 'reorder_required').length;
      const outOfStockCount = siteFilteredRows.filter((r: any) => r.healthStatus === 'out_of_stock').length;

      return [
        { id: '1', label: 'Total In-Stock Value', value: totalStockValue, isCurrency: true, color: 'text-brand-700' },
        { id: '2', label: 'Low Stock Alerts', value: lowStockAlerts, color: 'text-amber-600' },
        { id: '3', label: 'Out of Stock Items', value: outOfStockCount, color: 'text-rose-600' }
      ];
    }

    if (isOnAccountPage && schema.tabs) {
      const vendorTab = schema.tabs.find(t => t.id === 'vendor_balances');
      const siteTab = schema.tabs.find(t => t.id === 'site_balances');
      const txnTab = schema.tabs.find(t => t.id === 'recent_transactions');

      const vendorRows = vendorTab?.mockRows || [];
      const siteRows = siteTab?.mockRows || [];
      const txnRows = txnTab?.mockRows || [];

      const totalVendorBal = vendorRows.reduce((acc: number, r: any) => acc + (toSafeNumber(r.availableBalance)), 0);
      const totalSiteBal = siteRows.reduce((acc: number, r: any) => acc + (toSafeNumber(r.availableBalance)), 0);

      const transfersCount = txnRows.filter((r: any) => {
        const isTransfer = r.transactionType === 'inter_site_transfer' || r.transactionType === 'vendor_transfer' || String(r.type || '').toLowerCase().includes('transfer');
        const isOk = r.status === 'approved' || r.status === 'processed';
        return isTransfer && isOk;
      }).length;

      return [
        { id: '1', label: 'Total Vendor Available Balance', value: totalVendorBal, isCurrency: true, color: 'text-brand-700' },
        { id: '2', label: 'Total Site Available Balance', value: totalSiteBal, isCurrency: true, color: 'text-brand-700' },
        { id: '3', label: 'Transfers This Month', value: transfersCount, color: 'text-gray-900' }
      ];
    }
    return displaySummaryCards;
  }, [isInventoryPage, siteFilteredRows, isOnAccountPage, schema.tabs, displaySummaryCards]);

  const filteredData = React.useMemo(() => {
    return siteFilteredRows.filter((item: any) => {
      const matchSearch = JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'all' || item.status === activeTab || item.tab === activeTab || item.category === activeTab || item.type === activeTab;
      return matchSearch && matchTab;
    });
  }, [siteFilteredRows, search, activeTab]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      triggerToast('No data to export');
      return;
    }
    const headers = activeColumns.map(c => c.label).join(',');
    const rows = filteredData.map((row: any) => 
      activeColumns.map(c => `"${String(row[c.key] || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    const cleanTitle = (displayTitle || schema.title).replace(/\s+/g, '_');
    a.download = `${cleanTitle}_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    triggerToast('Report exported successfully');
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-12 select-none relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[1100] bg-brand-650 border border-brand-700 text-white px-4 py-2 rounded shadow-lg font-bold text-xs flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-brand-200" />
          {toast}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        {schema.breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className={idx === schema.breadcrumbs.length - 1 ? 'text-gray-650 font-bold' : 'cursor-pointer'}>{crumb}</span>
          </React.Fragment>
        ))}
      </nav>

      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-150 pb-4">
        <div className="space-y-0.5">
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">{displayTitle}</h1>
          {displayDescription && <p className="text-[10.5px] text-gray-400 font-medium">{displayDescription}</p>}
        </div>

        {schema.primaryAction && (
          <button
            ref={triggerButtonRef}
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1 px-3.5 py-2 text-[10.5px] font-bold rounded shadow-sm transition-all bg-brand-500 hover:bg-brand-600 text-white cursor-pointer shrink-0 print:hidden"
          >
            <Plus className="h-4 w-4" />
            {schema.primaryAction.label}
          </button>
        )}

        {schema.pageType === 'report' && (
          <div className="flex gap-2 shrink-0 print:hidden mt-2 md:mt-0">
             <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-200 bg-brand-50 text-brand-700 font-bold rounded shadow-sm hover:bg-brand-100 text-xs cursor-pointer">
               <Download className="h-3.5 w-3.5" /> Export Data
             </button>
             <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-250 bg-white text-gray-700 font-bold rounded shadow-sm hover:bg-gray-50 text-xs cursor-pointer">
               <Printer className="h-3.5 w-3.5" /> Print PDF
             </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {calculatedSummaryCards && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {calculatedSummaryCards.map((card: any, idx: number) => {
            const cardValue = idx === 0 && schema.createFields && !activeTabConfig?.summaryCards && !isOnAccountPage ? localRows.length : card.value;
            return (
              <div key={card.id} className="p-3.5 border border-gray-150 rounded bg-white shadow-sm space-y-1">
                <span className="text-[9.5px] uppercase font-bold text-gray-400 block">{card.label}</span>
                <span className={`font-extrabold text-base block ${card.color || 'text-gray-900'}`}>
                  {card.isCurrency ? safeFormatCurrency(cardValue) : cardValue}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Tabs */}
      {schema.tabs && (
        <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto scrollbar-none pb-0.5">
          {schema.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-[11px] font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-700 bg-brand-50/40 rounded-t'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-2 border border-gray-150 rounded-lg shadow-sm print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter listed table rows by keyword or reference code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-brand-500 font-sans"
          />
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded cursor-pointer transition-colors border border-transparent">
            Clear Filters
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-150 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs divide-y divide-gray-150 min-w-[700px]">
            <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
              <tr>
                {activeColumns.map((col) => (
                  <th key={col.key} className={`p-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {col.label}
                  </th>
                ))}
                {schema.pageType !== 'report' && (
                  <th className="p-3 text-right print:hidden">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={activeColumns.length + 1} className="p-12 text-center text-gray-400">
                    {search.trim() !== '' ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-600">No records match your search.</p>
                        <p className="text-xs text-gray-400 font-medium">Clear search query "{search}" to view available records.</p>
                      </div>
                    ) : activeTab !== 'all' && siteFilteredRows.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-600">No records match the selected filters.</p>
                        <p className="text-xs text-gray-400 font-medium">Switch status tabs or adjust filter selections to view available records.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {schema.id === 'finance-utility-bills' ? (
                          <>
                            <p className="text-sm font-bold text-gray-600">No utility bills have been logged for {selectedSite ? selectedSite.name : 'this site'}.</p>
                            <p className="text-xs text-gray-400 font-medium">Utility bill logging will commence when operational site activity begins.</p>
                          </>
                        ) : schema.id === 'finance-salary' ? (
                          <>
                            <p className="text-sm font-bold text-gray-600">Payroll allocation has not started for {selectedSite ? selectedSite.name : 'this site'}.</p>
                            <p className="text-xs text-gray-400 font-medium">Staff salary allocations will be registered once site mobilization begins.</p>
                          </>
                        ) : schema.id === 'finance-budget-transfers' ? (
                          <>
                            <p className="text-sm font-bold text-gray-600">No budget transfers involve {selectedSite ? selectedSite.name : 'this site'}.</p>
                            <p className="text-xs text-gray-400 font-medium">Inter-site fund reallocations will appear here when transfers occur.</p>
                          </>
                        ) : schema.id === 'finance-budgets' ? (
                          <>
                            <p className="text-sm font-bold text-gray-600">No budget records registered for {selectedSite ? selectedSite.name : 'this site'}.</p>
                            <p className="text-xs text-gray-400 font-medium">Budget allocations will be initialized upon project registration.</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-gray-600">No {displayTitle.toLowerCase()} available for {selectedSite ? selectedSite.name : 'this view'}.</p>
                            <p className="text-xs text-gray-400 font-medium">Use the primary action button to register the first record.</p>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredData.map((row: any) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    {activeColumns.map((col) => {
                      const val = row[col.key as keyof typeof row];
                      return (
                        <td key={col.key} className={`p-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                          {col.type === 'currency' ? (
                            <span className="font-mono font-bold text-gray-900">{safeFormatCurrency(val)}</span>
                          ) : col.type === 'badge' ? (
                            <StatusBadge status={String(val || 'active')} />
                          ) : col.type === 'mono' ? (
                            <span className="font-mono font-bold text-brand-700 bg-brand-50 border border-brand-150 px-1.5 py-0.5 rounded">{safeFormatText(val)}</span>
                          ) : col.type === 'date' ? (
                            <span className="font-mono text-gray-600">{safeFormatText(val)}</span>
                          ) : (
                            <span>{safeFormatText(val)}</span>
                          )}
                        </td>
                      );
                    })}

                    {schema.pageType !== 'report' && (
                      <td className="p-3 text-right print:hidden">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer focus:outline-none">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content 
                              className="bg-white border border-gray-150 rounded shadow-lg z-[1000] p-1 font-sans text-xs min-w-[170px] space-y-0.5 animate-scale-in"
                              sideOffset={4}
                              align="end"
                            >
                              {isOnAccountPage ? (
                                <>
                                  {activeTab === 'vendor_balances' && (
                                    <>
                                      <DropdownMenu.Item
                                        onClick={() => triggerToast(`Vendor Balance: ${row.vendorName || row.vendor} — Available: ${safeFormatCurrency(row.availableBalance)}`)}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <Eye className="h-3.5 w-3.5 text-brand-600" /> View Balance
                                      </DropdownMenu.Item>
                                      <DropdownMenu.Item
                                        onClick={() => triggerToast(`Initiated invoice allocation for ${row.vendorName || row.vendor}`)}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Allocate To Invoice
                                      </DropdownMenu.Item>
                                      <DropdownMenu.Item
                                        onClick={() => triggerToast(`Initiated balance transfer for ${row.vendorName || row.vendor}`)}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <ChevronRight className="h-3.5 w-3.5 text-brand-600" /> Transfer Balance
                                      </DropdownMenu.Item>
                                      <DropdownMenu.Item
                                        onClick={() => {
                                          setActiveTab('recent_transactions');
                                          setSearch(row.vendorName || row.vendor || '');
                                        }}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <Search className="h-3.5 w-3.5 text-gray-400" /> View Transactions
                                      </DropdownMenu.Item>
                                    </>
                                  )}
                                  {activeTab === 'site_balances' && (
                                    <>
                                      <DropdownMenu.Item
                                        onClick={() => triggerToast(`Site Fund Balance: ${row.siteName || row.site} — Available: ${safeFormatCurrency(row.availableBalance)}`)}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <Eye className="h-3.5 w-3.5 text-brand-600" /> View Balance
                                      </DropdownMenu.Item>
                                      <DropdownMenu.Item
                                        onClick={() => triggerToast(`Initiated inter-site fund transfer from ${row.siteName || row.site}`)}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <ChevronRight className="h-3.5 w-3.5 text-brand-600" /> Transfer To Site
                                      </DropdownMenu.Item>
                                      <DropdownMenu.Item
                                        onClick={() => {
                                          setActiveTab('recent_transactions');
                                          setSearch(row.siteName || row.site || '');
                                        }}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <Search className="h-3.5 w-3.5 text-gray-400" /> View Transactions
                                      </DropdownMenu.Item>
                                    </>
                                  )}
                                  {activeTab === 'recent_transactions' && (
                                    <>
                                      <DropdownMenu.Item
                                        onClick={() => triggerToast(`Transaction Ref: ${row.transactionReference || row.referenceNo || row.id} (${row.type || row.transactionType})`)}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <Eye className="h-3.5 w-3.5 text-brand-600" /> View Transaction
                                      </DropdownMenu.Item>
                                      <DropdownMenu.Item
                                        onClick={() => {
                                          if (row.invoiceNumber || row.invoiceId) {
                                            navigate('/finance/invoices');
                                          } else {
                                            triggerToast(`Linked Invoice: ${row.destinationSiteName || row.destination || 'N/A'}`);
                                          }
                                        }}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <ChevronRight className="h-3.5 w-3.5 text-brand-600" /> View Linked Invoice
                                      </DropdownMenu.Item>
                                      <DropdownMenu.Item
                                        onClick={() => triggerToast(`Source: ${row.sourceSiteName || row.source || 'Central Fund'} ➔ Destination: ${row.destinationSiteName || row.destination || 'Vendor Fund'}`)}
                                        className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                      >
                                        <Search className="h-3.5 w-3.5 text-gray-400" /> View Source & Destination
                                      </DropdownMenu.Item>
                                    </>
                                  )}
                                </>
                              ) : isInventoryPage ? (
                                <>
                                  <DropdownMenu.Item 
                                    onClick={() => triggerToast(`Stock Details: ${row.itemCode || ''} - ${row.itemName || ''} (${row.availableQuantity || 0} ${row.unitSymbol || ''} available)`)}
                                    className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-brand-600" /> View Stock Details
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item 
                                    onClick={() => navigate('/masters/items')}
                                    className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                  >
                                    <Search className="h-3.5 w-3.5 text-gray-400" /> View Item Master
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item 
                                    onClick={() => navigate('/procurement/grns')}
                                    className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                  >
                                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" /> View GRN History
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item 
                                    onClick={() => triggerToast(`Consumption History: ${row.itemCode} at ${row.siteName}`)}
                                    className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> View Consumption
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item 
                                    onClick={() => triggerToast(`Initiated stock transfer request for ${row.itemCode}`)}
                                    className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                  >
                                    <ChevronRight className="h-3.5 w-3.5 text-brand-600" /> Transfer Stock
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item 
                                    onClick={() => triggerToast(`Material issue recorded for ${row.itemCode}`)}
                                    className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                  >
                                    <Plus className="h-3.5 w-3.5 text-brand-600" /> Record Material Issue
                                  </DropdownMenu.Item>
                                </>
                              ) : (
                                <>
                                  <DropdownMenu.Item 
                                    onClick={() => navigate(`${schema.route}/${row.id || '1'}`)}
                                    className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-gray-400" /> View Details
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item 
                                    onClick={() => handleDuplicateRow(row)}
                                    className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                  >
                                    <Copy className="h-3.5 w-3.5 text-gray-400" /> Duplicate
                                  </DropdownMenu.Item>
                                  {(schema.route === '/finance/utility-bills' || schema.id === 'finance-utility-bills') && (
                                    <DropdownMenu.Item 
                                      onClick={() => navigate('/finance/utility-bills/new')}
                                      className="px-2.5 py-1.5 hover:bg-brand-50 text-brand-700 rounded flex items-center gap-1.5 cursor-pointer font-bold outline-none"
                                    >
                                      <ChevronRight className="h-3.5 w-3.5 text-brand-600" /> Split Bill
                                    </DropdownMenu.Item>
                                  )}
                                  <DropdownMenu.Item 
                                    onClick={() => handleToggleRowStatus(row.id)}
                                    className="px-2.5 py-1.5 hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 outline-none"
                                  >
                                    <Power className="h-3.5 w-3.5 text-gray-400" />
                                    {row.status === 'active' || row.status === 'empanelled' ? 'Deactivate' : 'Activate'}
                                  </DropdownMenu.Item>
                                </>
                              )}
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schema-Driven Modal Form for Master Create Actions */}
      {isModalOpen && schema.createFields && (
        <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-gray-150 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">{schema.primaryAction?.label || 'Create New Record'}</h3>
                <p className="text-[10.5px] text-gray-400 font-medium">Enter required details to save into local master ledger.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  triggerButtonRef.current?.focus();
                }}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {schema.createFields.map((field) => (
                  <div key={field.name} className={field.colSpan === 2 ? 'col-span-1 sm:col-span-2' : ''}>
                    <label className="block text-gray-700 font-bold mb-1 uppercase text-[9px] tracking-wider">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={modalFormData[field.name] || ''}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        className="w-full border border-gray-250 rounded p-2 focus:outline-none focus:border-brand-500 bg-white font-medium text-xs text-gray-800"
                        required={field.required}
                      >
                        <option value="">Select option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={2}
                        value={modalFormData[field.name] || ''}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full border border-gray-250 rounded p-2 focus:outline-none focus:border-brand-500 bg-white font-medium text-xs text-gray-800"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={modalFormData[field.name] || ''}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full border border-gray-250 rounded p-2 focus:outline-none focus:border-brand-500 bg-white font-medium text-xs text-gray-800"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    triggerButtonRef.current?.focus();
                  }}
                  className="px-4 py-2 border border-gray-250 rounded font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold shadow-sm cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
