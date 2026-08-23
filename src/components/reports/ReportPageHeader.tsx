import * as React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, FileSpreadsheet, Printer } from 'lucide-react';

interface ReportPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: string[];
  onExportCSV: () => void;
  onPrint: () => void;
  disableExport?: boolean;
  hideBreadcrumbs?: boolean;
}

export const ReportPageHeader: React.FC<ReportPageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  onExportCSV,
  onPrint,
  disableExport = false,
  hideBreadcrumbs = false,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full border-b border-gray-200 pb-4">
      {/* Breadcrumbs */}
      {!hideBreadcrumbs && (
        <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase no-print">
          <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <Link to="/reports" className="hover:text-brand-600 transition-colors">
            Reports
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className={idx === breadcrumbs.length - 1 ? 'text-gray-700 font-bold' : ''}>{crumb}</span>
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
          {description && <p className="text-xs text-gray-500 font-medium mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={onExportCSV}
            disabled={disableExport}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md font-bold text-xs shadow-sm transition-all cursor-pointer ${
              disableExport
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
            }`}
            title="Export filtered dataset to CSV file"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={onPrint}
            disabled={disableExport}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md font-bold text-xs shadow-sm transition-all cursor-pointer ${
              disableExport
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
            }`}
            title="Print report or save to PDF"
          >
            <Printer className="h-3.5 w-3.5 text-rose-600" /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};
