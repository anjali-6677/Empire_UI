import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  LineChart,
  Line,
} from 'recharts';
import {
  ChevronDown,
  ChevronUp,
  Bell,
  Clock,
  DollarSign,
  Wallet,
  FileText,
  ShoppingCart,
  Truck,
  CheckSquare,
  ShieldAlert,
  Building2,
  HardHat,
  Store,
  Package,
  TrendingUp,
  Calendar,
  FileCheck2,
  Activity,
  AlertTriangle,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import { ExecutiveDashboardData } from '../utils/dashboardCalculators';
import { safeFormatCurrency } from '../utils/formatStatus';

export function navigateWithFilter(
  navigate: (path: string, options?: any) => void,
  route: string,
  filterParams?: Record<string, string>
) {
  if (!filterParams) {
    navigate(route);
    return;
  }
  const query = new URLSearchParams(filterParams).toString();
  navigate(`${route}${query ? `?${query}` : ''}`, { state: filterParams });
}

interface SectionWrapperProps {
  id: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  description,
  defaultOpen = true,
  badge,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <section
      id={id}
      className="bg-white border border-gray-200 rounded-lg shadow-sm font-sans scroll-mt-24 overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-200 bg-gray-50/70 cursor-pointer select-none hover:bg-gray-100/60 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs sm:text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2 uppercase">
            {title}
          </h2>
          {badge && (
            <span className="text-[9.5px] font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {description && (
            <p className="hidden md:block text-[10.5px] text-gray-500 font-medium mr-2">
              {description}
            </p>
          )}
          <button
            type="button"
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none"
            aria-expanded={isOpen}
            aria-label={`Toggle section ${title}`}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen && <div className="p-4 sm:p-5 space-y-5">{children}</div>}
    </section>
  );
};

