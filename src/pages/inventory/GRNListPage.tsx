import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { GoodsReceipt, GRNPayment } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import {
  MoreVertical,
  Eye,
  FileText,
  Printer,
  Download,
  CreditCard,
  History,
  X,
  CheckCircle2,
} from 'lucide-react';

interface GRNActionCellProps {
  grn: GoodsReceipt;
  outstanding: number;
  onOpenRecordPayment: (grn: GoodsReceipt) => void;
  onOpenPaymentHistory: (grn: GoodsReceipt) => void;
  navigate: (path: string) => void;
}

const GRNActionCell: React.FC<GRNActionCellProps> = ({
  grn,
  outstanding,
  onOpenRecordPayment,
  onOpenPaymentHistory,
  navigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const grnNumDisplay = grn.grnNumber || `GRN-2026-${grn.id.slice(-3)}`;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <RowActionMenu isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} align="right">
        <RowActionMenuItem
          icon={<Eye className="w-3.5 h-3.5" />}
          label="View GRN Details"
          onClick={() => {
            setIsOpen(false);
            navigate(`/inventory/grn/${grn.id}`);
          }}
        />
        <RowActionMenuItem
          icon={<FileText className="w-3.5 h-3.5" />}
          label="View Token"
          onClick={() => {
            setIsOpen(false);
            navigate(`/inventory/gate-tokens`);
          }}
        />
        <RowActionMenuItem
          icon={<FileText className="w-3.5 h-3.5" />}
          label="View QC Report"
          onClick={() => {
            setIsOpen(false);
            navigate(`/inventory/qc`);
          }}
        />

        <RowActionMenuDivider />

        {outstanding > 0 && (
          <RowActionMenuItem
            variant="success"
            icon={<CreditCard className="w-3.5 h-3.5" />}
            label="Record Payment"
            onClick={() => {
              setIsOpen(false);
              onOpenRecordPayment(grn);
            }}
          />
        )}

        <RowActionMenuItem
          icon={<History className="w-3.5 h-3.5" />}
          label="Payment History"
          onClick={() => {
            setIsOpen(false);
            onOpenPaymentHistory(grn);
          }}
        />

        <RowActionMenuDivider />

        <RowActionMenuItem
          icon={<Printer className="w-3.5 h-3.5" />}
          label="Print GRN"
          onClick={() => {
            setIsOpen(false);
            window.print();
          }}
        />
        <RowActionMenuItem
          icon={<Download className="w-3.5 h-3.5" />}
          label="Download GRN"
          onClick={() => {
            setIsOpen(false);
            alert(`Downloading official PDF for GRN ${grnNumDisplay}`);
          }}
        />
      </RowActionMenu>
    </>
  );
};

