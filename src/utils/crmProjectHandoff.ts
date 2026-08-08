import { Enquiry, Estimate, Project, ProjectSetupDraft, ProjectBOQLine, ProjectScheduleActivity } from '../domain/types';

export interface CreateProjectResult {
  project: Project;
  alreadyExisted: boolean;
}

export type CRMProjectState =
  | { state: 'NO_SETUP'; acceptedEstimateId: string; acceptedRevisionId: string }
  | { state: 'DRAFT_EXISTS'; draftId: string; draft: ProjectSetupDraft | any }
  | { state: 'ACTIVE_PROJECT_EXISTS'; projectId: string; project: Project };

/**
 * Validates whether a CRM Enquiry & Estimate revision represents a valid, accepted commercial opportunity.
 */
export function isAcceptedCRMOpportunity(enquiry: any, estimate: any): boolean {
  if (!estimate) return false;
  
  const estStatus = (estimate.status || '').toLowerCase();
  const qStatus = (estimate.quotationStatus || '').toLowerCase();
  const clientDecisionObj = estimate.clientDecision || {};
  const clientDecision = (clientDecisionObj.decision || clientDecisionObj.status || '').toLowerCase();
  const hasAcceptedDate = Boolean(estimate.acceptedAt || estimate.acceptedDate || clientDecisionObj.decisionDate);
  const isEnquiryWon = (enquiry?.status || '').toLowerCase() === 'won';

  const isAcceptedStatus =
    estStatus === 'accepted' ||
    qStatus === 'accepted' ||
    clientDecision === 'accepted' ||
    hasAcceptedDate ||
    (isEnquiryWon && (estStatus === 'accepted' || clientDecision === 'accepted' || Boolean(estimate.boqSections?.length || estimate.costSummary)));

  const hasBOQData = Boolean(
    (estimate.boqSections && estimate.boqSections.length > 0) ||
    (estimate.lines && estimate.lines.length > 0) ||
    estimate.costSummary
  );

  return Boolean(isAcceptedStatus && hasBOQData);
}

/**
 * Computes the canonical 3-state CRM Project relationship:
 * A. NO_SETUP: No Project Setup started yet.
 * B. DRAFT_EXISTS: Setup draft exists (in projectSetupDrafts or draft projects).
 * C. ACTIVE_PROJECT_EXISTS: Final active Project record created in ERPStore.
 */
export function getCRMProjectState({
  enquiry,
  estimate,
  projects = [],
  projectSetupDrafts = [],
}: {
  enquiry?: any;
  estimate?: any;
  projects?: any[];
  projectSetupDrafts?: any[];
}): CRMProjectState {
  const enqId = enquiry?.id || estimate?.enquiryId;
  const estId = estimate?.id || enquiry?.acceptedEstimateId;

  // 1. Check if an active/finalized Project exists in projects collection
  const activeProj = projects.find((p) => {
    const isMatchingId =
      (p.sourceEnquiryId && p.sourceEnquiryId === enqId) ||
      (p.enquiryId && p.enquiryId === enqId) ||
      (p.sourceEstimateRevisionId && p.sourceEstimateRevisionId === estId) ||
      (p.acceptedEstimateId && p.acceptedEstimateId === estId) ||
      (enquiry?.projectId && p.id === enquiry.projectId) ||
      (estimate?.projectId && p.id === estimate.projectId);
    const status = (p.projectStatus || p.status || '').toLowerCase();
    const isFinalized = status === 'active' || status === 'completed' || status === 'on_hold' || status === 'closed';
    return isMatchingId && isFinalized;
  });

  if (activeProj) {
    return {
      state: 'ACTIVE_PROJECT_EXISTS',
      projectId: activeProj.id,
      project: activeProj,
    };
  }

  // 2. Check if a ProjectSetupDraft exists
  const existingDraft = projectSetupDrafts.find((d) => {
    return (
      (d.sourceEnquiryId && d.sourceEnquiryId === enqId) ||
      (d.sourceEstimateId && d.sourceEstimateId === estId) ||
      (d.sourceEstimateRevisionId && d.sourceEstimateRevisionId === estId)
    );
  });

  if (existingDraft) {
    return {
      state: 'DRAFT_EXISTS',
      draftId: existingDraft.id,
      draft: existingDraft,
    };
  }

  // Check if an incomplete project setup draft exists in projects list (migrated case)
  const incompleteProj = projects.find((p) => {
    const isMatchingId =
      (p.sourceEnquiryId && p.sourceEnquiryId === enqId) ||
      (p.enquiryId && p.enquiryId === enqId) ||
      (p.sourceEstimateRevisionId && p.sourceEstimateRevisionId === estId) ||
      (p.acceptedEstimateId && p.acceptedEstimateId === estId) ||
      (enquiry?.projectId && p.id === enquiry.projectId);
    const status = (p.projectStatus || p.status || '').toLowerCase();
    return isMatchingId && (status === 'draft' || status === 'draft_setup' || status === 'planning');
  });

  if (incompleteProj) {
    return {
      state: 'DRAFT_EXISTS',
      draftId: incompleteProj.id,
      draft: incompleteProj,
    };
  }

  return {
    state: 'NO_SETUP',
    acceptedEstimateId: estId || '',
    acceptedRevisionId: estId || '',
  };
}

