import React, { useState } from 'react';
import { X, Send, Mail, MessageSquare, Truck, Download } from 'lucide-react';
import { Enquiry, Estimate } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';
import { getClientDisplayDetails } from '../../utils/crmHelpers';
import { useERPStore } from '../../store/ERPStoreContext';

interface SendQuotationModalProps {
  enquiry: Enquiry;
  estimate: Estimate;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend: (deliveryMethod: 'email' | 'whatsapp' | 'manual') => void;
}

export const SendQuotationModal: React.FC<SendQuotationModalProps> = ({
  enquiry,
  estimate,
  isOpen,
  onClose,
  onConfirmSend,
}) => {
  const { state } = useERPStore();
  const client = state.clients.find((c) => c.id === enquiry.clientId);
  const clientDetails = getClientDisplayDetails(client);
  const [method, setMethod] = useState<'email' | 'whatsapp' | 'manual'>('email');
  const [emailTo, setEmailTo] = useState(clientDetails.email !== 'N/A' ? clientDetails.email : 'client@example.com');
  const [whatsappPhone, setWhatsappPhone] = useState(clientDetails.phone !== 'N/A' ? clientDetails.phone : '+91 99200 88776');
  const [notes, setNotes] = useState(`Enclosed commercial quotation proposal ${estimate.quotationNumber}.`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSend(method);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs">
        <div className="bg-[#121214] text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570]">Dispatch Quotation</div>
            <h2 className="text-base font-bold text-white tracking-tight">Send Proposal Package to Client</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-slate-800">
          <div>
            <div className="font-bold text-sm text-slate-900">{clientDetails.clientName}</div>
            <div className="text-[11px] text-slate-500 font-mono">{estimate.quotationNumber} ({estimate.revisionLabel})</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Client Total</div>
            <div className="font-mono font-black text-[#AB9570] text-sm">
              {formatIndianCurrency(estimate.finalQuotationValue)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="block text-slate-700 font-semibold">Select Delivery Channel</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold ${
                  method === 'email'
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Mail className="h-4 w-4 text-sky-600" /> Email
              </button>

              <button
                type="button"
                onClick={() => setMethod('whatsapp')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold ${
                  method === 'whatsapp'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" /> WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setMethod('manual')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold ${
                  method === 'manual'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="h-4 w-4 text-purple-600" /> Hand Delivery
              </button>
            </div>
          </div>

          {method === 'email' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Recipient Email Address</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:border-[#AB9570]"
                required
              />
            </div>
          )}

          {method === 'whatsapp' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">WhatsApp Phone Number</label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium text-slate-900 focus:border-[#AB9570]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Dispatch Remarks</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300"
            >
              <Download className="h-4 w-4 text-[#AB9570]" /> Download PDF
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5 stroke-[2.5]" /> Confirm & Send to Client
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
