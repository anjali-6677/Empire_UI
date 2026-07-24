import * as React from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  ArrowLeft, 
  Edit
} from 'lucide-react';
import { ModuleSchema } from '../config/moduleSchemas';
import { StatusBadge } from './StatusBadge';
import { safeFormatCurrency } from '../utils/formatStatus';
import { useWorkflow, getCollectionIdFromRoute } from '../context/WorkflowContext';
import { ROUTES } from '../config/navigation';

interface GenericDetailsPageProps {
  schema: ModuleSchema;
}

export const GenericDetailsPage: React.FC<GenericDetailsPageProps> = ({ schema }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { getCollection, approveIndent, createRfqFromIndent, recordVendorQuotation, createPurchaseOrderFromComparison, approvePurchaseOrder, createOrderFromPurchaseOrder, createGrnFromOrder, createInvoiceFromGrn, certifyInvoice, createPaymentRequestFromInvoice, approvePaymentRequest, recordPayment } = useWorkflow();
  const collectionId = getCollectionIdFromRoute(schema.route);

  // Resolve matching row from context
  const activeRecord = React.useMemo(() => {
    const list = getCollection(collectionId);
    return list.find((r) => 
      String(r.id) === String(id) || 
      String(r.code) === String(id) || 
      String(r.referenceNo) === String(id) || 
      String(r.indentNo) === String(id) || 
      String(r.poNo) === String(id)
    );
  }, [getCollection, collectionId, id]);

  // Parent return path for Back to List button
  const parentListPath = schema.route.includes('/:') ? schema.route.split('/:')[0] : schema.route.replace(/\/new$/, '').replace(/\/edit.*$/, '');

  if (!activeRecord) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3 font-sans h-full">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Record Not Found</h2>
        <p className="text-sm font-medium text-gray-500 text-center max-w-sm">The requested record <span className="font-mono text-gray-900">{id}</span> could not be located in this module's active data store.</p>
        <button 
          onClick={() => navigate(parentListPath)} 
          className="mt-4 px-4 py-2 border border-gray-300 rounded font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer shadow-sm"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const recordCode = activeRecord.code || activeRecord.referenceNo || activeRecord.indentNo || activeRecord.poNo || activeRecord.invoiceNo || activeRecord.vendorCode || activeRecord.clientCode || activeRecord.empCode || id?.toUpperCase() || 'REC-GEN';
  const recordTitle = activeRecord.name || activeRecord.clientName || activeRecord.vendor || activeRecord.title || activeRecord.subject || `${schema.title} Record`;
  const recordStatus = activeRecord.status || 'draft';

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-14 select-none relative">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        {schema.breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className={idx === schema.breadcrumbs.length - 1 ? 'text-gray-650 font-bold' : 'cursor-pointer'}>{crumb}</span>
          </React.Fragment>
        ))}
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(parentListPath)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-600 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
                {recordCode}
              </span>
              <StatusBadge status={recordStatus as any} />
            </div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight mt-1">{recordTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {schema.route === ROUTES.INDENTS && activeRecord.status === 'pending_approval' && (
            <button onClick={() => { approveIndent(activeRecord.id); navigate(ROUTES.INDENTS); }} className="px-3 py-1.5 border border-brand-300 bg-brand-50 rounded font-bold text-brand-700 hover:bg-brand-100 cursor-pointer">Approve Indent</button>
          )}
          {schema.route === ROUTES.INDENTS && activeRecord.status === 'approved' && (
            <button onClick={() => { createRfqFromIndent(activeRecord.id); navigate(ROUTES.RFQS); }} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Generate RFQ</button>
          )}
          
          {schema.route === ROUTES.RFQS && activeRecord.status === 'draft' && (
            <button onClick={() => { recordVendorQuotation(activeRecord.id, {}); navigate(ROUTES.RATE_COMPARISON); }} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Record Quotations</button>
          )}

          {schema.route === ROUTES.RATE_COMPARISON && activeRecord.status !== 'converted' && (
            <button onClick={() => { createPurchaseOrderFromComparison(activeRecord.id, 'VND-2026-004'); navigate(ROUTES.PURCHASE_ORDERS); }} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Award PO</button>
          )}

          {schema.route === ROUTES.PURCHASE_ORDERS && activeRecord.status === 'draft' && (
            <button onClick={() => { approvePurchaseOrder(activeRecord.id); }} className="px-3 py-1.5 border border-brand-300 bg-brand-50 rounded font-bold text-brand-700 hover:bg-brand-100 cursor-pointer">Approve PO</button>
          )}
          {schema.route === ROUTES.PURCHASE_ORDERS && activeRecord.status === 'approved' && (
            <button onClick={() => { createOrderFromPurchaseOrder(activeRecord.id); navigate(ROUTES.ORDERS); }} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Release Order</button>
          )}

          {schema.route === ROUTES.ORDERS && activeRecord.status === 'pending_delivery' && (
             <button onClick={() => { createGrnFromOrder(activeRecord.id); navigate(ROUTES.GRNS); }} className="px-3 py-1.5 bg-emerald-600 rounded font-bold text-white hover:bg-emerald-700 cursor-pointer text-xs">Receive GRN</button>
          )}

          {schema.route === ROUTES.GRNS && activeRecord.status === 'created' && (
             <button onClick={() => { createInvoiceFromGrn(activeRecord.id); navigate(ROUTES.INVOICES); }} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Generate Invoice</button>
          )}

          {schema.route === ROUTES.INVOICES && activeRecord.status === 'draft' && (
             <button onClick={() => { certifyInvoice(activeRecord.id); }} className="px-3 py-1.5 border border-brand-300 bg-brand-50 rounded font-bold text-brand-700 hover:bg-brand-100 cursor-pointer">Certify Invoice</button>
          )}
          {schema.route === ROUTES.INVOICES && activeRecord.status === 'certified' && (
             <button onClick={() => { createPaymentRequestFromInvoice(activeRecord.id); navigate(ROUTES.PAYMENT_REQUESTS); }} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Request Payment</button>
          )}

          {schema.route === ROUTES.PAYMENT_REQUESTS && activeRecord.status === 'draft' && (
             <button onClick={() => { approvePaymentRequest(activeRecord.id); }} className="px-3 py-1.5 border border-brand-300 bg-brand-50 rounded font-bold text-brand-700 hover:bg-brand-100 cursor-pointer">Approve Request</button>
          )}
          {schema.route === ROUTES.PAYMENT_REQUESTS && activeRecord.status === 'approved' && (
             <button onClick={() => { recordPayment(activeRecord.id, {}); navigate(ROUTES.PAYMENTS); }} className="px-3 py-1.5 bg-emerald-600 rounded font-bold text-white hover:bg-emerald-700 cursor-pointer text-xs">Process Payment</button>
          )}

          <button
            onClick={() => navigate(parentListPath)}
            className="px-3 py-1.5 border border-gray-250 bg-white rounded font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Back to List
          </button>
          <button
            onClick={() => navigate(`${parentListPath}/new`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded font-bold shadow-sm cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" /> Edit Record
          </button>
        </div>
      </div>

      {/* Dynamic Detail Attributes */}
      <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {Object.entries(activeRecord)
              .filter(([k]) => !['id', 'items', 'status'].includes(k))
              .slice(0, 16)
              .map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-400 block text-[9.5px] uppercase font-bold">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-bold text-gray-900">
                    {typeof value === 'number' && (key.toLowerCase().includes('amount') || key.toLowerCase().includes('spend') || key.toLowerCase().includes('val') || key.toLowerCase().includes('budget') || key.toLowerCase().includes('lowest'))
                      ? safeFormatCurrency(value)
                      : String(value)}
                  </span>
                </div>
              ))}
        </div>

        {/* Item Table if present */}
        {activeRecord?.items && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Associated Line Items</h4>
            <table className="w-full text-left text-xs border border-gray-150 rounded divide-y divide-gray-100">
              <thead className="bg-gray-50 text-[9px] uppercase font-bold text-gray-500">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 text-center">UOM</th>
                  <th className="p-2.5 text-right">Quantity</th>
                  <th className="p-2.5 text-right">Rate</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {activeRecord.items.map((it: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold text-gray-800">{it.item}</td>
                    <td className="p-2.5 text-center">{it.unit}</td>
                    <td className="p-2.5 text-right font-mono">{it.qty}</td>
                    <td className="p-2.5 text-right font-mono">{it.rate}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-gray-900">{safeFormatCurrency(it.total || it.amount || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
