import * as React from 'react';
import { SiteSchema, SiteApprovalRole, ApprovalDecisionStatus } from '../types';
import { useERPStore } from '../store/ERPStoreContext';
import { Project } from '../domain/types';

// Helper to convert unified Project model to legacy SiteSchema for backward compatibility
export function projectToSiteSchema(project: Project): SiteSchema {
  const workflowStatus =
    project.boqStatus === 'approved'
      ? 'approved'
      : project.boqStatus === 'pending_approval'
      ? 'pending_approval'
      : project.boqStatus === 'rejected'
      ? 'rejected'
      : project.status === 'draft'
      ? 'draft'
      : 'approved';

  const executionStatus =
    project.status === 'active'
      ? 'active'
      : project.status === 'on_hold'
      ? 'on_hold'
      : project.status === 'completed'
      ? 'completed'
      : 'not_started';

  return {
    id: project.id,
    code: project.projectCode,
    name: project.projectName,
    category: project.category || 'General Fitout',
    client: project.clientName,
    city: project.city,
    manager: project.projectHead || project.projectDirectorName,
    startDate: project.startDate,
    targetCompletion: project.targetCompletionDate,
    budget: project.currentBOQValue || project.budgetBaseline,
    progress: project.progress || 0,
    workflowStatus,
    executionStatus,
    company: project.companyName,
    projectHead: project.projectHead || project.projectDirectorName,
    address: project.siteAddress,
    projectArea: project.projectArea,
    projectAreaUnit: project.projectAreaUnit,
    noteToApprover: project.noteToApprover,
    rejectionComment: project.rejectionComment,
    rejectedBy: project.rejectedBy,
  };
}

interface SitesContextValue {
  sites: SiteSchema[];
  selectedSiteId: string;
  selectedSite: SiteSchema | null;
  setSelectedSiteId: (siteId: string) => void;
  addSite: (site: SiteSchema) => void;
  duplicateSite: (id: string) => void;
  moveToDeleted: (id: string) => void;
  restoreSite: (id: string) => void;
  requestApproval: (id: string, approverNames: Record<SiteApprovalRole, string>, note: string) => void;
  processApproval: (id: string, role: SiteApprovalRole, status: ApprovalDecisionStatus, comment?: string) => void;
  withdrawApprovalRequest: (id: string) => void;
  returnToDraft: (id: string) => void;
}

const SitesContext = React.createContext<SitesContextValue | undefined>(undefined);

export const SitesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, addItem, updateItem } = useERPStore();
  const [selectedSiteId, setSelectedSiteId] = React.useState<string>('site-1');

  const sites = React.useMemo(() => {
    return state.projects.map(projectToSiteSchema);
  }, [state.projects]);

  const selectedSite = React.useMemo(() => {
    if (selectedSiteId === 'all') return null;
    return sites.find((s) => s.id === selectedSiteId) || sites[0] || null;
  }, [sites, selectedSiteId]);

  const addSite = (site: SiteSchema) => {
    const newProject: Project = {
      id: site.id || `proj-${Date.now()}`,
      projectCode: site.code,
      projectName: site.name,
      companyName: site.company,
      category: site.category,
      clientId: site.client,
      clientName: site.client,
      siteAddress: site.address,
      city: site.city,
      projectArea: site.projectArea,
      projectAreaUnit: site.projectAreaUnit,
      projectDirectorId: 'emp-1',
      projectDirectorName: site.manager || 'Rajesh Sharma',
      projectSupervisorId: 'emp-2',
      projectSupervisorName: 'Amit Verma',
      projectHead: site.projectHead || site.manager,
      team: [],
      isTeamLocked: false,
      isBOQLocked: false,
      boqStatus: site.workflowStatus === 'approved' ? 'approved' : 'draft',
      boqRevisions: [],
      categoryBudgets: [],
      currentBOQValue: site.budget,
      budgetBaseline: site.budget,
      approvedBudgetLimit: site.budget,
      committedCost: 0,
      actualCost: 0,
      certifiedRevenue: 0,
      clientReceipts: 0,
      startDate: site.startDate,
      targetCompletionDate: site.targetCompletion,
      progress: site.progress || 0,
      status: site.executionStatus === 'active' ? 'active' : 'draft',
      projectStatus: site.executionStatus === 'active' ? 'active' : 'draft',
      createdAt: new Date().toISOString(),
      createdBy: 'User',
      updatedAt: new Date().toISOString(),
      updatedBy: 'User',
    };
    addItem('projects', newProject);
  };

  const duplicateSite = (id: string) => {
    const target = state.projects.find((p) => p.id === id);
    if (!target) return;
    const nextCode = `PRJ-2026-${String(state.projects.length + 1).padStart(3, '0')}`;
    const duplicated: Project = {
      ...target,
      id: `proj-${Date.now()}`,
      projectCode: nextCode,
      projectName: `${target.projectName} (Duplicate)`,
      status: 'draft',
      boqStatus: 'draft',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem('projects', duplicated);
  };

  const moveToDeleted = (id: string) => {
    const target = state.projects.find((p) => p.id === id);
    if (target) {
      updateItem('projects', id, { status: 'cancelled' });
    }
  };

  const restoreSite = (id: string) => {
    const target = state.projects.find((p) => p.id === id);
    if (target) {
      updateItem('projects', id, { status: 'draft' });
    }
  };

  const withdrawApprovalRequest = (id: string) => {
    updateItem('projects', id, { boqStatus: 'draft' });
  };

  const returnToDraft = (id: string) => {
    updateItem('projects', id, { boqStatus: 'draft', status: 'draft' });
  };

  const requestApproval = (id: string, _approverNames: Record<SiteApprovalRole, string>, note: string) => {
    updateItem('projects', id, { boqStatus: 'pending_approval', noteToApprover: note });
  };

  const processApproval = (id: string, _role: SiteApprovalRole, status: ApprovalDecisionStatus, comment?: string) => {
    if (status === 'rejected') {
      updateItem('projects', id, { boqStatus: 'rejected', rejectionComment: comment });
    } else if (status === 'approved') {
      updateItem('projects', id, { boqStatus: 'approved' });
    }
  };

  return (
    <SitesContext.Provider
      value={{
        sites,
        selectedSiteId,
        selectedSite,
        setSelectedSiteId,
        addSite,
        duplicateSite,
        moveToDeleted,
        restoreSite,
        requestApproval,
        processApproval,
        withdrawApprovalRequest,
        returnToDraft,
      }}
    >
      {children}
    </SitesContext.Provider>
  );
};

export const useSites = () => {
  const context = React.useContext(SitesContext);
  if (!context) {
    throw new Error('useSites must be used within a SitesProvider');
  }
  return context;
};
