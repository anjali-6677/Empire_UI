import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { AccountsPayable, SubcontractorPayment } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { formatIndianCurrency } from '../../utils/format';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AccountsPayablePage: React.FC = () => {
  const { state, recordSubcontractorPayment } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [selectedAP, setSelectedAP] = useState<AccountsPayable | null>(null);

  const apRecords: AccountsPayable[] = state.accountsPayable || [];
  const projects = state.projects || [];

  const filteredAP = apRecords.filter((ap) => {
    const matchesProject = selectedProjectId === 'all' || ap.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || ap.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      ap.apNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ap.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ap.vendorInvoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ap.subcontractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ap.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  const activeScopeAP = selectedProjectId === 'all'
    ? apRecords
    : apRecords.filter((a) => a.projectId === selectedProjectId);

  const pendingCount = activeScopeAP.filter((a) => a.status === 'payment_pending' || a.status === 'partially_paid').length;
  const totalOutstanding = activeScopeAP.reduce((sum, a) => sum + (a.outstandingAmount || 0), 0);
  const totalPaid = activeScopeAP.reduce((sum, a) => sum + (a.paidAmount || 0), 0);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer / RTGS');
  const [paymentReference, setPaymentReference] = useState<string>(`UTR-${Date.now().toString().slice(-8)}`);
  const [remarks, setRemarks] = useState<string>('RA Bill Settlement');

  const handleOpenPayment = (ap: AccountsPayable) => {
    setSelectedAP(ap);
    setPaymentAmount(ap.outstandingAmount);
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAP) return;

    const newPayment: SubcontractorPayment = {
      id: `pay-${Date.now()}`,
      documentNumber: `PAY-${Date.now().toString().slice(-6)}`,
      paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
      projectId: selectedAP.projectId,
      projectName: selectedAP.projectName,
      subcontractorId: selectedAP.subcontractorId,
      subcontractorName: selectedAP.subcontractorName,
      subcontractorBillId: selectedAP.billId,
      apId: selectedAP.id,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      paymentReference,
      amountPaid: paymentAmount,
      remarks,
      status: 'processed',
      createdAt: new Date().toISOString(),
      createdBy: 'Finance Manager',
    };

    recordSubcontractorPayment(newPayment, 'Finance Manager');
    setPaymentModalOpen(false);
    setSelectedAP(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'payment_pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">Pending Payment</span>;
      case 'partially_paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">Partially Paid</span>;
      case 'paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">Fully Settled</span>;
      case 'overdue':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-800 border border-red-200">Overdue</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Accounts Payable Register & Disbursal"
        subtitle="Track subcontractor AP liabilities, execute RTGS/NEFT disbursements, and maintain bill settlement audit logs."
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search AP #, Bill #, Vendor Invoice, Subcontractor or Project..."
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
            id: 'status-filter',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Pending Payment', value: 'payment_pending' },
              { label: 'Partially Paid', value: 'partially_paid' },
              { label: 'Fully Settled', value: 'paid' },
              { label: 'Overdue', value: 'overdue' },
            ],
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Outstanding AP Liability</p>
            <h3 className="text-xl font-bold text-amber-700 mt-1">{formatIndianCurrency(totalOutstanding)}</h3>
            <p className="text-xs text-amber-600 mt-1">{pendingCount} pending bills</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid Disbursed</p>
            <h3 className="text-xl font-bold text-emerald-700 mt-1">{formatIndianCurrency(totalPaid)}</h3>
            <p className="text-xs text-gray-400 mt-1">Settled subcontractor bills</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total AP Entries</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{activeScopeAP.length}</h3>
            <p className="text-xs text-gray-400 mt-1">Across all trade vendors</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">AP # & Bill Ref</th>
              <th className="py-3 px-4">Subcontractor</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4 text-right">Net Payable</th>
              <th className="py-3 px-4 text-right">Paid Amount</th>
              <th className="py-3 px-4 text-right">Outstanding</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredAP.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No Accounts Payable records found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredAP.map((ap) => (
                <tr key={ap.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#121214]">{ap.apNumber}</span>
                      <span className="text-xs text-gray-500">{ap.billNumber} (Inv: {ap.vendorInvoiceNumber})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{ap.subcontractorName}</td>
                  <td className="py-3 px-4 text-gray-700">{ap.projectName}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatIndianCurrency(ap.netPayable)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-700">
                    {formatIndianCurrency(ap.paidAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-amber-700">
                    {formatIndianCurrency(ap.outstandingAmount)}
                  </td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(ap.status)}</td>
                  <td className="py-3 px-4 text-right">
                    {ap.outstandingAmount > 0 ? (
                      <button
                        onClick={() => handleOpenPayment(ap)}
                        className="inline-flex items-center px-3 py-1 text-xs font-semibold text-[#121214] bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1 text-[#AB9570]" /> Disburse Payment
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600 inline-flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Disbursal Modal */}
      {paymentModalOpen && selectedAP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-[#AB9570]" /> Record Subcontractor Disbursal
            </h3>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
              <p><span className="text-gray-500">Payee Subcontractor:</span> <span className="font-semibold text-gray-800">{selectedAP.subcontractorName}</span></p>
              <p><span className="text-gray-500">AP / Bill Ref:</span> <span className="font-medium text-gray-800">{selectedAP.apNumber} ({selectedAP.billNumber})</span></p>
              <p><span className="text-gray-500">Total Outstanding Balance:</span> <span className="font-bold text-amber-700">{formatIndianCurrency(selectedAP.outstandingAmount)}</span></p>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Disbursal Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedAP.outstandingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-semibold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="Bank Transfer / RTGS">Bank Transfer / RTGS</option>
                  <option value="NEFT">NEFT</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Corporate Card">Corporate Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bank Reference / UTR Number *</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#121214] hover:bg-[#252528] rounded-lg shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ListPageLayout>
  );
};

export default AccountsPayablePage;
