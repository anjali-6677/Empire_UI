import React from 'react';
import { Send, Download, Printer, FileText } from 'lucide-react';
import { Enquiry, Estimate } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';
import { getClientDisplayDetails, normalizeEnquiryRequirement } from '../../utils/crmHelpers';
import { useERPStore } from '../../store/ERPStoreContext';

interface QuotationPreviewProps {
  enquiry: Enquiry;
  estimate: Estimate;
  onSendToClient?: () => void;
  readOnly?: boolean;
}

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  enquiry,
  estimate,
  onSendToClient,
  readOnly = false,
}) => {
  const { state } = useERPStore();
  const client = state.clients.find((c) => c.id === enquiry.clientId);
  const clientDetails = getClientDisplayDetails(client);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Triggers standard print-to-PDF layout view
    window.print();
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner Actions (Hidden on Print) */}
      <div className="bg-[#121214] text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800 print:hidden">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570]">Step 6: Executive Commercial Proposal</div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#AB9570]" /> Client Proposal Package & Terms
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg border border-slate-700"
          >
            <Printer className="h-4 w-4 text-[#AB9570]" /> Print Proposal
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-[#AB9570] font-bold rounded-lg border border-slate-700"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>

          {!readOnly && onSendToClient && (
            <button
              type="button"
              onClick={onSendToClient}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-lg shadow-md"
            >
              <Send className="h-4 w-4 stroke-[2.5]" /> Send to Client
            </button>
          )}
        </div>
      </div>

      {/* Quotation Document Container (Print-optimized) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header & Empire Branding */}
        <div className="flex items-start justify-between border-b-2 border-[#AB9570] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#121214] flex items-center justify-center text-[#AB9570] font-black text-xl border border-[#AB9570]/50 shadow-sm">
                E
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">EMPIRE INTERIOR</h1>
                <p className="text-[10px] font-bold text-[#AB9570] uppercase tracking-widest">Luxury Commercial & Residential Fitouts</p>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 space-y-0.5 font-medium">
              <p>Empire Interior Pvt Ltd • Worli Sea Face, Mumbai 400018</p>
              <p>Email: commercial@empireinterior.com • Web: www.empireinterior.com</p>
              <p>GSTIN: 27AAAAA0000A1Z5</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 font-mono font-bold text-xs uppercase">
              COMMERCIAL PROPOSAL
            </div>
            <div className="font-mono font-black text-base text-slate-900">{estimate.quotationNumber}</div>
            <div className="text-[11px] text-slate-600 font-medium">Revision: <span className="font-mono font-bold text-[#AB9570]">{estimate.revisionLabel}</span></div>
            <div className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Client & Project Information Card */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">PREPARED FOR CLIENT</span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">{clientDetails.clientName}</h3>
            <div className="text-[11px] text-slate-600 space-y-0.5 mt-1">
              <p><span className="font-semibold">Contact Person:</span> {clientDetails.contactPerson}</p>
              <p><span className="font-semibold">Phone:</span> {clientDetails.phone} • <span className="font-semibold">Email:</span> {clientDetails.email}</p>
              <p><span className="font-semibold">Billing Address:</span> {clientDetails.billingAddress !== 'Not available in Client Master' ? clientDetails.billingAddress : enquiry.location}</p>
              {clientDetails.gstin !== 'N/A' && <p><span className="font-semibold">GSTIN:</span> {clientDetails.gstin}</p>}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">PROJECT SPECIFICATION</span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">{normalizeEnquiryRequirement(enquiry.projectRequirement)}</h3>
            <div className="text-[11px] text-slate-600 space-y-0.5 mt-1">
              <p><span className="font-semibold">Enquiry Ref:</span> {enquiry.enquiryNumber}</p>
              <p><span className="font-semibold">Category:</span> {enquiry.projectType || 'Commercial'} ({enquiry.propertyType || 'Standard'})</p>
              <p><span className="font-semibold">Project Area:</span> {enquiry.approximateArea ? `${enquiry.approximateArea} ${enquiry.areaUnit || 'sqft'}` : 'As per layout'}</p>
              <p><span className="font-semibold">Estimator:</span> {enquiry.assignedEstimatorName}</p>
            </div>
          </div>
        </div>

        {/* BOQ Summary Table (CONFIDENTIALITY SAFE - No internal costs or profit rates) */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
            1. Bill of Quantities & Scope Breakdown
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121214] text-white font-bold text-[11px] uppercase">
                  <th className="py-2.5 px-3">Sr</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {estimate.boqSections.map((sec, sIdx) => (
                  <React.Fragment key={sec.id}>
                    <tr className="bg-slate-100 font-bold text-slate-900 text-xs">
                      <td colSpan={5} className="py-2 px-3">
                        Section {sIdx + 1}: {sec.name}
                      </td>
                    </tr>
                    {sec.items.map((item, iIdx) => (
                      <tr key={item.id} className="hover:bg-slate-50 text-slate-800">
                        <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{sIdx + 1}.{iIdx + 1}</td>
                        <td className="py-2 px-3 font-medium">
                          <div>{item.description || item.productName}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{item.quantity} {item.unit}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatIndianCurrency(item.baseRate)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">{formatIndianCurrency(item.totalCost)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commercial Proposal Total Banner */}
        <div className="bg-[#121214] text-white p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-[#AB9570]/40">
          <div>
            <div className="text-[10px] font-bold text-[#AB9570] uppercase tracking-widest">FINAL PROPOSAL COMMERCIAL TOTAL</div>
            <div className="text-xs text-slate-300">Includes all line works, overheads, logistics, and 18% GST</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-black text-[#AB9570]">
              {formatIndianCurrency(estimate.finalQuotationValue)}
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
            2. Commercial Terms & Payment Milestones
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {estimate.paymentTerms.map((pt, idx) => (
              <div key={pt.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{pt.stageName}</span>
                  <span className="font-mono font-bold text-[#AB9570] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {pt.percentage}% ({formatIndianCurrency(pt.amount)})
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{pt.dueCondition || pt.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Terms & Conditions */}
        <div className="space-y-2 text-[11px] text-slate-600 border-t border-slate-200 pt-4">
          <h4 className="font-bold text-slate-900">Terms & Conditions:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Quotation validity: 30 days from issuance date.</li>
            <li>Any structural modifications or client scope additions will be billed separately via change order.</li>
            <li>Site access and electricity/water supply to be provided by client.</li>
          </ul>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="h-12 flex items-end justify-center font-serif italic text-slate-500">Priya Nair</div>
            <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">Authorized Signatory</div>
            <div className="text-[10px] text-slate-500">Empire Interior Pvt Ltd</div>
          </div>
          <div>
            <div className="h-12 flex items-end justify-center text-slate-300">________________________</div>
            <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">Client Acceptance</div>
            <div className="text-[10px] text-slate-500">{clientDetails.clientName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
