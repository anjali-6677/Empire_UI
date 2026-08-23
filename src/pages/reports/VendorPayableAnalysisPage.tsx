import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateVendorPayableAnalysis } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { CreditCard, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export const VendorPayableAnalysisPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ vendorId: 'all', projectId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateVendorPayableAnalysis(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'tb', label: 'Total Vendor Billed (AP)', value: kpis.totalBilled, type: 'currency', icon: CreditCard, variant: 'brand' },
    { id: 'tp', label: 'Total Vendor Paid', value: kpis.totalPaid, type: 'currency', icon: CheckCircle, variant: 'success' },
    { id: 'to', label: 'Total Outstanding AP Liability', value: kpis.totalOutstanding, type: 'currency', icon: AlertTriangle, variant: 'danger' },
    { id: 'od', label: 'Overdue Vendor Liabilities (>30d)', value: kpis.overdue30Days, type: 'currency', icon: Clock, variant: 'warning' },
  ];

  const chartSeries: ChartSeriesConfig[] = [
    { key: 'billed', label: 'Vendor Billed', color: '#4f46e5', unit: 'currency' },
    { key: 'paid', label: 'Paid Total', color: '#10b981', unit: 'currency' },
    { key: 'outstanding', label: 'Outstanding Balance', color: '#ef4444', unit: 'currency' },
  ];

  const columns: ReportColumnConfig[] = [
    { key: 'billNumber', label: 'Bill Number', type: 'link', getLink: (r) => `/finance/ap-bills/${r.id}` },
    { key: 'vendorName', label: 'Vendor Name', type: 'text' },
    { key: 'poNumber', label: 'PO Reference', type: 'text' },
    { key: 'billDate', label: 'Bill Date', type: 'date' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'billed', label: 'Bill Amount', type: 'currency', align: 'right', sumTotal: true },
    { key: 'paid', label: 'Paid Amount', type: 'currency', align: 'right', sumTotal: true },
    { key: 'outstanding', label: 'Outstanding', type: 'currency', align: 'right', sumTotal: true },
    { key: 'status', label: 'Payment Status', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Bill Number', 'Vendor Name', 'PO Reference', 'Bill Date', 'Due Date', 'Bill Amount', 'Paid Amount', 'Outstanding', 'Status'].join(',');
    const csvLines = rows.map((r) => [r.billNumber, `"${r.vendorName}"`, r.poNumber, r.billDate, r.dueDate, r.billed, r.paid, r.outstanding, r.status].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vendor-payable-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Vendor Payable Analysis"
        description="Vendor accounts payable liabilities, approved invoices, recorded payments, outstanding balances, and overdue aging."
        breadcrumbs={['Vendor Payable Analysis']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ vendorId: 'all', projectId: 'all' })} showVendorFilter />
      <ReportChartContainer title="Vendor AP Liability & Outstanding Balance" type="horizontal_bar" data={rows} series={chartSeries} xAxisKey="vendorName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No vendor AP invoice records found." />
    </div>
  );
};
