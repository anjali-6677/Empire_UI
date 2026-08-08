import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { getProjectById } from '../../domain/selectors';
import {
  Briefcase,
  Layers,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Lock,
  Building,
  MapPin,
  Clock,
  ArrowLeft,
  FileText,
  ClipboardList,
  HardHat,
  Folder,
} from 'lucide-react';

import { ProjectOverviewTab } from './workspace/ProjectOverviewTab';
import { ProjectDetailsTab } from './workspace/ProjectDetailsTab';
import { ProjectTeamTab } from './workspace/ProjectTeamTab';
import { AcceptedProjectBOQTab } from './workspace/AcceptedProjectBOQTab';
import { ProjectScheduleTab } from './workspace/ProjectScheduleTab';
import { ProjectProcurementTab } from './workspace/ProjectProcurementTab';
import { ProjectExecutionTab } from './workspace/ProjectExecutionTab';
import { ProjectBillingTab } from './workspace/ProjectBillingTab';
import { ProjectDocumentsTab } from './workspace/ProjectDocumentsTab';
import { ProjectActivityTab } from './workspace/ProjectActivityTab';

import { formatIndianCurrency } from '../../utils/format';
import { PROJECT_STATUS_MAP, TEAM_LOCK_STATUS_MAP } from '../../utils/statusStyles';

export type WorkspaceTabKey =
  | 'overview'
  | 'details'
  | 'team'
  | 'boq'
  | 'schedule'
  | 'procurement'
  | 'execution'
  | 'billing'
  | 'documents'
  | 'activity';

export const ProjectWorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useERPStore();

  const targetProjectId = projectId || 'PRJ-2026-001';
  const project = getProjectById(state, targetProjectId) || state.projects[0];
  const boq = state.projectBOQs?.find((b) => b.projectId === project?.id);

  const activeTab = (searchParams.get('tab') as WorkspaceTabKey) || 'overview';

  const handleTabChange = (tabKey: WorkspaceTabKey) => {
    setSearchParams({ tab: tabKey });
  };

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Project not found.{' '}
        <Link to="/projects" className="text-slate-900 underline">
          Return to Projects Directory
        </Link>
      </div>
    );
  }

  const projectStatusKey = (project.status && PROJECT_STATUS_MAP[project.status as keyof typeof PROJECT_STATUS_MAP]) ? (project.status as keyof typeof PROJECT_STATUS_MAP) : 'active';
  const projectStatusConfig = PROJECT_STATUS_MAP[projectStatusKey] || PROJECT_STATUS_MAP['active'];
  const teamLockConfig = TEAM_LOCK_STATUS_MAP[project.isTeamLocked ? 'locked' : 'editable'];
  const totalBOQValue = project.budgetBaseline || (boq ? boq.totalBOQValue : 0);

  const tabItems: { key: WorkspaceTabKey; label: string; icon: any }[] = [
    { key: 'overview', label: '1. Overview & Commercial', icon: Briefcase },
    { key: 'details', label: '2. Basic Details & Setup', icon: FileText },
    { key: 'team', label: `3. Team Lock (${project.team?.length || 0})`, icon: Users },
    { key: 'boq', label: '4. Accepted BOQ (Baseline)', icon: Layers },
    { key: 'schedule', label: '5. Schedule & Milestones', icon: Calendar },
    { key: 'procurement', label: '6. Procurement & Indents', icon: ClipboardList },
    { key: 'execution', label: '7. Execution & Site Progress', icon: HardHat },
    { key: 'billing', label: '8. Billing & Receipts', icon: DollarSign },
    { key: 'documents', label: '9. Documents', icon: Folder },
    { key: 'activity', label: '10. Audit & Activity', icon: Activity },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans text-xs space-y-6 bg-slate-50 min-h-screen">
      {/* Top Navigation & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <Link to="/projects" className="hover:text-slate-800 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Projects Directory
          </Link>
          <span>/</span>
          <span className="font-mono text-slate-900 font-bold">{project.projectCode}</span>
          <span>/</span>
          <span className="text-[#AB9570] font-bold capitalize">{activeTab}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/procurement/indents/new?projectId=${project.id}`}
            className="px-3.5 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 rounded-xl font-black transition shadow-xs text-xs flex items-center gap-1.5"
          >
            + Create Material Indent
          </Link>
        </div>
      </div>

      {/* Light Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono font-bold text-[#AB9570] text-xs">{project.projectCode}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${projectStatusConfig.badgeClass}`}>
                {projectStatusConfig.label}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${teamLockConfig.badgeClass}`}>
                {teamLockConfig.label}
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="h-3 w-3" /> Locked Commercial Baseline
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{project.projectName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-xs mt-1 font-medium">
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-400" /> {project.clientName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {project.city || project.siteAddress || 'Site Location TBD'}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> {project.startDate || 'TBD'} to {project.targetCompletionDate || 'TBD'}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-900 text-white p-3.5 rounded-xl shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Internal Cost Budget</span>
            <span className="text-lg font-mono font-black text-emerald-400">
              {formatIndianCurrency(totalBOQValue)}
            </span>
          </div>
        </div>

        {/* Key Metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Project Director</span>
            <span className="font-bold text-slate-800">{project.projectDirectorName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Site Supervisor</span>
            <span className="font-bold text-slate-800">{project.projectSupervisorName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Committed PO Cost</span>
            <span className="font-mono font-bold text-blue-700">
              {formatIndianCurrency(project.committedCost || 0)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Actual Direct Cost</span>
            <span className="font-mono font-bold text-emerald-700">
              {formatIndianCurrency(project.actualCost || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* 10 Horizontal Workspace Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleTabChange(item.key)}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#AB9570]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-1">
        {activeTab === 'overview' && <ProjectOverviewTab project={project} boq={boq} />}
        {activeTab === 'details' && <ProjectDetailsTab project={project} />}
        {activeTab === 'team' && <ProjectTeamTab project={project} />}
        {activeTab === 'boq' && <AcceptedProjectBOQTab project={project} />}
        {activeTab === 'schedule' && <ProjectScheduleTab project={project} />}
        {activeTab === 'procurement' && <ProjectProcurementTab project={project} />}
        {activeTab === 'execution' && <ProjectExecutionTab project={project} />}
        {activeTab === 'billing' && <ProjectBillingTab project={project} />}
        {activeTab === 'documents' && <ProjectDocumentsTab project={project} />}
        {activeTab === 'activity' && <ProjectActivityTab project={project} />}
      </div>
    </div>
  );
};
