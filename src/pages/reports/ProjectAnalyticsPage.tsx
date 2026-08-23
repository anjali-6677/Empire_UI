import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateProjectAnalytics } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { BarChart3, TrendingUp, DollarSign, Wallet, Store, HardHat, AlertCircle } from 'lucide-react';

export const ProjectAnalyticsPage: React.FC = () => {
  const { state } = useERPStore();
  const projects = state.projects || [];
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(projects[0]?.id || '');
  const [filters] = React.useState<CommonReportFilters>({});

  React.useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const analyticsData = React.useMemo(() => {
    if (!selectedProjectId) return null;
    return calculateProjectAnalytics(state, selectedProjectId, filters);
  }, [state, selectedProjectId, filters]);

  if (!analyticsData) {
    return (
      <div className="p-8 text-center text-gray-500 font-sans">
        <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="font-bold">No active project selected for deep-dive analytics.</p>
      </div>
    );
  }

  const { project, kpis, expenditure, purchaseTable, subcontractorTable } = analyticsData;

  const kpiCards: KpiCardConfig[] = [
    { id: 'cv', label: 'Contract Value', value: kpis.contractValue, type: 'currency', icon: BarChart3, variant: 'brand' },
    { id: 'cm', label: 'Committed Cost', value: kpis.committedCost, type: 'currency', icon: DollarSign, variant: 'warning' },
    { id: 'ac', label: 'Actual Outlay', value: kpis.actualCost, type: 'currency', icon: Wallet, variant: 'danger' },
    { id: 'cb', label: 'Client RA Billed', value: kpis.clientBilled, type: 'currency', icon: TrendingUp, variant: 'success' },
    { id: 'vo', label: 'Vendor AP Outstanding', value: kpis.vendorOutstanding, type: 'currency', icon: Store, variant: 'info' },
  ];

  const expenditureChartData = [
    { category: 'Materials (GRN)', cost: expenditure.materialCost },
    { category: 'Subcontractors', cost: expenditure.subcontractorCost },
    { category: 'Other Overheads', cost: expenditure.otherProjectCost },
  ];

  const expenditureSeries: ChartSeriesConfig[] = [{ key: 'cost', label: 'Actual Cost', color: '#4f46e5', unit: 'currency' }];

  const poColumns: ReportColumnConfig[] = [
    { key: 'poNumber', label: 'PO Number', type: 'link', getLink: (r) => `/procurement/purchase-orders/${r.id}` },
    { key: 'vendorName', label: 'Vendor', type: 'text' },
    { key: 'poDate', label: 'PO Date', type: 'date' },
    { key: 'orderedValue', label: 'Ordered Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'receivedValue', label: 'Received Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'pendingValue', label: 'Pending Delivery', type: 'currency', align: 'right', sumTotal: true },
    { key: 'deliveryStatus', label: 'Delivery Status', type: 'badge', align: 'center' },
  ];

  const scColumns: ReportColumnConfig[] = [
    { key: 'subcontractorName', label: 'Subcontractor', type: 'text' },
    { key: 'woNumber', label: 'Work Order', type: 'link', getLink: (r) => `/procurement/work-orders/${r.id}` },
    { key: 'woValue', label: 'WO Value', type: 'currency', align: 'right', sumTotal: true },
    { key: 'certifiedWIP', label: 'Certified WIP', type: 'currency', align: 'right', sumTotal: true },
    { key: 'billed', label: 'Total Billed', type: 'currency', align: 'right', sumTotal: true },
    { key: 'outstanding', label: 'Outstanding Balance', type: 'currency', align: 'right', sumTotal: true },
    { key: 'completionPct', label: 'Progress %', type: 'percentage', align: 'right' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title={`Project Analytics: ${project.projectName}`}
        description={`360-degree financial, procurement, subcontractor, and billing analytics for project ${project.projectCode}.`}
        breadcrumbs={['Project Analytics', project.projectCode]}
        onExportCSV={() => window.print()}
        onPrint={() => window.print()}
      />

      {/* Project Selector Bar */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700 uppercase">Select Project Deep Dive:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="border border-brand-300 rounded px-3 py-1.5 bg-brand-50/50 text-xs font-bold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectCode} - {p.projectName} ({p.clientName})
              </option>
            ))}
          </select>
        </div>

        <div className="text-right text-[11px] font-medium text-gray-500">
          Client: <span className="font-bold text-gray-900">{project.clientName}</span> | Location:{' '}
          <span className="font-bold text-gray-900">{project.siteAddress || 'Site Headquarters'}</span>
        </div>
      </div>

      <ReportKpiCards cards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportChartContainer title="Expenditure Breakdown by Category" type="bar" data={expenditureChartData} series={expenditureSeries} xAxisKey="category" />
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-gray-900 border-b border-gray-150 pb-2 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-brand-600" /> Commercial Health & Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4 my-auto py-2">
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Client Collection Status</span>
              <p className="text-base font-mono font-extrabold text-emerald-700 mt-1">
                {kpis.clientBilled > 0 ? `${((kpis.clientReceived / kpis.clientBilled) * 100).toFixed(1)}%` : '0%'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Received ₹{(kpis.clientReceived / 100000).toFixed(2)}L of ₹{(kpis.clientBilled / 100000).toFixed(2)}L</p>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Budget Outlay Ratio</span>
              <p className="text-base font-mono font-extrabold text-brand-700 mt-1">
                {kpis.contractValue > 0 ? `${((kpis.actualCost / kpis.contractValue) * 100).toFixed(1)}%` : '0%'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Spent ₹{(kpis.actualCost / 100000).toFixed(2)}L of ₹{(kpis.contractValue / 100000).toFixed(2)}L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Procurement PO Table */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
          <Store className="h-4 w-4 text-brand-600" /> Project Purchase Orders ({purchaseTable.length})
        </h3>
        <ReportTable columns={poColumns} rows={purchaseTable} emptyMessage="No purchase orders raised for this project." />
      </div>

      {/* Subcontractor Work Orders Table */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
          <HardHat className="h-4 w-4 text-amber-600" /> Subcontractor Work Orders ({subcontractorTable.length})
        </h3>
        <ReportTable columns={scColumns} rows={subcontractorTable} emptyMessage="No subcontractor work orders assigned to this project." />
      </div>
    </div>
  );
};
