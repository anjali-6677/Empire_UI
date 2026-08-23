import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateMaterialRateAnalysis } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { TrendingDown, TrendingUp, Calculator, DollarSign } from 'lucide-react';

export const MaterialRateAnalysisPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all', categoryId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateMaterialRateAnalysis(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'lr', label: 'Latest Unit Rate Paid', value: kpis.latestRate, type: 'currency', icon: DollarSign, variant: 'brand' },
    { id: 'lo', label: 'Lowest Rate Recorded', value: kpis.lowestRate, type: 'currency', icon: TrendingDown, variant: 'success' },
    { id: 'hi', label: 'Highest Rate Recorded', value: kpis.highestRate, type: 'currency', icon: TrendingUp, variant: 'danger' },
    { id: 'ar', label: 'Average Material Rate', value: kpis.averageRate, type: 'currency', icon: Calculator, variant: 'info' },
  ];

  const chartSeries: ChartSeriesConfig[] = [{ key: 'unitRate', label: 'PO Line Unit Rate (₹)', color: '#4f46e5', unit: 'currency' }];

  const columns: ReportColumnConfig[] = [
    { key: 'poDate', label: 'PO Date', type: 'date' },
    { key: 'materialName', label: 'Material Name', type: 'text' },
    { key: 'categoryName', label: 'Category', type: 'text' },
    { key: 'vendorName', label: 'Vendor', type: 'text' },
    { key: 'poNumber', label: 'PO Number', type: 'link', getLink: (r) => `/procurement/purchase-orders/${r.id.split('-')[0]}` },
    { key: 'qty', label: 'Quantity', type: 'number', align: 'right' },
    { key: 'unit', label: 'UOM', type: 'text', align: 'center' },
    { key: 'unitRate', label: 'Unit Rate (₹)', type: 'currency', align: 'right' },
    { key: 'rateDiffPct', label: 'Rate Variance %', type: 'percentage', align: 'right' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['PO Date', 'Material Name', 'Category', 'Vendor', 'PO Number', 'Quantity', 'UOM', 'Unit Rate', 'Variance %'].join(',');
    const csvLines = rows.map((r) => [r.poDate, `"${r.materialName}"`, `"${r.categoryName}"`, `"${r.vendorName}"`, r.poNumber, r.qty, r.unit, r.unitRate, `${r.rateDiffPct}%`].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `material-rate-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Material Rate Analysis"
        description="Historical unit rate variations, lowest vs highest purchase rates, and price trend analysis across PO line items."
        breadcrumbs={['Material Rate Analysis']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all', categoryId: 'all' })} showCategoryFilter />
      <ReportChartContainer title="Unit Rate Purchase Timeline" type="line" data={rows} series={chartSeries} xAxisKey="poDate" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No material rate purchase line items found." />
    </div>
  );
};
