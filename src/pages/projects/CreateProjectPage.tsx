import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { ProjectSetupDraft } from '../../domain/types';
import { startProjectSetupFromAcceptedEstimate } from '../../utils/crmProjectHandoff';

import { WizardStepperNav } from '../../components/projects/wizard/WizardStepperNav';
import { Step1BasicDetails } from '../../components/projects/wizard/Step1BasicDetails';
import { Step2ProjectTeam } from '../../components/projects/wizard/Step2ProjectTeam';
import { Step3LockProjectBOQ } from '../../components/projects/wizard/Step3LockProjectBOQ';
import { Step4ScheduleMilestones } from '../../components/projects/wizard/Step4ScheduleMilestones';
import { Step5ReviewActivate } from '../../components/projects/wizard/Step5ReviewActivate';

export const CreateProjectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, saveProjectSetupDraft, createActiveProjectFromDraft } = useERPStore();

  const sourceEstimateRevisionId = searchParams.get('sourceEstimateRevisionId');
  const draftId = searchParams.get('draftId');

  const [draft, setDraft] = useState<ProjectSetupDraft | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Initialize or load draft
  useEffect(() => {
    if (draftId && state.projectSetupDrafts) {
      const foundDraft = state.projectSetupDrafts.find((d) => d.id === draftId);
      if (foundDraft) {
        setDraft(foundDraft);
        setCurrentStep(foundDraft.currentStep || 1);
        return;
      }
    }

    if (sourceEstimateRevisionId && state.estimates) {
      const estimate = state.estimates.find(
        (e) => e.id === sourceEstimateRevisionId || e.enquiryId === sourceEstimateRevisionId
      );
      const enquiry = state.enquiries?.find(
        (e) => e.id === estimate?.enquiryId || (e as any).acceptedEstimateId === estimate?.id
      ) || {
        id: `enq-${sourceEstimateRevisionId}`,
        enquiryNumber: 'ENQ-ACCEPTED',
        clientName: estimate?.clientName || 'Accepted Client',
        projectRequirement: (estimate as any)?.projectName || 'Accepted Fitout Project',
        status: 'won',
      };

      const newDraft = startProjectSetupFromAcceptedEstimate({
        enquiry,
        estimate: estimate || {
          id: sourceEstimateRevisionId,
          quotationNumber: 'QUO-ACCEPTED',
          finalQuotationValue: 4850000,
          boqSections: [],
        },
        clients: state.clients || [],
        employees: state.employees || [],
      });

      setDraft(newDraft);
      saveProjectSetupDraft(newDraft);
      return;
    }

    // Default standalone draft if accessed directly
    const defaultEnquiry = state.enquiries?.find((e) => e.status === 'won') || state.enquiries?.[0];
    const defaultEstimate = state.estimates?.find((e) => e.status === 'accepted') || state.estimates?.[0];

    const fallbackDraft = startProjectSetupFromAcceptedEstimate({
      enquiry: defaultEnquiry || { id: 'enq-demo', clientName: 'Sunview Infrastructure & Developers LLP', projectRequirement: 'Corporate Office Turnkey Interior Fitout' },
      estimate: defaultEstimate || { id: 'est-demo', quotationNumber: 'QUO-2026-088', finalQuotationValue: 4850000, boqSections: [] },
      clients: state.clients || [],
      employees: state.employees || [],
    });

    setDraft(fallbackDraft);
  }, [sourceEstimateRevisionId, draftId]);

  if (!draft) {
    return (
      <div className="p-12 text-center text-slate-500 font-sans text-xs">
        Loading Project Setup Wizard...
      </div>
    );
  }

  // Updaters
  const updateDraft = (patch: Partial<ProjectSetupDraft>) => {
    const updated = {
      ...draft,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    setDraft(updated);
    saveProjectSetupDraft(updated);
    if (validationError) setValidationError('');
  };

  const updateStep1 = (field: string, val: any) => {
    updateDraft({
      importedDetails: {
        ...draft.importedDetails,
        [field]: val,
      },
    });
  };

  const updateStep2 = (field: string, val: any) => {
    updateDraft({
      teamSetup: {
        ...draft.teamSetup,
        [field]: val,
      },
    });
  };

  const handleLockBOQ = (updatedBOQSetup: ProjectSetupDraft['boqLockSetup']) => {
    updateDraft({
      boqLockSetup: updatedBOQSetup,
    });
  };

  const updateStep4 = (field: string, val: any) => {
    if (field === 'activities') {
      updateDraft({
        scheduleSetup: {
          ...draft.scheduleSetup,
          activities: val,
          isConfigured: val && val.length > 0,
        },
      });
    } else {
      updateDraft({
        importedDetails: {
          ...draft.importedDetails,
          [field]: val,
        },
      });
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!draft.importedDetails.projectName.trim()) {
        setValidationError('Please enter a valid project name.');
        return false;
      }
      if (!draft.importedDetails.clientId) {
        setValidationError('Please select a client from Master Data.');
        return false;
      }
      if (!draft.importedDetails.plannedStartDate) {
        setValidationError('Please select a planned start date.');
        return false;
      }
      if (!draft.importedDetails.targetCompletionDate) {
        setValidationError('Please select a target completion date.');
        return false;
      }
    }

    if (step === 2) {
      if (!draft.teamSetup.projectDirectorId) {
        setValidationError('Mandatory: Please assign a Project Director / Head.');
        return false;
      }
      if (!draft.teamSetup.projectSupervisorId) {
        setValidationError('Mandatory: Please assign a Supervisor / Site Engineer.');
        return false;
      }
      if (!draft.teamSetup.isTeamLocked) {
        setValidationError('Mandatory: Please click "Lock Project Team" before proceeding.');
        return false;
      }
    }

    if (step === 3) {
      if (!draft.boqLockSetup.isBOQLocked) {
        setValidationError('Mandatory: Please click "Lock Accepted Estimate as Project BOQ" to establish commercial baseline.');
        return false;
      }
    }

    if (step === 4) {
      if (!draft.scheduleSetup.activities || draft.scheduleSetup.activities.length === 0) {
        setValidationError('Mandatory: At least one schedule activity must be defined.');
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = Math.min(5, currentStep + 1);
      setCurrentStep(nextStep);
      updateDraft({ currentStep: nextStep });
    }
  };

  const handlePrev = () => {
    setValidationError('');
    const prevStep = Math.max(1, currentStep - 1);
    setCurrentStep(prevStep);
    updateDraft({ currentStep: prevStep });
  };

  // Final Action: Create Active Project
  const handleCreateActiveProject = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = createActiveProjectFromDraft(draft, 'Current User');
      setIsSubmitting(false);
      if (res.success && res.project) {
        navigate(`/projects/${res.project.id}`);
      } else {
        setValidationError(res.error || 'Failed to create active project.');
      }
    }, 400);
  };

  const currentProjectDataForReview = {
    projectName: draft.importedDetails.projectName,
    projectCode: 'PRJ-NEW-AUTO',
    clientId: draft.importedDetails.clientId,
    clientName: draft.importedDetails.clientName,
    startDate: draft.importedDetails.plannedStartDate,
    targetCompletionDate: draft.importedDetails.targetCompletionDate,
    projectDirectorId: draft.teamSetup.projectDirectorId,
    projectDirectorName: draft.teamSetup.projectDirectorName,
    projectSupervisorId: draft.teamSetup.projectSupervisorId,
    projectSupervisorName: draft.teamSetup.projectSupervisorName,
    sourceEstimateId: draft.importedDetails.acceptedQuotationNumber,
    acceptedQuotationValue: draft.importedDetails.acceptedQuotationValue,
    internalEstimatedCost: draft.importedDetails.acceptedQuotationValue * 0.85,
    categoryBudgets: [],
    acceptedScheduleSnapshot: draft.scheduleSetup.activities,
    activities: draft.scheduleSetup.activities,
    isTeamLocked: draft.teamSetup.isTeamLocked,
    isBOQLocked: draft.boqLockSetup.isBOQLocked,
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 font-sans text-xs space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Project Setup Wizard</h1>
            <p className="text-[11px] text-slate-500">
              Complete the 5-step wizard to setup project identity, lock team, lock BOQ baseline, and configure schedule before activation.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Header Navigation */}
      <WizardStepperNav currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold text-xs">
          {validationError}
        </div>
      )}

      {/* Wizard Step Content */}
      <div className="transition-all">
        {currentStep === 1 && (
          <Step1BasicDetails
            data={{
              projectCode: 'PRJ-AUTO-GEN',
              projectName: draft.importedDetails.projectName,
              clientId: draft.importedDetails.clientId,
              clientName: draft.importedDetails.clientName,
              clientContactPerson: draft.importedDetails.contactPerson || '',
              clientPhone: draft.importedDetails.phone || '',
              clientEmail: draft.importedDetails.email || '',
              clientGstin: draft.importedDetails.gstin || '',
              companyName: 'Empire Interior Pvt Ltd',
              category: draft.importedDetails.projectCategory || 'Commercial',
              city: draft.importedDetails.city,
              state: draft.importedDetails.state || 'Maharashtra',
              siteAddress: draft.importedDetails.siteAddress,
              projectArea: draft.importedDetails.area || 3500,
              projectAreaUnit: draft.importedDetails.areaUnit || 'Sq Ft',
              startDate: draft.importedDetails.plannedStartDate,
              targetCompletionDate: draft.importedDetails.targetCompletionDate,
            }}
            onChange={(field, val) => updateStep1(field, val)}
            clients={state.clients || []}
          />
        )}

        {currentStep === 2 && (
          <Step2ProjectTeam
            data={{
              projectDirectorId: draft.teamSetup.projectDirectorId,
              projectDirectorName: draft.teamSetup.projectDirectorName,
              projectManagerId: draft.teamSetup.projectManagerId,
              projectManagerName: draft.teamSetup.projectManagerName,
              projectSupervisorId: draft.teamSetup.projectSupervisorId,
              projectSupervisorName: draft.teamSetup.projectSupervisorName,
              projectHead: draft.teamSetup.projectHead || draft.teamSetup.projectDirectorName,
              team: draft.teamSetup.team,
              isTeamLocked: draft.teamSetup.isTeamLocked,
            }}
            onChange={(field, val) => updateStep2(field, val)}
            onLockTeam={() => updateStep2('isTeamLocked', true)}
            employees={state.employees || []}
          />
        )}

        {currentStep === 3 && (
          <Step3LockProjectBOQ
            draft={draft}
            onLockBOQ={handleLockBOQ}
            currentUser="Project Director"
          />
        )}

        {currentStep === 4 && (
          <Step4ScheduleMilestones
            data={{
              startDate: draft.importedDetails.plannedStartDate,
              targetCompletionDate: draft.importedDetails.targetCompletionDate,
              activities: draft.scheduleSetup.activities,
              crmScheduleSnapshot: [],
            }}
            onChange={(field, val) => updateStep4(field, val)}
          />
        )}

        {currentStep === 5 && (
          <Step5ReviewActivate
            projectData={currentProjectDataForReview}
            onActivate={handleCreateActiveProject}
            onSaveDraft={() => saveProjectSetupDraft(draft)}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Bottom Step Control Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            currentStep === 1
              ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
              : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Previous Step
        </button>

        {currentStep < 5 && (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-[#AB9570] hover:bg-[#927D5E] rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <span>Next Step</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
