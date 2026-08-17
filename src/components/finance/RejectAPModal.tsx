import React, { useState } from 'react';
import { VendorAP } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../utils/format';
import { AlertTriangle, XSquare, X } from 'lucide-react';

interface RejectAPModalProps {
  ap: VendorAP;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RejectAPModal: React.FC<RejectAPModalProps> = ({ ap, onClose, onSuccess }) => {
  const { rejectVendorAP } = useERPStore();
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Rejection reason is mandatory.');
      return;
    }

    const res = rejectVendorAP(ap.id, reason.trim(), 'Finance Manager');
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to reject Vendor AP record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-rose-600" /> Reject Vendor AP
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-lg border border-rose-200 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">AP Number:</span>
            <span className="font-bold text-gray-900">{ap.apNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vendor:</span>
            <span className="font-semibold text-gray-800">{ap.vendorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GRN Reference:</span>
            <span className="font-medium text-gray-800">{ap.grnNumber}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-rose-200/80">
            <span className="font-semibold text-gray-700">Net Payable Amount:</span>
            <span className="font-bold text-rose-800 text-sm">{formatIndianCurrency(ap.netPayable)}</span>
          </div>
        </div>

        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Rejection Reason <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="State clear financial or documentation grounds for rejection..."
              rows={3}
              required
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
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
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
            >
              <XSquare className="w-4 h-4 mr-1.5" /> Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
