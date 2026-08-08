import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface VendorSelectionJustificationProps {
  reason: string;
  onReasonChange: (val: string) => void;
  commercialNotes: string;
  onCommercialNotesChange: (val: string) => void;
  technicalNotes: string;
  onTechnicalNotesChange: (val: string) => void;
  selectedVendorName: string;
}

export const SELECTION_REASONS = [
  'Better Delivery Schedule / Urgent Site Requirement',
  'Favourable Payment Terms & Credit Line',
  'Client Nominated / Architect Recommended Vendor',
  'Approved Brand Specification Compliance',
  'Superior Technical Specification / Material Quality',
  'Proven Past Performance & Reliability',
  'Management Strategic Decision',
  'Other Commercial Reasons',
];

export const VendorSelectionJustification: React.FC<VendorSelectionJustificationProps> = ({
  reason,
  onReasonChange,
  commercialNotes,
  onCommercialNotesChange,
  technicalNotes,
  onTechnicalNotesChange,
  selectedVendorName,
}) => {
  return (
    <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-5 space-y-4 text-xs animate-in fade-in duration-150">
      <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
        <div className="p-1.5 bg-amber-200 text-amber-900 rounded-lg">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-bold text-amber-950 text-sm">
            Non-Lowest Vendor Selection Justification Required
          </h4>
          <p className="text-[11px] text-amber-800">
            Selected vendor (<strong className="underline">{selectedVendorName}</strong>) is not the lowest landed cost quotation (L1). Commercial justification is mandatory before PO creation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Reason Dropdown */}
        <div className="space-y-1">
          <label className="block font-bold text-amber-950 text-[11px] uppercase tracking-wider">
            Selection Reason <span className="text-rose-600">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 font-semibold focus:border-amber-500 focus:outline-hidden"
          >
            <option value="">-- Select Mandatory Selection Reason --</option>
            {SELECTION_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Commercial Justification Notes */}
        <div className="space-y-1">
          <label className="block font-bold text-amber-950 text-[11px] uppercase tracking-wider">
            Commercial Justification Details <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={2}
            value={commercialNotes}
            onChange={(e) => onCommercialNotesChange(e.target.value)}
            placeholder="Explain why higher rate was accepted (e.g. Faster site delivery saves penalty costs...)"
            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 font-medium focus:border-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Technical Notes Optional */}
      <div className="space-y-1 pt-1">
        <label className="block font-semibold text-amber-900 text-[11px]">
          Technical & Quality Justification (Optional)
        </label>
        <input
          type="text"
          value={technicalNotes}
          onChange={(e) => onTechnicalNotesChange(e.target.value)}
          placeholder="Additional technical brand or specification compliance notes..."
          className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:border-amber-500 focus:outline-hidden"
        />
      </div>
    </div>
  );
};
