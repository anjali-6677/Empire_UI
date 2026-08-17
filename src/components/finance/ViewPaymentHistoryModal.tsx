import React from 'react';
import { VendorAP } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';
import { History, X } from 'lucide-react';

interface ViewPaymentHistoryModalProps {
  ap: VendorAP;
  onClose: () => void;
}

export const ViewPaymentHistoryModal: React.FC<ViewPaymentHistoryModalProps> = ({ ap, onClose }) => {
  const history = ap.paymentHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Vendor Payment Audit History</h3>
              <p className="text-xs text-gray-500">{ap.apNumber} • {ap.vendorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs flex justify-between">
          <div>
            <span className="text-gray-500">Net Payable:</span>{' '}
            <span className="font-bold text-gray-900">{formatIndianCurrency(ap.netPayable)}</span>
          </div>
          <div>
            <span className="text-gray-500">Total Paid:</span>{' '}
            <span className="font-bold text-emerald-700">{formatIndianCurrency(ap.paidAmount)}</span>
          </div>
          <div>
            <span className="text-gray-500">Outstanding:</span>{' '}
            <span className="font-bold text-amber-800">{formatIndianCurrency(ap.outstandingAmount)}</span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
            No payment records found for this AP voucher yet.
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                  <th className="py-2.5 px-3">Payment #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">UTR / Ref</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{pay.paymentNumber}</td>
                    <td className="py-2.5 px-3 text-gray-700">{pay.paymentDate}</td>
                    <td className="py-2.5 px-3 text-gray-700">{pay.paymentMethod}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-800">{pay.paymentReference}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      {formatIndianCurrency(pay.amountPaid)}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 truncate max-w-[150px]">{pay.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-gray-100">
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
