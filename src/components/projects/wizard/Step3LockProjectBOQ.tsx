import React, { useState } from 'react';
import {
  Lock,
  AlertTriangle,
  Layers,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { ProjectSetupDraft, ProjectBOQLine } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';

interface Step3LockProjectBOQProps {
  draft: ProjectSetupDraft;
  onLockBOQ: (updatedBOQSetup: ProjectSetupDraft['boqLockSetup']) => void;
  currentUser?: string;
}

export const Step3LockProjectBOQ: React.FC<Step3LockProjectBOQProps> = ({
  draft,
  onLockBOQ,
  currentUser = 'Project Director',
}) => {
  const { importedDetails, boqLockSetup } = draft;
  const boqSnapshot = boqLockSetup.lockedProjectBOQ;
  const initialLines: ProjectBOQLine[] = boqSnapshot?.lines || [];

  const [lines] = useState<ProjectBOQLine[]>(initialLines);
  const [validationError, setValidationError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    { id: 'sec-1', name: 'Civil & Architectural Works' },
    { id: 'sec-2', name: 'Interior Fitout & Joinery' },
    { id: 'sec-3', name: 'MEP & Lighting' },
  ];

  const handleConfirmLock = () => {
    if (lines.length === 0) {
      setValidationError('Cannot lock empty BOQ. Please return to CRM Estimate Builder to add structured BOQ items.');
      return;
    }

    const today = new Date().toISOString();
    const totalVal = lines.reduce((sum, l) => sum + (l.boqAmount || l.boqQuantity * l.boqRate), 0);
    const immutableLines: ProjectBOQLine[] = JSON.parse(JSON.stringify(lines));

    const updatedBOQSetup: ProjectSetupDraft['boqLockSetup'] = {
      isBOQLocked: true,
      lockedAt: today,
      lockedBy: currentUser,
      sourceEstimateRevisionId: importedDetails.acceptedRevisionId || draft.sourceEstimateRevisionId,
      boqSource: 'crm_estimate',
      lockedProjectBOQ: {
        id: boqSnapshot?.id || `boq-${Date.now()}`,
        sourceEstimateRevisionId: importedDetails.acceptedRevisionId || draft.sourceEstimateRevisionId || '',
        sections: sections.map((s, idx) => ({
          id: s.id,
          name: s.name,
          sortOrder: idx + 1,
          items: [],
        })),
        lines: immutableLines,
        totalBOQValue: totalVal || importedDetails.acceptedQuotationValue,
      },
    };

    onLockBOQ(updatedBOQSetup);
  };

  const filteredLines = lines.filter(
    (l) =>
      l.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.categoryName && l.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculatedTotal = lines.reduce((sum, l) => sum + (l.boqAmount || l.boqQuantity * l.boqRate), 0);
  const hasNoBOQItems = lines.length === 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E2E6EC] shadow-xs space-y-6 text-xs font-sans">
      {/* Top Header & Lock Badge */}
      <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570] flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> Project BOQ Confirmation & Baseline Lock
          </div>
          <h2 className="text-base font-extrabold text-[#121214] tracking-tight mt-0.5">
            Confirm & Lock CRM Accepted BOQ Baseline
          </h2>
          <p className="text-xs text-slate-500">
            Review the accepted commercial BOQ from CRM and confirm baseline locking for material procurement.
          </p>
        </div>

        {boqLockSetup.isBOQLocked ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs bg-emerald-50 text-emerald-800 border border-emerald-300">
            <Lock className="h-4 w-4 text-emerald-600" /> BOQ Baseline: Locked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> BOQ Pending Lock
          </span>
        )}
      </div>

      {/* CRM Summary Card */}
      <div className="bg-white border border-[#E2E6EC] p-5 rounded-2xl space-y-3 shadow-xs">
        <div className="text-xs font-bold text-[#AB9570] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <ShieldCheck className="h-4 w-4" /> Accepted CRM Estimate Reference
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Quotation No</span>
            <span className="font-extrabold text-[#121214] text-sm mt-0.5 block">{importedDetails.acceptedQuotationNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Accepted Date</span>
            <span className="font-extrabold text-[#121214] text-sm mt-0.5 block">{importedDetails.acceptedDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Client Name</span>
            <span className="font-extrabold text-[#121214] text-sm mt-0.5 block truncate">{importedDetails.clientName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">Accepted Commercial Value</span>
            <span className="font-black text-[#AB9570] text-base mt-0.5 block">
              {formatIndianCurrency(importedDetails.acceptedQuotationValue || calculatedTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Error / Missing BOQ Blocking Warning */}
      {hasNoBOQItems ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-2">
          <div className="font-extrabold text-sm flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
            No Structured BOQ Found in Accepted CRM Estimate
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            The accepted CRM quotation (<strong>{importedDetails.acceptedQuotationNumber}</strong>) does not contain any structured BOQ line items. You cannot activate the project or create material indents without a structured baseline. Please return to the CRM Estimate Builder to correct and define structured BOQ lines for this estimate.
          </p>
        </div>
      ) : validationError ? (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" /> {validationError}
        </div>
      ) : null}

      {/* READ-ONLY Accepted BOQ Table */}
      {!hasNoBOQItems && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-bold text-[#121214] text-xs uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#AB9570]" /> Accepted Estimate BOQ Baseline ({lines.length} Line Items)
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter BOQ items or categories..."
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs w-64 focus:ring-2 focus:ring-[#AB9570]"
            />
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#121214] text-white font-bold text-[10px] uppercase tracking-wider">
                  <th className="p-3 w-16">Line #</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-right w-24">Baseline Qty</th>
                  <th className="p-3 w-20">Unit</th>
                  <th className="p-3 text-right w-28">Baseline Rate</th>
                  <th className="p-3 text-right w-32">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredLines.map((line) => (
                  <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500">#{line.lineNo}</td>
                    <td className="p-3 text-slate-600 font-semibold">{line.categoryName || 'General Fitout'}</td>
                    <td className="p-3 font-bold text-[#121214]">{line.itemDescription}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#121214]">{line.boqQuantity}</td>
                    <td className="p-3 font-mono text-slate-500">{line.unitSymbol}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{formatIndianCurrency(line.boqRate)}</td>
                    <td className="p-3 text-right font-mono font-black text-[#121214]">
                      {formatIndianCurrency(line.boqAmount || line.boqQuantity * line.boqRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div>
          <span className="text-xs text-slate-500 font-medium">
            Total Project BOQ Value: <strong className="text-[#121214] font-mono text-sm">{formatIndianCurrency(calculatedTotal)}</strong>
          </span>
        </div>

        <button
          type="button"
          disabled={boqLockSetup.isBOQLocked || hasNoBOQItems}
          onClick={handleConfirmLock}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all ${
            boqLockSetup.isBOQLocked || hasNoBOQItems
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 shadow-md cursor-pointer'
          }`}
        >
          <Lock className="h-4 w-4 stroke-[2.5]" />
          {boqLockSetup.isBOQLocked ? 'Project BOQ Baseline Locked' : 'Confirm & Lock Project BOQ Baseline'}
        </button>
      </div>
    </div>
  );
};
