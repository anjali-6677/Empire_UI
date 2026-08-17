/**
 * Unified Subcontract Work Orders & WIP Register
 * Location: src/pages/procurement/SubcontractWorkOrdersPage.tsx
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { SubcontractWorkOrder, SubcontractorWIP } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { RowActionMenu, RowActionMenuItem } from '../../components/common/RowActionMenu';
import {
  calculateSubcontractorKPIs,
  calculateWIPTotalsForWO,
  getWorkOrderScopeSummary,
  normalizeSubcontractWorkOrder,
} from '../../utils/subcontractorHelpers';
import {
  downloadSubcontractWorkOrderPdf,
  printSubcontractWorkOrderPdf,
} from '../../utils/subcontractWorkOrderPdfGenerator';

import { RecordWIPModal } from '../../components/subcontractor/RecordWIPModal';
import { ReviewPendingWIPModal } from '../../components/subcontractor/ReviewPendingWIPModal';
import { ViewWIPHistoryModal } from '../../components/subcontractor/ViewWIPHistoryModal';
import { WorkOrderDetailsModal } from '../../components/subcontractor/WorkOrderDetailsModal';

import {
  Plus,
  Hammer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  DollarSign,
  Search,
  Filter,
  X,
  HardHat,
  Eye,
  ShieldCheck,
  History,
  Download,
  Printer,
  Ban,
  MoreVertical,
} from 'lucide-react';

export const SubcontractWorkOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    createWIPEntry,
    approveSubcontractorWIP,
    rejectSubcontractorWIP,
    updateSubcontractWorkOrder,
  } = useERPStore();

  const workOrders: SubcontractWorkOrder[] = (state.subcontractWorkOrders || state.workOrders || []) as any[];
  const allWips: SubcontractorWIP[] = (state.subcontractorWIPs || state.wips || []) as any[];
  const projects = state.projects || [];
  const vendors = state.vendors || [];

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  // Dropdown & Modal States
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const triggerRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [selectedWO, setSelectedWO] = useState<SubcontractWorkOrder | null>(null);
  const [activeModal, setActiveModal] = useState<'details' | 'record_wip' | 'review_pending' | 'wip_history' | null>(null);
  const [pendingWipToReview, setPendingWipToReview] = useState<SubcontractorWIP | null>(null);

  // Calculate Real-Data KPIs
  const kpi = calculateSubcontractorKPIs(workOrders, allWips);

  // Apply Filters
  const filteredWorkOrders = workOrders.filter((wo) => {
    if (!wo) return false;
    const norm = normalizeSubcontractWorkOrder(wo);
    const docNum = norm.documentNumber.toLowerCase();
    const subName = norm.subcontractorName.toLowerCase();
    const projName = norm.projectName.toLowerCase();
    const cat = (norm.workCategory || '').toLowerCase();
    const q = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !q ||
      docNum.includes(q) ||
      subName.includes(q) ||
      projName.includes(q) ||
      cat.includes(q);

    const matchesProject = selectedProjectId === 'all' || norm.projectId === selectedProjectId;
    const matchesVendor = selectedVendorId === 'all' || norm.subcontractorId === selectedVendorId;

    const metrics = calculateWIPTotalsForWO(norm, allWips);

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const st = norm.status.toLowerCase();
      if (statusFilter === 'wip_pending') {
        matchesStatus = metrics.hasPendingWIP;
      } else if (statusFilter === 'active') {
        matchesStatus = ['approved', 'issued', 'work_started', 'in_progress', 'partially_completed'].includes(st);
      } else {
        matchesStatus = st === statusFilter.toLowerCase();
      }
    }

    let matchesDate = true;
    if (startDateFilter) {
      matchesDate = matchesDate && norm.startDate >= startDateFilter;
    }
    if (endDateFilter) {
      matchesDate = matchesDate && norm.startDate <= endDateFilter;
    }

    return matchesSearch && matchesProject && matchesVendor && matchesStatus && matchesDate;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProjectId('all');
    setSelectedVendorId('all');
    setStatusFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  // Status Badge Component
  const getStatusBadge = (wo: SubcontractWorkOrder) => {
    const norm = normalizeSubcontractWorkOrder(wo);
    const metrics = calculateWIPTotalsForWO(norm, allWips);
    const st = norm.status.toLowerCase();

    if (st === 'cancelled') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          Cancelled
        </span>
      );
    }

    if (metrics.hasPendingWIP) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>WIP Verification Pending</span>
        </span>
      );
    }

    if (st === 'completed' || metrics.progressPercent >= 100) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    }

    if (st === 'in_progress' || st === 'issued' || st === 'approved' || st === 'work_started') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <Hammer className="w-3 h-3 text-blue-600" />
          <span>In Progress</span>
        </span>
      );
    }

    if (st === 'pending_approval' || st === 'submitted') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          WO Approval Pending
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {st}
      </span>
    );
  };

  return (
    <ListPageLayout>
      {/* Header */}
      <PageHeader
        title="Subcontract Work Orders & WIP Register"
        subtitle="Track subcontractor contracts, site measurements, verification approvals, and execution progress in real-time."
        actions={
          <button
            onClick={() => navigate('/procurement/work-orders/new')}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-950 bg-[#AB9570] hover:bg-[#927D5E] rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Work Order
          </button>
        }
      />

      {/* 6 Real-Data Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
        {/* Card 1: Total WOs */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Work Orders</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-slate-900">{kpi.totalWorkOrders}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across all projects</div>
          </div>
        </div>

        {/* Card 2: Approval Pending */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Approval Pending</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-amber-800">{kpi.approvalPending}</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Awaiting WO sign-off</div>
          </div>
        </div>

        {/* Card 3: Active Work */}
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Active Work</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-blue-800">{kpi.activeWork}</div>
            <div className="text-[11px] text-blue-600 mt-0.5">Under execution on site</div>
          </div>
        </div>

        {/* Card 4: WIP Pending Approval */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-300 bg-amber-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">WIP Verification</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-amber-900">{kpi.wipPendingApproval}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">Claims awaiting review</div>
          </div>
        </div>

        {/* Card 5: Completed */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Completed</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-emerald-800">{kpi.completed}</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">100% verified scopes</div>
          </div>
        </div>

        {/* Card 6: Total WO Value */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total WO Value</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base font-extrabold text-slate-900 font-mono">
              ₹{kpi.totalWOValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cumulative contract sum</div>
          </div>
        </div>
      </div>

      {/* Reference-Style Advanced Filter Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search WO #, Subcontractor, Project or Scope..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Project Filter */}
          <div className="w-44">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Subcontractor Filter */}
          <div className="w-48">
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Subcontractors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name || v.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Work Order Statuses</option>
              <option value="wip_pending">⚠️ WIP Pending Approval</option>
              <option value="active">Active Execution</option>
              <option value="pending_approval">WO Approval Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center space-x-1.5">
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="py-1.5 px-2 text-xs border border-slate-300 rounded-lg"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="py-1.5 px-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || selectedProjectId !== 'all' || selectedVendorId !== 'all' || statusFilter !== 'all' || startDateFilter || endDateFilter) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 10-Column Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">WO / DATE</th>
                <th className="py-3 px-3.5">SUBCONTRACTOR & PROJECT</th>
                <th className="py-3 px-3.5">SCOPE OF WORK</th>
                <th className="py-3 px-3.5">START / TARGET</th>
                <th className="py-3 px-3.5 text-right">WO VALUE</th>
                <th className="py-3 px-3.5 text-right">APPROVED WIP</th>
                <th className="py-3 px-3.5 text-right">REMAINING</th>
                <th className="py-3 px-3.5 text-center">PROGRESS %</th>
                <th className="py-3 px-3.5 text-center">STATUS</th>
                <th className="py-3 px-3.5 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredWorkOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No Subcontract Work Orders Found</p>
                      <p className="text-xs text-slate-500">Try adjusting search query or active filter selections.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWorkOrders.map((wo) => {
                  const norm = normalizeSubcontractWorkOrder(wo);
                  const metrics = calculateWIPTotalsForWO(norm, allWips);
                  const scopeSummary = getWorkOrderScopeSummary(norm);
                  const isMenuOpen = openMenuId === norm.id;
                  const st = norm.status.toLowerCase();
                  const isCancelled = st === 'cancelled';

                  return (
                    <tr key={norm.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Column 1: WO / Date */}
                      <td className="py-3 px-3.5 font-medium">
                        <div className="font-mono font-bold text-slate-900">{norm.documentNumber}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{norm.startDate}</div>
                      </td>

                      {/* Column 2: Subcontractor & Project */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{norm.subcontractorName}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{norm.projectName}</div>
                      </td>

                      {/* Column 3: Scope of Work */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-800">{scopeSummary.title}</div>
                        <div className="text-slate-500 text-[11px]">{scopeSummary.subtitle}</div>
                      </td>

                      {/* Column 4: Start / Target Date */}
                      <td className="py-3 px-3.5">
                        <div className="text-slate-700">{norm.startDate}</div>
                        <div className="text-slate-400 text-[11px]">Target: {norm.completionDate}</div>
                      </td>

                      {/* Column 5: WO Value */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                        ₹{norm.grandTotal.toLocaleString('en-IN')}
                      </td>

                      {/* Column 6: Approved WIP */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700">
                        ₹{metrics.cumulativeApprovedValue.toLocaleString('en-IN')}
                      </td>

                      {/* Column 7: Remaining */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-700">
                        ₹{Math.max(0, norm.grandTotal - metrics.cumulativeApprovedValue).toLocaleString('en-IN')}
                      </td>

                      {/* Column 8: Progress % */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <span className="font-bold text-slate-900 text-xs">{metrics.progressPercent}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${metrics.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Column 9: Status */}
                      <td className="py-3 px-3.5 text-center">{getStatusBadge(wo)}</td>

                      {/* Column 10: Actions (Portal Floating Dropdown) */}
                      <td className="py-3 px-3.5 text-center relative">
                        <button
                          ref={(el) => {
                            triggerRefs.current[norm.id] = el;
                          }}
                          onClick={() => setOpenMenuId(isMenuOpen ? null : norm.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
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
                              setSelectedWO(wo);
                              setActiveModal('details');
                              setOpenMenuId(null);
                            }}
                            icon={<Eye className="w-4 h-4 text-slate-500" />}
                            label="View WO Details"
                          />

                          {!isCancelled && (
                            <RowActionMenuItem
                              onClick={() => {
                                setSelectedWO(wo);
                                setActiveModal('record_wip');
                                setOpenMenuId(null);
                              }}
                              icon={<HardHat className="w-4 h-4 text-amber-600" />}
                              label="Record Site WIP"
                            />
                          )}

                          {metrics.hasPendingWIP && (
                            <RowActionMenuItem
                              onClick={() => {
                                setSelectedWO(wo);
                                const pending = metrics.linkedWips.find((w) => {
                                  const s = (w.status || '').toLowerCase();
                                  return s === 'submitted' || s === 'site_verification' || s === 'pending_approval';
                                });
                                setPendingWipToReview(pending || null);
                                setActiveModal('review_pending');
                                setOpenMenuId(null);
                              }}
                              icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
                              label="Review Pending WIP"
                              variant="warning"
                            />
                          )}

                          <RowActionMenuItem
                            onClick={() => {
                              setSelectedWO(wo);
                              setActiveModal('wip_history');
                              setOpenMenuId(null);
                            }}
                            icon={<History className="w-4 h-4 text-blue-600" />}
                            label={`WIP History (${metrics.linkedWips.length})`}
                          />

                          <RowActionMenuItem
                            onClick={() => {
                              downloadSubcontractWorkOrderPdf(norm, allWips);
                              setOpenMenuId(null);
                            }}
                            icon={<Download className="w-4 h-4 text-slate-600" />}
                            label="Download WO PDF"
                          />

                          <RowActionMenuItem
                            onClick={() => {
                              printSubcontractWorkOrderPdf(norm, allWips);
                              setOpenMenuId(null);
                            }}
                            icon={<Printer className="w-4 h-4 text-slate-600" />}
                            label="Print Work Order"
                          />

                          {!isCancelled && (st === 'draft' || st === 'pending_approval' || st === 'issued') && (
                            <RowActionMenuItem
                              onClick={() => {
                                setOpenMenuId(null);
                                if (window.confirm(`Are you sure you want to cancel Work Order ${norm.documentNumber}?`)) {
                                  updateSubcontractWorkOrder(norm.id, { status: 'cancelled' }, 'Project Director');
                                }
                              }}
                              icon={<Ban className="w-4 h-4 text-red-600" />}
                              label="Cancel Work Order"
                              variant="danger"
                            />
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

      {/* Render Active Modals */}
      {selectedWO && activeModal === 'details' && (
        <WorkOrderDetailsModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          workOrder={selectedWO}
          allWips={allWips}
          onRecordWIP={() => setActiveModal('record_wip')}
          onViewWIPHistory={() => setActiveModal('wip_history')}
          onDownloadPDF={() => downloadSubcontractWorkOrderPdf(selectedWO, allWips)}
          onPrint={() => printSubcontractWorkOrderPdf(selectedWO, allWips)}
        />
      )}

      {selectedWO && activeModal === 'record_wip' && (
        <RecordWIPModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          workOrder={selectedWO}
          allWips={allWips}
          onSubmitWIP={(wip) => createWIPEntry(wip, 'QS Engineer')}
        />
      )}

      {selectedWO && activeModal === 'review_pending' && pendingWipToReview && (
        <ReviewPendingWIPModal
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setPendingWipToReview(null);
          }}
          workOrder={selectedWO}
          pendingWip={pendingWipToReview}
          allWips={allWips}
          onApproveWIP={(wipId, lines, performedBy) => approveSubcontractorWIP(wipId, lines, performedBy)}
          onRejectWIP={(wipId, reason, performedBy) => rejectSubcontractorWIP(wipId, reason, performedBy)}
        />
      )}

      {selectedWO && activeModal === 'wip_history' && (
        <ViewWIPHistoryModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          workOrder={selectedWO}
          allWips={allWips}
          onReviewPendingWip={(wip) => {
            setPendingWipToReview(wip);
            setActiveModal('review_pending');
          }}
        />
      )}
    </ListPageLayout>
  );
};

export default SubcontractWorkOrdersPage;
