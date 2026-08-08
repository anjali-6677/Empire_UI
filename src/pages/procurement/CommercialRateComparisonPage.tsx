/**
 * Commercial Rate Comparison Matrix Page
 * Location: src/pages/procurement/CommercialRateComparisonPage.tsx
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import { getRFQStatusBadge } from '../../utils/statusStyles';
import { RFQStatus } from '../../domain/types';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const CommercialRateComparisonPage: React.FC = () => {
  const { rfqId } = useParams<{ rfqId?: string }>();
  const navigate = useNavigate();
  const { state, awardRateComparison } = useERPStore();

  const rfqList = state.rfqs || [];
  const initialRFQ = rfqId ? rfqList.find((r) => r.id === rfqId || r.documentNumber === rfqId) : rfqList[0];

  const [selectedRFQId, setSelectedRFQId] = useState<string>(initialRFQ?.id || rfqList[0]?.id || 'rfq-001');
  const currentRFQ = rfqList.find((r) => r.id === selectedRFQId) || rfqList[0];

  const quotations = (state.vendorQuotations || []).filter((q) => q.rfqId === currentRFQ?.id);

  const existingComparison = (state.rateComparisons || []).find((c) => c.rfqId === currentRFQ?.id);

  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    existingComparison?.selectedVendorId || quotations[0]?.vendorId || ''
  );
  const [selectionRemarks, setSelectionRemarks] = useState<string>(
    existingComparison?.selectionRemarks || 'Awarded to L1 bidder based on lowest overall landed rate and compliance with delivery timelines.'
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentRFQ) {
    return (
      <div className="max-w-5xl mx-auto p-6 font-sans text-xs text-center space-y-4">
        <div className="text-slate-500">No RFQ available for commercial comparison.</div>
        <Link to="/procurement/rfqs" className="text-amber-800 font-bold underline">
          Go to RFQs List
        </Link>
      </div>
    );
  }

  // Calculate L1 (Lowest Landed Total)
  const sortedQuotations = [...quotations].sort((a, b) => a.totalQuotedLandedAmount - b.totalQuotedLandedAmount);
  const l1Quotation = sortedQuotations[0];

  const handleAwardTender = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedVendorId) {
      setErrorMsg('Please select a vendor to award the tender.');
      return;
    }

    if (!selectionRemarks || selectionRemarks.trim().length < 5) {
      setErrorMsg('Selection remarks (at least 5 characters) are mandatory.');
      return;
    }

    const comparisonId = existingComparison?.id || `comp-${Date.now()}`;

    // If new comparison, add item first
    if (!existingComparison) {
      state.rateComparisons.push({
        id: comparisonId,
        documentNumber: `CS-2026-${String(state.rateComparisons.length + 1).padStart(3, '0')}`,
        rfqId: currentRFQ.id,
        projectId: currentRFQ.projectId,
        quotationIds: quotations.map((q) => q.id),
        status: 'draft',
      });
    }

    const res = awardRateComparison(comparisonId, selectedVendorId, selectionRemarks, 'Rajesh Sharma (Procurement Lead)');

    if (res.success) {
      setSuccessMsg(`Tender successfully awarded! RFQ ${currentRFQ.documentNumber} is now marked as AWARDED.`);
    } else {
      setErrorMsg(res.error || 'Failed to award tender.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Link to="/procurement/rfqs" className="hover:text-slate-800 flex items-center gap-1 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> RFQs List
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">Commercial Rate Comparison</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRFQId}
            onChange={(e) => setSelectedRFQId(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-slate-400"
          >
            {rfqList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.documentNumber} - {r.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono text-slate-900">{currentRFQ.documentNumber} Commercial Comparative Statement</h1>
              {getRFQStatusBadge(currentRFQ.status as RFQStatus)}
            </div>
            <div className="text-slate-600 font-semibold mt-1 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-slate-400" /> Project: {currentRFQ.projectName}
            </div>
          </div>

          {l1Quotation && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px] text-emerald-800 uppercase tracking-wide">Lowest Landed Bidder (L1)</div>
                <div className="font-bold text-sm font-sans">{l1Quotation.vendorName}</div>
                <div className="font-mono text-xs text-emerald-700">₹{l1Quotation.totalQuotedLandedAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Side-by-Side Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 overflow-x-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-900 text-xs">Line-Item Landed Rate Matrix ({quotations.length} Vendor Quotes)</h3>
        </div>

        {quotations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium">
            No vendor quotations recorded yet for this RFQ.{' '}
            <Link to={`/procurement/vendor-quotations/new?rfqId=${currentRFQ.id}`} className="text-amber-800 font-bold underline">
              Log Vendor Quotations
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse border border-slate-200 rounded text-xs">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-2.5 min-w-[200px]">Product / Material Item</th>
                <th className="p-2.5 text-right w-20">Qty</th>
                {quotations.map((q) => {
                  const isL1 = q.id === l1Quotation?.id;
                  return (
                    <th key={q.id} className={`p-2.5 text-right min-w-[180px] ${isL1 ? 'bg-emerald-100/70 border-x border-emerald-300 text-emerald-950' : ''}`}>
                      <div className="font-bold text-slate-900">{q.vendorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-normal">Terms: {q.paymentTerms}</div>
                      {isL1 && <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-emerald-700 text-white rounded text-[9px] font-bold">L1 LOWEST BID</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {currentRFQ.lines.map((rfqLine) => {
                // Find lowest landed unit rate for this line across quotes
                let lowestLineLanded = Infinity;
                quotations.forEach((q) => {
                  const vLine = q.lines.find((l) => l.rfqLineId === rfqLine.id || l.productId === rfqLine.productId);
                  if (vLine && vLine.landedRatePerUnit < lowestLineLanded) {
                    lowestLineLanded = vLine.landedRatePerUnit;
                  }
                });

                return (
                  <tr key={rfqLine.id} className="hover:bg-slate-50">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{rfqLine.productName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{rfqLine.productCode}</div>
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {rfqLine.quantity} {rfqLine.unitSymbol}
                    </td>
                    {quotations.map((q) => {
                      const vLine = q.lines.find((l) => l.rfqLineId === rfqLine.id || l.productId === rfqLine.productId);
                      const isLineL1 = vLine && Math.abs(vLine.landedRatePerUnit - lowestLineLanded) < 0.01;
                      return (
                        <td key={q.id} className={`p-2.5 text-right font-mono ${isLineL1 ? 'bg-emerald-50 font-bold text-emerald-900' : ''}`}>
                          {vLine ? (
                            <div>
                              <div>₹{vLine.landedRatePerUnit.toFixed(2)} / {rfqLine.unitSymbol}</div>
                              <div className="text-[10px] text-slate-500 font-normal">
                                Total: ₹{vLine.quotedLineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not Quoted</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Total Landed Cost Row */}
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <td colSpan={2} className="p-3 text-slate-900 uppercase">
                  Total Landed Quoted Amount
                </td>
                {quotations.map((q) => {
                  const isL1 = q.id === l1Quotation?.id;
                  return (
                    <td key={q.id} className={`p-3 text-right font-mono text-sm ${isL1 ? 'bg-emerald-200 text-emerald-950 font-bold' : 'text-slate-900'}`}>
                      ₹{q.totalQuotedLandedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Tender Award Form */}
      {quotations.length > 0 && (
        <form onSubmit={handleAwardTender} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-700" /> Award Tender & Authorise Vendor Selection
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Awardee Supplier *</label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-400"
              >
                {quotations.map((q) => (
                  <option key={q.vendorId} value={q.vendorId}>
                    {q.vendorName} - ₹{q.totalQuotedLandedAmount.toLocaleString('en-IN')} {q.id === l1Quotation?.id ? '(L1 Bidders)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Selection & Award Remarks *</label>
              <input
                type="text"
                value={selectionRemarks}
                onChange={(e) => setSelectionRemarks(e.target.value)}
                placeholder="Enter justification for vendor award..."
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="text-slate-500 font-mono text-[11px]">
              Status: <strong className="text-slate-800">{existingComparison?.status.toUpperCase() || 'DRAFT'}</strong>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="primary" type="submit">
                <Award className="h-4 w-4 mr-1.5" /> Confirm Award & Authorise Selection
              </Button>
              {currentRFQ.status === 'awarded' && (
                <Button variant="success" onClick={() => navigate(`/procurement/purchase-orders/new?rfqId=${currentRFQ.id}&vendorId=${selectedVendorId}`)}>
                  Generate Purchase Order <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
