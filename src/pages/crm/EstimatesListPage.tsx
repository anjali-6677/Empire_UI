import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Calculator, Search, Filter, Lock } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { EstimateStatusBadge } from '../../components/crm/EstimateStatusBadge';
import { formatIndianCurrency } from '../../utils/format';
import { normalizeEstimate } from '../../utils/normalizeEstimate';

export const EstimatesListPage: React.FC = () => {
  const { state } = useERPStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const rawEstimates = state.estimates || [];
  const enquiries = state.enquiries || [];

  const estimates = useMemo(() => {
    return rawEstimates.map(normalizeEstimate);
  }, [rawEstimates]);

  const filteredEstimates = useMemo(() => {
    return estimates.filter((est) => {
      const enquiry = enquiries.find((e) => e.id === est.enquiryId);
      const clientName = enquiry?.clientName || est.clientName || '';
      const matchesSearch =
        searchTerm === '' ||
        est.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || est.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [estimates, enquiries, searchTerm, statusFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Estimates & Quotations Master Register</h1>
          <p className="text-xs text-slate-500">Commercial proposals, BOQ cost breakdowns and revision status tracking.</p>
        </div>

        <Link
          to="/crm/enquiries"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" /> Prepare New Estimate
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quotation number or client name..."
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
          >
            <option value="all">All Quotation Statuses</option>
            <option value="draft">Draft / Preparing</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="sent_to_client">Sent to Client</option>
            <option value="accepted">Accepted (Tender Won)</option>
            <option value="revision_requested">Revision Requested</option>
            <option value="superseded">Superseded (Read Only)</option>
            <option value="rejected">Rejected / Lost</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Quotation No</th>
              <th className="py-3 px-4">Rev</th>
              <th className="py-3 px-4">Client Name</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Internal Cost</th>
              <th className="py-3 px-4 text-right">Final Billed Value</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {filteredEstimates.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No estimates match the selected filters.
                </td>
              </tr>
            ) : (
              filteredEstimates.map((est) => {
                const enquiry = enquiries.find((e) => e.id === est.enquiryId);
                const clientName = enquiry?.clientName || est.clientName || 'N/A';
                const isAccepted = est.status === 'accepted';
                const internalCost = est.costSummary?.internalTotalCost ?? 0;
                const finalBilledVal = est.finalQuotationValue ?? est.costSummary?.finalQuotationValue ?? 0;

                return (
                  <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <Link to={`/crm/estimates/${est.id}`} className="hover:text-amber-600">
                        {est.quotationNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 font-semibold">{est.revisionLabel}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{clientName}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {new Date(est.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <EstimateStatusBadge status={est.status} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {internalCost > 0 ? formatIndianCurrency(internalCost) : <span className="text-slate-400 italic">Not Calculated</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                      {finalBilledVal > 0 ? formatIndianCurrency(finalBilledVal) : <span className="text-slate-400 italic">Not Calculated</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/crm/estimates/${est.id}`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {!isAccepted && (
                          <button
                            onClick={() => navigate(`/crm/estimates/builder/${est.enquiryId || est.id}`)}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded flex items-center gap-1"
                            title={finalBilledVal > 0 ? "Edit Estimate" : "Continue Estimate"}
                          >
                            <Calculator className="h-3.5 w-3.5" />
                            {finalBilledVal === 0 && <span className="text-[10px]">Continue</span>}
                          </button>
                        )}
                        {isAccepted && (
                          <span title="Accepted quotation is immutable">
                            <Lock className="h-4 w-4 text-emerald-600" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
