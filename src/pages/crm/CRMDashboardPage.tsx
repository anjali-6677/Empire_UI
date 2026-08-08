import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Shield } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CRMSummaryCards } from '../../components/crm/CRMSummaryCards';
import { EnquiriesTable } from '../../components/crm/EnquiriesTable';
import { ClientDecisionModal } from '../../components/crm/ClientDecisionModal';
import { Enquiry, Estimate } from '../../domain/types';
import { normalizeEstimate, createEmptyCostSummary } from '../../utils/normalizeEstimate';

export const CRMDashboardPage: React.FC = () => {
  const { state, updateItem, addItem, logAudit } = useERPStore();
  const navigate = useNavigate();

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const enquiries = state.enquiries || [];
  const estimates = (state.estimates || []).map(normalizeEstimate);

  const handleOpenDecisionModal = (enquiry: Enquiry) => {
    const est = estimates.find((e) => e.id === enquiry.currentEstimateId || e.enquiryId === enquiry.id);
    if (!est) {
      alert('No quotation has been prepared for this enquiry yet.');
      return;
    }
    if (enquiry.status !== 'sent_to_client' && est.status !== 'sent_to_client') {
      alert('Client decision can only be recorded after the quotation has been sent to client.');
      return;
    }
    setSelectedEnquiry(enquiry);
    setSelectedEstimate(est);
    setIsDecisionModalOpen(true);
  };

  const handleDecisionSubmit = (decisionType: 'accepted' | 'revision_requested' | 'rejected', decisionData: any) => {
    if (!selectedEnquiry || !selectedEstimate) return;

    const today = new Date().toISOString();

    if (decisionType === 'accepted') {
      // 1. Update Estimate to accepted & lock revision
      updateItem('estimates', selectedEstimate.id, {
        status: 'accepted',
        clientDecision: decisionData,
        updatedAt: today,
      });

      // 2. Update Enquiry to won (Tender Won)
      updateItem('enquiries', selectedEnquiry.id, {
        status: 'won',
        updatedAt: today,
      });

      logAudit({
        documentType: 'enquiry',
        documentId: selectedEnquiry.id,
        documentNumber: selectedEnquiry.enquiryNumber,
        action: 'TENDER_WON',
        performedBy: 'Current User',
        newStatus: 'won',
        details: `Quotation ${selectedEstimate.quotationNumber} accepted by client. Enquiry marked as Tender Won. Value: ₹${decisionData.acceptedValue.toLocaleString('en-IN')}`,
      });
    } else if (decisionType === 'revision_requested') {
      // Create new Revision R1/R2 copy with deep cloned arrays and costSummary
      const nextRevNum = (selectedEstimate.revisionNumber || 0) + 1;
      const nextRevLabel = `R${nextRevNum}`;
      const newEstId = `est-${Date.now()}`;
      const baseQuotationNo = selectedEstimate.quotationNumber.split('-R')[0] || selectedEstimate.quotationNumber;
      const newQuotationNo = `${baseQuotationNo}-${nextRevLabel}`;

      // Mark current estimate as superseded
      updateItem('estimates', selectedEstimate.id, {
        status: 'superseded',
        updatedAt: today,
      });

      const newEst: Estimate = normalizeEstimate({
        ...selectedEstimate,
        id: newEstId,
        revisionNumber: nextRevNum,
        revisionLabel: nextRevLabel,
        quotationNumber: newQuotationNo,
        status: 'draft',
        boqSections: JSON.parse(JSON.stringify(selectedEstimate.boqSections || [])),
        pricingFactors: JSON.parse(JSON.stringify(selectedEstimate.pricingFactors || [])),
        costSummary: JSON.parse(JSON.stringify(selectedEstimate.costSummary || createEmptyCostSummary())),
        schedule: JSON.parse(JSON.stringify(selectedEstimate.schedule || [])),
        paymentTerms: JSON.parse(JSON.stringify(selectedEstimate.paymentTerms || [])),
        sentDetails: undefined,
        clientDecision: undefined,
        createdAt: today,
        updatedAt: today,
      });

      addItem('estimates', newEst);

      updateItem('enquiries', selectedEnquiry.id, {
        status: 'revision_requested',
        currentEstimateId: newEstId,
        estimateIds: [...(selectedEnquiry.estimateIds || []), newEstId],
        updatedAt: today,
      });

      logAudit({
        documentType: 'enquiry',
        documentId: selectedEnquiry.id,
        documentNumber: selectedEnquiry.enquiryNumber,
        action: 'REVISION_REQUESTED',
        performedBy: 'Current User',
        newStatus: 'revision_requested',
        details: `Client requested estimate revision. Generated new revision draft ${nextRevLabel}.`,
      });

      navigate(`/crm/estimates/builder/${selectedEnquiry.id}`);
    } else {
      // Mark as Rejected / Lost
      updateItem('estimates', selectedEstimate.id, {
        status: 'rejected',
        clientDecision: decisionData,
        updatedAt: today,
      });

      updateItem('enquiries', selectedEnquiry.id, {
        status: 'lost',
        updatedAt: today,
      });

      logAudit({
        documentType: 'enquiry',
        documentId: selectedEnquiry.id,
        documentNumber: selectedEnquiry.enquiryNumber,
        action: 'OPPORTUNITY_LOST',
        performedBy: 'Current User',
        newStatus: 'lost',
        details: `Quotation rejected by client. Reason: ${decisionData.lostReason}`,
      });
    }

    setIsDecisionModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">EMPIRE INTERIOR ERP</div>
          <h1 className="text-xl font-black tracking-tight text-white mt-0.5">CRM & Commercial Estimation</h1>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Enquiry pipeline, BOQ cost builder, commercial pricing factor rules, quotation proposals & client decision tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/crm/pricing-factors"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl border border-slate-700 transition-all"
          >
            <Shield className="h-4 w-4" /> Pricing Factors
          </Link>
          <Link
            to="/crm/enquiries/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" /> Add New Enquiry
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <CRMSummaryCards enquiries={enquiries} />

      {/* Recent Enquiries Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Recent Customer Enquiries</h2>
          <Link to="/crm/enquiries" className="text-amber-600 hover:underline font-bold flex items-center gap-1">
            View All Enquiries <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <EnquiriesTable
          enquiries={enquiries.slice(0, 5)}
          estimates={estimates}
          onRecordDecision={handleOpenDecisionModal}
        />
      </div>

      {/* Decision Modal */}
      {selectedEnquiry && selectedEstimate && (
        <ClientDecisionModal
          enquiry={selectedEnquiry}
          estimate={selectedEstimate}
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          onSubmitDecision={handleDecisionSubmit}
        />
      )}
    </div>
  );
};
