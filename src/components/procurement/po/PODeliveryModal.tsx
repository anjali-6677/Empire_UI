import React, { useState } from 'react';
import { PurchaseOrder, PODeliveryRecord } from '../../../domain/types';
import { getPODeliverySummary } from '../../../domain/selectors';
import { useERPStore } from '../../../store/ERPStoreContext';
import { Truck, History, Calendar, CheckCircle2, ChevronRight, ArrowLeft, Plus, X } from 'lucide-react';

interface PODeliveryModalProps {
  po: PurchaseOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const PODeliveryModal: React.FC<PODeliveryModalProps> = ({ po, isOpen, onClose }) => {
  const { addPODelivery } = useERPStore();
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [selectedDelivery, setSelectedDelivery] = useState<PODeliveryRecord | null>(null);

  // Form State
  const [deliveryDate, setDeliveryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const summary = getPODeliverySummary(po);
  const lines = po.lines || [];

  const handleQtyChange = (lineId: string, val: string, maxQty: number) => {
    const parsed = parseFloat(val);
    const qty = isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, maxQty));
    setReceivedQtyMap((prev) => ({ ...prev, [lineId]: qty }));
    if (error) setError(null);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceNumber.trim()) {
      setError('Invoice number or delivery note is required.');
      return;
    }

    const items = Object.entries(receivedQtyMap)
      .filter(([_, qty]) => qty > 0)
      .map(([poLineId, qtyReceived]) => {
        const line = lines.find((l) => l.id === poLineId);
        return {
          poLineId,
          productId: line?.productId || '',
          qtyReceived,
        };
      });

    if (items.length === 0) {
      setError('At least one item must have Received Now quantity > 0.');
      return;
    }

    const newDelivery: PODeliveryRecord = {
      id: `del-rec-${Date.now()}`,
      deliveryId: `DEL-${Date.now().toString().slice(-5)}`,
      poId: po.id,
      deliveryDate,
      invoiceNumber: invoiceNumber.trim(),
      notes: notes.trim(),
      recordedBy: 'Sunil Mehta (Procurement Lead)',
      recordedAt: new Date().toISOString(),
      status: 'partial',
      items,
    };

    addPODelivery(po.id, newDelivery);

    // Reset Form & Switch to History view showing the new record
    setInvoiceNumber('');
    setNotes('');
    setReceivedQtyMap({});
    setError(null);
    setSelectedDelivery(newDelivery);
    setActiveTab('history');
  };

  const displayPONumber = po.documentNumber || po.poNumber || po.id;
  const deliveryRecords = po.deliveries || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {displayPONumber} Delivery Management
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Vendor: {po.vendorName} | Delivery Status: <span className="uppercase font-bold text-slate-900">{summary.deliveryStatus.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {!selectedDelivery && (
          <div className="flex border-b border-slate-100 bg-slate-50/50 px-4 pt-2 gap-4 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('record'); setError(null); }}
              className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'record'
                  ? 'border-[#AB9570] text-[#AB9570]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> Record Delivery
            </button>
            <button
              onClick={() => { setActiveTab('history'); setError(null); }}
              className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-[#AB9570] text-[#AB9570]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="h-3.5 w-3.5" /> Delivery History ({deliveryRecords.length})
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {selectedDelivery ? (
            /* Selected Delivery Record Detail View */
            <div className="space-y-4 animate-in fade-in duration-150">
              <button
                onClick={() => setSelectedDelivery(null)}
                className="inline-flex items-center gap-1 text-xs text-[#AB9570] font-bold hover:underline cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to History List
              </button>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Delivery ID: {selectedDelivery.deliveryId}</span>
                  <span className="font-mono text-slate-500">{selectedDelivery.deliveryDate}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div><strong>Invoice / Note:</strong> {selectedDelivery.invoiceNumber}</div>
                  <div><strong>Recorded By:</strong> {selectedDelivery.recordedBy}</div>
                  {selectedDelivery.notes && <div><strong>Notes:</strong> {selectedDelivery.notes}</div>}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Received Items</h4>
                <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-2">Material / Product</th>
                      <th className="p-2 text-right">Qty Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedDelivery.items.map((item, idx) => {
                      const line = lines.find((l) => l.id === item.poLineId);
                      return (
                        <tr key={idx}>
                          <td className="p-2 text-slate-900">{line?.productName || 'Material Item'}</td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-800">
                            +{item.qtyReceived} {line?.unitSymbol || 'sqft'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'record' ? (
            /* Record Delivery Tab Form */
            <form onSubmit={handleRecordSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Delivery Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#AB9570] text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Invoice / Challan No. <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => {
                      setInvoiceNumber(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. INV-2026-99"
                    className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#AB9570] text-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gate pass number or inspection notes..."
                  className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#AB9570] text-slate-900 font-medium"
                />
              </div>

              {/* Items Delivery Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Line Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-2.5">Product</th>
                        <th className="p-2.5 text-center">Ordered</th>
                        <th className="p-2.5 text-center">Received</th>
                        <th className="p-2.5 text-center">Remaining</th>
                        <th className="p-2.5 text-right w-28">Received Now</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {lines.map((line, idx) => {
                        const lineKey = line.id || `line-${idx}`;
                        const ordered = summary.orderedQtyByLine[lineKey] || 0;
                        const received = summary.receivedQtyByLine[lineKey] || 0;
                        const remaining = summary.remainingQtyByLine[lineKey] || 0;
                        const inputVal = receivedQtyMap[lineKey] ?? '';

                        return (
                          <tr key={lineKey} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <div className="font-bold text-slate-900">{line.productName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{line.unitSymbol}</div>
                            </td>
                            <td className="p-2.5 text-center font-mono">{ordered}</td>
                            <td className="p-2.5 text-center font-mono text-slate-600">{received}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-amber-800">{remaining}</td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                min={0}
                                max={remaining}
                                value={inputVal}
                                onChange={(e) => handleQtyChange(lineKey, e.target.value, remaining)}
                                disabled={remaining === 0}
                                placeholder="0"
                                className="w-20 p-1.5 text-xs border border-slate-300 rounded-lg text-center font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#AB9570] disabled:bg-slate-100 disabled:opacity-50"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5]" /> Record Delivery
                </button>
              </div>
            </form>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {(!po.deliveries || po.deliveries.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs font-medium">
                  No delivery records found for this Purchase Order.
                </div>
              ) : (
                po.deliveries.map((del) => (
                  <div
                    key={del.id}
                    onClick={() => setSelectedDelivery(del)}
                    className="p-3.5 bg-white border border-slate-200 hover:border-[#AB9570] rounded-xl transition cursor-pointer flex items-center justify-between shadow-2xs group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Delivery on {del.deliveryDate}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Invoice: {del.invoiceNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Recorded by {del.recordedBy} • {del.items.length} items received
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#AB9570] transition" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
