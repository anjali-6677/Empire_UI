/**
 * Goods Received Notes (GRN) List Page
 * Location: src/pages/inventory/GRNListPage.tsx
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import { getGRNStatusBadge, getQualityInspectionStatusBadge } from '../../utils/statusStyles';
import { GRNRowActionsMenu } from '../../components/inventory/GRNRowActionsMenu';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  PackageCheck,
  Building2,
  ArrowRight,
} from 'lucide-react';

export const GRNListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, approveGRN, postGRNToStock } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const grns = state.grns || [];
  const projects = state.projects || [];

  const filteredGRNs = grns.filter((grn) => {
    const matchesProject = selectedProjectId === 'all' || grn.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || (grn.status as string) === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      (grn.documentNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grn.poNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grn.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grn.projectName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  const activeScopeGRNs = selectedProjectId === 'all'
    ? grns
    : grns.filter((g) => g.projectId === selectedProjectId);

  const totalGRNs = activeScopeGRNs.length;
  const pendingInspection = activeScopeGRNs.filter((g) => (g.status as string) === 'draft' || (g.status as string) === 'pending_inspection').length;
  const approvedGRNs = activeScopeGRNs.filter((g) => (g.status as string) === 'approved' || (g.status as string) === 'inspected').length;
  const postedGRNs = activeScopeGRNs.filter((g) => g.isPostedToStock || (g.status as string) === 'posted').length;

  const handleApproveGRN = (grn: any) => {
    const res = approveGRN(grn.id, 'Vikram Singh (Quality Manager)', 'Verified & Approved for Stock Entry');
    if (res.success) {
      setActionNotice(`GRN ${grn.documentNumber} approved successfully.`);
    } else {
      setActionNotice(`Error: ${res.error}`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handlePostToStock = (grn: any) => {
    const res = postGRNToStock(grn.id, 'Ramesh Kumar (Storekeeper)');
    if (res.success) {
      setActionNotice(`GRN ${grn.documentNumber} posted to stock ledger idempotently.`);
    } else {
      setActionNotice(`Posting notice: ${res.error}`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-xs text-emerald-700 underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 p-5 rounded-xl border border-stone-700 text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-stone-700/60 rounded-lg border border-stone-600/50">
            <Boxes className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-100 flex items-center gap-2">
              Goods Received Notes (GRN)
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                Stage 4 Inventory
              </span>
            </h1>
            <p className="text-stone-400 text-xs mt-0.5">
              Physical material receipts, quality inspection verification, and idempotent stock ledger posting.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/inventory/grns/new')}
            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 text-xs flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Receive Delivery (Create GRN)
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-stone-500 text-[11px] font-medium">Total GRNs Raised</p>
            <p className="text-xl font-extrabold text-stone-900 mt-1">{totalGRNs}</p>
          </div>
          <div className="p-2.5 bg-stone-100 rounded-lg text-stone-600">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-stone-500 text-[11px] font-medium">Pending Quality Inspection</p>
            <p className="text-xl font-extrabold text-amber-600 mt-1">{pendingInspection}</p>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-stone-500 text-[11px] font-medium">Approved GRNs</p>
            <p className="text-xl font-extrabold text-blue-600 mt-1">{approvedGRNs}</p>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-stone-500 text-[11px] font-medium">Posted to Stock Ledger</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">{postedGRNs}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search GRN #, PO #, Vendor, or Project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 border border-stone-300 rounded-lg">
              <Building2 className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-stone-800 font-medium text-xs border-none outline-none"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName || p.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 border border-stone-300 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-stone-800 font-medium text-xs border-none outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending_inspection">Pending Inspection</option>
                <option value="inspected">Inspected</option>
                <option value="approved">Approved</option>
                <option value="posted">Posted to Stock</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* GRN Data Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">GRN #</th>
                <th className="py-3 px-4">PO Ref</th>
                <th className="py-3 px-4">Vendor & Project</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4 text-center">Quality Inspection</th>
                <th className="py-3 px-4 text-center">Stock Ledger</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-stone-400">
                    <Boxes className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                    <p className="font-semibold text-stone-600">No Goods Received Notes found</p>
                    <p className="text-[11px] mt-1">Receive deliveries against issued POs to generate GRNs.</p>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/inventory/grns/new')}
                      className="mt-3 text-xs"
                    >
                      Receive Delivery Now
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredGRNs.map((grn) => {
                  const qcStatus = grn.qualityInspection?.qcStatus || grn.qualityCheck?.qcStatus || 'pending';
                  return (
                    <tr
                      key={grn.id}
                      className="hover:bg-stone-50/80 transition-colors group text-xs text-stone-800"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">
                        <Link to={`/inventory/grns/${grn.id}`} className="hover:underline flex items-center gap-1">
                          {grn.documentNumber}
                          <ArrowRight className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      <td className="py-3 px-4 font-mono text-stone-600">
                        <Link to={`/procurement/purchase-orders/${grn.purchaseOrderId}`} className="hover:underline text-stone-700">
                          {grn.poNumber}
                        </Link>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{grn.vendorName}</div>
                        <div className="text-[11px] text-stone-500">{grn.projectName}</div>
                      </td>

                      <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                        {grn.receivedDate}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getQualityInspectionStatusBadge(qcStatus)}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {grn.isPostedToStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Posted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            Unposted
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getGRNStatusBadge(grn.status)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <GRNRowActionsMenu
                          grn={grn}
                          onApprove={() => handleApproveGRN(grn)}
                          onPostToStock={() => handlePostToStock(grn)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
