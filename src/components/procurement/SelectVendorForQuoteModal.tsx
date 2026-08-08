/**
 * Select Vendor for Quote Recording Modal
 * Location: src/components/procurement/SelectVendorForQuoteModal.tsx
 */

import React, { useState } from 'react';
import { Building2, X, PlusCircle } from 'lucide-react';
import { Vendor } from '../../domain/types';
import { Button } from '../ui/Button';

export interface SelectVendorForQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfqDocumentNumber: string;
  invitedVendors: Vendor[];
  onSelectVendor: (vendor: Vendor) => void;
}

export const SelectVendorForQuoteModal: React.FC<SelectVendorForQuoteModalProps> = ({
  isOpen,
  onClose,
  rfqDocumentNumber,
  invitedVendors,
  onSelectVendor,
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>(invitedVendors[0]?.id || '');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const v = invitedVendors.find((vendor) => vendor.id === selectedVendorId) || invitedVendors[0];
    if (v) {
      onSelectVendor(v);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans text-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <PlusCircle className="h-4 w-4 text-emerald-600" /> Record Supplier Quotation
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-slate-600">
            Select the invited supplier submitting a quotation for RFQ <strong className="font-mono text-slate-900">{rfqDocumentNumber}</strong>:
          </p>

          <div className="space-y-2">
            {invitedVendors.map((v) => (
              <label
                key={v.id}
                onClick={() => setSelectedVendorId(v.id)}
                className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                  selectedVendorId === v.id
                    ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="selectedVendor"
                    checked={selectedVendorId === v.id}
                    onChange={() => setSelectedVendorId(v.id)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" /> {v.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{v.contactPerson} • {v.phone || v.email}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {(v as any).vendorCategory || (v as any).category || 'Approved Supplier'}
                </span>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
            >
              Cancel
            </button>

            <Button variant="primary" onClick={handleConfirm}>
              Proceed to Record Quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
