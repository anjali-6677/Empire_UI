import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calculator,
  Send,
  CheckCircle2,
  RotateCcw,
  FileText,
  Clock,
  Layers,
  FolderOpen,
  Award,
} from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { EnquiryStatusBadge } from '../../components/crm/EnquiryStatusBadge';
import { RevisionHistoryTable } from '../../components/crm/RevisionHistoryTable';
import { ActivityTimeline } from '../../components/crm/ActivityTimeline';
import { QuotationPreview } from '../../components/crm/QuotationPreview';
import { ClientDecisionModal } from '../../components/crm/ClientDecisionModal';
import { SendQuotationModal } from '../../components/crm/SendQuotationModal';
import { BOQSectionEditor } from '../../components/crm/BOQSectionEditor';
import { formatIndianCurrency } from '../../utils/format';
import { Estimate } from '../../domain/types';
import { normalizeEstimate, createEmptyCostSummary } from '../../utils/normalizeEstimate';

export const EnquiryOverviewPage: React.FC = () => {
  const { enquiryId } = useParams<{ enquiryId: string }>();
  const navigate = useNavigate();
  const { state, updateItem, addItem, logAudit } = useERPStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'boq' | 'quotation' | 'revisions' | 'decision' | 'documents' | 'activities'
  >('overview');

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  const enquiry = state.enquiries.find((e) => e.id === enquiryId || e.enquiryNumber === enquiryId);
  const rawEstimates = state.estimates.filter((e) => e.enquiryId === enquiry?.id || e.enquiryId === enquiryId);
  const estimates = useMemo(() => rawEstimates.map(normalizeEstimate), [rawEstimates]);
  const currentEstimate = estimates.find((e) => e.id === enquiry?.currentEstimateId) || estimates[0];

  if (!enquiry) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-900">Enquiry Not Found</h2>
        <p className="text-xs text-slate-500">The requested customer enquiry could not be found.</p>
        <Link to="/crm/enquiries" className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs">
          Return to Enquiries List
        </Link>
      </div>
    );
  }

  const isTenderWon = enquiry.status === 'won';
  const isSentToClient = enquiry.status === 'sent_to_client';

  const handleDecisionSubmit = (decisionType: 'accepted' | 'revision_requested' | 'rejected', decisionData: any) => {
    if (!currentEstimate) return;
    const today = new Date().toISOString();

    if (decisionType === 'accepted') {
      updateItem('estimates', currentEstimate.id, { status: 'accepted', clientDecision: decisionData, updatedAt: today });
      updateItem('enquiries', enquiry.id, { status: 'won', updatedAt: today });
      logAudit({
        documentType: 'enquiry',
        documentId: enquiry.id,
        documentNumber: enquiry.enquiryNumber,
        action: 'TENDER_WON',
        performedBy: 'Current User',
        newStatus: 'won',
        details: `Quotation ${currentEstimate.quotationNumber} accepted. Enquiry marked as Tender Won. Value: ₹${decisionData.acceptedValue.toLocaleString('en-IN')}`,
      });
    } else if (decisionType === 'revision_requested') {
      const nextRevNum = (currentEstimate.revisionNumber || 0) + 1;
      const nextRevLabel = `R${nextRevNum}`;
      const newEstId = `est-${Date.now()}`;
      const baseQuotationNo = currentEstimate.quotationNumber.split('-R')[0] || currentEstimate.quotationNumber;
      const newQuotationNo = `${baseQuotationNo}-${nextRevLabel}`;

      updateItem('estimates', currentEstimate.id, { status: 'superseded', updatedAt: today });
      const newEst: Estimate = normalizeEstimate({
        ...currentEstimate,
        id: newEstId,
        revisionNumber: nextRevNum,
        revisionLabel: nextRevLabel,
        quotationNumber: newQuotationNo,
        status: 'draft',
        boqSections: JSON.parse(JSON.stringify(currentEstimate.boqSections || [])),
        pricingFactors: JSON.parse(JSON.stringify(currentEstimate.pricingFactors || [])),
        costSummary: JSON.parse(JSON.stringify(currentEstimate.costSummary || createEmptyCostSummary())),
        schedule: JSON.parse(JSON.stringify(currentEstimate.schedule || [])),
        paymentTerms: JSON.parse(JSON.stringify(currentEstimate.paymentTerms || [])),
        sentDetails: undefined,
        clientDecision: undefined,
        createdAt: today,
        updatedAt: today,
      });
      addItem('estimates', newEst);
      updateItem('enquiries', enquiry.id, {
        status: 'revision_requested',
        currentEstimateId: newEstId,
        estimateIds: [...(enquiry.estimateIds || []), newEstId],
        updatedAt: today,
      });

      navigate(`/crm/estimates/builder/${enquiry.id}`);
    } else {
      updateItem('estimates', currentEstimate.id, { status: 'rejected', clientDecision: decisionData, updatedAt: today });
      updateItem('enquiries', enquiry.id, { status: 'lost', updatedAt: today });
    }

    setIsDecisionModalOpen(false);
  };

  const handleConfirmSendQuotation = (deliveryMethod: 'email' | 'whatsapp' | 'manual') => {
    if (!currentEstimate) return;
    const today = new Date().toISOString();

    updateItem('estimates', currentEstimate.id, {
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
      documentId: currentEstimate.id,
      documentNumber: currentEstimate.quotationNumber,
      action: 'SENT_TO_CLIENT',
      performedBy: 'Current Estimator',
      newStatus: 'sent_to_client',
      details: `Quotation ${currentEstimate.quotationNumber} dispatched to client via ${deliveryMethod}.`,
    });

    setIsSendModalOpen(false);
  };

  const handleCreateProjectDraft = () => {
    if (!currentEstimate) return;
    navigate(`/projects/new?sourceEstimateRevisionId=${currentEstimate.id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/crm/enquiries')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-sm">{enquiry.enquiryNumber}</span>
                <EnquiryStatusBadge status={enquiry.status} />
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight mt-0.5">{enquiry.clientName}</h1>
              <p className="text-xs text-slate-300 font-medium">{enquiry.projectRequirement}</p>
            </div>
          </div>

          {/* Dynamic Main Action Button */}
          <div className="flex flex-wrap items-center gap-2">
            {isTenderWon ? (
              (() => {
                const linkedProj = state.projects.find(
                  (p: any) =>
                    p.sourceEnquiryId === enquiry.id ||
                    p.enquiryId === enquiry.id ||
                    (currentEstimate && (p.sourceEstimateRevisionId === currentEstimate.id || p.acceptedEstimateId === currentEstimate.id)) ||
                    p.id === (enquiry as any).projectId
                );

                if (linkedProj) {
                  const proj = linkedProj as any;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="text-right text-[11px]">
                        <div className="text-emerald-400 font-bold">Project Created: Yes</div>
                        <div className="text-slate-300 font-mono font-semibold">Code: {proj.projectCode || proj.code || 'PRJ-ACTIVE'} ({proj.status || proj.projectStatus || 'Active'})</div>
                      </div>
                      <Link
                        to={`/projects/${proj.id}`}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-lg transition-all"
                      >
                        <FolderOpen className="h-4 w-4 stroke-[2.5]" /> Open Project
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link
                    to={`/projects/new?sourceEstimateRevisionId=${currentEstimate.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-lg transition-all"
                  >
                    <Award className="h-4 w-4 stroke-[2.5]" /> Create Project
                  </Link>
                );
              })()
            ) : isSentToClient ? (
              <button
                type="button"
                onClick={() => setIsDecisionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl shadow-md"
              >
                <CheckCircle2 className="h-4 w-4 stroke-[2.5]" /> Record Client Decision
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/crm/estimates/builder/${enquiry.id}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-md"
              >
                <Calculator className="h-4 w-4 stroke-[2.5]" /> Prepare / Edit Estimate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 7 Tabs Header */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-1 text-xs">
        {[
          { id: 'overview', label: '1. Overview', icon: FileText },
          { id: 'boq', label: '2. Estimate & BOQ', icon: Layers },
          { id: 'quotation', label: '3. Proposal Package', icon: Send },
          { id: 'revisions', label: `4. Revisions (${estimates.length})`, icon: RotateCcw },
          { id: 'decision', label: '5. Client Decision', icon: Award },
          { id: 'documents', label: '6. Documents', icon: FolderOpen },
          { id: 'activities', label: '7. Activity History', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Enquiry Specification Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Client Name</span>
                <p className="font-bold text-slate-900 text-sm">{enquiry.clientName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Contact Person</span>
                <p className="font-semibold text-slate-800">{enquiry.contactPerson || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Project Requirement</span>
                <p className="font-medium text-slate-800">{enquiry.projectRequirement}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Location</span>
                <p className="font-medium text-slate-800">{enquiry.location}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Expected Budget</span>
                <p className="font-mono font-bold text-amber-600">{formatIndianCurrency(enquiry.expectedBudget)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Estimator</span>
                <p className="font-bold text-slate-900">{enquiry.assignedEstimatorName}</p>
              </div>
            </div>
            {enquiry.requirementNotes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Technical Notes</span>
                <p className="text-slate-700 italic mt-0.5">{enquiry.requirementNotes}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Commercial Status</h3>
            <div className="space-y-3 font-mono">
              <div>
                <div className="text-[10px] text-slate-400">Current Revision</div>
                <div className="text-lg font-bold text-white">{currentEstimate?.revisionLabel || 'R0'}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Quotation Value</div>
                <div className="text-2xl font-extrabold text-amber-400">
                  {formatIndianCurrency(currentEstimate?.finalQuotationValue || enquiry.expectedBudget)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Estimate & BOQ */}
      {activeTab === 'boq' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Current BOQ Line Items</h3>
            {currentEstimate && currentEstimate.status !== 'accepted' && (
              <button
                onClick={() => navigate(`/crm/estimates/builder/${enquiry.id}`)}
                className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Edit Estimate BOQ
              </button>
            )}
          </div>
          {currentEstimate ? (
            <BOQSectionEditor
              sections={currentEstimate.boqSections}
              onChange={() => {}}
              categories={state.categories}
              products={state.products}
              units={state.units}
              readOnly={true}
            />
          ) : (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
              No estimate prepared yet. Click "Prepare Estimate" to build the BOQ.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Proposal Package */}
      {activeTab === 'quotation' && (
        <div>
          {currentEstimate ? (
            <QuotationPreview
              enquiry={enquiry}
              estimate={currentEstimate}
              onSendToClient={() => setIsSendModalOpen(true)}
              readOnly={enquiry.status === 'won'}
            />
          ) : (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
              No quotation package ready yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Revisions */}
      {activeTab === 'revisions' && (
        <RevisionHistoryTable
          estimates={estimates}
          currentEstimateId={enquiry.currentEstimateId}
          enquiryId={enquiry.id}
        />
      )}

      {/* Tab 5: Client Decision */}
      {activeTab === 'decision' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Client Decision Status</h3>
          {isTenderWon ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-3">
              <div className="font-bold text-base flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" /> Tender Won! Quotation Accepted.
              </div>
              <p className="text-xs text-emerald-800">
                Accepted Value: <span className="font-mono font-bold">{formatIndianCurrency(currentEstimate?.clientDecision?.acceptedValue || currentEstimate?.finalQuotationValue || 0)}</span>
              </p>
              <button
                onClick={() => setShowCreateProjectModal(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
              >
                Create Project Draft
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
            >
              Record Client Decision
            </button>
          )}
        </div>
      )}

      {/* Tab 6: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Enquiry Attachment Documents</h3>
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
            Upload site floor plans, client BOQ sheets, LOI copies here.
          </div>
        </div>
      )}

      {/* Tab 7: Activities */}
      {activeTab === 'activities' && (
        <ActivityTimeline activities={enquiry.activities || []} />
      )}

      {/* Decision Modal */}
      {currentEstimate && (
        <ClientDecisionModal
          enquiry={enquiry}
          estimate={currentEstimate}
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          onSubmitDecision={handleDecisionSubmit}
        />
      )}

      {/* Send Modal */}
      {currentEstimate && (
        <SendQuotationModal
          enquiry={enquiry}
          estimate={currentEstimate}
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          onConfirmSend={handleConfirmSendQuotation}
        />
      )}

      {/* Create Project Confirmation Modal */}
      {showCreateProjectModal && currentEstimate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <Award className="h-5 w-5" /> Confirm Project Draft Creation
            </div>
            <p className="text-slate-600">
              Create a new Project Draft using the accepted Client ID, Enquiry ID, Estimate ID, and baseline BOQ value.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono text-slate-800">
              <div>Client: <span className="font-bold text-slate-900">{enquiry.clientName}</span></div>
              <div>Baseline BOQ Value: <span className="font-bold text-amber-600">{formatIndianCurrency(currentEstimate.finalQuotationValue)}</span></div>
              <div>Revision: <span className="font-bold">{currentEstimate.revisionLabel}</span></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCreateProjectModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl">
                Cancel
              </button>
              <button onClick={handleCreateProjectDraft} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl shadow-md">
                Confirm & Create Project Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
