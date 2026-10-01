import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { PurchaseOrder } from '../../domain/types';
import { getPOStatusBadge } from '../../utils/statusStyles';
import { calculatePurchaseOrderTotals } from '../../domain/selectors';
import { PORowActionsMenu } from '../../components/procurement/PORowActionsMenu';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { formatIndianCurrency } from '../../utils/format';
import { PODetailsModal } from '../../components/procurement/po/PODetailsModal';
import { POApprovalModal } from '../../components/procurement/po/POApprovalModal';
import { downloadPurchaseOrderPDF } from '../../utils/poPdfGenerator';
import { getCanonicalPODeliverySummary } from '../../utils/poDelivery';
import {
  CheckCircle2,
  Clock,
  FileText,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, approvePurchaseOrder, rejectPurchaseOrder, cancelPurchaseOrder } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState<boolean>(false);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject'>('approve');

  const purchaseOrders = state.purchaseOrders || [];
  const goodsReceipts = state.goodsReceipts || [];

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesProject = selectedProjectId === 'all' || po.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || (po.status as string) === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      (po.documentNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.projectName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  const activeScopePOs = selectedProjectId === 'all'
    ? purchaseOrders
    : purchaseOrders.filter((p) => p.projectId === selectedProjectId);

  const draftPOs = activeScopePOs.filter((p) => (p.status as string) === 'draft').length;
  const pendingApprovalPOs = activeScopePOs.filter(
    (p) => (p.status as string) === 'pending_approval' || (p.status as string) === 'pendingapproval'
  );
  const approvedPOs = activeScopePOs.filter(
    (p) => (p.status as string) === 'approved' || (p.status as string) === 'issued'
  ).length;
  const pendingDelivery = activeScopePOs.filter((p) => {
    const delSummary = getCanonicalPODeliverySummary(p, goodsReceipts);
    return delSummary.deliveryStatus !== 'received' && (p.status === 'approved' || p.status === 'issued');
  }).length;

  const handleOpenDetails = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setDetailsModalOpen(true);
  };

  const handleOpenApproval = (po: PurchaseOrder, mode: 'approve' | 'reject') => {
    setSelectedPO(po);
    setApprovalMode(mode);
    setApprovalModalOpen(true);
  };

  const handleNavigateToGRNs = (po: PurchaseOrder) => {
    const docNo = po.documentNumber || po.poNumber || po.id;
    navigate(`/inventory/grn?search=${encodeURIComponent(docNo)}`);
  };

  const activePO = selectedPO
    ? state.purchaseOrders.find((p) => p.id === selectedPO.id) || selectedPO
    : null;

  const handleConfirmApproval = (reason?: string) => {
    if (!selectedPO) return;
    if (approvalMode === 'approve') {
      approvePurchaseOrder(selectedPO.id, 'user-director', 'Sunil Mehta (Director)');
    } else {
      rejectPurchaseOrder(selectedPO.id, 'user-director', reason || 'Rejected by Director');
    }
    setApprovalModalOpen(false);
    setSelectedPO(null);
  };

  const handleCancelPO = (po: PurchaseOrder) => {
    if (window.confirm(`Are you sure you want to cancel Purchase Order ${po.documentNumber}?`)) {
      cancelPurchaseOrder(po.id, 'Sunil Mehta (Procurement Lead)', 'Cancelled by user from PO list menu');
    }
  };

  return (
    <ListPageLayout>
      {/* Header Banner */}
      <PageHeader
        title="Purchase Orders"
        subtitle="Create, approve, issue, and track vendor purchase orders across projects."
        breadcrumbs={[
          { label: 'Procurement' },
          { label: 'Purchase Orders' }
        ]}
        actions={
          <PrimaryActionButton
            label="Create Purchase Order"
            onClick={() => navigate('/procurement/purchase-orders/new')}
          />
        }
      />

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('draft')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'draft'
              ? 'bg-[#AB9570]/10 border-[#AB9570] shadow-2xs'
              : 'bg-white border-[#E2E6EC] hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Draft POs</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{draftPOs}</div>
          </div>
          <FileText className={`h-5 w-5 ${statusFilter === 'draft' ? 'text-[#AB9570]' : 'text-slate-400'}`} />
        </div>

        <div
          onClick={() => setStatusFilter('pending_approval')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'pending_approval'
              ? 'bg-[#AB9570]/10 border-[#AB9570] shadow-2xs'
              : 'bg-white border-[#E2E6EC] hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Pending Approval</div>
            <div className="text-xl font-black text-amber-800 mt-0.5">{pendingApprovalPOs.length}</div>
          </div>
          <Clock className={`h-5 w-5 ${statusFilter === 'pending_approval' ? 'text-[#AB9570]' : 'text-slate-400'}`} />
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'approved'
              ? 'bg-[#AB9570]/10 border-[#AB9570] shadow-2xs'
              : 'bg-white border-[#E2E6EC] hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Approved POs</div>
            <div className="text-xl font-black text-emerald-800 mt-0.5">{approvedPOs}</div>
          </div>
          <CheckCircle2 className={`h-5 w-5 ${statusFilter === 'approved' ? 'text-[#AB9570]' : 'text-slate-400'}`} />
        </div>

        <div
          onClick={() => setStatusFilter('issued')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'issued'
              ? 'bg-[#AB9570]/10 border-[#AB9570] shadow-2xs'
              : 'bg-white border-[#E2E6EC] hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Active Deliveries</div>
            <div className="text-xl font-black text-cyan-800 mt-0.5">{pendingDelivery}</div>
          </div>
          <Truck className={`h-5 w-5 ${statusFilter === 'issued' ? 'text-[#AB9570]' : 'text-slate-400'}`} />
        </div>
      </div>

      {/* Pending Approvals Executive Table Section */}
      {pendingApprovalPOs.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Pending Approvals ({pendingApprovalPOs.length})
                </h3>
              </div>
              <p className="text-[11px] text-amber-800/80 font-medium mt-0.5">
                POs waiting for your review and approval.
              </p>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
              Director Review Needed
            </span>
          </div>

          <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-100/50 border-b border-amber-200 text-amber-900 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Project</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Created By</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Valid Until</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 font-medium text-slate-800">
                {pendingApprovalPOs.map((po) => {
                  const totals = calculatePurchaseOrderTotals(po);
                  const validUntil = po.validUntil || po.rateValidityDate || '2026-08-31';
                  const createdDate = po.orderDate || (po.createdAt ? po.createdAt.split('T')[0] : '2026-08-10');

                  return (
                    <tr key={po.id} className="hover:bg-amber-50/40 transition-colors h-12">
                      <td className="p-3 align-middle font-mono font-bold text-slate-900">
                        <button
                          onClick={() => handleOpenDetails(po)}
                          className="hover:text-[#AB9570] underline text-left cursor-pointer"
                        >
                          {po.documentNumber || po.poNumber}
                        </button>
                      </td>
                      <td className="p-3 align-middle font-bold text-slate-900">{po.vendorName}</td>
                      <td className="p-3 align-middle text-slate-700 font-medium">{po.projectName}</td>
                      <td className="p-3 align-middle text-right font-mono font-bold text-amber-900">
                        {formatIndianCurrency(totals.grandTotal)}
                      </td>
                      <td className="p-3 align-middle text-slate-600">Sunil Mehta</td>
                      <td className="p-3 align-middle font-mono text-slate-600">{createdDate}</td>
                      <td className="p-3 align-middle font-mono text-amber-800 font-bold">{validUntil}</td>
                      <td className="p-3 align-middle text-right">
                        <PORowActionsMenu
                          po={po}
                          onView={() => handleOpenDetails(po)}
                          onEdit={(targetPO) => navigate(`/procurement/purchase-orders/new?poId=${targetPO.id}`)}
                          onSubmitForApproval={() => handleOpenApproval(po, 'approve')}
                          onReviewApproval={() => handleOpenApproval(po, 'approve')}
                          onIssuePO={() => handleOpenDetails(po)}
                          onDownload={() => downloadPurchaseOrderPDF(po, state.vendors.find((v) => v.id === po.vendorId))}
                          onViewComparison={(rfqId) => navigate(`/procurement/rfqs/${rfqId || po.rfqId}?tab=vendors`)}
                          onViewGRNs={() => handleNavigateToGRNs(po)}
                          onViewActivity={() => handleOpenDetails(po)}
                          onCancel={handleCancelPO}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by PO ID, Vendor, Project or Item..."
        selectFilters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'pending_approval', label: 'Pending Approval' },
              { value: 'approved', label: 'Approved' },
              { value: 'issued', label: 'Issued to Supplier' },
              { value: 'completed', label: 'Completed' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'cancelled', label: 'Cancelled' },
            ]
          },
          {
            id: 'project',
            label: 'Project',
            value: selectedProjectId,
            onChange: setSelectedProjectId,
            options: [
              { value: 'all', label: 'All Projects' },
              ...(state.projects || []).map((p) => ({ value: p.id, label: p.projectName }))
            ]
          }
        ]}
        onResetFilters={() => {
          setSearchQuery('');
          setSelectedProjectId('all');
          setStatusFilter('all');
        }}
        hasActiveFilters={searchQuery !== '' || selectedProjectId !== 'all' || statusFilter !== 'all'}
      />

      {/* Main Purchase Orders Register Table */}
      <div className="bg-white border border-[#E2E6EC] rounded-xl shadow-2xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="p-3.5">PO Number</th>
                <th className="p-3.5">Source</th>
                <th className="p-3.5">Vendor</th>
                <th className="p-3.5">Project</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5">PO Date</th>
                <th className="p-3.5">Valid Until</th>
                <th className="p-3.5">Delivery Due</th>
                <th className="p-3.5">PO Status</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5">Delivery Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-500 font-medium">
                    <div className="space-y-1">
                      <div className="text-slate-700 font-bold text-xs">No purchase orders found.</div>
                      <div className="text-slate-500 text-[11px]">
                        Create a PO from an RFQ quotation or approved direct purchase.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const totals = calculatePurchaseOrderTotals(po);
                  const vendor = state.vendors.find((v) => v.id === po.vendorId);
                  const sourceRef = po.rfqDocumentNumber || po.sourceIndentNumber || (po.originType === 'direct_po' ? 'Direct PO' : 'RFQ-2026-001');
                  const validUntil = po.validUntil || po.rateValidityDate || '31 Aug 2026';
                  const deliveryDue = po.expectedDeliveryDate || po.deliveryDueDate || '05 Sep 2026';
                  const poDate = po.orderDate || (po.createdAt ? po.createdAt.split('T')[0] : '10 Aug 2026');
                  const deliverySummary = getCanonicalPODeliverySummary(po, goodsReceipts);

                  return (
                    <tr key={po.id} className="hover:bg-slate-50 transition-colors h-14">
                      <td className="p-3.5 align-middle font-mono font-bold text-slate-900">
                        <button
                          onClick={() => handleOpenDetails(po)}
                          className="hover:text-[#AB9570] underline text-left cursor-pointer"
                        >
                          {po.documentNumber || po.poNumber || po.id}
                        </button>
                      </td>
                      <td className="p-3.5 align-middle font-mono text-slate-700 font-medium">{sourceRef}</td>
                      <td className="p-3.5 align-middle font-bold text-slate-900">{po.vendorName || 'Selected Vendor'}</td>
                      <td className="p-3.5 align-middle text-slate-700 font-medium">{po.projectName || 'Active Project'}</td>
                      <td className="p-3.5 align-middle text-right font-mono font-bold text-slate-900">
                        {formatIndianCurrency(totals.grandTotal)}
                      </td>
                      <td className="p-3.5 align-middle font-mono text-slate-600">{poDate}</td>
                      <td className="p-3.5 align-middle font-mono text-amber-900 font-bold">{validUntil}</td>
                      <td className="p-3.5 align-middle font-mono text-slate-700">{deliveryDue}</td>
                      <td className="p-3.5 align-middle">{getPOStatusBadge(po.status as any)}</td>
                      <td className="p-3.5 align-middle font-mono uppercase text-[10px] font-bold text-slate-600">
                        {po.paymentStatus || 'unpaid'}
                      </td>
                      <td className="p-3.5 align-middle font-mono uppercase text-[10px] font-bold text-slate-700">
                        {deliverySummary.deliveryStatus.replace('_', ' ')}
                      </td>
                      <td className="p-3.5 align-middle text-right">
                        <PORowActionsMenu
                          po={po}
                          onView={() => handleOpenDetails(po)}
                          onEdit={(targetPO) => navigate(`/procurement/purchase-orders/new?poId=${targetPO.id}`)}
                          onSubmitForApproval={() => handleOpenApproval(po, 'approve')}
                          onReviewApproval={() => handleOpenApproval(po, 'approve')}
                          onIssuePO={() => handleOpenDetails(po)}
                          onDownload={() => downloadPurchaseOrderPDF(po, vendor)}
                          onViewDeliveryHistory={() => handleNavigateToGRNs(po)}
                          onViewComparison={(rfqId) => navigate(`/procurement/rfqs/${rfqId || po.rfqId}?tab=vendors`)}
                          onViewGRNs={() => handleNavigateToGRNs(po)}
                          onViewActivity={() => handleOpenDetails(po)}
                          onCancel={handleCancelPO}
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

      {/* Modals */}
      {activePO && detailsModalOpen && (
        <PODetailsModal
          po={activePO}
          isOpen={detailsModalOpen}
          onClose={() => { setDetailsModalOpen(false); setSelectedPO(null); }}
          onApprove={() => { setDetailsModalOpen(false); handleOpenApproval(activePO, 'approve'); }}
          onReject={() => { setDetailsModalOpen(false); handleOpenApproval(activePO, 'reject'); }}
        />
      )}

      {activePO && approvalModalOpen && (
        <POApprovalModal
          po={activePO}
          mode={approvalMode}
          isOpen={approvalModalOpen}
          onClose={() => { setApprovalModalOpen(false); setSelectedPO(null); }}
          onConfirm={handleConfirmApproval}
        />
      )}
    </ListPageLayout>
  );
};

