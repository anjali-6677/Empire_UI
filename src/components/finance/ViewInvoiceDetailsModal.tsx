import React from 'react';
import { DirectInvoice } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';
import { printDirectInvoiceDocument } from '../../utils/invoicePdfGenerator';
import {
  X,
  Printer,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Paperclip,
  History,
} from 'lucide-react';

interface ViewInvoiceDetailsModalProps {
  invoice: DirectInvoice;
  onClose: () => void;
}

export const ViewInvoiceDetailsModal: React.FC<ViewInvoiceDetailsModalProps> = ({ invoice, onClose }) => {
  const isReceivable = invoice.direction === 'Receivable';

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Approved
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" /> Pending Approval
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" /> Rejected
          </span>
        );
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isReceivable ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg">Invoice #{invoice.invoiceNumber}</h3>
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${isReceivable ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {invoice.direction}
                </span>
                {getInvoiceStatusBadge(invoice.invoiceStatus)}
              </div>
              <p className="text-xs text-gray-500">
                {invoice.legalEntity} &bull; Type: <span className="font-medium text-gray-700">{invoice.invoiceType}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => printDirectInvoiceDocument(invoice)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-200/80 space-y-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Party Details</span>
              <div className="font-bold text-gray-900 text-base">{invoice.partyName}</div>
              <div className="text-xs text-gray-600">Type: {invoice.partyType}</div>
              {invoice.supplierInvoiceNumber && (
                <div className="text-xs font-mono text-gray-500">Party Ref: {invoice.supplierInvoiceNumber}</div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-200/80 space-y-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Project & Specification</span>
              <div className="font-semibold text-gray-900">{invoice.projectName || 'General Enterprise'}</div>
              <div className="text-xs text-gray-600">Reference: {invoice.referenceType} {invoice.referenceNumber ? `(${invoice.referenceNumber})` : ''}</div>
              <div className="text-xs text-gray-600">Payment Terms: {invoice.paymentTerms || 'Standard'}</div>
            </div>

            <div className="bg-amber-50/60 rounded-lg p-3.5 border border-amber-200/80 space-y-1.5 text-right">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">Invoice Value Summary</span>
              <div className="font-extrabold text-amber-900 text-xl">{formatIndianCurrency(invoice.finalInvoiceValue)}</div>
              <div className="text-xs text-emerald-700 font-semibold">
                {isReceivable ? 'Received' : 'Paid'}: {formatIndianCurrency(invoice.paidAmount)}
              </div>
              <div className="text-xs text-amber-800 font-semibold">
                Outstanding: {formatIndianCurrency(invoice.outstandingAmount)}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" /> Line Items ({invoice.lineItems.length})
            </h4>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Qty / Unit</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Discount</th>
                    <th className="py-2.5 px-3 text-center">Tax %</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {invoice.lineItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="py-2.5 px-3 text-gray-400 font-medium">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{item.description}</td>
                      <td className="py-2.5 px-3 text-gray-500">{item.category || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                        {item.qty} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-700">{formatIndianCurrency(item.rate)}</td>
                      <td className="py-2.5 px-3 text-right text-red-600">
                        {item.discount > 0 ? formatIndianCurrency(item.discount) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-600">{item.taxPercent}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                        {formatIndianCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Charges & Financial Breakdown */}
          {invoice.additionalCharges && invoice.additionalCharges.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2">Additional Charges & Adjustments</h4>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-2.5 px-3">Charge Description</th>
                      <th className="py-2.5 px-3 text-right">Base Amount</th>
                      <th className="py-2.5 px-3 text-center">Tax %</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {invoice.additionalCharges.map((chg) => (
                      <tr key={chg.id}>
                        <td className="py-2.5 px-3 font-medium text-gray-900">{chg.description}</td>
                        <td className="py-2.5 px-3 text-right text-gray-700">{formatIndianCurrency(chg.amount)}</td>
                        <td className="py-2.5 px-3 text-center text-gray-600">{chg.taxPercent}%</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                          {formatIndianCurrency(chg.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment History Audit */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" /> Payment & Collection Audit Log
            </h4>
            {invoice.paymentHistory && invoice.paymentHistory.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Payment Mode</th>
                      <th className="py-2.5 px-3">Reference #</th>
                      <th className="py-2.5 px-3">Bank Account</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {invoice.paymentHistory.map((pmt) => (
                      <tr key={pmt.id}>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">{pmt.paymentDate}</td>
                        <td className="py-2.5 px-3 text-gray-700">{pmt.paymentMode}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">{pmt.referenceNumber}</td>
                        <td className="py-2.5 px-3 text-gray-600">{pmt.bankAccount}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          {formatIndianCurrency(pmt.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-xs text-gray-500">
                No payment disbursements or receipts recorded yet.
              </div>
            )}
          </div>

          {/* Attachments Section */}
          {invoice.attachments && invoice.attachments.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-gray-600" /> Attachments ({invoice.attachments.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {invoice.attachments.map((att) => (
                  <div key={att.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-xs text-gray-900 truncate">{att.documentTitle}</div>
                        <div className="text-[11px] text-gray-400">{att.fileName} &bull; {att.uploadDate}</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer">View</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div>Created on: {new Date(invoice.createdAt).toLocaleString()} by {invoice.createdBy}</div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
