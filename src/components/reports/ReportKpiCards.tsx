import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { safeFormatCurrency } from '../../utils/formatStatus';

export interface KpiCardConfig {
  id: string;
  label: string;
  value: number | string;
  type?: 'currency' | 'number' | 'percentage' | 'text';
  icon?: LucideIcon;
  subtext?: string;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

interface ReportKpiCardsProps {
  cards: KpiCardConfig[];
}

export const ReportKpiCards: React.FC<ReportKpiCardsProps> = ({ cards }) => {
  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case 'brand':
        return { bg: 'bg-brand-50/50', border: 'border-brand-200', text: 'text-brand-700', iconBg: 'bg-brand-100 text-brand-700' };
      case 'success':
        return { bg: 'bg-emerald-50/50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-700' };
      case 'warning':
        return { bg: 'bg-amber-50/50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100 text-amber-700' };
      case 'danger':
        return { bg: 'bg-rose-50/50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-100 text-rose-700' };
      case 'info':
        return { bg: 'bg-sky-50/50', border: 'border-sky-200', text: 'text-sky-700', iconBg: 'bg-sky-100 text-sky-700' };
      default:
        return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900', iconBg: 'bg-gray-100 text-gray-600' };
    }
  };

  const formatValue = (card: KpiCardConfig) => {
    if (typeof card.value === 'string') return card.value;
    if (card.type === 'currency') return safeFormatCurrency(card.value);
    if (card.type === 'percentage') return `${card.value}%`;
    return card.value.toLocaleString('en-IN');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
      {cards.map((card) => {
        const styles = getVariantStyles(card.variant);
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className={`p-3.5 rounded-lg border shadow-sm flex flex-col justify-between transition-all hover:shadow ${styles.bg} ${styles.border}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider line-clamp-1">{card.label}</span>
              {Icon && (
                <div className={`p-1.5 rounded-md ${styles.iconBg} shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="mt-2">
              <div className={`text-base sm:text-lg font-extrabold tracking-tight font-mono ${styles.text}`}>
                {formatValue(card)}
              </div>
              {card.subtext && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{card.subtext}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
