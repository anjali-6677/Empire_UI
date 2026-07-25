import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line
} from 'recharts';
import { 
  Plus, 
  Home,
  ChevronRight,
  DollarSign,
  FolderKanban,
  Clock,
  FileText,
  TrendingUp,
  ShoppingCart,
  ArrowUp
} from 'lucide-react';

// Unified Components & Context
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { useSites } from '../context/SitesContext';
import { 
  mockKPIs, 
  mockProjects, 
  mockMonthlyFinancials 
} from '../data/mockData';
import { safeFormatCurrency } from '../utils/formatStatus';
import { ColumnDef } from '@tanstack/react-table';
import { ProjectHealthSchema } from '../types';
import { ROUTES } from '../config/navigation';

import {
  SectionWrapper,
  PortfolioOverviewSection,
  SiteSnapshotSection,
  SiteProgressMatrixSection,
  ClientTenderBillingSection,
  VendorBillSnapshotSection,
  ApprovalPendingSection,
  NotificationsTasksActivitySection,
  ProcurementIntelligenceSection,
  PeriodStatisticsSection,
  UpcomingExceptionsSection,
  VendorExposureSection,
  FlowReportsSection,
  DetailedSiteProgressSection,
  PaymentModesSection
} from '../components/DashboardSections';

// ==========================================
// Local Metric Card Component
// ==========================================
interface MetricCardProps {
  label: string;
  value: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  isPOItem?: boolean;
}

