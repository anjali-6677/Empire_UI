import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateVendorPurchaseAnalysis } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { Store, ShoppingBag, Truck, Calculator } from 'lucide-react';

export const VendorPurchaseAnalysisPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ vendorId: 'all', projectId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateVendorPurchaseAnalysis(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'tv', label: 'Registered Vendors Engaged', value: kpis.totalVendorsUsed, type: 'number', icon: Store, variant: 'brand' },
    { id: 'pv', label: 'Cumulative Purchase Value', value: kpis.totalPurchaseValue, type: 'currency', icon: ShoppingBag, variant: 'success' },
    { id: 'le', label: 'Largest Vendor Exposure', value: kpis.largestVendorExposure, type: 'currency', icon: Truck, variant: 'warning' },
    { id: 'av', label: 'Average Order Value', value: kpis.averagePOValue, type: 'currency', icon: Calculator, variant: 'info' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'totalPOValue', label: 'Total PO Value', color: '#4f46e5', unit: 'currency' },
    { key: 'receivedValue', label: 'Delivered Value', color: '#10b981', unit: 'currency' },
    { key: 'outstandingDelivery', label: 'Outstanding Delivery', color: '#f59e0b', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'vendorName', label: 'Vendor Name', type: 'text' },
    { key: 'poCount', label: 'PO Count', type: 'number', align: 'center', sumTotal: true },
    { key: 'projectsSuppliedCount', label: 'Projects Supplied', type: 'number', align: 'center' },
    { key: 'totalPOValue', label: 'Total PO Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'receivedValue', label: 'Received Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'outstandingDelivery', label: 'Outstanding Delivery', type: 'currency', align: 'right', sumTotal: true },
    { key: 'averageOrderValue', label: 'Avg Order Value', type: 'currency', align: 'right' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Vendor Name', 'PO Count', 'Projects Supplied', 'Total PO Value', 'Received Value', 'Outstanding Delivery', 'Avg Order Value'].join(',');
    const csvLines = rows.map((r) => [`"${r.vendorName}"`, r.poCount, r.projectsSuppliedCount, r.totalPOValue, r.receivedValue, r.outstandingDelivery, r.averageOrderValue].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vendor-purchase-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Vendor Purchase Analysis"
        description="Vendor procurement volume, order counts, supplier concentration, and delivery performance."
        breadcrumbs={['Vendor Purchase Analysis']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ vendorId: 'all', projectId: 'all' })} showVendorFilter />
      <ReportChartContainer title="Vendor Purchase Distribution (Top 10)" type="horizontal_bar" data={rows} series={chartSeries} xAxisKey="vendorName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No vendor purchase records match filter criteria." />
    </div>
  );
};
