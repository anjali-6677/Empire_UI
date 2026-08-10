import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { MaterialEntryToken } from '../../domain/types';
import {
  ClipboardCheck,
  PackageCheck,
  X,
  Clock,
  Truck,
} from 'lucide-react';

export const MaterialReceivingCheckPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const { state, createMaterialReceivingCheck, isAwaitingReceiving } = useERPStore();
  const tokens = state.materialEntryTokens || [];
  const checks = state.materialReceivingChecks || [];
  const purchaseOrders = state.purchaseOrders || [];

  const [showCheckModal, setShowCheckModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<MaterialEntryToken | null>(null);

  // Form fields
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [receivedQty, setReceivedQty] = useState<number>(0);
  const [damagedQty, setDamagedQty] = useState<number>(0);
  const [excessQty, setExcessQty] = useState<number>(0);
  const [excessReason, setExcessReason] = useState<string>('');
  const [checkedBy, setCheckedBy] = useState<string>('Stores Officer');

  // Available tokens awaiting receiving check
  const availableTokens = tokens.filter((t) => isAwaitingReceiving(t));

  // Derived PO state
  const selectedPO = purchaseOrders.find((p) => p.id === selectedPoId);
  const poLineMatch = selectedPO?.lines?.[0]; // Default match or select first
  const poQty = Number(poLineMatch?.quantity || selectedPO?.totalAmount || 100);
  const shortQty = Math.max(0, poQty - receivedQty);
  const qcPendingQty = Math.max(0, receivedQty - damagedQty);

  const openCheckForm = (token: MaterialEntryToken) => {
    setSelectedToken(token);
    // Find matching open PO if available
    const openPO = purchaseOrders.find(
      (p) =>
        p.status === 'approved' ||
        p.deliveryStatus === 'not_received' ||
        p.deliveryStatus === 'partial'
    );
    if (openPO) {
      setSelectedPoId(openPO.id);
      setReceivedQty(Number(openPO.lines?.[0]?.quantity || 100));
    } else {
      setSelectedPoId('');
      setReceivedQty(100);
    }
    setDamagedQty(0);
    setExcessQty(0);
    setExcessReason('');
    setShowCheckModal(true);
  };

  const handleSaveReceivingCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken || !selectedPoId) {
      alert('Please select an open Purchase Order to link.');
      return;
    }

    const res = createMaterialReceivingCheck(
      {
        tokenId: selectedToken.id,
        tokenNumber: selectedToken.tokenNumber,
        poId: selectedPO?.id,
        poNumber: selectedPO?.documentNumber || 'PO-2026-001',
        vendorId: selectedPO?.vendorId,
        vendorName: selectedPO?.vendorName || 'Selected Vendor',
        projectId: selectedPO?.projectId,
        projectName: selectedPO?.projectName || 'Project Site',
        productId: selectedToken.productId || poLineMatch?.productId || 'prod-01',
        productName: selectedToken.materialName,
        unit: poLineMatch?.unit || 'sqft',
        poQty,
        receivedQty,
        damagedQty,
        shortQty,
        excessQty,
        excessReason,
        qcPendingQty,
      },
      checkedBy
    );

    if (res.success) {
      setShowCheckModal(false);
      setSelectedToken(null);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      const match = tokens.find((t) => t.tokenNumber === tokenParam || t.id === tokenParam);
      if (match && isAwaitingReceiving(match)) {
        openCheckForm(match);
      }
    }
  }, [tokenParam, tokens]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-[#C5A059]" />
            Initial Material Receiving Check
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stage 1 Receipt Verification: Link Gate Token to Purchase Order, record quantities, damages, and set status to QC Pending.
          </p>
        </div>
      </div>

      {/* Process Flow Alert Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3 text-purple-900 text-sm">
        <Clock className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold block">GRN Auto-Generation Rule Enforced:</span>
          Completing this Initial Receiving Check will mark the material as <span className="font-semibold text-purple-700">QC_PENDING</span>.
          No Goods Receipt Note (GRN) or usable stock will be generated at this stage until Quality Control inspection is completed.
        </div>
      </div>

      {/* Section 1: Gate Tokens Awaiting Receiving Check */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C5A059]" />
            Gate Entry Tokens Awaiting Initial Check ({availableTokens.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTokens.length === 0 ? (
            <div className="col-span-full py-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              No new Gate Entry Tokens pending receiving check.
            </div>
          ) : (
            availableTokens.map((tok) => (
              <div key={tok.id} className="border border-gray-200 hover:border-[#C5A059] rounded-xl p-4 space-y-3 transition-colors bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-900 text-sm px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md">
                    {tok.tokenNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    Gate Entry Created
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{tok.materialName}</h4>
                  <p className="text-xs text-gray-500">Vehicle: <span className="font-mono font-medium text-gray-700">{tok.vehicleNumber}</span></p>
                  <p className="text-xs text-gray-500">Driver: {tok.driverName || 'N/A'}</p>
                </div>
                <button
                  onClick={() => openCheckForm(tok)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C5A059] hover:bg-[#b08d48] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <PackageCheck className="w-4 h-4" />
                  Perform Receiving Check
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 2: Completed Initial Receiving Checks Register */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-gray-700" />
            Completed Receiving Checks Register ({checks.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600">
              <tr>
                <th className="py-3.5 px-4">Token #</th>
                <th className="py-3.5 px-4">Linked Purchase Order</th>
                <th className="py-3.5 px-4">Material / Product</th>
                <th className="py-3.5 px-4 text-center">PO Qty</th>
                <th className="py-3.5 px-4 text-center">Received Qty</th>
                <th className="py-3.5 px-4 text-center">Damaged / Short</th>
                <th className="py-3.5 px-4 text-center">QC Pending Qty</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {checks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No initial receiving checks recorded yet.
                  </td>
                </tr>
              ) : (
                checks.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold font-mono text-gray-900">
                      {c.tokenNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div>{c.poNumber}</div>
                      <div className="text-xs font-normal text-gray-500">{c.vendorName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {c.productName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {c.poQty} {c.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-900">
                      {c.receivedQty} {c.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs">
                      {c.damagedQty > 0 && <span className="text-red-600 font-semibold block">{c.damagedQty} Damaged</span>}
                      {c.shortQty > 0 && <span className="text-amber-600 font-semibold block">{c.shortQty} Short</span>}
                      {c.damagedQty === 0 && c.shortQty === 0 && <span className="text-gray-400">0</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-purple-700 bg-purple-50/50">
                      {c.qcPendingQty} {c.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        QC_PENDING
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Perform Initial Receiving Check */}
      {showCheckModal && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-[#C5A059]" />
                  Initial Receipt Verification - Token #{selectedToken.tokenNumber}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Vehicle: {selectedToken.vehicleNumber} | Material: {selectedToken.materialName}</p>
              </div>
              <button onClick={() => setShowCheckModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReceivingCheck} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Link to Open Purchase Order <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedPoId}
                  onChange={(e) => setSelectedPoId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none bg-white font-medium"
                >
                  <option value="">-- Select Open Purchase Order --</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.documentNumber} - {po.vendorName} ({po.projectName || 'Project Site'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPO && (
                <div className="bg-gray-50 p-3.5 rounded-lg text-xs space-y-1 border border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>PO Vendor: <strong className="text-gray-900">{selectedPO.vendorName}</strong></span>
                    <span>Project: <strong className="text-gray-900">{selectedPO.projectName}</strong></span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ordered Quantity: <strong className="text-gray-900 font-mono text-sm">{poQty} {poLineMatch?.unit || 'nos'}</strong></span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Physical Qty Received <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={receivedQty}
                    onChange={(e) => setReceivedQty(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Damaged Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={damagedQty}
                    onChange={(e) => setDamagedQty(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-red-600 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Calculated QC Pending
                  </label>
                  <input
                    type="number"
                    disabled
                    value={qcPendingQty}
                    className="w-full border border-purple-300 bg-purple-50 text-purple-900 font-mono font-black rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Shortage Quantity (Auto-calc)</label>
                  <input
                    type="number"
                    disabled
                    value={shortQty}
                    className="w-full border border-gray-200 bg-gray-100 text-gray-700 font-mono rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Excess Quantity (If any)</label>
                  <input
                    type="number"
                    min="0"
                    value={excessQty}
                    onChange={(e) => setExcessQty(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              {excessQty > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Excess Quantity Reason</label>
                  <input
                    type="text"
                    placeholder="Vendor sent extra buffer sheets..."
                    value={excessReason}
                    onChange={(e) => setExcessReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Inspected By Storekeeper</label>
                <input
                  type="text"
                  value={checkedBy}
                  onChange={(e) => setCheckedBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCheckModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d48] text-white text-sm font-medium rounded-lg shadow-sm"
                >
                  Save & Mark QC Pending
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MaterialReceivingCheckPage;
