import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  Plus, 
  MoreVertical, 
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
import { ListPageLayout } from './common/ListPageLayout';
import { FilterToolbar } from './common/FilterToolbar';
import { PageHeader } from './common/PageHeader';

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
        { id: '1', label: 'Total In-Stock Value', value: totalStockValue, isCurrency: true, color: 'text-slate-900' },
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
        { id: '1', label: 'Total Vendor Available Balance', value: totalVendorBal, isCurrency: true, color: 'text-slate-900' },
        { id: '2', label: 'Total Site Available Balance', value: totalSiteBal, isCurrency: true, color: 'text-slate-900' },
        { id: '3', label: 'Transfers This Month', value: transfersCount, color: 'text-slate-900' }
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
    <ListPageLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[1100] bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-xs flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-[#AB9570]" />
          {toast}
        </div>
      )}

      {/* Header */}
      <PageHeader
        title={displayTitle}
        subtitle={displayDescription}
        breadcrumbs={schema.breadcrumbs.map((b) => ({ label: b }))}
        actions={
          <div className="flex items-center gap-2">
            {schema.primaryAction && (
              <button
                ref={triggerButtonRef}
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 cursor-pointer shrink-0 print:hidden"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                {schema.primaryAction.label}
              </button>
            )}
            {schema.pageType === 'report' && (
              <div className="flex gap-2 shrink-0 print:hidden">
                <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-800 font-bold rounded-xl shadow-2xs hover:bg-slate-50 text-xs cursor-pointer">
                  <Download className="h-3.5 w-3.5" /> Export Data
                </button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-800 font-bold rounded-xl shadow-2xs hover:bg-slate-50 text-xs cursor-pointer">
                  <Printer className="h-3.5 w-3.5" /> Print PDF
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Summary Cards */}
      {calculatedSummaryCards && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {calculatedSummaryCards.map((card: any, idx: number) => {
            const cardValue = idx === 0 && schema.createFields && !activeTabConfig?.summaryCards && !isOnAccountPage ? localRows.length : card.value;
            return (
              <div key={card.id} className="p-3.5 border border-[#E2E6EC] rounded-xl bg-white shadow-2xs space-y-1">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">{card.label}</span>
                <span className={`font-extrabold text-base block ${card.color || 'text-slate-900'}`}>
                  {card.isCurrency ? safeFormatCurrency(cardValue) : cardValue}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Tabs */}
      {schema.tabs && (
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none pb-0.5">
          {schema.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#AB9570] text-[#AB9570] bg-[#AB9570]/5 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <FilterToolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Filter ${displayTitle.toLowerCase()} by keyword or code...`}
      />

      {/* Data Table */}
      <div className="bg-white border border-[#E2E6EC] rounded-xl shadow-2xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                {activeColumns.map((col) => (
                  <th key={col.key} className={`px-3.5 py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {col.label}
                  </th>
                ))}
                {schema.pageType !== 'report' && (
                  <th className="px-3.5 py-3 text-right print:hidden">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={activeColumns.length + 1} className="p-12 text-center text-slate-400">
                    {search.trim() !== '' ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700">No records match your search.</p>
                        <p className="text-xs text-slate-400 font-medium">Clear search query "{search}" to view available records.</p>
                      </div>
                    ) : activeTab !== 'all' && siteFilteredRows.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700">No records match the selected filters.</p>
                        <p className="text-xs text-slate-400 font-medium">Switch status tabs or adjust filter selections to view available records.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700">No {displayTitle.toLowerCase()} available for {selectedSite ? selectedSite.name : 'this view'}.</p>
                        <p className="text-xs text-slate-400 font-medium">Use the primary action button to register the first record.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredData.map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors h-14">
                    {activeColumns.map((col) => {
                      const val = row[col.key as keyof typeof row];
                      return (
                        <td key={col.key} className={`px-3.5 py-3 align-middle ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                          {col.type === 'currency' ? (
                            <span className="font-mono font-bold text-slate-900">{safeFormatCurrency(val)}</span>
                          ) : col.type === 'badge' ? (
                            <StatusBadge status={String(val || 'active')} />
                          ) : col.type === 'mono' ? (
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">{safeFormatText(val)}</span>
                          ) : col.type === 'date' ? (
                            <span className="font-mono text-slate-600">{safeFormatText(val)}</span>
                          ) : (
                            <span>{safeFormatText(val)}</span>
                          )}
                        </td>
                      );
                    })}

                    {schema.pageType !== 'report' && (
                      <td className="px-3.5 py-3 text-right align-middle print:hidden">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer focus:outline-hidden">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content 
                              className="bg-white border border-slate-200 rounded-xl shadow-lg z-[1000] p-1 font-sans text-xs min-w-[170px] space-y-0.5"
                              sideOffset={4}
                              align="end"
                            >
                              <DropdownMenu.Item 
                                onClick={() => navigate(`${schema.route}/${row.id || '1'}`)}
                                className="px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer font-bold text-slate-700 outline-hidden"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-400" /> View Details
                              </DropdownMenu.Item>
                              <DropdownMenu.Item 
                                onClick={() => handleDuplicateRow(row)}
                                className="px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer font-bold text-slate-700 outline-hidden"
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-400" /> Duplicate
                              </DropdownMenu.Item>
                              <DropdownMenu.Item 
                                onClick={() => handleToggleRowStatus(row.id)}
                                className="px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer font-bold text-slate-700 outline-hidden"
                              >
                                <Power className="h-3.5 w-3.5 text-slate-400" />
                                {row.status === 'active' || row.status === 'empanelled' ? 'Deactivate' : 'Activate'}
                              </DropdownMenu.Item>
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
        <div className="fixed inset-0 z-[1200] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">{schema.primaryAction?.label || 'Create New Record'}</h3>
                <p className="text-[10.5px] text-slate-500 font-medium">Enter required details to save into local master ledger.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  triggerButtonRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {schema.createFields.map((field) => (
                  <div key={field.name} className={field.colSpan === 2 ? 'col-span-1 sm:col-span-2' : ''}>
                    <label className="block text-slate-700 font-bold mb-1 uppercase text-[9px] tracking-wider">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={modalFormData[field.name] || ''}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-[#AB9570] bg-white font-medium text-xs text-slate-800"
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
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-[#AB9570] bg-white font-medium text-xs text-slate-800"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={modalFormData[field.name] || ''}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-[#AB9570] bg-white font-medium text-xs text-slate-800"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    triggerButtonRef.current?.focus();
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="px-5 py-2 bg-[#AB9570] hover:bg-[#927D5E] disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ListPageLayout>
  );
};