export const GRNListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, recordGRNPayment } = useERPStore();

  const grns: GoodsReceipt[] = state.goodsReceipts || [];
  const projects = state.projects || [];
  const vendors = state.vendors || [];
  const pos = state.purchaseOrders || [];
  const tokens = state.materialEntryTokens || [];
  const allPayments: GRNPayment[] = state.grnPayments || [];

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Payment Recording Modal State
  const [paymentModalGRN, setPaymentModalGRN] = useState<{
    grn: GoodsReceipt;
    netPayable: number;
    paid: number;
    outstanding: number;
  } | null>(null);

  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [bankAccountId, setBankAccountId] = useState<string>('HDFC-MAIN-001');
  const [remarks, setRemarks] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');

  // Payment History Modal State
  const [historyModalGRN, setHistoryModalGRN] = useState<{
    grn: GoodsReceipt;
    netPayable: number;
    paid: number;
    outstanding: number;
  } | null>(null);

  const filteredGRNs = grns.filter((g) => {
    const matchesProject = selectedProjectId === 'all' || g.projectId === selectedProjectId;
    const matchesVendor = selectedVendorId === 'all' || g.vendorId === selectedVendorId;
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter || g.paymentStatus === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      g.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.tokenId && g.tokenId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      g.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.vendorName && g.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.projectName && g.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProject && matchesVendor && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Paid</span>;
      case 'Partially Paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">Partially Paid</span>;
      case 'On Hold':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-200">On Hold</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">Cancelled</span>;
      case 'Payment Pending':
      case 'Generated':
      case 'qc_completed':
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Payment Pending</span>;
    }
  };

  const handleOpenRecordPayment = (grn: GoodsReceipt) => {
    const po = pos.find((p) => p.id === grn.poId || p.poNumber === grn.poNumber || p.documentNumber === grn.poNumber);
    const poLine = po && (po as any).lines && (po as any).lines.length > 0 ? (po as any).lines[0] : null;
    const firstItem = grn.items && grn.items.length > 0 ? grn.items[0] : null;
    const rate = grn.poUnitRate ?? firstItem?.poUnitRate ?? firstItem?.unitRate ?? (poLine ? Number(poLine.unitRate ?? poLine.finalRate ?? poLine.basicRate ?? 0) : 0);
    const acceptedQty = grn.acceptedQty ?? firstItem?.qcApprovedQty ?? 0;
    const baseVal = grn.baseAcceptedValue ?? (acceptedQty * rate);
    const taxVal = grn.taxAmount ?? (baseVal * 0.18);
    const netPayable = Math.round((grn.netPayable ?? (baseVal + taxVal)) * 100) / 100;

    const grnPayments = (state.grnPayments || []).filter((p) => p.grnId === grn.id || p.grnId === grn.grnNumber);
    const paid = Math.round(grnPayments.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100;
    const outstanding = Math.max(0, Math.round((netPayable - paid) * 100) / 100);

    setPaymentModalGRN({ grn, netPayable, paid, outstanding });
    setPaymentAmount(outstanding > 0 ? outstanding.toString() : '');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMode('Bank Transfer');
    setReferenceNumber('');
    setRemarks('');
    setPaymentError('');
  };

  const handleOpenPaymentHistory = (grn: GoodsReceipt) => {
    const po = pos.find((p) => p.id === grn.poId || p.poNumber === grn.poNumber || p.documentNumber === grn.poNumber);
    const poLine = po && (po as any).lines && (po as any).lines.length > 0 ? (po as any).lines[0] : null;
    const firstItem = grn.items && grn.items.length > 0 ? grn.items[0] : null;
    const rate = grn.poUnitRate ?? firstItem?.poUnitRate ?? firstItem?.unitRate ?? (poLine ? Number(poLine.unitRate ?? poLine.finalRate ?? poLine.basicRate ?? 0) : 0);
    const acceptedQty = grn.acceptedQty ?? firstItem?.qcApprovedQty ?? 0;
    const baseVal = grn.baseAcceptedValue ?? (acceptedQty * rate);
    const taxVal = grn.taxAmount ?? (baseVal * 0.18);
    const netPayable = Math.round((grn.netPayable ?? (baseVal + taxVal)) * 100) / 100;

    const grnPayments = (state.grnPayments || []).filter((p) => p.grnId === grn.id || p.grnId === grn.grnNumber);
    const paid = Math.round(grnPayments.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100;
    const outstanding = Math.max(0, Math.round((netPayable - paid) * 100) / 100);

    setHistoryModalGRN({ grn, netPayable, paid, outstanding });
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalGRN) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setPaymentError('Payment amount must be greater than zero.');
      return;
    }

    if (amt > paymentModalGRN.outstanding + 0.01) {
      setPaymentError(`Payment amount cannot exceed the outstanding amount of ₹${paymentModalGRN.outstanding.toLocaleString('en-IN')}.`);
      return;
    }

    if (['Bank Transfer', 'NEFT', 'RTGS', 'IMPS'].includes(paymentMode) && !referenceNumber.trim()) {
      setPaymentError('UTR / Reference number is required for electronic payments.');
      return;
    }

    if (paymentMode === 'Cheque' && !referenceNumber.trim()) {
      setPaymentError('Cheque number is required for cheque payments.');
      return;
    }

    if (!bankAccountId) {
      setPaymentError('Please select a paying bank account.');
      return;
    }

    const res = recordGRNPayment(
      {
        grnId: paymentModalGRN.grn.id,
        paymentDate,
        amount: amt,
        paymentMode,
        referenceNumber: referenceNumber.trim(),
        bankAccountId,
        remarks,
      },
      'Accounts Officer'
    );

    if (!res.success) {
      setPaymentError(res.error || 'Failed to record payment');
      return;
    }

    setPaymentModalGRN(null);
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Goods Receipt Notes (GRN) Register"
        subtitle="Final verified inventory receipts generated automatically following Quality Control clearance."
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search GRN #, Token #, PO #, Vendor, or Product..."
        selectFilters={[
          {
            id: 'project-filter',
            label: 'Project',
            value: selectedProjectId,
            onChange: setSelectedProjectId,
            options: [
              { value: 'all', label: 'All Projects' },
              ...projects.map((p) => ({ value: p.id, label: p.projectName })),
            ],
          },
          {
            id: 'vendor-filter',
            label: 'Vendor',
            value: selectedVendorId,
            onChange: setSelectedVendorId,
            options: [
              { value: 'all', label: 'All Vendors' },
              ...vendors.map((v) => ({ value: v.id, label: v.name })),
            ],
          },
          {
            id: 'status-filter',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Payment Pending', value: 'Payment Pending' },
              { label: 'Partially Paid', value: 'Partially Paid' },
              { label: 'Paid', value: 'Paid' },
              { label: 'On Hold', value: 'On Hold' },
            ],
          },
        ]}
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden my-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">GRN #</th>
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">PO #</th>
                <th className="py-3 px-4">Vendor / Product</th>
                <th className="py-3 px-4 text-right">Accepted Qty</th>
                <th className="py-3 px-4 text-right">Rate / Unit</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-500">
                    No Goods Receipt Notes found. Final GRNs will automatically generate here after Quality Inspection clearance.
                  </td>
                </tr>
              ) : (
                filteredGRNs.map((grn) => {
                  const po = pos.find((p) => p.id === grn.poId || p.poNumber === grn.poNumber || p.documentNumber === grn.poNumber);
                  const token = tokens.find((t) => t.id === grn.tokenId || t.tokenNumber === grn.tokenId);

                  const firstItem = grn.items && grn.items.length > 0 ? grn.items[0] : null;
                  const poLine = po && (po as any).lines && (po as any).lines.length > 0 ? (po as any).lines[0] : null;

                  const productName = firstItem?.description || poLine?.materialName || poLine?.productName || token?.materialName || 'Material';
                  const unit = firstItem?.unit || poLine?.unit || 'nos';
                  
                  const rate = grn.poUnitRate ?? firstItem?.poUnitRate ?? firstItem?.unitRate ?? (poLine ? Number(poLine.unitRate ?? poLine.finalRate ?? poLine.basicRate ?? 0) : 0);
                  const acceptedQty = grn.acceptedQty ?? firstItem?.qcApprovedQty ?? 0;
                  
                  // Net payable from snapshot or calculated
                  const baseVal = grn.baseAcceptedValue ?? (acceptedQty * rate);
                  const taxVal = grn.taxAmount ?? (baseVal * 0.18);
                  const netPayable = grn.netPayable ?? (baseVal + taxVal);

                  // Payments sum for this GRN
                  const grnPayments = allPayments.filter((p) => p.grnId === grn.id || p.grnId === grn.grnNumber);
                  const paid = grn.paidAmount ?? grnPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                  const outstanding = grn.outstandingAmount ?? Math.max(netPayable - paid, 0);

                  // Derived payment status
                  let computedPaymentStatus = grn.paymentStatus || 'Payment Pending';
                  if (netPayable > 0 && paid >= netPayable - 0.01) {
                    computedPaymentStatus = 'Paid';
                  } else if (paid > 0) {
                    computedPaymentStatus = 'Partially Paid';
                  } else if (netPayable > 0) {
                    computedPaymentStatus = 'Payment Pending';
                  } else {
                    computedPaymentStatus = 'Payment Pending';
                  }

                  // Due date
                  let dueDate = grn.dueDate || 'Not Set';
                  if (!grn.dueDate && grn.grnDate) {
                    const pTerms = (po as any)?.paymentTerms || (po as any)?.paymentTermsDays;
                    const termDays = pTerms ? parseInt(String(pTerms), 10) : 30;
                    const d = new Date(grn.grnDate);
                    d.setDate(d.getDate() + (isNaN(termDays) ? 30 : termDays));
                    dueDate = d.toISOString().split('T')[0];
                  }

                  const grnNumDisplay = grn.grnNumber || `GRN-2026-${grn.id.slice(-3)}`;

                  return (
                    <tr key={grn.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">{grnNumDisplay}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-700">{grn.tokenId || token?.tokenNumber || 'N/A'}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-700">{grn.poNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{grn.vendorName || po?.vendorName || 'Vendor'}</span>
                          <span className="text-xs text-gray-500">{productName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {acceptedQty} <span className="text-xs text-gray-500 font-normal">{unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        ₹{rate.toLocaleString('en-IN')} / {unit}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ₹{netPayable.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                        ₹{paid.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-amber-800">
                        ₹{outstanding.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">{dueDate}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(computedPaymentStatus)}</td>
                      <td className="py-3 px-4 text-right">
                        <GRNActionCell
                          grn={grn}
                          outstanding={outstanding}
                          onOpenRecordPayment={handleOpenRecordPayment}
                          onOpenPaymentHistory={handleOpenPaymentHistory}
                          navigate={navigate}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {paymentModalGRN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
                <CreditCard className="w-5 h-5 text-amber-700" />
                Record GRN Payment
              </div>
              <button
                onClick={() => setPaymentModalGRN(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              {paymentError && (
                <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200">
                  {paymentError}
                </div>
              )}

              {/* GRN & Financial Summary Box */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">GRN Number:</span>
                  <span className="font-bold text-gray-900">{paymentModalGRN.grn.grnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendor:</span>
                  <span className="font-medium text-gray-800">{paymentModalGRN.grn.vendorName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-center">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase">Net Payable</span>
                    <span className="font-bold text-gray-900">₹{paymentModalGRN.netPayable.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase">Already Paid</span>
                    <span className="font-bold text-emerald-700">₹{paymentModalGRN.paid.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase">Outstanding</span>
                    <span className="font-bold text-amber-800">₹{paymentModalGRN.outstanding.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="1"
                    max={paymentModalGRN.outstanding}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reference / UTR / Cheque #
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g. UTR19283746"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Paying Bank Account</label>
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="HDFC-MAIN-001">HDFC Bank Ltd - Main A/C (...8892)</option>
                  <option value="ICICI-OPS-002">ICICI Bank - Operations A/C (...4102)</option>
                  <option value="SBI-CORP-003">State Bank of India - Corporate A/C (...9012)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Optional payment notes..."
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalGRN(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY MODAL */}
      {historyModalGRN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
                <History className="w-5 h-5 text-amber-700" />
                Payment History - {historyModalGRN.grn.grnNumber}
              </div>
              <button
                onClick={() => setHistoryModalGRN(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Financial Header Summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-gray-500 text-xs block">Net Payable Amount</span>
                  <span className="text-base font-bold text-gray-900">₹{historyModalGRN.netPayable.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Total Paid to Date</span>
                  <span className="text-base font-bold text-emerald-700">₹{historyModalGRN.paid.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Current Outstanding</span>
                  <span className="text-base font-bold text-amber-800">₹{historyModalGRN.outstanding.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payments Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Payment #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3">Ref / UTR #</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-3">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allPayments.filter(
                      (p) => p.grnId === historyModalGRN.grn.id || p.grnId === historyModalGRN.grn.grnNumber
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-500">
                          No payment transactions recorded for this GRN yet.
                        </td>
                      </tr>
                    ) : (
                      allPayments
                        .filter(
                          (p) => p.grnId === historyModalGRN.grn.id || p.grnId === historyModalGRN.grn.grnNumber
                        )
                        .map((pay) => (
                          <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-gray-900">{pay.paymentNumber}</td>
                            <td className="py-2.5 px-3 text-gray-700">{pay.paymentDate}</td>
                            <td className="py-2.5 px-3 font-medium text-gray-800">{pay.paymentMode}</td>
                            <td className="py-2.5 px-3 font-mono text-gray-600">{pay.referenceNumber || 'N/A'}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                              ₹{pay.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-gray-600">{pay.createdBy}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalGRN(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ListPageLayout>
  );
};

export default GRNListPage;
