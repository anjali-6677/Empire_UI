import React, { createContext, useContext, useState } from 'react';
import { MODULE_SCHEMAS } from '../config/moduleSchemas';
import { ROUTES } from '../config/navigation';

export type WorkflowCollectionId =
  | 'indents' | 'rfqs' | 'quotations' | 'rateComparisons' | 'purchaseOrders'
  | 'orders' | 'grns' | 'invoices' | 'paymentRequests' | 'payments'
  | 'budgetRevisions' | 'clients' | 'vendors' | 'employees' | 'items'
  | 'onAccountPayments' | 'onAccountTransfers' | 'budgetTransfers'
  | 'utilityBills' | 'utilityAllocations' | 'salaryDisbursements' 
  | 'salaryAllocations' | 'accountingInvoices' | 'creditNotes' 
  | 'debitNotes' | 'workOrders' | 'tasks' | 'alerts' | 'messages' 
  | 'calendarEvents' | 'brands' | 'locations' | 'pmcs' 
  | 'architects' | 'measurementConversions' | 'designations';

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

export type WorkflowCollections = {
  indents: IndentRecord[];
  rfqs: RFQRecord[];
  quotations: QuotationRecord[];
  rateComparisons: RateComparisonRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  orders: OrderRecord[];
  grns: GRNRecord[];
  invoices: InvoiceRecord[];
  paymentRequests: PaymentRequestRecord[];
  payments: PaymentRecord[];
  budgetRevisions: BudgetRevisionRecord[];
  clients: ClientRecord[];
  vendors: VendorRecord[];
  employees: EmployeeRecord[];
  items: ItemMasterRecord[];
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
  updateTaskStatus: () => void;
  markAlertRead: () => void;
  sendMessage: () => void;
}

const WorkflowContext = createContext<WorkflowState | undefined>(undefined);

export const getCollectionIdFromRoute = (route: string): WorkflowCollectionId => {
  switch (route) {
    case ROUTES.INDENTS: return 'indents';
    case ROUTES.RFQS: return 'rfqs';
    case ROUTES.RATE_COMPARISON: return 'rateComparisons';
    case ROUTES.PURCHASE_ORDERS: return 'purchaseOrders';
    case ROUTES.ORDERS: return 'orders';
    case ROUTES.GRNS: return 'grns';
    case ROUTES.INVOICES: return 'invoices';
    case ROUTES.PAYMENT_REQUESTS: return 'paymentRequests';
    case ROUTES.PAYMENTS: return 'payments';
    case ROUTES.PROJECT_BUDGETS: return 'budgetRevisions';
    case ROUTES.CLIENTS: return 'clients';
    case ROUTES.VENDORS: return 'vendors';
    case ROUTES.EMPLOYEES: return 'employees';
    case ROUTES.ITEMS: return 'items';
    case ROUTES.ON_ACCOUNT_DASHBOARD: return 'onAccountPayments';
    case ROUTES.BUDGET_TRANSFERS: return 'budgetTransfers';
    case ROUTES.BRANDS: return 'brands';
    case ROUTES.LOCATIONS: return 'locations';
    case ROUTES.PMC: return 'pmcs';
    case ROUTES.ARCHITECTS: return 'architects';
    case ROUTES.MEASUREMENT_CONVERSIONS: return 'measurementConversions';
    case ROUTES.DESIGNATIONS: return 'designations';
    default: return 'indents'; // Safest fallback instead of throwing
  }
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initCollection = <T extends BaseRecord>(route: string): T[] => {
    return (MODULE_SCHEMAS[route]?.mockRows as unknown as T[]) || [];
  };

  const [collections, setCollections] = useState<WorkflowCollections>({
    indents: initCollection<IndentRecord>(ROUTES.INDENTS),
    rfqs: initCollection<RFQRecord>(ROUTES.RFQS),
    quotations: [],
    rateComparisons: initCollection<RateComparisonRecord>(ROUTES.RATE_COMPARISON),
    purchaseOrders: initCollection<PurchaseOrderRecord>(ROUTES.PURCHASE_ORDERS),
    orders: initCollection<OrderRecord>(ROUTES.ORDERS),
    grns: initCollection<GRNRecord>(ROUTES.GRNS),
    invoices: initCollection<InvoiceRecord>(ROUTES.INVOICES),
    paymentRequests: initCollection<PaymentRequestRecord>(ROUTES.PAYMENT_REQUESTS),
    payments: initCollection<PaymentRecord>(ROUTES.PAYMENTS),
    budgetRevisions: initCollection<BudgetRevisionRecord>(ROUTES.PROJECT_BUDGETS),
    clients: initCollection<ClientRecord>(ROUTES.CLIENTS),
    vendors: initCollection<VendorRecord>(ROUTES.VENDORS),
    employees: initCollection<EmployeeRecord>(ROUTES.EMPLOYEES),
    items: initCollection<ItemMasterRecord>(ROUTES.ITEMS),
    onAccountPayments: initCollection<OnAccountPaymentRecord>(ROUTES.ON_ACCOUNT_DASHBOARD),
    onAccountTransfers: [],
    budgetTransfers: initCollection<BudgetTransferRecord>(ROUTES.BUDGET_TRANSFERS),
    utilityBills: [],
    utilityAllocations: [],
    salaryDisbursements: [],
    salaryAllocations: [],
    accountingInvoices: [],
    creditNotes: [],
    debitNotes: [],
    workOrders: [],
    tasks: [],
    alerts: [],
    messages: [],
    calendarEvents: [],
    brands: initCollection<BrandRecord>(ROUTES.BRANDS),
    locations: initCollection<LocationRecord>(ROUTES.LOCATIONS),
    pmcs: initCollection<PMCRecord>(ROUTES.PMC),
    architects: initCollection<ArchitectRecord>(ROUTES.ARCHITECTS),
    measurementConversions: initCollection<MeasurementConversionRecord>(ROUTES.MEASUREMENT_CONVERSIONS),
    designations: initCollection<DesignationRecord>(ROUTES.DESIGNATIONS)
  });

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
  const updateTaskStatus = () => {};
  const markAlertRead = () => {};
  const sendMessage = () => {};

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
        markAlertRead,
        sendMessage
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