// ============================================================================
// SECTION 1: Executive KPI Summary
// ============================================================================
export const ExecutiveKpiSummarySection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const navigate = useNavigate();
  const kpis = data.kpis;

  const cards = [
    {
      label: 'Active Projects',
      value: `${kpis.activeProjectsCount} / ${kpis.totalProjectsCount}`,
      sub: 'Site execution active',
      icon: Building2,
      variant: 'brand',
      onClick: () => navigateWithFilter(navigate, '/projects', { status: 'active' }),
    },
    {
      label: 'Total Contract Value',
      value: safeFormatCurrency(kpis.totalContractValue),
      sub: 'Accepted BOQ value',
      icon: FileText,
      variant: 'gold',
      onClick: () => navigateWithFilter(navigate, '/reports/project-financial'),
    },
    {
      label: 'Approved Budget',
      value: safeFormatCurrency(kpis.approvedBudget),
      sub: 'Baseline cost budget',
      icon: Wallet,
      variant: 'default',
      onClick: () => navigateWithFilter(navigate, '/reports/project-financial'),
    },
    {
      label: 'Committed Cost',
      value: safeFormatCurrency(kpis.committedCost),
      sub: 'POs + Subcontract WOs',
      icon: ShoppingCart,
      variant: 'warning',
      onClick: () => navigateWithFilter(navigate, '/procurement/purchase-orders'),
    },
    {
      label: 'Actual Cost',
      value: safeFormatCurrency(kpis.actualCost),
      sub: 'GRNs + SC Bills',
      icon: DollarSign,
      variant: 'danger',
      onClick: () => navigateWithFilter(navigate, '/inventory/grns'),
    },
    {
      label: 'Client Billed',
      value: safeFormatCurrency(kpis.clientBilled),
      sub: 'Net RA billed to clients',
      icon: FileCheck2,
      variant: 'info',
      onClick: () => navigateWithFilter(navigate, '/finance/client-ra-bills'),
    },
    {
      label: 'Client Received',
      value: safeFormatCurrency(kpis.clientReceived),
      sub: 'Cleared in bank account',
      icon: TrendingUp,
      variant: 'success',
      onClick: () => navigateWithFilter(navigate, '/finance/client-ra-bills', { paymentStatus: 'Paid' }),
    },
    {
      label: 'Client Outstanding',
      value: safeFormatCurrency(kpis.clientOutstanding),
      sub: 'Pending collection',
      icon: Clock,
      variant: 'warning',
      onClick: () => navigateWithFilter(navigate, '/finance/client-ra-bills', { paymentStatus: 'Payment Pending' }),
    },
    {
      label: 'Vendor & SC Payable',
      value: safeFormatCurrency(kpis.totalPayable),
      sub: 'Total unpaid liability',
      icon: Store,
      variant: 'danger',
      onClick: () => navigateWithFilter(navigate, '/finance/accounts-payable', { status: 'Pending' }),
    },
    {
      label: 'Gross Profit',
      value: safeFormatCurrency(kpis.grossProfit),
      sub: 'Contract - Actual Cost',
      icon: DollarSign,
      variant: 'success',
      onClick: () => navigateWithFilter(navigate, '/reports/project-margin'),
    },
    {
      label: 'Projected Margin %',
      value: `${kpis.marginPct}%`,
      sub: 'Gross profit margin',
      icon: TrendingUp,
      variant: 'brand',
      onClick: () => navigateWithFilter(navigate, '/reports/project-margin'),
    },
    {
      label: 'Pending Approvals',
      value: kpis.pendingApprovalsCount,
      sub: 'Action required queue',
      icon: ShieldAlert,
      variant: 'danger',
      onClick: () => navigateWithFilter(navigate, '/procurement/indent-approvals'),
    },
  ];

  return (
    <div className="space-y-5 font-sans">
      {/* 6 to 12 Top KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={card.onClick}
              className="p-3.5 border border-gray-200 rounded-lg bg-white hover:border-brand-400 hover:shadow-md transition-all text-left group flex flex-col justify-between h-[105px] focus:outline-none"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-gray-500 group-hover:text-brand-700 transition-colors truncate">
                  {card.label}
                </span>
                <div className="p-1 rounded bg-gray-50 group-hover:bg-brand-50 border border-gray-100 transition-colors shrink-0">
                  <Icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-brand-700" />
                </div>
              </div>

              <div>
                <span className="font-extrabold text-sm sm:text-base text-gray-900 block tracking-tight font-mono">
                  {card.value}
                </span>
                <span className="text-[9px] font-semibold text-gray-400 block mt-0.5 truncate">
                  {card.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ONE Large Full-Width Portfolio Financial Comparison Graph */}
      <div className="p-5 sm:p-6 border border-gray-200 rounded-xl bg-white space-y-3 shadow-xs w-full">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-brand-600" /> PORTFOLIO FINANCIAL COMPARISON (TOP 8 ACTIVE SITES)
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Approved Baseline Budget vs Actual Outlay vs Client Billing across Active Projects
            </p>
          </div>
          <span className="text-xs font-bold text-brand-800 bg-brand-50 border border-brand-200 px-3 py-1 rounded-md">
            {data.isPortfolioMode ? 'Top 8 Active Sites' : data.selectedProjectName}
          </span>
        </div>

        <div className="h-[380px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.projectComparisonData} margin={{ top: 15, right: 25, left: 15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} angle={-10} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip content={<CustomPortfolioTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="approvedBudget" name="Approved Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualCost" name="Actual Outlay" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clientBilled" name="Client Billing" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const CustomPortfolioTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-gray-900 text-white p-3.5 rounded-xl shadow-xl border border-gray-700 text-xs font-sans space-y-1.5 min-w-[240px]">
        <div className="font-extrabold text-brand-300 text-sm border-b border-gray-700 pb-1">
          {item.fullName}
        </div>
        <div className="text-[10.5px] text-gray-400 font-mono font-semibold">
          Project Code: {item.code}
        </div>
        <div className="space-y-1 pt-1 font-mono text-[11px]">
          <div className="flex justify-between items-center text-blue-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> Approved Budget:</span>
            <span className="font-bold">{safeFormatCurrency(item.approvedBudget)}</span>
          </div>
          <div className="flex justify-between items-center text-rose-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/> Actual Outlay:</span>
            <span className="font-bold">{safeFormatCurrency(item.actualCost)}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> Client Billing:</span>
            <span className="font-bold">{safeFormatCurrency(item.clientBilled)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CircularProgressCard: React.FC<{
  label: string;
  pct: number;
  sublabel: string;
  colorHex: string;
}> = ({ label, pct, sublabel, colorHex }) => {
  const radius = 38;
  const strokeWidth = 7.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;

  const getSemanticBadgeClass = (val: number) => {
    if (val >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (val >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (val >= 25) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs hover:border-brand-400 hover:shadow-md transition-all flex flex-col items-center justify-between text-center group font-sans">
      <div className="w-full flex items-center justify-between gap-1 mb-1">
        <span className="text-[10.5px] font-extrabold text-gray-800 uppercase tracking-tight truncate">
          {label}
        </span>
        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${getSemanticBadgeClass(pct)}`}>
          {pct}%
        </span>
      </div>

      <div className="relative w-24 h-24 my-2 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={colorHex}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-extrabold text-gray-900 font-mono tracking-tighter">
            {pct}%
          </span>
          <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">
            Target
          </span>
        </div>
      </div>

      <div className="w-full pt-2 border-t border-gray-100">
        <span className="text-[9.5px] font-semibold text-gray-500 block truncate">
          {sublabel}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 2: Project Performance & Gantt Timeline
// ============================================================================
export const ProjectPerformanceGanttSection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const perf = data.performanceProgress;
  const gantt = data.ganttMilestones;
  const isPortfolio = data.isPortfolioMode;

  const metrics = [
    { label: 'Time Progress', pct: perf.timeElapsedPct, sublabel: `Time Elapsed: ${perf.timeElapsedPct}%`, colorHex: '#3b82f6' },
    { label: 'Site Execution', pct: perf.siteExecutionPct, sublabel: `Physical BOQ: ${perf.siteExecutionPct}%`, colorHex: '#ab9570' },
    { label: 'Procurement Outlay', pct: perf.procurementPct, sublabel: `POs Committed: ${perf.procurementPct}%`, colorHex: '#6366f1' },
    { label: 'Material Receipt', pct: perf.materialReceiptPct, sublabel: `GRNs Logged: ${perf.materialReceiptPct}%`, colorHex: '#f59e0b' },
    { label: 'Client Billing', pct: perf.billingPct, sublabel: `RA Bills Claimed: ${perf.billingPct}%`, colorHex: '#0284c7' },
    { label: 'Client Collection', pct: perf.collectionPct, sublabel: `Payments Cleared: ${perf.collectionPct}%`, colorHex: '#10b981' },
    { label: 'Vendor Payment', pct: perf.vendorPaymentPct, sublabel: `AP Invoices Settled: ${perf.vendorPaymentPct}%`, colorHex: '#8b5cf6' },
    { label: 'Budget Outlay', pct: perf.budgetConsumptionPct, sublabel: `Budget Outlay: ${perf.budgetConsumptionPct}%`, colorHex: '#e11d48' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* PROJECT PERFORMANCE INDEX (8 Circular Progress Indicators) */}
      <div className="p-5 sm:p-6 border border-gray-200 rounded-xl bg-white space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-brand-600" /> PROJECT PERFORMANCE INDEX
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Current operational progress across 8 core project and financial metrics.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-800 bg-brand-50 border border-brand-200 px-3 py-1 rounded-md">
            8 CORE METRICS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          {metrics.map((m, idx) => (
            <CircularProgressCard
              key={idx}
              label={m.label}
              pct={m.pct}
              sublabel={m.sublabel}
              colorHex={m.colorHex}
            />
          ))}
        </div>
      </div>

      {/* Row 2: Visual Gantt Timeline Chart (100% Full Width) */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-4 shadow-sm w-full">
        <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-600" />
              {isPortfolio ? 'Portfolio Work Package Gantt Schedule' : `Project Schedule & Milestone Gantt (${data.selectedProjectName})`}
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">Visual project timeline spanning planned work packages, milestones, and completion status.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[9.5px] font-semibold text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Completed
            </span>
            <span className="flex items-center gap-1 text-[9.5px] font-semibold text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block"></span> In Progress
            </span>
            <span className="flex items-center gap-1 text-[9.5px] font-semibold text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span> Upcoming
            </span>
            <span className="text-[9.5px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded ml-2">
              {isPortfolio ? 'All Projects' : 'Project Filtered'}
            </span>
          </div>
        </div>

        {/* Visual Gantt Matrix */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px] text-xs font-sans">
            {/* Gantt Header Month Scale */}
            <div className="grid grid-cols-12 gap-1 bg-gray-100 p-2 rounded-t-lg font-bold text-[10px] text-gray-600 uppercase border-b border-gray-200">
              <div className="col-span-4">Work Package & Owner</div>
              <div className="col-span-1 text-center">Dates</div>
              <div className="col-span-6 grid grid-cols-6 text-center">
                <div>May 26</div>
                <div>Jun 26</div>
                <div>Jul 26</div>
                <div>Aug 26</div>
                <div>Sep 26</div>
                <div>Oct 26</div>
              </div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Gantt Rows */}
            <div className="divide-y divide-gray-100 border-x border-b border-gray-200 rounded-b-lg bg-white">
              {gantt.map((m, idx) => {
                // Calculate visual offsets for timeline bar
                const startMonthIdx = idx % 3; // 0=May, 1=Jun, 2=Jul
                const duration = Math.min(5, 2 + (idx % 3)); // 2-4 months duration
                const offsetCols = startMonthIdx;
                
                return (
                  <div key={m.id} className="grid grid-cols-12 gap-1 p-2.5 items-center hover:bg-gray-50/80 transition-colors">
                    {/* Column 1: Package Name & Phase */}
                    <div className="col-span-4 pr-2">
                      <div className="font-bold text-gray-900 text-xs truncate">{m.name}</div>
                      <div className="text-[9.5px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                        <span className="px-1.5 py-0.2 bg-gray-100 border border-gray-200 rounded text-gray-600 font-bold">{m.phase}</span>
                        <span>•</span>
                        <span>{m.owner}</span>
                      </div>
                    </div>

                    {/* Column 2: Planned Dates */}
                    <div className="col-span-1 text-center font-mono text-[9.5px] text-gray-500">
                      <div>{m.plannedStart ? m.plannedStart.substring(5) : '05-01'}</div>
                      <div className="text-[8.5px] text-gray-400">to {m.plannedEnd ? m.plannedEnd.substring(5) : '09-30'}</div>
                    </div>

                    {/* Column 3: Visual Timeline Bar spanning months */}
                    <div className="col-span-6 grid grid-cols-6 items-center h-7 relative px-1 bg-gray-50/60 rounded">
                      <div 
                        className="h-5 rounded-full relative overflow-hidden flex items-center justify-between px-2 text-[9px] font-bold text-white shadow-xs transition-all duration-300"
                        style={{
                          gridColumnStart: offsetCols + 1,
                          gridColumnEnd: `span ${duration}`,
                          backgroundColor: m.status === 'Completed' ? '#10b981' : m.status === 'In Progress' ? '#ab9570' : '#3b82f6'
                        }}
                      >
                        {/* Progress overlay */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-black/20 rounded-full"
                          style={{ width: `${m.progress}%` }}
                        />
                        <span className="relative z-10 font-sans truncate pr-1">{m.progress}%</span>
                        <span className="relative z-10 font-mono text-[8px] opacity-90">{m.phase}</span>
                      </div>
                    </div>

                    {/* Column 4: Status Badge */}
                    <div className="col-span-1 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          m.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.status === 'In Progress'
                            ? 'bg-brand-50 text-brand-700 border border-brand-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 3: Commercial Position
// ============================================================================
export const CommercialPositionSection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const tender = data.tenderSummary;
  const waterfall = data.waterfallData;
  const budgetVsActual = data.budgetVsActualByCategory;
  const expComp = data.expenditureComposition;
  const profitTrend = data.profitTrendMonthly;

  return (
    <div className="space-y-5 font-sans">
      {/* ROW 1: Revenue & Profit Trend (100% Full-Width Line Chart - Requirement 4) */}
      <div className="p-5 sm:p-6 border border-gray-200 rounded-xl bg-white space-y-3 shadow-xs w-full">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-600" /> REVENUE & PROFIT TREND
            </h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Monthly Recognized Client Billed Revenue vs Actual Cost & Gross Margin (May - Oct 2026)
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
            Portfolio Financial Trajectory
          </span>
        </div>
        <div className="h-[380px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitTrend} margin={{ top: 15, right: 25, left: 15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: number) => [safeFormatCurrency(v), '']} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="billedRevenue" name="Client Billed Revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="actualCost" name="Actual Recognized Cost" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="grossProfit" name="Gross Profit Surplus" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2: 50% / 50% Split (Cost Composition Donut + Tender Position) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut: Cost Composition */}
        <div className="p-5 border border-gray-200 rounded-xl bg-white space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <PieChartIcon className="h-4 w-4 text-brand-600" /> Cost Composition Donut
            </h4>
            <span className="text-[9.5px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
              Outlay Breakdown
            </span>
          </div>
          <div className="h-[320px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expComp} cx="50%" cy="48%" innerRadius={55} outerRadius={90} paddingAngle={5} dataKey="value">
                  {expComp.map((entry, index) => (
                    <Cell key={`exp-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [safeFormatCurrency(val), 'Cost Share']} contentStyle={{ fontSize: '11.5px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '10.5px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tender & Extra Item Position Summary */}
        <div className="p-5 border border-gray-200 rounded-xl bg-white space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                Tender Bidding & Commercial Variation Claims
              </h4>
              <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Win Rate: {tender.winRatePct}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-[9.5px] uppercase font-bold text-gray-400 block">Submitted Tenders</span>
                <span className="font-extrabold text-sm text-gray-900 font-mono mt-1 block">{safeFormatCurrency(tender.submittedValue)}</span>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <span className="text-[9.5px] uppercase font-bold text-emerald-700 block">Awarded / Won</span>
                <span className="font-extrabold text-sm text-emerald-900 font-mono mt-1 block">{safeFormatCurrency(tender.approvedValue)}</span>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                <span className="text-[9.5px] uppercase font-bold text-amber-700 block">Pending Decision</span>
                <span className="font-extrabold text-sm text-amber-900 font-mono mt-1 block">{safeFormatCurrency(tender.pendingValue)}</span>
              </div>
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                <span className="text-[9.5px] uppercase font-bold text-rose-700 block">Lost Opportunities</span>
                <span className="font-extrabold text-sm text-rose-900 font-mono mt-1 block">{safeFormatCurrency(tender.lostValue)}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-brand-50/70 border border-brand-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-brand-900 block text-xs">Commercial Extra Work & Variation Claims</span>
              <span className="text-[10px] text-gray-500 font-medium">4 variation orders submitted for client approval</span>
            </div>
            <span className="font-extrabold text-brand-800 font-mono text-sm">₹14.50 L</span>
          </div>
        </div>
      </div>

      {/* ROW 3: 50% / 50% Split (Financial Waterfall + Budget Baseline vs Actual) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Waterfall Chart: Financial Margin Waterfall */}
        <div className="p-5 border border-gray-200 rounded-xl bg-white space-y-2 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-brand-600" /> Commercial Financial Waterfall
              </h4>
              <p className="text-[10px] text-gray-400 font-medium">Contract Revenue &rarr; Direct Material & Subcontractor Deductions &rarr; Gross Profit.</p>
            </div>
            <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Margin Waterfall
            </span>
          </div>
          <div className="h-[300px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfall} margin={{ top: 10, right: 15, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="stage" tick={{ fontSize: 9.5, fill: '#374151', fontWeight: 600 }} angle={-10} textAnchor="end" />
                <YAxis tick={{ fontSize: 9.5, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => [safeFormatCurrency(Math.abs(v)), 'Stage Value']} contentStyle={{ fontSize: '11.5px', borderRadius: '6px' }} />
                <Bar dataKey="value" name="Stage Amount" radius={[3, 3, 0, 0]}>
                  {waterfall.map((entry, index) => (
                    <Cell key={`wf-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Actual Grouped Bar Chart by Category */}
        <div className="p-5 border border-gray-200 rounded-xl bg-white space-y-2 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                Budget Baseline vs Actual Outlay by Trade Category
              </h4>
              <p className="text-[10px] text-gray-400 font-medium">Variance tracking across major work trades.</p>
            </div>
            <span className="text-[9.5px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Trade Breakdown
            </span>
          </div>
          <div className="h-[300px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActual} margin={{ top: 10, right: 15, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 9.5, fill: '#374151', fontWeight: 600 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 9.5, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => [safeFormatCurrency(v), '']} contentStyle={{ fontSize: '11.5px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '10.5px' }} />
                <Bar dataKey="budget" name="Approved Budget" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="committed" name="Committed Cost" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="actual" name="Actual Cost" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 4: Procurement Intelligence
// ============================================================================
export const ProcurementIntelligenceSection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const navigate = useNavigate();
  const pf = data.procurementFunnel;
  const deliveries = data.upcomingDeliveries;
  const spend = data.poSpendByCategory;
  const purchaseTrend = data.purchaseValueTrend;
  const topVendors = data.topVendorsList;

  return (
    <div className="space-y-5 font-sans">
      {/* Detailed Procurement Pipeline Funnel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs font-semibold">
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
          <span className="text-[9px] text-gray-400 uppercase font-bold block">1. Requirements</span>
          <span className="font-extrabold text-sm text-gray-900 mt-0.5 block">{pf.requirementsCount} Items</span>
        </div>
        <button
          onClick={() => navigateWithFilter(navigate, '/procurement/indents')}
          className="p-2.5 bg-brand-50/50 border border-brand-200 rounded text-left hover:bg-brand-100/50 transition-colors focus:outline-none"
        >
          <span className="text-[9px] text-brand-700 uppercase font-bold block">2. Indents</span>
          <span className="font-extrabold text-sm text-brand-900 mt-0.5 block">{pf.indentsCount} ({safeFormatCurrency(pf.indentsValue)})</span>
        </button>
        <button
          onClick={() => navigateWithFilter(navigate, '/procurement/rfqs')}
          className="p-2.5 bg-indigo-50/50 border border-indigo-200 rounded text-left hover:bg-indigo-100/50 transition-colors focus:outline-none"
        >
          <span className="text-[9px] text-indigo-700 uppercase font-bold block">3. RFQs Issued</span>
          <span className="font-extrabold text-sm text-indigo-900 mt-0.5 block">{pf.rfqsCount} RFQs</span>
        </button>
        <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded text-left">
          <span className="text-[9px] text-blue-700 uppercase font-bold block">4. Quotes Received</span>
          <span className="font-extrabold text-sm text-blue-900 mt-0.5 block">{pf.quotesCount} Quotes</span>
        </div>
        <button
          onClick={() => navigateWithFilter(navigate, '/procurement/purchase-orders')}
          className="p-2.5 bg-amber-50/50 border border-amber-200 rounded text-left hover:bg-amber-100/50 transition-colors focus:outline-none"
        >
          <span className="text-[9px] text-amber-700 uppercase font-bold block">5. Purchase Orders</span>
          <span className="font-extrabold text-sm text-amber-900 mt-0.5 block">{pf.posCount} ({safeFormatCurrency(pf.posValue)})</span>
        </button>
        <div className="p-2.5 bg-purple-50/50 border border-purple-200 rounded text-left">
          <span className="text-[9px] text-purple-700 uppercase font-bold block">6. In-Transit</span>
          <span className="font-extrabold text-sm text-purple-900 mt-0.5 block">{pf.deliveriesCount} Deliveries</span>
        </div>
        <button
          onClick={() => navigateWithFilter(navigate, '/inventory/grns')}
          className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded text-left hover:bg-emerald-100/50 transition-colors focus:outline-none"
        >
          <span className="text-[9px] text-emerald-700 uppercase font-bold block">7. GRNs Received</span>
          <span className="font-extrabold text-sm text-emerald-900 mt-0.5 block">{pf.grnsCount} ({safeFormatCurrency(pf.grnsValue)})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Purchase Value Trend Chart: PO Ordered vs GRN Received */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Purchase Order Value vs Physical GRN Receipt Trend
            </h4>
            <span className="text-[9.5px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Procurement Trend
            </span>
          </div>
          <div className="h-[230px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={purchaseTrend} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#374151' }} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => [safeFormatCurrency(v), '']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="poOrdered" name="PO Value Ordered" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="grnReceived" name="GRN Value Received" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Bar Chart: Top Vendors by Purchase Value */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Top Vendors by Purchase Order Value
            </h4>
            <button
              onClick={() => navigate('/procurement/vendors')}
              className="text-[10px] font-bold text-brand-700 hover:underline cursor-pointer"
            >
              Vendor Directory &rarr;
            </button>
          </div>
          <div className="h-[230px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topVendors} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <YAxis type="category" dataKey="vendor" tick={{ fontSize: 9, fill: '#374151', fontWeight: 600 }} width={120} />
                <Tooltip formatter={(v: number) => [safeFormatCurrency(v), 'Ordered Value']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                <Bar dataKey="orderedValue" name="Ordered PO Value" fill="#ab9570" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Spend Chart */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
          <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider border-b pb-2">
            PO Spend Distribution by Material Category
          </h4>
          <div className="h-[220px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spend} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#374151', fontWeight: 600 }} interval={0} angle={-10} textAnchor="end" />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => [safeFormatCurrency(v), '']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                <Bar dataKey="amount" name="PO Amount" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-brand-600" /> Upcoming Material Deliveries
            </h4>
            <button
              onClick={() => navigate('/procurement/purchase-orders')}
              className="text-[10px] font-bold text-brand-700 hover:underline cursor-pointer"
            >
              View All POs &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
                <tr>
                  <th className="p-2">PO # / Material</th>
                  <th className="p-2">Vendor</th>
                  <th className="p-2 text-right">Qty (Ord/Rec)</th>
                  <th className="p-2 text-right">Expected Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {deliveries.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/procurement/purchase-orders/${row.poId}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-2">
                      <div className="font-bold text-brand-700">{row.poNumber}</div>
                      <div className="text-[9.5px] text-gray-500 truncate max-w-[140px]">{row.materialName}</div>
                    </td>
                    <td className="p-2 text-[10px] font-semibold text-gray-800">{row.vendorName}</td>
                    <td className="p-2 text-right font-mono text-[10px]">
                      {row.orderedQty} / <strong className="text-emerald-700">{row.receivedQty}</strong>
                    </td>
                    <td className="p-2 text-right text-[10px] font-mono text-gray-600">{row.expectedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 5: Inventory & Quality Control
// ============================================================================
export const InventoryQualitySection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const navigate = useNavigate();
  const qc = data.qcSummary;
  const stock = data.stockSummary;
  const stockMovement = data.stockMovementTrend;
  const qcFailures = data.qcFailuresByCategory;

  return (
    <div className="space-y-5 font-sans">
      {/* Inward Workflow Funnel */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-semibold">
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
          <span className="text-[9px] text-gray-400 uppercase font-bold block">1. Gate Entry</span>
          <span className="font-extrabold text-sm text-gray-900 mt-0.5 block">14 Tokens</span>
        </div>
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
          <span className="text-[9px] text-gray-400 uppercase font-bold block">2. Receiving</span>
          <span className="font-extrabold text-sm text-gray-900 mt-0.5 block">12 Checked</span>
        </div>
        <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded">
          <span className="text-[9px] text-amber-700 uppercase font-bold block">3. QC Inspection</span>
          <span className="font-extrabold text-sm text-amber-900 mt-0.5 block">{qc.totalInspections} Done</span>
        </div>
        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded">
          <span className="text-[9px] text-emerald-700 uppercase font-bold block">4. GRN Posted</span>
          <span className="font-extrabold text-sm text-emerald-900 mt-0.5 block">10 Approved</span>
        </div>
        <div className="p-2.5 bg-brand-50/70 border border-brand-200 rounded">
          <span className="text-[9px] text-brand-700 uppercase font-bold block">5. Stock Ledger</span>
          <span className="font-extrabold text-sm text-brand-900 mt-0.5 block">{safeFormatCurrency(stock.totalValue)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stock Inward vs Outward Movement Trend */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Monthly Stock Receipts (Inward) vs Site Consumption (Outward)
            </h4>
            <span className="text-[9.5px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
              Movement Trend
            </span>
          </div>
          <div className="h-[210px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockMovement} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#374151' }} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => [safeFormatCurrency(v), '']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="inwardValue" name="GRN Inward Stock" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="outwardValue" name="Site Issue Outward" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QC Inspection Pie Chart */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              QC Inspection Quality Yield ({qc.passRatePct}% Pass Rate)
            </h4>
            <button
              onClick={() => navigate('/inventory/qc-inspections')}
              className="text-[10px] font-bold text-brand-700 hover:underline cursor-pointer"
            >
              Inspection Register &rarr;
            </button>
          </div>

          <div className="h-[210px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.qcDistributionChart} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {data.qcDistributionChart.map((entry, index) => (
                    <Cell key={`qc-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val} Inspections`, '']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* QC Rejections & Non-Conformances by Category */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-600" /> QC Rejections & Non-Conformances by Category
            </h4>
            <span className="text-[9.5px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              Quality Audit
            </span>
          </div>
          <div className="h-[200px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={qcFailures} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 9, fill: '#374151', fontWeight: 600 }} width={120} />
                <Tooltip formatter={(v: number) => [`${v} Issues`, 'Rejections']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                <Bar dataKey="rejections" name="Rejected Lots" fill="#ef4444" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-4 w-4 text-amber-600" /> Low Stock Watchlist ({stock.lowStockCount} Items)
            </h4>
            <button
              onClick={() => navigate('/inventory/stock-ledger')}
              className="text-[10px] font-bold text-brand-700 hover:underline cursor-pointer"
            >
              Full Stock Ledger &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
                <tr>
                  <th className="p-2">Material</th>
                  <th className="p-2">Category</th>
                  <th className="p-2 text-right">Available</th>
                  <th className="p-2 text-right">Stock Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {stock.lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400 italic">No low stock warnings. Stock levels optimal.</td>
                  </tr>
                ) : (
                  stock.lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-2 font-bold text-gray-900">{item.materialName}</td>
                      <td className="p-2 text-[10px] text-gray-500">{item.categoryName}</td>
                      <td className="p-2 text-right font-mono font-bold text-rose-700">
                        {item.available} {item.unit}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-gray-900">
                        {safeFormatCurrency(item.stockValue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 6: Finance & Cash Flow
// ============================================================================
export const FinanceCashFlowSection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const navigate = useNavigate();
  const cf = data.cashFlowMonthly;
  const sc = data.subcontractorSummary;
  const apAging = data.payableAging;

  return (
    <div className="space-y-5 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Cash Flow Inflow vs Outflow */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Monthly Operating Cash Flow (Client Receipts vs Disbursements)
            </h4>
            <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Cash Position Positive
            </span>
          </div>
          <div className="h-[240px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cf} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#374151' }} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => [safeFormatCurrency(v), '']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="cashInflow" name="Client Cash Inflow" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cashOutflow" name="Vendor Cash Outflow" fill="#ef4444" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="netCashFlow" name="Net Surplus" stroke="#ab9570" strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor & Subcontractor Payable Aging Schedule */}
        <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                Vendor & Subcontractor Accounts Payable Aging
              </h4>
              <button
                onClick={() => navigate('/finance/accounts-payable')}
                className="text-[10px] font-bold text-brand-700 hover:underline cursor-pointer"
              >
                AP Register &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs mt-3">
              <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded">
                <span className="text-[9px] text-emerald-700 uppercase font-bold block">Current (0-30d)</span>
                <span className="font-extrabold text-xs text-emerald-900 font-mono mt-0.5 block">{safeFormatCurrency(apAging.current)}</span>
              </div>
              <div className="p-2 bg-blue-50/70 border border-blue-200 rounded">
                <span className="text-[9px] text-blue-700 uppercase font-bold block">31-60 Days</span>
                <span className="font-extrabold text-xs text-blue-900 font-mono mt-0.5 block">{safeFormatCurrency(apAging.days1To30)}</span>
              </div>
              <div className="p-2 bg-amber-50/70 border border-amber-200 rounded">
                <span className="text-[9px] text-amber-700 uppercase font-bold block">61-90 Days</span>
                <span className="font-extrabold text-xs text-amber-900 font-mono mt-0.5 block">{safeFormatCurrency(apAging.days31To60)}</span>
              </div>
              <div className="p-2 bg-rose-50/70 border border-rose-200 rounded">
                <span className="text-[9px] text-rose-700 uppercase font-bold block">91-120 Days</span>
                <span className="font-extrabold text-xs text-rose-900 font-mono mt-0.5 block">{safeFormatCurrency(apAging.days61To90)}</span>
              </div>
              <div className="p-2 bg-rose-100 border border-rose-300 rounded">
                <span className="text-[9px] text-rose-800 uppercase font-bold block">120+ Days</span>
                <span className="font-extrabold text-xs text-rose-950 font-mono mt-0.5 block">{safeFormatCurrency(apAging.days90Plus)}</span>
              </div>
            </div>
          </div>

          {/* Subcontractor WIP Summary Block */}
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <HardHat className="h-4 w-4 text-amber-700" /> Subcontractor WIP Execution: {safeFormatCurrency(sc.certifiedWIP)}
              </span>
              <span className="font-extrabold text-amber-800 font-mono text-xs">{((sc.certifiedWIP / (sc.totalWOValue || 1)) * 100).toFixed(1)}% Executed</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
              <div>
                <span className="text-gray-400 block font-semibold">Total WO Value:</span>
                <span className="font-mono font-bold text-gray-900">{safeFormatCurrency(sc.totalWOValue)}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Paid Amount:</span>
                <span className="font-mono font-bold text-emerald-700">{safeFormatCurrency(sc.paidAmount)}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Outstanding Balance:</span>
                <span className="font-mono font-bold text-rose-700">{safeFormatCurrency(sc.outstandingAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 7: Billing & Receivables
// ============================================================================
export const BillingReceivablesSection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const navigate = useNavigate();
  const trend = data.clientBillingTrend;
  const aging = data.receivableAging;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
      {/* Monthly Client Billing & Collection Chart */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-2">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
            Client Billing vs Collection Trend
          </h4>
          <button
            onClick={() => navigate('/finance/client-ra-bills')}
            className="text-[10px] font-bold text-brand-700 hover:underline cursor-pointer"
          >
            Client RA Bills &rarr;
          </button>
        </div>
        <div className="h-[240px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#374151' }} />
              <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(v: number) => [safeFormatCurrency(v), '']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="submittedBills" name="Submitted Bills" fill="#94a3b8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="approvedBills" name="Approved Bills" fill="#ab9570" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="clientReceipts" name="Client Receipts" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Receivable Aging Breakdown */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Client Receivable Aging Schedule
            </h4>
            <span className="text-[9.5px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              Outstanding: {safeFormatCurrency(data.kpis.clientOutstanding)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs mt-3">
            <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded">
              <span className="text-[9px] text-emerald-700 uppercase font-bold block">Current (0-30d)</span>
              <span className="font-extrabold text-xs text-emerald-900 font-mono mt-0.5 block">{safeFormatCurrency(aging.current)}</span>
            </div>
            <div className="p-2 bg-blue-50/70 border border-blue-200 rounded">
              <span className="text-[9px] text-blue-700 uppercase font-bold block">31-60 Days</span>
              <span className="font-extrabold text-xs text-blue-900 font-mono mt-0.5 block">{safeFormatCurrency(aging.days1To30)}</span>
            </div>
            <div className="p-2 bg-amber-50/70 border border-amber-200 rounded">
              <span className="text-[9px] text-amber-700 uppercase font-bold block">61-90 Days</span>
              <span className="font-extrabold text-xs text-amber-900 font-mono mt-0.5 block">{safeFormatCurrency(aging.days31To60)}</span>
            </div>
            <div className="p-2 bg-rose-50/70 border border-rose-200 rounded">
              <span className="text-[9px] text-rose-700 uppercase font-bold block">91-120 Days</span>
              <span className="font-extrabold text-xs text-rose-900 font-mono mt-0.5 block">{safeFormatCurrency(aging.days61To90)}</span>
            </div>
            <div className="p-2 bg-rose-100 border border-rose-300 rounded">
              <span className="text-[9px] text-rose-800 uppercase font-bold block">120+ Days</span>
              <span className="font-extrabold text-xs text-rose-950 font-mono mt-0.5 block">{safeFormatCurrency(aging.days90Plus)}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Average Client Collection Lead Time:</span>
          <span className="font-extrabold text-gray-900 font-mono">18 Days</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 8: Approvals & System Alerts Center
// ============================================================================
export const ApprovalsAlertsSection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const navigate = useNavigate();
  const queue = data.approvalsQueue;
  const alerts = data.systemAlerts;

  const approvalItems = [
    { label: 'Material Indents', count: queue.indentsPending, route: '/procurement/indent-approvals' },
    { label: 'Purchase Orders', count: queue.posPending, route: '/procurement/purchase-orders' },
    { label: 'QC Exception Approvals', count: queue.qcExceptionsPending, route: '/inventory/qc-inspections' },
    { label: 'Vendor AP Approvals', count: queue.vendorAPsPending, route: '/finance/accounts-payable' },
    { label: 'Subcontractor Bills', count: queue.scBillsPending, route: '/procurement/work-orders' },
    { label: 'Client RA Bills', count: queue.raBillsPending, route: '/finance/client-ra-bills' },
  ];

  return (
    <div className="space-y-5 font-sans">
      {/* 6 Quick Approval Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {approvalItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(item.route)}
            className="p-3 border border-gray-200 rounded-lg bg-white hover:border-brand-400 hover:shadow-sm transition-all text-left group focus:outline-none"
          >
            <span className="text-[9.5px] uppercase font-bold text-gray-400 group-hover:text-brand-700 transition-colors block truncate">
              {item.label}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-extrabold text-base text-gray-900">{item.count}</span>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.25 rounded">
                Pending
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Live System Alerts Feed */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-3">
        <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-rose-600" /> Operational Exceptions & System Alerts
        </h4>

        <div className="space-y-2">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => navigate(alt.link)}
              className="p-3 border rounded-lg text-xs flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50/40 border-gray-200"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 mt-0.5 ${
                    alt.type === 'critical'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : alt.type === 'warning'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}
                >
                  {alt.type}
                </span>
                <div>
                  <h5 className="font-bold text-gray-900">{alt.title}</h5>
                  <p className="text-[10.5px] text-gray-500 font-medium mt-0.5">{alt.description}</p>
                </div>
              </div>
              <span className="text-[9.5px] text-gray-400 font-mono shrink-0">{alt.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 9: Tasks & Notifications
// ============================================================================
export const TasksNotificationsSection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const navigate = useNavigate();
  const tasks = data.tasksList;
  const notifs = data.notificationsList;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
      {/* My Tasks Panel */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-blue-600" /> My Tasks & Action Items
            </h4>
            <button
              onClick={() => navigate('/overview/my-tasks')}
              className="text-[10px] font-bold text-brand-700 hover:underline cursor-pointer"
            >
              Manage Tasks &rarr;
            </button>
          </div>

          <div className="space-y-2 mt-3">
            {tasks.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 italic">No tasks assigned.</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate('/overview/my-tasks')}
                  className="p-2.5 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer space-y-1 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span className="truncate">{task.subject}</span>
                    <span className="text-[9px] px-1.5 py-0.25 rounded font-mono bg-blue-50 text-blue-700 border border-blue-200">
                      Due {task.dueDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Project: {task.relatedSite}</span>
                    <span>Assigned By: {task.assignedBy}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-brand-600" /> Notifications Feed
            </h4>
            <button
              onClick={() => navigate('/overview/notifications')}
              className="text-[10px] font-bold text-brand-700 hover:underline cursor-pointer"
            >
              All Notifications &rarr;
            </button>
          </div>

          <div className="space-y-2 mt-3">
            {notifs.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 italic">No recent notifications.</p>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => navigate('/overview/notifications')}
                  className="p-2.5 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer flex items-start justify-between gap-2 text-xs"
                >
                  <div>
                    <h5 className="font-bold text-gray-900">{n.title}</h5>
                    <p className="text-[10px] text-gray-500 font-medium truncate max-w-[280px]">{n.message}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono shrink-0">{n.alertDate}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION 10: Management Position Snapshot & Activity Log
// ============================================================================
export const ManagementSnapshotActivitySection: React.FC<{ data: ExecutiveDashboardData }> = ({ data }) => {
  const kpis = data.kpis;
  const logs = data.activityLogs;
  const healthMatrix = data.projectHealthMatrix;

  return (
    <div className="space-y-5 font-sans">
      {/* Executive Management Snapshot Card */}
      <div className="p-5 border border-brand-200 rounded-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-700 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-brand-400 uppercase tracking-wider">
              Top Management Executive Position Snapshot
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              Unified commercial & cash standing for {data.selectedProjectName}
            </p>
          </div>
          <span className="text-xs font-bold text-brand-300 bg-brand-950/80 border border-brand-700 px-3 py-1 rounded-full">
            REAL-TIME CONNECTED ERP
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Contract Value</span>
            <span className="font-extrabold text-base text-white font-mono block mt-1">{safeFormatCurrency(kpis.totalContractValue)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Approved Baseline Budget</span>
            <span className="font-extrabold text-base text-gray-200 font-mono block mt-1">{safeFormatCurrency(kpis.approvedBudget)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Actual Outlay (GRN+SC)</span>
            <span className="font-extrabold text-base text-rose-400 font-mono block mt-1">{safeFormatCurrency(kpis.actualCost)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Client Billing Cleared</span>
            <span className="font-extrabold text-base text-emerald-400 font-mono block mt-1">{safeFormatCurrency(kpis.clientReceived)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Net Liability Exposure</span>
            <span className="font-extrabold text-base text-amber-400 font-mono block mt-1">{safeFormatCurrency(kpis.totalPayable)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Gross Profit Margin</span>
            <span className="font-extrabold text-base text-brand-400 font-mono block mt-1">{safeFormatCurrency(kpis.grossProfit)} ({kpis.marginPct}%)</span>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Project Health Matrix */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-3">
        <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-brand-600" /> Multi-Dimensional Project Health Index & Status Matrix
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {healthMatrix.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 border rounded-lg flex flex-col justify-between text-xs space-y-2 ${
                item.status === 'Healthy'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : item.status === 'Critical'
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-amber-50/50 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-[11px]">{item.dimension}</span>
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.25 rounded ${
                    item.status === 'Healthy'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-700 font-semibold block leading-tight">{item.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Activity Audit Log */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-3">
        <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-gray-600" /> Recent Chronological System Audit Log
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
              <tr>
                <th className="p-2.5">User</th>
                <th className="p-2.5">Action Performed</th>
                <th className="p-2.5">Module</th>
                <th className="p-2.5">Reference Document</th>
                <th className="p-2.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="p-2.5 font-bold text-gray-900">{log.user}</td>
                  <td className="p-2.5 font-semibold text-brand-800">{log.action}</td>
                  <td className="p-2.5 text-gray-500 text-[10px]">{log.module}</td>
                  <td className="p-2.5 font-mono text-[10px] text-gray-800">{log.reference}</td>
                  <td className="p-2.5 text-right font-mono text-[10px] text-gray-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
