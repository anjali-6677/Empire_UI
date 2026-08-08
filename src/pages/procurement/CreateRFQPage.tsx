/**
 * Create RFQ Page
 * Location: src/pages/procurement/CreateRFQPage.tsx
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import { RFQ } from '../../domain/types';
import { ArrowLeft, Send, AlertTriangle, Layers, Building2, CheckSquare, Square } from 'lucide-react';

export const CreateRFQPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, createRFQ } = useERPStore();

  const preselectedIndentId = searchParams.get('indentId') || '';

  // Get approved indents eligible for RFQ
  const approvedIndents = state.materialIndents.filter((i) => i.status === 'approved' || i.id === preselectedIndentId);
  const initialIndentId = preselectedIndentId || approvedIndents[0]?.id || state.materialIndents[0]?.id || 'ind-001';

  const [selectedIndentId, setSelectedIndentId] = useState<string>(initialIndentId);
  const currentIndent = state.materialIndents.find((i) => i.id === selectedIndentId) || state.materialIndents[0];

  const [invitedVendorIds, setInvitedVendorIds] = useState<string[]>(
    state.vendors.slice(0, 3).map((v) => v.id)
  );

  const [quoteDueDate, setQuoteDueDate] = useState<string>('2026-08-05');
  const [deliveryLocation, setDeliveryLocation] = useState<string>(
    currentIndent ? `${currentIndent.projectName} Site Office, Worli, Mumbai` : 'Central Site Office'
  );
  const [requiredDate, setRequiredDate] = useState<string>('2026-08-15');
  const [commercialTerms, setCommercialTerms] = useState<string>(
    '1. 100% Payment within 30 days of GRN acceptance.\n2. Delivery at site included in quoted rates.\n3. Test certificates required with delivery.'
  );

  const [selectedLineIds, setSelectedLineIds] = useState<string[]>(
    (currentIndent?.lines || []).map((l: any) => l.id) || []
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleVendor = (vendorId: string) => {
    if (invitedVendorIds.includes(vendorId)) {
      setInvitedVendorIds(invitedVendorIds.filter((id) => id !== vendorId));
    } else {
      setInvitedVendorIds([...invitedVendorIds, vendorId]);
    }
  };

  const toggleLine = (lineId: string) => {
    if (selectedLineIds.includes(lineId)) {
      setSelectedLineIds(selectedLineIds.filter((id) => id !== lineId));
    } else {
      setSelectedLineIds([...selectedLineIds, lineId]);
    }
  };

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (invitedVendorIds.length === 0) {
      setErrorMsg('Please select at least one vendor to invite for biddings.');
      return;
    }

    if (selectedLineIds.length === 0) {
      setErrorMsg('Please select at least one material line item for the RFQ.');
      return;
    }

    const targetLines = (currentIndent?.lines || [])
      .filter((l) => selectedLineIds.includes(l.id))
      .map((l, idx) => ({
        id: `rfq-line-${idx + 1}`,
        indentLineId: l.id,
        productId: l.productId,
        productCode: l.productCode,
        productName: l.productName,
        unitSymbol: l.unitSymbol,
        quantity: l.requestedQty,
      }));

    const documentNumber = `RFQ-2026-${String(state.rfqs.length + 1).padStart(3, '0')}`;

    const newRFQ: RFQ = {
      id: `rfq-${Date.now()}`,
      documentNumber,
      indentId: currentIndent?.id || 'ind-001',
      projectId: currentIndent?.projectId || 'PRJ-2026-001',
      projectName: currentIndent?.projectName || 'Worli Luxury Residence',
      invitedVendorIds,
      issueDate: new Date().toISOString().split('T')[0],
      quoteDueDate,
      deliveryLocation,
      requiredDate,
      commercialTerms,
      lines: targetLines,
      status: 'issued',
      createdAt: new Date().toISOString(),
      createdBy: 'Rajesh Sharma (Procurement Lead)',
    };

    const res = createRFQ(newRFQ, 'Rajesh Sharma (Procurement Lead)');
    if (res.success && res.rfq) {
      navigate(`/procurement/rfqs/${res.rfq.id}`);
    } else {
      setErrorMsg(res.error || 'Failed to create RFQ.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Link to="/procurement/rfqs" className="hover:text-slate-800 flex items-center gap-1 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Requests For Quotation
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">Create RFQ</span>
        </div>
      </div>

      <form onSubmit={handleCreateRFQ} className="space-y-6">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* Indent Selection */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
          <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-700" /> 1. Select Source Material Indent
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Approved Material Indent *</label>
              <select
                value={selectedIndentId}
                onChange={(e) => {
                  setSelectedIndentId(e.target.value);
                  const ind = state.materialIndents.find((i) => i.id === e.target.value);
                  if (ind) setSelectedLineIds((ind.lines || []).map((l: any) => l.id));
                }}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-400"
              >
                {approvedIndents.map((ind: any) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.documentNumber} - {ind.projectName} ({(ind.lines || []).length} items) [{ind.status.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            {/* Selection Summary */}
            <div className="bg-[#F8F9FA] border border-slate-200 rounded p-3 text-xs space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Project Name:</span>
                <span className="font-bold text-slate-900">{currentIndent?.projectName || 'N/A'}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>Delivery Site:</span>
                <span className="font-bold text-slate-900">{currentIndent?.projectName} Site</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Select Items to Include */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#AB9570]" />
              2. Select Material Items for RFQ ({selectedLineIds.length} Selected)
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedLineIds((currentIndent?.lines || []).map((l: any) => l.id))}
                className="text-[11px] font-bold text-amber-800 hover:underline"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedLineIds([])}
                className="text-[11px] font-medium text-slate-500 hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="p-2.5 w-10 text-center">Select</th>
                  <th className="p-2.5">Product Code & Description</th>
                  <th className="p-2.5 text-right">Requested Qty</th>
                  <th className="p-2.5 text-right">Est. Unit Rate</th>
                  <th className="p-2.5 text-right">Est. Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {(currentIndent?.lines || []).map((l: any) => {
                  const isSelected = selectedLineIds.includes(l.id);
                  return (
                    <tr key={l.id} className={isSelected ? 'bg-amber-50/40' : ''}>
                      <td className="p-2.5 text-center cursor-pointer" onClick={() => toggleLine(l.id)}>
                        {isSelected ? <CheckSquare className="h-4 w-4 text-amber-800" /> : <Square className="h-4 w-4 text-slate-300" />}
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{l.productName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{l.productCode}</div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        {l.requestedQty} {l.unitSymbol}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-600">
                        ₹{l.estimatedRate.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        ₹{l.estimatedTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Selection */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm">
          <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-700" /> 2. Invite Approved Vendors *
            </div>
            <span className="text-slate-500 text-xs font-normal">
              Selected: <strong className="text-slate-900 font-mono">{invitedVendorIds.length}</strong> Vendors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {state.vendors.map((vendor) => {
              const isSelected = invitedVendorIds.includes(vendor.id);
              return (
                <div
                  key={vendor.id}
                  onClick={() => toggleVendor(vendor.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition flex items-start gap-2.5 ${
                    isSelected ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="mt-0.5 text-slate-700">
                    {isSelected ? <CheckSquare className="h-4 w-4 text-amber-800" /> : <Square className="h-4 w-4 text-slate-300" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{vendor.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{vendor.code} • {vendor.category}</div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      Payment: {vendor.paymentTermsDays ? `${vendor.paymentTermsDays} Days Credit` : 'Standard Terms'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lines Selection */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm">
          <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            3. Select Indented Line Items for Bidding
          </div>

          <table className="w-full text-left border-collapse border border-slate-200 rounded">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-2.5 w-10 text-center">Select</th>
                <th className="p-2.5">Product Code & Description</th>
                <th className="p-2.5 text-right">Requested Qty</th>
                <th className="p-2.5 text-right">Est. Unit Rate</th>
                <th className="p-2.5 text-right">Est. Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {(currentIndent?.lines || []).map((l: any) => {
                const isSelected = selectedLineIds.includes(l.id);
                return (
                  <tr key={l.id} className={isSelected ? 'bg-amber-50/40' : ''}>
                    <td className="p-2.5 text-center cursor-pointer" onClick={() => toggleLine(l.id)}>
                      {isSelected ? <CheckSquare className="h-4 w-4 text-amber-800" /> : <Square className="h-4 w-4 text-slate-300" />}
                    </td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{l.productName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{l.productCode}</div>
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      {l.requestedQty} {l.unitSymbol}
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-600">
                      ₹{l.estimatedRate.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      ₹{l.estimatedTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Commercial & Delivery Details */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
          <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            4. Bidding Dates & Commercial Terms
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quote Submission Due Date *</label>
              <input
                type="date"
                value={quoteDueDate}
                onChange={(e) => setQuoteDueDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Required Delivery Date *</label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Delivery Location *</label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Commercial Terms & Bidding Guidelines</label>
            <textarea
              rows={3}
              value={commercialTerms}
              onChange={(e) => setCommercialTerms(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Link
            to="/procurement/rfqs"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <Button variant="primary" type="submit">
            <Send className="h-4 w-4 mr-1.5" /> Issue RFQ to Suppliers
          </Button>
        </div>
      </form>
    </div>
  );
};
