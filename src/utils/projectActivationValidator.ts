import { Project } from '../domain/types';

export interface ActivationCheckResult {
  passed: boolean;
  code: string;
  label: string;
  description: string;
}

export interface ProjectActivationStatus {
  canActivate: boolean;
  checks: ActivationCheckResult[];
  missingCount: number;
}

export function validateProjectActivation(project: Partial<Project> & Record<string, any>): ProjectActivationStatus {
  const checks: ActivationCheckResult[] = [
    {
      code: 'PROJECT_NAME',
      label: 'Project Name Exists',
      description: 'A valid project title is specified',
      passed: Boolean(project.projectName && project.projectName.trim().length > 0),
    },
    {
      code: 'CLIENT_EXISTS',
      label: 'Client Assigned',
      description: 'Client details and ID are attached from Client Master',
      passed: Boolean((project.clientId && project.clientId.trim().length > 0) || (project.clientName && project.clientName.trim().length > 0)),
    },
    {
      code: 'ACCEPTED_ESTIMATE',
      label: 'Accepted CRM Estimate Exists',
      description: 'Project is linked to an accepted commercial estimate revision',
      passed: Boolean(project.sourceEstimateId || project.acceptedEstimateId || project.sourceQuotationNumber),
    },
    {
      code: 'TEAM_LOCKED',
      label: 'Project Team Locked',
      description: 'Director/Head and Supervisor/Site Engineer assigned and team locked',
      passed: Boolean(
        (project.projectDirectorId && project.projectDirectorId.trim().length > 0) &&
        (project.projectSupervisorId && project.projectSupervisorId.trim().length > 0) &&
        (project.isTeamLocked || project.projectTeamLocked || project.isTeamLocked === undefined)
      ),
    },
    {
      code: 'ACCEPTED_BOQ_LOCKED',
      label: 'Project BOQ Baseline Locked',
      description: 'Commercial BOQ line items are locked into project baseline snapshot',
      passed: Boolean(
        (project.isBOQLocked || project.projectBOQLocked) ||
        (project.lockedProjectBOQ && project.lockedProjectBOQ.lines && project.lockedProjectBOQ.lines.length > 0)
      ),
    },
    {
      code: 'START_DATE',
      label: 'Start Date Specified',
      description: 'Project execution start date is set',
      passed: Boolean(project.startDate && project.startDate.trim().length > 0),
    },
    {
      code: 'COMPLETION_DATE',
      label: 'Target Completion Date Specified',
      description: 'Project target completion date is set',
      passed: Boolean(project.targetCompletionDate && project.targetCompletionDate.trim().length > 0),
    },
    {
      code: 'SCHEDULE_ACTIVITIES',
      label: 'At Least One Schedule Activity Exists',
      description: 'Execution schedule contains work breakdown activities',
      passed: Boolean(
        (project.scheduleActivities && project.scheduleActivities.length > 0) ||
        (project.acceptedScheduleSnapshot && project.acceptedScheduleSnapshot.length > 0) ||
        (project.activities && project.activities.length > 0) ||
        (project.schedule && project.schedule.length > 0)
      ),
    },
  ];

  const missingCount = checks.filter((c) => !c.passed).length;
  const canActivate = missingCount === 0;

  return {
    canActivate,
    checks,
    missingCount,
  };
}
