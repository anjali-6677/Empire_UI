import { SiteSchema } from '../types';
import { safeFormatCurrency } from '../utils/formatStatus';

// ============================================================================
// Safe Numeric & Formatting Utilities
// ============================================================================

export function safeNumber(val: any, defaultVal = 0): number {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return defaultVal;
  }
  return Number(val);
}

export function formatIndianCurrencyAbbrev(val: number): string {
  const num = safeNumber(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(0)}k`;
  }
  return safeFormatCurrency(num);
}

export function formatPercentSafe(val: number): string {
  const num = safeNumber(val);
  return `${num.toFixed(1)}%`;
}

// ============================================================================
// 1. Chart 1: Portfolio Financial Comparison Data (Global Portfolio)
// ============================================================================
export interface PortfolioComparisonItem {
  siteCode: string;
  name: string;
  fullName: string;
  approvedBudget: number;
  actualOutlay: number;
  clientBilling: number;
}

export const PORTFOLIO_FINANCIAL_COMPARISON: PortfolioComparisonItem[] = [
  {
    siteCode: 'SITE-001',
    name: 'Nexus Tech',
    fullName: 'Nexus Tech Park Lobby Renovations',
    approvedBudget: 45000000,
    actualOutlay: 19800000,
    clientBilling: 18900000
  },
  {
    siteCode: 'SITE-002',
    name: 'Grand Hyatt',
    fullName: 'Grand Hyatt Executive Lounge Café',
    approvedBudget: 38000000,
    actualOutlay: 14440000,
    clientBilling: 15960000
  },
  {
    siteCode: 'SITE-003',
    name: 'Imperial Penth',
    fullName: 'Imperial Heights Penthouse Fit-Out',
    approvedBudget: 28000000,
    actualOutlay: 11200000,
    clientBilling: 12600000
  },
  {
    siteCode: 'SITE-004',
    name: 'Synergy CoWork',
    fullName: 'Synergy Co-Working Space Phase II',
    approvedBudget: 22000000,
    actualOutlay: 8800000,
    clientBilling: 9900000
  },
  {
    siteCode: 'SITE-005',
    name: 'Oasis Villa',
    fullName: 'Oasis Luxury Villa Construction',
    approvedBudget: 18500000,
    actualOutlay: 6475000,
    clientBilling: 7400000
  },
  {
    siteCode: 'SITE-006',
    name: 'HDFC Reg Office',
    fullName: 'HDFC Regional Office Expansion',
    approvedBudget: 16000000,
    actualOutlay: 5120000,
    clientBilling: 6080000
  },
  {
    siteCode: 'SITE-007',
    name: 'Jio World Retail',
    fullName: 'Jio World Centre Retail Outlet',
    approvedBudget: 14200000,
    actualOutlay: 4260000,
    clientBilling: 4970000
  },
  {
    siteCode: 'SITE-008',
    name: 'DLF CyberCity',
    fullName: 'DLF CyberCity HQ Interior',
    approvedBudget: 12500000,
    actualOutlay: 3500000,
    clientBilling: 4125000
  }
].sort((a, b) => b.approvedBudget - a.approvedBudget);

// ============================================================================
// 2. Chart 2: Selected-Site Performance Radar Function
export interface SiteMatrixMetric {
  metric: string;
  value: number;
  isWarning: boolean;
  warningReason?: string;
  color: string;
}

export function getSelectedSitePerformanceMatrix(site: SiteSchema): SiteMatrixMetric[] {
  const progress = safeNumber(site.progress, 45);
  const budgetRatio = safeNumber(site.budget, 45000000) / 45000000;

  // Operational metrics scale dynamically based on selected site
  const execution = Math.min(100, Math.max(0, Math.round(progress)));
  const timeProgress = Math.min(100, Math.round(52.6 * (1 + (site.code === 'SITE-002' ? 0.05 : 0))));
  const billing = Math.min(100, Math.round(42.0 * budgetRatio));
  const clientPayments = Math.min(100, Math.round(32.0 * budgetRatio));
  const purchases = Math.min(100, Math.round(38.0 * budgetRatio));
  const vendorPayments = Math.min(100, Math.round(28.0 * budgetRatio));
  const budgetUsed = Math.min(100, Math.round(44.0 * (1 + (site.code === 'SITE-002' ? 0.12 : 0))));

  // Warnings:
  // 1. Time progress materially ahead of execution
  const timeWarning = timeProgress > (execution + 5);
  // 2. Budget used materially ahead of execution
  const budgetWarning = budgetUsed > (execution + 5);
  // 3. Vendor payments materially behind vendor billing/purchases
  const vendorWarning = vendorPayments < (purchases - 8);

  return [
    {
      metric: 'Time Progress',
      value: timeProgress,
      isWarning: timeWarning,
      warningReason: timeWarning ? 'Schedule slippage (Time ahead of Execution)' : undefined,
      color: timeWarning ? '#ef4444' : '#3b82f6'
    },
    {
      metric: 'Execution',
      value: execution,
      isWarning: false,
      color: '#10b981'
    },
    {
      metric: 'Billing',
      value: billing,
      isWarning: false,
      color: '#ab9570'
    },
    {
      metric: 'Client Payments',
      value: clientPayments,
      isWarning: false,
      color: '#06b6d4'
    },
    {
      metric: 'Purchases',
      value: purchases,
      isWarning: false,
      color: '#8b5cf6'
    },
    {
      metric: 'Vendor Payments',
      value: vendorPayments,
      isWarning: vendorWarning,
      warningReason: vendorWarning ? 'Payment lag behind purchases' : undefined,
      color: vendorWarning ? '#f59e0b' : '#6366f1'
    },
    {
      metric: 'Budget Used',
      value: budgetUsed,
      isWarning: budgetWarning,
      warningReason: budgetWarning ? 'Cost overrun (Budget ahead of Execution)' : undefined,
      color: budgetWarning ? '#ef4444' : '#ec4899'
    }
  ];
}

export function getSelectedSiteRadarMetrics(site: SiteSchema): SiteMatrixMetric[] {
  return getSelectedSitePerformanceMatrix(site);
}

// ============================================================================
// 3. Chart 3: Client Billing and Collections (Selected Site Time-Series)
// ============================================================================
export interface MonthlyBillingItem {
  month: string;
  approvedBills: number;
  submittedBills: number;
  clientReceipts: number;
}

export function getSelectedSiteMonthlyBilling(site: SiteSchema): MonthlyBillingItem[] {
  const scale = safeNumber(site.budget, 45000000) / 45000000;
  const baseMonthly = [
    { month: 'Jan', approved: 1200000, submitted: 1400000, receipts: 1000000 },
    { month: 'Feb', approved: 1800000, submitted: 2100000, receipts: 1500000 },
    { month: 'Mar', approved: 2400000, submitted: 2800000, receipts: 2100000 },
    { month: 'Apr', approved: 3100000, submitted: 3500000, receipts: 2800000 },
    { month: 'May', approved: 3800000, submitted: 4200000, receipts: 3300000 },
    { month: 'Jun', approved: 4500000, submitted: 5000000, receipts: 4000000 },
    { month: 'Jul', approved: 5200000, submitted: 5800000, receipts: 4700000 },
    { month: 'Aug', approved: 6000000, submitted: 6500000, receipts: 5400000 },
    { month: 'Sep', approved: 6800000, submitted: 7400000, receipts: 6100000 },
    { month: 'Oct', approved: 7500000, submitted: 8200000, receipts: 6900000 },
    { month: 'Nov', approved: 8200000, submitted: 9000000, receipts: 7600000 },
    { month: 'Dec', approved: 9000000, submitted: 9800000, receipts: 8400000 }
  ];

  return baseMonthly.map(item => ({
    month: item.month,
    approvedBills: Math.round(item.approved * scale),
    submittedBills: Math.round(item.submitted * scale),
    clientReceipts: Math.round(item.receipts * scale)
  }));
}

// ============================================================================
// 4. Chart 4: Vendor Liability Horizontal Stacked Bar Data
// ============================================================================
export interface VendorLiabilityItem {
  vendor: string;
  paidAmount: number;
  outstandingAmount: number;
  retentionAmount: number;
  totalCertified: number;
}

export const VENDOR_LIABILITY_DATA: VendorLiabilityItem[] = [
  {
    vendor: 'Asian Paints Ltd',
    paidAmount: 2400000,
    outstandingAmount: 1850000,
    retentionAmount: 250000,
    totalCertified: 4500000
  },
  {
    vendor: 'Century Plyboards',
    paidAmount: 2800000,
    outstandingAmount: 1420000,
    retentionAmount: 180000,
    totalCertified: 4400000
  },
  {
    vendor: 'Schneider Electric',
    paidAmount: 1800000,
    outstandingAmount: 980000,
    retentionAmount: 120000,
    totalCertified: 2900000
  },
  {
    vendor: 'Greenlam Industries',
    paidAmount: 4200000,
    outstandingAmount: 750000,
    retentionAmount: 150000,
    totalCertified: 5100000
  },
  {
    vendor: 'Saint-Gobain India',
    paidAmount: 3800000,
    outstandingAmount: 620000,
    retentionAmount: 140000,
    totalCertified: 4560000
  },
  {
    vendor: 'Havells India Ltd',
    paidAmount: 2900000,
    outstandingAmount: 510000,
    retentionAmount: 90000,
    totalCertified: 3500000
  }
].sort((a, b) => b.outstandingAmount - a.outstandingAmount);

// ============================================================================
// 5. Chart 5: Approval Pipeline Donut Data
// ============================================================================
export interface ApprovalSegmentItem {
  name: string;
  count: number;
  color: string;
  route: string;
}

export const APPROVAL_PIPELINE_DATA: ApprovalSegmentItem[] = [
  { name: 'PO Approvals', count: 5, color: '#ab9570', route: '/procurement/po' },
  { name: 'Indent Approvals', count: 4, color: '#3b82f6', route: '/procurement/indents' },
  { name: 'Invoice Approvals', count: 4, color: '#8b5cf6', route: '/finance/invoices' },
  { name: 'Site Approvals', count: 3, color: '#10b981', route: '/sites' },
  { name: 'Payment Approvals', count: 5, color: '#ec4899', route: '/finance/payments' },
  { name: 'Rate Finalisations', count: 2, color: '#f59e0b', route: '/procurement/rfq' },
  { name: 'Budget Approvals', count: 1, color: '#06b6d4', route: '/reports/budget' }
];

export const TOTAL_APPROVAL_COUNT = APPROVAL_PIPELINE_DATA.reduce((s, item) => s + item.count, 0);

// ============================================================================
// 6. Chart 6: Procurement Pipeline Conversion Funnel Data
// ============================================================================
export interface ProcurementStageItem {
  stage: string;
  count: number;
  value: number;
  conversionRate: string;
}

export const PROCUREMENT_PIPELINE_STAGES: ProcurementStageItem[] = [
  { stage: '1. Material Indents', count: 180, value: 85000000, conversionRate: '100%' },
  { stage: '2. RFQs Published', count: 142, value: 72000000, conversionRate: '78.9%' },
  { stage: '3. Rates Finalised', count: 118, value: 61000000, conversionRate: '83.1%' },
  { stage: '4. POs Approved', count: 95, value: 52000000, conversionRate: '80.5%' },
  { stage: '5. Orders Placed', count: 82, value: 46000000, conversionRate: '86.3%' },
  { stage: '6. GRNs Received', count: 68, value: 38000000, conversionRate: '82.9%' },
  { stage: '7. Invoices Verified', count: 54, value: 31000000, conversionRate: '79.4%' }
];

// ============================================================================
// 7. Chart 7: Monthly Operational Flow Area Data
// ============================================================================
export interface MonthlyFlowItem {
  month: string;
  purchaseValue: number;
  invoiceValue: number;
  paymentValue: number;
}

export const MONTHLY_OPERATIONAL_FLOW_DATA: MonthlyFlowItem[] = [
  { month: 'Jan', purchaseValue: 4200000, invoiceValue: 3500000, paymentValue: 2800000 },
  { month: 'Feb', purchaseValue: 5100000, invoiceValue: 4200000, paymentValue: 3600000 },
  { month: 'Mar', purchaseValue: 6500000, invoiceValue: 5800000, paymentValue: 4900000 },
  { month: 'Apr', purchaseValue: 7200000, invoiceValue: 6400000, paymentValue: 5500000 },
  { month: 'May', purchaseValue: 8800000, invoiceValue: 7900000, paymentValue: 6800000 },
  { month: 'Jun', purchaseValue: 9500000, invoiceValue: 8600000, paymentValue: 7400000 },
  { month: 'Jul', purchaseValue: 11200000, invoiceValue: 10100000, paymentValue: 8900000 },
  { month: 'Aug', purchaseValue: 10800000, invoiceValue: 9800000, paymentValue: 8600000 },
  { month: 'Sep', purchaseValue: 12400000, invoiceValue: 11200000, paymentValue: 9800000 },
  { month: 'Oct', purchaseValue: 13100000, invoiceValue: 12000000, paymentValue: 10600000 },
  { month: 'Nov', purchaseValue: 14500000, invoiceValue: 13200000, paymentValue: 11800000 },
  { month: 'Dec', purchaseValue: 16000000, invoiceValue: 14800000, paymentValue: 13200000 }
];

// ============================================================================
// 8. Chart 8: Payment Mode Distribution Donut Data
// ============================================================================
export interface PaymentModeItem {
  name: string;
  value: number;
  amount: number;
  txCount: number;
  color: string;
}

export const PAYMENT_MODE_DISTRIBUTION: PaymentModeItem[] = [
  { name: 'Bank Transfer / RTGS', value: 58, amount: 24360000, txCount: 82, color: '#ab9570' },
  { name: 'Cheque', value: 22, amount: 9240000, txCount: 31, color: '#3b82f6' },
  { name: 'On Account Transfer', value: 10, amount: 4200000, txCount: 14, color: '#10b981' },
  { name: 'Corporate Card', value: 6, amount: 2520000, txCount: 9, color: '#8b5cf6' },
  { name: 'Petty Cash', value: 4, amount: 1680000, txCount: 6, color: '#f59e0b' }
].sort((a, b) => b.amount - a.amount);

// ============================================================================
// 9. Chart 9: Upcoming Risk Timeline Data
// ============================================================================
export interface UpcomingRiskItem {
  id: string;
  title: string;
  refNo: string;
  category: string;
  dueDate: string;
  daysRemaining: number;
  severity: 'high' | 'medium' | 'low';
}

export const UPCOMING_RISK_TIMELINE_DATA: UpcomingRiskItem[] = [
  {
    id: 'risk-1',
    title: 'Hardware Fittings Delivery Overdue',
    refNo: 'PO-2026-074',
    category: 'Material Delivery',
    dueDate: '2026-07-22',
    daysRemaining: -3,
    severity: 'high'
  },
  {
    id: 'risk-2',
    title: 'Century Ply PO Delivery Due',
    refNo: 'PO-2026-089',
    category: 'Material Delivery',
    dueDate: '2026-07-26',
    daysRemaining: 1,
    severity: 'medium'
  },
  {
    id: 'risk-3',
    title: 'Asian Paints Bill Payment Due',
    refNo: 'INV-2026-112',
    category: 'Vendor Payment',
    dueDate: '2026-07-28',
    daysRemaining: 3,
    severity: 'high'
  },
  {
    id: 'risk-4',
    title: 'Supreme Foam Insulation Delivery',
    refNo: 'PO-2026-092',
    category: 'Material Delivery',
    dueDate: '2026-07-30',
    daysRemaining: 5,
    severity: 'low'
  },
  {
    id: 'risk-5',
    title: 'Schneider Rate Validity Expiry',
    refNo: 'RFQ-2026-041',
    category: 'Rate Expiry',
    dueDate: '2026-08-04',
    daysRemaining: 10,
    severity: 'medium'
  },
  {
    id: 'risk-6',
    title: 'Tender Milestone Submission',
    refNo: 'TND-2026-018',
    category: 'Tender Milestone',
    dueDate: '2026-08-10',
    daysRemaining: 16,
    severity: 'medium'
  }
];
