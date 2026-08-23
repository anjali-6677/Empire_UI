import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateGRNReceivingAnalysis } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { PackageCheck, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

export const GRNReceivingAnalysisPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all', vendorId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateGRNReceivingAnalysis(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'tg', label: 'Total GRNs Processed', value: kpis.totalGRNs, type: 'number', icon: PackageCheck, variant: 'brand' },
    { id: 'av', label: 'Accepted Material Value', value: kpis.acceptedMaterialValue, type: 'currency', icon: CheckCircle, variant: 'success' },
    { id: 'rq', label: 'Rejected Quantity', value: kpis.rejectedQuantity, type: 'number', icon: AlertCircle, variant: 'danger' },
    { id: 'pl', label: 'Pending Payment Liability', value: kpis.pendingPaymentLiability, type: 'currency', icon: CreditCard, variant: 'warning' },
  ];

  const chartSeries: ChartSeriesConfig[] = [{ key: 'acceptedValue', label: 'Accepted Material Value', color: '#10b981', unit: 'currency' }];

  const columns: ReportColumnConfig[] = [
    { key: 'grnNumber', label: 'GRN Number', type: 'link', getLink: (r) => `/inventory/grn/${r.id}` },
    { key: 'poNumber', label: 'PO Number', type: 'text' },
    { key: 'tokenNumber', label: 'Gate Token', type: 'text' },
    { key: 'vendorName', label: 'Vendor', type: 'text' },
    { key: 'projectName', label: 'Project', type: 'text' },
    { key: 'grnDate', label: 'GRN Date', type: 'date' },
    { key: 'receivedQty', label: 'Recd Qty', type: 'number', align: 'right' },
    { key: 'acceptedQty', label: 'Acc Qty', type: 'number', align: 'right' },
    { key: 'rejectedQty', label: 'Rej Qty', type: 'number', align: 'right' },
    { key: 'acceptedValue', label: 'Accepted Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'qcStatus', label: 'QC Status', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['GRN Number', 'PO Number', 'Token Number', 'Vendor', 'Project', 'GRN Date', 'Recd Qty', 'Accepted Qty', 'Rejected Qty', 'Accepted Value', 'QC Status'].join(',');
    const csvLines = rows.map((r) => [r.grnNumber, r.poNumber, r.tokenNumber, `"${r.vendorName}"`, `"${r.projectName}"`, r.grnDate, r.receivedQty, r.acceptedQty, r.rejectedQty, r.acceptedValue, r.qcStatus].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grn-receiving-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="GRN & Receiving Analysis"
        description="Material inward volumes, receiving checks, accepted stock values, rejected quantities, and pending vendor payables."
        breadcrumbs={['GRN & Receiving Analysis']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all', vendorId: 'all' })} showVendorFilter />
      <ReportChartContainer title="Accepted Goods Inward Value by Vendor" type="bar" data={rows} series={chartSeries} xAxisKey="vendorName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No GRN records match filter criteria." />
    </div>
  );
};
