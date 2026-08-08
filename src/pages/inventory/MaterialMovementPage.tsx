/**
 * Material Movement & Consumption Hub Page
 * Location: src/pages/inventory/MaterialMovementPage.tsx
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Button } from '../../components/ui/Button';
import {
  getMaterialIssueStatusBadge,
  getMaterialReturnStatusBadge,
  getMaterialConsumptionStatusBadge,
} from '../../utils/statusStyles';
import {
  ArrowRightLeft,
  Search,
  Plus,
  Truck,
  RotateCcw,
  Flame,
} from 'lucide-react';

export const MaterialMovementPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useERPStore();

  const issues = state.materialIssues || [];
  const returns = state.materialReturns || [];
  const consumptions = state.materialConsumptions || [];
  const projects = state.projects || [];

  const [activeTab, setActiveTab] = useState<'issues' | 'returns' | 'consumptions'>('issues');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    return issues.filter((item) => {
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.documentNumber.toLowerCase().includes(q) ||
        item.sourceLocationName.toLowerCase().includes(q) ||
        item.destinationAreaName.toLowerCase().includes(q)
      );
    });
  }, [issues, projectFilter, searchQuery]);

  // Filtered Returns
  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.documentNumber.toLowerCase().includes(q) ||
        item.originalIssueNumber.toLowerCase().includes(q) ||
        item.returnedBy.toLowerCase().includes(q)
      );
    });
  }, [returns, projectFilter, searchQuery]);

  // Filtered Consumptions
  const filteredConsumptions = useMemo(() => {
    return consumptions.filter((item) => {
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.documentNumber.toLowerCase().includes(q) ||
        (item.workPackageName || '').toLowerCase().includes(q) ||
        item.recordedBy.toLowerCase().includes(q)
      );
    });
  }, [consumptions, projectFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-xs">
      {/* Header Banner */}
      <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <ArrowRightLeft className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-100">Material Movement & Site Consumption</h1>
            <p className="text-stone-400 text-xs mt-0.5">
              Control site material issues, store returns, reusable salvages, and site work package consumptions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'issues' && (
            <Button
              variant="primary"
              onClick={() => navigate('/inventory/material-issues/new')}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Issue Material
            </Button>
          )}

          {activeTab === 'returns' && (
            <Button
              variant="primary"
              onClick={() => navigate('/inventory/material-returns/new')}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Record Material Return
            </Button>
          )}

          {activeTab === 'consumptions' && (
            <Button
              variant="primary"
              onClick={() => navigate('/inventory/material-consumptions/new')}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Record Consumption
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
              activeTab === 'issues'
                ? 'bg-amber-500/10 text-amber-950 border border-amber-300'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-600" />
            Material Issues ({issues.length})
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
              activeTab === 'returns'
                ? 'bg-cyan-50 text-cyan-950 border border-cyan-300'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-cyan-600" />
            Material Returns ({returns.length})
          </button>

          <button
            onClick={() => setActiveTab('consumptions')}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
              activeTab === 'consumptions'
                ? 'bg-orange-50 text-orange-950 border border-orange-300'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-600" />
            Site Consumptions ({consumptions.length})
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 text-xs outline-none"
            />
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="p-1 bg-white border border-stone-300 rounded-lg text-stone-800 text-xs outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName || p.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Panel 1: Material Issues */}
      {activeTab === 'issues' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Issue Doc #</th>
                  <th className="py-3 px-4">Project & Area</th>
                  <th className="py-3 px-4">Source Location</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4 text-center">Items Count</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Issued By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-stone-400">
                      <Truck className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                      <p className="font-semibold text-stone-600">No Material Issues recorded</p>
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">{issue.documentNumber}</td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{issue.projectName}</div>
                        <div className="text-[10px] text-stone-500 font-medium">{issue.destinationAreaName}</div>
                      </td>

                      <td className="py-3 px-4 text-stone-700">{issue.sourceLocationName}</td>

                      <td className="py-3 px-4 font-semibold text-stone-700">{issue.issueDate}</td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-stone-900">
                        {issue.lines.length} Line(s)
                      </td>

                      <td className="py-3 px-4 text-center">{getMaterialIssueStatusBadge(issue.status)}</td>

                      <td className="py-3 px-4 text-right text-stone-600">{issue.issuedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Panel 2: Material Returns */}
      {activeTab === 'returns' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Return Doc #</th>
                  <th className="py-3 px-4">Ref Issue #</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Returned By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-stone-400">
                      <RotateCcw className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                      <p className="font-semibold text-stone-600">No Material Returns recorded</p>
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-700">{ret.documentNumber}</td>

                      <td className="py-3 px-4 font-mono text-stone-600">{ret.originalIssueNumber}</td>

                      <td className="py-3 px-4 font-semibold text-stone-900">{ret.projectName}</td>

                      <td className="py-3 px-4 text-stone-700">{ret.returnDate}</td>

                      <td className="py-3 px-4 text-center">{getMaterialReturnStatusBadge(ret.status)}</td>

                      <td className="py-3 px-4 text-right text-stone-600">{ret.returnedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Panel 3: Site Consumptions */}
      {activeTab === 'consumptions' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Consumption Doc #</th>
                  <th className="py-3 px-4">Project & Work Package</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800 text-xs">
                {filteredConsumptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-stone-400">
                      <Flame className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                      <p className="font-semibold text-stone-600">No Site Consumptions recorded</p>
                    </td>
                  </tr>
                ) : (
                  filteredConsumptions.map((con) => (
                    <tr key={con.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-mono font-bold text-orange-700">{con.documentNumber}</td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{con.projectName}</div>
                        <div className="text-[10px] text-stone-500 font-medium">{con.workPackageName}</div>
                      </td>

                      <td className="py-3 px-4 text-stone-700">{con.consumptionDate}</td>

                      <td className="py-3 px-4 text-center">{getMaterialConsumptionStatusBadge(con.status)}</td>

                      <td className="py-3 px-4 text-right text-stone-600">{con.recordedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
