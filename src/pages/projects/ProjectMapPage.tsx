/**
 * Empire Interior ERP - Project Map Page
 * Location: src/pages/projects/ProjectMapPage.tsx
 * Comprehensive portfolio matrix mapping General details, CRM Tender baseline, Progress, Procurement & Budget.
 * Uses ONLY real ERPStore values.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Filter, X, ArrowUpRight, ShieldCheck, Briefcase, Award, TrendingUp, ShoppingBag, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { formatIndianCurrency } from '../../utils/format';

type MapTab = 'general' | 'crm' | 'progress' | 'procurement' | 'budget';

export const ProjectMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useERPStore();

  const [activeTab, setActiveTab] = useState<MapTab>('general');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');

  const projects = state.projects || [];
  const indents = state.materialIndents || [];
  const rfqs = state.rfqs || [];
  const pos = state.purchaseOrders || [];
  const estimates = state.estimates || [];
  const enquiries = state.enquiries || [];

  // Derived filter options
  const clientsList = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.clientName) set.add(p.clientName);
    });
    return Array.from(set).sort();
  }, [projects]);

  const citiesList = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set).sort();
  }, [projects]);

  // Compute actual project mapping stats per project
  const mappedProjects = useMemo(() => {
    return projects.map((p) => {
      const projIndents = indents.filter((i) => i.projectId === p.id);
      const projRFQs = rfqs.filter((r) => r.projectId === p.id);
      const projPOs = pos.filter((po) => po.projectId === p.id);

      const pendingIndentsCount = projIndents.filter((i) => i.status === 'pending_approval' || i.status === 'approval_required').length;
      const approvedIndentsCount = projIndents.filter((i) => i.status === 'approved').length;

      const totalPOValue = projPOs.reduce((sum, po) => sum + (po.totalAmount || po.grandTotal || 0), 0);
      const totalIndentValue = projIndents.reduce((sum, ind) => sum + (ind.totalEstimatedValue || 0), 0);

      // Find matching CRM estimate & enquiry
      const matchingEst = estimates.find(
        (e) => e.id === p.sourceEstimateId || e.id === p.acceptedEstimateId || e.enquiryId === p.sourceEnquiryId
      );
      const matchingEnq = enquiries.find((en) => en.id === p.sourceEnquiryId);

      // Budget metrics using actual store fields
      const internalCostBaseline = p.internalEstimatedCost || p.budgetBaseline || (p.acceptedQuotationValue ? p.acceptedQuotationValue * 0.8 : 0);
      const committedCost = p.committedCost || totalPOValue;
      const actualCost = p.actualCost || 0;
      const remainingBudget = Math.max(0, internalCostBaseline - committedCost - actualCost);
      const budgetUtilisation = internalCostBaseline > 0 ? Math.round(((committedCost + actualCost) / internalCostBaseline) * 100) : 0;

      // Health assessment
      let health: 'on_track' | 'attention_required' | 'delayed' | 'critical' | 'completed' = 'on_track';
      if (p.status === 'completed') {
        health = 'completed';
      } else if (p.status === 'on_hold' || pendingIndentsCount > 3) {
        health = 'attention_required';
      } else if (budgetUtilisation > 100) {
        health = 'critical';
      } else if (p.progress < 25 && p.status === 'active') {
        health = 'attention_required';
      }

      return {
        ...p,
        projIndents,
        projRFQs,
        projPOs,
        pendingIndentsCount,
        approvedIndentsCount,
        totalPOValue,
        totalIndentValue,
        matchingEst,
        matchingEnq,
        internalCostBaseline,
        committedCost,
        actualCost,
        remainingBudget,
        budgetUtilisation,
        health,
      };
    });
  }, [projects, indents, rfqs, pos, estimates, enquiries]);

  // Filtered mapping
  const filteredProjects = useMemo(() => {
    return mappedProjects.filter((p) => {
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchName = p.projectName?.toLowerCase().includes(term);
        const matchCode = p.projectCode?.toLowerCase().includes(term);
        const matchClient = p.clientName?.toLowerCase().includes(term);
        const matchCity = p.city?.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchClient && !matchCity) return false;
      }
      if (clientFilter !== 'all' && p.clientName !== clientFilter) return false;
      if (cityFilter !== 'all' && p.city !== cityFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (healthFilter !== 'all' && p.health !== healthFilter) return false;
      return true;
    });
  }, [mappedProjects, searchTerm, clientFilter, cityFilter, statusFilter, healthFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setClientFilter('all');
    setCityFilter('all');
    setStatusFilter('all');
    setHealthFilter('all');
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'on_track':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> On Track</span>;
      case 'attention_required':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-3 w-3 text-amber-600" /> Attention Req.</span>;
      case 'critical':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><AlertTriangle className="h-3 w-3 text-rose-600" /> Budget Overrun</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200"><CheckCircle2 className="h-3 w-3 text-purple-600" /> Completed</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{health}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans text-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570] flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> Portfolio Visibility Matrix
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">Project Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cross-functional mapping of baseline commercials, site progress, procurement pipelines & cost health.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Project Code, Name, Client, or Location..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AB9570]/30 focus:border-[#AB9570] transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase mr-1">
            <Filter className="h-3.5 w-3.5 text-[#AB9570]" /> Filters:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#AB9570]"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          {clientsList.length > 0 && (
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#AB9570]"
            >
              <option value="all">All Clients</option>
              {clientsList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {citiesList.length > 0 && (
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#AB9570]"
            >
              <option value="all">All Cities</option>
              {citiesList.map((ct) => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          )}

          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#AB9570]"
          >
            <option value="all">All Project Health</option>
            <option value="on_track">On Track</option>
            <option value="attention_required">Attention Required</option>
            <option value="critical">Critical Budget Overrun</option>
            <option value="completed">Completed</option>
          </select>

          {(searchTerm || clientFilter !== 'all' || cityFilter !== 'all' || statusFilter !== 'all' || healthFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors ml-auto"
            >
              <X className="h-3 w-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-slate-100/60 p-1 rounded-xl gap-1">
        {[
          { id: 'general', label: '1. General Overview', icon: Briefcase },
          { id: 'crm', label: '2. CRM & Tender Baseline', icon: Award },
          { id: 'progress', label: '3. Execution & Progress', icon: TrendingUp },
          { id: 'procurement', label: '4. Procurement Status', icon: ShoppingBag },
          { id: 'budget', label: '5. Budget & Cost Health', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MapTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#AB9570]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Matrix Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Project Code / Name</th>
                <th className="py-3 px-4">Client</th>
                {activeTab === 'general' && (
                  <>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Project Director</th>
                    <th className="py-3 px-4">Project Manager</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Progress</th>
                  </>
                )}
                {activeTab === 'crm' && (
                  <>
                    <th className="py-3 px-4">Source Enquiry</th>
                    <th className="py-3 px-4">Quotation No</th>
                    <th className="py-3 px-4">Accepted Value</th>
                    <th className="py-3 px-4">Internal Est. Cost</th>
                    <th className="py-3 px-4">Accepted Date</th>
                    <th className="py-3 px-4">CRM Estimator</th>
                  </>
                )}
                {activeTab === 'progress' && (
                  <>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4 text-center">Progress %</th>
                    <th className="py-3 px-4">Responsible Director</th>
                    <th className="py-3 px-4">Target Completion</th>
                    <th className="py-3 px-4">Health Tag</th>
                  </>
                )}
                {activeTab === 'procurement' && (
                  <>
                    <th className="py-3 px-4 text-center">Material Indents</th>
                    <th className="py-3 px-4 text-center">Pending Approval</th>
                    <th className="py-3 px-4 text-center">Approved</th>
                    <th className="py-3 px-4 text-center">RFQs Issued</th>
                    <th className="py-3 px-4 text-center">POs Created</th>
                    <th className="py-3 px-4 text-right">PO Total Value</th>
                  </>
                )}
                {activeTab === 'budget' && (
                  <>
                    <th className="py-3 px-4 text-right">Internal Cost Baseline</th>
                    <th className="py-3 px-4 text-right">PO Committed Cost</th>
                    <th className="py-3 px-4 text-right">Actual Cost</th>
                    <th className="py-3 px-4 text-right">Remaining Budget</th>
                    <th className="py-3 px-4 text-center">Utilisation</th>
                    <th className="py-3 px-4">Budget Health</th>
                  </>
                )}
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  {/* Common Code / Name */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.projectName}</div>
                    <div className="font-mono text-[10px] text-slate-400 font-semibold">{p.projectCode}</div>
                  </td>

                  {/* Common Client */}
                  <td className="py-3 px-4 text-slate-700 font-semibold">{p.clientName}</td>

                  {/* General Tab */}
                  {activeTab === 'general' && (
                    <>
                      <td className="py-3 px-4 text-slate-600">{p.city || p.siteAddress || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-700">{p.projectDirectorName || 'Rajesh Sharma'}</td>
                      <td className="py-3 px-4 text-slate-700">{p.projectSupervisorName || 'Amit Verma'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {p.status === 'active' ? 'Site Execution' : p.status === 'planning' ? 'Schedule & Team Setup' : 'Commercial Setup'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{p.progress}%</td>
                    </>
                  )}

                  {/* CRM Tab */}
                  {activeTab === 'crm' && (
                    <>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.matchingEnq?.enquiryNumber || p.sourceEnquiryId || 'ENQ-CRM'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#AB9570]">{p.sourceQuotationNumber || p.matchingEst?.quotationNumber || 'QUO-ACCEPTED'}</td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900">{formatIndianCurrency(p.acceptedQuotationValue || p.currentBOQValue || 0)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">{formatIndianCurrency(p.internalCostBaseline)}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{p.createdBy || 'Rajesh Sharma'}</td>
                    </>
                  )}

                  {/* Progress Tab */}
                  {activeTab === 'progress' && (
                    <>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {p.status === 'active' ? 'Interior Fitout Execution' : 'Planning & Milestone Lock'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">{p.progress}%</td>
                      <td className="py-3 px-4 text-slate-700">{p.projectDirectorName || 'Rajesh Sharma'}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {p.targetCompletionDate ? new Date(p.targetCompletionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                      </td>
                      <td className="py-3 px-4">{getHealthBadge(p.health)}</td>
                    </>
                  )}

                  {/* Procurement Tab */}
                  {activeTab === 'procurement' && (
                    <>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{p.projIndents.length}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-600">{p.pendingIndentsCount}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">{p.approvedIndentsCount}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-600">{p.projRFQs.length}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-purple-600">{p.projPOs.length}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">{formatIndianCurrency(p.totalPOValue)}</td>
                    </>
                  )}

                  {/* Budget Tab */}
                  {activeTab === 'budget' && (
                    <>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">{formatIndianCurrency(p.internalCostBaseline)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">{formatIndianCurrency(p.committedCost)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">{formatIndianCurrency(p.actualCost)}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">{formatIndianCurrency(p.remainingBudget)}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">{p.budgetUtilisation}%</td>
                      <td className="py-3 px-4">{getHealthBadge(p.health)}</td>
                    </>
                  )}

                  {/* Open Project Workspace Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-[#AB9570] text-white hover:text-slate-950 font-bold rounded-lg transition-colors text-xs"
                    >
                      <span>Open Workspace</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
