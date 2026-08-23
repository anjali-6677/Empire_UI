import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateRFQQuotationAnalysis } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { FileText, Users, DollarSign, Award } from 'lucide-react';

export const RFQQuotationAnalysisPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateRFQQuotationAnalysis(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'tr', label: 'Total RFQs Issued', value: kpis.totalRFQs, type: 'number', icon: FileText, variant: 'brand' },
    { id: 'qr', label: 'Quotations Received', value: kpis.quotesReceived, type: 'number', icon: Users, variant: 'info' },
    { id: 'av', label: 'Avg Quotes / RFQ', value: kpis.averageVendorsPerRFQ, type: 'number', icon: Users, variant: 'warning' },
    { id: 'as', label: 'Procurement Savings Savings', value: kpis.averageSavings, type: 'currency', icon: DollarSign, variant: 'success' },
    { id: 'aw', label: 'RFQs Awarded PO', value: kpis.rfqsAwarded, type: 'number', icon: Award, variant: 'brand' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'estimatedValue', label: 'Estimated Cost', color: '#64748b', unit: 'currency' },
    { key: 'selectedQuote', label: 'Awarded Cost', color: '#10b981', unit: 'currency' },
    { key: 'savings', label: 'Savings Achieved', color: '#f59e0b', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'rfqNumber', label: 'RFQ Number', type: 'link', getLink: (r) => `/procurement/rfqs/${r.id}` },
    { key: 'projectName', label: 'Project Name', type: 'text' },
    { key: 'packageTitle', label: 'Package Title', type: 'text' },
    { key: 'invitedVendorsCount', label: 'Invited Vendors', type: 'number', align: 'center' },
    { key: 'quotesReceived', label: 'Quotes Recd', type: 'number', align: 'center' },
    { key: 'estimatedValue', label: 'Estimated Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'selectedQuote', label: 'Awarded Quote', type: 'currency', align: 'right', sumTotal: true },
    { key: 'savings', label: 'Savings', type: 'currency', align: 'right', sumTotal: true },
    { key: 'status', label: 'RFQ Status', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['RFQ Number', 'Project Name', 'Package Title', 'Invited Vendors', 'Quotes Recd', 'Estimated Value', 'Awarded Quote', 'Savings', 'Status'].join(',');
    const csvLines = rows.map((r) => [r.rfqNumber, `"${r.projectName}"`, `"${r.packageTitle}"`, r.invitedVendorsCount, r.quotesReceived, r.estimatedValue, r.selectedQuote, r.savings, r.status].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rfq-quotation-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="RFQ & Quotation Analysis"
        description="Supplier bidding participation, quotation comparisons, estimated vs awarded package costs, and commercial savings."
        breadcrumbs={['RFQ & Quotation Analysis']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all' })} />
      <ReportChartContainer title="Estimated vs Awarded Bidding Cost" type="bar" data={rows} series={chartSeries} xAxisKey="rfqNumber" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No RFQ records found." />
    </div>
  );
};
