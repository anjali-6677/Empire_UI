import React from 'react';
import { Users, UserPlus, Trash2, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Employee, ProjectTeamAssignment } from '../../../domain/types';

export interface Step2Data {
  projectDirectorId: string;
  projectDirectorName: string;
  projectManagerId?: string;
  projectManagerName?: string;
  projectSupervisorId: string;
  projectSupervisorName: string;
  projectHead: string;
  team: ProjectTeamAssignment[];
  isTeamLocked?: boolean;
}

interface Step2ProjectTeamProps {
  data: Step2Data;
  onChange: (field: keyof Step2Data, value: any) => void;
  onLockTeam?: () => void;
  employees: Employee[];
}

export const Step2ProjectTeam: React.FC<Step2ProjectTeamProps> = ({ data, onChange, onLockTeam, employees }) => {
  const isLocked = Boolean(data.isTeamLocked);

  const handleDirectorSelect = (empId: string) => {
    if (isLocked) return;
    onChange('projectDirectorId', empId);
    const emp = employees.find((e) => e.id === empId);
    onChange('projectDirectorName', emp ? emp.name : '');
    if (emp && !data.projectHead) {
      onChange('projectHead', emp.name);
    }
  };

  const handleManagerSelect = (empId: string) => {
    if (isLocked) return;
    onChange('projectManagerId', empId);
    const emp = employees.find((e) => e.id === empId);
    onChange('projectManagerName', emp ? emp.name : '');
  };

  const handleSupervisorSelect = (empId: string) => {
    if (isLocked) return;
    onChange('projectSupervisorId', empId);
    const emp = employees.find((e) => e.id === empId);
    onChange('projectSupervisorName', emp ? emp.name : '');
  };

  const addTeamMember = () => {
    if (isLocked || employees.length === 0) return;
    const defaultEmp = employees[0];
    const newAssignment: ProjectTeamAssignment = {
      employeeId: defaultEmp.id,
      employeeName: defaultEmp.name,
      role: 'Site Engineer',
      assignedDate: new Date().toISOString().split('T')[0],
    };
    onChange('team', [...data.team, newAssignment]);
  };

  const removeTeamMember = (index: number) => {
    if (isLocked) return;
    const updated = [...data.team];
    updated.splice(index, 1);
    onChange('team', updated);
  };

  const updateTeamMember = (index: number, field: keyof ProjectTeamAssignment, val: string) => {
    if (isLocked) return;
    const updated = [...data.team];
    if (field === 'employeeId') {
      const emp = employees.find((e) => e.id === val);
      updated[index] = {
        ...updated[index],
        employeeId: val,
        employeeName: emp ? emp.name : 'Unknown',
      };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    onChange('team', updated);
  };

  const handleLockClick = () => {
    onChange('isTeamLocked', true);
    if (onLockTeam) onLockTeam();
  };

  const getEmployeeLabel = (emp: Employee) => {
    const roleOrDesig = emp.roleId || emp.designationId || 'Employee';
    const cleanRole = roleOrDesig.replace(/^ROLE-|^desig-|^role-/i, '').replace(/_/g, ' ');
    const formattedRole = cleanRole.charAt(0).toUpperCase() + cleanRole.slice(1);
    return `${emp.name} · ${formattedRole}`;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E2E6EC] shadow-xs space-y-6 text-xs font-sans">
      <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AB9570] flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Project Team Setup
          </div>
          <h2 className="text-base font-extrabold text-[#121214] tracking-tight mt-0.5">
            Project Team Baseline
          </h2>
          <p className="text-xs text-slate-500">
            Assign key leadership roles from Employee Master and lock the project team baseline.
          </p>
        </div>

        {isLocked ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs bg-emerald-50 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Team Status: Locked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs bg-amber-50 text-amber-800 border border-amber-300">
            <Lock className="h-4 w-4 text-amber-600" /> Team Pending Lock
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Project Director / Head */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">
            Project Director / Head <span className="text-rose-600">*</span>
          </label>
          <select
            disabled={isLocked}
            value={data.projectDirectorId || ''}
            onChange={(e) => handleDirectorSelect(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#AB9570] disabled:opacity-75"
          >
            <option value="">-- Select Project Director --</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {getEmployeeLabel(e)}
              </option>
            ))}
          </select>
        </div>

        {/* Project Manager (Optional) */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">
            Project Manager <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <select
            disabled={isLocked}
            value={data.projectManagerId || ''}
            onChange={(e) => handleManagerSelect(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#AB9570] disabled:opacity-75"
          >
            <option value="">-- Select Project Manager --</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {getEmployeeLabel(e)}
              </option>
            ))}
          </select>
        </div>

        {/* Project Supervisor / Site Engineer */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">
            Supervisor / Site Engineer <span className="text-rose-600">*</span>
          </label>
          <select
            disabled={isLocked}
            value={data.projectSupervisorId || ''}
            onChange={(e) => handleSupervisorSelect(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#AB9570] disabled:opacity-75"
          >
            <option value="">-- Select Site Engineer --</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {getEmployeeLabel(e)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Extended Team Roster Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Project Team Members & Roles ({data.team.length} Members)
          </label>
          {!isLocked && (
            <button
              type="button"
              onClick={addTeamMember}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
            >
              <UserPlus className="h-3.5 w-3.5 text-[#AB9570]" /> Add Team Member
            </button>
          )}
        </div>

        {data.team.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
            Primary Director & Site Engineer assigned. Click "Add Team Member" for additional site assignments.
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-600">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Project Role</th>
                  <th className="py-2.5 px-3">Assigned Date</th>
                  {!isLocked && <th className="py-2.5 px-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.team.map((member, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3">
                      <select
                        disabled={isLocked}
                        value={member.employeeId}
                        onChange={(e) => updateTeamMember(idx, 'employeeId', e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 disabled:opacity-75"
                      >
                        {employees.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        disabled={isLocked}
                        value={member.role}
                        onChange={(e) => updateTeamMember(idx, 'role', e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 disabled:opacity-75"
                      >
                        <option value="Project Director">Project Director</option>
                        <option value="Project Supervisor">Project Supervisor</option>
                        <option value="Estimator">Estimator</option>
                        <option value="Procurement Lead">Procurement Lead</option>
                        <option value="Billing Engineer">Billing Engineer</option>
                        <option value="Site Engineer">Site Engineer</option>
                        <option value="Quality Manager">Quality Manager</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        disabled={isLocked}
                        value={member.assignedDate}
                        onChange={(e) => updateTeamMember(idx, 'assignedDate', e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono disabled:opacity-75"
                      />
                    </td>
                    {!isLocked && (
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeTeamMember(idx)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div>
          {isLocked && (
            <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Project Team Locked & Assignments Preserved
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={isLocked}
          onClick={handleLockClick}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all ${
            isLocked
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 shadow-md cursor-pointer'
          }`}
        >
          <Lock className="h-4 w-4 stroke-[2.5]" />
          {isLocked ? 'Project Team Locked' : 'Lock Project Team'}
        </button>
      </div>
    </div>
  );
};

