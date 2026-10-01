import React, { useState } from 'react';
import { DirectInvoice, CreditDebitNote } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { X, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface CreateCreditDebitNoteModalProps {
  invoice: DirectInvoice;
  onClose: () => void;
}

export const CreateCreditDebitNoteModal: React.FC<CreateCreditDebitNoteModalProps> = ({ invoice, onClose }) => {
  const { updateItem } = useERPStore();
  const [noteType, setNoteType] = useState<'Credit Note' | 'Debit Note'>('Credit Note');
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0) {
      setError('Please enter a valid note amount greater than zero.');
      return;
    }

    if (!reason.trim()) {
      setError('Please enter a reason for issuing this Credit/Debit note.');
      return;
    }

    const noteNumber = `${noteType === 'Credit Note' ? 'CN' : 'DN'}/2026/${Math.floor(100 + Math.random() * 900)}`;

    const newNote: CreditDebitNote = {
      id: `cdn-${Date.now()}`,
      noteNumber,
      type: noteType,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: new Date().toISOString().split('T')[0],
      partyName: invoice.partyName,
      amount: Number(amount),
      reason: reason.trim(),
      remarks: remarks.trim(),
      status: 'Issued',
      createdAt: new Date().toISOString(),
    };

    const updatedNotesHistory = [...(invoice.notesHistory || []), newNote];

    // Adjust outstanding balance: Credit Note decreases balance, Debit Note increases balance
    let newFinalValue = invoice.finalInvoiceValue;
    if (noteType === 'Credit Note') {
      newFinalValue = Math.max(0, invoice.finalInvoiceValue - Number(amount));
    } else {
      newFinalValue = invoice.finalInvoiceValue + Number(amount);
    }

    const newOutstanding = Math.max(0, newFinalValue - (invoice.paidAmount || 0));

    updateItem('directInvoices', invoice.id, {
      finalInvoiceValue: newFinalValue,
      outstandingAmount: newOutstanding,
      notesHistory: updatedNotesHistory,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Issue Credit / Debit Note</h3>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Note Type *</label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as 'Credit Note' | 'Debit Note')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Credit Note">Credit Note (Reduce Invoice Value)</option>
                <option value="Debit Note">Debit Note (Increase Invoice Value)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Adjustment Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Note *</label>
            <input
              type="text"
              required
              placeholder="e.g. Quantity short supply rebate / Price rate correction"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Additional Remarks</label>
            <textarea
              rows={2}
              placeholder="Optional remarks or legal references..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Issue Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
