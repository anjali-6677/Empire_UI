import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { QualityInspection } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import {
  CheckCircle2,
  AlertTriangle,
  Eye,
  Plus,
  ShieldCheck,
  Sliders,
  X,
} from 'lucide-react';

export const QCListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, approveAdminQC } = useERPStore();

  const inspections: QualityInspection[] = state.qualityInspections || [];
  const projects = state.projects || [];

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admin Review Modal state
  const [selectedAdminQC, setSelectedAdminQC] = useState<QualityInspection | null>(null);
  const [adminRemarks, setAdminRemarks] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('Store Operations Director');

  const filteredInspections = inspections.filter((q) => {
    const matchesProject = selectedProjectId === 'all' || q.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      q.qcNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.tokenNumber && q.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.grnNumber && q.grnNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  const handleAdminDecision = (decision: 'APPROVED' | 'REJECTED' | 'HOLD') => {
    if (!selectedAdminQC) return;
    if (!adminRemarks.trim()) {
      alert('Please provide admin review decision remarks.');
      return;
    }

    const res = approveAdminQC(selectedAdminQC.id, decision, adminRemarks, adminName);
    if (res.success) {
      alert(`Admin QC Decision persistent: ${decision}. ${res.grn ? `Auto-generated GRN #${res.grn.grnNumber}` : ''}`);
      setSelectedAdminQC(null);
      setAdminRemarks('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'ADMIN_APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved & GRN
          </span>
        );
      case 'ADMIN_APPROVAL_REQUIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" /> Admin Review Req.
          </span>
        );
      case 'ADMIN_REJECTED':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Quality Control (QC) Inspections Register"
        subtitle="Mandatory Gate-Token QC stage: Perform parameter inspection by Token #, approve dispositions, and trigger auto-GRN."
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/master-data/qc-templates')}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Sliders className="w-4 h-4 mr-1.5 text-[#C5A059]" /> QC Templates
            </button>

            <button
              onClick={() => navigate('/inventory/qc/new')}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-[#C5A059] hover:bg-[#b08d48] rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Execute QC by Token #
            </button>
          </div>
        }
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Token #, QC #, PO #, Inspector, or Vendor..."
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
              { label: 'Completed / Approved', value: 'completed' },
              { label: 'Admin Approval Required', value: 'ADMIN_APPROVAL_REQUIRED' },
              { label: 'Admin Approved', value: 'ADMIN_APPROVED' },
            ],
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed QC Inspections</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{inspections.length}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Approval Required</p>
            <h3 className="text-xl font-bold text-rose-700 mt-1">
              {inspections.filter((q) => q.status === 'ADMIN_APPROVAL_REQUIRED').length}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">QC Pass Ratio</p>
            <h3 className="text-xl font-bold text-emerald-700 mt-1">98.2%</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* QC Inspections Register Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Token # / QC #</th>
              <th className="py-3.5 px-4">Auto GRN & PO</th>
              <th className="py-3.5 px-4">Vendor & Site</th>
              <th className="py-3.5 px-4">Inspector & Date</th>
              <th className="py-3.5 px-4 text-right text-emerald-700">Accepted Qty</th>
              <th className="py-3.5 px-4 text-right text-red-700">Rejected Qty</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredInspections.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No Quality Control inspection records found.
                </td>
              </tr>
            ) : (
              filteredInspections.map((qc) => {
                const totalApproved = (qc.items || []).reduce((sum, item) => sum + (item.approvedQty || 0), 0);
                const totalRejected = (qc.items || []).reduce((sum, item) => sum + (item.rejectedQty || 0), 0);

                return (
                  <tr key={qc.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 font-mono text-sm">{qc.tokenNumber || qc.qcNumber}</div>
                      <div className="text-xs text-gray-500">{qc.qcNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-emerald-800 text-xs">{qc.grnNumber || 'GRN Pending QC Pass'}</div>
                      <div className="text-xs text-gray-500">PO: {qc.poNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900 text-xs">{qc.vendorName}</div>
                      <div className="text-xs text-gray-500">{qc.projectName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      <div>{qc.inspectorName}</div>
                      <div className="text-gray-400">{qc.inspectionDate}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700 font-mono">{totalApproved}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-red-700 font-mono">{totalRejected}</td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(qc.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {qc.status === 'ADMIN_APPROVAL_REQUIRED' && (
                        <button
                          onClick={() => setSelectedAdminQC(qc)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md shadow-sm"
                        >
                          Review & Decision
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/inventory/qc/${qc.id}`)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors inline-block"
                        title="View Full Inspection Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Review & Decision Modal */}
      {selectedAdminQC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
            <div className="bg-rose-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                Admin QC Approval & Decision Review
              </h3>
              <button onClick={() => setSelectedAdminQC(null)} className="text-rose-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg text-xs space-y-1 text-rose-900">
                <div className="font-bold text-sm">Token #{selectedAdminQC.tokenNumber} | QC #{selectedAdminQC.qcNumber}</div>
                <div>Failed Parameters Count: <strong className="text-red-700">{selectedAdminQC.failedCount || 1}</strong></div>
                <div>Critical Failure Detected: <strong>{selectedAdminQC.criticalFailure ? 'YES (Mandatory Hold)' : 'NO'}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reviewing Admin Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Admin Disposition Remarks / Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Approved with 5% rate concession as warpage is within structural tolerance..."
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAdminDecision('APPROVED')}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Approve & Auto-GRN
                </button>
                <button
                  onClick={() => handleAdminDecision('REJECTED')}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Reject Material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ListPageLayout>
  );
};
export default QCListPage;
