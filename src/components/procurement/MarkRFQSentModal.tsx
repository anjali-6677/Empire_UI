/**
 * Mark RFQ as Sent Modal
 * Location: src/components/procurement/MarkRFQSentModal.tsx
 */

import React, { useState } from 'react';
import { X, Send, Mail, MessageSquare, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

export interface MarkRFQSentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfqNumber: string;
  vendorName?: string;
  onConfirm: (data: { channel: 'email' | 'whatsapp' | 'manual'; sentAt: string; recipientContact: string; note: string }) => void;
}

export const MarkRFQSentModal: React.FC<MarkRFQSentModalProps> = ({
  isOpen,
  onClose,
  rfqNumber,
  vendorName,
  onConfirm,
}) => {
  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'manual'>('email');
  const [sentAt, setSentAt] = useState<string>(new Date().toISOString().slice(0, 16));
  const [recipientContact, setRecipientContact] = useState<string>('');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      channel,
      sentAt,
      recipientContact: recipientContact || (channel === 'email' ? 'purchase@supplier.com' : '+91 98765 43210'),
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Mark RFQ as Sent</h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {rfqNumber} {vendorName ? `→ ${vendorName}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Select Dispatch Channel *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`p-2.5 rounded-lg border text-center font-semibold flex flex-col items-center gap-1 transition ${
                  channel === 'email'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-950 ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Mail className="h-4 w-4 text-amber-700" /> Email
              </button>

              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`p-2.5 rounded-lg border text-center font-semibold flex flex-col items-center gap-1 transition ${
                  channel === 'whatsapp'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-950 ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" /> WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setChannel('manual')}
                className={`p-2.5 rounded-lg border text-center font-semibold flex flex-col items-center gap-1 transition ${
                  channel === 'manual'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-950 ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-4 w-4 text-slate-600" /> Manual / Other
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Sent Date & Time *</label>
              <input
                type="datetime-local"
                value={sentAt}
                onChange={(e) => setSentAt(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-xs text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Recipient Contact</label>
              <input
                type="text"
                value={recipientContact}
                onChange={(e) => setRecipientContact(e.target.value)}
                placeholder={channel === 'email' ? 'vendor@supplier.com' : '+91 98765 43210'}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Dispatch Note / Tracking Ref (Optional)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Sent via purchase email dispatch portal with specifications attachment..."
              className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <Button variant="primary" type="submit">
              <Send className="h-3.5 w-3.5 mr-1" /> Mark as Sent
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
