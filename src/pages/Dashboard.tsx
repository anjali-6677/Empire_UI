import * as React from 'react';
import { useERPStore } from '../store/ERPStoreContext';
import { useProjectContext } from '../context/ProjectContext';
import { computeExecutiveDashboardData, DateRangeOption } from '../utils/dashboardCalculators';
import {
  SectionWrapper,
  ExecutiveKpiSummarySection,
  ProjectPerformanceGanttSection,
  CommercialPositionSection,
  ProcurementIntelligenceSection,
  InventoryQualitySection,
  FinanceCashFlowSection,
  BillingReceivablesSection,
  ApprovalsAlertsSection,
  TasksNotificationsSection,
  ManagementSnapshotActivitySection,
} from '../components/DashboardSections';
import {
  Calendar,
  Building2,
  Search,
  RotateCcw,
  LayoutDashboard,
} from 'lucide-react';

const sectionNavLinks = [
  { id: 'sec-portfolio', label: '1. Portfolio Overview' },
  { id: 'sec-site-snapshot', label: '2. Site Snapshot' },
  { id: 'sec-progress-matrix', label: '3. Progress Matrix & Commercial' },
  { id: 'sec-client-billing', label: '4. Client Billing' },
  { id: 'sec-vendor-bills', label: '5. Vendor Bills & Finance' },
  { id: 'sec-approvals', label: '6. Approvals Pending' },
  { id: 'sec-tasks-activity', label: '7. Tasks & Activity' },
  { id: 'sec-procurement', label: '8. Procurement Intel' },
  { id: 'sec-period-stats', label: '9. Period Statistics & Snapshot' },
];

export const Dashboard: React.FC = () => {
  const { state } = useERPStore();
  const { selectedProjectId, selectedProject } = useProjectContext();

  // Filters State
  const [dateRange, setDateRange] = React.useState<DateRangeOption>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Compute live connected data from store
  const dashboardData = React.useMemo(() => {
    return computeExecutiveDashboardData(state, selectedProjectId, dateRange);
  }, [state, selectedProjectId, dateRange]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16 select-none relative">
      {/* 1. Page Title & Context Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 border border-brand-200 rounded-lg shrink-0">
            <LayoutDashboard className="h-5 w-5 text-brand-700" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Flutebyte ERP Executive Control Center
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">
              Real-time connected commercial, procurement, inventory, cash flow, and site execution metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Active View:</span>
          <span className="px-2.5 py-1 bg-brand-50 border border-brand-200 text-brand-800 rounded-md font-bold text-xs flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {dashboardData.isPortfolioMode ? 'All Portfolio Projects Mode' : `${selectedProject?.projectCode} - ${selectedProject?.projectName}`}
          </span>
        </div>
      </div>

      {/* 2. Dashboard Filter Toolbar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10.5px] font-bold text-gray-500 uppercase">Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              className="bg-transparent font-bold text-xs text-gray-800 outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Search Query */}
          <div className="relative flex items-center">
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search metrics, PO #, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200 bg-gray-50 rounded-lg text-xs font-medium text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 w-48 sm:w-60"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateRange('all')}
            className="px-2.5 py-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg text-[10.5px] font-bold text-gray-600 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" /> Reset Filters
          </button>
        </div>
      </div>

      {/* 3. Sticky Horizontal Section Navigation Index (JUMP TO SECTION) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar sticky top-14 z-30 font-sans text-[11px] font-bold">
        <span className="text-[10px] uppercase text-gray-400 font-extrabold px-2 tracking-wider shrink-0 border-r border-gray-200 pr-3">
          JUMP TO SECTION:
        </span>
        {sectionNavLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className="px-2.5 py-1.5 rounded-md hover:bg-brand-50 hover:text-brand-800 text-gray-600 whitespace-nowrap transition-colors cursor-pointer focus:outline-none shrink-0"
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* 4. Dashboard Sections 1 to 9 */}

      {/* SECTION 1: Portfolio Overview */}
      <SectionWrapper
        id="sec-portfolio"
        title="1. Portfolio Overview"
        description="6 core KPI cards followed by full-width Portfolio Financial Comparison."
        badge="Portfolio Overview"
      >
        <ExecutiveKpiSummarySection data={dashboardData} />
      </SectionWrapper>

      {/* SECTION 2: Site Snapshot */}
      <SectionWrapper
        id="sec-site-snapshot"
        title="2. Site Snapshot & Gantt Progress"
        description="Operational radar health, project progress, and full-width Gantt milestone timeline."
        badge={dashboardData.isPortfolioMode ? 'All Active Sites' : 'Selected Site'}
      >
        <ProjectPerformanceGanttSection data={dashboardData} />
      </SectionWrapper>

      {/* SECTION 3: Progress Matrix & Commercial Position */}
      <SectionWrapper
        id="sec-progress-matrix"
        title="3. Progress Matrix & Commercial Position"
        description="Full-width Revenue & Profit trend, Cost Composition donut, Tender position, and Financial Waterfall."
        badge="Commercial Intel"
      >
        <CommercialPositionSection data={dashboardData} />
      </SectionWrapper>

      {/* SECTION 4: Client Billing */}
      <SectionWrapper
        id="sec-client-billing"
        title="4. Client Billing & Receivables"
        description="Client RA billing series, bank receipts, and receivable aging schedule."
        badge="Client Billing"
      >
        <BillingReceivablesSection data={dashboardData} />
      </SectionWrapper>

      {/* SECTION 5: Vendor Bills & Finance */}
      <SectionWrapper
        id="sec-vendor-bills"
        title="5. Vendor Bills, Finance & Cash Flow"
        description="Operating cash flow trends, AP liabilities aging, and subcontractor WIP certifications."
        badge="Finance & Treasury"
      >
        <FinanceCashFlowSection data={dashboardData} />
      </SectionWrapper>

      {/* SECTION 6: Approvals Pending */}
      <SectionWrapper
        id="sec-approvals"
        title="6. Approvals Pending & System Alerts"
        description="Action queues for indents, POs, AP invoices, SC bills, and RA bills."
        badge={`${dashboardData.approvalsQueue.totalPending} Pending Approvals`}
      >
        <ApprovalsAlertsSection data={dashboardData} />
      </SectionWrapper>

      {/* SECTION 7: Tasks & Activity */}
      <SectionWrapper
        id="sec-tasks-activity"
        title="7. Tasks & System Activity"
        description="Assigned action items and real-time operational event notifications."
        badge="Workflow Tasks"
      >
        <TasksNotificationsSection data={dashboardData} />
      </SectionWrapper>

      {/* SECTION 8: Procurement Intel */}
      <SectionWrapper
        id="sec-procurement"
        title="8. Procurement Intelligence"
        description="7-Stage procurement funnel, PO spend trends, top vendor outlays, and delivery tracker."
        badge="Procurement"
      >
        <ProcurementIntelligenceSection data={dashboardData} />
      </SectionWrapper>

      {/* SECTION 9: Period Statistics & Snapshot */}
      <SectionWrapper
        id="sec-period-stats"
        title="9. Period Statistics, Inventory & Executive Snapshot"
        description="Stock movement, QC inspection yield, low-stock watchlist, health matrix, and audit log."
        badge="Period Stats"
      >
        <InventoryQualitySection data={dashboardData} />
        <ManagementSnapshotActivitySection data={dashboardData} />
      </SectionWrapper>
    </div>
  );
};
