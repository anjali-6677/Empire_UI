/**
 * Canonical Domain Model Types for Empire Interior ERP
 * Location: src/domain/types.ts
 */

export type DocumentStatus =
  // Enquiry
  | 'new' | 'estimating' | 'submitted' | 'won' | 'lost'
  // Estimate
  | 'draft' | 'costing' | 'ready_for_review' | 'submitted' | 'revision_requested' | 'accepted' | 'rejected' | 'superseded'
  // Project
  | 'active' | 'on_hold' | 'completed' | 'closed'
  // Indent
  | 'approval_required' | 'approved' | 'sourcing' | 'partially_ordered' | 'fully_ordered' | 'converted' | 'withdrawn' | 'returned_for_revision'
  // RFQ
  | 'issued' | 'quotes_received' | 'compared' | 'awarded' | 'cancelled' | 'po_issued'
  // GRN
  | 'qc_pending' | 'partially_accepted' | 'posted'
  // WIP
  | 'partially_certified' | 'certified'
  // Invoice / Payment / Bill / RA Bill
  | 'matching' | 'partially_paid' | 'paid' | 'partially_received' | 'received';

// ==========================================
// CENTRAL WORKFLOW STATUS UNIONS & OBJECTS
// ==========================================
export type RFQStatus = 'draft' | 'issued' | 'quotes_received' | 'evaluated' | 'compared' | 'awarded' | 'cancelled' | 'closed';
export type VendorQuotationStatus = 'draft' | 'submitted' | 'evaluated' | 'selected' | 'rejected' | 'superseded';
export type ComparisonStatus = 'draft' | 'in_review' | 'awarded' | 'rejected';
export type DirectPurchaseStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'po_issued' | 'converted_to_po' | 'cancelled';
export type POStatus = 'draft' | 'pending_approval' | 'approved' | 'issued' | 'partially_delivered' | 'partially_received' | 'fully_received' | 'fully_delivered' | 'closed' | 'cancelled';
export type PurchaseOrderStatus = POStatus;

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  roleRequired: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  actionDate?: string;
  comments?: string;
}

export interface ActivityEntry {
  id: string;
  entityId: string;
  entityType: 'indent' | 'rfq' | 'quotation' | 'comparison' | 'direct_purchase' | 'purchase_order';
  action: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  notes?: string;
}

// ==========================================
// 1. MASTER DATA
// ==========================================

export interface PricingFactor {
  id: string;
  code: string;
  name: string;
  calculationType: 'percentage' | 'fixed';
  defaultValue: number; // percentage (e.g. 5 for 5%) or fixed amount
  basis: 'baseCost' | 'materialCost' | 'laborCost' | 'subtotal';
  isActive: boolean;
  effectiveDate: string;
  displayOrder: number;
}

