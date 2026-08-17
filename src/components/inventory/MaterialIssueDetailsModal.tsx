/**
 * Material Issue Details Modal
 * Location: src/components/inventory/MaterialIssueDetailsModal.tsx
 */

import React from 'react';
import { MaterialIssue } from '../../domain/types';
import { useERPStore } from '../../store/ERPStoreContext';
import { calculateIssueItemTotals, normalizeMaterialIssue } from '../../utils/materialIssueHelpers';
import { getMaterialIssueStatusBadge } from '../../utils/statusStyles';
import { downloadMaterialIssuePdf, printMaterialIssuePdf } from '../../utils/materialIssuePdfGenerator';
import { X, Printer, Download, FileText, Clock, Building, Warehouse } from 'lucide-react';
import { Button } from '../ui/Button';

interface MaterialIssueDetailsModalProps {
  issue: MaterialIssue;
  onClose: () => void;
}

export const MaterialIssueDetailsModal: React.FC<MaterialIssueDetailsModalProps> = ({ issue, onClose }) => {
  const { state } = useERPStore();
  const norm = normalizeMaterialIssue(issue);
  const calcs = calculateIssueItemTotals(norm, state.materialReturns || [], state.materialConsumptions || []);

  const docNum = norm.documentNumber || norm.issueNumber || norm.id;
  const issueDate = norm.issueDate || norm.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-4xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-stone-100">Material Issue Note #{docNum}</h2>
                {getMaterialIssueStatusBadge(norm.status)}
              </div>
              <p className="text-[11px] text-stone-400">
                Created on {issueDate} by {norm.issuedBy || norm.createdBy || 'Stores Officer'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => printMaterialIssuePdf(norm, state.materialReturns, state.materialConsumptions)}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700 px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>

            <Button
              variant="primary"
              onClick={() => downloadMaterialIssuePdf(norm, state.materialReturns, state.materialConsumptions)}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1.5 flex items-center gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </Button>

            <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-stone-400 font-bold uppercase text-[10px] mb-1">
                <Building className="w-3.5 h-3.5 text-amber-600" />
                Project Site
              </div>
              <div className="font-bold text-stone-900">{norm.projectName}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">{norm.destinationAreaName || norm.destinationStoreName}</div>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-stone-400 font-bold uppercase text-[10px] mb-1">
                <Warehouse className="w-3.5 h-3.5 text-amber-600" />
                Source Store Location
              </div>
              <div className="font-bold text-stone-900">{norm.sourceLocationName || norm.sourceWarehouseName}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Issued by {norm.issuedBy || 'Stores Officer'}</div>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-stone-400 font-bold uppercase text-[10px] mb-1">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                Financial Summary
              </div>
              <div className="font-bold text-stone-900 font-mono text-sm">
                ₹{calcs.totalIssuedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">
                Site Bal: ₹{calcs.totalSiteBalanceValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-2">Issued Material Lines</h3>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Material Description</th>
                    <th className="py-2.5 px-3 text-center">UOM</th>
                    <th className="py-2.5 px-3 text-right">Issued</th>
                    <th className="py-2.5 px-3 text-right">Received</th>
                    <th className="py-2.5 px-3 text-right">Consumed</th>
                    <th className="py-2.5 px-3 text-right">Returned</th>
                    <th className="py-2.5 px-3 text-right">Site Balance</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                  {calcs.items.map((item) => (
                    <tr key={item.productId} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-900">{item.productName}</td>
                      <td className="py-2.5 px-3 text-center text-stone-500 uppercase">{item.unitSymbol}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">{item.issuedQty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{item.receivedQty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-orange-700">{item.consumedQty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-cyan-700">{item.returnedQty}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">{item.siteBalanceQty}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                        ₹{item.unitRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        ₹{item.issuedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Log Timeline */}
          {norm.activityLog && norm.activityLog.length > 0 && (
            <div>
              <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Audit Trail & History
              </h3>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
                {norm.activityLog.map((act) => (
                  <div key={act.id} className="flex items-start justify-between text-[11px] border-b border-stone-200/60 pb-1.5 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-stone-900">{act.action}</span>
                      <p className="text-stone-600">{act.description}</p>
                    </div>
                    <div className="text-right text-[10px] text-stone-400">
                      <div>{act.user}</div>
                      <div>{new Date(act.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
