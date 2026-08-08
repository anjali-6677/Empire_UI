/**
 * Goods Received Note (GRN) Details Page
 * Location: src/pages/inventory/GRNDetailsPage.tsx
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import { getGRNStatusBadge, getQualityInspectionStatusBadge } from '../../utils/statusStyles';
import {
  Boxes,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react';

export const GRNDetailsPage: React.FC = () => {
  const { grnId } = useParams<{ grnId: string }>();
  const navigate = useNavigate();

  const { state, approveGRN, postGRNToStock } = useERPStore();
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const grns = state.grns || [];
  const grn = grns.find((g) => g.id === grnId || g.documentNumber === grnId);

  if (!grn) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <Boxes className="w-12 h-12 text-stone-300 mx-auto" />
        <h2 className="text-base font-bold text-stone-800">Goods Received Note Not Found</h2>
        <p className="text-xs text-stone-500">The GRN reference "{grnId}" does not exist in the system store.</p>
        <Button variant="secondary" onClick={() => navigate('/inventory/grns')}>
          Back to GRN List
        </Button>
      </div>
    );
  }

  const qcStatus = grn.qualityInspection?.qcStatus || grn.qualityCheck?.qcStatus || 'pending';

  const handleApprove = () => {
    const res = approveGRN(grn.id, 'Vikram Singh (Quality Manager)', 'Approved from GRN Details View');
    if (res.success) {
      setActionNotice(`GRN ${grn.documentNumber} has been approved.`);
    } else {
      setActionNotice(`Error: ${res.error}`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handlePostToStock = () => {
    const res = postGRNToStock(grn.id, 'Ramesh Kumar (Storekeeper)');
    if (res.success) {
      setActionNotice(`GRN ${grn.documentNumber} posted to stock ledger idempotently. Immutable stock records generated.`);
    } else {
      setActionNotice(`Stock posting notice: ${res.error}`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Back Button & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/inventory/grns')}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to GRN List
        </button>

        <div className="flex items-center gap-2">
          {grn.status !== 'approved' && grn.status !== 'posted' && (
            <Button
              variant="secondary"
              onClick={handleApprove}
              className="text-blue-700 border-blue-300 hover:bg-blue-50 font-bold"
            >
              Approve GRN
            </Button>
          )}

          {!grn.isPostedToStock && (
            <Button
              variant="primary"
              onClick={handlePostToStock}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              Post Stock Ledger
            </Button>
          )}

          {grn.isPostedToStock && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Posted to Stock Ledger
            </span>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-xs text-emerald-700 underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Header Info Card */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-extrabold text-stone-900 font-mono">{grn.documentNumber}</h1>
              {getGRNStatusBadge(grn.status)}
            </div>
            <p className="text-stone-500 mt-1">
              Received for Purchase Order{' '}
              <Link to={`/procurement/purchase-orders/${grn.purchaseOrderId}`} className="font-mono font-semibold text-amber-700 hover:underline">
                {grn.poNumber}
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[11px] text-stone-500">Quality Inspection</div>
              <div>{getQualityInspectionStatusBadge(qcStatus)}</div>
            </div>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-stone-700">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Vendor</span>
            <span className="font-bold text-stone-900">{grn.vendorName}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Project</span>
            <span className="font-bold text-stone-900">{grn.projectName}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Delivery Challan No.</span>
            <span className="font-mono font-bold text-stone-900">{grn.deliveryChallanNo || 'N/A'}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Vehicle Registration</span>
            <span className="font-mono text-stone-900">{grn.vehicleNumber || 'N/A'}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Destination Location</span>
            <span className="font-semibold text-stone-900">{grn.destinationLocationName}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Received Date</span>
            <span className="font-semibold text-stone-900">{grn.receivedDate}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Received By</span>
            <span className="font-semibold text-stone-900">{grn.receivedBy}</span>
          </div>

          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">Stock Ledger Posting</span>
            <span className="font-semibold text-stone-900">
              {grn.isPostedToStock ? `Posted by ${grn.postedBy || 'Storekeeper'} on ${grn.postedAt ? new Date(grn.postedAt).toLocaleDateString() : 'N/A'}` : 'Not Posted'}
            </span>
          </div>
        </div>
      </div>

      {/* Quality Inspection Breakdown Card */}
      {grn.qualityInspection && (
        <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200/80 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Quality Inspection Report
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-amber-900 pt-1">
            <div>
              <span className="text-amber-700 font-medium block">Inspector:</span>
              <span className="font-bold">{grn.qualityInspection.inspectedBy}</span>
            </div>
            <div>
              <span className="text-amber-700 font-medium block">Inspection Date:</span>
              <span>{grn.qualityInspection.inspectionDate}</span>
            </div>
            <div>
              <span className="text-amber-700 font-medium block">Result / Test Status:</span>
              <span className="font-bold uppercase text-amber-950">{grn.qualityInspection.qcStatus}</span>
            </div>
            <div className="md:col-span-3">
              <span className="text-amber-700 font-medium block">Inspection Notes:</span>
              <p className="text-stone-800 bg-white p-2.5 rounded border border-amber-200 text-xs mt-1">
                {grn.qualityInspection.inspectionNotes || 'No specific inspection notes recorded.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Line Items Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-600" />
            Received Line Items & Quantities
          </h2>
          <span className="text-stone-500 font-medium text-xs">
            {grn.lines.length} Line Item(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px]">
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4 text-right">PO Ordered</th>
                <th className="py-3 px-4 text-right">Prev Received</th>
                <th className="py-3 px-4 text-right">Current Received</th>
                <th className="py-3 px-4 text-right">Accepted Qty</th>
                <th className="py-3 px-4 text-right">Rejected Qty</th>
                <th className="py-3 px-4 text-right">Unit Rate</th>
                <th className="py-3 px-4">Batch # / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
              {grn.lines.map((line) => (
                <tr key={line.id} className="hover:bg-stone-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-stone-900">{line.productName}</div>
                    <div className="text-[10px] font-mono text-stone-500">{line.productCode}</div>
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-stone-600">
                    {line.orderedQty} {line.unitSymbol}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-stone-500">
                    {line.previouslyReceivedQty}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                    {line.currentReceivedQty}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 bg-emerald-50/50">
                    {line.acceptedQty}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700 bg-rose-50/50">
                    {line.rejectedQty}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-stone-700">
                    ₹{line.unitRate.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4 text-stone-600 text-[11px]">
                    {line.rejectionReason || line.batchNumber || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
