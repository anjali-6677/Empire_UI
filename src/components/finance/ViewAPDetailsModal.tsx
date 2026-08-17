import React from 'react';
import { VendorAP } from '../../domain/types';
import { printVendorAPDocument } from '../../utils/apPdfGenerator';
import { formatIndianCurrency } from '../../utils/format';
import { FileText, Printer, X } from 'lucide-react';

interface ViewAPDetailsModalProps {
  ap: VendorAP;
  onClose: () => void;
}

export const ViewAPDetailsModal: React.FC<ViewAPDetailsModalProps> = ({ ap, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Vendor Accounts Payable Voucher</h3>
              <p className="text-xs text-gray-500">{ap.apNumber} • GRN {ap.grnNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1.5">
            <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Vendor & Project</h4>
            <p><span className="text-gray-500">Vendor Name:</span> <span className="font-semibold text-gray-900">{ap.vendorName}</span></p>
            <p><span className="text-gray-500">Project Name:</span> <span className="font-medium text-gray-800">{ap.projectName}</span></p>
            <p><span className="text-gray-500">PO Number:</span> <span className="font-mono text-gray-800">{ap.poNumber || 'N/A'}</span></p>
            <p><span className="text-gray-500">Supplier Invoice #:</span> <span className="font-medium text-gray-800">{ap.invoiceNumber || 'N/A'}</span></p>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1.5">
            <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Financial Terms & Gating</h4>
            <p><span className="text-gray-500">AP Status:</span> <span className="font-bold text-gray-900">{ap.apStatus}</span></p>
            <p><span className="text-gray-500">Payment Status:</span> <span className="font-bold text-gray-900">{ap.paymentStatus}</span></p>
            <p><span className="text-gray-500">Due Date:</span> <span className="font-medium text-gray-800">{ap.dueDate}</span></p>
            <p><span className="text-gray-500">Approved By:</span> <span className="font-medium text-gray-800">{ap.approvedBy || 'Pending'}</span></p>
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 flex justify-between items-center">
          <div>
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Net Payable Amount</p>
            <p className="text-xs text-emerald-600">
              Paid: {formatIndianCurrency(ap.paidAmount)} | Outstanding: {formatIndianCurrency(ap.outstandingAmount)}
            </p>
          </div>
          <p className="text-2xl font-extrabold text-emerald-800">{formatIndianCurrency(ap.netPayable)}</p>
        </div>

        {ap.rejectionReason && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            <strong className="font-bold">Rejection Reason:</strong> {ap.rejectionReason}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <button
            onClick={() => printVendorAPDocument(ap)}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Print / Download Voucher
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
