import React from 'react';
import { LucideIcon } from 'lucide-react';

export type KpiVariant =
  | 'neutral'
  | 'gold'
  | 'pending'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'danger'
  | 'blue'
  | 'purple';

interface SummaryKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon | React.ReactNode;
  variant?: KpiVariant;
  className?: string;
}

const variantStyles: Record<
  KpiVariant,
  { border: string; icon: string }
> = {
  neutral: {
    border: 'border-l-4 border-l-slate-400 bg-white',
    icon: 'text-slate-600 bg-slate-100',
  },
  gold: {
    border: 'border-l-4 border-l-[#AB9570] bg-white',
    icon: 'text-[#AB9570] bg-[#AB9570]/10',
  },
  pending: {
    border: 'border-l-4 border-l-amber-500 bg-white',
    icon: 'text-amber-600 bg-amber-50',
  },
  active: {
    border: 'border-l-4 border-l-emerald-500 bg-white',
    icon: 'text-emerald-600 bg-emerald-50',
  },
  on_hold: {
    border: 'border-l-4 border-l-amber-500 bg-white',
    icon: 'text-amber-600 bg-amber-50',
  },
  completed: {
    border: 'border-l-4 border-l-purple-500 bg-white',
    icon: 'text-purple-600 bg-purple-50',
  },
  danger: {
    border: 'border-l-4 border-l-rose-500 bg-white',
    icon: 'text-rose-600 bg-rose-50',
  },
  blue: {
    border: 'border-l-4 border-l-blue-500 bg-white',
    icon: 'text-blue-600 bg-blue-50',
  },
  purple: {
    border: 'border-l-4 border-l-purple-500 bg-white',
    icon: 'text-purple-600 bg-purple-50',
  },
};

export const SummaryKpiCard: React.FC<SummaryKpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'gold',
  className = '',
}) => {
  const styles = variantStyles[variant] || variantStyles.gold;

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const Component = Icon as LucideIcon;
    return <Component className="w-3.5 h-3.5" />;
  };

  return (
    <div
      className={`p-3.5 rounded-xl border border-slate-200 shadow-xs transition-all hover:shadow-md flex flex-col justify-between min-h-[110px] ${styles.border} ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5 gap-1">
        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap truncate">
          {title}
        </span>
        <div className={`p-1.5 rounded-lg shrink-0 ${styles.icon}`}>
          {renderIcon()}
        </div>
      </div>
      <div>
        <div className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">
          {value}
        </div>
        {subtitle && (
          <div className="text-[9px] text-slate-500 font-medium truncate">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryKpiCard;
