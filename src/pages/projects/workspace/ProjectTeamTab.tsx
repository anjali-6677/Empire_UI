/**
 * Project Team & Governance Tab Component
 * Location: src/pages/projects/workspace/ProjectTeamTab.tsx
 */

import React, { useState } from 'react';
import { Project } from '../../../domain/types';
import { useERPStore } from '../../../store/ERPStoreContext';
import { Lock, Unlock, Users } from 'lucide-react';
import { TEAM_LOCK_STATUS_MAP } from '../../../utils/statusStyles';

interface Props {
  project: Project;
}

export const ProjectTeamTab: React.FC<Props> = ({ project }) => {
  const { lockProjectTeam, unlockProjectTeam, state } = useERPStore();
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [reasonInput, setReasonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const teamLockConfig = TEAM_LOCK_STATUS_MAP[project.isTeamLocked ? 'locked' : 'editable'];

  // Filter audit logs for team locking
  const teamAuditLogs = state.auditEvents.filter(
    (a) => a.documentId === project.id && (a.action === 'LOCKED' || a.action === 'UNLOCKED')
  );

  const handleLockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = lockProjectTeam(project.id, reasonInput, 'Project Director');
    if (res.success) {
      setShowLockModal(false);
      setReasonInput('');
    } else {
      setErrorMsg(res.error || 'Failed to lock team.');
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = unlockProjectTeam(project.id, reasonInput, 'Project Director');
    if (res.success) {
      setShowUnlockModal(false);
      setReasonInput('');
    } else {
      setErrorMsg(res.error || 'Failed to unlock team.');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Governance & Lock Status Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">Project Governance & Team Lock</span>
            <span className={`px-2.5 py-0.5 rounded border text-[10.5px] font-bold ${teamLockConfig.badgeClass}`}>
              {teamLockConfig.label}
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            {project.isTeamLocked
              ? 'Team assignments are frozen. Team member modifications require an audit-logged unlock reason.'
              : 'Team assignments are currently open for modifications.'}
          </p>
        </div>

        <div>
          {project.isTeamLocked ? (
            <button
              onClick={() => {
                setReasonInput('');
                setErrorMsg(null);
                setShowUnlockModal(true);
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Unlock className="h-4 w-4" /> Unlock Team (Audit Required)
            </button>
          ) : (
            <button
              onClick={() => {
                setReasonInput('');
                setErrorMsg(null);
                setShowLockModal(true);
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Lock className="h-4 w-4" /> Lock Project Team
            </button>
          )}
        </div>
      </div>

      {/* Team Member Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-600" /> Assigned Team Members
          </div>
          <span className="text-slate-500">{project.team.length} Members</span>
        </div>

        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Employee Name</th>
                <th className="p-2.5">Project Role</th>
                <th className="p-2.5">Assigned Date</th>
                <th className="p-2.5 text-center">Lock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {project.team.map((member) => (
                <tr key={member.employeeId} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900">{member.employeeName}</td>
                  <td className="p-2.5">
                    <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-semibold text-[10.5px]">
                      {member.role}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-500 font-mono">{member.assignedDate}</td>
                  <td className="p-2.5 text-center">
                    {project.isTeamLocked ? (
                      <span className="text-amber-800 font-semibold text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Locked
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lock Audit Log History */}
      {teamAuditLogs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
            Team Lock & Unlock Audit History
          </div>
          <div className="space-y-2">
            {teamAuditLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-900">{log.action === 'LOCKED' ? 'Team Locked' : 'Team Unlocked'}</span>
                  <p className="text-slate-700 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-[10.5px] text-slate-500">
                  <span className="font-semibold block">{log.performedBy}</span>
                  <span className="font-mono">{new Date(log.performedAt).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lock Team Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-4 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 text-slate-800" /> Lock Project Team
              </h3>
              <button onClick={() => setShowLockModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            {errorMsg && <div className="p-2 bg-rose-50 text-rose-800 rounded font-medium">{errorMsg}</div>}
            <form onSubmit={handleLockSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Locking Team *</label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. Final team structure approved for execution stage..."
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-400"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLockModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
                >
                  Confirm Lock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unlock Team Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-4 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Unlock className="h-4 w-4 text-amber-600" /> Unlock Team (Audit Required)
              </h3>
              <button onClick={() => setShowUnlockModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            {errorMsg && <div className="p-2 bg-rose-50 text-rose-800 rounded font-medium">{errorMsg}</div>}
            <form onSubmit={handleUnlockSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Unlock Justification Reason *</label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. Mandatory replacement of Site Engineer due to project reassignment..."
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-amber-400"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 text-white rounded font-bold hover:bg-amber-700"
                >
                  Unlock Team & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
