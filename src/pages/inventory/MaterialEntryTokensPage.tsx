import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { MaterialEntryToken, MaterialEntryTokenStatus, TokenActivity } from '../../domain/types';
import {
  Truck,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  X,
  MoreVertical,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Eye,
  PauseCircle,
  PlayCircle,
  XCircle,
  History,
  PackageCheck,
  FileCheck,
} from 'lucide-react';
import { RowActionMenu, RowActionMenuItem, RowActionMenuDivider } from '../../components/common/RowActionMenu';
import { GateTokenQRCode } from '../../components/common/GateTokenQRCode';

interface TokenActionCellProps {
  t: MaterialEntryToken;
  setShowDetailsDrawer: (t: MaterialEntryToken) => void;
  setShowActivityLogModal: (t: MaterialEntryToken) => void;
  setShowPrintModal: (t: MaterialEntryToken) => void;
  setShowHoldModal: (t: MaterialEntryToken) => void;
  setShowCancelModal: (t: MaterialEntryToken) => void;
  handleResumeToken: (t: MaterialEntryToken) => void;
  navigate: (path: string) => void;
}

const TokenActionCell: React.FC<TokenActionCellProps> = ({
  t,
  setShowDetailsDrawer,
  setShowActivityLogModal,
  setShowPrintModal,
  setShowHoldModal,
  setShowCancelModal,
  handleResumeToken,
  navigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <RowActionMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        align="right"
      >
        <RowActionMenuItem
          icon={<Eye className="w-3.5 h-3.5" />}
          label="View Token Details"
          onClick={() => {
            setIsOpen(false);
            setShowDetailsDrawer(t);
          }}
        />
        <RowActionMenuItem
          icon={<History className="w-3.5 h-3.5" />}
          label="Activity Log"
          onClick={() => {
            setIsOpen(false);
            setShowActivityLogModal(t);
          }}
        />
        <RowActionMenuItem
          icon={<Printer className="w-3.5 h-3.5" />}
          label="Print Gate Slip"
          onClick={() => {
            setIsOpen(false);
            setShowPrintModal(t);
          }}
        />

        {t.status !== 'HOLD' && t.status !== 'CANCELLED' && t.status !== 'GRN_GENERATED' && (
          <>
            <RowActionMenuDivider />
            {t.status === 'TOKEN_GENERATED' && (
              <RowActionMenuItem
                variant="warning"
                icon={<PackageCheck className="w-3.5 h-3.5" />}
                label="Start Receiving"
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/inventory/receiving-check?token=${t.tokenNumber}`);
                }}
              />
            )}
            <RowActionMenuItem
              variant="danger"
              icon={<PauseCircle className="w-3.5 h-3.5" />}
              label="Put On Hold"
              onClick={() => {
                setIsOpen(false);
                setShowHoldModal(t);
              }}
            />
            <RowActionMenuItem
              icon={<XCircle className="w-3.5 h-3.5" />}
              label="Cancel Token"
              onClick={() => {
                setIsOpen(false);
                setShowCancelModal(t);
              }}
            />
          </>
        )}

        {t.status === 'HOLD' && (
          <>
            <RowActionMenuDivider />
            <RowActionMenuItem
              variant="success"
              icon={<PlayCircle className="w-3.5 h-3.5" />}
              label="Resume Token"
              onClick={() => {
                setIsOpen(false);
                handleResumeToken(t);
              }}
            />
            <RowActionMenuItem
              icon={<XCircle className="w-3.5 h-3.5" />}
              label="Cancel Token"
              onClick={() => {
                setIsOpen(false);
                setShowCancelModal(t);
              }}
            />
          </>
        )}
      </RowActionMenu>
    </>
  );
};

import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { PrimaryActionButton } from '../../components/common/PrimaryActionButton';
import { SummaryKpiCard } from '../../components/common/SummaryKpiCard';

export const MaterialEntryTokensPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    createMaterialEntryToken,
    holdMaterialToken,
    resumeMaterialToken,
    cancelMaterialToken,
  } = useERPStore();

  const tokens = state.materialEntryTokens || [];
  const products = state.products || [];
  const categories = state.categories || [];
  const receivingChecks = state.materialReceivingChecks || [];
  const qcs = state.qualityInspections || [];
  const grns = state.goodsReceipts || [];
  const activities: TokenActivity[] = state.tokenActivities || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal & Drawer states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState<MaterialEntryToken | null>(null);
  const [showHoldModal, setShowHoldModal] = useState<MaterialEntryToken | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<MaterialEntryToken | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState<MaterialEntryToken | null>(null);
  const [showActivityLogModal, setShowActivityLogModal] = useState<MaterialEntryToken | null>(null);

  // Form inputs for Hold / Cancel
  const [holdReasonInput, setHoldReasonInput] = useState('');
  const [holdRemarksInput, setHoldRemarksInput] = useState('');
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // Gate Entry Form state
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    driverName: '',
    driverMobile: '',
    productId: '',
    materialName: '',
    categoryId: '',
    categoryName: '',
    entryDate: new Date().toISOString().split('T')[0],
    entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    remarks: '',
  });

  const handleProductSelect = (productId: string) => {
    const selectedProd = products.find((p) => p.id === productId);
    if (selectedProd) {
      const catMatch = categories.find((c) => c.id === selectedProd.categoryId);
      setFormData((prev) => ({
        ...prev,
        productId,
        materialName: selectedProd.name,
        categoryId: selectedProd.categoryId || '',
        categoryName: catMatch?.name || (selectedProd as any).category || 'General Material',
      }));
    } else {
      setFormData((prev) => ({ ...prev, productId }));
    }
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber || !formData.materialName) {
      alert('Vehicle Number and Material Name are required.');
      return;
    }

    const res = createMaterialEntryToken(formData, 'Gate Security Officer');
    if (res.success && res.token) {
      setShowCreateModal(false);
      setShowPrintModal(res.token);
      setFormData({
        vehicleNumber: '',
        driverName: '',
        driverMobile: '',
        productId: '',
        materialName: '',
        categoryId: '',
        categoryName: '',
        entryDate: new Date().toISOString().split('T')[0],
        entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        remarks: '',
      });
    }
  };

  const handleHoldToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showHoldModal || !holdReasonInput.trim()) {
      alert('Please enter a hold reason.');
      return;
    }

    const res = holdMaterialToken(showHoldModal.id, holdReasonInput, holdRemarksInput, 'Security Officer');
    if (res.success) {
      setShowHoldModal(null);
      setHoldReasonInput('');
      setHoldRemarksInput('');
    } else {
      alert(res.error || 'Failed to hold token');
    }
  };

  const handleResumeToken = (token: MaterialEntryToken) => {
    if (window.confirm(`Are you sure you want to release hold on Token ${token.tokenNumber}?`)) {
      const res = resumeMaterialToken(token.id, 'Hold released by Security Admin', 'Security Officer');
      if (!res.success) alert(res.error || 'Failed to resume token');
    }
  };

  const handleCancelToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCancelModal || !cancelReasonInput.trim()) {
      alert('Please enter a cancellation reason.');
      return;
    }

    const res = cancelMaterialToken(showCancelModal.id, cancelReasonInput, 'Security Officer');
    if (res.success) {
      setShowCancelModal(null);
      setCancelReasonInput('');
    } else {
      alert(res.error || 'Failed to cancel token');
    }
  };

  const filteredTokens = tokens.filter((t) => {
    const matchesSearch =
      t.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: MaterialEntryTokenStatus) => {
    switch (status) {
      case 'TOKEN_GENERATED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Gate Entry Created</span>;
      case 'RECEIVING_CHECKED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Receiving Checked</span>;
      case 'QC_PENDING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">QC Inspection Pending</span>;
      case 'ADMIN_APPROVAL_REQUIRED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">Admin Approval Required</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>;
      case 'GRN_GENERATED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">GRN Generated</span>;
      case 'HOLD':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">On Hold</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-300">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getStageBadge = (stage?: string) => {
    switch (stage) {
      case 'Gate Entry':
        return <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">1. Gate Entry</span>;
      case 'Initial Receiving':
        return <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">2. Receiving Check</span>;
      case 'Quality Control':
        return <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">3. Quality Control</span>;
      case 'Admin Approval':
        return <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">4. Admin Approval</span>;
      case 'GRN':
        return <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">5. GRN Generated</span>;
      case 'Hold':
        return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">Held</span>;
      case 'Cancelled':
        return <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Cancelled</span>;
      default:
        return <span className="text-xs text-gray-500">1. Gate Entry</span>;
    }
  };

  return (
    <ListPageLayout>
      {/* Header */}
      <PageHeader
        title="Material Gate Entry Tokens"
        subtitle="Generate sequence tokens upon vehicle arrival, track live stage, put tokens on hold/cancel, and audit full logs."
        breadcrumbs={[
          { label: 'Inventory & Execution' },
          { label: 'Material Gate Tokens' }
        ]}
        actions={
          <PrimaryActionButton
            label="Generate Gate Entry Token"
            onClick={() => setShowCreateModal(true)}
          />
        }
      />

      {/* KPI Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryKpiCard
          title="Total Vehicles Today"
          value={tokens.length}
          subtitle="Registered entry tokens"
          icon={Truck}
          variant="gold"
        />
        <SummaryKpiCard
          title="Active Tokens"
          value={tokens.filter((t) => t.status !== 'HOLD' && t.status !== 'CANCELLED' && t.status !== 'GRN_GENERATED').length}
          subtitle="In pipeline verification"
          icon={Clock}
          variant="blue"
        />
        <SummaryKpiCard
          title="Tokens On Hold"
          value={tokens.filter((t) => t.status === 'HOLD').length}
          subtitle="Awaiting resolution"
          icon={PauseCircle}
          variant="pending"
        />
        <SummaryKpiCard
          title="GRN Generated"
          value={tokens.filter((t) => t.status === 'GRN_GENERATED').length}
          subtitle="Completed intake"
          icon={CheckCircle}
          variant="active"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search Token #, Vehicle, Material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none bg-white"
          >
            <option value="ALL">All Token Statuses</option>
            <option value="TOKEN_GENERATED">Gate Entry Created</option>
            <option value="RECEIVING_CHECKED">Receiving Checked</option>
            <option value="QC_PENDING">QC Inspection Pending</option>
            <option value="ADMIN_APPROVAL_REQUIRED">Admin Approval Required</option>
            <option value="GRN_GENERATED">GRN Generated</option>
            <option value="HOLD">On Hold</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Token Register Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden my-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600">
              <tr>
                <th className="py-3.5 px-4">Token Number</th>
                <th className="py-3.5 px-4">Material / Category</th>
                <th className="py-3.5 px-4">Vehicle & Driver</th>
                <th className="py-3.5 px-4">Entry Date & Time</th>
                <th className="py-3.5 px-4 text-center">Current Stage</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    <Truck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    No material entry tokens found. Click "Generate Gate Entry Token" to create one.
                  </td>
                </tr>
              ) : (
                filteredTokens.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 font-mono">
                      {t.tokenNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900">{t.materialName}</div>
                      <div className="text-xs text-gray-500">{t.categoryName || 'General'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{t.vehicleNumber}</div>
                      <div className="text-xs text-gray-500">{t.driverName} {t.driverMobile && `(${t.driverMobile})`}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <div>{t.entryDate}</div>
                      <div className="text-gray-400">{t.entryTime}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStageBadge(t.currentStage)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <TokenActionCell
                        t={t}
                        setShowDetailsDrawer={setShowDetailsDrawer}
                        setShowActivityLogModal={setShowActivityLogModal}
                        setShowPrintModal={setShowPrintModal}
                        setShowHoldModal={setShowHoldModal}
                        setShowCancelModal={setShowCancelModal}
                        handleResumeToken={handleResumeToken}
                        navigate={navigate}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate Gate Entry Token */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#C5A059]" />
                Generate Material Gate Entry Token
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateToken} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Item Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => {
                    const catId = e.target.value;
                    const catObj = categories.find((c) => c.id === catId);
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: catId,
                      categoryName: catObj?.name || '',
                      productId: '',
                      materialName: '',
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none bg-white font-medium"
                >
                  <option value="">-- Select Item Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Material / Product <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={!formData.categoryId}
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none bg-white font-medium disabled:bg-gray-100"
                >
                  <option value="">
                    {formData.categoryId ? '-- Select Material / Product --' : 'Select Item Category first'}
                  </option>
                  {products
                    .filter((p) => p.categoryId === formData.categoryId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-04-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Driver Mobile</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={formData.driverMobile}
                    onChange={(e) => setFormData({ ...formData, driverMobile: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Entry Date</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Entry Time</label>
                  <input
                    type="text"
                    value={formData.entryTime}
                    onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gatekeeper Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Seals intact, vehicle weighed at gate..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d48] text-white text-sm font-medium rounded-lg shadow-sm"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Put Token On Hold */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-red-50 text-red-900">
              <h3 className="font-bold flex items-center gap-2">
                <PauseCircle className="w-5 h-5 text-red-600" /> Put Token On Hold
              </h3>
              <button onClick={() => setShowHoldModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleHoldToken} className="p-5 space-y-4">
              <div className="bg-gray-50 p-3 rounded border text-xs space-y-1">
                <div><span className="text-gray-500">Token #:</span> <span className="font-mono font-bold text-gray-900">{showHoldModal.tokenNumber}</span></div>
                <div><span className="text-gray-500">Vehicle #:</span> <span className="font-semibold text-gray-900">{showHoldModal.vehicleNumber}</span></div>
                <div><span className="text-gray-500">Material:</span> <span className="text-gray-900">{showHoldModal.materialName}</span></div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reason for Hold <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PO mismatch, missing gate pass, paper verification..."
                  value={holdReasonInput}
                  onChange={(e) => setHoldReasonInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Additional Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Details for store / security team..."
                  value={holdRemarksInput}
                  onChange={(e) => setHoldRemarksInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowHoldModal(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm"
                >
                  Confirm Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cancel Token */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-100 text-gray-900">
              <h3 className="font-bold flex items-center gap-2">
                <XCircle className="w-5 h-5 text-gray-600" /> Cancel Token
              </h3>
              <button onClick={() => setShowCancelModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCancelToken} className="p-5 space-y-4">
              <div className="bg-gray-50 p-3 rounded border text-xs space-y-1">
                <div><span className="text-gray-500">Token #:</span> <span className="font-mono font-bold text-gray-900">{showCancelModal.tokenNumber}</span></div>
                <div><span className="text-gray-500">Vehicle #:</span> <span className="font-semibold text-gray-900">{showCancelModal.vehicleNumber}</span></div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Duplicate entry, vehicle turned back..."
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg shadow-sm"
                >
                  Cancel Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer: Structured 7-Section Token Details */}
      {showDetailsDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <span className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider">Gate Token Master File</span>
                <h2 className="text-xl font-bold text-gray-900 font-mono mt-0.5">{showDetailsDrawer.tokenNumber}</h2>
              </div>
              <button onClick={() => setShowDetailsDrawer(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Section 1: Gate Token Overview */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <Truck className="w-4 h-4 text-[#C5A059]" /> 1. Gate Token Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-gray-500 block">Token Number:</span><span className="font-mono font-bold text-gray-900">{showDetailsDrawer.tokenNumber}</span></div>
                  <div><span className="text-gray-500 block">Vehicle Number:</span><span className="font-mono font-bold text-gray-900">{showDetailsDrawer.vehicleNumber}</span></div>
                  <div><span className="text-gray-500 block">Driver Name:</span><span className="font-medium text-gray-900">{showDetailsDrawer.driverName}</span></div>
                  <div><span className="text-gray-500 block">Driver Mobile:</span><span className="font-medium text-gray-900">{showDetailsDrawer.driverMobile || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Entry Date & Time:</span><span className="font-medium text-gray-900">{showDetailsDrawer.entryDate} {showDetailsDrawer.entryTime}</span></div>
                  <div><span className="text-gray-500 block">Current Stage:</span>{getStageBadge(showDetailsDrawer.currentStage)}</div>
                </div>
              </div>

              {/* Section 2: Material & Product Context */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <FileText className="w-4 h-4 text-[#C5A059]" /> 2. Material & Catalog Context
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-gray-500 block">Material Name:</span><span className="font-semibold text-gray-900">{showDetailsDrawer.materialName}</span></div>
                  <div><span className="text-gray-500 block">Category:</span><span className="font-medium text-gray-900">{showDetailsDrawer.categoryName || 'General Material'}</span></div>
                </div>
              </div>

              {/* Section 3: Initial Receiving Check Details */}
              {(() => {
                const check = receivingChecks.find((r) => r.tokenId === showDetailsDrawer.id || r.tokenNumber === showDetailsDrawer.tokenNumber);
                if (!check) return (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-xs text-gray-400 italic">
                    3. Initial Receiving Check — Pending Store Officer verification.
                  </div>
                );
                return (
                  <div className="bg-white border border-amber-200 rounded-xl p-4 space-y-3 bg-amber-50/30">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-amber-100 pb-2">
                      <PackageCheck className="w-4 h-4 text-amber-600" /> 3. Initial Receiving Check Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-gray-500 block">PO Number:</span><span className="font-mono font-bold text-gray-900">{check.poNumber}</span></div>
                      <div><span className="text-gray-500 block">Vendor:</span><span className="font-semibold text-gray-900">{check.vendorName || 'N/A'}</span></div>
                      <div><span className="text-gray-500 block">PO Qty vs Received:</span><span className="font-semibold text-gray-900">{check.poQty} / {check.receivedQty} {check.unit}</span></div>
                      <div><span className="text-gray-500 block">QC Pending Qty:</span><span className="font-bold text-purple-700">{check.qcPendingQty} {check.unit}</span></div>
                    </div>
                  </div>
                );
              })()}

              {/* Section 4: Quality Control Inspection Results */}
              {(() => {
                const qc = qcs.find((q) => q.tokenId === showDetailsDrawer.id || q.tokenNumber === showDetailsDrawer.tokenNumber);
                if (!qc) return (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-xs text-gray-400 italic">
                    4. Quality Control Inspection — Not started yet.
                  </div>
                );
                return (
                  <div className="bg-white border border-purple-200 rounded-xl p-4 space-y-3 bg-purple-50/20">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5 border-b border-purple-100 pb-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600" /> 4. QC Inspection Results ({qc.qcNumber})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-gray-500 block">QC Status:</span><span className="font-semibold text-purple-800">{qc.status}</span></div>
                      <div><span className="text-gray-500 block">Accepted Qty:</span><span className="font-bold text-emerald-700">{(qc as any).overallAcceptedQty || (qc as any).acceptedQty || 0}</span></div>
                      <div><span className="text-gray-500 block">Rejected Qty:</span><span className="font-bold text-red-700">{(qc as any).overallRejectedQty || (qc as any).rejectedQty || 0}</span></div>
                      <div><span className="text-gray-500 block">Hold Qty:</span><span className="font-bold text-amber-700">{(qc as any).overallHoldQty || (qc as any).holdQty || 0}</span></div>
                    </div>
                  </div>
                );
              })()}

              {/* Section 5: Admin Approval Decision */}
              {showDetailsDrawer.status === 'ADMIN_APPROVAL_REQUIRED' || showDetailsDrawer.holdReason ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5 border-b border-rose-200 pb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> 5. Special Disposition & Hold Info
                  </h3>
                  {showDetailsDrawer.holdReason && (
                    <div className="text-xs text-rose-900">
                      <span className="font-semibold">Hold Reason:</span> {showDetailsDrawer.holdReason} (by {showDetailsDrawer.heldBy || 'Admin'})
                    </div>
                  )}
                </div>
              ) : null}

              {/* Section 6: Generated GRN Summary */}
              {(() => {
                const grn = grns.find((g) => g.tokenId === showDetailsDrawer.id || g.tokenId === showDetailsDrawer.tokenNumber);
                if (!grn) return (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-xs text-gray-400 italic">
                    6. Goods Receipt Note (GRN) — Will generate automatically upon final QC approval.
                  </div>
                );
                return (
                  <div className="bg-white border border-emerald-200 rounded-xl p-4 space-y-3 bg-emerald-50/30">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 border-b border-emerald-100 pb-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" /> 6. Generated GRN Details ({grn.grnNumber})
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div><span className="text-gray-500 block">GRN Date:</span><span className="font-semibold text-gray-900">{grn.grnDate}</span></div>
                      <div><span className="text-gray-500 block">Accepted Stock Qty:</span><span className="font-bold text-emerald-800">{grn.acceptedQty}</span></div>
                      <div><span className="text-gray-500 block">Status:</span><span className="font-semibold text-emerald-700">{grn.status}</span></div>
                    </div>
                  </div>
                );
              })()}

              {/* Section 7: Audit Log Quick View */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <History className="w-4 h-4 text-[#C5A059]" /> 7. Token Audit Log Timeline
                </h3>
                {activities.filter((a) => a.tokenId === showDetailsDrawer.id || a.tokenNumber === showDetailsDrawer.tokenNumber).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No activity log entries recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activities
                      .filter((a) => a.tokenId === showDetailsDrawer.id || a.tokenNumber === showDetailsDrawer.tokenNumber)
                      .slice(0, 4)
                      .map((act) => (
                        <div key={act.id} className="text-xs flex items-start justify-between border-b border-gray-50 pb-1.5">
                          <div>
                            <span className="font-bold text-gray-800">{act.title}</span> — <span className="text-gray-600">{act.description}</span>
                          </div>
                          <span className="text-gray-400 whitespace-nowrap ml-2">{act.timestamp.split('T')[1]?.slice(0, 5)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetailsDrawer(null)}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Activity Log Timeline */}
      {showActivityLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#C5A059]" />
                  Token Lifecycle Audit Log
                </h3>
                <p className="text-xs text-gray-500">Token Sequence: {showActivityLogModal.tokenNumber}</p>
              </div>
              <button onClick={() => setShowActivityLogModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {activities.filter((a) => a.tokenId === showActivityLogModal.id || a.tokenNumber === showActivityLogModal.tokenNumber).length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs italic">
                  No activity events found for this token yet. Events generate automatically upon Gate Entry, Receiving Check, QC, and GRN actions.
                </div>
              ) : (
                <div className="relative border-l-2 border-amber-200 ml-3 space-y-6 pl-6 py-2">
                  {activities
                    .filter((a) => a.tokenId === showActivityLogModal.id || a.tokenNumber === showActivityLogModal.tokenNumber)
                    .map((act) => (
                      <div key={act.id} className="relative">
                        <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#C5A059] border-2 border-white shadow-sm" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">{act.title}</span>
                          <span className="text-[11px] text-gray-400 font-mono">{act.timestamp.replace('T', ' ').slice(0, 16)}</span>
                        </div>
                        <p className="text-xs text-gray-700 mt-1">{act.description}</p>
                        <div className="text-[11px] text-gray-500 mt-0.5">By: <span className="font-medium text-gray-800">{act.userName}</span></div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowActivityLogModal(null)}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Token Slip Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:p-0 print:bg-white print:static print:inset-auto">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-gate-slip, #printable-gate-slip * {
                visibility: visible !important;
              }
              #printable-gate-slip {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 16px !important;
                box-shadow: none !important;
                border: 1px solid #000 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
          <div id="printable-gate-slip" className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 text-center relative print:bg-black print:text-black">
              <button
                onClick={() => setShowPrintModal(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white no-print"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 mx-auto bg-[#C5A059] text-white rounded-full flex items-center justify-center font-bold text-xl mb-2 shadow-lg print:border print:border-black">
                FB
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-100 print:text-black">FLUTEBYTE TECHNOLOGIES ERP</h2>
              <p className="text-xs text-[#C5A059] font-semibold mt-0.5 tracking-wider print:text-black">GATE MATERIAL ENTRY SLIP</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Token Sequence + QR Code Layout */}
              <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-xl flex items-center justify-between gap-3 print:bg-white print:border-black">
                <div className="text-left">
                  <p className="text-xs text-amber-900 font-bold uppercase tracking-wider print:text-black">Material Token Sequence #</p>
                  <p className="text-xl sm:text-2xl font-black font-mono text-gray-900 mt-1 tracking-wider print:text-black">
                    {showPrintModal.tokenNumber}
                  </p>
                </div>
                <div className="shrink-0">
                  <GateTokenQRCode tokenNumber={showPrintModal.tokenNumber} size={110} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-gray-100 py-3 print:border-black">
                <div>
                  <span className="text-gray-500 block print:text-black">Vehicle Number:</span>
                  <span className="font-bold text-gray-900 font-mono text-sm print:text-black">{showPrintModal.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 block print:text-black">Driver Name:</span>
                  <span className="font-bold text-gray-900 print:text-black">{showPrintModal.driverName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block print:text-black">Entry Date & Time:</span>
                  <span className="font-medium text-gray-900 print:text-black">{showPrintModal.entryDate} {showPrintModal.entryTime}</span>
                </div>
                <div>
                  <span className="text-gray-500 block print:text-black">Current Stage:</span>
                  <span className="font-semibold text-purple-700 print:text-black">
                    {showPrintModal.status === 'TOKEN_GENERATED' ? 'Gate Entry Created' : showPrintModal.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 block print:text-black">Material Description:</span>
                <p className="font-semibold text-gray-900 text-sm mt-0.5 print:text-black">{showPrintModal.materialName}</p>
              </div>

              <div className="pt-2 text-center text-xs text-gray-500 italic print:text-black print:not-italic font-medium">
                Present this Token Number / QR Code for Initial Receiving and Quality Control Inspection.
              </div>

              <div className="flex gap-2 pt-3 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white font-medium rounded-lg text-sm hover:bg-gray-800"
                >
                  <Printer className="w-4 h-4" />
                  Print Token Slip
                </button>
                <button
                  onClick={() => setShowPrintModal(null)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ListPageLayout>
  );
};

export default MaterialEntryTokensPage;
