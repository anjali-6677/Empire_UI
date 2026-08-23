import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculatePurchaseAnalysis } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { ShoppingBag, PackageCheck, Truck, FileText } from 'lucide-react';

export const PurchaseAnalysisPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all', vendorId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculatePurchaseAnalysis(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'ov', label: 'Total PO Ordered Value', value: kpis.totalOrderedValue, type: 'currency', icon: ShoppingBag, variant: 'brand' },
    { id: 'rv', label: 'Material Received Value', value: kpis.totalReceivedValue, type: 'currency', icon: PackageCheck, variant: 'success' },
    { id: 'pv', label: 'Pending Delivery Value', value: kpis.totalPendingValue, type: 'currency', icon: Truck, variant: 'warning' },
    { id: 'po', label: 'Active Purchase Orders', value: kpis.activePOsCount, type: 'number', icon: FileText, variant: 'info' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'orderedValue', label: 'Ordered Value', color: '#4f46e5', unit: 'currency' },
    { key: 'receivedValue', label: 'Received Value', color: '#10b981', unit: 'currency' },
    { key: 'pendingValue', label: 'Pending Delivery', color: '#f59e0b', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'poNumber', label: 'PO Number', type: 'link', getLink: (r) => `/procurement/purchase-orders/${r.id}` },
    { key: 'vendorName', label: 'Vendor', type: 'text' },
    { key: 'projectName', label: 'Project', type: 'text' },
    { key: 'poDate', label: 'PO Date', type: 'date' },
    { key: 'orderedValue', label: 'Ordered Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'receivedValue', label: 'Received Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'pendingValue', label: 'Pending Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'deliveryStatus', label: 'Fulfillment Status', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['PO Number', 'Vendor', 'Project', 'PO Date', 'Ordered Value', 'Received Value', 'Pending Value', 'Status'].join(',');
    const csvLines = rows.map((r) => [r.poNumber, `"${r.vendorName}"`, `"${r.projectName}"`, r.poDate, r.orderedValue, r.receivedValue, r.pendingValue, r.deliveryStatus].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `purchase-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Purchase Analysis"
        description="Comprehensive summary of purchase order values, material receiving fulfillment, and outstanding vendor deliveries."
        breadcrumbs={['Purchase Analysis']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all', vendorId: 'all' })} showVendorFilter />
      <ReportChartContainer title="PO Value vs Delivered Value by Vendor" type="bar" data={rows} series={chartSeries} xAxisKey="vendorName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No purchase orders match the selected filters." />
    </div>
  );
};
