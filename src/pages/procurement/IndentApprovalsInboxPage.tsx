/**
 * Segregated Material Indent Approvals Inbox
 * Location: src/pages/procurement/IndentApprovalsInboxPage.tsx
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { ShieldCheck, ShieldAlert, CheckCircle, XCircle, RotateCcw, Eye } from 'lucide-react';

export const IndentApprovalsInboxPage: React.FC = () => {
  const { state, approveMaterialIndent, rejectMaterialIndent, returnMaterialIndent } = useERPStore();
  const [activeUserRole, setActiveUserRole] = useState<'project_director' | 'site_engineer'>('project_director');
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter submitted indents needing approval
  const pendingIndents = state.materialIndents.filter((i) => i.status === 'submitted');

  const currentUserName = activeUserRole === 'project_director' ? 'Rajesh Sharma (Project Director)' : 'Amit Verma (Site Engineer)';

  const handleAction = (indentId: string, actionType: 'approve' | 'reject' | 'return') => {
    setActionError(null);
    const comment = commentMap[indentId] || '';

    let res;
    if (actionType === 'approve') {
      res = approveMaterialIndent(indentId, currentUserName, comment);
    } else if (actionType === 'reject') {
      if (!comment.trim()) {
        setActionError('Comment is required for rejection.');
        return;
      }
      res = rejectMaterialIndent(indentId, currentUserName, comment);
    } else if (actionType === 'return') {
      if (!comment.trim()) {
        setActionError('Reason for returning for revision is required.');
        return;
      }
      res = returnMaterialIndent(indentId, currentUserName, comment);
    }

    if (res && !res.success) {
      setActionError(res.error || 'Action failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 font-sans text-xs space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" /> Segregated Material Indent Approval Inbox
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Approve site material requisitions and over-BOQ baseline exception requests
          </p>
        </div>

        {/* User Role Switcher Simulator for Segregation of Duties Testing */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded border border-slate-200">
          <span className="text-[10.5px] font-bold text-slate-600 uppercase">Simulate Approver Role:</span>
          <select
            value={activeUserRole}
            onChange={(e) => setActiveUserRole(e.target.value as any)}
            className="border border-slate-300 rounded px-2 py-1 text-xs font-semibold bg-white"
          >
            <option value="project_director">Rajesh Sharma (Project Director)</option>
            <option value="site_engineer">Amit Verma (Site Engineer / Requester)</option>
          </select>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-bold">
          {actionError}
        </div>
      )}

      {/* Segregation of Duties Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-lg flex items-center justify-between shadow">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Domain Guardrail</span>
          <span className="font-bold text-xs text-amber-300">Strict Segregation of Duties Enforced</span>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Requisitions created by an engineer cannot be self-approved by the same person if over-BOQ lines exist.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-amber-400 font-mono">{pendingIndents.length}</span>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Pending Requisitions</span>
        </div>
      </div>

      {/* List of Pending Indents */}
      <div className="space-y-4">
        {pendingIndents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
            <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">All Material Indents Processed</p>
            <p className="text-xs text-slate-500 mt-1">There are currently no pending indents requiring approval.</p>
          </div>
        ) : (
          pendingIndents.map((indent) => {
            const isSelfCreated = indent.createdBy.includes('Amit Verma') && activeUserRole === 'site_engineer';
            const isSelfApprovalBlocked = isSelfCreated && indent.hasOverLimitLines;
            const totalVal = (indent.lines || []).reduce((sum, l: any) => sum + (l.estimatedTotal || l.totalPrice || 0), 0);

            return (
              <div key={indent.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{indent.documentNumber}</span>
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        {(indent.procurementRoute || 'LOCAL').toUpperCase()}
                      </span>
                      {indent.hasOverLimitLines && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3 text-amber-600" /> Over-BOQ Request
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs mt-1">
                      Project: <span className="font-bold text-slate-900">{indent.projectName}</span> • Created by: <span className="font-semibold text-slate-800">{indent.createdBy}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Estimated Total Value</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      ₹{totalVal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Line Items Preview */}
                <div className="border border-slate-100 rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-2">Material Item</th>
                        <th className="p-2 text-right">Available BOQ</th>
                        <th className="p-2 text-right">Requested Qty</th>
                        <th className="p-2 text-center">Status Flag</th>
                        <th className="p-2 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {(indent.lines || []).map((l: any) => (
                        <tr key={l.id} className={l.isOverLimit ? 'bg-amber-50/40' : ''}>
                          <td className="p-2 font-medium">{l.productName}</td>
                          <td className="p-2 text-right font-mono">{l.availableBOQQty} {l.unitSymbol}</td>
                          <td className="p-2 text-right font-mono font-bold">{l.requestedQty} {l.unitSymbol}</td>
                          <td className="p-2 text-center">
                            {l.isOverLimit ? (
                              <span className="text-amber-800 font-bold text-[10px]">Over-BOQ (+{l.overLimitQty})</span>
                            ) : (
                              <span className="text-emerald-700 font-semibold text-[10px]">Within BOQ</span>
                            )}
                          </td>
                          <td className="p-2 text-right font-mono font-bold">₹{l.estimatedTotal.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Approver Controls */}
                {isSelfApprovalBlocked ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-amber-700" /> Self-Approval Forbidden (Segregation of Duties Enforced)
                    </span>
                    <span className="text-[11px] font-normal text-amber-800">
                      Requisitions with over-limit lines must be approved by Project Director.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                    <input
                      type="text"
                      placeholder="Add approver comment or reason..."
                      value={commentMap[indent.id] || ''}
                      onChange={(e) => setCommentMap({ ...commentMap, [indent.id]: e.target.value })}
                      className="w-full sm:w-80 border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-slate-400"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/procurement/indents/${indent.id}`}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-100 flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Full Details
                      </Link>
                      <button
                        onClick={() => handleAction(indent.id, 'return')}
                        className="px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded font-bold hover:bg-amber-200 flex items-center gap-1"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Return
                      </button>
                      <button
                        onClick={() => handleAction(indent.id, 'reject')}
                        className="px-3 py-1.5 bg-rose-100 border border-rose-300 text-rose-900 rounded font-bold hover:bg-rose-200 flex items-center gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(indent.id, 'approve')}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
