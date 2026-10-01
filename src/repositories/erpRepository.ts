/**
 * ERP Repository Contract & LocalStorage Persistence Implementation
 * Location: src/repositories/erpRepository.ts
 */

import {
  Category,
  PricingFactor,
  Product,
  Vendor,
  Subcontractor,
  Client,
  Unit,
  Employee,
  Role,
  ApprovalRule,
  Brand,
  MeasurementConversion,
  BankAccount,
  LocationMaster,
  StockLocation,
  PMCMaster,
  ArchitectMaster,
  CompanyEntity,
  Enquiry,
  Estimate,
  TenderDecision,
  Project,
  ProjectSetupDraft,
  ProjectBOQ,
  ProjectBOQLine,
  ProjectScheduleActivity,
  ProjectMilestone,
  MaterialIndent,
  RFQ,
  VendorQuotation,
  RateComparison,
  DirectPurchase,
  PurchaseOrder,
  WorkOrder,
  GoodsReceivedNote,
  GoodsReceipt,
  QualityInspection,
  QCChecklistTemplate,
  NCR,
  QuarantineItem,
  ReturnToVendor,
  MaterialEntryToken,
  MaterialReceivingCheck,
  TokenActivity,
  StockLedgerEntry,
  MaterialIssue,
  MaterialReturn,
  MaterialConsumption,
  WIPCertification,
  VendorAPInvoice,
  VendorPayment,
  SubcontractWorkOrder,
  SubcontractWIP,
  SubcontractorBill,
  AccountsPayable,
  SubcontractorPayment,
  ClientRABill,
  ClientReceipt,
  AuditEvent,
  WarehouseLocation,
  VendorAP,
  Department,
  DepartmentActivityLog,
  Designation,
  DirectInvoice,
} from '../domain/types';

export interface ERPCollections {
  brands?: Brand[];
  measurementConversions?: MeasurementConversion[];
  bankAccounts?: BankAccount[];
  locations?: LocationMaster[];
  stockLocations?: StockLocation[];
  pmcs?: PMCMaster[];
  architects?: ArchitectMaster[];
  companyEntities?: CompanyEntity[];
  departments?: Department[];
  departmentActivityLogs?: DepartmentActivityLog[];
  designations?: Designation[];
  categories: Category[];
  factors: PricingFactor[];
  products: Product[];
  vendors: Vendor[];
  subcontractors: Subcontractor[];
  clients: Client[];
  units: Unit[];
  employees: Employee[];
  roles: Role[];
  approvalRules: ApprovalRule[];
  enquiries: Enquiry[];
  estimates: Estimate[];
  tenderDecisions: TenderDecision[];
  projects: Project[];
  projectSetupDrafts?: ProjectSetupDraft[];
  projectBOQs: ProjectBOQ[];
  projectBOQLines: ProjectBOQLine[];
  projectSchedule: ProjectScheduleActivity[];
  projectMilestones: ProjectMilestone[];
  indents: MaterialIndent[];
  materialIndents: MaterialIndent[];
  rfqs: RFQ[];
  vendorQuotations: VendorQuotation[];
  rateComparisons: RateComparison[];
  directPurchases: DirectPurchase[];
  purchaseOrders: PurchaseOrder[];
  workOrders: WorkOrder[];
  subcontractWorkOrders?: SubcontractWorkOrder[];
  grns: GoodsReceivedNote[];
  stockLedger: StockLedgerEntry[];
  materialIssues: MaterialIssue[];
  materialReturns: MaterialReturn[];
  materialConsumptions: MaterialConsumption[];
  subcontractorWIPs: SubcontractWIP[];
  wips: SubcontractWIP[];
  wipCertifications: WIPCertification[];
  vendorInvoices: VendorAPInvoice[];
  vendorPayments: VendorPayment[];
  subcontractorBills: SubcontractorBill[];
  accountsPayable?: AccountsPayable[];
  subcontractorPayments: SubcontractorPayment[];
  materialEntryTokens: MaterialEntryToken[];
  materialReceivingChecks: MaterialReceivingCheck[];
  tokenActivities: TokenActivity[];
  goodsReceipts?: GoodsReceipt[];
  qualityInspections?: QualityInspection[];
  qcChecklistTemplates?: QCChecklistTemplate[];
  ncrs?: NCR[];
  quarantineItems?: QuarantineItem[];
  returnToVendors?: ReturnToVendor[];
  warehouseLocations?: WarehouseLocation[];
  clientRABills: ClientRABill[];
  clientReceipts: ClientReceipt[];
  auditEvents: AuditEvent[];
  projectCategories?: string[];
  propertyTypes?: string[];
  grnPayments?: GRNPayment[];
  vendorAPs?: VendorAP[];
  directInvoices?: DirectInvoice[];
}

export interface GRNPayment {
  id: string;
  paymentNumber: string;
  grnId: string;
  vendorId?: string;
  poId?: string;
  paymentDate: string;
  amount: number;
  paymentMode: 'Bank Transfer' | 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque' | 'Cash' | 'Other' | string;
  referenceNumber?: string;
  bankAccountId?: string;
  remarks?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface IERPRepository {
  loadAll(): Promise<ERPCollections>;
  saveCollection<K extends keyof ERPCollections>(key: K, data: ERPCollections[K]): Promise<void>;
  resetToDefaults(seedData: ERPCollections): Promise<void>;
}

const STORAGE_KEY_PREFIX = 'flutebyte_erp_';

export class LocalStorageERPRepository implements IERPRepository {
  async loadAll(): Promise<ERPCollections> {
    const collections: Partial<ERPCollections> = {};
    const keys: Array<keyof ERPCollections> = [
      'categories',
      'factors',
      'products',
      'vendors',
      'subcontractors',
      'clients',
      'units',
      'employees',
      'roles',
      'approvalRules',
      'enquiries',
      'estimates',
      'tenderDecisions',
      'projects',
      'projectSetupDrafts',
      'projectBOQs',
      'projectBOQLines',
      'projectSchedule',
      'projectMilestones',
      'indents',
      'materialIndents',
      'rfqs',
      'vendorQuotations',
      'rateComparisons',
      'directPurchases',
      'purchaseOrders',
      'workOrders',
      'subcontractWorkOrders',
      'grns',
      'goodsReceipts',
      'qualityInspections',
      'materialEntryTokens',
      'materialReceivingChecks',
      'tokenActivities',
      'grnPayments',
      'stockLedger',
      'materialIssues',
      'materialReturns',
      'materialConsumptions',
      'subcontractorWIPs',
      'wips',
      'wipCertifications',
      'vendorInvoices',
      'vendorPayments',
      'subcontractorBills',
      'accountsPayable',
      'subcontractorPayments',
      'clientRABills',
      'clientReceipts',
      'auditEvents',
      'projectCategories',
      'propertyTypes',
      'vendorAPs',
      'departments',
      'departmentActivityLogs',
      'designations',
    ];

    for (const key of keys) {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (raw) {
        try {
          collections[key] = JSON.parse(raw);
        } catch {
          collections[key] = [];
        }
      }
    }

    return collections as ERPCollections;
  }

  async saveCollection<K extends keyof ERPCollections>(key: K, data: ERPCollections[K]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + String(key), JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to persist collection ${String(key)}`, e);
    }
  }

  async resetToDefaults(seedData: ERPCollections): Promise<void> {
    for (const key of Object.keys(seedData) as Array<keyof ERPCollections>) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(seedData[key]));
    }
  }
}
