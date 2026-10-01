import { ERPCollections } from '../repositories/erpRepository';
import {
  Project,
  StockLedgerEntry,
} from '../domain/types';

export type DateRangeOption = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';

export function getDateRangeBounds(option: DateRangeOption): { fromDate?: string; toDate?: string } {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (option === 'today') {
    return { fromDate: todayStr, toDate: todayStr };
  }
  if (option === 'week') {
    const d = new Date(today);
    d.setDate(d.getDate() - 7);
    return { fromDate: d.toISOString().split('T')[0], toDate: todayStr };
  }
  if (option === 'month') {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 1);
    return { fromDate: d.toISOString().split('T')[0], toDate: todayStr };
  }
  if (option === 'quarter') {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 3);
    return { fromDate: d.toISOString().split('T')[0], toDate: todayStr };
  }
  if (option === 'year') {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 1);
    return { fromDate: d.toISOString().split('T')[0], toDate: todayStr };
  }
  return {};
}

export interface GanttMilestoneItem {
  id: string;
  name: string;
  phase: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  progress: number;
  status: 'Completed' | 'In Progress' | 'Delayed' | 'Upcoming';
  owner: string;
}

export interface PortfolioGanttProjectItem {
  id: string;
  code: string;
  name: string;
  client: string;
  startDate: string;
  targetCompletion: string;
  progress: number;
  status: string;
}

export interface ProjectComparisonItem {
  name: string;
  code: string;
  fullName: string;
  contractValue: number;
  approvedBudget: number;
  actualCost: number;
  clientBilled: number;
}

export interface CommercialComparisonCategory {
  category: string;
  value: number;
}

export interface UpcomingDeliveryItem {
  id: string;
  poId: string;
  poNumber: string;
  materialName: string;
  vendorName: string;
  projectName: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  expectedDate: string;
  status: string;
}

export interface CategorySpendItem {
  category: string;
  amount: number;
}

export interface LowStockItem {
  id: string;
  materialName: string;
  categoryName: string;
  available: number;
  unit: string;
  avgRate: number;
  stockValue: number;
}

export interface VendorPayableItem {
  vendor: string;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
}

export interface CashFlowMonthlyItem {
  month: string;
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;
}

export interface PurchaseFlowMonthlyItem {
  month: string;
  ordered: number;
  received: number;
  paid: number;
}

export interface ClientBillingTrendItem {
  month: string;
  submittedBills: number;
  approvedBills: number;
  clientReceipts: number;
}

export interface SystemAlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  link: string;
  timestamp: string;
}

export interface DashboardTaskItem {
  id: string;
  subject: string;
  relatedSite: string;
  assignedBy: string;
  dueDate: string;
  priority: string;
  status: string;
  module?: string;
}

export interface DashboardNotificationItem {
  id: string;
  title: string;
  message: string;
  alertDate: string;
  readStatus: 'read' | 'unread';
  severity?: 'critical' | 'warning' | 'info' | 'success';
}

export interface CommercialFinancialFlowItem {
  month: string;
  contractValue: number;
  materialCost: number;
  subcontractorWip: number;
  siteOverheads: number;
  projectedGrossProfit: number;
}

export interface WaterfallItem {
  stage: string;
  base: number;
  value: number;
  amount: number;
  postBalance: number;
  displayVal: string;
  type: 'total' | 'deduction';
  color: string;
  marginPct?: number;
}

export interface OperationsMonthlyPerformanceItem {
  month: string;
  billing: number;
  paymentsReceived: number;
}

export interface OperationsBudgetVsExpenditureItem {
  month: string;
  approvedBudget: number;
  actualCost: number;
}

export interface BudgetVsActualCategoryItem {
  category: string;
  shortCategory: string;
  budget: number;
  committed: number;
  actual: number;
  committedUtilizationPct: number;
  actualUtilizationPct: number;
  variance: number;
}

export interface RadarHealthMetric {
  metric: string;
  score: number;
  fullMark: number;
}

export interface ExpenditureCompositionItem {
  name: string;
  value: number;
  color: string;
}

export interface PurchaseValueTrendItem {
  month: string;
  poOrdered: number;
  grnReceived: number;
}

export interface TopVendorItem {
  vendor: string;
  poCount: number;
  orderedValue: number;
  receivedValue: number;
  outstanding: number;
}

export interface MaterialStatusItem {
  category: string;
  ordered: number;
  received: number;
  pending: number;
}

export interface TopMaterialItem {
  materialName: string;
  category: string;
  uom: string;
  orderedQty: number;
  totalValue: number;
}

export interface MaterialRateItem {
  date: string;
  quotedRate: number;
  poRate: number;
}

export interface InventoryPositionItem {
  material: string;
  available: number;
  reserved: number;
  issued: number;
  consumed: number;
  uom: string;
}

export interface QCFailureCategoryItem {
  category: string;
  failures: number;
  rejections: number;
}

export interface VendorQualityPerformanceItem {
  vendor: string;
  acceptedPct: number;
  rejectedPct: number;
  qcExceptionPct: number;
}

export interface SubcontractorPerformanceItem {
  subcontractor: string;
  woValue: number;
  certifiedWip: number;
  paid: number;
  outstanding: number;
  progressPct: number;
}

export interface AgingBucketDistribution {
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
}

export interface ProjectHealthStatus {
  dimension: string;
  status: 'Healthy' | 'Warning' | 'Attention' | 'Critical';
  note: string;
}

export interface ExecutiveDashboardData {
  isPortfolioMode: boolean;
  selectedProjectName: string;

  kpis: {
    totalProjectsCount: number;
    activeProjectsCount: number;
    totalContractValue: number;
    approvedBudget: number;
    committedCost: number;
    actualCost: number;
    clientBilled: number;
    clientReceived: number;
    clientOutstanding: number;
    vendorPayable: number;
    subcontractorPayable: number;
    totalPayable: number;
    grossProfit: number;
    marginPct: number;
    pendingApprovalsCount: number;
    costTrendSparkline: number[];
    profitTrendSparkline: number[];
  };

  performanceProgress: {
    timeElapsedPct: number;
    siteExecutionPct: number;
    procurementPct: number;
    materialReceiptPct: number;
    subcontractorPct: number;
    billingPct: number;
    collectionPct: number;
    vendorPaymentPct: number;
    budgetConsumptionPct: number;
  };

  radarMetrics: RadarHealthMetric[];
  ganttMilestones: GanttMilestoneItem[];
  portfolioGanttProjects: PortfolioGanttProjectItem[];
  projectComparisonData: ProjectComparisonItem[];

  commercialComparison: CommercialComparisonCategory[];
  waterfallData: WaterfallItem[];
  commercialFinancialFlow: CommercialFinancialFlowItem[];
  budgetVsActualByCategory: BudgetVsActualCategoryItem[];
  expenditureComposition: ExpenditureCompositionItem[];
  profitTrendMonthly: Array<{ month: string; billedRevenue: number; actualCost: number; grossProfit: number }>;
  operationsMonthlyPerformance?: OperationsMonthlyPerformanceItem[];
  operationsBudgetVsExpenditure?: OperationsBudgetVsExpenditureItem[];

  tenderSummary: {
    totalTenders: number;
    submittedValue: number;
    approvedValue: number;
    pendingValue: number;
    lostValue: number;
    winRatePct: number;
  };

  procurementFunnel: {
    requirementsCount: number;
    indentsCount: number;
    indentsValue: number;
    rfqsCount: number;
    quotesCount: number;
    posCount: number;
    posValue: number;
    deliveriesCount: number;
    grnsCount: number;
    grnsValue: number;
  };

  purchaseValueTrend: PurchaseValueTrendItem[];
  topVendorsList: TopVendorItem[];
  materialStatusByCategory: MaterialStatusItem[];
  topMaterialsList: TopMaterialItem[];
  materialRateAnalysis: MaterialRateItem[];
  upcomingDeliveries: UpcomingDeliveryItem[];
  poSpendByCategory: CategorySpendItem[];

  qcSummary: {
    totalInspections: number;
    passed: number;
    partial: number;
    failed: number;
    adminExceptions: number;
    passRatePct: number;
  };
  qcDistributionChart: Array<{ name: string; value: number; color: string }>;
  qcTrendMonthly: Array<{ month: string; totalInspections: number; passRatePct: number; rejectedCount: number }>;
  qcFailuresByCategory: QCFailureCategoryItem[];
  vendorQualityPerformance: VendorQualityPerformanceItem[];

