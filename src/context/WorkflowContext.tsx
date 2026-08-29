import React, { createContext, useContext, useState, useEffect } from 'react';
import { MODULE_SCHEMAS } from '../config/moduleSchemas';
import { ROUTES } from '../config/navigation';
import {
  INITIAL_COLLECTIONS,
  validateDemoData,
  InventoryRecord
} from '../data/connectedDemoData';

export type WorkflowCollectionId =
  | 'indents' | 'rfqs' | 'quotations' | 'rateComparisons' | 'purchaseOrders'
  | 'orders' | 'grns' | 'invoices' | 'vendorInvoices' | 'paymentRequests' | 'payments'
  | 'budgetRevisions' | 'clients' | 'vendors' | 'employees' | 'items' | 'inventory'
  | 'onAccountPayments' | 'onAccountTransfers' | 'budgetTransfers'
  | 'utilityBills' | 'utilityAllocations' | 'salaryDisbursements' 
  | 'salaryAllocations' | 'accountingInvoices' | 'creditNotes' 
  | 'debitNotes' | 'workOrders' | 'tasks' | 'alerts' | 'messages' 
  | 'calendarEvents' | 'brands' | 'locations' | 'pmcs' 
  | 'architects' | 'measurementConversions' | 'designations'
  | 'companies' | 'users' | 'projectTeams' | 'tenders' | 'projects'
  | 'clientBills' | 'clientPayments' | 'bankAccounts'
  | 'itemCategories' | 'units' | 'departments' | 'roles'
  | 'salaryAllocations';

export interface BaseRecord {
  id: string;
  status?: string;
  code?: string;
  referenceNo?: string;
  name?: string;
  title?: string;
  subject?: string;
  indentNo?: string;
  poNo?: string;
  invoiceNo?: string;
  vendorCode?: string;
  clientCode?: string;
  empCode?: string;
  clientName?: string;
  vendor?: string;
  [key: string]: unknown;
}

export interface ItemRow {
  id: string;
  item: string;
  unit?: string;
  qty?: number | string;
  rate?: number | string;
  amount?: number;
  [key: string]: unknown;
}

export interface IndentRecord extends BaseRecord {
  indentNo?: string;
  indentNumber?: string;
  site?: string;
  items?: ItemRow[];
}

export interface RFQRecord extends BaseRecord {
  rfqNo?: string;
  indentId?: string;
  indentNumber?: string;
  site?: string;
  bidsRecd?: number;
}

export interface QuotationRecord extends BaseRecord {
  rfqId?: string;
  vendorId?: string;
  vendorName?: string;
  basicRate?: number;
}

export interface RateComparisonRecord extends BaseRecord {
  rfqId?: string;
  indentId?: string;
  quotationIds?: string[];
  selectedVendorId?: string;
  selectedVendorName?: string;
  site?: string;
}

export interface PurchaseOrderRecord extends BaseRecord {
  poNo?: string;
  poNumber?: string;
  indentId?: string;
  rfqId?: string;
  selectedVendorId?: string;
  vendor?: string;
  site?: string;
  amount?: number;
}

export interface OrderRecord extends BaseRecord {
  orderNo?: string;
  purchaseOrderId?: string;
  poNumber?: string;
  vendor?: string;
  vendorId?: string;
  site?: string;
  amount?: number;
}

export interface GRNRecord extends BaseRecord {
  grnNo?: string;
  orderId?: string;
  purchaseOrderId?: string;
  vendor?: string;
  vendorId?: string;
  site?: string;
}

export interface InvoiceRecord extends BaseRecord {
  invoiceNo?: string;
  grnId?: string;
  purchaseOrderId?: string;
  vendorId?: string;
  vendor?: string;
  site?: string;
  certifiedAmount?: number;
  grossAmount?: number;
  outstandingAmount?: number;
}

export interface PaymentRequestRecord extends BaseRecord {
  requestNo?: string;
  invoiceId?: string;
  vendorId?: string;
  vendor?: string;
  site?: string;
  amount?: number;
}

export interface PaymentRecord extends BaseRecord {
  paymentReference?: string;
  paymentRequestId?: string;
  invoiceId?: string;
  vendorId?: string;
  vendor?: string;
  amount?: number;
}

export interface OnAccountPaymentRecord extends BaseRecord { vendorId?: string; siteId?: string; balance?: number; }
export interface OnAccountTransferRecord extends BaseRecord { 
  transactionId?: string; onAccountPaymentId?: string; invoiceId?: string; 
  sourceSiteId?: string; destinationSiteId?: string; vendorId?: string; 
}
export interface BudgetTransferRecord extends BaseRecord { 
  transferId?: string; sourceSiteId?: string; destinationSiteId?: string; 
  sourceCategory?: string; destinationCategory?: string; 
}
export interface UtilityBillRecord extends BaseRecord { billTotal?: number; }
export interface UtilityAllocationRecord extends BaseRecord { utilityBillId?: string; siteId?: string; departmentId?: string; }
export interface SalaryDisbursementRecord extends BaseRecord {}
export interface SalaryAllocationRecord extends BaseRecord { salaryDisbursementId?: string; employeeId?: string; siteId?: string; }
export interface AccountingInvoiceRecord extends BaseRecord {}
export interface CreditNoteRecord extends BaseRecord { linkedInvoiceId?: string; vendorId?: string; clientId?: string; siteId?: string; }
export interface DebitNoteRecord extends BaseRecord { linkedInvoiceId?: string; vendorId?: string; clientId?: string; siteId?: string; }
export interface WorkOrderRecord extends BaseRecord {}
export interface TaskRecord extends BaseRecord {}
export interface AlertRecord extends BaseRecord {}
export interface MessageRecord extends BaseRecord {}
export interface CalendarEventRecord extends BaseRecord {}
export interface BrandRecord extends BaseRecord {}
export interface LocationRecord extends BaseRecord {}
export interface PMCRecord extends BaseRecord {}
export interface ArchitectRecord extends BaseRecord {}
export interface MeasurementConversionRecord extends BaseRecord {}
export interface DesignationRecord extends BaseRecord {}
export interface BudgetRevisionRecord extends BaseRecord {}
export interface ClientRecord extends BaseRecord {}
export interface VendorRecord extends BaseRecord {}
export interface EmployeeRecord extends BaseRecord {}
export interface ItemMasterRecord extends BaseRecord {}
export interface CompanyRecord extends BaseRecord {}
export interface UserRecord extends BaseRecord {}
export interface ProjectTeamRecord extends BaseRecord { siteId?: string; employee?: string; role?: string; }
export interface TenderRecord extends BaseRecord { siteId?: string; tenderNo?: string; type?: string; }
export interface ClientBillRecord extends BaseRecord { clientId?: string; siteId?: string; billNo?: string; billAmount?: number; }
export interface ClientPaymentRecord extends BaseRecord { clientId?: string; siteId?: string; paymentRef?: string; }
export interface BankAccountRecord extends BaseRecord { companyId?: string; bankName?: string; }
export interface ItemCategoryRecord extends BaseRecord { code?: string; }
export interface UnitRecord extends BaseRecord { code?: string; symbol?: string; }
export interface DepartmentRecord extends BaseRecord { code?: string; head?: string; }
export interface RoleRecord extends BaseRecord { roleId?: string; roleName?: string; }
export interface ProjectRecord extends BaseRecord {
  projectCode?: string;
  projectName?: string;
  siteId?: string;
  siteCode?: string;
  clientId?: string;
  clientName?: string;
  companyId?: string;
  companyName?: string;
  city?: string;
  projectManagerId?: string;
  projectManagerName?: string;
  startDate?: string;
  targetCompletionDate?: string;
  approvedBudget?: number;
  progressPercentage?: number;
  executionStatus?: string;
}

