/**
 * Reusable Purchase Order Row Actions Menu Component
 * Location: src/components/procurement/PORowActionsMenu.tsx
 */

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  MoreVertical,
  Eye,
  Edit,
  Send,
  Download,
  XCircle,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  BarChart2,
  PackageCheck,
  History,
  Archive,
} from 'lucide-react';
import { PurchaseOrder } from '../../domain/types';

export interface PORowActionsMenuProps {
  po: PurchaseOrder;
  onView: (poId: string) => void;
  onEdit?: (po: PurchaseOrder) => void;
  onSubmitForApproval?: (po: PurchaseOrder) => void;
  onReviewApproval?: (poId: string) => void;
  onWithdraw?: (po: PurchaseOrder) => void;
  onIssuePO?: (po: PurchaseOrder) => void;
  onDownload?: (po: PurchaseOrder) => void;
  onViewComparison?: (rfqId?: string) => void;
  onViewGRNs?: (poId: string) => void;
  onViewActivity?: (poId: string) => void;
  onCancel?: (po: PurchaseOrder) => void;
  onClosePO?: (po: PurchaseOrder) => void;
}

export interface POActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
  variant?: 'default' | 'primary' | 'destructive';
}

export function getPORowActions(
  po: PurchaseOrder,
  callbacks: {
    onView: () => void;
    onEdit?: () => void;
    onSubmitForApproval?: () => void;
    onReviewApproval?: () => void;
    onWithdraw?: () => void;
    onIssuePO?: () => void;
    onDownload?: () => void;
    onViewComparison?: () => void;
    onViewGRNs?: () => void;
    onViewActivity?: () => void;
    onCancel?: () => void;
    onClosePO?: () => void;
  }
): POActionItem[] {
  const actions: POActionItem[] = [];
  const status = (po.status as string)?.toLowerCase();

  // Always available: View PO
  actions.push({
    id: 'view',
    label: 'View PO Details',
    icon: Eye,
    onClick: callbacks.onView,
  });

  // Status: Draft
  if (status === 'draft') {
    if (callbacks.onEdit) {
      actions.push({
        id: 'edit',
        label: 'Edit Draft PO',
        icon: Edit,
        onClick: callbacks.onEdit,
      });
    }

    if (callbacks.onSubmitForApproval) {
      actions.push({
        id: 'submit_approval',
        label: 'Submit for Approval',
        icon: Send,
        variant: 'primary',
        onClick: callbacks.onSubmitForApproval,
      });
    }

    actions.push({
      id: 'download_draft',
      label: 'Download Draft PO',
      icon: Download,
      onClick: callbacks.onDownload,
    });

    if (callbacks.onCancel) {
      actions.push({
        id: 'cancel',
        label: 'Cancel PO Draft',
        icon: XCircle,
        variant: 'destructive',
        onClick: callbacks.onCancel,
      });
    }
  }

  // Status: Pending Approval
  else if (status === 'pending_approval' || status === 'pendingapproval') {
    if (callbacks.onReviewApproval) {
      actions.push({
        id: 'review_approval',
        label: 'Review Approval',
        icon: ShieldCheck,
        variant: 'primary',
        onClick: callbacks.onReviewApproval,
      });
    }

    if (callbacks.onWithdraw) {
      actions.push({
        id: 'withdraw',
        label: 'Withdraw Submission',
        icon: RotateCcw,
        onClick: callbacks.onWithdraw,
      });
    }

    actions.push({
      id: 'download_draft',
      label: 'Download Draft PO',
      icon: Download,
      onClick: callbacks.onDownload,
    });
  }

  // Status: Approved
  else if (status === 'approved') {
    if (callbacks.onIssuePO) {
      actions.push({
        id: 'issue_po',
        label: 'Issue PO to Vendor',
        icon: CheckCircle2,
        variant: 'primary',
        onClick: callbacks.onIssuePO,
      });
    }

    actions.push({
      id: 'download',
      label: 'Download Approved PO',
      icon: Download,
      onClick: callbacks.onDownload,
    });

    if (callbacks.onViewComparison && (po.rfqId || po.sourceRFQId)) {
      actions.push({
        id: 'view_comparison',
        label: 'View Source Comparison',
        icon: BarChart2,
        onClick: callbacks.onViewComparison,
      });
    }

    if (callbacks.onCancel) {
      actions.push({
        id: 'cancel',
        label: 'Cancel Approved PO',
        icon: XCircle,
        variant: 'destructive',
        onClick: callbacks.onCancel,
      });
    }
  }

  // Status: Issued
  else if (status === 'issued') {
    actions.push({
      id: 'download',
      label: 'Download Issued PO',
      icon: Download,
      onClick: callbacks.onDownload,
    });

    if (callbacks.onViewComparison && (po.rfqId || po.sourceRFQId)) {
      actions.push({
        id: 'view_comparison',
        label: 'View Source Comparison',
        icon: BarChart2,
        onClick: callbacks.onViewComparison,
      });
    }

    if (callbacks.onViewActivity) {
      actions.push({
        id: 'activity',
        label: 'View Activity Log',
        icon: History,
        onClick: callbacks.onViewActivity,
      });
    }
  }

  // Status: Partially Delivered / Received
  else if (status === 'partially_delivered' || status === 'partially_received') {
    actions.push({
      id: 'download',
      label: 'Download PO Document',
      icon: Download,
      onClick: callbacks.onDownload,
    });

    if (callbacks.onViewGRNs) {
      actions.push({
        id: 'view_grns',
        label: 'View Goods Receipts (GRNs)',
        icon: PackageCheck,
        variant: 'primary',
        onClick: callbacks.onViewGRNs,
      });
    }
  }

  // Status: Fully Delivered / Received
  else if (status === 'fully_delivered' || status === 'fully_received') {
    actions.push({
      id: 'download',
      label: 'Download Completed PO',
      icon: Download,
      onClick: callbacks.onDownload,
    });

    if (callbacks.onViewGRNs) {
      actions.push({
        id: 'view_grns',
        label: 'View Goods Receipts (GRNs)',
        icon: PackageCheck,
        onClick: callbacks.onViewGRNs,
      });
    }

    if (callbacks.onClosePO) {
      actions.push({
        id: 'close_po',
        label: 'Close PO Record',
        icon: Archive,
        onClick: callbacks.onClosePO,
      });
    }
  }

  // Status: Cancelled
  else if (status === 'cancelled') {
    if (callbacks.onViewActivity) {
      actions.push({
        id: 'activity',
        label: 'View Activity Log',
        icon: History,
        onClick: callbacks.onViewActivity,
      });
    }
  }

  return actions;
}

