import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { safeFormatCurrency } from '../../utils/formatStatus';

export interface ReportColumnConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'badge' | 'date' | 'link';
  align?: 'left' | 'center' | 'right';
  getLink?: (row: any) => string;
  sortable?: boolean;
  sumTotal?: boolean;
}

interface ReportTableProps {
  columns: ReportColumnConfig[];
  rows: any[];
  pageSize?: number;
  emptyMessage?: string;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  columns,
  rows,
  pageSize = 10,
  emptyMessage = 'No matching report records found.',
}) => {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [rows.length]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedRows = React.useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  // Calculate totals footer row
  const totals = React.useMemo(() => {
    const totalsObj: Record<string, number> = {};
    columns.forEach((col) => {
      if (col.sumTotal) {
        totalsObj[col.key] = rows.reduce((sum, r) => sum + (Number(r[col.key]) || 0), 0);
      }
    });
    return totalsObj;
  }, [columns, rows]);

  const renderCellContent = (col: ReportColumnConfig, row: any) => {
    const val = row[col.key];

    if (val === null || val === undefined) return <span className="text-gray-300">-</span>;

    if (col.type === 'currency') {
      const num = Number(val) || 0;
      return <span className="font-mono font-bold text-gray-900">{safeFormatCurrency(num)}</span>;
    }

    if (col.type === 'percentage') {
      const num = Number(val) || 0;
      return <span className="font-mono font-bold text-gray-800">{num.toFixed(1)}%</span>;
    }

    if (col.type === 'number') {
      const num = Number(val) || 0;
      return <span className="font-mono text-gray-800">{num.toLocaleString('en-IN')}</span>;
    }

    if (col.type === 'badge') {
      return <StatusBadge status={String(val)} />;
    }

    if (col.type === 'link' && col.getLink) {
      return (
        <Link to={col.getLink(row)} className="text-brand-600 font-bold hover:underline">
          {String(val)}
        </Link>
      );
    }

    if (col.type === 'date') {
      const str = String(val).split('T')[0];
      return <span className="font-mono text-gray-600">{str}</span>;
    }

    return <span className="text-gray-800 font-medium">{String(val)}</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`p-3 select-none ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                    col.sortable !== false ? 'cursor-pointer hover:bg-gray-100 hover:text-gray-800 transition-colors' : ''
                  }`}
                >
                  <div
                    className={`inline-flex items-center gap-1 ${
                      col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                    }`}
                  >
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <span className="text-gray-400 shrink-0">
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="h-3 w-3 text-brand-600" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-brand-600" />
                          )
                        ) : (
                          <ArrowUpDown className="h-2.5 w-2.5 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-150">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-400 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-brand-50/30 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-3 whitespace-nowrap ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {renderCellContent(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          {/* Footer Summary Row */}
          {rows.length > 0 && Object.keys(totals).length > 0 && (
            <tfoot>
              <tr className="bg-gray-100/80 border-t-2 border-gray-300 font-extrabold text-gray-900 text-xs">
                {columns.map((col, idx) => (
                  <td
                    key={col.key}
                    className={`p-3 whitespace-nowrap ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {idx === 0 ? (
                      <span className="uppercase text-[10px] tracking-wider text-gray-600">Total / Portfolio Summary:</span>
                    ) : col.sumTotal ? (
                      col.type === 'currency' ? (
                        <span className="font-mono text-brand-700">{safeFormatCurrency(totals[col.key])}</span>
                      ) : col.type === 'percentage' ? (
                        <span className="font-mono">{(totals[col.key] / rows.length).toFixed(1)}%</span>
                      ) : (
                        <span className="font-mono">{totals[col.key].toLocaleString('en-IN')}</span>
                      )
                    ) : null}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedRows.length > pageSize && (
        <div className="p-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 no-print">
          <div>
            Showing <span className="font-bold text-gray-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-gray-800">{Math.min(currentPage * pageSize, sortedRows.length)}</span> of{' '}
            <span className="font-bold text-gray-800">{sortedRows.length}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-gray-250 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-bold font-mono text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-gray-250 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