export type WorkflowCollections = {
  indents: IndentRecord[];
  rfqs: RFQRecord[];
  quotations: QuotationRecord[];
  rateComparisons: RateComparisonRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  orders: OrderRecord[];
  grns: GRNRecord[];
  invoices: InvoiceRecord[];
  vendorInvoices: InvoiceRecord[];
  paymentRequests: PaymentRequestRecord[];
  payments: PaymentRecord[];
  budgetRevisions: BudgetRevisionRecord[];
  clients: ClientRecord[];
  vendors: VendorRecord[];
  employees: EmployeeRecord[];
  items: ItemMasterRecord[];
  inventory: InventoryRecord[];
  onAccountPayments: OnAccountPaymentRecord[];
  onAccountTransfers: OnAccountTransferRecord[];
  budgetTransfers: BudgetTransferRecord[];
  utilityBills: UtilityBillRecord[];
  utilityAllocations: UtilityAllocationRecord[];
  salaryDisbursements: SalaryDisbursementRecord[];
  salaryAllocations: SalaryAllocationRecord[];
  accountingInvoices: AccountingInvoiceRecord[];
  creditNotes: CreditNoteRecord[];
  debitNotes: DebitNoteRecord[];
  workOrders: WorkOrderRecord[];
  tasks: TaskRecord[];
  alerts: AlertRecord[];
  messages: MessageRecord[];
  calendarEvents: CalendarEventRecord[];
  brands: BrandRecord[];
  locations: LocationRecord[];
  pmcs: PMCRecord[];
  architects: ArchitectRecord[];
  measurementConversions: MeasurementConversionRecord[];
  designations: DesignationRecord[];
  // New collections from Stage 7
  companies: CompanyRecord[];
  users: UserRecord[];
  projects: ProjectRecord[];
  projectTeams: ProjectTeamRecord[];
  tenders: TenderRecord[];
  clientBills: ClientBillRecord[];
  clientPayments: ClientPaymentRecord[];
  bankAccounts: BankAccountRecord[];
  itemCategories: ItemCategoryRecord[];
  units: UnitRecord[];
  departments: DepartmentRecord[];
  roles: RoleRecord[];
};

export interface WorkflowState extends WorkflowCollections {
  getCollection: (id: WorkflowCollectionId) => BaseRecord[];
  addRecord: <T extends WorkflowCollectionId>(collection: T, record: Partial<WorkflowCollections[T][number]>) => void;
  updateRecord: <T extends WorkflowCollectionId>(collection: T, id: string, record: Partial<WorkflowCollections[T][number]>) => void;
  deleteRecord: (collection: WorkflowCollectionId, id: string) => void;
  duplicateRecord: (collection: WorkflowCollectionId, id: string) => void;
  rejectRecord: (collection: WorkflowCollectionId, id: string, comment: string) => void;

  submitIndentForApproval: (id: string) => void;
  approveIndent: (id: string) => void;
  createRfqFromIndent: (indentId: string) => void;
  recordVendorQuotation: (rfqId: string, quotationData: Partial<QuotationRecord>) => void;
  finalizeRateComparison: (rateId: string) => void;
  createPurchaseOrderFromComparison: (rateId: string, vendorId: string) => void;
  approvePurchaseOrder: (poId: string) => void;
  createOrderFromPurchaseOrder: (poId: string) => void;
  createGrnFromOrder: (orderId: string) => void;
  createInvoiceFromGrn: (grnId: string) => void;
  certifyInvoice: (invoiceId: string) => void;
  createPaymentRequestFromInvoice: (invoiceId: string) => void;
  approvePaymentRequest: (reqId: string) => void;
  recordPayment: (reqId: string, paymentData: Partial<PaymentRecord>) => void;
  
  // Specific methods for future checkpoints (placeholders to satisfy types until Cpt B-E)
  requestBudgetRevision: (data: Partial<BudgetRevisionRecord>) => void;
  processBudgetRevision: (revId: string, status: 'approved' | 'rejected') => void;
  createOnAccountPaymentRequest: () => void;
  approveOnAccountPayment: () => void;
  transferOnAccountToInvoice: () => void;
  transferOnAccountBetweenSites: () => void;
  createBudgetTransfer: () => void;
  processBudgetTransfer: () => void;
  allocateUtilityBill: () => void;
  completeUtilitySplit: () => void;
  allocateSalary: () => void;
  completeSalarySplit: () => void;
  createAccountingInvoice: () => void;
  createCreditNote: () => void;
  createDebitNote: () => void;
  createWorkOrder: () => void;
  updateTaskStatus: (taskId: string, status: string, extraData?: Record<string, any>) => void;
  reassignTask?: (taskId: string, newAssignedTo: string) => void;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead?: () => void;
  deleteAlert?: (alertId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  addCalendarEvent?: (event: Record<string, any>) => void;
}

const WorkflowContext = createContext<WorkflowState | undefined>(undefined);

export const getCollectionIdFromRoute = (route: string): WorkflowCollectionId => {
  switch (route) {
    case ROUTES.INDENTS: return 'indents';
    case ROUTES.RFQS: return 'rfqs';
    case ROUTES.RATE_COMPARISON: return 'rateComparisons';
    case ROUTES.PURCHASE_ORDERS: return 'purchaseOrders';
    case ROUTES.WORK_ORDERS: return 'workOrders';
    case ROUTES.ORDERS: return 'orders';
    case ROUTES.GRNS: return 'grns';
    case ROUTES.INVOICES: return 'vendorInvoices';
    case ROUTES.PAYMENT_REQUESTS: return 'paymentRequests';
    case ROUTES.PAYMENTS: return 'payments';
    case ROUTES.PROJECT_BUDGETS: return 'budgetRevisions';
    case ROUTES.PROJECTS: return 'projects';
    case ROUTES.CLIENTS: return 'clients';
    case ROUTES.VENDORS: return 'vendors';
    case ROUTES.EMPLOYEES: return 'employees';
    case ROUTES.ITEMS: return 'items';
    case ROUTES.INVENTORY: return 'inventory';
    case ROUTES.ITEM_CATEGORIES: return 'itemCategories';
    case ROUTES.UNITS: return 'units';
    case ROUTES.COMPANIES: return 'companies';
    case ROUTES.BANKS: return 'bankAccounts';
    case ROUTES.DEPARTMENTS: return 'departments';
    case ROUTES.ROLES_MASTER: return 'roles';
    case ROUTES.DESIGNATIONS: return 'designations';
    case ROUTES.ON_ACCOUNT_DASHBOARD: return 'onAccountPayments';
    case ROUTES.BUDGET_TRANSFERS: return 'budgetTransfers';
    case ROUTES.ACCOUNTING_INVOICES: return 'accountingInvoices';
    case ROUTES.CREDIT_NOTES: return 'creditNotes';
    case ROUTES.DEBIT_NOTES: return 'debitNotes';
    case ROUTES.UTILITY_BILLS: return 'utilityBills';
    case ROUTES.SALARY: return 'salaryDisbursements';
    case ROUTES.PROJECT_TEAMS: return 'projectTeams';
    case ROUTES.TENDER_DETAILS: return 'tenders';
    case ROUTES.BRANDS: return 'brands';
    case ROUTES.LOCATIONS: return 'locations';
    case ROUTES.PMC: return 'pmcs';
    case ROUTES.ARCHITECTS: return 'architects';
    case ROUTES.MEASUREMENT_CONVERSIONS: return 'measurementConversions';
    case ROUTES.USERS: return 'users';
    case ROUTES.ROLES: return 'roles';
    default: return 'indents'; // Safest fallback
  }
};


export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initCollection = <T extends BaseRecord>(route: string): T[] => {
    return (MODULE_SCHEMAS[route]?.mockRows as unknown as T[]) || [];
  };

