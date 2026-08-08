import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { FileSearch, Plus, Building, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

export const EnquiriesPage: React.FC = () => {
  const { state, addItem, logAudit } = useERPStore();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(5000000);
  const [targetSubmissionDate, setTargetSubmissionDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);

  const handleCreateEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientId) return;

    const client = state.clients.find((c) => c.id === clientId);
    const newEnquiry: any = {
      id: `enq-${Date.now()}`,
      documentNumber: `ENQ-2026-${String(state.enquiries.length + 1).padStart(3, '0')}`,
      clientId,
      clientName: client?.name || 'Client',
      title,
      siteLocation,
      receivedDate: new Date().toISOString().split('T')[0],
      targetSubmissionDate,
      estimatedBudget,
      status: 'new',
      assignedEstimatorId: 'emp-3',
      createdAt: new Date().toISOString(),
      createdBy: 'Priya Nair',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Priya Nair',
    };

    addItem('enquiries', newEnquiry);
    logAudit({
      documentType: 'enquiry',
      documentId: newEnquiry.id,
      documentNumber: newEnquiry.documentNumber,
      action: 'CREATED',
      performedBy: 'Priya Nair',
      newStatus: 'new',
      details: `Enquiry logged for ${newEnquiry.clientName}`,
    });

    setShowModal(false);
    setTitle('');
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">New</span>;
      case 'estimating':
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">Estimating</span>;
      case 'submitted':
      case 'quotation_ready':
        return <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">Submitted</span>;
      case 'won':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">Won</span>;
      case 'lost':
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">Lost</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold">{String(status)}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSearch className="h-6 w-6 text-brand-500" />
            CRM Lead Enquiries
          </h1>
          <p className="text-sm text-slate-600">
            Intake and track initial client fitout inquiries prior to estimate compilation and proposal submission.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          icon={<Plus className="h-4 w-4" />}
          variant="primary"
        >
          Intake New Enquiry
        </Button>
      </div>

      {/* Enquiries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.enquiries.map((rawEnq) => {
          const enq = rawEnq as any;
          return (
            <div key={enq.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-brand-400 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono font-bold text-amber-800 px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                    {enq.documentNumber || enq.enquiryNumber}
                  </span>
                  {getStatusBadge(enq.status)}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{enq.title || enq.projectRequirement}</h3>
                <p className="text-xs font-medium text-slate-600 flex items-center gap-1 mb-3">
                  <Building className="h-3.5 w-3.5 text-slate-400" /> {enq.clientName} ({enq.siteLocation || enq.location})
                </p>
                <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                  <div className="flex justify-between">
                    <span>Target Submission:</span>
                    <span className="font-medium text-slate-700">{enq.targetSubmissionDate || enq.expectedStartDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Budget:</span>
                    <span className="font-semibold text-slate-900">₹{(enq.estimatedBudget || enq.expectedBudget || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400">Assigned: {enq.assignedEstimatorName || 'Priya Nair'}</span>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => navigate(`/crm/estimates?enquiryId=${enq.id}`)}
                  icon={<ArrowRight className="h-3.5 w-3.5" />}
                  iconPosition="right"
                >
                  Create Estimate
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Enquiry */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Intake New Client Enquiry</h2>
            <form onSubmit={handleCreateEnquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client Organization *</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                >
                  <option value="">Select Client</option>
                  {state.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.companyName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enquiry Title / Scope *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Office Interior Fitout 5000 sqft"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Site Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lower Parel, Mumbai"
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Budget (₹)</label>
                  <input
                    type="number"
                    step="100000"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Submission</label>
                  <input
                    type="date"
                    value={targetSubmissionDate}
                    onChange={(e) => setTargetSubmissionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Enquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiriesPage;
