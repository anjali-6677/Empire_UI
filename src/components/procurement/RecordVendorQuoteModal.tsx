/**
 * Record Vendor Quote Modal / Drawer
 * Location: src/components/procurement/RecordVendorQuoteModal.tsx
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { RFQ, Vendor, VendorQuotation, VendorQuotationLine } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';

export interface RecordVendorQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: RFQ;
  vendor: Vendor;
  existingQuotation?: VendorQuotation;
  onSaved?: () => void;
}

export const RecordVendorQuoteModal: React.FC<RecordVendorQuoteModalProps> = ({
  isOpen,
  onClose,
  rfq,
  vendor,
  existingQuotation,
  onSaved,
}) => {
  const { state, submitVendorQuotation } = useERPStore();

  const [vendorQuotationRef, setVendorQuotationRef] = useState<string>(
    existingQuotation?.documentNumber || `VQ-2026-${String((state.vendorQuotations || []).length + 1).padStart(3, '0')}`
  );
  const [quotationDate, setQuotationDate] = useState<string>(
    existingQuotation?.quotationDate || new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState<string>(
    existingQuotation?.validUntil || '2026-08-31'
  );
  const [deliveryDays, setDeliveryDays] = useState<number>(existingQuotation?.deliveryDays || 7);
  const [paymentTerms, setPaymentTerms] = useState<string>(
    existingQuotation?.paymentTerms || (vendor.paymentTermsDays ? `${vendor.paymentTermsDays} Days Credit after GRN` : '30 Days Credit after GRN')
  );

  // Summary charges
  const [advancePercent, setAdvancePercent] = useState<number>(0);
  const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
  const [packingCharges, setPackingCharges] = useState<number>(0);
  const [labourCharges, setLabourCharges] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [roundOff, setRoundOff] = useState<number>(0);

  // Line rates mapping
  const [lineRates, setLineRates] = useState<
    Record<string, { basicRate: number; discountPercentage: number; taxPercentage: number; freightAmount: number; remarks?: string }>
  >({});

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Domain guard: Check if vendor is invited to this RFQ
  const isVendorInvited = rfq.invitedVendorIds?.includes(vendor.id);

  useEffect(() => {
    if (rfq && rfq.lines) {
      const initialMap: Record<string, any> = {};
      rfq.lines.forEach((line) => {
        const existingLine = existingQuotation?.lines.find((l) => l.rfqLineId === line.id || l.productId === line.productId);
        initialMap[line.id] = {
          basicRate: existingLine?.basicRate || 120,
          discountPercentage: existingLine?.discountPercentage || 0,
          taxPercentage: existingLine?.taxPercentage || 18,
          freightAmount: existingLine?.freightAmount || 0,
          remarks: line.remarks || '',
        };
      });
      setLineRates(initialMap);
    }
  }, [rfq.id, existingQuotation]);

  if (!isOpen) return null;

  // Calculation per line according to authorative formula:
  // basicLineValue = quantity * basicRate
  // discountValue = basicLineValue * discountPercent / 100
  // taxableValue = basicLineValue - discountValue + allocatedFreight
  // taxValue = taxableValue * taxPercent / 100
  // landedLineValue = taxableValue + taxValue
  // landedUnitRate = landedLineValue / quantity
  const calculateLineDetails = (qty: number, rates: { basicRate: number; discountPercentage: number; taxPercentage: number; freightAmount: number }) => {
    const basicLineValue = qty * rates.basicRate;
    const discountValue = (basicLineValue * rates.discountPercentage) / 100;
    const taxableValue = basicLineValue - discountValue + rates.freightAmount;
    const taxValue = (taxableValue * rates.taxPercentage) / 100;
    const landedLineValue = taxableValue + taxValue;
    const landedUnitRate = qty > 0 ? landedLineValue / qty : 0;

    return { basicLineValue, discountValue, taxableValue, taxValue, landedLineValue, landedUnitRate };
  };

  // Subtotal & Landed Totals
  let calculatedBasicSubtotal = 0;
  let calculatedTaxSubtotal = 0;
  let calculatedLandedSubtotal = 0;

  rfq.lines.forEach((line) => {
    const rates = lineRates[line.id] || { basicRate: 0, discountPercentage: 0, taxPercentage: 18, freightAmount: 0 };
    const calc = calculateLineDetails(line.quantity, rates);
    calculatedBasicSubtotal += calc.basicLineValue;
    calculatedTaxSubtotal += calc.taxValue;
    calculatedLandedSubtotal += calc.landedLineValue;
  });

  const finalLandedTotal =
    calculatedLandedSubtotal + deliveryCharges + packingCharges + labourCharges + otherCharges + roundOff;

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isVendorInvited) {
      setErrorMsg(`Domain Guard Violation: ${vendor.name} is not in the invited vendor list for RFQ ${rfq.documentNumber}.`);
      return;
    }

    const quotationLines: VendorQuotationLine[] = rfq.lines.map((l) => {
      const rates = lineRates[l.id] || { basicRate: 0, discountPercentage: 0, taxPercentage: 18, freightAmount: 0 };
      const calc = calculateLineDetails(l.quantity, rates);
      return {
        rfqLineId: l.id,
        productId: l.productId,
        basicRate: rates.basicRate,
        discountPercentage: rates.discountPercentage,
        taxPercentage: rates.taxPercentage,
        freightAmount: rates.freightAmount,
        otherCharges: 0,
        landedRatePerUnit: calc.landedUnitRate,
        quotedLineTotal: calc.landedLineValue,
      };
    });

    const newQuotation: VendorQuotation = {
      id: existingQuotation?.id || `vq-${Date.now()}`,
      documentNumber: vendorQuotationRef,
      rfqId: rfq.id,
      vendorId: vendor.id,
      vendorName: vendor.name,
      quotationDate,
      validUntil,
      deliveryDays,
      paymentTerms,
      lines: quotationLines,
      totalQuotedLandedAmount: finalLandedTotal,
      vendorRating: vendor.rating || '4.5/5',
      status: 'submitted',
    };

    const res = submitVendorQuotation(newQuotation, 'Rajesh Sharma (Procurement Lead)');
    if (res.success) {
      if (onSaved) onSaved();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to submit quote.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-sans text-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-0.5">
              <span>RFQ: <strong className="font-mono text-slate-900">{rfq.documentNumber}</strong></span>
              <span>•</span>
              <span>Project: <strong className="text-slate-900">{rfq.projectName}</strong></span>
              <span>•</span>
              <span>Source Indent: <strong className="font-mono text-slate-900">{rfq.sourceIndentNumber || 'IND-2026-001'}</strong></span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-amber-700" /> Record Vendor Quote → {vendor.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitQuote} className="flex-1 overflow-y-auto p-4 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" /> {errorMsg}
            </div>
          )}

          {!isVendorInvited && (
            <div className="bg-rose-50 border border-rose-300 rounded-lg p-3 text-rose-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
              <span>Uninvited Supplier Guard: {vendor.name} is not in the invited supplier list for this RFQ.</span>
            </div>
          )}

          {/* Reference & Commercial Header */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quotation Ref # *</label>
              <input
                type="text"
                value={vendorQuotationRef}
                onChange={(e) => setVendorQuotationRef(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quote Date *</label>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Validity Date *</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lead Time (Days) *</label>
              <input
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-xs"
                min={1}
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Terms *</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-xs"
                required
              />
            </div>
          </div>

          {/* Main 2-column layout: Items on Left, Charges & Summary on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Items Table (2 Cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>RFQ Material Items & Quoted Landed Breakdown</span>
                <span className="text-[11px] font-normal text-slate-500">{rfq.lines.length} Line Items</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-right w-16">Qty</th>
                      <th className="p-2 text-right w-24">Basic Rate ₹</th>
                      <th className="p-2 text-right w-16">Disc %</th>
                      <th className="p-2 text-right w-16">GST %</th>
                      <th className="p-2 text-right w-20">Freight ₹</th>
                      <th className="p-2 text-right w-24">Landed Unit Rate</th>
                      <th className="p-2 text-right w-24">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {rfq.lines.map((line) => {
                      const rates = lineRates[line.id] || { basicRate: 0, discountPercentage: 0, taxPercentage: 18, freightAmount: 0 };
                      const calc = calculateLineDetails(line.quantity, rates);

                      return (
                        <tr key={line.id} className="hover:bg-slate-50">
                          <td className="p-2">
                            <div className="font-bold text-slate-900">{line.productName}</div>
                            <div className="text-[10px] font-mono text-slate-500">{line.productCode}</div>
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">
                            {line.quantity} {line.unitSymbol}
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={rates.basicRate}
                              onChange={(e) =>
                                setLineRates({
                                  ...lineRates,
                                  [line.id]: { ...rates, basicRate: parseFloat(e.target.value) || 0 },
                                })
                              }
                              className="w-full text-right border border-slate-300 rounded p-1 font-mono font-bold text-xs"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={rates.discountPercentage}
                              onChange={(e) =>
                                setLineRates({
                                  ...lineRates,
                                  [line.id]: { ...rates, discountPercentage: parseFloat(e.target.value) || 0 },
                                })
                              }
                              className="w-full text-right border border-slate-300 rounded p-1 font-mono text-xs"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={rates.taxPercentage}
                              onChange={(e) =>
                                setLineRates({
                                  ...lineRates,
                                  [line.id]: { ...rates, taxPercentage: parseFloat(e.target.value) || 0 },
                                })
                              }
                              className="w-full text-right border border-slate-300 rounded p-1 font-mono text-xs"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={rates.freightAmount}
                              onChange={(e) =>
                                setLineRates({
                                  ...lineRates,
                                  [line.id]: { ...rates, freightAmount: parseFloat(e.target.value) || 0 },
                                })
                              }
                              className="w-full text-right border border-slate-300 rounded p-1 font-mono text-xs"
                            />
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">
                            ₹{calc.landedUnitRate.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-800">
                            ₹{calc.landedLineValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Summary Section (1 Col) */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5">
                Commercial Summary & Additional Charges
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Basic Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">₹{calculatedBasicSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>GST Tax Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">₹{calculatedTaxSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-slate-200 pt-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px]">Advance Payment %:</label>
                    <input
                      type="number"
                      value={advancePercent}
                      onChange={(e) => setAdvancePercent(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right border border-slate-300 rounded p-1 font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px]">Delivery Charges ₹:</label>
                    <input
                      type="number"
                      value={deliveryCharges}
                      onChange={(e) => setDeliveryCharges(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right border border-slate-300 rounded p-1 font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px]">Packing Charges ₹:</label>
                    <input
                      type="number"
                      value={packingCharges}
                      onChange={(e) => setPackingCharges(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right border border-slate-300 rounded p-1 font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px]">Labour / Offloading ₹:</label>
                    <input
                      type="number"
                      value={labourCharges}
                      onChange={(e) => setLabourCharges(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right border border-slate-300 rounded p-1 font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px]">Other Charges ₹:</label>
                    <input
                      type="number"
                      value={otherCharges}
                      onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right border border-slate-300 rounded p-1 font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px]">Round Off Adjustment ₹:</label>
                    <input
                      type="number"
                      value={roundOff}
                      onChange={(e) => setRoundOff(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right border border-slate-300 rounded p-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mt-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-amber-950 text-xs">Final Quoted Landed Total</div>
                    <div className="text-[10px] text-amber-800">All inclusive of taxes & freight</div>
                  </div>
                  <div className="text-base font-bold font-mono text-amber-950">
                    ₹{finalLandedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs"
              >
                <Save className="h-3.5 w-3.5 inline mr-1" /> Save Draft
              </button>

              <Button variant="primary" type="submit" disabled={!isVendorInvited}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Submit Quote
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
