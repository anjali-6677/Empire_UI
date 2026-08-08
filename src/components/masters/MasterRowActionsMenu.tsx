/**
 * Reusable Master Row Actions Menu Component
 * Location: src/components/masters/MasterRowActionsMenu.tsx
 */

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical } from 'lucide-react';

export interface MasterActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
  variant?: 'default' | 'primary' | 'destructive';
}

export interface MasterRowActionsMenuProps {
  ariaLabel: string;
  actions: MasterActionItem[];
}

export const MasterRowActionsMenu: React.FC<MasterRowActionsMenuProps> = ({
  ariaLabel,
  actions,
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
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
          className="z-50 min-w-[200px] bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
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
