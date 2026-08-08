import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Award, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TenderDecisionsPage: React.FC = () => {
  const { state, addItem, updateItem, logAudit } = useERPStore();
  const navigate = useNavigate();

  const [selectedEstId, setSelectedEstId] = useState<string>(state.estimates[0]?.id || '');
  const [outcome, setOutcome] = useState<'accepted' | 'rejected' | 'revised'>('accepted');
  const [clientRefNo, setClientRefNo] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');

  const selectedEst: any = state.estimates.find((e) => e.id === selectedEstId) || state.estimates[0];
  const activeVer = selectedEst?.versions ? selectedEst.versions[selectedEst.versions.length - 1] : undefined;

  const handleRecordDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEst || !activeVer) return;

    const newDecision: any = {
      id: `dec-${Date.now()}`,
      documentNumber: `DEC-2026-${String(((state as any).tenderDecisions || []).length + 1).padStart(3, '0')}`,
      enquiryId: selectedEst.enquiryId,
      estimateId: selectedEst.id,
      estimateVersionId: activeVer.id,
      outcome,
      decisionDate: new Date().toISOString().split('T')[0],
      clientReferenceNo: clientRefNo,
      rejectionReason: outcome === 'rejected' ? rejectionReason : undefined,
      revisionNotes: outcome === 'revised' ? revisionNotes : undefined,
      acceptedValue: outcome === 'accepted' ? activeVer.totalSellingValue : undefined,
      recordedBy: 'Priya Nair',
      createdAt: new Date().toISOString(),
    };

    addItem('tenderDecisions', newDecision);

    // Update estimate status
    const newStatus = outcome === 'accepted' ? 'accepted' : outcome === 'rejected' ? 'rejected' : 'revision_requested';
    updateItem('estimates', selectedEst.id, { status: newStatus });

    // Update enquiry status
    if (selectedEst.enquiryId) {
      updateItem('enquiries', selectedEst.enquiryId, {
        status: outcome === 'accepted' ? 'won' : outcome === 'rejected' ? 'lost' : 'estimating',
      });
    }

    logAudit({
      documentType: 'tender_decision',
      documentId: newDecision.id,
      documentNumber: newDecision.documentNumber,
      action: outcome.toUpperCase(),
      performedBy: 'Priya Nair',
      newStatus,
      details: `Tender Decision recorded: ${outcome.toUpperCase()} for Estimate ${selectedEst.documentNumber} (Value: ₹${activeVer.totalSellingValue.toLocaleString('en-IN')})`,
    });

    if (outcome === 'accepted') {
      navigate('/projects/active');
    } else if (outcome === 'revised') {
      navigate('/crm/estimate-versions');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-600" />
            Client Tender Decision Recorder
          </h1>
          <p className="text-sm text-slate-600">
            Record formal client tender acceptance, rejection, or revision requests. Client acceptance unlocks Project Activation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Decision Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-lg border-b pb-3">Record Decision Form</h3>

          <form onSubmit={handleRecordDecision} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Proposal / Estimate *</label>
              <select
                required
                value={selectedEstId}
                onChange={(e) => setSelectedEstId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none font-medium"
              >
                {state.estimates.map((estRaw) => {
                  const est = estRaw as any;
                  return (
                    <option key={est.id} value={est.id}>
                      {est.documentNumber || est.quotationNumber || est.id} — {est.projectName || est.clientName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Tender Outcome *</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setOutcome('accepted')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 font-bold text-sm transition ${
                    outcome === 'accepted' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle className="h-6 w-6 text-emerald-600" /> Client Accepted (Won)
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome('revised')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 font-bold text-sm transition ${
                    outcome === 'revised' ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="h-6 w-6 text-amber-600" /> Revision Requested
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome('rejected')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 font-bold text-sm transition ${
                    outcome === 'rejected' ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <XCircle className="h-6 w-6 text-rose-600" /> Tender Lost
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Reference / LOI Number</label>
              <input
                type="text"
                placeholder="e.g. LOI-NOUVEAU-2026-99"
                value={clientRefNo}
                onChange={(e) => setClientRefNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
              />
            </div>

            {outcome === 'rejected' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain client feedback or price competitiveness reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
            )}

            {outcome === 'revised' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Revision Instructions *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specific scope or factor modifications requested by client"
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                />
              </div>
            )}

            <div className="pt-3 border-t flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition"
              >
                Submit Decision Record <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Selected Proposal Info */}
        {selectedEst && activeVer && (
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md space-y-4 h-fit">
            <h3 className="font-bold text-amber-400 text-base border-b border-slate-800 pb-2">Proposal Under Review</h3>
            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimate No:</span>
                <span className="font-mono text-white font-bold">{selectedEst.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Client:</span>
                <span className="font-medium text-white">{selectedEst.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="font-medium text-white">{selectedEst.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Version:</span>
                <span className="font-semibold text-amber-400">Version {activeVer.versionNumber}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                <span>Total Value:</span>
                <span className="text-amber-400 text-lg">₹{activeVer.totalSellingValue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {outcome === 'accepted' && (
              <div className="bg-emerald-950/60 border border-emerald-800/80 p-3 rounded text-xs text-emerald-300 space-y-1">
                <span className="font-bold block flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Enables Project Activation
                </span>
                <p>Accepting this tender will unlock converting this estimate into an active project baseline with locked BOQ.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderDecisionsPage;
