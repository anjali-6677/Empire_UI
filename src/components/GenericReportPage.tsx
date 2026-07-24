import * as React from 'react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
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
  FileText, 
  Printer, 
  CheckCircle2,
  Search
} from 'lucide-react';
import { ModuleSchema } from '../config/moduleSchemas';
import { StatusBadge } from './StatusBadge';
import { safeFormatCurrency, safeFormatText } from '../utils/formatStatus';

interface GenericReportPageProps {
  schema: ModuleSchema;
}

export const GenericReportPage: React.FC<GenericReportPageProps> = ({ schema }) => {
  const [toast, setToast] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [selectedSite, setSelectedSite] = React.useState('');
  const [fromDate, setFromDate] = React.useState('2026-01-01');
  const [toDate, setToDate] = React.useState('2026-07-24');

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const rawRows = React.useMemo(() => {
    return schema.mockRows || [];
  }, [schema.mockRows]);

  // Filtered Rows
  const filteredRows = React.useMemo(() => {
    return rawRows.filter((r) => {
      const matchSearch = JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
      const matchSite = !selectedSite || (r.site && r.site.includes(selectedSite));
      return matchSearch && matchSite;
    });
  }, [rawRows, search, selectedSite]);

  // CSV Export Functionality
  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      triggerToast('No report rows available to export');
      return;
    }

    const cols = schema.columns || [];
    const headers = cols.map((c) => `"${c.label.replace(/"/g, '""')}"`);

    const csvLines = filteredRows.map((row) => {
      return cols
        .map((col) => {
          const val = row[col.key];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'number') return String(val);
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',');
    });

    const csvContent = [headers.join(','), ...csvLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `empire-${schema.id}-report-${new Date().toISOString().split('T')[0]}.csv`;

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

      {/* Report Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">{schema.title}</h1>
          {schema.description && <p className="text-[10.5px] text-gray-400 font-medium">{schema.description}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded font-bold cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded font-bold cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" /> Export PDF
          </button>
          <button
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-250 hover:bg-gray-100 rounded font-bold cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" /> Print Report
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
            className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs text-gray-800"
          >
            <option value="">All Project Sites</option>
            <option value="Nexus Tech Park">Nexus Tech Park</option>
            <option value="Grand Hyatt">Grand Hyatt Goa</option>
            <option value="Imperial Heights">Imperial Heights</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs"
          />
        </div>
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs"
          />
        </div>
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Search Keywords:</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter report rows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 border border-gray-250 rounded p-1.5 bg-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {schema.summaryCards && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {schema.summaryCards.map((card) => (
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
      <div className="p-4 bg-white border border-gray-150 rounded-lg shadow-sm space-y-2 no-print">
        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Report Analytics Visualization</h4>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredRows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey={schema.id.includes('finance') ? 'vendor' : schema.id.includes('admin') ? 'module' : 'site'} tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={(val) => typeof val === 'number' && val > 100000 ? `₹${(val / 100000).toFixed(0)}L` : String(val)} />
              <Tooltip formatter={(val: any) => [typeof val === 'number' ? safeFormatCurrency(val) : val, 'Value']} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              {schema.id.includes('budget') ? (
                <>
                  <Bar dataKey="approvedBudget" name="Approved Budget" fill="#ab9570" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actualOutlay" name="Actual Outlay" fill="#1e293b" radius={[2, 2, 0, 0]} />
                </>
              ) : schema.id.includes('finance') ? (
                <>
                  <Bar dataKey="certifiedAmount" name="Certified Bill" fill="#ab9570" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="paidAmount" name="Disbursed Payment" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="dueAmount" name="Outstanding Due" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                </>
              ) : (
                <Bar dataKey={filteredRows[0]?.totalSpend ? 'totalSpend' : filteredRows[0]?.finalAmount ? 'finalAmount' : 'id'} name="Report Value" fill="#ab9570" radius={[2, 2, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white border border-gray-150 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150 min-w-[700px]">
            <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
              <tr>
                {schema.columns?.map((col) => (
                  <th key={col.key} className={`p-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={schema.columns?.length || 1} className="p-8 text-center text-gray-400 italic">
                    No matching report entries found for the selected filter range.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50/60">
                    {schema.columns?.map((col) => {
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