  const [collections, setCollections] = useState<WorkflowCollections>({
    // ── Procurement chain ─────────────────────────────────────────────────────
    indents: INITIAL_COLLECTIONS.indents as unknown as IndentRecord[],
    rfqs: INITIAL_COLLECTIONS.rfqs as unknown as RFQRecord[],
    quotations: INITIAL_COLLECTIONS.quotations as unknown as QuotationRecord[],
    rateComparisons: INITIAL_COLLECTIONS.rateComparisons as unknown as RateComparisonRecord[],
    purchaseOrders: INITIAL_COLLECTIONS.purchaseOrders as unknown as PurchaseOrderRecord[],
    orders: INITIAL_COLLECTIONS.orders as unknown as OrderRecord[],
    grns: INITIAL_COLLECTIONS.grns as unknown as GRNRecord[],
    // ── Finance ───────────────────────────────────────────────────────────────
    invoices: INITIAL_COLLECTIONS.vendorInvoices as unknown as InvoiceRecord[],
    vendorInvoices: INITIAL_COLLECTIONS.vendorInvoices as unknown as InvoiceRecord[],
    paymentRequests: INITIAL_COLLECTIONS.paymentRequests as unknown as PaymentRequestRecord[],
    payments: INITIAL_COLLECTIONS.payments as unknown as PaymentRecord[],
    accountingInvoices: INITIAL_COLLECTIONS.accountingInvoices as unknown as AccountingInvoiceRecord[],
    creditNotes: INITIAL_COLLECTIONS.creditNotes as unknown as CreditNoteRecord[],
    debitNotes: INITIAL_COLLECTIONS.debitNotes as unknown as DebitNoteRecord[],
    onAccountPayments: [
      ...INITIAL_COLLECTIONS.onAccountPayments,
      ...INITIAL_COLLECTIONS.onAccountTransfers
    ] as unknown as OnAccountPaymentRecord[],
    onAccountTransfers: INITIAL_COLLECTIONS.onAccountTransfers as unknown as OnAccountTransferRecord[],
    budgetTransfers: INITIAL_COLLECTIONS.budgetTransfers as unknown as BudgetTransferRecord[],
    budgetRevisions: INITIAL_COLLECTIONS.budgetRevisions as unknown as BudgetRevisionRecord[],
    utilityBills: INITIAL_COLLECTIONS.utilityBills as unknown as UtilityBillRecord[],
    utilityAllocations: INITIAL_COLLECTIONS.utilityAllocations as unknown as UtilityAllocationRecord[],
    salaryDisbursements: INITIAL_COLLECTIONS.salaryDisbursements as unknown as SalaryDisbursementRecord[],
    salaryAllocations: INITIAL_COLLECTIONS.salaryAllocations as unknown as SalaryAllocationRecord[],
    clientBills: INITIAL_COLLECTIONS.clientBills as unknown as ClientBillRecord[],
    clientPayments: INITIAL_COLLECTIONS.clientPayments as unknown as ClientPaymentRecord[],
    // ── Masters ───────────────────────────────────────────────────────────────
    clients: INITIAL_COLLECTIONS.clients as unknown as ClientRecord[],
    vendors: INITIAL_COLLECTIONS.vendors as unknown as VendorRecord[],
    employees: INITIAL_COLLECTIONS.employees as unknown as EmployeeRecord[],
    items: INITIAL_COLLECTIONS.items as unknown as ItemMasterRecord[],
    inventory: INITIAL_COLLECTIONS.inventory as unknown as InventoryRecord[],
    companies: INITIAL_COLLECTIONS.companies as unknown as CompanyRecord[],
    users: INITIAL_COLLECTIONS.users as unknown as UserRecord[],
    projects: INITIAL_COLLECTIONS.projects as unknown as ProjectRecord[],
    bankAccounts: INITIAL_COLLECTIONS.bankAccounts as unknown as BankAccountRecord[],
    itemCategories: INITIAL_COLLECTIONS.itemCategories as unknown as ItemCategoryRecord[],
    units: INITIAL_COLLECTIONS.units as unknown as UnitRecord[],
    departments: INITIAL_COLLECTIONS.departments as unknown as DepartmentRecord[],
    designations: INITIAL_COLLECTIONS.designations as unknown as DesignationRecord[],
    roles: INITIAL_COLLECTIONS.roles as unknown as RoleRecord[],
    // ── Projects & sites ──────────────────────────────────────────────────────
    projectTeams: INITIAL_COLLECTIONS.projectTeams as unknown as ProjectTeamRecord[],
    tenders: INITIAL_COLLECTIONS.tenders as unknown as TenderRecord[],
    workOrders: INITIAL_COLLECTIONS.workOrders as unknown as WorkOrderRecord[],
    tasks: [
      { id: 't-101', taskCode: 'TSK-2026-001', subject: 'Finalize Joinery Vendor Rates for Lobby', description: 'Review quotation matrix for Asian Paints and Century Ply for Nexus Tech Park lobby woodwork.', assignedTo: 'Amit Dev', assignedBy: 'Rajesh Kumar', relatedSite: 'Nexus Tech Park Lobby Renovations', relatedModule: 'Procurement', relatedRecord: 'RFQ-2026-089', relatedRoute: '/procurement/rfqs', priority: 'high', assignedDate: '2026-08-15', dueDate: '2026-08-22', status: 'overdue', readDate: '2026-08-16' },
      { id: 't-102', taskCode: 'TSK-2026-002', subject: 'Verify Material GRN PO-2026-089', description: 'Inspect 500 Pcs 18mm Plywood delivered at Corporate Office site.', assignedTo: 'Amit Dev', assignedBy: 'Anita Rao', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedModule: 'GRN', relatedRecord: 'GRN-2026-014', relatedRoute: '/inventory/grn', priority: 'medium', assignedDate: '2026-08-20', dueDate: '2026-08-28', status: 'in_progress', readDate: '2026-08-21' },
      { id: 't-103', taskCode: 'TSK-2026-003', subject: 'Approve Payment Request REQ-2026-042', description: 'Final signoff on ₹14.5 L vendor payment request for Century Ply.', assignedTo: 'Amit Dev', assignedBy: 'Sanjay Mehta', relatedSite: 'Nouveau Penthouse Fitout', relatedModule: 'Finance', relatedRecord: 'PREQ-2026-042', relatedRoute: '/finance/accounts-payable', priority: 'urgent', assignedDate: '2026-08-22', dueDate: '2026-08-25', status: 'pending_acceptance', readDate: '2026-08-22' },
      { id: 't-104', taskCode: 'TSK-2026-004', subject: 'Submit Client Milestone RA Bill #3', description: 'Prepare and upload 3rd stage client billing certificate for ₹45.0 L.', assignedTo: 'Amit Dev', assignedBy: 'Priya Sharma', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedModule: 'Billing', relatedRecord: 'BILL-2026-003', relatedRoute: '/finance/client-ra-bills', priority: 'high', assignedDate: '2026-08-10', dueDate: '2026-08-20', completedDate: '2026-08-24', status: 'completed', readDate: '2026-08-11' },
      { id: 't-105', taskCode: 'TSK-2026-005', subject: 'Site Electrical Audit Inspection', description: 'Perform safety inspection for high-voltage panel room.', assignedTo: 'Rohan Verma', assignedBy: 'Amit Dev', relatedSite: 'Cyber Towers Corporate Office Fitout', relatedModule: 'Execution', relatedRecord: 'SITE-2026-004', relatedRoute: '/projects/workspace', priority: 'medium', assignedDate: '2026-08-24', dueDate: '2026-08-29', status: 'in_progress', readDate: '2026-08-24' },
      { id: 't-106', taskCode: 'TSK-2026-006', subject: 'Architect Drawing Approval for HVAC', description: 'Sign off on revised HVAC ceiling layout drawings.', assignedTo: 'Rohan Verma', assignedBy: 'Amit Dev', relatedSite: 'Nouveau Penthouse Fitout', relatedModule: 'Projects', relatedRecord: 'ARCH-2026-002', relatedRoute: '/projects/workspace', priority: 'low', assignedDate: '2026-08-18', dueDate: '2026-08-23', status: 'overdue', readDate: '2026-08-19' },
      { id: 't-107', taskCode: 'TSK-2026-007', subject: 'Review Subcontractor WIP Measurement Sheet', description: 'Cross-verify ceiling framing quantities submitted by Unique Carpentry.', assignedTo: 'Amit Dev', assignedBy: 'Rajesh Kumar', relatedSite: 'Reliance HQ Executive Floor', relatedModule: 'Subcontractor', relatedRecord: 'WO-2026-008', relatedRoute: '/procurement/work-orders', priority: 'high', assignedDate: '2026-08-25', dueDate: '2026-08-30', status: 'in_progress', readDate: '2026-08-25' },
      { id: 't-108', taskCode: 'TSK-2026-008', subject: 'Issue Material Indent IND-2026-112', description: 'Raise urgent indent for 200 sqm Italian Marble for Grand Hyatt lounge.', assignedTo: 'Anita Rao', assignedBy: 'Amit Dev', relatedSite: 'Grand Hyatt Executive Lounge Café', relatedModule: 'Procurement', relatedRecord: 'IND-2026-112', relatedRoute: '/procurement/indents', priority: 'urgent', assignedDate: '2026-08-26', dueDate: '2026-08-29', status: 'in_progress', readDate: '2026-08-26' },
      { id: 't-109', taskCode: 'TSK-2026-009', subject: 'Audit Material Gate Token Tokens', description: 'Verify gate token dispatch records for incoming glass panels.', assignedTo: 'Amit Dev', assignedBy: 'Anita Rao', relatedSite: 'Highstreet Retail Storefront', relatedModule: 'Inventory', relatedRecord: 'GT-2026-044', relatedRoute: '/inventory/gate-tokens', priority: 'medium', assignedDate: '2026-08-27', dueDate: '2026-09-01', status: 'in_progress', readDate: '2026-08-27' },
      { id: 't-110', taskCode: 'TSK-2026-010', subject: 'Vendor Pre-qualification Signoff', description: 'Complete compliance check for Asian Paints commercial contract.', assignedTo: 'Rohan Verma', assignedBy: 'Sanjay Mehta', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedModule: 'Vendor Master', relatedRecord: 'VEN-2026-002', relatedRoute: '/masters/vendors', priority: 'low', assignedDate: '2026-08-21', dueDate: '2026-08-27', status: 'completed', readDate: '2026-08-22' },
      { id: 't-111', taskCode: 'TSK-2026-011', subject: 'Finalize BOQ Change Order #2', description: 'Process client variation request for acoustic paneling upgrade.', assignedTo: 'Amit Dev', assignedBy: 'Rajesh Kumar', relatedSite: 'Apex Healthcare Medical Center', relatedModule: 'CRM', relatedRecord: 'EST-2026-019', relatedRoute: '/crm', priority: 'urgent', assignedDate: '2026-08-28', dueDate: '2026-09-02', status: 'in_progress', readDate: '2026-08-28' },
      { id: 't-112', taskCode: 'TSK-2026-012', subject: 'Verify Stock Ledger Reconciliation', description: 'Check discrepancy of 25 Ltr paint cans at Peenya central store.', assignedTo: 'Anita Rao', assignedBy: 'Amit Dev', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedModule: 'Inventory', relatedRecord: 'STK-2026-088', relatedRoute: '/inventory/stock-ledger', priority: 'high', assignedDate: '2026-08-24', dueDate: '2026-08-28', status: 'overdue', readDate: '2026-08-25' },
      { id: 't-113', taskCode: 'TSK-2026-013', subject: 'Client Signoff on Mockup Room', description: 'Conduct client walk-through of executive suite sample room.', assignedTo: 'Amit Dev', assignedBy: 'Vikram Shah', relatedSite: 'Sovereign Heights Luxury Villa', relatedModule: 'Projects', relatedRecord: 'PRJ-2026-014', relatedRoute: '/projects/workspace', priority: 'high', assignedDate: '2026-08-25', dueDate: '2026-08-31', status: 'in_progress', readDate: '2026-08-26' },
      { id: 't-114', taskCode: 'TSK-2026-014', subject: 'Reconcile Accounts Payable Outstanding', description: 'Review weekly AP aging report with Finance lead.', assignedTo: 'Rohan Verma', assignedBy: 'Sanjay Mehta', relatedSite: 'Cyber Towers Corporate Office Fitout', relatedModule: 'Finance', relatedRecord: 'AP-2026-090', relatedRoute: '/finance/accounts-payable', priority: 'medium', assignedDate: '2026-08-26', dueDate: '2026-09-03', status: 'in_progress', readDate: '2026-08-26' },
      { id: 't-115', taskCode: 'TSK-2026-015', subject: 'QC Test Certificate Clearance', description: 'Upload lab test report for fire-retardant door cores.', assignedTo: 'Amit Dev', assignedBy: 'Anita Rao', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedModule: 'QC', relatedRecord: 'QC-2026-018', relatedRoute: '/inventory/qc', priority: 'high', assignedDate: '2026-08-27', dueDate: '2026-09-04', status: 'in_progress', readDate: '2026-08-27' }
    ],
    alerts: [
      { id: 'alt-801', alertCode: 'ALT-2026-001', title: 'Site Budget Revision Clearance Needed', description: 'Project budget revision requested for structural reinforcement at Corporate Office site.', alertDate: '2026-08-28', dueDate: '2026-08-30', raisedBy: 'Rajesh Kumar', alertFor: 'Amit Dev', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'PRJ-2026-002', relatedRoute: '/projects/workspace', priority: 'high', readStatus: 'unread' },
      { id: 'alt-802', alertCode: 'ALT-2026-002', title: 'Material Delivery Exception PO-2026-089', description: 'Partial delivery of 200 Pcs gypsum board reported at site.', alertDate: '2026-08-28', dueDate: '2026-08-31', raisedBy: 'Site Logistics', alertFor: 'Amit Dev', relatedSite: 'Grand Hyatt Executive Lounge Café', relatedRecord: 'PO-2026-089', relatedRoute: '/procurement/purchase-orders', priority: 'medium', readStatus: 'unread' },
      { id: 'alt-803', alertCode: 'ALT-2026-003', title: 'Rate Finalization Approved', description: 'Chairman approved rate card for Schneider Electric fittings.', alertDate: '2026-08-27', dueDate: '2026-08-28', raisedBy: 'System Engine', alertFor: 'Amit Dev', relatedSite: 'Nouveau Penthouse Fitout', relatedRecord: 'RFQ-2026-077', relatedRoute: '/procurement/rfqs', priority: 'low', readStatus: 'read' },
      { id: 'alt-804', alertCode: 'ALT-2026-004', title: 'Client Bill Payment Received', description: 'Direct wire credit of ₹25.0 L received from Hyatt Hotels.', alertDate: '2026-08-26', dueDate: '2026-08-27', raisedBy: 'Accounts Dept', alertFor: 'Amit Dev', relatedSite: 'Grand Hyatt Executive Lounge Café', relatedRecord: 'INV-2026-031', relatedRoute: '/finance/client-ra-bills', priority: 'high', readStatus: 'read' },
      { id: 'alt-805', alertCode: 'ALT-2026-005', title: 'Vendor Payment Overdue Alert', description: 'Asian Paints invoice INV-VND-8902 overdue by 5 days.', alertDate: '2026-08-25', dueDate: '2026-08-27', raisedBy: 'System Engine', alertFor: 'Amit Dev', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'INV-VND-8902', relatedRoute: '/finance/accounts-payable', priority: 'urgent', readStatus: 'unread' },
      { id: 'alt-806', alertCode: 'ALT-2026-006', title: 'QC Rejection Notice for Plywood Lot', description: 'QC inspector flagged moisture content above allowable limit on Lot #44.', alertDate: '2026-08-28', dueDate: '2026-08-30', raisedBy: 'Quality Inspection', alertFor: 'Amit Dev', relatedSite: 'Cyber Towers Corporate Office Fitout', relatedRecord: 'QC-2026-019', relatedRoute: '/inventory/qc', priority: 'urgent', readStatus: 'unread' },
      { id: 'alt-807', alertCode: 'ALT-2026-007', title: 'Subcontractor Bill Submitted for Certification', description: 'Unique Carpentry submitted RA Bill #2 for ₹8.5 L.', alertDate: '2026-08-27', dueDate: '2026-08-31', raisedBy: 'Murugan K', alertFor: 'Amit Dev', relatedSite: 'Reliance HQ Executive Floor', relatedRecord: 'SBIL-2026-012', relatedRoute: '/finance/subcontractor-bills', priority: 'high', readStatus: 'unread' },
      { id: 'alt-808', alertCode: 'ALT-2026-008', title: 'Gate Entry Token Approved', description: 'Material Gate Token GT-2026-091 verified at site gate.', alertDate: '2026-08-26', dueDate: '2026-08-27', raisedBy: 'Gate Security', alertFor: 'Amit Dev', relatedSite: 'Nouveau Penthouse Fitout', relatedRecord: 'GT-2026-091', relatedRoute: '/inventory/gate-tokens', priority: 'low', readStatus: 'read' },
      { id: 'alt-809', alertCode: 'ALT-2026-009', title: 'Client RA Bill Certified', description: 'Client PMC certified RA Bill #4 for Corporate Office project.', alertDate: '2026-08-25', dueDate: '2026-08-29', raisedBy: 'Priya Sharma', alertFor: 'Amit Dev', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'CRAB-2026-004', relatedRoute: '/finance/client-ra-bills', priority: 'medium', readStatus: 'read' },
      { id: 'alt-810', alertCode: 'ALT-2026-010', title: 'RFQ Deadline Expiry Alert', description: 'Electrical fittings RFQ-2026-042 closing in 24 hours.', alertDate: '2026-08-28', dueDate: '2026-08-29', raisedBy: 'Procurement Bot', alertFor: 'Amit Dev', relatedSite: 'Highstreet Retail Storefront', relatedRecord: 'RFQ-2026-042', relatedRoute: '/procurement/rfqs', priority: 'high', readStatus: 'unread' },
      { id: 'alt-811', alertCode: 'ALT-2026-011', title: 'Safety Audit Non-Compliance Flagged', description: 'Temporary power cabling safety violation noted during audit.', alertDate: '2026-08-24', dueDate: '2026-08-26', raisedBy: 'Safety Officer', alertFor: 'Amit Dev', relatedSite: 'Apex Healthcare Medical Center', relatedRecord: 'SAF-2026-003', relatedRoute: '/projects/workspace', priority: 'urgent', readStatus: 'read' },
      { id: 'alt-812', alertCode: 'ALT-2026-012', title: 'Purchase Order Issued to Vendor', description: 'PO-2026-104 successfully dispatched to Saint-Gobain.', alertDate: '2026-08-23', dueDate: '2026-08-24', raisedBy: 'Anita Rao', alertFor: 'Amit Dev', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'PO-2026-104', relatedRoute: '/procurement/purchase-orders', priority: 'low', readStatus: 'read' },
      { id: 'alt-813', alertCode: 'ALT-2026-013', title: 'Low Stock Reorder Warning', description: 'Gypsum board stock at site warehouse fallen below reorder point (150 sq ft).', alertDate: '2026-08-28', dueDate: '2026-08-30', raisedBy: 'Warehouse Engine', alertFor: 'Amit Dev', relatedSite: 'Sovereign Heights Luxury Villa', relatedRecord: 'STK-2026-011', relatedRoute: '/inventory/stock-ledger', priority: 'medium', readStatus: 'unread' },
      { id: 'alt-814', alertCode: 'ALT-2026-014', title: 'Project Milestone Milestone Achieved', description: 'Civil drywall framing phase completed 2 days ahead of schedule.', alertDate: '2026-08-27', dueDate: '2026-08-28', raisedBy: 'Rajesh Kumar', alertFor: 'Amit Dev', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'PRJ-2026-002', relatedRoute: '/projects/workspace', priority: 'low', readStatus: 'read' },
      { id: 'alt-815', alertCode: 'ALT-2026-015', title: 'Bank Account Wire Transfer Confirmed', description: 'Payment of ₹12,40,000 processed for Greenlam Industries.', alertDate: '2026-08-26', dueDate: '2026-08-27', raisedBy: 'Sanjay Mehta', alertFor: 'Amit Dev', relatedSite: 'Cyber Towers Corporate Office Fitout', relatedRecord: 'PAY-2026-055', relatedRoute: '/finance/accounts-payable', priority: 'medium', readStatus: 'read' }
    ],
    messages: [
      {
        id: 'conv-1',
        userName: 'Rajesh Kumar',
        userRole: 'Project Manager',
        avatar: 'RK',
        lastMessage: 'Please review the updated Joinery rates for Corporate Office site.',
        timestamp: '10:45 AM',
        unreadCount: 1,
        relatedSite: 'Corporate Office Turnkey Interior Fitout',
        messages: [
          { id: 'm1', sender: 'Rajesh Kumar', text: 'Hi Amit, I have uploaded the joinery vendor rates.', time: '10:30 AM', isMine: false },
          { id: 'm2', sender: 'Amit Dev', text: 'Thanks Rajesh. Will verify the comparison matrix shortly.', time: '10:38 AM', isMine: true },
          { id: 'm3', sender: 'Rajesh Kumar', text: 'Please review the updated Joinery rates for Corporate Office site.', time: '10:45 AM', isMine: false }
        ]
      },
      {
        id: 'conv-2',
        userName: 'Anita Rao',
        userRole: 'Procurement Lead',
        avatar: 'AR',
        lastMessage: 'GRN inspection is completed for Grand Hyatt.',
        timestamp: 'Yesterday',
        unreadCount: 0,
        relatedSite: 'Grand Hyatt Executive Lounge Café',
        messages: [
          { id: 'm1', sender: 'Anita Rao', text: 'The plywood delivery arrived at Goa site.', time: '4:15 PM', isMine: false },
          { id: 'm2', sender: 'Amit Dev', text: 'Great, please ensure physical tally before approving GRN.', time: '4:20 PM', isMine: true },
          { id: 'm3', sender: 'Anita Rao', text: 'GRN inspection is completed for Grand Hyatt.', time: '5:00 PM', isMine: false }
        ]
      },
      {
        id: 'conv-3',
        userName: 'Sanjay Mehta',
        userRole: 'Finance Head',
        avatar: 'SM',
        lastMessage: 'Payment batch #42 sent to HDFC Bank for RTGS processing.',
        timestamp: 'Aug 28',
        unreadCount: 0,
        relatedSite: 'Nouveau Penthouse Fitout',
        messages: [
          { id: 'm1', sender: 'Sanjay Mehta', text: 'Payment batch #42 sent to HDFC Bank for RTGS processing.', time: '3:30 PM', isMine: false }
        ]
      },
      {
        id: 'conv-4',
        userName: 'Priya Sharma',
        userRole: 'Billing Engineer',
        avatar: 'PS',
        lastMessage: 'RA Bill #3 documentation sent for PMC signature.',
        timestamp: 'Aug 28',
        unreadCount: 2,
        relatedSite: 'Corporate Office Turnkey Interior Fitout',
        messages: [
          { id: 'm1', sender: 'Priya Sharma', text: 'Client PMC requested joint measurement for 4th floor partition.', time: '11:00 AM', isMine: false },
          { id: 'm2', sender: 'Priya Sharma', text: 'RA Bill #3 documentation sent for PMC signature.', time: '11:15 AM', isMine: false }
        ]
      },
      {
        id: 'conv-5',
        userName: 'Vikram Shah',
        userRole: 'Client Representative',
        avatar: 'VS',
        lastMessage: 'Veneer shade selection approved by architectural consultant.',
        timestamp: 'Aug 27',
        unreadCount: 0,
        relatedSite: 'Nouveau Penthouse Fitout',
        messages: [
          { id: 'm1', sender: 'Amit Dev', text: 'Hi Vikram, please confirm veneer sample approval.', time: '2:00 PM', isMine: true },
          { id: 'm2', sender: 'Vikram Shah', text: 'Veneer shade selection approved by architectural consultant.', time: '2:45 PM', isMine: false }
        ]
      },
      {
        id: 'conv-6',
        userName: 'Murugan K',
        userRole: 'Subcontractor Lead',
        avatar: 'MK',
        lastMessage: '2nd floor ceiling framing completed ahead of target.',
        timestamp: 'Aug 27',
        unreadCount: 0,
        relatedSite: 'Reliance HQ Executive Floor',
        messages: [
          { id: 'm1', sender: 'Murugan K', text: '2nd floor ceiling framing completed ahead of target.', time: '6:10 PM', isMine: false }
        ]
      },
      {
        id: 'conv-7',
        userName: 'Rohan Verma',
        userRole: 'Site Engineer',
        avatar: 'RV',
        lastMessage: 'Electrical panel testing scheduled for tomorrow 10 AM.',
        timestamp: 'Aug 26',
        unreadCount: 0,
        relatedSite: 'Cyber Towers Corporate Office Fitout',
        messages: [
          { id: 'm1', sender: 'Rohan Verma', text: 'Electrical panel testing scheduled for tomorrow 10 AM.', time: '5:30 PM', isMine: false }
        ]
      },
      {
        id: 'conv-8',
        userName: 'Ketan Shah',
        userRole: 'Vendor Account Manager',
        avatar: 'KS',
        lastMessage: 'Dispatched 500 Pcs fittings via VRL Logistics.',
        timestamp: 'Aug 26',
        unreadCount: 0,
        relatedSite: 'Corporate Office Turnkey Interior Fitout',
        messages: [
          { id: 'm1', sender: 'Ketan Shah', text: 'Dispatched 500 Pcs fittings via VRL Logistics.', time: '1:20 PM', isMine: false }
        ]
      },
      {
        id: 'conv-9',
        userName: 'Sunil Verma',
        userRole: 'Safety Inspector',
        avatar: 'SV',
        lastMessage: 'Weekly safety audit report uploaded to project portal.',
        timestamp: 'Aug 25',
        unreadCount: 0,
        relatedSite: 'Apex Healthcare Medical Center',
        messages: [
          { id: 'm1', sender: 'Sunil Verma', text: 'Weekly safety audit report uploaded to project portal.', time: '4:00 PM', isMine: false }
        ]
      },
      {
        id: 'conv-10',
        userName: 'Meera Patel',
        userRole: 'Architectural Consultant',
        avatar: 'MP',
        lastMessage: 'Lighting layout revision 2 attached for your review.',
        timestamp: 'Aug 25',
        unreadCount: 1,
        relatedSite: 'Sovereign Heights Luxury Villa',
        messages: [
          { id: 'm1', sender: 'Meera Patel', text: 'Lighting layout revision 2 attached for your review.', time: '11:50 AM', isMine: false }
        ]
      },
      {
        id: 'conv-11',
        userName: 'Pradeep Nair',
        userRole: 'Civil Works Head',
        avatar: 'PN',
        lastMessage: 'Slab curing complete, ready for waterproofing test.',
        timestamp: 'Aug 24',
        unreadCount: 0,
        relatedSite: 'Corporate Office Turnkey Interior Fitout',
        messages: [
          { id: 'm1', sender: 'Pradeep Nair', text: 'Slab curing complete, ready for waterproofing test.', time: '9:30 AM', isMine: false }
        ]
      },
      {
        id: 'conv-12',
        userName: 'Preet Arora',
        userRole: 'Laminate Representative',
        avatar: 'PA',
        lastMessage: 'New 2026 laminate catalog samples dispatched to office.',
        timestamp: 'Aug 24',
        unreadCount: 0,
        relatedSite: 'Highstreet Retail Storefront',
        messages: [
          { id: 'm1', sender: 'Preet Arora', text: 'New 2026 laminate catalog samples dispatched to office.', time: '3:15 PM', isMine: false }
        ]
      },
      {
        id: 'conv-13',
        userName: 'Suresh Babu',
        userRole: 'Electrical Subcontractor',
        avatar: 'SB',
        lastMessage: 'Cable pull complete for Server room distribution board.',
        timestamp: 'Aug 23',
        unreadCount: 0,
        relatedSite: 'Cyber Towers Corporate Office Fitout',
        messages: [
          { id: 'm1', sender: 'Suresh Babu', text: 'Cable pull complete for Server room distribution board.', time: '5:45 PM', isMine: false }
        ]
      },
      {
        id: 'conv-14',
        userName: 'Anand Varma',
        userRole: 'Paint Technical Specialist',
        avatar: 'AV',
        lastMessage: 'Royale Sheen batch test certificate sent by email.',
        timestamp: 'Aug 23',
        unreadCount: 0,
        relatedSite: 'Corporate Office Turnkey Interior Fitout',
        messages: [
          { id: 'm1', sender: 'Anand Varma', text: 'Royale Sheen batch test certificate sent by email.', time: '10:10 AM', isMine: false }
        ]
      },
      {
        id: 'conv-15',
        userName: 'Vikram Joshi',
        userRole: 'Saint-Gobain Tech Lead',
        avatar: 'VJ',
        lastMessage: 'Acoustic glass rating certificate verified.',
        timestamp: 'Aug 22',
        unreadCount: 0,
        relatedSite: 'Corporate Office Turnkey Interior Fitout',
        messages: [
          { id: 'm1', sender: 'Vikram Joshi', text: 'Acoustic glass rating certificate verified.', time: '4:50 PM', isMine: false }
        ]
      }
    ],
    calendarEvents: [
      { id: 'ce-1', title: 'Joinery Rates Finalization Due (TSK-2026-001)', date: '2026-08-22', type: 'task', userScope: 'my', relatedSite: 'Nexus Tech Park Lobby Renovations', relatedRecord: 'TSK-2026-001', relatedRoute: '/overview/my-tasks', details: 'Task due date for Joinery quotation matrix' },
      { id: 'ce-2', title: 'Plywood GRN Verification (TSK-2026-002)', date: '2026-08-28', type: 'task', userScope: 'my', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'TSK-2026-002', relatedRoute: '/overview/my-tasks', details: 'Physical count and moisture check for 500 Pcs plywood' },
      { id: 'ce-3', title: 'Site Budget Clearance Clearance (ALT-2026-001)', date: '2026-08-30', type: 'alert', userScope: 'my', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'ALT-2026-001', relatedRoute: '/overview/notifications', details: 'High priority budget signoff deadline' },
      { id: 'ce-4', title: 'Century Ply Shipment Expected (PO-2026-089)', date: '2026-08-31', type: 'delivery', userScope: 'my', relatedSite: 'Grand Hyatt Executive Lounge Café', relatedRecord: 'PO-2026-089', relatedRoute: '/procurement/purchase-orders', details: 'Delivery of 200 Pcs Gypsum Board' },
      { id: 'ce-5', title: 'Vendor Invoice Settlement Due (INV-VND-8902)', date: '2026-08-27', type: 'invoice', userScope: 'my', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'INV-VND-8902', relatedRoute: '/finance/accounts-payable', details: 'Asian Paints invoice due for payment' },
      { id: 'ce-6', title: 'Tender Submission Deadline (TND-2026-009)', date: '2026-09-02', type: 'tender', userScope: 'other', relatedSite: 'Cyber Towers Corporate Office Fitout', relatedRecord: 'TND-2026-009', relatedRoute: '/crm', details: 'MEP contractor tender submission deadline' },
      { id: 'ce-7', title: 'Electrical Panel Room Audit (TSK-2026-005)', date: '2026-08-29', type: 'task', userScope: 'other', relatedSite: 'Cyber Towers Corporate Office Fitout', relatedRecord: 'TSK-2026-005', relatedRoute: '/overview/my-tasks', details: 'High-voltage safety inspection' },
      { id: 'ce-8', title: 'RA Bill #3 Payment Milestone', date: '2026-08-29', type: 'billing', userScope: 'my', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'BILL-2026-003', relatedRoute: '/finance/client-ra-bills', details: 'Milestone billing receipt date' },
      { id: 'ce-9', title: 'Subcontractor WIP Certification Due', date: '2026-08-30', type: 'task', userScope: 'my', relatedSite: 'Reliance HQ Executive Floor', relatedRecord: 'WO-2026-008', relatedRoute: '/procurement/work-orders', details: 'Ceiling framing measurement signoff' },
      { id: 'ce-10', title: 'RFQ Closing Date (RFQ-2026-042)', date: '2026-08-29', type: 'alert', userScope: 'my', relatedSite: 'Highstreet Retail Storefront', relatedRecord: 'RFQ-2026-042', relatedRoute: '/procurement/rfqs', details: 'Bidding window close date' },
      { id: 'ce-11', title: 'Client Mockup Walkthrough Meeting', date: '2026-08-31', type: 'meeting', userScope: 'my', relatedSite: 'Sovereign Heights Luxury Villa', relatedRecord: 'PRJ-2026-014', relatedRoute: '/projects/workspace', details: 'Joint walk-through with client and architect' },
      { id: 'ce-12', title: 'Safety Compliance Followup Audit', date: '2026-08-26', type: 'alert', userScope: 'my', relatedSite: 'Apex Healthcare Medical Center', relatedRecord: 'SAF-2026-003', relatedRoute: '/projects/workspace', details: 'Temporary cabling safety audit' },
      { id: 'ce-13', title: 'Waterproofing Flood Test Clearance', date: '2026-09-01', type: 'task', userScope: 'other', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'SITE-2026-002', relatedRoute: '/projects/workspace', details: '24-hour flood test inspection' },
      { id: 'ce-14', title: 'Saint-Gobain Glass Delivery', date: '2026-09-03', type: 'delivery', userScope: 'my', relatedSite: 'Corporate Office Turnkey Interior Fitout', relatedRecord: 'PO-2026-104', relatedRoute: '/procurement/purchase-orders', details: '12mm tempered acoustic glass delivery' },
      { id: 'ce-15', title: 'Weekly Executive Site Progress Review', date: '2026-09-04', type: 'meeting', userScope: 'my', relatedSite: 'Nouveau Penthouse Fitout', relatedRecord: 'PRJ-2026-001', relatedRoute: '/projects/workspace', details: 'Review milestone progress with directors' }
    ],
    brands: initCollection<BrandRecord>(ROUTES.BRANDS),
    locations: initCollection<LocationRecord>(ROUTES.LOCATIONS),
    pmcs: initCollection<PMCRecord>(ROUTES.PMC),
    architects: initCollection<ArchitectRecord>(ROUTES.ARCHITECTS),
    measurementConversions: initCollection<MeasurementConversionRecord>(ROUTES.MEASUREMENT_CONVERSIONS),
  });

