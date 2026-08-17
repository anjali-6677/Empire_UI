// Simple standalone test runner to verify token workflow gating logic
const describe = (_name: string, fn: () => void) => fn();
const it = (_name: string, fn: () => void) => fn();
const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
  },
  toContain: (substring: string) => {
    if (typeof actual !== 'string' || !actual.includes(substring)) {
      throw new Error(`Expected string containing "${substring}" but got "${actual}"`);
    }
  },
});

import { resolveGateTokenForWorkflow } from '../tokenWorkflowResolver';

describe('resolveGateTokenForWorkflow', () => {
  const mockToken: any = {
    id: 'tok-101',
    tokenNumber: 'REC-20260816-001',
    vehicleNumber: 'KA-01-HH-1234',
    driverName: 'Ramesh Kumar',
    materialName: 'Commercial Plywood 18mm',
    categoryName: 'Plywood',
    status: 'TOKEN_GENERATED',
    currentStage: 'Gate Entry',
    entryDate: '2026-08-16',
    entryTime: '10:30 AM',
  };

  const mockReceivingCheck: any = {
    id: 'rcv-101',
    tokenId: 'tok-101',
    tokenNumber: 'REC-20260816-001',
    poId: 'po-1',
    poNumber: 'PO-2026-001',
    vendorId: 'v-1',
    vendorName: 'Century Ply Ltd',
    projectId: 'p-1',
    projectName: 'Nouveau Penthouse',
    productId: 'prod-01',
    productName: 'Commercial Plywood 18mm',
    unit: 'sqft',
    poQty: 100,
    receivedQty: 100,
    damagedQty: 0,
    shortQty: 0,
    excessQty: 0,
    qcPendingQty: 100,
    status: 'QC_PENDING',
    checkDate: '2026-08-16',
    checkedBy: 'Stores Officer',
  };

  const mockQC: any = {
    id: 'qc-101',
    qcNumber: 'QC-20260816-001',
    tokenId: 'tok-101',
    tokenNumber: 'REC-20260816-001',
    receivingCheckId: 'rcv-101',
    poId: 'po-1',
    poNumber: 'PO-2026-001',
    projectId: 'p-1',
    projectName: 'Nouveau Penthouse',
    vendorId: 'v-1',
    vendorName: 'Century Ply Ltd',
    vehicleNumber: 'KA-01-HH-1234',
    driverName: 'Ramesh Kumar',
    inspectionDate: '2026-08-16',
    inspectorName: 'Rajesh Sharma',
    status: 'PASSED',
    items: [],
    overallRemarks: 'Pass',
    createdAt: '2026-08-16',
  };

  it('should return NOT_FOUND for invalid or non-existent token number', () => {
    const mockState = { materialEntryTokens: [mockToken] };
    const res = resolveGateTokenForWorkflow('NON-EXISTENT-999', 'QUALITY_CONTROL', mockState);
    expect(res.status).toBe('NOT_FOUND');
    expect(res.error).toContain('Gate Token not found');
  });

  it('should allow Initial Receiving for a token in TOKEN_GENERATED status', () => {
    const mockState = { materialEntryTokens: [mockToken], materialReceivingChecks: [] };
    const res = resolveGateTokenForWorkflow('REC-20260816-001', 'INITIAL_RECEIVING', mockState);
    expect(res.status).toBe('ELIGIBLE');
    expect(res.token?.tokenNumber).toBe('REC-20260816-001');
  });

  it('should block QC when token has not completed Initial Receiving check', () => {
    const mockState = { materialEntryTokens: [mockToken], materialReceivingChecks: [] };
    const res = resolveGateTokenForWorkflow('REC-20260816-001', 'QUALITY_CONTROL', mockState);
    expect(res.status).toBe('RECEIVING_REQUIRED');
    expect(res.error).toContain('Initial Receiving Check Required');
  });

  it('should allow QC when token has completed Initial Receiving check', () => {
    const mockState = {
      materialEntryTokens: [{ ...mockToken, status: 'RECEIVING_CHECKED' }],
      materialReceivingChecks: [mockReceivingCheck],
      qualityInspections: [],
    };
    const res = resolveGateTokenForWorkflow('REC-20260816-001', 'QUALITY_CONTROL', mockState);
    expect(res.status).toBe('ELIGIBLE');
    expect(res.receivingCheck?.id).toBe('rcv-101');
  });

  it('should block workflow for tokens in HOLD status', () => {
    const holdToken = { ...mockToken, status: 'HOLD' as const, holdReason: 'Damaged seal' };
    const mockState = { materialEntryTokens: [holdToken] };
    const res = resolveGateTokenForWorkflow('REC-20260816-001', 'QUALITY_CONTROL', mockState);
    expect(res.status).toBe('ON_HOLD');
    expect(res.error).toContain('On Hold');
  });

  it('should block workflow for CANCELLED tokens', () => {
    const cancelledToken = { ...mockToken, status: 'CANCELLED' as const };
    const mockState = { materialEntryTokens: [cancelledToken] };
    const res = resolveGateTokenForWorkflow('REC-20260816-001', 'QUALITY_CONTROL', mockState);
    expect(res.status).toBe('CANCELLED');
    expect(res.error).toContain('cancelled');
  });

  it('should detect ALREADY_COMPLETED QC and prevent duplicate QC creation', () => {
    const completedToken = { ...mockToken, status: 'APPROVED' as const };
    const mockState = {
      materialEntryTokens: [completedToken],
      materialReceivingChecks: [mockReceivingCheck],
      qualityInspections: [mockQC],
    };
    const res = resolveGateTokenForWorkflow('REC-20260816-001', 'QUALITY_CONTROL', mockState);
    expect(res.status).toBe('ALREADY_COMPLETED');
    expect(res.qcInspection?.id).toBe('qc-101');
  });
});
