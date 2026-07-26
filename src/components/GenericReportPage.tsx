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
  AlertCircle
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
  const { sites } = useSites();
  const [toast, setToast] = React.useState<string | null>(null);
  
  // Tab Management
  const tabs = schema.tabs || [];
  const [activeTabId, setActiveTabId] = React.useState<string>(tabs[0]?.id || 'default');

  // Filter States
  const [search, setSearch] = React.useState('');
  const [selectedSite, setSelectedSite] = React.useState('');
  const [fromDate, setFromDate] = React.useState('2026-01-01');
  const [toDate, setToDate] = React.useState('2026-12-31');

  // Reset tab selection when parent route schema changes
  React.useEffect(() => {
    if (schema.tabs && schema.tabs.length > 0) {
      setActiveTabId(schema.tabs[0].id);
    }
  }, [schema.id]);

  // Reset filter values when switching sub-tabs
  React.useEffect(() => {
    setSearch('');
    setSelectedSite('');
    setFromDate('2026-01-01');
    setToDate('2026-12-31');
  }, [activeTabId, schema.id]);

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

  // Filtered Rows by Search, Site, and Date Range
  const filteredRows = React.useMemo(() => {
    return rawRows.filter((r: any) => {
      const matchSearch = JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
      const matchSite = !selectedSite || (
        r.siteId === selectedSite ||
        (r.site && String(r.site).toLowerCase().includes(selectedSite.toLowerCase())) ||
        (r.siteName && String(r.siteName).toLowerCase().includes(selectedSite.toLowerCase())) ||
        (r.destinationSite && String(r.destinationSite).toLowerCase().includes(selectedSite.toLowerCase())) ||
        (r.relatedSite && String(r.relatedSite).toLowerCase().includes(selectedSite.toLowerCase()))
      );
      
      // ISO Date filtering
      const rowDate = r.poDate || r.date || r.invoiceDate || r.paymentDate || r.loginDate || r.lastContactDate || r.billDate;
      let matchDate = true;
      if (rowDate && typeof rowDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(rowDate)) {
        if (fromDate && rowDate < fromDate) matchDate = false;
        if (toDate && rowDate > toDate) matchDate = false;
      }
      return matchSearch && matchSite && matchDate;
    });
  }, [rawRows, search, selectedSite, fromDate, toDate]);

  // Compute explicit chart configuration from activeTab, schema, and filteredRows
  const chartConfig = React.useMemo(() => {
    return getReportChartConfig(activeTab.id || schema.id, schema.id, filteredRows);
  }, [activeTab.id, schema.id, filteredRows]);

  // Check if chart has non-zero finite numeric data
  const hasChartData = React.useMemo(() => {
    if (!chartConfig.data || chartConfig.data.length === 0 || chartConfig.series.length === 0) {
      return false;
    }
    return chartConfig.data.some((row) =>
      chartConfig.series.some((s) => {
        const val = toFiniteNumber(row[s.key]);
        return val !== 0;
      })
    );
  }, [chartConfig]);

  // Dynamic Chart Renderer
  const renderAnalyticsChart = () => {
    if (!hasChartData) {
      return (
        <div className="h-[340px] w-full flex flex-col items-center justify-center gap-3 text-gray-500 bg-gray-50/60 rounded-lg border border-dashed border-gray-250 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500/80" />
          <div className="space-y-1">
            <p className="font-bold text-xs text-gray-800">
              No chart data is available for the selected site and date range.
            </p>
            <p className="text-[11px] text-gray-500">
              Try adjusting your filter criteria or site selection to view graphical analytics.
            </p>
          </div>
          {(search || selectedSite || fromDate !== '2026-01-01' || toDate !== '2026-12-31') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedSite('');
                setFromDate('2026-01-01');
                setToDate('2026-12-31');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded text-xs font-bold text-gray-700 shadow-sm transition-colors cursor-pointer"
            >
              <Filter className="h-3.5 w-3.5 text-gray-500" /> Reset Filters
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

  // UTF-8 BOM CSV Export
  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      triggerToast('No report rows available to export');
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

    const csvContent = '\uFEFF' + [headers.join(','), ...csvLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${activeTab.id || schema.id}-${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Exported CSV file: ${filename}`);
  };

  // Print / PDF Handler
  const handlePrintReport = () => {
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
            disabled={filteredRows.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded font-bold transition-colors ${
              filteredRows.length === 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={handlePrintReport}
            disabled={filteredRows.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded font-bold transition-colors ${
              filteredRows.length === 0
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
            className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs text-gray-800 font-medium"
          >
            <option value="">All Project Sites</option>
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
            className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs font-mono"
          />
        </div>
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs font-mono"
          />
        </div>
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Search Keywords:</label>
          <div className="relative flex items-center gap-1">
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
            {(search || selectedSite || fromDate !== '2026-01-01' || toDate !== '2026-12-31') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedSite('');
                  setFromDate('2026-01-01');
                  setToDate('2026-12-31');
                }}
                className="p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 rounded border hover:bg-gray-200 shrink-0 cursor-pointer"
                title="Clear Filters"
              >
                <Filter className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {activeTab.summaryCards && activeTab.summaryCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activeTab.summaryCards.map((card: any) => {
            let cardVal = card.value;
            if (activeTab.id === 'login-time') {
              if (card.label.toLowerCase().includes('active')) {
                cardVal = filteredRows.filter(r => r.activeSession || r.logoutTime === 'Active Session').length;
              } else if (card.label.toLowerCase().includes('failed')) {
                cardVal = filteredRows.filter(r => r.authResult === 'failed').length;
              }
            }
            return (
              <div key={card.id} className="p-3.5 border border-gray-150 rounded bg-white shadow-sm space-y-1">
                <span className="text-[9.5px] uppercase font-bold text-gray-400 block">{card.label}</span>
                <span className={`font-extrabold text-base block ${card.color || 'text-gray-900'}`}>
                  {card.isCurrency ? safeFormatCurrency(cardVal) : cardVal}
                </span>
              </div>
            );
          })}
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
            {filteredRows.length} {filteredRows.length === 1 ? 'Record' : 'Records'} Plotted
          </span>
        </div>
        <div className="min-h-[340px] w-full">
          {renderAnalyticsChart()}
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white border border-gray-150 rounded-lg shadow-sm overflow-hidden">
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
                    No matching report entries found for the selected filter range.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row: any, idx: number) => (
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
      </div>
    </div>
  );
};

export default GenericReportPage;
