import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateClientBillingReceivables } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { ReceiptText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export const ClientBillingReceivablesPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ clientId: 'all', projectId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateClientBillingReceivables(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'tb', label: 'Total Client RA Billed', value: kpis.totalBilled, type: 'currency', icon: ReceiptText, variant: 'brand' },
    { id: 'tr', label: 'Total Client Payments Received', value: kpis.totalReceived, type: 'currency', icon: CheckCircle, variant: 'success' },
    { id: 'to', label: 'Total Outstanding Receivables', value: kpis.totalOutstanding, type: 'currency', icon: AlertTriangle, variant: 'danger' },
    { id: 'od', label: 'Overdue Receivables (>30d)', value: kpis.overdue30Days, type: 'currency', icon: Clock, variant: 'warning' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'billed', label: 'Client RA Billed', color: '#4f46e5', unit: 'currency' },
    { key: 'received', label: 'Payments Received', color: '#10b981', unit: 'currency' },
    { key: 'outstanding', label: 'Outstanding Balance', color: '#ef4444', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'billNumber', label: 'RA Bill Number', type: 'link', getLink: (r) => `/finance/client-ra-bills/${r.id}` },
    { key: 'clientName', label: 'Client Name', type: 'text' },
    { key: 'projectName', label: 'Project Name', type: 'text' },
    { key: 'billDate', label: 'Bill Date', type: 'date' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'billed', label: 'RA Bill Amount', type: 'currency', align: 'right', sumTotal: true },
    { key: 'received', label: 'Received Amount', type: 'currency', align: 'right', sumTotal: true },
    { key: 'outstanding', label: 'Outstanding Balance', type: 'currency', align: 'right', sumTotal: true },
    { key: 'status', label: 'Collection Status', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['RA Bill Number', 'Client Name', 'Project Name', 'Bill Date', 'Due Date', 'RA Bill Amount', 'Received Amount', 'Outstanding', 'Status'].join(',');
    const csvLines = rows.map((r) => [r.billNumber, `"${r.clientName}"`, `"${r.projectName}"`, r.billDate, r.dueDate, r.billed, r.received, r.outstanding, r.status].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-billing-receivables-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Client Billing & Receivables"
        description="Client RA bill raising, certified revenue, payment receipts, outstanding balances, and collection status."
        breadcrumbs={['Client Billing & Receivables']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ clientId: 'all', projectId: 'all' })} showClientFilter />
      <ReportChartContainer title="Client Revenue Billed vs Received Payments" type="bar" data={rows} series={chartSeries} xAxisKey="clientName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No client RA bill records found." />
    </div>
  );
};
