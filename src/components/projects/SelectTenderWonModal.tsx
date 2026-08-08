import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Award, X, FolderPlus, CheckCircle2 } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../utils/format';
import {
  isAcceptedCRMOpportunity,
  getCRMProjectState,
  getAcceptedEstimateRevision,
} from '../../utils/crmProjectHandoff';
import { normalizeEstimate } from '../../utils/normalizeEstimate';

interface SelectTenderWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOpportunity: (params: { sourceEstimateRevisionId: string; draftId?: string }) => void;
}

export const SelectTenderWonModal: React.FC<SelectTenderWonModalProps> = ({
  isOpen,
  onClose,
  onSelectOpportunity,
}) => {
  const { state } = useERPStore();

  // Scroll lock document body while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const rawEnquiries = state.enquiries || [];
  const rawEstimates = state.estimates || [];
  const projects = state.projects || [];
  const projectSetupDrafts = state.projectSetupDrafts || [];

  // Find all accepted opportunities (using exact accepted revision)
  const availableOpportunities: { enquiry: any; estimate: any; crmState: any }[] = [];

  rawEnquiries.forEach((enq) => {
    const acceptedEst = getAcceptedEstimateRevision(enq.id, rawEstimates.map(normalizeEstimate));
    if (acceptedEst && isAcceptedCRMOpportunity(enq, acceptedEst)) {
      const crmState = getCRMProjectState({
        enquiry: enq,
        estimate: acceptedEst,
        projects,
        projectSetupDrafts,
      });

      // Include ONLY if no final active project exists (either NO_SETUP or DRAFT_EXISTS)
      if (crmState.state !== 'ACTIVE_PROJECT_EXISTS') {
        availableOpportunities.push({
          enquiry: enq,
          estimate: acceptedEst,
          crmState,
        });
      }
    }
  });

  const handleSelect = (item: { enquiry: any; estimate: any; crmState: any }) => {
    onClose();
    if (item.crmState.state === 'DRAFT_EXISTS') {
      onSelectOpportunity({ sourceEstimateRevisionId: item.estimate.id, draftId: item.crmState.draftId });
    } else {
      onSelectOpportunity({ sourceEstimateRevisionId: item.estimate.id });
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden text-xs my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#AB9570]/20 text-[#AB9570] rounded-xl border border-[#AB9570]/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Select Tender Won Opportunity</h2>
              <p className="text-[11px] text-slate-300">
                Convert an accepted CRM quotation baseline into a Project Draft.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {availableOpportunities.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-slate-800">
                No unlinked accepted CRM opportunities available.
              </div>
              <p className="text-slate-500 max-w-md mx-auto text-xs">
                All client-accepted estimates have already been converted into active projects or no client-accepted BOQ estimates exist.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Enquiry No</th>
                    <th className="py-3 px-4">Quotation No</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Accepted Rev</th>
                    <th className="py-3 px-4 text-right">Accepted Value</th>
                    <th className="py-3 px-4">Accepted Date</th>
                    <th className="py-3 px-4">Setup Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {availableOpportunities.map((item) => {
                    const { enquiry, estimate, crmState } = item;
                    const acceptedVal =
                      estimate.clientDecision?.acceptedValue ||
                      estimate.finalQuotationValue ||
                      enquiry?.expectedBudget ||
                      0;
                    const acceptedDate =
                      estimate.clientDecision?.decisionDate ||
                      estimate.acceptedAt ||
                      estimate.updatedAt ||
                      enquiry?.updatedAt;

                    return (
                      <tr key={estimate.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {enquiry?.enquiryNumber || 'ENQ-ACCEPTED'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#AB9570]">
                          {estimate.quotationNumber || 'QUO-ACCEPTED'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {estimate.clientName || enquiry?.clientName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {enquiry?.projectName || (estimate as any).projectName || (estimate as any).projectTitle || 'Fitout Project'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {estimate.revisionLabel || `V${estimate.revisionNumber || 1}`}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                          {formatIndianCurrency(acceptedVal)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(acceptedDate || Date.now()).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {crmState.state === 'DRAFT_EXISTS' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Setup In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Not Started
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {crmState.state === 'DRAFT_EXISTS' ? (
                            <button
                              type="button"
                              onClick={() => handleSelect(item)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              Continue Setup
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelect(item)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              <FolderPlus className="h-3.5 w-3.5 stroke-[2.5]" /> Create Project
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl font-bold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
