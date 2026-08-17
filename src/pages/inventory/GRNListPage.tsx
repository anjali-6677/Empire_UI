import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { GoodsReceipt, GRNPayment, VendorAP } from '../../domain/types';
import { resolveTokenNumber, resolvePONumber, resolveGRNNumber } from '../../domain/documentNumbers';
import { getGRNNetPayable, getGRNPaidAmount, getGRNOutstanding, getGRNPaymentStatus } from '../../domain/selectors';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import {
  MoreVertical,
  Eye,
  FileText,
  ShieldCheck,
  Printer,
  Download,
  CreditCard,
  History,
  X,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

const formatGRNDate = (dateStr?: string): string => {
  if (!dateStr || dateStr === 'Not Set') return 'Not Set';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatIndianCurrency = (amount: number): string => {
  if (isNaN(amount)) return '₹0';
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const parts = absVal.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const formattedDecimal = decimalPart && parseInt(decimalPart, 10) > 0 ? `.${decimalPart}` : '';
  return `${isNegative ? '-' : ''}₹${formattedInt}${formattedDecimal}`;
};

const getAPStatusBadge = (status?: string) => {
  switch (status) {
    case 'Approved':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Approved
        </span>
      );
    case 'Pending Approval':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 mr-1 text-amber-600" /> Pending Approval
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3 mr-1 text-rose-600" /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Approved
        </span>
      );
  }
};

interface GRNActionCellProps {
  grn: GoodsReceipt;
  ap?: VendorAP;
  poId?: string;
  outstanding: number;
  onOpenApproveAP?: (ap: VendorAP) => void;
  onOpenRejectAP?: (ap: VendorAP) => void;
  onOpenRecordPayment: (apOrGrn: VendorAP | GoodsReceipt) => void;
  onOpenPaymentHistory: (apOrGrn: VendorAP | GoodsReceipt) => void;
  navigate: (path: string) => void;
}

