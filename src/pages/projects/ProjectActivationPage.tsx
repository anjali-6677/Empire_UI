import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Lock,
  Users,
  ShieldAlert,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { checkActivationEligibility } from '../../domain/selectors';
import { ProjectTeamAssignment } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';
import { validateProjectActivation } from '../../utils/projectActivationValidator';

export const ProjectActivationPage: React.FC = () => {
  const { estimateVersionId } = useParams<{ estimateVersionId?: string }>();
  const navigate = useNavigate();
  const { state, activateProject } = useERPStore();

  const targetVersionId = estimateVersionId || state.tenderDecisions.find((d) => d.outcome === 'accepted')?.estimateVersionId || 'est-ver-1';

  const eligibility = checkActivationEligibility(state, targetVersionId);
  const { eligible, reason, estimate, version } = eligibility;

  const [projectCode, setProjectCode] = useState(`PRJ-2026-${String(state.projects.length + 1).padStart(3, '0')}`);
  const [projectName, setProjectName] = useState(estimate ? `${(estimate as any).projectName || 'Interior Fitout'} Execution` : 'New Interior Project');
  const [siteLocation, setSiteLocation] = useState((estimate as any)?.siteLocation || 'Worli, Mumbai');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetCompletionDate, setTargetCompletionDate] = useState(
    new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0]
  );

  const [projectDirectorId, setProjectDirectorId] = useState('emp-1');
  const [projectSupervisorId, setProjectSupervisorId] = useState('emp-2');
  const [isBOQConfirmed, setIsBOQConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableEmployees = state.employees;

  const [team] = useState<ProjectTeamAssignment[]>([
    { employeeId: 'emp-1', employeeName: 'Rajesh Sharma', role: 'Project Director', assignedDate: new Date().toISOString().split('T')[0] },
    { employeeId: 'emp-2', employeeName: 'Amit Verma', role: 'Project Supervisor', assignedDate: new Date().toISOString().split('T')[0] },
    { employeeId: 'emp-4', employeeName: 'Sunil Mehta', role: 'Procurement Lead', assignedDate: new Date().toISOString().split('T')[0] },
  ]);

  // Project Object Draft for shared validation
  const currentProjectDraft = {
    projectName,
    projectCode,
    clientId: estimate?.clientId || 'client-1',
    clientName: estimate?.clientName || 'Acme Corp',
    sourceEstimateId: estimate?.id || targetVersionId,
    acceptedBOQSnapshot: version?.lines || [],
    projectDirectorId,
    projectSupervisorId,
    startDate,
    targetCompletionDate,
    activities: [
      { id: 'act-1', activityName: 'Site Survey', startDate, endDate: targetCompletionDate, responsibleEmployeeId: projectDirectorId, responsibleEmployeeName: 'Rajesh Sharma', status: 'not_started', delayDays: 0, completionPercentage: 0 },
    ],
  };

  const activationValidation = validateProjectActivation(currentProjectDraft as any);



  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isBOQConfirmed) {
      setErrorMsg('You must confirm BOQ baseline locking before activating the project.');
      return;
    }

    if (!activationValidation.canActivate) {
      setErrorMsg(`Project cannot be activated. ${activationValidation.missingCount} requirement(s) are missing.`);
      return;
    }

    const director = availableEmployees.find((e) => e.id === projectDirectorId);
    const supervisor = availableEmployees.find((e) => e.id === projectSupervisorId);

    const result = activateProject({
      estimateVersionId: targetVersionId,
      projectCode,
      projectName,
      siteLocation,
      startDate,
      targetCompletionDate,
      projectDirectorId,
      projectDirectorName: director?.name || 'Rajesh Sharma',
      projectSupervisorId,
      projectSupervisorName: supervisor?.name || 'Amit Verma',
      team,
      performedBy: director?.name || 'System Admin',
    });

    if (result.success && result.project) {
      navigate(`/projects/${result.project.id}`);
    } else {
      setErrorMsg(result.error || 'Failed to activate project.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 font-sans text-xs space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Link to="/crm/won" className="hover:text-slate-800 flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Tender Won Projects
            </Link>
            <span>/</span>
            <span>Project Activation</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#AB9570]" /> Convert Accepted Estimate to Active Project Baseline
          </h1>
        </div>
      </div>

      {!eligible && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="h-5 w-5 text-rose-600" /> Project Activation Precondition Check Failed
          </div>
          <p className="text-xs text-rose-800">{reason}</p>
          <div className="flex gap-3 pt-1">
            <Link
              to="/crm/won"
              className="px-3 py-1.5 bg-[#AB9570] text-slate-950 rounded font-bold hover:bg-[#927D5E] transition"
            >
              View Tender Won Opportunities
            </Link>
            <Link
              to="/projects"
              className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 rounded font-medium hover:bg-rose-100 transition"
            >
              View Active Projects
            </Link>
          </div>
        </div>
      )}

      {eligible && version && estimate && (
        <form onSubmit={handleActivateSubmit} className="space-y-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800 font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" /> {errorMsg}
            </div>
          )}

          {/* Shared 9-Criteria Activation Checklist Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Shared Project Activation Validation Checklist (9 Criteria)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {activationValidation.checks.map((check) => (
                <div
                  key={check.code}
                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                    check.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  {check.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                  <span>{check.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 1: Linked Tender & Estimate Baseline */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-slate-600" /> Section 1: Linked Tender & Locked BOQ Baseline
              </div>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                Tender Won / Accepted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[10px]">Estimate Document</span>
                <span className="font-bold text-slate-800">{(estimate as any).documentNumber || estimate.quotationNumber} (Version #{version.versionNumber || 'R0'})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Client Reference PO</span>
                <span className="font-bold text-slate-800">PO-2026-CLIENT-OK</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Accepted Selling Value</span>
                <span className="font-bold text-emerald-700">{formatIndianCurrency(version.totalSellingValue || version.finalQuotationValue || 4850000)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Budget Baseline Cost</span>
                <span className="font-bold text-slate-800">{formatIndianCurrency(version.totalLandedCost || version.internalTotalCost || 4110000)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Project Metadata */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
            <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Briefcase className="h-4 w-4 text-slate-600" /> Section 2: Project Identification & Schedule
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Code *</label>
                <input
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 focus:outline-none"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Project Name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Site Location / Address *</label>
                <input
                  type="text"
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Planned Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Completion Date *</label>
                <input
                  type="date"
                  value={targetCompletionDate}
                  onChange={(e) => setTargetCompletionDate(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Leadership */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
            <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Users className="h-4 w-4 text-slate-600" /> Section 3: Project Leadership
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Director *</label>
                <select
                  value={projectDirectorId}
                  onChange={(e) => setProjectDirectorId(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Supervisor *</label>
                <select
                  value={projectSupervisorId}
                  onChange={(e) => setProjectSupervisorId(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: BOQ Lock Confirmation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="font-bold text-amber-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-700" /> Section 4: Domain Guardrail & BOQ Baseline Confirmation
            </div>
            <p className="text-xs text-amber-800">
              Activating this project converts the CRM Estimate into an immutable Project BOQ baseline. All material indents and execution orders will validate against these baseline quantities.
            </p>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 pt-1">
              <input
                type="checkbox"
                checked={isBOQConfirmed}
                onChange={(e) => setIsBOQConfirmed(e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-400 h-4 w-4"
              />
              <span>I confirm that the BOQ line quantities, rates, and values are verified and ready to be locked into baseline.</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <Link
              to="/crm/won"
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isBOQConfirmed || !activationValidation.canActivate}
              className={`px-5 py-2 rounded font-bold text-slate-950 flex items-center gap-2 transition shadow ${
                isBOQConfirmed && activationValidation.canActivate
                  ? 'bg-[#AB9570] hover:bg-[#927D5E] cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="h-4 w-4" /> Activate Project Baseline ({projectCode})
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
