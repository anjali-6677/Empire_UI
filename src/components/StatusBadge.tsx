import * as React from 'react';
import { formatStatusLabel, getStatusStyle } from '../utils/formatStatus';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const label = formatStatusLabel(status);
  const style = getStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.75 rounded border font-sans text-[10px] font-bold tracking-tight select-none whitespace-nowrap leading-none ${style.bg} ${style.text} ${style.border} ${className || ''}`}
    >
      <span className="w-1 h-1 rounded-full bg-current shrink-0 mr-1.5 opacity-90 animate-subtle-pulse"></span>
      {label}
    </span>
  );
};
