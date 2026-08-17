import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { QualityInspection } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { resolveQCSource } from '../../utils/qcSelectors';
import {
  CheckCircle2,
  AlertTriangle,
  Eye,
  Plus,
  ShieldCheck,
  Sliders,
  X,
  FileText,
  Building2,
  Package,
  Layers,
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

  // Full QC Traceability Details Modal state
  const [viewDetailsQC, setViewDetailsQC] = useState<QualityInspection | null>(null);

  // Pre-resolve source metadata for each inspection record
  const resolvedInspections = inspections.map((q) => ({
    qc: q,
    resolved: resolveQCSource(q, state),
  }));

  const filtered = resolvedInspections.filter(({ qc, resolved }) => {
    const matchesProject = selectedProjectId === 'all' || resolved.projectId === selectedProjectId;
    const matchesStatus =
      statusFilter === 'all' ||
      qc.status === statusFilter ||
      resolved.displayStatus.toLowerCase() === statusFilter.toLowerCase();
    const qLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      resolved.qcNumber.toLowerCase().includes(qLower) ||
      resolved.tokenNumber.toLowerCase().includes(qLower) ||
      resolved.poNumber.toLowerCase().includes(qLower) ||
      resolved.vendorName.toLowerCase().includes(qLower) ||
      resolved.projectName.toLowerCase().includes(qLower) ||
      resolved.inspectorName.toLowerCase().includes(qLower) ||
      (resolved.grnNumber && resolved.grnNumber.toLowerCase().includes(qLower));

    return matchesProject && matchesStatus && matchesSearch;
  });

  // Calculate dynamic KPI metrics
  const completedInspectionsCount = resolvedInspections.filter(({ qc }) => (qc.status as string) !== 'pending').length;
  const adminApprovalReqCount = resolvedInspections.filter(({ qc }) => (qc.status as string) === 'ADMIN_APPROVAL_REQUIRED').length;

  const passedCount = resolvedInspections.filter(({ qc, resolved }) => {
    const stUpper = String(qc.status || '').toUpperCase();
    return stUpper === 'PASSED' || stUpper === 'COMPLETED' || stUpper === 'ADMIN_APPROVED' || resolved.acceptedQty > 0;
  }).length;

  const passRatioStr = completedInspectionsCount > 0 ? `${((passedCount / completedInspectionsCount) * 100).toFixed(1)}%` : '100%';

  const handleAdminDecision = (decision: 'APPROVED' | 'REJECTED' | 'HOLD') => {
    if (!selectedAdminQC) return;
    if (!adminRemarks.trim()) {
      alert('Please provide admin review decision remarks.');
      return;
    }

    const res = approveAdminQC(selectedAdminQC.id, decision, adminRemarks, adminName);
    if (res.success) {
      alert(`Admin QC Decision persisted: ${decision}. ${res.grn ? `Auto-generated GRN #${res.grn.grnNumber}` : ''}`);
      setSelectedAdminQC(null);
      setAdminRemarks('');
    }
  };

  const getStatusBadge = (status: string, displayStatus: string) => {
    const stUpper = String(status || '').toUpperCase();
    if (stUpper === 'COMPLETED' || stUpper === 'PASSED' || stUpper === 'ADMIN_APPROVED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1" /> {displayStatus}
        </span>
      );
    }
    if (stUpper === 'ADMIN_APPROVAL_REQUIRED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
          <AlertTriangle className="w-3 h-3 mr-1" /> Admin Review Req.
        </span>
      );
    }
    if (stUpper === 'PARTIALLY_PASSED' || stUpper === 'PARTIAL' || stUpper === 'PASSED_WITH_EXCEPTION') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
          <AlertTriangle className="w-3 h-3 mr-1" /> {displayStatus}
        </span>
      );
    }
    if (stUpper === 'ADMIN_REJECTED' || stUpper === 'REJECTED' || stUpper === 'FAILED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          {displayStatus}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {displayStatus}
      </span>
    );
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
              { label: 'Passed / Approved', value: 'completed' },
              { label: 'Admin Approval Required', value: 'ADMIN_APPROVAL_REQUIRED' },
              { label: 'Partially Passed', value: 'PARTIALLY_PASSED' },
              { label: 'Rejected / Failed', value: 'FAILED' },
            ],
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed QC Inspections</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{completedInspectionsCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Approval Required</p>
            <h3 className="text-xl font-bold text-rose-700 mt-1">{adminApprovalReqCount}</h3>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">QC Pass Ratio</p>
            <h3 className="text-xl font-bold text-emerald-700 mt-1">{passRatioStr}</h3>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No Quality Control inspection records found.
                </td>
              </tr>
            ) : (
              filtered.map(({ qc, resolved }) => {
                return (
                  <tr key={qc.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 font-mono text-sm">{resolved.tokenNumber}</div>
                      <div className="text-xs text-gray-500">{resolved.qcNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-emerald-800 text-xs">{resolved.grnStatusText}</div>
                      <div className="text-xs text-gray-500">PO: {resolved.poNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900 text-xs">{resolved.vendorName}</div>
                      <div className="text-xs text-gray-500">{resolved.projectName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      <div>{resolved.inspectorName}</div>
                      <div className="text-gray-400">{resolved.inspectionDate}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700 font-mono">{resolved.acceptedQty}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-red-700 font-mono">{resolved.rejectedQty}</td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(qc.status, resolved.displayStatus)}
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
                        onClick={() => setViewDetailsQC(qc)}
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
                <div className="font-bold text-sm">
                  Token #{resolveQCSource(selectedAdminQC, state).tokenNumber} | QC #{resolveQCSource(selectedAdminQC, state).qcNumber}
                </div>
                <div>
                  Failed Parameters Count: <strong className="text-red-700">{selectedAdminQC.failedCount || 1}</strong>
                </div>
                <div>
                  Critical Failure Detected: <strong>{selectedAdminQC.criticalFailure ? 'YES (Mandatory Hold)' : 'NO'}</strong>
                </div>
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

      {/* Full QC Inspection Traceability Details Modal */}
      {viewDetailsQC && (() => {
        const res = resolveQCSource(viewDetailsQC, state);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-gray-900 text-white p-5 flex justify-between items-center shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
                    <h3 className="font-bold text-lg">QC Inspection Traceability Record</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">
                    Token #{res.tokenNumber} | QC #{res.qcNumber}
                  </p>
                </div>
                <button onClick={() => setViewDetailsQC(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scroll Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* 1. Source Traceability Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                    <span className="text-gray-500 font-medium block flex items-center gap-1 mb-1">
                      <FileText className="w-3.5 h-3.5 text-purple-600" /> Source Orders & Gate
                    </span>
                    <div className="space-y-0.5">
                      <div><strong className="text-gray-700">Token #:</strong> <span className="font-mono font-bold text-gray-900">{res.tokenNumber}</span></div>
                      <div><strong className="text-gray-700">QC #:</strong> <span className="font-mono text-gray-800">{res.qcNumber}</span></div>
                      <div><strong className="text-gray-700">PO #:</strong> <span className="font-mono font-semibold text-purple-700">{res.poNumber}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                    <span className="text-gray-500 font-medium block flex items-center gap-1 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" /> Vendor & Delivery Site
                    </span>
                    <div className="space-y-0.5">
                      <div><strong className="text-gray-700">Vendor:</strong> <span className="font-semibold text-gray-900">{res.vendorName}</span></div>
                      <div><strong className="text-gray-700">Project / Site:</strong> <span className="text-gray-800">{res.projectName}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                    <span className="text-gray-500 font-medium block flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Inspector & Status
                    </span>
                    <div className="space-y-0.5">
                      <div><strong className="text-gray-700">Inspector:</strong> <span className="text-gray-900">{res.inspectorName}</span></div>
                      <div><strong className="text-gray-700">Date:</strong> <span className="text-gray-800">{res.inspectionDate}</span></div>
                      <div className="mt-1">{getStatusBadge(viewDetailsQC.status, res.displayStatus)}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Inspected Line Items & Quantities */}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2.5 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#C5A059]" /> Inspected Line Items & Disposition Summary
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                          <th className="py-2.5 px-3">Item Description</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Received Qty</th>
                          <th className="py-2.5 px-3 text-right text-emerald-700">Accepted Qty</th>
                          <th className="py-2.5 px-3 text-right text-amber-700">Hold Qty</th>
                          <th className="py-2.5 px-3 text-right text-red-700">Rejected Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {res.items.map((item: any, idx: number) => {
                          const appQty = item.approvedQty ?? item.acceptedQty ?? item.passedQty ?? (res.acceptedQty > 0 ? res.acceptedQty : 0);
                          const rejQty = item.rejectedQty ?? 0;
                          const hldQty = item.holdQty ?? 0;
                          const rcvQty = item.receivedQty ?? item.inspectedQty ?? (appQty + rejQty + hldQty);
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-sans font-semibold text-gray-900">
                                {item.productDescription || item.productName || 'Inspected Material'}
                              </td>
                              <td className="py-2.5 px-3 font-sans text-gray-500">{item.categoryName || 'General'}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-gray-800">{rcvQty} {item.unit || ''}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{appQty} {item.unit || ''}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-amber-700">{hldQty} {item.unit || ''}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-red-700">{rejQty} {item.unit || ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. QC Parameter Check Results */}
                {res.items.some((it: any) => it.parameterResults?.length) && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#C5A059]" /> Category Checklist Parameters Inspection Results
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <th className="py-2 px-3">Parameter</th>
                            <th className="py-2 px-3">Expected Standard</th>
                            <th className="py-2 px-3">Actual Observation</th>
                            <th className="py-2 px-3 text-center">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {res.items.flatMap((it: any) => it.parameterResults || []).map((p: any, pIdx: number) => (
                            <tr key={pIdx}>
                              <td className="py-2 px-3 font-semibold text-gray-800 flex items-center gap-1.5">
                                {p.critical && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">CRITICAL</span>}
                                {p.parameterName}
                              </td>
                              <td className="py-2 px-3 text-gray-600 font-mono">{p.requirement || p.expectedValue}</td>
                              <td className="py-2 px-3 text-gray-900 font-medium">{p.actualObservation || 'Conforms'}</td>
                              <td className="py-2 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                  p.result === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {p.result}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Downstream GRN & Stock Linkage */}
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-xs space-y-1.5 text-emerald-950">
                  <div className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Downstream GRN & Stock Posting Status
                  </div>
                  <div>
                    Linked GRN Document: <strong className="font-mono text-emerald-900">{res.grnStatusText}</strong>
                  </div>
                  <div>
                    Stock Ledger Posting: <strong>{res.grn ? 'Posted to Site Stock Ledger' : 'Pending Final GRN Generation'}</strong>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end shrink-0">
                <button
                  onClick={() => setViewDetailsQC(null)}
                  className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Close Traceability View
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </ListPageLayout>
  );
};
export default QCListPage;
