import React from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { ScheduleItem } from '../../domain/types';

interface ScheduleEditorProps {
  schedule: ScheduleItem[];
  onChange: (schedule: ScheduleItem[]) => void;
  readOnly?: boolean;
}

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ schedule, onChange, readOnly = false }) => {
  const handleAddItem = () => {
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      workSection: 'Interior Fitout',
      description: 'Site mobilization and material delivery',
      startAfterDays: 0,
      duration: 7,
      durationUnit: 'days',
      expectedStart: new Date().toISOString().split('T')[0],
      expectedCompletion: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    };
    onChange([...schedule, newItem]);
  };

  const handleUpdateItem = (idx: number, updated: ScheduleItem) => {
    const newSch = [...schedule];
    newSch[idx] = updated;
    onChange(newSch);
  };

  const handleDeleteItem = (idx: number) => {
    onChange(schedule.filter((_, i) => i !== idx));
  };

  const totalDurationDays = schedule.reduce((acc, item) => {
    const d = item.durationUnit === 'weeks' ? item.duration * 7 : item.duration;
    return acc + d;
  }, 0);

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Step 4: Execution Work Schedule</div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-400" /> Proposed Project Timeline & Milestone Phasing
          </h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400">Estimated Total Duration</div>
          <div className="text-base font-mono font-extrabold text-amber-400">
            {totalDurationDays} Days (~{Math.ceil(totalDurationDays / 7)} Weeks)
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900">Work Package Timelines</h4>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
            >
              <Plus className="h-3.5 w-3.5" /> Add Timeline Milestone
            </button>
          )}
        </div>

        <div className="space-y-2">
          {schedule.map((item, idx) => (
            <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500">Work Section</label>
                <input
                  type="text"
                  value={item.workSection}
                  disabled={readOnly}
                  onChange={(e) => handleUpdateItem(idx, { ...item, workSection: e.target.value })}
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-900"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500">Description</label>
                <input
                  type="text"
                  value={item.description}
                  disabled={readOnly}
                  onChange={(e) => handleUpdateItem(idx, { ...item, description: e.target.value })}
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500">Duration</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={item.duration}
                    disabled={readOnly}
                    onChange={(e) => handleUpdateItem(idx, { ...item, duration: parseInt(e.target.value) || 1 })}
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-900"
                  />
                  <select
                    value={item.durationUnit}
                    disabled={readOnly}
                    onChange={(e) => handleUpdateItem(idx, { ...item, durationUnit: e.target.value as any })}
                    className="px-1.5 py-1 bg-white border border-slate-200 rounded text-slate-700 font-semibold"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500">Start After</label>
                <input
                  type="number"
                  value={item.startAfterDays}
                  disabled={readOnly}
                  onChange={(e) => handleUpdateItem(idx, { ...item, startAfterDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono text-slate-900"
                />
              </div>

              {!readOnly && (
                <div className="sm:col-span-1 text-right">
                  <button type="button" onClick={() => handleDeleteItem(idx)} className="p-1.5 text-slate-400 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
