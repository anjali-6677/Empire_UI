import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Send, ShieldAlert, User, Clock, AlertTriangle } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';

export const MaterialIndentDetailsPage: React.FC = () => {
  const { indentId } = useParams<{ indentId?: string }>();
  const { state, submitMaterialIndent, approveMaterialIndent, rejectMaterialIndent, returnMaterialIndent } = useERPStore();

  const indent = state.materialIndents.find((i) => i.id === indentId || i.indentNumber === indentId || i.documentNumber === indentId);
  const [commentInput, setCommentInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentUser = 'Rajesh Sharma (Project Director)';

  if (!indent) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Material Indent record not found.{' '}
        <Link to="/procurement/indents" className="text-slate-900 underline">
          Return to Material Indents Directory
        </Link>
      </div>
    );
  }

  const docNo = indent.indentNumber || indent.documentNumber;
  const totalVal = indent.totalEstimatedValue || indent.lines?.reduce((sum, l) => sum + (l.estimatedTotal || 0), 0) || 0;
  const isPending = indent.status === 'submitted' || indent.status === 'pending_approval';

  const handleAction = (actionType: 'submit' | 'approve' | 'reject' | 'return') => {
    setErrorMsg(null);
    let res;

    if (actionType === 'submit') {
      res = submitMaterialIndent(indent.id, 'Amit Verma (Site Engineer)');
    } else if (actionType === 'approve') {
      if (indent.requestedByEmployeeName === currentUser || indent.createdBy === currentUser) {
        setErrorMsg('Segregation of Duties Violation: You cannot approve an indent created by yourself.');
        return;
      }
      res = approveMaterialIndent(indent.id, currentUser, commentInput || 'Approved.');
    } else if (actionType === 'reject') {
      if (!commentInput.trim() || commentInput.trim().length < 5) {
        setErrorMsg('Mandatory rejection comment required (minimum 5 characters).');
        return;
      }
      res = rejectMaterialIndent(indent.id, currentUser, commentInput.trim());
    } else if (actionType === 'return') {
      if (!commentInput.trim() || commentInput.trim().length < 5) {
        setErrorMsg('Mandatory reason for returning for revision required (minimum 5 characters).');
        return;
      }
      res = returnMaterialIndent(indent.id, currentUser, commentInput.trim());
    }

    if (res && res.success) {
      setCommentInput('');
    } else if (res) {
      setErrorMsg(res.error || 'Action failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 font-sans text-xs space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-500 font-semibold">
          <Link to="/procurement/indents" className="hover:text-slate-800 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Material Indents
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-900">{docNo}</span>
        </div>

        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            indent.status === 'approved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isPending
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : indent.status === 'sent_back' || indent.status === 'returned_for_revision'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {indent.status === 'approved' && 'Approved'}
            {isPending && 'Pending Approval'}
            {(indent.status === 'sent_back' || indent.status === 'returned_for_revision') && 'Sent Back for Revision'}
            {indent.status === 'rejected' && 'Rejected'}
            {indent.status === 'draft' && 'Draft'}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600" /> {errorMsg}
        </div>
      )}

      {/* Header Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Material Indent Document</span>
            <h1 className="text-xl font-bold text-slate-900 font-mono">{docNo}</h1>
            <p className="text-slate-600 text-xs mt-0.5 font-medium">
              Project: <span className="font-bold text-slate-900">{indent.projectName}</span> ({indent.projectCode})
            </p>
          </div>

          <div className="text-right bg-slate-900 text-white p-3.5 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Total Value</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {formatIndianCurrency(totalVal)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested By</span>
            <span className="font-bold text-slate-900">{indent.requestedByEmployeeName || indent.createdBy || 'Site Engineer'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Required By Date</span>
            <span className="font-mono font-semibold text-slate-900">{indent.requiredByDate || 'Immediate'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Location</span>
            <span className="font-semibold text-slate-900">{indent.deliveryLocation || 'Site Store'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Priority Level</span>
            <span className={`font-bold uppercase ${indent.priority === 'urgent' ? 'text-amber-600' : 'text-slate-800'}`}>
              {indent.priority || 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Exception Reason Banners */}
      {indent.boqExceptionReason && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-xs">
            <ShieldAlert className="h-4 w-4 text-amber-700" /> BOQ Exception Reason
          </div>
          <p className="text-[11.5px] text-amber-800 font-medium">{indent.boqExceptionReason}</p>
        </div>
      )}

      {indent.budgetExceptionReason && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-rose-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 text-rose-700" /> Category Budget Exception Reason
          </div>
          <p className="text-[11.5px] text-rose-800 font-medium">{indent.budgetExceptionReason}</p>
        </div>
      )}

      {/* Indent Lines Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Requested Material Line Items</span>
          <span className="text-xs text-slate-500 font-mono font-semibold">Total Items: {indent.lines?.length || 0}</span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="p-3">Material Description</th>
                <th className="p-3 text-right">Accepted BOQ Qty</th>
                <th className="p-3 text-right">Available BOQ</th>
                <th className="p-3 text-right">Requested Qty</th>
                <th className="p-3 text-center">Status Flag</th>
                <th className="p-3 text-right">Est. Rate</th>
                <th className="p-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {indent.lines?.map((line) => (
                <tr key={line.id} className={line.isOverLimit ? 'bg-amber-50/70' : 'hover:bg-slate-50'}>
                  <td className="p-3 font-semibold text-slate-900">{line.productName}</td>
                  <td className="p-3 text-right font-mono text-slate-600">
                    {line.acceptedBOQQty} {line.unitSymbol}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-700 font-bold">
                    {line.availableBOQQty} {line.unitSymbol}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {line.requestedQty} {line.unitSymbol}
                  </td>
                  <td className="p-3 text-center">
                    {line.isOverLimit ? (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        Over-BOQ (+{line.overLimitQty})
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                        Within Baseline
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700">{formatIndianCurrency(line.estimatedRate)}</td>
                  <td className="p-3 text-right font-mono font-black text-slate-900">{formatIndianCurrency(line.estimatedTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval & Workflow History Log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#AB9570]" /> Approval Workflow History & Audit Log
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <User className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Indent Created & Requested</div>
              <div className="text-[11px] text-slate-500 font-mono">
                By: {indent.requestedByEmployeeName || indent.createdBy || 'Site Engineer'} | Date: {new Date(indent.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {indent.status === 'approved' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-emerald-900">Indent Approved by Project Director</div>
                <div className="text-[11px] text-emerald-700 font-mono">
                  Approver: Rajesh Sharma (Project Director) | Date: {new Date(indent.updatedAt || Date.now()).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {(indent.status === 'sent_back' || indent.status === 'returned_for_revision') && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-start gap-3">
              <RotateCcw className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-purple-900">Sent Back for Site Revision</div>
                <div className="text-[11px] text-purple-700 font-mono">
                  Returned By: Rajesh Sharma (Project Director) | Date: {new Date(indent.updatedAt || Date.now()).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {indent.status === 'rejected' && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3">
              <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-900">Indent Rejected</div>
                <div className="text-[11px] text-rose-700 font-mono">
                  Rejected By: Rajesh Sharma (Project Director) | Date: {new Date(indent.updatedAt || Date.now()).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls Panel */}
      {indent.status === 'draft' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <span className="text-slate-600 font-medium">This indent is currently in Draft status. Ready to submit for Director approval?</span>
          <button
            onClick={() => handleAction('submit')}
            className="px-5 py-2.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-md transition flex items-center gap-2 text-xs"
          >
            <Send className="h-4 w-4 stroke-[2.5]" /> Submit Indent
          </button>
        </div>
      )}

      {isPending && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Approver Decision Panel
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Approver Audit Reason / Comments (Mandatory for Rejection or Return)
            </label>
            <textarea
              rows={2}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Enter audit comment for history log..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#AB9570]"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => handleAction('return')}
              className="px-4 py-2 bg-amber-100 border border-amber-300 text-amber-900 rounded-xl font-bold hover:bg-amber-200 flex items-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" /> Return for Revision
            </button>
            <button
              onClick={() => handleAction('reject')}
              className="px-4 py-2 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl font-bold hover:bg-rose-200 flex items-center gap-1.5"
            >
              <XCircle className="h-4 w-4" /> Reject Indent
            </button>
            <button
              onClick={() => handleAction('approve')}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve Indent
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
