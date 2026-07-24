import React, { createContext, useContext, useState } from 'react';
import { MODULE_SCHEMAS } from '../config/moduleSchemas';
import { ROUTES } from '../config/navigation';

export type WorkflowCollectionId =
  | 'indents'
  | 'rfqs'
  | 'rateComparisons'
  | 'purchaseOrders'
  | 'orders'
  | 'grns'
  | 'invoices'
  | 'paymentRequests'
  | 'payments'
  | 'budgetRevisions'
  | 'clients'
  | 'vendors'
  | 'employees'
  | 'items';

export interface WorkflowRecord {
  id: string;
  status?: string;
  referenceNo?: string;
  [key: string]: any;
}

export interface WorkflowState {
  indents: WorkflowRecord[];
  rfqs: WorkflowRecord[];
  rateComparisons: WorkflowRecord[];
  purchaseOrders: WorkflowRecord[];
  orders: WorkflowRecord[];
  grns: WorkflowRecord[];
  invoices: WorkflowRecord[];
  paymentRequests: WorkflowRecord[];
  payments: WorkflowRecord[];
  budgetRevisions: WorkflowRecord[];
  clients: WorkflowRecord[];
  vendors: WorkflowRecord[];
  employees: WorkflowRecord[];
  items: WorkflowRecord[];
  
  // Mapping helpers for generic lists if needed, but we try to explicitly call by ID
  getCollection: (id: WorkflowCollectionId | string) => WorkflowRecord[];
  addRecord: (collection: WorkflowCollectionId | string, record: Partial<WorkflowRecord>) => void;
  updateRecord: (collection: WorkflowCollectionId | string, id: string, record: Partial<WorkflowRecord>) => void;
  deleteRecord: (collection: WorkflowCollectionId | string, id: string) => void;
  duplicateRecord: (collection: WorkflowCollectionId | string, id: string) => void;

  // Specific transition methods
  submitIndentForApproval: (id: string) => void;
  approveIndent: (id: string) => void;
  createRfqFromIndent: (indentId: string) => void;
  recordVendorQuotation: (rfqId: string, quotationData: any) => void;
  finalizeRateComparison: (rateId: string) => void;
  createPurchaseOrderFromComparison: (rateId: string, vendorId: string) => void;
  approvePurchaseOrder: (poId: string) => void;
  createOrderFromPurchaseOrder: (poId: string) => void;
  createGrnFromOrder: (orderId: string) => void;
  createInvoiceFromGrn: (grnId: string) => void;
  certifyInvoice: (invoiceId: string) => void;
  createPaymentRequestFromInvoice: (invoiceId: string) => void;
  approvePaymentRequest: (reqId: string) => void;
  recordPayment: (reqId: string, paymentData: any) => void;
  requestBudgetRevision: (data: any) => void;
  processBudgetRevision: (revId: string, status: 'approved' | 'rejected') => void;
}

const WorkflowContext = createContext<WorkflowState | undefined>(undefined);

