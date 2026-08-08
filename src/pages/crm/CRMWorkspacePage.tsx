import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Shield,
  Calculator,
  ExternalLink,
  Eye,
  X,
} from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { ClientDecisionModal } from '../../components/crm/ClientDecisionModal';
import { EstimateStatusBadge } from '../../components/crm/EstimateStatusBadge';
import { Enquiry, Estimate } from '../../domain/types';
import { normalizeEstimate, createEmptyCostSummary } from '../../utils/normalizeEstimate';
import { getCRMProjectState } from '../../utils/crmProjectHandoff';
import { formatIndianCurrency } from '../../utils/format';
import { getClientDisplayDetails, normalizeEnquiryRequirement, normalizeEstimatorName } from '../../utils/crmHelpers';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';

export const CRMWorkspacePage: React.FC = () => {
  const { state, addItem, updateItem, logAudit } = useERPStore();
  const navigate = useNavigate();

  // Unified Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [estimatorFilter, setEstimatorFilter] = useState('all');
  const [recordTypeFilter, setRecordTypeFilter] = useState<'all' | 'enquiry' | 'estimate' | 'quotation'>('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals State
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isPrepareModalOpen, setIsPrepareModalOpen] = useState(false);

  const enquiries = state.enquiries || [];
  const rawEstimates = state.estimates || [];
  const clients = state.clients || [];
  const projects = state.projects || [];
  const estimators = (state.employees || []).filter(
    (emp) => emp.departmentId === 'dept-est' || emp.roleId === 'ROLE-ESTIMATOR' || emp.roleId === 'ROLE-DIRECTOR'
  );

  const estimates = useMemo(() => {
    return rawEstimates.map(normalizeEstimate);
  }, [rawEstimates]);

  // Summary Metrics Calculations
  const metrics = useMemo(() => {
    const totalEnquiries = enquiries.length;
    const inProgress = enquiries.filter((e) => (e.status as any) === 'estimating' || e.status === 'new').length;
    const quotationsSent = enquiries.filter((e) => e.status === 'sent_to_client' || (e.status as any) === 'quotation_ready').length;
    const revisionRequested = enquiries.filter((e) => (e.status as any) === 'revision_requested').length;
    const tendersWon = enquiries.filter((e) => e.status === 'won').length;
    const opportunitiesLost = enquiries.filter((e) => e.status === 'lost').length;

    return {
      totalEnquiries,
      inProgress,
      quotationsSent,
      revisionRequested,
      tendersWon,
      opportunitiesLost,
    };
  }, [enquiries]);

  // Unified Workspace Register Records Mapping
  const registerRecords = useMemo(() => {
    const records: Array<{
      id: string;
      recordType: 'Enquiry' | 'Estimate' | 'Quotation';
      referenceNo: string;
      enquiryId: string;
      estimateId?: string;
      clientId: string;
      clientName: string;
      companyName?: string;
      requirement: string;
      location: string;
      estimatorName: string;
      status: string;
      latestValue: number;
      lastUpdated: string;
      enquiry: Enquiry;
      estimate?: Estimate;
      project?: any;
    }> = [];

    enquiries.forEach((enq) => {
      const est = estimates.find((e) => e.id === enq.currentEstimateId || e.enquiryId === enq.id);
      const linkedProj = projects.find((p) => p.id === (enq as any).projectId || p.sourceEnquiryId === enq.id);

      const client = clients.find((c) => c.id === enq.clientId);
      const clientDetails = getClientDisplayDetails(client);

      let recordType: 'Enquiry' | 'Estimate' | 'Quotation' = 'Enquiry';
      if (est) {
        recordType = est.status === 'sent_to_client' || est.status === 'accepted' ? 'Quotation' : 'Estimate';
      }

      const refNo = est?.quotationNumber || enq.enquiryNumber;
      const latestVal = est?.finalQuotationValue || est?.clientDecision?.acceptedValue || enq.expectedBudget || 0;

      records.push({
        id: `rec-${enq.id}`,
        recordType,
        referenceNo: refNo,
        enquiryId: enq.id,
        estimateId: est?.id,
        clientId: enq.clientId,
        clientName: clientDetails.clientName !== 'Not available in Client Master' ? clientDetails.clientName : enq.clientName,
        companyName: clientDetails.companyName !== 'N/A' ? clientDetails.companyName : undefined,
        requirement: normalizeEnquiryRequirement(enq.projectRequirement),
        location: clientDetails.billingAddress !== 'Not available in Client Master' ? clientDetails.billingAddress : enq.location,
        estimatorName: normalizeEstimatorName(enq.assignedEstimatorName),
        status: enq.status,
        latestValue: latestVal,
        lastUpdated: enq.updatedAt || enq.createdAt,
        enquiry: enq,
        estimate: est,
        project: linkedProj,
      });
    });

    return records;
  }, [enquiries, estimates, clients, projects]);

  // Filtered Register Records
  const filteredRecords = useMemo(() => {
    return registerRecords.filter((rec) => {
      const matchesSearch =
        searchTerm === '' ||
        rec.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.companyName && rec.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClient = clientFilter === 'all' || rec.clientId === clientFilter;
      const matchesEstimator =
        estimatorFilter === 'all' ||
        rec.enquiry.assignedEstimatorId === estimatorFilter ||
        rec.estimatorName.toLowerCase() === estimatorFilter.toLowerCase();

      const matchesRecordType =
        recordTypeFilter === 'all' || rec.recordType.toLowerCase() === recordTypeFilter.toLowerCase();

      const matchesStatus = statusFilter === 'all' || rec.status === statusFilter || (rec.estimate && rec.estimate.status === statusFilter);

      return matchesSearch && matchesClient && matchesEstimator && matchesRecordType && matchesStatus;
    });
  }, [registerRecords, searchTerm, clientFilter, estimatorFilter, recordTypeFilter, statusFilter]);

  // Actions Handlers
  const handleOpenDecisionModal = (enq: Enquiry, est: Estimate) => {
    setSelectedEnquiry(enq);
    setSelectedEstimate(est);
    setIsDecisionModalOpen(true);
  };

  const handleDecisionSubmit = (decisionType: 'accepted' | 'revision_requested' | 'rejected', decisionData: any) => {
    if (!selectedEnquiry || !selectedEstimate) return;
    const today = new Date().toISOString();

    if (decisionType === 'accepted') {
      updateItem('estimates', selectedEstimate.id, {
        status: 'accepted',
        clientDecision: decisionData,
        updatedAt: today,
      });
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
        details: `Quotation accepted by client. Enquiry marked as Tender Won. Value: ₹${decisionData.acceptedValue.toLocaleString('en-IN')}`,
      });
    } else if (decisionType === 'revision_requested') {
      const nextRevNum = (selectedEstimate.revisionNumber || 0) + 1;
      const nextRevLabel = `R${nextRevNum}`;
      const newEstId = `est-${Date.now()}`;
      const baseQuotationNo = selectedEstimate.quotationNumber.split('-R')[0] || selectedEstimate.quotationNumber;
      const newQuotationNo = `${baseQuotationNo}-${nextRevLabel}`;

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
    <ListPageLayout>
      {/* Header Banner */}
      <PageHeader
        title="CRM & Commercial Estimation"
        subtitle="Manage enquiries, estimates, quotations and client decisions from one place."
        breadcrumbs={[
          { label: 'Commercial Hub' },
          { label: 'CRM Workspace' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/crm/pricing-factors"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 transition-all text-xs shadow-2xs"
            >
              <Shield className="h-4 w-4 text-[#AB9570]" /> Pricing Factors
            </Link>

            <button
              type="button"
              onClick={() => setIsPrepareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
            >
              <Calculator className="h-4 w-4 text-[#AB9570]" /> Prepare Estimate
            </button>

            <Link
              to="/crm/enquiries/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-xl shadow-xs transition-all text-xs"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Add New Enquiry
            </Link>
          </div>
        }
      />

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Enquiries</div>
          <div className="text-xl font-black text-slate-900 mt-1">{metrics.totalEnquiries}</div>
          <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Active Pipeline</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-blue-600">In Progress</div>
          <div className="text-xl font-black text-blue-700 mt-1">{metrics.inProgress}</div>
          <div className="text-[10px] font-semibold text-blue-600/80 mt-0.5">Cost Estimation</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-indigo-600">Quotations Sent</div>
          <div className="text-xl font-black text-indigo-700 mt-1">{metrics.quotationsSent}</div>
          <div className="text-[10px] font-semibold text-indigo-600/80 mt-0.5">Awaiting Decision</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-amber-600">Revision Requested</div>
          <div className="text-xl font-black text-amber-700 mt-1">{metrics.revisionRequested}</div>
          <div className="text-[10px] font-semibold text-amber-600/80 mt-0.5">Re-quoting (R1/R2)</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-emerald-600">Tenders Won</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{metrics.tendersWon}</div>
          <div className="text-[10px] font-semibold text-emerald-600/80 mt-0.5">Accepted Proposals</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E6EC] shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-rose-600">Opportunities Lost</div>
          <div className="text-xl font-black text-rose-700 mt-1">{metrics.opportunitiesLost}</div>
          <div className="text-[10px] font-semibold text-rose-600/80 mt-0.5">Closed Rejected</div>
        </div>
      </div>

      {/* Common Filter Toolbar */}
      <FilterToolbar
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search reference no, client, requirement, location..."
        selectFilters={[
          {
            id: 'type',
            label: 'Type',
            value: recordTypeFilter,
            onChange: (val: any) => setRecordTypeFilter(val),
            options: [
              { value: 'all', label: 'All Record Types' },
              { value: 'enquiry', label: 'Enquiry' },
              { value: 'estimate', label: 'Estimate' },
              { value: 'quotation', label: 'Quotation' },
            ]
          },
          {
            id: 'client',
            label: 'Client',
            value: clientFilter,
            onChange: setClientFilter,
            options: [
              { value: 'all', label: 'All Clients' },
              ...clients.map((c) => ({ value: c.id, label: c.name || c.companyName || c.id }))
            ]
          },
          {
            id: 'estimator',
            label: 'Estimator',
            value: estimatorFilter,
            onChange: setEstimatorFilter,
            options: [
              { value: 'all', label: 'All Estimators' },
              ...estimators.map((e) => ({ value: e.id, label: e.name }))
            ]
          },
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'new', label: 'New Enquiry' },
              { value: 'estimation_in_progress', label: 'Estimation In Progress' },
              { value: 'quotation_ready', label: 'Quotation Ready' },
              { value: 'sent_to_client', label: 'Sent to Client' },
              { value: 'revision_requested', label: 'Revision Requested' },
              { value: 'won', label: 'Tender Won' },
              { value: 'lost', label: 'Lost' },
            ]
          }
        ]}
        onResetFilters={() => {
          setSearchTerm('');
          setClientFilter('all');
          setEstimatorFilter('all');
          setRecordTypeFilter('all');
          setStatusFilter('all');
        }}
        hasActiveFilters={searchTerm !== '' || clientFilter !== 'all' || estimatorFilter !== 'all' || recordTypeFilter !== 'all' || statusFilter !== 'all'}
      />

      {/* Unified Main CRM Register Table */}
      <div className="bg-white rounded-xl border border-[#E2E6EC] shadow-2xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3.5">Record Type</th>
                <th className="py-3 px-3.5">Reference No</th>
                <th className="py-3 px-3.5">Client Name</th>
                <th className="py-3 px-3.5">Requirement</th>
                <th className="py-3 px-3.5">Location</th>
                <th className="py-3 px-3.5">Estimator</th>
                <th className="py-3 px-3.5">Current Stage</th>
                <th className="py-3 px-3.5 text-right">Latest Value</th>
                <th className="py-3 px-3.5">Last Updated</th>
                <th className="py-3 px-3.5 text-right w-[190px] min-w-[190px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                    No records match your active search and filter options.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const enq = rec.enquiry;
                  const est = rec.estimate;

                  // Helper function to resolve row action based on stage
                  const getRowAction = () => {
                    const status = enq.status;
                    const estStatus = est?.status;

                    if (status === 'lost' || status === 'cancelled' || estStatus === 'rejected') {
                      return null;
                    }

                    if (status === 'won' || estStatus === 'accepted') {
                      const crmState = getCRMProjectState({
                        enquiry: enq,
                        estimate: est,
                        projects,
                        projectSetupDrafts: state.projectSetupDrafts || [],
                      });

                      if (crmState.state === 'ACTIVE_PROJECT_EXISTS') {
                        return {
                          type: 'open_project',
                          label: 'Open Project',
                          className: 'h-[34px] min-w-[118px] px-3.25 bg-white hover:bg-[#FAF8F4] text-[#1F2937] border border-[#D7DEE8] hover:border-[#AB9570] font-semibold text-xs rounded-[7px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs',
                          icon: <ExternalLink className="h-3.5 w-3.5 text-[#AB9570]" />,
                          route: `/projects/${crmState.projectId}`,
                        };
                      } else if (crmState.state === 'DRAFT_EXISTS') {
                        return {
                          type: 'continue_setup',
                          label: 'Continue Setup',
                          className: 'h-[34px] min-w-[118px] px-3.25 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-[7px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs',
                          route: `/projects/new?draftId=${crmState.draftId}`,
                        };
                      } else {
                        return {
                          type: 'create_project',
                          label: '+ Create Project',
                          className: 'h-[34px] min-w-[118px] px-3.25 bg-[#AB9570] hover:bg-[#927D5E] text-[#121214] font-semibold text-xs rounded-[7px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs',
                          route: `/projects/new?sourceEstimateRevisionId=${est?.id || enq.id}`,
                        };
                      }
                    }

                    if (status === 'revision_requested' || estStatus === 'revision_requested') {
                      return {
                        type: 'create_revision',
                        label: 'Create Revision',
                        className: 'h-[34px] min-w-[118px] px-3.25 bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] font-semibold text-xs rounded-[7px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs',
                        route: `/crm/estimates/builder/${enq.id}`,
                      };
                    }

                    if (status === 'sent_to_client' || estStatus === 'sent_to_client') {
                      return {
                        type: 'record_decision',
                        label: 'Record Decision',
                        className: 'h-[34px] min-w-[118px] px-3.25 bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-xs rounded-[7px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs',
                        onClick: () => handleOpenDecisionModal(enq, est!),
                      };
                    }

                    const s = status as string;
                    if (s === 'estimating' || s === 'estimation_in_progress' || s === 'in_progress') {
                      return {
                        type: 'build_estimate',
                        label: 'Build Estimate',
                        className: 'h-[34px] min-w-[118px] px-3.25 bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-xs rounded-[7px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs',
                        route: `/crm/estimates/builder/${enq.id}`,
                      };
                    }

                    if (status === 'new' && !est) {
                      return {
                        type: 'prepare_estimate',
                        label: 'Prepare Estimate',
                        className: 'h-[34px] min-w-[118px] px-3.25 bg-[#121214] hover:bg-[#252529] text-white font-semibold text-xs rounded-[7px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs',
                        route: `/crm/estimates/builder/${enq.id}`,
                      };
                    }

                    if (est && (estStatus === 'quotation_ready' || est.status === 'quotation_ready')) {
                      return {
                        type: 'review_quotation',
                        label: 'Review Quotation',
                        className: 'h-[34px] min-w-[118px] px-3.25 bg-[#475569] hover:bg-[#334155] text-white font-semibold text-xs rounded-[7px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs',
                        route: `/crm/estimates/${est.id}`,
                      };
                    }

                    if (est) {
                      return {
                        type: 'continue_estimate',
                        label: 'Continue Estimate',
                        className: 'h-[34px] min-w-[118px] px-3.25 bg-[#475569] hover:bg-[#334155] text-white font-semibold text-xs rounded-[7px] transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs',
                        route: `/crm/estimates/builder/${enq.id}`,
                      };
                    }

                    return null;
                  };

                  const action = getRowAction();

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors h-14">
                      {/* Record Type */}
                      <td className="py-3 px-3.5 align-middle">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                            rec.recordType === 'Quotation'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : rec.recordType === 'Estimate'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {rec.recordType}
                        </span>
                      </td>

                      {/* Reference No */}
                      <td className="py-3 px-3.5 align-middle font-mono font-bold text-slate-900">
                        <Link to={`/crm/enquiries/${enq.id}`} className="hover:text-[#AB9570]">
                          {rec.referenceNo}
                        </Link>
                        {est && est.revisionLabel && (
                          <span className="ml-1 text-[#AB9570] font-bold text-[10px]">({est.revisionLabel})</span>
                        )}
                      </td>

                      {/* Client Name */}
                      <td className="py-3 px-3.5 align-middle font-semibold text-slate-900">
                        <div>{rec.clientName}</div>
                        {rec.companyName && <div className="text-[10px] text-slate-400 font-normal">{rec.companyName}</div>}
                      </td>

                      {/* Requirement */}
                      <td className="py-3 px-3.5 align-middle text-slate-600 max-w-[200px] truncate" title={rec.requirement}>
                        {rec.requirement}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3.5 align-middle text-slate-500 text-[11px] max-w-[150px] truncate" title={rec.location}>
                        {rec.location}
                      </td>

                      {/* Estimator */}
                      <td className="py-3 px-3.5 align-middle font-medium text-slate-700">{rec.estimatorName}</td>

                      {/* Current Stage */}
                      <td className="py-3 px-3.5 align-middle">
                        <EstimateStatusBadge status={rec.status as any} />
                      </td>

                      {/* Latest Value */}
                      <td className="py-3 px-3.5 align-middle text-right font-mono font-bold text-slate-900">
                        {formatIndianCurrency(rec.latestValue)}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3 px-3.5 align-middle text-slate-500 font-mono text-[11px]">
                        {new Date(rec.lastUpdated || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 align-middle text-right whitespace-nowrap w-[190px] min-w-[190px]">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <Link
                            to={`/crm/enquiries/${enq.id}`}
                            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {action && (
                            action.onClick ? (
                              <button
                                type="button"
                                onClick={action.onClick}
                                className={action.className}
                              >
                                {action.icon}
                                {action.label}
                              </button>
                            ) : (
                              <Link
                                to={action.route!}
                                className={action.className}
                              >
                                {action.icon}
                                {action.label}
                              </Link>
                            )
                          )}
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

      {/* Prepare Estimate Modal */}
      {isPrepareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col text-xs">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570]">Select Enquiry</div>
                <h2 className="text-base font-bold text-white tracking-tight">Prepare Commercial Estimate</h2>
              </div>
              <button onClick={() => setIsPrepareModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-slate-500 font-medium">Choose an enquiry to open the commercial BOQ builder:</p>
              {enquiries.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No active enquiries found.</div>
              ) : (
                enquiries.map((enq) => {
                  const est = estimates.find((e) => e.id === enq.currentEstimateId || e.enquiryId === enq.id);
                  return (
                    <div
                      key={enq.id}
                      onClick={() => {
                        setIsPrepareModalOpen(false);
                        navigate(`/crm/estimates/builder/${enq.id}`);
                      }}
                      className="p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900">{enq.enquiryNumber}</div>
                        <div className="font-bold text-slate-800 text-xs mt-0.5">{enq.clientName}</div>
                        <div className="text-slate-500 text-[11px]">{enq.projectRequirement}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 bg-slate-900 text-[#AB9570] font-bold rounded-lg text-[10px]">
                          {est ? 'Edit BOQ' : 'Start Builder'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Client Decision Modal */}
      {selectedEnquiry && selectedEstimate && (
        <ClientDecisionModal
          enquiry={selectedEnquiry}
          estimate={selectedEstimate}
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          onSubmitDecision={handleDecisionSubmit}
        />
      )}
    </ListPageLayout>
  );
};
