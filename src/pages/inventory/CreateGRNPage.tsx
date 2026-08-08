/**
 * Create Goods Received Note (GRN) Page
 * Location: src/pages/inventory/CreateGRNPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import { GoodsReceivedNote, QualityInspectionStatus } from '../../domain/types';
import { getPORemainingLineQty } from '../../domain/selectors';
import {
  Boxes,
  ArrowLeft,
  AlertTriangle,
  Truck,
  ShieldCheck,
} from 'lucide-react';

interface GRNFormLine {
  poLineId: string;
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  orderedQty: number;
  previouslyReceivedQty: number;
  pendingPOQty: number;
  currentReceivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  unitRate: number;
  rejectionReason: string;
  batchNumber: string;
}

export const CreateGRNPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPoId = searchParams.get('poId');

  const { state, createGRN } = useERPStore();

  const purchaseOrders = (state.purchaseOrders || []).filter(
    (p) => (p.status as string) === 'issued' || (p.status as string) === 'partially_delivered' || (p.status as string) === 'approved'
  );
  const locations = (state as any).locations || [
    { id: 'loc-001', name: 'Central Site Store - Basement 1' },
    { id: 'loc-002', name: 'Secondary Store Yard' },
  ];

  const [selectedPoId, setSelectedPoId] = useState<string>(preselectedPoId || (purchaseOrders[0]?.id || ''));
  const [deliveryChallanNo, setDeliveryChallanNo] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [destinationLocationId, setDestinationLocationId] = useState<string>(locations[0]?.id || 'loc-001');
  const [receivedDate, setReceivedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receivedBy, setReceivedBy] = useState<string>('Ramesh Kumar (Storekeeper)');
  
  const [formLines, setFormLines] = useState<GRNFormLine[]>([]);
  const [qcStatus, setQcStatus] = useState<QualityInspectionStatus>('passed');
  const [qcInspectedBy, setQcInspectedBy] = useState<string>('Vikram Singh (Quality Manager)');
  const [qcNotes, setQcNotes] = useState<string>('Visual, dimensional and material grade inspection verified.');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPO = purchaseOrders.find((p) => p.id === selectedPoId);

  // Populate form lines whenever selected PO changes
  useEffect(() => {
    if (!selectedPO) {
      setFormLines([]);
      return;
    }

    const lines: GRNFormLine[] = selectedPO.lines.map((line) => {
      const remainingInfo = getPORemainingLineQty(selectedPO, line.id, state.grns || []);
      const pendingQty = remainingInfo.remainingQty;

      return {
        poLineId: line.id,
        productId: line.productId,
        productCode: line.productCode || line.productId,
        productName: line.productName,
        unitSymbol: line.unitSymbol || 'units',
        orderedQty: line.quantity,
        previouslyReceivedQty: remainingInfo.totalReceivedQty,
        pendingPOQty: pendingQty,
        currentReceivedQty: pendingQty,
        acceptedQty: pendingQty,
        rejectedQty: 0,
        unitRate: line.unitRate || 0,
        rejectionReason: '',
        batchNumber: `BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
      };
    });

    setFormLines(lines);
  }, [selectedPoId, selectedPO, state.grns]);

  const handleLineReceivedQtyChange = (index: number, val: number) => {
    const updated = [...formLines];
    const qty = Math.max(0, val);
    updated[index].currentReceivedQty = qty;
    // Default accepted qty to received qty unless modified
    updated[index].acceptedQty = Math.max(0, qty - updated[index].rejectedQty);
    setFormLines(updated);
  };

  const handleLineRejectedQtyChange = (index: number, val: number) => {
    const updated = [...formLines];
    const rejQty = Math.max(0, val);
    updated[index].rejectedQty = rejQty;
    updated[index].acceptedQty = Math.max(0, updated[index].currentReceivedQty - rejQty);
    setFormLines(updated);
  };

  const handleSubmitGRN = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPO) {
      setErrorMessage('Please select a valid issued Purchase Order.');
      return;
    }

    if (!deliveryChallanNo.trim()) {
      setErrorMessage('Delivery Challan Number is required.');
      return;
    }

    if (formLines.length === 0) {
      setErrorMessage('GRN must contain at least one valid line item.');
      return;
    }

    const totalReceived = formLines.reduce((sum, l) => sum + l.currentReceivedQty, 0);
    if (totalReceived <= 0) {
      setErrorMessage('At least one item must have a current received quantity greater than 0.');
      return;
    }

    const grnDocumentNumber = `GRN-${new Date().getFullYear()}-${String((state.grns?.length || 0) + 1).padStart(3, '0')}`;
    const selectedLoc = locations.find((l: any) => l.id === destinationLocationId);

    const newGRN: GoodsReceivedNote = {
      id: `grn-${Date.now()}`,
      documentNumber: grnDocumentNumber,
      purchaseOrderId: selectedPO.id,
      poNumber: selectedPO.documentNumber,
      vendorId: selectedPO.vendorId,
      vendorName: selectedPO.vendorName,
      projectId: selectedPO.projectId,
      projectName: selectedPO.projectName,
      deliveryChallanNo,
      vehicleNumber,
      destinationLocationId,
      destinationLocationName: selectedLoc?.name || 'Central Store',
      receivedDate,
      receivedBy,
      lines: formLines.map((l: GRNFormLine, idx: number) => ({
        id: `grn-line-${Date.now()}-${idx}`,
        poLineId: l.poLineId,
        productId: l.productId,
        productCode: l.productCode,
        productName: l.productName,
        unitSymbol: l.unitSymbol,
        orderedQty: l.orderedQty,
        previouslyReceivedQty: l.previouslyReceivedQty,
        pendingPOQty: l.pendingPOQty,
        currentReceivedQty: l.currentReceivedQty,
        acceptedQty: l.acceptedQty,
        rejectedQty: l.rejectedQty,
        underInspectionQty: 0,
        unitRate: l.unitRate,
        rejectionReason: l.rejectionReason,
        batchNumber: l.batchNumber,
      })),
      qualityInspection: {
        id: `qc-${Date.now()}`,
        grnId: `grn-${Date.now()}`,
        inspectedBy: qcInspectedBy,
        inspectionDate: receivedDate,
        testResult: qcStatus,
        qcStatus,
        acceptedReason: 'Passed material compliance standards',
        rejectedReason: qcStatus === 'failed' ? 'Failed quality standards' : undefined,
        inspectionNotes: qcNotes,
      },
      isPostedToStock: false,
      status: 'pending_inspection',
      createdAt: new Date().toISOString(),
      createdBy: receivedBy,
    };

    const res = createGRN(newGRN, receivedBy);
    if (res.success) {
      navigate(`/inventory/grns/${newGRN.id}`);
    } else {
      setErrorMessage(res.error || 'Failed to create Goods Received Note.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Back & Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/inventory/grns')}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to GRN List
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Boxes className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-100">Record Material Delivery (Create GRN)</h1>
            <p className="text-stone-400 text-xs mt-0.5">
              Receive physical materials against issued Purchase Orders and initiate quality inspection.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitGRN} className="space-y-6">
        {/* Section 1: PO & Delivery Metadata */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-2">
            <Truck className="w-4 h-4 text-amber-600" />
            Delivery & Purchase Order Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Select Issued Purchase Order *</label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {purchaseOrders.length === 0 ? (
                  <option value="">No issued POs available</option>
                ) : (
                  purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.documentNumber} - {po.vendorName} ({po.projectName})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Delivery Challan Number *</label>
              <input
                type="text"
                placeholder="e.g. DC-99420"
                value={deliveryChallanNo}
                onChange={(e) => setDeliveryChallanNo(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Vehicle Registration No.</label>
              <input
                type="text"
                placeholder="e.g. MH-04-EK-8821"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Destination Store / Yard *</label>
              <select
                value={destinationLocationId}
                onChange={(e) => setDestinationLocationId(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Received Date *</label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Received By *</label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Line Items Delivery Receipt */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-900 flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-600" />
              Line Items Delivery Verification
            </span>
            <span className="text-stone-500 font-normal text-xs">
              {formLines.length} item(s) from {selectedPO?.documentNumber || 'PO'}
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">PO Ordered</th>
                  <th className="py-2.5 px-3 text-right">Prev Received</th>
                  <th className="py-2.5 px-3 text-right">Pending PO</th>
                  <th className="py-2.5 px-3 text-right">Current Received *</th>
                  <th className="py-2.5 px-3 text-right">Accepted Qty</th>
                  <th className="py-2.5 px-3 text-right">Rejected Qty</th>
                  <th className="py-2.5 px-3">Batch # / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {formLines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400 font-medium">
                      Select an issued Purchase Order to populate line items.
                    </td>
                  </tr>
                ) : (
                  formLines.map((line, idx) => (
                    <tr key={line.poLineId} className="hover:bg-stone-50 text-stone-800">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-900">{line.productName}</div>
                        <div className="text-[10px] font-mono text-stone-500">{line.productCode}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-stone-600">
                        {line.orderedQty} {line.unitSymbol}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-stone-500">
                        {line.previouslyReceivedQty}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                        {line.pendingPOQty}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min={0}
                          max={line.pendingPOQty * 1.2}
                          value={line.currentReceivedQty}
                          onChange={(e) => handleLineReceivedQtyChange(idx, Number(e.target.value))}
                          className="w-24 p-1.5 bg-stone-50 border border-stone-300 rounded text-right font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min={0}
                          max={line.currentReceivedQty}
                          value={line.acceptedQty}
                          readOnly
                          className="w-20 p-1.5 bg-emerald-50 border border-emerald-300 rounded text-right font-bold text-emerald-900 outline-none"
                        />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min={0}
                          max={line.currentReceivedQty}
                          value={line.rejectedQty}
                          onChange={(e) => handleLineRejectedQtyChange(idx, Number(e.target.value))}
                          className="w-20 p-1.5 bg-rose-50 border border-rose-300 rounded text-right font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 outline-none"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="Batch # or damage note"
                          value={line.rejectionReason || line.batchNumber}
                          onChange={(e) => {
                            const updated = [...formLines];
                            updated[idx].rejectionReason = e.target.value;
                            setFormLines(updated);
                          }}
                          className="w-full p-1.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-800 outline-none"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Initial Quality Inspection */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Quality Inspection Certificate
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Quality Inspection Status *</label>
              <select
                value={qcStatus}
                onChange={(e) => setQcStatus(e.target.value as QualityInspectionStatus)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="passed">Passed (Accepted for Stock)</option>
                <option value="partial">Partial Pass (Accepted with Rejections)</option>
                <option value="failed">Failed (Complete Batch Rejection)</option>
                <option value="pending">Pending Further Test Lab Certificate</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Quality Inspector Name *</label>
              <input
                type="text"
                value={qcInspectedBy}
                onChange={(e) => setQcInspectedBy(e.target.value)}
                required
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-stone-700 font-semibold mb-1">Quality Inspection Remarks / Test Notes</label>
              <textarea
                rows={2}
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/inventory/grns')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-6 py-2"
          >
            Create & Save GRN
          </Button>
        </div>
      </form>
    </div>
  );
};