export interface ParentGroup {
  id: string;
  code?: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentGroupId?: string;
  parentCategoryId?: string;
  parentGroupName?: string;
  defaultFactorIds?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Product {
  id: string;
  code: string;
  productCode?: string;
  name: string;
  categoryId: string;
  unitId: string;
  unitSymbol: string;
  basePrice: number;
  basePriceEffectiveDate: string;
  brand?: string;
  specification?: string;
  vendorIds?: string[];
  preferredVendorIds?: string[];
  primaryPreferredVendorId?: string;
  lastPurchaseRate?: number;
  lastPurchaseDate?: string;
  priceHistory?: Array<{ price: number; effectiveDate: string; sourcePoId?: string }>;
  isActive: boolean;
}

export interface RawMaterial extends Product {}

export interface Unit {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

export interface VendorComplianceStatus {
  status: 'compliant' | 'non_compliant' | 'pending_review';
  gstVerified?: boolean;
  panVerified?: boolean;
  msmeVerified?: boolean;
  lastAuditedDate?: string;
}

export interface Vendor {
  id: string;
  code: string;
  vendorCode?: string;
  subcontractorCode?: string;
  name: string;
  companyName?: string;
  legalName?: string;
  displayName?: string;
  vendorType?: 'vendor' | 'subcontractor' | 'both';
  category: string;
  workCategories?: string[];
  approvedCategoryIds?: string[];
  preferredCategoryIds?: string[];
  complianceStatus?: VendorComplianceStatus | string;
  active?: boolean;
  blocked?: boolean;
  gstin: string;
  pan?: string;
  city: string;
  state?: string;
  address?: string;
  contactPerson: string;
  phone: string;
  email: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  paymentTerms?: string;
  bankAccountId?: string;
  rating?: string;
  paymentTermsDays?: number;
  status: 'empanelled' | 'blacklisted' | 'pending' | 'active' | 'inactive';
}

export interface Subcontractor {
  id: string;
  code: string;
  name: string;
  tradeCategory: string; // Carpentry, Electrical, Plumbing, Painting, Civil
  trade?: string; // trade alias
  gstin: string;
  pan?: string;
  city?: string;
  state?: string;
  contactPerson: string;
  phone: string;
  email: string;
  rating?: string;
  retentionPercentage?: number;
  labourCapacity?: number;
  rateType?: string;
  status: 'empanelled' | 'blacklisted' | 'pending' | 'active' | 'inactive';
}

export interface Client {
  id: string;
  code: string;
  name: string;
  companyName: string;
  type?: string; // Corporate, Real Estate Developer, Individual Owner, Government / PSU, Architect / PMC
  gstin: string;
  city: string;
  state?: string;
  address?: string;
  contactPerson: string;
  phone: string;
  email: string;
  paymentTermsDays?: number;
  isActive?: boolean;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  designationId: string;
  email: string;
  phone: string;
  roleId: string;
  joiningDate: string;
  status: 'active' | 'inactive';
}

export interface Role {
  id: string;
  roleId: string; // e.g. ROLE-ESTIMATOR
  name: string; // Estimator, Project Director, Project Supervisor, Procurement Officer, Store Officer, Accounts Officer, Management, Viewer
  description: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
}

export interface ApprovalRule {
  id: string;
  documentType: 'indent' | 'rfq' | 'po' | 'work_order' | 'grn' | 'wip' | 'invoice' | 'payment' | 'ra_bill';
  minAmount?: number;
  maxAmount?: number;
  requiresOverLimitApproval?: boolean;
  approverRoleIds: string[];
}

// ==========================================
// 2. CRM AND ESTIMATION
// ==========================================

export type CRMEnquiryStatus =
  | 'new'
  | 'estimating'
  | 'quotation_ready'
  | 'sent_to_client'
  | 'revision_requested'
  | 'won'
  | 'lost'
  | 'cancelled';

export type CRMEstimateStatus =
  | 'draft'
  | 'quotation_ready'
  | 'sent_to_client'
  | 'revision_requested'
  | 'accepted'
  | 'rejected'
  | 'superseded';

export interface CRMActivity {
  id: string;
  enquiryId: string;
  estimateId?: string;
  action: string;
  user: string;
  timestamp: string;
  comment?: string;
  oldStatus?: string;
  newStatus?: string;
}

export interface EnquiryDocument {
  id: string;
  name: string;
  size?: string;
  category?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  enquiryDate: string;
  clientId: string;
  clientName: string;
  projectRequirement: string;
  projectType: string;
  propertyType: string;
  location: string;
  approximateArea?: number;
  areaUnit?: string;
  expectedStartDate?: string;
  expectedBudget: number;
  assignedEstimatorId: string;
  assignedEstimatorName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  leadSource?: string;
  requirementNotes?: string;
  status: CRMEnquiryStatus;
  currentEstimateId?: string;
  estimateIds: string[];
  documents?: EnquiryDocument[];
  activities?: CRMActivity[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PricingFactorMaster {
  id: string;
  name: string;
  calculationType: 'percentage' | 'fixed';
  companyDefaultValue: number;
  isActive: boolean;
  lastUpdated: string;
}

export interface PricingFactor {
  id: string;
  name: string;
  calculationType: 'percentage' | 'fixed';
  companyDefaultValue: number;
  estimateValue: number;
  amount: number;
  overridden: boolean;
  overrideReason?: string;
}

export interface BOQItem {
  id: string;
  itemType: 'material' | 'labour' | 'service' | 'custom';
  categoryId: string;
  categoryName: string;
  productId?: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  baseRate: number;
  materialCost: number;
  labourCost: number;
  installationCost: number;
  otherCost: number;
  totalCost: number;
  remarks?: string;
}

export interface BOQSection {
  id: string;
  name: string;
  sortOrder: number;
  items: BOQItem[];
}

export interface ScheduleItem {
  id: string;
  workSection: string;
  description: string;
  startAfterDays: number;
  duration: number;
  durationUnit: 'days' | 'weeks';
  expectedStart: string;
  expectedCompletion: string;
  remarks?: string;
}

export interface PaymentStage {
  id: string;
  stageName: string;
  description: string;
  percentage: number;
  amount: number;
  dueCondition: string;
}

export interface ClientDecision {
  decision: 'accepted' | 'revision_requested' | 'rejected';
  decisionDate: string;
  acceptedBy?: string;
  comment?: string;
  lostReason?: string;
  competitorName?: string;
  competitorPrice?: number;
  requestedChanges?: string;
  acceptedValue?: number;
  clientPoNumber?: string;
  clientPoFile?: string;
}

export interface CostSummary {
  baseBOQCost: number;
  materialCostSum: number;
  lineLabourSum: number;
  lineInstallationSum: number;
  wastageAmount: number;
  transportationAmount: number;
  miscellaneousAmount: number;
  overheadAmount: number;
  subtotalBeforeProfit: number;
  discountAmount: number;
  profitAmount: number;
  profitPercentage: number;
  taxableAmount: number;
  gstAmount: number;
  finalQuotationValue: number;
  internalTotalCost: number;
}

export interface Estimate {
  id: string;
  enquiryId: string;
  clientId?: string;
  clientName?: string;
  estimateNumber?: string;
  quotationNumber: string;
  revisionNumber: number;
  revisionLabel: string;
  status: CRMEstimateStatus;
  boqSections: BOQSection[];
  pricingFactors: PricingFactor[];
  isCustomPricing: boolean;
  overrideReason?: string;
  costSummary: CostSummary;
  schedule: ScheduleItem[];
  paymentTerms: PaymentStage[];
  commercialNotes?: string;
  termsAndConditions?: string;
  finalQuotationValue: number;
  sentDetails?: {
    sentDate: string;
    deliveryMethod: 'email' | 'whatsapp' | 'manual';
    sentBy: string;
  };
  clientDecision?: ClientDecision;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface TenderDecision {
  id: string;
  documentNumber: string;
  enquiryId: string;
  estimateId: string;
  estimateVersionId: string;
  outcome: 'accepted' | 'rejected' | 'revised';
  decisionDate: string;
  clientReferenceNo?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  acceptedValue?: number;
  recordedBy: string;
  createdAt: string;
}

// ==========================================
// 3. PROJECTS AND PLANNING
// ==========================================

export interface ProjectTeamAssignment {
  employeeId: string;
  employeeName: string;
  role: 'Project Director' | 'Project Supervisor' | 'Billing Engineer' | 'Site Engineer' | 'Procurement Lead';
  assignedDate: string;
}

export interface ProjectBOQLine {
  id: string;
  estimateLineId?: string;
  lineNo: number;
  itemDescription: string;
  categoryId: string;
  categoryName: string;
  unitSymbol: string;
  boqQuantity: number;
  boqRate: number;
  boqAmount: number;
  indentedQuantity: number;
  orderedQuantity: number;
  receivedQuantity: number;
  issuedQuantity: number;
  remainingQuantity: number;
  committedCost: number;
  actualCost: number;
  variance: number;
  specifications?: string;
  productId?: string;
}

export interface ProjectBOQ {
  id: string;
  projectId: string;
  originalEstimateVersionId: string;
  lines: ProjectBOQLine[];
  totalBOQValue: number;
  lockedAt: string;
  lockedBy: string;
}

export interface ProjectScheduleActivity {
  id: string;
  projectId?: string;
  activityName: string;
  startDate: string;
  endDate: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  responsibleEmployeeId: string;
  responsibleEmployeeName: string;
  completionPercentage: number;
  progressPercentage?: number;
  milestoneId?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  delayDays: number;
  remarks?: string;
}

export interface ProjectMilestone {
  id: string;
  projectId?: string;
  milestoneName: string;
  targetDate: string;
  billingPercentage: number;
  billingAmount: number;
  amount?: number;
  status: 'pending' | 'reached' | 'billed' | 'completed' | 'certified';
  reachedDate?: string;
}

export type BillingMilestoneTriggerType =
  | 'CONTRACT_EXECUTED'
  | 'MATERIAL_DELIVERY_COMPLETED'
  | 'TRADE_PROGRESS_THRESHOLD'
  | 'OVERALL_PROGRESS_THRESHOLD'
  | 'PROJECT_STAGE_COMPLETED'
  | 'PROJECT_MILESTONE_COMPLETED'
  | 'HANDOVER_SIGNED'
  | 'MANUAL_AUTHORIZED';

export type BillingMilestoneStatus =
  | 'NOT_TRIGGERED'
  | 'TRIGGER_REACHED'
  | 'RA_PENDING_APPROVAL'
  | 'RA_APPROVED'
  | 'SENT_TO_CLIENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED'
  | 'RA_REJECTED';

export interface ProjectBillingMilestone {
  id: string;
  projectId: string;
  name: string;
  triggerType: BillingMilestoneTriggerType;
  triggerDescription: string;
  percentage: number;
  amount: number;
  sequence: number;
  triggeredAt?: string;
  triggeredByEvent?: string;
  billingStatus: BillingMilestoneStatus;
  raBillId?: string;
  raBillNumber?: string;
  tradeName?: string;
  progressThreshold?: number;
  manualOverrideBy?: string;
  manualOverrideReason?: string;
  manualOverrideAt?: string;
}

export type ProjectExecutionStatus = 'draft' | 'draft_setup' | 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'closed';
export type BOQStatus = 'not_uploaded' | 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'revision_requested';

export interface ProjectSetupDraft {
  id: string;
  sourceEnquiryId?: string;
  sourceEstimateId?: string;
  sourceEstimateRevisionId?: string;
  sourceQuotationNumber?: string;
  importedDetails: {
    clientId: string;
    clientName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    gstin?: string;
    billingAddress?: string;
    projectName: string;
    projectCategory?: string;
    propertyType?: string;
    siteAddress: string;
    city: string;
    state?: string;
    pin?: string;
    area?: number;
    areaUnit?: string;
    acceptedQuotationNumber: string;
    acceptedEstimateId: string;
    acceptedRevisionId: string;
    acceptedDate: string;
    acceptedQuotationValue: number;
    clientPoDetails?: {
      poNumber?: string;
      poDate?: string;
      poAmount?: number;
      notes?: string;
    };
    documents?: any[];
    plannedStartDate: string;
    targetCompletionDate: string;
  };
  teamSetup: {
    projectDirectorId: string;
    projectDirectorName: string;
    projectManagerId?: string;
    projectManagerName?: string;
    projectSupervisorId: string;
    projectSupervisorName: string;
    projectHead?: string;
    team: ProjectTeamAssignment[];
    isTeamLocked: boolean;
    lockedAt?: string;
    lockedBy?: string;
  };
  boqLockSetup: {
    isBOQLocked: boolean;
    lockedAt?: string;
    lockedBy?: string;
    sourceEstimateRevisionId?: string;
    uploadedBOQFile?: {
      fileName: string;
      fileSize?: string;
      boqReference?: string;
      comment?: string;
      uploadedBy: string;
      uploadedDate: string;
    };
    boqSource?: 'crm_estimate' | 'manual' | 'uploaded_import';
    lockedProjectBOQ?: {
      id: string;
      sourceEstimateRevisionId: string;
      sections?: BOQSection[];
      lines: ProjectBOQLine[];
      totalBOQValue: number;
    };
  };
  scheduleSetup: {
    activities: ProjectScheduleActivity[];
    isConfigured: boolean;
  };
  setupStatus: 'in_progress' | 'ready_to_activate';
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudgetRow {
  id?: string;
  categoryId: string;
  categoryName: string;
  allocatedBudget?: number;
  budgetAmount?: number;
  thresholdType?: 'percentage' | 'fixed';
  thresholdValue?: number;
  calculatedLimit?: number;
  committedCost?: number;
  actualCost?: number;
  allowOverrun?: boolean;
  remarks?: string;
}

export interface BOQRevision {
  id?: string;
  projectId?: string;
  revisionNumber: number; // 0 = R0, 1 = R1, etc.
  revisionLabel?: string;
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
  uploadedBy: string;
  status: BOQStatus | 'pending' | 'approved' | 'rejected';
  submissionComment?: string;
  comment?: string;
  decisionBy?: string;
  decisionDate?: string;
  decisionComment?: string;
  totalValue?: number;
  totalBOQValue?: number;
  categoryBudgets?: CategoryBudgetRow[];
}

export interface ProjectApprovalConfig {
  id?: string;
  approvalType?: string;
  primaryApproverId?: string;
  primaryApproverName?: string;
  backupApproverId?: string;
  backupApproverName?: string;
  requiredLevel?: 'L1' | 'L2' | 'L3';
  isEnabled?: boolean;
  boqApprovalRequired?: boolean;
  requireDualSignoff?: boolean;
  indentApprovalLimit?: number;
  directPurchaseLimit?: number;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  activityType?: string;
  action?: string;
  description?: string;
  performedBy: string;
  timestamp: string;
  type?: 'boq' | 'status' | 'team' | 'budget' | 'general';
}

export interface ProjectRevision {
  id: string;
  projectId: string;
  revisionNumber: number;
  reason: string;
  approvedBy: string;
  approvedAt: string;
}

export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  companyName?: string;
  category?: string;
  projectType?: string;
  clientId: string;
  clientName: string;
  clientContactPerson?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGstin?: string;
  clientAddress?: string;

  siteId?: string;
  siteCode?: string;
  siteAddress?: string;
  city: string;
  state?: string;
  pincode?: string;
  projectArea?: number;
  projectAreaUnit?: string;
  description?: string;

  projectDirectorId: string;
  projectDirectorName: string;
  projectManagerId?: string;
  projectManagerName?: string;
  projectSupervisorId: string;
  projectSupervisorName: string;
  projectHead?: string;
  team: ProjectTeamAssignment[];
  isTeamLocked: boolean;
  projectTeamLocked?: boolean;
  projectTeamLockedAt?: string;
  projectTeamLockedBy?: string;

  // BOQ & Budgets
  boqId?: string;
  isBOQLocked: boolean;
  projectBOQLocked?: boolean;
  projectBOQLockedAt?: string;
  projectBOQLockedBy?: string;
  lockedProjectBOQ?: {
    id: string;
    sourceEstimateRevisionId?: string;
    sections?: BOQSection[];
    lines: ProjectBOQLine[];
    totalBOQValue: number;
  };
  boqStatus: BOQStatus;
  boqRevisions: BOQRevision[];
  categoryBudgets: CategoryBudgetRow[];
  currentBOQValue: number;
  budgetBaseline: number;
  approvedBudgetLimit: number;
  budgetExceptionComment?: string;
  committedCost: number;
  actualCost: number;
  certifiedRevenue: number;
  clientReceipts: number;

  // Execution & Statuses
  startDate: string;
  targetCompletionDate: string;
  progress: number;
  status: ProjectExecutionStatus;
  projectStatus?: ProjectExecutionStatus;
  boqSource?: 'crm_estimate' | 'manual' | 'uploaded_import';
  scheduleConfigured?: boolean;
  scheduleActivities?: ProjectScheduleActivity[];

  // Approvals & Workflows
  approvalsSetup?: ProjectApprovalConfig | ProjectApprovalConfig[] | any;
  noteToApprover?: string;
  rejectionComment?: string;
  rejectedBy?: string;

  // CRM Traceability & Locked Commercial Baseline
  sourceEnquiryId?: string;
  sourceEstimateId?: string;
  sourceEstimateRevisionId?: string;
  sourceQuotationNumber?: string;
  acceptedQuotationValue?: number;
  internalEstimatedCost?: number;
  materialCost?: number;
  labourCost?: number;
  installationCost?: number;
  overheads?: number;
  expectedMargin?: number;
  acceptedBOQSnapshot?: any[];
  acceptedScheduleSnapshot?: any[];
  paymentTermsSnapshot?: string;
  billingMilestones?: ProjectBillingMilestone[];
  clientPODetails?: {
    poNumber?: string;
    poDate?: string;
    poAmount?: number;
    notes?: string;
  };

  // CRM linkage (legacy optional)
  acceptedEstimateId?: string;
  acceptedEstimateVersionId?: string;

  // Audit & Activity
  activities?: ProjectActivity[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

// ==========================================
// 4. PROCUREMENT
// ==========================================

export type IndentPriority = 'normal' | 'urgent' | 'critical';
export type IndentStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'sent_back'
  | 'cancelled'
  | 'converted';

export interface MaterialIndentItem {
  id: string;
  boqSectionId?: string;
  boqSectionName?: string;
  boqItemId?: string;
  categoryId?: string;
  categoryName?: string;
  productId?: string;
  productName?: string;
  description: string;
  specification?: string;
  unitId?: string;
  unitSymbol: string;
  boqQuantity: number;
  previouslyIndentedQuantity: number;
  previouslyOrderedQuantity: number;
  remainingBOQQuantity: number;
  requestedQuantity: number;
  estimatedRate: number;
  estimatedAmount: number;
  requiredDate?: string;
  remarks?: string;
}

export interface MaterialIndentLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  boqLineId?: string;
  unitSymbol: string;
  acceptedBOQQty: number;
  previouslyIndentedQty: number;
  previouslyOrderedQty: number;
  previouslyReceivedQty: number;
  requestedQty: number;
  availableBOQQty: number;
  isOverLimit: boolean;
  overLimitQty: number;
  estimatedRate: number;
  estimatedTotal: number;
}

export interface MaterialIndentApprovalRecord {
  id: string;
  action: 'submit' | 'approve' | 'reject' | 'send_back' | 'resubmit';
  performedBy: string;
  performedByRole?: string;
  performedAt: string;
  comment?: string;
}

export interface MaterialIndent {
  id: string;
  indentNumber?: string;
  documentNumber?: string;
  projectId: string;
  projectCode?: string;
  projectName: string;
  clientId?: string;
  clientName?: string;
  requestedByEmployeeId?: string;
  requestedByEmployeeName?: string;
  requestDate?: string;
  requiredByDate?: string;
  deliveryLocation?: string;
  priority?: IndentPriority;
  purpose?: string;
  status: IndentStatus | DocumentStatus | string;
  currentApproverId?: string;
  currentApproverName?: string;
  totalEstimatedValue?: number;
  itemCount?: number;
  boqException?: boolean;
  boqExceptionReason?: string;
  budgetException?: boolean;
  budgetExceptionReason?: string;
  items?: MaterialIndentItem[];
  lines?: MaterialIndentLine[];
  procurementRoute?: 'rfq' | 'direct_po' | 'stock_transfer';
  hasOverLimitLines?: boolean;
  overLimitApproved?: boolean;
  overLimitApprovedBy?: string;
  overLimitApprovedAt?: string;
  documents?: Attachment[];
  approvalHistory?: MaterialIndentApprovalRecord[];
  activities?: AuditEvent[];
  convertedRFQIds?: string[];
  convertedPOIds?: string[];
  rfqId?: string;
  poId?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface RFQLine {
  id: string;
  indentLineId: string;
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  quantity: number;
  targetRate?: number;
  targetDeliveryDate?: string;
  remarks?: string;
}

export interface RFQ {
  id: string;
  documentNumber: string;
  indentId: string;
  sourceIndentNumber?: string;
  projectId: string;
  projectName: string;
  invitedVendorIds: string[];
  issueDate: string;
  quoteDueDate: string;
  deliveryLocation: string;
  requiredDate: string;
  commercialTerms?: string;
  specialTerms?: string;
  lines: RFQLine[];
  status: RFQStatus;
  createdAt: string;
  createdBy: string;
}

export interface VendorQuotationLine {
  rfqLineId: string;
  productId: string;
  basicRate: number;
  discountPercentage: number;
  taxPercentage: number;
  freightAmount: number;
  otherCharges: number;
  landedRatePerUnit: number;
  quotedLineTotal: number;
}

export interface VendorQuotation {
  id: string;
  documentNumber: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  quotationDate: string;
  validUntil: string;
  deliveryDays: number;
  paymentTerms: string;
  lines: VendorQuotationLine[];
  totalQuotedLandedAmount: number;
  vendorRating?: string;
  status: 'submitted' | 'evaluated' | 'selected' | 'rejected';
}

export interface RateComparison {
  id: string;
  documentNumber: string;
  rfqId: string;
  projectId: string;
  quotationIds: string[];
  selectedVendorId?: string;
  selectedVendorName?: string;
  selectionRemarks?: string;
  selectedAt?: string;
  selectedBy?: string;
  status: 'draft' | 'compared' | 'awarded';
}

export interface PODeliveryItem {
  poLineId: string;
  productId: string;
  qtyReceived: number;
  remarks?: string;
}

export interface PODeliveryRecord {
  id: string;
  deliveryId: string;
  poId: string;
  deliveryDate: string;
  invoiceNumber: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
  status: 'partial' | 'received';
  items: PODeliveryItem[];
}

export interface PurchaseOrderLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  quantity: number;
  unitPrice?: number;
  unitRate?: number;
  basicRate?: number;
  discountPercentage?: number;
  taxPercentage?: number;
  freightAmount?: number;
  packingCharges?: number;
  labourCharges?: number;
  landedUnitRate?: number;
  lineTotal: number;
  deliveryDate?: string;
  receivedQty?: number;
  invoicedQty?: number;
  indentLineId?: string;
  poLineId?: string;
  unit?: string;
  boqLineId?: string;
  categoryName?: string;
  specifications?: string;
  brand?: string;
}

export type POLine = PurchaseOrderLine;

export interface PurchaseOrder {
  id: string;
  documentNumber: string;
  poNumber?: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  originType?: 'rfq' | 'direct_po';
  rfqId?: string;
  rfqDocumentNumber?: string;
  sourceRFQId?: string;
  sourceIndentNumber?: string;
  sourceIndentId?: string;
  quotationNumber?: string;
  directPurchaseReason?: string;
  validUntil?: string;
  rateValidityDate?: string;
  orderDate: string;
  deliveryDueDate?: string;
  expectedDeliveryDate?: string;
  lines: POLine[];
  subtotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  freightTotal?: number;
  packingTotal?: number;
  labourTotal?: number;
  roundOff?: number;
  totalAmount: number;
  grandTotal?: number;
  currency?: string;
  status: DocumentStatus | POStatus;
  paymentStatus?: 'unpaid' | 'advance_paid' | 'partially_paid' | 'paid';
  deliveryStatus?: 'not_received' | 'partial' | 'received';
  remarks?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  deliveries?: PODeliveryRecord[];
  createdAt: string;
  createdBy: string;
  createdById?: string;
  updatedAt?: string;
  updatedBy?: string;
  nonL1Justification?: string;
  pendingQuoteContinuationReason?: string;
}

export interface DirectPurchaseLine {
  id: string;
  indentLineId?: string;
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  requestedQty: number;
  unitRate: number;
  historicalAvgRate?: number;
  rateVariancePercentage?: number;
  lineTotal: number;
}

export interface DirectPurchase {
  id: string;
  documentNumber: string;
  indentId: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  justificationReason: string;
  lines: DirectPurchaseLine[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  requiresDirectorApproval: boolean;
  status: DirectPurchaseStatus;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface WorkOrderLine {
  id: string;
  boqLineId?: string;
  itemCode?: string;
  scopeDescription: string;
  unitSymbol: string;
  quantity: number;
  rate: number;
  amount: number;
  certifiedQty: number;
}

export interface WorkOrder {
  id: string;
  documentNumber: string;
  projectId: string;
  projectName: string;
  subcontractorId: string;
  subcontractorName: string;
  scopeOverview: string;
  plannedStartDate: string;
  plannedCompletionDate: string;
  retentionPercentage: number;
  taxPercentage: number;
  paymentTerms: string;
  lines: WorkOrderLine[];
  totalAmount: number;
  status: SubcontractorWorkOrderStatus | DocumentStatus;
  createdAt: string;
  createdBy: string;
}

export interface HistoricalRate {
  id: string;
  productId: string;
  vendorId: string;
  vendorName: string;
  purchaseOrderId: string;
  poDate: string;
  unitRate: number;
  landedRate: number;
}

// ==========================================
// 5. INVENTORY AND EXECUTION (STAGE 4 CONNECTED MODELS)
// ==========================================

export type LegacyGRNStatus =
  | 'draft'
  | 'pending_inspection'
  | 'inspected'
  | 'approved'
  | 'posted'
  | 'rejected'
  | 'cancelled';

export type QualityInspectionStatus = 'pending' | 'passed' | 'failed' | 'partial';

export type MaterialIssueStatus =
  | 'Draft'
  | 'Ready to Issue'
  | 'Dispatched'
  | 'Partially Received'
  | 'Received at Site'
  | 'Completed'
  | 'Cancelled'
  | 'draft'
  | 'issued';

export type MaterialReturnStatus = 'draft' | 'approved' | 'completed' | 'cancelled';

export type MaterialConsumptionStatus = 'draft' | 'posted' | 'cancelled';

export type SubcontractorWorkOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'issued'
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'cancelled';

export type WIPEntryStatus = 'draft' | 'submitted' | 'reviewed' | 'certified' | 'rejected';

export type WIPCertificationStatus =
  | 'draft'
  | 'pending_review'
  | 'certified'
  | 'rejected'
  | 'returned';

export interface WarehouseLocation {
  id: string;
  code?: string;
  locationCode?: string;
  name: string;
  projectId?: string;
  type:
    | 'MAIN_WAREHOUSE'
    | 'IN_TRANSIT'
    | 'PROJECT_SITE_STORE'
    | 'OTHER'
    | 'central_store'
    | 'site_store'
    | 'project_work_package'
    | 'subcontractor_yard'
    | string;
  address?: string;
  isActive: boolean;
}

export type StockTransactionType =
  | 'OPENING'
  | 'GRN_RECEIPT'
  | 'MATERIAL_ISSUE'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'SITE_RETURN'
  | 'ADJUSTMENT'
  | 'grn_accepted'
  | 'material_issue'
  | 'material_return'
  | 'material_consumption'
  | 'reversal';

export interface StockLedgerEntry {
  id: string;
  transactionNumber?: string;
  transactionType?: StockTransactionType;
  entryType?: StockTransactionType | string;
  transactionDate?: string;
  transactionTime?: string;
  createdTime?: string;
  entryDate?: string;
  itemId?: string;
  productId: string;
  productCode?: string;
  productName?: string;
  productDescription?: string;
  categoryId?: string;
  categoryName?: string;
  warehouseId?: string;
  warehouseName?: string;
  locationId?: string;
  locationName?: string;
  projectId?: string;
  projectName?: string;
  siteId?: string;
  quantityIn?: number;
  quantityOut?: number;
  inQuantity?: number;
  outQuantity?: number;
  runningBalance: number;
  unit?: string;
  unitSymbol?: string;
  unitRate: number;
  transactionValue?: number;
  totalValue?: number;
  sourceType?: 'GRN' | 'MATERIAL_ISSUE' | 'OPENING' | 'ADJUSTMENT' | 'SITE_RECEIPT' | 'SITE_RETURN' | string;
  sourceId?: string;
  sourceNumber?: string;
  sourceDocumentId?: string;
  sourceDocumentNumber?: string;
  isImmutable?: boolean;
  reversalOfEntryId?: string;
  remarks?: string;
  createdBy?: string;
  recordedBy?: string;
  createdAt?: string;
}

export interface StockBalance {
  locationId: string;
  locationName: string;
  productId: string;
  productCode: string;
  productName: string;
  availableQty: number;
  reservedQty: number;
  totalQty: number;
  unitSymbol: string;
}

export interface MaterialIssueLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  sourceLocationId?: string;
  destinationLocationId?: string;
  availableStockQty?: number;
  requestedQty: number;
  issuedQty: number;
  unitRate?: number;
  boqLineId?: string;
  workActivity?: string;
  remarks?: string;
  notes?: string;
}

export interface MaterialIssue {
  id: string;
  issueNumber: string;
  documentNumber?: string;
  indentId?: string;
  indentNumber?: string;
  projectId: string;
  projectName: string;
  sourceWarehouseId?: string;
  sourceWarehouseName?: string;
  sourceLocationId?: string;
  sourceLocationName?: string;
  destinationStoreId?: string;
  destinationStoreName?: string;
  destinationLocationId?: string;
  destinationAreaName?: string;
  issuedBy?: string;
  requestedBy?: string;
  dispatchedBy?: string;
  dispatchedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  receiverName?: string;
  receivedBySubcontractor?: string;
  subcontractorId?: string;
  requiredByDate?: string;
  issueDate?: string;
  purpose?: string;
  costCode?: string;
  materialRequestId?: string;
  lines?: MaterialIssueLine[] | any[];
  items?: MaterialIssueItem[];
  status: MaterialIssueStatus | any;
  totalIssueValue?: number;
  activityLog?: MaterialIssueActivity[];
  remarks?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface MaterialReturnLine {
  id: string;
  issueLineId?: string;
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  originallyIssuedQty?: number;
  issuedQty?: number;
  previouslyReturnedQty?: number;
  returnedQty: number;
  returnQty?: number;
  reusableQty: number;
  damagedQty?: number;
  scrapQty: number;
  reason?: string;
  remarks?: string;
}

export interface MaterialReturn {
  id: string;
  documentNumber: string;
  originalIssueId: string;
  originalIssueNumber: string;
  projectId: string;
  projectName: string;
  returnDate: string;
  returnedBy: string;
  receivedBy?: string;
  receivedByStorekeeper?: string;
  lines: MaterialReturnLine[];
  status: MaterialReturnStatus;
  reason?: string;
  createdAt: string;
  createdBy: string;
}

export interface MaterialConsumptionLine {
  id: string;
  issueLineId?: string;
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  issuedQty?: number;
  issuedQtyToPackage?: number;
  previouslyAccountedQty?: number;
  consumedQty: number;
  returnedQty?: number;
  wastageQty?: number;
  wastagePercentage?: number;
  accountedQty?: number;
  unaccountedQty?: number;
  unitRate?: number;
  wipReference?: string;
  boqLineId?: string;
  activityDescription?: string;
  remarks?: string;
  notes?: string;
}

export interface MaterialConsumption {
  id: string;
  documentNumber: string;
  projectId: string;
  projectName: string;
  consumptionDate: string;
  scheduleTaskId?: string;
  boqLineId?: string;
  locationId: string;
  locationName: string;
  workPackageId?: string;
  workPackageName?: string;
  lines: MaterialConsumptionLine[];
  status: MaterialConsumptionStatus;
  recordedBy: string;
  createdAt: string;
  createdBy: string;
}

export interface SubcontractorWIPLine {
  id: string;
  workOrderLineId?: string;
  woLineId?: string;
  boqLineId?: string;
  scopeDescription: string;
  unitSymbol: string;
  orderedQty: number;
  previousMeasuredQty: number;
  currentMeasuredQty: number;
  cumulativeMeasuredQty: number;
  balanceQty?: number;
  unitRate?: number;
  contractRate?: number;
  currentMeasuredAmount: number;
  locationArea?: string;
}

export interface SubcontractorWIP {
  id: string;
  wipNumber?: string; // e.g. WIP-2026-001
  documentNumber: string;
  workOrderId: string;
  woNumber: string;
  subcontractorId: string;
  subcontractorName: string;
  projectId: string;
  projectName: string;
  wipDate?: string;
  measurementPeriodStart?: string;
  measurementPeriodEnd?: string;
  measurementDate?: string;
  measuredBy?: string;
  siteEngineerName?: string;
  supervisorName?: string;
  measurementReference?: string;
  remarks?: string;
  measurementNotes?: string;
  items?: SubcontractWIPItem[];
  lines?: SubcontractorWIPLine[];
  totalClaimedValue?: number;
  totalApprovedValue?: number;
  totalMeasuredAmount?: number;
  siteEvidenceAttachmentId?: string;
  status: 'draft' | 'submitted' | 'site_verification' | 'pending_approval' | 'approved' | 'rejected' | WIPEntryStatus | DocumentStatus;
  createdAt: string;
  createdBy: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface WIPCertificationLine {
  id: string;
  wipLineId: string;
  workOrderLineId?: string;
  boqLineId?: string;
  scopeDescription: string;
  unitSymbol: string;
  orderedQty: number;
  previousCertifiedQty: number;
  currentMeasuredQty: number;
  proposedCertifiedQty: number;
  rejectedQty?: number;
  cumulativeCertifiedQty: number;
  remainingQty?: number;
  unitRate?: number;
  contractRate?: number;
  certifiedValue?: number;
  grossCertifiedAmount?: number;
  remarks?: string;
}

export interface WIPCertification {
  id: string;
  documentNumber: string;
  wipId: string;
  wipNumber: string;
  workOrderId: string;
  woNumber: string;
  projectId: string;
  projectName: string;
  subcontractorId: string;
  subcontractorName: string;
  certifiedBy: string;
  certificationDate: string;
  lines: WIPCertificationLine[];
  totalCertifiedValue?: number;
  grossCertifiedAmount?: number;
  previousCertifiedAmount?: number;
  currentGrossCertifiedAmount?: number;
  retentionDeductionAmount: number;
  taxAmount?: number;
  netPayableAmount: number;
  status: WIPCertificationStatus;
  comments?: string;
  createdAt: string;
  createdBy: string;
}

// ==========================================
// 6. FINANCE, BILLING AND PAYMENTS
// ==========================================

export type MatchStatus = 'matched' | 'quantity_mismatch' | 'rate_mismatch' | 'tax_mismatch' | 'approval_required';

export interface VendorAPInvoiceLine {
  grnLineId: string;
  productId: string;
  productName: string;
  poQty: number;
  poRate: number;
  acceptedGRNQty: number;
  previouslyInvoicedQty: number;
  currentInvoiceQty: number;
  invoiceRate: number;
  lineTotal: number;
}

export interface VendorAPInvoice {
  id: string;
  documentNumber: string;
  vendorInvoiceNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  grnId: string;
  grnNumber: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  invoiceDate: string;
  dueDate: string;
  lines: VendorAPInvoiceLine[];
  taxAmount: number;
  freightAmount: number;
  grossAmount: number;
  previousPaymentsAmount: number;
  outstandingAmount: number;
  matchStatus: MatchStatus;
  status: DocumentStatus;
  createdAt: string;
  createdBy: string;
}

export interface VendorPayment {
  id: string;
  documentNumber: string;
  vendorId: string;
  vendorName: string;
  invoiceIds: string[];
  paymentDate: string;
  paymentMethod: 'Bank Transfer / RTGS' | 'Cheque' | 'Corporate Card' | 'On-Account Advance';
  bankAccountId: string;
  paymentReference: string;
  grossPaymentAmount: number;
  deductionsAmount: number;
  netAmountPaid: number;
  remarks?: string;
  createdAt: string;
  createdBy: string;
}

export interface SubcontractWOItem {
  id: string;
  boqLineId?: string;
  itemCode?: string;
  scopeDescription: string;
  categoryName?: string;
  quantity: number;
  unitSymbol: string;
  unit?: string;
  rate: number;
  amount: number;
  variationReason?: string;
}

export interface SubcontractWOAmendment {
  id: string;
  amendmentNumber: string; // e.g. A1, A2
  amendmentDate: string;
  reason: string;
  revisedAmount: number;
  differenceAmount: number;
  approvedBy?: string;
  approvedDate?: string;
}

export interface SubcontractWorkOrder {
  id: string;
  documentNumber: string; // SWO-2026-001
  woNumber?: string;
  projectId: string;
  projectName: string;
  clientName?: string;
  siteName?: string;
  subcontractorId: string;
  subcontractorName: string;
  workCategory?: string;
  startDate: string;
  completionDate: string;
  paymentTerms?: string;
  retentionPercentage?: number;
  advancePercentage?: number;
  taxPercentage?: number;
  remarks?: string;
  items: SubcontractWOItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  advanceAmount?: number;
  retentionAmount?: number;
  finalContractValue?: number;
  amendments?: SubcontractWOAmendment[];
  status:
    | 'draft'
    | 'submitted'
    | 'pending_approval'
    | 'approved'
    | 'issued'
    | 'work_started'
    | 'partially_completed'
    | 'completed'
    | 'closed'
    | 'rejected'
    | 'cancelled';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface SubcontractWIPItem {
  id: string;
  boqLineId?: string;
  woItemId?: string;
  scopeDescription: string;
  unitSymbol: string;
  unit?: string;
  woQty: number;
  previouslyApprovedQty: number;
  claimedQty: number;
  measuredQty: number;
  approvedQty: number;
  remainingWOQty: number;
  rate: number;
  approvedValue: number;
  variationReason?: string;
}

export type SubcontractWIP = SubcontractorWIP;

export interface SubcontractorBillItem {
  id: string;
  wipItemId?: string;
  boqLineId?: string;
  scopeDescription: string;
  approvedWIPQty: number;
  previouslyBilledQty: number;
  currentBillQty: number;
  rate: number;
  grossAmount: number;
}

export type SubcontractorBillStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'draft'
  | 'submitted'
  | 'verification_pending'
  | 'posted_to_ap'
  | string;

export type SubcontractorBillPaymentStatus =
  | 'Not Started'
  | 'Payment Pending'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Not Applicable'
  | string;

export interface SubcontractorBillPayment {
  id: string;
  paymentNumber: string; // e.g. PAY/SC/2026/001
  billId: string;
  billNumber?: string;
  wipId?: string;
  workOrderId?: string;
  subcontractorId?: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
  referenceNumber: string;
  payingBankAccount?: string;
  remarks?: string;
  recordedBy: string;
  createdAt: string;
}

export interface SubcontractorBill {
  id: string;
  billNumber: string; // SCB/2026/001
  invoiceNumber: string; // Subcontractor's invoice/challan no.
  invoiceDate: string;
  dueDate: string;
  workOrderId: string;
  woNumber: string;
  wipId?: string;
  wipNumber?: string;
  subcontractorWIPId?: string;
  wipIds?: string[];
  subcontractorId: string;
  subcontractorName: string;
  projectId: string;
  projectName: string;
  billDate: string;
  items?: SubcontractorBillItem[];
  grossAmount: number;
  grossCertifiedValue?: number;
  retentionDeducted: number;
  advanceRecoveryDeducted?: number;
  otherDeductions?: number;
  totalDeductions?: number;
  taxAmount: number;
  netBillAmount: number;
  netPayable?: number;
  paidAmount?: number;
  outstandingAmount: number;
  billStatus: SubcontractorBillStatus;
  paymentStatus: SubcontractorBillPaymentStatus;
  status: SubcontractorBillStatus;
  remarks?: string;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  reopenReason?: string;
}

export type APStatus = 'Pending Approval' | 'Approved' | 'Rejected';
export type APPaymentStatus = 'Not Started' | 'Payment Pending' | 'Partially Paid' | 'Paid' | 'Overdue';

export interface APPaymentRecord {
  id: string;
  paymentNumber: string; // e.g. PAY/2026/001
  apId: string;
  grnId?: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
  paymentReference: string;
  payingBankAccount?: string;
  remarks?: string;
  recordedBy: string;
  createdAt: string;
}

export interface VendorAP {
  id: string;
  apNumber: string; // e.g. AP/2026/001
  grnId: string;
  grnNumber: string;
  poId?: string;
  poNumber?: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  qcId?: string;
  qcNumber?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  grnDate: string;
  apDate: string;
  dueDate: string;
  
  // Financial metrics
  acceptedQty?: number;
  netPayable: number;
  paidAmount: number;
  outstandingAmount: number;

  // Dual Statuses
  apStatus: APStatus;
  paymentStatus: APPaymentStatus;

  // Audit / Approval Details
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Sub-records
  paymentHistory?: APPaymentRecord[];

  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface AccountsPayable {
  id: string;
  apNumber: string; // AP-2026-001
  projectId: string;
  projectName: string;
  subcontractorId: string;
  subcontractorName: string;
  billId: string;
  billNumber: string;
  vendorInvoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  netPayable: number;
  paidAmount: number;
  outstandingAmount: number;
  status: 'payment_pending' | 'partially_paid' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt?: string;
}

export interface SubcontractorPayment {
  id: string;
  documentNumber: string; // PAY-2026-001
  paymentNumber?: string;
  projectId: string;
  projectName?: string;
  subcontractorId: string;
  subcontractorName: string;
  subcontractorBillId: string;
  apId?: string;
  paymentDate: string;
  paymentMethod: 'Bank Transfer / RTGS' | 'Cheque' | 'Cash' | 'UPI' | 'Other' | string;
  bankAccount?: string;
  bankAccountId?: string;
  paymentReference: string; // UTR or Cheque no.
  amountPaid: number;
  remarks?: string;
  status?: 'processed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface ClientRABillLine {
  boqLineId: string;
  itemDescription: string;
  unitSymbol: string;
  boqRate: number;
  previousBilledQty: number;
  currentClaimedQty: number;
  currentCertifiedQty: number;
  cumulativeBilledQty: number;
  lineTotal: number;
}

export interface LegacyClientRABill {
  id: string;
  documentNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  milestoneId?: string;
  milestoneName?: string;
  raBillNumber: number; // 1, 2, 3...
  billDate: string;
  dueDate: string;
  lines: ClientRABillLine[];
  grossClaimedAmount: number;
  certifiedRevenueAmount: number;
  retentionDeduction: number;
  otherDeductions: number;
  taxAmount: number;
  netBillAmount: number;
  receivedAmount: number;
  outstandingReceivable: number;
  status: DocumentStatus;
  createdAt: string;
  createdBy: string;
}

export interface ClientReceipt {
  id: string;
  documentNumber: string;
  clientRABillId: string;
  raBillNumber: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  receiptDate: string;
  receivedAmount: number;
  tdsDeducted: number;
  otherDeductions: number;
  totalCreditAmount: number;
  bankAccountId: string;
  paymentReference: string;
  remarks?: string;
  createdAt: string;
  createdBy: string;
}

// ==========================================
// 7. COMMON & AUDIT ENTITIES
// ==========================================

export interface Attachment {
  id: string;
  filename: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface AuditEvent {
  id: string;
  documentType: string;
  documentId: string;
  documentNumber: string;
  action: string; // e.g. 'CREATED', 'SUBMITTED', 'REVISED', 'APPROVED', 'REJECTED', 'POSTED'
  performedBy: string;
  performedAt: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

export interface WorkflowTransition {
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
  requiredRoleIds: string[];
  actionLabel: string;
  requiresComment?: boolean;
}

export interface DocumentReference {
  id?: string;
  documentType: 'indent' | 'rfq' | 'quotation' | 'comparison' | 'direct_purchase' | 'purchase_order' | 'boq' | string;
  documentId?: string;
  documentNumber: string;
  title?: string;
  fileUrl?: string;
  createdAt?: string;
  createdBy?: string;
}

// ==========================================
// 8. GOODS RECEIPT (GRN) & QUALITY CONTROL (QC)
// ==========================================

export type GRNStatus = 'qc_pending' | 'partially_inspected' | 'qc_completed' | 'cancelled';
export type QCInspectionStatus = 'draft' | 'in_progress' | 'submitted' | 'completed' | 'cancelled';
export type QCDisposition = 'APPROVED' | 'HOLD' | 'REJECTED';
export type NCRStatus = 'open' | 'vendor_notified' | 'return_planned' | 'returned' | 'replacement_awaited' | 'replacement_received' | 'closed';

export type MaterialEntryTokenStatus =
  | 'GATE_ENTRY_CREATED'
  | 'RECEIVING_CHECK_IN_PROGRESS'
  | 'QC_PENDING'
  | 'QC_IN_PROGRESS'
  | 'ADMIN_APPROVAL_REQUIRED'
  | 'APPROVED'
  | 'GRN_GENERATED'
  | 'HOLD'
  | 'CANCELLED'
  | 'TOKEN_GENERATED' // Backward-compatibility alias
  | 'RECEIVING_CHECKED' // Backward-compatibility alias
  | 'REJECTED';

export type TokenActivityType =
  | 'TOKEN_CREATED'
  | 'TOKEN_HELD'
  | 'TOKEN_RESUMED'
  | 'TOKEN_CANCELLED'
  | 'RECEIVING_STARTED'
  | 'PO_LINKED'
  | 'RECEIVING_COMPLETED'
  | 'QC_STARTED'
  | 'QC_SAVED'
  | 'QC_SUBMITTED'
  | 'QC_ADMIN_APPROVAL_REQUIRED'
  | 'QC_ADMIN_APPROVED'
  | 'QC_ADMIN_REJECTED'
  | 'QC_COMPLETED'
  | 'GRN_GENERATED';

export interface TokenActivity {
  id: string;
  tokenId: string;
  tokenNumber: string;
  eventType: TokenActivityType;
  timestamp: string;
  userId?: string;
  userName: string;
  title: string;
  description: string;
  referenceType?: 'PO' | 'RECEIVING' | 'QC' | 'GRN';
  referenceId?: string;
  metadata?: Record<string, any>;
}

export interface MaterialEntryToken {
  id: string;
  tokenNumber: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile?: string;
  productId: string;
  materialName: string;
  categoryId?: string;
  categoryName?: string;
  entryDate: string;
  entryTime: string;
  remarks?: string;
  status: MaterialEntryTokenStatus;
  currentStage?: 'Gate Entry' | 'Initial Receiving' | 'Quality Control' | 'Admin Approval' | 'GRN' | 'Hold' | 'Cancelled';
  holdReason?: string;
  heldBy?: string;
  heldAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface MaterialReceivingCheck {
  id: string;
  tokenId: string;
  tokenNumber: string;
  poId: string;
  poNumber: string;
  vendorId?: string;
  vendorName?: string;
  projectId?: string;
  projectName?: string;
  productId: string;
  productName: string;
  unit: string;
  poQty: number;
  receivedQty: number;
  damagedQty: number;
  shortQty: number;
  excessQty: number;
  excessReason?: string;
  qcPendingQty: number;
  checkedBy: string;
  checkedAt: string;
}

export interface QCChecklistParameter {
  id: string;
  parameterName: string;
  expectedValue: string;
  inspectionType: 'Text' | 'Numeric' | 'Pass / Fail' | 'Yes / No' | 'Dropdown' | 'Range' | 'Visual Check';
  isRequired: boolean;
  tolerance?: string;
  sequence: number;
  critical?: boolean;
}

export interface QCChecklistTemplate {
  id: string;
  templateName: string;
  categoryName: string;
  applicableProducts?: string[];
  isActive: boolean;
  parameters: QCChecklistParameter[];
  createdAt: string;
  createdBy: string;
}

export interface GRNItem {
  id: string;
  poItemId?: string;
  productId: string;
  projectBOQLineId?: string;
  description: string;
  categoryId?: string;
  categoryName: string;
  specifications?: {
    brand?: string;
    grade?: string;
    thickness?: string;
    size?: string;
    finish?: string;
    [key: string]: any;
  };
  unit: string;
  orderedQty: number;
  receivedQty: number;
  qcPendingQty: number;
  qcApprovedQty: number;
  qcRejectedQty: number;
  qcHoldQty: number;
  poLineId?: string;
  poUnitRate?: number;
  unitRate?: number;
  taxRate?: number;
  lineAcceptedBaseValue?: number;
  lineTaxAmount?: number;
  lineNetPayable?: number;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  documentNumber?: string;
  tokenId?: string;
  receivingCheckId?: string;
  qcInspectionId?: string;
  poId?: string;
  purchaseOrderId?: string;
  poNumber: string;
  poLineId?: string;
  deliveryId?: string;
  projectId: string;
  projectName?: string;
  vendorId: string;
  vendorName?: string;
  warehouseId?: string;
  warehouseName?: string;
  destinationLocationId?: string;
  destinationLocationName?: string;
  grnDate: string;
  receivedDate?: string;
  dueDate?: string;
  invoiceChallanNo?: string;
  deliveryChallanNo?: string;
  vehicleNumber?: string;
  receivedByEmployeeId?: string;
  receivedByName?: string;
  receivedBy?: string;
  qualityInspection?: any;
  status: GRNStatus | any;
  paymentStatus?: string;
  rateStatus?: 'OK' | 'MISSING_RATE';
  poUnitRate?: number;
  unitRate?: number;
  baseAcceptedValue?: number;
  taxRate?: number;
  taxAmount?: number;
  netPayable?: number;
  paidAmount?: number;
  outstandingAmount?: number;
  items?: GRNItem[];
  lines?: any[];
  isPostedToStock?: boolean;
  postedAt?: string;
  postedBy?: string;
  receivedQty?: number;
  acceptedQty?: number;
  rejectedQty?: number;
  holdQty?: number;
  remarks?: string;
  createdAt: string;
  createdBy: string;
}

export type GoodsReceivedNote = GoodsReceipt;

export interface GRNPayment {
  id: string;
  paymentNumber?: string;
  grnId: string;
  grnNumber?: string;
  poId?: string;
  poNumber?: string;
  vendorId?: string;
  vendorName?: string;
  paymentDate: string;
  amount: number;
  paymentMode: 'Bank Transfer' | 'Cheque' | 'UPI' | 'Cash' | 'Credit Card' | string;
  bankAccountId?: string;
  referenceNumber?: string;
  remarks?: string;
  recordedBy?: string;
  recordedAt?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface QCParameterResult {
  parameterId: string;
  parameterName: string;
  requirement: string;
  actualObservation: string;
  result: 'PASS' | 'FAIL' | 'NA';
  remarks?: string;
  critical?: boolean;
}

export interface QCInspectionItem {
  id: string;
  grnItemId?: string;
  productId: string;
  productDescription: string;
  categoryName: string;
  unit: string;
  receivedQty: number;
  previouslyInspectedQty: number;
  inspectionQty: number;
  approvedQty: number;
  rejectedQty: number;
  holdQty: number;
  rejectionReason?: string;
  dispositionAction?: 'Return to Vendor' | 'Replacement Required' | 'Accept With Concession' | 'Scrap' | 'Rework' | 'Hold for Review';
  parameterResults: QCParameterResult[];
  remarks?: string;
}

export interface QualityInspection {
  id: string;
  qcNumber: string;
  tokenId?: string;
  tokenNumber?: string;
  receivingCheckId?: string;
  grnId?: string;
  grnNumber?: string;
  poId: string;
  poNumber: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  vehicleNumber?: string;
  driverName?: string;
  warehouseId?: string;
  warehouseName?: string;
  inspectionDate: string;
  inspectorName: string;
  inspectedBy?: string;
  qcStatus?: string;
  testResult?: 'PASS' | 'FAIL' | 'PARTIAL';
  status: QCInspectionStatus | 'ADMIN_APPROVAL_REQUIRED' | 'ADMIN_APPROVED' | 'ADMIN_REJECTED';
  items: QCInspectionItem[];
  failedCount?: number;
  criticalFailure?: boolean;
  requiresAdminApproval?: boolean;
  adminDecision?: 'APPROVED' | 'REJECTED' | 'REINSPECT' | 'HOLD';
  adminRemarks?: string;
  adminApprovedBy?: string;
  adminApprovedAt?: string;
  overallRemarks?: string;
  createdAt: string;
  createdBy: string;
}

export interface NCR {
  id: string;
  ncrNumber: string;
  qcInspectionId: string;
  qcNumber: string;
  grnId: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productDescription: string;
  categoryName: string;
  rejectedQty: number;
  unit: string;
  reason: string;
  observedDefect: string;
  raisedBy: string;
  raisedDate: string;
  disposition: string;
  status: NCRStatus;
  rtvNumber?: string;
  replacementGrnNumber?: string;
  createdAt: string;
}

export interface QuarantineItem {
  id: string;
  ncrId?: string;
  grnId: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productDescription: string;
  categoryName: string;
  quantity: number;
  unit: string;
  type: 'REJECTED' | 'HOLD';
  reason: string;
  qcDate: string;
  disposition: string;
  status: 'in_quarantine' | 'rtv_created' | 'scrapped' | 'released_with_concession';
}

export interface ReturnToVendor {
  id: string;
  rtvNumber: string;
  ncrId?: string;
  grnId: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  returnDate: string;
  items: {
    productId: string;
    productDescription: string;
    quantity: number;
    unit: string;
    reason: string;
  }[];
  transporterDetails?: string;
  status: 'draft' | 'dispatched' | 'acknowledged_by_vendor';
  createdAt: string;
  createdBy: string;
}

export interface MaterialIssueItem {
  id: string;
  productId: string;
  productDescription: string;
  categoryName: string;
  unit: string;
  availableStock: number;
  issueQty: number;
  receivedQty: number;
  unitRate: number;
  issueValue: number;
  remarks?: string;
}

export interface MaterialIssueActivity {
  id: string;
  timestamp: string;
  user: string;
  action: 'ISSUE_CREATED' | 'ISSUE_UPDATED' | 'ISSUE_DISPATCHED' | 'SITE_PARTIAL_RECEIPT' | 'SITE_RECEIPT_COMPLETED' | 'ISSUE_CANCELLED';
  description: string;
  reference?: string;
}

// ==========================================
// Client RA Bills & Receivables Workflow Types
// ==========================================

export type ClientRABillStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Sent to Client'
  | 'Awaiting Certification'
  | 'Certified'
  | 'Rejected'
  | 'Cancelled';

export type ClientRABillPaymentStatus =
  | 'Not Applicable'
  | 'Not Started'
  | 'Payment Pending'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue';

export interface ClientPaymentReceipt {
  id: string;
  receiptNumber: string;
  raBillId: string;
  raBillNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  receiptDate: string;
  amountReceived: number;
  paymentMode: string;
  referenceNumber?: string;
  receivingBankAccount: string;
  remarks?: string;
  createdAt: string;
  createdBy: string;
}

export interface ClientRABillAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
}

export interface ClientRABill {
  id: string;
  billNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  milestoneId: string;
  milestoneName: string;
  billingMilestoneId?: string;
  contractBaselineId?: string;
  sourceEstimateId?: string;
  sourceQuotationNumber?: string;
  triggerEventId?: string;
  triggeredAt?: string;
  triggerDescription?: string;
  billDate: string;
  dueDate: string;
  claimedAmount: number;
  certifiedAmount?: number;
  grossWorkValue: number;
  approvedVariations: number;
  retentionAmount: number;
  advanceRecoveryAmount: number;
  otherDeductions: number;
  totalDeductions: number;
  taxAmount: number;
  netReceivable: number;
  paidAmount: number;
  outstandingAmount: number;
  billStatus: ClientRABillStatus;
  paymentStatus: ClientRABillPaymentStatus;
  approvedBy?: string;
  approvedAt?: string;
  sentBy?: string;
  sentAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  reopenReason?: string;
  certificationDetails?: {
    certifiedBy?: string;
    certifiedAt?: string;
    certificationRef?: string;
    remarks?: string;
  };
  paymentHistory: ClientPaymentReceipt[];
  auditLog: ClientRABillAuditLog[];
  createdAt: string;
  createdBy: string;
}







