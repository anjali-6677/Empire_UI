import * as React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Home, ChevronRight, BarChart3, Wallet, PieChart, DollarSign, CheckCircle } from 'lucide-react';
import { ProjectFinancialSummaryPage } from './ProjectFinancialSummaryPage';
import { ProjectBudgetVsActualPage } from './ProjectBudgetVsActualPage';
import { ProjectAnalyticsPage } from './ProjectAnalyticsPage';
import { ProjectExpenditureBreakdownPage } from './ProjectExpenditureBreakdownPage';
import { ProjectBillingMilestonesReportPage } from './ProjectBillingMilestonesReportPage';

export const ProjectsCommercialReportsPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const activeTab = tab || 'financial-summary';

  const tabs = [
    { id: 'financial-summary', label: 'Project Financial Summary', icon: BarChart3 },
    { id: 'budget-vs-actual', label: 'Budget vs Actual', icon: Wallet },
    { id: 'analytics', label: 'Project Analytics', icon: PieChart },
    { id: 'expenditure', label: 'Expenditure Breakdown', icon: DollarSign },
    { id: 'billing-milestones', label: 'Billing Milestones', icon: CheckCircle },
  ];

  const handleTabChange = (tabId: string) => {
    navigate(`/reports/projects/${tabId}`);
  };

  return (
    <div className="flex flex-col gap-4 w-full font-sans text-xs pb-16">
      {/* Category Top Breadcrumb & Header */}
      <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 no-print">
        <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
          <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded">
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <Link to="/reports" className="hover:text-brand-600 transition-colors">
            Reports Center
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="text-gray-700 font-bold">Projects & Commercial Reports</span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
            Projects & Commercial Reports
          </h1>
        </div>

        {/* Horizontal Category Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-2 border-t border-gray-100">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabChange(t.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-md text-xs font-bold transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border-brand-600 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded Active Report Component */}
      <div className="w-full">
        {activeTab === 'financial-summary' && <ProjectFinancialSummaryPage />}
        {activeTab === 'budget-vs-actual' && <ProjectBudgetVsActualPage />}
        {activeTab === 'analytics' && <ProjectAnalyticsPage />}
        {activeTab === 'expenditure' && <ProjectExpenditureBreakdownPage />}
        {activeTab === 'billing-milestones' && <ProjectBillingMilestonesReportPage />}
      </div>
    </div>
  );
};
