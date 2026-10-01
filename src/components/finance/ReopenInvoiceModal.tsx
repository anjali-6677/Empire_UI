import React, { useState } from 'react';
import { DirectInvoice } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../utils/format';
import { X, RefreshCw, AlertTriangle } from 'lucide-react';

interface ReopenInvoiceModalProps {
  invoice: DirectInvoice;
  onClose: () => void;
}

export const ReopenInvoiceModal: React.FC<ReopenInvoiceModalProps> = ({ invoice, onClose }) => {
  const { updateItem } = useERPStore();
  const [reopenReason, setReopenReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  const hasPayments = (invoice.paidAmount || 0) > 0 || (invoice.paymentHistory || []).length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reopenReason.trim()) {
      setError('Please provide a mandatory reason for reopening this invoice.');
      return;
    }

    updateItem('directInvoices', invoice.id, {
      invoiceStatus: 'Draft',
      reopenedBy: 'Finance Manager',
      reopenedAt: new Date().toISOString(),
      reopenReason: reopenReason.trim(),
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-amber-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Reopen Invoice</h3>
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
          {hasPayments && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Payment History Notice:</strong>
                This invoice has payments recorded ({formatIndianCurrency(invoice.paidAmount)} paid). Reopening allows editing, but existing recorded payments will be preserved.
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Reason for Reopening *
            </label>
            <textarea
              required
              rows={3}
              placeholder="State why this invoice needs to be reopened for editing (e.g. Line item correction, GST rate revision)..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Reopen to Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
