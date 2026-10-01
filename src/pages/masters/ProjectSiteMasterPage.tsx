/**
 * Project Site Master Page
 * Location: src/pages/masters/ProjectSiteMasterPage.tsx
 */

import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Project } from '../../domain/types';
import { MasterRowActionsMenu, MasterActionItem } from '../../components/masters/MasterRowActionsMenu';
import { Button } from '../../components/ui/Button';
import {
  MapPin,
  Search,
  Edit,
  Building,
  Briefcase,
  Compass,
  Building2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export const ProjectSiteMasterPage: React.FC = () => {
  const { state, updateItem } = useERPStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [pmcFilter, setPmcFilter] = useState('all');
  const [architectFilter, setArchitectFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Modal editing form state
  const [pmcId, setPmcId] = useState('');
  const [architectId, setArchitectId] = useState('');
  const [companyEntityId, setCompanyEntityId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const projects = state.projects || [];
  const pmcs = state.pmcs || [];
  const architects = state.architects || [];
  const companies = state.companyEntities || [];

  const filteredProjects = projects.filter((p) => {
    const prjName = p.projectName || p.name || '';
    const prjCode = p.projectCode || p.code || '';
    const matchesSearch =
      prjName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prjCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPmc = pmcFilter === 'all' || p.pmcId === pmcFilter;
    const matchesArch = architectFilter === 'all' || p.architectId === architectFilter;
    const matchesComp = companyFilter === 'all' || p.companyEntityId === companyFilter;

    return matchesSearch && matchesPmc && matchesArch && matchesComp;
  });

  const totalValue = projects.reduce((acc, p) => acc + (p.boqTotalValue || 0), 0);
  const activeCount = projects.filter((p) => (p.status as string) !== 'cancelled' && (p.status as string) !== 'closed').length;

  const handleOpenModal = (prj: Project) => {
    setErrorMessage(null);
    setEditingProject(prj);
    setPmcId(prj.pmcId || '');
    setArchitectId(prj.architectId || '');
    setCompanyEntityId(prj.companyEntityId || '');
    setLocationName(prj.location || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!editingProject) return;

    const pmcObj = pmcs.find((p) => p.id === pmcId);
    const archObj = architects.find((a) => a.id === architectId);

    updateItem('projects', editingProject.id, {
      pmcId: pmcId || undefined,
      pmcName: pmcObj?.name,
      architectId: architectId || undefined,
      architectName: archObj?.name,
      companyEntityId: companyEntityId || undefined,
      location: locationName.trim(),
    });

    setShowModal(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2.5">
            <Building className="h-6 w-6 text-[#B39A6A]" />
            Project Sites & Canonical Master
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Master list of all active and historical project sites with canonical PMC, Architect, & Contracting Entity links.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Site Projects</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{projects.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Active Sites</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase">Total Portfolio Value</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(totalValue)}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 border-b border-slate-200 pb-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">PMC Filter</label>
          <select
            value={pmcFilter}
            onChange={(e) => setPmcFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="all">All PMCs</option>
            {pmcs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Architect Filter</label>
          <select
            value={architectFilter}
            onChange={(e) => setArchitectFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="all">All Architects</option>
            {architects.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company Entity</label>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="all">All Corporate Entities</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.legalName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, site name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Site Code</th>
                <th className="py-3 px-4">Project / Site Name</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">PMC Consultant</th>
                <th className="py-3 px-4">Architect / Studio</th>
                <th className="py-3 px-4">Contracting Entity</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">BOQ Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-sm">
                    No project sites found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const pmcObj = pmcs.find((item) => item.id === p.pmcId);
                  const archObj = architects.find((item) => item.id === p.architectId);
                  const compObj = companies.find((item) => item.id === p.companyEntityId);

                  const rowActions: MasterActionItem[] = [
                    {
                      id: 'edit_canonical',
                      label: 'Edit Canonical Links',
                      icon: Edit,
                      onClick: () => handleOpenModal(p),
                    },
                  ];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-xs text-amber-700 font-semibold">{p.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.name}
                        <span className="block text-[11px] text-slate-500 font-normal">{p.projectType || 'Interior Fitout'}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-800">
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3 text-slate-400" />
                          {p.clientName || 'Client'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {pmcObj ? (
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-amber-600" />
                            {pmcObj.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-normal">{p.pmcName || 'Not Assigned'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {archObj ? (
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Compass className="h-3 w-3 text-emerald-600" />
                            {archObj.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-normal">{p.architectName || 'Not Assigned'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {compObj ? (
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-blue-600" />
                            {compObj.legalName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-normal">Flutebyte Technologies</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {p.location || 'Mumbai'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-bold text-slate-900">
                        {formatCurrency(p.boqTotalValue || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <MasterRowActionsMenu ariaLabel={`Actions for ${p.name}`} actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Project Site Master Canonical Links */}
      {showModal && editingProject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Edit Canonical Links for {editingProject.name} ({editingProject.code})
            </h2>
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned PMC Consultant</label>
                <select
                  value={pmcId}
                  onChange={(e) => setPmcId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">(None / Direct Client Management)</option>
                  {pmcs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Architect / Interior Studio</label>
                <select
                  value={architectId}
                  onChange={(e) => setArchitectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">(None / In-house Design)</option>
                  {architects.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Flutebyte Legal Contracting Entity</label>
                <select
                  value={companyEntityId}
                  onChange={(e) => setCompanyEntityId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">(Select Contracting Entity)</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.legalName} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Site Location & City</label>
                <input
                  type="text"
                  placeholder="e.g. Lower Parel, Mumbai"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Canonical Links
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSiteMasterPage;