  // Run referential integrity validation once on mount (dev only)
  useEffect(() => { validateDemoData(); }, []);

  const getCollection = (id: WorkflowCollectionId) => collections[id] || [];

  const getRecordCode = (rec: any): { key: string; val: string } | null => {
    if (!rec) return null;
    const keys = ['brandCode', 'locationCode', 'pmcCode', 'architectCode', 'conversionCode', 'designationCode', 'code', 'empCode', 'clientCode', 'vendorCode', 'itemCode'];
    for (const k of keys) {
      if (rec[k] && typeof rec[k] === 'string' && rec[k].trim() !== '') {
        return { key: k, val: rec[k].trim().toLowerCase() };
      }
    }
    return null;
  };

  const addRecord = <T extends WorkflowCollectionId>(collection: T, record: Partial<WorkflowCollections[T][number]>) => {
    const codeInfo = getRecordCode(record);
    if (codeInfo) {
      const existing = (collections[collection] as any[]).some(r => {
        const c = getRecordCode(r);
        return c && c.key === codeInfo.key && c.val === codeInfo.val;
      });
      if (existing) {
        throw new Error(`Duplicate entry: Record with ${codeInfo.key} '${(record as any)[codeInfo.key]}' already exists.`);
      }
    }

    const newRecord = { ...record, id: record.id || `REC-${Date.now()}` } as WorkflowCollections[T][number];
    setCollections(prev => ({
      ...prev,
      [collection]: [newRecord, ...(prev[collection] as any[])] as any
    }));
  };