const GRNActionCell: React.FC<GRNActionCellProps> = ({
  grn,
  ap,
  poId,
  outstanding,
  onOpenApproveAP,
  onOpenRejectAP,
  onOpenRecordPayment,
  onOpenPaymentHistory,
  navigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const grnNumDisplay = grn.grnNumber || `GRN-2026-${grn.id.slice(-3)}`;

  const isPendingAP = ap?.apStatus === 'Pending Approval';
  const isApprovedAP = !ap || ap.apStatus === 'Approved';

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        title="Actions"
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
          label="View Purchase Order"
          onClick={() => {
            setIsOpen(false);
            navigate(poId ? `/procurement/purchase-orders/${poId}` : `/procurement/purchase-orders`);
          }}
        />
        <RowActionMenuItem
          icon={<ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
          label="View QC Report"
          onClick={() => {
            setIsOpen(false);
            navigate(`/inventory/qc`);
          }}
        />
        <RowActionMenuItem
          icon={<CreditCard className="w-3.5 h-3.5 text-amber-600" />}
          label="View Vendor AP"
          onClick={() => {
            setIsOpen(false);
            navigate(`/finance/accounts-payable`);
          }}
        />

        <RowActionMenuDivider />

        {/* AP Approval Actions */}
        {isPendingAP && ap && onOpenApproveAP && (
          <RowActionMenuItem
            variant="success"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            label="Approve AP"
            onClick={() => {
              setIsOpen(false);
              onOpenApproveAP(ap);
            }}
          />
        )}
        {isPendingAP && ap && onOpenRejectAP && (
          <RowActionMenuItem
            variant="danger"
            icon={<AlertCircle className="w-3.5 h-3.5" />}
            label="Reject AP"
            onClick={() => {
              setIsOpen(false);
              onOpenRejectAP(ap);
            }}
          />
        )}

        {/* Payment Actions for Approved AP */}
        {isApprovedAP && outstanding > 0.01 && (
          <RowActionMenuItem
            variant="success"
            icon={<CreditCard className="w-3.5 h-3.5" />}
            label="Record Payment"
            onClick={() => {
              setIsOpen(false);
              onOpenRecordPayment(ap || grn);
            }}
          />
        )}

        <RowActionMenuItem
          icon={<History className="w-3.5 h-3.5" />}
          label="Payment History"
          onClick={() => {
            setIsOpen(false);
            onOpenPaymentHistory(ap || grn);
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
  const vendors = state.vendors || [];
  const pos = state.purchaseOrders || [];
  const tokens = state.materialEntryTokens || [];
  const allPayments: GRNPayment[] = state.grnPayments || [];

  // Filter Form State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Applied Filter State (triggered by Apply / Clear or typing search)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    vendorId: 'all',
    status: 'all',
    from: '',
    to: '',
  });

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

  const todayISO = new Date().toISOString().split('T')[0];

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: searchQuery,
      vendorId: selectedVendorId,
      status: statusFilter,
      from: dateFrom,
      to: dateTo,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedVendorId('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setAppliedFilters({
      search: '',
      vendorId: 'all',
      status: 'all',
      from: '',
      to: '',
    });
  };

  // Filtered GRN records
  const filteredGRNs = grns.filter((g) => {
    const matchesVendor = appliedFilters.vendorId === 'all' || g.vendorId === appliedFilters.vendorId;

    const po = pos.find((p) => p.id === g.poId || p.poNumber === g.poNumber || p.documentNumber === g.poNumber);
    const token = tokens.find((t) => t.id === g.tokenId || t.tokenNumber === g.tokenId);
    const firstItem = g.items && g.items.length > 0 ? g.items[0] : null;
    const poLine = po && (po as any).lines && (po as any).lines.length > 0 ? (po as any).lines[0] : null;
    const productName = firstItem?.description || poLine?.materialName || poLine?.productName || token?.materialName || 'Material';
    const computedStatus = getGRNPaymentStatus(g, allPayments, po, todayISO);

    const matchesStatus = appliedFilters.status === 'all' || computedStatus === appliedFilters.status || g.status === appliedFilters.status;

    // Date Range Filtering against GRN creation/receipt date
    const gDateStr = g.grnDate || g.receivedDate || (g as any).createdAt?.split('T')[0] || '';
    let matchesDate = true;
    if (appliedFilters.from) {
      matchesDate = matchesDate && gDateStr >= appliedFilters.from;
    }
    if (appliedFilters.to) {
      matchesDate = matchesDate && gDateStr <= appliedFilters.to;
    }

    const searchLower = appliedFilters.search.trim().toLowerCase();
    const grnNumDisplay = resolveGRNNumber(grns, g);
    const tokenNumDisplay = resolveTokenNumber(tokens, g.tokenId || token);
    const poNumDisplay = resolvePONumber(pos, g.poId || po || g.poNumber);
    const vehicleNum = (token as any)?.vehicleNumber || (g as any)?.vehicleNumber || '';

    const matchesSearch =
      searchLower === '' ||
      g.grnNumber.toLowerCase().includes(searchLower) ||
      grnNumDisplay.toLowerCase().includes(searchLower) ||
      (g.tokenId && g.tokenId.toLowerCase().includes(searchLower)) ||
      tokenNumDisplay.toLowerCase().includes(searchLower) ||
      g.poNumber.toLowerCase().includes(searchLower) ||
      poNumDisplay.toLowerCase().includes(searchLower) ||
      (g.vendorName && g.vendorName.toLowerCase().includes(searchLower)) ||
      (g.projectName && g.projectName.toLowerCase().includes(searchLower)) ||
      productName.toLowerCase().includes(searchLower) ||
      vehicleNum.toLowerCase().includes(searchLower);

    return matchesVendor && matchesStatus && matchesDate && matchesSearch;
  });

  // Dynamic KPI Card Calculations
  const validGRNs = filteredGRNs.filter((g) => g.status !== 'Cancelled' && g.status !== 'cancelled');
  const totalGRNsCount = validGRNs.length;

  const openGRNsCount = validGRNs.filter((g) => {
    const po = pos.find((p) => p.id === g.poId || p.poNumber === g.poNumber || p.documentNumber === g.poNumber);
    return getGRNOutstanding(g, allPayments, po) > 0.01;
  }).length;

  const totalNetPayableSum = validGRNs.reduce((sum, g) => {
    const po = pos.find((p) => p.id === g.poId || p.poNumber === g.poNumber || p.documentNumber === g.poNumber);
    return sum + getGRNNetPayable(g, po);
  }, 0);

  const totalOutstandingSum = validGRNs.reduce((sum, g) => {
    const po = pos.find((p) => p.id === g.poId || p.poNumber === g.poNumber || p.documentNumber === g.poNumber);
    return sum + getGRNOutstanding(g, allPayments, po);
  }, 0);


  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Paid</span>;
      case 'Partially Paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">Partially Paid</span>;
      case 'Overdue':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-200">Overdue</span>;
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

      {/* 1. FOUR REAL-DATA KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
        {/* CARD 1: TOTAL GRNS */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col justify-between h-[115px]">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">TOTAL GRNS</span>
          <span className="text-2xl font-bold text-gray-900">{totalGRNsCount}</span>
        </div>

        {/* CARD 2: OPEN GRNS */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col justify-between h-[115px]">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">OPEN GRNS</span>
          <span className="text-2xl font-bold text-gray-900">{openGRNsCount}</span>
        </div>

        {/* CARD 3: NET PAYABLE */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col justify-between h-[115px]">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">NET PAYABLE</span>
          <span className="text-2xl font-bold text-gray-900">{formatIndianCurrency(totalNetPayableSum)}</span>
        </div>

        {/* CARD 4: OUTSTANDING */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col justify-between h-[115px]">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">OUTSTANDING</span>
          <span className="text-2xl font-bold text-gray-900">{formatIndianCurrency(totalOutstandingSum)}</span>
        </div>
      </div>

      {/* 2. ADVANCED REFERENCE-STYLE 2-ROW FILTER PANEL */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 flex flex-col gap-4">
        {/* ROW 1: SEARCH, VENDOR, PAYMENT STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SEARCH */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">SEARCH</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
                placeholder="GRN, Token, PO, Vehicle, Vendor..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* VENDOR */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">VENDOR</label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            >
              <option value="all">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* PAYMENT STATUS */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">PAYMENT STATUS</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* ROW 2: ISSUED FROM, ISSUED TO, APPLY FILTERS, CLEAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* ISSUED FROM */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">ISSUED FROM</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>

          {/* ISSUED TO */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">ISSUED TO</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2 md:pt-0">
            <button
              onClick={handleApplyFilters}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium text-sm rounded-lg border border-gray-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* 3. GRN TABLE */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-[190px]">GRN / Source</th>
                <th className="py-3.5 px-4 min-w-[260px]">Vendor & Material</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Accepted</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Rate</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Net Payable</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">AP Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Payment</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Due Date</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Payment Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-500">
                    No Goods Receipt Notes found. Adjust filter criteria or receive items via QC to generate GRNs.
                  </td>
                </tr>
              ) : (
                filteredGRNs.map((grn) => {
                  const po = pos.find((p) => p.id === grn.poId || p.poNumber === grn.poNumber || p.documentNumber === grn.poNumber);
                  const token = tokens.find((t) => t.id === grn.tokenId || t.tokenNumber === grn.tokenId);

                  const firstItem = grn.items && grn.items.length > 0 ? grn.items[0] : null;
                  const poLine = po && (po as any).lines && (po as any).lines.length > 0 ? (po as any).lines[0] : null;

                  const productName = firstItem?.description || poLine?.materialName || poLine?.productName || token?.materialName || 'Material';
                  const categoryNameDisplay = firstItem?.categoryName || poLine?.categoryName;
                  const vendorNameDisplay = grn.vendorName || po?.vendorName || 'Vendor';
                  const projectNameDisplay = grn.projectName || po?.projectName;
                  const unit = firstItem?.unit || poLine?.unit || 'nos';
                  
                  const rate = grn.poUnitRate ?? firstItem?.poUnitRate ?? firstItem?.unitRate ?? (poLine ? Number(poLine.unitRate ?? poLine.finalRate ?? poLine.basicRate ?? 0) : 0);
                  const acceptedQty = grn.acceptedQty ?? firstItem?.qcApprovedQty ?? 0;
                  
                  const netPayable = getGRNNetPayable(grn, po);
                  const paid = getGRNPaidAmount(grn, allPayments);
                  const outstanding = getGRNOutstanding(grn, allPayments, po);

                  let dueDate = grn.dueDate || 'Not Set';
                  if (!grn.dueDate && grn.grnDate) {
                    const pTerms = (po as any)?.paymentTerms || (po as any)?.paymentTermsDays;
                    const termDays = pTerms ? parseInt(String(pTerms), 10) : 30;
                    const d = new Date(grn.grnDate);
                    d.setDate(d.getDate() + (isNaN(termDays) ? 30 : termDays));
                    dueDate = d.toISOString().split('T')[0];
                  }

                  const isOverdue = outstanding > 0.01 && dueDate !== 'Not Set' && dueDate < todayISO;
                  const computedStatus = getGRNPaymentStatus(grn, allPayments, po, todayISO);

                  const grnNumDisplay = resolveGRNNumber(grns, grn);
                  const tokenNumDisplay = resolveTokenNumber(tokens, grn.tokenId || token);
                  const poNumDisplay = resolvePONumber(pos, grn.poId || po || grn.poNumber);

                  return (
                    <tr key={grn.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* 1. GRN / SOURCE */}
                      <td className="py-3.5 px-4 align-top w-[190px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-gray-900 whitespace-nowrap text-sm">{grnNumDisplay}</span>
                          {tokenNumDisplay && tokenNumDisplay !== 'N/A' && (
                            <span
                              onClick={() => navigate('/inventory/gate-tokens')}
                              className="text-xs text-gray-500 hover:text-amber-700 cursor-pointer whitespace-nowrap transition-colors"
                            >
                              Token: <span className="font-mono font-medium">{tokenNumDisplay}</span>
                            </span>
                          )}
                          {poNumDisplay && poNumDisplay !== 'N/A' && (
                            <span
                              onClick={() => navigate(po?.id ? `/procurement/purchase-orders/${po.id}` : '/procurement/purchase-orders')}
                              className="text-xs text-gray-500 hover:text-amber-700 cursor-pointer whitespace-nowrap transition-colors"
                            >
                              PO: <span className="font-mono font-medium">{poNumDisplay}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. VENDOR & MATERIAL */}
                      <td className="py-3.5 px-4 align-top min-w-[260px]">
                        <div className="flex flex-col gap-0.5 max-w-[360px]">
                          <span className="font-bold text-gray-900 text-sm">{vendorNameDisplay}</span>
                          <span
                            className="text-xs text-gray-800 line-clamp-2 leading-relaxed"
                            title={productName}
                          >
                            {productName}
                          </span>
                          {(projectNameDisplay || categoryNameDisplay) && (
                            <span className="text-[11px] text-gray-400 font-medium truncate">
                              {projectNameDisplay || categoryNameDisplay}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. ACCEPTED */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-medium text-gray-900">
                        {acceptedQty} <span className="text-xs text-gray-500 font-normal">{unit}</span>
                      </td>

                      {/* 4. RATE */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap text-gray-700">
                        ₹{rate.toLocaleString('en-IN')} / {unit}
                      </td>

                      {/* 5. NET PAYABLE */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-semibold text-gray-900">
                        ₹{netPayable.toLocaleString('en-IN')}
                      </td>

                      {/* 6. AP STATUS */}
                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        {(() => {
                          const ap = (state.vendorAPs || []).find((a) => a.grnId === grn.id || a.grnNumber === grn.grnNumber || a.grnNumber === grn.id);
                          const apStatus = ap?.apStatus || 'Approved';
                          return getAPStatusBadge(apStatus);
                        })()}
                      </td>

                      {/* 7. PAYMENT */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`text-xs ${paid > 0 ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                            Paid: ₹{paid.toLocaleString('en-IN')}
                          </span>
                          <span className={`text-xs font-semibold ${outstanding > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                            Due: ₹{outstanding.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>

                      {/* 8. DUE DATE */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-gray-700">{formatGRNDate(dueDate)}</span>
                          {isOverdue && (
                            <span className="inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 9. PAYMENT STATUS */}
                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        {getStatusBadge(computedStatus)}
                      </td>

                      {/* 10. ACTIONS */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        {(() => {
                          const ap = (state.vendorAPs || []).find((a) => a.grnId === grn.id || a.grnNumber === grn.grnNumber || a.grnNumber === grn.id);
                          return (
                            <GRNActionCell
                              grn={grn}
                              ap={ap}
                              poId={po?.id}
                              outstanding={outstanding}
                              onOpenRecordPayment={() => handleOpenRecordPayment(grn)}
                              onOpenPaymentHistory={() => handleOpenPaymentHistory(grn)}
                              navigate={navigate}
                            />
                          );
                        })()}
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
