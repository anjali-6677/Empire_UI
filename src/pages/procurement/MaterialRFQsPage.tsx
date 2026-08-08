/**
 * Requests for Quotation (RFQs) Page
 * Location: src/pages/procurement/MaterialRFQsPage.tsx
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { RFQ, RFQStatus, Vendor } from '../../domain/types';
import { getRFQStatusBadge } from '../../utils/statusStyles';
import { MarkRFQSentModal } from '../../components/procurement/MarkRFQSentModal';
import { RecordVendorQuoteModal } from '../../components/procurement/RecordVendorQuoteModal';
import { CancelRFQModal } from '../../components/procurement/CancelRFQModal';
import { SelectVendorForQuoteModal } from '../../components/procurement/SelectVendorForQuoteModal';
import { RFQRowActionsMenu } from '../../components/procurement/RFQRowActionsMenu';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import {
  FileText,
  Plus,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const MaterialRFQsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateRFQStatus } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [markSentRfq, setMarkSentRfq] = useState<RFQ | null>(null);
  const [recordQuoteRfq, setRecordQuoteRfq] = useState<RFQ | null>(null);
  const [selectedVendorForQuote, setSelectedVendorForQuote] = useState<Vendor | null>(null);

  // New Modals: Vendor picker for multi-vendor quote recording & Cancel RFQ confirmation
  const [selectVendorRfq, setSelectVendorRfq] = useState<RFQ | null>(null);
  const [cancelRfqTarget, setCancelRfqTarget] = useState<RFQ | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const rfqs = state.rfqs || [];

  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesProject = selectedProjectId === 'all' || rfq.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      rfq.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  const totalRFQs = rfqs.length;
  const draftRFQs = rfqs.filter((r) => r.status === 'draft').length;
  const awaitingQuotes = rfqs.filter((r) => r.status === 'issued').length;
  const quotesReceived = rfqs.filter((r) => r.status === 'quotes_received' || r.status === 'awarded').length;

  const handleMarkSentConfirm = (data: { channel: 'email' | 'whatsapp' | 'manual'; sentAt: string; recipientContact: string; note: string }) => {
    if (markSentRfq) {
      updateRFQStatus(markSentRfq.id, 'issued', 'Rajesh Sharma (Procurement Lead)', `Marked as sent via ${data.channel.toUpperCase()} to ${data.recipientContact}`);
      setMarkSentRfq(null);
    }
  };

  const handleRecordQuoteTrigger = (rfq: RFQ) => {
    const invitedVendorObjs = state.vendors.filter((v) => rfq.invitedVendorIds?.includes(v.id));
    if (invitedVendorObjs.length > 1) {
      setSelectVendorRfq(rfq);
    } else {
      const vendor = invitedVendorObjs[0] || state.vendors[0];
      setRecordQuoteRfq(rfq);
      setSelectedVendorForQuote(vendor);
    }
  };

  const handleConfirmCancelRFQ = (reason: string) => {
    if (cancelRfqTarget) {
      updateRFQStatus(cancelRfqTarget.id, 'cancelled', 'Rajesh Sharma (Procurement Lead)', `Cancelled: ${reason}`);
      setCancelRfqTarget(null);
    }
  };

  const handleDownloadRFQ = (rfq: RFQ) => {
    setDownloadNotice(`Generating PDF document for RFQ ${rfq.documentNumber}...`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 3000);
  };

  return (
    <ListPageLayout>
      {downloadNotice && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-semibold text-xs flex items-center justify-between animate-in fade-in duration-200">
          <span>{downloadNotice}</span>
          <button onClick={() => setDownloadNotice(null)} className="text-xs text-amber-700 underline font-bold cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <PageHeader
        title="Requests for Quotation"
        subtitle="Issue material RFQs and track supplier responses."
        breadcrumbs={[
          { label: 'Procurement' },
          { label: 'Requests for Quotation' }
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/procurement/rfqs/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Create RFQ
          </button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'all'
              ? 'bg-[#AB9570]/10 border-[#AB9570] shadow-2xs'
              : 'bg-white border-[#E2E6EC] hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total RFQs</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{totalRFQs}</div>
          </div>
          <FileText className={`h-5 w-5 ${statusFilter === 'all' ? 'text-[#AB9570]' : 'text-slate-400'}`} />
        </div>

        <div
          onClick={() => setStatusFilter('draft')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'draft'
              ? 'bg-[#AB9570]/10 border-[#AB9570] shadow-2xs'
              : 'bg-white border-[#E2E6EC] hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Draft</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{draftRFQs}</div>
          </div>
          <Clock className={`h-5 w-5 ${statusFilter === 'draft' ? 'text-[#AB9570]' : 'text-slate-400'}`} />
        </div>

        <div
          onClick={() => setStatusFilter('issued')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'issued'
              ? 'bg-[#AB9570]/10 border-[#AB9570] shadow-2xs'
              : 'bg-white border-[#E2E6EC] hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Awaiting Quotes</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{awaitingQuotes}</div>
          </div>
          <Users className={`h-5 w-5 ${statusFilter === 'issued' ? 'text-[#AB9570]' : 'text-slate-400'}`} />
        </div>

        <div
          onClick={() => setStatusFilter('quotes_received')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'quotes_received'
              ? 'bg-[#AB9570]/10 border-[#AB9570] shadow-2xs'
              : 'bg-white border-[#E2E6EC] hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Quotes Received</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{quotesReceived}</div>
          </div>
          <CheckCircle2 className={`h-5 w-5 ${statusFilter === 'quotes_received' ? 'text-[#AB9570]' : 'text-slate-400'}`} />
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search RFQ # or Project..."
        selectFilters={[
          {
            id: 'project',
            label: 'Project',
            value: selectedProjectId,
            onChange: setSelectedProjectId,
            options: [
              { value: 'all', label: 'All Active Projects' },
              ...state.projects.map((p) => ({ value: p.id, label: `${p.projectCode} - ${p.projectName}` }))
            ]
          },
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'issued', label: 'Issued' },
              { value: 'quotes_received', label: 'Quotes Received' },
              { value: 'awarded', label: 'Awarded' },
              { value: 'cancelled', label: 'Cancelled' },
            ]
          }
        ]}
        onResetFilters={() => {
          setSearchQuery('');
          setSelectedProjectId('all');
          setStatusFilter('all');
        }}
        hasActiveFilters={searchQuery !== '' || selectedProjectId !== 'all' || statusFilter !== 'all'}
      />

      {/* RFQ Table */}
      <div className="bg-white border border-[#E2E6EC] rounded-xl shadow-2xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="p-3.5">RFQ Number</th>
                <th className="p-3.5">Source Indent</th>
                <th className="p-3.5">Project</th>
                <th className="p-3.5">Package / Category</th>
                <th className="p-3.5 text-center">Invited Vendors</th>
                <th className="p-3.5 text-center">Quote Progress</th>
                <th className="p-3.5">Response Due</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredRFQs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-medium">
                    No RFQs found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRFQs.map((rfq) => {
                  const invitedCount = rfq.invitedVendorIds?.length || 0;
                  const receivedCount = (state.vendorQuotations || []).filter((q) => q.rfqId === rfq.id).length;
                  const quoteProgressText = `${receivedCount} of ${invitedCount} received`;

                  return (
                    <tr key={rfq.id} className="hover:bg-slate-50 transition-colors h-14">
                      <td className="p-3.5 align-middle font-mono font-bold text-slate-900">
                        <Link to={`/procurement/rfqs/${rfq.id}`} className="hover:text-[#AB9570] underline decoration-slate-300">
                          {rfq.documentNumber}
                        </Link>
                      </td>
                      <td className="p-3.5 align-middle font-mono text-slate-700 font-medium">
                        {rfq.sourceIndentNumber || 'IND-2026-001'}
                      </td>
                      <td className="p-3.5 align-middle">
                        <div className="font-semibold text-slate-900">{rfq.projectName}</div>
                      </td>
                      <td className="p-3.5 align-middle text-slate-600 font-medium">
                        {rfq.lines[0]?.productName ? `${rfq.lines[0].productName.split(' ')[0]} & Hardware` : 'Civil & Finishing'}
                      </td>
                      <td className="p-3.5 align-middle text-center font-mono font-semibold">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          <Users className="h-3 w-3 text-slate-500" /> {invitedCount}
                        </span>
                      </td>
                      <td className="p-3.5 align-middle text-center font-mono font-semibold">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] ${
                            receivedCount > 0
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {quoteProgressText}
                        </span>
                      </td>
                      <td className="p-3.5 align-middle font-mono text-slate-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" /> {rfq.quoteDueDate}
                        </div>
                      </td>
                      <td className="p-3.5 align-middle">{getRFQStatusBadge(rfq.status as RFQStatus)}</td>
                      <td className="p-3.5 align-middle text-right">
                        <div className="flex items-center justify-end">
                          <RFQRowActionsMenu
                            rfq={rfq}
                            receivedQuotesCount={receivedCount}
                            onView={(id) => navigate(`/procurement/rfqs/${id}`)}
                            onMarkSent={(targetRfq) => setMarkSentRfq(targetRfq)}
                            onRecordQuote={(targetRfq) => handleRecordQuoteTrigger(targetRfq)}
                            onCompareQuotes={(id) => navigate(`/procurement/rfqs/${id}?tab=vendors`)}
                            onCreatePO={(id) => navigate(`/procurement/purchase-orders/new?rfqId=${id}`)}
                            onViewActivity={(id) => navigate(`/procurement/rfqs/${id}?tab=activity`)}
                            onDownload={(targetRfq) => handleDownloadRFQ(targetRfq)}
                            onCancel={(targetRfq) => setCancelRfqTarget(targetRfq)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark RFQ as Sent Modal */}
      {markSentRfq && (
        <MarkRFQSentModal
          isOpen={!!markSentRfq}
          onClose={() => setMarkSentRfq(null)}
          rfqNumber={markSentRfq.documentNumber}
          onConfirm={handleMarkSentConfirm}
        />
      )}

      {/* Record Vendor Quote Modal */}
      {recordQuoteRfq && selectedVendorForQuote && (
        <RecordVendorQuoteModal
          isOpen={!!recordQuoteRfq && !!selectedVendorForQuote}
          onClose={() => {
            setRecordQuoteRfq(null);
            setSelectedVendorForQuote(null);
          }}
          rfq={recordQuoteRfq}
          vendor={selectedVendorForQuote}
        />
      )}

      {/* Multi-Vendor Selection Modal */}
      {selectVendorRfq && (
        <SelectVendorForQuoteModal
          isOpen={!!selectVendorRfq}
          onClose={() => setSelectVendorRfq(null)}
          rfqDocumentNumber={selectVendorRfq.documentNumber}
          invitedVendors={state.vendors.filter((v) => selectVendorRfq.invitedVendorIds?.includes(v.id))}
          onSelectVendor={(v) => {
            const target = selectVendorRfq;
            setSelectVendorRfq(null);
            setRecordQuoteRfq(target);
            setSelectedVendorForQuote(v);
          }}
        />
      )}

      {/* Cancel RFQ Confirmation Modal */}
      {cancelRfqTarget && (
        <CancelRFQModal
          isOpen={!!cancelRfqTarget}
          onClose={() => setCancelRfqTarget(null)}
          rfqNumber={cancelRfqTarget.documentNumber}
          onConfirm={handleConfirmCancelRFQ}
        />
      )}
    </ListPageLayout>
  );
};
