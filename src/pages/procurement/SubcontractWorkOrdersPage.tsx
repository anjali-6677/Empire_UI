import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { SubcontractWorkOrder } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { formatIndianCurrency } from '../../utils/format';
import {
  Plus,
  Hammer,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  X,
  FileText,
} from 'lucide-react';

export const SubcontractWorkOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateSubcontractWorkOrder } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWO, setSelectedWO] = useState<SubcontractWorkOrder | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);

  const workOrders: SubcontractWorkOrder[] = state.subcontractWorkOrders || [];
  const projects = state.projects || [];

  const filteredWorkOrders = workOrders.filter((wo) => {
    const docNum = wo.documentNumber || wo.woNumber || '';
    const matchesProject = selectedProjectId === 'all' || wo.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      docNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.subcontractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wo.workCategory || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  const activeScopeWOs = selectedProjectId === 'all'
    ? workOrders
    : workOrders.filter((w) => w.projectId === selectedProjectId);

  const draftWOs = activeScopeWOs.filter((w) => w.status === 'draft').length;
  const pendingWOs = activeScopeWOs.filter((w) => w.status === 'pending_approval').length;
  const issuedWOs = activeScopeWOs.filter((w) => w.status === 'issued' || w.status === 'approved' || w.status === 'work_started').length;
  const totalAwardedValue = activeScopeWOs.reduce((sum, w) => sum + (w.grandTotal || w.finalContractValue || 0), 0);

  const handleApprove = (wo: SubcontractWorkOrder) => {
    updateSubcontractWorkOrder(wo.id, { status: 'issued', approvedAt: new Date().toISOString() }, 'Project Director');
  };

  const handleReject = (wo: SubcontractWorkOrder) => {
    updateSubcontractWorkOrder(wo.id, { status: 'rejected' }, 'Project Director');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
      case 'pending_approval':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">Pending Approval</span>;
      case 'issued':
      case 'approved':
      case 'work_started':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">Issued & Active</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">Completed</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-800 border border-red-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Subcontractor Work Orders"
        subtitle="Manage work orders, trade scopes, rates, retention rules, and site verification bounds."
        actions={
          <button
            onClick={() => navigate('/procurement/work-orders/new')}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-950 bg-[#AB9570] hover:bg-[#927D5E] rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Work Order
          </button>
        }
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search WO #, Subcontractor, Trade or Project..."
        selectFilters={[
          {
            id: 'project-filter',
            label: 'Project',
            value: selectedProjectId,
            onChange: setSelectedProjectId,
            options: [
              { value: 'all', label: 'All Projects' },
              ...projects.map((p) => ({ value: p.id, label: p.projectName })),
            ],
          },
          {
            id: 'status-filter',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'Pending Approval', value: 'pending_approval' },
              { label: 'Issued & Active', value: 'issued' },
              { label: 'Completed', value: 'completed' },
              { label: 'Rejected', value: 'rejected' },
            ],
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Work Orders</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{activeScopeWOs.length}</h3>
            <p className="text-xs text-gray-400 mt-1">{issuedWOs} Active | {pendingWOs} Pending</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-[#AB9570]">
            <Hammer className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Awarded Contract Value</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{formatIndianCurrency(totalAwardedValue)}</h3>
            <p className="text-xs text-gray-400 mt-1">Across active scopes</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-xl font-bold text-amber-700 mt-1">{pendingWOs}</h3>
            <p className="text-xs text-amber-600 mt-1">Requires QS / Director sign-off</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Draft Work Orders</p>
            <h3 className="text-xl font-bold text-gray-700 mt-1">{draftWOs}</h3>
            <p className="text-xs text-gray-400 mt-1">Unsubmitted drafts</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-gray-500">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">WO Number & Date</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Subcontractor</th>
              <th className="py-3 px-4">Trade Category</th>
              <th className="py-3 px-4 text-right">Contract Value</th>
              <th className="py-3 px-4 text-center">Retention %</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredWorkOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No Subcontractor Work Orders found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredWorkOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#121214]">{wo.documentNumber || wo.woNumber}</span>
                      <span className="text-xs text-gray-500">{new Date(wo.startDate || wo.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{wo.projectName}</td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{wo.subcontractorName}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {wo.workCategory || 'General Subcontract'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatIndianCurrency(wo.grandTotal || wo.subtotal || 0)}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700 font-medium">
                    {wo.retentionPercentage || 5}%
                  </td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(wo.status)}</td>
                  <td className="py-3 px-4 text-right relative">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedWO(wo);
                          setDetailsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#121214] hover:bg-gray-100 rounded-md transition-colors"
                        title="View WO Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {wo.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApprove(wo)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Approve Work Order"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(wo)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Reject Work Order"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* WO Details Modal */}
      {detailsModalOpen && selectedWO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-gray-900">{selectedWO.documentNumber || selectedWO.woNumber}</h3>
                  {getStatusBadge(selectedWO.status)}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Issued to <span className="font-semibold text-gray-800">{selectedWO.subcontractorName}</span> for {selectedWO.projectName}
                </p>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 block uppercase font-medium">Trade Category</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedWO.workCategory || 'General Subcontract'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block uppercase font-medium">Contract Value</span>
                  <span className="text-sm font-semibold text-emerald-700">{formatIndianCurrency(selectedWO.grandTotal || selectedWO.subtotal || 0)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block uppercase font-medium">Retention & Tax</span>
                  <span className="text-sm font-medium text-gray-800">Retention: {selectedWO.retentionPercentage || 5}% | GST: {selectedWO.taxPercentage || 18}%</span>
                </div>
              </div>

              {/* BOQ Items & Scope */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-[#AB9570]" /> Linked BOQ Items & Scope breakdown
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Item / Description</th>
                        <th className="py-2 px-3 text-center">UOM</th>
                        <th className="py-2 px-3 text-right">WO Qty</th>
                        <th className="py-2 px-3 text-right">Agreed Rate</th>
                        <th className="py-2 px-3 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(selectedWO.items || []).map((line, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-900 font-medium">{line.scopeDescription}</td>
                          <td className="py-2 px-3 text-center text-gray-600">{line.unitSymbol || line.unit || 'sqft'}</td>
                          <td className="py-2 px-3 text-right font-medium">{line.quantity}</td>
                          <td className="py-2 px-3 text-right">{formatIndianCurrency(line.rate)}</td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900">{formatIndianCurrency(line.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terms & Payment Conditions */}
              {selectedWO.paymentTerms && (
                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/60">
                  <h5 className="text-xs font-bold text-amber-900 uppercase mb-1">Payment & Mobilization Terms</h5>
                  <p className="text-xs text-amber-800">{selectedWO.paymentTerms}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ListPageLayout>
  );
};

export default SubcontractWorkOrdersPage;
