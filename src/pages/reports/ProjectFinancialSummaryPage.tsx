import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateProjectFinancialSummary } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { BarChart3, TrendingUp, DollarSign, Wallet } from 'lucide-react';

export const ProjectFinancialSummaryPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all', clientId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateProjectFinancialSummary(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'cv', label: 'Total Contract Value', value: kpis.totalContractValue, type: 'currency', icon: BarChart3, variant: 'brand' },
    { id: 'bg', label: 'Baseline Budget', value: kpis.totalBudget, type: 'currency', icon: Wallet, variant: 'info' },
    { id: 'cm', label: 'Committed Cost', value: kpis.totalCommitted, type: 'currency', icon: DollarSign, variant: 'warning' },
    { id: 'ac', label: 'Actual Cost (GRN/AP+SC)', value: kpis.totalActual, type: 'currency', icon: DollarSign, variant: 'danger' },
    { id: 'rx', label: 'Client Revenue Billed', value: kpis.totalBilled, type: 'currency', icon: TrendingUp, variant: 'success' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'contractValue', label: 'Contract Value', color: '#4f46e5', unit: 'currency' },
    { key: 'actualCost', label: 'Actual Cost', color: '#ef4444', unit: 'currency' },
    { key: 'billed', label: 'Client Billed', color: '#10b981', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'projectCode', label: 'Project Code', type: 'link', getLink: (r) => `/projects/${r.id}` },
    { key: 'projectName', label: 'Project Name', type: 'text' },
    { key: 'clientName', label: 'Client', type: 'text' },
    { key: 'contractValue', label: 'Contract Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'budget', label: 'Budget Limit', type: 'currency', align: 'right', sumTotal: true },
    { key: 'committedCost', label: 'Committed Cost', type: 'currency', align: 'right', sumTotal: true },
    { key: 'actualCost', label: 'Actual Cost', type: 'currency', align: 'right', sumTotal: true },
    { key: 'billed', label: 'Client Billed', type: 'currency', align: 'right', sumTotal: true },
    { key: 'marginPct', label: 'Margin %', type: 'percentage', align: 'right' },
    { key: 'status', label: 'Status', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Project Code', 'Project Name', 'Client', 'Contract Value', 'Budget', 'Committed Cost', 'Actual Cost', 'Client Billed', 'Margin %', 'Status'].join(',');
    const csvLines = rows.map((r) => [r.projectCode, `"${r.projectName}"`, `"${r.clientName}"`, r.contractValue, r.budget, r.committedCost, r.actualCost, r.billed, `${r.marginPct}%`, r.status].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-financial-summary-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Project Financial Summary"
        description="Comprehensive portfolio view of contract values, budget limits, committed costs, actual costs, and client billing."
        breadcrumbs={['Projects & Commercial', 'Project Financial Summary']}
        hideBreadcrumbs
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all', clientId: 'all' })} showClientFilter />
      <ReportChartContainer title="Project Contract Value vs Expenditure" type="bar" data={rows} series={chartSeries} xAxisKey="projectName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No active projects matching filter criteria." />
    </div>
  );
};
