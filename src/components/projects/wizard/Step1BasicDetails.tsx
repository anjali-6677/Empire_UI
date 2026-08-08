import React from 'react';
import { Building2, Hash, Calendar } from 'lucide-react';
import { Client } from '../../../domain/types';

export interface Step1Data {
  projectCode: string;
  projectName: string;
  clientId: string;
  clientName: string;
  clientContactPerson: string;
  clientPhone: string;
  clientEmail: string;
  clientGstin: string;
  companyName: string;
  category: string;
  city: string;
  state: string;
  siteAddress: string;
  projectArea: number;
  projectAreaUnit: string;
  startDate: string;
  targetCompletionDate: string;
}

interface Step1BasicDetailsProps {
  data: Step1Data;
  onChange: (field: keyof Step1Data, value: any) => void;
  clients: Client[];
}

export const Step1BasicDetails: React.FC<Step1BasicDetailsProps> = ({ data, onChange, clients }) => {
  const handleClientSelect = (clientId: string) => {
    onChange('clientId', clientId);
    const selected = clients.find((c) => c.id === clientId);
    if (selected) {
      onChange('clientName', selected.name);
      onChange('clientContactPerson', selected.contactPerson || '');
      onChange('clientPhone', selected.phone || '');
      onChange('clientEmail', selected.email || '');
      onChange('clientGstin', selected.gstin || '');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#AB9570]" /> Step 1: Project Identity, Location & Dates
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Enter project code, client details, site location, start date, and target completion date.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Code */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Project Code <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={data.projectCode}
              onChange={(e) => onChange('projectCode', e.target.value)}
              placeholder="e.g. PRJ-2026-011"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#AB9570]"
            />
          </div>
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Project Name <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={data.projectName}
            onChange={(e) => onChange('projectName', e.target.value)}
            placeholder="e.g. Oberoi Sky City Interior Fitout"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-[#AB9570]"
          />
        </div>

        {/* Client Selection (Master Data Linked) */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Select Client <span className="text-rose-600">*</span>
          </label>
          <select
            value={data.clientId}
            onChange={(e) => handleClientSelect(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#AB9570]"
          >
            <option value="">-- Select Client from Master Data --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Company Entity */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Company Operating Entity <span className="text-rose-600">*</span>
          </label>
          <select
            value={data.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#AB9570]"
          >
            <option value="Empire Interior Pvt Ltd">Empire Interior Pvt Ltd</option>
            <option value="Empire Construction Ltd">Empire Construction Ltd</option>
            <option value="Empire Design & Projects">Empire Design & Projects</option>
          </select>
        </div>

        {/* Project Category */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">Project Category</label>
          <select
            value={data.category}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#AB9570]"
          >
            <option value="Luxury Residential">Luxury Residential</option>
            <option value="Corporate Office">Corporate Office</option>
            <option value="Commercial Interior">Commercial Interior</option>
            <option value="Hospitality Fit-Out">Hospitality Fit-Out</option>
            <option value="Retail Showroom">Retail Showroom</option>
            <option value="Financial Institutional">Financial Institutional</option>
            <option value="Healthcare Facility">Healthcare Facility</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Planned Start Date <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#AB9570]"
            />
          </div>
        </div>

        {/* Target Completion Date */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Target Completion Date <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={data.targetCompletionDate}
              onChange={(e) => onChange('targetCompletionDate', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#AB9570]"
            />
          </div>
        </div>

        {/* Project Area */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">Project Area Size</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={data.projectArea || ''}
              onChange={(e) => onChange('projectArea', parseFloat(e.target.value) || 0)}
              placeholder="Area Size (e.g. 5000)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#AB9570]"
            />
            <select
              value={data.projectAreaUnit}
              onChange={(e) => onChange('projectAreaUnit', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#AB9570]"
            >
              <option value="Sq Ft">Sq Ft</option>
              <option value="Sq Mtr">Sq Mtr</option>
            </select>
          </div>
        </div>

        {/* City & State */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            City & State <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="City (e.g. Mumbai)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#AB9570]"
            />
            <input
              type="text"
              value={data.state}
              onChange={(e) => onChange('state', e.target.value)}
              placeholder="State (e.g. Maharashtra)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#AB9570]"
            />
          </div>
        </div>

        {/* Site Address */}
        <div className="md:col-span-2">
          <label className="block text-slate-700 font-semibold mb-1">Full Site Address</label>
          <input
            type="text"
            value={data.siteAddress}
            onChange={(e) => onChange('siteAddress', e.target.value)}
            placeholder="Plot No., Tower / Wing, Street Name, Landmark..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#AB9570]"
          />
        </div>
      </div>
    </div>
  );
};
