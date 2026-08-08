import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumb?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumb,
  breadcrumbs,
  title,
  subtitle,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 ${className}`}>
      <div className="space-y-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 truncate">
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />}
                {item.href ? (
                  <a href={item.href} className="hover:text-slate-800 transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span className={idx === breadcrumbs.length - 1 ? 'font-bold text-slate-700' : ''}>
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : breadcrumb ? (
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 truncate">
            {breadcrumb}
          </div>
        ) : null}

        <h1 className="text-lg sm:text-xl font-extrabold text-[#121214] tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
};
export default PageHeader;
