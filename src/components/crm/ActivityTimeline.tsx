import React from 'react';
import { Activity, Clock, User, FileText, Send, RotateCcw, XCircle, Award } from 'lucide-react';
import { CRMActivity } from '../../domain/types';

interface ActivityTimelineProps {
  activities: CRMActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
        No audit activity logged yet.
      </div>
    );
  }

  const getIcon = (action: string) => {
    if (action.includes('CREATED')) return <FileText className="h-3.5 w-3.5 text-blue-600" />;
    if (action.includes('SENT')) return <Send className="h-3.5 w-3.5 text-sky-600" />;
    if (action.includes('REVISION')) return <RotateCcw className="h-3.5 w-3.5 text-amber-600" />;
    if (action.includes('WON') || action.includes('ACCEPTED')) return <Award className="h-3.5 w-3.5 text-emerald-600" />;
    if (action.includes('LOST') || action.includes('REJECTED')) return <XCircle className="h-3.5 w-3.5 text-rose-600" />;
    return <Activity className="h-3.5 w-3.5 text-slate-500" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4 text-xs">
      <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
        <Clock className="h-4 w-4 text-amber-500" /> Activity Log & Audit History ({activities.length} Events)
      </h3>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-xs">
              {getIcon(act.action)}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{act.action}</span>
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  {new Date(act.timestamp).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-400" /> {act.user}
                </span>
                {act.oldStatus && act.newStatus && (
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-700">
                    {act.oldStatus} → {act.newStatus}
                  </span>
                )}
              </div>
              {act.comment && <p className="text-[11px] text-slate-700 italic pt-0.5">{act.comment}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
