import * as React from 'react';
import { SiteSchema, SiteApprovalRole, ApprovalDecisionStatus } from '../types';
import { mockSites } from '../data/mockData';

interface SitesContextValue {
  sites: SiteSchema[];
  selectedSiteId: string;
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
  const [sites, setSites] = React.useState<SiteSchema[]>(() => {
    return [...mockSites];
  });
  const [selectedSiteId, setSelectedSiteId] = React.useState<string>('site-1');

  const addSite = (site: SiteSchema) => {
    setSites((prev) => [site, ...prev]);
  };

  const duplicateSite = (id: string) => {
    setSites((prev) => {
      const match = prev.find((s) => s.id === id);
      if (!match) return prev;

      // Generate unique site code based on the highest numeric suffix in SITE-2026-XXX format
      const maxCodeNumber = prev.reduce((max, s) => {
        const parts = s.code.split('-');
        if (parts.length === 3 && parts[0] === 'SITE' && parts[1] === '2026') {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num)) return num > max ? num : max;
        }
        return max;
      }, 0);
      const nextCode = `SITE-2026-${String(maxCodeNumber + 1).padStart(3, '0')}`;

      const duplicated: SiteSchema = {
        ...match,
        id: `site-${Date.now()}`,
        code: nextCode,
        name: match.name.endsWith('(Duplicate)') ? match.name : `${match.name} (Duplicate)`,
        workflowStatus: 'draft',
        executionStatus: 'not_started',
        progress: 0,
        approvalWorkflow: undefined,
        submissionDate: undefined,
        approvalRequestDate: undefined,
        rejectionComment: undefined,
        rejectedBy: undefined,
        rejectionDate: undefined,
        deletedDate: undefined,
        previousWorkflowStatus: undefined,
        processStartDate: new Date().toISOString().split('T')[0]
      };

      return [duplicated, ...prev];
    });
  };

  const moveToDeleted = (id: string) => {
    setSites((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              previousWorkflowStatus: s.workflowStatus,
              workflowStatus: 'deleted' as const,
              deletedDate: new Date().toISOString().split('T')[0],
            }
          : s
      )
    );
  };

  const restoreSite = (id: string) => {
    setSites((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              workflowStatus: s.previousWorkflowStatus || 'draft',
              deletedDate: undefined,
              previousWorkflowStatus: undefined,
            }
          : s
      )
    );
  };

  const withdrawApprovalRequest = (id: string) => {
    setSites((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              workflowStatus: (s.previousWorkflowStatus === 'tender' ? 'tender' : 'draft') as any,
              approvalWorkflow: undefined,
              noteToApprover: undefined,
              approvalRequestDate: undefined,
            }
          : s
      )
    );
  };

  const returnToDraft = (id: string) => {
    setSites((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              previousWorkflowStatus: s.workflowStatus,
              workflowStatus: 'draft' as const,
            }
          : s
      )
    );
  };

  const requestApproval = (id: string, approverNames: Record<SiteApprovalRole, string>, note: string) => {
    setSites((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              workflowStatus: 'pending_approval' as const,
              approvalRequestDate: new Date().toISOString().split('T')[0],
              noteToApprover: note,
              approvalWorkflow: {
                accountingHead: { approverName: approverNames.accountingHead, status: 'pending' },
                chairman: { approverName: approverNames.chairman, status: 'pending' },
                projectHead: { approverName: approverNames.projectHead, status: 'pending' },
                engineeringHead: { approverName: approverNames.engineeringHead, status: 'pending' },
              },
            }
          : s
      )
    );
  };

  const processApproval = (id: string, role: SiteApprovalRole, status: ApprovalDecisionStatus, comment?: string) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        const actionDate = new Date().toISOString().split('T')[0];

        const currentWorkflow = s.approvalWorkflow || {
          accountingHead: { approverName: 'Accounting Head', status: 'pending' },
          chairman: { approverName: 'Chairman', status: 'pending' },
          projectHead: { approverName: 'Project Head', status: 'pending' },
          engineeringHead: { approverName: 'Engineering Head', status: 'pending' },
        };

        const updatedWorkflow = {
          ...currentWorkflow,
          [role]: {
            ...currentWorkflow[role],
            status,
            actionDate,
            comment,
          },
        };

        let workflowStatus = s.workflowStatus;
        let rejectedBy = s.rejectedBy;
        let rejectionComment = s.rejectionComment;
        let rejectionDate = s.rejectionDate;
        let approvedValue = s.approvedValue;

        if (status === 'rejected') {
          workflowStatus = 'rejected';
          rejectedBy = currentWorkflow[role].approverName || role;
          rejectionComment = comment || 'Rejected';
          rejectionDate = actionDate;
        } else {
          const allApproved =
            updatedWorkflow.accountingHead.status === 'approved' &&
            updatedWorkflow.chairman.status === 'approved' &&
            updatedWorkflow.projectHead.status === 'approved' &&
            updatedWorkflow.engineeringHead.status === 'approved';

          if (allApproved) {
            workflowStatus = 'approved';
            approvedValue = s.budget;
          }
        }

        return {
          ...s,
          workflowStatus,
          approvalWorkflow: updatedWorkflow,
          rejectedBy,
          rejectionComment,
          rejectionDate,
          approvedValue,
        };
      })
    );
  };

  return (
    <SitesContext.Provider
      value={{
        sites,
        selectedSiteId,
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