export const PORowActionsMenu: React.FC<PORowActionsMenuProps> = ({
  po,
  onView,
  onEdit,
  onSubmitForApproval,
  onReviewApproval,
  onWithdraw,
  onIssuePO,
  onDownload,
  onViewComparison,
  onViewGRNs,
  onViewActivity,
  onCancel,
  onClosePO,
}) => {
  const actions = getPORowActions(po, {
    onView: () => onView(po.id),
    onEdit: onEdit ? () => onEdit(po) : undefined,
    onSubmitForApproval: onSubmitForApproval ? () => onSubmitForApproval(po) : undefined,
    onReviewApproval: onReviewApproval ? () => onReviewApproval(po.id) : undefined,
    onWithdraw: onWithdraw ? () => onWithdraw(po) : undefined,
    onIssuePO: onIssuePO ? () => onIssuePO(po) : undefined,
    onDownload: onDownload ? () => onDownload(po) : undefined,
    onViewComparison: onViewComparison ? () => onViewComparison(po.rfqId || po.sourceRFQId) : undefined,
    onViewGRNs: onViewGRNs ? () => onViewGRNs(po.id) : undefined,
    onViewActivity: onViewActivity ? () => onViewActivity(po.id) : undefined,
    onCancel: onCancel ? () => onCancel(po) : undefined,
    onClosePO: onClosePO ? () => onClosePO(po) : undefined,
  });

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Open actions for Purchase Order ${po.documentNumber}`}
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-500 hover:text-slate-900 transition"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          onClick={(e) => e.stopPropagation()}
          className="z-50 min-w-[210px] bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          {actions.map((action, idx) => {
            const Icon = action.icon;
            const isDestructive = action.variant === 'destructive';
            const isPrimary = action.variant === 'primary';

            if (isDestructive && idx > 0 && actions[idx - 1]?.variant !== 'destructive') {
              return (
                <React.Fragment key={action.id}>
                  <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                  <DropdownMenu.Item
                    disabled={action.disabled}
                    onSelect={action.onClick}
                    title={action.disabledTooltip}
                    className="flex items-center gap-2.5 h-9 px-3 py-1.5 cursor-pointer outline-none transition text-rose-700 hover:bg-rose-50 focus:bg-rose-50 font-medium text-xs"
                  >
                    <Icon className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <span>{action.label}</span>
                  </DropdownMenu.Item>
                </React.Fragment>
              );
            }

            return (
              <DropdownMenu.Item
                key={action.id}
                disabled={action.disabled}
                onSelect={action.onClick}
                title={action.disabledTooltip}
                className={`flex items-center gap-2.5 h-9 px-3 py-1.5 outline-none transition text-xs select-none ${
                  action.disabled
                    ? 'text-slate-400 opacity-60 cursor-not-allowed bg-transparent'
                    : isPrimary
                    ? 'bg-amber-50/70 text-amber-950 hover:bg-amber-100 focus:bg-amber-100 font-bold cursor-pointer'
                    : isDestructive
                    ? 'text-rose-700 hover:bg-rose-50 focus:bg-rose-50 font-medium cursor-pointer'
                    : 'text-slate-700 hover:bg-slate-50 focus:bg-slate-50 font-medium cursor-pointer'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    action.disabled
                      ? 'text-slate-300'
                      : isPrimary
                      ? 'text-amber-700'
                      : isDestructive
                      ? 'text-rose-600'
                      : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{action.label}</span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
