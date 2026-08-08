/**
 * Vendor Quotations Inbox Page
 * Location: src/pages/procurement/VendorQuotationsInboxPage.tsx
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import { Plus, Search, Filter, ArrowRight } from 'lucide-react';

export const VendorQuotationsInboxPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useERPStore();

  const [selectedRFQId, setSelectedRFQId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const quotations = state.vendorQuotations || [];

  const filteredQuotations = quotations.filter((q) => {
    const matchesRFQ = selectedRFQId === 'all' || q.rfqId === selectedRFQId;
    const matchesSearch =
      searchQuery === '' ||
      q.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRFQ && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Procurement</span>
            <span>/</span>
            <span className="font-bold text-slate-900">Vendor Quotations Inbox</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Supplier Quotations & Rate Records</h1>
          <p className="text-slate-500 mt-0.5">
            Log and review landed rates submitted by invited suppliers against issued RFQs.
          </p>
        </div>

        <Button variant="primary" onClick={() => navigate('/procurement/vendor-quotations/new')}>
          <Plus className="h-4 w-4 mr-1.5" /> Log Vendor Quotation
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Quote # or Vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedRFQId}
              onChange={(e) => setSelectedRFQId(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">All Linked RFQs</option>
              {state.rfqs.map((rfq) => (
                <option key={rfq.id} value={rfq.id}>
                  {rfq.documentNumber} - {rfq.projectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-semibold text-right">
          Total Quotations Recorded: <strong className="text-slate-900 font-mono">{filteredQuotations.length}</strong>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
            <tr>
              <th className="p-3">Quotation #</th>
              <th className="p-3">Linked RFQ</th>
              <th className="p-3">Supplier Name</th>
              <th className="p-3 text-right">Delivery Days</th>
              <th className="p-3">Payment Terms</th>
              <th className="p-3 text-right">Quoted Landed Total</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {filteredQuotations.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                  No vendor quotations recorded yet. Click "Log Vendor Quotation" to add one.
                </td>
              </tr>
            ) : (
              filteredQuotations.map((q) => {
                const linkedRFQ = state.rfqs.find((r) => r.id === q.rfqId);
                return (
                  <tr key={q.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-slate-900">{q.documentNumber}</td>
                    <td className="p-3">
                      <Link to={`/procurement/rfqs/${q.rfqId}`} className="font-mono text-amber-800 hover:underline font-bold">
                        {linkedRFQ?.documentNumber || q.rfqId}
                      </Link>
                      <div className="text-[11px] text-slate-500">{linkedRFQ?.projectName || 'Project'}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{q.vendorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Date: {q.quotationDate}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">{q.deliveryDays} Days</td>
                    <td className="p-3 text-slate-600">{q.paymentTerms}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-800 text-sm">
                      ₹{q.totalQuotedLandedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {q.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/procurement/rate-comparison/${q.rfqId}`}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded text-[11px] inline-flex items-center gap-1"
                      >
                        Compare Rates <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
