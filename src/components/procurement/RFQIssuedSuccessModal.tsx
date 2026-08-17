import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RFQ, Vendor } from '../../domain/types';
import { CheckCircle2, Mail, MessageSquare, ArrowRight, Download, Printer, Building2 } from 'lucide-react';
import { RFQSenderShareModal } from './RFQSenderShareModal';
import { downloadRFQPdf, printRFQPdf } from '../../utils/rfqPdfGenerator';

interface RFQIssuedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: RFQ;
  vendors: Vendor[];
}

export const RFQIssuedSuccessModal: React.FC<RFQIssuedSuccessModalProps> = ({
  isOpen,
  onClose,
  rfq,
  vendors,
}) => {
  const navigate = useNavigate();
  const [shareMode, setShareMode] = useState<'email' | 'whatsapp' | null>(null);

  const invitedVendors = vendors.filter((v) => rfq.invitedVendorIds?.includes(v.id)) || [vendors[0]];
  const [selectedVendorId, setSelectedVendorId] = useState<string>(invitedVendors[0]?.id || vendors[0]?.id || '');

  if (!isOpen) return null;

  const docNum = rfq.documentNumber || (rfq as any).rfqNumber || rfq.id;
  const currentVendor = vendors.find((v) => v.id === selectedVendorId) || invitedVendors[0] || vendors[0];

  const handleDownload = () => {
    downloadRFQPdf(rfq, currentVendor);
  };

  const handlePrint = () => {
    printRFQPdf(rfq, currentVendor);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans text-xs">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">RFQ Issued Successfully!</h2>
            <p className="text-slate-500 font-medium text-xs mt-1">
              Request for Quotation <strong className="font-mono text-slate-900">{docNum}</strong> has been created and set to <span className="text-amber-800 font-bold uppercase">Issued</span> status.
            </p>
          </div>

          {/* Target Supplier Selector */}
          {invitedVendors.length > 1 && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 text-left flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                <Building2 className="h-4 w-4 text-[#AB9570]" /> Target Supplier:
              </span>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg text-xs font-semibold px-2 py-1 text-slate-900 focus:outline-hidden"
              >
                {invitedVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Stats Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Project</span>
              <span className="font-bold text-slate-900 truncate block">{rfq.projectName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Invited Vendors</span>
              <span className="font-mono font-bold text-slate-900">{rfq.invitedVendorIds?.length || 0} Vendors</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Line Items</span>
              <span className="font-mono font-bold text-slate-900">{rfq.lines?.length || 0} Items</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Submission Due</span>
              <span className="font-mono font-bold text-amber-800">{rfq.quoteDueDate}</span>
            </div>
          </div>

          {/* Actions Grid */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">
              Supplier Communication & Document Actions
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setShareMode('email')}
                className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Mail className="h-4 w-4 text-[#AB9570]" />
                <span>Mail RFQ</span>
              </button>

              <button
                type="button"
                onClick={() => setShareMode('whatsapp')}
                className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#AB9570]" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print RFQ</span>
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/procurement/rfqs');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Return to RFQ List
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/procurement/rfqs/${rfq.id}`);
              }}
              className="px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition text-xs cursor-pointer shadow-xs"
            >
              View RFQ Details <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {shareMode && (
        <RFQSenderShareModal
          isOpen={Boolean(shareMode)}
          onClose={() => setShareMode(null)}
          rfq={rfq}
          vendors={vendors}
          mode={shareMode}
        />
      )}
    </>
  );
};
