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
  SubcontractWorkOrder,
  GoodsReceivedNote,
  GRNStatus,
  GoodsReceipt,
  GRNItem,
  QualityInspection,
  MaterialEntryToken,
  MaterialEntryTokenStatus,
  MaterialReceivingCheck,
  TokenActivity,
  StockLedgerEntry,
  MaterialIssue,
  MaterialIssueItem,
  MaterialReturn,
  MaterialConsumption,
  SubcontractorWIP,
  WIPCertification,
  RFQStatus,
  POStatus,
  GRNPayment,
  VendorAP,
  APPaymentStatus,
  APPaymentRecord,
  SubcontractorBill,
  SubcontractorBillPaymentStatus,
  SubcontractorBillPayment,
  ClientRABill,
  ClientPaymentReceipt,
  ClientRABillPaymentStatus,
  ProjectBillingMilestone,
} from '../domain/types';
import { evaluateBillingMilestones, BillingEvaluationTriggerEvent } from '../utils/milestoneBillingEngine';
import { generateGateTokenNumber, generatePONumber, generateGRNNumber } from '../domain/documentNumbers';
import { normalizeEstimate } from '../utils/normalizeEstimate';
import { normalizeMaterialIssue } from '../utils/materialIssueHelpers';
import { getAvailableStockForLocationAndProduct } from '../domain/selectors';
import {
  migrateIncompleteProjectsToDrafts,
  reconcileCRMProjectLinks,
  createActiveProjectFromSetup,
  startProjectSetupFromAcceptedEstimate,
} from '../utils/crmProjectHandoff';

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
  cancelMaterialIndent: (indentId: string, performedBy: string, reason: string) => { success: boolean; error?: string };

  // Procurement Store Actions
  createRFQ: (rfq: RFQ, performedBy: string) => { success: boolean; rfq?: RFQ; error?: string };
  updateRFQStatus: (rfqId: string, status: RFQStatus, performedBy: string, comments?: string) => { success: boolean; error?: string };
  submitVendorQuotation: (quotation: VendorQuotation, performedBy: string) => { success: boolean; quotation?: VendorQuotation; error?: string };
  awardRateComparison: (comparisonId: string, selectedVendorId: string, remarks: string, performedBy: string) => { success: boolean; error?: string };
  createDirectPurchase: (dp: DirectPurchase, performedBy: string) => { success: boolean; directPurchase?: DirectPurchase; error?: string };
  approveDirectPurchase: (dpId: string, approverId: string) => { success: boolean; error?: string };
  createPurchaseOrder: (po: PurchaseOrder, performedBy?: string) => { success: boolean; purchaseOrder?: PurchaseOrder; error?: string };
  updatePOStatus: (poId: string, status: POStatus, performedBy: string, comments?: string) => { success: boolean; error?: string };
  approvePurchaseOrder: (poId: string, approverId: string, approverName: string) => { success: boolean; error?: string };
  rejectPurchaseOrder: (poId: string, rejectorId: string, reason: string) => { success: boolean; error?: string };
  cancelPurchaseOrder: (poId: string, performedBy: string, reason: string) => { success: boolean; error?: string };
  addPODelivery: (poId: string, delivery: any) => { success: boolean; error?: string };
  // Inward Flow Store Actions
  createMaterialEntryToken: (tokenData: Partial<MaterialEntryToken>, createdBy?: string) => { success: boolean; token?: MaterialEntryToken; error?: string };
  holdMaterialToken: (tokenId: string, reason: string, remarks?: string, performedBy?: string) => { success: boolean; error?: string };
  resumeMaterialToken: (tokenId: string, remarks?: string, performedBy?: string) => { success: boolean; error?: string };
  cancelMaterialToken: (tokenId: string, reason: string, performedBy?: string) => { success: boolean; error?: string };
  createMaterialReceivingCheck: (checkData: Partial<MaterialReceivingCheck>, checkedBy?: string) => { success: boolean; receivingCheck?: MaterialReceivingCheck; error?: string };
  completeQCInspection: (inspectionData: Partial<QualityInspection>, inspectorName?: string) => { success: boolean; inspection?: QualityInspection; requiresAdminApproval?: boolean; error?: string };
  approveAdminQC: (qcId: string, decision: 'APPROVED' | 'REJECTED' | 'HOLD', adminRemarks: string, adminName?: string) => { success: boolean; grn?: GoodsReceipt | null; error?: string };
  addTokenActivity: (activity: Omit<TokenActivity, 'id' | 'timestamp'>) => void;
  isAwaitingReceiving: (token: MaterialEntryToken) => boolean;
  isAwaitingQC: (token: MaterialEntryToken) => boolean;
  // Stage 4 Store Actions
  createGRN: (grn: GoodsReceivedNote, performedBy?: string) => { success: boolean; grn?: GoodsReceivedNote; error?: string };
  inspectGRN: (grnId: string, inspection: QualityInspection, performedBy?: string) => { success: boolean; error?: string };
  approveGRN: (grnId: string, approverId?: string, comments?: string) => { success: boolean; error?: string };
  postGRNToStock: (grnId: string, postedBy?: string) => { success: boolean; error?: string };
  getStockBalance: (params: { productId: string; warehouseId?: string; locationId?: string }) => number;
  getPerLocationStock: (productId: string) => { productId: string; breakdown: { warehouseId: string; warehouseName: string; type: string; balance: number }[]; totalCompanyStock: number };
  createMaterialIssue: (issue: Partial<MaterialIssue>, performedBy?: string) => { success: boolean; materialIssue?: MaterialIssue; error?: string };
  dispatchMaterialIssue: (issueId: string, dispatchedBy?: string) => { success: boolean; error?: string };
  recordSiteReceipt: (issueId: string, receipts: { productId: string; receiveNowQty: number }[], receivedBy?: string, remarks?: string) => { success: boolean; error?: string };
  cancelMaterialIssue: (issueId: string, cancelledBy?: string, reason?: string) => { success: boolean; error?: string };
  createMaterialReturn: (ret: MaterialReturn, performedBy?: string) => { success: boolean; materialReturn?: MaterialReturn; error?: string };
  createMaterialConsumption: (consumption: MaterialConsumption, performedBy?: string) => { success: boolean; consumption?: MaterialConsumption; error?: string };
  createSubcontractorWorkOrder: (wo: SubcontractWorkOrder | WorkOrder | any, performedBy?: string) => { success: boolean; workOrder?: any; error?: string };
  updateSubcontractWorkOrder: (id: string, patch: Partial<SubcontractWorkOrder>, performedBy?: string) => void;
  createWIPEntry: (wip: SubcontractorWIP, performedBy?: string) => { success: boolean; wip?: SubcontractorWIP; error?: string };
  approveSubcontractorWIP: (wipId: string, approvedLines: Array<{ itemId: string; approvedQty: number; approvedValue?: number }>, performedBy?: string) => { success: boolean; wip?: SubcontractorWIP; error?: string };
  rejectSubcontractorWIP: (wipId: string, reason?: string, performedBy?: string) => { success: boolean; error?: string };
  createSubcontractWIP: (wip: any, _performedBy?: string) => { success: boolean; wip?: any; error?: string };
  updateSubcontractWIPStatus: (wipId: string, status: string, performedBy?: string) => void;
  certifyWIP: (cert: WIPCertification, performedBy?: string) => { success: boolean; certification?: WIPCertification; error?: string };
  recordGRNPayment: (paymentInput: any, performedBy?: string) => { success: boolean; payment?: any; error?: string };
  createSubcontractorBill: (bill: any, performedBy?: string) => { success: boolean; error?: string };
  updateSubcontractorBillStatus: (billId: string, status: string, performedBy?: string) => void;

  // Vendor AP Store Actions
  ensureAPForGRN: (grn: GoodsReceipt | GoodsReceivedNote, performedBy?: string) => VendorAP;
  approveVendorAP: (apId: string, performedBy?: string) => { success: boolean; error?: string };
  rejectVendorAP: (apId: string, reason: string, performedBy?: string) => { success: boolean; error?: string };
  recordVendorAPPayment: (
    apId: string,
    payment: {
      paymentDate: string;
      amountPaid: number;
      paymentMethod: string;
      paymentReference: string;
      payingBankAccount?: string;
      remarks?: string;
    },
    performedBy?: string
  ) => { success: boolean; error?: string };

  // Subcontractor Bill Store Actions
  ensureSubcontractorBillForWIP: (wipId: string, performedBy?: string) => SubcontractorBill | null;
  approveSubcontractorBill: (billId: string, performedBy?: string) => { success: boolean; error?: string };
  rejectSubcontractorBill: (billId: string, reason: string, performedBy?: string) => { success: boolean; error?: string };
  reopenSubcontractorBill: (billId: string, reason: string, performedBy?: string) => { success: boolean; error?: string };
  editSubcontractorBill: (billId: string, updates: Partial<SubcontractorBill>, performedBy?: string) => { success: boolean; error?: string };
  recordSubcontractorPayment: (
    billId: string,
    payment: {
      paymentDate: string;
      amountPaid: number;
      paymentMethod: string;
      referenceNumber: string;
      payingBankAccount?: string;
      remarks?: string;
    },
    performedBy?: string
  ) => { success: boolean; error?: string };

  // Client RA Bills Store Actions
  createClientRABill: (bill: Partial<ClientRABill>, performedBy?: string) => { success: boolean; bill?: ClientRABill; error?: string };
  editClientRABill: (billId: string, updates: Partial<ClientRABill>, performedBy?: string) => { success: boolean; error?: string };
  submitClientRABillForApproval: (billId: string, performedBy?: string) => { success: boolean; error?: string };
  approveClientRABill: (billId: string, performedBy?: string) => { success: boolean; error?: string };
  rejectClientRABill: (billId: string, reason: string, performedBy?: string) => { success: boolean; error?: string };
  markClientRABillSent: (billId: string, performedBy?: string) => { success: boolean; error?: string };
  recordClientPayment: (
    billId: string,
    receipt: {
      receiptDate: string;
      amountReceived: number;
      paymentMode: string;
      referenceNumber?: string;
      receivingBankAccount: string;
      remarks?: string;
    },
    performedBy?: string
  ) => { success: boolean; error?: string };
  reopenClientRABill: (billId: string, reason: string, performedBy?: string) => { success: boolean; error?: string };
  triggerProjectBillingEvaluation: (
    projectId: string,
    event: BillingEvaluationTriggerEvent
  ) => { triggeredMilestones: ProjectBillingMilestone[]; createdRABills: ClientRABill[] };
  manuallyTriggerBillingMilestone: (
    projectId: string,
    milestoneId: string,
    notes?: string,
    performedBy?: string
  ) => { success: boolean; error?: string };

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
  resetDemoData: () => Promise<void>;
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
        const DEMO_SEED_VERSION = 'v8_canonical_grn_tokens';
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
          localStorage.setItem('flutebyte_demo_backup_v4', JSON.stringify(backupData));

          // Clean reset to v4 CANONICAL_SEED_DATA (Replace old business records entirely)
          await repository.resetToDefaults(CANONICAL_SEED_DATA);
          localStorage.setItem('flutebyte_demo_seed_version', DEMO_SEED_VERSION);
        }

        const freshStored = await repository.loadAll();
        const merged: ERPCollections = { ...freshStored };

        // Override business collections explicitly with fresh stored values
        (Object.keys(CANONICAL_SEED_DATA) as Array<keyof ERPCollections>).forEach((key) => {
          if (freshStored[key] && Array.isArray(freshStored[key])) {
            merged[key] = freshStored[key] as any;
          } else {
            merged[key] = CANONICAL_SEED_DATA[key] as any;
          }
        });

        // Ensure indents and materialIndents are synchronized
        const activeIndents = merged.materialIndents?.length ? merged.materialIndents : merged.indents || [];
        merged.materialIndents = activeIndents;
        merged.indents = activeIndents;

        // Schema version check & normalization
        const CURRENT_SCHEMA_VERSION = '2';
        const storedSchemaVersion = localStorage.getItem('empire_erp_schema_version');

        if (Array.isArray(merged.estimates)) {
          const normalized = merged.estimates.map(normalizeEstimate);
          merged.estimates = normalized;
          repository.saveCollection('estimates', normalized);
        }

        if (Array.isArray(merged.materialIssues)) {
          const normalizedIssues = merged.materialIssues.map(normalizeMaterialIssue);
          merged.materialIssues = normalizedIssues;
          repository.saveCollection('materialIssues', normalizedIssues);
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

        // Auto-reconcile active projects with empty BOQ snapshots from accepted CRM estimates
        const repairedProjects = finalizedProjects.map((proj: any) => {
          const isBOQLocked = Boolean(proj.projectBOQLocked || proj.isBOQLocked);
          const hasLines =
            proj.lockedProjectBOQ?.lines?.length > 0 ||
            (proj.lockedProjectBOQ?.sections && proj.lockedProjectBOQ.sections.some((s: any) => s.items?.length > 0));

          if (isBOQLocked && !hasLines) {
            const estId = proj.sourceEstimateRevisionId || proj.sourceEstimateId || proj.acceptedEstimateId;
            const acceptedEst = (merged.estimates || []).find((e: any) => e.id === estId || e.enquiryId === proj.sourceEnquiryId);
            if (acceptedEst) {
              const draftSnapshot = startProjectSetupFromAcceptedEstimate({
                enquiry: { id: proj.sourceEnquiryId, clientName: proj.clientName, projectRequirement: proj.projectName },
                estimate: acceptedEst,
                clients: merged.clients || [],
                employees: merged.employees || [],
              });
              return {
                ...proj,
                projectBOQLocked: true,
                isBOQLocked: true,
                lockedProjectBOQ: draftSnapshot.boqLockSetup.lockedProjectBOQ,
              };
            }
          }
          return proj;
        });

        // Normalize purchase orders (ensure canonical documentNumber and poNumber)
        if (Array.isArray(merged.purchaseOrders)) {
          merged.purchaseOrders = merged.purchaseOrders.map((po: any, idx: number) => {
            const canonicalNum = po.documentNumber || po.poNumber || po.number || po.code || `PO-2026-00${idx + 1}`;
            return {
              ...po,
              documentNumber: canonicalNum,
              poNumber: canonicalNum,
              deliveries: po.deliveries || [],
              paymentStatus: po.paymentStatus || 'unpaid',
              deliveryStatus: po.deliveryStatus || 'not_received',
            };
          });
        }

        merged.projects = repairedProjects;
        merged.projectSetupDrafts = updatedSetupDrafts;
        repository.saveCollection('projects', repairedProjects);
        repository.saveCollection('purchaseOrders', merged.purchaseOrders);
        repository.saveCollection('projectSetupDrafts' as any, updatedSetupDrafts);

        // Auto-reconcile GRN commercial rates and financial snapshot totals
        if (Array.isArray(merged.goodsReceipts) && Array.isArray(merged.purchaseOrders)) {
          let grnUpdated = false;
          const grnPayments = merged.grnPayments || [];
          merged.goodsReceipts = merged.goodsReceipts.map((grn: any) => {
            const po = merged.purchaseOrders.find(
              (p: any) => p.id === grn.poId || p.poNumber === grn.poNumber || p.documentNumber === grn.poNumber
            );
            if (!po) return grn;

            let totalBaseAcceptedValue = 0;
            let totalTaxAmount = 0;
            let mainPoUnitRate = grn.poUnitRate || 0;
            let mainPoLineId = grn.poLineId;

            const items = (grn.items || []).map((item: any, idx: number) => {
              let matchedPOLine: any = null;
              if (po?.lines?.length) {
                if (item.poLineId) {
                  matchedPOLine = po.lines.find((l: any) => l.id === item.poLineId);
                }
                if (!matchedPOLine && item.productId) {
                  matchedPOLine = po.lines.find((l: any) => l.productId === item.productId || l.materialId === item.productId);
                }
                if (!matchedPOLine && (item.description || item.productDescription)) {
                  const descLower = (item.description || item.productDescription).toLowerCase();
                  matchedPOLine = po.lines.find((l: any) => {
                    const nameLower = (l.materialName || l.productName || l.description || '').toLowerCase();
                    return nameLower.includes(descLower) || descLower.includes(nameLower) || (nameLower && descLower.split(' ')[0] === nameLower.split(' ')[0]);
                  });
                }
                if (!matchedPOLine && po.lines.length === 1) {
                  matchedPOLine = po.lines[0];
                }
              }

              const poUnitRate = matchedPOLine
                ? Number(matchedPOLine.unitRate ?? matchedPOLine.finalRate ?? matchedPOLine.negotiatedRate ?? matchedPOLine.basicRate ?? matchedPOLine.baseRate ?? 0)
                : item.poUnitRate || item.unitRate || 0;

              const taxRate = matchedPOLine
                ? Number(matchedPOLine.taxPercent ?? matchedPOLine.gstRate ?? (po as any).taxRate ?? 18)
                : item.taxRate || 18;

              const approvedQty = item.qcApprovedQty ?? item.acceptedQty ?? grn.acceptedQty ?? 0;
              const lineAcceptedBaseValue = approvedQty * poUnitRate;
              const lineTaxAmount = lineAcceptedBaseValue * (taxRate / 100);
              const lineNetPayable = lineAcceptedBaseValue + lineTaxAmount;

              totalBaseAcceptedValue += lineAcceptedBaseValue;
              totalTaxAmount += lineTaxAmount;

              if (idx === 0) {
                mainPoUnitRate = poUnitRate;
                mainPoLineId = matchedPOLine?.id || mainPoLineId;
              }

              return {
                ...item,
                poLineId: matchedPOLine?.id || item.poLineId,
                poUnitRate,
                unitRate: poUnitRate,
                taxRate,
                lineAcceptedBaseValue,
                lineTaxAmount,
                lineNetPayable,
              };
            });

            const netPayable = totalBaseAcceptedValue + totalTaxAmount;
            const paidAmount = grnPayments
              .filter((p: any) => p.grnId === grn.id)
              .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
            const outstandingAmount = Math.max(0, netPayable - paidAmount);
            const paymentStatus = netPayable === 0 ? 'no_payment_required' : paidAmount === 0 ? 'payment_pending' : paidAmount >= netPayable ? 'paid' : 'partially_paid';

            if (grn.poUnitRate !== mainPoUnitRate || grn.netPayable !== netPayable || grn.paidAmount !== paidAmount) {
              grnUpdated = true;
            }

            return {
              ...grn,
              poLineId: mainPoLineId,
              poUnitRate: mainPoUnitRate,
              unitRate: mainPoUnitRate,
              rateStatus: mainPoUnitRate > 0 ? 'OK' : 'MISSING_RATE',
              baseAcceptedValue: totalBaseAcceptedValue,
              taxRate: 18,
              taxAmount: totalTaxAmount,
              netPayable,
              paidAmount,
              outstandingAmount,
              paymentStatus,
              items,
            };
          });

          if (grnUpdated) {
            repository.saveCollection('goodsReceipts', merged.goodsReceipts);
          }
        }

        // Default Warehouse Locations
        if (!merged.warehouseLocations || !Array.isArray(merged.warehouseLocations) || merged.warehouseLocations.length === 0) {
          merged.warehouseLocations = [
            { id: 'wh-main', code: 'WH-MAIN', name: 'Main Warehouse', type: 'MAIN_WAREHOUSE', isActive: true },
            { id: 'wh-in-transit', code: 'WH-TRANSIT', name: 'In Transit', type: 'IN_TRANSIT', isActive: true },
            { id: 'wh-site-p1', code: 'WH-SITE-P1', name: 'Nouveau Penthouse Site Store', type: 'PROJECT_SITE_STORE', projectId: 'p-1', isActive: true },
            { id: 'wh-site-p2', code: 'WH-SITE-P2', name: 'Corporate HQ Site Store', type: 'PROJECT_SITE_STORE', projectId: 'p-2', isActive: true },
          ];
        }

        // Auto-reconcile GRN Accepted Stock Posting into Stock Ledger (Idempotent)
        if (Array.isArray(merged.goodsReceipts)) {
          const currentLedger = merged.stockLedger || [];
          const newLedgerEntries: any[] = [];

          merged.goodsReceipts = merged.goodsReceipts.map((grn: any) => {
            const grnItems = grn.items || [];
            let grnPostedAny = false;

            grnItems.forEach((item: any) => {
              const acceptedQty = Number(item.qcApprovedQty ?? item.acceptedQty ?? item.receivedQty ?? 0);
              if (acceptedQty <= 0) return;

              // Check if stock ledger entry already exists for this GRN + Product
              const exists = currentLedger.some(
                (entry: any) =>
                  (entry.sourceId === grn.id || entry.sourceDocumentId === grn.id || entry.sourceNumber === grn.grnNumber || entry.sourceDocumentNumber === grn.grnNumber) &&
                  entry.productId === item.productId
              ) || newLedgerEntries.some(
                (entry: any) => entry.sourceId === grn.id && entry.productId === item.productId
              );

              if (!exists) {
                grnPostedAny = true;
                const unitRate = Number(item.poUnitRate ?? item.unitRate ?? grn.poUnitRate ?? 0);
                const entryId = `stk-grn-${grn.id}-${item.productId}`;
                const nowStr = new Date().toISOString();

                newLedgerEntries.push({
                  id: entryId,
                  transactionNumber: `TXN-${Date.now().toString().slice(-6)}-${newLedgerEntries.length + 1}`,
                  transactionType: 'GRN_RECEIPT',
                  entryType: 'GRN_RECEIPT',
                  transactionDate: grn.grnDate || grn.createdAt?.split('T')[0] || nowStr.split('T')[0],
                  transactionTime: '10:00:00',
                  entryDate: grn.grnDate || grn.createdAt?.split('T')[0] || nowStr.split('T')[0],
                  createdTime: nowStr,
                  productId: item.productId,
                  productCode: item.productCode || item.productId,
                  productName: item.description || item.productDescription || 'Material Item',
                  productDescription: item.description || item.productDescription || 'Material Item',
                  categoryId: item.categoryId || 'cat-general',
                  categoryName: item.categoryName || 'General Material',
                  warehouseId: 'wh-main',
                  warehouseName: 'Main Warehouse',
                  locationId: 'wh-main',
                  locationName: 'Main Warehouse',
                  projectId: grn.projectId,
                  projectName: grn.projectName,
                  quantityIn: acceptedQty,
                  quantityOut: 0,
                  inQuantity: acceptedQty,
                  outQuantity: 0,
                  runningBalance: acceptedQty,
                  unit: item.unit || 'sqft',
                  unitSymbol: item.unit || 'sqft',
                  unitRate,
                  transactionValue: acceptedQty * unitRate,
                  totalValue: acceptedQty * unitRate,
                  sourceType: 'GRN',
                  sourceId: grn.id,
                  sourceNumber: grn.grnNumber || grn.documentNumber || grn.id,
                  sourceDocumentId: grn.id,
                  sourceDocumentNumber: grn.grnNumber || grn.documentNumber || grn.id,
                  isImmutable: true,
                  remarks: `Auto GRN stock receipt from ${grn.grnNumber}`,
                  createdBy: grn.createdBy || 'System Auto-GRN',
                  recordedBy: grn.createdBy || 'System Auto-GRN',
                  createdAt: grn.createdAt || nowStr,
                });
              }
            });

            if (grnPostedAny || grn.isPostedToStock) {
              return {
                ...grn,
                isPostedToStock: true,
                postedAt: grn.postedAt || new Date().toISOString(),
                postedBy: grn.postedBy || grn.createdBy || 'System Auto-GRN',
                inventoryPosted: true,
                inventoryPostedAt: grn.inventoryPostedAt || grn.postedAt || new Date().toISOString(),
                inventoryPostedBy: grn.inventoryPostedBy || grn.postedBy || grn.createdBy || 'System Auto-GRN',
                status: grn.status === 'qc_completed' ? 'posted' : grn.status,
              };
            }

            return grn;
          });

          if (newLedgerEntries.length > 0) {
            merged.stockLedger = [...currentLedger, ...newLedgerEntries];
            repository.saveCollection('stockLedger', merged.stockLedger);
            repository.saveCollection('goodsReceipts', merged.goodsReceipts);
          }
        }

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
      const currentList = (prev[key] as any[]) || [];
      const newList = [item, ...currentList];
      let updated = { ...prev, [key]: newList };

      repository.saveCollection(key, newList as any);

      // Keep indents and materialIndents alias collections synchronized
      if (key === 'materialIndents') {
        updated = { ...updated, indents: newList };
        repository.saveCollection('indents', newList as any);
      } else if (key === 'indents') {
        updated = { ...updated, materialIndents: newList };
        repository.saveCollection('materialIndents', newList as any);
      }

      return updated;
    });
  };

  const updateItem = <K extends keyof ERPCollections>(key: K, id: string, updatedFields: any) => {
    setState((prev) => {
      const currentList = (prev[key] as any[]) || [];
      const newList = currentList.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
      let updated = { ...prev, [key]: newList };

      repository.saveCollection(key, newList as any);

      // Keep indents and materialIndents alias collections synchronized
      if (key === 'materialIndents') {
        updated = { ...updated, indents: newList };
        repository.saveCollection('indents', newList as any);
      } else if (key === 'indents') {
        updated = { ...updated, materialIndents: newList };
        repository.saveCollection('materialIndents', newList as any);
      }

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

  // Domain Store Action: Cancel Material Indent
  const cancelMaterialIndent = (indentId: string, performedBy: string, reason: string) => {
    const indent = state.materialIndents.find((i) => i.id === indentId);
    if (!indent) return { success: false, error: 'Indent not found' };

    if (indent.rfqId || indent.poId) {
      return { success: false, error: 'Cannot cancel an indent that has downstream RFQ or PO attached.' };
    }

    updateItem('materialIndents', indent.id, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      updatedBy: performedBy,
    });

    logAudit({
      documentType: 'indent',
      documentId: indent.id,
      documentNumber: (indent as any).documentNumber || (indent as any).indentNumber || indent.id,
      action: 'CANCELLED',
      performedBy,
      previousStatus: indent.status,
      newStatus: 'cancelled',
      details: `Cancelled Material Indent ${(indent as any).documentNumber || (indent as any).indentNumber || indent.id}. Reason: ${reason || 'Cancelled by user'}`,
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

    const firstLine = po.lines && po.lines[0];
    const categoryInput = (po as any).categoryId || (po as any).categoryName || (firstLine as any)?.categoryId;
    const productInput = (po as any).productId || (firstLine as any)?.productId || (firstLine as any)?.materialName;
    const canonicalPONumber = po.poNumber && po.poNumber.startsWith('FBT/')
      ? po.poNumber
      : generatePONumber(state.purchaseOrders || [], categoryInput, productInput, (po as any).poDate || po.createdAt);

    const newPO: PurchaseOrder = {
      ...po,
      poNumber: canonicalPONumber,
      documentNumber: canonicalPONumber,
    };

    addItem('purchaseOrders', newPO);
    logAudit({
      documentType: 'purchase_order',
      documentId: newPO.id,
      documentNumber: newPO.documentNumber,
      action: 'CREATED',
      performedBy: performedBy || 'Procurement User',
      newStatus: newPO.status,
      details: `Issued Purchase Order ${newPO.documentNumber} to ${newPO.vendorName} for ₹${(newPO.totalAmount || newPO.grandTotal || 0).toLocaleString('en-IN')}`,
    });

    return { success: true, purchaseOrder: newPO };
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

  const approvePurchaseOrder = (poId: string, approverId: string, approverName: string) => {
    const po = state.purchaseOrders.find((p) => p.id === poId);
    if (!po) return { success: false, error: 'Purchase Order not found' };

    updateItem('purchaseOrders', po.id, {
      status: 'approved',
      approvedBy: approverName || approverId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: approverName || approverId,
    });

    // Update project BOQ line ordered quantities
    if (po.projectId && state.projects) {
      const project = state.projects.find((p) => p.id === po.projectId);
      if (project?.lockedProjectBOQ?.lines) {
        const updatedLines = project.lockedProjectBOQ.lines.map((bLine) => {
          const poLineMatch = po.lines?.find((l) => l.boqLineId === bLine.id || l.productId === bLine.productId);
          if (poLineMatch) {
            const addedQty = Number(poLineMatch.quantity || 0);
            return {
              ...bLine,
              orderedQuantity: (bLine.orderedQuantity || 0) + addedQty,
            };
          }
          return bLine;
        });

        updateItem('projects', project.id, {
          lockedProjectBOQ: {
            ...project.lockedProjectBOQ,
            lines: updatedLines,
          },
        });
      }
    }

    logAudit({
      documentType: 'purchase_order',
      documentId: po.id,
      documentNumber: po.documentNumber,
      action: 'APPROVED',
      performedBy: approverName || approverId,
      previousStatus: po.status,
      newStatus: 'approved',
      details: `Approved Purchase Order ${po.documentNumber}`,
    });

    return { success: true };
  };

  const rejectPurchaseOrder = (poId: string, rejectorId: string, reason: string) => {
    const po = state.purchaseOrders.find((p) => p.id === poId);
    if (!po) return { success: false, error: 'Purchase Order not found' };

    updateItem('purchaseOrders', po.id, {
      status: 'rejected',
      rejectedBy: rejectorId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
      updatedBy: rejectorId,
    });

    logAudit({
      documentType: 'purchase_order',
      documentId: po.id,
      documentNumber: po.documentNumber,
      action: 'REJECTED',
      performedBy: rejectorId,
      previousStatus: po.status,
      newStatus: 'rejected',
      details: `Rejected Purchase Order ${po.documentNumber}. Reason: ${reason}`,
    });

    return { success: true };
  };

  const cancelPurchaseOrder = (poId: string, performedBy: string, reason: string) => {
    const po = state.purchaseOrders.find((p) => p.id === poId);
    if (!po) return { success: false, error: 'Purchase Order not found' };

    updateItem('purchaseOrders', po.id, {
      status: 'cancelled',
      cancelledBy: performedBy,
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      updatedAt: new Date().toISOString(),
      updatedBy: performedBy,
    });

    logAudit({
      documentType: 'purchase_order',
      documentId: po.id,
      documentNumber: po.documentNumber,
      action: 'CANCELLED',
      performedBy,
      previousStatus: po.status,
      newStatus: 'cancelled',
      details: `Cancelled Purchase Order ${po.documentNumber}. Reason: ${reason}`,
    });

    return { success: true };
  };

  const addPODelivery = (poId: string, delivery: any) => {
    const po = state.purchaseOrders.find((p) => p.id === poId);
    if (!po) return { success: false, error: 'Purchase Order not found' };

    const existingDeliveries = po.deliveries || [];
    const updatedDeliveries = [delivery, ...existingDeliveries];

    // Calculate delivery status
    let totalOrdered = 0;
    let totalReceived = 0;
    (po.lines || []).forEach((line) => {
      totalOrdered += Number(line.quantity || 0);
    });

    updatedDeliveries.forEach((d: any) => {
      (d.items || []).forEach((item: any) => {
        totalReceived += Number(item.qtyReceived || 0);
      });
    });

    let deliveryStatus: 'not_received' | 'partial' | 'received' = 'not_received';
    if (totalReceived > 0 && totalReceived < totalOrdered) {
      deliveryStatus = 'partial';
    } else if (totalOrdered > 0 && totalReceived >= totalOrdered) {
      deliveryStatus = 'received';
    }

    updateItem('purchaseOrders', po.id, {
      deliveries: updatedDeliveries,
      deliveryStatus,
      updatedAt: new Date().toISOString(),
    });

    // Update project BOQ line received quantities
    if (po.projectId && state.projects) {
      const project = state.projects.find((p) => p.id === po.projectId);
      if (project?.lockedProjectBOQ?.lines) {
        const updatedLines = project.lockedProjectBOQ.lines.map((bLine) => {
          const itemMatch = delivery.items?.find((i: any) => i.productId === bLine.productId || i.poLineId === bLine.id);
          if (itemMatch) {
            return {
              ...bLine,
              receivedQuantity: (bLine.receivedQuantity || 0) + Number(itemMatch.qtyReceived || 0),
            };
          }
          return bLine;
        });

        updateItem('projects', project.id, {
          lockedProjectBOQ: {
            ...project.lockedProjectBOQ,
            lines: updatedLines,
          },
        });
      }
    }

    logAudit({
      documentType: 'purchase_order',
      documentId: po.id,
      documentNumber: po.documentNumber,
      action: 'DELIVERY_RECORDED',
      performedBy: delivery.recordedBy || 'Stores Officer',
      newStatus: deliveryStatus,
      details: `Recorded delivery of ${delivery.items.reduce((s: number, i: any) => s + i.qtyReceived, 0)} units for PO ${po.documentNumber}`,
    });

    return { success: true };
  };

  // Helper action: Generate Unique Material Entry Token
  const createMaterialEntryToken = (tokenData: Partial<MaterialEntryToken>, createdBy: string = 'Gate Officer') => {
    const tokens = state.materialEntryTokens || [];
    const productObj = (state.products || []).find((p) => p.id === tokenData.productId || p.code === tokenData.productId);
    const tokenNumber = generateGateTokenNumber(
      tokens,
      productObj || tokenData.productId || tokenData.materialName,
      tokenData.entryDate || tokenData.createdAt
    );

    const newToken: MaterialEntryToken = {
      id: `tok-${Date.now()}`,
      tokenNumber,
      vehicleNumber: tokenData.vehicleNumber || 'N/A',
      driverName: tokenData.driverName || 'N/A',
      driverMobile: tokenData.driverMobile || '',
      productId: tokenData.productId || '',
      materialName: tokenData.materialName || 'Material',
      categoryId: tokenData.categoryId,
      categoryName: tokenData.categoryName,
      entryDate: tokenData.entryDate || new Date().toISOString().split('T')[0],
      entryTime: tokenData.entryTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      remarks: tokenData.remarks || '',
      status: 'GATE_ENTRY_CREATED',
      currentStage: 'Gate Entry',
      createdBy,
      createdAt: new Date().toISOString(),
    };

    addItem('materialEntryTokens', newToken);

    // Auto-create Token Activity Log event
    addTokenActivity({
      tokenId: newToken.id,
      tokenNumber: newToken.tokenNumber,
      eventType: 'TOKEN_CREATED',
      userName: createdBy,
      title: 'TOKEN CREATED',
      description: `Gate Entry Token generated for vehicle ${newToken.vehicleNumber} bringing ${newToken.materialName}.`,
    });

    logAudit({
      documentType: 'material_entry_token',
      documentId: newToken.id,
      documentNumber: newToken.tokenNumber,
      action: 'CREATED',
      performedBy: createdBy,
      newStatus: 'GATE_ENTRY_CREATED',
      details: `Generated material entry token ${tokenNumber} for vehicle ${newToken.vehicleNumber}`,
    });

    return { success: true, token: newToken };
  };

  // Central Eligibility Helpers for Material Inward Workflow
  const isAwaitingReceiving = (token: MaterialEntryToken): boolean => {
    if (!token) return false;
    if (token.status === 'HOLD' || token.status === 'CANCELLED') return false;
    // Check if an initial receiving check already exists
    const checks = state.materialReceivingChecks || [];
    const hasCheck = checks.some((c) => c.tokenId === token.id || c.tokenNumber === token.tokenNumber);
    if (hasCheck) return false;

    return (
      token.status === 'GATE_ENTRY_CREATED' ||
      token.status === 'TOKEN_GENERATED' ||
      token.status === 'RECEIVING_CHECK_IN_PROGRESS'
    );
  };

  const isAwaitingQC = (token: MaterialEntryToken): boolean => {
    if (!token) return false;
    if (token.status === 'HOLD' || token.status === 'CANCELLED') return false;

    // MANDATORY GATING RULE: Must have a completed Initial Receiving Check
    const checks = state.materialReceivingChecks || [];
    const hasCheck = checks.some((c) => c.tokenId === token.id || c.tokenNumber === token.tokenNumber);
    if (!hasCheck) return false;

    return (
      token.status === 'QC_PENDING' ||
      token.status === 'QC_IN_PROGRESS' ||
      token.status === 'ADMIN_APPROVAL_REQUIRED' ||
      token.status === 'RECEIVING_CHECKED'
    );
  };

  // Helper action: Add Token Activity Log Entry
  const addTokenActivity = (activity: Omit<TokenActivity, 'id' | 'timestamp'>) => {
    const newActivity: TokenActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    addItem('tokenActivities', newActivity);
  };

  // Action: Put Token on Hold
  const holdMaterialToken = (tokenId: string, reason: string, remarks?: string, performedBy: string = 'Security/Admin') => {
    const tokens = state.materialEntryTokens || [];
    const token = tokens.find((t) => t.id === tokenId || t.tokenNumber === tokenId);
    if (!token) return { success: false, error: 'Token not found' };

    const updatedToken: MaterialEntryToken = {
      ...token,
      status: 'HOLD',
      currentStage: 'Hold',
      holdReason: reason,
      heldBy: performedBy,
      heldAt: new Date().toISOString(),
      remarks: remarks ? `${token.remarks || ''}\n[HOLD]: ${remarks}` : token.remarks,
    };

    updateItem('materialEntryTokens', updatedToken.id, updatedToken);

    addTokenActivity({
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      eventType: 'TOKEN_HELD',
      userName: performedBy,
      title: 'TOKEN HELD',
      description: `Token placed on hold. Reason: ${reason}${remarks ? ` (${remarks})` : ''}`,
    });

    return { success: true };
  };

  // Action: Resume Held Token
  const resumeMaterialToken = (tokenId: string, remarks?: string, performedBy: string = 'Security/Admin') => {
    const tokens = state.materialEntryTokens || [];
    const token = tokens.find((t) => t.id === tokenId || t.tokenNumber === tokenId);
    if (!token) return { success: false, error: 'Token not found' };

    // Determine target status based on receiving checks
    const checks = state.materialReceivingChecks || [];
    const hasReceiving = checks.some((c) => c.tokenId === token.id);

    const targetStatus: MaterialEntryTokenStatus = hasReceiving ? 'RECEIVING_CHECKED' : 'TOKEN_GENERATED';
    const targetStage = hasReceiving ? 'Initial Receiving' : 'Gate Entry';

    const updatedToken: MaterialEntryToken = {
      ...token,
      status: targetStatus,
      currentStage: targetStage,
      remarks: remarks ? `${token.remarks || ''}\n[RESUMED]: ${remarks}` : token.remarks,
    };

    updateItem('materialEntryTokens', updatedToken.id, updatedToken);

    addTokenActivity({
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      eventType: 'TOKEN_RESUMED',
      userName: performedBy,
      title: 'TOKEN RESUMED',
      description: `Token hold released. Resumed to stage: ${targetStage}${remarks ? ` (${remarks})` : ''}`,
    });

    return { success: true };
  };

  // Action: Cancel Token
  const cancelMaterialToken = (tokenId: string, reason: string, performedBy: string = 'Security/Admin') => {
    const tokens = state.materialEntryTokens || [];
    const token = tokens.find((t) => t.id === tokenId || t.tokenNumber === tokenId);
    if (!token) return { success: false, error: 'Token not found' };

    const updatedToken: MaterialEntryToken = {
      ...token,
      status: 'CANCELLED',
      currentStage: 'Cancelled',
      cancellationReason: reason,
      cancelledBy: performedBy,
      cancelledAt: new Date().toISOString(),
    };

    updateItem('materialEntryTokens', updatedToken.id, updatedToken);

    addTokenActivity({
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      eventType: 'TOKEN_CANCELLED',
      userName: performedBy,
      title: 'TOKEN CANCELLED',
      description: `Token cancelled. Reason: ${reason}`,
    });

    return { success: true };
  };

  // Helper action: Record First Material Receiving Check
  const createMaterialReceivingCheck = (checkData: Partial<MaterialReceivingCheck>, checkedBy: string = 'Storekeeper') => {
    state.materialReceivingChecks || [];
    const checkId = `rcv-${Date.now()}`;
    const newCheck: MaterialReceivingCheck = {
      id: checkId,
      tokenId: checkData.tokenId || '',
      tokenNumber: checkData.tokenNumber || '',
      poId: checkData.poId || '',
      poNumber: checkData.poNumber || '',
      vendorId: checkData.vendorId,
      vendorName: checkData.vendorName,
      projectId: checkData.projectId,
      projectName: checkData.projectName,
      productId: checkData.productId || '',
      productName: checkData.productName || 'Material',
      unit: checkData.unit || 'nos',
      poQty: checkData.poQty || 0,
      receivedQty: checkData.receivedQty || 0,
      damagedQty: checkData.damagedQty || 0,
      shortQty: checkData.shortQty || 0,
      excessQty: checkData.excessQty || 0,
      excessReason: checkData.excessReason || '',
      qcPendingQty: checkData.qcPendingQty || Math.max(0, (checkData.receivedQty || 0) - (checkData.damagedQty || 0)),
      checkedBy,
      checkedAt: new Date().toISOString(),
    };

    addItem('materialReceivingChecks', newCheck);

    // Update Token status to QC_PENDING & Current Stage to Quality Control
    if (checkData.tokenId) {
      updateItem('materialEntryTokens', checkData.tokenId, {
        status: 'RECEIVING_CHECKED',
        currentStage: 'Quality Control',
        updatedAt: new Date().toISOString(),
      });

      addTokenActivity({
        tokenId: checkData.tokenId,
        tokenNumber: newCheck.tokenNumber,
        eventType: 'RECEIVING_COMPLETED',
        userName: checkedBy,
        title: 'INITIAL RECEIVING CHECK COMPLETED',
        description: `Received ${newCheck.receivedQty} ${newCheck.unit} (Damaged: ${newCheck.damagedQty}, QC Pending: ${newCheck.qcPendingQty}). Linked to PO ${newCheck.poNumber}.`,
        referenceType: 'RECEIVING',
        referenceId: newCheck.id,
      });
    }

    logAudit({
      documentType: 'receiving_check',
      documentId: newCheck.id,
      documentNumber: newCheck.tokenNumber,
      action: 'COMPLETED',
      performedBy: checkedBy,
      newStatus: 'QC_PENDING',
      details: `Completed receiving check for token ${newCheck.tokenNumber}. QC Pending: ${newCheck.qcPendingQty} ${newCheck.unit}`,
    });

    return { success: true, receivingCheck: newCheck };
  };

  // Internal Helper: Auto-Generate GRN from Final QC Decision
  const _autoGenerateGRNFromQC = (qc: QualityInspection, createdBy: string = 'System Auto-GRN') => {
    const grns = state.goodsReceipts || [];
    // Idempotency Guard: prevent duplicate GRN for same QC inspection
    const existing = grns.find((g) => g.qcInspectionId === qc.id || (g.tokenId && g.tokenId === qc.tokenId));
    if (existing) {
      return existing;
    }

    const po = (state.purchaseOrders || []).find(
      (p) => p.id === qc.poId || p.poNumber === qc.poNumber || p.documentNumber === qc.poNumber
    );

    const grnNumber = generateGRNNumber(grns);
    const acceptedQty = qc.items.reduce((sum, item) => sum + (item.approvedQty || 0), 0);
    const rejectedQty = qc.items.reduce((sum, item) => sum + (item.rejectedQty || 0), 0);
    const holdQty = qc.items.reduce((sum, item) => sum + (item.holdQty || 0), 0);
    const totalReceived = qc.items.reduce((sum, item) => sum + (item.receivedQty || 0), 0);

    let totalBaseAcceptedValue = 0;
    let totalTaxAmount = 0;
    let mainPoUnitRate = 0;
    let mainPoLineId: string | undefined = undefined;
    let mainRateStatus: 'OK' | 'MISSING_RATE' = 'MISSING_RATE';

    const grnItems: GRNItem[] = qc.items.map((qItem, idx) => {
      // Resolve exact PO line commercial rate
      let matchedPOLine: any = null;
      if (po?.lines?.length) {
        if ((qItem as any).poLineId) {
          matchedPOLine = po.lines.find((l: any) => l.id === (qItem as any).poLineId);
        }
        if (!matchedPOLine && qItem.productId) {
          matchedPOLine = po.lines.find((l: any) => l.productId === qItem.productId || l.materialId === qItem.productId);
        }
        if (!matchedPOLine && qItem.productDescription) {
          const descLower = qItem.productDescription.toLowerCase();
          matchedPOLine = po.lines.find((l: any) => {
            const nameLower = (l.materialName || l.productName || l.description || '').toLowerCase();
            return nameLower.includes(descLower) || descLower.includes(nameLower) || (nameLower && descLower.split(' ')[0] === nameLower.split(' ')[0]);
          });
        }
        if (!matchedPOLine && po.lines.length === 1) {
          matchedPOLine = po.lines[0];
        }
      }

      const poUnitRate = matchedPOLine
        ? Number(matchedPOLine.unitRate ?? matchedPOLine.finalRate ?? matchedPOLine.negotiatedRate ?? matchedPOLine.basicRate ?? matchedPOLine.baseRate ?? 0)
        : 0;

      const taxRate = matchedPOLine
        ? Number(matchedPOLine.taxPercent ?? matchedPOLine.gstRate ?? (po as any)?.taxRate ?? 18)
        : Number((po as any)?.taxRate ?? 18);

      const lineApprovedQty = qItem.approvedQty || 0;
      const lineAcceptedBaseValue = lineApprovedQty * poUnitRate;
      const lineTaxAmount = lineAcceptedBaseValue * (taxRate / 100);
      const lineNetPayable = lineAcceptedBaseValue + lineTaxAmount;

      totalBaseAcceptedValue += lineAcceptedBaseValue;
      totalTaxAmount += lineTaxAmount;

      if (idx === 0) {
        mainPoUnitRate = poUnitRate;
        mainPoLineId = matchedPOLine?.id;
        mainRateStatus = poUnitRate > 0 ? 'OK' : 'MISSING_RATE';
      }

      return {
        id: `grn-item-${Date.now()}-${idx}`,
        productId: qItem.productId,
        description: qItem.productDescription,
        categoryName: qItem.categoryName || 'General Material',
        unit: qItem.unit || 'nos',
        orderedQty: qItem.receivedQty,
        receivedQty: qItem.receivedQty,
        qcPendingQty: 0,
        qcApprovedQty: qItem.approvedQty,
        qcRejectedQty: qItem.rejectedQty,
        qcHoldQty: qItem.holdQty,
        poLineId: matchedPOLine?.id,
        poUnitRate,
        unitRate: poUnitRate,
        taxRate,
        lineAcceptedBaseValue,
        lineTaxAmount,
        lineNetPayable,
      };
    });

    const netPayable = totalBaseAcceptedValue + totalTaxAmount;
    const grnDate = new Date().toISOString().split('T')[0];

    // Calculate Due Date based on PO Payment Terms (e.g. "30 Days Net" -> +30 days)
    let dueDate: string | undefined = undefined;
    const pTerms = (po as any)?.paymentTerms || (po as any)?.paymentTermsDays;
    if (pTerms) {
      const match = String(pTerms).match(/(\d+)\s*Days/i);
      const days = match && match[1] ? parseInt(match[1], 10) : typeof pTerms === 'number' ? pTerms : 30;
      const d = new Date(grnDate);
      d.setDate(d.getDate() + days);
      dueDate = d.toISOString().split('T')[0];
    }
    if (!dueDate) {
      const d = new Date(grnDate);
      d.setDate(d.getDate() + 30); // Default 30 days
      dueDate = d.toISOString().split('T')[0];
    }

    const newGRN: GoodsReceipt = {
      id: `grn-${Date.now()}`,
      grnNumber,
      documentNumber: grnNumber,
      tokenId: qc.tokenId,
      receivingCheckId: qc.receivingCheckId,
      qcInspectionId: qc.id,
      poId: qc.poId,
      poNumber: qc.poNumber,
      poLineId: mainPoLineId,
      projectId: qc.projectId,
      projectName: qc.projectName,
      vendorId: qc.vendorId,
      vendorName: qc.vendorName,
      grnDate,
      dueDate,
      invoiceChallanNo: `CH-${qc.tokenNumber || 'AUTO'}`,
      receivedByName: qc.inspectorName || createdBy,
      status: 'qc_completed',
      rateStatus: mainRateStatus,
      poUnitRate: mainPoUnitRate,
      unitRate: mainPoUnitRate,
      baseAcceptedValue: totalBaseAcceptedValue,
      taxRate: 18,
      taxAmount: totalTaxAmount,
      netPayable,
      paidAmount: 0,
      outstandingAmount: netPayable,
      paymentStatus: netPayable > 0 ? 'payment_pending' : 'no_payment_required',
      items: grnItems,
      receivedQty: totalReceived,
      acceptedQty,
      rejectedQty,
      holdQty,
      remarks: `Auto-generated GRN from QC inspection ${qc.qcNumber}. Accepted: ${acceptedQty}, Rejected: ${rejectedQty}`,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    addItem('goodsReceipts', newGRN);

    // Automatically post accepted quantity into Stock Ledger upon GRN generation
    postGRNToStock(newGRN.id, createdBy);

    // Update Token Status to GRN_GENERATED
    if (qc.tokenId) {
      updateItem('materialEntryTokens', qc.tokenId, {
        status: 'GRN_GENERATED',
        updatedAt: new Date().toISOString(),
      });
    }

    logAudit({
      documentType: 'goods_receipt',
      documentId: newGRN.id,
      documentNumber: newGRN.grnNumber,
      action: 'AUTO_GENERATED',
      performedBy: createdBy,
      newStatus: 'qc_completed',
      details: `Auto-generated GRN ${newGRN.grnNumber} for token ${qc.tokenNumber || 'N/A'}. Accepted Qty: ${acceptedQty}, Net Payable: ₹${netPayable}`,
    });

    return newGRN;
  };

  // Action: Complete Quality Inspection (Normal or Admin Approval Required)
  const completeQCInspection = (inspectionData: Partial<QualityInspection>, inspectorName: string = 'QC Inspector') => {
    const qcNumber = `QCI-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    
    // Evaluate failure count & critical failure
    let failedCount = 0;
    let criticalFailure = false;

    (inspectionData.items || []).forEach((item) => {
      (item.parameterResults || []).forEach((res) => {
        if (res.result === 'FAIL') {
          failedCount++;
          if (res.critical) {
            criticalFailure = true;
          }
        }
      });
    });

    // Admin approval trigger condition: Critical failure OR > 1 parameter failed
    const requiresAdminApproval = criticalFailure || failedCount > 1;
    const finalStatus = requiresAdminApproval ? 'ADMIN_APPROVAL_REQUIRED' : 'completed';

    const newInspection: QualityInspection = {
      id: `qci-${Date.now()}`,
      qcNumber,
      tokenId: inspectionData.tokenId,
      tokenNumber: inspectionData.tokenNumber,
      receivingCheckId: inspectionData.receivingCheckId,
      poId: inspectionData.poId || '',
      poNumber: inspectionData.poNumber || '',
      projectId: inspectionData.projectId || '',
      projectName: inspectionData.projectName || 'Project Site',
      vendorId: inspectionData.vendorId || '',
      vendorName: inspectionData.vendorName || 'Vendor',
      vehicleNumber: inspectionData.vehicleNumber,
      driverName: inspectionData.driverName,
      inspectionDate: inspectionData.inspectionDate || new Date().toISOString().split('T')[0],
      inspectorName,
      inspectedBy: inspectorName,
      testResult: failedCount > 0 ? (failedCount === (inspectionData.items?.length || 1) ? 'FAIL' : 'PARTIAL') : 'PASS',
      status: finalStatus,
      items: inspectionData.items || [],
      failedCount,
      criticalFailure,
      requiresAdminApproval,
      overallRemarks: inspectionData.overallRemarks || '',
      createdAt: new Date().toISOString(),
      createdBy: inspectorName,
    };

    addItem('qualityInspections', newInspection);

    // If Admin Approval is required, update Token status to ADMIN_APPROVAL_REQUIRED
    if (requiresAdminApproval && inspectionData.tokenId) {
      updateItem('materialEntryTokens', inspectionData.tokenId, {
        status: 'ADMIN_APPROVAL_REQUIRED',
        updatedAt: new Date().toISOString(),
      });
    } else if (!requiresAdminApproval) {
      // Normal Pass: Auto-generate GRN!
      const generatedGRN = _autoGenerateGRNFromQC(newInspection, inspectorName);
      newInspection.grnId = generatedGRN.id;
      newInspection.grnNumber = generatedGRN.grnNumber;
    }

    logAudit({
      documentType: 'quality_inspection',
      documentId: newInspection.id,
      documentNumber: newInspection.qcNumber,
      action: 'COMPLETED',
      performedBy: inspectorName,
      newStatus: finalStatus,
      details: requiresAdminApproval
        ? `QC Inspection ${qcNumber} requires Admin Approval due to ${failedCount} parameter failures.`
        : `QC Inspection ${qcNumber} completed. Auto-generated GRN.`,
    });

    return { success: true, inspection: newInspection, requiresAdminApproval };
  };

  // Action: Admin Review & Approve/Reject QC Decision
  const approveAdminQC = (
    qcId: string,
    decision: 'APPROVED' | 'REJECTED' | 'HOLD',
    adminRemarks: string,
    adminName: string = 'Store Admin'
  ) => {
    const inspections = state.qualityInspections || [];
    const qc = inspections.find((q) => q.id === qcId);
    if (!qc) return { success: false, error: 'QC Inspection record not found.' };

    const now = new Date().toISOString();
    const updatedStatus = decision === 'APPROVED' ? 'ADMIN_APPROVED' : decision === 'REJECTED' ? 'ADMIN_REJECTED' : 'in_progress';

    let generatedGRN = null;
    if (decision === 'APPROVED') {
      generatedGRN = _autoGenerateGRNFromQC(qc, adminName);
    }

    updateItem('qualityInspections', qc.id, {
      status: updatedStatus,
      adminDecision: decision,
      adminRemarks,
      adminApprovedBy: adminName,
      adminApprovedAt: now,
      grnId: generatedGRN ? generatedGRN.id : qc.grnId,
      grnNumber: generatedGRN ? generatedGRN.grnNumber : qc.grnNumber,
      updatedAt: now,
    });

    if (qc.tokenId) {
      updateItem('materialEntryTokens', qc.tokenId, {
        status: decision === 'APPROVED' ? 'GRN_GENERATED' : 'REJECTED',
        updatedAt: now,
      });
    }

    logAudit({
      documentType: 'quality_inspection',
      documentId: qc.id,
      documentNumber: qc.qcNumber,
      action: `ADMIN_${decision}`,
      performedBy: adminName,
      newStatus: updatedStatus,
      details: `Admin ${decision} QC decision for ${qc.qcNumber}. ${adminRemarks}`,
    });

    return { success: true, grn: generatedGRN };
  };

  // Stage 4 Store Action: Create Goods Received Note (GRN)
  const createGRN = (grn: GoodsReceivedNote, performedBy: string = 'Stores Officer') => {
    // Domain Guard: PO must be issued or approved
    const po = state.purchaseOrders.find((p) => p.id === grn.purchaseOrderId || p.documentNumber === grn.poNumber);
    if (!po || (po.status !== 'issued' && po.status !== 'approved')) {
      return { success: false, error: 'Domain Guard Rejected: GRN can only reference an issued or approved Purchase Order.' };
    }

    const grnLines = grn.lines || grn.items || [];

    // Line Validation: Received now cannot exceed pending quantity
    for (const line of grnLines) {
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
    ensureAPForGRN(grn, performedBy);
    logAudit({
      documentType: 'grn',
      documentId: grn.id,
      documentNumber: grn.documentNumber || grn.grnNumber || grn.id,
      action: 'CREATED',
      performedBy,
      newStatus: grn.status,
      details: `Created GRN ${grn.documentNumber || grn.grnNumber} for PO ${grn.poNumber} at ${grn.destinationLocationName}`,
    });

    return { success: true, grn };
  };

  // Stage 4 Store Action: Inspect GRN
  const inspectGRN = (grnId: string, inspection: QualityInspection, performedBy: string = 'Quality Inspector') => {
    const grn = (state.grns || []).find((g) => g.id === grnId);
    if (!grn) return { success: false, error: 'GRN not found' };

    const newStatus: GRNStatus = inspection.testResult === 'FAIL' ? 'qc_completed' : 'qc_completed';

    updateItem('grns', grn.id, {
      qualityInspection: inspection,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: performedBy,
    });

    logAudit({
      documentType: 'grn',
      documentId: grn.id,
      documentNumber: grn.documentNumber || grn.grnNumber || grn.id,
      action: 'INSPECTED',
      performedBy,
      newStatus,
      details: `Quality Inspection completed for GRN ${grn.documentNumber || grn.grnNumber}. Result: ${inspection.testResult || 'PASS'}`,
    });

    return { success: true };
  };

  // Stage 4 Store Action: Approve GRN
  const approveGRN = (grnId: string, approverId: string = 'Project Director', comments?: string) => {
    const grn = (state.grns || []).find((g) => g.id === grnId);
    if (!grn) return { success: false, error: 'GRN not found' };

    updateItem('grns', grn.id, {
      status: 'approved',
      updatedAt: new Date().toISOString(),
      updatedBy: approverId,
    });

    logAudit({
      documentType: 'grn',
      documentId: grn.id,
      documentNumber: grn.documentNumber || grn.grnNumber || grn.id,
      action: 'APPROVED',
      performedBy: approverId,
      newStatus: 'approved',
      details: comments || `Approved GRN ${grn.documentNumber} for stock posting.`,
    });

    return { success: true };
  };

  // Stage 4 Store Action: Post GRN to Stock (IDEMPOTENT GUARD ENFORCED)
  const postGRNToStock = (grnId: string, postedBy: string = 'Warehouse Manager') => {
    const grn = (state.goodsReceipts || state.grns || []).find((g: any) => g.id === grnId);
    if (!grn) return { success: false, error: 'GRN not found' };

    // Idempotency Guard
    if (grn.isPostedToStock) {
      return { success: false, error: 'IDEMPOTENCY GUARD REJECTED: GRN is already posted to stock.' };
    }

    const now = new Date().toISOString();
    const currentLedger = state.stockLedger || [];
    const newStockEntries: StockLedgerEntry[] = [];
    const grnItems = grn.items || grn.lines || [];

    grnItems.forEach((item: any, idx: number) => {
      const acceptedQty = Number(item.qcApprovedQty ?? item.acceptedQty ?? item.receivedQty ?? 0);
      if (acceptedQty > 0) {
        const unitRate = Number(item.poUnitRate ?? item.unitRate ?? grn.poUnitRate ?? 0);
        const entry: StockLedgerEntry = {
          id: `stk-grn-${grn.id}-${item.productId || idx}`,
          transactionNumber: `TXN-${Date.now().toString().slice(-6)}-${idx + 1}`,
          transactionType: 'GRN_RECEIPT',
          entryType: 'GRN_RECEIPT',
          transactionDate: grn.grnDate || grn.createdAt?.split('T')[0] || now.split('T')[0],
          transactionTime: '10:00:00',
          entryDate: grn.grnDate || grn.createdAt?.split('T')[0] || now.split('T')[0],
          createdTime: now,
          productId: item.productId,
          productCode: item.productCode || item.productId,
          productName: item.description || item.productDescription || item.productName || 'Material Item',
          productDescription: item.description || item.productDescription || 'Material Item',
          categoryId: item.categoryId || 'cat-general',
          categoryName: item.categoryName || 'General Material',
          warehouseId: 'wh-main',
          warehouseName: 'Main Warehouse',
          locationId: 'wh-main',
          locationName: 'Main Warehouse',
          projectId: grn.projectId,
          projectName: grn.projectName,
          quantityIn: acceptedQty,
          quantityOut: 0,
          inQuantity: acceptedQty,
          outQuantity: 0,
          runningBalance: acceptedQty,
          unit: item.unit || item.unitSymbol || 'sqft',
          unitSymbol: item.unit || item.unitSymbol || 'sqft',
          unitRate,
          transactionValue: acceptedQty * unitRate,
          totalValue: acceptedQty * unitRate,
          sourceType: 'GRN',
          sourceId: grn.id,
          sourceNumber: grn.grnNumber || grn.documentNumber || grn.id,
          sourceDocumentId: grn.id,
          sourceDocumentNumber: grn.grnNumber || grn.documentNumber || grn.id,
          isImmutable: true,
          remarks: `GRN stock posting for ${grn.grnNumber}`,
          createdBy: postedBy,
          recordedBy: postedBy,
          createdAt: now,
        };
        newStockEntries.push(entry);
      }
    });

    updateCollection('stockLedger', [...currentLedger, ...newStockEntries]);

    updateItem('goodsReceipts', grn.id, {
      isPostedToStock: true,
      postedAt: now,
      postedBy,
      status: 'posted',
      updatedAt: now,
      updatedBy: postedBy,
    });

    ensureAPForGRN(grn, postedBy);

    logAudit({
      documentType: 'goods_receipt',
      documentId: grn.id,
      documentNumber: grn.grnNumber || grn.id,
      action: 'POSTED_TO_STOCK',
      performedBy: postedBy,
      newStatus: 'posted',
      details: `Posted ${newStockEntries.length} accepted stock ledger entries for GRN ${grn.grnNumber}`,
    });

    return { success: true };
  };

  // Helper: Get available stock balance
  const getStockBalance = (params: { productId: string; warehouseId?: string; locationId?: string }): number => {
    const ledger = state.stockLedger || [];
    const wId = params.warehouseId || params.locationId;
    let balance = 0;
    ledger.forEach((entry: any) => {
      if (entry.productId === params.productId) {
        if (!wId || entry.warehouseId === wId || entry.locationId === wId) {
          const qtyIn = Number(entry.quantityIn ?? entry.inQuantity ?? 0);
          const qtyOut = Number(entry.quantityOut ?? entry.outQuantity ?? 0);
          balance += qtyIn - qtyOut;
        }
      }
    });
    return Math.max(0, balance);
  };

  // Helper: Get stock per location breakdown for a product
  const getPerLocationStock = (productId: string) => {
    const locations = state.warehouseLocations || [
      { id: 'wh-main', code: 'WH-MAIN', name: 'Main Warehouse', type: 'MAIN_WAREHOUSE', isActive: true },
      { id: 'wh-in-transit', code: 'WH-TRANSIT', name: 'In Transit', type: 'IN_TRANSIT', isActive: true },
      { id: 'wh-site-p1', code: 'WH-SITE-P1', name: 'Nouveau Penthouse Site Store', type: 'PROJECT_SITE_STORE', projectId: 'p-1', isActive: true },
      { id: 'wh-site-p2', code: 'WH-SITE-P2', name: 'Corporate HQ Site Store', type: 'PROJECT_SITE_STORE', projectId: 'p-2', isActive: true },
    ];

    const breakdown = locations.map((loc) => {
      const bal = getStockBalance({ productId, warehouseId: loc.id });
      return {
        warehouseId: loc.id,
        warehouseName: loc.name,
        type: loc.type,
        balance: bal,
      };
    });

    const totalCompanyStock = breakdown.reduce((sum, item) => sum + item.balance, 0);

    return {
      productId,
      breakdown,
      totalCompanyStock,
    };
  };

  // Create Material Issue (Draft status)
  const createMaterialIssue = (issueData: Partial<MaterialIssue>, createdBy: string = 'Stores Officer') => {
    const issueCount = (state.materialIssues || []).length + 1;
    const issueNumber = issueData.issueNumber || issueData.documentNumber || `MI-${new Date().getFullYear()}-${issueCount.toString().padStart(3, '0')}`;
    const now = new Date().toISOString();
    const sourceLocId = issueData.sourceLocationId || issueData.sourceWarehouseId || 'loc-001';
    const sourceLocName = issueData.sourceLocationName || issueData.sourceWarehouseName || 'Central Site Store - Basement 1';

    const inputItems = (issueData as any).lines || issueData.items || [];
    const items: MaterialIssueItem[] = inputItems.map((it: any, idx: number) => {
      const pId = it.productId || `prod-${idx + 1}`;
      const avail = getAvailableStockForLocationAndProduct(state.stockLedger || [], sourceLocId, pId);
      const issueQty = Number(it.issuedQty ?? it.issueQty ?? 0);
      const unitRate = Number(it.unitRate || 0);
      return {
        id: `mii-${Date.now()}-${idx}`,
        productId: pId,
        productDescription: it.productName || it.productDescription || 'Material Item',
        categoryName: it.categoryName || 'General Material',
        unit: it.unitSymbol || it.unit || 'sqft',
        availableStock: avail,
        issueQty,
        receivedQty: 0,
        unitRate,
        issueValue: issueQty * unitRate,
        remarks: it.notes || it.remarks || '',
      };
    });

    const totalValue = items.reduce((sum, item) => sum + item.issueValue, 0);

    const newIssue: MaterialIssue = {
      id: issueData.id || `mi-${Date.now()}`,
      issueNumber,
      documentNumber: issueNumber,
      projectId: issueData.projectId || '',
      projectName: issueData.projectName || 'Project Site',
      sourceLocationId: sourceLocId,
      sourceLocationName: sourceLocName,
      sourceWarehouseId: sourceLocId,
      sourceWarehouseName: sourceLocName,
      destinationStoreId: issueData.destinationLocationId || issueData.destinationStoreId || `wh-site-${issueData.projectId || 'p-1'}`,
      destinationStoreName: issueData.destinationAreaName || issueData.destinationStoreName || `${issueData.projectName || 'Project'} Site Store`,
      requiredByDate: issueData.issueDate || issueData.requiredByDate || new Date().toISOString().split('T')[0],
      purpose: issueData.purpose || 'Site fitout material transfer',
      costCode: issueData.costCode || '',
      requestedBy: issueData.requestedBy || createdBy,
      receiverName: (issueData as any).receiverName || (issueData as any).receivedByPerson || 'Site Supervisor',
      status: issueData.status || 'issued',
      items,
      lines: items as any,
      totalIssueValue: totalValue,
      activityLog: [
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          user: createdBy,
          action: 'ISSUE_CREATED',
          description: `Created Material Issue ${issueNumber} with ${items.length} item(s)`,
        },
      ],
      remarks: issueData.remarks || '',
      createdAt: now,
      createdBy,
    };

    const normalizedNewIssue = normalizeMaterialIssue(newIssue);

    addItem('materialIssues', normalizedNewIssue);

    // Record TRANSFER_OUT stock ledger entries to deduct stock from source location
    const newStockEntries: StockLedgerEntry[] = items.map((it, idx) => ({
      id: `stk-out-${normalizedNewIssue.id}-${it.productId || idx}`,
      transactionNumber: `TXN-${Date.now().toString().slice(-6)}-OUT-${idx + 1}`,
      transactionType: 'TRANSFER_OUT',
      entryType: 'TRANSFER_OUT',
      transactionDate: now.split('T')[0],
      transactionTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
      entryDate: now.split('T')[0],
      createdTime: now,
      productId: it.productId,
      productCode: it.productId,
      productName: it.productDescription,
      productDescription: it.productDescription,
      categoryName: it.categoryName || 'General Material',
      warehouseId: sourceLocId,
      warehouseName: sourceLocName,
      locationId: sourceLocId,
      locationName: sourceLocName,
      projectId: normalizedNewIssue.projectId,
      projectName: normalizedNewIssue.projectName,
      quantityIn: 0,
      quantityOut: it.issueQty,
      inQuantity: 0,
      outQuantity: it.issueQty,
      runningBalance: Math.max(0, it.availableStock - it.issueQty),
      unit: it.unit,
      unitSymbol: it.unit,
      unitRate: it.unitRate || 0,
      transactionValue: it.issueQty * (it.unitRate || 0),
      totalValue: it.issueQty * (it.unitRate || 0),
      sourceType: 'MATERIAL_ISSUE',
      sourceId: normalizedNewIssue.id,
      sourceNumber: normalizedNewIssue.issueNumber,
      sourceDocumentId: normalizedNewIssue.id,
      sourceDocumentNumber: normalizedNewIssue.issueNumber,
      isImmutable: true,
      remarks: `Issued to ${normalizedNewIssue.projectName}`,
      createdBy,
      recordedBy: createdBy,
      createdAt: now,
    }));

    if (newStockEntries.length > 0) {
      const currentLedger = state.stockLedger || [];
      updateCollection('stockLedger', [...currentLedger, ...newStockEntries]);
    }

    logAudit({
      documentType: 'material_issue',
      documentId: normalizedNewIssue.id,
      documentNumber: normalizedNewIssue.issueNumber,
      action: 'CREATED',
      performedBy: createdBy,
      newStatus: normalizedNewIssue.status,
      details: `Created material issue ${normalizedNewIssue.issueNumber} for project ${normalizedNewIssue.projectName}`,
    });

    return { success: true, materialIssue: normalizedNewIssue };
  };

  // Dispatch Material Issue (Posts Main Warehouse -> In Transit)
  const dispatchMaterialIssue = (issueId: string, dispatchedBy: string = 'Warehouse Supervisor') => {
    const issue = (state.materialIssues || []).find((m) => m.id === issueId);
    if (!issue) return { success: false, error: 'Material issue not found' };

    if (issue.status !== 'Draft' && issue.status !== 'Ready to Issue') {
      return { success: false, error: `Material issue is already in status '${issue.status}'` };
    }

    const currentLedger = state.stockLedger || [];
    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newStockEntries: StockLedgerEntry[] = [];

    const issueItems = issue.items || issue.lines || [];

    // Stock availability validation
    for (const item of issueItems) {
      const avail = getStockBalance({ productId: item.productId, warehouseId: issue.sourceWarehouseId });
      if (item.issueQty > avail) {
        return {
          success: false,
          error: `Stock Guard Violation: Only ${avail} ${item.unit} of '${item.productDescription}' is available in ${issue.sourceWarehouseName}. Cannot issue ${item.issueQty} ${item.unit}.`,
        };
      }

      // OUT entry at Main Warehouse
      newStockEntries.push({
        id: `stk-out-${issue.id}-${item.productId}`,
        transactionNumber: `TXN-${Date.now().toString().slice(-6)}-OUT`,
        transactionType: 'TRANSFER_OUT',
        entryType: 'TRANSFER_OUT',
        transactionDate: now.split('T')[0],
        transactionTime: timeStr,
        entryDate: now.split('T')[0],
        createdTime: now,
        productId: item.productId,
        productCode: item.productId,
        productName: item.productDescription,
        productDescription: item.productDescription,
        categoryName: item.categoryName,
        warehouseId: issue.sourceWarehouseId,
        warehouseName: issue.sourceWarehouseName,
        locationId: issue.sourceWarehouseId,
        locationName: issue.sourceWarehouseName,
        projectId: issue.projectId,
        projectName: issue.projectName,
        quantityIn: 0,
        quantityOut: item.issueQty,
        inQuantity: 0,
        outQuantity: item.issueQty,
        runningBalance: avail - item.issueQty,
        unit: item.unit,
        unitSymbol: item.unit,
        unitRate: item.unitRate,
        transactionValue: item.issueQty * item.unitRate,
        totalValue: item.issueQty * item.unitRate,
        sourceType: 'MATERIAL_ISSUE',
        sourceId: issue.id,
        sourceNumber: issue.issueNumber,
        sourceDocumentId: issue.id,
        sourceDocumentNumber: issue.issueNumber,
        isImmutable: true,
        remarks: `Dispatched to ${issue.projectName} (In Transit)`,
        createdBy: dispatchedBy,
        recordedBy: dispatchedBy,
        createdAt: now,
      });

      // IN entry at In Transit
      newStockEntries.push({
        id: `stk-in-transit-${issue.id}-${item.productId}`,
        transactionNumber: `TXN-${Date.now().toString().slice(-6)}-TRANSIT`,
        transactionType: 'TRANSFER_IN',
        entryType: 'TRANSFER_IN',
        transactionDate: now.split('T')[0],
        transactionTime: timeStr,
        entryDate: now.split('T')[0],
        createdTime: now,
        productId: item.productId,
        productCode: item.productId,
        productName: item.productDescription,
        productDescription: item.productDescription,
        categoryName: item.categoryName,
        warehouseId: 'wh-in-transit',
        warehouseName: 'In Transit',
        locationId: 'wh-in-transit',
        locationName: 'In Transit',
        projectId: issue.projectId,
        projectName: issue.projectName,
        quantityIn: item.issueQty,
        quantityOut: 0,
        inQuantity: item.issueQty,
        outQuantity: 0,
        runningBalance: item.issueQty,
        unit: item.unit,
        unitSymbol: item.unit,
        unitRate: item.unitRate,
        transactionValue: item.issueQty * item.unitRate,
        totalValue: item.issueQty * item.unitRate,
        sourceType: 'MATERIAL_ISSUE',
        sourceId: issue.id,
        sourceNumber: issue.issueNumber,
        sourceDocumentId: issue.id,
        sourceDocumentNumber: issue.issueNumber,
        isImmutable: true,
        remarks: `In transit for ${issue.projectName}`,
        createdBy: dispatchedBy,
        recordedBy: dispatchedBy,
        createdAt: now,
      });
    }

    updateCollection('stockLedger', [...currentLedger, ...newStockEntries]);

    const activityLog = [
      ...(issue.activityLog || []),
      {
        id: `act-${Date.now()}`,
        timestamp: now,
        user: dispatchedBy,
        action: 'ISSUE_DISPATCHED' as const,
        description: `Dispatched ${issueItems.length} item(s) from ${issue.sourceWarehouseName} to In Transit`,
      },
    ];

    updateItem('materialIssues', issue.id, {
      status: 'Dispatched',
      dispatchedBy,
      dispatchedAt: now,
      activityLog,
      updatedAt: now,
    });

    logAudit({
      documentType: 'material_issue',
      documentId: issue.id,
      documentNumber: issue.issueNumber,
      action: 'DISPATCHED',
      performedBy: dispatchedBy,
      newStatus: 'Dispatched',
      details: `Dispatched material issue ${issue.issueNumber}. Posted stock from Main Warehouse to In Transit.`,
    });

    return { success: true };
  };

  // Record Site Receipt (Posts In Transit -> Project Site Store)
  const recordSiteReceipt = (
    issueId: string,
    receipts: { productId: string; receiveNowQty: number }[],
    receivedBy: string = 'Site Storekeeper',
    remarks?: string
  ) => {
    const issue = (state.materialIssues || []).find((m) => m.id === issueId);
    if (!issue) return { success: false, error: 'Material issue not found' };

    if (issue.status !== 'Dispatched' && issue.status !== 'Partially Received') {
      return { success: false, error: `Cannot record receipt for material issue in status '${issue.status}'` };
    }

    const currentLedger = state.stockLedger || [];
    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newStockEntries: StockLedgerEntry[] = [];
    const issueItems = issue.items || issue.lines || [];

    const updatedItems = issueItems.map((item: any) => {
      const match = receipts.find((r) => r.productId === item.productId);
      const rQty = Number(match?.receiveNowQty || 0);

      if (rQty > 0) {
        const remainingTransit = item.issueQty - (item.receivedQty || 0);
        const actualReceipt = Math.min(rQty, remainingTransit);

        // OUT entry from In Transit
        newStockEntries.push({
          id: `stk-out-transit-${issue.id}-${item.productId}-${Date.now()}`,
          transactionNumber: `TXN-${Date.now().toString().slice(-6)}-RCV-OUT`,
          transactionType: 'TRANSFER_OUT',
          entryType: 'TRANSFER_OUT',
          transactionDate: now.split('T')[0],
          transactionTime: timeStr,
          entryDate: now.split('T')[0],
          createdTime: now,
          productId: item.productId,
          productCode: item.productId,
          productName: item.productDescription,
          productDescription: item.productDescription,
          categoryName: item.categoryName,
          warehouseId: 'wh-in-transit',
          warehouseName: 'In Transit',
          locationId: 'wh-in-transit',
          locationName: 'In Transit',
          projectId: issue.projectId,
          projectName: issue.projectName,
          quantityIn: 0,
          quantityOut: actualReceipt,
          inQuantity: 0,
          outQuantity: actualReceipt,
          runningBalance: 0,
          unit: item.unit,
          unitSymbol: item.unit,
          unitRate: item.unitRate,
          transactionValue: actualReceipt * item.unitRate,
          totalValue: actualReceipt * item.unitRate,
          sourceType: 'SITE_RECEIPT',
          sourceId: issue.id,
          sourceNumber: issue.issueNumber,
          sourceDocumentId: issue.id,
          sourceDocumentNumber: issue.issueNumber,
          isImmutable: true,
          remarks: `Received at ${issue.destinationStoreName}`,
          createdBy: receivedBy,
          recordedBy: receivedBy,
          createdAt: now,
        });

        // IN entry at Destination Project Site Store
        newStockEntries.push({
          id: `stk-in-site-${issue.id}-${item.productId}-${Date.now()}`,
          transactionNumber: `TXN-${Date.now().toString().slice(-6)}-RCV-IN`,
          transactionType: 'TRANSFER_IN',
          entryType: 'TRANSFER_IN',
          transactionDate: now.split('T')[0],
          transactionTime: timeStr,
          entryDate: now.split('T')[0],
          createdTime: now,
          productId: item.productId,
          productCode: item.productId,
          productName: item.productDescription,
          productDescription: item.productDescription,
          categoryName: item.categoryName,
          warehouseId: issue.destinationStoreId,
          warehouseName: issue.destinationStoreName,
          locationId: issue.destinationStoreId,
          locationName: issue.destinationStoreName,
          projectId: issue.projectId,
          projectName: issue.projectName,
          quantityIn: actualReceipt,
          quantityOut: 0,
          inQuantity: actualReceipt,
          outQuantity: 0,
          runningBalance: (item.receivedQty || 0) + actualReceipt,
          unit: item.unit,
          unitSymbol: item.unit,
          unitRate: item.unitRate,
          transactionValue: actualReceipt * item.unitRate,
          totalValue: actualReceipt * item.unitRate,
          sourceType: 'SITE_RECEIPT',
          sourceId: issue.id,
          sourceNumber: issue.issueNumber,
          sourceDocumentId: issue.id,
          sourceDocumentNumber: issue.issueNumber,
          isImmutable: true,
          remarks: `Site receipt confirmed for ${issue.projectName}`,
          createdBy: receivedBy,
          recordedBy: receivedBy,
          createdAt: now,
        });

        return {
          ...item,
          receivedQty: (item.receivedQty || 0) + actualReceipt,
        };
      }
      return item;
    });

    if (newStockEntries.length > 0) {
      updateCollection('stockLedger', [...currentLedger, ...newStockEntries]);
    }

    const isFullyReceived = updatedItems.every((it) => it.receivedQty >= it.issueQty);
    const newStatus = isFullyReceived ? 'Received at Site' : 'Partially Received';

    const activityLog = [
      ...(issue.activityLog || []),
      {
        id: `act-${Date.now()}`,
        timestamp: now,
        user: receivedBy,
        action: (isFullyReceived ? 'SITE_RECEIPT_COMPLETED' : 'SITE_PARTIAL_RECEIPT') as any,
        description: `Site receipt recorded by ${receivedBy}. Status: ${newStatus}.${remarks ? ` Remarks: ${remarks}` : ''}`,
      },
    ];

    updateItem('materialIssues', issue.id, {
      status: newStatus,
      items: updatedItems,
      receivedBy,
      receivedAt: now,
      activityLog,
      updatedAt: now,
    });

    logAudit({
      documentType: 'material_issue',
      documentId: issue.id,
      documentNumber: issue.issueNumber,
      action: isFullyReceived ? 'SITE_RECEIPT_COMPLETED' : 'SITE_PARTIAL_RECEIPT',
      performedBy: receivedBy,
      newStatus,
      details: `Recorded site receipt for ${issue.issueNumber} at ${issue.destinationStoreName}`,
    });

    return { success: true };
  };

  // Cancel Material Issue (Reverses stock entries if already issued/dispatched and updates status to Cancelled)
  const cancelMaterialIssue = (issueId: string, cancelledBy: string = 'Stores Officer', reason?: string) => {
    const issue = (state.materialIssues || []).find((m) => m.id === issueId);
    if (!issue) return { success: false, error: 'Material issue not found' };

    const hasConsumptions = (state.materialConsumptions || []).some(
      (c: any) => c.originalIssueId === issueId || c.issueId === issueId || c.documentNumber === issue.documentNumber
    );
    const hasReturns = (state.materialReturns || []).some(
      (r: any) => r.originalIssueId === issueId || r.issueId === issueId || r.originalIssueNumber === issue.documentNumber
    );

    if (hasConsumptions || hasReturns) {
      return {
        success: false,
        error: 'Cannot cancel Material Issue that has downstream Site Consumptions or Material Returns recorded.',
      };
    }

    const currentLedger = state.stockLedger || [];
    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const reversalEntries: StockLedgerEntry[] = [];
    const issueItems = issue.items || issue.lines || [];

    // Reverse stock OUT entries if status was issued or dispatched
    if (issue.status !== 'Draft' && issue.status !== 'draft') {
      issueItems.forEach((item: any, idx: number) => {
        const pQty = Number(item.issueQty ?? item.issuedQty ?? 0);
        if (pQty > 0) {
          reversalEntries.push({
            id: `stk-cancel-rev-${issue.id}-${item.productId}-${idx}`,
            transactionNumber: `TXN-${Date.now().toString().slice(-6)}-CANCEL-REV`,
            transactionType: 'TRANSFER_IN',
            entryType: 'TRANSFER_IN',
            transactionDate: now.split('T')[0],
            transactionTime: timeStr,
            entryDate: now.split('T')[0],
            createdTime: now,
            productId: item.productId,
            productCode: item.productId,
            productName: item.productDescription || item.productName || 'Material Item',
            productDescription: item.productDescription || item.productName || 'Material Item',
            categoryName: item.categoryName || 'General Material',
            warehouseId: issue.sourceLocationId || issue.sourceWarehouseId || 'loc-001',
            warehouseName: issue.sourceLocationName || issue.sourceWarehouseName || 'Central Site Store',
            locationId: issue.sourceLocationId || issue.sourceWarehouseId || 'loc-001',
            locationName: issue.sourceLocationName || issue.sourceWarehouseName || 'Central Site Store',
            projectId: issue.projectId,
            projectName: issue.projectName,
            quantityIn: pQty,
            quantityOut: 0,
            inQuantity: pQty,
            outQuantity: 0,
            runningBalance: 0,
            unit: item.unit || item.unitSymbol || 'units',
            unitSymbol: item.unit || item.unitSymbol || 'units',
            unitRate: item.unitRate || 0,
            transactionValue: pQty * (item.unitRate || 0),
            totalValue: pQty * (item.unitRate || 0),
            sourceType: 'MATERIAL_ISSUE_CANCEL',
            sourceId: issue.id,
            sourceNumber: issue.issueNumber,
            sourceDocumentId: issue.id,
            sourceDocumentNumber: issue.issueNumber,
            isImmutable: true,
            remarks: `Reversal entry due to issue cancellation (${reason || 'Cancelled by user'})`,
            createdBy: cancelledBy,
            recordedBy: cancelledBy,
            createdAt: now,
          });
        }
      });

      if (reversalEntries.length > 0) {
        updateCollection('stockLedger', [...currentLedger, ...reversalEntries]);
      }
    }

    const activityLog = [
      ...(issue.activityLog || []),
      {
        id: `act-${Date.now()}`,
        timestamp: now,
        user: cancelledBy,
        action: 'ISSUE_CANCELLED' as any,
        description: `Cancelled Material Issue ${issue.issueNumber}. Reason: ${reason || 'User request'}`,
      },
    ];

    updateItem('materialIssues', issue.id, {
      status: 'Cancelled',
      activityLog,
      updatedAt: now,
    });

    logAudit({
      documentType: 'material_issue',
      documentId: issue.id,
      documentNumber: issue.issueNumber,
      action: 'CANCELLED',
      performedBy: cancelledBy,
      newStatus: 'Cancelled',
      details: `Cancelled material issue ${issue.issueNumber}. ${reason ? `Reason: ${reason}` : ''}`,
    });

    return { success: true };
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
  const createSubcontractorWorkOrder = (wo: SubcontractWorkOrder | WorkOrder | any, performedBy: string = 'Contracts Lead') => {
    addItem('workOrders', wo);
    addItem('subcontractWorkOrders', wo);
    const amount = wo.grandTotal ?? wo.totalAmount ?? wo.finalContractValue ?? 0;
    logAudit({
      documentType: 'work_order',
      documentId: wo.id,
      documentNumber: wo.documentNumber || wo.woNumber,
      action: 'CREATED',
      performedBy,
      newStatus: wo.status,
      details: `Created Subcontractor Work Order ${wo.documentNumber || wo.woNumber} for ${wo.subcontractorName} - ₹${amount.toLocaleString('en-IN')}`,
    });
    return { success: true, workOrder: wo };
  };

  const updateSubcontractWorkOrder = (id: string, patch: Partial<SubcontractWorkOrder>, performedBy: string = 'User') => {
    updateItem('subcontractWorkOrders', id, patch);
    updateItem('workOrders', id, patch);
    logAudit({
      documentType: 'work_order',
      documentId: id,
      documentNumber: (patch as any).documentNumber || (patch as any).woNumber || id,
      action: 'STATUS_CHANGED',
      performedBy,
      newStatus: patch.status,
      details: `Updated Subcontract Work Order ${id} status to ${patch.status}`,
    });
  };

  // Stage 4 Store Action: Create Subcontractor WIP Entry
  const createWIPEntry = (wip: SubcontractorWIP, performedBy: string = 'QS Engineer') => {
    // Domain Guard: Work Order must exist and be active
    const wo = (state.workOrders || []).find((w) => w.id === wip.workOrderId || w.documentNumber === wip.woNumber || (w as any).woNumber === wip.woNumber) ||
               (state.subcontractWorkOrders || []).find((w) => w.id === wip.workOrderId || w.documentNumber === wip.woNumber);
    if (!wo || wo.status === 'draft' || wo.status === 'cancelled' || wo.status === 'rejected') {
      return { success: false, error: 'Domain Guard Rejected: WIP measurement can only reference an issued or active Work Order.' };
    }

    addItem('wips', wip);
    addItem('subcontractorWIPs', wip);
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

  // Subcontractor Bill Store Action: Auto-generate Bill from Certified WIP
  const ensureSubcontractorBillForWIP = (wipId: string, _performedBy: string = 'System'): SubcontractorBill | null => {
    const allWips = (state.subcontractorWIPs || []).concat(state.wips || []);
    const wip = allWips.find((w) => w.id === wipId || w.wipNumber === wipId || w.documentNumber === wipId);
    if (!wip) return null;

    const isCertified = wip.status === 'approved' || wip.status === 'certified';
    if (!isCertified) return null;

    const existingBills: SubcontractorBill[] = state.subcontractorBills || [];
    const existingBill = existingBills.find(
      (b) => b.subcontractorWIPId === wip.id || b.wipId === wip.id || b.wipNumber === (wip.wipNumber || wip.documentNumber)
    );
    if (existingBill) {
      return existingBill;
    }

    const wo = (state.subcontractWorkOrders || []).find((w) => w.id === wip.workOrderId || w.documentNumber === wip.woNumber);
    const grossCertifiedValue = Number(wip.totalApprovedValue ?? wip.totalClaimedValue ?? wip.totalMeasuredAmount ?? 0);

    const retentionPct = wo?.retentionPercentage ?? 5;
    const retentionDeducted = (grossCertifiedValue * retentionPct) / 100;

    let advanceRecoveryDeducted = 0;
    if (wo && wo.advanceAmount && wo.advanceAmount > 0) {
      const prevBills = existingBills.filter((b) => b.workOrderId === wo.id);
      const prevRecovered = prevBills.reduce((sum, b) => sum + (b.advanceRecoveryDeducted || 0), 0);
      const remainingAdv = Math.max(0, wo.advanceAmount - prevRecovered);
      if (remainingAdv > 0) {
        const advPct = wo.advancePercentage ?? 10;
        advanceRecoveryDeducted = Math.min(remainingAdv, (grossCertifiedValue * advPct) / 100);
      }
    }

    const otherDeductions = 0;
    const totalDeductions = retentionDeducted + advanceRecoveryDeducted + otherDeductions;
    const taxPct = wo?.taxPercentage ?? 18;
    const taxAmount = ((grossCertifiedValue - totalDeductions) * taxPct) / 100;
    const netPayable = grossCertifiedValue - totalDeductions + taxAmount;

    const existingBillNums = existingBills.map((b) => b.billNumber);
    let seq = existingBills.length + 1;
    let billNumber = `SCB/2026/${String(seq).padStart(3, '0')}`;
    while (existingBillNums.includes(billNumber)) {
      seq++;
      billNumber = `SCB/2026/${String(seq).padStart(3, '0')}`;
    }

    const subName = wip.subcontractorName || 'Subcontractor';
    const invoiceNumber = `INV-${subName.split(' ')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newBill: SubcontractorBill = {
      id: `scb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      billNumber,
      invoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      workOrderId: wip.workOrderId,
      woNumber: wip.woNumber,
      wipId: wip.id,
      wipNumber: wip.wipNumber || wip.documentNumber,
      subcontractorWIPId: wip.id,
      subcontractorId: wip.subcontractorId,
      subcontractorName: subName,
      projectId: wip.projectId,
      projectName: wip.projectName,
      billDate: new Date().toISOString().split('T')[0],
      grossAmount: grossCertifiedValue,
      grossCertifiedValue,
      retentionDeducted,
      advanceRecoveryDeducted,
      otherDeductions,
      totalDeductions,
      taxAmount,
      netBillAmount: netPayable,
      netPayable,
      paidAmount: 0,
      outstandingAmount: netPayable,
      billStatus: 'Pending Approval',
      paymentStatus: 'Not Started',
      status: 'Pending Approval',
      createdAt: new Date().toISOString(),
      createdBy: 'System (WIP Certified)',
    };

    addItem('subcontractorBills', newBill);
    logAudit({
      documentType: 'subcontractor_bill',
      documentId: newBill.id,
      documentNumber: newBill.billNumber,
      action: 'AUTO_GENERATED',
      performedBy: 'System',
      newStatus: 'Pending Approval',
      details: `Automatically generated Subcontractor Bill ${newBill.billNumber} from Certified WIP ${newBill.wipNumber}`,
    });

    return newBill;
  };

  const approveSubcontractorBill = (billId: string, performedBy: string = 'Finance Manager') => {
    const bill = (state.subcontractorBills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Subcontractor Bill not found' };

    const updates: Partial<SubcontractorBill> = {
      billStatus: 'Approved',
      status: 'Approved',
      paymentStatus: 'Payment Pending',
      approvedBy: performedBy,
      approvedAt: new Date().toISOString(),
    };

    updateItem('subcontractorBills', bill.id, updates);
    logAudit({
      documentType: 'subcontractor_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'APPROVED',
      performedBy,
      newStatus: 'Approved',
      details: `Approved Subcontractor Bill ${bill.billNumber} for Net Payable ₹${(bill.netPayable || bill.netBillAmount).toLocaleString('en-IN')}`,
    });

    return { success: true };
  };

  const rejectSubcontractorBill = (billId: string, reason: string, performedBy: string = 'Finance Manager') => {
    const bill = (state.subcontractorBills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Subcontractor Bill not found' };
    if (!reason || !reason.trim()) return { success: false, error: 'Rejection reason is mandatory' };

    const updates: Partial<SubcontractorBill> = {
      billStatus: 'Rejected',
      status: 'Rejected',
      paymentStatus: 'Not Applicable',
      rejectedBy: performedBy,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
    };

    updateItem('subcontractorBills', bill.id, updates);
    logAudit({
      documentType: 'subcontractor_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'REJECTED',
      performedBy,
      newStatus: 'Rejected',
      details: `Rejected Subcontractor Bill ${bill.billNumber}. Reason: ${reason}`,
    });

    return { success: true };
  };

  const reopenSubcontractorBill = (billId: string, reason: string, performedBy: string = 'Finance Manager') => {
    const bill = (state.subcontractorBills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Subcontractor Bill not found' };
    if (!reason || !reason.trim()) return { success: false, error: 'Reopen reason is mandatory' };

    const payments = (state.subcontractorPayments || []).filter((p: any) => p.billId === bill.id || p.subcontractorBillId === bill.id);
    if ((bill.paidAmount || 0) > 0 || payments.length > 0) {
      return { success: false, error: 'Payment already exists against this bill. Controlled payment reversal required before reopening.' };
    }

    const updates: Partial<SubcontractorBill> = {
      billStatus: 'Pending Approval',
      status: 'Pending Approval',
      paymentStatus: 'Not Started',
      reopenedBy: performedBy,
      reopenedAt: new Date().toISOString(),
      reopenReason: reason,
    };

    updateItem('subcontractorBills', bill.id, updates);
    logAudit({
      documentType: 'subcontractor_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'REOPENED',
      performedBy,
      newStatus: 'Pending Approval',
      details: `Reopened Subcontractor Bill ${bill.billNumber} back to Pending Approval. Reason: ${reason}`,
    });

    return { success: true };
  };

  const editSubcontractorBill = (billId: string, updates: Partial<SubcontractorBill>, performedBy: string = 'Finance Officer') => {
    const bill = (state.subcontractorBills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Subcontractor Bill not found' };
    if (bill.billStatus !== 'Pending Approval' && bill.status !== 'Pending Approval') {
      return { success: false, error: 'Editing is locked once a Subcontractor Bill is Approved or Rejected' };
    }

    const gross = updates.grossCertifiedValue ?? bill.grossCertifiedValue ?? bill.grossAmount;
    const retention = updates.retentionDeducted ?? bill.retentionDeducted;
    const advanceRec = updates.advanceRecoveryDeducted ?? bill.advanceRecoveryDeducted ?? 0;
    const otherDed = updates.otherDeductions ?? bill.otherDeductions ?? 0;
    const totalDed = retention + advanceRec + otherDed;
    const tax = updates.taxAmount ?? bill.taxAmount;
    const net = gross - totalDed + tax;

    const patch: Partial<SubcontractorBill> = {
      ...updates,
      grossAmount: gross,
      grossCertifiedValue: gross,
      retentionDeducted: retention,
      advanceRecoveryDeducted: advanceRec,
      otherDeductions: otherDed,
      totalDeductions: totalDed,
      taxAmount: tax,
      netBillAmount: net,
      netPayable: net,
      outstandingAmount: net - (bill.paidAmount || 0),
    };

    updateItem('subcontractorBills', bill.id, patch);
    logAudit({
      documentType: 'subcontractor_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'EDITED',
      performedBy,
      newStatus: bill.billStatus,
      details: `Updated finance details for Subcontractor Bill ${bill.billNumber}`,
    });

    return { success: true };
  };

  const recordSubcontractorPayment = (
    billId: string,
    payment: {
      paymentDate: string;
      amountPaid: number;
      paymentMethod: string;
      referenceNumber: string;
      payingBankAccount?: string;
      remarks?: string;
    },
    performedBy: string = 'Finance Officer'
  ) => {
    const bill = (state.subcontractorBills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Subcontractor Bill not found' };
    if (bill.billStatus !== 'Approved' && bill.status !== 'Approved') {
      return { success: false, error: 'Payment can only be recorded for Approved Subcontractor Bills' };
    }

    const amountPaid = Number(payment.amountPaid);
    if (isNaN(amountPaid) || amountPaid <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero' };
    }

    const currentPaid = bill.paidAmount || 0;
    const netPayable = bill.netPayable || bill.netBillAmount;
    const outstanding = bill.outstandingAmount ?? (netPayable - currentPaid);

    if (amountPaid > outstanding + 0.01) {
      return { success: false, error: `Payment amount ₹${amountPaid.toLocaleString('en-IN')} exceeds outstanding balance of ₹${outstanding.toLocaleString('en-IN')}` };
    }

    const newPaidTotal = currentPaid + amountPaid;
    const newOutstanding = Math.max(0, netPayable - newPaidTotal);
    const newPaymentStatus: SubcontractorBillPaymentStatus = newOutstanding === 0 ? 'Paid' : 'Partially Paid';

    const payments = state.subcontractorPayments || [];
    const paymentSeq = payments.length + 1;
    const paymentRecord: SubcontractorBillPayment = {
      id: `sc-pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      paymentNumber: `PAY/SC/2026/${String(paymentSeq).padStart(3, '0')}`,
      billId: bill.id,
      billNumber: bill.billNumber,
      wipId: bill.wipId || bill.subcontractorWIPId,
      workOrderId: bill.workOrderId,
      subcontractorId: bill.subcontractorId,
      paymentDate: payment.paymentDate,
      amountPaid,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      payingBankAccount: payment.payingBankAccount,
      remarks: payment.remarks,
      recordedBy: performedBy,
      createdAt: new Date().toISOString(),
    };

    addItem('subcontractorPayments', paymentRecord);

    const billPatch: Partial<SubcontractorBill> = {
      paidAmount: newPaidTotal,
      outstandingAmount: newOutstanding,
      paymentStatus: newPaymentStatus,
    };

    updateItem('subcontractorBills', bill.id, billPatch);
    logAudit({
      documentType: 'subcontractor_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'PAYMENT_RECORDED',
      performedBy,
      newStatus: newPaymentStatus,
      details: `Recorded payment of ₹${amountPaid.toLocaleString('en-IN')} for Subcontractor Bill ${bill.billNumber} (${paymentRecord.paymentNumber})`,
    });

    return { success: true };
  };

  // Client RA Bills Store Functions
  const createClientRABill = (billInput: Partial<ClientRABill>, performedBy: string = 'Billing Specialist') => {
    const bills = state.clientRABills || [];
    const seq = bills.length + 1;
    const billNumber = billInput.billNumber || `RA/2026/${String(seq).padStart(3, '0')}`;

    const gross = Number(billInput.grossWorkValue || billInput.claimedAmount || 0);
    const variations = Number(billInput.approvedVariations || 0);
    const retention = Number(billInput.retentionAmount || 0);
    const advanceRec = Number(billInput.advanceRecoveryAmount || 0);
    const otherDed = Number(billInput.otherDeductions || 0);
    const totalDed = retention + advanceRec + otherDed;
    const tax = Number(billInput.taxAmount || 0);
    const net = (gross + variations) - totalDed + tax;

    const newBill: ClientRABill = {
      id: `ra-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      billNumber,
      projectId: billInput.projectId || '',
      projectName: billInput.projectName || '',
      clientId: billInput.clientId || '',
      clientName: billInput.clientName || '',
      milestoneId: billInput.milestoneId || '',
      milestoneName: billInput.milestoneName || '',
      billDate: billInput.billDate || new Date().toISOString().split('T')[0],
      dueDate: billInput.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      claimedAmount: Number(billInput.claimedAmount || gross),
      grossWorkValue: gross,
      approvedVariations: variations,
      retentionAmount: retention,
      advanceRecoveryAmount: advanceRec,
      otherDeductions: otherDed,
      totalDeductions: totalDed,
      taxAmount: tax,
      netReceivable: net,
      paidAmount: 0,
      outstandingAmount: net,
      billStatus: 'Draft',
      paymentStatus: 'Not Applicable',
      paymentHistory: [],
      auditLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: performedBy,
          action: 'Draft Created',
          details: `Generated RA Bill ${billNumber} for ${billInput.projectName}`,
        },
      ],
      createdAt: new Date().toISOString(),
      createdBy: performedBy,
    };

    addItem('clientRABills', newBill);
    logAudit({
      documentType: 'client_ra_bill',
      documentId: newBill.id,
      documentNumber: newBill.billNumber,
      action: 'CREATED',
      performedBy,
      newStatus: 'Draft',
      details: `Created draft Client RA Bill ${newBill.billNumber} (Net ₹${net.toLocaleString('en-IN')})`,
    });

    return { success: true, bill: newBill };
  };

  const editClientRABill = (billId: string, updates: Partial<ClientRABill>, performedBy: string = 'Billing Specialist') => {
    const bill = (state.clientRABills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Client RA Bill not found' };
    if (bill.billStatus !== 'Draft' && bill.billStatus !== 'Pending Approval') {
      return { success: false, error: 'Editing is locked once an RA Bill is Approved, Sent, or Paid.' };
    }

    const gross = updates.grossWorkValue ?? bill.grossWorkValue;
    const variations = updates.approvedVariations ?? bill.approvedVariations;
    const retention = updates.retentionAmount ?? bill.retentionAmount;
    const advanceRec = updates.advanceRecoveryAmount ?? bill.advanceRecoveryAmount;
    const otherDed = updates.otherDeductions ?? bill.otherDeductions;
    const totalDed = retention + advanceRec + otherDed;
    const tax = updates.taxAmount ?? bill.taxAmount;
    const net = (gross + variations) - totalDed + tax;

    const patch: Partial<ClientRABill> = {
      ...updates,
      grossWorkValue: gross,
      approvedVariations: variations,
      retentionAmount: retention,
      advanceRecoveryAmount: advanceRec,
      otherDeductions: otherDed,
      totalDeductions: totalDed,
      taxAmount: tax,
      netReceivable: net,
      outstandingAmount: net - (bill.paidAmount || 0),
    };

    updateItem('clientRABills', bill.id, patch);
    logAudit({
      documentType: 'client_ra_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'EDITED',
      performedBy,
      newStatus: bill.billStatus,
      details: `Updated details for Client RA Bill ${bill.billNumber}`,
    });

    return { success: true };
  };

  const submitClientRABillForApproval = (billId: string, performedBy: string = 'Billing Officer') => {
    const bill = (state.clientRABills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Client RA Bill not found' };
    if (bill.billStatus !== 'Draft' && bill.billStatus !== 'Rejected') {
      return { success: false, error: 'Only Draft or Rejected RA Bills can be submitted for approval' };
    }

    const newLogs = [
      ...(bill.auditLog || []),
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: performedBy,
        action: 'Submitted for Approval',
        details: `Submitted to Finance for approval`,
      },
    ];

    updateItem('clientRABills', bill.id, {
      billStatus: 'Pending Approval',
      auditLog: newLogs,
    });

    logAudit({
      documentType: 'client_ra_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'SUBMITTED',
      performedBy,
      newStatus: 'Pending Approval',
      details: `Submitted Client RA Bill ${bill.billNumber} for internal approval`,
    });

    return { success: true };
  };

  const approveClientRABill = (billId: string, performedBy: string = 'Finance Manager') => {
    const bill = (state.clientRABills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Client RA Bill not found' };
    if (bill.billStatus !== 'Pending Approval') {
      return { success: false, error: 'Only Pending Approval RA Bills can be approved' };
    }

    const newLogs = [
      ...(bill.auditLog || []),
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: performedBy,
        action: 'Approved Bill',
        details: `Approved net receivable ₹${bill.netReceivable.toLocaleString('en-IN')}`,
      },
    ];

    updateItem('clientRABills', bill.id, {
      billStatus: 'Approved',
      paymentStatus: 'Not Started',
      approvedBy: performedBy,
      approvedAt: new Date().toISOString(),
      auditLog: newLogs,
    });

    if (bill.projectId) {
      const proj = (state.projects || []).find((p) => p.id === bill.projectId);
      if (proj && proj.billingMilestones) {
        const updatedMs = proj.billingMilestones.map((m) => {
          if (m.id === bill.milestoneId || m.id === bill.billingMilestoneId || m.raBillId === bill.id) {
            return { ...m, billingStatus: 'RA_APPROVED' as const };
          }
          return m;
        });
        updateItem('projects', proj.id, { billingMilestones: updatedMs });
      }
    }

    logAudit({
      documentType: 'client_ra_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'APPROVED',
      performedBy,
      newStatus: 'Approved',
      details: `Approved Client RA Bill ${bill.billNumber}`,
    });

    return { success: true };
  };

  const rejectClientRABill = (billId: string, reason: string, performedBy: string = 'Finance Manager') => {
    const bill = (state.clientRABills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Client RA Bill not found' };
    if (!reason || !reason.trim()) return { success: false, error: 'Rejection reason is mandatory' };

    const newLogs = [
      ...(bill.auditLog || []),
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: performedBy,
        action: 'Rejected Bill',
        details: `Reason: ${reason}`,
      },
    ];

    updateItem('clientRABills', bill.id, {
      billStatus: 'Rejected',
      paymentStatus: 'Not Applicable',
      rejectedBy: performedBy,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      auditLog: newLogs,
    });

    if (bill.projectId) {
      const proj = (state.projects || []).find((p) => p.id === bill.projectId);
      if (proj && proj.billingMilestones) {
        const updatedMs = proj.billingMilestones.map((m) => {
          if (m.id === bill.milestoneId || m.id === bill.billingMilestoneId || m.raBillId === bill.id) {
            return { ...m, billingStatus: 'RA_REJECTED' as const };
          }
          return m;
        });
        updateItem('projects', proj.id, { billingMilestones: updatedMs });
      }
    }

    logAudit({
      documentType: 'client_ra_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'REJECTED',
      performedBy,
      newStatus: 'Rejected',
      details: `Rejected Client RA Bill ${bill.billNumber}. Reason: ${reason}`,
    });

    return { success: true };
  };

  const markClientRABillSent = (billId: string, performedBy: string = 'Billing Officer') => {
    const bill = (state.clientRABills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Client RA Bill not found' };
    if (bill.billStatus !== 'Approved') {
      return { success: false, error: 'Only Approved RA Bills can be marked as sent to client' };
    }

    const newLogs = [
      ...(bill.auditLog || []),
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: performedBy,
        action: 'Sent to Client',
        details: `Issued to Client`,
      },
    ];

    updateItem('clientRABills', bill.id, {
      billStatus: 'Sent to Client',
      paymentStatus: 'Payment Pending',
      sentBy: performedBy,
      sentAt: new Date().toISOString(),
      auditLog: newLogs,
    });

    if (bill.projectId) {
      const proj = (state.projects || []).find((p) => p.id === bill.projectId);
      if (proj && proj.billingMilestones) {
        const updatedMs = proj.billingMilestones.map((m) => {
          if (m.id === bill.milestoneId || m.id === bill.billingMilestoneId || m.raBillId === bill.id) {
            return { ...m, billingStatus: 'SENT_TO_CLIENT' as const };
          }
          return m;
        });
        updateItem('projects', proj.id, { billingMilestones: updatedMs });
      }
    }

    logAudit({
      documentType: 'client_ra_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'SENT_TO_CLIENT',
      performedBy,
      newStatus: 'Sent to Client',
      details: `Marked Client RA Bill ${bill.billNumber} as Sent to Client`,
    });

    return { success: true };
  };

  const recordClientPayment = (
    billId: string,
    receiptInput: {
      receiptDate: string;
      amountReceived: number;
      paymentMode: string;
      referenceNumber?: string;
      receivingBankAccount: string;
      remarks?: string;
    },
    performedBy: string = 'Accounts Receiver'
  ) => {
    const bill = (state.clientRABills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Client RA Bill not found' };
    if (bill.billStatus !== 'Sent to Client' && bill.billStatus !== 'Approved') {
      return { success: false, error: 'Client payments can only be recorded for Sent or Approved RA Bills' };
    }

    const amountReceived = Number(receiptInput.amountReceived);
    if (isNaN(amountReceived) || amountReceived <= 0) {
      return { success: false, error: 'Payment receipt amount must be greater than zero' };
    }

    const currentPaid = bill.paidAmount || 0;
    const netReceivable = bill.netReceivable;
    const outstanding = bill.outstandingAmount ?? (netReceivable - currentPaid);

    if (amountReceived > outstanding + 0.01) {
      return { success: false, error: `Receipt amount ₹${amountReceived.toLocaleString('en-IN')} exceeds outstanding balance of ₹${outstanding.toLocaleString('en-IN')}` };
    }

    const receipts = state.clientReceipts || [];
    const seq = receipts.length + 1;
    const receiptRecord: ClientPaymentReceipt = {
      id: `rcpt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      receiptNumber: `RCPT/2026/${String(seq).padStart(3, '0')}`,
      raBillId: bill.id,
      raBillNumber: bill.billNumber,
      projectId: bill.projectId,
      projectName: bill.projectName,
      clientId: bill.clientId,
      clientName: bill.clientName,
      receiptDate: receiptInput.receiptDate,
      amountReceived,
      paymentMode: receiptInput.paymentMode,
      referenceNumber: receiptInput.referenceNumber,
      receivingBankAccount: receiptInput.receivingBankAccount,
      remarks: receiptInput.remarks,
      createdAt: new Date().toISOString(),
      createdBy: performedBy,
    };

    addItem('clientReceipts', receiptRecord);

    const newPaidTotal = currentPaid + amountReceived;
    const newOutstanding = Math.max(0, netReceivable - newPaidTotal);
    const newPaymentStatus: ClientRABillPaymentStatus = newOutstanding === 0 ? 'Paid' : 'Partially Paid';

    const newLogs = [
      ...(bill.auditLog || []),
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: performedBy,
        action: 'Client Payment Recorded',
        details: `Receipt ${receiptRecord.receiptNumber} recorded ₹${amountReceived.toLocaleString('en-IN')}`,
      },
    ];

    const updatedHistory = [...(bill.paymentHistory || []), receiptRecord];

    updateItem('clientRABills', bill.id, {
      paidAmount: newPaidTotal,
      outstandingAmount: newOutstanding,
      paymentStatus: newPaymentStatus,
      paymentHistory: updatedHistory,
      auditLog: newLogs,
    });

    if (bill.projectId) {
      const proj = (state.projects || []).find((p) => p.id === bill.projectId);
      if (proj && proj.billingMilestones) {
        const isFullyPaid = newOutstanding <= 0.01;
        const updatedMs = proj.billingMilestones.map((m) => {
          if (m.id === bill.milestoneId || m.id === bill.billingMilestoneId || m.raBillId === bill.id) {
            return { ...m, billingStatus: isFullyPaid ? ('PAID' as const) : ('PARTIALLY_PAID' as const) };
          }
          return m;
        });
        updateItem('projects', proj.id, { billingMilestones: updatedMs });
      }
    }

    logAudit({
      documentType: 'client_ra_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'PAYMENT_RECORDED',
      performedBy,
      newStatus: newPaymentStatus,
      details: `Recorded client payment receipt of ₹${amountReceived.toLocaleString('en-IN')} (${receiptRecord.receiptNumber}) for RA Bill ${bill.billNumber}`,
    });

    return { success: true };
  };

  const triggerProjectBillingEvaluation = (
    projectId: string,
    event: BillingEvaluationTriggerEvent
  ) => {
    const project = (state.projects || []).find((p) => p.id === projectId);
    if (!project) return { triggeredMilestones: [], createdRABills: [] };

    const res = evaluateBillingMilestones({
      project,
      event,
      existingRABills: state.clientRABills || [],
    });

    if (res.triggeredMilestones.length > 0) {
      updateItem('projects', project.id, {
        billingMilestones: res.updatedProject.billingMilestones,
      });

      res.createdRABills.forEach((bill) => {
        addItem('clientRABills', bill);
      });
    }

    return {
      triggeredMilestones: res.triggeredMilestones,
      createdRABills: res.createdRABills,
    };
  };

  const manuallyTriggerBillingMilestone = (
    projectId: string,
    milestoneId: string,
    notes: string = 'Manual trigger',
    performedBy: string = 'Project Director'
  ) => {
    const project = (state.projects || []).find((p) => p.id === projectId);
    if (!project) return { success: false, error: 'Project not found' };

    const res = triggerProjectBillingEvaluation(projectId, {
      eventType: 'MANUAL_TRIGGER',
      milestoneId,
      notes,
      performedBy,
    });

    if (res.createdRABills.length > 0) {
      return { success: true };
    }
    return { success: false, error: 'Milestone could not be triggered or RA Bill already exists' };
  };

  const reopenClientRABill = (billId: string, reason: string, performedBy: string = 'Finance Manager') => {
    const bill = (state.clientRABills || []).find((b) => b.id === billId || b.billNumber === billId);
    if (!bill) return { success: false, error: 'Client RA Bill not found' };
    if (!reason || !reason.trim()) return { success: false, error: 'Reopen reason is mandatory' };

    if ((bill.paidAmount || 0) > 0 || (bill.paymentHistory && bill.paymentHistory.length > 0)) {
      return { success: false, error: 'Payments have already been received against this bill. Reverse receipts before reopening.' };
    }

    const newLogs = [
      ...(bill.auditLog || []),
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: performedBy,
        action: 'Reopened Bill',
        details: `Reopened to Pending Approval. Reason: ${reason}`,
      },
    ];

    updateItem('clientRABills', bill.id, {
      billStatus: 'Pending Approval',
      paymentStatus: 'Not Started',
      reopenedBy: performedBy,
      reopenedAt: new Date().toISOString(),
      reopenReason: reason,
      auditLog: newLogs,
    });

    logAudit({
      documentType: 'client_ra_bill',
      documentId: bill.id,
      documentNumber: bill.billNumber,
      action: 'REOPENED',
      performedBy,
      newStatus: 'Pending Approval',
      details: `Reopened Client RA Bill ${bill.billNumber} back to Pending Approval. Reason: ${reason}`,
    });

    return { success: true };
  };

  // Stage 4 Store Action: Approve Subcontractor WIP & Update WO Progress
  const approveSubcontractorWIP = (
    wipId: string,
    approvedLines: Array<{ itemId: string; approvedQty: number; approvedValue?: number }>,
    performedBy: string = 'Project Director'
  ) => {
    const allWips = state.subcontractorWIPs || state.wips || [];
    const wip = allWips.find((w) => w.id === wipId || w.wipNumber === wipId);
    if (!wip) {
      return { success: false, error: 'WIP record not found.' };
    }

    // Update WIP items with approved quantities
    const updatedItems = (wip.items || []).map((item: any) => {
      const match = approvedLines.find((al) => al.itemId === item.id || al.itemId === item.woItemId || al.itemId === item.boqLineId);
      const appQty = match ? match.approvedQty : Number(item.approvedQty ?? item.measuredQty ?? item.claimedQty ?? 0);
      const rate = Number(item.rate || 0);
      const appVal = match?.approvedValue ?? appQty * rate;
      return {
        ...item,
        approvedQty: appQty,
        approvedValue: appVal,
      };
    });

    const totalApprovedVal = updatedItems.reduce((sum: number, i: any) => sum + (Number(i.approvedValue) || 0), 0);

    const patch: Partial<SubcontractorWIP> = {
      status: 'approved',
      items: updatedItems,
      totalApprovedValue: totalApprovedVal,
    };

    updateItem('wips', wip.id, patch);
    updateItem('subcontractorWIPs', wip.id, patch);

    // Update parent Work Order status to in_progress or completed
    const wo = (state.subcontractWorkOrders || []).find((w) => w.id === wip.workOrderId || w.documentNumber === wip.woNumber);
    if (wo && (wo.status === 'approved' || wo.status === 'issued' || wo.status === 'work_started')) {
      updateItem('subcontractWorkOrders', wo.id, { status: 'in_progress' });
      updateItem('workOrders', wo.id, { status: 'in_progress' });
    }

    // Auto-generate Subcontractor Bill for certified WIP
    try {
      ensureSubcontractorBillForWIP(wip.id, performedBy);
    } catch (e) {
      console.error('Auto bill creation error:', e);
    }

    logAudit({
      documentType: 'wip',
      documentId: wip.id,
      documentNumber: wip.wipNumber || wip.documentNumber,
      action: 'APPROVED',
      performedBy,
      newStatus: 'approved',
      details: `Approved Subcontractor WIP ${wip.wipNumber || wip.documentNumber} for Work Order ${wip.woNumber}. Approved Value: ₹${totalApprovedVal.toLocaleString('en-IN')}`,
    });

    return { success: true, wip: { ...wip, ...patch } };
  };

  // Stage 4 Store Action: Reject Subcontractor WIP
  const rejectSubcontractorWIP = (wipId: string, reason: string = '', performedBy: string = 'Approver') => {
    const allWips = state.subcontractorWIPs || state.wips || [];
    const wip = allWips.find((w) => w.id === wipId || w.wipNumber === wipId);
    if (!wip) {
      return { success: false, error: 'WIP record not found.' };
    }

    const patch: Partial<SubcontractorWIP> = {
      status: 'rejected',
      remarks: reason ? `Rejected: ${reason}` : wip.remarks,
    };

    updateItem('wips', wip.id, patch);
    updateItem('subcontractorWIPs', wip.id, patch);

    logAudit({
      documentType: 'wip',
      documentId: wip.id,
      documentNumber: wip.wipNumber || wip.documentNumber,
      action: 'REJECTED',
      performedBy,
      newStatus: 'rejected',
      details: `Rejected Subcontractor WIP ${wip.wipNumber || wip.documentNumber}. Reason: ${reason || 'None provided'}`,
    });

    return { success: true };
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

  // Stage 4 Store Action: Record GRN Payment
  const recordGRNPayment = (paymentInput: any, performedBy: string = 'Accounts Officer') => {
    const grn = (state.goodsReceipts || []).find((g) => g.id === paymentInput.grnId || g.grnNumber === paymentInput.grnId);
    if (!grn) {
      return { success: false, error: 'Goods Receipt Note not found' };
    }

    const po = (state.purchaseOrders || []).find((p) => p.id === grn.poId || p.poNumber === grn.poNumber || p.documentNumber === grn.poNumber);
    const poLine = po && (po as any).lines && (po as any).lines.length > 0 ? (po as any).lines[0] : null;
    const firstItem = (grn.items && grn.items.length > 0) ? grn.items[0] : null;
    const rate = grn.poUnitRate ?? firstItem?.poUnitRate ?? firstItem?.unitRate ?? (poLine ? Number(poLine.unitRate ?? poLine.finalRate ?? poLine.basicRate ?? 0) : 0);
    const acceptedQty = grn.acceptedQty ?? firstItem?.qcApprovedQty ?? 0;
    const baseVal = grn.baseAcceptedValue ?? (acceptedQty * rate);
    const taxVal = grn.taxAmount ?? (baseVal * 0.18);
    const netPayable = grn.netPayable ?? (baseVal + taxVal);

    const existingPayments = (state.grnPayments || []).filter((p) => p.grnId === grn.id || p.grnId === grn.grnNumber);
    const alreadyPaid = existingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstanding = Math.max(0, Math.round((netPayable - alreadyPaid) * 100) / 100);

    const paymentAmt = Number(paymentInput.amount);
    if (isNaN(paymentAmt) || paymentAmt <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero.' };
    }

    if (paymentAmt > outstanding + 0.01) {
      return { success: false, error: `Payment amount cannot exceed the outstanding amount of ₹${outstanding.toLocaleString('en-IN')}.` };
    }

    const payCount = (state.grnPayments || []).length + 1;
    const paymentNumber = `PAY-2026-${String(payCount).padStart(3, '0')}`;
    const newPayment: GRNPayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      paymentNumber,
      grnId: grn.id,
      vendorId: grn.vendorId || po?.vendorId || '',
      poId: grn.poId || po?.id || '',
      paymentDate: paymentInput.paymentDate || new Date().toISOString().split('T')[0],
      amount: paymentAmt,
      paymentMode: paymentInput.paymentMode || 'Bank Transfer',
      referenceNumber: paymentInput.referenceNumber || '',
      bankAccountId: paymentInput.bankAccountId || '',
      remarks: paymentInput.remarks || '',
      createdAt: new Date().toISOString(),
      createdBy: performedBy,
    };

    addItem('grnPayments', newPayment);

    // Update GRN cumulative payment status and outstanding
    const totalPaidAfter = Math.round((alreadyPaid + paymentAmt) * 100) / 100;
    const newOutstanding = Math.max(0, Math.round((netPayable - totalPaidAfter) * 100) / 100);

    let newPaymentStatus = 'Partially Paid';
    if (totalPaidAfter >= netPayable - 0.01) {
      newPaymentStatus = 'Paid';
    } else if (totalPaidAfter === 0) {
      newPaymentStatus = 'Payment Pending';
    }

    updateItem('goodsReceipts', grn.id, {
      netPayable,
      paidAmount: totalPaidAfter,
      outstandingAmount: newOutstanding,
      paymentStatus: newPaymentStatus,
      updatedAt: new Date().toISOString(),
    });

    // Token Activity Log update if token linked
    if (grn.tokenId) {
      const token = (state.materialEntryTokens || []).find((t) => t.id === grn.tokenId || t.tokenNumber === grn.tokenId);
      if (token) {
        addTokenActivity({
          tokenId: token.id,
          tokenNumber: token.tokenNumber,
          eventType: 'GRN_GENERATED',
          userName: performedBy,
          title: `GRN Payment Recorded (${paymentNumber})`,
          description: `Recorded payment ${paymentNumber} of ₹${paymentAmt.toLocaleString('en-IN')} (${paymentInput.paymentMode}). Total Paid: ₹${totalPaidAfter.toLocaleString('en-IN')}, Outstanding: ₹${newOutstanding.toLocaleString('en-IN')}`,
          referenceType: 'GRN',
          referenceId: grn.id,
        });
      }
    }

    logAudit({
      documentType: 'grn' as any,
      documentId: grn.id,
      documentNumber: grn.grnNumber || grn.id,
      action: 'PAYMENT_RECORDED',
      performedBy,
      newStatus: newPaymentStatus,
      details: `Recorded ${paymentInput.paymentMode} payment ${paymentNumber} of ₹${paymentAmt.toLocaleString('en-IN')} against GRN ${grn.grnNumber}`,
    });

    return { success: true, payment: newPayment };
  };

  // Vendor AP Store Action: Generate Next AP Number
  const generateNextAPNumber = (aps: VendorAP[] = []): string => {
    const currentYear = new Date().getFullYear();
    let maxSeq = 0;
    aps.forEach((ap) => {
      const apNum = ap.apNumber || '';
      const match = apNum.match(/AP[/-](\d{4})[/-](\d+)/i) || apNum.match(/AP[/-](\d+)/i);
      if (match) {
        const seqStr = match[2] || match[1];
        const seq = parseInt(seqStr, 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
    const nextSeq = String(maxSeq + 1).padStart(3, '0');
    return `AP/${currentYear}/${nextSeq}`;
  };

  // Vendor AP Store Action: Idempotent AP Auto-Creation from GRN
  const ensureAPForGRN = (grn: GoodsReceipt | GoodsReceivedNote | any, performedBy: string = 'System Engine'): VendorAP => {
    const existingAPs = state.vendorAPs || [];
    const existing = existingAPs.find((a) => a.grnId === grn.id || a.grnNumber === grn.grnNumber);
    if (existing) {
      return existing;
    }

    const po = (state.purchaseOrders || []).find((p) => p.id === grn.poId || p.poNumber === grn.poNumber || p.documentNumber === grn.poNumber);
    const firstItem = (grn.items && grn.items.length > 0) ? grn.items[0] : null;
    const poLine = po && (po as any).lines && (po as any).lines.length > 0 ? (po as any).lines[0] : null;
    const rate = grn.poUnitRate ?? firstItem?.poUnitRate ?? firstItem?.unitRate ?? (poLine ? Number(poLine.unitRate ?? poLine.finalRate ?? poLine.basicRate ?? 0) : 0);
    const acceptedQty = grn.acceptedQty ?? firstItem?.qcApprovedQty ?? 0;
    const baseVal = grn.baseAcceptedValue ?? (acceptedQty * rate);
    const taxVal = grn.taxAmount ?? (baseVal * 0.18);
    const netPayable = grn.netPayable ?? (baseVal + taxVal);

    let dueDate = grn.dueDate || 'Not Set';
    if (!dueDate || dueDate === 'Not Set') {
      const grnDateStr = grn.grnDate || grn.receivedDate || new Date().toISOString().split('T')[0];
      const pTerms = (po as any)?.paymentTerms || (po as any)?.paymentTermsDays;
      const termDays = pTerms ? parseInt(String(pTerms), 10) : 30;
      const d = new Date(grnDateStr);
      d.setDate(d.getDate() + (isNaN(termDays) ? 30 : termDays));
      dueDate = d.toISOString().split('T')[0];
    }

    const newAPNumber = generateNextAPNumber(existingAPs);
    const now = new Date().toISOString();
    const apDate = grn.grnDate || now.split('T')[0];

    const newAP: VendorAP = {
      id: `ap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      apNumber: newAPNumber,
      grnId: grn.id,
      grnNumber: grn.grnNumber || grn.documentNumber || `REC/${grn.id}`,
      poId: grn.poId || po?.id,
      poNumber: grn.poNumber || po?.documentNumber || po?.poNumber,
      vendorId: grn.vendorId || po?.vendorId || 'v-001',
      vendorName: grn.vendorName || po?.vendorName || 'Vendor',
      projectId: grn.projectId || po?.projectId || 'PRJ-2026-001',
      projectName: grn.projectName || po?.projectName || 'Project',
      qcId: grn.qcId,
      qcNumber: grn.qcNumber || grn.tokenNumber,
      invoiceNumber: grn.supplierChallanNumber || grn.invoiceNumber || 'INV-001',
      invoiceDate: apDate,
      grnDate: apDate,
      apDate: apDate,
      dueDate,
      acceptedQty,
      netPayable: Math.round(netPayable * 100) / 100,
      paidAmount: 0,
      outstandingAmount: Math.round(netPayable * 100) / 100,
      apStatus: 'Pending Approval',
      paymentStatus: 'Not Started',
      paymentHistory: [],
      createdAt: now,
      createdBy: performedBy,
    };

    addItem('vendorAPs', newAP);

    logAudit({
      documentType: 'vendor_ap' as any,
      documentId: newAP.id,
      documentNumber: newAP.apNumber,
      action: 'CREATED',
      performedBy,
      newStatus: 'Pending Approval',
      details: `Vendor AP ${newAP.apNumber} created automatically from GRN ${newAP.grnNumber} for ₹${netPayable.toLocaleString('en-IN')}`,
    });

    return newAP;
  };

  // Vendor AP Store Action: Approve AP
  const approveVendorAP = (apId: string, performedBy: string = 'Finance Manager') => {
    const ap = (state.vendorAPs || []).find((a) => a.id === apId || a.apNumber === apId);
    if (!ap) return { success: false, error: 'Vendor AP record not found.' };

    const now = new Date().toISOString();
    const patch: Partial<VendorAP> = {
      apStatus: 'Approved',
      paymentStatus: ap.paidAmount > 0 ? (ap.outstandingAmount <= 0 ? 'Paid' : 'Partially Paid') : 'Payment Pending',
      approvedBy: performedBy,
      approvedAt: now,
      updatedAt: now,
    };

    updateItem('vendorAPs', ap.id, patch);

    logAudit({
      documentType: 'vendor_ap' as any,
      documentId: ap.id,
      documentNumber: ap.apNumber,
      action: 'APPROVED',
      performedBy,
      newStatus: 'Approved',
      details: `Vendor AP ${ap.apNumber} approved by ${performedBy}`,
    });

    return { success: true };
  };

  // Vendor AP Store Action: Reject AP (Mandatory Rejection Reason)
  const rejectVendorAP = (apId: string, reason: string, performedBy: string = 'Finance Manager') => {
    if (!reason || !reason.trim()) {
      return { success: false, error: 'Rejection reason is mandatory.' };
    }

    const ap = (state.vendorAPs || []).find((a) => a.id === apId || a.apNumber === apId);
    if (!ap) return { success: false, error: 'Vendor AP record not found.' };

    const now = new Date().toISOString();
    const patch: Partial<VendorAP> = {
      apStatus: 'Rejected',
      paymentStatus: 'Not Started',
      rejectedBy: performedBy,
      rejectedAt: now,
      rejectionReason: reason,
      updatedAt: now,
    };

    updateItem('vendorAPs', ap.id, patch);

    logAudit({
      documentType: 'vendor_ap' as any,
      documentId: ap.id,
      documentNumber: ap.apNumber,
      action: 'REJECTED',
      performedBy,
      newStatus: 'Rejected',
      details: `Vendor AP ${ap.apNumber} rejected by ${performedBy}. Reason: ${reason}`,
    });

    return { success: true };
  };

  // Vendor AP Store Action: Record AP Payment (Locked until Approved)
  const recordVendorAPPayment = (
    apId: string,
    paymentInput: {
      paymentDate: string;
      amountPaid: number;
      paymentMethod: string;
      paymentReference: string;
      payingBankAccount?: string;
      remarks?: string;
    },
    performedBy: string = 'Finance Manager'
  ) => {
    const ap = (state.vendorAPs || []).find((a) => a.id === apId || a.apNumber === apId);
    if (!ap) return { success: false, error: 'Vendor AP record not found.' };

    if (ap.apStatus !== 'Approved') {
      return { success: false, error: 'Payment is locked until Accounts Payable (AP) status is Approved.' };
    }

    const amountPaid = Number(paymentInput.amountPaid);
    if (isNaN(amountPaid) || amountPaid <= 0) {
      return { success: false, error: 'Payment amount must be greater than 0.' };
    }

    if (amountPaid > (ap.outstandingAmount || 0) + 0.01) {
      return {
        success: false,
        error: `Payment amount (₹${amountPaid}) cannot exceed current outstanding balance (₹${ap.outstandingAmount}).`,
      };
    }

    const now = new Date().toISOString();
    const paymentNum = `PAY/${new Date().getFullYear()}/${String(((ap.paymentHistory || []).length || 0) + 1).padStart(3, '0')}`;

    const paymentRecord: APPaymentRecord = {
      id: `pay-ap-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      paymentNumber: paymentNum,
      apId: ap.id,
      grnId: ap.grnId,
      paymentDate: paymentInput.paymentDate || now.split('T')[0],
      amountPaid,
      paymentMethod: paymentInput.paymentMethod,
      paymentReference: paymentInput.paymentReference,
      payingBankAccount: paymentInput.payingBankAccount,
      remarks: paymentInput.remarks,
      recordedBy: performedBy,
      createdAt: now,
    };

    const newPaidAmount = Math.round(((ap.paidAmount || 0) + amountPaid) * 100) / 100;
    const newOutstandingAmount = Math.max(0, Math.round(((ap.netPayable || 0) - newPaidAmount) * 100) / 100);
    const newPaymentStatus: APPaymentStatus = newOutstandingAmount <= 0.01 ? 'Paid' : 'Partially Paid';

    const updatedHistory = [...(ap.paymentHistory || []), paymentRecord];

    const patch: Partial<VendorAP> = {
      paidAmount: newPaidAmount,
      outstandingAmount: newOutstandingAmount,
      paymentStatus: newPaymentStatus,
      paymentHistory: updatedHistory,
      updatedAt: now,
    };

    updateItem('vendorAPs', ap.id, patch);

    logAudit({
      documentType: 'vendor_ap' as any,
      documentId: ap.id,
      documentNumber: ap.apNumber,
      action: 'PAYMENT_RECORDED',
      performedBy,
      newStatus: newPaymentStatus,
      details: `Recorded vendor payment of ₹${amountPaid.toLocaleString('en-IN')} for AP ${ap.apNumber} (${paymentRecord.paymentNumber}). Outstanding: ₹${newOutstandingAmount.toLocaleString('en-IN')}`,
    });

    return { success: true };
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

  const resetDemoData = async () => {
    const backupData = {
      clients: state.clients || [],
      enquiries: state.enquiries || [],
      estimates: state.estimates || [],
      projectSetupDrafts: state.projectSetupDrafts || [],
      projects: state.projects || [],
      indents: state.indents || [],
      rfqs: state.rfqs || [],
      purchaseOrders: state.purchaseOrders || [],
    };
    localStorage.setItem('flutebyte_demo_backup_v4', JSON.stringify(backupData));
    await repository.resetToDefaults(CANONICAL_SEED_DATA);
    localStorage.setItem('flutebyte_demo_seed_version', 'v4');
    const fresh = await repository.loadAll();
    const activeIndents = fresh.materialIndents?.length ? fresh.materialIndents : fresh.indents || [];
    setState({
      ...fresh,
      indents: activeIndents,
      materialIndents: activeIndents,
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).resetDemoData = resetDemoData;
    }
  }, [resetDemoData]);

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
        cancelMaterialIndent,
        createRFQ,
        updateRFQStatus,
        submitVendorQuotation,
        awardRateComparison,
        createDirectPurchase,
        approveDirectPurchase,
        createPurchaseOrder,
        updatePOStatus,
        approvePurchaseOrder,
        rejectPurchaseOrder,
        cancelPurchaseOrder,
        addPODelivery,
        createMaterialEntryToken,
        holdMaterialToken,
        resumeMaterialToken,
        cancelMaterialToken,
        createMaterialReceivingCheck,
        completeQCInspection,
        approveAdminQC,
        addTokenActivity,
        isAwaitingReceiving,
        isAwaitingQC,
        createGRN,
        inspectGRN,
        approveGRN,
        postGRNToStock,
        getStockBalance,
        getPerLocationStock,
        createMaterialIssue,
        dispatchMaterialIssue,
        recordSiteReceipt,
        cancelMaterialIssue,
        createMaterialReturn,
        createMaterialConsumption,
        createSubcontractorWorkOrder,
        updateSubcontractWorkOrder,
        createWIPEntry,
        approveSubcontractorWIP,
        rejectSubcontractorWIP,
        createSubcontractWIP: (wip: SubcontractorWIP, _performedBy?: string) => {
          updateItem('subcontractorWIPs', wip.id, wip);
          addItem('subcontractorWIPs', wip);
          return { success: true, wip };
        },
        updateSubcontractWIPStatus: (wipId: string, status: string, _performedBy?: string) => {
          updateItem('subcontractorWIPs', wipId, { status } as any);
        },
        certifyWIP,
        ensureSubcontractorBillForWIP,
        approveSubcontractorBill,
        rejectSubcontractorBill,
        reopenSubcontractorBill,
        editSubcontractorBill,
        recordSubcontractorPayment,
        recordGRNPayment,
        createSubcontractorBill: (bill: any, _performedBy?: string) => {
          addItem('subcontractorBills', bill);
          return { success: true };
        },
        updateSubcontractorBillStatus: (billId: string, status: string, _performedBy?: string) => {
          updateItem('subcontractorBills', billId, { status } as any);
        },
        ensureAPForGRN,
        approveVendorAP,
        rejectVendorAP,
        recordVendorAPPayment,
        createClientRABill,
        editClientRABill,
        submitClientRABillForApproval,
        approveClientRABill,
        rejectClientRABill,
        markClientRABillSent,
        recordClientPayment,
        reopenClientRABill,
        triggerProjectBillingEvaluation,
        manuallyTriggerBillingMilestone,
        createCategory,
        updateCategory,
        deactivateCategory,
        reactivateCategory,
        addProjectCategory,
        addPropertyType,
        logAudit,
        resetToDefaults,
        resetDemoData,
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
