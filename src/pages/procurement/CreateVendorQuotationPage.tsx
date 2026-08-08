/**
 * Log Vendor Quotation Entry Screen
 * Location: src/pages/procurement/CreateVendorQuotationPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import { VendorQuotation, VendorQuotationLine } from '../../domain/types';
import { ArrowLeft, Save, AlertTriangle, FileText, ShieldAlert } from 'lucide-react';

export const CreateVendorQuotationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, submitVendorQuotation } = useERPStore();

  const initialRFQId = searchParams.get('rfqId') || state.rfqs[0]?.id || 'rfq-001';
  const initialVendorId = searchParams.get('vendorId') || '';

  const [selectedRFQId, setSelectedRFQId] = useState<string>(initialRFQId);
  const currentRFQ = state.rfqs.find((r) => r.id === selectedRFQId) || state.rfqs[0];

  const invitedVendors = state.vendors.filter((v) => currentRFQ?.invitedVendorIds?.includes(v.id));
  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    initialVendorId && currentRFQ?.invitedVendorIds?.includes(initialVendorId)
      ? initialVendorId
      : invitedVendors[0]?.id || state.vendors[0]?.id || 'v-001'
  );

  const currentVendor = state.vendors.find((v) => v.id === selectedVendorId);

  const [deliveryDays, setDeliveryDays] = useState<number>(7);
  const [paymentTerms, setPaymentTerms] = useState<string>(
    currentVendor?.paymentTermsDays ? `${currentVendor.paymentTermsDays} Days Credit after GRN` : '30 Days Credit after GRN'
  );
  const [validUntil, setValidUntil] = useState<string>('2026-08-31');

  // Rates line state
  const [lineRates, setLineRates] = useState<
    Record<string, { basicRate: number; discountPercentage: number; taxPercentage: number; freightAmount: number; otherCharges: number }>
  >({});

  useEffect(() => {
    if (currentRFQ) {
      const initialMap: Record<string, any> = {};
      currentRFQ.lines.forEach((line) => {
        initialMap[line.id] = {
          basicRate: 120,
          discountPercentage: 0,
          taxPercentage: 18,
          freightAmount: 500,
          otherCharges: 0,
        };
      });
      setLineRates(initialMap);
    }
  }, [selectedRFQId]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Workflow Guard Check: Uninvited vendor rejection
  const isVendorInvited = currentRFQ?.invitedVendorIds?.includes(selectedVendorId);

  const calculateLineLanded = (lineQty: number, rates: { basicRate: number; discountPercentage: number; taxPercentage: number; freightAmount: number; otherCharges: number }) => {
    const discountedRate = rates.basicRate * (1 - rates.discountPercentage / 100);
    const taxPerUnit = discountedRate * (rates.taxPercentage / 100);
    const freightPerUnit = lineQty > 0 ? rates.freightAmount / lineQty : 0;
    const otherPerUnit = lineQty > 0 ? rates.otherCharges / lineQty : 0;

    const landedRatePerUnit = discountedRate + taxPerUnit + freightPerUnit + otherPerUnit;
    const quotedLineTotal = landedRatePerUnit * lineQty;

    return { landedRatePerUnit, quotedLineTotal };
  };

  const handleSubmitQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentRFQ) {
      setErrorMsg('Target RFQ is required.');
      return;
    }

    if (!isVendorInvited) {
      setErrorMsg('Domain Guard Rejected: Vendor is not in the invited vendor list for this RFQ.');
      return;
    }

    const quotationLines: VendorQuotationLine[] = currentRFQ.lines.map((l) => {
      const rates = lineRates[l.id] || { basicRate: 0, discountPercentage: 0, taxPercentage: 18, freightAmount: 0, otherCharges: 0 };
      const calc = calculateLineLanded(l.quantity, rates);
      return {
        rfqLineId: l.id,
        productId: l.productId,
        basicRate: rates.basicRate,
        discountPercentage: rates.discountPercentage,
        taxPercentage: rates.taxPercentage,
        freightAmount: rates.freightAmount,
        otherCharges: rates.otherCharges,
        landedRatePerUnit: calc.landedRatePerUnit,
        quotedLineTotal: calc.quotedLineTotal,
      };
    });

    const totalQuotedLandedAmount = quotationLines.reduce((acc, l) => acc + l.quotedLineTotal, 0);

    const documentNumber = `VQ-2026-${String((state.vendorQuotations || []).length + 1).padStart(3, '0')}`;

    const newQuotation: VendorQuotation = {
      id: `vq-${Date.now()}`,
      documentNumber,
      rfqId: currentRFQ.id,
      vendorId: currentVendor?.id || 'v-001',
      vendorName: currentVendor?.name || 'Supplier',
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil,
      deliveryDays,
      paymentTerms,
      lines: quotationLines,
      totalQuotedLandedAmount,
      vendorRating: currentVendor?.rating || '4.5/5',
      status: 'submitted',
    };

    const res = submitVendorQuotation(newQuotation, 'Rajesh Sharma (Procurement Lead)');
    if (res.success && res.quotation) {
      navigate(`/procurement/rate-comparison/${currentRFQ.id}`);
    } else {
      setErrorMsg(res.error || 'Failed to record vendor quotation.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Link to="/procurement/vendor-quotations" className="hover:text-slate-800 flex items-center gap-1 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Vendor Quotations Inbox
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">Log Supplier Quotation</span>
        </div>
      </div>

      <form onSubmit={handleSubmitQuotation} className="space-y-6">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* Uninvited Vendor Guard Alert */}
        {!isVendorInvited && (
          <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 text-rose-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" /> Uninvited Supplier Bidding Guard Violation
            </div>
            <p className="text-[11.5px] text-rose-800">
              The selected vendor is NOT in the invited vendor list for RFQ <strong className="font-mono">{currentRFQ?.documentNumber}</strong>. Domain policy restricts bids exclusively to invited suppliers.
            </p>
          </div>
        )}

        {/* Target RFQ & Supplier Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
          <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-700" /> Target RFQ & Bidding Supplier
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Issued RFQ *</label>
              <select
                value={selectedRFQId}
                onChange={(e) => setSelectedRFQId(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-400"
              >
                {state.rfqs.map((rfq) => (
                  <option key={rfq.id} value={rfq.id}>
                    {rfq.documentNumber} - {rfq.projectName} ({rfq.lines.length} items)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Bidding Supplier *</label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className={`w-full border rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-400 ${
                  !isVendorInvited ? 'border-rose-400 bg-rose-50 text-rose-900' : 'border-slate-300'
                }`}
              >
                {state.vendors.map((v) => {
                  const isInvited = currentRFQ?.invitedVendorIds?.includes(v.id);
                  return (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.code}) {isInvited ? '✓ [Invited]' : '⚠️ [UNINVITED]'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Commercial Terms & Validity */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
          <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Supplier Commercial Terms
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Delivery Lead Time (Days) *</label>
              <input
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold"
                min={1}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quoted Payment Terms *</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Rate Validity Date *</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Itemised Landed Rate Entry Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm">
          <div className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
            Itemised Supplier Rates & Landed Unit Cost Breakdown
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 rounded">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5">Product Description</th>
                  <th className="p-2.5 text-right w-20">Qty</th>
                  <th className="p-2.5 text-right w-24">Basic Rate ₹</th>
                  <th className="p-2.5 text-right w-20">Disc %</th>
                  <th className="p-2.5 text-right w-20">GST %</th>
                  <th className="p-2.5 text-right w-24">Freight ₹</th>
                  <th className="p-2.5 text-right w-28">Landed Unit Rate</th>
                  <th className="p-2.5 text-right w-28">Quoted Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {currentRFQ?.lines.map((line) => {
                  const rates = lineRates[line.id] || { basicRate: 0, discountPercentage: 0, taxPercentage: 18, freightAmount: 0, otherCharges: 0 };
                  const calc = calculateLineLanded(line.quantity, rates);

                  return (
                    <tr key={line.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{line.productName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{line.productCode}</div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {line.quantity} {line.unitSymbol}
                      </td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          value={rates.basicRate}
                          onChange={(e) =>
                            setLineRates({
                              ...lineRates,
                              [line.id]: { ...rates, basicRate: parseFloat(e.target.value) || 0 },
                            })
                          }
                          className="w-full text-right border border-slate-300 rounded p-1 text-xs font-mono font-bold"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          value={rates.discountPercentage}
                          onChange={(e) =>
                            setLineRates({
                              ...lineRates,
                              [line.id]: { ...rates, discountPercentage: parseFloat(e.target.value) || 0 },
                            })
                          }
                          className="w-full text-right border border-slate-300 rounded p-1 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          value={rates.taxPercentage}
                          onChange={(e) =>
                            setLineRates({
                              ...lineRates,
                              [line.id]: { ...rates, taxPercentage: parseFloat(e.target.value) || 0 },
                            })
                          }
                          className="w-full text-right border border-slate-300 rounded p-1 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          value={rates.freightAmount}
                          onChange={(e) =>
                            setLineRates({
                              ...lineRates,
                              [line.id]: { ...rates, freightAmount: parseFloat(e.target.value) || 0 },
                            })
                          }
                          className="w-full text-right border border-slate-300 rounded p-1 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        ₹{calc.landedRatePerUnit.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-800">
                        ₹{calc.quotedLineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Link
            to="/procurement/vendor-quotations"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <Button variant="primary" type="submit" disabled={!isVendorInvited}>
            <Save className="h-4 w-4 mr-1.5" /> Submit Vendor Quotation Record
          </Button>
        </div>
      </form>
    </div>
  );
};
