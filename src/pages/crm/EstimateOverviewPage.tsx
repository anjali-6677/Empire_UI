import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Lock } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { EstimateStatusBadge } from '../../components/crm/EstimateStatusBadge';
import { QuotationPreview } from '../../components/crm/QuotationPreview';
import { CostSummaryCard } from '../../components/crm/CostSummaryCard';
import { SendQuotationModal } from '../../components/crm/SendQuotationModal';
import { normalizeEstimate } from '../../utils/normalizeEstimate';

export const EstimateOverviewPage: React.FC = () => {
  const { estimateId } = useParams<{ estimateId: string }>();
  const navigate = useNavigate();
  const { state, updateItem, logAudit } = useERPStore();

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const rawEstimate = state.estimates.find((e) => e.id === estimateId || e.quotationNumber === estimateId);
  const estimate = rawEstimate ? normalizeEstimate(rawEstimate) : null;
  const enquiry = state.enquiries.find((enq) => enq.id === estimate?.enquiryId);

  if (!estimate || !enquiry) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-900">Quotation Not Found</h2>
        <p className="text-xs text-slate-500">The requested commercial estimate could not be loaded.</p>
        <Link to="/crm/estimates" className="inline-flex items-center gap-1 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs">
          Return to Estimates List
        </Link>
      </div>
    );
  }

  const isAccepted = estimate.status === 'accepted';

  const handleConfirmSendQuotation = (deliveryMethod: 'email' | 'whatsapp' | 'manual') => {
    const today = new Date().toISOString();
    updateItem('estimates', estimate.id, {
      status: 'sent_to_client',
      sentDetails: { sentDate: today.split('T')[0], deliveryMethod, sentBy: 'Current Estimator' },
      updatedAt: today,
    });
    updateItem('enquiries', enquiry.id, {
      status: 'sent_to_client',
      updatedAt: today,
    });
    logAudit({
      documentType: 'quotation',
      documentId: estimate.id,
      documentNumber: estimate.quotationNumber,
      action: 'SENT_TO_CLIENT',
      performedBy: 'Current Estimator',
      newStatus: 'sent_to_client',
      details: `Quotation ${estimate.quotationNumber} dispatched to client via ${deliveryMethod}.`,
    });
    setIsSendModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs">
      <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/crm/estimates')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-400 text-sm">{estimate.quotationNumber}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono font-semibold">{estimate.revisionLabel}</span>
              <EstimateStatusBadge status={estimate.status} />
            </div>
            <h1 className="text-xl font-black text-white mt-0.5">{enquiry.clientName}</h1>
            <p className="text-xs text-slate-400">{enquiry.projectRequirement}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAccepted ? (
            <button
              onClick={() => navigate(`/crm/estimates/builder/${enquiry.id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md"
            >
              <Calculator className="h-4 w-4 stroke-[2.5]" /> Edit Estimate BOQ
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl font-bold">
              <Lock className="h-4 w-4 text-emerald-400" /> Accepted & Immutable
            </div>
          )}
        </div>
      </div>

      <CostSummaryCard costSummary={estimate.costSummary} />

      <QuotationPreview
        enquiry={enquiry}
        estimate={estimate}
        onSendToClient={() => setIsSendModalOpen(true)}
        readOnly={isAccepted}
      />

      <SendQuotationModal
        enquiry={enquiry}
        estimate={estimate}
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onConfirmSend={handleConfirmSendQuotation}
      />
    </div>
  );
};