  const updateRecord = <T extends WorkflowCollectionId>(collection: T, id: string, record: Partial<WorkflowCollections[T][number]>) => {
    const codeInfo = getRecordCode(record);
    if (codeInfo) {
      const existing = (collections[collection] as any[]).some(r => {
        if (r.id === id) return false;
        const c = getRecordCode(r);
        return c && c.key === codeInfo.key && c.val === codeInfo.val;
      });
      if (existing) {
        throw new Error(`Duplicate entry: Record with ${codeInfo.key} '${(record as any)[codeInfo.key]}' already exists.`);
      }
    }

    setCollections(prev => ({
      ...prev,
      [collection]: (prev[collection] as any[]).map(r => r.id === id ? { ...r, ...record } : r)
    }));
  };

  const deleteRecord = (collection: WorkflowCollectionId, id: string) => {
    setCollections(prev => ({
      ...prev,
      [collection]: (prev[collection] as any[]).filter(r => r.id !== id)
    }));
  };

  const duplicateRecord = (collection: WorkflowCollectionId, id: string) => {
    setCollections(prev => {
      const records = prev[collection] as any[];
      const source = records.find(r => r.id === id);
      if (!source) return prev;
      
      const newRecord = { ...source, id: `REC-${Date.now()}` };
      const codeInfo = getRecordCode(source);
      if (codeInfo) {
        const origVal = source[codeInfo.key];
        newRecord[codeInfo.key] = `${origVal}-COPY-${Math.floor(100 + Math.random() * 900)}`;
      }
      if (newRecord.status) newRecord.status = 'active';
      if (newRecord.referenceNo) newRecord.referenceNo += ' (Copy)';
      
      return {
        ...prev,
        [collection]: [newRecord, ...records]
      };
    });
  };

