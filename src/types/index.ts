import * as React from 'react';

// ==========================================
// 1. Page & Action Types
// ==========================================

export type PageType = 'dashboard' | 'list' | 'form' | 'details' | 'report';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

export interface PageAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  route?: string;
  onClick?: () => void;
}

export interface PageConfig {
  id: string;
  title: string;
  description?: string;
  type: PageType;
  breadcrumbs: BreadcrumbItem[];
  actions?: PageAction[];
}

// ==========================================
// 2. Navigation Types
// ==========================================

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  parentId?: string;
  badge?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  icon?: string;
  items: NavigationItem[];
}

// ==========================================
// 3. Status Badges & Configurations
// ==========================================

export type ERPStatus = 
  | 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft'
  | 'progress' | 'completed' | 'on_hold' | 'critical' | 'closed'
  | 'sent' | 'received' | 'overdue' | 'paid' | 'unpaid' | 'approved_pending' | 'pending_approval'
  | 'tender' | 'deleted' | 'not_started';

export interface StatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
  icon?: string;
}

// ==========================================
// 4. Table & Filter Types
// ==========================================

export interface TableColumn {
  id: string;
  header: string;
  accessorKey?: string;
  sortable?: boolean;
}

export interface TableAction<T = any> {
  label: string;
  onClick: (value: T) => void;
  icon?: React.ReactNode;
}

export interface FilterField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'date-range';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface FilterConfig {
  fields: FilterField[];
  onFilterChange: (filters: Record<string, string>) => void;
}

// ==========================================
// 5. Form Structure Types
// ==========================================

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

// ==========================================
// 6. Dashboard Analytical Types
// ==========================================

export interface MetricCard {
  id: string;
  label: string;
  value: number;
  change?: number; // percentage change, e.g. +12.5 or -5.2
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
}

export interface ChartRecord {
  month: string;
  billing: number;
  payments: number;
  budget: number;
  actual: number;
}

export interface UpcomingDeadlineSchema {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'milestone' | 'delivery' | 'compliance' | 'payment';
}

export interface ActivityFeedSchema {
  id: string;
  user: string;
  action: string;
  target: string;
  project: string;
  timestamp: string;
}

export interface ProjectHealthSchema {
  id: string;
  name: string;
  client: string;
  location: string;
  completion: number; // percentage (0 - 100)
  budgetSpent: number;
  budgetTotal: number;
  manager: string;
  status: ERPStatus;
}

export interface PendingApprovalSchema {
  id: string;
  referenceNo: string;
  type: string;
  project: string;
  requester: string;
  amount?: number;
  date: string;
  status: ERPStatus;
}

// ==========================================
// 7. Stage 2 Site Specific Types
// ==========================================

export type SiteWorkflowStatus = 'draft' | 'tender' | 'pending_approval' | 'approved' | 'rejected' | 'deleted';
export type SiteExecutionStatus = 'not_started' | 'active' | 'on_hold' | 'completed';

export type ApprovalDecisionStatus = 'pending' | 'approved' | 'rejected';
export type SiteApprovalRole = 'accountingHead' | 'chairman' | 'projectHead' | 'engineeringHead';

export interface SiteApprovalDecision {
  approverName: string;
  status: ApprovalDecisionStatus;
  actionDate?: string;
  comment?: string;
}

export interface SiteApprovalWorkflow {
  accountingHead: SiteApprovalDecision;
  chairman: SiteApprovalDecision;
  projectHead: SiteApprovalDecision;
  engineeringHead: SiteApprovalDecision;
}

export interface SiteSchema {
  id: string;
  code: string;
  name: string;
  category: string;
  client: string;
  city: string;
  manager: string;
  startDate: string;
  targetCompletion: string;
  budget: number;
  progress: number; // percentage (0 - 100)
  workflowStatus: SiteWorkflowStatus;
  executionStatus: SiteExecutionStatus;

  // Extended fields
  company?: string;
  projectHead?: string;
  address?: string;
  projectArea?: number;
  projectAreaUnit?: string;
  processStartDate?: string;
  submissionDate?: string;
  approvedValue?: number;
  noteToApprover?: string;
  approvalRequestDate?: string;
  approvalWorkflow?: SiteApprovalWorkflow;
  rejectionComment?: string;
  rejectedBy?: string;
  rejectionDate?: string;
  deletedDate?: string;
  previousWorkflowStatus?: SiteWorkflowStatus;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
}

export interface ApprovalRow {
  id: string; // indent, po, wo, invoice, payment, budget
  type: string;
  primaryApprover: string;
  backupApprover: string;
  level: string; // L1, L2, L3, etc.
  required: boolean;
}

export interface SiteDocument {
  id: string;
  name: string;
  category: string;
  type: string;
  size: string;
}

// ==========================================
// 8. On-Account Balance & Transaction Types
// ==========================================

export interface VendorOnAccountBalance {
  id: string;
  vendorId: string;
  vendorName: string;
  siteId: string;
  siteName: string;
  originalAmount: number;
  allocatedToInvoices: number;
  transferredAmount: number;
  availableBalance: number;
  lastTransactionDate: string;
  status: 'active' | 'fully_allocated' | 'closed';
}

export interface SiteOnAccountBalance {
  id: string;
  siteId: string;
  siteName: string;
  receivedAmount: number;
  allocatedToInvoices: number;
  transferredIn: number;
  transferredOut: number;
  availableBalance: number;
  lastUpdatedDate: string;
}

export interface OnAccountTransaction {
  id: string;
  transactionReference: string;
  transactionDate: string;
  transactionType: 'receipt' | 'invoice_allocation' | 'inter_site_transfer' | 'vendor_transfer';
  sourceSiteId?: string;
  sourceSiteName?: string;
  destinationSiteId?: string;
  destinationSiteName?: string;
  vendorId?: string;
  vendorName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'processed';
}

