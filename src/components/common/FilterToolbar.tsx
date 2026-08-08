import React from 'react';
import { Search, Columns, RefreshCw, X } from 'lucide-react';

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectConfig {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  className?: string;
}

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  selectFilters?: FilterSelectConfig[];
  dateFilter?: {
    value: string;
    onChange: (date: string) => void;
  };
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  onToggleColumns?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Filter listed table rows by keyword or reference...',
  selectFilters = [],
  dateFilter,
  onApplyFilters,
  onResetFilters,
  hasActiveFilters = false,
  onToggleColumns,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`w-full bg-white border border-[#E2E6EC] rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-xs font-sans text-xs print:hidden ${className}`}
    >
      {/* Search Input (Grows to fill remaining width) */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#AB9570]/30 focus:border-[#AB9570] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Select Dropdown Filters */}
      {selectFilters.map((filter) => (
        <div key={filter.id} className="shrink-0 min-w-[130px]">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className={`w-full h-9 px-2.5 py-1.5 bg-slate-50 border rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#AB9570]/30 focus:border-[#AB9570] cursor-pointer transition-all ${
              filter.value ? 'border-[#AB9570] text-[#AB9570] bg-[#AB9570]/5' : 'border-slate-200'
            } ${filter.className || ''}`}
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Date Filter Input */}
      {dateFilter && (
        <div className="shrink-0">
          <input
            type="date"
            value={dateFilter.value}
            onChange={(e) => dateFilter.onChange(e.target.value)}
            className="h-9 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#AB9570]/30 focus:border-[#AB9570] cursor-pointer"
          />
        </div>
      )}

      {/* Action Buttons: Reset, Apply, Column Selector, Custom Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {onResetFilters && (hasActiveFilters || searchQuery) && (
          <button
            type="button"
            onClick={onResetFilters}
            className="h-9 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="h-3 w-3" /> Reset
          </button>
        )}

        {onApplyFilters && (
          <button
            type="button"
            onClick={onApplyFilters}
            className="h-9 px-4 py-1.5 text-xs font-bold text-slate-950 bg-[#AB9570] hover:bg-[#927D5E] rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
        )}

        {onToggleColumns && (
          <button
            type="button"
            onClick={onToggleColumns}
            className="h-9 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Columns className="h-3.5 w-3.5 text-slate-500" /> Columns
          </button>
        )}

        {actions}
      </div>
    </div>
  );
};
