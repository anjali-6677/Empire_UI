import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { ClientRABill, ClientRABillStatus, ClientRABillPaymentStatus } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';
import { printClientRABillDocument } from '../../utils/clientRABillPdfGenerator';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { SummaryKpiCard } from '../../components/common/SummaryKpiCard';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  DollarSign,
  Printer,
  Eye,
  Edit,
  RotateCcw,
  Building2,
  TrendingUp,
  AlertCircle,
  Receipt,
  MoreVertical,
  X,
  History,
  FileCheck2,
} from 'lucide-react';

export const ClientRABillsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paramBillNumber = searchParams.get('billNumber');
  const paramProjectId = searchParams.get('projectId');

  const {
    state,
    createClientRABill,
    editClientRABill,
    submitClientRABillForApproval,
    approveClientRABill,
    rejectClientRABill,
    markClientRABillSent,
    recordClientPayment,
    reopenClientRABill,
  } = useERPStore();

  // Filter States
  const [searchTerm, setSearchTerm] = useState(paramBillNumber || '');
  const [selectedProjectId, setSelectedProjectId] = useState(paramProjectId || 'ALL');
  const [selectedClientId, setSelectedClientId] = useState('ALL');
  const [selectedBillStatus, setSelectedBillStatus] = useState('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('ALL');

  useEffect(() => {
    if (paramBillNumber) setSearchTerm(paramBillNumber);
    if (paramProjectId) setSelectedProjectId(paramProjectId);
  }, [paramBillNumber, paramProjectId]);

  // Active Action Portal / Modals
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [viewDetailsBill, setViewDetailsBill] = useState<ClientRABill | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalBill, setEditModalBill] = useState<ClientRABill | null>(null);
  const [rejectModalBill, setRejectModalBill] = useState<ClientRABill | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reopenModalBill, setReopenModalBill] = useState<ClientRABill | null>(null);
  const [reopenReason, setReopenReason] = useState('');
  const [paymentModalBill, setPaymentModalBill] = useState<ClientRABill | null>(null);
  const [paymentHistoryBill, setPaymentHistoryBill] = useState<ClientRABill | null>(null);
  const [auditLogBill, setAuditLogBill] = useState<ClientRABill | null>(null);

  // Form inputs for Create / Edit
  const [formProjectId, setFormProjectId] = useState('');
  const [formMilestoneId, setFormMilestoneId] = useState('');
  const [formBillDate, setFormBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [formGrossWork, setFormGrossWork] = useState('');
  const [formVariations, setFormVariations] = useState('0');
  const [formRetention, setFormRetention] = useState('0');
  const [formAdvanceRec, setFormAdvanceRec] = useState('0');
  const [formOtherDed, setFormOtherDed] = useState('0');
  const [formTax, setFormTax] = useState('0');
  const [formError, setFormError] = useState('');

  // Payment Form inputs
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('Bank Transfer (RTGS)');
  const [payRef, setPayRef] = useState('');
  const [payBank, setPayBank] = useState('HDFC Bank - Main Current A/C (x8892)');
  const [payRemarks, setPayRemarks] = useState('');
  const [payError, setPayError] = useState('');

  const raBills: ClientRABill[] = state.clientRABills || [];
  const projects = state.projects || [];
  const clients = state.clients || [];

  // Filtered List
  const filteredBills = useMemo(() => {
    return raBills.filter((b) => {
      const matchSearch =
        b.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.milestoneName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchProj = selectedProjectId === 'ALL' || b.projectId === selectedProjectId;
      const matchClient = selectedClientId === 'ALL' || b.clientId === selectedClientId;
      const matchBillStatus = selectedBillStatus === 'ALL' || b.billStatus === selectedBillStatus;
      const matchPayStatus = selectedPaymentStatus === 'ALL' || b.paymentStatus === selectedPaymentStatus;

      return matchSearch && matchProj && matchClient && matchBillStatus && matchPayStatus;
    });
  }, [raBills, searchTerm, selectedProjectId, selectedClientId, selectedBillStatus, selectedPaymentStatus]);

  // KPI Calculations
  const kpis = useMemo(() => {
    let totalBilled = 0;
    let outstanding = 0;
    let overdue = 0;
    let totalReceived = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    raBills.forEach((b) => {
      if (b.billStatus !== 'Cancelled' && b.billStatus !== 'Rejected') {
        totalBilled += b.netReceivable || 0;
        outstanding += b.outstandingAmount || 0;
        totalReceived += b.paidAmount || 0;

        if (b.paymentStatus === 'Overdue' || (b.dueDate < todayStr && b.outstandingAmount > 0)) {
          overdue += b.outstandingAmount || 0;
        }
      }
    });

    return { totalBilled, outstanding, overdue, totalReceived };
  }, [raBills]);

  // Selected project's milestones
  const availableMilestones = useMemo(() => {
    if (!formProjectId) return [];
    const proj = projects.find((p) => p.id === formProjectId);
    const projAny = proj as any;
    if (projAny?.milestones && projAny.milestones.length > 0) {
      return projAny.milestones;
    }
    return [
      { id: `${formProjectId}-m1`, milestoneName: 'Mobilization & Site Setup (20%)', billingPercentage: 20, amount: (projAny?.budget || projAny?.approvedBudget || 10000000) * 0.2 },
      { id: `${formProjectId}-m2`, milestoneName: 'Structural & Core Execution (30%)', billingPercentage: 30, amount: (projAny?.budget || projAny?.approvedBudget || 10000000) * 0.3 },
      { id: `${formProjectId}-m3`, milestoneName: 'MEP, Joinery & Finishes (25%)', billingPercentage: 25, amount: (projAny?.budget || projAny?.approvedBudget || 10000000) * 0.25 },
      { id: `${formProjectId}-m4`, milestoneName: 'Handover & Final Certification (25%)', billingPercentage: 25, amount: (projAny?.budget || projAny?.approvedBudget || 10000000) * 0.25 },
    ];
  }, [formProjectId, projects]);

  const handleOpenCreate = () => {
    setFormProjectId('');
    setFormMilestoneId('');
    setFormBillDate(new Date().toISOString().split('T')[0]);
    setFormDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setFormGrossWork('');
    setFormVariations('0');
    setFormRetention('0');
    setFormAdvanceRec('0');
    setFormOtherDed('0');
    setFormTax('0');
    setFormError('');
    setCreateModalOpen(true);
  };

  const handleGrossChange = (val: string) => {
    setFormGrossWork(val);
    const num = parseFloat(val) || 0;
    // Auto retention 5%
    setFormRetention(String(Math.round(num * 0.05)));
    // Auto tax 18% GST
    setFormTax(String(Math.round((num - Math.round(num * 0.05)) * 0.18)));
  };

  const calcNetReceivable = () => {
    const gross = parseFloat(formGrossWork) || 0;
    const variations = parseFloat(formVariations) || 0;
    const retention = parseFloat(formRetention) || 0;
    const advanceRec = parseFloat(formAdvanceRec) || 0;
    const otherDed = parseFloat(formOtherDed) || 0;
    const totalDed = retention + advanceRec + otherDed;
    const tax = parseFloat(formTax) || 0;
    return gross + variations - totalDed + tax;
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProjectId) return setFormError('Please select a project');
    if (!formMilestoneId) return setFormError('Please select a project milestone');
    const gross = parseFloat(formGrossWork);
    if (isNaN(gross) || gross <= 0) return setFormError('Gross work value must be greater than zero');

    const proj = projects.find((p) => p.id === formProjectId);
    const projAny = proj as any;
    const client = clients.find((c) => c.id === projAny?.clientId || c.name === projAny?.clientName);
    const milestone = availableMilestones.find((m: any) => m.id === formMilestoneId);

    const res = createClientRABill({
      projectId: proj?.id,
      projectName: projAny?.projectName || projAny?.name || 'Project',
      clientId: client?.id || projAny?.clientId || 'cli-001',
      clientName: client?.name || projAny?.clientName || 'Client',
      milestoneId: milestone?.id || formMilestoneId,
      milestoneName: milestone?.milestoneName || 'Milestone Stage',
      billDate: formBillDate,
      dueDate: formDueDate,
      claimedAmount: gross,
      grossWorkValue: gross,
      approvedVariations: parseFloat(formVariations) || 0,
      retentionAmount: parseFloat(formRetention) || 0,
      advanceRecoveryAmount: parseFloat(formAdvanceRec) || 0,
      otherDeductions: parseFloat(formOtherDed) || 0,
      taxAmount: parseFloat(formTax) || 0,
    });

    if (res.success) {
      setCreateModalOpen(false);
    } else {
      setFormError(res.error || 'Failed to create RA Bill');
    }
  };

  const handleOpenEdit = (bill: ClientRABill) => {
    setEditModalBill(bill);
    setFormGrossWork(String(bill.grossWorkValue));
    setFormVariations(String(bill.approvedVariations));
    setFormRetention(String(bill.retentionAmount));
    setFormAdvanceRec(String(bill.advanceRecoveryAmount));
    setFormOtherDed(String(bill.otherDeductions));
    setFormTax(String(bill.taxAmount));
    setFormError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalBill) return;
    const gross = parseFloat(formGrossWork);
    if (isNaN(gross) || gross <= 0) return setFormError('Gross work value must be greater than zero');

    const res = editClientRABill(editModalBill.id, {
      grossWorkValue: gross,
      approvedVariations: parseFloat(formVariations) || 0,
      retentionAmount: parseFloat(formRetention) || 0,
      advanceRecoveryAmount: parseFloat(formAdvanceRec) || 0,
      otherDeductions: parseFloat(formOtherDed) || 0,
      taxAmount: parseFloat(formTax) || 0,
    });

    if (res.success) {
      setEditModalBill(null);
    } else {
      setFormError(res.error || 'Failed to update RA Bill');
    }
  };

  const handleOpenPayment = (bill: ClientRABill) => {
    setPaymentModalBill(bill);
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayAmount(String(bill.outstandingAmount));
    setPayMode('Bank Transfer (RTGS)');
    setPayRef('');
    setPayBank('HDFC Bank - Main Current A/C (x8892)');
    setPayRemarks('');
    setPayError('');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalBill) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return setPayError('Payment amount must be greater than zero');
    if (amount > paymentModalBill.outstandingAmount + 0.01) {
      return setPayError(`Amount exceeds outstanding balance of ${formatIndianCurrency(paymentModalBill.outstandingAmount)}`);
    }

    const res = recordClientPayment(paymentModalBill.id, {
      receiptDate: payDate,
      amountReceived: amount,
      paymentMode: payMode,
      referenceNumber: payRef,
      receivingBankAccount: payBank,
      remarks: payRemarks,
    });

    if (res.success) {
      setPaymentModalBill(null);
    } else {
      setPayError(res.error || 'Failed to record payment');
    }
  };

  const handleSaveReject = () => {
    if (!rejectModalBill) return;
    if (!rejectionReason.trim()) return;
    const res = rejectClientRABill(rejectModalBill.id, rejectionReason);
    if (res.success) {
      setRejectModalBill(null);
      setRejectionReason('');
    }
  };

  const handleSaveReopen = () => {
    if (!reopenModalBill) return;
    if (!reopenReason.trim()) return;
    const res = reopenClientRABill(reopenModalBill.id, reopenReason);
    if (res.success) {
      setReopenModalBill(null);
      setReopenReason('');
    }
  };

  const getStatusBadge = (status: ClientRABillStatus) => {
    switch (status) {
      case 'Approved':
      case 'Certified':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</span>;
      case 'Sent to Client':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><Send className="w-3 h-3 mr-1" /> Sent to Client</span>;
      case 'Pending Approval':
      case 'Awaiting Certification':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending Approval</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"><FileText className="w-3 h-3 mr-1" /> {status}</span>;
    }
  };

  const getPaymentBadge = (status: ClientRABillPaymentStatus) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</span>;
      case 'Partially Paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200"><DollarSign className="w-3 h-3 mr-1" /> Partially Paid</span>;
      case 'Overdue':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</span>;
      case 'Payment Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Not Started</span>;
    }
  };

  return (
    <ListPageLayout>
      {/* 1. Page Header */}
      <PageHeader
        title="Client RA Bills"
        subtitle="Manage running account billing linked to project milestones, track internal approvals, issue bills, and record accounts receivable payment receipts."
        breadcrumbs={[
          { label: 'Finance, Billing & Payments' },
          { label: 'Client RA Bills' }
        ]}
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center px-3.5 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white font-medium text-xs rounded-lg shadow-sm transition-all gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create RA Bill
          </button>
        }
      />

      {/* 2. KPI Cards Grid */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        <SummaryKpiCard
          title="Total Billed"
          value={formatIndianCurrency(kpis.totalBilled)}
          subtitle="Net receivable billed"
          icon={FileCheck2}
          variant="gold"
        />
        <SummaryKpiCard
          title="Outstanding Receivable"
          value={formatIndianCurrency(kpis.outstanding)}
          subtitle="Pending client collection"
          icon={TrendingUp}
          variant="pending"
        />
        <SummaryKpiCard
          title="Overdue Balance"
          value={formatIndianCurrency(kpis.overdue)}
          subtitle="Past payment due date"
          icon={AlertCircle}
          variant="pending"
        />
        <SummaryKpiCard
          title="Total Received"
          value={formatIndianCurrency(kpis.totalReceived)}
          subtitle="Cleared in bank"
          icon={DollarSign}
          variant="active"
        />
      </div>

      {/* 3. Filter Toolbar */}
      <FilterToolbar
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search RA #, client, project..."
        selectFilters={[
          {
            id: 'project-filter',
            label: 'Project',
            value: selectedProjectId,
            onChange: setSelectedProjectId,
            options: [
              { value: 'ALL', label: 'All Projects' },
              ...projects.map((p: any) => ({ value: p.id, label: p.projectName || p.name })),
            ],
          },
          {
            id: 'client-filter',
            label: 'Client',
            value: selectedClientId,
            onChange: setSelectedClientId,
            options: [
              { value: 'ALL', label: 'All Clients' },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ],
          },
          {
            id: 'bill-status-filter',
            label: 'Bill Status',
            value: selectedBillStatus,
            onChange: setSelectedBillStatus,
            options: [
              { value: 'ALL', label: 'All Bill Statuses' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Pending Approval', label: 'Pending Approval' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Sent to Client', label: 'Sent to Client' },
              { value: 'Rejected', label: 'Rejected' },
            ],
          },
          {
            id: 'payment-status-filter',
            label: 'Payment Status',
            value: selectedPaymentStatus,
            onChange: setSelectedPaymentStatus,
            options: [
              { value: 'ALL', label: 'All Payment Statuses' },
              { value: 'Not Started', label: 'Not Started' },
              { value: 'Payment Pending', label: 'Payment Pending' },
              { value: 'Partially Paid', label: 'Partially Paid' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Overdue', label: 'Overdue' },
            ],
          },
        ]}
      />

      {/* 4. Client RA Bills Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">RA Bill / Date</th>
                <th className="py-3 px-4">Client / Project</th>
                <th className="py-3 px-4">Milestone</th>
                <th className="py-3 px-4 text-right">Claimed / Net</th>
                <th className="py-3 px-4 text-right">Received / Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Bill Status</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No Client RA Bills match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-blue-600">{b.billNumber}</div>
                      <div className="text-xs text-slate-400">{b.billDate}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{b.clientName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {b.projectName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {b.milestoneName}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-slate-900">{formatIndianCurrency(b.netReceivable)}</div>
                      <div className="text-xs text-slate-400">Claim: {formatIndianCurrency(b.claimedAmount)}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-semibold text-emerald-700">{formatIndianCurrency(b.paidAmount)}</div>
                      <div className="text-xs text-amber-700 font-medium">Due: {formatIndianCurrency(b.outstandingAmount)}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {b.dueDate}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(b.billStatus)}</td>

                    <td className="py-3.5 px-4">{getPaymentBadge(b.paymentStatus)}</td>

                    <td className="py-3.5 px-4 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === b.id ? null : b.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === b.id && (
                        <div
                          className="absolute right-4 top-10 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1 text-left text-xs font-medium"
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          <button
                            onClick={() => {
                              setViewDetailsBill(b);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            View Details
                          </button>

                          {(b.billStatus === 'Draft' || b.billStatus === 'Pending Approval') && (
                            <button
                              onClick={() => {
                                handleOpenEdit(b);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-500" />
                              Edit RA Bill
                            </button>
                          )}

                          {b.billStatus === 'Draft' && (
                            <button
                              onClick={() => {
                                submitClientRABillForApproval(b.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-semibold"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Submit for Approval
                            </button>
                          )}

                          {b.billStatus === 'Pending Approval' && (
                            <>
                              <button
                                onClick={() => {
                                  approveClientRABill(b.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 font-semibold"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve RA Bill
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalBill(b);
                                  setRejectionReason('');
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject RA Bill
                              </button>
                            </>
                          )}

                          {b.billStatus === 'Approved' && (
                            <button
                              onClick={() => {
                                markClientRABillSent(b.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-semibold"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Mark as Sent to Client
                            </button>
                          )}

                          {(b.billStatus === 'Sent to Client' || b.billStatus === 'Approved') && b.outstandingAmount > 0 && (
                            <button
                              onClick={() => {
                                handleOpenPayment(b);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 font-semibold"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              Record Payment
                            </button>
                          )}

                          {b.paymentHistory && b.paymentHistory.length > 0 && (
                            <button
                              onClick={() => {
                                setPaymentHistoryBill(b);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                              Payment History ({b.paymentHistory.length})
                            </button>
                          )}

                          {b.billStatus === 'Rejected' && (
                            <button
                              onClick={() => {
                                setReopenModalBill(b);
                                setReopenReason('');
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reopen Bill
                            </button>
                          )}

                          <button
                            onClick={() => {
                              printClientRABillDocument(b);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-400" />
                            Print / Download
                          </button>

                          <button
                            onClick={() => {
                              setAuditLogBill(b);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                          >
                            <History className="w-3.5 h-3.5 text-slate-400" />
                            Activity Log
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create RA Bill */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Create New Client RA Bill
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Project *</label>
                  <select
                    value={formProjectId}
                    onChange={(e) => {
                      setFormProjectId(e.target.value);
                      setFormMilestoneId('');
                    }}
                    required
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.projectName || p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Linked Milestone *</label>
                  <select
                    value={formMilestoneId}
                    onChange={(e) => setFormMilestoneId(e.target.value)}
                    required
                    disabled={!formProjectId}
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  >
                    <option value="">-- Choose Milestone Stage --</option>
                    {availableMilestones.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.milestoneName} ({m.billingPercentage}% - {formatIndianCurrency(m.billingAmount || m.amount || 0)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bill Date *</label>
                  <input
                    type="date"
                    value={formBillDate}
                    onChange={(e) => setFormBillDate(e.target.value)}
                    required
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    required
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="font-bold text-xs text-slate-500 uppercase tracking-wider">Commercial Calculation Breakdown</div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Work Value / Claim (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 1000000"
                      value={formGrossWork}
                      onChange={(e) => handleGrossChange(e.target.value)}
                      required
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Approved Scope Variations (+ ₹)</label>
                    <input
                      type="number"
                      value={formVariations}
                      onChange={(e) => setFormVariations(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Retention (- ₹)</label>
                    <input
                      type="number"
                      value={formRetention}
                      onChange={(e) => setFormRetention(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-rose-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Rec (- ₹)</label>
                    <input
                      type="number"
                      value={formAdvanceRec}
                      onChange={(e) => setFormAdvanceRec(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-rose-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Other Deductions (- ₹)</label>
                    <input
                      type="number"
                      value={formOtherDed}
                      onChange={(e) => setFormOtherDed(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-rose-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Applicable GST 18% (+ ₹)</label>
                  <input
                    type="number"
                    value={formTax}
                    onChange={(e) => setFormTax(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-blue-900 uppercase">Calculated Net Receivable</div>
                  <div className="text-xs text-blue-700">Gross + Variations - Deductions + Tax</div>
                </div>
                <div className="text-xl font-extrabold text-blue-700">{formatIndianCurrency(calcNetReceivable())}</div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Generate RA Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit RA Bill */}
      {editModalBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Client RA Bill #{editModalBill.billNumber}
              </h3>
              <button onClick={() => setEditModalBill(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Work Value / Claim (₹) *</label>
                  <input
                    type="number"
                    value={formGrossWork}
                    onChange={(e) => handleGrossChange(e.target.value)}
                    required
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approved Scope Variations (+ ₹)</label>
                  <input
                    type="number"
                    value={formVariations}
                    onChange={(e) => setFormVariations(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retention (- ₹)</label>
                  <input
                    type="number"
                    value={formRetention}
                    onChange={(e) => setFormRetention(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-rose-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Rec (- ₹)</label>
                  <input
                    type="number"
                    value={formAdvanceRec}
                    onChange={(e) => setFormAdvanceRec(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-rose-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Other Deductions (- ₹)</label>
                  <input
                    type="number"
                    value={formOtherDed}
                    onChange={(e) => setFormOtherDed(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applicable GST 18% (+ ₹)</label>
                <input
                  type="number"
                  value={formTax}
                  onChange={(e) => setFormTax(e.target.value)}
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-blue-900 uppercase">Calculated Net Receivable</div>
                  <div className="text-xs text-blue-700">Gross + Variations - Deductions + Tax</div>
                </div>
                <div className="text-xl font-extrabold text-blue-700">{formatIndianCurrency(calcNetReceivable())}</div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalBill(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Update RA Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Client Payment */}
      {paymentModalBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Record Client Payment Receipt
              </h3>
              <button onClick={() => setPaymentModalBill(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-slate-500">RA Bill #:</span><span className="font-bold text-blue-600">{paymentModalBill.billNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Client:</span><span className="font-semibold text-slate-900">{paymentModalBill.clientName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Net Billed:</span><span className="font-semibold">{formatIndianCurrency(paymentModalBill.netReceivable)}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-1 mt-1"><span className="text-slate-700 font-bold">Outstanding Balance:</span><span className="font-bold text-amber-700">{formatIndianCurrency(paymentModalBill.outstandingAmount)}</span></div>
              </div>

              {payError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {payError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receipt Date *</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  step="any"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Mode *</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bank Transfer (RTGS)">RTGS</option>
                    <option value="Bank Transfer (NEFT)">NEFT</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reference / UTR #</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR992288"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receiving Bank Account *</label>
                <input
                  type="text"
                  value={payBank}
                  onChange={(e) => setPayBank(e.target.value)}
                  required
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentModalBill(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                >
                  Record Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Rejection Reason */}
      {rejectModalBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Client RA Bill {rejectModalBill.billNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Please provide a mandatory reason for rejecting this bill draft.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalBill(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Reopen Reason */}
      {reopenModalBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              Reopen Rejected RA Bill {reopenModalBill.billNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Provide a reason to reopen this rejected bill back to Pending Approval.
            </p>
            <textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Enter reopen reason..."
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReopenModalBill(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReopen}
                disabled={!reopenReason.trim()}
                className="px-4 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50"
              >
                Confirm Reopen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Payment History */}
      {paymentHistoryBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Payment Receipts History - {paymentHistoryBill.billNumber}
              </h3>
              <button onClick={() => setPaymentHistoryBill(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="py-2.5 px-3">Receipt #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3">Ref / UTR</th>
                    <th className="py-2.5 px-3 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paymentHistoryBill.paymentHistory?.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">{p.receiptNumber}</td>
                      <td className="py-2.5 px-3">{p.receiptDate}</td>
                      <td className="py-2.5 px-3">{p.paymentMode}</td>
                      <td className="py-2.5 px-3 font-mono">{p.referenceNumber || 'N/A'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatIndianCurrency(p.amountReceived)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setPaymentHistoryBill(null)}
                className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: View Details Modal */}
      {viewDetailsBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Client RA Bill Details - {viewDetailsBill.billNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{viewDetailsBill.clientName} | {viewDetailsBill.projectName}</p>
              </div>
              <button onClick={() => setViewDetailsBill(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-400 font-bold uppercase mb-1">Project & Milestone</div>
                  <div className="font-semibold text-slate-900">{viewDetailsBill.projectName}</div>
                  <div className="text-slate-600 font-medium mt-0.5">Stage: {viewDetailsBill.milestoneName}</div>
                  <div className="text-slate-400 mt-2">Bill Date: {viewDetailsBill.billDate}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-bold uppercase mb-1">Bill & Payment Status</div>
                  <div>{getStatusBadge(viewDetailsBill.billStatus)}</div>
                  <div className="mt-1.5">{getPaymentBadge(viewDetailsBill.paymentStatus)}</div>
                  <div className="text-slate-400 mt-2">Due Date: {viewDetailsBill.dueDate}</div>
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Financial Receivable Calculation</div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Gross Work Claimed:</span>
                  <span className="font-semibold">{formatIndianCurrency(viewDetailsBill.grossWorkValue)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Approved Variations:</span>
                  <span className="font-semibold text-emerald-700">+ {formatIndianCurrency(viewDetailsBill.approvedVariations)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Retention Deducted:</span>
                  <span className="font-semibold text-rose-700">- {formatIndianCurrency(viewDetailsBill.retentionAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Advance Recovery:</span>
                  <span className="font-semibold text-rose-700">- {formatIndianCurrency(viewDetailsBill.advanceRecoveryAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Applicable GST 18%:</span>
                  <span className="font-semibold text-emerald-700">+ {formatIndianCurrency(viewDetailsBill.taxAmount)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold border-t-2 border-slate-900 pt-2">
                  <span className="text-slate-900">Net Receivable Amount:</span>
                  <span className="text-blue-700">{formatIndianCurrency(viewDetailsBill.netReceivable)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => printClientRABillDocument(viewDetailsBill)}
                  className="px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print RA Voucher
                </button>
                <button
                  onClick={() => setViewDetailsBill(null)}
                  className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Activity Log Modal */}
      {auditLogBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Activity Log - {auditLogBill.billNumber}
              </h3>
              <button onClick={() => setAuditLogBill(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {auditLogBill.auditLog?.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>{log.action}</span>
                    <span className="text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-600">By: {log.user}</div>
                  {log.details && <div className="text-slate-500 italic">{log.details}</div>}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAuditLogBill(null)}
                className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
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

export default ClientRABillsPage;
