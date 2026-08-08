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
  name: string;
  legalName?: string;
  displayName?: string;
  category: string;
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
  landedUnitRate?: number;
  lineTotal: number;
  deliveryDate?: string;
  receivedQty?: number;
  invoicedQty?: number;
  indentLineId?: string;
}

export type POLine = PurchaseOrderLine;

export interface PurchaseOrder {
  id: string;
  documentNumber: string;
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
  rateValidityDate?: string;
  orderDate: string;
  deliveryDueDate?: string;
  expectedDeliveryDate?: string;
  lines: POLine[];
  subtotal?: number;
  taxTotal?: number;
  freightTotal?: number;
  totalAmount: number;
  grandTotal?: number;
  currency?: string;
  status: DocumentStatus | POStatus;
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

export type GRNStatus =
  | 'draft'
  | 'pending_inspection'
  | 'inspected'
  | 'approved'
  | 'posted'
  | 'rejected'
  | 'cancelled';

export type QualityInspectionStatus = 'pending' | 'passed' | 'failed' | 'partial';

export type MaterialIssueStatus = 'draft' | 'issued' | 'cancelled';

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
  locationCode: string;
  name: string;
  projectId?: string;
  type: 'central_store' | 'site_store' | 'project_work_package' | 'subcontractor_yard';
  address?: string;
  isActive: boolean;
}

export interface QualityInspection {
  id: string;
  grnId: string;
  inspectedBy: string;
  inspectionDate: string;
  testResult: QualityInspectionStatus;
  qcStatus: QualityInspectionStatus;
  acceptedReason?: string;
  rejectedReason?: string;
  inspectionNotes?: string;
  certificateAttachment?: string;
}

export interface GRNLine {
  id: string;
  poLineId: string;
  productId: string;
  productCode: string;
  productName: string;
  unitSymbol: string;
  orderedQty: number;
  previouslyReceivedQty: number;
  pendingPOQty: number;
  currentReceivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  underInspectionQty: number;
  unitRate: number;
  rejectionReason?: string;
  batchNumber?: string;
}

export interface GoodsReceivedNote {
  id: string;
  documentNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  deliveryChallanNo: string;
  vehicleNumber?: string;
  destinationLocationId: string;
  destinationLocationName: string;
  receivedDate: string;
  receivedBy: string;
  lines: GRNLine[];
  qualityInspection?: QualityInspection;
  qualityCheck?: {
    inspectedBy: string;
    inspectionDate: string;
    qcStatus: 'passed' | 'failed' | 'partial';
    inspectionNotes?: string;
  };
  isPostedToStock: boolean;
  postedAt?: string;
  postedBy?: string;
  status: GRNStatus | DocumentStatus;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface StockLedgerEntry {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  projectId: string;
  locationId: string;
  locationName: string;
  entryType:
    | 'grn_accepted'
    | 'material_issue'
    | 'material_return'
    | 'material_consumption'
    | 'transfer_in'
    | 'transfer_out'
    | 'adjustment'
    | 'reversal';
  inQuantity: number;
  outQuantity: number;
  runningBalance: number;
  unitRate: number;
  totalValue: number;
  unitSymbol: string;
  sourceDocumentId: string;
  sourceDocumentNumber: string;
  entryDate: string;
  createdTime: string;
  isImmutable: boolean;
  reversalOfEntryId?: string;
  recordedBy: string;
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
  documentNumber: string;
  indentId?: string;
  indentNumber?: string;
  projectId: string;
  projectName: string;
  sourceLocationId: string;
  sourceLocationName: string;
  destinationLocationId: string;
  destinationAreaName: string;
  issuedBy: string;
  receiverName?: string;
  receivedBySubcontractor?: string;
  subcontractorId?: string;
  issueDate: string;
  lines: MaterialIssueLine[];
  status: MaterialIssueStatus;
  remarks?: string;
  createdAt: string;
  createdBy: string;
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
  documentNumber: string;
  workOrderId: string;
  woNumber: string;
  subcontractorId: string;
  subcontractorName: string;
  projectId: string;
  projectName: string;
  measurementPeriodStart?: string;
  measurementPeriodEnd?: string;
  measurementDate?: string;
  measuredBy: string;
  lines: SubcontractorWIPLine[];
  totalMeasuredAmount?: number;
  measurementNotes?: string;
  siteEvidenceAttachmentId?: string;
  status: WIPEntryStatus | DocumentStatus;
  createdAt: string;
  createdBy: string;
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

export interface SubcontractorBill {
  id: string;
  documentNumber: string;
  workOrderId: string;
  woNumber: string;
  subcontractorWIPId: string;
  subcontractorId: string;
  subcontractorName: string;
  projectId: string;
  projectName: string;
  billDate: string;
  dueDate: string;
  certifiedWIPAmount: number;
  retentionDeducted: number;
  taxAmount: number;
  netBillAmount: number;
  previousPaymentsAmount: number;
  outstandingAmount: number;
  status: DocumentStatus;
  createdAt: string;
  createdBy: string;
}

export interface SubcontractorPayment {
  id: string;
  documentNumber: string;
  subcontractorId: string;
  subcontractorName: string;
  subcontractorBillId: string;
  paymentDate: string;
  paymentMethod: string;
  bankAccountId: string;
  paymentReference: string;
  amountPaid: number;
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

export interface ClientRABill {
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



