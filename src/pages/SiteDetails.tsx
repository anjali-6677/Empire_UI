import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, ChevronRight, Building, FileText, CheckCircle2, Clock, Users,
  BarChart, CreditCard, Receipt, FileStack, Package, AlignLeft
} from 'lucide-react';
import { useSites } from '../context/SitesContext';
import { StatusBadge } from '../components/StatusBadge';
import { safeFormatCurrency } from '../utils/formatStatus';

const TABS = [
  'Overview', 'Stakeholders', 'Tender', 'Extra Items', 'Progress', 
  'Billing', 'Payments', 'Estimated Purchases', 'Documents', 'Activity'
];

export const SiteDetails: React.FC = () => {
  const navigate = useNavigate();
  const { sites, selectedSiteId } = useSites();

  const [activeTab, setActiveTab] = React.useState('Overview');

  const site = sites.find((s) => s.id === selectedSiteId) || sites[0];

  if (!site) {
    return (
      <div className="p-8 text-center text-gray-500 font-bold">
        Record Not Found. The requested record does not exist in the current frontend session.
      </div>
    );
  }


  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-brand-600" />
                  Site Identity & Execution Parameters
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Project Head:</span>
                    <span className="font-bold text-gray-900">Rajesh Kumar</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Project Manager:</span>
                    <span className="font-bold text-gray-900">{site.manager}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Start Date:</span>
                    <span className="font-mono font-bold text-gray-800">2026-02-01</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Target Completion:</span>
                    <span className="font-mono font-bold text-gray-800">2026-10-30</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Site Address:</span>
                    <span className="font-medium text-gray-800">{site.address || 'Plot 42, Outer Ring Road'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Board Approval Decisions
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 border rounded border-emerald-200 bg-emerald-50/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900">Project Head Approval</span>
                      <StatusBadge status="approved" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Stakeholders':
        return (
          <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3 animate-fade-in">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-600" /> Key Project Contacts
            </h3>
            <table className="w-full text-left font-medium text-gray-700">
              <thead className="text-[10px] uppercase text-gray-400 border-b border-gray-150">
                <tr><th className="pb-2">Name</th><th className="pb-2">Role</th><th className="pb-2">Contact</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                <tr><td className="py-2">{site.manager}</td><td className="py-2">Project Manager</td><td className="py-2">+91 9988776655</td></tr>
                <tr><td className="py-2">Rajesh Kumar</td><td className="py-2">Project Head</td><td className="py-2">+91 9123456789</td></tr>
                <tr><td className="py-2">Priya Sharma</td><td className="py-2">Client Rep</td><td className="py-2">priya@{site.client.toLowerCase().replace(/\\s/g, '')}.com</td></tr>
              </tbody>
            </table>
          </div>
        );
      case 'Tender':
        return (
          <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3 animate-fade-in">
             <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" /> Tender Specifications
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded border"><span className="block text-[9px] font-bold uppercase text-gray-500">Tender Number</span><span className="font-bold">TNDR-00124</span></div>
              <div className="p-3 bg-gray-50 rounded border"><span className="block text-[9px] font-bold uppercase text-gray-500">Submitted Value</span><span className="font-bold text-brand-700">{safeFormatCurrency(site.budget * 1.05)}</span></div>
              <div className="p-3 bg-gray-50 rounded border"><span className="block text-[9px] font-bold uppercase text-gray-500">Approved Value</span><span className="font-bold text-emerald-700">{safeFormatCurrency(site.budget)}</span></div>
              <div className="p-3 bg-gray-50 rounded border"><span className="block text-[9px] font-bold uppercase text-gray-500">Gross Margin</span><span className="font-bold">14.5%</span></div>
            </div>
            <table className="w-full text-left font-medium text-gray-700 mt-4">
              <thead className="text-[10px] uppercase text-gray-400 border-b border-gray-150">
                <tr><th className="pb-2">Revision</th><th className="pb-2">Date</th><th className="pb-2">Estimated Value</th><th className="pb-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                <tr><td className="py-2">REV-0</td><td className="py-2">2026-01-10</td><td className="py-2">{safeFormatCurrency(site.budget * 1.1)}</td><td className="py-2"><StatusBadge status="rejected" /></td></tr>
                <tr><td className="py-2">REV-1</td><td className="py-2">2026-01-15</td><td className="py-2">{safeFormatCurrency(site.budget)}</td><td className="py-2"><StatusBadge status="approved" /></td></tr>
              </tbody>
            </table>
          </div>
        );
      case 'Extra Items':
        return (
          <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3 animate-fade-in">
             <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-brand-600" /> Non-Tendered BOQ Additions
            </h3>
            <table className="w-full text-left font-medium text-gray-700">
              <thead className="text-[10px] uppercase text-gray-400 border-b border-gray-150">
                <tr><th className="pb-2">Reference</th><th className="pb-2">Scope</th><th className="pb-2">Submitted</th><th className="pb-2">Approved</th><th className="pb-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                <tr><td className="py-2 text-brand-600 font-mono">EXT-001</td><td className="py-2">Additional HVAC Ducting</td><td className="py-2">{safeFormatCurrency(450000)}</td><td className="py-2">{safeFormatCurrency(400000)}</td><td className="py-2"><StatusBadge status="approved" /></td></tr>
                <tr><td className="py-2 text-brand-600 font-mono">EXT-002</td><td className="py-2">Lobby Floor Repaving</td><td className="py-2">{safeFormatCurrency(120000)}</td><td className="py-2">-</td><td className="py-2"><StatusBadge status="pending_approval" /></td></tr>
              </tbody>
            </table>
          </div>
        );
      case 'Progress':
        return (
          <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3 animate-fade-in">
             <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <BarChart className="h-4 w-4 text-brand-600" /> Multi-dimensional Progress
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1"><span className="text-[9px] font-bold text-gray-400 uppercase">Time Duration</span><div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: '65%'}}></div></div><span className="text-xs font-bold">65% Elapsed</span></div>
              <div className="space-y-1"><span className="text-[9px] font-bold text-gray-400 uppercase">Execution (S-Curve)</span><div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '58%'}}></div></div><span className="text-xs font-bold">58% Built</span></div>
              <div className="space-y-1"><span className="text-[9px] font-bold text-gray-400 uppercase">Billing to Client</span><div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{width: '45%'}}></div></div><span className="text-xs font-bold">45% Invoiced</span></div>
              <div className="space-y-1"><span className="text-[9px] font-bold text-gray-400 uppercase">Budget Consumed</span><div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-rose-500 h-1.5 rounded-full" style={{width: '51%'}}></div></div><span className="text-xs font-bold">51% Spent</span></div>
            </div>
            <div className="mt-4 p-4 border rounded bg-gray-50 flex items-center justify-between">
              <span className="font-bold text-gray-700">Projected Gross Profit</span>
              <span className="font-extrabold text-emerald-700 text-lg">11.2%</span>
            </div>
          </div>
        )
      case 'Billing':
        return (
          <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3 animate-fade-in">
             <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-brand-600" /> Client Billing Trajectory
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4 text-center border-b pb-4">
              <div><span className="block text-[9px] uppercase font-bold text-gray-500">Approved BOQ</span><span className="font-bold">{safeFormatCurrency(site.budget + 400000)}</span></div>
              <div><span className="block text-[9px] uppercase font-bold text-gray-500">Submitted Bills</span><span className="font-bold text-brand-700">{safeFormatCurrency(site.budget * 0.55)}</span></div>
              <div><span className="block text-[9px] uppercase font-bold text-gray-500">Approved Bills</span><span className="font-bold text-emerald-700">{safeFormatCurrency(site.budget * 0.45)}</span></div>
            </div>
            <table className="w-full text-left font-medium text-gray-700">
              <thead className="text-[10px] uppercase text-gray-400 border-b border-gray-150">
                <tr><th className="pb-2">Bill No</th><th className="pb-2">Date</th><th className="pb-2">Amount</th><th className="pb-2">Certified Amount</th><th className="pb-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                <tr><td className="py-2 font-mono">RA-01</td><td className="py-2">2026-03-31</td><td className="py-2">{safeFormatCurrency(site.budget * 0.25)}</td><td className="py-2">{safeFormatCurrency(site.budget * 0.25)}</td><td className="py-2"><StatusBadge status="certified" /></td></tr>
                <tr><td className="py-2 font-mono">RA-02</td><td className="py-2">2026-06-30</td><td className="py-2">{safeFormatCurrency(site.budget * 0.30)}</td><td className="py-2">{safeFormatCurrency(site.budget * 0.20)}</td><td className="py-2"><StatusBadge status="partially_reconciled" /></td></tr>
              </tbody>
            </table>
          </div>
        )
      case 'Payments':
        return (
          <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3 animate-fade-in">
             <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-600" /> Cash Flow & Disbursements
            </h3>
            <div className="flex gap-4 p-3 bg-amber-50 rounded border border-amber-100 mb-2">
               <div><span className="block text-[9px] uppercase font-bold text-amber-700">Site On-Account Balance</span><span className="font-extrabold text-amber-900">{safeFormatCurrency(1500000)}</span></div>
            </div>
            <table className="w-full text-left font-medium text-gray-700">
              <thead className="text-[10px] uppercase text-gray-400 border-b border-gray-150">
                <tr><th className="pb-2">Payment Ref</th><th className="pb-2">Type</th><th className="pb-2">Beneficiary</th><th className="pb-2">Amount</th><th className="pb-2">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                <tr><td className="py-2">REC-CL-01</td><td className="py-2"><StatusBadge status="completed" /> Receipt</td><td className="py-2">{site.client}</td><td className="py-2 text-emerald-700">+{safeFormatCurrency(5000000)}</td><td className="py-2">2026-04-15</td></tr>
                <tr><td className="py-2">PAY-VEN-14</td><td className="py-2"><StatusBadge status="processed" /> Vendor</td><td className="py-2">JSW Steel</td><td className="py-2 text-rose-600">-{safeFormatCurrency(1200000)}</td><td className="py-2">2026-05-10</td></tr>
              </tbody>
            </table>
          </div>
        )
      case 'Estimated Purchases':
        return (
          <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3 animate-fade-in">
             <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-brand-600" /> Bill of Materials Estimate
            </h3>
            <table className="w-full text-left font-medium text-gray-700">
              <thead className="text-[10px] uppercase text-gray-400 border-b border-gray-150">
                <tr><th className="pb-2">Item</th><th className="pb-2">Category</th><th className="pb-2">Est Qty</th><th className="pb-2">Est Rate</th><th className="pb-2">Total Amount</th><th className="pb-2">Purchased</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                <tr><td className="py-2">TMT Bars (Fe500D)</td><td className="py-2">Steel</td><td className="py-2">1200 MT</td><td className="py-2">₹54,000</td><td className="py-2">{safeFormatCurrency(1200 * 54000)}</td><td className="py-2"><span className="text-emerald-600 font-bold">1150 MT</span></td></tr>
                <tr><td className="py-2">Cement OPC 43G</td><td className="py-2">Cement</td><td className="py-2">8000 Bags</td><td className="py-2">₹320</td><td className="py-2">{safeFormatCurrency(8000 * 320)}</td><td className="py-2"><span className="text-amber-600 font-bold">4000 Bags</span></td></tr>
              </tbody>
            </table>
          </div>
        )
      case 'Documents':
        return (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 bg-white border border-dashed border-gray-300 rounded-xl space-y-2">
             <FileStack className="h-10 w-10 text-gray-300" />
             <span className="font-bold">No Documents Uploaded</span>
             <span className="text-[10px]">Upload BOQ, tender documents, and drawings here.</span>
          </div>
        )
      case 'Activity':
        return (
          <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-sm space-y-3 animate-fade-in">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" /> Activity History
            </h3>
            <div className="space-y-4 text-[10.5px] text-gray-600 pt-2">
              <div className="flex items-start gap-3 border-b pb-3">
                <span className="h-2 w-2 rounded-full bg-brand-500 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-gray-900 block text-xs">Material Indent IND-2026-001 Raised</span>
                  <span className="text-gray-400">2026-07-24 10:30 by Karan Sharma</span>
                </div>
              </div>
              <div className="flex items-start gap-3 border-b pb-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-gray-900 block text-xs">GRN Recorded for PO-2026-089</span>
                  <span className="text-gray-400">2026-07-23 15:45 by Warehouse Team</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans text-xs pb-14 select-none relative max-w-[1400px] mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <Link to="/sites" className="hover:text-brand-600">Projects</Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650 font-bold">{site.code}</span>
      </nav>

      {/* Site Header */}
      <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-brand-50 border border-brand-150 flex items-center justify-center text-brand-700 font-extrabold text-sm shrink-0">
              {site.code.substring(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
                  {site.code}
                </span>
                <StatusBadge status={(site as any).status || 'approved'} />
              </div>
              <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight mt-1">{site.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sites')}
              className="px-3.5 py-1.5 border border-gray-250 bg-white rounded font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Back to List
            </button>
            <button className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded font-bold shadow-sm cursor-pointer">
              Edit Metadata
            </button>
          </div>
        </div>

        {/* Top Key Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1 text-xs">
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Company Entity:</span><span className="font-bold text-gray-900">{site.company || 'Empire Contracting'}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Client Sponsor:</span><span className="font-bold text-gray-900">{site.client}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">City Location:</span><span className="font-bold text-gray-800">{site.city}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Category:</span><span className="font-bold text-gray-800">{site.category}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Approved Budget:</span><span className="font-extrabold text-brand-700">{safeFormatCurrency(site.budget)}</span></div>
          <div><span className="text-gray-400 block text-[9px] uppercase font-bold">Current Progress:</span><span className="font-extrabold text-emerald-700">{site.progress || 65}%</span></div>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide sticky top-0 z-10 rounded-t-xl transition-all">
        <div className="flex px-2 pt-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-bold text-xs uppercase tracking-wider relative border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'text-brand-700 border-brand-500'
                  : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Renderer */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};