const iconMap: Record<string, any> = {
  DollarSign,
  FolderKanban,
  Clock,
  FileText,
  TrendingUp,
  ShoppingCart
};

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  change, 
  changeType, 
  icon,
  isPOItem
}) => {
  const IconComponent = iconMap[icon] || FolderKanban;
  
  // Format description text
  let statusText = '';
  let statusClass = 'text-gray-400 border-gray-150 bg-gray-50';

  if (changeType === 'positive') {
    statusText = change ? `↑ +${change}% from last month` : '';
    statusClass = 'text-emerald-700 bg-emerald-50 border-emerald-100';
  } else if (changeType === 'negative') {
    statusText = change ? `↓ ${change} high priority` : '';
    statusClass = 'text-rose-700 bg-rose-50 border-rose-100';
  } else if (changeType === 'neutral') {
    if (isPOItem && change) {
      statusText = `• Value: ${safeFormatCurrency(change)}`;
      statusClass = 'text-brand-700 bg-brand-50 border-brand-100';
    } else {
      statusText = change ? `• Within forecast (+${change}%)` : '';
      statusClass = 'text-brand-700 bg-brand-50 border-brand-100';
    }
  }

  // Formatting value display
  const valueDisplay = label.toLowerCase().includes('value') || label.toLowerCase().includes('payments')
    ? safeFormatCurrency(value)
    : label.toLowerCase().includes('budget')
    ? `${value}%`
    : value.toString();

  return (
    <div className="bg-white border border-gray-150 rounded-lg p-3.5 shadow-sm flex flex-col justify-between h-[120px] font-sans">
      <div className="flex items-start justify-between gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-gray-450 font-bold block leading-tight">
          {label}
        </span>
        <div className="p-1 rounded bg-gray-50 border border-gray-100 shrink-0">
          <IconComponent className="h-4.5 w-4.5 text-gray-400 stroke-[1.5]" />
        </div>
      </div>
      
      <div className="space-y-1">
        <span className="font-extrabold text-zinc-900 tracking-tight text-lg block leading-none sm:text-xl">
          {valueDisplay}
        </span>

        {statusText && (
          <span className={`inline-flex px-1.5 py-0.25 text-[8.5px] font-bold rounded border tracking-tight leading-none ${statusClass}`}>
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
};

// Section navigation links definition
const sectionNavLinks = [
  { id: 'portfolio-overview', label: '1. Portfolio Overview' },
  { id: 'site-snapshot', label: '2. Site Snapshot' },
  { id: 'progress-matrix', label: '3. Progress Matrix' },
  { id: 'client-billing', label: '4. Client Billing' },
  { id: 'vendor-billing', label: '5. Vendor Bills' },
  { id: 'approval-pending', label: '6. Approvals Pending' },
  { id: 'tasks-activity', label: '7. Tasks & Activity' },
  { id: 'procurement-intelligence', label: '8. Procurement Intel' },
  { id: 'period-statistics', label: '9. Period Statistics' },
  { id: 'upcoming-exceptions', label: '10. Upcoming & Exceptions' },
  { id: 'vendor-exposure', label: '11. Vendor Exposure' },
  { id: 'flow-reports', label: '12. Flow Reports' },
  { id: 'detailed-progress', label: '13. Detailed Progress' },
  { id: 'payment-modes', label: '14. Payment Modes' }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { sites, selectedSiteId } = useSites();

  // Active site for site-specific dashboard sections (null when 'all' is selected)
  const activeSite = selectedSiteId === 'all' ? null : (sites.find((s) => s.id === selectedSiteId) || null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Columns for Project Health DataTable
  const projectColumns: ColumnDef<ProjectHealthSchema>[] = [
    {
      id: 'name',
      header: 'Project Name',
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-gray-900 block text-[11.5px]">{row.original.name}</span>
          <span className="text-[9.5px] text-gray-400 block font-semibold">{row.original.client}</span>
        </div>
      )
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'location'
    },
    {
      id: 'completion',
      header: 'Completion',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[70px]">
          <div className="flex-1 bg-gray-150 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${
                row.original.status === 'completed' 
                  ? 'bg-green-500' 
                  : row.original.status === 'critical' 
                  ? 'bg-rose-500' 
                  : 'bg-brand-500'
              }`}
              style={{ width: `${row.original.completion}%` }}
            ></div>
          </div>
          <span className="font-extrabold text-gray-800 text-[10px] w-6 text-right">
            {row.original.completion}%
          </span>
        </div>
      )
    },
    {
      id: 'budgetSpent',
      header: 'Budget Spent',
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-gray-800 block text-[11px]">
            {safeFormatCurrency(row.original.budgetSpent)}
          </span>
          <span className="text-[9.5px] text-gray-400 block font-semibold">
            of {safeFormatCurrency(row.original.budgetTotal)}
          </span>
        </div>
      )
    },
    {
      id: 'manager',
      header: 'Manager',
      accessorKey: 'manager'
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    }
  ];



  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-14 select-none relative">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded focus:outline-none">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650 cursor-pointer">Operations Overview & Site Dashboard</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-150 pb-4 font-sans">
        <div className="space-y-0.5">
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Site Dashboard & Operations Overview
          </h1>
          <p className="text-[10.5px] text-gray-400 font-medium leading-normal">
            Comprehensive operational intelligence for active project site: <strong className="text-brand-700">{activeSite ? `${activeSite.code} - ${activeSite.name}` : 'ALL SITES — Portfolio Mode'}</strong>
          </p>
        </div>

        <button
          onClick={() => navigate('/sites/new')}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-[10.5px] font-bold rounded shadow-sm transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-brand-500/50 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer select-none shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Launch New Project Site
        </button>
      </div>

      {/* Sticky Horizontal Section Navigation Index */}
      <div className="sticky top-[52px] z-20 bg-white border border-gray-200 rounded-lg p-2 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none text-[10.5px] font-bold">
        <span className="text-[9px] uppercase tracking-widest text-gray-400 px-2 shrink-0 font-bold">Jump To Section:</span>
        {sectionNavLinks.map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className="px-2.5 py-1 rounded bg-gray-50 hover:bg-brand-50 hover:text-brand-700 border border-gray-200 text-gray-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: Portfolio Overview */}
      <SectionWrapper 
        id="portfolio-overview" 
        title="1. Portfolio Overview" 
        description="Global high-level performance indicators across all active construction sites."
      >
        <PortfolioOverviewSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {mockKPIs.map((kpi) => (
              <MetricCard
                key={kpi.id}
                label={kpi.label}
                value={kpi.value}
                change={kpi.change}
                changeType={kpi.changeType}
                icon={kpi.icon || 'FolderKanban'}
                isPOItem={kpi.id === 'kpi-6'}
              />
            ))}
          </div>
        </PortfolioOverviewSection>
      </SectionWrapper>

      {/* SECTION 2: Selected Site Snapshot */}
      <SectionWrapper 
        id="site-snapshot" 
        title={`2. Selected Site Snapshot (${activeSite ? activeSite.code : 'All Project Sites'})`}
        description="Financial breakdown and schedule timelines for the site selected in the Header switcher."
      >
        <SiteSnapshotSection site={activeSite} />
      </SectionWrapper>

      {/* SECTION 3: Site Progress Matrix */}
      <SectionWrapper 
        id="progress-matrix" 
        title="3. Site Progress Matrix" 
        description="Eight key performance metrics tracked as current progress percentages."
      >
        <SiteProgressMatrixSection site={activeSite} />
      </SectionWrapper>

      {/* SECTION 4: Client Tender and Billing Snapshot */}
      <SectionWrapper 
        id="client-billing" 
        title="4. Client Tender & Billing Snapshot" 
        description="Comparison of submitted tenders, extra items, approved client bills, and held amounts."
      >
        <ClientTenderBillingSection site={activeSite} />
      </SectionWrapper>

      {/* SECTION 5: Vendor Bill Snapshot */}
      <SectionWrapper 
        id="vendor-billing" 
        title="5. Vendor Bill Snapshot" 
        description="Material, Labour, Utility, and Salary bill ledger with paid percentages."
      >
        <VendorBillSnapshotSection site={activeSite} />
      </SectionWrapper>

      {/* SECTION 6: Approval Pending */}
      <SectionWrapper 
        id="approval-pending" 
        title="6. Approvals Pending" 
        description="Current counts of pending operational approvals requiring signoff."
      >
        <ApprovalPendingSection />
      </SectionWrapper>

      {/* SECTION 7: Notifications, Tasks and Activity */}
      <SectionWrapper 
        id="tasks-activity" 
        title="7. Notifications, Tasks & Activity History" 
        description="Operational notifications, assigned user tasks, and chronological activity feed."
      >
        <NotificationsTasksActivitySection />
      </SectionWrapper>

      {/* SECTION 8: Procurement and Vendor Intelligence */}
      <SectionWrapper 
        id="procurement-intelligence" 
        title="8. Procurement & Vendor Intelligence" 
        description="Material ordering stats, rate definition status, and highest order values."
      >
        <ProcurementIntelligenceSection />
      </SectionWrapper>

      {/* SECTION 9: Period Statistics */}
      <SectionWrapper 
        id="period-statistics" 
        title="9. Period Statistics" 
        description="Operational record frequency over Today, 7 Days, Last Month, Quarter, and Year."
      >
        <PeriodStatisticsSection />
      </SectionWrapper>

      {/* SECTION 10: Upcoming and Exception Tables */}
      <SectionWrapper 
        id="upcoming-exceptions" 
        title="10. Upcoming & Exception Tables" 
        description="Scheduled deliveries, GRN pending items, and Receive Delivery interface."
      >
        <UpcomingExceptionsSection />
      </SectionWrapper>

      {/* SECTION 11: Vendor Exposure */}
      <SectionWrapper 
        id="vendor-exposure" 
        title="11. Vendor Exposure & Liabilities" 
        description="Highest amount due and paid vendor summaries."
      >
        <VendorExposureSection />
      </SectionWrapper>

      {/* SECTION 12: Flow Reports */}
      <SectionWrapper 
        id="flow-reports" 
        title="12. Cash & Material Flow Reports" 
        description="Monthly inflow vs outflow trends."
      >
        <FlowReportsSection />
      </SectionWrapper>

      {/* SECTION 13: Detailed Site Progress */}
      <SectionWrapper 
        id="detailed-progress" 
        title="13. Detailed Site Progress Breakdown" 
        description="Comprehensive 12-point progress matrix for site operations."
      >
        <DetailedSiteProgressSection site={activeSite} />
      </SectionWrapper>

      {/* SECTION 14: Payment Modes */}
      <SectionWrapper 
        id="payment-modes" 
        title="14. Payment Modes Breakdown" 
        description="Vendor payment channels and client remittance modes."
      >
        <PaymentModesSection />
      </SectionWrapper>

      {/* Existing Operations Overview Charts & Health Tables */}
      <div className="space-y-5 border-t pt-5 border-gray-200">
        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
          Operations Overview Analytics
        </h3>

        {/* Financial Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 select-none">
          <div className="bg-white border border-gray-150 rounded-lg p-4 shadow-sm space-y-3">
            <div>
              <h3 className="text-xs font-bold text-gray-855 uppercase tracking-wider block">Monthly Financial Performance</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Billing vs Payments Received (in INR Lakhs)</p>
            </div>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockMonthlyFinancials}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickFormatter={(val) => `₹${Number(val / 100000 || 0).toFixed(0)}L`} />
                  <Tooltip formatter={(val: number) => [safeFormatCurrency(val), 'Amount']} />
                  <Legend wrapperStyle={{ fontSize: '10.5px' }} />
                  <Area type="monotone" dataKey="billing" name="Billing" stroke="#ab9570" fill="#ab9570" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="payments" name="Payments Recd" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-lg p-4 shadow-sm space-y-3">
            <div>
              <h3 className="text-xs font-bold text-gray-855 uppercase tracking-wider block">Budget vs Actual Expenditure</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Project Cost Controls & Forecast Comparison</p>
            </div>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mockMonthlyFinancials}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickFormatter={(val) => `₹${Number(val / 100000 || 0).toFixed(0)}L`} />
                  <Tooltip formatter={(val: number) => [safeFormatCurrency(val), 'Amount']} />
                  <Legend wrapperStyle={{ fontSize: '10.5px' }} />
                  <Bar dataKey="budget" name="Approved Budget" fill="#e2e8f0" radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="actual" name="Actual Cost" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Project Health Table */}
        <div className="bg-white border border-gray-150 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-855 uppercase tracking-wider block">Project Health & Progress Tracker</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Status tracking for active site execution.</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.SITES)}
              className="text-[10.5px] font-bold text-brand-650 hover:text-brand-800 transition-colors cursor-pointer"
            >
              View All Sites →
            </button>
          </div>

          <DataTable
            columns={projectColumns}
            data={mockProjects}
            searchColumnId="name"
            searchPlaceholder="Filter active projects..."
          />
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg transition-all focus:outline-none cursor-pointer flex items-center gap-1 font-bold text-xs"
        aria-label="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Top</span>
      </button>

    </div>
  );
};

export default Dashboard;
