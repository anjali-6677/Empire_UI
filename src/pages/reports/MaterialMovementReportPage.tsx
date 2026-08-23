import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateMaterialMovementConsumption } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { Truck, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';

export const MaterialMovementReportPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all', categoryId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateMaterialMovementConsumption(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'ti', label: 'Material Issues Dispatched', value: kpis.totalIssuesCount, type: 'number', icon: Truck, variant: 'brand' },
    { id: 'tq', label: 'Total Quantity Dispatched', value: kpis.totalDispatchedQty, type: 'number', icon: ArrowUpRight, variant: 'warning' },
    { id: 'rq', label: 'Total Quantity Received at Site', value: kpis.totalReceivedQty, type: 'number', icon: ArrowDownLeft, variant: 'success' },
    { id: 'mv', label: 'Total Issued Stock Value', value: kpis.totalIssuedValue, type: 'currency', icon: DollarSign, variant: 'danger' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'dispatchedQty', label: 'Dispatched Qty', color: '#f59e0b' },
    { key: 'receivedQty', label: 'Received Qty at Site', color: '#10b981' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'issueNumber', label: 'Issue Voucher', type: 'link', getLink: (r) => `/inventory/material-issues/${r.id}` },
    { key: 'issueDate', label: 'Issue Date', type: 'date' },
    { key: 'materialName', label: 'Material Name', type: 'text' },
    { key: 'projectName', label: 'Project Site', type: 'text' },
    { key: 'dispatchedQty', label: 'Dispatched Qty', type: 'number', align: 'right' },
    { key: 'receivedQty', label: 'Received Qty', type: 'number', align: 'right' },
    { key: 'unit', label: 'UOM', type: 'text', align: 'center' },
    { key: 'issuedValue', label: 'Issued Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'movementStatus', label: 'Transfer Status', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Issue Voucher', 'Issue Date', 'Material Name', 'Project Site', 'Dispatched Qty', 'Received Qty', 'UOM', 'Issued Value', 'Status'].join(',');
    const csvLines = rows.map((r) => [r.issueNumber, r.issueDate, `"${r.materialName}"`, `"${r.projectName}"`, r.dispatchedQty, r.receivedQty, r.unit, r.issuedValue, r.movementStatus].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `material-movement-consumption-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Material Movement & Consumption"
        description="Warehouse-to-site material dispatches, transit tracking, site store receiving logs, and consumption records."
        breadcrumbs={['Material Movement & Consumption']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all', categoryId: 'all' })} showCategoryFilter />
      <ReportChartContainer title="Material Site Dispatches & Transfer Volume" type="bar" data={rows} series={chartSeries} xAxisKey="issueNumber" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No material movement issue vouchers found." />
    </div>
  );
};
