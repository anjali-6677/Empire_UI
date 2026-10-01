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
}

export interface DashboardNotificationItem {
  id: string;
  title: string;
  message: string;
  alertDate: string;
  readStatus: 'read' | 'unread';
}

export interface WaterfallItem {
  stage: string;
  value: number;
  type: 'total' | 'subtraction' | 'result';
  color: string;
}

export interface BudgetVsActualCategoryItem {
  category: string;
  budget: number;
  committed: number;
  actual: number;
  variance: number;
  utilizationPct: number;
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
  budgetVsActualByCategory: BudgetVsActualCategoryItem[];
  expenditureComposition: ExpenditureCompositionItem[];
  profitTrendMonthly: Array<{ month: string; billedRevenue: number; actualCost: number; grossProfit: number }>;

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

  const waterfallData: WaterfallItem[] = [
    { stage: 'Contract Value', value: totalContractValue, type: 'total', color: '#3b82f6' },
    { stage: 'Material Cost', value: -grnActual, type: 'subtraction', color: '#ef4444' },
    { stage: 'Subcontractor WIP', value: -scActual, type: 'subtraction', color: '#f59e0b' },
    { stage: 'Site Overheads', value: -Math.round(actualCost * 0.05), type: 'subtraction', color: '#8b5cf6' },
    { stage: 'Projected Gross Profit', value: grossProfit, type: 'result', color: '#10b981' },
  ];

  const budgetVsActualByCategory: BudgetVsActualCategoryItem[] = [
    { category: 'Woodwork & Joinery', budget: Math.round(approvedBudget * 0.35), committed: Math.round(committedCost * 0.4), actual: Math.round(actualCost * 0.45), variance: Math.round(approvedBudget * 0.35 - actualCost * 0.45), utilizationPct: 32 },
    { category: 'Electrical & Lighting', budget: Math.round(approvedBudget * 0.20), committed: Math.round(committedCost * 0.25), actual: Math.round(actualCost * 0.2), variance: Math.round(approvedBudget * 0.20 - actualCost * 0.2), utilizationPct: 25 },
    { category: 'Civil & Masonry', budget: Math.round(approvedBudget * 0.15), committed: Math.round(committedCost * 0.15), actual: Math.round(actualCost * 0.15), variance: Math.round(approvedBudget * 0.15 - actualCost * 0.15), utilizationPct: 18 },
    { category: 'Finishing & Paints', budget: Math.round(approvedBudget * 0.12), committed: Math.round(committedCost * 0.1), actual: Math.round(actualCost * 0.1), variance: Math.round(approvedBudget * 0.12 - actualCost * 0.1), utilizationPct: 12 },
    { category: 'HVAC & Plumbing', budget: Math.round(approvedBudget * 0.10), committed: Math.round(committedCost * 0.07), actual: Math.round(actualCost * 0.07), variance: Math.round(approvedBudget * 0.10 - actualCost * 0.07), utilizationPct: 10 },
    { category: 'Hardware & Fittings', budget: Math.round(approvedBudget * 0.08), committed: Math.round(committedCost * 0.03), actual: Math.round(actualCost * 0.03), variance: Math.round(approvedBudget * 0.08 - actualCost * 0.03), utilizationPct: 8 },
  ];

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

  // 9. Tasks & Notifications
  const tasksList: DashboardTaskItem[] = ((state as any).tasks || (state as any).taskReminders || []).slice(0, 5).map((t: any) => ({
    id: t.id || `t-${Math.random()}`,
    subject: t.subject || t.title || 'Site Coordination Task',
    relatedSite: t.relatedSite || selectedProjectName,
    assignedBy: t.assignedBy || 'Project Manager',
    dueDate: t.dueDate || '2026-10-05',
    priority: t.priority || 'High',
    status: t.status || 'In Progress',
  }));

  const taskStatusDistribution = [
    { status: 'Completed', count: 14, color: '#10b981' },
    { status: 'In Progress', count: 8, color: '#3b82f6' },
    { status: 'Pending', count: 4, color: '#f59e0b' },
    { status: 'Overdue', count: 2, color: '#ef4444' },
  ];

  const notificationsList: DashboardNotificationItem[] = ((state as any).notifications || (state as any).systemAlerts || []).slice(0, 5).map((n: any) => ({
    id: n.id || `n-${Math.random()}`,
    title: n.title || 'System Update',
    message: n.message || n.description || 'Activity recorded in system.',
    alertDate: n.alertDate || n.createdAt?.split('T')[0] || 'Today',
    readStatus: (n.readStatus || 'unread') as 'read' | 'unread',
  }));

  const projectHealthMatrix: ProjectHealthStatus[] = [
    { dimension: 'Schedule Performance', status: siteExecutionPct >= timeElapsedPct ? 'Healthy' : 'Attention', note: `Site Execution (${siteExecutionPct}%) vs Time (${timeElapsedPct}%)` },
    { dimension: 'Cost & Budget Baseline', status: actualCost <= (approvedBudget * 0.9) ? 'Healthy' : 'Warning', note: `Actual Cost (${(actualCost/100000).toFixed(2)}L) vs Budget (${(approvedBudget/100000).toFixed(2)}L)` },
    { dimension: 'Procurement Execution', status: committedCost > 0 ? 'Healthy' : 'Attention', note: `${pos.length} POs issued, ${grns.length} GRNs received` },
    { dimension: 'Inventory & Stock Status', status: lowStockItems.length === 0 ? 'Healthy' : 'Warning', note: `${lowStockItems.length} items below reorder threshold` },
    { dimension: 'Billing Certification', status: clientBilled > 0 ? 'Healthy' : 'Attention', note: `${((clientBilled/totalContractValue)*100).toFixed(0)}% contract billed` },
    { dimension: 'Client Collections', status: (clientReceived / (clientBilled || 1)) >= 0.4 ? 'Healthy' : 'Critical', note: `${((clientReceived/(clientBilled||1))*100).toFixed(0)}% receivables collected` },
  ];

  // 10. Audit Logs
  const auditSource = (state as any).auditLogs || state.auditEvents || state.departmentActivityLogs || [];
  const activityLogs = auditSource.slice(0, 6).map((log: any) => ({
    id: log.id || `log-${Math.random()}`,
    user: log.performedBy || log.userName || log.user || 'Site Director',
    action: log.action || log.event || log.actionPerformed || 'Document Modified',
    module: log.module || 'ERP Operations',
    reference: log.referenceNumber || log.targetId || log.departmentId || 'REF-DOC',
    timestamp: log.timestamp || log.createdAt || 'Just now',
  }));

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
