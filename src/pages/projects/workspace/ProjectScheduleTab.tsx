/**
 * Project Schedule & Activity Timeline Tab
 * Location: src/pages/projects/workspace/ProjectScheduleTab.tsx
 */

import React from 'react';
import { Project } from '../../../domain/types';
import { useERPStore } from '../../../store/ERPStoreContext';
import { getProjectSchedule } from '../../../domain/selectors';
import { Calendar } from 'lucide-react';

interface Props {
  project: Project;
}

export const ProjectScheduleTab: React.FC<Props> = ({ project }) => {
  const { state } = useERPStore();
  const schedule = getProjectSchedule(state, project.id);

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-700" /> Project Master Schedule & Activity Timeline
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Planned activities from {project.startDate} to {project.targetCompletionDate}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold block">Activities Tracked</span>
          <span className="font-bold text-slate-900 font-mono text-sm">{schedule.length} Tasks</span>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-2.5">Activity Name</th>
              <th className="p-2.5">Planned Dates</th>
              <th className="p-2.5">Actual Dates</th>
              <th className="p-2.5 w-40">Progress</th>
              <th className="p-2.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {schedule.map((act) => (
              <tr key={act.id} className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-900">{act.activityName}</td>
                <td className="p-2.5 font-mono text-slate-600">
                  {act.plannedStartDate} to {act.plannedEndDate}
                </td>
                <td className="p-2.5 font-mono text-slate-600">
                  {act.actualStartDate || 'Pending'} {act.actualEndDate ? `to ${act.actualEndDate}` : ''}
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${act.progressPercentage}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] font-bold w-8 text-right">
                      {act.progressPercentage}%
                    </span>
                  </div>
                </td>
                <td className="p-2.5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      act.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : act.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {act.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
