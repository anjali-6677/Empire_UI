import React, { useState } from 'react';
import { VendorAP } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../utils/format';
import { CreditCard, DollarSign, X } from 'lucide-react';

interface RecordVendorPaymentModalProps {
  ap: VendorAP;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RecordVendorPaymentModal: React.FC<RecordVendorPaymentModalProps> = ({
  ap,
  onClose,
  onSuccess,
}) => {
  const { recordVendorAPPayment } = useERPStore();

  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState<number>(ap.outstandingAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer / RTGS');
  const [paymentReference, setPaymentReference] = useState<string>(`UTR-${Date.now().toString().slice(-8)}`);
  const [payingBankAccount, setPayingBankAccount] = useState<string>('HDFC Bank - Corporate Current A/C ***4921');
  const [remarks, setRemarks] = useState<string>('Vendor AP Settlement');
  const [error, setError] = useState<string>('');

  const alreadyPaid = ap.paidAmount || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPaid <= 0) {
      setError('Payment amount must be greater than 0.');
      return;
    }
    if (amountPaid > (ap.outstandingAmount || 0) + 0.01) {
      setError(`Payment amount cannot exceed current outstanding balance (${formatIndianCurrency(ap.outstandingAmount)}).`);
      return;
    }

    const res = recordVendorAPPayment(
      ap.id,
      {
        paymentDate,
        amountPaid,
        paymentMethod,
        paymentReference,
        payingBankAccount,
        remarks,
      },
      'Finance Manager'
    );

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to record vendor payment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-[#AB9570]" /> Record Vendor Payment
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Summary */}
        <div className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-600">AP Number:</span>
            <span className="font-bold text-gray-900">{ap.apNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GRN Ref:</span>
            <span className="font-medium text-gray-800">{ap.grnNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vendor:</span>
            <span className="font-semibold text-gray-800">{ap.vendorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Project:</span>
            <span className="font-medium text-gray-800">{ap.projectName}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-amber-200/80 text-center">
            <div>
              <span className="text-[11px] text-gray-500 block">NET PAYABLE</span>
              <span className="font-bold text-gray-900">{formatIndianCurrency(ap.netPayable)}</span>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 block">ALREADY PAID</span>
              <span className="font-bold text-emerald-700">{formatIndianCurrency(alreadyPaid)}</span>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 block">OUTSTANDING</span>
              <span className="font-bold text-rose-800">{formatIndianCurrency(ap.outstandingAmount)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Date *</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                min="1"
                max={ap.outstandingAmount}
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-bold text-emerald-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="Bank Transfer / RTGS">Bank Transfer / RTGS</option>
                <option value="NEFT">NEFT</option>
                <option value="Cheque">Cheque</option>
                <option value="Corporate Credit Card">Corporate Credit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reference / UTR / Cheque # *</label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Paying Bank Account</label>
            <select
              value={payingBankAccount}
              onChange={(e) => setPayingBankAccount(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
            >
              <option value="HDFC Bank - Corporate Current A/C ***4921">HDFC Bank - Corporate Current A/C ***4921</option>
              <option value="ICICI Bank - Operations A/C ***8812">ICICI Bank - Operations A/C ***8812</option>
              <option value="State Bank of India - Project A/C ***1029">State Bank of India - Project A/C ***1029</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-[#121214] hover:bg-[#252528] rounded-lg shadow-sm"
            >
              <DollarSign className="w-4 h-4 mr-1 text-[#AB9570]" /> Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
