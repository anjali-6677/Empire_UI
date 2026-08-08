import React, { useState } from 'react';
import { X, CheckCircle2, RotateCcw, XCircle, Award } from 'lucide-react';
import { Enquiry, Estimate, ClientDecision } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';

interface ClientDecisionModalProps {
  enquiry: Enquiry;
  estimate: Estimate;
  isOpen: boolean;
  onClose: () => void;
  onSubmitDecision: (
    decisionType: 'accepted' | 'revision_requested' | 'rejected',
    decisionData: ClientDecision
  ) => void;
}

export const ClientDecisionModal: React.FC<ClientDecisionModalProps> = ({
  enquiry,
  estimate,
  isOpen,
  onClose,
  onSubmitDecision,
}) => {
  const [activeTab, setActiveTab] = useState<'accepted' | 'revision_requested' | 'rejected'>('accepted');

  // Accepted Form State
  const [acceptedBy, setAcceptedBy] = useState(enquiry.contactPerson || '');
  const [acceptedValue, setAcceptedValue] = useState<number>(estimate.finalQuotationValue);
  const [clientPoNumber, setClientPoNumber] = useState('');
  const [acceptedComment, setAcceptedComment] = useState('');

  // Revision Requested Form State
  const [requestedChanges, setRequestedChanges] = useState('');
  const [revisionComment, setRevisionComment] = useState('');

  // Rejected Form State
  const [lostReason, setLostReason] = useState('Price Too High');
  const [competitorName, setCompetitorName] = useState('');
  const [competitorPrice, setCompetitorPrice] = useState<number | ''>('');
  const [rejectedComment, setRejectedComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    if (activeTab === 'accepted') {
      onSubmitDecision('accepted', {
        decision: 'accepted',
        decisionDate: today,
        acceptedBy: acceptedBy.trim() || 'Client Representative',
        acceptedValue: Number(acceptedValue) || estimate.finalQuotationValue,
        clientPoNumber: clientPoNumber.trim(),
        comment: acceptedComment.trim() || 'Quotation accepted by client.',
      });
    } else if (activeTab === 'revision_requested') {
      onSubmitDecision('revision_requested', {
        decision: 'revision_requested',
        decisionDate: today,
        requestedChanges: requestedChanges.trim() || 'Client requested estimate revisions.',
        comment: revisionComment.trim(),
      });
    } else {
      onSubmitDecision('rejected', {
        decision: 'rejected',
        decisionDate: today,
        lostReason,
        competitorName: competitorName.trim(),
        competitorPrice: competitorPrice ? Number(competitorPrice) : undefined,
        comment: rejectedComment.trim() || 'Opportunity marked as lost.',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-xs">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              {enquiry.enquiryNumber} • {estimate.quotationNumber}
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Record Client Decision</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Client Info Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between text-slate-700 font-medium">
          <div>
            <span className="font-bold text-slate-900">{enquiry.clientName}</span> ({enquiry.projectRequirement})
          </div>
          <div className="font-mono font-bold text-slate-900">
            Quotation Value: <span className="text-amber-600">{formatIndianCurrency(estimate.finalQuotationValue)}</span>
          </div>
        </div>

        {/* Option Cards Header */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-100/60 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('accepted')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              activeTab === 'accepted'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className={`h-5 w-5 ${activeTab === 'accepted' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="font-bold text-xs">1. Accepted</span>
            <span className="text-[10px] text-slate-500 text-center">Mark Tender Won</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revision_requested')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              activeTab === 'revision_requested'
                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <RotateCcw className={`h-5 w-5 ${activeTab === 'revision_requested' ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className="font-bold text-xs">2. Revision Requested</span>
            <span className="text-[10px] text-slate-500 text-center">Create R1 Copy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              activeTab === 'rejected'
                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm ring-2 ring-rose-500/20'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <XCircle className={`h-5 w-5 ${activeTab === 'rejected' ? 'text-rose-600' : 'text-slate-400'}`} />
            <span className="font-bold text-xs">3. Rejected</span>
            <span className="text-[10px] text-slate-500 text-center">Mark Opportunity Lost</span>
          </button>
        </div>

        {/* Tab Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'accepted' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2">
                <Award className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Quotation Accepted (Tender Won)</div>
                  <div className="text-[11px] text-emerald-800">
                    Accepting locks revision <span className="font-mono font-bold">{estimate.revisionLabel}</span> as the final baseline. Afterwards, a manual "Create Project" action will be available.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Accepted By (Client Representative)</label>
                  <input
                    type="text"
                    value={acceptedBy}
                    onChange={(e) => setAcceptedBy(e.target.value)}
                    placeholder="e.g. Vikramaditya Roy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Final Accepted Value (INR)</label>
                  <input
                    type="number"
                    value={acceptedValue}
                    onChange={(e) => setAcceptedValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client PO / LOI Number</label>
                  <input
                    type="text"
                    value={clientPoNumber}
                    onChange={(e) => setClientPoNumber(e.target.value)}
                    placeholder="e.g. PO-NOUVEAU-2026-99"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Acceptance Notes & Conditions</label>
                  <textarea
                    value={acceptedComment}
                    onChange={(e) => setAcceptedComment(e.target.value)}
                    placeholder="Enter any client commercial stipulations, payment schedule notes, or handover terms..."
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revision_requested' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
                <RotateCcw className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Client Requested Changes</div>
                  <div className="text-[11px] text-amber-800">
                    This will preserve <span className="font-mono font-bold">{estimate.revisionLabel}</span> as read-only, generate a new <span className="font-mono font-bold">R{estimate.revisionNumber + 1}</span> draft, and open it for editing.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Requested Changes Summary <span className="text-rose-600">*</span></label>
                <textarea
                  value={requestedChanges}
                  onChange={(e) => setRequestedChanges(e.target.value)}
                  placeholder="e.g. Reduce quotation by 5%, change kitchen veneer to laminate, adjust payment milestone..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Internal Estimator Notes</label>
                <textarea
                  value={revisionComment}
                  onChange={(e) => setRevisionComment(e.target.value)}
                  placeholder="Notes for the team preparing the revised estimate..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-2">
                <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Mark Opportunity as Lost</div>
                  <div className="text-[11px] text-rose-800">
                    Record the rejection reason and move this enquiry to Lost Opportunities.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Primary Lost Reason <span className="text-rose-600">*</span></label>
                  <select
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:border-amber-500"
                  >
                    <option value="Price Too High">Price Too High</option>
                    <option value="Competitor Selected">Competitor Selected</option>
                    <option value="Client Budget Issue">Client Budget Issue</option>
                    <option value="Project Cancelled">Project Cancelled</option>
                    <option value="Project Postponed">Project Postponed</option>
                    <option value="Scope Changed">Scope Changed</option>
                    <option value="No Response">No Response</option>
                    <option value="Location Issue">Location Issue</option>
                    <option value="Timeline Issue">Timeline Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Winning Competitor Name (Optional)</label>
                  <input
                    type="text"
                    value={competitorName}
                    onChange={(e) => setCompetitorName(e.target.value)}
                    placeholder="e.g. Design Studio X"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Competitor Price (INR, Optional)</label>
                  <input
                    type="number"
                    value={competitorPrice}
                    onChange={(e) => setCompetitorPrice(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="e.g. 5500000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Client Feedback & Analysis</label>
                  <textarea
                    value={rejectedComment}
                    onChange={(e) => setRejectedComment(e.target.value)}
                    placeholder="Provide details on why the proposal was rejected and lessons learned..."
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 font-bold text-xs rounded-xl shadow-md transition-all ${
                activeTab === 'accepted'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  : activeTab === 'revision_requested'
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {activeTab === 'accepted'
                ? 'Confirm & Mark Tender Won'
                : activeTab === 'revision_requested'
                ? 'Generate Revised Estimate (R1)'
                : 'Confirm & Mark Opportunity Lost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
