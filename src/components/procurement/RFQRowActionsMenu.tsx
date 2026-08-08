/**
 * Reusable RFQ Row Actions Menu Component
 * Location: src/components/procurement/RFQRowActionsMenu.tsx
 */

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  MoreVertical,
  Eye,
  Send,
  PlusCircle,
  BarChart2,
  ShoppingBag,
  History,
  Download,
  XCircle,
} from 'lucide-react';
import { RFQ } from '../../domain/types';

export interface RFQRowActionsMenuProps {
  rfq: RFQ;
  receivedQuotesCount: number;
  onView: (rfqId: string) => void;
  onMarkSent: (rfq: RFQ) => void;
  onRecordQuote: (rfq: RFQ) => void;
  onCompareQuotes: (rfqId: string) => void;
  onCreatePO: (rfqId: string) => void;
  onViewActivity: (rfqId: string) => void;
  onDownload: (rfq: RFQ) => void;
  onCancel: (rfq: RFQ) => void;
}

export interface RFQActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
  variant?: 'default' | 'primary' | 'destructive';
}

export function getRFQRowActions(
  rfq: RFQ,
  receivedCount: number,
  callbacks: {
    onView: () => void;
    onMarkSent: () => void;
    onRecordQuote: () => void;
    onCompareQuotes: () => void;
    onCreatePO: () => void;
    onViewActivity: () => void;
    onDownload: () => void;
    onCancel: () => void;
  }
): RFQActionItem[] {
  const actions: RFQActionItem[] = [];

  // Always available: View RFQ
  actions.push({
    id: 'view',
    label: 'View RFQ',
    icon: Eye,
    onClick: callbacks.onView,
  });

  // Draft status actions
  if (rfq.status === 'draft') {
    actions.push({
      id: 'mark_sent',
      label: 'Mark as Sent',
      icon: Send,
      variant: 'primary',
      onClick: callbacks.onMarkSent,
    });
  }

  // Issued or Quotes Received status
  if (rfq.status === 'issued' || rfq.status === 'quotes_received') {
    if (rfq.status === 'issued') {
      actions.push({
        id: 'mark_sent',
        label: 'Mark as Sent',
        icon: Send,
        onClick: callbacks.onMarkSent,
      });
    }

    actions.push({
      id: 'record_quote',
      label: 'Record Vendor Quote',
      icon: PlusCircle,
      variant: rfq.status === 'issued' && receivedCount === 0 ? 'primary' : 'default',
      onClick: callbacks.onRecordQuote,
    });

    // Compare Received Quotes (Disabled if 0 quotes)
    if (receivedCount > 0) {
      actions.push({
        id: 'compare_quotes',
        label: 'Compare Received Quotes',
        icon: BarChart2,
        variant: 'primary',
        onClick: callbacks.onCompareQuotes,
      });
    } else {
      actions.push({
        id: 'compare_quotes',
        label: 'Compare Received Quotes',
        icon: BarChart2,
        disabled: true,
        disabledTooltip: 'No supplier quotations recorded yet',
      });
    }

    // Create Purchase Order (Disabled if 0 quotes)
    if (receivedCount > 0) {
      actions.push({
        id: 'create_po',
        label: 'Create Purchase Order',
        icon: ShoppingBag,
        variant: 'primary',
        onClick: callbacks.onCreatePO,
      });
    } else {
      actions.push({
        id: 'create_po',
        label: 'Create Purchase Order',
        icon: ShoppingBag,
        disabled: true,
        disabledTooltip: 'Requires at least one submitted supplier quotation',
      });
    }
  }

  // Awarded / Converted to PO status
  if (rfq.status === 'awarded') {
    actions.push({
      id: 'compare_quotes',
      label: 'View Comparison',
      icon: BarChart2,
      onClick: callbacks.onCompareQuotes,
    });

    actions.push({
      id: 'view_po',
      label: 'View Purchase Order',
      icon: ShoppingBag,
      variant: 'primary',
      onClick: callbacks.onCreatePO,
    });
  }

  // Always available for non-cancelled
  actions.push({
    id: 'activity',
    label: 'View Activity',
    icon: History,
    onClick: callbacks.onViewActivity,
  });

  actions.push({
    id: 'download',
    label: 'Download RFQ',
    icon: Download,
    onClick: callbacks.onDownload,
  });

  // Cancel RFQ (Available for active draft/issued/quotes_received)
  if (rfq.status !== 'cancelled' && rfq.status !== 'awarded') {
    actions.push({
      id: 'cancel',
      label: 'Cancel RFQ',
      icon: XCircle,
      variant: 'destructive',
      onClick: callbacks.onCancel,
    });
  }

  return actions;
}

export const RFQRowActionsMenu: React.FC<RFQRowActionsMenuProps> = ({
  rfq,
  receivedQuotesCount,
  onView,
  onMarkSent,
  onRecordQuote,
  onCompareQuotes,
  onCreatePO,
  onViewActivity,
  onDownload,
  onCancel,
}) => {
  const actions = getRFQRowActions(rfq, receivedQuotesCount, {
    onView: () => onView(rfq.id),
    onMarkSent: () => onMarkSent(rfq),
    onRecordQuote: () => onRecordQuote(rfq),
    onCompareQuotes: () => onCompareQuotes(rfq.id),
    onCreatePO: () => onCreatePO(rfq.id),
    onViewActivity: () => onViewActivity(rfq.id),
    onDownload: () => onDownload(rfq),
    onCancel: () => onCancel(rfq),
  });

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Open actions for RFQ ${rfq.documentNumber}`}
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
          className="z-50 min-w-[220px] bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
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
                    className="flex items-center gap-2.5 h-9 px-3 py-1.5 cursor-pointer outline-none transition text-rose-700 hover:bg-rose-50 focus:bg-rose-50 font-medium"
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
                {action.disabled && (
                  <span className="ml-auto text-[9px] font-mono text-slate-400 border border-slate-200 rounded px-1">
                    N/A
                  </span>
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
