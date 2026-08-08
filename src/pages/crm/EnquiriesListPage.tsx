import React, { useState, useMemo } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CRMSummaryCards } from '../../components/crm/CRMSummaryCards';
import { EnquiryFilters } from '../../components/crm/EnquiryFilters';
import { EnquiriesTable } from '../../components/crm/EnquiriesTable';
import { ClientDecisionModal } from '../../components/crm/ClientDecisionModal';
import { Enquiry, Estimate } from '../../domain/types';

export const EnquiriesListPage: React.FC = () => {
  const { state, updateItem, addItem, logAudit } = useERPStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [estimatorFilter, setEstimatorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const enquiries = state.enquiries || [];
  const estimates = state.estimates || [];
  const clients = state.clients || [];
  const estimators = (state.employees || []).filter(
    (emp) => emp.departmentId === 'dept-est' || emp.roleId === 'ROLE-ESTIMATOR' || emp.roleId === 'ROLE-DIRECTOR'
  );

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const matchesSearch =
        searchTerm === '' ||
        enq.enquiryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.projectRequirement.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClient = clientFilter === 'all' || enq.clientId === clientFilter;
      const matchesEstimator = estimatorFilter === 'all' || enq.assignedEstimatorId === estimatorFilter;
      const matchesStatus = statusFilter === 'all' || enq.status === statusFilter;

      return matchesSearch && matchesClient && matchesEstimator && matchesStatus;
    });
  }, [enquiries, searchTerm, clientFilter, estimatorFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setClientFilter('all');
    setEstimatorFilter('all');
    setStatusFilter('all');
  };

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
      updateItem('estimates', selectedEstimate.id, { status: 'accepted', clientDecision: decisionData, updatedAt: today });
      updateItem('enquiries', selectedEnquiry.id, { status: 'won', updatedAt: today });
      logAudit({
        documentType: 'enquiry',
        documentId: selectedEnquiry.id,
        documentNumber: selectedEnquiry.enquiryNumber,
        action: 'TENDER_WON',
        performedBy: 'Current User',
        newStatus: 'won',
        details: `Quotation accepted by client. Enquiry marked as Tender Won.`,
      });
    } else if (decisionType === 'revision_requested') {
      const nextRevNum = selectedEstimate.revisionNumber + 1;
      const nextRevLabel = `R${nextRevNum}`;
      const newEstId = `est-${Date.now()}`;
      const newQuotationNo = `${selectedEstimate.quotationNumber.split('-R')[0]}-${nextRevLabel}`;

      updateItem('estimates', selectedEstimate.id, { status: 'superseded', updatedAt: today });
      const newEst: Estimate = {
        ...selectedEstimate,
        id: newEstId,
        revisionNumber: nextRevNum,
        revisionLabel: nextRevLabel,
        quotationNumber: newQuotationNo,
        status: 'draft',
        createdAt: today,
        updatedAt: today,
      };
      addItem('estimates', newEst);
      updateItem('enquiries', selectedEnquiry.id, {
        status: 'revision_requested',
        currentEstimateId: newEstId,
        estimateIds: [...selectedEnquiry.estimateIds, newEstId],
        updatedAt: today,
      });
    } else {
      updateItem('estimates', selectedEstimate.id, { status: 'rejected', clientDecision: decisionData, updatedAt: today });
      updateItem('enquiries', selectedEnquiry.id, { status: 'lost', updatedAt: today });
    }

    setIsDecisionModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Enquiries Register</h1>
          <p className="text-xs text-slate-500">Manage all incoming project leads, client requirements & estimate pipelines.</p>
        </div>
      </div>

      <CRMSummaryCards enquiries={enquiries} />

      <EnquiryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        clientFilter={clientFilter}
        onClientFilterChange={setClientFilter}
        estimatorFilter={estimatorFilter}
        onEstimatorFilterChange={setEstimatorFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        clients={clients}
        estimators={estimators}
        onResetFilters={handleResetFilters}
      />

      <EnquiriesTable
        enquiries={filteredEnquiries}
        estimates={estimates}
        onRecordDecision={handleOpenDecisionModal}
      />

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