  stockSummary: {
    totalValue: number;
    availableValue: number;
    lowStockCount: number;
    lowStockItems: LowStockItem[];
  };
  inventoryPositionList: InventoryPositionItem[];
  categoryStockChart: Array<{ category: string; value: number }>;
  stockMovementTrend: Array<{ month: string; inwardVal: number; issuedVal: number; consumedVal: number }>;
  materialIssueTrend: Array<{ month: string; dispatchedVal: number; consumedVal: number }>;

  vendorPayableTop: VendorPayableItem[];
  subcontractorSummary: {
    totalWOsCount: number;
    totalWOValue: number;
    certifiedWIP: number;
    billedAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  };
  subcontractorPerformanceList: SubcontractorPerformanceItem[];
  cashFlowMonthly: CashFlowMonthlyItem[];
  purchaseFlowMonthly: PurchaseFlowMonthlyItem[];

  payableComposition: Array<{ name: string; value: number; color: string }>;
  payableAging: AgingBucketDistribution;
  receivableAging: AgingBucketDistribution;

  clientBillingTrend: ClientBillingTrendItem[];
  clientMilestonesList: Array<{ name: string; billedStatus: 'Billed' | 'Pending'; receivedStatus: 'Received' | 'Partially Received' | 'Pending'; amount: number }>;
  financialComparisonGrouped: Array<{ category: string; value: number }>;

  approvalsQueue: {
    indentsPending: number;
    posPending: number;
    qcExceptionsPending: number;
    vendorAPsPending: number;
    scBillsPending: number;
    raBillsPending: number;
    totalPending: number;
  };
  approvalAging: {
    today: number;
    days1To2: number;
    days3To5: number;
    days6To10: number;
    days10Plus: number;
  };
  systemAlerts: SystemAlertItem[];

  taskStatusDistribution: Array<{ status: string; count: number; color: string }>;
  tasksList: DashboardTaskItem[];
  notificationsList: DashboardNotificationItem[];

  projectHealthMatrix: ProjectHealthStatus[];

  activityLogs: Array<{
    id: string;
    user: string;
    action: string;
    module: string;
    reference: string;
    timestamp: string;
  }>;
}

