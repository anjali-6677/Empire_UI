// Standalone test runner for milestone billing trigger engine
const describe = (_name: string, fn: () => void) => fn();
const it = (_name: string, fn: () => void) => fn();
const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
  },
  toBeDefined: () => {
    if (actual === undefined) throw new Error('Expected defined value but got undefined');
  },
  toHaveLength: (len: number) => {
    if (!Array.isArray(actual) || actual.length !== len) {
      throw new Error(`Expected array of length ${len} but got ${actual?.length}`);
    }
  },
});

import { ClientRABill } from '../../domain/types';
import { evaluateBillingMilestones } from '../milestoneBillingEngine';

describe('Milestone Billing Engine', () => {
  const sampleMilestones: any[] = [
    {
      id: 'ms-1',
      sequence: 1,
      name: 'Advance Mobilization',
      percentage: 10,
      amount: 74078,
      triggerType: 'CONTRACT_EXECUTED',
      triggerDescription: 'Contract Execution',
      billingStatus: 'NOT_TRIGGERED',
    },
    {
      id: 'ms-2',
      sequence: 2,
      name: 'Material Delivery',
      percentage: 40,
      amount: 296312,
      triggerType: 'STAGE_COMPLETED',
      triggerDescription: 'Material Delivery Stage',
      billingStatus: 'NOT_TRIGGERED',
    },
    {
      id: 'ms-3',
      sequence: 3,
      name: 'Mid Progress Fitting',
      percentage: 40,
      amount: 296312,
      triggerType: 'TRADE_PROGRESS_THRESHOLD',
      triggerDescription: '70% Carpentry',
      tradeName: 'Carpentry',
      progressThreshold: 70,
      billingStatus: 'NOT_TRIGGERED',
    },
    {
      id: 'ms-4',
      sequence: 4,
      name: 'Final Handover',
      percentage: 10,
      amount: 74078,
      triggerType: 'HANDOVER_SIGNED',
      triggerDescription: 'Handover Signoff',
      billingStatus: 'NOT_TRIGGERED',
    },
  ];

  const sampleProject: any = {
    id: 'prj-test-1',
    projectCode: 'PRJ-TEST-001',
    projectName: 'Test Penthouse Fitout',
    clientId: 'cli-1',
    clientName: 'Test Client Ltd',
    acceptedQuotationValue: 740780,
    currentBOQValue: 740780,
    budgetBaseline: 740780,
    approvedBudgetLimit: 740780,
    committedCost: 0,
    actualCost: 0,
    certifiedRevenue: 0,
    clientReceipts: 0,
    startDate: '2026-08-01',
    targetCompletionDate: '2026-11-30',
    progress: 75,
    projectStatus: 'active',
    status: 'active',
    billingMilestones: sampleMilestones,
    createdAt: '2026-08-01T00:00:00Z',
    createdBy: 'Test Admin',
    updatedAt: '2026-08-01T00:00:00Z',
    updatedBy: 'Test Admin',
  };

  it('triggers TRADE_PROGRESS_THRESHOLD when trade progress reaches 70%', () => {
    const existingBills: ClientRABill[] = [];
    const result = evaluateBillingMilestones({
      project: sampleProject,
      event: {
        eventType: 'TRADE_PROGRESS_UPDATED',
        tradeName: 'Carpentry',
        currentProgress: 75,
      },
      existingRABills: existingBills,
    });

    expect(result.createdRABills).toHaveLength(1);
    expect(result.createdRABills[0].milestoneId).toBe('ms-3');
    expect(result.createdRABills[0].billStatus).toBe('Pending Approval');
    expect(result.createdRABills[0].grossWorkValue).toBe(296312);
  });

  it('prevents duplicate bill creation if milestone is already triggered', () => {
    const existingBill: any = {
      id: 'ra-existing-1',
      billNumber: 'RA/2026/001',
      projectId: 'prj-test-1',
      projectName: 'Test Penthouse Fitout',
      clientId: 'cli-1',
      clientName: 'Test Client Ltd',
      milestoneId: 'ms-3',
      milestoneName: 'Mid Progress Fitting',
      billDate: '2026-08-10',
      dueDate: '2026-08-24',
      claimedAmount: 296312,
      certifiedAmount: 296312,
      grossWorkValue: 296312,
      approvedVariations: 0,
      retentionAmount: 14816,
      advanceRecoveryAmount: 0,
      otherDeductions: 0,
      totalDeductions: 14816,
      taxAmount: 50669,
      netReceivable: 332165,
      paidAmount: 0,
      outstandingAmount: 332165,
      billStatus: 'Pending Approval',
      paymentStatus: 'Payment Pending',
      createdAt: '2026-08-10T00:00:00Z',
      createdBy: 'System Trigger',
    };

    const projectWithTriggeredMs: any = {
      ...sampleProject,
      billingMilestones: sampleProject.billingMilestones?.map((m: any) =>
        m.id === 'ms-3' ? { ...m, billingStatus: 'RA_PENDING_APPROVAL', raBillId: 'ra-existing-1' } : m
      ),
    };

    const result = evaluateBillingMilestones({
      project: projectWithTriggeredMs,
      event: {
        eventType: 'TRADE_PROGRESS_UPDATED',
        tradeName: 'Carpentry',
        currentProgress: 80,
      },
      existingRABills: [existingBill],
    });

    expect(result.createdRABills).toHaveLength(0);
  });

  it('allows manual trigger override for an un-triggered milestone', () => {
    const result = evaluateBillingMilestones({
      project: sampleProject,
      event: {
        eventType: 'MANUAL_TRIGGER',
        milestoneId: 'ms-2',
        performedBy: 'Project Director',
        notes: 'Early delivery approval',
      },
      existingRABills: [],
    });

    expect(result.createdRABills).toHaveLength(1);
    expect(result.createdRABills[0].milestoneId).toBe('ms-2');
    expect(result.createdRABills[0].billStatus).toBe('Pending Approval');
  });
});
