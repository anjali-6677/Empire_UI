import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateQCAnalysis } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { ShieldCheck, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';

export const QCAnalysisPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all', vendorId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateQCAnalysis(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'ti', label: 'Total Inspections Conducted', value: kpis.totalQCInspections, type: 'number', icon: ShieldCheck, variant: 'brand' },
    { id: 'pr', label: 'Pass Rate %', value: kpis.passRatePct, type: 'percentage', icon: CheckCircle, variant: 'success' },
    { id: 'rq', label: 'Failed QC Inspections', value: kpis.failedQC, type: 'number', icon: AlertTriangle, variant: 'danger' },
    { id: 'ao', label: 'Admin Exception Approvals', value: kpis.adminExceptions, type: 'number', icon: UserCheck, variant: 'warning' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'acceptedQty', label: 'Accepted Quantity', color: '#10b981' },
    { key: 'rejectedQty', label: 'Rejected Quantity', color: '#ef4444' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'qcNumber', label: 'QC Number', type: 'text' },
    { key: 'tokenNumber', label: 'Token No.', type: 'text' },
    { key: 'vendorName', label: 'Vendor', type: 'text' },
    { key: 'projectName', label: 'Project', type: 'text' },
    { key: 'inspectionDate', label: 'Inspection Date', type: 'date' },
    { key: 'receivedQty', label: 'Received Qty', type: 'number', align: 'right' },
    { key: 'acceptedQty', label: 'Accepted Qty', type: 'number', align: 'right' },
    { key: 'rejectedQty', label: 'Rejected Qty', type: 'number', align: 'right' },
    { key: 'inspectorName', label: 'Inspector', type: 'text' },
    { key: 'adminApproval', label: 'Admin Signoff', type: 'text' },
    { key: 'qcResult', label: 'QC Verdict', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['QC Number', 'Token No', 'Vendor', 'Project', 'Inspection Date', 'Received Qty', 'Accepted Qty', 'Rejected Qty', 'Inspector', 'Admin Signoff', 'Verdict'].join(',');
    const csvLines = rows.map((r) => [r.qcNumber, r.tokenNumber, `"${r.vendorName}"`, `"${r.projectName}"`, r.inspectionDate, r.receivedQty, r.acceptedQty, r.rejectedQty, `"${r.inspectorName}"`, `"${r.adminApproval}"`, r.qcResult].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qc-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Quality Control Analysis"
        description="Material inspection quality compliance, pass/fail rates, supplier rejection metrics, and inspector signoffs."
        breadcrumbs={['Quality Control Analysis']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all', vendorId: 'all' })} showVendorFilter />
      <ReportChartContainer title="Accepted vs Rejected Material Quantities by Vendor/Project" type="stacked_bar" data={rows} series={chartSeries} xAxisKey="vendorName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No QC inspection logs match filter criteria." />
    </div>
  );
};
