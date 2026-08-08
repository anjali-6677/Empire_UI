import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  X, 
  UserPlus, 
  Trash2, 
  Upload, 
  Check, 
  CheckCircle, 
  HelpCircle,
  Home,
  ChevronRight
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/format';
import { useSites } from '../context/SitesContext';

// Step Names
const STEPS = [
  'Basic Details',
  'Stakeholders',
  'Approval Setup',
  'Work & Commercial',
  'Documents',
  'Review & Build'
];

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
}

interface ApprovalRow {
  id: string;
  type: string;
  primaryApprover: string;
  backupApprover: string;
  level: 'L1' | 'L2' | 'L3';
  required: boolean;
}

interface DocumentRow {
  id: string;
  name: string;
  category: string;
  type: string;
  size: string;
}

export const CreateSite: React.FC = () => {
  const navigate = useNavigate();
  const { sites, addSite } = useSites();

  // Form Step State
  const [currentStep, setCurrentStep] = React.useState(0);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Form Fields State
  const [basicDetails, setBasicDetails] = React.useState({
    entity: 'Flutebyte Technologies Pvt Ltd',
    code: 'SITE-2026-001',
    name: '',
    category: 'Corporate Office',
    type: 'Interior Fit-out',
    client: '',
    status: 'draft',
    startDate: '',
    targetCompletion: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    area: '',
    areaUnit: 'Sq Ft',
    description: ''
  });

  // Set sequential Site Code on mount based on sites count in context
  React.useEffect(() => {
    const nextNum = sites.length + 1;
    setBasicDetails(prev => ({
      ...prev,
      code: `SITE-2026-${String(nextNum).padStart(3, '0')}`
    }));
  }, [sites.length]);

  // Stakeholders (Team Members) State
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([
    { id: '1', name: 'Rajesh Kumar', role: 'Project Manager', department: 'Operations', email: 'rajesh@flutebyte.com', phone: '9876543210' },
    { id: '2', name: 'Amit Dev', role: 'Site Engineer', department: 'Operations', email: 'amit@flutebyte.com', phone: '9876543211' }
  ]);
  const [newMember, setNewMember] = React.useState({ name: '', role: 'Site Engineer', department: 'Operations', email: '', phone: '' });
  const [showAddMemberRow, setShowAddMemberRow] = React.useState(false);

  // Approval Setup State (6 required types)
  const [approvals, setApprovals] = React.useState<ApprovalRow[]>([
    { id: 'indent', type: 'Indent Approver', primaryApprover: 'Sanjay Mehta', backupApprover: 'Karan Malhotra', level: 'L1', required: true },
    { id: 'po', type: 'Purchase Order Approver', primaryApprover: 'Sanjay Mehta', backupApprover: 'Priya Sharma', level: 'L2', required: true },
    { id: 'wo', type: 'Work Order Approver', primaryApprover: 'Amit Dev', backupApprover: 'Karan Malhotra', level: 'L1', required: true },
    { id: 'invoice', type: 'Invoice Approver', primaryApprover: 'Rohan Deshmukh', backupApprover: 'Priya Sharma', level: 'L2', required: true },
    { id: 'payment', type: 'Payment Approver', primaryApprover: 'Rohan Deshmukh', backupApprover: 'Karan Malhotra', level: 'L3', required: false },
    { id: 'budget', type: 'Budget Approver', primaryApprover: 'Sanjay Mehta', backupApprover: 'Priya Sharma', level: 'L3', required: true }
  ]);

  // Work & Commercial State
  const [commercials, setCommercials] = React.useState({
    scopeOfWork: '',
    tenderRef: '',
    contractRef: '',
    poRef: '',
    estimatedBudget: '',
    approvedBudget: '',
    retentionPercentage: '5',
    taxApplicable: 'GST 18%',
    billingCycle: 'Monthly Milestone',
    paymentTerms: '30 Days Net',
    defectLiabilityPeriod: '12 Months',
    costCentre: 'CC-BLR-01',
    notes: ''
  });

  // Documents State
  const [documents, setDocuments] = React.useState<DocumentRow[]>([
    { id: 'doc-1', name: 'Layout_Plan_Final_v2.pdf', category: 'Drawings', type: 'PDF', size: '4.8 MB' },
    { id: 'doc-2', name: 'BOQ_Nexus_Realty.xlsx', category: 'BOQ', type: 'XLSX', size: '1.2 MB' }
  ]);
  const [uploadCategory, setUploadCategory] = React.useState('Drawings');

  // Input Handlers
  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBasicDetails({ ...basicDetails, [e.target.name]: e.target.value });
  };

  const handleCommercialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCommercials({ ...commercials, [e.target.name]: e.target.value });
  };

  // Add stakeholder PM
  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      setToastMessage('Stakeholder Name & Email are required!');
      return;
    }
    const id = Date.now().toString();
    setTeamMembers([...teamMembers, { ...newMember, id }]);
    setNewMember({ name: '', role: 'Site Engineer', department: 'Operations', email: '', phone: '' });
    setShowAddMemberRow(false);
    setToastMessage('Team member added to stakeholder list');
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    setToastMessage('Team member removed');
  };

  // Approval Row Handlers
  const handleApprovalChange = (id: string, field: keyof ApprovalRow, value: any) => {
    setApprovals(approvals.map(appr => appr.id === id ? { ...appr, [field]: value } : appr));
  };

  const handleDocumentRemove = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    setToastMessage('Document reference removed');
  };

  // File Upload Simulator
  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const id = 'doc-' + Date.now();
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      const sizeStr = (file.size / 1024 / 1024).toFixed(1) + ' MB';
      setDocuments([...documents, { 
        id, 
        name: file.name, 
        category: uploadCategory, 
        type: ext, 
        size: sizeStr 
      }]);
      setToastMessage('File added (Mock Upload only)');
    }
  };

  const handleSubmitMock = (workflowStatus: 'draft' | 'tender') => {
    const pmMember = teamMembers.find(m => m.role.toLowerCase().includes('manager') || m.role.toLowerCase() === 'pm') || teamMembers[0];
    const managerName = pmMember ? pmMember.name : 'Unassigned';
    const budgetNum = commercials.estimatedBudget ? Number(commercials.estimatedBudget) : 0;
    
    const nowStr = new Date().toISOString().split('T')[0];

    // Construct the new site item
    const newSite = {
      id: `site-${Date.now()}`,
      code: basicDetails.code,
      name: basicDetails.name || 'Untitled Site',
      client: basicDetails.client || 'Internal Project',
      city: basicDetails.city || 'Other',
      manager: managerName,
      startDate: basicDetails.startDate || nowStr,
      targetCompletion: basicDetails.targetCompletion || new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
      budget: budgetNum,
      progress: 0,
      workflowStatus: workflowStatus,
      executionStatus: 'not_started' as const,
      category: basicDetails.category || 'Corporate Office',
      company: basicDetails.entity,
      projectHead: managerName,
      address: basicDetails.address,
      projectArea: basicDetails.area ? Number(basicDetails.area) : undefined,
      projectAreaUnit: basicDetails.areaUnit,
      processStartDate: nowStr,
      submissionDate: workflowStatus === 'tender' ? nowStr : undefined
    };
    
    addSite(newSite);
    setShowSuccessModal(true);
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16 select-none relative">
      
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 border rounded shadow-md bg-brand-50 border-brand-200 text-brand-850 font-bold transition-all text-xs">
          {toastMessage}
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[1px]">
          <div className="bg-white border border-gray-200 p-8 rounded-lg max-w-sm w-full text-center shadow-lg font-sans">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-150">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-950 mb-2">Project Site Provisioned</h3>
            <p className="text-[11px] text-gray-500 max-w-xs leading-relaxed mb-6 font-medium">
              The project site <span className="font-semibold text-gray-800">{basicDetails.name || 'New Site'}</span> was provisioned successfully in the prototype router state.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/sites');
              }}
              className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded transition-colors focus:outline-none cursor-pointer"
            >
              Return to Project Sites List
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded focus:outline-none">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <Link to="/sites" className="hover:text-brand-600 transition-colors">Sites</Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650 cursor-pointer">Create Site</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-150 pb-4">
        <div className="space-y-0.5">
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight leading-tight">Create Site</h1>
          <p className="text-[10.5px] text-gray-400 font-medium leading-normal">
            Set up project details, stakeholders, approvals, commercial information and documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmitMock('draft')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-[10.5px] font-bold rounded shadow-sm border border-gray-250 bg-white hover:bg-gray-50 text-gray-700 transition-all focus:outline-none cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </button>
          <button
            onClick={() => navigate('/sites')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-[10.5px] font-bold rounded shadow-sm border border-gray-250 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-gray-650 transition-all focus:outline-none cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      </div>

      {/* stepper nav */}
      <div className="bg-white border border-gray-150 rounded-lg p-3 shadow-sm overflow-x-auto flex items-center justify-between gap-2 scrollbar-none select-none">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === idx;
          const isCompleted = currentStep > idx;
          return (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider shrink-0 focus:outline-none text-left py-1"
            >
              <span className={`h-5 w-5 rounded-full flex items-center justify-center border font-bold text-[9px] ${
                isActive 
                  ? 'bg-brand-500 border-brand-500 text-white' 
                  : isCompleted 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                {isCompleted ? <Check className="h-3 w-3 stroke-[2.5]" /> : idx + 1}
              </span>
              <span className={isActive ? 'text-gray-900 border-b border-brand-500 pb-0.5' : 'text-gray-450'}>
                {step}
              </span>
              {idx < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Main Working Panel */}
      <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm min-h-[360px] font-sans">
        
        {/* Step 1: Basic Details */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-700 border-b border-gray-100 pb-1.5 mb-2">1. Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Company Entity *</label>
                <select name="entity" value={basicDetails.entity} onChange={handleBasicChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none">
                  <option value="Flutebyte Technologies Pvt Ltd">Flutebyte Technologies Pvt Ltd</option>
                  <option value="Flutebyte Construction Ltd">Flutebyte Construction Ltd</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Site Code</label>
                <input type="text" name="code" value={basicDetails.code} disabled className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-450 cursor-not-allowed font-mono" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Site Name *</label>
                <input type="text" name="name" value={basicDetails.name} onChange={handleBasicChange} placeholder="e.g. Nexus Tech Park Suite C" className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Project Category</label>
                <input type="text" name="category" value={basicDetails.category} onChange={handleBasicChange} placeholder="e.g. Corporate Office" className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Project Type</label>
                <input type="text" name="type" value={basicDetails.type} onChange={handleBasicChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Client Name *</label>
                <input type="text" name="client" value={basicDetails.client} onChange={handleBasicChange} placeholder="e.g. Nexus Realty Group" className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-855 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Project Status</label>
                <select name="status" value={basicDetails.status} onChange={handleBasicChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Start Date</label>
                  <input type="date" name="startDate" value={basicDetails.startDate} onChange={handleBasicChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Target Completion</label>
                  <input type="date" name="targetCompletion" value={basicDetails.targetCompletion} onChange={handleBasicChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Site Address *</label>
                <input type="text" name="address" value={basicDetails.address} onChange={handleBasicChange} placeholder="Site building address" className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">City *</label>
                  <input type="text" name="city" value={basicDetails.city} onChange={handleBasicChange} placeholder="e.g. Bengaluru" className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">State *</label>
                  <input type="text" name="state" value={basicDetails.state} onChange={handleBasicChange} placeholder="e.g. Karnataka" className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">PIN Code *</label>
                  <input type="text" name="pinCode" value={basicDetails.pinCode} onChange={handleBasicChange} placeholder="600001" className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Site Area</label>
                  <input type="number" name="area" value={basicDetails.area} onChange={handleBasicChange} placeholder="e.g. 5000" className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Area Unit</label>
                  <select name="areaUnit" value={basicDetails.areaUnit} onChange={handleBasicChange} className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none">
                    <option value="Sq Ft">Sq Ft</option>
                    <option value="Sq Mtr">Sq Mtr</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Short Description</label>
              <textarea name="description" value={basicDetails.description} onChange={handleBasicChange} rows={3} placeholder="Provide summary of project layout, deliverables, or site instructions..." className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none resize-none" />
            </div>
          </div>
        )}

        {/* Step 2: Stakeholders */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-700">2. Stakeholder Directory</h3>
              <button
                onClick={() => setShowAddMemberRow(!showAddMemberRow)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-brand-300 rounded text-brand-700 bg-brand-50/50 hover:bg-brand-50 font-bold transition-all"
              >
                <UserPlus className="h-3.5 w-3.5" />
                {showAddMemberRow ? 'Hide Input Panel' : 'Add Team Member'}
              </button>
            </div>

            {/* Inline Add Panel */}
            {showAddMemberRow && (
              <div className="bg-gray-50 border border-gray-150 rounded p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[9.5px] font-extrabold text-gray-500 uppercase mb-1">Full Name</label>
                  <input type="text" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} placeholder="e.g. Priya Sharma" className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold text-gray-500 uppercase mb-1">Role</label>
                  <input type="text" value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} placeholder="e.g. PMC Consultant" className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold text-gray-500 uppercase mb-1">Department</label>
                  <input type="text" value={newMember.department} onChange={(e) => setNewMember({...newMember, department: e.target.value})} placeholder="e.g. Administration" className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9.5px] font-extrabold text-gray-500 uppercase mb-1">Email</label>
                  <input type="email" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} placeholder="priya@site.com" className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs focus:outline-none" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-[9.5px] font-extrabold text-gray-500 uppercase mb-1">Phone</label>
                    <input type="text" value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})} placeholder="9988776655" className="w-full bg-white border border-gray-250 rounded px-2 py-1.5 text-xs focus:outline-none" />
                  </div>
                  <button
                    onClick={handleAddMember}
                    className="p-2 border border-brand-400 bg-brand-500 text-white rounded hover:bg-brand-655 focus:outline-none font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Team Directory Table */}
            <div className="border border-gray-150 rounded overflow-hidden mt-3 max-w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-450 uppercase tracking-widest text-[9.5px] font-extrabold">
                    <th className="p-2.5 pl-3">Stakeholder Name</th>
                    <th className="p-2.5">Designated Role</th>
                    <th className="p-2.5">Department</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5 pr-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-medium">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/50">
                      <td className="p-2.5 pl-3 font-bold text-gray-900">{member.name}</td>
                      <td className="p-2.5 text-gray-700">{member.role}</td>
                      <td className="p-2.5 text-gray-500">{member.department}</td>
                      <td className="p-2.5 font-mono text-gray-600">{member.email}</td>
                      <td className="p-2.5 font-mono text-gray-600">{member.phone || '-'}</td>
                      <td className="p-2.5 pr-3 text-center">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors focus:outline-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 3: Approval Setup */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-700 border-b border-gray-100 pb-1.5">3. Sign-Off Approval Workflows</h3>
            <p className="text-[10px] text-gray-400 font-semibold mb-2">Determine target routing PM approvals and fallback sign-off limits per request level.</p>

            <div className="border border-gray-150 rounded overflow-hidden max-w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[550px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-450 uppercase tracking-widest text-[9.5px] font-extrabold">
                    <th className="p-2.5 pl-3">Approval Category / Type</th>
                    <th className="p-2.5">Primary Approver</th>
                    <th className="p-2.5">Backup / Alternate</th>
                    <th className="p-2.5">Required Level</th>
                    <th className="p-2.5 pr-3 text-center">Workflow Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-medium">
                  {approvals.map((appr) => (
                    <tr key={appr.id} className="hover:bg-gray-50/50">
                      <td className="p-2.5 pl-3 font-semibold text-gray-850">{appr.type}</td>
                      
                      <td className="p-2">
                        <input
                          type="text"
                          value={appr.primaryApprover}
                          onChange={(e) => handleApprovalChange(appr.id, 'primaryApprover', e.target.value)}
                          className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 w-full focus:outline-none focus:border-brand-500"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          value={appr.backupApprover}
                          onChange={(e) => handleApprovalChange(appr.id, 'backupApprover', e.target.value)}
                          className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 w-full focus:outline-none focus:border-brand-500"
                        />
                      </td>

                      <td className="p-2">
                        <select
                          value={appr.level}
                          onChange={(e) => handleApprovalChange(appr.id, 'level', e.target.value)}
                          className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 focus:outline-none focus:border-brand-500"
                        >
                          <option value="L1">L1 Approval</option>
                          <option value="L2">L2 Approval</option>
                          <option value="L3">L3 Approval</option>
                        </select>
                      </td>

                      <td className="p-2.5 pr-3 text-center">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={appr.required}
                            onChange={(e) => handleApprovalChange(appr.id, 'required', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-3 after:width-3 after:transition-all peer-checked:bg-brand-500"></div>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Commercials */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-700 border-b border-gray-100 pb-1.5 mb-2">4. Commercial Terms & Budgets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Scope of Work *</label>
                <input type="text" name="scopeOfWork" value={commercials.scopeOfWork} onChange={handleCommercialChange} placeholder="e.g. Interior Civil & Carpentry" className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Tender Reference ID</label>
                <input type="text" name="tenderRef" value={commercials.tenderRef} onChange={handleCommercialChange} placeholder="TND-2026-NEX" className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Contract / Agreement ID</label>
                <input type="text" name="contractRef" value={commercials.contractRef} onChange={handleCommercialChange} placeholder="AGR-2026-0043" className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Client Purchase Order reference</label>
                <input type="text" name="poRef" value={commercials.poRef} onChange={handleCommercialChange} placeholder="PO-NEXUS-LOBBY" className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-extrabold text-gray-550 uppercase">Estimated Budget (Raw Value) *</label>
                  {commercials.estimatedBudget && (
                    <span className="text-[10px] font-bold text-brand-650 bg-brand-50 px-1.5 py-0.25 rounded border border-brand-100">
                      Format: {formatIndianCurrency(Number(commercials.estimatedBudget))}
                    </span>
                  )}
                </div>
                <input 
                  type="number" 
                  name="estimatedBudget" 
                  value={commercials.estimatedBudget} 
                  onChange={handleCommercialChange} 
                  placeholder="e.g. 50000000" 
                  className="w-full bg-white border border-gray-255 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-extrabold text-gray-550 uppercase">Approved Budget Limit (Raw Value) *</label>
                  {commercials.approvedBudget && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.25 rounded border border-emerald-100">
                      Format: {formatIndianCurrency(Number(commercials.approvedBudget))}
                    </span>
                  )}
                </div>
                <input 
                  type="number" 
                  name="approvedBudget" 
                  value={commercials.approvedBudget} 
                  onChange={handleCommercialChange} 
                  placeholder="e.g. 48000000" 
                  className="w-full bg-white border border-gray-255 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Retention Percentage (%)</label>
                <input type="number" name="retentionPercentage" value={commercials.retentionPercentage} onChange={handleCommercialChange} placeholder="e.g. 5" className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Tax Code Applicable</label>
                <select name="taxApplicable" value={commercials.taxApplicable} onChange={handleCommercialChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none">
                  <option value="GST 18%">GST 18% Integrated</option>
                  <option value="GST 12%">GST 12% Consolidated</option>
                  <option value="GST Exempt">GST Exempt</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Billing Cycle</label>
                <select name="billingCycle" value={commercials.billingCycle} onChange={handleCommercialChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none">
                  <option value="Monthly Milestone">Monthly Milestone Bills</option>
                  <option value="Bi-Weekly Progress">Bi-Weekly Progress Reports</option>
                  <option value="Stage Handover">Stage Handover Payments</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Payment Credit Terms</label>
                <input type="text" name="paymentTerms" value={commercials.paymentTerms} onChange={handleCommercialChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Defect Liability Period</label>
                <input type="text" name="defectLiabilityPeriod" value={commercials.defectLiabilityPeriod} onChange={handleCommercialChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Internal Cost Centre Code</label>
                <input type="text" name="costCentre" value={commercials.costCentre} onChange={handleCommercialChange} className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none font-mono" />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-[10px] font-extrabold text-gray-550 uppercase mb-1">Commercial Notes / Terms Remarks</label>
              <textarea name="notes" value={commercials.notes} onChange={handleCommercialChange} rows={3} placeholder="Document any custom billing escalations or site allowance limits..." className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs text-gray-850 focus:border-brand-500 focus:outline-none resize-none" />
            </div>
          </div>
        )}

        {/* Step 5: Documents */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-700 border-b border-gray-100 pb-1.5">5. Attachment Checklist References</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Drag drop zone helper */}
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded p-5 flex flex-col items-center justify-center text-center">
                <Upload className="h-9 w-9 text-gray-400 stroke-[1.5] mb-2.5 animate-pulse" />
                <span className="font-bold text-[10.5px] text-gray-900 block mb-1">Drag files here to upload</span>
                <span className="text-[9.5px] text-gray-405 block mb-4">Formats: PDF, DWG, XLSX, PNG up to 10MB</span>
                
                <div className="w-full max-w-[170px] space-y-2">
                  <select 
                    value={uploadCategory} 
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded px-2 py-1 text-xs text-gray-800 focus:outline-none"
                  >
                    <option value="Drawings">Drawings / Maps</option>
                    <option value="Tender Documents">Tender Documents</option>
                    <option value="Contract Documents">Contract Documents</option>
                    <option value="BOQ">BOQ Sheets</option>
                    <option value="Client Purchase Order">Client Purchase Order</option>
                    <option value="Site Photographs">Photographs</option>
                    <option value="Other Documents">Other Documents</option>
                  </select>

                  <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-gray-700 border border-gray-350 rounded hover:bg-gray-50 shadow-sm cursor-pointer select-none transition-colors">
                    Browse File Input
                    <input 
                      type="file" 
                      onChange={handleFileUploadMock}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded files catalog */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-650">Uploaded Site Documents ({documents.length})</span>
                  <span className="text-[9px] font-bold text-gray-450 uppercase bg-gray-50 border px-1.5 py-0.25 rounded shrink-0">Stage 2 Sandbox</span>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-gray-200 rounded min-h-[140px] flex flex-col items-center justify-center bg-gray-50/20">
                    <HelpCircle className="h-6 w-6 text-gray-350 stroke-[1.5] mb-2" />
                    <span className="font-semibold text-gray-500">No mock documents uploaded yet</span>
                  </div>
                ) : (
                  <div className="border border-gray-150 rounded overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs min-w-[400px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-450 uppercase tracking-widest text-[9.5px] font-extrabold">
                          <th className="p-2.5 pl-3">File Name</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5 text-center">Type</th>
                          <th className="p-2.5 text-right">Size</th>
                          <th className="p-2.5 pr-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 font-medium">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50/50">
                            <td className="p-2.5 pl-3 font-semibold text-gray-850 truncate max-w-[150px]">{doc.name}</td>
                            <td className="p-2.5 text-gray-500 font-bold">{doc.category}</td>
                            <td className="p-2.5 text-center text-gray-600 font-bold">{doc.type}</td>
                            <td className="p-2.5 text-right font-mono text-gray-600">{doc.size}</td>
                            <td className="p-2.5 pr-3 text-center">
                              <button
                                onClick={() => handleDocumentRemove(doc.id)}
                                className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors focus:outline-none"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review Summary */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-700 border-b border-gray-100 pb-1.5">6. Review Project Site Provision Specifications</h3>
            
            <div className="space-y-4">
              
              {/* Section 1: Basic details summary */}
              <div className="border border-gray-150 rounded p-4 font-sans bg-gray-50/20">
                <div className="flex items-center justify-between border-b pb-1.5 mb-2.5 border-gray-100">
                  <h4 className="font-bold text-[10.5px] uppercase tracking-wide text-gray-800">Basic Details</h4>
                  <button onClick={() => setCurrentStep(0)} className="text-[10px] font-bold text-brand-600 hover:underline">Edit Section</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-medium">
                  <div><span className="text-gray-400 block text-[9.5px]">Entity:</span> {basicDetails.entity}</div>
                  <div><span className="text-gray-400 block text-[9.5px]">Site Code:</span> {basicDetails.code}</div>
                  <div><span className="text-gray-400 block text-[9.5px]">Site Name:</span> {basicDetails.name || <span className="text-red-550 italic font-bold">Unassigned *</span>}</div>
                  <div><span className="text-gray-400 block text-[9.5px]">Category / Type:</span> {basicDetails.category} ({basicDetails.type})</div>
                  <div><span className="text-gray-450 block text-[9.5px]">Client:</span> {basicDetails.client || <span className="text-red-555 italic font-bold">Unassigned *</span>}</div>
                  <div><span className="text-gray-450 block text-[9.5px]">Dates:</span> {basicDetails.startDate || '--'} to {basicDetails.targetCompletion || '--'}</div>
                  <div><span className="text-gray-450 block text-[9.5px]">Status:</span> <span className="uppercase text-[9px] font-bold text-brand-700">{basicDetails.status}</span></div>
                  <div><span className="text-gray-450 block text-[9.5px]">Location:</span> {basicDetails.address}, {basicDetails.city}, {basicDetails.pinCode}</div>
                </div>
              </div>

              {/* Section 2: Stakeholders Summary */}
              <div className="border border-gray-150 rounded p-4 font-sans bg-gray-50/20">
                <div className="flex items-center justify-between border-b pb-1.5 mb-2.5 border-gray-100">
                  <h4 className="font-bold text-[10.5px] uppercase tracking-wide text-gray-800">Stakeholder Team Members ({teamMembers.length})</h4>
                  <button onClick={() => setCurrentStep(1)} className="text-[10px] font-bold text-brand-600 hover:underline">Edit Section</button>
                </div>
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-left border-collapse text-[10.5px] min-w-[350px]">
                    <thead>
                      <tr className="border-b text-gray-400 font-bold uppercase text-[9px]">
                        <th className="pb-1">Name</th>
                        <th className="pb-1">Role</th>
                        <th className="pb-1">Department</th>
                        <th className="pb-1">Contact Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {teamMembers.map(m => (
                        <tr key={m.id}>
                          <td className="py-1.5 font-bold text-gray-850">{m.name}</td>
                          <td className="py-1.5 text-gray-700">{m.role}</td>
                          <td className="py-1.5 text-gray-500">{m.department}</td>
                          <td className="py-1.5 font-mono text-gray-600">{m.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Approver Setup Summary */}
              <div className="border border-gray-150 rounded p-4 font-sans bg-gray-50/20">
                <div className="flex items-center justify-between border-b pb-1.5 mb-2.5 border-gray-100">
                  <h4 className="font-bold text-[10.5px] uppercase tracking-wide text-gray-800">Approval Setup Toggles</h4>
                  <button onClick={() => setCurrentStep(2)} className="text-[10px] font-bold text-brand-600 hover:underline">Edit Section</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-semibold text-xs leading-normal">
                  {approvals.map(appr => (
                    <div key={appr.id} className="p-2 border border-gray-100 rounded bg-white">
                      <span className="text-[9.5px] block uppercase text-gray-400">{appr.type}</span>
                      <span className="block text-gray-800 font-bold">{appr.primaryApprover} <span className="text-[10px] text-gray-400 font-normal">(Alt: {appr.backupApprover})</span></span>
                      <span className="text-[10px] inline-flex items-center gap-1.5 mt-0.5">
                        <span className="bg-gray-100 text-gray-600 rounded px-1 text-[8.5px] uppercase tracking-wider font-extrabold">{appr.level}</span>
                        <span className={appr.required ? 'text-brand-600 font-bold' : 'text-gray-400 font-medium'}>
                          {appr.required ? '• Required' : '• Optional'}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Work & Commercial Details Summary */}
              <div className="border border-gray-150 rounded p-4 font-sans bg-gray-50/20">
                <div className="flex items-center justify-between border-b pb-1.5 mb-2.5 border-gray-100">
                  <h4 className="font-bold text-[10.5px] uppercase tracking-wide text-gray-800">Commercial & Financials</h4>
                  <button onClick={() => setCurrentStep(3)} className="text-[10px] font-bold text-brand-600 hover:underline">Edit Section</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-medium">
                  <div><span className="text-gray-400 block text-[9.5px]">Scope of Work:</span> {commercials.scopeOfWork || '--'}</div>
                  <div><span className="text-gray-400 block text-[9.5px]">Estimated Budget:</span> <span className="font-extrabold text-gray-900">{commercials.estimatedBudget ? formatIndianCurrency(Number(commercials.estimatedBudget)) : '--'}</span></div>
                  <div><span className="text-gray-400 block text-[9.5px]">Approved Budget:</span> <span className="font-extrabold text-emerald-800">{commercials.approvedBudget ? formatIndianCurrency(Number(commercials.approvedBudget)) : '--'}</span></div>
                  <div><span className="text-gray-400 block text-[9.5px]">Tax applicable:</span> {commercials.taxApplicable}</div>
                  <div><span className="text-gray-450 block text-[9.5px]">Billing cycle:</span> {commercials.billingCycle}</div>
                  <div><span className="text-gray-450 block text-[9.5px]">Credit terms:</span> {commercials.paymentTerms}</div>
                  <div><span className="text-gray-450 block text-[9.5px]">Internal centre:</span> <span className="font-mono text-[10px] text-gray-800 font-bold">{commercials.costCentre}</span></div>
                </div>
              </div>

              {/* Section 5: Documents list summary */}
              <div className="border border-gray-150 rounded p-4 font-sans bg-gray-50/20">
                <div className="flex items-center justify-between border-b pb-1.5 mb-2.5 border-gray-100">
                  <h4 className="font-bold text-[10.5px] uppercase tracking-wide text-gray-800">Document References ({documents.length})</h4>
                  <button onClick={() => setCurrentStep(4)} className="text-[10px] font-bold text-brand-600 hover:underline">Edit Section</button>
                </div>
                {documents.length === 0 ? (
                  <span className="text-gray-400 italic">No attachments added</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {documents.map(d => (
                      <span key={d.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white border text-[10.5px] font-semibold text-gray-700 shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-brand-600 px-1 bg-brand-50 rounded border border-brand-100">{d.type}</span>
                        <span>{d.name} <span className="text-[9.5px] text-gray-400">({d.size})</span></span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Sticky footer action buttons bar */}
      <div className="flex items-center justify-between border-t border-gray-150 pt-4 bg-white/95 sticky bottom-0 py-3 px-1 select-none z-10">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border select-none transition-colors focus:outline-none ${
            currentStep === 0 
              ? 'bg-gray-55/30 border-gray-200 text-gray-300 cursor-not-allowed' 
              : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
              className="inline-flex items-center gap-1 px-4.5 py-1.5 text-xs font-bold rounded shadow-sm bg-brand-500 hover:bg-brand-600 text-white select-none transition-colors focus:outline-none cursor-pointer"
            >
              Next Step
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSubmitMock('draft')}
                className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded shadow-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 select-none transition-all focus:outline-none cursor-pointer"
              >
                Save Draft
                <Save className="h-3.5 w-3.5 text-gray-500" />
              </button>
              <button
                onClick={() => handleSubmitMock('tender')}
                className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded shadow-sm bg-brand-500 hover:bg-brand-600 text-white select-none transition-all focus:outline-none cursor-pointer"
              >
                Create & Send For Tender
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
export default CreateSite;
