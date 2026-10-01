import React from 'react';
import { PurchaseOrder } from '../../../domain/types';
import { calculatePurchaseOrderTotals, getProjectCategoryBudgetSummary } from '../../../domain/selectors';
import { useERPStore } from '../../../store/ERPStoreContext';
import { downloadPurchaseOrderPDF, printPurchaseOrderPDF } from '../../../utils/poPdfGenerator';
import { formatIndianCurrency } from '../../../utils/format';
import {
  FileText,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Printer,
  X,
  Tag,
} from 'lucide-react';

interface PODetailsModalProps {
  po: PurchaseOrder;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export const PODetailsModal: React.FC<PODetailsModalProps> = ({
  po,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const { state } = useERPStore();

  if (!isOpen) return null;

  const totals = calculatePurchaseOrderTotals(po);
  const vendor = state.vendors.find((v) => v.id === po.vendorId);
  const project = state.projects.find((p) => p.id === po.projectId);

  const lines = po.lines || [];
  const primaryCategoryName = (lines[0] as any)?.categoryName || 'General Works';
  const primaryCategoryId = (lines[0] as any)?.categoryId || 'cat_general';
  const budgetSummary = getProjectCategoryBudgetSummary(
    state,
    po.projectId,
    primaryCategoryId,
    totals.grandTotal,
    po.id
  );

  const status = (po.status as string)?.toLowerCase();
  const isPending = status === 'pending_approval' || status === 'pendingapproval';
  const isApproved = status === 'approved' || status === 'issued';
  const isRejected = status === 'rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#AB9570]/15 text-[#AB9570] flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">{po.documentNumber}</h2>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isPending
                      ? 'bg-amber-100 text-amber-800'
                      : isApproved
                      ? 'bg-emerald-100 text-emerald-800'
                      : isRejected
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {po.status}
                </span>
              </div>
              {(() => {
                const isDirect = po.originType === 'direct_po' || (po as any).purchaseType === 'direct_po' || (po as any).sourceType === 'DIRECT_PO' || (!(po as any).indentId && !po.rfqId);
                return isDirect ? (
                  <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                    <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 rounded text-[10px]">
                      Direct Purchase Order Route (No Indent/RFQ)
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium">
                    Indent: {po.sourceIndentNumber || 'IND-2026-001'} | RFQ: {po.rfqDocumentNumber || 'RFQ-2026-001'}
                  </p>
                );
              })()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPending && (
              <>
                <button
                  onClick={onApprove}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  onClick={onReject}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </>
            )}

            {isApproved && (
              <>
                <button
                  onClick={() => downloadPurchaseOrderPDF(po, vendor)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-slate-600" /> PDF
                </button>
                <button
                  onClick={() => printPurchaseOrderPDF(po, vendor)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-600" /> Print
                </button>
              </>
            )}

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Budget Warning Banner (If Exceeded) */}
          {budgetSummary.isExceeded && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                  BUDGET EXCEEDED WARNING — Category: {primaryCategoryName}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] pt-1">
                  <div>Allocated: <strong>{formatIndianCurrency(budgetSummary.allocatedBudget)}</strong></div>
                  <div>Committed: <strong>{formatIndianCurrency(budgetSummary.committedCost)}</strong></div>
                  <div>Current PO: <strong>{formatIndianCurrency(totals.grandTotal)}</strong></div>
                  <div>Exceeded By: <strong className="text-rose-700 font-bold">{formatIndianCurrency(budgetSummary.exceededBy)}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Info: Order Info & Vendor Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Information Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
                <span>Order Information</span>
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-xs font-medium text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Created By</span>
                  <span className="text-slate-900 font-bold">{po.createdBy || 'Sunil Mehta'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">PO Date</span>
                  <span className="font-mono text-slate-900">{po.orderDate || '2026-08-10'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Valid Until</span>
                  <span className="font-mono font-bold text-amber-900">{po.validUntil || po.rateValidityDate || '2026-08-31'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Expected Delivery</span>
                  <span className="font-mono text-slate-900">{po.expectedDeliveryDate || po.deliveryDueDate || '2026-09-05'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Project Site</span>
                  <span className="text-slate-900 font-bold">{po.projectName || project?.projectName || 'HDFC Regional Office Renovation'}</span>
                </div>
              </div>
            </div>

            {/* Vendor Details Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
                <span>Vendor Details</span>
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="text-xs space-y-1 font-medium text-slate-700">
                <div className="font-bold text-slate-900 text-sm">{vendor?.name || po.vendorName || 'Selected Vendor'}</div>
                <div><strong>Contact:</strong> {vendor?.contactPerson || 'N/A'} ({vendor?.phone || 'N/A'})</div>
                <div><strong>Email:</strong> {vendor?.email || 'N/A'}</div>
                <div><strong>GSTIN:</strong> <span className="font-mono">{vendor?.gstin || '27AAAAA0000A1Z5'}</span></div>
                <div><strong>Address:</strong> {vendor?.address || vendor?.city || 'Mumbai, Maharashtra'}</div>
              </div>
            </div>
          </div>

          {/* PO Remarks (If Present) */}
          {po.remarks && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong className="font-bold">PO Remarks / Notes:</strong> {po.remarks}
            </div>
          )}

          {/* Items Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Order Line Items</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-3">#</th>
                    <th className="p-3">Product / Material</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">GST %</th>
                    <th className="p-3 text-right">Line Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {lines.map((line, idx) => {
                    const qty = Number(line.quantity || 0);
                    const rate = Number(line.unitRate || line.basicRate || 0);
                    const taxPct = Number(line.taxPercentage || 0);
                    const lineTotal = line.lineTotal || (qty * rate * (1 + taxPct / 100));

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{line.productName}</div>
                          {line.specifications && (
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                              <Tag className="h-3 w-3 text-slate-400 shrink-0" /> Spec: {line.specifications}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{line.categoryName || 'General'}</td>
                        <td className="p-3 text-center font-mono font-bold">{qty} {line.unitSymbol || 'sqft'}</td>
                        <td className="p-3 text-right font-mono">{formatIndianCurrency(rate)}</td>
                        <td className="p-3 text-right font-mono">{taxPct}%</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{formatIndianCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commercial Totals Block */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">{formatIndianCurrency(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span className="font-mono text-rose-600">- {formatIndianCurrency(totals.discount)}</span>
                </div>
              )}
              {totals.freight > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Freight Charges:</span>
                  <span className="font-mono font-bold text-slate-900">{formatIndianCurrency(totals.freight)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST Tax:</span>
                <span className="font-mono font-bold text-slate-900">{formatIndianCurrency(totals.tax)}</span>
              </div>
              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Round Off:</span>
                  <span className="font-mono">{totals.roundOff}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>GRAND TOTAL:</span>
                <span className="font-mono text-emerald-800">{formatIndianCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
