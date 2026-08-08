import React from 'react';
import { CreditCard, Truck, Send, CheckCircle, Save, X } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';

interface PurchaseOrderCommercialSummaryProps {
  subtotal: number;
  discount: number;
  onDiscountChange: (val: number) => void;
  freight: number;
  onFreightChange: (val: number) => void;
  taxAmount: number;
  grandTotal: number;

  poDate: string;
  onPoDateChange: (val: string) => void;
  deliveryDate: string;
  onDeliveryDateChange: (val: string) => void;
  paymentTerms: string;
  onPaymentTermsChange: (val: string) => void;
  deliveryInstructions: string;
  onDeliveryInstructionsChange: (val: string) => void;
  generalNotes: string;
  onGeneralNotesChange: (val: string) => void;

  isDirectPO: boolean;
  directPOReason?: string;
  onDirectPOReasonChange?: (val: string) => void;

  onSaveDraft: () => void;
  onSubmitApproval: () => void;
  onIssuePO: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const PurchaseOrderCommercialSummary: React.FC<PurchaseOrderCommercialSummaryProps> = ({
  subtotal,
  discount,
  onDiscountChange,
  freight,
  onFreightChange,
  taxAmount,
  grandTotal,
  poDate,
  onPoDateChange,
  deliveryDate,
  onDeliveryDateChange,
  paymentTerms,
  onPaymentTermsChange,
  deliveryInstructions,
  onDeliveryInstructionsChange,
  generalNotes,
  onGeneralNotesChange,
  isDirectPO,
  directPOReason = '',
  onDirectPOReasonChange,
  onSaveDraft,
  onSubmitApproval,
  onIssuePO,
  onCancel,
  isSubmitting = false,
}) => {
  return (
    <div className="space-y-5 text-xs">
      {/* Direct PO Mandatory Reason */}
      {isDirectPO && onDirectPOReasonChange && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2">
          <label className="block font-bold text-amber-950 text-xs uppercase tracking-wider">
            Direct Purchase Order Reason <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={2}
            value={directPOReason}
            onChange={(e) => onDirectPOReasonChange(e.target.value)}
            placeholder="Specify mandatory reason for Direct PO (e.g., Sole OEM supplier, Proprietary fitout item, Urgent emergency site requirement...)"
            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 font-medium focus:border-amber-500 focus:outline-hidden"
          />
        </div>
      )}

      {/* Commercial Details & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Dates & Instructions */}
        <div className="lg:col-span-2 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
            <Truck className="h-4 w-4 text-[#AB9570]" /> Commercial & Delivery Instructions
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 text-[11px]">PO Date</label>
              <input
                type="date"
                value={poDate}
                onChange={(e) => onPoDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-[#AB9570]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 text-[11px]">Target Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => onDeliveryDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-[#AB9570]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 text-[11px]">Payment Terms</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => onPaymentTermsChange(e.target.value)}
                placeholder="e.g. 30% Advance, 70% on Delivery"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-[#AB9570]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 text-[11px]">Delivery Site Instructions</label>
              <textarea
                rows={2}
                value={deliveryInstructions}
                onChange={(e) => onDeliveryInstructionsChange(e.target.value)}
                placeholder="Site gate timing, unloading contact person, vehicle restrictions..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:border-[#AB9570]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 text-[11px]">General PO Terms & Notes</label>
              <textarea
                rows={2}
                value={generalNotes}
                onChange={(e) => onGeneralNotesChange(e.target.value)}
                placeholder="Standard warranty, inspection requirements, billing details..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:border-[#AB9570]"
              />
            </div>
          </div>
        </div>

        {/* Grand Total Breakdown */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-bold text-[#AB9570] text-sm flex items-center justify-between border-b border-slate-800 pb-2">
              <span>Financial Total Summary</span>
              <CreditCard className="h-4 w-4" />
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold text-white">₹{formatIndianCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Freight & Logistics:</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={freight}
                  onChange={(e) => onFreightChange(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right font-mono font-bold py-0.5 px-2 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:border-[#AB9570]"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Discount Amount:</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={discount}
                  onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right font-mono font-bold py-0.5 px-2 bg-slate-800 border border-slate-700 rounded text-xs text-emerald-400 focus:border-[#AB9570]"
                />
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>GST Tax (Estimated 18%):</span>
                <span className="font-mono font-bold text-slate-200">₹{formatIndianCurrency(taxAmount)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grand Total Purchase Order Amount</div>
            <div className="font-mono font-black text-2xl text-[#AB9570]">
              ₹{formatIndianCurrency(grandTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions (No Stepper - Clear Actions) */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between bg-white rounded-2xl p-4 shadow-xs border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <X className="h-4 w-4" /> Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSaveDraft}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-4 w-4 text-slate-600" /> Save Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmitApproval}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="h-4 w-4 text-[#AB9570]" /> Submit for Approval
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onIssuePO}
            className="px-5 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="h-4 w-4 stroke-[2.5]" /> Issue Purchase Order
          </button>
        </div>
      </div>
    </div>
  );
};
