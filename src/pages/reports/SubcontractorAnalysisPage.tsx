import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateSubcontractorAnalysis } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { HardHat, CheckCircle, AlertTriangle, Wallet } from 'lucide-react';

export const SubcontractorAnalysisPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ subcontractorId: 'all', projectId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateSubcontractorAnalysis(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'wo', label: 'Total Work Order Value', value: kpis.totalWOValue, type: 'currency', icon: HardHat, variant: 'brand' },
    { id: 'wp', label: 'Certified WIP Value', value: kpis.totalCertifiedWIP, type: 'currency', icon: CheckCircle, variant: 'info' },
    { id: 'bl', label: 'Total Subcontractor Billed', value: kpis.totalBilled, type: 'currency', icon: Wallet, variant: 'warning' },
    { id: 'ob', label: 'Outstanding SC Balance', value: kpis.totalOutstanding, type: 'currency', icon: AlertTriangle, variant: 'danger' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'woValue', label: 'WO Value', color: '#4f46e5', unit: 'currency' },
    { key: 'certifiedWIP', label: 'Certified WIP', color: '#06b6d4', unit: 'currency' },
    { key: 'billed', label: 'Billed Amount', color: '#10b981', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'subcontractorName', label: 'Subcontractor Name', type: 'text' },
    { key: 'woNumber', label: 'Work Order', type: 'link', getLink: (r) => `/procurement/work-orders/${r.id}` },
    { key: 'projectName', label: 'Project', type: 'text' },
    { key: 'woValue', label: 'WO Contract Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'certifiedWIP', label: 'Certified WIP', type: 'currency', align: 'right', sumTotal: true },
    { key: 'billed', label: 'Total Billed', type: 'currency', align: 'right', sumTotal: true },
    { key: 'paid', label: 'Total Paid', type: 'currency', align: 'right', sumTotal: true },
    { key: 'outstanding', label: 'Outstanding Balance', type: 'currency', align: 'right', sumTotal: true },
    { key: 'completionPct', label: 'Completion %', type: 'percentage', align: 'right' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Subcontractor Name', 'Work Order', 'Project', 'WO Contract Value', 'Certified WIP', 'Total Billed', 'Total Paid', 'Outstanding Balance', 'Completion %'].join(',');
    const csvLines = rows.map((r) => [`"${r.subcontractorName}"`, r.woNumber, `"${r.projectName}"`, r.woValue, r.certifiedWIP, r.billed, r.paid, r.outstanding, `${r.completionPct}%`].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subcontractor-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Subcontractor Financial Analysis"
        description="Subcontractor work orders, certified WIP progress, RA billing, retention money, and outstanding balances."
        breadcrumbs={['Subcontractor Financial Analysis']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ subcontractorId: 'all', projectId: 'all' })} showSubcontractorFilter />
      <ReportChartContainer title="Subcontractor Work Order vs Certified WIP" type="bar" data={rows} series={chartSeries} xAxisKey="subcontractorName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No subcontractor work orders found." />
    </div>
  );
};