export const getCollectionIdFromRoute = (route: string): WorkflowCollectionId | string => {
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
    default: return route;
  }
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from mock rows safely
  const initCollection = (route: string): WorkflowRecord[] => {
    return (MODULE_SCHEMAS[route]?.mockRows as WorkflowRecord[]) || [];
  };

  const [collections, setCollections] = useState<Record<WorkflowCollectionId | string, WorkflowRecord[]>>({
    indents: initCollection(ROUTES.INDENTS),
    rfqs: initCollection(ROUTES.RFQS),
    rateComparisons: initCollection(ROUTES.RATE_COMPARISON),
    purchaseOrders: initCollection(ROUTES.PURCHASE_ORDERS),
    orders: initCollection(ROUTES.ORDERS),
    grns: initCollection(ROUTES.GRNS),
    invoices: initCollection(ROUTES.INVOICES),
    paymentRequests: initCollection(ROUTES.PAYMENT_REQUESTS),
    payments: initCollection(ROUTES.PAYMENTS),
    budgetRevisions: initCollection(ROUTES.PROJECT_BUDGETS),
    clients: initCollection(ROUTES.CLIENTS),
    vendors: initCollection(ROUTES.VENDORS),
    employees: initCollection(ROUTES.EMPLOYEES),
    items: initCollection(ROUTES.ITEMS),
  });

  const getCollection = (id: WorkflowCollectionId | string) => collections[id] || [];

  const addRecord = (collection: WorkflowCollectionId | string, record: Partial<WorkflowRecord>) => {
    const newRecord = { ...record, id: record.id || `REC-${Date.now()}` } as WorkflowRecord;
    setCollections(prev => ({
      ...prev,
      [collection]: [newRecord, ...(prev[collection] || [])]
    }));
  };

  const updateRecord = (collection: WorkflowCollectionId | string, id: string, record: Partial<WorkflowRecord>) => {
    setCollections(prev => ({
      ...prev,
      [collection]: (prev[collection] || []).map(r => r.id === id ? { ...r, ...record } : r)
    }));
  };

  const deleteRecord = (collection: WorkflowCollectionId | string, id: string) => {
    // Usually deactivate, but generic delete support
    setCollections(prev => ({
      ...prev,
      [collection]: (prev[collection] || []).filter(r => r.id !== id)
    }));
  };

  const duplicateRecord = (collection: WorkflowCollectionId | string, id: string) => {
    setCollections(prev => {
      const records = prev[collection] || [];
      const source = records.find(r => r.id === id);
      if (!source) return prev;
      
      const newRecord = { ...source, id: `${source.id}-COPY-${Date.now()}` };
      
      // Cleanup typical statuses for duplicates
      if (newRecord.status) newRecord.status = 'draft';
      if (newRecord.referenceNo) newRecord.referenceNo += ' (Copy)';
      
      return {
        ...prev,
        [collection]: [newRecord, ...records]
      };
    });
  };

  // ----------------------------------------------------
  // WORKFLOW SPECIFIC TRANSITIONS
  // ----------------------------------------------------

  const submitIndentForApproval = (id: string) => updateRecord('indents', id, { status: 'pending_approval' });
  const approveIndent = (id: string) => updateRecord('indents', id, { status: 'approved' });
  
  const createRfqFromIndent = (indentId: string) => {
    const indent = getCollection('indents').find(i => i.id === indentId);
    if (!indent) return;
    
    updateRecord('indents', indentId, { status: 'converted' });
    addRecord('rfqs', {
      referenceNo: `RFQ-GEN-${Date.now().toString().slice(-4)}`,
      indentId: indentId,
      site: indent.site,
      title: indent.title || indent.subject || `RFQ for ${indent.referenceNo}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      status: 'draft',
      bidsOut: 0,
      bidsRecd: 0
    });
  };

  const recordVendorQuotation = (rfqId: string, _quotationData: any) => {
    const rfq = getCollection('rfqs').find(r => r.id === rfqId);
    if (!rfq) return;
    updateRecord('rfqs', rfqId, { 
      bidsRecd: (rfq.bidsRecd || 0) + 1,
      status: 'quotations_received'
    });
    // the system could route to rate comparison here based on data
  };

  const finalizeRateComparison = (rateId: string) => {
    updateRecord('rateComparisons', rateId, { status: 'finalized' });
  };

  const createPurchaseOrderFromComparison = (rateId: string, vendorId: string) => {
    const rate = getCollection('rateComparisons').find(r => r.id === rateId);
    if (!rate) return;
    
    updateRecord('rateComparisons', rateId, { status: 'converted' });
    
    // Also mark RFQ if linked
    if (rate.rfqId) {
      updateRecord('rfqs', rate.rfqId, { status: 'po_issued' });
    }

    addRecord('purchaseOrders', {
      referenceNo: `PO-GEN-${Date.now().toString().slice(-4)}`,
      rfqId: rate.rfqId,
      indentId: rate.indentId,
      vendor: vendorId || 'Selected Vendor',
      site: rate.site,
      date: new Date().toISOString().split('T')[0],
      amount: rate.selectedAmount || rate.lowestValue || 0,
      status: 'draft'
    });
  };

  const approvePurchaseOrder = (poId: string) => updateRecord('purchaseOrders', poId, { status: 'approved' });
  
  const createOrderFromPurchaseOrder = (poId: string) => {
    const po = getCollection('purchaseOrders').find(p => p.id === poId);
    if (!po) return;
    updateRecord('purchaseOrders', poId, { status: 'active_order' }); // e.g active order
    addRecord('orders', {
      poId: poId,
      referenceNo: `ORD-${Date.now().toString().slice(-4)}`,
      vendor: po.vendor,
      site: po.site,
      status: 'pending_delivery',
      amount: po.amount,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const createGrnFromOrder = (orderId: string) => {
    const order = getCollection('orders').find(o => o.id === orderId);
    if (!order) return;
    updateRecord('orders', orderId, { status: 'delivered' });
    if(order.poId) {
      updateRecord('purchaseOrders', order.poId, { status: 'delivered' });
    }
    
    addRecord('grns', {
      orderId: orderId,
      poId: order.poId,
      referenceNo: `GRN-${Date.now().toString().slice(-4)}`,
      vendor: order.vendor,
      site: order.site,
      date: new Date().toISOString().split('T')[0],
      status: 'created' // transition to inspected -> completed later
    });
  };

  const createInvoiceFromGrn = (grnId: string) => {
    const grn = getCollection('grns').find(g => g.id === grnId);
    if (!grn) return;
    
    updateRecord('grns', grnId, { status: 'invoiced' });
    
    const po = getCollection('purchaseOrders').find(p => p.id === grn.poId);
    
    addRecord('invoices', {
      grnId: grnId,
      poId: grn.poId,
      referenceNo: `INV-VND-${Date.now().toString().slice(-4)}`,
      vendor: grn.vendor,
      site: grn.site,
      amount: po?.amount || 0,
      date: new Date().toISOString().split('T')[0],
      status: 'draft'
    });
  };

  const certifyInvoice = (invoiceId: string) => updateRecord('invoices', invoiceId, { status: 'certified' });
  
  const createPaymentRequestFromInvoice = (invoiceId: string) => {
    const inv = getCollection('invoices').find(i => i.id === invoiceId);
    if (!inv) return;
    updateRecord('invoices', invoiceId, { status: 'payment_requested' });
    
    addRecord('paymentRequests', {
      invoiceId: invoiceId,
      referenceNo: `PREQ-${Date.now().toString().slice(-4)}`,
      vendor: inv.vendor,
      site: inv.site,
      amount: inv.amount,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'draft'
    });
  };

  const approvePaymentRequest = (reqId: string) => updateRecord('paymentRequests', reqId, { status: 'approved' });
  
  const recordPayment = (reqId: string, paymentData: any) => {
    const pReq = getCollection('paymentRequests').find(r => r.id === reqId);
    if (!pReq) return;
    
    updateRecord('paymentRequests', reqId, { status: 'paid' });
    if(pReq.invoiceId) {
       updateRecord('invoices', pReq.invoiceId, { status: 'paid' });
    }
    
    addRecord('payments', {
      paymentRequestId: reqId,
      invoiceId: pReq.invoiceId,
      referenceNo: `PAY-${Date.now().toString().slice(-4)}`,
      vendor: pReq.vendor,
      amount: paymentData.amount || pReq.amount,
      mode: paymentData.mode || 'Bank Transfer',
      date: new Date().toISOString().split('T')[0],
      status: 'processed'
    });
  };

  const requestBudgetRevision = (data: any) => {
    addRecord('budgetRevisions', {
      referenceNo: `BREV-${Date.now().toString().slice(-4)}`,
      ...data,
      date: new Date().toISOString().split('T')[0],
      status: 'pending_approval'
    });
  };

  const processBudgetRevision = (revId: string, status: 'approved' | 'rejected') => {
    updateRecord('budgetRevisions', revId, { status });
  };

  return (
    <WorkflowContext.Provider
      value={{
        indents: getCollection('indents'),
        rfqs: getCollection('rfqs'),
        rateComparisons: getCollection('rateComparisons'),
        purchaseOrders: getCollection('purchaseOrders'),
        orders: getCollection('orders'),
        grns: getCollection('grns'),
        invoices: getCollection('invoices'),
        paymentRequests: getCollection('paymentRequests'),
        payments: getCollection('payments'),
        budgetRevisions: getCollection('budgetRevisions'),
        clients: getCollection('clients'),
        vendors: getCollection('vendors'),
        employees: getCollection('employees'),
        items: getCollection('items'),
        getCollection,
        addRecord,
        updateRecord,
        deleteRecord,
        duplicateRecord,

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
        processBudgetRevision
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
