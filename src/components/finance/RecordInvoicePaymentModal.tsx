import React, { useState } from 'react';
import { DirectInvoice, InvoicePaymentRecord } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../utils/format';
import { X, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface RecordInvoicePaymentModalProps {
  invoice: DirectInvoice;
  onClose: () => void;
}

export const RecordInvoicePaymentModal: React.FC<RecordInvoicePaymentModalProps> = ({ invoice, onClose }) => {
  const { state, updateItem } = useERPStore();
  const bankAccounts = state.bankAccounts || [];

  const isReceivable = invoice.direction === 'Receivable';

  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(invoice.outstandingAmount);
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer (NEFT/RTGS)');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>(
    bankAccounts[0] ? `${bankAccounts[0].bankName} - ${bankAccounts[0].accountName}` : 'HDFC Bank - Corporate Account'
  );
  const [remarks, setRemarks] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    if (amount > invoice.outstandingAmount + 0.01) {
      setError(`Amount cannot exceed the current outstanding balance of ${formatIndianCurrency(invoice.outstandingAmount)}.`);
      return;
    }

    const newPaymentRecord: InvoicePaymentRecord = {
      id: `pmt-${Date.now()}`,
      invoiceId: invoice.id,
      paymentDate,
      amount: Number(amount),
      paymentMode,
      referenceNumber: referenceNumber.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      bankAccount,
      remarks: remarks.trim(),
      recordedBy: 'Finance Executive',
      createdAt: new Date().toISOString(),
    };

    const updatedPaymentHistory = [...(invoice.paymentHistory || []), newPaymentRecord];
    const newPaidAmount = (invoice.paidAmount || 0) + Number(amount);
    const newOutstandingAmount = Math.max(0, invoice.finalInvoiceValue - newPaidAmount);

    let newPaymentStatus = invoice.paymentStatus;
    if (newOutstandingAmount <= 0.01) {
      newPaymentStatus = isReceivable ? 'Received' : 'Paid';
    } else {
      newPaymentStatus = isReceivable ? 'Partially Received' : 'Partially Paid';
    }

    updateItem('directInvoices', invoice.id, {
      paidAmount: newPaidAmount,
      outstandingAmount: newOutstandingAmount,
      paymentStatus: newPaymentStatus,
      paymentHistory: updatedPaymentHistory,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isReceivable ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isReceivable ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {isReceivable ? 'Record Receipt' : 'Record Payment'}
              </h3>
              <p className="text-xs text-gray-500 font-mono">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Banner */}
        <div className="bg-amber-50/70 border-b border-amber-200/80 px-6 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-500 block">Party:</span>
            <span className="font-semibold text-gray-900">{invoice.partyName}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 block">Outstanding Balance:</span>
            <span className="font-bold text-amber-900 text-sm">{formatIndianCurrency(invoice.outstandingAmount)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isReceivable ? 'Receipt Date *' : 'Payment Date *'}
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isReceivable ? 'Amount Received (₹) *' : 'Payment Amount (₹) *'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                max={invoice.outstandingAmount}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI / Digital Payment</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">UTR / Cheque / Ref #</label>
              <input
                type="text"
                placeholder="e.g. UTR8822991100"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isReceivable ? 'Receiving Bank Account *' : 'Paying Bank Account *'}
            </label>
            <select
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {bankAccounts.length > 0 ? (
                bankAccounts.map((b) => (
                  <option key={b.id} value={`${b.bankName} - ${b.accountName} (${b.maskedAccountNumber || b.accountNumber})`}>
                    {b.bankName} - {b.accountName} ({b.accountType})
                  </option>
                ))
              ) : (
                <>
                  <option value="HDFC Corporate Current A/c (8892)">HDFC Corporate Current A/c (8892)</option>
                  <option value="ICICI Commercial A/c (4501)">ICICI Commercial A/c (4501)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks / Payment Notes</label>
            <textarea
              rows={2}
              placeholder="Enter optional payment details or bank confirmation reference..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isReceivable ? 'Record Receipt' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
