import React, { useState, useEffect } from 'react';
import { PurchaseOrder, PODeliveryRecord } from '../../../domain/types';
import { useERPStore } from '../../../store/ERPStoreContext';
import {
  getCanonicalPODeliverySummary,
  getDeliveryItemDisplayName,
} from '../../../utils/poDelivery';
import { Truck, History, Calendar, CheckCircle2, ChevronRight, ArrowLeft, Plus, X } from 'lucide-react';

interface PODeliveryModalProps {
  po: PurchaseOrder;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'record' | 'history';
}

export const PODeliveryModal: React.FC<PODeliveryModalProps> = ({
  po,
  isOpen,
  onClose,
  initialTab = 'record',
}) => {
  const { addPODelivery } = useERPStore();
  const [activeTab, setActiveTab] = useState<'record' | 'history'>(initialTab);
  const [selectedDelivery, setSelectedDelivery] = useState<PODeliveryRecord | null>(null);

  // Form State
  const [deliveryDate, setDeliveryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync activeTab when initialTab changes on modal open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedDelivery(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const summary = getCanonicalPODeliverySummary(po);
  const deliveryRecords = summary.deliveries;

  const handleQtyChange = (lineKey: string, val: string, maxQty: number) => {
    if (val === '') {
      setReceivedQtyMap((prev) => ({ ...prev, [lineKey]: 0 }));
      if (error) setError(null);
      return;
    }

    const parsed = parseFloat(val);
    if (isNaN(parsed)) {
      setError('Please enter a valid number.');
      return;
    }

    if (parsed < 0) {
      setError('Received quantity cannot be negative.');
      return;
    }

    if (parsed > maxQty) {
      setError(`Received quantity cannot exceed remaining quantity of ${maxQty}.`);
      return;
    }

    setError(null);
    setReceivedQtyMap((prev) => ({ ...prev, [lineKey]: parsed }));
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!invoiceNumber.trim()) {
      setError('Invoice number or delivery note is required.');
      return;
    }

    // Check for negative or over-limit inputs before processing
    for (const itemSummary of summary.linesSummary) {
      const inputVal = receivedQtyMap[itemSummary.lineKey] || 0;
      if (inputVal > itemSummary.remainingQty) {
        setError(`Received quantity for "${itemSummary.description}" exceeds remaining quantity of ${itemSummary.remainingQty} ${itemSummary.unit}.`);
        return;
      }
    }

    const items = Object.entries(receivedQtyMap)
      .filter(([_, qty]) => qty > 0)
      .map(([poLineId, qtyReceived]) => {
        const itemSummary = summary.linesSummary.find((s) => s.lineKey === poLineId);
        return {
          poLineId,
          productId: itemSummary?.poItemId || '',
          boqLineId: itemSummary?.boqLineId || '',
          description: itemSummary?.description || 'Material Item',
          unit: itemSummary?.unit || 'sqft',
          qtyReceived,
          receivedNowQty: qtyReceived,
        };
      });

    if (items.length === 0) {
      setError('At least one item must have Received Now quantity > 0.');
      return;
    }

    setIsSubmitting(true);

    const timestamp = Date.now();
    const newDelivery: PODeliveryRecord = {
      id: `del-${timestamp}`,
      deliveryId: `DEL-${timestamp.toString().slice(-5)}`,
      poId: po.id,
      deliveryDate,
      invoiceNumber: invoiceNumber.trim(),
      notes: notes.trim(),
      recordedBy: 'Sunil Mehta (Procurement Lead)',
      recordedAt: new Date().toISOString(),
      status: 'partial',
      items,
    };

    const res = addPODelivery(po.id, newDelivery);
    setIsSubmitting(false);

    if (res && res.error) {
      setError(res.error);
      return;
    }

    // Reset Form & Switch to History view showing the new record
    setInvoiceNumber('');
    setNotes('');
    setReceivedQtyMap({});
    setError(null);
    setSelectedDelivery(newDelivery);
    setActiveTab('history');
  };

  const displayPONumber = po.documentNumber || po.poNumber || po.id;

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
                Vendor: {po.vendorName} | Delivery Status:{' '}
                <span className="uppercase font-bold text-slate-900">
                  {summary.deliveryStatus.replace('_', ' ')}
                </span>
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
            {summary.totalRemaining > 0 && (
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
            )}
            <button
              onClick={() => { setActiveTab('history'); setError(null); }}
              className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-[#AB9570] text-[#AB9570]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="h-3.5 w-3.5" /> Delivery History ({summary.deliveryCount})
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
                  <span className="font-bold text-slate-900">
                    Delivery ID: {selectedDelivery.deliveryId || selectedDelivery.id}
                  </span>
                  <span className="font-mono text-slate-500">{selectedDelivery.deliveryDate}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div><strong>PO Number:</strong> {displayPONumber}</div>
                  <div><strong>Invoice / Challan:</strong> {selectedDelivery.invoiceNumber}</div>
                  <div><strong>Recorded By:</strong> {selectedDelivery.recordedBy || 'Sunil Mehta (Procurement Lead)'}</div>
                  {selectedDelivery.recordedAt && <div><strong>Recorded At:</strong> {new Date(selectedDelivery.recordedAt).toLocaleString()}</div>}
                  {selectedDelivery.notes && <div><strong>Notes:</strong> {selectedDelivery.notes}</div>}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Received Line Items</h4>
                <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-2">Product / Material</th>
                      <th className="p-2 text-center">Unit</th>
                      <th className="p-2 text-right">Qty Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedDelivery.items.map((item: any, idx: number) => {
                      const productName = getDeliveryItemDisplayName(item, po);
                      const qty = Number(item.qtyReceived ?? item.receivedNowQty ?? item.quantity ?? 0);
                      const unit = item.unit || 'sqft';

                      return (
                        <tr key={idx}>
                          <td className="p-2 text-slate-900 font-medium">{productName}</td>
                          <td className="p-2 text-center font-mono text-slate-500">{unit}</td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-800">
                            +{qty} {unit}
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
                      {summary.linesSummary.map((itemSummary) => {
                        const inputVal = receivedQtyMap[itemSummary.lineKey] !== undefined && receivedQtyMap[itemSummary.lineKey] !== 0 ? receivedQtyMap[itemSummary.lineKey] : '';

                        return (
                          <tr key={itemSummary.lineKey} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <div className="font-bold text-slate-900">{itemSummary.description}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{itemSummary.unit}</div>
                            </td>
                            <td className="p-2.5 text-center font-mono">{itemSummary.orderedQty}</td>
                            <td className="p-2.5 text-center font-mono text-slate-600">{itemSummary.receivedQty}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-amber-800">{itemSummary.remainingQty}</td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                min={0}
                                max={itemSummary.remainingQty}
                                value={inputVal}
                                onChange={(e) => handleQtyChange(itemSummary.lineKey, e.target.value, itemSummary.remainingQty)}
                                disabled={itemSummary.remainingQty === 0 || isSubmitting}
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
                  disabled={Boolean(error) || isSubmitting}
                  className="px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                  {isSubmitting ? 'Recording...' : 'Record Delivery'}
                </button>
              </div>
            </form>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {deliveryRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-medium">
                  No delivery records found for this Purchase Order.
                </div>
              ) : (
                deliveryRecords.map((del) => (
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
                          Invoice / Challan: {del.invoiceNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Recorded by {del.recordedBy || 'Sunil Mehta'} • {del.items?.length || 0} item(s) received
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

