/**
 * Project Activity & Audit Logs Tab Component
 * Location: src/pages/projects/workspace/ProjectActivityTab.tsx
 */

import React from 'react';
import { Project } from '../../../domain/types';
import { useERPStore } from '../../../store/ERPStoreContext';
import { getProjectActivity } from '../../../domain/selectors';
import { Activity, Shield, User } from 'lucide-react';

interface Props {
  project: Project;
}

export const ProjectActivityTab: React.FC<Props> = ({ project }) => {
  const { state } = useERPStore();
  const activities = getProjectActivity(state, project.id);

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-700" /> Audit Logs & Activity History
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Immutable audit record of all project activation, team locking, and indent workflow actions
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold block">Audit Records</span>
          <span className="font-bold text-slate-900 font-mono text-sm">{activities.length} Events</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No audit events recorded for this project yet.
          </div>
        ) : (
          <div className="relative border-l border-slate-200 ml-3 space-y-4 my-2">
            {activities.map((act) => (
              <div key={act.id} className="ml-4 relative">
                <div className="absolute -left-6 top-0.5 bg-slate-900 text-white p-1 rounded-full border border-white">
                  <Shield className="h-3 w-3" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{act.action}</span>
                    <span className="font-mono text-[10.5px] text-slate-500">
                      {new Date(act.performedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-slate-700">{act.details}</p>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="h-3 w-3" /> {act.performedBy}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">{(act as any).module || 'PROJECT_SYSTEM'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
