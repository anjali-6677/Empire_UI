import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { VendorAP } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import { formatIndianCurrency } from '../../utils/format';
import { ApproveAPModal } from '../../components/finance/ApproveAPModal';
import { RejectAPModal } from '../../components/finance/RejectAPModal';
import { RecordVendorPaymentModal } from '../../components/finance/RecordVendorPaymentModal';
import { ViewAPDetailsModal } from '../../components/finance/ViewAPDetailsModal';
import { ViewPaymentHistoryModal } from '../../components/finance/ViewPaymentHistoryModal';
import { printVendorAPDocument } from '../../utils/apPdfGenerator';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  Eye,
  FileText,
  ShieldCheck,
  Printer,
  Download,
  History,
  CheckSquare,
  XSquare,
  Activity,
} from 'lucide-react';

interface VendorAPRowActionProps {
  ap: VendorAP;
  onApprove: (ap: VendorAP) => void;
  onReject: (ap: VendorAP) => void;
  onRecordPayment: (ap: VendorAP) => void;
  onViewDetails: (ap: VendorAP) => void;
  onViewHistory: (ap: VendorAP) => void;
  navigate: (path: string) => void;
}

const VendorAPRowAction: React.FC<VendorAPRowActionProps> = ({
  ap,
  onApprove,
  onReject,
  onRecordPayment,
  onViewDetails,
  onViewHistory,
  navigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isPending = ap.apStatus === 'Pending Approval';
  const isApproved = ap.apStatus === 'Approved';
  const isPaid = ap.paymentStatus === 'Paid' || ap.outstandingAmount <= 0.01;
  const hasPaymentHistory = (ap.paymentHistory || []).length > 0;

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
          label="View AP"
          onClick={() => {
            setIsOpen(false);
            onViewDetails(ap);
          }}
        />

        {/* Approval Actions for Pending AP */}
        {isPending && (
          <>
            <RowActionMenuItem
              variant="success"
              icon={<CheckSquare className="w-3.5 h-3.5" />}
              label="Approve AP"
              onClick={() => {
                setIsOpen(false);
                onApprove(ap);
              }}
            />
            <RowActionMenuItem
              variant="danger"
              icon={<XSquare className="w-3.5 h-3.5" />}
              label="Reject AP"
              onClick={() => {
                setIsOpen(false);
                onReject(ap);
              }}
            />
          </>
        )}

        {/* Payment Actions for Approved AP with Balance */}
        {isApproved && !isPaid && (
          <RowActionMenuItem
            variant="success"
            icon={<CreditCard className="w-3.5 h-3.5" />}
            label="Record Payment"
            onClick={() => {
              setIsOpen(false);
              onRecordPayment(ap);
            }}
          />
        )}

        {/* Payment History */}
        {(hasPaymentHistory || isPaid) && (
          <RowActionMenuItem
            icon={<History className="w-3.5 h-3.5 text-blue-600" />}
            label="Payment History"
            onClick={() => {
              setIsOpen(false);
              onViewHistory(ap);
            }}
          />
        )}

        <RowActionMenuDivider />

        {/* Cross-module View Actions */}
        <RowActionMenuItem
          icon={<FileText className="w-3.5 h-3.5" />}
          label="View GRN"
          onClick={() => {
            setIsOpen(false);
            navigate(`/inventory/grn`);
          }}
        />
        <RowActionMenuItem
          icon={<FileText className="w-3.5 h-3.5" />}
          label="View Purchase Order"
          onClick={() => {
            setIsOpen(false);
            navigate(ap.poId ? `/procurement/purchase-orders/${ap.poId}` : '/procurement/purchase-orders');
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

        <RowActionMenuDivider />

        {/* Print / Download */}
        <RowActionMenuItem
          icon={<Download className="w-3.5 h-3.5" />}
          label="Download AP"
          onClick={() => {
            setIsOpen(false);
            printVendorAPDocument(ap);
          }}
        />
        <RowActionMenuItem
          icon={<Printer className="w-3.5 h-3.5" />}
          label="Print AP"
          onClick={() => {
            setIsOpen(false);
            printVendorAPDocument(ap);
          }}
        />
        <RowActionMenuItem
          icon={<Activity className="w-3.5 h-3.5 text-gray-500" />}
          label="View Activity Log"
          onClick={() => {
            setIsOpen(false);
            onViewDetails(ap);
          }}
        />
      </RowActionMenu>
    </>
  );
};

export const AccountsPayablePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [apStatusFilter, setApStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Modals State
  const [selectedAP, setSelectedAP] = useState<VendorAP | null>(null);
  const [activeModal, setActiveModal] = useState<
    'approve' | 'reject' | 'payment' | 'details' | 'history' | null
  >(null);

  const vendorAPs: VendorAP[] = state.vendorAPs || [];
  const projects = state.projects || [];

  const filteredAPs = vendorAPs.filter((ap) => {
    const matchesProject = selectedProjectId === 'all' || ap.projectId === selectedProjectId;
    const matchesApStatus = apStatusFilter === 'all' || ap.apStatus === apStatusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || ap.paymentStatus === paymentStatusFilter;
    const matchesSearch =
      searchQuery === '' ||
      ap.apNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ap.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ap.poNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ap.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ap.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesApStatus && matchesPaymentStatus && matchesSearch;
  });

  const activeScopeAPs = selectedProjectId === 'all'
    ? vendorAPs
    : vendorAPs.filter((a) => a.projectId === selectedProjectId);

  const pendingApprovalCount = activeScopeAPs.filter((a) => a.apStatus === 'Pending Approval').length;
  const approvedCountWithBalance = activeScopeAPs.filter((a) => a.apStatus === 'Approved' && a.outstandingAmount > 0.01).length;
  const totalNetPayable = activeScopeAPs.reduce((sum, a) => sum + (a.netPayable || 0), 0);
  const totalPaid = activeScopeAPs.reduce((sum, a) => sum + (a.paidAmount || 0), 0);
  const totalOutstanding = activeScopeAPs.reduce((sum, a) => sum + (a.outstandingAmount || 0), 0);

  const getAPStatusBadge = (status: string) => {
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
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Partially Paid
          </span>
        );
      case 'Payment Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Payment Pending
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            Overdue
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
        title="Vendor AP"
        subtitle="Track vendor liabilities generated from GRNs, approve AP records and monitor payments."
      />

      {/* 4 Clean Real-Data KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">TOTAL AP LIABILITY</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{formatIndianCurrency(totalNetPayable)}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{activeScopeAPs.length} AP Records</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">PENDING APPROVAL</p>
            <h3 className="text-xl font-bold text-amber-700 mt-1">{pendingApprovalCount}</h3>
            <p className="text-xs text-amber-600 mt-0.5">Awaiting finance approval</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">OUTSTANDING PAYABLE</p>
            <h3 className="text-xl font-bold text-rose-700 mt-1">{formatIndianCurrency(totalOutstanding)}</h3>
            <p className="text-xs text-rose-600 mt-0.5">{approvedCountWithBalance} approved APs with balance</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">TOTAL PAID</p>
            <h3 className="text-xl font-bold text-emerald-700 mt-1">{formatIndianCurrency(totalPaid)}</h3>
            <p className="text-xs text-emerald-600 mt-0.5">Vendor payments recorded</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search AP #, GRN #, PO #, Vendor Name or Project..."
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
            id: 'ap-status-filter',
            label: 'AP Status',
            value: apStatusFilter,
            onChange: setApStatusFilter,
            options: [
              { label: 'All AP Statuses', value: 'all' },
              { label: 'Pending Approval', value: 'Pending Approval' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Rejected', value: 'Rejected' },
            ],
          },
          {
            id: 'payment-status-filter',
            label: 'Payment Status',
            value: paymentStatusFilter,
            onChange: setPaymentStatusFilter,
            options: [
              { label: 'All Payment Statuses', value: 'all' },
              { label: 'Not Started', value: 'Not Started' },
              { label: 'Payment Pending', value: 'Payment Pending' },
              { label: 'Partially Paid', value: 'Partially Paid' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Overdue', value: 'Overdue' },
            ],
          },
        ]}
      />

      {/* Clean 8-Column Vendor AP Register Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">AP / SOURCE</th>
              <th className="py-3 px-4">VENDOR / PROJECT</th>
              <th className="py-3 px-4">PO / INVOICE</th>
              <th className="py-3 px-4 text-right">NET PAYABLE</th>
              <th className="py-3 px-4 text-right">PAYMENT</th>
              <th className="py-3 px-4 text-center">AP STATUS</th>
              <th className="py-3 px-4 text-center">PAYMENT STATUS</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredAPs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No Vendor AP records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredAPs.map((ap) => (
                <tr key={ap.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* 1. AP / SOURCE */}
                  <td className="py-3.5 px-4 font-medium text-gray-900 align-top">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{ap.apNumber}</span>
                      <span className="text-xs text-gray-500">GRN: {ap.grnNumber}</span>
                    </div>
                  </td>

                  {/* 2. VENDOR / PROJECT */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{ap.vendorName}</span>
                      <span className="text-xs text-gray-500">{ap.projectName}</span>
                    </div>
                  </td>

                  {/* 3. PO / INVOICE */}
                  <td className="py-3.5 px-4 text-xs text-gray-700 align-top">
                    <div className="flex flex-col">
                      <span className="font-mono text-gray-900">PO: {ap.poNumber || 'N/A'}</span>
                      <span className="text-gray-500">INV: {ap.invoiceNumber || 'N/A'}</span>
                    </div>
                  </td>

                  {/* 4. NET PAYABLE */}
                  <td className="py-3.5 px-4 text-right font-bold text-gray-900 align-top">
                    {formatIndianCurrency(ap.netPayable)}
                  </td>

                  {/* 5. PAYMENT (Stacked Paid & Outstanding) */}
                  <td className="py-3.5 px-4 text-right align-top">
                    <div className="flex flex-col items-end">
                      <span className={`text-xs ${ap.paidAmount > 0 ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>
                        Paid: {formatIndianCurrency(ap.paidAmount)}
                      </span>
                      <span className={`text-xs font-semibold ${ap.outstandingAmount > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                        Due: {formatIndianCurrency(ap.outstandingAmount)}
                      </span>
                    </div>
                  </td>

                  {/* 6. AP STATUS */}
                  <td className="py-3.5 px-4 text-center align-top">{getAPStatusBadge(ap.apStatus)}</td>

                  {/* 7. PAYMENT STATUS */}
                  <td className="py-3.5 px-4 text-center align-top">{getPaymentStatusBadge(ap.paymentStatus)}</td>

                  {/* 8. ACTIONS */}
                  <td className="py-3.5 px-4 text-right align-top">
                    <VendorAPRowAction
                      ap={ap}
                      onApprove={(selected) => {
                        setSelectedAP(selected);
                        setActiveModal('approve');
                      }}
                      onReject={(selected) => {
                        setSelectedAP(selected);
                        setActiveModal('reject');
                      }}
                      onRecordPayment={(selected) => {
                        setSelectedAP(selected);
                        setActiveModal('payment');
                      }}
                      onViewDetails={(selected) => {
                        setSelectedAP(selected);
                        setActiveModal('details');
                      }}
                      onViewHistory={(selected) => {
                        setSelectedAP(selected);
                        setActiveModal('history');
                      }}
                      navigate={navigate}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Render Active Modals */}
      {selectedAP && activeModal === 'approve' && (
        <ApproveAPModal ap={selectedAP} onClose={() => setActiveModal(null)} />
      )}

      {selectedAP && activeModal === 'reject' && (
        <RejectAPModal ap={selectedAP} onClose={() => setActiveModal(null)} />
      )}

      {selectedAP && activeModal === 'payment' && (
        <RecordVendorPaymentModal ap={selectedAP} onClose={() => setActiveModal(null)} />
      )}

      {selectedAP && activeModal === 'details' && (
        <ViewAPDetailsModal ap={selectedAP} onClose={() => setActiveModal(null)} />
      )}

      {selectedAP && activeModal === 'history' && (
        <ViewPaymentHistoryModal ap={selectedAP} onClose={() => setActiveModal(null)} />
      )}
    </ListPageLayout>
  );
};

export default AccountsPayablePage;
