import React, { useState } from 'react';
import { RFQ, Vendor } from '../../domain/types';
import { Mail, MessageSquare, Check, ExternalLink, X, Send, Copy } from 'lucide-react';

interface RFQSenderShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: RFQ;
  vendors: Vendor[];
  mode: 'email' | 'whatsapp';
}

export const RFQSenderShareModal: React.FC<RFQSenderShareModalProps> = ({
  isOpen,
  onClose,
  rfq,
  vendors,
  mode,
}) => {
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>(
    rfq.invitedVendorIds || vendors.map((v) => v.id)
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const invitedVendors = vendors.filter((v) => selectedVendorIds.includes(v.id));
  const docNum = rfq.documentNumber || (rfq as any).rfqNumber || rfq.id;

  const subjectText = `[RFQ] Request for Quotation: ${docNum} - ${rfq.projectName || 'Flutebyte Project'}`;

  const messageText = `Dear Vendor Partner,

We hereby invite your quotation for Request For Quotation ${docNum} under project "${rfq.projectName}".

Key Details:
- Quote Submission Due Date: ${rfq.quoteDueDate || 'As soon as possible'}
- Required Site Delivery Date: ${rfq.requiredDate || 'As per BOQ'}
- Delivery Location: ${rfq.deliveryLocation || 'Site Office'}

Line Items for Bidding:
${(rfq.lines || []).map((l, i) => `${i + 1}. ${l.productName} (${l.quantity} ${l.unitSymbol})`).join('\n')}

Commercial Terms:
${rfq.commercialTerms || 'Standard Payment Terms Apply.'}

Please send your formal quotation with itemized rates and tax breakdown to procurement@flutebyte.com.

Best Regards,
Procurement Team
Flutebyte Technologies ERP`;

  const toggleVendor = (id: string) => {
    if (selectedVendorIds.includes(id)) {
      setSelectedVendorIds(selectedVendorIds.filter((vId) => vId !== id));
    } else {
      setSelectedVendorIds([...selectedVendorIds, id]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEmail = () => {
    const recipients = invitedVendors.map((v) => v.email || 'vendor@example.com').join(',');
    const mailtoUrl = `mailto:${recipients}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(messageText)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleOpenWhatsApp = (phone?: string) => {
    const cleanPhone = (phone || '+919876543210').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'email' ? (
              <Mail className="h-5 w-5 text-[#AB9570]" />
            ) : (
              <MessageSquare className="h-5 w-5 text-emerald-400" />
            )}
            <div>
              <div className="font-bold text-sm">
                {mode === 'email' ? 'Email RFQ to Suppliers' : 'WhatsApp RFQ to Suppliers'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {docNum} • {rfq.projectName}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800">
          {/* Vendor Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Recipient Vendors ({invitedVendors.length} Selected)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {vendors.map((v) => {
                const isSelected = selectedVendorIds.includes(v.id);
                return (
                  <div
                    key={v.id}
                    onClick={() => toggleVendor(v.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#AB9570] bg-amber-50/50 font-bold text-slate-900'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{v.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {mode === 'email' ? v.email || 'vendor@example.com' : v.phone || '+91 98765 43210'}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[#AB9570]" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject (Email mode) */}
          {mode === 'email' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Subject
              </label>
              <input
                type="text"
                readOnly
                value={subjectText}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 text-xs"
              />
            </div>
          )}

          {/* Message Template */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                RFQ Invitation Message
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied to Clipboard' : 'Copy Text'}
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={messageText}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-800 leading-relaxed focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition text-xs cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {mode === 'email' ? (
              <button
                type="button"
                onClick={handleOpenEmail}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition text-xs cursor-pointer"
              >
                <Send className="h-4 w-4 text-[#AB9570]" /> Send via Email Client
              </button>
            ) : (
              <div className="flex gap-2">
                {invitedVendors.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleOpenWhatsApp(v.phone)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition text-[11px] cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Send to {v.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
