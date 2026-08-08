import React, { useState } from 'react';
import { Calendar, Plus, Trash2, History, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectScheduleActivity } from '../../../domain/types';

export interface Step4ScheduleData {
  activities: ProjectScheduleActivity[];
  crmScheduleSnapshot?: any[];
  startDate: string;
  targetCompletionDate: string;
}

interface Step4ScheduleMilestonesProps {
  data: Step4ScheduleData;
  onChange: (field: keyof Step4ScheduleData, value: any) => void;
}

export const Step4ScheduleMilestones: React.FC<Step4ScheduleMilestonesProps> = ({ data, onChange }) => {
  const [showCRMSnapshot, setShowCRMSnapshot] = useState(false);

  const addActivity = () => {
    const newAct: ProjectScheduleActivity = {
      id: `act-${Date.now()}`,
      activityName: 'Site Preparation & Demolition',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.targetCompletionDate || new Date().toISOString().split('T')[0],
      responsibleEmployeeId: 'emp-1',
      responsibleEmployeeName: 'Rajesh Sharma',
      completionPercentage: 0,
      status: 'not_started',
      delayDays: 0,
    };
    onChange('activities', [...data.activities, newAct]);
  };

  const removeActivity = (index: number) => {
    const updated = [...data.activities];
    updated.splice(index, 1);
    onChange('activities', updated);
  };

  const updateActivity = (index: number, field: keyof ProjectScheduleActivity, val: any) => {
    const updated = [...data.activities];
    updated[index] = { ...updated[index], [field]: val };
    onChange('activities', updated);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#AB9570]" /> Step 4: Execution Schedule & Milestones
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configure project activities and milestones. Pre-populated from accepted CRM schedule.
          </p>
        </div>

        <button
          type="button"
          onClick={addActivity}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-lg transition-colors text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Add Activity
        </button>
      </div>

      {/* CRM Schedule Reference Toggle */}
      {data.crmScheduleSnapshot && data.crmScheduleSnapshot.length > 0 && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <button
            type="button"
            onClick={() => setShowCRMSnapshot(!showCRMSnapshot)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-900"
          >
            <span className="flex items-center gap-2">
              <History className="h-4 w-4 text-[#AB9570]" /> Original Accepted CRM Schedule Snapshot ({data.crmScheduleSnapshot.length} Activities)
            </span>
            {showCRMSnapshot ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {showCRMSnapshot && (
            <div className="mt-2 bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2 px-3">Work Section</th>
                    <th className="py-2 px-3">Activity Description</th>
                    <th className="py-2 px-3">Offset (Days)</th>
                    <th className="py-2 px-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.crmScheduleSnapshot.map((s: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 font-semibold">{s.workSection || s.section || 'General'}</td>
                      <td className="py-1.5 px-3">{s.description || s.activityName}</td>
                      <td className="py-1.5 px-3">+{s.startAfterDays || 0} days</td>
                      <td className="py-1.5 px-3">{s.duration || 7} {s.durationUnit || 'days'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Active Project Activities Table */}
      <div className="space-y-3">
        <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider">
          Active Project Schedule Breakdown ({data.activities.length} Activities)
        </label>

        {data.activities.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-500">
            No schedule activities added yet. At least one activity is required for project activation. Click "Add Activity" above.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Activity Name</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">Target Completion</th>
                  <th className="py-2.5 px-3">Responsible Lead</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-xs">
                {data.activities.map((act, idx) => (
                  <tr key={act.id || idx}>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={act.activityName}
                        onChange={(e) => updateActivity(idx, 'activityName', e.target.value)}
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={act.startDate}
                        onChange={(e) => updateActivity(idx, 'startDate', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={act.endDate}
                        onChange={(e) => updateActivity(idx, 'endDate', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={act.responsibleEmployeeName}
                        onChange={(e) => updateActivity(idx, 'responsibleEmployeeName', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeActivity(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
