import * as React from 'react';
import { Search, RotateCcw, Calendar } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters } from '../../utils/reportCalculators';

interface ReportFilterBarProps {
  filters: CommonReportFilters;
  onChange: (newFilters: CommonReportFilters) => void;
  onReset: () => void;
  showProjectFilter?: boolean;
  showClientFilter?: boolean;
  showVendorFilter?: boolean;
  showSubcontractorFilter?: boolean;
  showCategoryFilter?: boolean;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  showProjectFilter = true,
  showClientFilter = false,
  showVendorFilter = false,
  showSubcontractorFilter = false,
  showCategoryFilter = false,
}) => {
  const { state } = useERPStore();
  const projects = state.projects || [];
  const clients = state.clients || [];
  const vendors = state.vendors || [];
  const subcontractors = state.subcontractors || [];
  const categories = state.categories || [];

  const handleDateShortcut = (shortcut: 'today' | 'month' | 'quarter' | 'all') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (shortcut === 'today') {
      onChange({ ...filters, fromDate: todayStr, toDate: todayStr });
    } else if (shortcut === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      onChange({ ...filters, fromDate: firstDay, toDate: todayStr });
    } else if (shortcut === 'quarter') {
      const qMonth = Math.floor(today.getMonth() / 3) * 3;
      const firstDay = new Date(today.getFullYear(), qMonth, 1).toISOString().split('T')[0];
      onChange({ ...filters, fromDate: firstDay, toDate: todayStr });
    } else {
      onChange({ ...filters, fromDate: '', toDate: '' });
    }
  };

  const hasActiveFilters = Boolean(
    (filters.projectId && filters.projectId !== 'all') ||
      (filters.clientId && filters.clientId !== 'all') ||
      (filters.vendorId && filters.vendorId !== 'all') ||
      (filters.subcontractorId && filters.subcontractorId !== 'all') ||
      (filters.categoryId && filters.categoryId !== 'all') ||
      filters.fromDate ||
      filters.toDate ||
      filters.search
  );

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3 no-print w-full">
      {/* Date Shortcuts & Quick Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-150 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-gray-400 font-bold uppercase text-[9px] mr-1 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-500" /> Date Period:
          </span>
          <button
            type="button"
            onClick={() => handleDateShortcut('all')}
            className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
              !filters.fromDate && !filters.toDate ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            type="button"
            onClick={() => handleDateShortcut('month')}
            className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
              filters.fromDate && !filters.toDate ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => handleDateShortcut('quarter')}
            className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
              filters.fromDate?.includes('-01') ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Quarter
          </button>
          <button
            type="button"
            onClick={() => handleDateShortcut('today')}
            className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
              filters.fromDate === new Date().toISOString().split('T')[0] ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-250 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" /> Reset Filters
          </button>
        )}
      </div>

      {/* Primary Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
        {/* Project Selector */}
        {showProjectFilter && (
          <div>
            <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Project:</label>
            <select
              value={filters.projectId || 'all'}
              onChange={(e) => onChange({ ...filters, projectId: e.target.value })}
              className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.projectName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Client Selector */}
        {showClientFilter && (
          <div>
            <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Client:</label>
            <select
              value={filters.clientId || 'all'}
              onChange={(e) => onChange({ ...filters, clientId: e.target.value })}
              className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs font-medium text-gray-800"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.companyName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Vendor Selector */}
        {showVendorFilter && (
          <div>
            <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Vendor:</label>
            <select
              value={filters.vendorId || 'all'}
              onChange={(e) => onChange({ ...filters, vendorId: e.target.value })}
              className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs font-medium text-gray-800"
            >
              <option value="all">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.companyName || v.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subcontractor Selector */}
        {showSubcontractorFilter && (
          <div>
            <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Subcontractor:</label>
            <select
              value={filters.subcontractorId || 'all'}
              onChange={(e) => onChange({ ...filters, subcontractorId: e.target.value })}
              className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs font-medium text-gray-800"
            >
              <option value="all">All Subcontractors</option>
              {subcontractors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Selector */}
        {showCategoryFilter && (
          <div>
            <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Item Category:</label>
            <select
              value={filters.categoryId || 'all'}
              onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
              className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs font-medium text-gray-800"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* From Date */}
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">From Date:</label>
          <input
            type="date"
            value={filters.fromDate || ''}
            onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
            className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs font-mono text-gray-800"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">To Date:</label>
          <input
            type="date"
            value={filters.toDate || ''}
            onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
            className="w-full border border-gray-250 rounded p-1.5 bg-white text-xs font-mono text-gray-800"
          />
        </div>

        {/* Search Input */}
        <div className="sm:col-span-2">
          <label className="block text-gray-400 font-bold text-[8.5px] uppercase mb-0.5">Keyword Search:</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search code, name, ref..."
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="w-full pl-8 border border-gray-250 rounded p-1.5 bg-white text-xs font-medium text-gray-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
