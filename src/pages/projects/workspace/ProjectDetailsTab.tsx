import React, { useState } from 'react';
import { Building, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { Project } from '../../../domain/types';
import { useERPStore } from '../../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../../utils/format';

interface ProjectDetailsTabProps {
  project: Project;
}

export const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = ({ project }) => {
  const { updateItem } = useERPStore();
  const [startDate, setStartDate] = useState(project.startDate || '');
  const [targetCompletionDate, setTargetCompletionDate] = useState(project.targetCompletionDate || '');
  const [siteAddress, setSiteAddress] = useState(project.siteAddress || '');
  const [city, setCity] = useState(project.city || '');
  const [projectArea, setProjectArea] = useState(project.projectArea || 0);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateItem('projects', project.id, {
      startDate,
      targetCompletionDate,
      siteAddress,
      city,
      projectArea,
      updatedAt: new Date().toISOString(),
    } as any);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Save Toast */}
      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Project setup details updated successfully.
        </div>
      )}

      {/* Read-Only Commercial Baseline Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Immutable Commercial Baseline
          </div>
          <h2 className="text-base font-bold text-white mt-0.5">Commercial Handoff Snapshot</h2>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Imported from Accepted CRM Quotation <span className="font-mono text-amber-400 font-bold">{(project as any).sourceQuotationNumber || 'QUO-ACCEPTED'}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Quotation Value</span>
            <span className="font-mono text-sm font-black text-amber-400">
              {formatIndianCurrency((project as any).contractValue || project.acceptedQuotationValue || 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Procurement Baseline</span>
            <span className="font-mono text-sm font-black text-emerald-400">
              {formatIndianCurrency((project as any).budgetBaseline || (project as any).internalEstimatedCost || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Read-Only Client Master Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building className="h-4 w-4 text-[#AB9570]" /> Client Master Information (Read-Only)
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
            ID: {project.clientId}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-700">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Client Name</span>
            <span className="font-bold text-slate-900 text-sm">{project.clientName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Person</span>
            <span className="font-semibold text-slate-800">{project.clientContactPerson || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
            <span className="font-mono font-semibold text-slate-800">{project.clientPhone || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
            <span className="font-semibold text-slate-800">{project.clientEmail || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN</span>
            <span className="font-mono font-semibold text-slate-800">{project.clientGstin || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Purchase Order Ref</span>
            <span className="font-mono font-bold text-emerald-700">
              {project.clientPODetails?.poNumber || 'PO-ACCEPT-01'}
            </span>
          </div>
        </div>
      </div>

      {/* Editable Project Details Form */}
      <form onSubmit={handleSaveDetails} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#AB9570]" /> Site & Schedule Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#AB9570]"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Target Completion Date</label>
            <input
              type="date"
              value={targetCompletionDate}
              onChange={(e) => setTargetCompletionDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#AB9570]"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">City / Region</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#AB9570]"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Project Area (sqft)</label>
            <input
              type="number"
              value={projectArea}
              onChange={(e) => setProjectArea(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#AB9570]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-600 font-bold mb-1">Site Address</label>
            <textarea
              rows={2}
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              placeholder="Enter site address details"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#AB9570]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all text-xs"
          >
            Save Project Details
          </button>
        </div>
      </form>
    </div>
  );
};
