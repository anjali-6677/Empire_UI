import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateProjectBudgetVsActual } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { Wallet, DollarSign, CheckCircle } from 'lucide-react';

export const ProjectBudgetVsActualPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateProjectBudgetVsActual(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'ab', label: 'Approved Budget Limit', value: kpis.totalApprovedBudget, type: 'currency', icon: Wallet, variant: 'brand' },
    { id: 'cm', label: 'Committed PO/WO Expenditure', value: kpis.totalCommitted, type: 'currency', icon: DollarSign, variant: 'warning' },
    { id: 'ac', label: 'Actual GRN/Bill Incurred', value: kpis.totalActual, type: 'currency', icon: DollarSign, variant: 'danger' },
    { id: 'av', label: 'Available Budget Balance', value: kpis.totalAvailable, type: 'currency', icon: CheckCircle, variant: 'success' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'approvedBudget', label: 'Approved Budget', color: '#4f46e5', unit: 'currency' },
    { key: 'committed', label: 'Committed Cost', color: '#f59e0b', unit: 'currency' },
    { key: 'actual', label: 'Actual Outlay', color: '#ef4444', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'projectCode', label: 'Project Code', type: 'link', getLink: (r) => `/projects/${r.id}` },
    { key: 'projectName', label: 'Project Name', type: 'text' },
    { key: 'approvedBudget', label: 'Approved Budget', type: 'currency', align: 'right', sumTotal: true },
    { key: 'committed', label: 'Committed (PO/WO)', type: 'currency', align: 'right', sumTotal: true },
    { key: 'actual', label: 'Actual Cost', type: 'currency', align: 'right', sumTotal: true },
    { key: 'availableBalance', label: 'Available Balance', type: 'currency', align: 'right', sumTotal: true },
    { key: 'utilizationPct', label: 'Utilization %', type: 'percentage', align: 'right' },
    { key: 'health', label: 'Budget Health', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Project Code', 'Project Name', 'Approved Budget', 'Committed', 'Actual', 'Available Balance', 'Utilization %', 'Health'].join(',');
    const csvLines = rows.map((r) => [r.projectCode, `"${r.projectName}"`, r.approvedBudget, r.committed, r.actual, r.availableBalance, `${r.utilizationPct}%`, r.health].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-budget-vs-actual-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Project Budget vs Actual"
        description="Monitor baseline budget limits against committed purchase orders, subcontractor work orders, and actual invoices."
        breadcrumbs={['Project Budget vs Actual']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all' })} />
      <ReportChartContainer title="Budget Utilization Comparison" type="bar" data={rows} series={chartSeries} xAxisKey="projectName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No active project budgets found." />
    </div>
  );
};
