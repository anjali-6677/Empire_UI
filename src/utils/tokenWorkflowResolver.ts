import { MaterialEntryToken, MaterialReceivingCheck, QualityInspection } from '../domain/types';

export type TokenWorkflowResolutionStatus =
  | 'ELIGIBLE'
  | 'NOT_FOUND'
  | 'INVALID_FORMAT'
  | 'ON_HOLD'
  | 'CANCELLED'
  | 'RECEIVING_REQUIRED'
  | 'ALREADY_COMPLETED';

export interface TokenWorkflowResolution {
  status: TokenWorkflowResolutionStatus;
  token?: MaterialEntryToken;
  receivingCheck?: MaterialReceivingCheck;
  qcInspection?: QualityInspection;
  error?: string;
  message?: string;
}

/**
 * Shared Canonical Token Resolver for ERP Workflows (Initial Receiving & Quality Control).
 * Ensures camera QR scan, manual typing, hardware scanner, and paste inputs resolve
 * tokens strictly identically across all inventory modules.
 */
export function resolveGateTokenForWorkflow(
  rawInput: string,
  targetWorkflow: 'INITIAL_RECEIVING' | 'QUALITY_CONTROL',
  state: any
): TokenWorkflowResolution {
  const cleaned = (rawInput || '').trim();
  if (!cleaned) {
    return {
      status: 'INVALID_FORMAT',
      error: 'Please enter or scan a valid Gate Token Number.',
    };
  }

  const tokens: MaterialEntryToken[] = state.materialEntryTokens || [];
  const receivingChecks: MaterialReceivingCheck[] = state.materialReceivingChecks || [];
  const qcInspections: QualityInspection[] = state.qualityInspections || [];

  // Match canonical tokenNumber or unique ID
  const token = tokens.find(
    (t: MaterialEntryToken) =>
      t.tokenNumber.toLowerCase() === cleaned.toLowerCase() ||
      t.id === cleaned
  );

  if (!token) {
    return {
      status: 'NOT_FOUND',
      error: `Gate Token not found: ${cleaned}`,
    };
  }

  // Check On Hold status
  if (token.status === 'HOLD') {
    return {
      status: 'ON_HOLD',
      token,
      error: `Token ${token.tokenNumber} is currently On Hold. Reason: ${token.holdReason || 'Security/Store Hold'}`,
    };
  }

  // Check Cancelled status
  if (token.status === 'CANCELLED') {
    return {
      status: 'CANCELLED',
      token,
      error: `This Material Gate Token (${token.tokenNumber}) has been cancelled. Quality Control / Receiving cannot be performed.`,
    };
  }

  const rcvCheck = receivingChecks.find(
    (c: MaterialReceivingCheck) => c.tokenId === token.id || c.tokenNumber === token.tokenNumber
  );
  const qcInspection = qcInspections.find(
    (q: QualityInspection) => q.tokenId === token.id || q.tokenNumber === token.tokenNumber
  );

  if (targetWorkflow === 'INITIAL_RECEIVING') {
    if (rcvCheck) {
      return {
        status: 'ALREADY_COMPLETED',
        token,
        receivingCheck: rcvCheck,
        message: `Initial Receiving Check already completed for Token ${token.tokenNumber}.`,
      };
    }

    if (token.status === 'TOKEN_GENERATED') {
      return {
        status: 'ELIGIBLE',
        token,
      };
    }

    // Default to eligible if token exists and receiving check is missing
    return {
      status: 'ELIGIBLE',
      token,
    };
  }

  // Target Workflow: QUALITY_CONTROL
  if (targetWorkflow === 'QUALITY_CONTROL') {
    // Sequence Rule: Gate Entry -> Initial Receiving -> QC
    if (token.status === 'TOKEN_GENERATED' || !rcvCheck) {
      return {
        status: 'RECEIVING_REQUIRED',
        token,
        error: `Initial Receiving Check Required. Token ${token.tokenNumber} has not completed Initial Receiving check.`,
      };
    }

    if (qcInspection || token.status === 'APPROVED' || token.status === 'GRN_GENERATED') {
      return {
        status: 'ALREADY_COMPLETED',
        token,
        receivingCheck: rcvCheck,
        qcInspection,
        message: `QC Inspection already completed for Token ${token.tokenNumber}.`,
      };
    }

    return {
      status: 'ELIGIBLE',
      token,
      receivingCheck: rcvCheck,
    };
  }

  return {
    status: 'NOT_FOUND',
    error: 'Unsupported workflow stage.',
  };
}
