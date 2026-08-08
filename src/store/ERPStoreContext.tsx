/**
 * Empire Interior ERP Central Store Context
 * Location: src/store/ERPStoreContext.tsx
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ERPCollections, LocalStorageERPRepository } from '../repositories/erpRepository';
import { CANONICAL_SEED_DATA } from '../data/canonicalSeedData';
import {
  Category,
  AuditEvent,
  Project,
  ProjectSetupDraft,
  BOQRevision,
  ProjectBOQ,
  ProjectBOQLine,
  ProjectTeamAssignment,
  MaterialIndent,
  RFQ,
  VendorQuotation,
  DirectPurchase,
  PurchaseOrder,
  WorkOrder,
  GoodsReceivedNote,
  GRNStatus,
  QualityInspection,
  StockLedgerEntry,
  MaterialIssue,
  MaterialReturn,
  MaterialConsumption,
  SubcontractorWIP,
  WIPCertification,
  RFQStatus,
  POStatus,
} from '../domain/types';
import { normalizeEstimate } from '../utils/normalizeEstimate';
import { reconcileCRMProjectLinks, createActiveProjectFromSetup, migrateIncompleteProjectsToDrafts } from '../utils/crmProjectHandoff';

export interface ActivateProjectParams {
  estimateVersionId: string;
  projectCode: string;
  projectName: string;
  siteLocation: string;
  startDate: string;
  targetCompletionDate: string;
  projectDirectorId: string;
  projectDirectorName: string;
  projectSupervisorId: string;
  projectSupervisorName: string;
  team: ProjectTeamAssignment[];
  performedBy: string;
}

export interface ERPStoreContextType {
  state: ERPCollections;
  activeRole: string; // e.g. 'ROLE-DIRECTOR', 'ROLE-ESTIMATOR', 'ROLE-SUPERVISOR', 'ROLE-PROCUREMENT'
  setActiveRole: (roleId: string) => void;
  isLoading: boolean;

  // Generic collection updaters
  updateCollection: <K extends keyof ERPCollections>(key: K, items: ERPCollections[K]) => void;
  addItem: <K extends keyof ERPCollections>(key: K, item: any) => void;
  updateItem: <K extends keyof ERPCollections>(key: K, id: string, updatedFields: any) => void;

  // Project Setup Draft Actions
  saveProjectSetupDraft: (draft: ProjectSetupDraft) => void;
  deleteProjectSetupDraft: (draftId: string) => void;
  createActiveProjectFromDraft: (draft: ProjectSetupDraft, performedBy?: string) => { success: boolean; project?: Project; error?: string };

  // Domain Store Actions
  activateProject: (params: ActivateProjectParams) => { success: boolean; project?: Project; error?: string };
  lockProjectTeam: (projectId: string, lockReason: string, performedBy: string) => { success: boolean; error?: string };
  unlockProjectTeam: (projectId: string, unlockReason: string, performedBy: string) => { success: boolean; error?: string };
  createMaterialIndent: (indent: MaterialIndent, performedBy: string) => { success: boolean; indent?: MaterialIndent; error?: string };
  submitMaterialIndent: (indentId: string, performedBy: string) => { success: boolean; error?: string };
  approveMaterialIndent: (indentId: string, approverId: string, comments: string) => { success: boolean; error?: string };
  rejectMaterialIndent: (indentId: string, rejectorId: string, reason: string) => { success: boolean; error?: string };
  returnMaterialIndent: (indentId: string, returnerId: string, comments: string) => { success: boolean; error?: string };

  // Procurement Store Actions
  createRFQ: (rfq: RFQ, performedBy: string) => { success: boolean; rfq?: RFQ; error?: string };
  updateRFQStatus: (rfqId: string, status: RFQStatus, performedBy: string, comments?: string) => { success: boolean; error?: string };
  submitVendorQuotation: (quotation: VendorQuotation, performedBy: string) => { success: boolean; quotation?: VendorQuotation; error?: string };
  awardRateComparison: (comparisonId: string, selectedVendorId: string, remarks: string, performedBy: string) => { success: boolean; error?: string };
  createDirectPurchase: (dp: DirectPurchase, performedBy: string) => { success: boolean; directPurchase?: DirectPurchase; error?: string };
  approveDirectPurchase: (dpId: string, approverId: string) => { success: boolean; error?: string };
  createPurchaseOrder: (po: PurchaseOrder, performedBy?: string) => { success: boolean; purchaseOrder?: PurchaseOrder; error?: string };
  updatePOStatus: (poId: string, status: POStatus, performedBy: string, comments?: string) => { success: boolean; error?: string };
  // Stage 4 Store Actions
  createGRN: (grn: GoodsReceivedNote, performedBy?: string) => { success: boolean; grn?: GoodsReceivedNote; error?: string };
  inspectGRN: (grnId: string, inspection: QualityInspection, performedBy?: string) => { success: boolean; error?: string };
  approveGRN: (grnId: string, approverId?: string, comments?: string) => { success: boolean; error?: string };
  postGRNToStock: (grnId: string, postedBy?: string) => { success: boolean; error?: string };
  createMaterialIssue: (issue: MaterialIssue, performedBy?: string) => { success: boolean; issue?: MaterialIssue; error?: string };
  createMaterialReturn: (ret: MaterialReturn, performedBy?: string) => { success: boolean; materialReturn?: MaterialReturn; error?: string };
  createMaterialConsumption: (consumption: MaterialConsumption, performedBy?: string) => { success: boolean; consumption?: MaterialConsumption; error?: string };
  createSubcontractorWorkOrder: (wo: WorkOrder, performedBy?: string) => { success: boolean; workOrder?: WorkOrder; error?: string };
  createWIPEntry: (wip: SubcontractorWIP, performedBy?: string) => { success: boolean; wip?: SubcontractorWIP; error?: string };
  certifyWIP: (cert: WIPCertification, performedBy?: string) => { success: boolean; certification?: WIPCertification; error?: string };

  createCategory: (category: Category, performedBy?: string) => { success: boolean; category?: Category; error?: string };
  updateCategory: (categoryId: string, input: Partial<Category>, performedBy?: string) => { success: boolean; error?: string };
  deactivateCategory: (categoryId: string, reason: string, performedBy?: string) => { success: boolean; error?: string };
  reactivateCategory: (categoryId: string, performedBy?: string) => { success: boolean; error?: string };

  addProjectCategory: (category: string) => void;
  addPropertyType: (type: string) => void;

  // Audit logger
  logAudit: (event: Omit<AuditEvent, 'id' | 'performedAt'>) => void;

  // Reset data to defaults
  resetToDefaults: () => void;
}

const repository = new LocalStorageERPRepository();

const ERPStoreContext = createContext<ERPStoreContextType | undefined>(undefined);

export const ERPStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ERPCollections>(CANONICAL_SEED_DATA);
  const [activeRole, setActiveRole] = useState<string>('ROLE-DIRECTOR');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from local repository on mount
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await repository.loadAll();

        // Check demo seed version
        const DEMO_SEED_VERSION = 'v3';
        const storedSeedVersion = localStorage.getItem('flutebyte_demo_seed_version');

        if (storedSeedVersion !== DEMO_SEED_VERSION) {
          // Backup legacy demo data to localStorage
          const backupData = {
            clients: stored.clients || [],
            enquiries: stored.enquiries || [],
            estimates: stored.estimates || [],
            projectSetupDrafts: stored.projectSetupDrafts || [],
            projects: stored.projects || [],
            indents: stored.indents || [],
            rfqs: stored.rfqs || [],
            purchaseOrders: stored.purchaseOrders || [],
          };
          localStorage.setItem('flutebyte_demo_reseed_backup_v2', JSON.stringify(backupData));

          // Clean reset to v3 CANONICAL_SEED_DATA
          await repository.resetToDefaults(CANONICAL_SEED_DATA);
          localStorage.setItem('flutebyte_demo_seed_version', DEMO_SEED_VERSION);
        }

        const freshStored = await repository.loadAll();
        const merged: ERPCollections = { ...CANONICAL_SEED_DATA };
        (Object.keys(CANONICAL_SEED_DATA) as Array<keyof ERPCollections>).forEach((key) => {
          if (freshStored[key] && Array.isArray(freshStored[key])) {
            merged[key] = freshStored[key] as any;
          }
        });

        // Explicit sanitization to guarantee deleted lost CRM opportunities (ENQ-005/006, EST-005/006) are never re-hydrated
        const DELETED_ENQUIRY_IDS = new Set(['enq-2026-005', 'enq-2026-006']);
        const DELETED_ESTIMATE_IDS = new Set(['est-2026-005-r0', 'est-2026-006-r0']);
        const DELETED_QUOTATION_NUMS = new Set(['EMP-QUOTE-2026-005-R0', 'EMP-QUOTE-2026-006-R0']);

        if (Array.isArray(merged.enquiries)) {
          merged.enquiries = merged.enquiries.filter(
            (e) => !DELETED_ENQUIRY_IDS.has(e.id) && !DELETED_ENQUIRY_IDS.has(e.enquiryNumber)
          );
          repository.saveCollection('enquiries', merged.enquiries);
        }

        if (Array.isArray(merged.estimates)) {
          merged.estimates = merged.estimates.filter(
            (est) => !DELETED_ESTIMATE_IDS.has(est.id) && !DELETED_QUOTATION_NUMS.has(est.quotationNumber)
          );
        }

        // Schema version check & normalization
        const CURRENT_SCHEMA_VERSION = '2';
        const storedSchemaVersion = localStorage.getItem('empire_erp_schema_version');

        if (Array.isArray(merged.estimates)) {
          const normalized = merged.estimates.map(normalizeEstimate);
          merged.estimates = normalized;
          repository.saveCollection('estimates', normalized);
        }

        if (storedSchemaVersion !== CURRENT_SCHEMA_VERSION) {
          localStorage.setItem('empire_erp_schema_version', CURRENT_SCHEMA_VERSION);
        }

        // Run legacy incomplete projects migration to projectSetupDrafts
        const { finalizedProjects, updatedSetupDrafts } = migrateIncompleteProjectsToDrafts({
          projects: merged.projects || [],
          projectSetupDrafts: merged.projectSetupDrafts || [],
          enquiries: merged.enquiries || [],
          estimates: merged.estimates || [],
        });

        merged.projects = finalizedProjects;
        merged.projectSetupDrafts = updatedSetupDrafts;
        repository.saveCollection('projects', finalizedProjects);
        repository.saveCollection('projectSetupDrafts' as any, updatedSetupDrafts);

        setState(merged);

        // Single-pass idempotent CRM-to-Project link reconciliation
        const MIGRATION_KEY = 'empire_erp_crm_project_link_v2';
        const hasReconciled = localStorage.getItem(MIGRATION_KEY);
        if (!hasReconciled && merged.enquiries && merged.estimates && merged.projects) {
          reconcileCRMProjectLinks({
            enquiries: merged.enquiries,
            estimates: merged.estimates,
            projects: merged.projects,
            updateItem: (col, id, patch) => {
              const list = (merged as any)[col] || [];
              const idx = list.findIndex((i: any) => i.id === id);
              if (idx !== -1) {
                list[idx] = { ...list[idx], ...patch };
                repository.saveCollection(col as any, list);
              }
            },
          });
          localStorage.setItem(MIGRATION_KEY, 'true');
        }
      } catch (err) {
        console.error('Error loading stored ERP data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const resetToDefaults = () => {
    repository.resetToDefaults(CANONICAL_SEED_DATA);
    setState(CANONICAL_SEED_DATA);
    localStorage.setItem('flutebyte_demo_seed_version', 'v2');
  };

  useEffect(() => {
    (window as any).resetDemoData = resetToDefaults;
  }, []);

  const updateCollection = <K extends keyof ERPCollections>(key: K, items: ERPCollections[K]) => {
    setState((prev) => {
      const updated = { ...prev, [key]: items };
      repository.saveCollection(key, items);
      return updated;
    });
  };

  const addItem = <K extends keyof ERPCollections>(key: K, item: any) => {
    setState((prev) => {
      const currentList = prev[key] as any[];
      const newList = [item, ...currentList];
      const updated = { ...prev, [key]: newList };
      repository.saveCollection(key, newList as any);
      return updated;
    });
  };

  const updateItem = <K extends keyof ERPCollections>(key: K, id: string, updatedFields: any) => {
    setState((prev) => {
      const currentList = prev[key] as any[];
      const newList = currentList.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
      const updated = { ...prev, [key]: newList };
      repository.saveCollection(key, newList as any);
      return updated;
    });
  };

  const saveProjectSetupDraft = (draft: ProjectSetupDraft) => {
    setState((prev) => {
      const list = prev.projectSetupDrafts || [];
      const idx = list.findIndex((d) => d.id === draft.id);
      let updatedList: ProjectSetupDraft[];
      if (idx !== -1) {
        updatedList = [...list];
        updatedList[idx] = draft;
      } else {
        updatedList = [...list, draft];
      }
      repository.saveCollection('projectSetupDrafts' as any, updatedList);
      return { ...prev, projectSetupDrafts: updatedList };
    });
  };

  const deleteProjectSetupDraft = (draftId: string) => {
    setState((prev) => {
      const list = prev.projectSetupDrafts || [];
      const updatedList = list.filter((d) => d.id !== draftId);
      repository.saveCollection('projectSetupDrafts' as any, updatedList);
      return { ...prev, projectSetupDrafts: updatedList };
    });
  };

  const createActiveProjectFromDraft = (draft: ProjectSetupDraft, performedBy: string = 'Current User') => {
    const newProject = createActiveProjectFromSetup({
      draft,
      existingProjects: state.projects || [],
      performedBy,
    });

    addItem('projects', newProject);
    deleteProjectSetupDraft(draft.id);

    if (draft.sourceEnquiryId) {
      updateItem('enquiries', draft.sourceEnquiryId, {
        projectId: newProject.id,
        projectCode: newProject.projectCode,
        projectCreated: true,
        hasProject: true,
        status: 'won',
      });
    }
    if (draft.sourceEstimateId) {
      updateItem('estimates', draft.sourceEstimateId, {
        projectId: newProject.id,
        projectCode: newProject.projectCode,
        status: 'accepted',
      });
    }

    logAudit({
      documentType: 'project',
      documentId: newProject.id,
      documentNumber: newProject.projectCode,
      action: 'CREATE_ACTIVE_PROJECT_FROM_SETUP',
      performedBy,
      newStatus: 'active',
      details: `Active Project ${newProject.projectCode} created from Setup Wizard. Team & BOQ baseline locked.`,
    });

    return { success: true, project: newProject };
  };

  const logAudit = (event: Omit<AuditEvent, 'id' | 'performedAt'>) => {
    const fullEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      performedAt: new Date().toISOString(),
    };
    addItem('auditEvents', fullEvent);
  };

  // Domain Store Action: Activate Project
  const activateProject = (params: ActivateProjectParams) => {
    const estimate = state.estimates.find((e) => e.id === params.estimateVersionId || e.enquiryId === params.estimateVersionId);
    if (!estimate) {
      return { success: false, error: 'Estimate record not found for project activation.' };
    }

    // Hard Duplicate Guard: Check if a Project already exists for this accepted estimate or enquiry
    const existingProject = state.projects.find(
      (p) =>
        p.acceptedEstimateId === estimate.id ||
        p.sourceEstimateId === estimate.id ||
        p.sourceEstimateRevisionId === estimate.id ||
        (estimate.enquiryId && p.sourceEnquiryId === estimate.enquiryId)
    );

    if (existingProject) {
      return {
        success: false,
        error: `A project baseline (${existingProject.projectCode}) already exists for this accepted CRM estimate revision. Duplicate creation blocked.`,
        project: existingProject,
      };
    }

    const projectId = `prj-${Date.now()}`;
    const boqId = `boq-${Date.now()}`;

    // Convert Estimate BOQ Items into locked Project BOQ Lines
    const boqLines: ProjectBOQLine[] = [];
    let lineNo = 1;
    (estimate.boqSections || []).forEach((sec) => {
      sec.items.forEach((item) => {
        boqLines.push({
          id: `boq-line-${lineNo}-${Date.now()}`,
          estimateLineId: item.id,
          lineNo,
          itemDescription: item.description || item.productName || 'BOQ Line Item',
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          unitSymbol: item.unit || 'sqft',
          boqQuantity: item.quantity,
          boqRate: item.baseRate,
          boqAmount: item.totalCost,
          indentedQuantity: 0,
          orderedQuantity: 0,
          receivedQuantity: 0,
          issuedQuantity: 0,
          remainingQuantity: item.quantity,
          committedCost: 0,
          actualCost: 0,
          variance: 0,
        });
        lineNo++;
      });
    });

    const newProjectBOQ: ProjectBOQ = {
      id: boqId,
      projectId,
      originalEstimateVersionId: estimate.id,
      lines: boqLines,
      totalBOQValue: estimate.finalQuotationValue,
      lockedAt: new Date().toISOString(),
      lockedBy: params.performedBy,
    };

    const initialBOQRevision: BOQRevision = {
      id: `rev-${Date.now()}`,
      projectId,
      revisionNumber: 0,
      fileName: `Estimate_${estimate.quotationNumber}_Baseline_BOQ.xlsx`,
      fileSize: '1.2 MB',
      uploadedAt: new Date().toISOString(),
      uploadedBy: params.performedBy,
      status: 'approved',
      decisionBy: params.performedBy,
      decisionDate: new Date().toISOString(),
      decisionComment: `Baseline BOQ created automatically from CRM Estimate ${estimate.quotationNumber}`,
      totalValue: estimate.finalQuotationValue,
      categoryBudgets: [],
    };

    const newProject: Project = {
      id: projectId,
      projectCode: params.projectCode,
      projectName: params.projectName,
      city: params.siteLocation || 'Mumbai',
      siteAddress: params.siteLocation || 'Site Address',
      clientId: estimate.clientId || 'client-1',
      clientName: estimate.clientName || 'Client',

      // Locked CRM Traceability Baseline
      sourceEnquiryId: estimate.enquiryId,
      sourceEstimateId: estimate.id,
      sourceEstimateRevisionId: estimate.id,
      sourceQuotationNumber: estimate.quotationNumber,
      acceptedQuotationValue: estimate.finalQuotationValue,
      internalEstimatedCost: estimate.costSummary?.internalTotalCost || estimate.finalQuotationValue * 0.8,
      materialCost: estimate.costSummary?.materialCostSum || 0,
      labourCost: estimate.costSummary?.lineLabourSum || 0,
      installationCost: estimate.costSummary?.lineInstallationSum || 0,
      overheads: estimate.costSummary?.overheadAmount || 0,
      expectedMargin: estimate.costSummary?.profitAmount || 0,
      acceptedBOQSnapshot: estimate.boqSections || [],
      acceptedScheduleSnapshot: estimate.schedule || [],
      paymentTermsSnapshot: JSON.stringify(estimate.paymentTerms || []),
      clientPODetails: estimate.clientDecision?.clientPoNumber
        ? { poNumber: estimate.clientDecision.clientPoNumber, poAmount: estimate.clientDecision.acceptedValue }
        : undefined,

      acceptedEstimateId: estimate.id,
      acceptedEstimateVersionId: estimate.id,

      projectDirectorId: params.projectDirectorId,
      projectDirectorName: params.projectDirectorName,
      projectSupervisorId: params.projectSupervisorId,
      projectSupervisorName: params.projectSupervisorName,
      team: params.team,
      isTeamLocked: false,
      boqId,
      isBOQLocked: true,
      boqStatus: 'approved',
      boqRevisions: [initialBOQRevision],
      categoryBudgets: [],
      currentBOQValue: estimate.finalQuotationValue,
      budgetBaseline: estimate.costSummary?.internalTotalCost || estimate.finalQuotationValue * 0.8,
      approvedBudgetLimit: estimate.finalQuotationValue,
      committedCost: 0,
      actualCost: 0,
      certifiedRevenue: 0,
      clientReceipts: 0,
      startDate: params.startDate,
      targetCompletionDate: params.targetCompletionDate,
      progress: 0,
      status: 'active',
      projectStatus: 'active',
      createdAt: new Date().toISOString(),
      createdBy: params.performedBy,
      updatedAt: new Date().toISOString(),
      updatedBy: params.performedBy,
    };

    addItem('projectBOQs', newProjectBOQ);
    addItem('projects', newProject);

    if (estimate.enquiryId) {
      updateItem('enquiries', estimate.enquiryId, {
        status: 'won',
        updatedAt: new Date().toISOString(),
      });
    }

    logAudit({
      documentType: 'project',
      documentId: newProject.id,
      documentNumber: newProject.projectCode,
      action: 'ACTIVATED',
      performedBy: params.performedBy,
      newStatus: 'active',
      details: `Activated Project ${newProject.projectCode} (${newProject.projectName}) from Estimate ${estimate.quotationNumber} with baseline value ₹${estimate.finalQuotationValue.toLocaleString('en-IN')}`,
    });

    return { success: true, project: newProject };
  };

  // Domain Store Action: Lock Team
  const lockProjectTeam = (projectId: string, lockReason: string, performedBy: string) => {
    const project = state.projects.find((p) => p.id === projectId || p.projectCode === projectId);
    if (!project) return { success: false, error: 'Project not found' };

    if (!lockReason || lockReason.trim().length < 5) {
      return { success: false, error: 'A clear lock reason (at least 5 characters) is required to lock the team.' };
    }

    updateItem('projects', project.id, {
      isTeamLocked: true,
      updatedAt: new Date().toISOString(),
      updatedBy: performedBy,
    });

    logAudit({
      documentType: 'project_team',
      documentId: project.id,
      documentNumber: project.projectCode,
      action: 'LOCKED',
      performedBy,
      details: `Project team locked by ${performedBy}. Reason: ${lockReason}`,
    });

    return { success: true };
  };

  // Domain Store Action: Unlock Team
  const unlockProjectTeam = (projectId: string, unlockReason: string, performedBy: string) => {
    const project = state.projects.find((p) => p.id === projectId || p.projectCode === projectId);
    if (!project) return { success: false, error: 'Project not found' };

    if (!unlockReason || unlockReason.trim().length < 5) {
      return { success: false, error: 'A clear unlock justification (at least 5 characters) is required.' };
    }

    updateItem('projects', project.id, {
      isTeamLocked: false,
      updatedAt: new Date().toISOString(),
      updatedBy: performedBy,
    });

    logAudit({
      documentType: 'project_team',
      documentId: project.id,
      documentNumber: project.projectCode,
      action: 'UNLOCKED',
      performedBy,
      details: `Project team unlocked by ${performedBy}. Reason: ${unlockReason}`,
    });

    return { success: true };
  };

  // Domain Store Action: Create Material Indent
  const createMaterialIndent = (indent: MaterialIndent, performedBy: string) => {
    addItem('materialIndents', indent);
    logAudit({
      documentType: 'indent',
      documentId: indent.id,
      documentNumber: (indent as any).documentNumber || (indent as any).indentNumber || indent.id,
      action: 'CREATED',
      performedBy,
      newStatus: indent.status,
      details: `Material Indent ${(indent as any).documentNumber || (indent as any).indentNumber || indent.id} logged for project ${indent.projectName} with status ${indent.status}`,
    });
    return { success: true, indent };
  };

  // Domain Store Action: Submit Material Indent
  const submitMaterialIndent = (indentId: string, performedBy: string) => {
    const indent = state.materialIndents.find((i) => i.id === indentId);
    if (!indent) return { success: false, error: 'Indent not found' };

    const newStatus = indent.hasOverLimitLines ? 'approval_required' : 'approved';

    updateItem('materialIndents', indent.id, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: performedBy,
    });

    logAudit({
      documentType: 'indent',
      documentId: indent.id,
      documentNumber: (indent as any).documentNumber || (indent as any).indentNumber || indent.id,
      action: 'SUBMITTED',
      performedBy,
      previousStatus: indent.status,
      newStatus,
      details: `Submitted Indent ${(indent as any).documentNumber || (indent as any).indentNumber || indent.id}. Transited to ${newStatus}`,
    });

    return { success: true };
  };

  // Domain Store Action: Approve Material Indent (Segregation of Duties Enforced)
  const approveMaterialIndent = (indentId: string, approverId: string, comments: string) => {
    const indent = state.materialIndents.find((i) => i.id === indentId);
    if (!indent) return { success: false, error: 'Indent not found' };

    // Segregation of duties: Requester cannot approve their own exception request
    if (indent.createdBy.toLowerCase() === approverId.toLowerCase()) {
      return { success: false, error: 'Segregation of Duties Violation: Requester cannot approve their own indent exception request.' };
    }

    updateItem('materialIndents', indent.id, {
      status: 'approved',
      overLimitApproved: true,
      overLimitApprovedBy: approverId,
      overLimitApprovedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: approverId,
    });

    logAudit({
      documentType: 'indent',
      documentId: indent.id,
      documentNumber: (indent as any).documentNumber || (indent as any).indentNumber || indent.id,
      action: 'APPROVED',
      performedBy: approverId,
      previousStatus: indent.status,
      newStatus: 'approved',
      details: `Approved Material Indent ${(indent as any).documentNumber || (indent as any).indentNumber || indent.id}. Comments: ${comments || 'No comments'}`,
    });

    return { success: true };
  };

  // Domain Store Action: Reject Material Indent
  const rejectMaterialIndent = (indentId: string, rejectorId: string, reason: string) => {
    const indent = state.materialIndents.find((i) => i.id === indentId);
    if (!indent) return { success: false, error: 'Indent not found' };

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'A rejection reason (at least 5 characters) is mandatory.' };
    }

    updateItem('materialIndents', indent.id, {
      status: 'rejected',
      updatedAt: new Date().toISOString(),
      updatedBy: rejectorId,
    });

    logAudit({
      documentType: 'indent',
      documentId: indent.id,
      documentNumber: (indent as any).documentNumber || (indent as any).indentNumber || indent.id,
      action: 'REJECTED',
      performedBy: rejectorId,
      previousStatus: indent.status,
      newStatus: 'rejected',
      details: `Rejected Material Indent ${(indent as any).documentNumber || (indent as any).indentNumber || indent.id}. Reason: ${reason}`,
    });

    return { success: true };
  };

  // Domain Store Action: Return Material Indent for Revision
  const returnMaterialIndent = (indentId: string, returnerId: string, comments: string) => {
    const indent = state.materialIndents.find((i) => i.id === indentId);
    if (!indent) return { success: false, error: 'Indent not found' };

    if (!comments || comments.trim().length < 5) {
      return { success: false, error: 'Revision feedback comments (at least 5 characters) are mandatory.' };
    }

    updateItem('materialIndents', indent.id, {
      status: 'returned_for_revision',
      updatedAt: new Date().toISOString(),
      updatedBy: returnerId,
    });

    logAudit({
      documentType: 'indent',
      documentId: indent.id,
      documentNumber: (indent as any).documentNumber || (indent as any).indentNumber || indent.id,
      action: 'RETURNED_FOR_REVISION',
      performedBy: returnerId,
      previousStatus: indent.status,
      newStatus: 'returned_for_revision',
      details: `Returned Material Indent ${(indent as any).documentNumber || (indent as any).indentNumber || indent.id} for revision. Feedback: ${comments}`,
    });

    return { success: true };
  };

  // Procurement Store Action: Create RFQ
  const createRFQ = (rfq: RFQ, performedBy: string) => {
    addItem('rfqs', rfq);
    logAudit({
      documentType: 'rfq',
      documentId: rfq.id,
      documentNumber: rfq.documentNumber,
      action: 'CREATED',
      performedBy,
      newStatus: rfq.status,
      details: `Issued RFQ ${rfq.documentNumber} for project ${rfq.projectName} to ${rfq.invitedVendorIds.length} vendors`,
    });
    return { success: true, rfq };
  };

  // Procurement Store Action: Update RFQ Status
  const updateRFQStatus = (rfqId: string, status: RFQStatus, performedBy: string, comments?: string) => {
    const rfq = state.rfqs.find((r) => r.id === rfqId);
    if (!rfq) return { success: false, error: 'RFQ not found' };

    updateItem('rfqs', rfq.id, { status });
    logAudit({
      documentType: 'rfq',
      documentId: rfq.id,
      documentNumber: rfq.documentNumber,
      action: status.toUpperCase(),
      performedBy,
      previousStatus: rfq.status,
      newStatus: status,
      details: comments || `Updated RFQ status to ${status}`,
    });

    return { success: true };
  };

  // Procurement Store Action: Submit Vendor Quotation (Invitation validation enforced)
  const submitVendorQuotation = (quotation: VendorQuotation, performedBy: string) => {
    const rfq = state.rfqs.find((r) => r.id === quotation.rfqId);
    if (!rfq) return { success: false, error: 'Target RFQ not found' };

    // Workflow Guard: Uninvited vendor cannot submit quote for private RFQ
    if (!rfq.invitedVendorIds.includes(quotation.vendorId)) {
      return { success: false, error: 'Domain Guard Rejected: Vendor is not in the invited vendor list for this RFQ.' };
    }

    addItem('vendorQuotations', quotation);
    logAudit({
      documentType: 'quotation',
      documentId: quotation.id,
      documentNumber: quotation.documentNumber,
      action: 'SUBMITTED',
      performedBy,
      newStatus: quotation.status,
      details: `Submitted Quotation ${quotation.documentNumber} from ${quotation.vendorName} for RFQ ${rfq.documentNumber}. Landed Total: ₹${quotation.totalQuotedLandedAmount.toLocaleString('en-IN')}`,
    });

    // Update RFQ status to quotes_received if issued
    if (rfq.status === 'issued') {
      updateItem('rfqs', rfq.id, { status: 'quotes_received' });
    }

    return { success: true, quotation };
  };

  // Procurement Store Action: Award Rate Comparison
  const awardRateComparison = (comparisonId: string, selectedVendorId: string, remarks: string, performedBy: string) => {
    const comparison = state.rateComparisons.find((c) => c.id === comparisonId);
    if (!comparison) return { success: false, error: 'Comparison record not found' };

    const vendor = state.vendors.find((v) => v.id === selectedVendorId);
    if (!vendor) return { success: false, error: 'Selected vendor not found' };

    if (!remarks || remarks.trim().length < 5) {
      return { success: false, error: 'Selection remarks (at least 5 characters) are mandatory.' };
    }

    updateItem('rateComparisons', comparison.id, {
      status: 'awarded',
      selectedVendorId,
      selectedVendorName: vendor.name,
      selectionRemarks: remarks,
      selectedAt: new Date().toISOString(),
      selectedBy: performedBy,
    });

    const rfq = state.rfqs.find((r) => r.id === comparison.rfqId);
    if (rfq) {
      updateItem('rfqs', rfq.id, { status: 'awarded' });
    }

    logAudit({
      documentType: 'comparison',
      documentId: comparison.id,
      documentNumber: comparison.documentNumber,
      action: 'AWARDED',
      performedBy,
      previousStatus: comparison.status,
      newStatus: 'awarded',
      details: `Awarded Rate Comparison ${comparison.documentNumber} to vendor ${vendor.name}. Remarks: ${remarks}`,
    });

    return { success: true };
  };

  // Procurement Store Action: Create Direct Purchase
  const createDirectPurchase = (dp: DirectPurchase, performedBy: string) => {
    addItem('directPurchases', dp);
    logAudit({
      documentType: 'direct_purchase',
      documentId: dp.id,
      documentNumber: dp.documentNumber,
      action: 'CREATED',
      performedBy,
      newStatus: dp.status,
      details: `Created Direct Purchase ${dp.documentNumber} for vendor ${dp.vendorName}. Total: ₹${dp.grandTotal.toLocaleString('en-IN')}`,
    });
    return { success: true, directPurchase: dp };
  };

  // Procurement Store Action: Approve Direct Purchase (Self-approval prevention)
  const approveDirectPurchase = (dpId: string, approverId: string) => {
    const dp = state.directPurchases.find((d) => d.id === dpId);
    if (!dp) return { success: false, error: 'Direct Purchase not found' };

    if (dp.createdBy.toLowerCase() === approverId.toLowerCase()) {
      return { success: false, error: 'Segregation of Duties Violation: Requester cannot approve their own Direct Purchase request.' };
    }

    updateItem('directPurchases', dp.id, {
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: approverId,
    });

    logAudit({
      documentType: 'direct_purchase',
      documentId: dp.id,
      documentNumber: dp.documentNumber,
      action: 'APPROVED',
      performedBy: approverId,
      previousStatus: dp.status,
      newStatus: 'approved',
      details: `Approved Direct Purchase ${dp.documentNumber}`,
    });

    return { success: true };
  };

  // Procurement Store Action: Create Purchase Order (Strict origin guard)
  const createPurchaseOrder = (po: PurchaseOrder, performedBy: string = 'Procurement Lead') => {
    // Workflow Guard: PO must originate from awarded comparison or approved direct purchase
    if (po.originType === 'rfq' && po.sourceRFQId) {
      const comparison = state.rateComparisons.find((c) => c.rfqId === po.sourceRFQId);
      if (!comparison || comparison.status !== 'awarded') {
        return { success: false, error: 'Domain Guard Rejected: Cannot issue PO from RFQ without an Awarded Rate Comparison.' };
      }
    } else if (po.originType === 'direct_po' && po.sourceIndentId) {
      const dp = state.directPurchases?.find((d) => d.indentId === po.sourceIndentId || d.id === po.sourceRFQId);
      if (dp && dp.requiresDirectorApproval && dp.status !== 'approved') {
        return { success: false, error: 'Domain Guard Rejected: Direct Purchase requires Project Director approval before PO issuance.' };
      }
    }

    addItem('purchaseOrders', po);
    logAudit({
      documentType: 'purchase_order',
      documentId: po.id,
      documentNumber: po.documentNumber,
      action: 'CREATED',
      performedBy: performedBy || 'Procurement User',
      newStatus: po.status,
      details: `Issued Purchase Order ${po.documentNumber} to ${po.vendorName} for ₹${(po.totalAmount || po.grandTotal || 0).toLocaleString('en-IN')}`,
    });

    return { success: true, purchaseOrder: po };
  };

  const updatePOStatus = (poId: string, status: POStatus, performedBy: string, comments?: string) => {
    const po = state.purchaseOrders.find((p) => p.id === poId);
    if (!po) return { success: false, error: 'Purchase Order not found' };

    updateItem('purchaseOrders', po.id, { status, updatedAt: new Date().toISOString(), updatedBy: performedBy });
    logAudit({
      documentType: 'purchase_order',
      documentId: po.id,
      documentNumber: po.documentNumber,
      action: status.toUpperCase(),
      performedBy,
      previousStatus: po.status,
      newStatus: status,
      details: comments || `Updated PO status to ${status}`,
    });

    return { success: true };
  };

  // Stage 4 Store Action: Create Goods Received Note (GRN)
  const createGRN = (grn: GoodsReceivedNote, performedBy: string = 'Stores Officer') => {
    // Domain Guard: PO must be issued or approved
    const po = state.purchaseOrders.find((p) => p.id === grn.purchaseOrderId || p.documentNumber === grn.poNumber);
    if (!po || (po.status !== 'issued' && po.status !== 'approved')) {
      return { success: false, error: 'Domain Guard Rejected: GRN can only reference an issued or approved Purchase Order.' };
    }

    // Line Validation: Received now cannot exceed pending quantity
    for (const line of grn.lines) {
      if (line.currentReceivedQty > line.pendingPOQty) {
        return {
          success: false,
          error: `Over-Receipt Blocked: Received quantity (${line.currentReceivedQty}) for ${line.productName} exceeds remaining PO pending quantity (${line.pendingPOQty}).`,
        };
      }
      const sum = (line.acceptedQty || 0) + (line.rejectedQty || 0) + (line.underInspectionQty || 0);
      if (sum !== line.currentReceivedQty) {
        return {
          success: false,
          error: `Reconciliation Error: Accepted (${line.acceptedQty}) + Rejected (${line.rejectedQty}) + Under Inspection (${line.underInspectionQty}) must equal Received Now (${line.currentReceivedQty}) for ${line.productName}.`,
        };
      }
    }

    addItem('grns', grn);
    logAudit({
      documentType: 'grn',
      documentId: grn.id,
      documentNumber: grn.documentNumber,
      action: 'CREATED',
      performedBy,
      newStatus: grn.status,
      details: `Created GRN ${grn.documentNumber} for PO ${grn.poNumber} at ${grn.destinationLocationName}`,
    });

    return { success: true, grn };
  };

  // Stage 4 Store Action: Inspect GRN
  const inspectGRN = (grnId: string, inspection: QualityInspection, performedBy: string = 'Quality Inspector') => {
    const grn = (state.grns || []).find((g) => g.id === grnId);
    if (!grn) return { success: false, error: 'GRN not found' };

    const newStatus: GRNStatus = inspection.testResult === 'failed' ? 'rejected' : 'inspected';

    updateItem('grns', grn.id, {
      qualityInspection: inspection,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: performedBy,
    });

    logAudit({
      documentType: 'grn',
      documentId: grn.id,
      documentNumber: grn.documentNumber,
      action: 'INSPECTED',
      performedBy,
      newStatus,
      details: `Quality Inspection completed for GRN ${grn.documentNumber}. Result: ${inspection.testResult.toUpperCase()}`,
    });

    return { success: true };
  };

  // Stage 4 Store Action: Approve GRN
  const approveGRN = (grnId: string, approverId: string = 'Project Director', comments?: string) => {
    const grn = (state.grns || []).find((g) => g.id === grnId);
    if (!grn) return { success: false, error: 'GRN not found' };

    if (grn.status === 'rejected') {
      return { success: false, error: 'Cannot approve a quality-rejected GRN.' };
    }

    updateItem('grns', grn.id, {
      status: 'approved',
      updatedAt: new Date().toISOString(),
      updatedBy: approverId,
    });

    logAudit({
      documentType: 'grn',
      documentId: grn.id,
      documentNumber: grn.documentNumber,
      action: 'APPROVED',
      performedBy: approverId,
      newStatus: 'approved',
      details: comments || `Approved GRN ${grn.documentNumber} for stock posting.`,
    });

    return { success: true };
  };

  // Stage 4 Store Action: Post GRN to Stock (IDEMPOTENT GUARD ENFORCED)
  const postGRNToStock = (grnId: string, postedBy: string = 'Warehouse Manager') => {
    const grn = (state.grns || []).find((g) => g.id === grnId);
    if (!grn) return { success: false, error: 'GRN not found' };

    // Idempotency Guard
    if (grn.isPostedToStock) {
      return { success: false, error: 'IDEMPOTENCY GUARD REJECTED: GRN is already posted to stock. Double posting is strictly prohibited.' };
    }

    if (grn.status !== 'approved' && grn.status !== 'inspected') {
      return { success: false, error: 'Domain Guard Rejected: GRN must be inspected or approved before stock posting.' };
    }

    const now = new Date().toISOString();
    const newStockEntries: StockLedgerEntry[] = [];

    // Create immutable stock ledger entries ONLY for accepted quantities
    grn.lines.forEach((line) => {
      if (line.acceptedQty > 0) {
        const entry: StockLedgerEntry = {
          id: `stk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: line.productId,
          productCode: line.productCode,
          productName: line.productName,
          projectId: grn.projectId,
          locationId: grn.destinationLocationId || 'loc-001',
          locationName: grn.destinationLocationName || 'Central Site Warehouse',
          entryType: 'grn_accepted',
          inQuantity: line.acceptedQty,
          outQuantity: 0,
          runningBalance: 0, // Will be computed by selector
          unitRate: line.unitRate || 0,
          totalValue: line.acceptedQty * (line.unitRate || 0),
          unitSymbol: line.unitSymbol,
          sourceDocumentId: grn.id,
          sourceDocumentNumber: grn.documentNumber,
          entryDate: grn.receivedDate || now.split('T')[0],
          createdTime: now,
          isImmutable: true,
          recordedBy: postedBy,
        };
        newStockEntries.push(entry);
      }
    });

    // Save stock ledger entries
    const currentLedger = state.stockLedger || [];
    updateCollection('stockLedger', [...currentLedger, ...newStockEntries]);

    // Update GRN status
    updateItem('grns', grn.id, {
      isPostedToStock: true,
      postedAt: now,
      postedBy,
      status: 'posted',
      updatedAt: now,
      updatedBy: postedBy,
    });

    logAudit({
      documentType: 'grn',
      documentId: grn.id,
      documentNumber: grn.documentNumber,
      action: 'POSTED_TO_STOCK',
      performedBy: postedBy,
      newStatus: 'posted',
      details: `Posted ${newStockEntries.length} accepted stock ledger entries for GRN ${grn.documentNumber}`,
    });

    return { success: true };
  };

  // Stage 4 Store Action: Create Material Issue (Available stock validation & location transfer)
  const createMaterialIssue = (issue: MaterialIssue, performedBy: string = 'Stores Officer') => {
    const currentLedger = state.stockLedger || [];
    const now = new Date().toISOString();
    const newStockEntries: StockLedgerEntry[] = [];

    // Verify stock availability at source location
    for (const line of issue.lines) {
      let avail = 0;
      currentLedger.forEach((e) => {
        if (e.locationId === issue.sourceLocationId && e.productId === line.productId) {
          avail += (e.inQuantity || 0) - (e.outQuantity || 0);
        }
      });

      if (line.issuedQty > avail) {
        return {
          success: false,
          error: `Stock Guard Violation: Cannot issue ${line.issuedQty} ${line.unitSymbol} of ${line.productName}. Available stock at ${issue.sourceLocationName} is only ${avail}.`,
        };
      }

      // Outbound entry at source location
      const outEntry: StockLedgerEntry = {
        id: `stk-out-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: line.productId,
        productCode: line.productCode,
        productName: line.productName,
        projectId: issue.projectId,
        locationId: issue.sourceLocationId,
        locationName: issue.sourceLocationName,
        entryType: 'material_issue',
        inQuantity: 0,
        outQuantity: line.issuedQty,
        runningBalance: 0,
        unitRate: 0,
        totalValue: 0,
        unitSymbol: line.unitSymbol,
        sourceDocumentId: issue.id,
        sourceDocumentNumber: issue.documentNumber,
        entryDate: issue.issueDate || now.split('T')[0],
        createdTime: now,
        isImmutable: true,
        recordedBy: performedBy,
      };

      // Inbound transfer entry at destination location (work package / site area)
      const inEntry: StockLedgerEntry = {
        id: `stk-in-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: line.productId,
        productCode: line.productCode,
        productName: line.productName,
        projectId: issue.projectId,
        locationId: issue.destinationLocationId || 'loc-dest-001',
        locationName: issue.destinationAreaName || 'Site Work Package',
        entryType: 'transfer_in',
        inQuantity: line.issuedQty,
        outQuantity: 0,
        runningBalance: 0,
        unitRate: 0,
        totalValue: 0,
        unitSymbol: line.unitSymbol,
        sourceDocumentId: issue.id,
        sourceDocumentNumber: issue.documentNumber,
        entryDate: issue.issueDate || now.split('T')[0],
        createdTime: now,
        isImmutable: true,
        recordedBy: performedBy,
      };

      newStockEntries.push(outEntry, inEntry);
    }

    addItem('materialIssues', issue);
    updateCollection('stockLedger', [...currentLedger, ...newStockEntries]);

    logAudit({
      documentType: 'material_issue',
      documentId: issue.id,
      documentNumber: issue.documentNumber,
      action: 'ISSUED',
      performedBy,
      newStatus: 'issued',
      details: `Issued ${issue.lines.length} material lines from ${issue.sourceLocationName} to ${issue.destinationAreaName}`,
    });

    return { success: true, issue };
  };

  // Stage 4 Store Action: Create Material Return
  const createMaterialReturn = (ret: MaterialReturn, performedBy: string = 'Site Supervisor') => {
    const currentLedger = state.stockLedger || [];
    const now = new Date().toISOString();
    const newStockEntries: StockLedgerEntry[] = [];

    // Reusable stock returns to inventory ledger
    for (const line of ret.lines) {
      if (line.reusableQty > 0) {
        const recreditEntry: StockLedgerEntry = {
          id: `stk-ret-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: line.productId,
          productCode: line.productCode,
          productName: line.productName,
          projectId: ret.projectId,
          locationId: 'loc-001',
          locationName: 'Central Site Warehouse',
          entryType: 'material_return',
          inQuantity: line.reusableQty,
          outQuantity: 0,
          runningBalance: 0,
          unitRate: 0,
          totalValue: 0,
          unitSymbol: line.unitSymbol,
          sourceDocumentId: ret.id,
          sourceDocumentNumber: ret.documentNumber,
          entryDate: ret.returnDate || now.split('T')[0],
          createdTime: now,
          isImmutable: true,
          recordedBy: performedBy,
        };
        newStockEntries.push(recreditEntry);
      }
    }

    addItem('materialReturns', ret);
    if (newStockEntries.length > 0) {
      updateCollection('stockLedger', [...currentLedger, ...newStockEntries]);
    }

    logAudit({
      documentType: 'material_return',
      documentId: ret.id,
      documentNumber: ret.documentNumber,
      action: 'RETURNED',
      performedBy,
      newStatus: ret.status,
      details: `Processed Material Return ${ret.documentNumber} for Issue ${ret.originalIssueNumber}`,
    });

    return { success: true, materialReturn: ret };
  };

  // Stage 4 Store Action: Create Material Consumption (Deducts destination location stock without double-counting)
  const createMaterialConsumption = (consumption: MaterialConsumption, performedBy: string = 'Site Engineer') => {
    const currentLedger = state.stockLedger || [];
    const now = new Date().toISOString();
    const newStockEntries: StockLedgerEntry[] = [];

    for (const line of consumption.lines) {
      if (line.consumedQty > 0) {
        const consumptionEntry: StockLedgerEntry = {
          id: `stk-con-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: line.productId,
          productCode: line.productCode,
          productName: line.productName,
          projectId: consumption.projectId,
          locationId: consumption.locationId || 'loc-dest-001',
          locationName: consumption.locationName || 'Site Work Package',
          entryType: 'material_consumption',
          inQuantity: 0,
          outQuantity: line.consumedQty,
          runningBalance: 0,
          unitRate: 0,
          totalValue: 0,
          unitSymbol: line.unitSymbol,
          sourceDocumentId: consumption.id,
          sourceDocumentNumber: consumption.documentNumber,
          entryDate: consumption.consumptionDate || now.split('T')[0],
          createdTime: now,
          isImmutable: true,
          recordedBy: performedBy,
        };
        newStockEntries.push(consumptionEntry);
      }
    }

    addItem('materialConsumptions', consumption);
    if (newStockEntries.length > 0) {
      updateCollection('stockLedger', [...currentLedger, ...newStockEntries]);
    }

    logAudit({
      documentType: 'material_consumption',
      documentId: consumption.id,
      documentNumber: consumption.documentNumber,
      action: 'POSTED',
      performedBy,
      newStatus: 'posted',
      details: `Posted Material Consumption ${consumption.documentNumber}`,
    });

    return { success: true, consumption };
  };

  // Stage 4 Store Action: Create Subcontractor Work Order
  const createSubcontractorWorkOrder = (wo: WorkOrder, performedBy: string = 'Contracts Lead') => {
    addItem('workOrders', wo);
    logAudit({
      documentType: 'work_order',
      documentId: wo.id,
      documentNumber: wo.documentNumber,
      action: 'CREATED',
      performedBy,
      newStatus: wo.status,
      details: `Created Subcontractor Work Order ${wo.documentNumber} for ${wo.subcontractorName} - ₹${wo.totalAmount.toLocaleString('en-IN')}`,
    });
    return { success: true, workOrder: wo };
  };

  // Stage 4 Store Action: Create Subcontractor WIP Entry
  const createWIPEntry = (wip: SubcontractorWIP, performedBy: string = 'QS Engineer') => {
    // Domain Guard: Work Order must be issued or in_progress
    const wo = state.workOrders.find((w) => w.id === wip.workOrderId || w.documentNumber === wip.woNumber);
    if (!wo || (wo.status !== 'issued' && wo.status !== 'in_progress' && wo.status !== 'approved')) {
      return { success: false, error: 'Domain Guard Rejected: WIP measurement can only reference an issued or active Work Order.' };
    }

    addItem('wips', wip);
    logAudit({
      documentType: 'wip',
      documentId: wip.id,
      documentNumber: wip.documentNumber,
      action: 'SUBMITTED',
      performedBy,
      newStatus: wip.status,
      details: `Submitted Subcontractor WIP Measurement ${wip.documentNumber} for Work Order ${wip.woNumber}`,
    });

    return { success: true, wip };
  };

  // Stage 4 Store Action: Certify Subcontractor WIP (Cumulative certification limits enforced)
  const certifyWIP = (cert: WIPCertification, performedBy: string = 'Project Director') => {
    // Cumulative validation check
    for (const line of cert.lines) {
      if (line.proposedCertifiedQty > line.currentMeasuredQty) {
        return {
          success: false,
          error: `Certification Guard Violation: Proposed certified quantity (${line.proposedCertifiedQty}) cannot exceed measured quantity (${line.currentMeasuredQty}) for ${line.scopeDescription}.`,
        };
      }
      if (line.cumulativeCertifiedQty > line.orderedQty * 1.05) {
        return {
          success: false,
          error: `Controlled Limit Violation: Cumulative certified quantity (${line.cumulativeCertifiedQty}) exceeds ordered limit (${line.orderedQty}) without an approved variation.`,
        };
      }
    }

    addItem('wipCertifications', cert);
    logAudit({
      documentType: 'wip_certification',
      documentId: cert.id,
      documentNumber: cert.documentNumber,
      action: 'CERTIFIED',
      performedBy,
      newStatus: 'certified',
      details: `Certified WIP ${cert.wipNumber} for ₹${cert.netPayableAmount.toLocaleString('en-IN')} (Retention: ₹${cert.retentionDeductionAmount.toLocaleString('en-IN')})`,
    });

    return { success: true, certification: cert };
  };

  // Master Data Action: Create Category
  const createCategory = (category: Category, performedBy: string = 'Master Data Lead') => {
    // Uniqueness validation check
    const normalizedNewName = category.name.trim().replace(/\s+/g, ' ').toLowerCase();
    const isDuplicate = state.categories.some(
      (c) =>
        c.name.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedNewName &&
        (c.parentGroupId || '') === (category.parentGroupId || '')
    );
    if (isDuplicate) {
      return { success: false, error: 'A category with this name already exists in the selected parent group.' };
    }

    addItem('categories', category);
    logAudit({
      documentType: 'category' as any,
      documentId: category.id,
      documentNumber: category.code,
      action: 'CREATED',
      performedBy,
      newStatus: category.isActive ? 'Active' : 'Inactive',
      details: `Created Category ${category.code} - ${category.name}`,
    });
    return { success: true, category };
  };

  // Master Data Action: Update Category
  const updateCategory = (categoryId: string, input: Partial<Category>, performedBy: string = 'Master Data Lead') => {
    const existing = state.categories.find((c) => c.id === categoryId);
    if (!existing) return { success: false, error: 'Category not found' };

    updateItem('categories', categoryId, input);
    logAudit({
      documentType: 'category' as any,
      documentId: categoryId,
      documentNumber: existing.code,
      action: 'UPDATED',
      performedBy,
      newStatus: input.isActive !== undefined ? (input.isActive ? 'Active' : 'Inactive') : existing.isActive ? 'Active' : 'Inactive',
      details: `Updated Category ${existing.code}`,
    });
    return { success: true };
  };

  // Master Data Action: Deactivate Category
  const deactivateCategory = (categoryId: string, reason: string, performedBy: string = 'Master Data Lead') => {
    const existing = state.categories.find((c) => c.id === categoryId);
    if (!existing) return { success: false, error: 'Category not found' };

    updateItem('categories', categoryId, { isActive: false });
    logAudit({
      documentType: 'category' as any,
      documentId: categoryId,
      documentNumber: existing.code,
      action: 'DEACTIVATED',
      performedBy,
      newStatus: 'Inactive',
      details: `Deactivated Category ${existing.code}. Reason: ${reason}`,
    });
    return { success: true };
  };

  // Master Data Action: Reactivate Category
  const reactivateCategory = (categoryId: string, performedBy: string = 'Master Data Lead') => {
    const existing = state.categories.find((c) => c.id === categoryId);
    if (!existing) return { success: false, error: 'Category not found' };

    updateItem('categories', categoryId, { isActive: true });
    logAudit({
      documentType: 'category' as any,
      documentId: categoryId,
      documentNumber: existing.code,
      action: 'REACTIVATED',
      performedBy,
      newStatus: 'Active',
      details: `Reactivated Category ${existing.code}`,
    });
    return { success: true };
  };

  const addProjectCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    setState((prev) => {
      const list = prev.projectCategories || [
        'Commercial Fit-Out',
        'Residential Interior',
        'Hospitality Fit-Out',
        'Retail Shop',
        'Corporate Office',
        'Healthcare & Clinic',
        'Airport Lounge',
        'Custom Fit-Out',
      ];
      if (list.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [...list, trimmed];
      localStorage.setItem('empire_erp_project_categories', JSON.stringify(updated));
      return { ...prev, projectCategories: updated };
    });
  };

  const addPropertyType = (type: string) => {
    const trimmed = type.trim();
    if (!trimmed) return;
    setState((prev) => {
      const list = prev.propertyTypes || [
        'Commercial Office',
        'Penthouse',
        'Bungalow',
        'Showroom / Retail',
        'Restaurant / Cafe',
        'Hotel / Resort',
        'Airport Executive Lounge',
        'Hospital / Clinic',
        'Warehouse Office',
      ];
      if (list.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [...list, trimmed];
      localStorage.setItem('empire_erp_property_types', JSON.stringify(updated));
      return { ...prev, propertyTypes: updated };
    });
  };

  return (
    <ERPStoreContext.Provider
      value={{
        state,
        activeRole,
        setActiveRole,
        isLoading,
        updateCollection,
        addItem,
        updateItem,
        saveProjectSetupDraft,
        deleteProjectSetupDraft,
        createActiveProjectFromDraft,
        activateProject,
        lockProjectTeam,
        unlockProjectTeam,
        createMaterialIndent,
        submitMaterialIndent,
        approveMaterialIndent,
        rejectMaterialIndent,
        returnMaterialIndent,
        createRFQ,
        updateRFQStatus,
        submitVendorQuotation,
        awardRateComparison,
        createDirectPurchase,
        approveDirectPurchase,
        createPurchaseOrder,
        updatePOStatus,
        createGRN,
        inspectGRN,
        approveGRN,
        postGRNToStock,
        createMaterialIssue,
        createMaterialReturn,
        createMaterialConsumption,
        createSubcontractorWorkOrder,
        createWIPEntry,
        certifyWIP,
        createCategory,
        updateCategory,
        deactivateCategory,
        reactivateCategory,
        addProjectCategory,
        addPropertyType,
        logAudit,
        resetToDefaults,
      }}
    >
      {children}
    </ERPStoreContext.Provider>
  );
};

export const useERPStore = () => {
  const context = useContext(ERPStoreContext);
  if (!context) {
    throw new Error('useERPStore must be used within an ERPStoreProvider');
  }
  return context;
};
