import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { SubcontractWIP, SubcontractWorkOrder } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { formatIndianCurrency } from '../../utils/format';
import {
  Plus,
  HardHat,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  X,
  FileCheck,
} from 'lucide-react';

export const SubcontractorWIPPage: React.FC = () => {
  const { state, updateSubcontractWIPStatus, createSubcontractWIP } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWIP, setSelectedWIP] = useState<SubcontractWIP | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const wips: SubcontractWIP[] = state.subcontractorWIPs || [];
  const workOrders: SubcontractWorkOrder[] = state.subcontractWorkOrders || [];
  const projects = state.projects || [];

  const filteredWIPs = wips.filter((wip) => {
    const matchesProject = selectedProjectId === 'all' || wip.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || wip.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      wip.wipNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wip.woNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wip.subcontractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wip.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  const activeScopeWIPs = selectedProjectId === 'all'
    ? wips
    : wips.filter((w) => w.projectId === selectedProjectId);

  const pendingVerification = activeScopeWIPs.filter((w) => w.status === 'submitted' || w.status === 'site_verification').length;
  const approvedWIPs = activeScopeWIPs.filter((w) => w.status === 'approved').length;
  const totalVerifiedValue = activeScopeWIPs.filter((w) => w.status === 'approved').reduce((sum, w) => sum + (w.totalApprovedValue || 0), 0);

  // Form State for Creating WIP Measurement
  const [selectedWOId, setSelectedWOId] = useState<string>(workOrders[0]?.id || '');
  const targetWO = workOrders.find((w) => w.id === selectedWOId);
  const [measuredItems, setMeasuredItems] = useState<any[]>([]);

  const handleOpenCreateModal = () => {
    if (targetWO && targetWO.items) {
      setMeasuredItems(
        targetWO.items.map((item) => ({
          woItemId: item.id,
          scopeDescription: item.scopeDescription,
          unitSymbol: item.unitSymbol || 'sqft',
          woQty: item.quantity,
          previouslyApprovedQty: 0,
          claimedQty: item.quantity * 0.5,
          measuredQty: item.quantity * 0.5,
          rate: item.rate,
          amount: (item.quantity * 0.5) * item.rate,
        }))
      );
    }
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWO) return;

    const totalVal = measuredItems.reduce((sum, i) => sum + i.amount, 0);
    const newWIP: SubcontractWIP = {
      id: `wip-${Date.now()}`,
      wipNumber: `WIP-${Date.now().toString().slice(-6)}`,
      projectId: targetWO.projectId,
      projectName: targetWO.projectName,
      workOrderId: targetWO.id,
      woNumber: targetWO.documentNumber || targetWO.woNumber || 'SWO',
      subcontractorId: targetWO.subcontractorId,
      subcontractorName: targetWO.subcontractorName,
      wipDate: new Date().toISOString().split('T')[0],
      siteEngineerName: 'Arjun Verma (QS Engineer)',
      items: measuredItems.map((i) => ({
        id: `wipi-${Date.now()}-${Math.random()}`,
        woItemId: i.woItemId,
        scopeDescription: i.scopeDescription,
        unitSymbol: i.unitSymbol,
        woQty: i.woQty,
        previouslyApprovedQty: i.previouslyApprovedQty,
        claimedQty: i.claimedQty,
        measuredQty: i.measuredQty,
        approvedQty: i.measuredQty,
        remainingWOQty: Math.max(0, i.woQty - i.measuredQty),
        rate: i.rate,
        approvedValue: i.amount,
      })),
      totalClaimedValue: totalVal,
      totalApprovedValue: totalVal,
      status: 'submitted',
      createdBy: 'Site Engineer',
      createdAt: new Date().toISOString(),
    };

    createSubcontractWIP(newWIP);
    setCreateModalOpen(false);
  };

  const handleVerify = (wip: SubcontractWIP, status: 'approved' | 'rejected') => {
    updateSubcontractWIPStatus(wip.id, status, 'Site Engineer');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
      case 'submitted':
      case 'site_verification':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">Pending Verification</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">Verified & Certified</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-800 border border-red-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Subcontractor WIP & Site Verification"
        subtitle="Record site measurements, verify physical completion, and certify work progress against Work Orders."
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-950 bg-[#AB9570] hover:bg-[#927D5E] rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Site Measurement
          </button>
        }
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search WIP #, WO #, Subcontractor or Site..."
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
              { label: 'Pending Verification', value: 'submitted' },
              { label: 'Verified & Certified', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
            ],
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total WIP Entries</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{activeScopeWIPs.length}</h3>
            <p className="text-xs text-gray-400 mt-1">{approvedWIPs} Certified | {pendingVerification} Pending</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-[#AB9570]">
            <HardHat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Verified Progress Value</p>
            <h3 className="text-xl font-bold text-emerald-700 mt-1">{formatIndianCurrency(totalVerifiedValue)}</h3>
            <p className="text-xs text-gray-400 mt-1">Approved site measurements</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Site Verification</p>
            <h3 className="text-xl font-bold text-amber-700 mt-1">{pendingVerification}</h3>
            <p className="text-xs text-amber-600 mt-1">Awaiting QS engineer inspection</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">WIP # & Date</th>
              <th className="py-3 px-4">Work Order Ref</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Subcontractor</th>
              <th className="py-3 px-4 text-right">Claimed Value</th>
              <th className="py-3 px-4 text-right">Approved Value</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredWIPs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No Subcontractor WIP records found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredWIPs.map((wip) => (
                <tr key={wip.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#121214]">{wip.wipNumber}</span>
                      <span className="text-xs text-gray-500">{new Date(wip.wipDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{wip.woNumber}</td>
                  <td className="py-3 px-4 text-gray-700">{wip.projectName}</td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{wip.subcontractorName}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-700">
                    {formatIndianCurrency(wip.totalClaimedValue)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                    {formatIndianCurrency(wip.totalApprovedValue)}
                  </td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(wip.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedWIP(wip);
                          setDetailsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#121214] hover:bg-gray-100 rounded-md transition-colors"
                        title="View WIP Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {(wip.status === 'submitted' || wip.status === 'site_verification') && (
                        <>
                          <button
                            onClick={() => handleVerify(wip, 'approved')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Approve & Certify Progress"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleVerify(wip, 'rejected')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Reject Measurement"
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

      {/* WIP Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <FileCheck className="w-5 h-5 mr-2 text-[#AB9570]" /> New Site WIP Measurement Entry
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Work Order *</label>
                <select
                  value={selectedWOId}
                  onChange={(e) => setSelectedWOId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                >
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.id}>{w.documentNumber || w.woNumber} - {w.subcontractorName} ({w.projectName})</option>
                  ))}
                </select>
              </div>

              {measuredItems.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-right">WO Qty</th>
                        <th className="py-2 px-3 text-right">Measured Qty</th>
                        <th className="py-2 px-3 text-right">Rate (₹)</th>
                        <th className="py-2 px-3 text-right">Verified Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {measuredItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-medium text-gray-900">{item.scopeDescription}</td>
                          <td className="py-2 px-3 text-right text-gray-600">{item.woQty} {item.unitSymbol}</td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              value={item.measuredQty}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setMeasuredItems((prev) => {
                                  const updated = [...prev];
                                  updated[idx] = { ...updated[idx], measuredQty: val, amount: val * updated[idx].rate };
                                  return updated;
                                });
                              }}
                              className="w-20 text-right p-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">{formatIndianCurrency(item.rate)}</td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900">{formatIndianCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-[#121214] hover:bg-[#252528] rounded-lg"
              >
                Submit Site WIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WIP Details Modal */}
      {detailsModalOpen && selectedWIP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-900">{selectedWIP.wipNumber} Details</h3>
              <button onClick={() => setDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p><span className="text-gray-500">Subcontractor:</span> <span className="font-semibold text-gray-800">{selectedWIP.subcontractorName}</span></p>
              <p><span className="text-gray-500">Work Order Ref:</span> <span className="font-medium text-gray-800">{selectedWIP.woNumber}</span></p>
              <p><span className="text-gray-500">Certified Approved Value:</span> <span className="font-bold text-emerald-700">{formatIndianCurrency(selectedWIP.totalApprovedValue)}</span></p>
            </div>
            <div className="flex justify-end pt-3">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg"
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

export default SubcontractorWIPPage;
