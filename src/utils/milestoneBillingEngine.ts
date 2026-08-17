import {
  Project,
  ProjectBillingMilestone,
  ClientRABill,
  BillingMilestoneTriggerType,
} from '../domain/types';

export interface BillingEvaluationTriggerEvent {
  eventType:
    | 'CONTRACT_EXECUTED'
    | 'PROJECT_ACTIVATED'
    | 'STAGE_COMPLETED'
    | 'TRADE_PROGRESS_UPDATED'
    | 'OVERALL_PROGRESS_UPDATED'
    | 'MILESTONE_COMPLETED'
    | 'HANDOVER_SIGNED'
    | 'MANUAL_TRIGGER';
  stageName?: string;
  tradeName?: string;
  currentProgress?: number;
  performedBy?: string;
  notes?: string;
  milestoneId?: string;
}

export interface BillingEvaluationResult {
  triggeredMilestones: ProjectBillingMilestone[];
  createdRABills: ClientRABill[];
  updatedProject: Project;
  notifications: Array<{
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning';
    link?: string;
  }>;
}

/**
 * Checks whether a given project billing milestone condition is satisfied by an execution event.
 */
export function isMilestoneTriggeredByEvent(
  milestone: ProjectBillingMilestone,
  event: BillingEvaluationTriggerEvent,
  project: Project
): boolean {
  if (event.eventType === 'MANUAL_TRIGGER') {
    return event.milestoneId === milestone.id;
  }

  const trig: BillingMilestoneTriggerType = milestone.triggerType;

  // 1. Contract execution / Project activation trigger
  if (trig === 'CONTRACT_EXECUTED') {
    return event.eventType === 'CONTRACT_EXECUTED' || event.eventType === 'PROJECT_ACTIVATED';
  }

  // 2. Material delivery trigger
  if (trig === 'MATERIAL_DELIVERY_COMPLETED') {
    if (event.eventType === 'STAGE_COMPLETED') {
      const sName = (event.stageName || '').toLowerCase();
      const mDesc = (milestone.triggerDescription || milestone.name || '').toLowerCase();
      return sName.includes('material') || sName.includes('delivery') || mDesc.includes(sName);
    }
    if (event.eventType === 'PROJECT_ACTIVATED') {
      const hasDeliveryStageCompleted = (project.scheduleActivities || []).some(
        (a) => (a.activityName || '').toLowerCase().includes('material') && (a.status === 'completed' || a.completionPercentage >= 100)
      );
      return hasDeliveryStageCompleted;
    }
    return false;
  }

  // 3. Handover signed trigger
  if (trig === 'HANDOVER_SIGNED') {
    if (event.eventType === 'HANDOVER_SIGNED') return true;
    if (event.eventType === 'STAGE_COMPLETED') {
      const sName = (event.stageName || '').toLowerCase();
      return sName.includes('handover') || sName.includes('final completion') || sName.includes('signoff');
    }
    return false;
  }

  // 4. Trade progress threshold (e.g. 70% Carpentry)
  if (trig === 'TRADE_PROGRESS_THRESHOLD') {
    const requiredThreshold = milestone.progressThreshold || 70;
    const requiredTrade = (milestone.tradeName || '').toLowerCase();

    const eventTrade = (event.tradeName || '').toLowerCase();
    const eventStage = (event.stageName || '').toLowerCase();

    const isTradeMatch =
      !requiredTrade ||
      eventTrade.includes(requiredTrade) ||
      requiredTrade.includes(eventTrade) ||
      eventStage.includes(requiredTrade);

    if (isTradeMatch) {
      const progress = event.currentProgress !== undefined ? event.currentProgress : project.progress || 0;
      return progress >= requiredThreshold;
    }
    return false;
  }

  // 5. Overall progress threshold
  if (trig === 'OVERALL_PROGRESS_THRESHOLD') {
    const requiredThreshold = milestone.progressThreshold || 50;
    const progress = event.currentProgress !== undefined ? event.currentProgress : project.progress || 0;
    return progress >= requiredThreshold;
  }

  // 6. Project stage completed
  if (trig === 'PROJECT_STAGE_COMPLETED') {
    if (event.eventType === 'STAGE_COMPLETED' || event.eventType === 'MILESTONE_COMPLETED') {
      const sName = (event.stageName || '').toLowerCase();
      const mDesc = (milestone.triggerDescription || milestone.name || '').toLowerCase();
      return Boolean(sName && (mDesc.includes(sName) || sName.includes(mDesc)));
    }
    return false;
  }

  return false;
}

/**
 * Main Billing Trigger Detection Engine:
 * Evaluates untriggered billing milestones against an execution event, creates Client RA Bills (Pending Approval),
 * updates milestone billing statuses, and guards strictly against duplicate bill generation.
 */
