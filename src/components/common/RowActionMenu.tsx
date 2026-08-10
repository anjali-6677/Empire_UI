import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

export interface RowActionMenuItemProps {
  onClick: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
}

export const RowActionMenuItem: React.FC<RowActionMenuItemProps> = ({
  onClick,
  icon,
  label,
  variant = 'default',
  disabled = false,
}) => {
  let textColorClass = 'text-gray-700 hover:bg-gray-50 hover:text-gray-900';
  if (variant === 'danger') {
    textColorClass = 'text-red-700 hover:bg-red-50 hover:text-red-800';
  } else if (variant === 'warning') {
    textColorClass = 'text-amber-800 hover:bg-amber-50 hover:text-amber-900';
  } else if (variant === 'success') {
    textColorClass = 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800';
  }

  if (disabled) {
    textColorClass = 'text-gray-400 bg-gray-50 cursor-not-allowed';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick(e);
      }}
      className={`w-full px-3 py-2 text-xs font-medium flex items-center gap-2.5 transition-colors text-left ${textColorClass}`}
    >
      {icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
};

export interface RowActionMenuDividerProps {}
export const RowActionMenuDivider: React.FC<RowActionMenuDividerProps> = () => (
  <div className="border-t border-gray-100 my-1" />
);

export interface RowActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  align?: 'right' | 'left';
  minWidth?: number;
}

export const RowActionMenu: React.FC<RowActionMenuProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  align = 'right',
  minWidth = 200,
}) => {
  // Start with null coordinates so the menu is NEVER rendered at (0, 0)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Synchronously calculate layout coordinates before browser paint
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) {
      setCoords(null);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = minWidth;
    const menuHeight = menuRef.current?.offsetHeight || 220;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Normal placement: below trigger button
    let top = rect.bottom + 6;
    // Vertical collision check: if not enough space below, flip above trigger
    if (rect.bottom + menuHeight > viewportHeight - 12 && rect.top - menuHeight - 6 > 0) {
      top = Math.max(8, rect.top - menuHeight - 6);
    }

    // Horizontal placement: right-aligned with trigger right edge by default
    let left = rect.right - menuWidth;
    if (align === 'left') {
      left = rect.left;
    }

    // Boundary checks
    if (left < 8) left = 8;
    if (left + menuWidth > viewportWidth - 8) {
      left = Math.max(8, viewportWidth - menuWidth - 8);
    }

    setCoords({ top, left });
  }, [isOpen, triggerRef, align, minWidth]);

  useEffect(() => {
    if (!isOpen) return;

    // Close menu immediately on scroll or window resize to prevent floating/stale menus
    const handleScroll = () => onClose();
    const handleResize = () => onClose();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, triggerRef, onClose]);

  // Do NOT render the portal until position coordinates have been calculated
  if (!isOpen || !coords) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        minWidth: `${minWidth}px`,
        zIndex: 99999,
      }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 overflow-hidden"
    >
      {children}
    </div>,
    document.body
  );
};

export default RowActionMenu;
