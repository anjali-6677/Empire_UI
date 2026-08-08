/**
 * Purchase Order Details Page
 * Location: src/pages/procurement/PurchaseOrderDetailsPage.tsx
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import { POStatus } from '../../domain/types';
import { getPOStatusBadge } from '../../utils/statusStyles';
import {
  ArrowLeft,
  Layers,
  CheckCircle2,
  Printer,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const PurchaseOrderDetailsPage: React.FC = () => {
  const { poId } = useParams<{ poId: string }>();
  const { state, updatePOStatus } = useERPStore();

  const po = state.purchaseOrders.find((p) => p.id === poId || p.documentNumber === poId) || state.purchaseOrders[0];

  if (!po) {
    return (
      <div className="max-w-5xl mx-auto p-6 font-sans text-xs text-center space-y-4">
        <div className="text-slate-500">Purchase Order not found.</div>
        <Link to="/procurement/purchase-orders" className="text-amber-800 font-bold underline">
          Return to Purchase Orders
        </Link>
      </div>
    );
  }

  const handleApprovePO = () => {
    updatePOStatus(po.id, 'approved', 'Vikramaditya (Project Director)', 'Approved commercial PO terms.');
  };

  const handleIssuePO = () => {
    updatePOStatus(po.id, 'issued', 'Rajesh Sharma (Procurement Lead)', 'Issued PO to vendor via email dispatch.');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Link to="/procurement/purchase-orders" className="hover:text-slate-800 flex items-center gap-1 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Purchase Orders
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">{po.documentNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          {po.status === 'pending_approval' && (
            <Button variant="primary" onClick={handleApprovePO}>
              <ShieldCheck className="h-4 w-4 mr-1.5" /> Approve Purchase Order
            </Button>
          )}

          {po.status === 'approved' && (
            <Button variant="primary" onClick={handleIssuePO}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Issue PO to Vendor
            </Button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold flex items-center gap-1"
          >
            <Printer className="h-3.5 w-3.5" /> Print PO
          </button>
        </div>
      </div>

      {/* Header Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono text-slate-900">{po.documentNumber}</h1>
              {getPOStatusBadge(po.status as POStatus)}
            </div>
            <div className="text-slate-600 font-semibold mt-1 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-slate-400" /> Project: {po.projectName}
            </div>
          </div>

          <div className="text-right sm:text-right font-mono text-slate-600">
            <div>Order Date: <strong className="text-slate-900">{po.orderDate}</strong></div>
            <div>Delivery Due: <strong className="text-amber-800">{po.deliveryDueDate}</strong></div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-slate-700">
          <div>
            <div className="text-slate-500 font-semibold">Selected Vendor</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{po.vendorName}</div>
          </div>

          <div>
            <div className="text-slate-500 font-semibold">Source RFQ</div>
            <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{po.rfqDocumentNumber || 'RFQ-2026-001'}</div>
          </div>

          <div>
            <div className="text-slate-500 font-semibold">Source Material Indent</div>
            <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{po.sourceIndentNumber || 'IND-2026-001'}</div>
          </div>

          <div>
            <div className="text-slate-500 font-semibold">Total Landed Amount</div>
            <div className="text-sm font-bold font-mono text-emerald-800 mt-0.5">
              ₹{po.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Justifications if present */}
      {po.nonL1Justification && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs space-y-1">
          <div className="font-bold text-amber-950 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-700" /> Non-L1 Vendor Award Justification
          </div>
          <div className="text-amber-900 font-medium">{po.nonL1Justification}</div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm">Purchase Order Line Items</h3>
        </div>

        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
            <tr>
              <th className="p-3">Item Description</th>
              <th className="p-3 text-right">Quantity</th>
              <th className="p-3 text-right">Basic Rate ₹</th>
              <th className="p-3 text-right">Disc %</th>
              <th className="p-3 text-right">GST %</th>
              <th className="p-3 text-right">Landed Rate per Unit</th>
              <th className="p-3 text-right">Line Total ₹</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {po.lines.map((line) => (
              <tr key={line.id} className="hover:bg-slate-50">
                <td className="p-3">
                  <div className="font-bold text-slate-900">{line.productName}</div>
                  <div className="text-[10px] font-mono text-slate-500">{line.productCode}</div>
                </td>
                <td className="p-3 text-right font-mono font-bold text-slate-900">
                  {line.quantity} {line.unitSymbol}
                </td>
                <td className="p-3 text-right font-mono text-slate-700">₹{line.unitPrice}</td>
                <td className="p-3 text-right font-mono text-slate-700">{line.discountPercentage || 0}%</td>
                <td className="p-3 text-right font-mono text-slate-700">{line.taxPercentage || 18}%</td>
                <td className="p-3 text-right font-mono font-bold text-slate-900">
                  ₹{(line.landedUnitRate || line.unitPrice || 0).toFixed(2)}
                </td>
                <td className="p-3 text-right font-mono font-bold text-emerald-800">
                  ₹{(line.lineTotal || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
