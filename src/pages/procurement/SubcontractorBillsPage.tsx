import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { SubcontractorBill, SubcontractWIP, SubcontractWorkOrder } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { formatIndianCurrency } from '../../utils/format';
import {
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  FileSpreadsheet,
  X,
} from 'lucide-react';

export const SubcontractorBillsPage: React.FC = () => {
  const { state, updateSubcontractorBillStatus, createSubcontractorBill } = useERPStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBill, setSelectedBill] = useState<SubcontractorBill | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const bills: SubcontractorBill[] = state.subcontractorBills || [];
  const wips: SubcontractWIP[] = (state.subcontractorWIPs || []).filter((w) => w.status === 'approved');
  const workOrders: SubcontractWorkOrder[] = state.subcontractWorkOrders || [];
  const projects = state.projects || [];

  const filteredBills = bills.filter((bill) => {
    const matchesProject = selectedProjectId === 'all' || bill.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.subcontractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesStatus && matchesSearch;
  });

  const activeScopeBills = selectedProjectId === 'all'
    ? bills
    : bills.filter((b) => b.projectId === selectedProjectId);

  const pendingApproval = activeScopeBills.filter((b) => b.status === 'verification_pending' || b.status === 'submitted').length;
  const approvedBills = activeScopeBills.filter((b) => b.status === 'approved' || b.status === 'posted_to_ap' || b.status === 'paid').length;
  const totalBilledValue = activeScopeBills.reduce((sum, b) => sum + (b.netBillAmount || b.grossAmount || 0), 0);

  // Form State for Subcontractor Bill Creation
  const [selectedWIPId, setSelectedWIPId] = useState<string>(wips[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-SUB-${Date.now().toString().slice(-4)}`);

  const targetWIP = wips.find((w) => w.id === selectedWIPId);
  const targetWO = workOrders.find((w) => w.id === targetWIP?.workOrderId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWIP) return;

    const grossAmount = targetWIP.totalApprovedValue;
    const retentionRate = targetWO?.retentionPercentage || 5;
    const taxRate = targetWO?.taxPercentage || 18;

    const retentionDeducted = (grossAmount * retentionRate) / 100;
    const taxAmount = (grossAmount * taxRate) / 100;
    const netBillAmount = grossAmount - retentionDeducted + taxAmount;

    const newBill: SubcontractorBill = {
      id: `sbill-${Date.now()}`,
      billNumber: `SBILL-${Date.now().toString().slice(-6)}`,
      invoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      workOrderId: targetWIP.workOrderId,
      woNumber: targetWIP.woNumber,
      subcontractorWIPId: targetWIP.id,
      subcontractorId: targetWIP.subcontractorId,
      subcontractorName: targetWIP.subcontractorName,
      projectId: targetWIP.projectId,
      projectName: targetWIP.projectName,
      billDate: new Date().toISOString().split('T')[0],
      grossAmount,
      retentionDeducted,
      taxAmount,
      netBillAmount,
      outstandingAmount: netBillAmount,
      status: 'verification_pending',
      createdAt: new Date().toISOString(),
      createdBy: 'Finance Specialist',
    };

    createSubcontractorBill(newBill, 'Finance Specialist');
    setCreateModalOpen(false);
  };

  const handleApproveBill = (bill: SubcontractorBill) => {
    updateSubcontractorBillStatus(bill.id, 'posted_to_ap', 'Finance Manager');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
      case 'verification_pending':
      case 'submitted':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">Pending Approval</span>;
      case 'approved':
      case 'posted_to_ap':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">Approved & Posted AP</span>;
      case 'paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">Fully Paid</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-800 border border-red-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Subcontractor RA Billing"
        subtitle="Process Running Account (RA) bills against certified WIP, compute retention & tax, and route for AP posting."
        actions={
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-950 bg-[#AB9570] hover:bg-[#927D5E] rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create RA Bill
          </button>
        }
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Bill #, Invoice #, Subcontractor or Project..."
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
              { label: 'Pending Approval', value: 'verification_pending' },
              { label: 'Approved & Posted AP', value: 'posted_to_ap' },
              { label: 'Fully Paid', value: 'paid' },
            ],
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Subcontractor Bills</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{activeScopeBills.length}</h3>
            <p className="text-xs text-gray-400 mt-1">{approvedBills} Approved | {pendingApproval} Pending</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-[#AB9570]">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Billed Net Value</p>
            <h3 className="text-xl font-bold text-emerald-700 mt-1">{formatIndianCurrency(totalBilledValue)}</h3>
            <p className="text-xs text-gray-400 mt-1">Processed RA bills</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-xl font-bold text-amber-700 mt-1">{pendingApproval}</h3>
            <p className="text-xs text-amber-600 mt-1">Requires Commercial / Finance sign-off</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">Bill # & Invoice</th>
              <th className="py-3 px-4">Work Order</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Subcontractor</th>
              <th className="py-3 px-4 text-right">Gross Amount</th>
              <th className="py-3 px-4 text-right">Retention</th>
              <th className="py-3 px-4 text-right">Net Payable</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  No Subcontractor RA Bills found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#121214]">{bill.billNumber}</span>
                      <span className="text-xs text-gray-500">Inv: {bill.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{bill.woNumber}</td>
                  <td className="py-3 px-4 text-gray-700">{bill.projectName}</td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{bill.subcontractorName}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-700">
                    {formatIndianCurrency(bill.grossAmount)}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-700 font-medium">
                    -{formatIndianCurrency(bill.retentionDeducted)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                    {formatIndianCurrency(bill.netBillAmount)}
                  </td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(bill.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          setDetailsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#121214] hover:bg-gray-100 rounded-md transition-colors"
                        title="View Bill Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {(bill.status === 'verification_pending' || bill.status === 'submitted') && (
                        <button
                          onClick={() => handleApproveBill(bill)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Approve & Post to Accounts Payable"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bill Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-[#AB9570]" /> Create Subcontractor RA Bill from Certified WIP
            </h3>

            {wips.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No certified site WIP entries available to bill. Please approve a site measurement first.</p>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Select Verified WIP Entry *</label>
                  <select
                    value={selectedWIPId}
                    onChange={(e) => setSelectedWIPId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    {wips.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.wipNumber} - {w.subcontractorName} ({formatIndianCurrency(w.totalApprovedValue)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subcontractor Invoice # *</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  />
                </div>

                {targetWIP && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certified WIP Value:</span>
                      <span className="font-semibold text-gray-900">{formatIndianCurrency(targetWIP.totalApprovedValue)}</span>
                    </div>
                    <div className="flex justify-between text-amber-700">
                      <span>Retention Deduction ({targetWO?.retentionPercentage || 5}%):</span>
                      <span>-{formatIndianCurrency((targetWIP.totalApprovedValue * (targetWO?.retentionPercentage || 5)) / 100)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST Tax ({targetWO?.taxPercentage || 18}%):</span>
                      <span>+{formatIndianCurrency((targetWIP.totalApprovedValue * (targetWO?.taxPercentage || 18)) / 100)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-gray-900">
                      <span>Net Billed Amount:</span>
                      <span className="text-emerald-700">
                        {formatIndianCurrency(
                          targetWIP.totalApprovedValue -
                            (targetWIP.totalApprovedValue * (targetWO?.retentionPercentage || 5)) / 100 +
                            (targetWIP.totalApprovedValue * (targetWO?.taxPercentage || 18)) / 100
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#121214] hover:bg-[#252528] rounded-lg"
                  >
                    Submit RA Bill
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      {detailsModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-900">{selectedBill.billNumber} Details</h3>
              <button onClick={() => setDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p><span className="text-gray-500">Invoice Number:</span> <span className="font-semibold text-gray-800">{selectedBill.invoiceNumber}</span></p>
              <p><span className="text-gray-500">Subcontractor:</span> <span className="font-semibold text-gray-800">{selectedBill.subcontractorName}</span></p>
              <p><span className="text-gray-500">Net Payable Amount:</span> <span className="font-bold text-emerald-700">{formatIndianCurrency(selectedBill.netBillAmount)}</span></p>
            </div>
            <div className="flex justify-end pt-3">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg"
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
