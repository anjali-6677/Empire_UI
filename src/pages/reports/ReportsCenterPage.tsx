import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  TrendingUp,
  Boxes,
  CreditCard,
  HardHat,
  ReceiptText,
  Search,
  ChevronRight,
  PieChart,
  CalendarDays,
  FileText,
  PackageCheck,
  ShieldCheck,
  Truck,
  Store,
  CheckCircle,
  TrendingDown,
  Download,
  Loader2,
  Filter,
  Building2,
  MapPin,
} from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { downloadProjectReportPDF } from '../../utils/projectPdfGenerator';
import { Project } from '../../domain/types';

interface ReportCardItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: any;
  badge?: string;
}

interface ReportCategoryGroup {
  id: string;
  title: string;
  description: string;
  icon: any;
  items: ReportCardItem[];
}

export const REPORT_CATEGORIES: ReportCategoryGroup[] = [
  {
    id: 'projects-commercial',
    title: 'Projects & Commercial Analytics',
    description: 'Contract values, baseline budgets, actual costs, expenditure breakdown, margin variance & billing milestones.',
    icon: Briefcase,
    items: [
      {
        id: 'pfs',
        title: 'Project Financial Summary',
        description: 'Contract values, baseline budgets, committed PO/WO costs, actual costs, billed revenue, and projected margins.',
        path: '/reports/projects/financial-summary',
        icon: BarChart3,
      },
      {
        id: 'pba',
        title: 'Project Budget vs Actual',
        description: 'Approved budget vs committed and actual expenditure with utilization percentage and threshold alerts.',
        path: '/reports/projects/budget-vs-actual',
        icon: BarChart3,
      },
      {
        id: 'pan',
        title: 'Project Analytics',
        description: 'Single-project 360-degree deep-dive report combining financials, procurement, stock, and billing.',
        path: '/reports/projects/analytics',
        icon: PieChart,
      },
      {
        id: 'peb',
        title: 'Project Expenditure Breakdown',
        description: 'Cost structure analysis split into material receipts, subcontractor certified bills, and direct project overheads.',
        path: '/reports/projects/expenditure',
        icon: BarChart3,
      },
      {
        id: 'pbm',
        title: 'Project Billing Milestones',
        description: 'Payment terms milestone trigger tracking, RA bill creation status, and client payment collection status.',
        path: '/reports/projects/billing-milestones',
        icon: CheckCircle,
      },
    ],
  },
  {
    id: 'procurement-vendors',
    title: 'Procurement & Vendor Performance',
    description: 'PO value tracking, supplier purchase volume, item unit rates, RFQ savings, and procurement cycle turnaround.',
    icon: TrendingUp,
    items: [
      {
        id: 'pur',
        title: 'Purchase Analysis',
        description: 'Ordered PO values, received material values, and pending delivery liabilities across project sites.',
        path: '/reports/procurement/purchase-analysis',
        icon: TrendingUp,
      },
      {
        id: 'vpa',
        title: 'Vendor Purchase Analysis',
        description: 'PO count, cumulative order values, received totals, and exposure metrics per registered vendor.',
        path: '/reports/procurement/vendor-analysis',
        icon: Store,
      },
      {
        id: 'mra',
        title: 'Material Rate Analysis',
        description: 'Unit rate trends across PO line items, comparing lowest, highest, and latest rates per material.',
        path: '/reports/procurement/material-rates',
        icon: TrendingDown,
      },
      {
        id: 'rfq',
        title: 'RFQ & Quotation Analysis',
        description: 'Invited vs received quotes, lowest bidder comparisons, and estimated vs awarded savings.',
        path: '/reports/procurement/rfq-analysis',
        icon: FileText,
      },
      {
        id: 'pca',
        title: 'Procurement Cycle Analysis',
        description: 'Lead times and days elapsed across Indent -> RFQ -> PO -> GRN fulfillment stages.',
        path: '/reports/procurement/cycle-analysis',
        icon: CalendarDays,
      },
    ],
  },
  {
    id: 'inventory-quality',
    title: 'Inventory & Quality Control',
    description: 'Goods receipt checks, quality inspections, stock ledger balances, site issues, and material consumption.',
    icon: Boxes,
    items: [
      {
        id: 'grn',
        title: 'GRN & Receiving Analysis',
        description: 'Material inward volume, accepted values, rejected quantities, and pending AP liabilities.',
        path: '/reports/inventory-quality/grn',
        icon: PackageCheck,
      },
      {
        id: 'qca',
        title: 'Quality Control Analysis',
        description: 'Inspection pass rates, rejection metrics, passed/failed counts, and admin override approvals.',
        path: '/reports/inventory-quality/qc',
        icon: ShieldCheck,
      },
      {
        id: 'stk',
        title: 'Stock Summary',
        description: 'Real-time opening, received, issued, returned, and available stock balances with valuation.',
        path: '/reports/inventory-quality/stock',
        icon: Boxes,
      },
      {
        id: 'mmc',
        title: 'Material Movement & Consumption',
        description: 'Site dispatches, site receiving, consumption logs, and site store returns.',
        path: '/reports/inventory-quality/movement',
        icon: Truck,
      },
    ],
  },
  {
    id: 'vendor-finance',
    title: 'Finance & Accounts Payable',
    description: 'Vendor AP liabilities, subcontractor WIP certifications, client RA billing, and receivable aging.',
    icon: CreditCard,
    items: [
      {
        id: 'vpay',
        title: 'Vendor Payable Analysis',
        description: 'Accounts payable liabilities, pending approvals, paid totals, overdue balances, and 30-60-90 day aging.',
        path: '/reports/finance/vendor-payables',
        icon: CreditCard,
      },
      {
        id: 'sca',
        title: 'Subcontractor Financial Analysis',
        description: 'Work order contract commitments, certified WIP, total billed, paid amounts, outstanding balances, and progress %.',
        path: '/reports/finance/subcontractors',
        icon: HardHat,
      },
      {
        id: 'cbr',
        title: 'Client Billing & Receivables',
        description: 'Contract values, total RA billed, received client payments, outstanding receivables, and overdue amounts.',
        path: '/reports/finance/client-billing',
        icon: ReceiptText,
      },
      {
        id: 'cra',
        title: 'Client Receivable Aging',
        description: 'Aging breakdown of client receivables into Current, 1-30, 31-60, 61-90, and 90+ days overdue buckets.',
        path: '/reports/finance/receivables',
        icon: CalendarDays,
      },
    ],
  },
];

