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
  StockLedgerEntry,
  MaterialIssue,
  MaterialReturn,
  MaterialConsumption,
  SubcontractorWIP,
  WIPCertification,
  VendorAPInvoice,
  VendorPayment,
  SubcontractorBill,
  SubcontractorPayment,
  ClientRABill,
  ClientReceipt,
  AuditEvent,
} from '../domain/types';

export interface ERPCollections {
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
  grns: GoodsReceivedNote[];
  stockLedger: StockLedgerEntry[];
  materialIssues: MaterialIssue[];
  materialReturns: MaterialReturn[];
  materialConsumptions: MaterialConsumption[];
  subcontractorWIPs: SubcontractorWIP[];
  wips: SubcontractorWIP[];
  wipCertifications: WIPCertification[];
  vendorInvoices: VendorAPInvoice[];
  vendorPayments: VendorPayment[];
  subcontractorBills: SubcontractorBill[];
  subcontractorPayments: SubcontractorPayment[];
  clientRABills: ClientRABill[];
  clientReceipts: ClientReceipt[];
  auditEvents: AuditEvent[];
  projectCategories?: string[];
  propertyTypes?: string[];
}

export interface IERPRepository {
  loadAll(): Promise<ERPCollections>;
  saveCollection<K extends keyof ERPCollections>(key: K, data: ERPCollections[K]): Promise<void>;
  resetToDefaults(seedData: ERPCollections): Promise<void>;
}

const STORAGE_KEY_PREFIX = 'empire_erp_';

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
      'indents',
      'rfqs',
      'vendorQuotations',
      'rateComparisons',
      'purchaseOrders',
      'workOrders',
      'grns',
      'stockLedger',
      'materialIssues',
      'subcontractorWIPs',
      'vendorInvoices',
      'vendorPayments',
      'subcontractorBills',
      'subcontractorPayments',
      'clientRABills',
      'clientReceipts',
      'auditEvents',
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
