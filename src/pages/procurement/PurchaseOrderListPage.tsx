/**
 * Purchase Orders List Page
 * Location: src/pages/procurement/PurchaseOrderListPage.tsx
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { POStatus } from '../../domain/types';
import { getPOStatusBadge } from '../../utils/statusStyles';
import { getPOTotalAmount } from '../../domain/selectors';
import { PORowActionsMenu } from '../../components/procurement/PORowActionsMenu';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { formatIndianCurrency } from '../../utils/format';
import {
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Truck,
} from 'lucide-react';

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updatePOStatus } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const purchaseOrders = state.purchaseOrders || [];

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
  const pendingApproval = activeScopePOs.filter((p) => (p.status as string) === 'pending_approval' || (p.status as string) === 'pendingapproval').length;
  const approvedPOs = activeScopePOs.filter((p) => (p.status as string) === 'approved' || (p.status as string) === 'issued').length;
  const pendingDelivery = activeScopePOs.filter((p) => (p.status as string) === 'issued' || (p.status as string) === 'partially_delivered' || (p.status as string) === 'partially_received').length;

  const handleDownloadPO = (po: any) => {
    setDownloadNotice(`Downloading PDF document for PO ${po.documentNumber}...`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 3000);
  };

  const handleCancelPO = (po: any) => {
    if (window.confirm(`Are you sure you want to cancel Purchase Order ${po.documentNumber}?`)) {
      updatePOStatus(po.id, 'cancelled', 'Rajesh Sharma (Procurement Lead)', 'Cancelled by user from PO list menu');
    }
  };

  return (
    <ListPageLayout>
      {downloadNotice && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-semibold text-xs flex items-center justify-between animate-in fade-in duration-200">
          <span>{downloadNotice}</span>
          <button onClick={() => setDownloadNotice(null)} className="text-xs text-amber-700 underline font-bold cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <PageHeader
        title="Purchase Orders"
        subtitle="Create, approve and track vendor purchase orders."
        breadcrumbs={[
          { label: 'Procurement' },
          { label: 'Purchase Orders' }
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/procurement/purchase-orders/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Create Purchase Order
          </button>
        }
      />

      {/* Metric Cards */}
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
            <div className="text-xl font-black text-amber-800 mt-0.5">{pendingApproval}</div>
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
            <div className="text-[10px] text-slate-400 font-bold uppercase">Pending Delivery</div>
            <div className="text-xl font-black text-cyan-800 mt-0.5">{pendingDelivery}</div>
          </div>
          <Truck className={`h-5 w-5 ${statusFilter === 'issued' ? 'text-[#AB9570]' : 'text-slate-400'}`} />
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search PO #, Vendor, or Project..."
        selectFilters={[
          {
            id: 'project',
            label: 'Project',
            value: selectedProjectId,
            onChange: setSelectedProjectId,
            options: [
              { value: 'all', label: 'All Active Projects' },
              ...(state.projects || []).map((p) => ({ value: p.id, label: `${p.projectCode} - ${p.projectName}` }))
            ]
          },
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
              { value: 'issued', label: 'Issued' },
              { value: 'partially_delivered', label: 'Partially Delivered' },
              { value: 'fully_delivered', label: 'Fully Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
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

      {/* Main PO Table */}
      <div className="bg-white border border-[#E2E6EC] rounded-xl shadow-2xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="p-3.5">PO Number</th>
                <th className="p-3.5">Source RFQ / DP</th>
                <th className="p-3.5">Vendor Name</th>
                <th className="p-3.5">Project</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5">PO Date</th>
                <th className="p-3.5">Delivery Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-medium">
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
                  const poTotal = getPOTotalAmount(po);
                  const sourceRef = po.rfqDocumentNumber || po.sourceIndentNumber || (po.originType === 'direct_po' ? 'Direct Purchase' : 'RFQ-2026-001');

                  return (
                    <tr key={po.id} className="hover:bg-slate-50 transition-colors h-14">
                      <td className="p-3.5 align-middle font-mono font-bold text-slate-900">
                        <Link to={`/procurement/purchase-orders/${po.id}`} className="hover:text-[#AB9570] underline decoration-slate-300">
                          {po.documentNumber}
                        </Link>
                      </td>
                      <td className="p-3.5 align-middle font-mono text-slate-700 font-medium">{sourceRef}</td>
                      <td className="p-3.5 align-middle font-bold text-slate-900">{po.vendorName || 'Selected Vendor'}</td>
                      <td className="p-3.5 align-middle text-slate-700 font-medium">{po.projectName || 'Active Project'}</td>
                      <td className="p-3.5 align-middle text-right font-mono font-bold text-slate-900">
                        {formatIndianCurrency(poTotal)}
                      </td>
                      <td className="p-3.5 align-middle font-mono text-slate-700">{po.orderDate || '2026-07-15'}</td>
                      <td className="p-3.5 align-middle font-mono text-slate-700">{po.expectedDeliveryDate || po.deliveryDueDate || '2026-07-25'}</td>
                      <td className="p-3.5 align-middle">{getPOStatusBadge(po.status as POStatus)}</td>
                      <td className="p-3.5 align-middle text-right">
                        <div className="flex items-center justify-end">
                          <PORowActionsMenu
                            po={po}
                            onView={(id) => navigate(`/procurement/purchase-orders/${id}`)}
                            onEdit={(targetPO) => navigate(`/procurement/purchase-orders/new?poId=${targetPO.id}`)}
                            onSubmitForApproval={(targetPO) => {
                              updatePOStatus(targetPO.id, 'pending_approval', 'Rajesh Sharma', 'Submitted PO for Director Approval');
                            }}
                            onReviewApproval={(id) => navigate(`/procurement/purchase-orders/${id}`)}
                            onIssuePO={(targetPO) => {
                              updatePOStatus(targetPO.id, 'issued', 'Rajesh Sharma', 'Issued PO to Vendor');
                            }}
                            onDownload={handleDownloadPO}
                            onViewComparison={(rfqId) => navigate(`/procurement/rfqs/${rfqId || po.rfqId}?tab=vendors`)}
                            onViewGRNs={(id) => navigate(`/inventory/grns?poId=${id}`)}
                            onViewActivity={(id) => navigate(`/procurement/purchase-orders/${id}?tab=activity`)}
                            onCancel={handleCancelPO}
                          />
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
    </ListPageLayout>
  );
};
