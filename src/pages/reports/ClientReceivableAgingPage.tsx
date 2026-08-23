import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateClientReceivableAging } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { CalendarDays, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

export const ClientReceivableAgingPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ clientId: 'all', projectId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateClientReceivableAging(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'cr', label: 'Current Receivables (Not Overdue)', value: kpis.current, type: 'currency', icon: CalendarDays, variant: 'success' },
    { id: 'd1', label: '1 - 30 Days Overdue', value: kpis.days1To30, type: 'currency', icon: Clock, variant: 'warning' },
    { id: 'd2', label: '31 - 60 Days Overdue', value: kpis.days31To60, type: 'currency', icon: AlertTriangle, variant: 'danger' },
    { id: 'd3', label: '61 - 90 Days Overdue', value: kpis.days61To90, type: 'currency', icon: AlertTriangle, variant: 'danger' },
    { id: 'd4', label: '90+ Days Critical Overdue', value: kpis.days90Plus, type: 'currency', icon: ShieldAlert, variant: 'danger' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'current', label: 'Current', color: '#10b981', unit: 'currency' },
    { key: 'days1To30', label: '1-30 Days', color: '#f59e0b', unit: 'currency' },
    { key: 'days31To60', label: '31-60 Days', color: '#f97316', unit: 'currency' },
    { key: 'days61To90', label: '61-90 Days', color: '#ef4444', unit: 'currency' },
    { key: 'days90Plus', label: '90+ Days', color: '#b91c1c', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'clientName', label: 'Client Name', type: 'text' },
    { key: 'totalBilled', label: 'Total Billed', type: 'currency', align: 'right', sumTotal: true },
    { key: 'totalReceived', label: 'Total Received', type: 'currency', align: 'right', sumTotal: true },
    { key: 'totalOutstanding', label: 'Total Outstanding', type: 'currency', align: 'right', sumTotal: true },
    { key: 'current', label: 'Current', type: 'currency', align: 'right', sumTotal: true },
    { key: 'days1To30', label: '1 - 30 Days', type: 'currency', align: 'right', sumTotal: true },
    { key: 'days31To60', label: '31 - 60 Days', type: 'currency', align: 'right', sumTotal: true },
    { key: 'days61To90', label: '61 - 90 Days', type: 'currency', align: 'right', sumTotal: true },
    { key: 'days90Plus', label: '90+ Days', type: 'currency', align: 'right', sumTotal: true },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Client Name', 'Total Billed', 'Total Received', 'Total Outstanding', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days'].join(',');
    const csvLines = rows.map((r) => [`"${r.clientName}"`, r.totalBilled, r.totalReceived, r.totalOutstanding, r.current, r.days1To30, r.days31To60, r.days61To90, r.days90Plus].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-receivable-aging-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Client Receivable Aging Report"
        description="Aging bucket breakdown of client receivables into Current, 1-30, 31-60, 61-90, and 90+ days overdue buckets."
        breadcrumbs={['Client Receivable Aging']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ clientId: 'all', projectId: 'all' })} showClientFilter />
      <ReportChartContainer title="Client Outstanding Receivables Aging Buckets (Stacked)" type="stacked_bar" data={rows} series={chartSeries} xAxisKey="clientName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No client aging receivables found." />
    </div>
  );
};
