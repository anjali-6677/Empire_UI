import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Building, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users
} from 'lucide-react';
import { useSites } from '../context/SitesContext';
import { StatusBadge } from '../components/StatusBadge';
import { safeFormatCurrency } from '../utils/formatStatus';

export const SiteDetails: React.FC = () => {
  const navigate = useNavigate();
  const { sites, selectedSiteId } = useSites();

  const site = sites.find((s) => s.id === selectedSiteId) || sites[0];

  return (
    <div className="flex flex-col gap-6 w-full font-sans text-xs pb-14 select-none relative">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <Link to="/sites" className="hover:text-brand-600">Projects</Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650 font-bold">Site Details</span>
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
              Back to Sites
            </button>
            <button
              onClick={() => navigate('/sites')}
              className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded font-bold shadow-sm cursor-pointer"
            >
              Edit Site Metadata
            </button>
          </div>
        </div>

        {/* Top Key Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1 text-xs">
          <div>
            <span className="text-gray-400 block text-[9px] uppercase font-bold">Company Entity:</span>
            <span className="font-bold text-gray-900">{site.company || 'Empire Interior Contracting'}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[9px] uppercase font-bold">Client Sponsor:</span>
            <span className="font-bold text-gray-900">{site.client}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[9px] uppercase font-bold">City Location:</span>
            <span className="font-bold text-gray-800">{site.city}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[9px] uppercase font-bold">Category:</span>
            <span className="font-bold text-gray-800">{site.category}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[9px] uppercase font-bold">Approved Budget:</span>
            <span className="font-extrabold text-brand-700">{safeFormatCurrency(site.budget)}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[9px] uppercase font-bold">Current Progress:</span>
            <span className="font-extrabold text-emerald-700">{site.progress || 65}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-5">
          {/* Identity & Scope */}
          <div className="bg-white border border-gray-150 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 tracking-tight flex items-center gap-2">
              <Building className="h-4 w-4 text-brand-600" />
              Site Identity & Execution Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-bold">Project Head:</span>
                <span className="font-bold text-gray-900">Rajesh Kumar (Project Head)</span>
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
                <span className="font-medium text-gray-800">{site.address || 'Plot 42, Outer Ring Road, Mahadevapura'}</span>
              </div>
            </div>
          </div>

          {/* Tender & Contract Summary */}
          <div className="bg-white border border-gray-150 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 tracking-tight flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              Tender Specifications & Commercial Terms
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 border border-gray-150 rounded space-y-0.5">
                <span className="text-gray-400 text-[9px] font-bold uppercase block">Original Tender Value</span>
                <span className="font-extrabold text-gray-900 text-xs">{safeFormatCurrency(site.budget)}</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-150 rounded space-y-0.5">
                <span className="text-gray-400 text-[9px] font-bold uppercase block">Committed Orders</span>
                <span className="font-extrabold text-brand-700 text-xs">{safeFormatCurrency(site.budget * 0.7)}</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-150 rounded space-y-0.5">
                <span className="text-gray-400 text-[9px] font-bold uppercase block">Certified Invoices</span>
                <span className="font-extrabold text-emerald-700 text-xs">{safeFormatCurrency(site.budget * 0.45)}</span>
              </div>
            </div>
          </div>

          {/* Project Team Summary */}
          <div className="bg-white border border-gray-150 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 tracking-tight flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-600" />
              Assigned Field Team Members
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-2.5 border rounded bg-gray-50/50">
                <span className="font-bold text-xs text-gray-900 block">Rajesh Kumar</span>
                <span className="text-[10px] text-gray-400 font-medium block">Project Head</span>
              </div>
              <div className="p-2.5 border rounded bg-gray-50/50">
                <span className="font-bold text-xs text-gray-900 block">{site.manager}</span>
                <span className="text-[10px] text-gray-400 font-medium block">Project Manager</span>
              </div>
              <div className="p-2.5 border rounded bg-gray-50/50">
                <span className="font-bold text-xs text-gray-900 block">Karan Sharma</span>
                <span className="text-[10px] text-gray-400 font-medium block">Site Billing Engineer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-5">
          {/* Approval Decision Timeline */}
          <div className="bg-white border border-gray-150 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Board Approval Decisions
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 border rounded border-emerald-200 bg-emerald-50/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Project Head Approval</span>
                  <StatusBadge status="approved" />
                </div>
                <p className="text-[10.5px] text-emerald-800">Approved by Rajesh Kumar on 2026-07-20</p>
              </div>
              <div className="p-3 border rounded border-amber-200 bg-amber-50/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">Board Chairman Decision</span>
                  <StatusBadge status="pending_approval" />
                </div>
                <p className="text-[10.5px] text-amber-800">Pending review by Sanjay Mehta (Chairman)</p>
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white border border-gray-150 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b pb-2 tracking-tight flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Recent Site Activity
            </h3>
            <div className="space-y-2.5 text-[10.5px] text-gray-600">
              <div className="flex items-start gap-2 border-b pb-2">
                <span className="h-2 w-2 rounded-full bg-brand-500 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-gray-900 block">Material Indent IND-2026-001 Raised</span>
                  <span className="text-gray-400 text-[10px]">2026-07-24 10:30</span>
                </div>
              </div>
              <div className="flex items-start gap-2 border-b pb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <span className="font-bold text-gray-900 block">GRN Recorded for PO-2026-089</span>
                  <span className="text-gray-400 text-[10px]">2026-07-23 15:45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
