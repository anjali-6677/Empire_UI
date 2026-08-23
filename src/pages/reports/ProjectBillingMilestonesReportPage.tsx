import * as React from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { CommonReportFilters, calculateProjectBillingMilestones } from '../../utils/reportCalculators';
import { ReportPageHeader } from '../../components/reports/ReportPageHeader';
import { ReportKpiCards, KpiCardConfig } from '../../components/reports/ReportKpiCards';
import { ReportFilterBar } from '../../components/reports/ReportFilterBar';
import { ReportChartContainer, ChartSeriesConfig } from '../../components/reports/ReportChartContainer';
import { ReportTable, ReportColumnConfig } from '../../components/reports/ReportTable';
import { CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';

export const ProjectBillingMilestonesReportPage: React.FC = () => {
  const { state } = useERPStore();
  const [filters, setFilters] = React.useState<CommonReportFilters>({ projectId: 'all', clientId: 'all' });

  const { kpis, rows } = React.useMemo(() => {
    return calculateProjectBillingMilestones(state, filters);
  }, [state, filters]);

  const kpiCards: KpiCardConfig[] = [
    { id: 'tm', label: 'Total Contract Milestones', value: kpis.totalMilestones, type: 'number', icon: CheckCircle, variant: 'brand' },
    { id: 'tr', label: 'Milestones Triggered', value: kpis.triggeredMilestones, type: 'number', icon: CheckCircle, variant: 'info' },
    { id: 'bl', label: 'RA Bills Generated', value: kpis.billedMilestones, type: 'number', icon: DollarSign, variant: 'success' },
    { id: 'pb', label: 'Pending Billing Action', value: kpis.pendingBillingAction, type: 'number', icon: AlertCircle, variant: 'warning' },
    { id: 'pt', label: 'Pending Trigger Milestones', value: kpis.pendingTriggerCount, type: 'number', icon: Clock, variant: 'neutral' },
  ];

  const chartSeries: ChartSeriesConfig[] = [{ key: 'milestoneAmount', label: 'Milestone Amount (₹)', color: '#4f46e5', unit: 'currency' }];

  const columns: ReportColumnConfig[] = [
    { key: 'projectName', label: 'Project Name', type: 'text' },
    { key: 'clientName', label: 'Client', type: 'text' },
    { key: 'milestoneName', label: 'Milestone Stage', type: 'text' },
    { key: 'triggerCondition', label: 'Trigger Event', type: 'text' },
    { key: 'percentageShare', label: 'Share %', type: 'percentage', align: 'right' },
    { key: 'milestoneAmount', label: 'Milestone Amount', type: 'currency', align: 'right', sumTotal: true },
    { key: 'executionStatus', label: 'Execution Stage', type: 'text' },
    { key: 'isTriggered', label: 'Trigger Status', type: 'badge', align: 'center' },
    { key: 'billingStatus', label: 'RA Billing Status', type: 'badge', align: 'center' },
  ];

  const handleExportCSV = () => {
    const csvHeader = ['Project Name', 'Client', 'Milestone Stage', 'Trigger Event', 'Share %', 'Milestone Amount', 'Execution Stage', 'Trigger Status', 'Billing Status'].join(',');
    const csvLines = rows.map((r) => [`"${r.projectName}"`, `"${r.clientName}"`, `"${r.milestoneName}"`, `"${r.triggerCondition}"`, `${r.percentageShare}%`, r.milestoneAmount, `"${r.executionStatus}"`, r.isTriggered ? 'Triggered' : 'Pending Trigger', r.billingStatus].join(','));
    const content = '\uFEFF' + [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-billing-milestones-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-16">
      <ReportPageHeader
        title="Project Billing Milestones Report"
        description="Automatic milestone billing trigger tracking, contract payment terms, milestone fulfillment status, and client RA bill generation alerts."
        breadcrumbs={['Project Billing Milestones']}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
      />
      <ReportKpiCards cards={kpiCards} />
      <ReportFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({ projectId: 'all', clientId: 'all' })} showClientFilter />
      <ReportChartContainer title="Milestone Commercial Value Distribution" type="bar" data={rows} series={chartSeries} xAxisKey="milestoneName" />
      <ReportTable columns={columns} rows={rows} emptyMessage="No project milestone schedules found." />
    </div>
  );
};