export function evaluateBillingMilestones({
  project,
  event,
  existingRABills = [],
  performedBy = 'System Billing Engine',
}: {
  project: Project;
  event: BillingEvaluationTriggerEvent;
  existingRABills?: ClientRABill[];
  performedBy?: string;
}): BillingEvaluationResult {
  const milestones: ProjectBillingMilestone[] = project.billingMilestones || [];
  if (milestones.length === 0) {
    return { triggeredMilestones: [], createdRABills: [], updatedProject: project, notifications: [] };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();

  const triggeredMilestones: ProjectBillingMilestone[] = [];
  const createdRABills: ClientRABill[] = [];
  const notifications: BillingEvaluationResult['notifications'] = [];

  const sortedMilestones = [...milestones].sort((a, b) => a.sequence - b.sequence);
  const updatedMilestones = [...sortedMilestones];

  sortedMilestones.forEach((milestone, idx) => {
    // 1. STRICT DUPLICATE PREVENTION:
    // Skip if milestone already has raBillId or billingStatus is not NOT_TRIGGERED
    if (milestone.raBillId || (milestone.billingStatus !== 'NOT_TRIGGERED' && event.eventType !== 'MANUAL_TRIGGER')) {
      return;
    }

    // Check store duplicate matching by milestone id or name for this project
    const duplicateBillExists = existingRABills.some(
      (b) =>
        b.projectId === project.id &&
        (b.milestoneId === milestone.id || b.billingMilestoneId === milestone.id || b.milestoneName === milestone.name) &&
        b.billStatus !== 'Cancelled' &&
        b.billStatus !== 'Rejected'
    );

    if (duplicateBillExists) {
      const matchingBill = existingRABills.find(
        (b) =>
          b.projectId === project.id &&
          (b.milestoneId === milestone.id || b.billingMilestoneId === milestone.id || b.milestoneName === milestone.name)
      );
      if (matchingBill) {
        updatedMilestones[idx] = {
          ...milestone,
          raBillId: matchingBill.id,
          raBillNumber: matchingBill.billNumber,
          billingStatus:
            matchingBill.billStatus === 'Pending Approval'
              ? 'RA_PENDING_APPROVAL'
              : matchingBill.billStatus === 'Approved'
              ? 'RA_APPROVED'
              : matchingBill.billStatus === 'Sent to Client'
              ? 'SENT_TO_CLIENT'
              : 'RA_PENDING_APPROVAL',
        };
      }
      return;
    }

    // 2. TRIGGER CONDITION EVALUATION
    const isTriggered = isMilestoneTriggeredByEvent(milestone, event, project);
    if (isTriggered) {
      const nextBillSeq = existingRABills.length + createdRABills.length + 1;
      const billNumber = `RA/2026/${String(nextBillSeq).padStart(3, '0')}`;
      const billId = `rabill-${Date.now()}-${idx + 1}`;

      const gross = milestone.amount || Math.round((project.acceptedQuotationValue || 0) * (milestone.percentage / 100));
      const retention = Math.round(gross * 0.05); // 5% standard retention
      const advanceRecovery = 0;
      const otherDeductions = 0;
      const totalDed = retention + advanceRecovery + otherDeductions;
      const tax = Math.round((gross - totalDed) * 0.18); // 18% GST
      const net = gross - totalDed + tax;

      const newBill: ClientRABill = {
        id: billId,
        billNumber,
        projectId: project.id,
        projectName: project.projectName,
        clientId: project.clientId,
        clientName: project.clientName,
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        billingMilestoneId: milestone.id,
        sourceEstimateId: project.sourceEstimateId,
        sourceQuotationNumber: project.sourceQuotationNumber || 'QUO-CONTRACT',
        triggerEventId: `${event.eventType}:${nowIso}`,
        triggeredAt: todayStr,
        triggerDescription: milestone.triggerDescription,
        billDate: todayStr,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        claimedAmount: gross,
        grossWorkValue: gross,
        approvedVariations: 0,
        retentionAmount: retention,
        advanceRecoveryAmount: advanceRecovery,
        otherDeductions,
        totalDeductions: totalDed,
        taxAmount: tax,
        netReceivable: net,
        paidAmount: 0,
        outstandingAmount: net,
        billStatus: 'Pending Approval',
        paymentStatus: 'Not Started',
        paymentHistory: [],
        auditLog: [
          {
            id: `audit-${Date.now()}-1`,
            timestamp: nowIso,
            user: event.performedBy || performedBy,
            action: 'Auto Generated Milestone RA Bill',
            details: `Contractual milestone '${milestone.name}' triggered by ${event.eventType}. Generated RA Bill ${billNumber} for ₹${net.toLocaleString('en-IN')}`,
          },
        ],
        createdAt: nowIso,
        createdBy: event.performedBy || performedBy,
      };

      const updatedMilestone: ProjectBillingMilestone = {
        ...milestone,
        billingStatus: 'RA_PENDING_APPROVAL',
        triggeredAt: nowIso,
        triggeredByEvent: `${event.eventType}:${event.stageName || event.tradeName || ''}`,
        raBillId: billId,
        raBillNumber: billNumber,
      };

      if (event.eventType === 'MANUAL_TRIGGER') {
        updatedMilestone.manualOverrideBy = event.performedBy || performedBy;
        updatedMilestone.manualOverrideReason = event.notes || 'Manual authorization by project head/director';
        updatedMilestone.manualOverrideAt = nowIso;
      }

      updatedMilestones[idx] = updatedMilestone;
      triggeredMilestones.push(updatedMilestone);
      createdRABills.push(newBill);

      notifications.push({
        title: `CLIENT BILLING DUE: ${project.projectName}`,
        message: `Milestone '${milestone.name}' reached! RA Bill ${billNumber} generated for ₹${net.toLocaleString('en-IN')} (Pending Finance Approval)`,
        type: 'info',
        link: '/finance/client-ra-bills',
      });
    }
  });

  const updatedProject: Project = {
    ...project,
    billingMilestones: updatedMilestones,
    updatedAt: nowIso,
  };

  return {
    triggeredMilestones,
    createdRABills,
    updatedProject,
    notifications,
  };
}
