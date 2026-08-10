import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

interface PortalDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  align?: 'right' | 'left';
  minWidth?: number;
}

export const PortalDropdownMenu: React.FC<PortalDropdownMenuProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  align = 'right',
  minWidth = 180,
}) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) {
      setPosition(null);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = minWidth;
    const menuHeight = menuRef.current?.offsetHeight || 220;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + 6;
    if (rect.bottom + menuHeight > viewportHeight - 12 && rect.top - menuHeight - 6 > 0) {
      top = Math.max(8, rect.top - menuHeight - 6);
    }

    let left = rect.right - menuWidth;
    if (align === 'left') {
      left = rect.left;
    }

    if (left < 8) left = 8;
    if (left + menuWidth > viewportWidth - 8) {
      left = Math.max(8, viewportWidth - menuWidth - 8);
    }

    setPosition({ top, left });
  }, [isOpen, triggerRef, align, minWidth]);

  useEffect(() => {
    if (!isOpen) return;

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

  if (!isOpen || !position) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: `${minWidth}px`,
        zIndex: 99999,
      }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 py-1 overflow-hidden"
    >
      {children}
    </div>,
    document.body
  );
};
