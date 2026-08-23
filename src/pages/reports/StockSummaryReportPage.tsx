import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateStockSummary } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { Boxes, PackageCheck, Truck, DollarSign } from 'lucide-react';

export const StockSummaryReportPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all', categoryId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateStockSummary(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'sv', label: 'Total Stock Valuation', value: kpis.totalStockValue, type: 'currency', icon: DollarSign, variant: 'brand' },
    { id: 'ti', label: 'Unique Stock Items', value: rows.length, type: 'number', icon: Boxes, variant: 'info' },
    { id: 'tq', label: 'Cumulative Inward Qty', value: rows.reduce((sum, r) => sum + r.received, 0), type: 'number', icon: PackageCheck, variant: 'success' },
    { id: 'iq', label: 'Cumulative Outward Issued Qty', value: rows.reduce((sum, r) => sum + r.issued, 0), type: 'number', icon: Truck, variant: 'warning' },
  ];

  const chartSeries: ChartSeriesConfig[] = [{ key: 'stockValue', label: 'Stock Valuation (₹)', color: '#4f46e5', unit: 'currency' }];

  const columns: ReportColumnConfig[] = [
    { key: 'materialName', label: 'Item Name', type: 'text' },
    { key: 'categoryName', label: 'Category', type: 'text' },
    { key: 'unit', label: 'UOM', type: 'text', align: 'center' },
    { key: 'received', label: 'Total Received', type: 'number', align: 'right' },
    { key: 'issued', label: 'Total Issued', type: 'number', align: 'right' },
    { key: 'available', label: 'Available Stock', type: 'number', align: 'right' },
    { key: 'avgRate', label: 'Avg Rate (₹)', type: 'currency', align: 'right' },
    { key: 'stockValue', label: 'Valuation (₹)', type: 'currency', align: 'right', sumTotal: true },
    { key: 'location', label: 'Store Location', type: 'text', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Item Name', 'Category', 'UOM', 'Total Received', 'Total Issued', 'Available Stock', 'Avg Rate', 'Valuation', 'Location'].join(',');
    const csvLines = rows.map((r) => [`"${r.materialName}"`, `"${r.categoryName}"`, r.unit, r.received, r.issued, r.available, r.avgRate, r.stockValue, `"${r.location}"`].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-summary-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Stock Summary Report"
        description="Real-time opening balances, inward receipts, site dispatches, stock on hand, and material inventory valuation."
        breadcrumbs={['Stock Summary Report']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all', categoryId: 'all' })} showCategoryFilter />
      <ReportChartContainer title="Inventory Stock Valuation by Material" type="bar" data={rows} series={chartSeries} xAxisKey="materialName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No inventory stock balances found." />
    </div>
  );
};
