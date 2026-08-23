import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateProjectExpenditureBreakdown } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { Boxes, HardHat, DollarSign, Wallet } from 'lucide-react';

export const ProjectExpenditureBreakdownPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateProjectExpenditureBreakdown(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'mc', label: 'Material Inward Cost (GRN)', value: kpis.materialCost, type: 'currency', icon: Boxes, variant: 'brand' },
    { id: 'sc', label: 'Subcontractor Certified Bills', value: kpis.subcontractorCost, type: 'currency', icon: HardHat, variant: 'warning' },
    { id: 'oc', label: 'Other Direct Site Costs', value: kpis.otherProjectCost, type: 'currency', icon: DollarSign, variant: 'info' },
    { id: 'tc', label: 'Total Actual Expenditure', value: kpis.totalActualCost, type: 'currency', icon: Wallet, variant: 'danger' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'materialCost', label: 'Material Costs', color: '#4f46e5', unit: 'currency' },
    { key: 'subcontractorCost', label: 'Subcontractor Costs', color: '#f59e0b', unit: 'currency' },
    { key: 'otherProjectCost', label: 'Other Direct Costs', color: '#10b981', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'projectName', label: 'Project Name', type: 'text' },
    { key: 'clientName', label: 'Client', type: 'text' },
    { key: 'materialCost', label: 'Material Cost (GRN)', type: 'currency', align: 'right', sumTotal: true },
    { key: 'subcontractorCost', label: 'Subcontractor Cost', type: 'currency', align: 'right', sumTotal: true },
    { key: 'otherProjectCost', label: 'Other Site Costs', type: 'currency', align: 'right', sumTotal: true },
    { key: 'totalActualCost', label: 'Total Actual Outlay', type: 'currency', align: 'right', sumTotal: true },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Project Name', 'Client', 'Material Cost', 'Subcontractor Cost', 'Other Site Costs', 'Total Outlay'].join(',');
    const csvLines = rows.map((r) => [`"${r.projectName}"`, `"${r.clientName}"`, r.materialCost, r.subcontractorCost, r.otherProjectCost, r.totalActualCost].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-expenditure-breakdown-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Project Expenditure Breakdown"
        description="Detailed split of actual project costs into raw material GRNs, certified subcontractor work bills, and operational expenses."
        breadcrumbs={['Project Expenditure Breakdown']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all' })} />
      <ReportChartContainer title="Cost Structure Breakdown (Stacked)" type="stacked_bar" data={rows} series={chartSeries} xAxisKey="projectName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No project expenditure records found." />
    </div>
  );
};
