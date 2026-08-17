import React, { useState, useRef } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import {
  SubcontractorBill,
  SubcontractorBillPayment,
} from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import { formatIndianCurrency } from '../../utils/format';
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  DollarSign,
  X,
  FileText,
  CreditCard,
  Edit,
  Check,
  Ban,
  Printer,
  Download,
  History,
  Eye,
  Building,
  Layers,
  MoreVertical,
} from 'lucide-react';

interface SubcontractorBillRowActionProps {
  bill: SubcontractorBill;
  hasPayments: boolean;
  onViewDetails: (bill: SubcontractorBill) => void;
  onEdit: (bill: SubcontractorBill) => void;
  onApprove: (bill: SubcontractorBill) => void;
  onReject: (bill: SubcontractorBill) => void;
  onReopen: (bill: SubcontractorBill) => void;
  onRecordPayment: (bill: SubcontractorBill) => void;
  onViewHistory: (bill: SubcontractorBill) => void;
  onViewWIP: (bill: SubcontractorBill) => void;
  onViewWO: (bill: SubcontractorBill) => void;
  onViewActivityLog: (bill: SubcontractorBill) => void;
}

const SubcontractorBillRowAction: React.FC<SubcontractorBillRowActionProps> = ({
  bill,
  hasPayments,
  onViewDetails,
  onEdit,
  onApprove,
  onReject,
  onReopen,
  onRecordPayment,
  onViewHistory,
  onViewWIP,
  onViewWO,
  onViewActivityLog,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const bStatus = (bill.billStatus || bill.status || '').toString().toLowerCase();
  const isPending = bStatus === 'pending approval' || bStatus === 'pending' || bStatus === 'verification_pending' || bStatus === 'submitted';
  const isApproved = bStatus === 'approved' || bStatus === 'posted_to_ap' || bStatus === 'certified';
  const isPartiallyPaid = bStatus === 'partially paid' || bStatus === 'partially_paid';
  
  const { paid, outstanding } = getBillFinancials(bill);

  const canPay = (isApproved || isPartiallyPaid) && outstanding > 0;
  const canReopen = isApproved && paid === 0 && !hasPayments;

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
        {/* Always visible: View Details */}
        <RowActionMenuItem
          icon={<Eye className="w-3.5 h-3.5" />}
          label="View Details"
          onClick={() => {
            setIsOpen(false);
            onViewDetails(bill);
          }}
        />

        {/* 1. Pending Approval Actions */}
        {isPending && (
          <>
            <RowActionMenuItem
              icon={<Edit className="w-3.5 h-3.5" />}
              label="Edit Bill Details"
              onClick={() => {
                setIsOpen(false);
                onEdit(bill);
              }}
            />
            <RowActionMenuItem
              variant="success"
              icon={<Check className="w-3.5 h-3.5" />}
              label="Approve Bill"
              onClick={() => {
                setIsOpen(false);
                onApprove(bill);
              }}
            />
            <RowActionMenuItem
              variant="danger"
              icon={<Ban className="w-3.5 h-3.5" />}
              label="Reject Bill"
              onClick={() => {
                setIsOpen(false);
                onReject(bill);
              }}
            />
          </>
        )}

        {/* 2. Approved / Partially Paid Payment Actions */}
        {canPay && (
          <RowActionMenuItem
            variant="success"
            icon={<CreditCard className="w-3.5 h-3.5" />}
            label="Record Payment"
            onClick={() => {
              setIsOpen(false);
              onRecordPayment(bill);
            }}
          />
        )}

        {/* Payment History (if payment exists) */}
        {(paid > 0 || hasPayments) && (
          <RowActionMenuItem
            icon={<History className="w-3.5 h-3.5" />}
            label="Payment History"
            onClick={() => {
              setIsOpen(false);
              onViewHistory(bill);
            }}
          />
        )}

        {/* Reopen Bill (Approved with 0 payments) */}
        {canReopen && (
          <RowActionMenuItem
            icon={<Edit className="w-3.5 h-3.5 text-amber-600" />}
            label="Reopen Bill"
            onClick={() => {
              setIsOpen(false);
              onReopen(bill);
            }}
          />
        )}

        <RowActionMenuDivider />

        {/* Utility / Document Links */}
        <RowActionMenuItem
          icon={<Download className="w-3.5 h-3.5" />}
          label="Download PDF"
          onClick={() => {
            setIsOpen(false);
            alert(`Downloading PDF for Subcontractor Bill ${bill.billNumber}`);
          }}
        />

        <RowActionMenuItem
          icon={<Printer className="w-3.5 h-3.5" />}
          label="Print Bill"
          onClick={() => {
            setIsOpen(false);
            alert(`Printing Subcontractor Bill ${bill.billNumber}`);
          }}
        />

        <RowActionMenuItem
          icon={<Building className="w-3.5 h-3.5" />}
          label="View Work Order"
          onClick={() => {
            setIsOpen(false);
            onViewWO(bill);
          }}
        />

        <RowActionMenuItem
          icon={<Layers className="w-3.5 h-3.5" />}
          label="View Certified WIP"
          onClick={() => {
            setIsOpen(false);
            onViewWIP(bill);
          }}
        />

        <RowActionMenuItem
          icon={<History className="w-3.5 h-3.5" />}
          label="View Activity Log"
          onClick={() => {
            setIsOpen(false);
            onViewActivityLog(bill);
          }}
        />
      </RowActionMenu>
    </>
  );
};

