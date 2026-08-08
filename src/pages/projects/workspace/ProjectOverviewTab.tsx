/**
 * Project Overview Tab Component
 * Location: src/pages/projects/workspace/ProjectOverviewTab.tsx
 */

import React from 'react';
import { Project, ProjectBOQ } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';
import { BarChart3, TrendingUp, ShieldCheck, Clock, Layers, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  project: Project;
  boq: ProjectBOQ | undefined;
}

export const ProjectOverviewTab: React.FC<Props> = ({ project, boq }) => {
  const totalBOQValue = boq ? boq.totalBOQValue : project.budgetBaseline;
  const committedCost = project.committedCost || 0;
  const actualCost = project.actualCost || 0;
  const certifiedRevenue = project.certifiedRevenue || 0;
  const clientReceipts = project.clientReceipts || 0;

  return (
    <div className="space-y-6">
      {/* 4 Financial & Progress KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Locked BOQ Revenue</span>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {formatIndianCurrency(totalBOQValue)}
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Locked Baseline
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Committed PO / WO Cost</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-blue-900 font-mono">
            {formatIndianCurrency(committedCost)}
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1">
            {((committedCost / (project.budgetBaseline || 1)) * 100).toFixed(1)}% of budget baseline
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Actual Direct Cost</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {formatIndianCurrency(actualCost)}
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1">
            GRN Posted Stock & WIP Disbursements
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Certified Revenue</span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-800 font-mono">
            {formatIndianCurrency(certifiedRevenue)}
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1">
            Receipts: {formatIndianCurrency(clientReceipts)}
          </div>
        </div>
      </div>

      {/* Project Quick Health & Quick Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-xs uppercase tracking-wider">
            Project Health & Milestones Summary
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded border border-slate-100">
              <span className="text-slate-500 block text-[10px]">Client Company</span>
              <span className="font-bold text-slate-900">{project.clientName}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-100">
              <span className="text-slate-500 block text-[10px]">Project Director</span>
              <span className="font-bold text-slate-900">{project.projectDirectorName}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-100">
              <span className="text-slate-500 block text-[10px]">Site Supervisor</span>
              <span className="font-bold text-slate-900">{project.projectSupervisorName}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-100">
              <span className="text-slate-500 block text-[10px]">Planned Start Date</span>
              <span className="font-mono text-slate-800">{project.startDate}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-100">
              <span className="text-slate-500 block text-[10px]">Target Completion</span>
              <span className="font-mono text-slate-800">{project.targetCompletionDate}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-100">
              <span className="text-slate-500 block text-[10px]">Team Status</span>
              <span className={`font-bold ${project.isTeamLocked ? 'text-amber-800' : 'text-emerald-700'}`}>
                {project.isTeamLocked ? 'Team Locked' : 'Editable'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Panel */}
        <div className="bg-slate-900 text-white rounded-lg p-4 space-y-3 shadow-md">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            Procurement & Indent Shortcuts
          </div>
          <p className="text-[11px] text-slate-400">
            Create material indents validated against this active project's locked BOQ baseline.
          </p>
          <div className="space-y-2 pt-2">
            <Link
              to={`/procurement/indents/new?projectId=${project.id}`}
              className="w-full flex items-center justify-between px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition"
            >
              <span>+ Create Material Indent</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/procurement/indents"
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded text-xs transition"
            >
              <span>View Project Indents</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/procurement/indent-approvals"
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded text-xs transition"
            >
              <span>Segregated Approvals Inbox</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
