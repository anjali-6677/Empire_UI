import React from 'react';
import { VendorAP } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../utils/format';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface ApproveAPModalProps {
  ap: VendorAP;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApproveAPModal: React.FC<ApproveAPModalProps> = ({ ap, onClose, onSuccess }) => {
  const { approveVendorAP } = useERPStore();

  const handleApprove = () => {
    const res = approveVendorAP(ap.id, 'Finance Manager');
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      alert(res.error || 'Failed to approve Vendor AP record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" /> Approve Vendor AP
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-lg border border-emerald-200 text-xs space-y-2">
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
          <div className="flex justify-between">
            <span className="text-gray-600">PO Number:</span>
            <span className="font-medium text-gray-800">{ap.poNumber || 'N/A'}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-emerald-200/80">
            <span className="font-semibold text-gray-700">Net Payable Amount:</span>
            <span className="font-bold text-emerald-800 text-sm">{formatIndianCurrency(ap.netPayable)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Approving this Vendor Accounts Payable record will authorize the liability in the financial ledger and enable payment disbursal processing.
        </p>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve AP Record
          </button>
        </div>
      </div>
    </div>
  );
};
