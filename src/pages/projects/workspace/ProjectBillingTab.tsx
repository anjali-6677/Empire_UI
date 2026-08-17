import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';
import { Project, ProjectBillingMilestone, ClientRABill } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';
import { useERPStore } from '../../../store/ERPStoreContext';

interface ProjectBillingTabProps {
  project: Project;
}

export const ProjectBillingTab: React.FC<ProjectBillingTabProps> = ({ project }) => {
  const navigate = useNavigate();
  const { state, manuallyTriggerBillingMilestone } = useERPStore();

  const [selectedMilestone, setSelectedMilestone] = useState<ProjectBillingMilestone | null>(null);
  const [manualNotes, setManualNotes] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const contractVal = project.acceptedQuotationValue || project.currentBOQValue || project.budgetBaseline || 0;
  const milestones: ProjectBillingMilestone[] = project.billingMilestones || [];

  // Find all client RA bills for this project in store
  const projectRABills: ClientRABill[] = (state.clientRABills || []).filter(
    (b) => b.projectId === project.id
  );

  // Financial KPI calculations
  const totalBilled = projectRABills.reduce((sum, b) => sum + (b.claimedAmount || b.grossWorkValue || 0), 0);
  const approvedRABills = projectRABills.filter((b) => b.billStatus === 'Approved' || b.billStatus === 'Sent to Client');
  const certifiedRevenue = approvedRABills.reduce((sum, b) => sum + (b.netReceivable || 0), 0);
  const totalCollections = projectRABills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalOutstanding = projectRABills.reduce((sum, b) => sum + (b.outstandingAmount || 0), 0);

  const handleManualTriggerSubmit = () => {
    if (!selectedMilestone) return;
    setIsSubmittingManual(true);
    const res = manuallyTriggerBillingMilestone(project.id, selectedMilestone.id, manualNotes, 'Project Director');
    setIsSubmittingManual(false);
    if (res.success) {
      alert(`Milestone '${selectedMilestone.name}' triggered successfully! RA Bill generated in Pending Approval state.`);
      setSelectedMilestone(null);
      setManualNotes('');
    } else {
      alert(res.error || 'Failed to trigger milestone');
    }
  };

  const getMilestoneBadge = (status: ProjectBillingMilestone['billingStatus']) => {
    switch (status) {
      case 'NOT_TRIGGERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" /> Pending Trigger
          </span>
        );
      case 'RA_PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" /> RA Bill Pending Approval
          </span>
        );
      case 'RA_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" /> RA Bill Approved
          </span>
        );
      case 'SENT_TO_CLIENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Send className="w-3 h-3 text-sky-600" /> Issued to Client
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <DollarSign className="w-3 h-3 text-indigo-600" /> Partially Paid
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fully Paid
          </span>
        );
      case 'RA_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> RA Rejected
          </span>
        );
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Contract Value</span>
          <div className="text-lg font-black text-slate-900 font-mono">{formatIndianCurrency(contractVal)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Accepted CRM Commercial Baseline</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Gross Billed Value</span>
          <div className="text-lg font-black text-slate-800 font-mono">{formatIndianCurrency(totalBilled)}</div>
          <div className="text-[10px] text-slate-500 mt-1">{projectRABills.length} Client RA Bills Generated</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Approved Net Receivable</span>
          <div className="text-lg font-black text-emerald-700 font-mono">{formatIndianCurrency(certifiedRevenue)}</div>
          <div className="text-[10px] text-emerald-600 mt-1">Finance Approved RA Bills</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Collections Received</span>
          <div className="text-lg font-black text-blue-700 font-mono">{formatIndianCurrency(totalCollections)}</div>
          <div className="text-[10px] text-blue-600 mt-1">Realized Bank Payments</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Outstanding Receivable</span>
          <div className="text-lg font-black text-amber-700 font-mono">{formatIndianCurrency(totalOutstanding)}</div>
          <div className="text-[10px] text-amber-600 mt-1">Pending Payment Realization</div>
        </div>
      </div>

      {/* Payment Terms Baseline & Milestone Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#AB9570]" /> Commercial Payment Milestone Schedule (CRM Baseline)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Contractual billing schedule snapshotted at project setup. Triggers automatically execute Client RA Bills upon stage/progress completion.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#AB9570]/10 text-[#AB9570] border border-[#AB9570]/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Baseline ({milestones.length} Milestones)
          </span>
        </div>

        {milestones.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No billing milestones snapshotted for this project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 text-center">Seq</th>
                  <th className="py-3 px-4">Milestone Name</th>
                  <th className="py-3 px-4 text-center">Share %</th>
                  <th className="py-3 px-4 text-right">Milestone Amount</th>
                  <th className="py-3 px-4">Trigger Condition</th>
                  <th className="py-3 px-4">Billing Status</th>
                  <th className="py-3 px-4">Linked RA Bill</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {milestones.map((m) => {
                  const mAmount = m.amount || Math.round(contractVal * (m.percentage / 100));

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center font-bold font-mono text-slate-600">{m.sequence}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {m.name}
                        {m.manualOverrideBy && (
                          <span className="block text-[9.5px] text-purple-600 font-normal mt-0.5">
                            ⚡ Manually Authorized by {m.manualOverrideBy}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{m.percentage}%</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                        {formatIndianCurrency(mAmount)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        <span className="font-semibold text-slate-800">{m.triggerDescription || m.triggerType}</span>
                        {m.triggeredAt && (
                          <div className="text-[9.5px] text-slate-400 mt-0.5 font-mono">
                            Triggered: {new Date(m.triggeredAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{getMilestoneBadge(m.billingStatus)}</td>
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        {m.raBillNumber ? (
                          <Link
                            to={`/finance/client-ra-bills?billNumber=${m.raBillNumber}`}
                            className="inline-flex items-center gap-1 text-[#AB9570] hover:underline font-bold"
                          >
                            <span>{m.raBillNumber}</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">Not Generated</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {m.billingStatus === 'NOT_TRIGGERED' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedMilestone(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[10.5px] transition-all cursor-pointer shadow-xs"
                          >
                            <Zap className="h-3 w-3 fill-slate-950" /> Trigger RA Bill
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Triggered</span>
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

      {/* Auto-Generated Client RA Bills Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#AB9570]" /> Project Client RA Bills Register
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live RA Bills generated automatically by the milestone trigger engine or manual authorization.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/finance/client-ra-bills')}
            className="text-xs font-bold text-[#AB9570] hover:underline flex items-center gap-1"
          >
            Go to Finance Client RA Bills Register &rarr;
          </button>
        </div>

        {projectRABills.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold">No Client RA Bills created yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bills will automatically generate as milestone triggers (e.g. stage completion, 70% trade progress) are met during project execution.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Bill Number</th>
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Bill Date</th>
                  <th className="py-3 px-4 text-right">Gross Claimed</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Receivable</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4 text-right">Paid Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {projectRABills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold">
                      <Link to={`/finance/client-ra-bills?billNumber=${bill.billNumber}`} className="text-[#AB9570] hover:underline">
                        {bill.billNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">{bill.milestoneName}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{bill.billDate}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {formatIndianCurrency(bill.claimedAmount || bill.grossWorkValue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                      {formatIndianCurrency(bill.totalDeductions || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {formatIndianCurrency(bill.netReceivable)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {bill.billStatus === 'Pending Approval' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Approval
                        </span>
                      ) : bill.billStatus === 'Approved' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Approved
                        </span>
                      ) : bill.billStatus === 'Sent to Client' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          Sent to Client
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {bill.billStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatIndianCurrency(bill.paidAmount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Trigger Authorization Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> Manually Trigger Milestone RA Bill
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMilestone(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <div className="font-bold text-amber-900">{selectedMilestone.name}</div>
                <div className="text-[11px] text-amber-700">
                  Percentage: <strong>{selectedMilestone.percentage}%</strong> • Amount:{' '}
                  <strong>
                    {formatIndianCurrency(selectedMilestone.amount || Math.round(contractVal * (selectedMilestone.percentage / 100)))}
                  </strong>
                </div>
                <div className="text-[10.5px] text-amber-600 mt-1">
                  Trigger condition: {selectedMilestone.triggerDescription}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Authorization Notes / Reason (Optional)
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Enter reason for manual billing release (e.g. Director verbal approval, early material mobilization)..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#AB9570] focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10.5px] text-slate-600">
                ⚠️ This will generate Client RA Bill for{' '}
                <strong>
                  {formatIndianCurrency(selectedMilestone.amount || Math.round(contractVal * (selectedMilestone.percentage / 100)))}
                </strong>{' '}
                directly in <strong>Pending Approval</strong> state and lock this milestone against duplicate bill creation.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedMilestone(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualTriggerSubmit}
                disabled={isSubmittingManual}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isSubmittingManual ? 'Generating RA Bill...' : 'Authorize & Generate RA Bill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
