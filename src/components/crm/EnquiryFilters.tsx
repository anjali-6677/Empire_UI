import React from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Client, Employee } from '../../domain/types';

interface EnquiryFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  clientFilter: string;
  onClientFilterChange: (val: string) => void;
  estimatorFilter: string;
  onEstimatorFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  clients: Client[];
  estimators: Employee[];
  onResetFilters: () => void;
}

export const EnquiryFilters: React.FC<EnquiryFiltersProps> = ({
  searchTerm,
  onSearchChange,
  clientFilter,
  onClientFilterChange,
  estimatorFilter,
  onEstimatorFilterChange,
  statusFilter,
  onStatusFilterChange,
  clients,
  estimators,
  onResetFilters,
}) => {
  const isFiltered = searchTerm !== '' || clientFilter !== 'all' || estimatorFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by enquiry number, client name, or project requirement..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition-all"
          />
          {searchTerm && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <Link
          to="/crm/enquiries/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-amber-500/30 whitespace-nowrap"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add New Enquiry</span>
        </Link>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase mr-1">
          <Filter className="h-3.5 w-3.5" /> Filters:
        </div>

        {/* Client Filter */}
        <select
          value={clientFilter}
          onChange={(e) => onClientFilterChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Estimator Filter */}
        <select
          value={estimatorFilter}
          onChange={(e) => onEstimatorFilterChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Estimators</option>
          {estimators.map((est) => (
            <option key={est.id} value={est.id}>
              {est.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="estimating">Estimation In Progress</option>
          <option value="quotation_ready">Quotation Ready</option>
          <option value="sent_to_client">Sent to Client</option>
          <option value="revision_requested">Revision Requested</option>
          <option value="won">Tender Won</option>
          <option value="lost">Lost</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors ml-auto"
          >
            <X className="h-3 w-3" /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
