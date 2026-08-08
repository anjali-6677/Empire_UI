/**
 * Reusable Goods Received Note (GRN) Row Actions Menu Component
 * Location: src/components/inventory/GRNRowActionsMenu.tsx
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  MoreVertical,
  Eye,
  ShieldCheck,
  PackageCheck,
  FileText,
  Boxes,
} from 'lucide-react';
import { GoodsReceivedNote } from '../../domain/types';

export interface GRNRowActionsMenuProps {
  grn: GoodsReceivedNote;
  onApprove?: () => void;
  onPostToStock?: () => void;
}

export const GRNRowActionsMenu: React.FC<GRNRowActionsMenuProps> = ({
  grn,
  onApprove,
  onPostToStock,
}) => {
  const navigate = useNavigate();
  const status = (grn.status as string)?.toLowerCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Open actions for Goods Received Note ${grn.documentNumber}`}
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent hover:border-stone-200 hover:bg-stone-100 active:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-500 hover:text-stone-900 transition"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          onClick={(e) => e.stopPropagation()}
          className="z-50 min-w-[210px] bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Always Available: View GRN Details */}
          <DropdownMenu.Item
            onSelect={() => navigate(`/inventory/grns/${grn.id}`)}
            className="flex items-center gap-2.5 h-9 px-3 py-1.5 cursor-pointer outline-none transition text-stone-700 hover:bg-stone-50 focus:bg-stone-50 font-medium text-xs"
          >
            <Eye className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>View GRN Details</span>
          </DropdownMenu.Item>

          {/* Quality Inspection Action */}
          <DropdownMenu.Item
            onSelect={() => navigate(`/inventory/grns/${grn.id}?action=inspect`)}
            className="flex items-center gap-2.5 h-9 px-3 py-1.5 cursor-pointer outline-none transition text-amber-950 bg-amber-50/70 hover:bg-amber-100 focus:bg-amber-100 font-bold text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-700 shrink-0" />
            <span>Record Quality Inspection</span>
          </DropdownMenu.Item>

          {/* Approve GRN */}
          {status !== 'approved' && status !== 'posted' && onApprove && (
            <DropdownMenu.Item
              onSelect={onApprove}
              className="flex items-center gap-2.5 h-9 px-3 py-1.5 cursor-pointer outline-none transition text-blue-700 hover:bg-blue-50 focus:bg-blue-50 font-medium text-xs"
            >
              <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Approve GRN</span>
            </DropdownMenu.Item>
          )}

          {/* Post to Stock Ledger */}
          {!grn.isPostedToStock && onPostToStock && (
            <DropdownMenu.Item
              onSelect={onPostToStock}
              className="flex items-center gap-2.5 h-9 px-3 py-1.5 cursor-pointer outline-none transition text-emerald-800 hover:bg-emerald-50 focus:bg-emerald-50 font-bold text-xs"
            >
              <PackageCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Post to Stock Ledger</span>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="h-px bg-stone-100 my-1" />

          <DropdownMenu.Item
            onSelect={() => navigate('/inventory/stock-ledger')}
            className="flex items-center gap-2.5 h-9 px-3 py-1.5 cursor-pointer outline-none transition text-stone-600 hover:bg-stone-50 focus:bg-stone-50 font-medium text-xs"
          >
            <Boxes className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>View Stock Ledger</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
