import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User, FileText, CheckCircle2, ArrowUpRight, Calendar } from 'lucide-react';
import { Project, ProjectExecutionStatus } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';
import { ProjectRowActionsMenu } from './ProjectRowActionsMenu';

interface ProjectsTableProps {
  projects: Project[];
  onUpdateStatus?: (projectId: string, newStatus: Project['status']) => void;
  onDuplicate: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onUpdateStatus,
  onDuplicate,
  onDelete,
}) => {
  const getProjectStatusBadge = (status: ProjectExecutionStatus) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>;
      case 'planning':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Planning</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Draft Setup</span>;
      case 'on_hold':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">On Hold</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Completed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Projects Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No projects match your current search term or filter criteria. Try clearing your filters or creating a new project.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans text-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Project Code / Name</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Project Director</th>
              <th className="py-3 px-4">Start / Completion</th>
              <th className="py-3 px-4 text-center">Progress</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Commercial Baseline</th>
              <th className="py-3 px-4 text-right">Contract Value</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {projects.map((project) => {
              const acceptedVal = project.acceptedQuotationValue || project.currentBOQValue || project.budgetBaseline || 0;

              return (
                <tr key={project.id} className="hover:bg-slate-50 transition-colors group">
                  {/* Code / Name */}
                  <td className="py-3 px-4">
                    <Link
                      to={`/projects/${project.id}`}
                      className="group-hover:text-[#AB9570] transition-colors flex flex-col"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>{project.projectName}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#AB9570]" />
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{project.projectCode}</span>
                    </Link>
                  </td>

                  {/* Client */}
                  <td className="py-3 px-4 text-slate-700">
                    <div className="font-semibold text-slate-900">{project.clientName}</div>
                    {project.category && (
                      <div className="text-[10px] text-slate-400 font-medium">{project.category}</div>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <span>{project.city || project.siteAddress || 'N/A'}</span>
                    </div>
                  </td>

                  {/* Director */}
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <span>{project.projectDirectorName || 'Rajesh Sharma'}</span>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="py-3 px-4 text-slate-600 text-[11px] font-mono">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>{project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'TBD'}</span>
                    </div>
                    {project.targetCompletionDate && (
                      <div className="text-[10px] text-slate-400 pl-4">
                        Target: {new Date(project.targetCompletionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    )}
                  </td>

                  {/* Progress Bar */}
                  <td className="py-3 px-4 text-center">
                    <div className="w-20 mx-auto space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700">
                        <span>{project.progress || 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#AB9570] rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, project.progress || 0))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Project Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getProjectStatusBadge(project.status)}
                  </td>

                  {/* Commercial Baseline Tag */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#AB9570]/10 text-[#AB9570] border border-[#AB9570]/30">
                      <CheckCircle2 className="h-3 w-3 text-[#AB9570]" /> Accepted Baseline Imported
                    </span>
                  </td>

                  {/* Contract Budget */}
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                    {formatIndianCurrency(acceptedVal)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/projects/${project.id}`}
                        className={
                          project.status === 'draft'
                            ? "px-3 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-[#121214] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                            : "px-3 py-1.5 bg-white hover:bg-[#F8F9FB] border border-[#D8DEE8] hover:border-[#AB9570] text-[#1F2937] font-semibold text-xs rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                        }
                      >
                        {project.status === 'draft' ? (
                          'Continue Setup'
                        ) : (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 text-[#AB9570]" /> Open Project
                          </>
                        )}
                      </Link>
                      <ProjectRowActionsMenu
                        project={project}
                        onUpdateStatus={onUpdateStatus}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
