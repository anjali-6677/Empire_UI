/**
 * Accepted Project BOQ Tab Component
 * Location: src/pages/projects/workspace/AcceptedProjectBOQTab.tsx
 */

import React from 'react';
import { Project } from '../../../domain/types';
import { useERPStore } from '../../../store/ERPStoreContext';
import { getProjectBOQLines } from '../../../domain/selectors';
import { Lock, Search, Download, Printer } from 'lucide-react';
import { formatIndianCurrency } from '../../../utils/format';

interface Props {
  project: Project;
}

export const AcceptedProjectBOQTab: React.FC<Props> = ({ project }) => {
  const { state } = useERPStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  const boqLines = getProjectBOQLines(state, project.id);

  const filteredLines = boqLines.filter(
    (l) =>
      l.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.categoryName && l.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalBOQValue = boqLines.reduce((sum, l) => sum + (l.boqAmount || l.boqQuantity * l.boqRate), 0);

  const handleDownloadBOQ = () => {
    alert(`Downloading Locked BOQ for Project ${project.projectCode}...`);
  };

  const handlePrintBOQ = () => {
    window.print();
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* BOQ Header & Metadata Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base tracking-tight">Locked Project BOQ Baseline</span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-lg text-[10px] flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-600" /> Immutable Baseline
              </span>
            </div>
            <p className="text-slate-500 text-xs">
              Baseline snapshot used for Material Indent validation and procurement control.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadBOQ}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Download BOQ
            </button>
            <button
              type="button"
              onClick={handlePrintBOQ}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
            >
              <Printer className="h-3.5 w-3.5 text-[#AB9570]" /> Print BOQ
            </button>
          </div>
        </div>

        {/* Read-Only BOQ Provenance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">BOQ Source</span>
            <strong className="text-slate-900 uppercase font-sans">{project.boqSource || 'crm_estimate'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Source Estimate / Quotation</span>
            <strong className="text-[#AB9570]">{project.sourceQuotationNumber || project.acceptedEstimateVersionId || 'QUO-ACCEPTED'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Accepted Revision</span>
            <strong className="text-slate-900 font-sans">Revision 1 (Client Accepted)</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Locked By</span>
            <strong className="text-slate-900 font-sans">{project.createdBy || 'Project Director'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Total BOQ Baseline</span>
            <strong className="text-emerald-700">{formatIndianCurrency(totalBOQValue)}</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter BOQ line items by description or category..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div className="text-slate-500 text-xs">
          Showing {filteredLines.length} of {boqLines.length} Items
        </div>
      </div>

      {/* BOQ Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5">Item Description</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5 text-right">BOQ Qty</th>
                <th className="p-2.5 text-center">UOM</th>
                <th className="p-2.5 text-right">Selling Rate</th>
                <th className="p-2.5 text-right">BOQ Amount</th>
                <th className="p-2.5 text-right">Indented</th>
                <th className="p-2.5 text-right">Ordered</th>
                <th className="p-2.5 text-right">Received</th>
                <th className="p-2.5 text-right">Remaining BOQ Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-sans">
              {filteredLines.map((line) => {
                const remaining = line.remainingQuantity ?? Math.max(0, line.boqQuantity - line.indentedQuantity);
                const isFullyIndented = remaining === 0;

                return (
                  <tr key={line.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-mono text-slate-500">{line.lineNo}</td>
                    <td className="p-2.5 font-medium max-w-xs">{line.itemDescription}</td>
                    <td className="p-2.5 text-slate-600">{line.categoryName}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{line.boqQuantity.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-center">{line.unitSymbol}</td>
                    <td className="p-2.5 text-right font-mono">₹{line.boqRate.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      ₹{line.boqAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono text-blue-700 font-semibold">
                      {line.indentedQuantity.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-700">
                      {line.orderedQuantity.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-700">
                      {line.receivedQuantity.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      <span className={isFullyIndented ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200' : 'text-emerald-700'}>
                        {remaining.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
