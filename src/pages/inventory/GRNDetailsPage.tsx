import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import {
  ClipboardCheck,
  ArrowLeft,
  AlertTriangle,
  Building,
  User,
  FileText,
} from 'lucide-react';

export const GRNDetailsPage: React.FC = () => {
  const { grnId } = useParams<{ grnId: string }>();
  const navigate = useNavigate();
  const { state } = useERPStore();

  const grn = (state.goodsReceipts || []).find((g) => g.id === grnId || g.grnNumber === grnId);
  const inspections = (state.qualityInspections || []).filter((q) => q.grnId === grn?.id || q.grnNumber === grn?.grnNumber);

  if (!grn) {
    return (
      <ListPageLayout>
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200 my-6">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">Goods Receipt Note Not Found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">The requested GRN record could not be located in ERP memory.</p>
          <button
            onClick={() => navigate('/inventory/grn')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#121214] rounded-lg"
          >
            Return to GRN Register
          </button>
        </div>
      </ListPageLayout>
    );
  }

  const totalReceived = (grn.items || []).reduce((sum, i) => sum + (i.receivedQty || 0), 0);
  const totalPendingQC = (grn.items || []).reduce((sum, i) => sum + (i.qcPendingQty || 0), 0);
  const totalApproved = (grn.items || []).reduce((sum, i) => sum + (i.qcApprovedQty || 0), 0);
  const totalRejected = (grn.items || []).reduce((sum, i) => sum + (i.qcRejectedQty || 0), 0);

  return (
    <ListPageLayout>
      <div className="mb-4">
        <button
          onClick={() => navigate('/inventory/grn')}
          className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Goods Receipt Notes
        </button>
      </div>

      <PageHeader
        title={`Goods Receipt Note: ${grn.grnNumber}`}
        subtitle={`Recorded on ${grn.grnDate} | Reference PO: ${grn.poNumber}`}
        actions={
          <div className="flex items-center space-x-2">
            {(grn.status === 'qc_pending' || grn.status === 'partially_inspected') && (
              <button
                onClick={() => navigate(`/inventory/qc/new?grnId=${grn.id}`)}
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-950 bg-[#AB9570] hover:bg-[#927D5E] rounded-lg shadow-sm"
              >
                <ClipboardCheck className="w-4 h-4 mr-1.5" /> Start QC Inspection
              </button>
            )}
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Received Qty</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalReceived}</p>
          <span className="text-xs text-gray-400">Physical receipt</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-amber-200 bg-amber-50/30 shadow-sm">
          <span className="text-xs text-amber-700 font-medium uppercase tracking-wider">QC Pending Qty</span>
          <p className="text-2xl font-bold text-amber-800 mt-1">{totalPendingQC}</p>
          <span className="text-xs text-amber-600">Locked stock bucket</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <span className="text-xs text-emerald-700 font-medium uppercase tracking-wider">QC Approved Stock</span>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{totalApproved}</p>
          <span className="text-xs text-emerald-600">Available for Site Issue</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50/30 shadow-sm">
          <span className="text-xs text-red-700 font-medium uppercase tracking-wider">Rejected Stock</span>
          <p className="text-2xl font-bold text-red-800 mt-1">{totalRejected}</p>
          <span className="text-xs text-red-600">Isolated in Quarantine</span>
        </div>
      </div>

      {/* GRN Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
          Receipt Details & Origin Metadata
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600 text-xs">
              <Building className="w-4 h-4 mr-2 text-[#AB9570]" />
              <span className="font-semibold text-gray-900">Project Site:</span>
            </div>
            <p className="text-sm font-medium text-gray-800 pl-6">{grn.projectName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600 text-xs">
              <User className="w-4 h-4 mr-2 text-[#AB9570]" />
              <span className="font-semibold text-gray-900">Vendor / Supplier:</span>
            </div>
            <p className="text-sm font-medium text-gray-800 pl-6">{grn.vendorName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600 text-xs">
              <FileText className="w-4 h-4 mr-2 text-[#AB9570]" />
              <span className="font-semibold text-gray-900">Invoice / Delivery Challan #:</span>
            </div>
            <p className="text-sm font-mono font-bold text-gray-900 pl-6">{grn.invoiceChallanNo}</p>
          </div>
        </div>
      </div>

      {/* Received Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Received Material Items ({grn.items?.length || 0})
          </h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">Item Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Unit</th>
              <th className="py-3 px-4 text-right">Ordered Qty</th>
              <th className="py-3 px-4 text-right font-bold text-gray-900">Received Qty</th>
              <th className="py-3 px-4 text-right text-amber-700">QC Pending</th>
              <th className="py-3 px-4 text-right text-emerald-700">QC Approved</th>
              <th className="py-3 px-4 text-right text-red-700">QC Rejected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {(grn.items || []).map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/80">
                <td className="py-3 px-4 font-medium text-gray-900">{item.description}</td>
                <td className="py-3 px-4 text-xs text-gray-500">{item.categoryName}</td>
                <td className="py-3 px-4 text-center text-xs font-mono text-gray-600">{item.unit}</td>
                <td className="py-3 px-4 text-right text-gray-600">{item.orderedQty}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">{item.receivedQty}</td>
                <td className="py-3 px-4 text-right font-medium text-amber-700">{item.qcPendingQty}</td>
                <td className="py-3 px-4 text-right font-medium text-emerald-700">{item.qcApprovedQty}</td>
                <td className="py-3 px-4 text-right font-medium text-red-700">{item.qcRejectedQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Linked Inspections History */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
          Linked Quality Inspections ({inspections.length})
        </h3>

        {inspections.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">No Quality Control inspections conducted for this GRN yet.</p>
        ) : (
          <div className="space-y-3">
            {inspections.map((insp) => (
              <div key={insp.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-900">{insp.qcNumber}</span>
                  <span className="text-gray-500 ml-2">Inspected on {insp.inspectionDate} by {insp.inspectorName}</span>
                </div>
                <button
                  onClick={() => navigate(`/inventory/qc/${insp.id}`)}
                  className="px-2.5 py-1 text-xs font-semibold text-[#121214] bg-white border border-gray-300 rounded hover:bg-gray-100"
                >
                  View Inspection Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ListPageLayout>
  );
};

export default GRNDetailsPage;
