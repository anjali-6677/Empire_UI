/**
 * Project Milestones & Billing Stage Tab
 * Location: src/pages/projects/workspace/ProjectMilestonesTab.tsx
 */

import React from 'react';
import { Project } from '../../../domain/types';
import { useERPStore } from '../../../store/ERPStoreContext';
import { getProjectMilestones } from '../../../domain/selectors';
import { Layers } from 'lucide-react';
import { formatIndianCurrency } from '../../../utils/format';

interface Props {
  project: Project;
}

export const ProjectMilestonesTab: React.FC<Props> = ({ project }) => {
  const { state } = useERPStore();
  const milestones = getProjectMilestones(state, project.id);

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-700" /> Billing Milestones & Payment Stages
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Contractual billing stages tied to site completion verification
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold block">Certified Revenue</span>
          <span className="font-bold text-emerald-800 font-mono text-sm">
            {formatIndianCurrency(project.certifiedRevenue || 0)}
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-2.5">Milestone Name</th>
              <th className="p-2.5 text-right">% Revenue</th>
              <th className="p-2.5 text-right">Milestone Amount</th>
              <th className="p-2.5">Target Date</th>
              <th className="p-2.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {milestones.map((ms) => (
              <tr key={ms.id} className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-900">{ms.milestoneName}</td>
                <td className="p-2.5 text-right font-mono font-semibold">{ms.billingPercentage}%</td>
                <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                  ₹{(ms.amount || 0).toLocaleString('en-IN')}
                </td>
                <td className="p-2.5 font-mono text-slate-600">{ms.targetDate}</td>
                <td className="p-2.5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ms.status === 'completed' || ms.status === 'certified'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {ms.status.toUpperCase()}
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
