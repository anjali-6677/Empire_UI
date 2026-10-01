import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { DirectInvoice } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { SummaryKpiCard } from '../../components/common/SummaryKpiCard';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import { formatIndianCurrency } from '../../utils/format';
import { printDirectInvoiceDocument } from '../../utils/invoicePdfGenerator';
import { RecordInvoicePaymentModal } from '../../components/finance/RecordInvoicePaymentModal';
import { ViewInvoiceDetailsModal } from '../../components/finance/ViewInvoiceDetailsModal';
import { ReopenInvoiceModal } from '../../components/finance/ReopenInvoiceModal';
import { CreateCreditDebitNoteModal } from '../../components/finance/CreateCreditDebitNoteModal';
import {
  FileText,
  Plus,
  MoreVertical,
  Eye,
  CheckSquare,
  XSquare,
  CreditCard,
  Printer,
  Download,
  Clock,
  AlertCircle,
  CheckCircle2,
  Edit,
  RefreshCw,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

interface InvoiceRowActionProps {
  invoice: DirectInvoice;
  onViewDetails: (inv: DirectInvoice) => void;
  onApprove: (inv: DirectInvoice) => void;
  onReject: (inv: DirectInvoice) => void;
  onRecordPayment: (inv: DirectInvoice) => void;
  onReopen: (inv: DirectInvoice) => void;
  onCreditDebitNote: (inv: DirectInvoice) => void;
  navigate: (path: string) => void;
}

const InvoiceRowAction: React.FC<InvoiceRowActionProps> = ({
  invoice,
  onViewDetails,
  onApprove,
  onReject,
  onRecordPayment,
  onReopen,
  onCreditDebitNote,
  navigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isPending = invoice.invoiceStatus === 'Pending Approval';
  const isApproved = invoice.invoiceStatus === 'Approved';
  const isDraft = invoice.invoiceStatus === 'Draft';
  const isPaidOrReceived = invoice.outstandingAmount <= 0.01;
  const isReceivable = invoice.direction === 'Receivable';

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
        {/* Core Detail Actions */}
        <RowActionMenuItem
          icon={<Eye className="w-3.5 h-3.5" />}
          label="View Invoice"
          onClick={() => {
            setIsOpen(false);
            onViewDetails(invoice);
          }}
        />

        {(isDraft || isPending) && (
          <RowActionMenuItem
            icon={<Edit className="w-3.5 h-3.5" />}
            label="Edit Invoice"
            onClick={() => {
              setIsOpen(false);
              navigate(`/finance/invoices/${invoice.id}/edit`);
            }}
          />
        )}

        {/* Approval Actions for Pending Invoices */}
        {isPending && (
          <>
            <RowActionMenuItem
              variant="success"
              icon={<CheckSquare className="w-3.5 h-3.5 text-emerald-600" />}
              label="Approve Invoice"
              onClick={() => {
                setIsOpen(false);
                onApprove(invoice);
              }}
            />
            <RowActionMenuItem
              variant="danger"
              icon={<XSquare className="w-3.5 h-3.5 text-rose-600" />}
              label="Reject Invoice"
              onClick={() => {
                setIsOpen(false);
                onReject(invoice);
              }}
            />
          </>
        )}

        {/* Payment / Receipt Actions for Approved Invoices */}
        {isApproved && !isPaidOrReceived && (
          <RowActionMenuItem
            variant="success"
            icon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
            label={isReceivable ? 'Record Receipt' : 'Record Payment'}
            onClick={() => {
              setIsOpen(false);
              onRecordPayment(invoice);
            }}
          />
        )}

        {isApproved && (
          <>
            <RowActionMenuItem
              icon={<FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />}
              label="Issue Credit / Debit Note"
              onClick={() => {
                setIsOpen(false);
                onCreditDebitNote(invoice);
              }}
            />
            <RowActionMenuItem
              icon={<RefreshCw className="w-3.5 h-3.5 text-amber-600" />}
              label="Reopen to Draft"
              onClick={() => {
                setIsOpen(false);
                onReopen(invoice);
              }}
            />
          </>
        )}

        <RowActionMenuDivider />

        {/* Print / Download */}
        <RowActionMenuItem
          icon={<Download className="w-3.5 h-3.5" />}
          label="Download PDF"
          onClick={() => {
            setIsOpen(false);
            printDirectInvoiceDocument(invoice);
          }}
        />
        <RowActionMenuItem
          icon={<Printer className="w-3.5 h-3.5" />}
          label="Print Invoice"
          onClick={() => {
            setIsOpen(false);
            printDirectInvoiceDocument(invoice);
          }}
        />
      </RowActionMenu>
    </>
  );
};

export const InvoiceRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateItem } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>('all');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<DirectInvoice | null>(null);
  const [activeModal, setActiveModal] = useState<'details' | 'payment' | 'reopen' | 'cdn' | null>(null);

  const directInvoices: DirectInvoice[] = state.directInvoices || [];
  const projects = state.projects || [];

  const filteredInvoices = directInvoices.filter((inv) => {
    const matchesProject = selectedProjectId === 'all' || inv.projectId === selectedProjectId;
    const matchesDirection = directionFilter === 'all' || inv.direction === directionFilter;
    const matchesType = invoiceTypeFilter === 'all' || inv.invoiceType === invoiceTypeFilter;
    const matchesInvoiceStatus = invoiceStatusFilter === 'all' || inv.invoiceStatus === invoiceStatusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || inv.paymentStatus === paymentStatusFilter;
    const matchesSearch =
      searchQuery === '' ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.supplierInvoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.referenceNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesProject &&
      matchesDirection &&
      matchesType &&
      matchesInvoiceStatus &&
      matchesPaymentStatus &&
      matchesSearch
    );
  });

  const activeScopeInvoices =
    selectedProjectId === 'all'
      ? directInvoices
      : directInvoices.filter((inv) => inv.projectId === selectedProjectId);

  const totalCount = activeScopeInvoices.length;
  const draftCount = activeScopeInvoices.filter((i) => i.invoiceStatus === 'Draft').length;
  const pendingCount = activeScopeInvoices.filter((i) => i.invoiceStatus === 'Pending Approval').length;
  const approvedCount = activeScopeInvoices.filter((i) => i.invoiceStatus === 'Approved').length;
  const totalValue = activeScopeInvoices.reduce((sum, i) => sum + (i.finalInvoiceValue || 0), 0);
  const totalOutstanding = activeScopeInvoices.reduce((sum, i) => sum + (i.outstandingAmount || 0), 0);

  const handleQuickApprove = (inv: DirectInvoice) => {
    updateItem('directInvoices', inv.id, {
      invoiceStatus: 'Approved',
      approvedBy: 'Finance Manager',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleQuickReject = (inv: DirectInvoice) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason && reason.trim()) {
      updateItem('directInvoices', inv.id, {
        invoiceStatus: 'Rejected',
        rejectionReason: reason.trim(),
        rejectedBy: 'Finance Manager',
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
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
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            Draft
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Received':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            {status}
          </span>
        );
      case 'Partially Paid':
      case 'Partially Received':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            {status}
          </span>
        );
      case 'Payment Pending':
      case 'Collection Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            {status}
          </span>
        );
      case 'Not Started':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            Not Started
          </span>
        );
    }
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Invoices"
        subtitle="Create and manage direct business invoices for vendors, consultants, services and clients across project workflows."
        breadcrumbs={[
          { label: 'Finance, Billing & Payments' },
          { label: 'Invoices' }
        ]}
        actions={
          <button
            onClick={() => navigate('/finance/invoices/new')}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Invoice
          </button>
        }
      />

      {/* 6 Clean Standard KPI Cards */}
      <div className="w-full grid grid-cols-2 md:grid-cols-6 gap-3 my-4">
        <SummaryKpiCard
          title="Total Invoices"
          value={totalCount}
          subtitle="All records"
          icon={FileText}
          variant="gold"
        />
        <SummaryKpiCard
          title="Draft"
          value={draftCount}
          subtitle="In preparation"
          icon={Edit}
          variant="neutral"
        />
        <SummaryKpiCard
          title="Pending Approval"
          value={pendingCount}
          subtitle="Awaiting signoff"
          icon={Clock}
          variant="pending"
        />
        <SummaryKpiCard
          title="Approved"
          value={approvedCount}
          subtitle="Financial ready"
          icon={CheckCircle2}
          variant="active"
        />
        <SummaryKpiCard
          title="Total Value"
          value={formatIndianCurrency(totalValue)}
          subtitle="Gross invoice value"
          icon={CreditCard}
          variant="gold"
        />
        <SummaryKpiCard
          title="Outstanding Balance"
          value={formatIndianCurrency(totalOutstanding)}
          subtitle="Due for settlement"
          icon={AlertCircle}
          variant="pending"
        />
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Invoice #, Party Name, Supplier Ref #, Project..."
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
            id: 'direction-filter',
            label: 'Direction',
            value: directionFilter,
            onChange: setDirectionFilter,
            options: [
              { label: 'All Directions', value: 'all' },
              { label: 'Payable', value: 'Payable' },
              { label: 'Receivable', value: 'Receivable' },
            ],
          },
          {
            id: 'type-filter',
            label: 'Invoice Type',
            value: invoiceTypeFilter,
            onChange: setInvoiceTypeFilter,
            options: [
              { label: 'All Invoice Types', value: 'all' },
              { label: 'Vendor Invoice', value: 'Vendor Invoice' },
              { label: 'Service Invoice', value: 'Service Invoice' },
              { label: 'Consultant Invoice', value: 'Consultant Invoice' },
              { label: 'Other Expense Invoice', value: 'Other Expense Invoice' },
              { label: 'Client Invoice', value: 'Client Invoice' },
              { label: 'Other Receivable Invoice', value: 'Other Receivable Invoice' },
            ],
          },
          {
            id: 'status-filter',
            label: 'Invoice Status',
            value: invoiceStatusFilter,
            onChange: setInvoiceStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Draft', value: 'Draft' },
              { label: 'Pending Approval', value: 'Pending Approval' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Rejected', value: 'Rejected' },
            ],
          },
          {
            id: 'payment-filter',
            label: 'Payment Status',
            value: paymentStatusFilter,
            onChange: setPaymentStatusFilter,
            options: [
              { label: 'All Payment Statuses', value: 'all' },
              { label: 'Not Started', value: 'Not Started' },
              { label: 'Payment / Collection Pending', value: 'Payment Pending' },
              { label: 'Partially Paid / Received', value: 'Partially Paid' },
              { label: 'Paid / Received', value: 'Paid' },
            ],
          },
        ]}
      />

      {/* Invoice Register Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">INVOICE / DATE</th>
              <th className="py-3 px-4">TYPE</th>
              <th className="py-3 px-4">PARTY</th>
              <th className="py-3 px-4">PROJECT</th>
              <th className="py-3 px-4">REFERENCE</th>
              <th className="py-3 px-4 text-right">NET VALUE</th>
              <th className="py-3 px-4 text-right">OUTSTANDING</th>
              <th className="py-3 px-4 text-center">INVOICE STATUS</th>
              <th className="py-3 px-4 text-center">PAYMENT STATUS</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">
                  No invoice records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isReceivable = inv.direction === 'Receivable';
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* 1. INVOICE / DATE */}
                    <td className="py-3.5 px-4 font-medium text-gray-900 align-top">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 font-mono">{inv.invoiceNumber}</span>
                        {inv.supplierInvoiceNumber && (
                          <span className="text-xs text-gray-500 font-mono">Ref: {inv.supplierInvoiceNumber}</span>
                        )}
                        <span className="text-[11px] text-gray-400 mt-0.5">{inv.invoiceDate}</span>
                      </div>
                    </td>

                    {/* 2. TYPE */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            isReceivable ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isReceivable ? <ArrowDownRight className="w-3 h-3 mr-0.5 text-blue-600" /> : <ArrowUpRight className="w-3 h-3 mr-0.5 text-emerald-600" />}
                          {inv.direction}
                        </span>
                        <span className="text-xs font-medium text-gray-700">{inv.invoiceType}</span>
                      </div>
                    </td>

                    {/* 3. PARTY */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{inv.partyName}</span>
                        <span className="text-xs text-gray-500">{inv.partyType}</span>
                      </div>
                    </td>

                    {/* 4. PROJECT */}
                    <td className="py-3.5 px-4 text-xs text-gray-700 align-top">
                      <span className="font-medium text-gray-900">{inv.projectName || 'General Enterprise'}</span>
                    </td>

                    {/* 5. REFERENCE */}
                    <td className="py-3.5 px-4 text-xs text-gray-600 align-top">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{inv.referenceType}</span>
                        {inv.referenceNumber && <span className="font-mono text-gray-500">{inv.referenceNumber}</span>}
                      </div>
                    </td>

                    {/* 6. NET VALUE */}
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900 align-top">
                      {formatIndianCurrency(inv.finalInvoiceValue)}
                    </td>

                    {/* 7. OUTSTANDING */}
                    <td className="py-3.5 px-4 text-right align-top">
                      <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold ${inv.outstandingAmount > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                          {formatIndianCurrency(inv.outstandingAmount)}
                        </span>
                        {inv.paidAmount > 0 && (
                          <span className="text-[11px] text-emerald-700">
                            Settled: {formatIndianCurrency(inv.paidAmount)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 8. INVOICE STATUS */}
                    <td className="py-3.5 px-4 text-center align-top">{getInvoiceStatusBadge(inv.invoiceStatus)}</td>

                    {/* 9. PAYMENT STATUS */}
                    <td className="py-3.5 px-4 text-center align-top">{getPaymentStatusBadge(inv.paymentStatus)}</td>

                    {/* 10. ACTIONS */}
                    <td className="py-3.5 px-4 text-right align-top">
                      <InvoiceRowAction
                        invoice={inv}
                        onViewDetails={(selected) => {
                          setSelectedInvoice(selected);
                          setActiveModal('details');
                        }}
                        onApprove={handleQuickApprove}
                        onReject={handleQuickReject}
                        onRecordPayment={(selected) => {
                          setSelectedInvoice(selected);
                          setActiveModal('payment');
                        }}
                        onReopen={(selected) => {
                          setSelectedInvoice(selected);
                          setActiveModal('reopen');
                        }}
                        onCreditDebitNote={(selected) => {
                          setSelectedInvoice(selected);
                          setActiveModal('cdn');
                        }}
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

      {/* Render Active Modals */}
      {selectedInvoice && activeModal === 'details' && (
        <ViewInvoiceDetailsModal invoice={selectedInvoice} onClose={() => setActiveModal(null)} />
      )}

      {selectedInvoice && activeModal === 'payment' && (
        <RecordInvoicePaymentModal invoice={selectedInvoice} onClose={() => setActiveModal(null)} />
      )}

      {selectedInvoice && activeModal === 'reopen' && (
        <ReopenInvoiceModal invoice={selectedInvoice} onClose={() => setActiveModal(null)} />
      )}

      {selectedInvoice && activeModal === 'cdn' && (
        <CreateCreditDebitNoteModal invoice={selectedInvoice} onClose={() => setActiveModal(null)} />
      )}
    </ListPageLayout>
  );
};

export default InvoiceRegisterPage;
