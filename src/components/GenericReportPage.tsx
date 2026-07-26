import * as React from 'react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Home, 
  ChevronRight, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2,
  Search,
  Filter,
  BarChart2,
  AlertCircle,
  X,
  ChevronLeft,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { ModuleSchema } from '../config/moduleSchemas';
import { StatusBadge } from './StatusBadge';
import { safeFormatCurrency, safeFormatText, formatStatusLabel } from '../utils/formatStatus';
import { useSites } from '../context/SitesContext';
import { 
  getReportChartConfig, 
  formatTooltipValue, 
  formatYAxisTick, 
  toFiniteNumber 
} from '../utils/reportChartAdapter';

interface GenericReportPageProps {
  schema: ModuleSchema;
}

export const GenericReportPage: React.FC<GenericReportPageProps> = ({ schema }) => {
  const { sites, selectedSiteId: headerSiteId } = useSites();
  const [toast, setToast] = React.useState<string | null>(null);
  
  // Tab Management
  const tabs = schema.tabs || [];
  const [activeTabId, setActiveTabId] = React.useState<string>(tabs[0]?.id || 'default');

  // Basic Filter States
  const [search, setSearch] = React.useState('');
  const [selectedSite, setSelectedSite] = React.useState('');
  const [fromDate, setFromDate] = React.useState('2026-01-01');
  const [toDate, setToDate] = React.useState('2026-12-31');

  // Advanced Funnel Filter Drawer State
  const [isFunnelOpen, setIsFunnelOpen] = React.useState(false);
  const [advancedStatus, setAdvancedStatus] = React.useState('all');
  const [advancedVendor, setAdvancedVendor] = React.useState('');
  const [advancedCategory, setAdvancedCategory] = React.useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Reset tab selection when parent route schema changes
  React.useEffect(() => {
    if (schema.tabs && schema.tabs.length > 0) {
      setActiveTabId(schema.tabs[0].id);
    }
  }, [schema.id]);

  // Reset filter values & pagination when switching sub-tabs or routes
  React.useEffect(() => {
    setSearch('');
    setSelectedSite('');
    setFromDate('2026-01-01');
    setToDate('2026-12-31');
    setAdvancedStatus('all');
    setAdvancedVendor('');
    setAdvancedCategory('');
    setCurrentPage(1);
  }, [activeTabId, schema.id]);

  // Keyboard ESC Listener for Funnel Drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFunnelOpen) {
        setIsFunnelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFunnelOpen]);

  const activeTab = React.useMemo(() => {
    if (tabs.length > 0) {
      return tabs.find((t) => t.id === activeTabId) || tabs[0];
    }
    return {
      id: schema.id,
      label: schema.title,
      title: schema.title,
      description: schema.description,
      columns: schema.columns || [],
      summaryCards: schema.summaryCards || [],
      mockRows: schema.mockRows || []
    };
  }, [tabs, activeTabId, schema]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const rawRows = React.useMemo(() => {
    return activeTab.mockRows || [];
  }, [activeTab.mockRows]);

  // Effective Site Context Precedence:
  // Explicit report site filter overrides header site; if report site is empty (''), fallback to headerSiteId (if not 'all').
  const effectiveSiteId = React.useMemo(() => {
    if (selectedSite) return selectedSite;
    if (headerSiteId && headerSiteId !== 'all') return headerSiteId;
    return '';
  }, [selectedSite, headerSiteId]);

  const effectiveSiteObj = React.useMemo(() => {
    if (!effectiveSiteId) return null;
    return sites.find((s) => s.id === effectiveSiteId || s.code === effectiveSiteId) || null;
  }, [sites, effectiveSiteId]);

  // Date Range Validation Check
  const isDateRangeInvalid = React.useMemo(() => {
    return Boolean(fromDate && toDate && fromDate > toDate);
  }, [fromDate, toDate]);

  // Active Advanced Filter Count Badge Calculation
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (selectedSite) count++;
    if (fromDate !== '2026-01-01') count++;
    if (toDate !== '2026-12-31') count++;
    if (search.trim()) count++;
    if (advancedStatus !== 'all') count++;
    if (advancedVendor.trim()) count++;
    if (advancedCategory.trim()) count++;
    return count;
  }, [selectedSite, fromDate, toDate, search, advancedStatus, advancedVendor, advancedCategory]);

  // Unified Filtered Rows Engine
  const filteredRows = React.useMemo(() => {
    if (isDateRangeInvalid) return [];

    const normalizedSearch = search.trim().toLowerCase();
    const normalizedVendor = advancedVendor.trim().toLowerCase();
    const normalizedCategory = advancedCategory.trim().toLowerCase();

    return rawRows.filter((r: any) => {
      // 1. Site Precedence & Matching (ID primary, name/code secondary)
      let matchSite = true;
      if (effectiveSiteId) {
        matchSite = Boolean(
          r.siteId === effectiveSiteId ||
          (r.site && String(r.site).toLowerCase().includes(effectiveSiteId.toLowerCase())) ||
          (r.siteName && String(r.siteName).toLowerCase().includes(effectiveSiteId.toLowerCase())) ||
          (r.destinationSite && String(r.destinationSite).toLowerCase().includes(effectiveSiteId.toLowerCase())) ||
          (r.relatedSite && String(r.relatedSite).toLowerCase().includes(effectiveSiteId.toLowerCase())) ||
          (effectiveSiteObj && (
            (r.site && String(r.site).toLowerCase().includes(effectiveSiteObj.name.toLowerCase())) ||
            (r.siteName && String(r.siteName).toLowerCase().includes(effectiveSiteObj.name.toLowerCase())) ||
            (r.site && String(r.site).toLowerCase().includes(effectiveSiteObj.code.toLowerCase()))
          ))
        );
      }

      // 2. ISO Date Range Filtering (Inclusive)
      const rowDate = r.poDate || r.date || r.invoiceDate || r.paymentDate || r.loginDate || r.lastContactDate || r.billDate;
      let matchDate = true;
      if (rowDate && typeof rowDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(rowDate)) {
        if (fromDate && rowDate < fromDate) matchDate = false;
        if (toDate && rowDate > toDate) matchDate = false;
      }

      // 3. Keyword Search (Trimmed, Case-Insensitive, Field-Specific)
      let matchSearch = true;
      if (normalizedSearch) {
        const searchableText = [
          r.site, r.siteName, r.vendor, r.vendorName, r.item, r.itemName,
          r.category, r.itemCategory, r.poNumber, r.invoiceNo, r.paymentRef,
          r.userName, r.user, r.status, r.deliveryStatus, r.budgetHealth, r.authResult, r.description
        ].filter(Boolean).join(' ').toLowerCase();
        
        matchSearch = searchableText.includes(normalizedSearch);
      }

      // 4. Advanced Funnel Filters
      let matchStatus = true;
      if (advancedStatus !== 'all') {
        const statusVal = String(r.status || r.deliveryStatus || r.budgetHealth || r.authResult || r.workflowStatus || '').toLowerCase();
        matchStatus = statusVal.includes(advancedStatus.toLowerCase());
      }

      let matchVendor = true;
      if (normalizedVendor) {
        const vendorVal = String(r.vendor || r.vendorName || '').toLowerCase();
        matchVendor = vendorVal.includes(normalizedVendor);
      }

      let matchCategory = true;
      if (normalizedCategory) {
        const catVal = String(r.category || r.itemCategory || r.item || '').toLowerCase();
        matchCategory = catVal.includes(normalizedCategory);
      }

      return matchSite && matchDate && matchSearch && matchStatus && matchVendor && matchCategory;
    });
  }, [rawRows, effectiveSiteId, effectiveSiteObj, fromDate, toDate, search, isDateRangeInvalid, advancedStatus, advancedVendor, advancedCategory]);

  // Reset Pagination when filters or rawRows change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredRows.length, activeTabId, selectedSite, fromDate, toDate, search, advancedStatus, advancedVendor, advancedCategory]);

  // Paginated Table Rows
  const paginatedRows = React.useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredRows.slice(startIdx, startIdx + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  // Dynamically Compute KPI Summary Cards from Filtered Rows
  const computedSummaryCards = React.useMemo(() => {
    if (!activeTab.summaryCards || activeTab.summaryCards.length === 0) return [];
    
    return activeTab.summaryCards.map((card: any) => {
      let cardVal = card.value;

      if (activeTab.id === 'login-time') {
        if (card.label.toLowerCase().includes('active')) {
          cardVal = filteredRows.filter(r => r.activeSession || r.logoutTime === 'Active Session').length;
        } else if (card.label.toLowerCase().includes('failed')) {
          cardVal = filteredRows.filter(r => r.authResult === 'failed').length;
        }
      } else if (activeTab.id === 'purchase-analysis' || schema.id === 'reports-purchase-analysis') {
        if (card.label.toLowerCase().includes('ordered')) {
          cardVal = filteredRows.reduce((acc, r) => acc + toFiniteNumber(r.orderedValue), 0);
        } else if (card.label.toLowerCase().includes('received')) {
          cardVal = filteredRows.reduce((acc, r) => acc + toFiniteNumber(r.receivedValue), 0);
        } else if (card.label.toLowerCase().includes('pending')) {
          cardVal = filteredRows.reduce((acc, r) => acc + toFiniteNumber(r.pendingValue), 0);
        }
      } else if (activeTab.id === 'all-project' || schema.id === 'reports-budget-all') {
        if (card.label.toLowerCase().includes('approved') || card.label.toLowerCase().includes('portfolio')) {
          cardVal = filteredRows.reduce((acc, r) => acc + toFiniteNumber(r.appBudget), 0);
        } else if (card.label.toLowerCase().includes('actual') || card.label.toLowerCase().includes('outlay')) {
          cardVal = filteredRows.reduce((acc, r) => acc + toFiniteNumber(r.actualSpend), 0);
        } else if (card.label.toLowerCase().includes('available')) {
          cardVal = filteredRows.reduce((acc, r) => acc + toFiniteNumber(r.available), 0);
        }
      } else if (activeTab.id === 'bill-payment') {
        if (card.label.toLowerCase().includes('certified')) {
          cardVal = filteredRows.reduce((acc, r) => acc + toFiniteNumber(r.totalCertified), 0);
        } else if (card.label.toLowerCase().includes('settled') || card.label.toLowerCase().includes('payments')) {
          cardVal = filteredRows.reduce((acc, r) => acc + toFiniteNumber(r.totalPaid), 0);
        } else if (card.label.toLowerCase().includes('outstanding') || card.label.toLowerCase().includes('creditor')) {
          cardVal = filteredRows.reduce((acc, r) => acc + toFiniteNumber(r.outstanding), 0);
        }
      }

      return {
        ...card,
        value: cardVal
      };
    });
  }, [activeTab.summaryCards, activeTab.id, schema.id, filteredRows]);

  // Compute explicit chart configuration from activeTab, schema, and filteredRows
  const chartConfig = React.useMemo(() => {
    return getReportChartConfig(activeTab.id || schema.id, schema.id, filteredRows);
  }, [activeTab.id, schema.id, filteredRows]);

  // Check if chart has non-zero finite numeric data
  const hasChartData = React.useMemo(() => {
    if (isDateRangeInvalid || !chartConfig.data || chartConfig.data.length === 0 || chartConfig.series.length === 0) {
      return false;
    }
    return chartConfig.data.some((row) =>
      chartConfig.series.some((s) => {
        const val = toFiniteNumber(row[s.key]);
        return val !== 0;
      })
    );
  }, [chartConfig, isDateRangeInvalid]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSite('');
    setFromDate('2026-01-01');
    setToDate('2026-12-31');
    setAdvancedStatus('all');
    setAdvancedVendor('');
    setAdvancedCategory('');
    setCurrentPage(1);
    triggerToast('Filters reset to default range');
  };

  // Dynamic Chart Renderer
  const renderAnalyticsChart = () => {
    if (isDateRangeInvalid) {
      return (
        <div className="h-[340px] w-full flex flex-col items-center justify-center gap-3 text-red-600 bg-red-50/50 rounded-lg border border-dashed border-red-200 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="space-y-1">
            <p className="font-bold text-xs text-red-800">
              Invalid Date Range Selection
            </p>
            <p className="text-[11px] text-red-600">
              From Date ({fromDate}) cannot be after To Date ({toDate}). Please correct the date filters to view charts.
            </p>
          </div>
        </div>
      );
    }

    if (!hasChartData) {
      return (
        <div className="h-[340px] w-full flex flex-col items-center justify-center gap-3 text-gray-500 bg-gray-50/60 rounded-lg border border-dashed border-gray-250 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500/80" />
          <div className="space-y-1">
            <p className="font-bold text-xs text-gray-800">
              No report data is available for the selected site, date range, and search criteria.
            </p>
            <p className="text-[11px] text-gray-500">
              Try adjusting your filter criteria or site selection to view graphical analytics.
            </p>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded text-xs font-bold text-gray-700 shadow-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-500" /> Reset All Filters
            </button>
          )}
        </div>
      );
    }

    const { type, series, data, yAxisUnit } = chartConfig;

    // Line Chart
    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data} margin={{ top: 15, right: 30, left: 15, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(val) => formatYAxisTick(val, yAxisUnit)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-gray-900 text-white p-2.5 rounded shadow-lg text-xs space-y-1 border border-gray-700 z-50">
                    <p className="font-bold border-b border-gray-700 pb-1 text-amber-400">{label}</p>
                    {payload.map((entry: any, i: number) => {
                      const matchingSeries = series.find((s) => s.key === entry.dataKey);
                      const unit = matchingSeries?.unit || yAxisUnit;
                      return (
                        <div key={i} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-gray-300">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.name}:
                          </span>
                          <span className="font-mono font-bold text-white">
                            {formatTooltipValue(entry.value, unit)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: s.color }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Horizontal Bar Chart
    if (type === 'horizontal_bar') {
      return (
        <ResponsiveContainer width="100%" height={Math.max(340, data.length * 48)}>
          <BarChart data={data} layout="vertical" margin={{ top: 15, right: 30, left: 30, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(val) => formatYAxisTick(val, yAxisUnit)}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 10, fill: '#475569' }}
              width={140}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-gray-900 text-white p-2.5 rounded shadow-lg text-xs space-y-1 border border-gray-700 z-50">
                    <p className="font-bold border-b border-gray-700 pb-1 text-amber-400">{label}</p>
                    {payload.map((entry: any, i: number) => {
                      const matchingSeries = series.find((s) => s.key === entry.dataKey);
                      const unit = matchingSeries?.unit || yAxisUnit;
                      return (
                        <div key={i} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-gray-300">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.name}:
                          </span>
                          <span className="font-mono font-bold text-white">
                            {formatTooltipValue(entry.value, unit)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[0, 4, 4, 0]} barSize={16} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Default Grouped / Stacked Vertical Bar Chart
    return (
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ top: 15, right: 20, left: 15, bottom: 45 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#64748b' }}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickFormatter={(val) => formatYAxisTick(val, yAxisUnit)}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              return (
                <div className="bg-gray-900 text-white p-2.5 rounded shadow-lg text-xs space-y-1 border border-gray-700 z-50">
                  <p className="font-bold border-b border-gray-700 pb-1 text-amber-400">{label}</p>
                  {payload.map((entry: any, i: number) => {
                    const matchingSeries = series.find((s) => s.key === entry.dataKey);
                    const unit = matchingSeries?.unit || yAxisUnit;
                    return (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          {entry.name}:
                        </span>
                        <span className="font-mono font-bold text-white">
                          {formatTooltipValue(entry.value, unit)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              stackId={type === 'stacked_bar' ? 'stack' : undefined}
              radius={type === 'stacked_bar' ? [0, 0, 0, 0] : [3, 3, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // UTF-8 BOM CSV Export with Active Filter Metadata Header
  const handleExportCSV = () => {
    if (isDateRangeInvalid) {
      triggerToast('Cannot export CSV with an invalid date range');
      return;
    }

    if (filteredRows.length === 0) {
      triggerToast('No matching report rows available to export');
      return;
    }

    const cols = activeTab.columns || [];
    const headers = cols.map((c) => `"${c.label.replace(/"/g, '""')}"`);

    const csvLines = filteredRows.map((row: any) => {
      return cols
        .map((col) => {
          let val = row[col.key];
          if (val === null || val === undefined) return '""';
          
          if (typeof val === 'number') {
            return String(val);
          }

          if (col.type === 'currency' && typeof val === 'string') {
            const numericOnly = val.replace(/[^0-9.-]/g, '');
            if (numericOnly && !isNaN(Number(numericOnly))) {
              return numericOnly;
            }
          }

          if (col.type === 'badge' || typeof val === 'string') {
            const rawStr = String(val).trim();
            if (/^[a-z0-9_]+$/.test(rawStr) && (col.type === 'badge' || rawStr.includes('_') || ['pending', 'completed', 'active', 'inactive', 'draft', 'closed'].includes(rawStr))) {
              val = formatStatusLabel(rawStr);
            }
          }

          if (col.type === 'date' && typeof val === 'string' && val.includes('T')) {
            val = val.split('T')[0];
          }

          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',');
    });

    const metadataHeader = [
      `# Empire ERP Report Export: ${activeTab.title || schema.title}`,
      `# Export Date: ${new Date().toISOString()}`,
      `# Filter Site: ${effectiveSiteObj ? effectiveSiteObj.name : 'All Project Sites'}`,
      `# Date Range: ${fromDate} to ${toDate}`,
      `# Search Query: ${search ? `"${search}"` : 'None'}`,
      `# Total Filtered Rows: ${filteredRows.length}`,
      ''
    ].join('\n');

    const csvContent = '\uFEFF' + metadataHeader + [headers.join(','), ...csvLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${activeTab.id || schema.id}-${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Exported CSV: ${filename} (${filteredRows.length} rows)`);
  };

  // Print / PDF Handler
  const handlePrintReport = () => {
    if (isDateRangeInvalid) {
      triggerToast('Cannot print report with an invalid date range');
      return;
    }
    window.print();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-14 select-none relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[1100] bg-brand-650 text-white px-4 py-2 rounded shadow-lg font-bold text-xs flex items-center gap-2 animate-slide-in no-print">
          <CheckCircle2 className="h-4 w-4 text-brand-200" />
          {toast}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase no-print">
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

      {/* Sub-Tab Navigation Bar */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto pb-0.5 no-print scrollbar-none">
          {tabs.map((t) => {
            const isActive = t.id === activeTabId;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTabId(t.id)}
                className={`px-3.5 py-2 font-bold text-xs rounded-t border-t border-x transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-brand-700 border-gray-200 border-b-white -mb-px shadow-sm'
                    : 'bg-gray-50/80 text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Report Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">{activeTab.title || schema.title}</h1>
          {(activeTab.description || schema.description) && (
            <p className="text-[10.5px] text-gray-400 font-medium">{activeTab.description || schema.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={handleExportCSV}
            disabled={filteredRows.length === 0 || isDateRangeInvalid}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded font-bold transition-colors ${
              filteredRows.length === 0 || isDateRangeInvalid
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={handlePrintReport}
            disabled={filteredRows.length === 0 || isDateRangeInvalid}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded font-bold transition-colors ${
              filteredRows.length === 0 || isDateRangeInvalid
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 cursor-pointer'
            }`}
          >
            <Printer className="h-3.5 w-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 border border-gray-150 rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 no-print">
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Filter Site:</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs text-gray-800 font-medium cursor-pointer"
          >
            <option value="">All Project Sites {headerSiteId && headerSiteId !== 'all' ? `(Header Active: ${sites.find(s=>s.id===headerSiteId)?.code || headerSiteId})` : ''}</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={`w-full border rounded p-1.5 bg-white text-xs font-mono ${isDateRangeInvalid ? 'border-red-500 text-red-600 bg-red-50/30' : 'border-gray-250'}`}
          />
        </div>
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={`w-full border rounded p-1.5 bg-white text-xs font-mono ${isDateRangeInvalid ? 'border-red-500 text-red-600 bg-red-50/30' : 'border-gray-250'}`}
          />
        </div>
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Search & Funnel Filters:</label>
          <div className="relative flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter report rows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 border border-gray-250 rounded p-1.5 bg-white text-xs"
              />
            </div>

            {/* Funnel Advanced Filters Toggle Button */}
            <button
              onClick={() => setIsFunnelOpen(!isFunnelOpen)}
              className={`p-1.5 rounded border transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                activeFilterCount > 0
                  ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold'
                  : 'bg-gray-100 border-gray-250 text-gray-600 hover:bg-gray-200'
              }`}
              title="Open Advanced Filters Panel"
              aria-label="Open advanced filters"
            >
              <Filter className="h-3.5 w-3.5" />
              {activeFilterCount > 0 && (
                <span className="bg-brand-600 text-white rounded-full px-1.5 py-0.2 text-[9px] font-extrabold leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Reset Filters Quick Action */}
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 rounded border border-gray-250 hover:bg-gray-200 shrink-0 cursor-pointer"
                title="Reset All Filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date Range Validation Warning Banner */}
      {isDateRangeInvalid && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center justify-between gap-3 animate-fade-in no-print">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>
              <strong>Invalid Date Range:</strong> 'From Date' ({fromDate}) cannot be after 'To Date' ({toDate}).
            </span>
          </div>
          <button
            onClick={() => {
              setFromDate('2026-01-01');
              setToDate('2026-12-31');
            }}
            className="px-2.5 py-1 bg-white border border-red-300 hover:bg-red-100 rounded text-[11px] font-bold text-red-800 transition-colors shrink-0 cursor-pointer"
          >
            Reset Dates
          </button>
        </div>
      )}

      {/* Advanced Funnel Filter Drawer / Panel */}
      {isFunnelOpen && (
        <div className="bg-slate-900/90 text-white p-4 border border-slate-700 rounded-lg shadow-xl space-y-4 animate-slide-in no-print z-50">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-amber-400" />
              <h3 className="font-extrabold text-xs tracking-wide uppercase text-amber-400">Advanced Report Filters</h3>
            </div>
            <button
              onClick={() => setIsFunnelOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Panel (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 text-[9px] uppercase font-bold mb-1">Status Lifecycle:</label>
              <select
                value={advancedStatus}
                onChange={(e) => setAdvancedStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-white font-medium focus:ring-1 focus:ring-amber-400"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed / Settled</option>
                <option value="pending">Pending / Active</option>
                <option value="partially">Partially Received</option>
                <option value="approved">Approved</option>
                <option value="healthy">Healthy Budget</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[9px] uppercase font-bold mb-1">Vendor / Partner Filter:</label>
              <input
                type="text"
                placeholder="Filter by vendor name..."
                value={advancedVendor}
                onChange={(e) => setAdvancedVendor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-white placeholder-slate-500 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[9px] uppercase font-bold mb-1">Category / Item Filter:</label>
              <input
                type="text"
                placeholder="Filter by category or item..."
                value={advancedCategory}
                onChange={(e) => setAdvancedCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-white placeholder-slate-500 font-medium focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <span className="text-[10.5px] text-slate-400 font-medium">
              {filteredRows.length} matching rows found under applied filter criteria.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFunnelOpen(false)}
                className="px-4 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded text-xs transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {computedSummaryCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {computedSummaryCards.map((card: any) => (
            <div key={card.id} className="p-3.5 border border-gray-150 rounded bg-white shadow-sm space-y-1">
              <span className="text-[9.5px] uppercase font-bold text-gray-400 block">{card.label}</span>
              <span className={`font-extrabold text-base block ${card.color || 'text-gray-900'}`}>
                {card.isCurrency ? safeFormatCurrency(card.value) : card.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recharts Analytics Section */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3 no-print">
        <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
          <h4 className="font-extrabold text-xs text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-brand-600" />
            {chartConfig.title}
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            {chartConfig.data.length} {chartConfig.data.length === 1 ? 'Record' : 'Records'} Plotted
          </span>
        </div>
        <div className="min-h-[340px] w-full">
          {renderAnalyticsChart()}
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white border border-gray-150 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150 min-w-[700px]">
            <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
              <tr>
                {activeTab.columns?.map((col: any) => (
                  <th key={col.key} className={`p-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={activeTab.columns?.length || 1} className="p-8 text-center text-gray-400 italic">
                    {isDateRangeInvalid
                      ? "Date range is invalid. Please ensure 'From Date' is before 'To Date'."
                      : "No matching report entries found for the selected filter range."}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row: any, idx: number) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50/60">
                    {activeTab.columns?.map((col: any) => {
                      const val = row[col.key];
                      return (
                        <td key={col.key} className={`p-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                          {col.type === 'currency' ? (
                            <span className="font-mono font-bold text-gray-900">{safeFormatCurrency(val)}</span>
                          ) : col.type === 'badge' ? (
                            <StatusBadge status={String(val || 'active')} />
                          ) : col.type === 'mono' ? (
                            <span className="font-mono font-bold text-brand-700 bg-brand-50 border border-brand-150 px-1.5 py-0.5 rounded">{safeFormatText(val)}</span>
                          ) : (
                            <span>{safeFormatText(val)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredRows.length > 0 && (
          <div className="p-3 bg-gray-50 border-t border-gray-150 flex items-center justify-between text-xs text-gray-600 font-medium no-print">
            <span>
              Showing <strong className="text-gray-900">{Math.min((currentPage - 1) * pageSize + 1, filteredRows.length)}</strong> to{' '}
              <strong className="text-gray-900">{Math.min(currentPage * pageSize, filteredRows.length)}</strong> of{' '}
              <strong className="text-gray-900">{filteredRows.length}</strong> entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-1.5 rounded border transition-colors flex items-center gap-1 font-bold ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer shadow-sm'
                }`}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>

              <span className="px-2 font-bold text-gray-800">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-1.5 rounded border transition-colors flex items-center gap-1 font-bold ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer shadow-sm'
                }`}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericReportPage;
