/**
 * Central Status Styles and Label Engine for Empire Interior ERP
 * Location: src/utils/statusStyles.tsx
 */

import React from 'react';
import {
  RFQStatus,
  DirectPurchaseStatus,
  PurchaseOrderStatus,
} from '../domain/types';

export type ProjectStatus = 'draft' | 'planning' | 'setup' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'closed';
export type TeamLockStatus = 'editable' | 'locked';
export type BOQStatus = 'locked_baseline' | 'draft';
export type MaterialIndentStatus =
  | 'draft'
  | 'submitted'
  | 'approval_required'
  | 'approved'
  | 'rejected'
  | 'returned_for_revision'
  | 'ready_for_rfq'
  | 'withdrawn';
export type ApprovalDecisionStatus = 'pending' | 'approved' | 'rejected' | 'returned';
export type TenderOutcome = 'accepted' | 'rejected' | 'revised';

export interface StatusConfig {
  label: string;
  badgeClass: string;
}

export const PROJECT_STATUS_MAP: Record<ProjectStatus, StatusConfig> = {
  draft: { label: 'Draft Setup', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  planning: { label: 'Planning', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  setup: { label: 'In Setup', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  active: { label: 'Active', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_hold: { label: 'On Hold', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  closed: { label: 'Closed', badgeClass: 'bg-slate-200 text-slate-800 border-slate-300' },
};

export const TEAM_LOCK_STATUS_MAP: Record<TeamLockStatus, StatusConfig> = {
  editable: { label: 'Editable', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  locked: { label: 'Team Locked', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
};

export const BOQ_STATUS_MAP: Record<BOQStatus, StatusConfig> = {
  draft: { label: 'Draft BOQ', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  locked_baseline: { label: 'Locked Baseline', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
};

export const INDENT_STATUS_MAP: Record<MaterialIndentStatus, StatusConfig> = {
  draft: { label: 'Draft', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  submitted: { label: 'Submitted', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  approval_required: { label: 'Approval Required', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  approved: { label: 'Approved', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  returned_for_revision: { label: 'Returned for Revision', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  ready_for_rfq: { label: 'Ready for RFQ', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300' },
  withdrawn: { label: 'Withdrawn', badgeClass: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export const APPROVAL_STATUS_MAP: Record<ApprovalDecisionStatus, StatusConfig> = {
  pending: { label: 'Pending Review', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  approved: { label: 'Approved', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  returned: { label: 'Returned for Revision', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const TENDER_OUTCOME_MAP: Record<TenderOutcome, StatusConfig> = {
  accepted: { label: 'Client Accepted (Won)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Tender Lost', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  revised: { label: 'Revision Requested', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
};

export const RFQ_STATUS_MAP: Record<RFQStatus, StatusConfig> = {
  draft: { label: 'Draft RFQ', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  issued: { label: 'Issued / Out for Bid', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  quotes_received: { label: 'Quotes Received', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  evaluated: { label: 'Evaluated', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  compared: { label: 'Compared', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  awarded: { label: 'Tender Awarded', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  closed: { label: 'Closed', badgeClass: 'bg-slate-200 text-slate-800 border-slate-300' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const DIRECT_PURCHASE_STATUS_MAP: Record<DirectPurchaseStatus, StatusConfig> = {
  draft: { label: 'Draft DP', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending_approval: { label: 'Pending Director Approval', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  approved: { label: 'Director Approved', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Rejected', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  po_issued: { label: 'PO Issued', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  converted_to_po: { label: 'Converted to PO', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-slate-200 text-slate-700 border-slate-300' },
};

export const PO_STATUS_MAP: Record<PurchaseOrderStatus, StatusConfig> = {
  draft: { label: 'Draft PO', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending_approval: { label: 'Pending Approval', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  approved: { label: 'Approved', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  issued: { label: 'Issued to Supplier', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  partially_received: { label: 'Partially Delivered', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300' },
  partially_delivered: { label: 'Partially Delivered', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300' },
  fully_received: { label: 'Fully Delivered', badgeClass: 'bg-purple-50 text-purple-800 border-purple-300' },
  fully_delivered: { label: 'Fully Delivered', badgeClass: 'bg-purple-50 text-purple-800 border-purple-300' },
  closed: { label: 'Closed', badgeClass: 'bg-slate-200 text-slate-800 border-slate-300' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const GRN_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: 'Draft GRN', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending_inspection: { label: 'Pending Quality Inspection', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  inspected: { label: 'Quality Inspected', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  approved: { label: 'Approved for Posting', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  posted: { label: 'Posted to Stock', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Quality Rejected', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-slate-200 text-slate-700 border-slate-300' },
};

export const MATERIAL_ISSUE_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: 'Draft Requisition', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  issued: { label: 'Stock Issued', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const MATERIAL_RETURN_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: 'Draft Return', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  approved: { label: 'Return Approved', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  completed: { label: 'Stock Recredited', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const MATERIAL_CONSUMPTION_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: 'Draft Consumption', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  posted: { label: 'Consumption Posted', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const WORK_ORDER_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: 'Draft WO', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending_approval: { label: 'Pending Approval', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  approved: { label: 'Approved WO', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  issued: { label: 'Issued to Subcontractor', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  in_progress: { label: 'Execution In Progress', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300' },
  completed: { label: 'Execution Completed', badgeClass: 'bg-purple-50 text-purple-800 border-purple-300' },
  closed: { label: 'Closed', badgeClass: 'bg-slate-200 text-slate-800 border-slate-300' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const WIP_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: 'Draft WIP', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  submitted: { label: 'Submitted Measurement', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  reviewed: { label: 'Reviewed Measurement', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  certified: { label: 'Certified', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Measurement Rejected', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const WIP_CERTIFICATION_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: 'Draft Certification', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending_review: { label: 'Pending Review', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  certified: { label: 'WIP Certified', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Rejected', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  returned: { label: 'Returned for Revision', badgeClass: 'bg-purple-50 text-purple-800 border-purple-300' },
};

export function getRFQStatusBadge(status: RFQStatus): React.ReactElement {
  const config = RFQ_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export function getDirectPurchaseStatusBadge(status: DirectPurchaseStatus): React.ReactElement {
  const config = DIRECT_PURCHASE_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export function getPOStatusBadge(status: PurchaseOrderStatus): React.ReactElement {
  const config = PO_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export function getGRNStatusBadge(status: string): React.ReactElement {
  const config = GRN_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export function getMaterialIssueStatusBadge(status: string): React.ReactElement {
  const config = MATERIAL_ISSUE_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export function getMaterialReturnStatusBadge(status: string): React.ReactElement {
  const config = MATERIAL_RETURN_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export function getMaterialConsumptionStatusBadge(status: string): React.ReactElement {
  const config = MATERIAL_CONSUMPTION_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export function getWorkOrderStatusBadge(status: string): React.ReactElement {
  const config = WORK_ORDER_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export function getWIPStatusBadge(status: string): React.ReactElement {
  const config = WIP_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export const QUALITY_INSPECTION_STATUS_MAP: Record<string, StatusConfig> = {
  pending: { label: 'Pending Inspection', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  passed: { label: 'Passed Quality Inspection', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  failed: { label: 'Failed Inspection', badgeClass: 'bg-rose-50 text-rose-800 border-rose-300' },
  partial: { label: 'Partial Pass', badgeClass: 'bg-purple-50 text-purple-800 border-purple-300' },
};

export function getQualityInspectionStatusBadge(status: string): React.ReactElement {
  const config = QUALITY_INSPECTION_STATUS_MAP[status] || { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