/**
 * Helper to resolve the exact accepted estimate revision for a given enquiryId.
 * Ensures eligibility is based on acceptedEstimateRevision.id (e.g. R1, ignoring superseded R0).
 */
export function getAcceptedEstimateRevision(enquiryId: string, estimates: Estimate[] = []): Estimate | undefined {
  const matchingEstimates = estimates.filter((e) => e.enquiryId === enquiryId || e.id === enquiryId);
  if (matchingEstimates.length === 0) return undefined;

  const accepted = matchingEstimates.find((e) => {
    const status = (e.status || '').toLowerCase();
    const decision = (e.clientDecision?.decision || '').toLowerCase();
    return status === 'accepted' || decision === 'accepted';
  });
  if (accepted) return accepted;

  return matchingEstimates.sort((a, b) => (b.revisionNumber || 0) - (a.revisionNumber || 0))[0];
}

/**
 * Migrates incomplete legacy project records into projectSetupDrafts.
 * Creates a backup in localStorage['empire_migration_backup_project_setup_v3'].
 * Keeps actual finalized projects in `projects` collection (projectStatus === 'active' | 'on_hold' | 'completed' | 'cancelled').
 */
export function migrateIncompleteProjectsToDrafts({
  projects = [],
  projectSetupDrafts = [],
  enquiries: _enquiries = [],
  estimates = [],
}: {
  projects: any[];
  projectSetupDrafts: any[];
  enquiries?: any[];
  estimates: any[];
}): { finalizedProjects: any[]; updatedSetupDrafts: any[] } {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('empire_migration_backup_project_setup_v3', JSON.stringify(projects));
  }

  const finalizedProjects: any[] = [];
  const updatedSetupDrafts: any[] = [...projectSetupDrafts];

  projects.forEach((proj) => {
    const status = (proj.projectStatus || proj.status || '').toLowerCase();
    const isFinalized =
      (status === 'active' || status === 'completed' || status === 'on_hold' || status === 'closed') &&
      Boolean(proj.projectTeamLocked || proj.isTeamLocked) &&
      Boolean(proj.projectBOQLocked || proj.isBOQLocked);

    if (isFinalized) {
      finalizedProjects.push({
        ...proj,
        projectStatus: proj.projectStatus || proj.status || 'active',
      });
    } else {
      const estId = proj.sourceEstimateRevisionId || proj.sourceEstimateId || proj.acceptedEstimateId;
      const enqId = proj.sourceEnquiryId || proj.enquiryId;

      const draftExists = updatedSetupDrafts.some(
        (d) => d.id === proj.id || (d.sourceEstimateRevisionId && d.sourceEstimateRevisionId === estId)
      );

      if (!draftExists) {
        const est = estimates.find((e) => e.id === estId);

        const convertedDraft: ProjectSetupDraft = {
          id: proj.id.startsWith('draft-') ? proj.id : `draft-${proj.id}`,
          sourceEnquiryId: enqId,
          sourceEstimateId: estId,
          sourceEstimateRevisionId: estId,
          sourceQuotationNumber: proj.sourceQuotationNumber || est?.quotationNumber || 'QUO-ACCEPTED',
          importedDetails: {
            clientId: proj.clientId || 'client-1',
            clientName: proj.clientName || 'Client',
            projectName: proj.projectName || 'Project Setup Draft',
            siteAddress: proj.siteAddress || 'Site Location',
            city: proj.city || 'Mumbai',
            acceptedQuotationNumber: proj.sourceQuotationNumber || est?.quotationNumber || 'QUO-ACCEPTED',
            acceptedEstimateId: estId || '',
            acceptedRevisionId: estId || '',
            acceptedDate: proj.createdAt || new Date().toISOString().split('T')[0],
            acceptedQuotationValue: proj.acceptedQuotationValue || proj.budgetBaseline || 0,
            plannedStartDate: proj.startDate || new Date().toISOString().split('T')[0],
            targetCompletionDate: proj.targetCompletionDate || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          },
          teamSetup: {
            projectDirectorId: proj.projectDirectorId || 'emp-1',
            projectDirectorName: proj.projectDirectorName || 'Rajesh Sharma',
            projectSupervisorId: proj.projectSupervisorId || 'emp-2',
            projectSupervisorName: proj.projectSupervisorName || 'Amit Verma',
            projectHead: proj.projectHead || proj.projectDirectorName || 'Rajesh Sharma',
            team: proj.team || [],
            isTeamLocked: Boolean(proj.projectTeamLocked || proj.isTeamLocked),
          },
          boqLockSetup: {
            isBOQLocked: Boolean(proj.projectBOQLocked || proj.isBOQLocked),
            boqSource: proj.boqSource || 'crm_estimate',
            lockedProjectBOQ: proj.lockedProjectBOQ || {
              id: proj.boqId || `boq-${Date.now()}`,
              sourceEstimateRevisionId: estId || '',
              lines: proj.acceptedBOQSnapshot || [],
              totalBOQValue: proj.acceptedQuotationValue || 0,
            },
          },
          scheduleSetup: {
            activities: proj.scheduleActivities || proj.acceptedScheduleSnapshot || [],
            isConfigured: Boolean(proj.scheduleConfigured || (proj.activities && proj.activities.length > 0)),
          },
          setupStatus: 'in_progress',
          currentStep: 1,
          createdAt: proj.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updatedSetupDrafts.push(convertedDraft);
      }
    }
  });

  return { finalizedProjects, updatedSetupDrafts };
}

