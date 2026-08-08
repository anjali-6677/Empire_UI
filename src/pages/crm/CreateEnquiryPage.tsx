import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calculator, Plus, Building, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Client } from '../../domain/types';
import { getClientDisplayDetails } from '../../utils/crmHelpers';
import { CreatableSelect } from '../../components/common/CreatableSelect';

export const CreateEnquiryPage: React.FC = () => {
  const { state, addItem, addProjectCategory, addPropertyType, logAudit } = useERPStore();
  const navigate = useNavigate();

  const clients = state.clients || [];
  const estimators = (state.employees || []).filter(
    (emp) => emp.departmentId === 'dept-est' || emp.roleId === 'ROLE-ESTIMATOR' || emp.roleId === 'ROLE-DIRECTOR'
  );

  const projectCategoryOptions = state.projectCategories || [
    'Commercial Fit-Out',
    'Residential Interior',
    'Hospitality Fit-Out',
    'Retail Shop',
    'Corporate Office',
    'Healthcare & Clinic',
    'Airport Lounge',
    'Custom Fit-Out',
  ];

  const propertyTypeOptions = state.propertyTypes || [
    'Commercial Office',
    'Penthouse',
    'Bungalow',
    'Showroom / Retail',
    'Restaurant / Cafe',
    'Hotel / Resort',
    'Airport Executive Lounge',
    'Hospital / Clinic',
    'Warehouse Office',
  ];

  // Form State
  const autoEnquiryNumber = `ENQ-2026-${String((state.enquiries?.length || 0) + 1).padStart(3, '0')}`;

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [projectRequirement, setProjectRequirement] = useState('');
  const [projectType, setProjectType] = useState('Commercial Fit-Out');
  const [propertyType, setPropertyType] = useState('Airport Executive Lounge');
  const [location, setLocation] = useState('');
  const [approximateArea, setApproximateArea] = useState<number | ''>(3500);
  const [areaUnit, setAreaUnit] = useState('sqft');
  const [expectedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedBudget, setExpectedBudget] = useState<number | ''>(5000000);
  const [assignedEstimatorId, setAssignedEstimatorId] = useState(estimators[0]?.id || 'emp-3');
  const [leadSource, setLeadSource] = useState('Direct Referral');
  const [requirementNotes, setRequirementNotes] = useState('');

  // Add New Client Modal state
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientDetails = getClientDisplayDetails(selectedClient);

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    const cli = clients.find((c) => c.id === id);
    if (cli && cli.city) {
      setLocation(cli.city);
    }
  };

  const handleCreateNewClient = () => {
    if (!newClientName.trim()) return;
    const newCli: Client = {
      id: `cli-${Date.now()}`,
      code: `CLI-${String(clients.length + 1).padStart(3, '0')}`,
      name: newClientName.trim(),
      companyName: newClientCompany.trim() || newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim(),
      address: newClientAddress.trim(),
      contactPerson: newClientName.trim(),
      gstin: '27AAAAA0000A1Z5',
      city: 'Mumbai',
      status: 'active',
    };
    addItem('clients', newCli);
    setSelectedClientId(newCli.id);
    if (newCli.city) setLocation(newCli.city);
    setShowAddClientModal(false);
    setNewClientName('');
    setNewClientCompany('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientAddress('');
  };

  const handleSubmitEnquiry = (action: 'draft' | 'estimate') => {
    if (!selectedClientId || !projectRequirement.trim()) {
      alert('Please select a client and enter project requirement.');
      return;
    }

    const today = new Date().toISOString();
    const estimator = estimators.find((e) => e.id === assignedEstimatorId);

    const newEnquiry: any = {
      id: `enq-${Date.now()}`,
      enquiryNumber: autoEnquiryNumber,
      enquiryDate: today.split('T')[0],
      clientId: selectedClientId,
      clientName: selectedClient?.name || 'New Client',
      projectRequirement: projectRequirement.trim(),
      projectType,
      propertyType,
      location: location.trim() || 'Mumbai',
      approximateArea: approximateArea ? Number(approximateArea) : undefined,
      areaUnit,
      expectedStartDate,
      expectedBudget: Number(expectedBudget) || 0,
      assignedEstimatorId,
      assignedEstimatorName: estimator?.name || 'Priya Nair',
      contactPerson: clientDetails.contactPerson,
      phone: clientDetails.phone,
      email: clientDetails.email,
      leadSource,
      requirementNotes: requirementNotes.trim(),
      status: action === 'estimate' ? 'estimating' : 'new',
      estimateIds: [],
      activities: [
        {
          id: `act-${Date.now()}`,
          enquiryId: `enq-${Date.now()}`,
          action: 'ENQUIRY_CREATED',
          user: 'Current Estimator',
          timestamp: today,
          comment: `Created enquiry ${autoEnquiryNumber} for ${selectedClient?.name}.`,
        },
      ],
      createdAt: today,
      createdBy: 'Current User',
      updatedAt: today,
      updatedBy: 'Current User',
    };

    addItem('enquiries', newEnquiry);

    logAudit({
      documentType: 'enquiry',
      documentId: newEnquiry.id,
      documentNumber: newEnquiry.enquiryNumber,
      action: 'CREATED',
      performedBy: 'Current User',
      newStatus: newEnquiry.status,
      details: `Created new customer enquiry ${newEnquiry.enquiryNumber} for ${newEnquiry.clientName}`,
    });

    if (action === 'estimate') {
      navigate(`/crm/estimates/builder/${newEnquiry.id}`);
    } else {
      navigate(`/crm?tab=enquiries`);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/crm?tab=enquiries')}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570]">Customer Intake</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Add New Enquiry</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmitEnquiry('draft')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
          >
            <Save className="h-4 w-4" /> Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmitEnquiry('estimate')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-md"
          >
            <Calculator className="h-4 w-4 stroke-[2.5]" /> Save & Prepare Estimate
          </button>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Section 1: Client Selection & Auto-Details Card */}
        <div className="space-y-4">
          <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building className="h-4 w-4 text-[#AB9570]" /> 1. Client Details (Sourced from Client Master)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Generated Enquiry Number</label>
              <input
                type="text"
                value={autoEnquiryNumber}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold">Client <span className="text-rose-600">*</span></label>
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(true)}
                  className="text-[11px] text-[#AB9570] hover:underline font-bold flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> Add New Client
                </button>
              </div>
              <select
                value={selectedClientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:border-[#AB9570]"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Read-Only Client Master Details Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-xs">Client Master Verified Record</h3>
              </div>
              {selectedClientId && (
                <button
                  type="button"
                  onClick={() => navigate(`/masters/clients/${selectedClientId}`)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#AB9570] hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Edit Client Details
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Client Name</span>
                <span className="font-bold text-slate-900 text-xs">{clientDetails.clientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Company Name</span>
                <span className="font-semibold text-slate-800 text-xs">{clientDetails.companyName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Primary Contact</span>
                <span className="font-semibold text-slate-800 text-xs">{clientDetails.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Phone Number</span>
                <span className="font-mono font-semibold text-slate-800 text-xs">{clientDetails.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Email Address</span>
                <span className="font-mono text-slate-800 text-xs">{clientDetails.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Billing Address</span>
                <span className="text-slate-800 text-xs">{clientDetails.billingAddress}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">GSTIN</span>
                <span className="font-mono text-slate-800 text-xs">{clientDetails.gstin}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Client Code</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{clientDetails.clientCode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Scope & Creatable Property Details */}
        <div className="space-y-4 pt-2">
          <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#AB9570]" /> 2. Project Scope & Property Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Project Requirement / Title <span className="text-rose-600">*</span></label>
              <input
                type="text"
                value={projectRequirement}
                onChange={(e) => setProjectRequirement(e.target.value)}
                placeholder="e.g. Airport Executive Lounge Fitout with Custom Joinery & HVAC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:border-[#AB9570]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Project Category</label>
              <CreatableSelect
                value={projectType}
                options={projectCategoryOptions}
                placeholder="Select or create Project Category..."
                onChange={(val) => setProjectType(val)}
                onCreate={(newCat) => addProjectCategory(newCat)}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Property Type</label>
              <CreatableSelect
                value={propertyType}
                options={propertyTypeOptions}
                placeholder="Select or create Property Type..."
                onChange={(val) => setPropertyType(val)}
                onCreate={(newType) => addPropertyType(newType)}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Site Location / Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Terminal 2, CSIA Airport, Mumbai"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-[#AB9570]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Approximate Carpet Area</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={approximateArea}
                  onChange={(e) => setApproximateArea(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="3500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:border-[#AB9570]"
                />
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="sqft">Sq Ft</option>
                  <option value="sqmt">Sq Mt</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Client Expected Budget (INR)</label>
              <input
                type="number"
                value={expectedBudget}
                onChange={(e) => setExpectedBudget(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="5000000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:border-[#AB9570]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Commercial Estimator</label>
              <select
                value={assignedEstimatorId}
                onChange={(e) => setAssignedEstimatorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:border-[#AB9570]"
              >
                {estimators.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name} ({est.designationId || 'Estimator'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lead Source</label>
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-[#AB9570]"
              >
                <option value="Direct Referral">Direct Referral</option>
                <option value="Website Enquiry">Website Enquiry</option>
                <option value="Architect Partner">Architect Partner</option>
                <option value="Exhibition">Exhibition / Event</option>
                <option value="Repeat Client">Repeat Client</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Detailed Technical Requirement Notes</label>
              <textarea
                value={requirementNotes}
                onChange={(e) => setRequirementNotes(e.target.value)}
                placeholder="Enter specific client preferences, veneer types, brand choices, acoustics, false ceiling height specifications..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-[#AB9570]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add New Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add New Client Master</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Client Name *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Airport Lounge Operations Ltd"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Company Name</label>
                <input
                  type="text"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  placeholder="e.g. Airport Services Group"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Phone Number</label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Email Address</label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="info@airportlounge.com"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Billing Address</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Terminal 2, Mumbai Airport"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewClient}
                className="px-4 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-lg shadow-sm"
              >
                Create & Select Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
