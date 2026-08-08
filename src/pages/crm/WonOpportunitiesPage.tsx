import React from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, ArrowRight, ExternalLink, Clock } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../utils/format';
import { getCRMProjectState } from '../../utils/crmProjectHandoff';
import { normalizeEstimate } from '../../utils/normalizeEstimate';

export const WonOpportunitiesPage: React.FC = () => {
  const { state } = useERPStore();

  const wonEnquiries = (state.enquiries || []).filter((e) => e.status === 'won');
  const rawEstimates = state.estimates || [];
  const projects = state.projects || [];
  const projectSetupDrafts = state.projectSetupDrafts || [];

  const estimates = rawEstimates.map(normalizeEstimate);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-xs bg-slate-50 min-h-screen">
      {/* Light Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570] flex items-center gap-1.5">
            <Award className="h-4 w-4" /> Commercial Pipeline Success
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Tender Won Opportunities</h1>
          <p className="text-xs text-slate-500 max-w-xl mt-1">
            Accepted client quotations ready for project setup and execution handoff.
          </p>
        </div>

        <Link
          to="/crm"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300"
        >
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to CRM Workspace
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3.5 px-4">Enquiry No</th>
              <th className="py-3.5 px-4">Quotation No</th>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4 text-right">Approved Value</th>
              <th className="py-3.5 px-4">Accepted Date</th>
              <th className="py-3.5 px-4">Project Created</th>
              <th className="py-3.5 px-4">Project Code</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {wonEnquiries.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No won opportunities recorded yet.
                </td>
              </tr>
            ) : (
              wonEnquiries.map((enq) => {
                const est = estimates.find((e) => e.id === enq.currentEstimateId || e.enquiryId === enq.id) || estimates.find((e) => e.status === 'accepted');
                const acceptedVal = est?.clientDecision?.acceptedValue || est?.finalQuotationValue || enq.expectedBudget || 0;
                const acceptedDate = est?.clientDecision?.decisionDate || est?.updatedAt || enq.updatedAt;

                const crmState = getCRMProjectState({
                  enquiry: enq,
                  estimate: est,
                  projects,
                  projectSetupDrafts,
                });

                return (
                  <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link to={`/crm/enquiries/${enq.id}`} className="hover:text-[#AB9570]">
                        {enq.enquiryNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#AB9570]">
                      {est?.quotationNumber || 'QUO-ACCEPTED'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{enq.clientName}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {formatIndianCurrency(acceptedVal)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(acceptedDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      {crmState.state === 'ACTIVE_PROJECT_EXISTS' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active Project
                        </span>
                      ) : crmState.state === 'DRAFT_EXISTS' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Clock className="h-3 w-3 text-indigo-600" /> Setup In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                          No Setup
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {crmState.state === 'ACTIVE_PROJECT_EXISTS' ? crmState.project.projectCode : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {crmState.state === 'ACTIVE_PROJECT_EXISTS' ? (
                        <Link
                          to={`/projects/${crmState.projectId}`}
                          className="px-3 py-1.5 bg-white hover:bg-[#F8F9FB] border border-[#D8DEE8] hover:border-[#AB9570] text-[#1F2937] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-[#AB9570]" /> Open Project
                        </Link>
                      ) : crmState.state === 'DRAFT_EXISTS' ? (
                        <Link
                          to={`/projects/new?draftId=${crmState.draftId}`}
                          className="px-3 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-[#121214] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                        >
                          Continue Setup
                        </Link>
                      ) : (
                        <Link
                          to={`/projects/new?sourceEstimateRevisionId=${est?.id || (enq as any).acceptedEstimateId || enq.id}`}
                          className="px-3 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-[#121214] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                        >
                          Create Project
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
