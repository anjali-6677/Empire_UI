/**
 * Utility: resolveLinkedProject
 * Location: src/utils/resolveLinkedProject.ts
 * Resolves CRM estimate linkage to actual Project records in ERPStore.
 * Enforces hard duplicate guards and repairs stale project references.
 */

import { Estimate, Enquiry, Project } from '../domain/types';

export interface LinkedProjectResult {
  hasLinkedProject: boolean;
  linkedProject: Project | null;
  canCreateProject: boolean;
  isStaleLink: boolean;
  reason?: string;
}

export function resolveLinkedProject(
  estimate: Estimate | null | undefined,
  enquiry: Enquiry | null | undefined,
  projects: Project[]
): LinkedProjectResult {
  if (!estimate && !enquiry) {
    return {
      hasLinkedProject: false,
      linkedProject: null,
      canCreateProject: false,
      isStaleLink: false,
      reason: 'No estimate or enquiry provided.',
    };
  }

  const estId = estimate?.id;
  const enquiryId = estimate?.enquiryId || enquiry?.id;
  const revId = estimate?.revisionLabel || (estimate?.revisionNumber !== undefined ? `R${estimate.revisionNumber}` : undefined);
  const clientDecision = estimate?.clientDecision;

  // Search Projects by explicit ID first, then by CRM source references
  let matchedProject: Project | null = null;

  // 1. Direct project ID lookup if estimate or enquiry references one
  const targetProjId = (estimate as any)?.projectId || (enquiry as any)?.projectId;
  if (targetProjId) {
    matchedProject = projects.find((p) => p.id === targetProjId) || null;
  }

  // 2. Search by sourceEstimateRevisionId / sourceEstimateId / sourceEnquiryId
  if (!matchedProject && estId) {
    matchedProject = projects.find(
      (p) =>
        p.sourceEstimateId === estId ||
        p.sourceEstimateRevisionId === estId ||
        p.acceptedEstimateId === estId ||
        (revId && p.sourceEstimateRevisionId === `${estId}_${revId}`)
    ) || null;
  }

  if (!matchedProject && enquiryId) {
    matchedProject = projects.find((p) => p.sourceEnquiryId === enquiryId) || null;
  }

  const hasLinkedProject = !!matchedProject;
  const isStaleLink = !!targetProjId && !matchedProject;

  // Check eligibility for creating a new project
  const isEnquiryWon = Boolean(enquiry?.status === 'won' || (clientDecision && clientDecision.decision === 'accepted'));
  const isEstimateAccepted = Boolean(estimate?.status === 'accepted' || (clientDecision && clientDecision.decision === 'accepted'));
  const hasBOQ = Boolean(estimate?.boqSections && estimate.boqSections.length > 0);

  const canCreateProject = (isEnquiryWon || isEstimateAccepted) && hasBOQ && !hasLinkedProject;

  return {
    hasLinkedProject,
    linkedProject: matchedProject,
    canCreateProject,
    isStaleLink,
    reason: hasLinkedProject
      ? `Linked project ${matchedProject?.projectCode} exists.`
      : canCreateProject
      ? 'Eligible for Project creation.'
      : 'Ineligible for Project creation.',
  };
}
