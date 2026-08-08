/**
 * RFQ Details Workspace
 * Location: src/pages/procurement/RFQDetailsPage.tsx
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import { RFQStatus, Vendor } from '../../domain/types';
import { getRFQStatusBadge } from '../../utils/statusStyles';
import { MarkRFQSentModal } from '../../components/procurement/MarkRFQSentModal';
import { RecordVendorQuoteModal } from '../../components/procurement/RecordVendorQuoteModal';
import { QuotationComparisonPanel } from '../../components/procurement/QuotationComparisonPanel';
import {
  ArrowLeft,
  Layers,
  Paperclip,
  Activity,
  ShoppingBag,
  Send,
  PlusCircle,
  Eye,
} from 'lucide-react';

export const RFQDetailsPage: React.FC = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const { state, updateRFQStatus } = useERPStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'vendors' | 'documents' | 'activity'>('vendors');

  // Modal controls
  const [showMarkSentModal, setShowMarkSentModal] = useState<boolean>(false);
  const [recordQuoteVendor, setRecordQuoteVendor] = useState<Vendor | null>(null);

  const rfq = state.rfqs.find((r) => r.id === rfqId || r.documentNumber === rfqId) || state.rfqs[0];

  if (!rfq) {
    return (
      <div className="max-w-5xl mx-auto p-6 font-sans text-xs text-center space-y-4">
        <div className="text-slate-500">RFQ document not found.</div>
        <Link to="/procurement/rfqs" className="text-amber-800 font-bold underline">
          Return to Requests for Quotation
        </Link>
      </div>
    );
  }

  const invitedVendors = state.vendors.filter((v) => rfq.invitedVendorIds?.includes(v.id));
  const receivedQuotations = (state.vendorQuotations || []).filter((q) => q.rfqId === rfq.id);
  const auditLogs = (state.auditEvents || []).filter((a) => a.documentId === rfq.id || a.documentNumber === rfq.documentNumber);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Link to="/procurement/rfqs" className="hover:text-slate-800 flex items-center gap-1 font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Requests for Quotation
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">{rfq.documentNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          {receivedQuotations.length > 0 && (
            <Button variant="primary" onClick={() => navigate(`/procurement/purchase-orders/new?rfqId=${rfq.id}`)}>
              <ShoppingBag className="h-4 w-4 mr-1.5" /> Create Purchase Order
            </Button>
          )}
          {rfq.status === 'draft' && (
            <Button variant="secondary" onClick={() => setShowMarkSentModal(true)}>
              <Send className="h-4 w-4 mr-1.5" /> Mark RFQ as Sent
            </Button>
          )}
        </div>
      </div>

      {/* Header Banner Workspace Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono text-slate-900">{rfq.documentNumber}</h1>
              {getRFQStatusBadge(rfq.status as RFQStatus)}
            </div>
            <div className="text-slate-600 font-semibold mt-1 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-slate-400" /> Project: {rfq.projectName}
            </div>
          </div>

          <div className="text-right sm:text-right font-mono text-slate-600">
            <div>Source Indent: <strong className="text-slate-900">{rfq.sourceIndentNumber || 'IND-2026-001'}</strong></div>
            <div>Response Due: <strong className="text-amber-800">{rfq.quoteDueDate}</strong></div>
          </div>
        </div>

        {/* Header Key Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-slate-700">
          <div>
            <div className="text-slate-500 font-semibold">Issue Date</div>
            <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{rfq.issueDate}</div>
          </div>

          <div>
            <div className="text-slate-500 font-semibold">Invited Vendors</div>
            <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{invitedVendors.length} Vendors</div>
          </div>

          <div>
            <div className="text-slate-500 font-semibold">Received Quotes</div>
            <div className="text-xs font-bold font-mono text-emerald-800 mt-0.5">{receivedQuotations.length} Submitted</div>
          </div>

          <div>
            <div className="text-slate-500 font-semibold">Line Items Count</div>
            <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">{rfq.lines.length} Line Items</div>
          </div>
        </div>
      </div>

      {/* 5-Tab Navigation Bar */}
      <div className="border-b border-slate-200 flex items-center gap-6 font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'overview'
              ? 'border-amber-700 text-amber-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'items'
              ? 'border-amber-700 text-amber-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Items ({rfq.lines.length})
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'vendors'
              ? 'border-amber-700 text-amber-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Vendors & Responses ({invitedVendors.length})
          {receivedQuotations.length > 0 && (
            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px]">
              {receivedQuotations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'documents'
              ? 'border-amber-700 text-amber-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Documents
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'activity'
              ? 'border-amber-700 text-amber-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Activity ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">RFQ Scope & Bidding Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
              <div>
                <label className="text-slate-500 font-semibold block">Target Delivery Location</label>
                <div className="font-medium text-slate-900 mt-0.5">{rfq.deliveryLocation || 'Project Site Office, Block B, Mumbai'}</div>
              </div>
              <div>
                <label className="text-slate-500 font-semibold block">Commercial Terms Note</label>
                <div className="font-medium text-slate-900 mt-0.5">
                  {rfq.specialTerms || 'All rates must include FOR site delivery, packaging, loading & un-loading.'}
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Quote Comparison if quotes exist */}
          {receivedQuotations.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Quote Comparison Summary</h3>
              <QuotationComparisonPanel rfq={rfq} quotations={receivedQuotations} showSelectRadio={false} />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ITEMS */}
      {activeTab === 'items' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-right">Requested Qty</th>
                <th className="p-3 text-right">Target Rate ₹</th>
                <th className="p-3">Target Delivery Date</th>
                <th className="p-3">Technical Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {rfq.lines.map((line, index) => (
                <tr key={line.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-500">{index + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{line.productName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{line.productCode}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {line.quantity} {line.unitSymbol}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700">
                    ₹{line.targetRate ? line.targetRate.toLocaleString('en-IN') : 'N/A'}
                  </td>
                  <td className="p-3 font-mono text-slate-700">{line.targetDeliveryDate || '2026-08-15'}</td>
                  <td className="p-3 text-slate-600 font-medium">{line.remarks || 'Standard IS Spec'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: VENDORS & RESPONSES */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          {/* Vendors Responses Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Invited Vendors & Bidding Status</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Record quote rates directly for invited suppliers or send reminder notifications.
                </p>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Sent Status</th>
                  <th className="p-3">Sent Via</th>
                  <th className="p-3">Sent Date</th>
                  <th className="p-3">Quote Status</th>
                  <th className="p-3 text-right">Quote Total</th>
                  <th className="p-3 text-right">Lead Time</th>
                  <th className="p-3">Valid Until</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {invitedVendors.map((vendor) => {
                  const quote = receivedQuotations.find((q) => q.vendorId === vendor.id);
                  const isSent = rfq.status !== 'draft';
                  const sentStatusText = isSent ? 'Sent' : 'Not Sent';
                  const quoteStatusText = quote ? 'Quote Received' : isSent ? 'No Response' : 'Draft RFQ';

                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{vendor.name}</div>
                        <div className="text-[10px] text-slate-500">{vendor.code} • Rating: {vendor.rating || '4.5/5'}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{vendor.contactPerson}</div>
                        <div className="text-[10px] font-mono text-slate-500">{vendor.phone}</div>
                      </td>
                      <td className="p-3 font-semibold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                            isSent ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {sentStatusText}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{isSent ? 'Email / Portal' : '—'}</td>
                      <td className="p-3 font-mono text-slate-700">{isSent ? rfq.issueDate : '—'}</td>
                      <td className="p-3 font-semibold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                            quote
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {quoteStatusText}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {quote ? `₹${quote.totalQuotedLandedAmount?.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-700">
                        {quote ? `${quote.deliveryDays || 7} Days` : '—'}
                      </td>
                      <td className="p-3 font-mono text-slate-700">{quote ? quote.validUntil : '—'}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {quote ? (
                            <button
                              onClick={() => setRecordQuoteVendor(vendor)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" /> View / Edit Quote
                            </button>
                          ) : (
                            <Button
                              variant="primary"
                              onClick={() => setRecordQuoteVendor(vendor)}
                            >
                              <PlusCircle className="h-3 w-3 mr-1" /> Record Quote
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Embedded Quotation Comparison Matrix Panel when quotes are available */}
          {receivedQuotations.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Quote Comparison Matrix</h3>
                  <p className="text-[11px] text-slate-500">
                    Landed rate comparison & L1 ranking matrix across received supplier quotes.
                  </p>
                </div>

                <Button variant="primary" onClick={() => navigate(`/procurement/purchase-orders/new?rfqId=${rfq.id}`)}>
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Create Purchase Order
                </Button>
              </div>

              <QuotationComparisonPanel rfq={rfq} quotations={receivedQuotations} showSelectRadio={false} />
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Attachments & Specifications</h3>
          <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500">
            <Paperclip className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <div>No PDF attachments or technical specification files uploaded yet.</div>
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">RFQ Activity History</h3>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 border-b border-slate-100 pb-2 text-[11px]">
                <Activity className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">{(log as any).actionName || log.action}</div>
                  <div className="text-slate-500 font-mono">{(log as any).actorName || log.performedBy} • {new Date(log.performedAt).toLocaleString('en-IN')}</div>
                  {((log as any).comments || log.details) && <div className="text-slate-600 mt-0.5">{(log as any).comments || log.details}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mark RFQ as Sent Modal */}
      {showMarkSentModal && (
        <MarkRFQSentModal
          isOpen={showMarkSentModal}
          onClose={() => setShowMarkSentModal(false)}
          rfqNumber={rfq.documentNumber}
          onConfirm={(data) => {
            updateRFQStatus(rfq.id, 'issued', 'Rajesh Sharma', `Marked as sent via ${data.channel.toUpperCase()} to ${data.recipientContact}`);
            setShowMarkSentModal(false);
          }}
        />
      )}

      {/* Record Vendor Quote Modal */}
      {recordQuoteVendor && (
        <RecordVendorQuoteModal
          isOpen={!!recordQuoteVendor}
          onClose={() => setRecordQuoteVendor(null)}
          rfq={rfq}
          vendor={recordQuoteVendor}
          existingQuotation={receivedQuotations.find((q) => q.vendorId === recordQuoteVendor.id)}
        />
      )}
    </div>
  );
};
