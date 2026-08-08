import React from 'react';
import { Activity, CheckSquare, HardHat, TrendingUp, Calendar } from 'lucide-react';
import { Project } from '../../../domain/types';

interface ProjectExecutionTabProps {
  project: Project;
}

export const ProjectExecutionTab: React.FC<ProjectExecutionTabProps> = ({ project }) => {
  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase">Overall Completion</span>
            <TrendingUp className="h-4 w-4 text-[#AB9570]" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">{project.progress || 0}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#AB9570] h-full" style={{ width: `${project.progress || 0}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase">Site Supervisor</span>
            <HardHat className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-slate-900">{project.projectSupervisorName || 'Amit Verma'}</div>
          <div className="text-[10px] text-slate-500 mt-1">Daily Work Log Assigned</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase">Start Date</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm font-mono font-bold text-slate-900">{project.startDate || '2026-08-01'}</div>
          <div className="text-[10px] text-slate-500 mt-1">Project Target Execution</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase">Target Date</span>
            <Calendar className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-sm font-mono font-bold text-slate-900">{project.targetCompletionDate || '2026-11-30'}</div>
          <div className="text-[10px] text-slate-500 mt-1">Contractual Handover</div>
        </div>
      </div>

      {/* Daily Progress & Safety Logs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#AB9570]" /> Site Daily Execution Status
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900">Demolition & Site Clearance</div>
                <div className="text-[11px] text-slate-500">Subcontractor workforce mobilized. Debris removed.</div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">100% Complete</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-4 w-4 text-amber-600" />
              <div>
                <div className="font-bold text-slate-900">Gypsum Partition Framing & Wiring Conduit</div>
                <div className="text-[11px] text-slate-500">In progress. Hardware and channels delivered to site.</div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">45% In Progress</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-4 w-4 text-slate-400" />
              <div>
                <div className="font-bold text-slate-900">Custom Veneer Panelling & Polish</div>
                <div className="text-[11px] text-slate-500">Scheduled after ceiling electrical signoff.</div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full font-bold text-[10px]">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};
