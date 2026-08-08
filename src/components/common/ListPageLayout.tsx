import React from 'react';

interface ListPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standardized full-width layout for all ERP List / Register pages.
 * Enforces:
 * - 100% available workspace width (no max-w centering limits)
 * - Consistent 20px horizontal & vertical padding
 * - Standardized 16-20px vertical gap between sections (Header -> Cards -> Filter -> Table)
 */
export const ListPageLayout: React.FC<ListPageLayoutProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`w-full max-w-none px-5 py-5 space-y-4 font-sans text-xs box-border select-none ${className}`}
      style={{ width: '100%', maxWidth: 'none' }}
    >
      {children}
    </div>
  );
};
