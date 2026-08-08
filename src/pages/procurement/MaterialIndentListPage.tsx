import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Plus, ShieldAlert, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';

export const MaterialIndentListPage: React.FC = () => {
  const { state, approveMaterialIndent, rejectMaterialIndent, returnMaterialIndent } = useERPStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal State for In-line Action Comments
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    indentId: string;
    actionType: 'reject' | 'return';
    comment: string;
    error: string | null;
  }>({
    isOpen: false,
    indentId: '',
    actionType: 'reject',
    comment: '',
    error: null,
  });

  const currentUser = 'Rajesh Sharma (Project Director)';

  const indents = (state.materialIndents || []).filter((ind) => {
    const docNo = ind.indentNumber || ind.documentNumber || '';
    const projName = ind.projectName || '';
    const reqBy = ind.requestedByEmployeeName || ind.createdBy || '';
    const matchesSearch =
      docNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reqBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ind.status === statusFilter;
    const matchesProject = projectFilter === 'all' || ind.projectId === projectFilter;
    const matchesPriority = priorityFilter === 'all' || (ind.priority || 'normal') === priorityFilter;
    return matchesSearch && matchesStatus && matchesProject && matchesPriority;
  });

  // KPI Metrics Calculations
  const totalIndentsCount = state.materialIndents.length;
  const pendingCount = state.materialIndents.filter((i) => i.status === 'submitted' || i.status === 'pending_approval').length;
  const approvedCount = state.materialIndents.filter((i) => i.status === 'approved').length;
  const returnedCount = state.materialIndents.filter((i) => i.status === 'sent_back' || i.status === 'returned_for_revision').length;
  const rejectedCount = state.materialIndents.filter((i) => i.status === 'rejected').length;
  const totalEstimatedValue = state.materialIndents.reduce(
    (acc, i) => acc + (i.totalEstimatedValue || i.lines?.reduce((sum, l) => sum + (l.estimatedTotal || 0), 0) || 0),
    0
  );

  const handleInlineApprove = (indentId: string) => {
    const target = state.materialIndents.find((i) => i.id === indentId);
    if (!target) return;
    if (target.requestedByEmployeeName === currentUser || target.createdBy === currentUser) {
      alert('Segregation of Duties Violation: You cannot approve a material indent requested by yourself.');
      return;
    }
    approveMaterialIndent(indentId, currentUser, 'Approved via inline quick action.');
  };

  const handleOpenActionModal = (indentId: string, actionType: 'reject' | 'return') => {
    const target = state.materialIndents.find((i) => i.id === indentId);
    if (!target) return;
    if (target.requestedByEmployeeName === currentUser || target.createdBy === currentUser) {
      alert('Segregation of Duties Violation: You cannot reject or return a material indent requested by yourself.');
      return;
    }
    setActionModal({
      isOpen: true,
      indentId,
      actionType,
      comment: '',
      error: null,
    });
  };

  const handleConfirmActionModal = () => {
    if (actionModal.comment.trim().length < 5) {
      setActionModal((prev) => ({ ...prev, error: 'Mandatory comment requires at least 5 characters.' }));
      return;
    }

    if (actionModal.actionType === 'reject') {
      rejectMaterialIndent(actionModal.indentId, currentUser, actionModal.comment.trim());
    } else {
      returnMaterialIndent(actionModal.indentId, currentUser, actionModal.comment.trim());
    }

    setActionModal({ isOpen: false, indentId: '', actionType: 'reject', comment: '', error: null });
  };

  return (
    <ListPageLayout>
      {/* Header Banner */}
      <PageHeader
        title="Material Indents & Requisitions"
        subtitle="Site material requisitions validated against accepted project BOQ baselines."
        breadcrumbs={[
          { label: 'Procurement' },
          { label: 'Material Indents' }
        ]}
        actions={
          <Link
            to="/procurement/indents/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-xl shadow-xs transition-all text-xs"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Create Material Indent
          </Link>
        }
      />

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Indents</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{totalIndentsCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase block">Pending Approval</span>
          <div className="text-xl font-black text-amber-700 font-mono mt-0.5">{pendingCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase block">Approved</span>
          <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">{approvedCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs">
          <span className="text-[10px] font-bold text-purple-600 uppercase block">Sent Back</span>
          <div className="text-xl font-black text-purple-700 font-mono mt-0.5">{returnedCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase block">Rejected</span>
          <div className="text-xl font-black text-rose-700 font-mono mt-0.5">{rejectedCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Est. Value</span>
          <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
            {formatIndianCurrency(totalEstimatedValue)}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search Indent #, Project, or Requester..."
        selectFilters={[
          {
            id: 'project',
            label: 'Project',
            value: projectFilter,
            onChange: setProjectFilter,
            options: [
              { value: 'all', label: 'All Projects' },
              ...state.projects.map((p) => ({ value: p.id, label: `${p.projectCode} - ${p.projectName}` }))
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
              { value: 'submitted', label: 'Pending Approval' },
              { value: 'approved', label: 'Approved' },
              { value: 'sent_back', label: 'Sent Back' },
              { value: 'rejected', label: 'Rejected' },
            ]
          },
          {
            id: 'priority',
            label: 'Priority',
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: [
              { value: 'all', label: 'All Priorities' },
              { value: 'normal', label: 'Normal' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'critical', label: 'Critical' },
            ]
          }
        ]}
        onResetFilters={() => {
          setSearchTerm('');
          setProjectFilter('all');
          setStatusFilter('all');
          setPriorityFilter('all');
        }}
        hasActiveFilters={searchTerm !== '' || projectFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'}
      />

      {/* Main Indents Table */}
      <div className="bg-white border border-[#E2E6EC] rounded-xl overflow-hidden shadow-2xs w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3.5">Indent No</th>
                <th className="py-3 px-3.5">Project</th>
                <th className="py-3 px-3.5">Requested By</th>
                <th className="py-3 px-3.5">Required Date</th>
                <th className="py-3 px-3.5 text-center">Items</th>
                <th className="py-3 px-3.5 text-right">Est. Value</th>
                <th className="py-3 px-3.5">BOQ Exception</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {indents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-medium">
                    No material indents found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                indents.map((ind) => {
                  const docNo = ind.indentNumber || ind.documentNumber;
                  const totalVal = ind.totalEstimatedValue || ind.lines?.reduce((sum, l) => sum + (l.estimatedTotal || 0), 0) || 0;
                  const isPending = ind.status === 'submitted' || ind.status === 'pending_approval';

                  return (
                    <tr key={ind.id} className="hover:bg-slate-50 transition-colors h-14">
                      <td className="py-3 px-3.5 align-middle font-mono font-bold text-slate-900">
                        <Link to={`/procurement/indents/${ind.id}`} className="hover:text-[#AB9570] underline">
                          {docNo}
                        </Link>
                      </td>
                      <td className="py-3 px-3.5 align-middle font-semibold text-slate-900">
                        <div>{ind.projectName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ind.projectCode}</div>
                      </td>
                      <td className="py-3 px-3.5 align-middle text-slate-700">
                        {ind.requestedByEmployeeName || ind.createdBy || 'Site Engineer'}
                      </td>
                      <td className="py-3 px-3.5 align-middle font-mono text-slate-600">
                        {ind.requiredByDate || ind.requestDate || 'Immediate'}
                      </td>
                      <td className="py-3 px-3.5 align-middle text-center font-mono font-bold text-slate-900">
                        {ind.itemCount || ind.items?.length || ind.lines?.length || 0}
                      </td>
                      <td className="py-3 px-3.5 align-middle text-right font-mono font-black text-slate-900">
                        {formatIndianCurrency(totalVal)}
                      </td>
                      <td className="py-3 px-3.5 align-middle">
                        {ind.hasOverLimitLines ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3 text-amber-600" /> Over-BOQ
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded text-[10px]">
                            Within Baseline
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 align-middle">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          ind.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : ind.status === 'sent_back' || ind.status === 'returned_for_revision'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {ind.status === 'approved' && 'Approved'}
                          {isPending && 'Pending Approval'}
                          {(ind.status === 'sent_back' || ind.status === 'returned_for_revision') && 'Sent Back'}
                          {ind.status === 'rejected' && 'Rejected'}
                          {ind.status === 'draft' && 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {ind.status === 'approved' && (
                            <>
                              {ind.poId ? (
                                <Link
                                  to={`/procurement/purchase-orders/${ind.poId}`}
                                  className="px-3 py-1.5 bg-white hover:bg-[#F8F9FB] border border-[#D8DEE8] hover:border-[#AB9570] text-[#1F2937] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                                >
                                  PO Attached
                                </Link>
                              ) : ind.rfqId ? (
                                <Link
                                  to={`/procurement/rfqs/${ind.rfqId}`}
                                  className="px-3 py-1.5 bg-white hover:bg-[#F8F9FB] border border-[#D8DEE8] hover:border-[#AB9570] text-[#1F2937] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                                >
                                  RFQ Attached
                                </Link>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <Link
                                    to={`/procurement/purchase-orders/new?indentId=${ind.id}`}
                                    className="px-3 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-[#121214] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                                    title="Create Direct Purchase Order"
                                  >
                                    Direct PO
                                  </Link>
                                  <Link
                                    to={`/procurement/rfqs/new?indentId=${ind.id}`}
                                    className="px-3 py-1.5 bg-white hover:bg-[#F8F9FB] border border-[#D8DEE8] hover:border-[#AB9570] text-[#1F2937] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                                    title="Create RFQ"
                                  >
                                    Create RFQ
                                  </Link>
                                </div>
                              )}
                            </>
                          )}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleInlineApprove(ind.id)}
                                className="px-3 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-[#121214] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs cursor-pointer"
                                title="Quick Approve"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenActionModal(ind.id, 'return')}
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                                title="Send Back for Revision"
                              >
                                Send Back
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenActionModal(ind.id, 'reject')}
                                className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                                title="Reject Indent"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <Link
                            to={`/procurement/indents/${ind.id}`}
                            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
                            title="View Details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
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

      {/* Action Comment Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              {actionModal.actionType === 'reject' ? (
                <XCircle className="h-4 w-4 text-rose-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              {actionModal.actionType === 'reject' ? 'Reject Material Indent' : 'Send Back for Revision'}
            </h3>

            {actionModal.error && (
              <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded font-bold text-[11px]">
                {actionModal.error}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Mandatory Reason / Comment * (min 5 characters)
              </label>
              <textarea
                rows={3}
                value={actionModal.comment}
                onChange={(e) => setActionModal((prev) => ({ ...prev, comment: e.target.value, error: null }))}
                placeholder="Enter justification for audit log..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#AB9570] focus:outline-hidden text-xs font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, indentId: '', actionType: 'reject', comment: '', error: null })}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmActionModal}
                className={`px-4 py-2 text-white font-bold rounded-xl shadow-xs cursor-pointer ${
                  actionModal.actionType === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Confirm {actionModal.actionType === 'reject' ? 'Rejection' : 'Send Back'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ListPageLayout>
  );
};
