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

  const { getCollection, approveIndent, createRfqFromIndent, recordVendorQuotation, createPurchaseOrderFromComparison, approvePurchaseOrder, createOrderFromPurchaseOrder, createGrnFromOrder, createInvoiceFromGrn, certifyInvoice, createPaymentRequestFromInvoice, approvePaymentRequest, recordPayment, rejectRecord } = useWorkflow();
  const collectionId = getCollectionIdFromRoute(schema.route);
  
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  
  const [activeTab, setActiveTab] = React.useState(schema.tabs?.[0]?.id || 'overview');

  const [isRecordingQuotations, setIsRecordingQuotations] = React.useState(false);
  const [qVendor, setQVendor] = React.useState('');
  const [qRate, setQRate] = React.useState('');
  const [qDiscount, setQDiscount] = React.useState('');
  const [qTax, setQTax] = React.useState('');
  const [qDelivery, setQDelivery] = React.useState('');

  const handleRecordQuotation = () => {
    if (!qVendor || !qRate) { alert("Vendor and Rate are required."); return; }
    recordVendorQuotation(activeRecord?.id || '', { 
       vendorId: qVendor, 
       basicRate: Number(qRate), 
       discount: qDiscount, 
       tax: qTax, 
       deliveryDays: qDelivery 
    });
    setQVendor(''); setQRate(''); setQDiscount(''); setQTax(''); setQDelivery('');
    setIsRecordingQuotations(false);
  };

  const handleReject = () => {
    if (!activeRecord?.id) return;
    const trimmed = rejectReason.trim();
    if (!trimmed || trimmed === '-' || trimmed === ',' || trimmed.replace(/["']/g, '') === '') {
      alert("A valid rejection reason is required.");
      return;
    }
    rejectRecord(collectionId, activeRecord.id, trimmed);
    setIsRejecting(false);
    setRejectReason('');
  };

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
        <p className="text-sm font-medium text-gray-500 text-center max-w-sm">The requested record does not exist in the current frontend session.</p>
        <button 
          onClick={() => navigate(parentListPath)} 
          className="mt-4 px-4 py-2 border border-gray-300 rounded font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer shadow-sm"
        >
          [Back to List]
        </button>
      </div>
    );
  }

  const recordCode = String(activeRecord.code || activeRecord.referenceNo || activeRecord.indentNo || activeRecord.poNo || activeRecord.invoiceNo || activeRecord.vendorCode || activeRecord.clientCode || activeRecord.empCode || id?.toUpperCase() || 'REC-GEN');
  const recordTitle = String(activeRecord.name || activeRecord.clientName || activeRecord.vendor || activeRecord.title || activeRecord.subject || `${schema.title} Record`);
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
            <>
              <button onClick={() => { approveIndent(activeRecord.id); }} className="px-3 py-1.5 border border-brand-300 bg-brand-50 rounded font-bold text-brand-700 hover:bg-brand-100 cursor-pointer">Approve Indent</button>
              <button onClick={() => setIsRejecting(true)} className="px-3 py-1.5 border border-rose-300 bg-rose-50 rounded font-bold text-rose-700 hover:bg-rose-100 cursor-pointer">Reject</button>
            </>
          )}
          {schema.route === ROUTES.INDENTS && activeRecord.status === 'approved' && (
            <button onClick={() => { createRfqFromIndent(activeRecord.id); navigate(ROUTES.RFQS); }} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Generate RFQ</button>
          )}
          
          {schema.route === ROUTES.RFQS && ['draft', 'sent', 'quotations_received'].includes(activeRecord.status || '') && (
            <>
              <button onClick={() => setIsRecordingQuotations(true)} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Add Quotation</button>
              {activeRecord.status === 'quotations_received' && (
                 <button onClick={() => navigate(ROUTES.RATE_COMPARISON)} className="px-3 py-1.5 bg-emerald-600 rounded font-bold text-white hover:bg-emerald-700 cursor-pointer text-xs">View Comparison</button>
              )}
            </>
          )}

          {schema.route === ROUTES.RATE_COMPARISON && activeRecord.status !== 'converted' && (
            <button onClick={() => { createPurchaseOrderFromComparison(activeRecord.id, 'VND-2026-004'); navigate(ROUTES.PURCHASE_ORDERS); }} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Award PO</button>
          )}

          {schema.route === ROUTES.PURCHASE_ORDERS && ['draft', 'pending_approval'].includes(activeRecord.status || '') && (
            <>
              <button onClick={() => { approvePurchaseOrder(activeRecord.id); }} className="px-3 py-1.5 border border-brand-300 bg-brand-50 rounded font-bold text-brand-700 hover:bg-brand-100 cursor-pointer">Approve PO</button>
              <button onClick={() => setIsRejecting(true)} className="px-3 py-1.5 border border-rose-300 bg-rose-50 rounded font-bold text-rose-700 hover:bg-rose-100 cursor-pointer">Reject</button>
            </>
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

          {schema.route === ROUTES.INVOICES && ['draft', 'pending_approval'].includes(activeRecord.status || '') && (
             <>
               <button onClick={() => { certifyInvoice(activeRecord.id); }} className="px-3 py-1.5 border border-brand-300 bg-brand-50 rounded font-bold text-brand-700 hover:bg-brand-100 cursor-pointer">Certify Invoice</button>
               <button onClick={() => setIsRejecting(true)} className="px-3 py-1.5 border border-rose-300 bg-rose-50 rounded font-bold text-rose-700 hover:bg-rose-100 cursor-pointer">Reject</button>
             </>
          )}
          {schema.route === ROUTES.INVOICES && activeRecord.status === 'certified' && (
             <button onClick={() => { createPaymentRequestFromInvoice(activeRecord.id); navigate(ROUTES.PAYMENT_REQUESTS); }} className="px-3 py-1.5 bg-brand-600 rounded font-bold text-white hover:bg-brand-700 cursor-pointer text-xs">Request Payment</button>
          )}

          {schema.route === ROUTES.PAYMENT_REQUESTS && ['draft', 'pending_approval'].includes(activeRecord.status || '') && (
             <>
               <button onClick={() => { approvePaymentRequest(activeRecord.id); }} className="px-3 py-1.5 border border-brand-300 bg-brand-50 rounded font-bold text-brand-700 hover:bg-brand-100 cursor-pointer">Approve Request</button>
               <button onClick={() => setIsRejecting(true)} className="px-3 py-1.5 border border-rose-300 bg-rose-50 rounded font-bold text-rose-700 hover:bg-rose-100 cursor-pointer">Reject</button>
             </>
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

      {isRejecting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-lg p-5">
          <div className="bg-white rounded-lg shadow-xl w-[400px] border border-gray-200 flex flex-col overflow-hidden animate-slide-up-fade">
             <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
               <h3 className="font-extrabold text-gray-900">Provide Rejection Reason</h3>
               <button onClick={() => setIsRejecting(false)} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
             </div>
             <div className="p-4 flex flex-col gap-3">
               <textarea 
                 value={rejectReason}
                 onChange={(e) => setRejectReason(e.target.value)}
                 className="w-full border border-gray-300 rounded p-2 text-xs focus:ring focus:ring-brand-200 outline-none resize-none h-24"
                 placeholder="Please provide explicit details for rejecting this record..."
               ></textarea>
               <div className="flex justify-end gap-2 mt-2">
                 <button onClick={() => setIsRejecting(false)} className="px-4 py-2 border border-gray-300 rounded font-bold text-gray-600 bg-white hover:bg-gray-50">Cancel</button>
                 <button onClick={handleReject} className="px-4 py-2 bg-rose-600 text-white rounded font-bold hover:bg-rose-700">Confirm Rejection</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {isRecordingQuotations && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-lg p-5">
          <div className="bg-white rounded-lg shadow-xl w-[400px] border border-gray-200 flex flex-col overflow-hidden animate-slide-up-fade">
             <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
               <h3 className="font-extrabold text-gray-900">Record Vendor Quotation</h3>
               <button onClick={() => setIsRecordingQuotations(false)} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
             </div>
             <div className="p-4 flex flex-col gap-3">
               <input value={qVendor} onChange={e => setQVendor(e.target.value)} placeholder="Vendor Name (e.g. Century Plyboards)" className="w-full border border-gray-300 rounded p-2 text-xs" />
               <input value={qRate} onChange={e => setQRate(e.target.value)} placeholder="Basic Rate (e.g. 2200)" type="number" className="w-full border border-gray-300 rounded p-2 text-xs" />
               <input value={qDiscount} onChange={e => setQDiscount(e.target.value)} placeholder="Discount (e.g. 5%)" className="w-full border border-gray-300 rounded p-2 text-xs" />
               <input value={qTax} onChange={e => setQTax(e.target.value)} placeholder="Tax (e.g. 18%)" className="w-full border border-gray-300 rounded p-2 text-xs" />
               <input value={qDelivery} onChange={e => setQDelivery(e.target.value)} placeholder="Delivery Days (e.g. 7)" className="w-full border border-gray-300 rounded p-2 text-xs" />
               <div className="flex justify-end gap-2 mt-2">
                 <button onClick={() => setIsRecordingQuotations(false)} className="px-4 py-2 border border-gray-300 rounded font-bold text-gray-600 bg-white">Cancel</button>
                 <button onClick={handleRecordQuotation} className="px-4 py-2 bg-brand-600 text-white rounded font-bold">Save Quotation</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Parity Tabs Header */}
      {schema.tabs && schema.tabs.length > 0 && (
        <div className="flex border-b border-gray-200 mt-2 mb-4 overflow-x-auto">
          {schema.tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-bold text-xs whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Dynamic Detail Attributes */}
      {(!schema.tabs || activeTab === schema.tabs?.[0]?.id || activeTab === 'overview') ? (
        <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {Object.entries(activeRecord)
              .filter(([k]) => !['id', 'items', 'status'].includes(k))
              .map(([key, value]) => {
                const dispValue = typeof value === 'number' && (key.toLowerCase().includes('amount') || key.toLowerCase().includes('spend') || key.toLowerCase().includes('val') || key.toLowerCase().includes('budget') || key.toLowerCase().includes('lowest'))
                  ? safeFormatCurrency(value as number)
                  : String(value as string | number | boolean);
                return (
                <div key={key}>
                  <span className="text-gray-400 block text-[9.5px] uppercase font-bold">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className={`font-bold text-gray-900 ${key === 'rejectionComment' ? 'text-rose-600' : ''}`}>
                    {dispValue}
                  </span>
                </div>
                );
              })}
        </div>

        {/* Item Table if present */}
        {Array.isArray(activeRecord?.items) && (
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
                {(activeRecord.items as any[]).map((it: any, idx: number) => (
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
      ) : (
        <div className="bg-white border border-gray-150 rounded-lg p-10 flex flex-col items-center justify-center text-center shadow-sm">
           <div className="text-gray-400 font-bold text-sm mb-2 uppercase tracking-wide">{schema.tabs?.find(t => t.id === activeTab)?.label} Integration</div>
           <p className="text-gray-500 font-medium text-xs">This view pulls aggregated contextual records for the active site.</p>
        </div>
      )}
    </div>
  );
};