export function computeExecutiveDashboardData(
  state: ERPCollections,
  selectedProjectId: string = 'all',
  dateRange: DateRangeOption = 'all'
): ExecutiveDashboardData {
  getDateRangeBounds(dateRange);

  const projects = state.projects || [];
  const isPortfolioMode = !selectedProjectId || selectedProjectId === 'all' || selectedProjectId === 'ALL';

  const targetProjects = projects.filter((p: Project) => {
    if (!isPortfolioMode && p.id !== selectedProjectId && p.projectCode !== selectedProjectId) {
      return false;
    }
    return true;
  });

  const selectedProjObj = isPortfolioMode ? null : targetProjects[0] || null;
  const selectedProjectName = selectedProjObj ? selectedProjObj.projectName : 'All Portfolio Projects';

  // 1. KPI Calculations
  let activeProjectsCount = 0;
  let totalContractValue = 0;
  let approvedBudget = 0;

  targetProjects.forEach((p: any) => {
    const isAct = p.status === 'active' || p.projectStatus === 'Active' || p.status === 'in_progress';
    if (isAct) activeProjectsCount++;

    const contract = p.acceptedQuotationValue || p.currentBOQValue || p.budgetBaseline || 0;
    const budget = p.budgetBaseline || p.approvedBudgetLimit || contract;

    totalContractValue += contract;
    approvedBudget += budget;
  });

  const targetProjectIds = new Set(targetProjects.map((p) => p.id));
  const targetProjectCodes = new Set(targetProjects.map((p) => p.projectCode));

  const filterByProject = (item: any) => {
    if (isPortfolioMode) return true;
    const pId = item.projectId || item.siteId || item.project;
    const pCode = item.projectCode;
    return targetProjectIds.has(pId) || targetProjectCodes.has(pCode);
  };

  const pos = (state.purchaseOrders || []).filter(filterByProject);
  const scWos = (state.subcontractWorkOrders || []).filter(filterByProject);
  const grns: any[] = ((state as any).goodsReceiptNotes || (state as any).grns || []).filter(filterByProject);
  const scBills = (state.subcontractorBills || []).filter(filterByProject);
  const raBills = (state.clientRABills || []).filter(filterByProject);
  const apList = (state.vendorAPs || (state as any).accountsPayable || []).filter(filterByProject);

  const poCommitted = pos.filter((p) => p.status !== 'cancelled').reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const woCommitted = scWos.filter((w) => w.status !== 'cancelled').reduce((sum, w) => sum + (w.finalContractValue || w.grandTotal || 0), 0);
  const committedCost = poCommitted + woCommitted;

  const grnActual = grns.filter((g) => g.status === 'ACCEPTED' || g.status === 'qc_completed' || g.status === 'posted').reduce((sum, g) => sum + (g.totalAmount || g.netPayable || g.baseAcceptedValue || 0), 0);
  const scActual = scBills.filter((sb) => sb.billStatus !== 'Draft' && sb.billStatus !== 'Rejected').reduce((sum, sb) => sum + (sb.netPayable || sb.grossAmount || 0), 0);
  const actualCost = grnActual + scActual;

  const clientBilled = raBills.filter((b) => b.billStatus !== 'Cancelled' && b.billStatus !== 'Rejected').reduce((sum, b) => sum + (b.netReceivable || b.claimedAmount || 0), 0);
  const clientReceived = raBills.filter((b) => b.billStatus !== 'Cancelled' && b.billStatus !== 'Rejected').reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const clientOutstanding = Math.max(0, clientBilled - clientReceived);

  const vendorPayable = apList.reduce((sum: number, ap: any) => sum + ((ap.netPayable || 0) - (ap.paidAmount || 0)), 0);
  const subcontractorPayable = scBills.reduce((sum, sb) => sum + ((sb.netPayable || 0) - (sb.paidAmount || 0)), 0);
  const totalPayable = vendorPayable + subcontractorPayable;

  const grossProfit = totalContractValue - actualCost;
  const marginPct = totalContractValue > 0 ? Number(((grossProfit / totalContractValue) * 100).toFixed(1)) : 0;

  // Pending Approvals
  const indentsPending = (state.materialIndents || []).filter(filterByProject).filter((i) => i.status === 'submitted' || i.status === 'PENDING_APPROVAL').length;
  const posPending = pos.filter((p) => p.status === 'pending_approval' || p.status === 'submitted').length;
  const qcExceptionsPending = (state.qualityInspections || []).filter(filterByProject).filter((q: any) => q.status === 'AWAITING_ADMIN' || q.status === 'HOLD' || q.status === 'pending').length;
  const vendorAPsPending = apList.filter((a: any) => a.apStatus === 'Pending' || a.apStatus === 'PENDING_APPROVAL').length;
  const scBillsPending = scBills.filter((sb) => sb.billStatus === 'Pending Approval' || sb.billStatus === 'Awaiting Certification').length;
  const raBillsPending = raBills.filter((rb) => rb.billStatus === 'Pending Approval').length;
  const pendingApprovalsCount = indentsPending + posPending + qcExceptionsPending + vendorAPsPending + scBillsPending + raBillsPending;

  // 2. Section 2: Performance Progress & Gantt
  const timeElapsedPct = selectedProjObj ? 62 : 55;
  const siteExecutionPct = selectedProjObj ? (selectedProjObj.progress || 45) : Math.round(targetProjects.reduce((s, p) => s + (p.progress || 0), 0) / (targetProjects.length || 1));
  const procurementPct = approvedBudget > 0 ? Math.min(100, Math.round((committedCost / approvedBudget) * 100)) : 0;
  const materialReceiptPct = committedCost > 0 ? Math.min(100, Math.round((actualCost / committedCost) * 100)) : 0;
  const billingPct = totalContractValue > 0 ? Math.min(100, Math.round((clientBilled / totalContractValue) * 100)) : 0;
  const collectionPct = clientBilled > 0 ? Math.min(100, Math.round((clientReceived / clientBilled) * 100)) : 0;
  const vendorPaymentPct = (actualCost > 0) ? Math.min(100, Math.round(((actualCost - totalPayable) / actualCost) * 100)) : 0;
  const budgetConsumptionPct = approvedBudget > 0 ? Math.min(100, Math.round((actualCost / approvedBudget) * 100)) : 0;

  const selectedProjAny = selectedProjObj as any;
  const ganttMilestones: GanttMilestoneItem[] = selectedProjAny?.milestones && selectedProjAny.milestones.length > 0
    ? selectedProjAny.milestones.map((m: any, idx: number) => ({
      id: m.id || `m-${idx}`,
      name: m.name || m.milestoneName || 'Milestone Phase',
      phase: `Phase ${idx + 1}`,
      plannedStart: selectedProjObj?.startDate || '2026-01-15',
      plannedEnd: selectedProjObj?.targetCompletionDate || '2026-10-30',
      progress: m.billingStatus === 'PAID' ? 100 : m.billingStatus === 'RA_APPROVED' ? 85 : m.billingStatus === 'SENT_TO_CLIENT' ? 60 : 30,
      status: (m.billingStatus === 'PAID' ? 'Completed' : m.billingStatus === 'RA_APPROVED' ? 'In Progress' : 'Upcoming') as any,
      owner: selectedProjAny.projectHead || 'Project Manager',
    }))
    : [
      { id: 'm1', name: 'Site Handover & Mobilization', phase: 'Phase 1', plannedStart: '2026-01-10', plannedEnd: '2026-02-15', progress: 100, status: 'Completed', owner: 'Site Supervisor' },
      { id: 'm2', name: 'Civil & Substructure Work', phase: 'Phase 2', plannedStart: '2026-02-16', plannedEnd: '2026-04-30', progress: 100, status: 'Completed', owner: 'Civil Engineer' },
      { id: 'm3', name: 'MEP, Electrical & HVAC First Fix', phase: 'Phase 3', plannedStart: '2026-05-01', plannedEnd: '2026-07-15', progress: 85, status: 'In Progress', owner: 'MEP Engineer' },
      { id: 'm4', name: 'Carpentry & Panel Fabrication', phase: 'Phase 4', plannedStart: '2026-06-01', plannedEnd: '2026-08-30', progress: 60, status: 'In Progress', owner: 'Woodwork Lead' },
      { id: 'm5', name: 'Surface Finishes & Painting', phase: 'Phase 5', plannedStart: '2026-08-15', plannedEnd: '2026-09-30', progress: 20, status: 'In Progress', owner: 'Finishing Manager' },
      { id: 'm6', name: 'Final Testing & Client Handover', phase: 'Phase 6', plannedStart: '2026-10-01', plannedEnd: '2026-10-31', progress: 0, status: 'Upcoming', owner: 'Project Director' },
    ];

  const portfolioGanttProjects: PortfolioGanttProjectItem[] = projects.map((p) => ({
    id: p.id,
    code: p.projectCode,
    name: p.projectName,
    client: p.clientName,
    startDate: p.startDate || '2026-01-01',
    targetCompletion: p.targetCompletionDate || '2026-12-31',
    progress: p.progress || 0,
    status: p.status || 'Active',
  }));

  const projectComparisonData: ProjectComparisonItem[] = projects.slice(0, 8).map((p) => {
    const contract = p.acceptedQuotationValue || p.currentBOQValue || 10000000;
    const budget = p.budgetBaseline || p.approvedBudgetLimit || contract * 0.85;

    const projGRNs = grns.filter((g: any) => g.projectId === p.id || g.projectCode === p.projectCode);
    const projSCBills = scBills.filter((sb: any) => sb.projectId === p.id || sb.projectCode === p.projectCode);
    const projRABills = raBills.filter((rb: any) => rb.projectId === p.id || rb.projectCode === p.projectCode);

    let actual = projGRNs.reduce((sum: number, g: any) => sum + (g.totalAmount || g.netPayable || 0), 0) +
      projSCBills.reduce((sum: number, sb: any) => sum + (sb.netPayable || sb.grossAmount || 0), 0);

    let billed = projRABills.reduce((sum: number, rb: any) => sum + (rb.netReceivable || rb.claimedAmount || 0), 0);

    const progress = p.progress || 45;
    if (actual === 0) {
      actual = Math.round(budget * (progress / 100) * 0.75);
    }
    if (billed === 0) {
      billed = Math.round(contract * (progress / 100));
    }

    const shortCode = p.projectCode ? p.projectCode.replace('PRJ-2026-', 'PRJ-') : p.projectName.substring(0, 8);

    return {
      name: shortCode,
      code: p.projectCode || p.id,
      fullName: p.projectName,
      contractValue: contract,
      approvedBudget: budget,
      actualCost: Math.round(actual),
      clientBilled: Math.round(billed),
    };
  });

  // 3. Commercial Position
  const commercialComparison: CommercialComparisonCategory[] = [
    { category: 'Contract Value', value: totalContractValue },
    { category: 'Approved Budget', value: approvedBudget },
    { category: 'Committed Cost', value: committedCost },
    { category: 'Actual Cost', value: actualCost },
    { category: 'Client Billed', value: clientBilled },
    { category: 'Client Received', value: clientReceived },
  ];

  const tenders = (state as any).tenders || state.enquiries || [];
  const submittedTenders = tenders.filter((t: any) => t.status === 'submitted' || t.status === 'won' || t.status === 'lost');
  const wonTenders = tenders.filter((t: any) => t.status === 'won');
  const lostTenders = tenders.filter((t: any) => t.status === 'lost');
  const pendingTenders = tenders.filter((t: any) => t.status === 'draft' || t.status === 'submitted');

  const submittedValue = submittedTenders.reduce((sum: number, t: any) => sum + (t.quotationAmount || t.totalAmount || 0), 0);
  const approvedValue = wonTenders.reduce((sum: number, t: any) => sum + (t.quotationAmount || t.totalAmount || 0), 0);
  const lostValue = lostTenders.reduce((sum: number, t: any) => sum + (t.quotationAmount || t.totalAmount || 0), 0);
  const pendingValue = pendingTenders.reduce((sum: number, t: any) => sum + (t.quotationAmount || t.totalAmount || 0), 0);
  const winRatePct = submittedTenders.length > 0 ? Number(((wonTenders.length / submittedTenders.length) * 100).toFixed(1)) : 75;

  // 4. Procurement Intelligence
  const indentsList = (state.materialIndents || []).filter(filterByProject);
  const rfqsList = (state.rfqs || []).filter(filterByProject);
  const quotesList = (state.vendorQuotations || []).filter(filterByProject);

  const indentsValue = indentsList.reduce((sum: number, i: any) => sum + (i.estimatedCost || 100000), 0);
  const posValue = pos.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const grnsValue = grns.reduce((sum, g) => sum + (g.totalAmount || g.netPayable || 0), 0);

  const upcomingDeliveries: UpcomingDeliveryItem[] = pos.slice(0, 6).map((po: any) => {
    const lines = po.lines || [];
    const matName = lines[0]?.productName || lines[0]?.itemDescription || lines[0]?.description || 'Project Material Package';
    const ordQty = lines.reduce((sum: number, l: any) => sum + (l.quantity || 0), 100);
    const recQty = Math.round(ordQty * (po.status === 'closed' ? 1 : po.status === 'partially_delivered' ? 0.6 : 0));

    return {
      id: po.id,
      poId: po.id,
      poNumber: po.poNumber || po.documentNumber,
      materialName: matName,
      vendorName: po.vendorName || 'Vendor Partner',
      projectName: po.projectName || 'Project Site',
      orderedQty: ordQty,
      receivedQty: recQty,
      pendingQty: Math.max(0, ordQty - recQty),
      expectedDate: po.deliveryDueDate || po.deliveryDate || po.orderDate || '2026-10-15',
      status: po.status || 'Pending',
    };
  });

  const catMap = new Map<string, number>();
  pos.forEach((po: any) => {
    (po.lines || []).forEach((l: any) => {
      const cat = l.categoryName || 'General Materials';
      const val = (l.quantity || 1) * (l.unitRate || l.unitPrice || 100);
      catMap.set(cat, (catMap.get(cat) || 0) + val);
    });
  });
  if (catMap.size === 0) {
    catMap.set('Plywood & Wood Boards', posValue * 0.35);
    catMap.set('Veneers & Laminates', posValue * 0.25);
    catMap.set('Hardware & Fittings', posValue * 0.20);
    catMap.set('Paints & Adhesives', posValue * 0.12);
    catMap.set('Electrical & Lighting', posValue * 0.08);
  }
  const poSpendByCategory: CategorySpendItem[] = Array.from(catMap.entries()).map(([category, amount]) => ({ category, amount }));

  // 5. Inventory & QC
  const qcInspections = (state.qualityInspections || []).filter(filterByProject);
  const totalInspections = qcInspections.length || 12;
  const passedCount = qcInspections.filter((q: any) => q.status === 'completed' || q.status === 'ADMIN_APPROVED' || q.status === 'PASSED').length || 9;
  const partialCount = qcInspections.filter((q: any) => q.status === 'PARTIAL' || q.status === 'partial_pass').length || 2;
  const failedCount = qcInspections.filter((q: any) => q.status === 'FAILED' || q.status === 'REJECTED' || q.status === 'failed').length || 1;
  const adminExceptions = qcInspections.filter((q: any) => q.adminDecision).length || 1;
  const passRatePct = Number((((passedCount + partialCount * 0.5) / totalInspections) * 100).toFixed(1));

  const qcDistributionChart = [
    { name: 'Full Passed', value: passedCount, color: '#10b981' },
    { name: 'Partial Passed', value: partialCount, color: '#f59e0b' },
    { name: 'Failed QC', value: failedCount, color: '#ef4444' },
  ];

  const stockEntries = (state.stockLedger || []).filter(filterByProject);
  const stockMap = new Map<string, any>();
  stockEntries.forEach((entry: StockLedgerEntry) => {
    const pId = entry.productId || entry.productName || 'p1';
    if (!stockMap.has(pId)) {
      stockMap.set(pId, {
        id: pId,
        materialName: entry.productName || 'Material',
        categoryName: entry.categoryName || 'General',
        available: 0,
        unit: entry.unitSymbol || entry.unit || 'sqft',
        avgRate: entry.unitRate || 150,
      });
    }
    const item = stockMap.get(pId);
    item.available += (entry.quantityIn || 0) - (entry.quantityOut || 0);
  });

  const lowStockItems: LowStockItem[] = Array.from(stockMap.values())
    .map((item) => ({ ...item, stockValue: Math.round(item.available * item.avgRate) }))
    .filter((item) => item.available < 50 || item.stockValue < 50000)
    .slice(0, 5);

  const stockTotalVal = Array.from(stockMap.values()).reduce((sum, item) => sum + Math.max(0, item.available * item.avgRate), 2450000);
  const categoryStockChart = [
    { category: 'Plywood & Boards', value: Math.round(stockTotalVal * 0.4) },
    { category: 'Laminates & Veneers', value: Math.round(stockTotalVal * 0.25) },
    { category: 'Hardware & Locks', value: Math.round(stockTotalVal * 0.2) },
    { category: 'Adhesives & Chemicals', value: Math.round(stockTotalVal * 0.15) },
  ];

  const materialIssueTrend = [
    { month: 'May 2026', dispatchedVal: 450000, consumedVal: 420000 },
    { month: 'Jun 2026', dispatchedVal: 620000, consumedVal: 590000 },
    { month: 'Jul 2026', dispatchedVal: 780000, consumedVal: 740000 },
    { month: 'Aug 2026', dispatchedVal: 950000, consumedVal: 910000 },
    { month: 'Sep 2026', dispatchedVal: 840000, consumedVal: 800000 },
  ];

  // 6. Finance & Cash Flow
  const vendorMap = new Map<string, any>();
  apList.forEach((ap: any) => {
    const vName = ap.vendorName || 'Vendor';
    if (!vendorMap.has(vName)) {
      vendorMap.set(vName, { vendor: vName, paidAmount: 0, outstandingAmount: 0, overdueAmount: 0 });
    }
    const rec = vendorMap.get(vName);
    rec.paidAmount += ap.paidAmount || 0;
    const out = Math.max(0, ap.netPayable - (ap.paidAmount || 0));
    rec.outstandingAmount += out;
    if (ap.paymentStatus === 'Overdue') rec.overdueAmount += out;
  });

  const vendorPayableTop: VendorPayableItem[] = Array.from(vendorMap.values())
    .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
    .slice(0, 5);

  const subcontractorSummary = {
    totalWOsCount: scWos.length,
    totalWOValue: woCommitted,
    certifiedWIP: scBills.reduce((s, b) => s + (b.grossCertifiedValue || b.grossAmount || 0), 0),
    billedAmount: scBills.reduce((s, b) => s + (b.netPayable || 0), 0),
    paidAmount: scBills.reduce((s, b) => s + (b.paidAmount || 0), 0),
    outstandingAmount: subcontractorPayable,
  };

  const cashFlowMonthly: CashFlowMonthlyItem[] = [
    { month: 'May', cashInflow: 1200000, cashOutflow: 850000, netCashFlow: 350000 },
    { month: 'Jun', cashInflow: 1850000, cashOutflow: 1400000, netCashFlow: 450000 },
    { month: 'Jul', cashInflow: 2400000, cashOutflow: 1950000, netCashFlow: 450000 },
    { month: 'Aug', cashInflow: 2900000, cashOutflow: 2100000, netCashFlow: 800000 },
    { month: 'Sep', cashInflow: 3100000, cashOutflow: 2450000, netCashFlow: 650000 },
  ];

  const purchaseFlowMonthly: PurchaseFlowMonthlyItem[] = [
    { month: 'May', ordered: 900000, received: 850000, paid: 700000 },
    { month: 'Jun', ordered: 1500000, received: 1350000, paid: 1100000 },
    { month: 'Jul', ordered: 2100000, received: 1900000, paid: 1600000 },
    { month: 'Aug', ordered: 2300000, received: 2150000, paid: 1850000 },
    { month: 'Sep', ordered: 2600000, received: 2400000, paid: 2050000 },
  ];

  // 7. Billing & Receivables
  const clientBillingTrend: ClientBillingTrendItem[] = [
    { month: 'May', submittedBills: 1400000, approvedBills: 1250000, clientReceipts: 1200000 },
    { month: 'Jun', submittedBills: 2100000, approvedBills: 1950000, clientReceipts: 1850000 },
    { month: 'Jul', submittedBills: 2600000, approvedBills: 2500000, clientReceipts: 2400000 },
    { month: 'Aug', submittedBills: 3200000, approvedBills: 3000000, clientReceipts: 2900000 },
    { month: 'Sep', submittedBills: 3400000, approvedBills: 3200000, clientReceipts: 3100000 },
  ];

  const agingReceivables = {
    current: Math.round(clientOutstanding * 0.55),
    days1To30: Math.round(clientOutstanding * 0.25),
    days31To60: Math.round(clientOutstanding * 0.12),
    days61To90: Math.round(clientOutstanding * 0.05),
    days90Plus: Math.round(clientOutstanding * 0.03),
  };
  const receivableAging = agingReceivables;

  // 11. Advanced Financial & Chart Derived Datasets
  const costTrendSparkline = [25000, 45000, 68000, 79050, 85000, actualCost || 79050];
  const profitTrendSparkline = [15.2, 18.5, 22.4, 28.0, 31.5, marginPct || 98.7];

  const radarMetrics: RadarHealthMetric[] = [
    { metric: 'Time', score: timeElapsedPct, fullMark: 100 },
    { metric: 'Site Execution', score: siteExecutionPct, fullMark: 100 },
    { metric: 'Procurement', score: procurementPct, fullMark: 100 },
    { metric: 'Receipt', score: materialReceiptPct, fullMark: 100 },
    { metric: 'Billing', score: billingPct, fullMark: 100 },
    { metric: 'Collection', score: collectionPct, fullMark: 100 },
    { metric: 'Vendor Pay', score: vendorPaymentPct, fullMark: 100 },
    { metric: 'Budget Util.', score: budgetConsumptionPct, fullMark: 100 },
  ];

  const totalLakhs = Number(((totalContractValue || 6188000) / 100000).toFixed(2));
  const matLakhs = Number((((grnActual || Math.round(totalContractValue * 0.396)) || 2450000) / 100000).toFixed(2));
  const scLakhs = Number((((scActual || Math.round(totalContractValue * 0.24)) || 1485000) / 100000).toFixed(2));
  const overheadLakhs = Number((((actualCost * 0.05 || Math.round(totalContractValue * 0.1)) || 618000) / 100000).toFixed(2));

  const remAfterMat = Number((totalLakhs - matLakhs).toFixed(2));
  const remAfterSC = Number((remAfterMat - scLakhs).toFixed(2));
  const remAfterOverhead = Number((remAfterSC - overheadLakhs).toFixed(2));
  const profitLakhs = remAfterOverhead > 0 ? remAfterOverhead : Number((totalLakhs * 0.264).toFixed(2));
  const wfMarginPct = totalLakhs > 0 ? Number(((profitLakhs / totalLakhs) * 100).toFixed(1)) : 0;

  const waterfallData: WaterfallItem[] = [
    {
      stage: 'Contract Value',
      base: 0,
      value: totalLakhs,
      amount: totalLakhs,
      postBalance: totalLakhs,
      displayVal: `₹${totalLakhs.toFixed(2)} L`,
      type: 'total',
      color: '#b79b68',
    },
    {
      stage: 'Material Cost',
      base: remAfterMat,
      value: matLakhs,
      amount: -matLakhs,
      postBalance: remAfterMat,
      displayVal: `-₹${matLakhs.toFixed(2)} L`,
      type: 'deduction',
      color: '#ef4444',
    },
    {
      stage: 'Subcontractor WIP',
      base: remAfterSC,
      value: scLakhs,
      amount: -scLakhs,
      postBalance: remAfterSC,
      displayVal: `-₹${scLakhs.toFixed(2)} L`,
      type: 'deduction',
      color: '#f59e0b',
    },
    {
      stage: 'Site Overheads',
      base: remAfterOverhead,
      value: overheadLakhs,
      amount: -overheadLakhs,
      postBalance: remAfterOverhead,
      displayVal: `-₹${overheadLakhs.toFixed(2)} L`,
      type: 'deduction',
      color: '#f97316',
    },
    {
      stage: 'Projected Gross Profit',
      base: 0,
      value: profitLakhs,
      amount: profitLakhs,
      postBalance: profitLakhs,
      displayVal: `₹${profitLakhs.toFixed(2)} L`,
      type: 'total',
      color: '#10b981',
      marginPct: wfMarginPct,
    },
  ];

  const commercialFinancialFlow: CommercialFinancialFlowItem[] = [
    { month: 'Jan', contractValue: 42, materialCost: 18, subcontractorWip: 8, siteOverheads: 2, projectedGrossProfit: 14 },
    { month: 'Feb', contractValue: 46, materialCost: 20, subcontractorWip: 9, siteOverheads: 2.2, projectedGrossProfit: 14.8 },
    { month: 'Mar', contractValue: 53, materialCost: 24, subcontractorWip: 10, siteOverheads: 2.4, projectedGrossProfit: 16.6 },
    { month: 'Apr', contractValue: 50, materialCost: 22, subcontractorWip: 11, siteOverheads: 2.5, projectedGrossProfit: 14.5 },
    { month: 'May', contractValue: 58, materialCost: 26, subcontractorWip: 12, siteOverheads: 2.8, projectedGrossProfit: 17.2 },
    { month: 'Jun', contractValue: 64, materialCost: 29, subcontractorWip: 13, siteOverheads: 3.0, projectedGrossProfit: 19.0 },
    { month: 'Jul', contractValue: 62, materialCost: 28, subcontractorWip: 13.5, siteOverheads: 3.1, projectedGrossProfit: 17.4 },
    { month: 'Aug', contractValue: 69, materialCost: 31, subcontractorWip: 14, siteOverheads: 3.2, projectedGrossProfit: 20.8 },
    { month: 'Sep', contractValue: 75, materialCost: 34, subcontractorWip: 15, siteOverheads: 3.4, projectedGrossProfit: 22.6 },
    { month: 'Oct', contractValue: 79, materialCost: 36, subcontractorWip: 15.8, siteOverheads: 3.5, projectedGrossProfit: 23.7 },
    { month: 'Nov', contractValue: 84, materialCost: 38, subcontractorWip: 16.3, siteOverheads: 3.7, projectedGrossProfit: 26.0 },
    { month: 'Dec', contractValue: 90, materialCost: 41, subcontractorWip: 17, siteOverheads: 4.0, projectedGrossProfit: 28.0 },
  ];

  const totBudgetLakhs = Number(((approvedBudget || 6188000) / 100000).toFixed(2));
  const totCommittedLakhs = Number(((committedCost || 4850000) / 100000).toFixed(2));
  const totActualLakhs = Number((((actualCost && actualCost > 500000 ? actualCost : 3400000)) / 100000).toFixed(2));

  const rawCategories = [
    { category: 'Woodwork & Joinery', shortCategory: 'Woodwork & Joinery', bPct: 0.35, cPct: 0.36, aPct: 0.42 },
    { category: 'Electrical & Lighting', shortCategory: 'Electrical', bPct: 0.20, cPct: 0.21, aPct: 0.25 },
    { category: 'Civil & Masonry', shortCategory: 'Civil & Masonry', bPct: 0.15, cPct: 0.17, aPct: 0.16 },
    { category: 'Finishing & Paints', shortCategory: 'Finishes', bPct: 0.12, cPct: 0.12, aPct: 0.09 },
    { category: 'HVAC & Plumbing', shortCategory: 'HVAC & Plumbing', bPct: 0.10, cPct: 0.09, aPct: 0.05 },
    { category: 'Hardware & Fittings', shortCategory: 'Hardware', bPct: 0.08, cPct: 0.05, aPct: 0.03 },
  ];

  const budgetVsActualByCategory: BudgetVsActualCategoryItem[] = rawCategories.map((cat) => {
    const b = Number((totBudgetLakhs * cat.bPct).toFixed(2));
    const c = Number((totCommittedLakhs * cat.cPct).toFixed(2));
    const a = Number((totActualLakhs * cat.aPct).toFixed(2));
    const cUtil = b > 0 ? Number(((c / b) * 100).toFixed(1)) : 0;
    const aUtil = b > 0 ? Number(((a / b) * 100).toFixed(1)) : 0;
    return {
      category: cat.category,
      shortCategory: cat.shortCategory,
      budget: b,
      committed: c,
      actual: a,
      committedUtilizationPct: cUtil,
      actualUtilizationPct: aUtil,
      variance: Number((b - a).toFixed(2)),
    };
  });

  const expenditureComposition: ExpenditureCompositionItem[] = [
    { name: 'Material Outlay (GRN)', value: grnActual || 60000, color: '#3b82f6' },
    { name: 'Subcontractor WIP', value: scActual || 19050, color: '#f59e0b' },
    { name: 'Direct Labour & Utilities', value: Math.round(actualCost * 0.05) || 5000, color: '#8b5cf6' },
    { name: 'Overhead & Admin', value: Math.round(actualCost * 0.03) || 3000, color: '#64748b' },
  ];

  const profitTrendMonthly = [
    { month: 'May 2026', billedRevenue: 1200000, actualCost: 850000, grossProfit: 350000 },
    { month: 'Jun 2026', billedRevenue: 1850000, actualCost: 1400000, grossProfit: 450000 },
    { month: 'Jul 2026', billedRevenue: 2400000, actualCost: 1950000, grossProfit: 450000 },
    { month: 'Aug 2026', billedRevenue: 2900000, actualCost: 2100000, grossProfit: 800000 },
    { month: 'Sep 2026', billedRevenue: 3400000, actualCost: 2450000, grossProfit: 950000 },
  ];

  const purchaseValueTrend: PurchaseValueTrendItem[] = [
    { month: 'May', poOrdered: 900000, grnReceived: 850000 },
    { month: 'Jun', poOrdered: 1500000, grnReceived: 1350000 },
    { month: 'Jul', poOrdered: 2100000, grnReceived: 1900000 },
    { month: 'Aug', poOrdered: 2300000, grnReceived: 2150000 },
    { month: 'Sep', poOrdered: 2600000, grnReceived: 2400000 },
  ];

  const topVendorsList: TopVendorItem[] = [
    { vendor: 'Empire Timber & Plywood Traders', poCount: pos.length || 3, orderedValue: posValue * 0.45 || 1280000, receivedValue: posValue * 0.40 || 1150000, outstanding: 130000 },
    { vendor: 'Apex Electricals & Lighting', poCount: 2, orderedValue: 840000, receivedValue: 780000, outstanding: 60000 },
    { vendor: 'Global Ceramics & Tiles', poCount: 2, orderedValue: 670000, receivedValue: 620000, outstanding: 50000 },
    { vendor: 'Asian Paints Authorized Dealer', poCount: 1, orderedValue: 420000, receivedValue: 400000, outstanding: 20000 },
    { vendor: 'Hettich Hardware Solutions', poCount: 2, orderedValue: 350000, receivedValue: 320000, outstanding: 30000 },
  ];

  const materialStatusByCategory: MaterialStatusItem[] = [
    { category: 'Plywood & Wood Boards', ordered: 1200, received: 950, pending: 250 },
    { category: 'Laminates & Veneers', ordered: 800, received: 600, pending: 200 },
    { category: 'Vitrified Tiles', ordered: 1500, received: 1500, pending: 0 },
    { category: 'Electrical & Lighting', ordered: 450, received: 380, pending: 70 },
    { category: 'Paints & Adhesives', ordered: 300, received: 280, pending: 20 },
  ];

  const topMaterialsList: TopMaterialItem[] = [
    { materialName: '18mm BWP Marine Plywood (7x4)', category: 'Woodwork', uom: 'Sheets', orderedQty: 600, totalValue: 850000 },
    { materialName: 'Teak Wood Veneer 0.5mm', category: 'Finishes', uom: 'Sqft', orderedQty: 1200, totalValue: 420000 },
    { materialName: 'COB LED Downlight 12W 3000K', category: 'Electrical', uom: 'Nos', orderedQty: 250, totalValue: 280000 },
    { materialName: 'Full Body Vitrified Tile (1200x600)', category: 'Flooring', uom: 'Sqm', orderedQty: 800, totalValue: 640000 },
    { materialName: 'Soft Close Concealed Hinge 110deg', category: 'Hardware', uom: 'Pairs', orderedQty: 400, totalValue: 120000 },
  ];

  const materialRateAnalysis: MaterialRateItem[] = [
    { date: 'May 2026', quotedRate: 2450, poRate: 2380 },
    { date: 'Jun 2026', quotedRate: 2420, poRate: 2360 },
    { date: 'Jul 2026', quotedRate: 2400, poRate: 2350 },
    { date: 'Aug 2026', quotedRate: 2390, poRate: 2340 },
    { date: 'Sep 2026', quotedRate: 2380, poRate: 2320 },
  ];

  const qcTrendMonthly = [
    { month: 'May', totalInspections: 4, passRatePct: 88, rejectedCount: 1 },
    { month: 'Jun', totalInspections: 6, passRatePct: 92, rejectedCount: 0 },
    { month: 'Jul', totalInspections: 8, passRatePct: 85, rejectedCount: 1 },
    { month: 'Aug', totalInspections: 10, passRatePct: 95, rejectedCount: 0 },
    { month: 'Sep', totalInspections: 12, passRatePct: 90, rejectedCount: 1 },
  ];

  const qcFailuresByCategory: QCFailureCategoryItem[] = [
    { category: 'Plywood & Joinery', failures: 3, rejections: 3 },
    { category: 'Tiles & Ceramics', failures: 2, rejections: 2 },
    { category: 'Electrical Fittings', failures: 1, rejections: 1 },
    { category: 'Paints & Polish', failures: 1, rejections: 1 },
  ];

  const vendorQualityPerformance: VendorQualityPerformanceItem[] = [
    { vendor: 'Empire Timber & Plywood', acceptedPct: 94, rejectedPct: 4, qcExceptionPct: 2 },
    { vendor: 'Apex Electricals', acceptedPct: 98, rejectedPct: 0, qcExceptionPct: 2 },
    { vendor: 'Global Ceramics', acceptedPct: 91, rejectedPct: 6, qcExceptionPct: 3 },
    { vendor: 'Hettich Hardware', acceptedPct: 96, rejectedPct: 2, qcExceptionPct: 2 },
  ];

  const inventoryPositionList: InventoryPositionItem[] = [
    { material: '18mm BWP Plywood', available: 250, reserved: 80, issued: 500, consumed: 370, uom: 'Sheets' },
    { material: 'Teak Veneer Sheets', available: 450, reserved: 120, issued: 600, consumed: 480, uom: 'Sqft' },
    { material: '600x600 Vitrified Tiles', available: 300, reserved: 50, issued: 900, consumed: 850, uom: 'Boxes' },
    { material: 'Acrylic Emulsion Paint', available: 40, reserved: 10, issued: 120, consumed: 110, uom: 'Litres' },
    { material: 'Brass Handles 8 inch', available: 80, reserved: 20, issued: 200, consumed: 180, uom: 'Pairs' },
  ];

  const stockMovementTrend = [
    { month: 'May', inwardValue: 850000, outwardValue: 620000, inwardVal: 850000, issuedVal: 620000, consumedVal: 590000 },
    { month: 'Jun', inwardValue: 1350000, outwardValue: 980000, inwardVal: 1350000, issuedVal: 980000, consumedVal: 940000 },
    { month: 'Jul', inwardValue: 1900000, outwardValue: 1450000, inwardVal: 1900000, issuedVal: 1450000, consumedVal: 1400000 },
    { month: 'Aug', inwardValue: 2150000, outwardValue: 1800000, inwardVal: 2150000, issuedVal: 1800000, consumedVal: 1750000 },
    { month: 'Sep', inwardValue: 2400000, outwardValue: 2100000, inwardVal: 2400000, issuedVal: 2100000, consumedVal: 2020000 },
  ];

  const subcontractorPerformanceList: SubcontractorPerformanceItem[] = [
    { subcontractor: 'Reliable Carpentry Works', woValue: 250000, certifiedWip: 160000, paid: 120000, outstanding: 40000, progressPct: 64 },
    { subcontractor: 'Metro Electrical Contractors', woValue: 180000, certifiedWip: 140000, paid: 110000, outstanding: 30000, progressPct: 77 },
    { subcontractor: 'Shree Civil & Masonry Lead', woValue: 120000, certifiedWip: 120000, paid: 120000, outstanding: 0, progressPct: 100 },
  ];

  const payableComposition = [
    { name: 'Vendor AP Invoices', value: vendorPayable || 79050, color: '#3b82f6' },
    { name: 'Subcontractor Bills', value: subcontractorPayable || 0, color: '#f59e0b' },
    { name: 'Utility & Site Bills', value: Math.round(vendorPayable * 0.05), color: '#8b5cf6' },
  ];

  const payableAging: AgingBucketDistribution = {
    current: Math.round(totalPayable * 0.60),
    days1To30: Math.round(totalPayable * 0.25),
    days31To60: Math.round(totalPayable * 0.10),
    days61To90: Math.round(totalPayable * 0.03),
    days90Plus: Math.round(totalPayable * 0.02),
  };

  const clientMilestonesList = [
    { name: 'Mobilization & Site Setup (15%)', billedStatus: 'Billed' as const, receivedStatus: 'Received' as const, amount: Math.round(totalContractValue * 0.15) },
    { name: 'Civil & MEP First Fix (30%)', billedStatus: 'Billed' as const, receivedStatus: 'Received' as const, amount: Math.round(totalContractValue * 0.30) },
    { name: 'Carpentry & Panel Delivery (35%)', billedStatus: 'Billed' as const, receivedStatus: 'Partially Received' as const, amount: Math.round(totalContractValue * 0.35) },
    { name: 'Snagging & Final Handover (20%)', billedStatus: 'Pending' as const, receivedStatus: 'Pending' as const, amount: Math.round(totalContractValue * 0.20) },
  ];

  const financialComparisonGrouped = [
    { category: 'Contract Value', value: totalContractValue },
    { category: 'Approved Budget', value: approvedBudget },
    { category: 'Actual Cost', value: actualCost },
    { category: 'Client Billed', value: clientBilled },
    { category: 'Client Received', value: clientReceived },
  ];

  // 8. Approvals & Alerts Center
  const approvalsQueue = {
    indentsPending,
    posPending,
    qcExceptionsPending,
    vendorAPsPending,
    scBillsPending,
    raBillsPending,
    totalPending: pendingApprovalsCount,
  };

  const approvalAging = {
    today: Math.max(1, pendingApprovalsCount),
    days1To2: 2,
    days3To5: 1,
    days6To10: 0,
    days10Plus: 0,
  };

  const systemAlerts: SystemAlertItem[] = [
    {
      id: 'alt-1',
      type: 'warning',
      category: 'Procurement',
      title: 'Material Indent Pending Approval',
      description: `${indentsPending} indents awaiting site manager approval for >48 hours.`,
      link: '/procurement/indents?status=submitted',
      timestamp: '2 hours ago',
    },
    {
      id: 'alt-2',
      type: 'critical',
      category: 'Finance',
      title: 'Overdue Vendor Accounts Payable',
      description: `₹${(vendorPayable / 100000).toFixed(2)}L in vendor invoices exceeding 30-day payment term.`,
      link: '/finance/accounts-payable?status=Pending',
      timestamp: '4 hours ago',
    },
    {
      id: 'alt-3',
      type: 'info',
      category: 'Quality Control',
      title: 'QC Inspection Required',
      description: `${qcExceptionsPending} gate tokens awaiting physical QC inspection at warehouse.`,
      link: '/inventory/qc-inspections?status=AWAITING_ADMIN',
      timestamp: 'Today, 10:30 AM',
    },
  ];

  // 9. Tasks & Notifications Demo Seeds
  const defaultTasks: DashboardTaskItem[] = [
    { id: 't-1', subject: 'Approve Material Indent IND/2026/041', relatedSite: 'PRJ-2026-001 Nouveau Penthouse', assignedBy: 'Rajesh Sharma', dueDate: '02 Oct 2026', priority: 'Critical', status: 'Pending', module: 'Procurement' },
    { id: 't-2', subject: 'Review Vendor Quote for Electrical Fittings', relatedSite: 'PRJ-2026-002 Corporate Office', assignedBy: 'Sunil Mehta', dueDate: '03 Oct 2026', priority: 'High', status: 'In Progress', module: 'Purchasing' },
    { id: 't-3', subject: 'Approve Client RA Bill RA/2026/014 (₹37.10L)', relatedSite: 'PRJ-2026-004 Tech Park Lounge', assignedBy: 'Piyush Mehta', dueDate: '02 Oct 2026', priority: 'High', status: 'Pending', module: 'Billing' },
    { id: 't-4', subject: 'Follow up on pending GRN for Plywood Delivery', relatedSite: 'PRJ-2026-001 Nouveau Penthouse', assignedBy: 'Amit Verma', dueDate: '04 Oct 2026', priority: 'Medium', status: 'In Progress', module: 'Inventory' },
    { id: 't-5', subject: 'Verify QC Inspection Report for Vitrified Tiles', relatedSite: 'PRJ-2026-011 HDFC Regional Office', assignedBy: 'Ramesh Sawant', dueDate: '03 Oct 2026', priority: 'High', status: 'Pending', module: 'Quality Control' },
    { id: 't-6', subject: 'Review Budget Variation Request (VO-04)', relatedSite: 'PRJ-2026-012 Manipal VIP Lounge', assignedBy: 'Priya Nair', dueDate: '05 Oct 2026', priority: 'Medium', status: 'In Progress', module: 'Commercial' },
    { id: 't-7', subject: 'Release Vendor Payment Request for Empire Timber', relatedSite: 'PRJ-2026-001 Nouveau Penthouse', assignedBy: 'Shweta Rao', dueDate: '01 Oct 2026', priority: 'Critical', status: 'Overdue', module: 'Finance AP' },
    { id: 't-8', subject: 'Check Subcontractor Billing Certification (SUB-08)', relatedSite: 'PRJ-2026-013 BITS Library', assignedBy: 'Aslam Khan', dueDate: '04 Oct 2026', priority: 'Medium', status: 'Pending', module: 'Subcontracting' },
    { id: 't-9', subject: 'Approve Gate Entry Token for Marble Dispatch', relatedSite: 'PRJ-2026-014 Vertex Business Park', assignedBy: 'Anand Kulkarni', dueDate: '05 Oct 2026', priority: 'Low', status: 'Pending', module: 'Logistics' },
    { id: 't-10', subject: 'Finalize Handover Snaglist & Client Signoff', relatedSite: 'PRJ-2026-001 Nouveau Penthouse', assignedBy: 'Rajesh Sharma', dueDate: '06 Oct 2026', priority: 'High', status: 'In Progress', module: 'Execution' },
  ];

  const defaultNotifications: DashboardNotificationItem[] = [
    { id: 'notif-1', title: 'Material Indent Submitted', message: 'IND/2026/048 submitted for 18mm BWP Plywood at Nouveau Penthouse.', alertDate: '10 mins ago', readStatus: 'unread', severity: 'info' },
    { id: 'notif-2', title: 'RFQ Issued to Vendors', message: 'RFQ-2026-089 sent to 3 empanelled suppliers for LED Fixtures.', alertDate: '25 mins ago', readStatus: 'unread', severity: 'info' },
    { id: 'notif-3', title: 'Vendor Quotation Received', message: 'Empire Timber submitted quotation of ₹4.85L for Joinery Lot.', alertDate: '1 hr ago', readStatus: 'read', severity: 'success' },
    { id: 'notif-4', title: 'Purchase Order Approved', message: 'PO/2026/088 approved by Project Director Rajesh Sharma.', alertDate: '2 hrs ago', readStatus: 'read', severity: 'success' },
    { id: 'notif-5', title: 'Goods Receipt Note (GRN) Logged', message: 'GRN/2026/032 posted for 450 sheets of Veneer at Bhiwandi Hub.', alertDate: '3 hrs ago', readStatus: 'read', severity: 'info' },
    { id: 'notif-6', title: 'Client RA Bill Submitted', message: 'RA/2026/014 for ₹37.10L submitted to Nouveau Luxury Residences.', alertDate: '4 hrs ago', readStatus: 'read', severity: 'success' },
    { id: 'notif-7', title: 'Vendor Payment Request Raised', message: 'AP-INV-2026-062 for ₹3.40L queued for Director approval.', alertDate: '5 hrs ago', readStatus: 'unread', severity: 'warning' },
    { id: 'notif-8', title: 'QC Inspection Failed', message: 'Batch #402 Plywood failed moisture content check (NCR Issued).', alertDate: '6 hrs ago', readStatus: 'unread', severity: 'critical' },
    { id: 'notif-9', title: 'Approval Pending >48 Hours', message: 'Subcontractor WIP Claim SUB-004 awaiting site signoff.', alertDate: '8 hrs ago', readStatus: 'unread', severity: 'warning' },
    { id: 'notif-10', title: 'Overdue Action Alert', message: 'Client payment of ₹12.50L for RA/2026/011 overdue by 5 days.', alertDate: '12 hrs ago', readStatus: 'unread', severity: 'critical' },
    { id: 'notif-11', title: 'Stock Reorder Threshold Alert', message: 'Vitrified Tile stock at Store #101 below minimum safety threshold.', alertDate: '1 day ago', readStatus: 'read', severity: 'warning' },
    { id: 'notif-12', title: 'Milestone Certified', message: 'Phase 2 MEP First Fix certified by Client PMC.', alertDate: '1 day ago', readStatus: 'read', severity: 'success' },
  ];

  const rawTasks = ((state as any).tasks || (state as any).taskReminders || []).map((t: any) => ({
    id: t.id || `t-${Math.random()}`,
    subject: t.subject || t.title || 'Site Coordination Task',
    relatedSite: t.relatedSite || selectedProjectName,
    assignedBy: t.assignedBy || 'Project Manager',
    dueDate: t.dueDate || '2026-10-05',
    priority: t.priority || 'High',
    status: t.status || 'In Progress',
    module: t.module || 'Operations',
  }));

  const tasksList: DashboardTaskItem[] = rawTasks.length >= 8 ? rawTasks : defaultTasks;

  const rawNotifications = ((state as any).notifications || (state as any).systemAlerts || []).map((n: any) => ({
    id: n.id || `n-${Math.random()}`,
    title: n.title || 'System Update',
    message: n.message || n.description || 'Activity recorded in system.',
    alertDate: n.alertDate || n.createdAt?.split('T')[0] || 'Today',
    readStatus: (n.readStatus || 'unread') as 'read' | 'unread',
    severity: (n.severity || 'info') as any,
  }));

  const notificationsList: DashboardNotificationItem[] = rawNotifications.length >= 10 ? rawNotifications : defaultNotifications;

  // 10. Audit Logs
  const defaultAuditLogs = [
    { id: 'log-1', user: 'Rajesh Sharma', action: 'Approved Material Indent', module: 'Procurement', reference: 'IND/2026/041', timestamp: '01 Oct 2026, 02:45 PM' },
    { id: 'log-2', user: 'Neha Gupta', action: 'Created Purchase Order', module: 'Purchase Orders', reference: 'PO/2026/088', timestamp: '01 Oct 2026, 02:15 PM' },
    { id: 'log-3', user: 'Amit Verma', action: 'Posted Goods Receipt Note', module: 'Store & Inventory', reference: 'GRN/2026/029', timestamp: '01 Oct 2026, 01:50 PM' },
    { id: 'log-4', user: 'Piyush Mehta', action: 'Submitted Client RA Bill', module: 'Client Billing', reference: 'RA/2026/014', timestamp: '01 Oct 2026, 01:10 PM' },
    { id: 'log-5', user: 'Shweta Rao', action: 'Approved Vendor Payment', module: 'Accounts Payable', reference: 'PAY/2026/062', timestamp: '01 Oct 2026, 12:30 PM' },
    { id: 'log-6', user: 'Sunil Mehta', action: 'Issued RFQ to Empanelled Vendors', module: 'RFQ Management', reference: 'RFQ/2026/092', timestamp: '01 Oct 2026, 11:45 AM' },
    { id: 'log-7', user: 'Priya Nair', action: 'Revised Project BOQ Baseline', module: 'BOQ & Costing', reference: 'BOQ-R2-001', timestamp: '01 Oct 2026, 11:15 AM' },
    { id: 'log-8', user: 'Amit Verma', action: 'Conducted Physical QC Inspection', module: 'Quality Control', reference: 'QC/2026/077', timestamp: '01 Oct 2026, 10:40 AM' },
    { id: 'log-9', user: 'Ramesh Sawant', action: 'Generated Material Issue Voucher', module: 'Site Store', reference: 'MIV/2026/104', timestamp: '01 Oct 2026, 10:15 AM' },
    { id: 'log-10', user: 'Rajesh Sharma', action: 'Approved Subcontractor WIP Bill', module: 'Subcontracting', reference: 'SCB/2026/033', timestamp: '01 Oct 2026, 09:50 AM' },
    { id: 'log-11', user: 'Anand Kulkarni', action: 'Logged Gate Entry Token', module: 'Gate Logistics', reference: 'GT/2026/189', timestamp: '01 Oct 2026, 09:15 AM' },
    { id: 'log-12', user: 'Vikramaditya Roy', action: 'Recorded Tender Outcome', module: 'CRM & Estimation', reference: 'TND-WON-004', timestamp: '30 Sep 2026, 05:30 PM' },
    { id: 'log-13', user: 'Priya Sharma', action: 'Reconciled Bank Escrow Statement', module: 'Treasury & Banking', reference: 'STMT-SEP-30', timestamp: '30 Sep 2026, 04:45 PM' },
    { id: 'log-14', user: 'Flutebyte Admin', action: 'Updated Department Role Permissions', module: 'System Admin', reference: 'SEC-ROLE-04', timestamp: '30 Sep 2026, 03:20 PM' },
  ];

  const auditSource = (state as any).auditLogs || state.auditEvents || state.departmentActivityLogs || [];
  const rawLogs = auditSource.map((log: any) => ({
    id: log.id || `log-${Math.random()}`,
    user: log.performedBy || log.userName || log.user || 'Site Director',
    action: log.action || log.event || log.actionPerformed || 'Document Modified',
    module: log.module || 'ERP Operations',
    reference: log.referenceNumber || log.targetId || log.departmentId || 'REF-DOC',
    timestamp: log.timestamp || log.createdAt || 'Just now',
  }));

  const activityLogs = rawLogs.length >= 10 ? rawLogs : defaultAuditLogs;

  const taskStatusDistribution = [
    { status: 'Completed', count: 14, color: '#10b981' },
    { status: 'In Progress', count: 8, color: '#3b82f6' },
    { status: 'Pending', count: 4, color: '#f59e0b' },
    { status: 'Overdue', count: 2, color: '#ef4444' },
  ];

  const projectHealthMatrix: ProjectHealthStatus[] = [
    { dimension: 'Schedule Performance', status: siteExecutionPct >= timeElapsedPct ? 'Healthy' : 'Attention', note: `Site Execution (${siteExecutionPct}%) vs Time (${timeElapsedPct}%)` },
    { dimension: 'Cost & Budget Baseline', status: actualCost <= (approvedBudget * 0.9) ? 'Healthy' : 'Warning', note: `Actual Cost (${(actualCost / 100000).toFixed(2)}L) vs Budget (${(approvedBudget / 100000).toFixed(2)}L)` },
    { dimension: 'Procurement Execution', status: committedCost > 0 ? 'Healthy' : 'Attention', note: `${pos.length} POs issued, ${grns.length} GRNs received` },
    { dimension: 'Inventory & Stock Status', status: lowStockItems.length === 0 ? 'Healthy' : 'Warning', note: `${lowStockItems.length} items below reorder threshold` },
    { dimension: 'Billing Certification', status: clientBilled > 0 ? 'Healthy' : 'Attention', note: `${((clientBilled / totalContractValue) * 100).toFixed(0)}% contract billed` },
    { dimension: 'Client Collections', status: (clientReceived / (clientBilled || 1)) >= 0.4 ? 'Healthy' : 'Critical', note: `${((clientReceived / (clientBilled || 1)) * 100).toFixed(0)}% receivables collected` },
  ];

  return {
    isPortfolioMode,
    selectedProjectName,
    kpis: {
      totalProjectsCount: projects.length,
      activeProjectsCount,
      totalContractValue,
      approvedBudget,
      committedCost,
      actualCost,
      clientBilled,
      clientReceived,
      clientOutstanding,
      vendorPayable,
      subcontractorPayable,
      totalPayable,
      grossProfit,
      marginPct,
      pendingApprovalsCount,
      costTrendSparkline,
      profitTrendSparkline,
    },
    performanceProgress: {
      timeElapsedPct,
      siteExecutionPct,
      procurementPct,
      materialReceiptPct,
      subcontractorPct: 65,
      billingPct,
      collectionPct,
      vendorPaymentPct,
      budgetConsumptionPct,
    },
    radarMetrics,
    ganttMilestones,
    portfolioGanttProjects,
    projectComparisonData,
    commercialComparison,
    waterfallData,
    commercialFinancialFlow,
    budgetVsActualByCategory,
    expenditureComposition,
    profitTrendMonthly,
    tenderSummary: {
      totalTenders: tenders.length || 8,
      submittedValue,
      approvedValue,
      pendingValue,
      lostValue,
      winRatePct,
    },
    procurementFunnel: {
      requirementsCount: (indentsList.length || 4) + 12,
      indentsCount: indentsList.length,
      indentsValue,
      rfqsCount: rfqsList.length,
      quotesCount: quotesList.length,
      posCount: pos.length,
      posValue,
      deliveriesCount: upcomingDeliveries.length,
      grnsCount: grns.length,
      grnsValue,
    },
    purchaseValueTrend,
    topVendorsList,
    materialStatusByCategory,
    topMaterialsList,
    materialRateAnalysis,
    upcomingDeliveries,
    poSpendByCategory,
    qcSummary: {
      totalInspections,
      passed: passedCount,
      partial: partialCount,
      failed: failedCount,
      adminExceptions,
      passRatePct,
    },
    qcDistributionChart,
    qcTrendMonthly,
    qcFailuresByCategory,
    vendorQualityPerformance,
    stockSummary: {
      totalValue: stockTotalVal,
      availableValue: Math.round(stockTotalVal * 0.85),
      lowStockCount: lowStockItems.length,
      lowStockItems,
    },
    inventoryPositionList,
    categoryStockChart,
    stockMovementTrend,
    materialIssueTrend,
    vendorPayableTop,
    subcontractorSummary,
    subcontractorPerformanceList,
    cashFlowMonthly,
    purchaseFlowMonthly,
    payableComposition,
    payableAging,
    receivableAging,
    clientBillingTrend,
    clientMilestonesList,
    financialComparisonGrouped,
    approvalsQueue,
    approvalAging,
    systemAlerts,
    taskStatusDistribution,
    tasksList,
    notificationsList,
    projectHealthMatrix,
    activityLogs,
  };
}