  const rejectRecord = (collection: WorkflowCollectionId, id: string, comment: string) => {
    updateRecord(collection, id, { 
      status: 'rejected',
      rejectedBy: 'Current User', 
      rejectionDate: new Date().toISOString().split('T')[0],
      rejectionComment: comment
    } as any);
  };

  // --- TRANSITIONS (CHECKPOINT A) ---
  const submitIndentForApproval = (id: string) => updateRecord('indents', id, { status: 'pending_approval' });
  const approveIndent = (id: string) => updateRecord('indents', id, { status: 'approved' });
  
  const createRfqFromIndent = (indentId: string) => {
    const indent = collections.indents.find(i => i.id === indentId);
    if (!indent) return;
    
    updateRecord('indents', indentId, { status: 'converted' });
    addRecord('rfqs', {
      rfqNumber: `RFQ-GEN-${Date.now().toString().slice(-4)}`,
      indentId: indent.id,
      indentNumber: indent.indentNumber || indent.indentNo || indent.referenceNo,
      site: indent.site,
      title: indent.title || indent.subject || `RFQ for ${indent.indentNumber}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      status: 'draft',
      bidsOut: 0,
      bidsRecd: 0
    });
  };

  const recordVendorQuotation = (rfqId: string, quotationData: Partial<QuotationRecord>) => {
    addRecord('quotations', {
      rfqId,
      ...quotationData
    });
    const rfq = collections.rfqs.find(r => r.id === rfqId);
    if (!rfq) return;
    updateRecord('rfqs', rfqId, { 
      bidsRecd: (rfq.bidsRecd || 0) + 1,
      status: 'quotations_received'
    });
  };

  const finalizeRateComparison = (rateId: string) => {
    updateRecord('rateComparisons', rateId, { status: 'finalized' });
  };

  const createPurchaseOrderFromComparison = (rateId: string, vendorId: string) => {
    const rate = collections.rateComparisons.find(r => r.id === rateId);
    if (!rate) return;
    
    updateRecord('rateComparisons', rateId, { status: 'converted' });
    
    if (rate.rfqId) {
      updateRecord('rfqs', rate.rfqId, { status: 'po_issued' });
    }

    addRecord('purchaseOrders', {
      poNumber: `PO-GEN-${Date.now().toString().slice(-4)}`,
      rfqId: rate.rfqId,
      indentId: rate.indentId,
      selectedVendorId: vendorId || rate.selectedVendorId,
      site: rate.site,
      date: new Date().toISOString().split('T')[0],
      amount: rate.selectedAmount as number || rate.lowestValue as number || rate.finalAmount as number || 0,
      status: 'draft'
    });
  };

  const approvePurchaseOrder = (poId: string) => updateRecord('purchaseOrders', poId, { status: 'approved' });
  
  const createOrderFromPurchaseOrder = (poId: string) => {
    const po = collections.purchaseOrders.find(p => p.id === poId);
    if (!po) return;
    updateRecord('purchaseOrders', poId, { status: 'partially_delivered' });
    
    addRecord('orders', {
      purchaseOrderId: po.id,
      poNumber: po.poNumber,
      orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
      vendor: po.vendor,
      vendorId: po.selectedVendorId,
      site: po.site,
      status: 'created',
      amount: po.amount,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const createGrnFromOrder = (orderId: string) => {
    const order = collections.orders.find(o => o.id === orderId);
    if (!order) return;
    updateRecord('orders', orderId, { status: 'partially_received' });
    if(order.purchaseOrderId) {
      updateRecord('purchaseOrders', order.purchaseOrderId, { status: 'delivered' });
    }
    
    addRecord('grns', {
      orderId: order.id,
      purchaseOrderId: order.purchaseOrderId,
      grnNumber: `GRN-${Date.now().toString().slice(-4)}`,
      vendor: order.vendor,
      vendorId: order.vendorId,
      site: order.site,
      date: new Date().toISOString().split('T')[0],
      status: 'created' 
    });
  };

  const createInvoiceFromGrn = (grnId: string) => {
    const grn = collections.grns.find(g => g.id === grnId);
    if (!grn) return;
    
    updateRecord('grns', grnId, { status: 'completed' });
    
    const po = collections.purchaseOrders.find(p => p.id === grn.purchaseOrderId);
    
    addRecord('invoices', {
      grnId: grn.id,
      purchaseOrderId: grn.purchaseOrderId,
      invoiceNumber: `INV-VND-${Date.now().toString().slice(-4)}`,
      vendorId: po?.selectedVendorId || grn.vendorId,
      vendor: grn.vendor,
      site: grn.site,
      grossAmount: po?.amount || 0,
      certifiedAmount: po?.amount || 0,
      date: new Date().toISOString().split('T')[0],
      status: 'draft'
    });
  };

  const certifyInvoice = (invoiceId: string) => updateRecord('invoices', invoiceId, { status: 'certified' });
  
  const createPaymentRequestFromInvoice = (invoiceId: string) => {
    const inv = collections.invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    updateRecord('invoices', invoiceId, { status: 'payment_requested' });
    
    addRecord('paymentRequests', {
      invoiceId: inv.id,
      vendorId: inv.vendorId,
      requestNumber: `PREQ-${Date.now().toString().slice(-4)}`,
      vendor: inv.vendor,
      site: inv.site,
      amount: inv.certifiedAmount || inv.grossAmount || 0,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'draft'
    });
  };

  const approvePaymentRequest = (reqId: string) => updateRecord('paymentRequests', reqId, { status: 'approved' });
  
  const recordPayment = (reqId: string, paymentData: Partial<PaymentRecord>) => {
    const pReq = collections.paymentRequests.find(r => r.id === reqId);
    if (!pReq) return;
    
    updateRecord('paymentRequests', reqId, { status: 'paid' });
    if(pReq.invoiceId) {
       updateRecord('invoices', pReq.invoiceId, { status: 'paid' });
    }
    
    addRecord('payments', {
      paymentRequestId: pReq.id,
      invoiceId: pReq.invoiceId,
      vendorId: pReq.vendorId,
      paymentReference: `PAY-${Date.now().toString().slice(-4)}`,
      vendor: pReq.vendor,
      amount: paymentData.amount || pReq.amount,
      mode: (paymentData as any).mode || 'Bank Transfer',
      date: new Date().toISOString().split('T')[0],
      status: 'processed'
    });
  };

  // Note: Future Checkpoint specific methods go here
  const requestBudgetRevision = (_data: Partial<BudgetRevisionRecord>) => {};
  const processBudgetRevision = (_revId: string, _status: 'approved' | 'rejected') => {};
  const createOnAccountPaymentRequest = () => {};
  const approveOnAccountPayment = () => {};
  const transferOnAccountToInvoice = () => {};
  const transferOnAccountBetweenSites = () => {};
  const createBudgetTransfer = () => {};
  const processBudgetTransfer = () => {};
  const allocateUtilityBill = () => {};
  const completeUtilitySplit = () => {};
  const allocateSalary = () => {};
  const completeSalarySplit = () => {};
  const createAccountingInvoice = () => {};
  const createCreditNote = () => {};
  const createDebitNote = () => {};
  const createWorkOrder = () => {};
  const updateTaskStatus = (taskId: string, newStatus: string, extraData?: Record<string, any>) => {
    setCollections(prev => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => {
        if (t.id === taskId) {
          const updated = { ...t, status: newStatus, ...extraData };
          if (newStatus === 'completed' && !updated.completedDate) {
            updated.completedDate = new Date().toISOString().split('T')[0];
          }
          return updated;
        }
        return t;
      })
    }));
  };

  const reassignTask = (taskId: string, newAssignedTo: string) => {
    setCollections(prev => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, assignedTo: newAssignedTo } : t)
    }));
  };

  const markAlertRead = (alertId: string) => {
    setCollections(prev => ({
      ...prev,
      alerts: prev.alerts.map((a: any) => a.id === alertId ? { ...a, readStatus: 'read' } : a)
    }));
  };

  const markAllAlertsRead = () => {
    setCollections(prev => ({
      ...prev,
      alerts: prev.alerts.map((a: any) => ({ ...a, readStatus: 'read' }))
    }));
  };

  const deleteAlert = (alertId: string) => {
    setCollections(prev => ({
      ...prev,
      alerts: prev.alerts.filter((a: any) => a.id !== alertId)
    }));
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!text || !text.trim()) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCollections(prev => ({
      ...prev,
      messages: prev.messages.map((c: any) => {
        if (c.id === conversationId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender: 'Amit Dev',
            text: text.trim(),
            time: nowStr,
            isMine: true
          };
          return {
            ...c,
            lastMessage: text.trim(),
            timestamp: nowStr,
            messages: [...(c.messages || []), newMsg]
          };
        }
        return c;
      })
    }));
  };

  const addCalendarEvent = (evt: Record<string, any>) => {
    const newEvt = { ...evt, id: evt.id || `ce-${Date.now()}` };
    setCollections(prev => ({
      ...prev,
      calendarEvents: [newEvt as any, ...prev.calendarEvents]
    }));
  };

  return (
    <WorkflowContext.Provider
      value={{
        ...collections,
        getCollection,
        addRecord,
        updateRecord,
        deleteRecord,
        duplicateRecord,
        rejectRecord,

        submitIndentForApproval,
        approveIndent,
        createRfqFromIndent,
        recordVendorQuotation,
        finalizeRateComparison,
        createPurchaseOrderFromComparison,
        approvePurchaseOrder,
        createOrderFromPurchaseOrder,
        createGrnFromOrder,
        createInvoiceFromGrn,
        certifyInvoice,
        createPaymentRequestFromInvoice,
        approvePaymentRequest,
        recordPayment,
        
        requestBudgetRevision,
        processBudgetRevision,
        createOnAccountPaymentRequest,
        approveOnAccountPayment,
        transferOnAccountToInvoice,
        transferOnAccountBetweenSites,
        createBudgetTransfer,
        processBudgetTransfer,
        allocateUtilityBill,
        completeUtilitySplit,
        allocateSalary,
        completeSalarySplit,
        createAccountingInvoice,
        createCreditNote,
        createDebitNote,
        createWorkOrder,
        updateTaskStatus,
        reassignTask,
        markAlertRead,
        markAllAlertsRead,
        deleteAlert,
        sendMessage,
        addCalendarEvent
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
};
