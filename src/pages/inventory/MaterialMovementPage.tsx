/**
 * Material Movement & Site Consumption Register Page
 * Location: src/pages/inventory/MaterialMovementPage.tsx
 */

import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { getMaterialIssueStatusBadge } from '../../utils/statusStyles';
import {
  normalizeMaterialIssue,
  calculateIssueItemTotals,
  getMaterialSummaryText,
  calculateMaterialMovementKPIs,
} from '../../utils/materialIssueHelpers';
import { downloadMaterialIssuePdf, printMaterialIssuePdf } from '../../utils/materialIssuePdfGenerator';
import { RecordSiteReceiptModal } from '../../components/inventory/RecordSiteReceiptModal';
import { RecordSiteConsumptionModal } from '../../components/inventory/RecordSiteConsumptionModal';
import { RecordMaterialReturnModal } from '../../components/inventory/RecordMaterialReturnModal';
import { MaterialIssueDetailsModal } from '../../components/inventory/MaterialIssueDetailsModal';
import { ViewIssueReturnsModal } from '../../components/inventory/ViewIssueReturnsModal';
import { ViewIssueConsumptionsModal } from '../../components/inventory/ViewIssueConsumptionsModal';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import { MaterialIssue } from '../../domain/types';
import {
  Search,
  Truck,
  RotateCcw,
  Flame,
  MoreVertical,
  Eye,
  PackageCheck,
  Printer,
  Download,
  Filter,
  XCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { SummaryKpiCard } from '../../components/common/SummaryKpiCard';

export const MaterialMovementPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, cancelMaterialIssue } = useERPStore();

  const rawIssues = state.materialIssues || [];
  const returns = state.materialReturns || [];
  const consumptions = state.materialConsumptions || [];
  const projects = state.projects || [];

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sourceStoreFilter, setSourceStoreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Active Action Modals
  const [selectedIssueForDetails, setSelectedIssueForDetails] = useState<MaterialIssue | null>(null);
  const [selectedIssueForReceipt, setSelectedIssueForReceipt] = useState<MaterialIssue | null>(null);
  const [selectedIssueForConsumption, setSelectedIssueForConsumption] = useState<MaterialIssue | null>(null);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState<MaterialIssue | null>(null);
  const [selectedIssueForViewReturns, setSelectedIssueForViewReturns] = useState<MaterialIssue | null>(null);
  const [selectedIssueForViewConsumptions, setSelectedIssueForViewConsumptions] = useState<MaterialIssue | null>(null);

  // Active 3-Dot Action Menu Open Row State & Trigger Refs Map
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Unique Source Stores list
  const sourceStores = useMemo(() => {
    const storesSet = new Map<string, string>();
    rawIssues.forEach((issue) => {
      const norm = normalizeMaterialIssue(issue);
      const sId = norm.sourceLocationId || norm.sourceWarehouseId || 'loc-001';
      const sName = norm.sourceLocationName || norm.sourceWarehouseName || 'Central Store';
      storesSet.set(sId, sName);
    });
    return Array.from(storesSet.entries()).map(([id, name]) => ({ id, name }));
  }, [rawIssues]);

  // Filtered Issues list
  const filteredIssues = useMemo(() => {
    return rawIssues.filter((issue) => {
      if (!issue || typeof issue !== 'object') return false;
      const norm = normalizeMaterialIssue(issue);

      // Project filter
      if (projectFilter !== 'all' && norm.projectId !== projectFilter) return false;

      // Source store filter
      if (
        sourceStoreFilter !== 'all' &&
        norm.sourceLocationId !== sourceStoreFilter &&
        norm.sourceWarehouseId !== sourceStoreFilter
      ) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const sLower = (norm.status || '').toString().toLowerCase();
        if (statusFilter === 'dispatched' && sLower !== 'dispatched' && sLower !== 'in_transit') return false;
        if (statusFilter === 'received_at_site' && sLower !== 'received_at_site' && sLower !== 'completed') return false;
        if (statusFilter === 'draft' && sLower !== 'draft' && sLower !== 'ready to issue') return false;
        if (statusFilter === 'cancelled' && sLower !== 'cancelled') return false;
      }

      // Date range filter
      if (dateFrom && (norm.issueDate || '') < dateFrom) return false;
      if (dateTo && (norm.issueDate || '') > dateTo) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const docNum = (norm.documentNumber || norm.issueNumber || '').toLowerCase();
        const projName = (norm.projectName || '').toLowerCase();
        const sourceStore = (norm.sourceLocationName || norm.sourceWarehouseName || '').toLowerCase();
        const destArea = (norm.destinationAreaName || norm.destinationStoreName || '').toLowerCase();
        const items = norm.items || norm.lines || [];
        const itemMatch = items.some((it: any) =>
          (it.productDescription || it.productName || '').toLowerCase().includes(q)
        );

        return (
          docNum.includes(q) ||
          projName.includes(q) ||
          sourceStore.includes(q) ||
          destArea.includes(q) ||
          itemMatch
        );
      }

      return true;
    });
  }, [rawIssues, projectFilter, sourceStoreFilter, statusFilter, dateFrom, dateTo, searchQuery]);

  // Dynamic KPI Aggregation
  const kpiStats = useMemo(() => {
    return calculateMaterialMovementKPIs(filteredIssues, returns, consumptions);
  }, [filteredIssues, returns, consumptions]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setProjectFilter('all');
    setSourceStoreFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const handleCancelIssue = (issue: MaterialIssue) => {
    const docNum = issue.documentNumber || issue.issueNumber || issue.id;
    if (window.confirm(`Are you sure you want to cancel Material Issue Note #${docNum}? This will reverse store entries if dispatched.`)) {
      const res = cancelMaterialIssue(issue.id, 'Stores Officer', 'Cancelled via Register Menu');
      if (!res.success) {
        alert(res.error || 'Failed to cancel Material Issue');
      }
    }
  };

  return (
    <ListPageLayout>
      {/* Header Banner */}
      <PageHeader
        title="Material Movement & Site Consumption"
        subtitle="Track material issued from stores to project sites, site receipt, consumption, returns and closing balance."
        breadcrumbs={[
          { label: 'Inventory & Execution' },
          { label: 'Material Movement' }
        ]}
        actions={
          <PrimaryActionButton
            label="Issue Material"
            onClick={() => navigate('/inventory/material-issues/new')}
          />
        }
      />

      {/* Real-Data KPI Summary Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">
        <SummaryKpiCard
          title="Total Issues"
          value={kpiStats.totalIssues}
          subtitle="Valid Issue Notes"
          icon={Truck}
          variant="gold"
        />
        <SummaryKpiCard
          title="In Transit"
          value={kpiStats.inTransit}
          subtitle="Dispatched to site"
          icon={Clock}
          variant="pending"
        />
        <SummaryKpiCard
          title="Received Site"
          value={kpiStats.receivedAtSite}
          subtitle="Delivered & verified"
          icon={CheckCircle2}
          variant="active"
        />
        <SummaryKpiCard
          title="Issued Value"
          value={`₹${kpiStats.totalIssuedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle="Total material issued"
          icon={TrendingUp}
          variant="gold"
        />
        <SummaryKpiCard
          title="Returned Value"
          value={`₹${kpiStats.totalReturnedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle="Returned to stores"
          icon={RotateCcw}
          variant="blue"
        />
        <SummaryKpiCard
          title="Consumed Value"
          value={`₹${kpiStats.totalConsumedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle="Consumed on work"
          icon={Flame}
          variant="purple"
        />
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
          <div className="flex items-center space-x-2 text-stone-700 font-bold text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Filter Movement Register</span>
          </div>
          {(searchQuery || projectFilter !== 'all' || sourceStoreFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={handleClearFilters}
              className="text-amber-700 hover:text-amber-800 font-semibold text-xs flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Search Reference</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Issue #, Store, Material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 text-xs outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Project Site</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-stone-800 text-xs outline-none focus:border-amber-500"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName || p.id}
                </option>
              ))}
            </select>
          </div>

          {/* Source Store Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Source Store</label>
            <select
              value={sourceStoreFilter}
              onChange={(e) => setSourceStoreFilter(e.target.value)}
              className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-stone-800 text-xs outline-none focus:border-amber-500"
            >
              <option value="all">All Stores</option>
              {sourceStores.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Issue Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-stone-800 text-xs outline-none focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="dispatched">In Transit / Dispatched</option>
              <option value="received_at_site">Received at Site</option>
              <option value="draft">Draft / Preparing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-stone-800 text-xs outline-none focus:border-amber-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-stone-800 text-xs outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Unified 13-Column Register Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-3">Issue / Ref</th>
                <th className="py-3 px-3">Project & Destination</th>
                <th className="py-3 px-3">Material Summary</th>
                <th className="py-3 px-3">Source Store</th>
                <th className="py-3 px-3 text-right">Issued</th>
                <th className="py-3 px-3 text-right">Received</th>
                <th className="py-3 px-3 text-right">Consumed</th>
                <th className="py-3 px-3 text-right">Returned</th>
                <th className="py-3 px-3 text-right">Site Balance</th>
                <th className="py-3 px-3 text-center">Issue Date</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-left">Issued By</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-stone-400">
                    <Truck className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                    <p className="font-semibold text-stone-600">No Material Issue records found</p>
                    <p className="text-stone-400 text-[11px] mt-1">Try adjusting search filters or issue a new material note.</p>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const norm = normalizeMaterialIssue(issue);
                  const docNum = norm.documentNumber || norm.issueNumber || norm.id;
                  const calcs = calculateIssueItemTotals(norm, returns, consumptions);
                  const matSummary = getMaterialSummaryText(norm);
                  const isMenuOpen = openMenuId === norm.id;

                  const sLower = (norm.status || '').toString().toLowerCase();
                  const canReceive = sLower === 'dispatched' || sLower === 'partially_received' || sLower === 'in_transit';
                  const canConsume = calcs.totalSiteBalanceQty > 0;
                  const canReturn = calcs.totalSiteBalanceQty > 0;
                  const canCancel = sLower === 'draft' || (sLower === 'dispatched' && calcs.totalConsumedQty === 0 && calcs.totalReturnedQty === 0);

                  return (
                    <tr key={norm.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* 1. Issue Doc # */}
                      <td className="py-3 px-3 font-mono font-bold text-amber-700 whitespace-nowrap">{docNum}</td>

                      {/* 2. Project & Destination */}
                      <td className="py-3 px-3 max-w-[180px]">
                        <div className="font-semibold text-stone-900 truncate">{norm.projectName}</div>
                        <div className="text-[10px] text-stone-500 font-medium truncate">{norm.destinationAreaName || norm.destinationStoreName}</div>
                      </td>

                      {/* 3. Material Summary */}
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="font-medium text-stone-900 truncate">{matSummary.title}</div>
                        <div className="text-[10px] text-amber-800 font-semibold">{matSummary.subtitle}</div>
                      </td>

                      {/* 4. Source Store */}
                      <td className="py-3 px-3 text-stone-700 max-w-[140px] truncate">
                        {norm.sourceLocationName || norm.sourceWarehouseName}
                      </td>

                      {/* 5. Issued Qty */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 whitespace-nowrap">
                        {calcs.isMultiUOM ? `${calcs.items.length} Items` : `${calcs.totalIssuedQty} ${calcs.primaryUnit}`}
                      </td>

                      {/* 6. Received Qty */}
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 font-semibold whitespace-nowrap">
                        {calcs.isMultiUOM ? '-' : `${calcs.totalReceivedQty} ${calcs.primaryUnit}`}
                      </td>

                      {/* 7. Consumed Qty */}
                      <td className="py-3 px-3 text-right font-mono text-orange-700 font-semibold whitespace-nowrap">
                        {calcs.isMultiUOM ? '-' : `${calcs.totalConsumedQty} ${calcs.primaryUnit}`}
                      </td>

                      {/* 8. Returned Qty */}
                      <td className="py-3 px-3 text-right font-mono text-cyan-700 font-semibold whitespace-nowrap">
                        {calcs.isMultiUOM ? '-' : `${calcs.totalReturnedQty} ${calcs.primaryUnit}`}
                      </td>

                      {/* 9. Site Balance Qty */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 whitespace-nowrap">
                        {calcs.isMultiUOM ? '-' : `${calcs.totalSiteBalanceQty} ${calcs.primaryUnit}`}
                      </td>

                      {/* 10. Issue Date */}
                      <td className="py-3 px-3 text-center text-stone-700 font-medium whitespace-nowrap">
                        {norm.issueDate || 'N/A'}
                      </td>

                      {/* 11. Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getMaterialIssueStatusBadge(norm.status)}
                      </td>

                      {/* 12. Issued By */}
                      <td className="py-3 px-3 text-stone-600 text-[11px] whitespace-nowrap truncate max-w-[110px]">
                        {norm.issuedBy || norm.createdBy || 'Stores Officer'}
                      </td>

                      {/* 13. Actions 3-Dot Dropdown with Portal Rendering */}
                      <td className="py-3 px-3 text-center relative whitespace-nowrap">
                        <button
                          ref={(el) => {
                            triggerRefs.current[norm.id] = el;
                          }}
                          onClick={() => setOpenMenuId(isMenuOpen ? null : norm.id)}
                          className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors"
                          title="Actions"
                          type="button"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        <RowActionMenu
                          isOpen={isMenuOpen}
                          onClose={() => setOpenMenuId(null)}
                          triggerRef={{ current: triggerRefs.current[norm.id] }}
                          minWidth={220}
                        >
                          <RowActionMenuItem
                            onClick={() => {
                              setSelectedIssueForDetails(norm);
                              setOpenMenuId(null);
                            }}
                            icon={<Eye className="w-3.5 h-3.5 text-stone-500" />}
                            label="View Issue Details"
                          />

                          {canReceive && (
                            <RowActionMenuItem
                              onClick={() => {
                                setSelectedIssueForReceipt(norm);
                                setOpenMenuId(null);
                              }}
                              variant="warning"
                              icon={<PackageCheck className="w-3.5 h-3.5 text-amber-700" />}
                              label="Record Site Receipt"
                            />
                          )}

                          {canConsume && (
                            <RowActionMenuItem
                              onClick={() => {
                                setSelectedIssueForConsumption(norm);
                                setOpenMenuId(null);
                              }}
                              variant="warning"
                              icon={<Flame className="w-3.5 h-3.5 text-orange-600" />}
                              label="Record Site Consumption"
                            />
                          )}

                          {canReturn && (
                            <RowActionMenuItem
                              onClick={() => {
                                setSelectedIssueForReturn(norm);
                                setOpenMenuId(null);
                              }}
                              variant="warning"
                              icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-600" />}
                              label="Return Material to Store"
                            />
                          )}

                          <RowActionMenuDivider />

                          <RowActionMenuItem
                            onClick={() => {
                              setSelectedIssueForViewReturns(norm);
                              setOpenMenuId(null);
                            }}
                            icon={<RotateCcw className="w-3.5 h-3.5 text-stone-400" />}
                            label="View Returns History"
                          />

                          <RowActionMenuItem
                            onClick={() => {
                              setSelectedIssueForViewConsumptions(norm);
                              setOpenMenuId(null);
                            }}
                            icon={<Flame className="w-3.5 h-3.5 text-stone-400" />}
                            label="View Consumption History"
                          />

                          <RowActionMenuDivider />

                          <RowActionMenuItem
                            onClick={() => {
                              downloadMaterialIssuePdf(norm, returns, consumptions);
                              setOpenMenuId(null);
                            }}
                            icon={<Download className="w-3.5 h-3.5 text-stone-400" />}
                            label="Download Issue Note (PDF)"
                          />

                          <RowActionMenuItem
                            onClick={() => {
                              printMaterialIssuePdf(norm, returns, consumptions);
                              setOpenMenuId(null);
                            }}
                            icon={<Printer className="w-3.5 h-3.5 text-stone-400" />}
                            label="Print Issue Note"
                          />

                          {canCancel && (
                            <>
                              <RowActionMenuDivider />
                              <RowActionMenuItem
                                onClick={() => {
                                  handleCancelIssue(norm);
                                  setOpenMenuId(null);
                                }}
                                variant="danger"
                                icon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                                label="Cancel Issue Note"
                              />
                            </>
                          )}
                        </RowActionMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Action Modals */}
      {selectedIssueForDetails && (
        <MaterialIssueDetailsModal
          issue={selectedIssueForDetails}
          onClose={() => setSelectedIssueForDetails(null)}
        />
      )}

      {selectedIssueForReceipt && (
        <RecordSiteReceiptModal
          issue={selectedIssueForReceipt}
          onClose={() => setSelectedIssueForReceipt(null)}
          onSuccess={() => setSelectedIssueForReceipt(null)}
        />
      )}

      {selectedIssueForConsumption && (
        <RecordSiteConsumptionModal
          issue={selectedIssueForConsumption}
          onClose={() => setSelectedIssueForConsumption(null)}
          onSuccess={() => setSelectedIssueForConsumption(null)}
        />
      )}

      {selectedIssueForReturn && (
        <RecordMaterialReturnModal
          issue={selectedIssueForReturn}
          onClose={() => setSelectedIssueForReturn(null)}
          onSuccess={() => setSelectedIssueForReturn(null)}
        />
      )}

      {selectedIssueForViewReturns && (
        <ViewIssueReturnsModal
          issue={selectedIssueForViewReturns}
          onClose={() => setSelectedIssueForViewReturns(null)}
        />
      )}

      {selectedIssueForViewConsumptions && (
        <ViewIssueConsumptionsModal
          issue={selectedIssueForViewConsumptions}
          onClose={() => setSelectedIssueForViewConsumptions(null)}
        />
      )}
    </ListPageLayout>
  );
};