/**
 * Creates the initial ProjectSetupDraft from CRM Enquiry and Accepted Estimate.
 * Does NOT write a Project record to projects store.
 */
export function startProjectSetupFromAcceptedEstimate({
  enquiry,
  estimate,
  clients = [],
  employees = [],
}: {
  enquiry: Enquiry | any;
  estimate: Estimate | any;
  clients?: any[];
  employees?: any[];
}): ProjectSetupDraft {
  const today = new Date().toISOString().split('T')[0];
  const draftId = `draft-${Date.now()}`;

  const clientObj = clients.find((c) => c.id === enquiry?.clientId || c.name === enquiry?.clientName) || {
    id: enquiry?.clientId || 'cli-master',
    name: enquiry?.clientName || 'Empire Commercial Client',
    contactPerson: enquiry?.contactPerson || 'Client Representative',
    phone: enquiry?.phone || '',
    email: enquiry?.email || '',
    gstin: enquiry?.clientGstin || (enquiry as any)?.gstin || '27AAAAA0000A1Z5',
    address: enquiry?.location || 'Client Registered Address',
  };

  const acceptedValue =
    estimate?.clientDecision?.acceptedValue ||
    estimate?.finalQuotationValue ||
    enquiry?.expectedBudget ||
    0;

  // Extract BOQ items into structured lines
  const boqLines: ProjectBOQLine[] = [];
  if (estimate?.boqSections && estimate.boqSections.length > 0) {
    let lineNoCounter = 1;
    estimate.boqSections.forEach((sec: any) => {
      sec.items?.forEach((item: any) => {
        boqLines.push({
          id: `bline-${Date.now()}-${lineNoCounter}`,
          estimateLineId: item.id,
          lineNo: lineNoCounter++,
          itemDescription: item.description || item.productName || 'BOQ Line Item',
          categoryId: item.categoryId || sec.id || 'cat-1',
          categoryName: item.categoryName || sec.name || 'General Fitout',
          unitSymbol: item.unit || 'nos',
          boqQuantity: item.quantity || 1,
          boqRate: item.baseRate || item.materialCost || item.totalCost || 0,
          boqAmount: item.totalCost || ((item.quantity || 1) * (item.baseRate || 0)),
          indentedQuantity: 0,
          orderedQuantity: 0,
          receivedQuantity: 0,
          issuedQuantity: 0,
          remainingQuantity: item.quantity || 1,
          committedCost: 0,
          actualCost: 0,
          variance: 0,
        });
      });
    });
  }

  // Schedule items
  const activities: ProjectScheduleActivity[] = (estimate?.schedule || []).map((s: any, idx: number) => ({
    id: `act-${Date.now()}-${idx + 1}`,
    activityName: s.description || s.workSection || `Activity #${idx + 1}`,
    startDate: today,
    endDate: new Date(Date.now() + (s.duration || 7) * 86400000).toISOString().split('T')[0],
    responsibleEmployeeId: employees[0]?.id || 'emp-1',
    responsibleEmployeeName: employees[0]?.name || 'Rajesh Sharma',
    completionPercentage: 0,
    status: 'not_started',
    delayDays: 0,
    remarks: s.remarks || '',
  }));

  if (activities.length === 0) {
    activities.push({
      id: `act-${Date.now()}-1`,
      activityName: 'Site Survey & Layout Marking',
      startDate: today,
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      responsibleEmployeeId: employees[0]?.id || 'emp-1',
      responsibleEmployeeName: employees[0]?.name || 'Rajesh Sharma',
      completionPercentage: 0,
      status: 'not_started',
      delayDays: 0,
    });
  }

  const defaultDirector = employees.find((e) => e.role === 'Project Director' || e.designationId === 'desig-director') || employees[0];
  const defaultSupervisor = employees.find((e) => e.role === 'Project Supervisor' || e.role === 'Site Engineer') || employees[1] || employees[0];

  return {
    id: draftId,
    sourceEnquiryId: enquiry?.id,
    sourceEstimateId: estimate?.id,
    sourceEstimateRevisionId: estimate?.id,
    sourceQuotationNumber: estimate?.quotationNumber || 'QUO-ACCEPTED',
    importedDetails: {
      clientId: clientObj.id,
      clientName: clientObj.name,
      contactPerson: clientObj.contactPerson || enquiry?.contactPerson || '',
      phone: clientObj.phone || enquiry?.phone || '',
      email: clientObj.email || enquiry?.email || '',
      gstin: clientObj.gstin || '',
      billingAddress: clientObj.address || enquiry?.location || '',
      projectName: enquiry?.projectRequirement && enquiry.projectRequirement !== 'Requirement not entered'
        ? enquiry.projectRequirement
        : `${clientObj.name} Turnkey Fitout`,
      projectCategory: enquiry?.projectType || 'Luxury Commercial Fitout',
      propertyType: enquiry?.propertyType || 'Commercial Workspace',
      siteAddress: enquiry?.location || 'Site Location TBD',
      city: enquiry?.location || 'Mumbai',
      state: 'Maharashtra',
      pin: '400001',
      area: enquiry?.approximateArea || 3500,
      areaUnit: enquiry?.areaUnit || 'sqft',
      acceptedQuotationNumber: estimate?.quotationNumber || 'QUO-ACCEPTED',
      acceptedEstimateId: estimate?.id || '',
      acceptedRevisionId: estimate?.id || '',
      acceptedDate: estimate?.clientDecision?.decisionDate || estimate?.acceptedAt || today,
      acceptedQuotationValue: acceptedValue,
      clientPoDetails: {
        poNumber: estimate?.clientDecision?.clientPoNumber || '',
        poDate: estimate?.clientDecision?.decisionDate || today,
        poAmount: acceptedValue,
        notes: estimate?.clientDecision?.comment || '',
      },
      documents: enquiry?.documents || [],
      plannedStartDate: enquiry?.expectedStartDate || today,
      targetCompletionDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    },
    teamSetup: {
      projectDirectorId: defaultDirector?.id || 'emp-1',
      projectDirectorName: defaultDirector?.name || 'Rajesh Sharma',
      projectManagerId: '',
      projectManagerName: '',
      projectSupervisorId: defaultSupervisor?.id || 'emp-2',
      projectSupervisorName: defaultSupervisor?.name || 'Amit Verma',
      projectHead: defaultDirector?.name || 'Rajesh Sharma',
      team: [],
      isTeamLocked: false,
    },
    boqLockSetup: {
      isBOQLocked: false,
      sourceEstimateRevisionId: estimate?.id,
      lockedProjectBOQ: {
        id: `boq-${Date.now()}`,
        sourceEstimateRevisionId: estimate?.id || '',
        sections: estimate?.boqSections || [],
        lines: boqLines,
        totalBOQValue: acceptedValue,
      },
    },
    scheduleSetup: {
      activities,
      isConfigured: true,
    },
    setupStatus: 'in_progress',
    currentStep: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Creates an active Project record from a completed ProjectSetupDraft.
 */
export function createActiveProjectFromSetup({
  draft,
  existingProjects = [],
  performedBy = 'Current User',
}: {
  draft: ProjectSetupDraft;
  existingProjects?: any[];
  performedBy?: string;
}): Project {
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  const nextCodeIndex = existingProjects.length + 1;
  const projectCode = `PRJ-${new Date().getFullYear()}-${String(nextCodeIndex).padStart(3, '0')}`;
  const projectId = `proj-${Date.now()}`;

  const { importedDetails, teamSetup, boqLockSetup, scheduleSetup } = draft;

  const newProject: Project = {
    id: projectId,
    projectCode,
    projectName: importedDetails.projectName,
    companyName: 'Empire Interior Pvt Ltd',
    category: importedDetails.projectCategory || 'Commercial',
    projectType: importedDetails.propertyType || 'Commercial',
    
    clientId: importedDetails.clientId,
    clientName: importedDetails.clientName,
    clientContactPerson: importedDetails.contactPerson,
    clientPhone: importedDetails.phone,
    clientEmail: importedDetails.email,
    clientGstin: importedDetails.gstin,
    clientAddress: importedDetails.billingAddress,
    
    siteAddress: importedDetails.siteAddress,
    city: importedDetails.city,
    state: importedDetails.state,
    pincode: importedDetails.pin,
    projectArea: importedDetails.area,
    projectAreaUnit: importedDetails.areaUnit,

    projectDirectorId: teamSetup.projectDirectorId,
    projectDirectorName: teamSetup.projectDirectorName,
    projectManagerId: teamSetup.projectManagerId,
    projectManagerName: teamSetup.projectManagerName,
    projectSupervisorId: teamSetup.projectSupervisorId,
    projectSupervisorName: teamSetup.projectSupervisorName,
    projectHead: teamSetup.projectHead || teamSetup.projectDirectorName,
    team: teamSetup.team.length > 0 ? teamSetup.team : [
      { employeeId: teamSetup.projectDirectorId, employeeName: teamSetup.projectDirectorName, role: 'Project Director', assignedDate: today },
      { employeeId: teamSetup.projectSupervisorId, employeeName: teamSetup.projectSupervisorName, role: 'Project Supervisor', assignedDate: today },
    ],
    isTeamLocked: true,
    projectTeamLocked: true,
    projectTeamLockedAt: teamSetup.lockedAt || timestamp,
    projectTeamLockedBy: teamSetup.lockedBy || performedBy,

    boqId: boqLockSetup.lockedProjectBOQ?.id || `boq-${Date.now()}`,
    isBOQLocked: true,
    projectBOQLocked: true,
    projectBOQLockedAt: boqLockSetup.lockedAt || timestamp,
    projectBOQLockedBy: boqLockSetup.lockedBy || performedBy,
    lockedProjectBOQ: boqLockSetup.lockedProjectBOQ || {
      id: `boq-${Date.now()}`,
      sourceEstimateRevisionId: draft.sourceEstimateRevisionId || '',
      sections: [],
      lines: [],
      totalBOQValue: importedDetails.acceptedQuotationValue,
    },
    boqStatus: 'approved',
    boqRevisions: [],
    categoryBudgets: [],
    currentBOQValue: importedDetails.acceptedQuotationValue,
    budgetBaseline: importedDetails.acceptedQuotationValue * 0.85,
    approvedBudgetLimit: importedDetails.acceptedQuotationValue,
    committedCost: 0,
    actualCost: 0,
    certifiedRevenue: 0,
    clientReceipts: 0,

    startDate: importedDetails.plannedStartDate || today,
    targetCompletionDate: importedDetails.targetCompletionDate,
    progress: 0,
    status: 'active',
    projectStatus: 'active',
    scheduleConfigured: true,
    scheduleActivities: scheduleSetup.activities,

    sourceEnquiryId: draft.sourceEnquiryId,
    sourceEstimateId: draft.sourceEstimateId,
    sourceEstimateRevisionId: draft.sourceEstimateRevisionId,
    sourceQuotationNumber: draft.sourceQuotationNumber,
    acceptedQuotationValue: importedDetails.acceptedQuotationValue,
    internalEstimatedCost: importedDetails.acceptedQuotationValue * 0.85,
    acceptedBOQSnapshot: boqLockSetup.lockedProjectBOQ?.sections || [],
    acceptedScheduleSnapshot: scheduleSetup.activities,
    clientPODetails: importedDetails.clientPoDetails,

    createdAt: timestamp,
    createdBy: performedBy,
    updatedAt: timestamp,
    updatedBy: performedBy,
  };

  return newProject;
}

/**
 * Idempotent CRM link reconciliation:
 * Ensures CRM enquiries link to finalized active projects when complete,
 * while leaving projectCreated = false for incomplete drafts so Continue Project Setup displays.
 */
export function reconcileCRMProjectLinks({
  enquiries = [],
  estimates: _estimates = [],
  projects = [],
  updateItem,
}: {
  enquiries: any[];
  estimates?: any[];
  projects: any[];
  updateItem: (collection: string, id: string, patch: any) => void;
}): void {
  enquiries.forEach((enquiry) => {
    const activeMatch = projects.find((p) => {
      const matchId = p.id === enquiry.projectId || p.sourceEnquiryId === enquiry.id;
      const status = (p.projectStatus || p.status || '').toLowerCase();
      return matchId && (status === 'active' || status === 'completed' || status === 'on_hold' || status === 'closed');
    });

    if (activeMatch) {
      if (enquiry.projectId !== activeMatch.id || !enquiry.projectCreated) {
        updateItem('enquiries', enquiry.id, {
          projectId: activeMatch.id,
          projectCode: activeMatch.projectCode,
          projectCreated: true,
          hasProject: true,
          status: 'won',
        });
      }
    }
  });
}
