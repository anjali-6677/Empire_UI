import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Edit3, Users, Calendar, PlayCircle, PauseCircle, CheckCircle2, MapPin, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../../../domain/types';

interface ProjectRowActionsMenuProps {
  project: Project;
  onUpdateStatus?: (projectId: string, newStatus: Project['status']) => void;
  onDuplicate: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectRowActionsMenu: React.FC<ProjectRowActionsMenuProps> = ({
  project,
  onUpdateStatus,
  onDuplicate,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = (status: Project['status']) => {
    setIsOpen(false);
    if (onUpdateStatus) {
      onUpdateStatus(project.id, status);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        title="Project Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-xs font-sans">
          {/* Main Primary Action based on Status */}
          <Link
            to={`/projects/${project.id}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-slate-900 hover:bg-slate-50 font-bold border-b border-slate-100"
          >
            <Eye className="h-3.5 w-3.5 text-[#AB9570]" />
            <span>{project.status === 'draft' ? 'Continue Setup' : 'Open Workspace'}</span>
          </Link>

          {/* Draft Status Actions */}
          {project.status === 'draft' && (
            <>
              <Link
                to={`/projects/${project.id}?tab=team`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <span>Assign Team</span>
              </Link>
              <button
                onClick={() => handleStatusChange('planning')}
                className="w-full flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 font-semibold"
              >
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                <span>Move to Planning</span>
              </button>
            </>
          )}

          {/* Planning Status Actions */}
          {project.status === 'planning' && (
            <>
              <Link
                to={`/projects/${project.id}?tab=team`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <span>Assign Team</span>
              </Link>
              <Link
                to={`/projects/${project.id}?tab=schedule`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>Open Schedule</span>
              </Link>
              <button
                onClick={() => handleStatusChange('active')}
                className="w-full flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 font-bold"
              >
                <PlayCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>Activate Project</span>
              </button>
            </>
          )}

          {/* Active Status Actions */}
          {project.status === 'active' && (
            <>
              <Link
                to="/projects/map"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <MapPin className="h-3.5 w-3.5 text-[#AB9570]" />
                <span>Open Project Map</span>
              </Link>
              <button
                onClick={() => handleStatusChange('on_hold')}
                className="w-full flex items-center gap-2 px-3 py-2 text-amber-600 hover:bg-amber-50 font-medium"
              >
                <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
                <span>Put On Hold</span>
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className="w-full flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 font-bold"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                <span>Mark Completed</span>
              </button>
            </>
          )}

          {/* On Hold Actions */}
          {project.status === 'on_hold' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="w-full flex items-center gap-2 px-3 py-2 text-emerald-600 hover:bg-emerald-50 font-bold"
            >
              <PlayCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span>Resume Project</span>
            </button>
          )}

          {/* Shared Secondary Actions */}
          <div className="my-1 border-t border-slate-100" />
          <Link
            to={`/projects/${project.id}?tab=details`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Edit3 className="h-3.5 w-3.5 text-slate-500" />
            <span>Project Details</span>
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              onDuplicate(project.id);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Copy className="h-3.5 w-3.5 text-slate-500" />
            <span>Duplicate Project</span>
          </button>

          {project.status !== 'completed' && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>Cancel Project</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              onDelete(project.id);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            <span>Delete Record</span>
          </button>
        </div>
      )}
    </div>
  );
};