export const ReportsCenterPage: React.FC = () => {
  const { state } = useERPStore();
  const [search, setSearch] = React.useState('');

  // Project Reports Register Filters & Pagination
  const [projectSearch, setProjectSearch] = React.useState('');
  const [projectStatusFilter, setProjectStatusFilter] = React.useState<string>('all');
  const [projectLocationFilter, setProjectLocationFilter] = React.useState<string>('all');
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [downloadingProjectId, setDownloadingProjectId] = React.useState<string | null>(null);

  const projects = state.projects || [];

  // Unique project locations for filter dropdown
  const uniqueLocations = React.useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.siteAddress) set.add(p.siteAddress);
    });
    return Array.from(set);
  }, [projects]);

  // Filtered project list
  const filteredProjects = React.useMemo(() => {
    return projects.filter((p: Project) => {
      // Keyword search matches project code, name, client, site location
      if (projectSearch.trim()) {
        const q = projectSearch.trim().toLowerCase();
        const matchesCode = (p.projectCode || '').toLowerCase().includes(q);
        const matchesName = (p.projectName || '').toLowerCase().includes(q);
        const matchesClient = (p.clientName || '').toLowerCase().includes(q);
        const matchesLoc = (p.siteAddress || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesClient && !matchesLoc) return false;
      }

      // Status Filter
      if (projectStatusFilter !== 'all') {
        const pStatus = (p.status || 'Active').toLowerCase();
        if (projectStatusFilter === 'active' && pStatus !== 'active' && pStatus !== 'in_progress') return false;
        if (projectStatusFilter === 'on_hold' && pStatus !== 'on_hold' && pStatus !== 'on hold') return false;
        if (projectStatusFilter === 'completed' && pStatus !== 'completed' && pStatus !== 'closed') return false;
      }

      // Location Filter
      if (projectLocationFilter !== 'all') {
        if (p.siteAddress !== projectLocationFilter) return false;
      }

      return true;
    });
  }, [projects, projectSearch, projectStatusFilter, projectLocationFilter]);

  // Paginated Project List
  const paginatedProjects = React.useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredProjects.slice(startIdx, startIdx + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;

  // On-demand PDF Download Handler
  const handleDownloadPDF = async (projectId: string) => {
    try {
      setDownloadingProjectId(projectId);
      await downloadProjectReportPDF(state, projectId);
    } catch (error) {
      console.error('Error generating project PDF report:', error);
      alert('Unable to generate project report. Please try again.');
    } finally {
      setDownloadingProjectId(null);
    }
  };

  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return REPORT_CATEGORIES;
    const q = search.trim().toLowerCase();

    return REPORT_CATEGORIES.map((cat) => {
      const matchingItems = cat.items.filter(
        (item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
      if (cat.title.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q)) {
        return cat;
      }
      if (matchingItems.length > 0) {
        return { ...cat, items: matchingItems };
      }
      return null;
    }).filter(Boolean) as ReportCategoryGroup[];
  }, [search]);

  const fmtCurrency = (amt: number | undefined | null) => {
    if (amt === undefined || amt === null) return '₹0';
    if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)} L`;
    return `₹${Math.round(amt).toLocaleString('en-IN')}`;
  };

  const fmtDate = (dStr?: string) => {
    if (!dStr) return 'N/A';
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans text-xs pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-700/50 border border-brand-500/30 rounded-full text-[11px] font-bold text-amber-300 mb-2">
            <BarChart3 className="h-3.5 w-3.5" /> Empire ERP Central Analytics
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Reports & Business Intelligence</h1>
          <p className="text-xs text-brand-200 font-medium max-w-2xl mt-1">
            Real-time, connected analytics across project financials, procurement, inventory, quality control, vendor payables, subcontractors, and client receivables.
          </p>
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search report by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-gray-300 focus:outline-none focus:bg-white/20 focus:border-amber-400 font-medium transition-all"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* NEW: PROJECT REPORTS REGISTER SECTION                            */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Project Reports</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Download a complete project-level report covering commercial, procurement, inventory, subcontractor, billing and financial activity.
            </p>
          </div>
          <div className="text-[11px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shrink-0 self-start sm:self-auto">
            Total Projects: <span className="text-brand-700">{filteredProjects.length}</span>
          </div>
        </div>

        {/* Compact Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 bg-gray-50/70 p-3 rounded-lg border border-gray-200 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Project / Client / City..."
              value={projectSearch}
              onChange={(e) => {
                setProjectSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-250 rounded font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-500 text-xs"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <select
              value={projectStatusFilter}
              onChange={(e) => {
                setProjectStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-250 rounded p-1.5 font-medium text-gray-800 focus:outline-none focus:border-brand-500 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active / In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <select
              value={projectLocationFilter}
              onChange={(e) => {
                setProjectLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-250 rounded p-1.5 font-medium text-gray-800 focus:outline-none focus:border-brand-500 text-xs"
            >
              <option value="all">All Locations / Cities</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center justify-end gap-2 text-[11px] font-bold text-gray-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-250 rounded px-2 py-1 text-xs font-bold text-gray-800"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Projects Data Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-gray-100/80 border-b border-gray-200 text-[10.5px] font-extrabold text-gray-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">PROJECT</th>
                <th className="py-2.5 px-3">CLIENT</th>
                <th className="py-2.5 px-3">LOCATION</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
                <th className="py-2.5 px-3 text-center">PROGRESS</th>
                <th className="py-2.5 px-3 text-right">CONTRACT VALUE</th>
                <th className="py-2.5 px-3">START DATE</th>
                <th className="py-2.5 px-3">TARGET COMPLETION</th>
                <th className="py-2.5 px-3 text-center">REPORT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedProjects.length > 0 ? (
                paginatedProjects.map((p: Project) => {
                  const isDownloading = downloadingProjectId === p.id;
                  const progressPct = (p as any).overallProgress || (p as any).progress || 0;
                  const contractVal = (p as any).contractValue || p.acceptedQuotationValue || p.currentBOQValue || p.budgetBaseline || 0;
                  const statusLabel = String(p.status || 'Active').toUpperCase();

                  let statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (statusLabel.includes('HOLD')) statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  if (statusLabel.includes('COMPLET') || statusLabel.includes('CLOSED'))
                    statusBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Project Code & Name */}
                      <td className="py-2.5 px-3 font-medium">
                        <span className="font-mono font-bold text-brand-700 block text-[11px]">
                          {p.projectCode || 'PRJ-2026'}
                        </span>
                        <span className="font-bold text-gray-900 block">{p.projectName}</span>
                      </td>

                      {/* Client */}
                      <td className="py-2.5 px-3 font-semibold text-gray-800">
                        {p.clientName || 'Client Name N/A'}
                      </td>

                      {/* Location */}
                      <td className="py-2.5 px-3 font-medium text-gray-600">
                        {p.siteAddress || 'Site Headquarters'}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadgeClass}`}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex flex-col items-center gap-1 w-20 mx-auto">
                          <span className="font-mono font-bold text-[11px] text-gray-800">{progressPct}%</span>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Contract Value */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 text-xs">
                        {fmtCurrency(contractVal)}
                      </td>

                      {/* Start Date */}
                      <td className="py-2.5 px-3 font-mono text-gray-600 text-[11px]">
                        {fmtDate(p.startDate || p.createdAt)}
                      </td>

                      {/* Target Completion */}
                      <td className="py-2.5 px-3 font-mono text-gray-600 text-[11px]">
                        {fmtDate(p.targetCompletionDate || (p as any).endDate || p.createdAt)}
                      </td>

                      {/* Download PDF Button */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(p.id)}
                          disabled={Boolean(downloadingProjectId)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-xs transition-all shadow-sm cursor-pointer ${
                            isDownloading
                              ? 'bg-brand-100 text-brand-700 cursor-not-allowed border border-brand-300'
                              : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95'
                          }`}
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500 font-medium">
                    No projects found matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 border-t border-gray-150 pt-3 text-xs">
            <span className="text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-gray-900">{Math.min(currentPage * pageSize, filteredProjects.length)}</span> of{' '}
              <span className="font-bold text-gray-900">{filteredProjects.length}</span> projects
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded font-bold border border-gray-250 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-bold text-gray-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded font-bold border border-gray-250 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Categorized Report Grid */}
      <div className="flex flex-col gap-8">
        {filteredCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <div className="p-1.5 bg-brand-50 text-brand-700 rounded border border-brand-200">
                  <CategoryIcon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">{category.title}</h2>
                  <p className="text-[11px] text-gray-500 font-medium">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className="group bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="p-2 rounded-md bg-gray-50 text-gray-700 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                            <ItemIcon className="h-4 w-4" />
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <h3 className="text-xs font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{item.title}</h3>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1 line-clamp-3">{item.description}</p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-brand-600 group-hover:underline">
                        <span>View Connected Report</span>
                        <span>&rarr;</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