export const getBillFinancials = (bill: any) => {
  const gross = Number(bill?.grossCertifiedValue ?? bill?.grossAmount) || 0;
  const retention = Number(bill?.retentionDeducted ?? bill?.retentionAmount) || 0;
  const advance = Number(bill?.advanceRecoveryDeducted) || 0;
  const other = Number(bill?.otherDeductions ?? bill?.tdsAmount) || 0;
  const totalDeductions = Number(bill?.totalDeductions) || (retention + advance + other);
  const tax = Number(bill?.taxAmount) || 0;
  const net = Number(bill?.netPayable ?? bill?.netBillAmount ?? bill?.netPayableAmount) || Math.max(0, gross - totalDeductions + tax);
  const paid = Number(bill?.paidAmount) || 0;
  const outstanding = typeof bill?.outstandingAmount === 'number' && !isNaN(bill.outstandingAmount)
    ? bill.outstandingAmount
    : Math.max(0, net - paid);

  return { gross, retention, advance, other, totalDeductions, tax, net, paid, outstanding };
};

export const SubcontractorBillsPage: React.FC = () => {
  const {
    state,
    approveSubcontractorBill,
    rejectSubcontractorBill,
    reopenSubcontractorBill,
    editSubcontractorBill,
    recordSubcontractorPayment,
  } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedSubcontractorId, setSelectedSubcontractorId] = useState<string>('all');
  const [billStatusFilter, setBillStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Records for Modals
  const [selectedBill, setSelectedBill] = useState<SubcontractorBill | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [reopenModalOpen, setReopenModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [activityLogModalOpen, setActivityLogModalOpen] = useState<boolean>(false);
  const [wipModalOpen, setWipModalOpen] = useState<boolean>(false);
  const [woModalOpen, setWoModalOpen] = useState<boolean>(false);

  // Form & Error states
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [reopenReason, setReopenReason] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    amountPaid: '',
    paymentMethod: 'Bank Transfer (NEFT/RTGS)',
    referenceNumber: '',
    payingBankAccount: 'HDFC Bank - A/C 50200012345678',
    remarks: '',
  });
  const [editForm, setEditForm] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    retentionDeducted: 0,
    advanceRecoveryDeducted: 0,
    otherDeductions: 0,
    taxAmount: 0,
    remarks: '',
  });

  const bills: SubcontractorBill[] = state.subcontractorBills || [];
  const subcontractors = state.subcontractors || [];
  const projects = state.projects || [];
  const payments: SubcontractorBillPayment[] = (state as any).subcontractorPayments || [];
  const auditLogs: any[] = (state as any).auditLogs || (state as any).auditEvents || [];

  // Filtered dataset
  const filteredBills = bills.filter((bill) => {
    const matchesProject = selectedProjectId === 'all' || bill.projectId === selectedProjectId;
    const matchesSubcontractor = selectedSubcontractorId === 'all' || bill.subcontractorId === selectedSubcontractorId;
    
    const bStatus = bill.billStatus || bill.status;
    const matchesBillStatus = billStatusFilter === 'all' || bStatus === billStatusFilter;
    
    const pStatus = bill.paymentStatus;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || pStatus === paymentStatusFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      bill.billNumber.toLowerCase().includes(query) ||
      (bill.invoiceNumber && bill.invoiceNumber.toLowerCase().includes(query)) ||
      (bill.wipNumber && bill.wipNumber.toLowerCase().includes(query)) ||
      (bill.woNumber && bill.woNumber.toLowerCase().includes(query)) ||
      bill.subcontractorName.toLowerCase().includes(query) ||
      bill.projectName.toLowerCase().includes(query);

    return matchesProject && matchesSubcontractor && matchesBillStatus && matchesPaymentStatus && matchesSearch;
  });

  // KPI Metrics Calculation
  const activeScopeBills = selectedProjectId === 'all'
    ? bills
    : bills.filter((b) => b.projectId === selectedProjectId);

  const totalBillsCount = activeScopeBills.length;
  const pendingApprovalCount = activeScopeBills.filter(
    (b) => (b.billStatus || b.status) === 'Pending Approval' || (b.billStatus || b.status) === 'verification_pending'
  ).length;
  
  const approvedBills = activeScopeBills.filter(
    (b) => (b.billStatus || b.status) === 'Approved' || (b.billStatus || b.status) === 'posted_to_ap'
  );

  const approvedOutstandingAmount = approvedBills.reduce((sum, b) => {
    const gross = b.grossCertifiedValue ?? b.grossAmount ?? 0;
    const deductions = b.totalDeductions ?? ((b.retentionDeducted || 0) + (b.advanceRecoveryDeducted || 0) + (b.otherDeductions || 0));
    const net = b.netPayable || b.netBillAmount || (gross - deductions + (b.taxAmount || 0));
    const paid = b.paidAmount || 0;
    return sum + (b.outstandingAmount ?? (net - paid));
  }, 0);

  const totalPayableAmount = activeScopeBills.reduce((sum, b) => {
    const gross = b.grossCertifiedValue ?? b.grossAmount ?? 0;
    const deductions = b.totalDeductions ?? ((b.retentionDeducted || 0) + (b.advanceRecoveryDeducted || 0) + (b.otherDeductions || 0));
    return sum + (b.netPayable || b.netBillAmount || (gross - deductions + (b.taxAmount || 0)));
  }, 0);

  const totalPaidAmount = activeScopeBills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = approvedBills.filter((b) => {
    const gross = b.grossCertifiedValue ?? b.grossAmount ?? 0;
    const deductions = b.totalDeductions ?? ((b.retentionDeducted || 0) + (b.advanceRecoveryDeducted || 0) + (b.otherDeductions || 0));
    const net = b.netPayable || b.netBillAmount || (gross - deductions + (b.taxAmount || 0));
    const out = b.outstandingAmount ?? (net - (b.paidAmount || 0));
    return out > 0 && b.dueDate && b.dueDate < todayStr;
  }).length;

  // Handlers
  const handleOpenApprove = (bill: SubcontractorBill) => {
    setSelectedBill(bill);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedBill) return;
    approveSubcontractorBill(selectedBill.id, 'Finance Director');
    setApproveModalOpen(false);
  };

  const handleOpenReject = (bill: SubcontractorBill) => {
    setSelectedBill(bill);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill || !rejectionReason.trim()) return;
    rejectSubcontractorBill(selectedBill.id, rejectionReason, 'Finance Director');
    setRejectModalOpen(false);
  };

  const handleOpenReopen = (bill: SubcontractorBill) => {
    setSelectedBill(bill);
    setReopenReason('');
    setReopenModalOpen(true);
  };

  const handleConfirmReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill || !reopenReason.trim()) return;
    const res = reopenSubcontractorBill(selectedBill.id, reopenReason, 'Finance Manager');
    if (res.success) {
      setReopenModalOpen(false);
    } else {
      alert(res.error || 'Failed to reopen bill');
    }
  };

  const handleOpenEdit = (bill: SubcontractorBill) => {
    setSelectedBill(bill);
    setEditForm({
      invoiceNumber: bill.invoiceNumber || '',
      invoiceDate: bill.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: bill.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      retentionDeducted: bill.retentionDeducted || 0,
      advanceRecoveryDeducted: bill.advanceRecoveryDeducted || 0,
      otherDeductions: bill.otherDeductions || 0,
      taxAmount: bill.taxAmount || 0,
      remarks: bill.remarks || '',
    });
    setEditModalOpen(true);
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    editSubcontractorBill(selectedBill.id, editForm, 'Finance Officer');
    setEditModalOpen(false);
  };

  const handleOpenPayment = (bill: SubcontractorBill) => {
    setSelectedBill(bill);
    setPaymentError(null);
    const gross = bill.grossCertifiedValue ?? bill.grossAmount ?? 0;
    const deductions = bill.totalDeductions ?? ((bill.retentionDeducted || 0) + (bill.advanceRecoveryDeducted || 0) + (bill.otherDeductions || 0));
    const net = bill.netPayable || bill.netBillAmount || (gross - deductions + (bill.taxAmount || 0));
    const paid = bill.paidAmount || 0;
    const outstanding = bill.outstandingAmount ?? (net - paid);
    setPaymentForm({
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: outstanding > 0 ? outstanding.toString() : '',
      paymentMethod: 'Bank Transfer (NEFT/RTGS)',
      referenceNumber: `UTR${Date.now().toString().slice(-8)}`,
      payingBankAccount: 'HDFC Bank - A/C 50200012345678',
      remarks: '',
    });
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    setPaymentError(null);
    const amt = parseFloat(paymentForm.amountPaid);
    if (isNaN(amt) || amt <= 0) {
      setPaymentError('Payment amount must be greater than zero.');
      return;
    }
    
    const res = recordSubcontractorPayment(selectedBill.id, {
      paymentDate: paymentForm.paymentDate,
      amountPaid: amt,
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber,
      payingBankAccount: paymentForm.payingBankAccount,
      remarks: paymentForm.remarks,
    }, 'Accounts Specialist');

    if (res.success) {
      setPaymentModalOpen(false);
    } else {
      setPaymentError(res.error || 'Failed to record payment');
    }
  };

  const getBillStatusBadge = (bill: SubcontractorBill) => {
    const status = bill.billStatus || bill.status;
    switch (status) {
      case 'Pending Approval':
      case 'verification_pending':
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" /> Pending Approval
          </span>
        );
      case 'Approved':
      case 'posted_to_ap':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <X className="w-3 h-3 mr-1 text-rose-600" /> Rejected
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (bill: SubcontractorBill) => {
    const bStatus = bill.billStatus || bill.status;
    if (bStatus === 'Rejected') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
          N/A
        </span>
      );
    }

    const pStatus = bill.paymentStatus || 'Not Started';
    switch (pStatus) {
      case 'Not Started':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">Not Started</span>;
      case 'Payment Pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">Payment Pending</span>;
      case 'Partially Paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">Partially Paid</span>;
      case 'Paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">Paid</span>;
      case 'Overdue':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">Overdue</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{pStatus}</span>;
    }
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Subcontractor Bills"
        subtitle="Review certified subcontractor work, approve payable bills and track subcontractor payments."
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 my-4">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Bills</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900">{totalBillsCount}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">WIP Certified</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pending Approval</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-amber-700">{pendingApprovalCount}</h3>
            <p className="text-[11px] text-amber-600 mt-0.5">Finance Sign-off</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Approved Outstanding</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-blue-800">{formatIndianCurrency(approvedOutstandingAmount)}</h3>
            <p className="text-[11px] text-blue-600 mt-0.5">Approved Payable</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Payable</span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-purple-900">{formatIndianCurrency(totalPayableAmount)}</h3>
            <p className="text-[11px] text-purple-600 mt-0.5">Net Billed Value</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Paid</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-emerald-700">{formatIndianCurrency(totalPaidAmount)}</h3>
            <p className="text-[11px] text-emerald-600 mt-0.5">Settled Payments</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Overdue</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-rose-700">{overdueCount}</h3>
            <p className="text-[11px] text-rose-600 mt-0.5">Past Due Date</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Bill #, WO #, WIP #, Subcontractor, Project or Invoice #..."
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
            id: 'subcontractor-filter',
            label: 'Subcontractor',
            value: selectedSubcontractorId,
            onChange: setSelectedSubcontractorId,
            options: [
              { value: 'all', label: 'All Subcontractors' },
              ...subcontractors.map((s) => ({ value: s.id, label: s.name })),
            ],
          },
          {
            id: 'bill-status-filter',
            label: 'Bill Status',
            value: billStatusFilter,
            onChange: setBillStatusFilter,
            options: [
              { value: 'all', label: 'All Bill Statuses' },
              { value: 'Pending Approval', label: 'Pending Approval' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' },
            ],
          },
          {
            id: 'payment-status-filter',
            label: 'Payment Status',
            value: paymentStatusFilter,
            onChange: setPaymentStatusFilter,
            options: [
              { value: 'all', label: 'All Payment Statuses' },
              { value: 'Not Started', label: 'Not Started' },
              { value: 'Payment Pending', label: 'Payment Pending' },
              { value: 'Partially Paid', label: 'Partially Paid' },
              { value: 'Paid', label: 'Paid' },
            ],
          },
        ]}
      />

      {/* 10-Column Clean Subcontractor Bill Register Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Bill / Source</th>
              <th className="py-3.5 px-4">Subcontractor / Project</th>
              <th className="py-3.5 px-4">WO / WIP</th>
              <th className="py-3.5 px-4 text-right">Gross Value</th>
              <th className="py-3.5 px-4 text-right">Deductions</th>
              <th className="py-3.5 px-4 text-right">Net Payable</th>
              <th className="py-3.5 px-4 text-left">Payment</th>
              <th className="py-3.5 px-4 text-center">Bill Status</th>
              <th className="py-3.5 px-4 text-center">Payment Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="font-semibold text-gray-700">No Subcontractor Bills found</p>
                  <p className="text-xs text-gray-400 mt-1">Subcontractor bills are automatically generated when WIP measurements are certified.</p>
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => {
                const { gross, totalDeductions, net, paid, outstanding } = getBillFinancials(bill);
                const hasPayments = payments.some((p) => p.billId === bill.id);

                return (
                  <tr key={bill.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* 1. BILL / SOURCE */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{bill.billNumber}</span>
                        <span className="text-[11px] text-gray-500">Inv: {bill.invoiceNumber || 'N/A'}</span>
                      </div>
                    </td>

                    {/* 2. SUBCONTRACTOR / PROJECT */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="font-semibold text-gray-900 truncate">{bill.subcontractorName}</span>
                        <span className="text-[11px] text-gray-500 truncate">{bill.projectName}</span>
                      </div>
                    </td>

                    {/* 3. WO / WIP */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{bill.woNumber}</span>
                        <span className="text-[11px] text-gray-500">WIP: {bill.wipNumber || bill.wipId || 'Certified'}</span>
                      </div>
                    </td>

                    {/* 4. GROSS VALUE */}
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      {formatIndianCurrency(gross)}
                    </td>

                    {/* 5. DEDUCTIONS */}
                    <td className="py-3 px-4 text-right text-amber-700 font-medium">
                      -{formatIndianCurrency(totalDeductions)}
                    </td>

                    {/* 6. NET PAYABLE */}
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {formatIndianCurrency(net)}
                    </td>

                    {/* 7. PAYMENT */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-emerald-700 font-medium">Paid: {formatIndianCurrency(paid)}</span>
                        <span className="text-gray-600 font-medium">Due: {formatIndianCurrency(outstanding)}</span>
                      </div>
                    </td>

                    {/* 8. BILL STATUS */}
                    <td className="py-3 px-4 text-center">
                      {getBillStatusBadge(bill)}
                    </td>

                    {/* 9. PAYMENT STATUS */}
                    <td className="py-3 px-4 text-center">
                      {getPaymentStatusBadge(bill)}
                    </td>

                    {/* 10. ACTIONS */}
                    <td className="py-3 px-4 text-right">
                      <SubcontractorBillRowAction
                        bill={bill}
                        hasPayments={hasPayments}
                        onViewDetails={(b) => {
                          setSelectedBill(b);
                          setDetailsModalOpen(true);
                        }}
                        onEdit={handleOpenEdit}
                        onApprove={handleOpenApprove}
                        onReject={handleOpenReject}
                        onReopen={handleOpenReopen}
                        onRecordPayment={handleOpenPayment}
                        onViewHistory={(b) => {
                          setSelectedBill(b);
                          setHistoryModalOpen(true);
                        }}
                        onViewWIP={(b) => {
                          setSelectedBill(b);
                          setWipModalOpen(true);
                        }}
                        onViewWO={(b) => {
                          setSelectedBill(b);
                          setWoModalOpen(true);
                        }}
                        onViewActivityLog={(b) => {
                          setSelectedBill(b);
                          setActivityLogModalOpen(true);
                        }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bill Details Modal */}
      {detailsModalOpen && selectedBill && (() => {
        const { gross, retention, advance, other, tax, net } = getBillFinancials(selectedBill);
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedBill.billNumber} Details</h3>
                <p className="text-xs text-gray-500">Certified Subcontractor Payable Record</p>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1.5">
                <p><span className="text-gray-500">Subcontractor:</span> <span className="font-bold text-gray-900">{selectedBill.subcontractorName}</span></p>
                <p><span className="text-gray-500">Project:</span> <span className="font-semibold text-gray-800">{selectedBill.projectName}</span></p>
                <p><span className="text-gray-500">Work Order:</span> <span className="font-semibold text-gray-800">{selectedBill.woNumber}</span></p>
                <p><span className="text-gray-500">WIP Reference:</span> <span className="font-semibold text-gray-800">{selectedBill.wipNumber || selectedBill.wipId}</span></p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1.5">
                <p><span className="text-gray-500">External Invoice #:</span> <span className="font-bold text-gray-900">{selectedBill.invoiceNumber || 'N/A'}</span></p>
                <p><span className="text-gray-500">Invoice Date:</span> <span className="font-medium text-gray-800">{selectedBill.invoiceDate || 'N/A'}</span></p>
                <p><span className="text-gray-500">Due Date:</span> <span className="font-medium text-gray-800">{selectedBill.dueDate || 'N/A'}</span></p>
                <p><span className="text-gray-500">Bill Status:</span> <span className="font-semibold text-amber-700">{selectedBill.billStatus || selectedBill.status}</span></p>
              </div>
            </div>

            {/* Financial Computation Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Financial Breakdown</h4>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-gray-600">Gross Certified Work Value:</span>
                <span className="font-semibold text-gray-900">{formatIndianCurrency(gross)}</span>
              </div>
              <div className="flex justify-between py-1 text-amber-700 border-b border-slate-200">
                <span>Retention Deduction:</span>
                <span>-{formatIndianCurrency(retention)}</span>
              </div>
              {advance ? (
                <div className="flex justify-between py-1 text-amber-700 border-b border-slate-200">
                  <span>Advance Recovery Deduction:</span>
                  <span>-{formatIndianCurrency(advance)}</span>
                </div>
              ) : null}
              {other ? (
                <div className="flex justify-between py-1 text-amber-700 border-b border-slate-200">
                  <span>Other Deductions:</span>
                  <span>-{formatIndianCurrency(other)}</span>
                </div>
              ) : null}
              <div className="flex justify-between py-1 text-gray-600 border-b border-slate-200">
                <span>Applicable Tax (GST):</span>
                <span>+{formatIndianCurrency(tax)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
                <span>Net Payable Amount:</span>
                <span className="text-emerald-700">{formatIndianCurrency(net)}</span>
              </div>
              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Approve Confirmation Modal */}
      {approveModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Check className="w-5 h-5 mr-2 text-emerald-600" /> Approve Subcontractor Bill
            </h3>
            <p className="text-xs text-gray-600">
              Are you sure you want to approve Subcontractor Bill <strong className="text-gray-900">{selectedBill.billNumber}</strong> for <strong className="text-gray-900">{selectedBill.subcontractorName}</strong>?
            </p>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs space-y-1">
              <div className="flex justify-between text-gray-700">
                <span>Gross Value:</span>
                <span className="font-semibold">{formatIndianCurrency(selectedBill.grossCertifiedValue ?? selectedBill.grossAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Net Payable Amount:</span>
                <span className="font-bold text-emerald-800">{formatIndianCurrency(selectedBill.netPayable || selectedBill.netBillAmount)}</span>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Approve Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Ban className="w-5 h-5 mr-2 text-rose-600" /> Reject Subcontractor Bill
            </h3>
            <p className="text-xs text-gray-600">
              Please provide a reason for rejecting Bill <strong className="text-gray-900">{selectedBill.billNumber}</strong>.
            </p>
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="State clear reasons for rejection..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reopen Bill Modal */}
      {reopenModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Edit className="w-5 h-5 mr-2 text-amber-600" /> Reopen Subcontractor Bill
            </h3>
            <p className="text-xs text-gray-600">
              Reopening Bill <strong className="text-gray-900">{selectedBill.billNumber}</strong> will return its status back to <strong className="text-amber-700">Pending Approval</strong>. This action will be recorded in the audit log.
            </p>
            <form onSubmit={handleConfirmReopen} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mandatory Reopen Reason *</label>
                <textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="State reason for reopening this approved bill for revision..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setReopenModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  Confirm Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (Pending Approval) */}
      {editModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Edit Subcontractor Bill</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">External Invoice #</label>
                  <input
                    type="text"
                    value={editForm.invoiceNumber}
                    onChange={(e) => setEditForm({ ...editForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={editForm.invoiceDate}
                    onChange={(e) => setEditForm({ ...editForm, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Retention Deduction (₹)</label>
                  <input
                    type="number"
                    value={editForm.retentionDeducted}
                    onChange={(e) => setEditForm({ ...editForm, retentionDeducted: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Advance Recovery (₹)</label>
                  <input
                    type="number"
                    value={editForm.advanceRecoveryDeducted}
                    onChange={(e) => setEditForm({ ...editForm, advanceRecoveryDeducted: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">GST Tax Amount (₹)</label>
                  <input
                    type="number"
                    value={editForm.taxAmount}
                    onChange={(e) => setEditForm({ ...editForm, taxAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Finance Remarks</label>
                <textarea
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-emerald-600" /> Record Subcontractor Payment
              </h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center text-xs text-rose-700 font-medium">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-600" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <p><span className="text-gray-500">Bill Number:</span> <span className="font-bold text-gray-900">{selectedBill.billNumber}</span></p>
              <p><span className="text-gray-500">Subcontractor:</span> <span className="font-semibold text-gray-900">{selectedBill.subcontractorName}</span></p>
              <p><span className="text-gray-500">Net Payable:</span> <span className="font-bold text-emerald-700">{formatIndianCurrency(selectedBill.netPayable || selectedBill.netBillAmount)}</span></p>
              <p><span className="text-gray-500">Outstanding Balance:</span> <span className="font-bold text-amber-700">{formatIndianCurrency(selectedBill.outstandingAmount ?? ((selectedBill.netPayable || selectedBill.netBillAmount) - (selectedBill.paidAmount || 0)))}</span></p>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amountPaid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI / Online">UPI / Online</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Reference / UTR / Cheque # *</label>
                <input
                  type="text"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  required
                  placeholder="e.g. UTR98765432"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Paying Bank Account</label>
                <input
                  type="text"
                  value={paymentForm.payingBankAccount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payingBankAccount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Payment Remarks</label>
                <textarea
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  rows={2}
                  placeholder="Optional payment notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {historyModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <History className="w-5 h-5 mr-2 text-purple-600" /> Payment History - {selectedBill.billNumber}
              </h3>
              <button onClick={() => setHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {payments.filter((p) => p.billId === selectedBill.id).length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No payment records found for this bill.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {payments
                  .filter((p) => p.billId === selectedBill.id)
                  .map((p) => (
                    <div key={p.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">{p.paymentNumber}</p>
                        <p className="text-gray-500">{p.paymentDate} • {p.paymentMethod}</p>
                        <p className="text-gray-500">Ref: {p.referenceNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-700">{formatIndianCurrency(p.amountPaid)}</span>
                        <p className="text-[10px] text-gray-400">By {p.recordedBy}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certified WIP View Modal */}
      {wipModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-indigo-600" /> Linked Certified WIP Details
              </h3>
              <button onClick={() => setWipModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p><span className="text-gray-500">WIP Reference:</span> <span className="font-bold text-gray-900">{selectedBill.wipNumber || selectedBill.wipId}</span></p>
              <p><span className="text-gray-500">Subcontractor:</span> <span className="font-semibold text-gray-900">{selectedBill.subcontractorName}</span></p>
              <p><span className="text-gray-500">Project:</span> <span className="font-semibold text-gray-900">{selectedBill.projectName}</span></p>
              <p><span className="text-gray-500">Work Order:</span> <span className="font-semibold text-gray-900">{selectedBill.woNumber}</span></p>
              <p><span className="text-gray-500">Gross Certified Work Value:</span> <span className="font-bold text-emerald-700">{formatIndianCurrency(selectedBill.grossCertifiedValue ?? selectedBill.grossAmount)}</span></p>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setWipModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Order View Modal */}
      {woModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-gray-700" /> Linked Work Order Details
              </h3>
              <button onClick={() => setWoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p><span className="text-gray-500">Work Order Number:</span> <span className="font-bold text-gray-900">{selectedBill.woNumber}</span></p>
              <p><span className="text-gray-500">Subcontractor:</span> <span className="font-semibold text-gray-900">{selectedBill.subcontractorName}</span></p>
              <p><span className="text-gray-500">Project:</span> <span className="font-semibold text-gray-900">{selectedBill.projectName}</span></p>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setWoModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Activity Log Modal */}
      {activityLogModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-600" /> Audit Activity Log - {selectedBill.billNumber}
              </h3>
              <button onClick={() => setActivityLogModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {auditLogs.filter((log: any) => log.documentId === selectedBill.id || log.documentNumber === selectedBill.billNumber).length === 0 ? (
              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-800">Lifecycle Audit Trail:</p>
                <div className="space-y-1.5 text-slate-600">
                  <p>• Created automatically from Certified WIP <span className="font-mono font-bold text-slate-800">{selectedBill.wipNumber || selectedBill.wipId}</span> by <span className="font-semibold">{selectedBill.createdBy || 'System'}</span> on {selectedBill.createdAt?.split('T')[0] || selectedBill.billDate}.</p>
                  {selectedBill.approvedBy && (
                    <p>• Approved by <span className="font-semibold">{selectedBill.approvedBy}</span> on {selectedBill.approvedAt?.split('T')[0] || selectedBill.billDate}.</p>
                  )}
                  {selectedBill.rejectedBy && (
                    <p className="text-rose-700">• Rejected by <span className="font-semibold">{selectedBill.rejectedBy}</span>. Reason: {selectedBill.rejectionReason}</p>
                  )}
                  {selectedBill.reopenedBy && (
                    <p className="text-amber-700">• Reopened by <span className="font-semibold">{selectedBill.reopenedBy}</span> on {selectedBill.reopenedAt?.split('T')[0]}. Reason: {selectedBill.reopenReason}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {auditLogs
                  .filter((log: any) => log.documentId === selectedBill.id || log.documentNumber === selectedBill.billNumber)
                  .map((log: any) => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>{log.action}</span>
                        <span className="text-gray-500 font-normal">{log.timestamp || log.createdAt}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{log.details}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">By {log.performedBy}</p>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setActivityLogModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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

export default SubcontractorBillsPage;
