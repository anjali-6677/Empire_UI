import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  MoreHorizontal,
  Inbox
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../utils/cn';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnId?: string;
  actions?: {
    label: string;
    onClick: (row: TData) => void;
    icon?: React.ReactNode;
  }[];
  stickyActions?: boolean;
  scrollResetKey?: string | number;
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchColumnId,
  actions,
  stickyActions = false,
  scrollResetKey
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [activeMenuRowId, setActiveMenuRowId] = React.useState<string | null>(null);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5
      }
    }
  });

  const pageIndex = table.getState().pagination.pageIndex;

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [scrollResetKey, pageIndex]);

  return (
    <div className="w-full space-y-3 font-sans text-xs">
      {searchColumnId && (
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search className="h-4 w-4 stroke-[1.75]" />
          </span>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all font-sans font-medium"
          />
        </div>
      )}

      <div className="bg-white border border-gray-150 rounded-lg shadow-sm overflow-hidden select-none">
        <div ref={scrollContainerRef} className="w-full overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-left text-xs text-gray-600 font-sans min-w-[500px]">
            <thead className="bg-white border-b border-gray-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'py-3 px-4 font-semibold select-none text-slate-500 text-[11px]',
                          isSortable && 'cursor-pointer hover:bg-gray-50 hover:text-slate-900 transition-colors'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && <ArrowUpDown className="h-3 w-3 text-slate-400" />}
                        </div>
                      </th>
                    );
                  })}
                  {actions && (
                    <th
                      className={cn(
                        'py-3 px-4 font-semibold text-slate-500 text-[11px] text-right',
                        stickyActions
                          ? 'sticky right-0 z-20 bg-white border-l border-gray-200 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] pr-5'
                          : 'w-16'
                      )}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-gray-750">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="group hover:bg-gray-55/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4 align-middle whitespace-nowrap text-[11px] font-medium text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}

                    {actions && (
                      <td
                        className={cn(
                          'py-3 px-4 align-middle text-right whitespace-nowrap',
                          stickyActions &&
                            'sticky right-0 z-10 bg-white group-hover:bg-gray-55/40 border-l border-gray-150 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] pr-5 pointer-events-auto'
                        )}
                      >
                        <DropdownMenu.Root
                          open={activeMenuRowId === row.id}
                          onOpenChange={(open) => setActiveMenuRowId(open ? row.id : null)}
                        >
                          <DropdownMenu.Trigger asChild>
                            <button
                              type="button"
                              className="h-8 w-8 inline-flex items-center justify-center p-1 text-gray-400 hover:text-gray-900 bg-white border border-transparent hover:border-gray-200 rounded transition-all focus:outline-none focus:ring-1 focus:ring-brand-500/50 cursor-pointer pointer-events-auto"
                              aria-label={`Actions for record ${row.id}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              align="end"
                              sideOffset={6}
                              collisionPadding={12}
                              className="z-[1000] min-w-[170px] bg-white border border-gray-150 rounded shadow-md py-1 flex flex-col font-sans text-left text-xs focus:outline-none animate-in fade-in-80 zoom-in-95"
                            >
                              {actions.map((action, idx) => (
                                <DropdownMenu.Item
                                  key={idx}
                                  onSelect={() => {
                                    action.onClick(row.original);
                                    setActiveMenuRowId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-gray-650 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 cursor-pointer font-medium focus:outline-none focus:bg-gray-50"
                                >
                                  {action.icon}
                                  {action.label}
                                </DropdownMenu.Item>
                              ))}
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="py-10 px-4 text-center">
                    <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 rounded bg-gray-50/50">
                      <Inbox className="h-8 w-8 text-gray-300 stroke-[1.5] mb-2" />
                      <h4 className="text-[11px] font-bold text-gray-700">No records found</h4>
                      <p className="text-[10px] text-gray-400 max-w-xs mt-0.5 leading-normal">
                        No matches were found. Try adjusting or clearing search parameters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {table.getRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-150 bg-gray-50/50 px-4 py-2.5 text-[10.5px] text-gray-450 font-sans font-bold">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
              <span className="text-gray-300">|</span>
              <span>Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} records</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all focus:outline-none cursor-pointer"
                aria-label="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1 rounded bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all focus:outline-none cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all focus:outline-none cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-1 rounded bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all focus:outline-none cursor-pointer"
                aria-label="Last page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
