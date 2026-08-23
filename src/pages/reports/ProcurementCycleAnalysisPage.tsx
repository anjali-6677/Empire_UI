import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateProcurementCycleAnalysis } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { Clock, Truck, CheckCircle } from 'lucide-react';

export const ProcurementCycleAnalysisPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateProcurementCycleAnalysis(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'ir', label: 'Avg Indent → RFQ Days', value: kpis.avgIndentToRfqDays, type: 'number', icon: Clock, variant: 'brand' },
    { id: 'rp', label: 'Avg RFQ → PO Days', value: kpis.avgRfqToPoDays, type: 'number', icon: Clock, variant: 'info' },
    { id: 'pg', label: 'Avg PO → GRN Days', value: kpis.avgPoToGrnDays, type: 'number', icon: Truck, variant: 'warning' },
    { id: 'tc', label: 'Avg Total Cycle Days', value: kpis.avgTotalCycleDays, type: 'number', icon: CheckCircle, variant: 'success' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'indentToRfqDays', label: 'Indent → RFQ Days', color: '#4f46e5' },
    { key: 'rfqToPoDays', label: 'RFQ → PO Days', color: '#06b6d4' },
    { key: 'poToReceiptDays', label: 'PO → GRN Days', color: '#10b981' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'indentNumber', label: 'Indent No', type: 'link', getLink: (r) => `/procurement/indents/${r.id}` },
    { key: 'projectName', label: 'Project Name', type: 'text' },
    { key: 'rfqNumber', label: 'RFQ No', type: 'text' },
    { key: 'poNumber', label: 'PO No', type: 'text' },
    { key: 'grnNumber', label: 'GRN No', type: 'text' },
    { key: 'indentToRfqDays', label: 'Indent → RFQ (Days)', type: 'number', align: 'center' },
    { key: 'rfqToPoDays', label: 'RFQ → PO (Days)', type: 'number', align: 'center' },
    { key: 'poToReceiptDays', label: 'PO → GRN (Days)', type: 'number', align: 'center' },
    { key: 'totalCycleDays', label: 'Total Cycle (Days)', type: 'number', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Indent No', 'Project Name', 'RFQ No', 'PO No', 'GRN No', 'Indent-RFQ Days', 'RFQ-PO Days', 'PO-GRN Days', 'Total Cycle Days'].join(',');
    const csvLines = rows.map((r) => [r.indentNumber, `"${r.projectName}"`, r.rfqNumber, r.poNumber, r.grnNumber, r.indentToRfqDays, r.rfqToPoDays, r.poToReceiptDays, r.totalCycleDays].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `procurement-cycle-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Procurement Cycle Analysis"
        description="Fulfillment lead times across Indent creation, RFQ issuance, PO release, and Goods Receipt (GRN) site inward."
        breadcrumbs={['Procurement Cycle Analysis']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all' })} />
      <ReportChartContainer title="Procurement Stage Turnaround Lead Time (Days)" type="stacked_bar" data={rows} series={chartSeries} xAxisKey="indentNumber" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No procurement cycle records found." />
    </div>
  );
};
