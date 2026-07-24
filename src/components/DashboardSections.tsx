import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  LabelList,
  ReferenceLine
} from 'recharts';
import { 
  ChevronDown,
  ChevronUp,
  Bell,
  Check,
  Truck,
  ShieldAlert,
  CheckSquare,
  Layers,
  X
} from 'lucide-react';
import { safeFormatCurrency } from '../utils/formatStatus';
import { SiteSchema } from '../types';
import { useWorkflow } from '../context/WorkflowContext';
import {
  PORTFOLIO_FINANCIAL_COMPARISON,
  getSelectedSitePerformanceMatrix,
  SiteMatrixMetric,
  getSelectedSiteMonthlyBilling,
  VENDOR_LIABILITY_DATA,
  APPROVAL_PIPELINE_DATA,
  TOTAL_APPROVAL_COUNT,
  PROCUREMENT_PIPELINE_STAGES,
  MONTHLY_OPERATIONAL_FLOW_DATA,
  PAYMENT_MODE_DISTRIBUTION,
  UPCOMING_RISK_TIMELINE_DATA,
  formatIndianCurrencyAbbrev
} from '../data/dashboardAnalyticsData';

interface SectionWrapperProps {
  id: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  description,
  defaultOpen = true,
  children
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <section 
      id={id} 
      className="bg-white border border-gray-150 rounded-lg shadow-sm font-sans scroll-mt-20 overflow-hidden"
    >
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-150 bg-gray-50/50 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h2 className="text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            {title}
          </h2>
          {description && <p className="text-[10.5px] text-gray-400 font-medium leading-tight mt-0.5">{description}</p>}
        </div>
        <button
          type="button"
          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
          aria-expanded={isOpen}
          aria-label={`Toggle section ${title}`}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && <div className="p-4 sm:p-5 space-y-4">{children}</div>}
    </section>
  );
};

// ==========================================
// Section 1: Portfolio Overview
// ==========================================
export const PortfolioOverviewSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="space-y-4 font-sans">
      {children}
      {/* Chart 1: Portfolio Financial Comparison */}
      <div className="p-4 border border-gray-150 rounded-lg bg-gray-50/40 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Portfolio Financial Comparison (Top 8 Active Sites)
            </h4>
            <p className="text-[10px] text-gray-400 font-medium leading-tight">
              Compare project scale, approved budgets, actual outlay, and client billing across the portfolio.
            </p>
          </div>
          <span className="text-[9.5px] font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
            Global Portfolio View
          </span>
        </div>
        <div className="h-[270px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout={window.innerWidth < 640 ? "vertical" : "horizontal"} 
              data={PORTFOLIO_FINANCIAL_COMPARISON} 
              margin={{ top: 10, right: 15, left: window.innerWidth < 640 ? 10 : 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={window.innerWidth < 640} horizontal={window.innerWidth >= 640} stroke="#e5e7eb" />
              {window.innerWidth < 640 ? (
                <>
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(val) => formatIndianCurrencyAbbrev(val)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#374151', fontWeight: 600 }} width={75} />
                </>
              ) : (
                <>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} 
                    interval={0} 
                    angle={-15} 
                    textAnchor="end" 
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fill: '#6b7280' }} 
                    tickFormatter={(val) => formatIndianCurrencyAbbrev(val)} 
                  />
                </>
              )}
              <Tooltip 
                formatter={(val: number) => [safeFormatCurrency(val), '']} 
                labelFormatter={(label, items) => {
                  const item = items && items[0] ? items[0].payload : null;
                  return item ? `${item.fullName} (${item.siteCode})` : label;
                }}
                contentStyle={{ fontSize: '11px', borderRadius: '6px', backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
              <Bar dataKey="approvedBudget" name="Approved Budget" fill="#ab9570" radius={window.innerWidth < 640 ? [0, 3, 3, 0] : [3, 3, 0, 0]} />
              <Bar dataKey="actualOutlay" name="Actual Outlay" fill="#3b82f6" radius={window.innerWidth < 640 ? [0, 3, 3, 0] : [3, 3, 0, 0]} />
              <Bar dataKey="clientBilling" name="Client Billing" fill="#10b981" radius={window.innerWidth < 640 ? [0, 3, 3, 0] : [3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Section 2: Selected Site Snapshot
// ==========================================
export const SiteSnapshotSection: React.FC<{ site: SiteSchema }> = ({ site }) => {
  const approvedClientBill = Math.round(site.budget * 0.42);
  const projectPurchase = Math.round(site.budget * 0.35);
  const profitMargin = Math.round(site.budget * 0.22);
  const profitMarginPct = 22.0;
  const totalApprovedTender = Math.round(site.budget * 0.95);
  const clientBillApproved = Math.round(site.budget * 0.38);
  const clientPaymentReceived = Math.round(site.budget * 0.32);
  const approvedBudgetVal = site.approvedValue || site.budget;
  const vendorPaidTotal = Math.round(site.budget * 0.28);

  return (
    <div className="space-y-4 font-sans">
      {/* Site Metadata Header Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-1 rounded">
            {site.code}
          </span>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 leading-tight">{site.name}</h3>
            <span className="text-[10px] text-gray-400 font-semibold">{site.category} • Client: {site.client} • {site.city}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div>
            <span className="text-gray-400 block text-[9px] uppercase font-bold">Project Manager</span>
            <span className="font-bold text-gray-800">{site.manager}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[9px] uppercase font-bold">Workflow Status</span>
            <span className="font-bold uppercase text-[10px] text-brand-700">{site.workflowStatus.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Primary Financial Snapshot Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 border border-gray-150 rounded bg-white">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Approved Client Bill</span>
          <span className="font-extrabold text-sm text-gray-900 block mt-0.5">{safeFormatCurrency(approvedClientBill)}</span>
        </div>
        <div className="p-3 border border-gray-150 rounded bg-white">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Project Purchase</span>
          <span className="font-extrabold text-sm text-gray-900 block mt-0.5">{safeFormatCurrency(projectPurchase)}</span>
        </div>
        <div className="p-3 border border-gray-150 rounded bg-white">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Profit Margin</span>
          <span className="font-extrabold text-sm text-emerald-700 block mt-0.5">{safeFormatCurrency(profitMargin)}</span>
        </div>
        <div className="p-3 border border-gray-150 rounded bg-white">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Margin Percentage</span>
          <span className="font-extrabold text-sm text-emerald-700 block mt-0.5">{profitMarginPct}%</span>
        </div>
        <div className="p-3 border border-gray-150 rounded bg-white">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Approved Tender Val</span>
          <span className="font-extrabold text-sm text-gray-900 block mt-0.5">{safeFormatCurrency(totalApprovedTender)}</span>
        </div>
        <div className="p-3 border border-gray-150 rounded bg-white">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Client Payments Recd</span>
          <span className="font-extrabold text-sm text-emerald-800 block mt-0.5">{safeFormatCurrency(clientPaymentReceived)}</span>
        </div>
      </div>

      {/* Secondary Financial & Dates Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Financial Breakdown */}
        <div className="p-3.5 border border-gray-150 rounded bg-gray-50/40 space-y-2 text-xs">
          <h4 className="font-bold text-gray-700 uppercase text-[9.5px] tracking-wider border-b pb-1.5 border-gray-200">
            Financial Ledger Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Client Bill Approved:</span>
              <span className="font-bold text-gray-800">{safeFormatCurrency(clientBillApproved)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Approved Budget:</span>
              <span className="font-bold text-gray-800">{safeFormatCurrency(approvedBudgetVal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Paid to Vendors:</span>
              <span className="font-bold text-gray-800">{safeFormatCurrency(vendorPaidTotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Total Site Budget:</span>
              <span className="font-extrabold text-brand-700">{safeFormatCurrency(site.budget)}</span>
            </div>
          </div>
        </div>

        {/* Start & Due Date Summary */}
        <div className="p-3.5 border border-gray-150 rounded bg-gray-50/40 space-y-2 text-xs">
          <h4 className="font-bold text-gray-700 uppercase text-[9.5px] tracking-wider border-b pb-1.5 border-gray-200">
            Timeline & Schedule Summary
          </h4>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-2 bg-white rounded border border-gray-200">
              <span className="text-[9px] uppercase font-bold text-gray-400 block">Start Date Summary</span>
              <div className="font-mono font-bold text-gray-800 mt-0.5">{site.startDate}</div>
              <span className="text-[9.5px] text-gray-500 block mt-1">Completed Days: <strong className="text-gray-800">142 Days</strong></span>
            </div>
            <div className="p-2 bg-white rounded border border-gray-200">
              <span className="text-[9px] uppercase font-bold text-gray-400 block">Due Date Summary</span>
              <div className="font-mono font-bold text-gray-800 mt-0.5">{site.targetCompletion}</div>
              <span className="text-[9.5px] text-gray-500 block mt-1">Total: <strong className="text-gray-800">270 Days</strong> | Remaining: <strong className="text-amber-700">128 Days</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2: Selected Site Performance Matrix */}
      <div className="p-4 border border-gray-150 rounded-lg bg-white space-y-3 font-sans">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Selected Site Performance Matrix ({site.code} - {site.name})
            </h4>
            <p className="text-[10px] text-gray-400 font-medium leading-tight">
              Operational benchmark metrics scaled from 0% to 100%. Highlighted warnings indicate schedule/cost deviations.
            </p>
          </div>
          <span className="text-[9.5px] font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
            Selected-Site Dynamic
          </span>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={getSelectedSitePerformanceMatrix(site)} margin={{ top: 5, right: 45, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 9, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="metric" tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} width={115} />
              <Tooltip 
                formatter={(val: number, _n: string, props: any) => [
                  `${val}% ${props.payload.warningReason ? `⚠️ ${props.payload.warningReason}` : ''}`,
                  props.payload.metric
                ]} 
                contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
              />
              <Bar dataKey="value" name="Metric Achievement" radius={[0, 3, 3, 0]}>
                {getSelectedSitePerformanceMatrix(site).map((entry: SiteMatrixMetric, index: number) => (
                  <Cell key={`matrix-cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="value" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#374151' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Section 3: Site Progress Matrix
// ==========================================
export const SiteProgressMatrixSection: React.FC<{ site: SiteSchema }> = ({ site }) => {
  const indicators = [
    { label: 'Time Progress', pct: Math.round((142 / 270) * 100), color: 'bg-blue-500' },
    { label: 'Site Execution Progress', pct: site.progress || 45, color: 'bg-brand-500' },
    { label: 'Bill Progress', pct: 42, color: 'bg-amber-500' },
    { label: 'Client Payment Progress', pct: 32, color: 'bg-emerald-500' },
    { label: 'Vendor Bill Progress', pct: 38, color: 'bg-indigo-500' },
    { label: 'Vendor Payment Progress', pct: 28, color: 'bg-purple-500' },
    { label: 'Budget Consumption', pct: 44, color: 'bg-rose-500' },
    { label: 'Gross Profit', pct: 22, color: 'bg-teal-500' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {indicators.map((ind, idx) => (
        <div key={idx} className="p-3.5 border border-gray-150 rounded bg-white space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 text-[11px]">{ind.label}</span>
            <span className="font-extrabold text-gray-900 text-xs">{ind.pct}%</span>
          </div>
          <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
            <div className={`h-full ${ind.color} rounded-full transition-all duration-300`} style={{ width: `${ind.pct}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// Section 4: Client Tender and Billing Snapshot
// ==========================================
export const ClientTenderBillingSection: React.FC<{ site: SiteSchema }> = ({ site }) => {
  const tenderVal = Math.round(site.budget * 0.95);
  const tenderApprovedVal = Math.round(site.budget * 0.90);
  const extraTenderVal = Math.round(site.budget * 0.12);
  const extraApprovedVal = Math.round(site.budget * 0.10);

  const billSubmitted = Math.round(site.budget * 0.45);
  const billApproved = Math.round(site.budget * 0.40);
  const billHeld = Math.round(site.budget * 0.03);
  const billUnsubmitted = Math.round(site.budget * 0.52);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
      {/* Table grid */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Tender & Extra Item Summary</h4>
        <table className="w-full text-left text-xs border border-gray-150 rounded divide-y divide-gray-100">
          <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
            <tr>
              <th className="p-2.5">Category</th>
              <th className="p-2.5 text-right">Submitted</th>
              <th className="p-2.5 text-right">Approved</th>
              <th className="p-2.5 text-right">Approval %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            <tr>
              <td className="p-2.5 font-bold text-gray-800">Main Tender</td>
              <td className="p-2.5 text-right font-mono">{safeFormatCurrency(tenderVal)}</td>
              <td className="p-2.5 text-right font-mono">{safeFormatCurrency(tenderApprovedVal)}</td>
              <td className="p-2.5 text-right font-bold text-emerald-700">94.7%</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold text-gray-800">Extra Item Tender</td>
              <td className="p-2.5 text-right font-mono">{safeFormatCurrency(extraTenderVal)}</td>
              <td className="p-2.5 text-right font-mono">{safeFormatCurrency(extraApprovedVal)}</td>
              <td className="p-2.5 text-right font-bold text-emerald-700">83.3%</td>
            </tr>
          </tbody>
        </table>

        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider pt-2">Client Bill Status Breakdown</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-gray-50 border rounded">
            <span className="text-[9px] uppercase font-bold text-gray-400 block">Submitted Bill</span>
            <span className="font-bold text-gray-800 font-mono text-xs mt-0.5 block">{safeFormatCurrency(billSubmitted)}</span>
          </div>
          <div className="p-2 bg-emerald-50/50 border border-emerald-150 rounded">
            <span className="text-[9px] uppercase font-bold text-emerald-700 block">Approved Bill</span>
            <span className="font-bold text-emerald-900 font-mono text-xs mt-0.5 block">{safeFormatCurrency(billApproved)}</span>
          </div>
          <div className="p-2 bg-amber-50/50 border border-amber-150 rounded">
            <span className="text-[9px] uppercase font-bold text-amber-700 block">Held Bill Amount</span>
            <span className="font-bold text-amber-900 font-mono text-xs mt-0.5 block">{safeFormatCurrency(billHeld)}</span>
          </div>
          <div className="p-2 bg-gray-50 border rounded">
            <span className="text-[9px] uppercase font-bold text-gray-400 block">Unsubmitted Bill</span>
            <span className="font-bold text-gray-800 font-mono text-xs mt-0.5 block">{safeFormatCurrency(billUnsubmitted)}</span>
          </div>
        </div>
      </div>

      {/* Chart 3: Client Billing and Collections Composed Chart */}
      <div className="p-3.5 border border-gray-150 rounded bg-white flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between border-b pb-1.5">
          <div>
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Client Billing & Collections ({site.code})</h4>
            <p className="text-[10px] text-gray-400 font-medium">Monthly billing activity vs client receipts for 2026.</p>
          </div>
          <span className="text-[9.5px] font-bold text-brand-700 bg-brand-50 border border-brand-150 px-1.5 py-0.5 rounded">
            Selected-Site Series
          </span>
        </div>
        <div className="h-[220px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={getSelectedSiteMonthlyBilling(site)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#374151' }} />
              <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(val) => formatIndianCurrencyAbbrev(val)} />
              <Tooltip formatter={(val: number) => [safeFormatCurrency(val), '']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="submittedBills" name="Submitted Bills" fill="#94a3b8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="approvedBills" name="Approved Bills" fill="#ab9570" radius={[2, 2, 0, 0]} />
              <Line type="monotone" dataKey="clientReceipts" name="Client Receipts" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Section 5: Vendor Bill Snapshot
// ==========================================
export const VendorBillSnapshotSection: React.FC<{ site: SiteSchema }> = ({ site }) => {
  const data = [
    { cat: 'Material', bill: Math.round(site.budget * 0.22), paid: Math.round(site.budget * 0.16), pending: Math.round(site.budget * 0.06), paidPct: '72.7%' },
    { cat: 'Labour', bill: Math.round(site.budget * 0.12), paid: Math.round(site.budget * 0.09), pending: Math.round(site.budget * 0.03), paidPct: '75.0%' },
    { cat: 'Utility & Salary', bill: Math.round(site.budget * 0.04), paid: Math.round(site.budget * 0.035), pending: Math.round(site.budget * 0.005), paidPct: '87.5%' }
  ];

  const totalBill = data.reduce((s, d) => s + d.bill, 0);
  const totalPaid = data.reduce((s, d) => s + d.paid, 0);
  const totalPending = data.reduce((s, d) => s + d.pending, 0);
  const totalPaidPct = totalBill ? `${((totalPaid / totalBill) * 100).toFixed(1)}%` : '0%';

  return (
    <div className="space-y-4 font-sans">
      <div className="overflow-x-auto border border-gray-150 rounded">
        <table className="w-full text-left text-xs divide-y divide-gray-150 min-w-[550px]">
          <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
            <tr>
              <th className="p-3">Vendor Category</th>
              <th className="p-3 text-right">Bill Amount</th>
              <th className="p-3 text-right">Paid Amount</th>
              <th className="p-3 text-right">Pending Amount</th>
              <th className="p-3 text-right">Paid %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="p-3 font-bold text-gray-800">{row.cat}</td>
                <td className="p-3 text-right font-mono">{safeFormatCurrency(row.bill)}</td>
                <td className="p-3 text-right font-mono text-emerald-700">{safeFormatCurrency(row.paid)}</td>
                <td className="p-3 text-right font-mono text-rose-700">{safeFormatCurrency(row.pending)}</td>
                <td className="p-3 text-right font-bold text-gray-900">{row.paidPct}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-bold border-t border-gray-200 text-gray-900">
            <tr>
              <td className="p-3 uppercase text-[10px]">Total Vendor Exposure</td>
              <td className="p-3 text-right font-mono">{safeFormatCurrency(totalBill)}</td>
              <td className="p-3 text-right font-mono text-emerald-800">{safeFormatCurrency(totalPaid)}</td>
              <td className="p-3 text-right font-mono text-rose-800">{safeFormatCurrency(totalPending)}</td>
              <td className="p-3 text-right text-brand-700">{totalPaidPct}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Chart 4: Vendor Liability Stacked Bar Chart */}
      <div className="p-4 border border-gray-150 rounded-lg bg-white space-y-2">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Vendor Liability & Outstanding Exposure (Top Vendors)
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">
              Stacked breakdown of Paid Amount, Outstanding Liability, and Retention Amount for key suppliers.
            </p>
          </div>
          <span className="text-[9.5px] font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
            Portfolio Liability
          </span>
        </div>
        <div className="h-[240px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={VENDOR_LIABILITY_DATA} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={(v) => formatIndianCurrencyAbbrev(v)} tick={{ fontSize: 9, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="vendor" tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} width={125} />
              <Tooltip formatter={(v: number) => [safeFormatCurrency(v), '']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="paidAmount" name="Paid Amount" stackId="a" fill="#10b981" />
              <Bar dataKey="outstandingAmount" name="Outstanding Liability" stackId="a" fill="#ef4444" />
              <Bar dataKey="retentionAmount" name="Retention Withheld" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Section 6: Approval Pending Counts
// ==========================================
export const ApprovalPendingSection: React.FC = () => {
  const navigate = useNavigate();
  const items = [
    { label: 'Indent Approval', count: 4, route: '/settings?mod=indents' },
    { label: 'Rate Finalization', count: 2, route: '/settings?mod=rate-inquiry' },
    { label: 'Payment Approval', count: 5, route: '/settings?mod=payments' },
    { label: 'Budget Approval', count: 1, route: '/sites' },
    { label: 'Site Approval', count: 3, route: '/sites' },
    { label: 'Task Approval', count: 6, route: '/settings?mod=tasks' }
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Chart 5: Approval Pipeline Donut Chart */}
      <div className="p-4 border border-gray-150 rounded-lg bg-white space-y-2">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Approval Pipeline Breakdown ({TOTAL_APPROVAL_COUNT} Total Pending)
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">
              Distribution of pending operational approvals across modules.
            </p>
          </div>
          <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded">
            {TOTAL_APPROVAL_COUNT} Action Items
          </span>
        </div>
        <div className="h-[220px] w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={APPROVAL_PIPELINE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="count"
              >
                {APPROVAL_PIPELINE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val: number, name: string) => [
                  `${val} Pending (${((val / TOTAL_APPROVAL_COUNT) * 100).toFixed(1)}%)`,
                  name
                ]} 
                contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Approval Nav Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(item.route)}
            className="p-3.5 border border-gray-150 rounded bg-white hover:border-brand-300 hover:shadow-sm transition-all text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-[9.5px] uppercase font-bold text-gray-400 group-hover:text-brand-600 transition-colors block">
              {item.label}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-extrabold text-lg text-gray-900">{item.count}</span>
              <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-150 px-1.5 py-0.25 rounded">
                Pending
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// Section 7: Notifications, Tasks and Activity
// ==========================================
export const NotificationsTasksActivitySection: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, tasks, calendarEvents } = useWorkflow();
  const [unreadTab, setUnreadTab] = React.useState<'all' | 'unread'>('all');
  const [taskTab, setTaskTab] = React.useState<'overdue' | 'upcoming'>('overdue');

  const filteredNotifications = (alerts || []).filter((n: any) => unreadTab === 'all' || n.readStatus === 'unread');
  const filteredTasks = (tasks || []).filter((t: any) => {
    const today = new Date().toISOString().split('T')[0];
    if (taskTab === 'overdue') return t.dueDate < today && t.status !== 'completed';
    return t.dueDate >= today && t.status !== 'completed';
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-sans">
      {/* 1. Notifications Card */}
      <div className="border border-gray-150 rounded bg-white p-3.5 space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-brand-600" /> System Notifications
            </h4>
            <div className="flex items-center gap-1 text-[9.5px]">
              <button
                onClick={() => setUnreadTab('all')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${unreadTab === 'all' ? 'bg-brand-50 text-brand-700' : 'text-gray-400'}`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setUnreadTab('unread')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${unreadTab === 'unread' ? 'bg-brand-50 text-brand-700' : 'text-gray-400'}`}
              >
                Unread ({alerts.filter((n: any) => n.readStatus === 'unread').length})
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <button onClick={() => navigate('/overview/notifications')} className="text-brand-650 hover:underline font-bold cursor-pointer">
              View All Notifications &rarr;
            </button>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {filteredNotifications.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 italic">No notifications found</p>
            ) : (
              filteredNotifications.slice(0, 4).map((n: any) => (
                <div 
                  key={n.id} 
                  onClick={() => navigate('/overview/notifications')}
                  className={`p-2 rounded border text-xs flex items-start justify-between gap-2 cursor-pointer transition-colors hover:bg-gray-50 ${n.readStatus === 'unread' ? 'bg-brand-50/30 border-brand-100 font-semibold' : 'bg-gray-50/50 border-gray-100'}`}
                >
                  <span className="truncate">{n.title}</span>
                  <span className="text-[9px] text-gray-400 whitespace-nowrap shrink-0">{n.alertDate}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. My Tasks & Action Items */}
      <div className="border border-gray-150 rounded bg-white p-3.5 space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-blue-600" /> My Tasks & Action Items
            </h4>
            <div className="flex items-center gap-1 text-[9.5px]">
              <button
                onClick={() => setTaskTab('overdue')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${taskTab === 'overdue' ? 'bg-rose-50 text-rose-700' : 'text-gray-400'}`}
              >
                Overdue
              </button>
              <button
                onClick={() => setTaskTab('upcoming')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${taskTab === 'upcoming' ? 'bg-blue-50 text-blue-700' : 'text-gray-400'}`}
              >
                Upcoming
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <button onClick={() => navigate('/overview/my-tasks')} className="text-brand-650 hover:underline font-bold cursor-pointer">
              Manage All Tasks ({tasks.length}) &rarr;
            </button>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 italic">No tasks found</p>
            ) : (
              filteredTasks.slice(0, 3).map((task: any) => (
                <div 
                  key={task.id} 
                  onClick={() => navigate('/overview/my-tasks')}
                  className="p-2.5 border border-gray-150 rounded bg-gray-50/40 text-xs space-y-1 cursor-pointer hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center justify-between font-bold text-gray-800">
                    <span className="truncate">{task.subject}</span>
                    <span className={`text-[9px] px-1.5 py-0.25 rounded font-mono ${taskTab === 'overdue' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
                      {task.dueDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Site: {task.relatedSite}</span>
                    <span>From: {task.assignedBy}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Operational Calendar & Messages Direct Quicklinks */}
      <div className="border border-gray-150 rounded bg-white p-3.5 space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-emerald-600" /> Operational Feed & Messages
          </h4>
          <div className="space-y-2 text-xs">
            <button
              onClick={() => navigate('/overview/calendar')}
              className="w-full p-2.5 border border-gray-200 rounded bg-gray-50/50 text-left hover:bg-brand-50/30 hover:border-brand-200 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 group-hover:text-brand-700">Project & Delivery Calendar</span>
                <span className="text-[9.5px] font-extrabold text-brand-650 bg-white px-2 py-0.5 rounded border">{calendarEvents.length} Events</span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5">Track GRN arrivals, payment due dates & tender milestones</span>
            </button>

            <button
              onClick={() => navigate('/overview/messages')}
              className="w-full p-2.5 border border-gray-200 rounded bg-gray-50/50 text-left hover:bg-brand-50/30 hover:border-brand-200 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 group-hover:text-brand-700">Internal Team Messages</span>
                <span className="text-[9.5px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded border">Live Chat</span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5">Direct chat with Project Managers & Procurement team</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Section 8: Procurement & Vendor Intelligence
// ==========================================
export const ProcurementIntelligenceSection: React.FC = () => {
  return (
    <div className="space-y-4 font-sans">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 border rounded bg-gray-50/50">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Mapped Records</span>
          <span className="font-extrabold text-base text-gray-900 block mt-0.5">142 Items</span>
        </div>
        <div className="p-3 border rounded bg-gray-50/50">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Open Items</span>
          <span className="font-extrabold text-base text-amber-700 block mt-0.5">18 Items</span>
        </div>
        <div className="p-3 border rounded bg-gray-50/50">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Document Drafts</span>
          <span className="font-extrabold text-base text-gray-900 block mt-0.5">8 Drafts</span>
        </div>
        <div className="p-3 border rounded bg-gray-50/50">
          <span className="text-[9px] uppercase font-bold text-gray-400 block">Rate Defined</span>
          <span className="font-extrabold text-base text-emerald-700 block mt-0.5">118 Defined</span>
        </div>
      </div>

      {/* Chart 6: Procurement Pipeline Conversion Funnel Chart */}
      <div className="p-4 border border-gray-150 rounded-lg bg-white space-y-2">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Procurement Document Conversion Funnel
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">
              Stage-by-stage progression from Material Indents down to Verified Vendor Invoices.
            </p>
          </div>
          <span className="text-[9.5px] font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
            Procurement Flow
          </span>
        </div>
        <div className="h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={PROCUREMENT_PIPELINE_STAGES} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 9, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} width={135} />
              <Tooltip 
                formatter={(val: number, _name: string, props: any) => [
                  `${val} Records (${safeFormatCurrency(props.payload.value)}) • Step Conv: ${props.payload.conversionRate}`,
                  'Volume'
                ]} 
                contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
              />
              <Bar dataKey="count" name="Record Volume" fill="#ab9570" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highest Ordered by Qty */}
        <div className="border rounded p-3 space-y-2">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Highest Ordered Material (By Qty)</h4>
          <table className="w-full text-left text-xs divide-y divide-gray-100">
            <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase">
              <tr><th className="p-2">Material</th><th className="p-2 text-right">Quantity</th><th className="p-2 text-right">Unit</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              <tr><td className="p-2 font-semibold">Gypsum Board 12mm</td><td className="p-2 text-right font-mono">4,500</td><td className="p-2 text-right">Sq Ft</td></tr>
              <tr><td className="p-2 font-semibold">Teak Wood Veneer 4mm</td><td className="p-2 text-right font-mono">2,800</td><td className="p-2 text-right">Sheets</td></tr>
              <tr><td className="p-2 font-semibold">LED Recessed Spotlights</td><td className="p-2 text-right font-mono">1,200</td><td className="p-2 text-right">Pcs</td></tr>
            </tbody>
          </table>
        </div>

        {/* Highest Ordered by Value */}
        <div className="border rounded p-3 space-y-2">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Highest Ordered Material (By Value)</h4>
          <table className="w-full text-left text-xs divide-y divide-gray-100">
            <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase">
              <tr><th className="p-2">Material</th><th className="p-2 text-right">Total Invoice Value</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              <tr><td className="p-2 font-semibold">Italian Marble Flooring</td><td className="p-2 text-right font-mono font-bold text-gray-900">{safeFormatCurrency(4800000)}</td></tr>
              <tr><td className="p-2 font-semibold">VRV Air Conditioning Units</td><td className="p-2 text-right font-mono font-bold text-gray-900">{safeFormatCurrency(3600000)}</td></tr>
              <tr><td className="p-2 font-semibold">Acoustic Fabric Wall Panels</td><td className="p-2 text-right font-mono font-bold text-gray-900">{safeFormatCurrency(1800000)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Section 9: Period Statistics
// ==========================================
export const PeriodStatisticsSection: React.FC = () => {
  const rows = [
    { name: 'Indent', d1: '2', d7: '14', m1: '45', q1: '120', y1: '480' },
    { name: 'Rate Inquiry', d1: '1', d7: '8', m1: '28', q1: '85', y1: '310' },
    { name: 'Rate Finalization', d1: '0', d7: '5', m1: '18', q1: '62', y1: '240' },
    { name: 'Purchase Order', d1: '3', d7: '16', m1: '52', q1: '150', y1: '580' },
    { name: 'Invoice', d1: '4', d7: '22', m1: '68', q1: '190', y1: '720' },
    { name: 'Payment', d1: '₹4.5 L', d7: '₹28.0 L', m1: '₹1.1 Cr', q1: '₹3.4 Cr', y1: '₹14.2 Cr' }
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Chart 7: Monthly Operational Financial Flow Area Chart */}
      <div className="p-4 border border-gray-150 rounded-lg bg-white space-y-2">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Monthly Operational Financial Flow (Purchase vs Invoice vs Payment)
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">
              12-month operational trend showing Purchase Order commitments, Invoiced liabilities, and Cash disbursements.
            </p>
          </div>
          <span className="text-[9.5px] font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
            Operational Time-Series
          </span>
        </div>
        <div className="h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_OPERATIONAL_FLOW_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(v) => formatIndianCurrencyAbbrev(v)} />
              <Tooltip formatter={(val: number) => [safeFormatCurrency(val), '']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Area type="monotone" dataKey="purchaseValue" name="Purchase Commitments" stroke="#ab9570" fill="#ab9570" fillOpacity={0.2} />
              <Area type="monotone" dataKey="invoiceValue" name="Invoiced Liabilities" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              <Area type="monotone" dataKey="paymentValue" name="Cash Payments" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-150 rounded">
        <table className="w-full text-left text-xs divide-y divide-gray-150 min-w-[600px]">
          <thead className="bg-gray-50 text-[9.5px] uppercase font-bold text-gray-500">
            <tr>
              <th className="p-3">Operational Record</th>
              <th className="p-3 text-right">Today</th>
              <th className="p-3 text-right">Last 7 Days</th>
              <th className="p-3 text-right">Last Month</th>
              <th className="p-3 text-right">Last Quarter</th>
              <th className="p-3 text-right">Last Year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="p-3 font-bold text-gray-800">{r.name}</td>
                <td className="p-3 text-right font-mono">{r.d1}</td>
                <td className="p-3 text-right font-mono">{r.d7}</td>
                <td className="p-3 text-right font-mono">{r.m1}</td>
                <td className="p-3 text-right font-mono">{r.q1}</td>
                <td className="p-3 text-right font-mono font-bold text-gray-900">{r.y1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// Section 10: Upcoming & Exception Tables (With Receive Delivery Modal)
// ==========================================
export const UpcomingExceptionsSection: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [rcvdQty, setRcvdQty] = React.useState<string>('');
  const [rcvdDate, setRcvdDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = React.useState<string | null>(null);

  const deliveries = [
    { po: 'PO-2026-089', item: 'Plywood 18mm Commercial Grade', ordered: 500, due: '2026-07-26', vendor: 'Century Ply Ltd' },
    { po: 'PO-2026-092', item: 'Acoustic Insulation Foam Panels', ordered: 200, due: '2026-07-28', vendor: 'Supreme Industries' }
  ];

  const handleRecordReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setToast(`Recorded receipt of ${rcvdQty} units for ${selectedOrder.po}`);
    setSelectedOrder(null);
    setRcvdQty('');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-4 font-sans">
      {toast && (
        <div className="fixed top-4 right-4 z-[1100] bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded shadow font-bold text-xs flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          {toast}
        </div>
      )}

      {/* Chart 9: Upcoming Risk Timeline Diverging Bar Chart */}
      <div className="p-4 border border-gray-150 rounded-lg bg-white space-y-2 font-sans">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Upcoming Risk & Deadline Timeline
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">
              Diverging timeline relative to zero reference line (Today). Overdue items extend left, upcoming extend right.
            </p>
          </div>
          <span className="text-[9.5px] font-bold text-rose-700 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded">
            Risk & Deadline Monitor
          </span>
        </div>

        {UPCOMING_RISK_TIMELINE_DATA.length === 0 ? (
          <div className="h-[180px] w-full flex items-center justify-center text-xs text-gray-400 font-medium bg-gray-50 border border-dashed rounded">
            No active risk or deadline items found.
          </div>
        ) : (
          <div className="h-[250px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={UPCOMING_RISK_TIMELINE_DATA.slice().sort((a, b) => a.daysRemaining - b.daysRemaining)} 
                margin={{ top: 15, right: 65, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  domain={[-6, 20]} 
                  tick={{ fontSize: 9, fill: '#6b7280' }} 
                  tickFormatter={(v) => (v === 0 ? 'Today' : v < 0 ? `${v}d` : `+${v}d`)}
                />
                <YAxis type="category" dataKey="refNo" tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} width={85} />
                <ReferenceLine x={0} stroke="#374151" strokeWidth={2} label={{ value: 'Today', position: 'top', fill: '#374151', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const days = data.daysRemaining;
                      const statusText = days < 0 ? `${Math.abs(days)} Days Overdue ⚠️` : days === 0 ? 'Due Today 🔔' : `${days} Days Remaining`;
                      return (
                        <div className="bg-white border border-gray-200 p-2.5 rounded shadow-md text-xs space-y-1 z-50">
                          <div className="font-bold text-gray-900 border-b pb-1">{data.refNo} — {data.title}</div>
                          <div><span className="text-gray-400">Category:</span> <strong className="text-gray-700">{data.category}</strong></div>
                          <div><span className="text-gray-400">Due Date:</span> <strong className="text-gray-700">{data.dueDate}</strong></div>
                          <div><span className="text-gray-400">Status:</span> <strong className={days < 0 ? 'text-red-600' : days <= 5 ? 'text-amber-600' : 'text-emerald-600'}>{statusText}</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="daysRemaining" name="Days Overdue / Remaining" radius={[3, 3, 3, 3]}>
                  {UPCOMING_RISK_TIMELINE_DATA.slice().sort((a, b) => a.daysRemaining - b.daysRemaining).map((entry, index) => (
                    <Cell 
                      key={`risk-cell-${index}`} 
                      fill={entry.daysRemaining < 0 ? '#ef4444' : entry.daysRemaining === 0 ? '#f59e0b' : entry.daysRemaining <= 7 ? '#eab308' : '#10b981'} 
                    />
                  ))}
                  <LabelList 
                    dataKey="daysRemaining" 
                    position="right" 
                    formatter={(v: number) => (v < 0 ? `${Math.abs(v)}d overdue` : v === 0 ? 'Due today' : `${v}d remaining`)} 
                    style={{ fontSize: '9.5px', fontWeight: 'bold', fill: '#374151' }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Table 1: Expected Order Deliveries with Receive Delivery button */}
        <div className="border rounded p-3 space-y-2">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center justify-between">
            <span>Expected Order Deliveries</span>
            <Truck className="h-4 w-4 text-gray-400" />
          </h4>
          <table className="w-full text-left text-xs divide-y divide-gray-100">
            <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase">
              <tr>
                <th className="p-2">PO & Item</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {deliveries.map((d, idx) => (
                <tr key={idx}>
                  <td className="p-2">
                    <span className="font-bold text-gray-900 block">{d.po}</span>
                    <span className="text-[10px] text-gray-500 block">{d.item}</span>
                  </td>
                  <td className="p-2 text-right font-mono font-bold">{d.ordered} Pcs</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(d);
                        setRcvdQty(d.ordered.toString());
                      }}
                      className="px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Receive Delivery
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table 2: GRN Pending / Exception items */}
        <div className="border rounded p-3 space-y-2">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center justify-between">
            <span>GRN Pending & Exceptions</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-amber-50/50 border border-amber-150 rounded flex justify-between items-center">
              <div>
                <span className="font-bold text-amber-900 block">GRN Pending for PO-2026-074</span>
                <span className="text-[10px] text-amber-700 block">Received 3 days ago • Material: Hardware Fittings</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[9.5px]">Pending GRN</span>
            </div>
            <div className="p-2 bg-rose-50/50 border border-rose-150 rounded flex justify-between items-center">
              <div>
                <span className="font-bold text-rose-900 block">Payments Done Without Approval</span>
                <span className="text-[10px] text-rose-700 block">₹45,000 Petty Cash Site Emergency</span>
              </div>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[9.5px]">Unapproved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Receive Delivery Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-lg border max-w-sm w-full p-5 shadow-xl font-sans text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-gray-900">Receive Delivery</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordReceipt} className="space-y-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 block">Order Number:</span>
                <span className="font-mono font-bold text-gray-900 text-xs">{selectedOrder.po} ({selectedOrder.vendor})</span>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 block">Item Description:</span>
                <span className="font-bold text-gray-800 text-xs">{selectedOrder.item}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Ordered Quantity:</label>
                  <input type="text" value={selectedOrder.ordered} readOnly className="w-full border rounded p-1.5 bg-gray-50 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Received Quantity:</label>
                  <input 
                    type="number" 
                    value={rcvdQty} 
                    onChange={(e) => setRcvdQty(e.target.value)} 
                    className="w-full border rounded p-1.5 bg-white font-mono font-bold focus:outline-none focus:border-brand-500" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Received Date:</label>
                <input 
                  type="date" 
                  value={rcvdDate} 
                  onChange={(e) => setRcvdDate(e.target.value)} 
                  className="w-full border rounded p-1.5 bg-white text-xs focus:outline-none focus:border-brand-500" 
                  required 
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setSelectedOrder(null)} className="px-3 py-1.5 border rounded font-bold hover:bg-gray-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 font-bold text-white rounded shadow-sm cursor-pointer">
                  Record Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Section 11: Vendor Exposure
// ==========================================
export const VendorExposureSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
      <div className="border rounded p-3 space-y-2">
        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Vendors With Highest Amount Due</h4>
        <table className="w-full text-left text-xs divide-y divide-gray-100">
          <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase">
            <tr><th className="p-2">Vendor Name</th><th className="p-2 text-right">Amount Pending</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            <tr><td className="p-2 font-semibold">Asian Paints Ltd</td><td className="p-2 text-right font-mono font-bold text-rose-700">{safeFormatCurrency(1850000)}</td></tr>
            <tr><td className="p-2 font-semibold">Century Plyboards India</td><td className="p-2 text-right font-mono font-bold text-rose-700">{safeFormatCurrency(1420000)}</td></tr>
            <tr><td className="p-2 font-semibold">Schneider Electric Ltd</td><td className="p-2 text-right font-mono font-bold text-rose-700">{safeFormatCurrency(980000)}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="border rounded p-3 space-y-2">
        <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Vendors With Highest Amount Paid</h4>
        <table className="w-full text-left text-xs divide-y divide-gray-100">
          <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase">
            <tr><th className="p-2">Vendor Name</th><th className="p-2 text-right">Amount Paid</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            <tr><td className="p-2 font-semibold">Greenlam Industries</td><td className="p-2 text-right font-mono font-bold text-emerald-700">{safeFormatCurrency(4200000)}</td></tr>
            <tr><td className="p-2 font-semibold">Saint-Gobain India</td><td className="p-2 text-right font-mono font-bold text-emerald-700">{safeFormatCurrency(3800000)}</td></tr>
            <tr><td className="p-2 font-semibold">Havells India Ltd</td><td className="p-2 text-right font-mono font-bold text-emerald-700">{safeFormatCurrency(2900000)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// Section 12: Flow Reports
// ==========================================
export const FlowReportsSection: React.FC = () => {
  const flowData = [
    { month: 'Apr', Inflow: 4200000, Outflow: 3100000 },
    { month: 'May', Inflow: 5800000, Outflow: 4500000 },
    { month: 'Jun', Inflow: 6500000, Outflow: 5200000 },
    { month: 'Jul', Inflow: 8200000, Outflow: 6800000 }
  ];

  return (
    <div className="p-3.5 border rounded bg-white space-y-2 font-sans">
      <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Monthly Cash Inflow vs Outflow</h4>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={flowData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `₹${Number(v / 100000 || 0).toFixed(0)}L`} />
            <Tooltip formatter={(val: number) => [safeFormatCurrency(val), 'Amount']} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Area type="monotone" dataKey="Inflow" stroke="#10b981" fill="#d1fae5" />
            <Area type="monotone" dataKey="Outflow" stroke="#ef4444" fill="#fee2e2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ==========================================
// Section 13: Detailed Site Progress
// ==========================================
export const DetailedSiteProgressSection: React.FC<{ site: SiteSchema }> = ({ site }) => {
  const details = [
    { label: 'Tender Approval Progress', pct: 95 },
    { label: 'Extra Item Tender Progress', pct: 83 },
    { label: 'Total Tender Progress', pct: 92 },
    { label: 'Site Execution Progress', pct: site.progress || 45 },
    { label: 'Client Bill Progress', pct: 42 },
    { label: 'Client Payment Progress', pct: 32 },
    { label: 'Purchase Completion', pct: 38 },
    { label: 'Total Vendor Payment Progress', pct: 28 },
    { label: 'Material Payment Progress', pct: 72 },
    { label: 'Labour Payment Progress', pct: 75 },
    { label: 'Approved Budget Utilization', pct: 44 },
    { label: 'Budget Consumption', pct: 44 }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-sans">
      {details.map((d, idx) => (
        <div key={idx} className="p-3 border rounded bg-white space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span className="text-[10.5px] truncate">{d.label}</span>
            <span>{d.pct}%</span>
          </div>
          <div className="w-full bg-gray-150 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${d.pct}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// Section 14: Payment Modes
// ==========================================
export const PaymentModesSection: React.FC = () => {
  const vendorModes = [
    { name: 'Bank Transfer / RTGS', value: 65 },
    { name: 'Cheque', value: 20 },
    { name: 'Corporate Card', value: 15 }
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Chart 8: Ranked Horizontal Payment Mode Bar Chart */}
      <div className="p-4 border border-gray-150 rounded-lg bg-white space-y-3 font-sans">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Payment Mode Distribution
            </h4>
            <p className="text-[10px] text-gray-400 font-medium leading-tight">
              Ranked horizontal financial volume by payment method across all operational disbursements.
            </p>
          </div>
          <span className="text-[9.5px] font-bold text-brand-700 bg-brand-50 border border-brand-150 px-2 py-0.5 rounded">
            Payment Methods
          </span>
        </div>

        {/* Compact Summary Header Block */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded border border-gray-150 text-center">
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-400 block">Total Disbursements</span>
            <span className="text-xs font-extrabold text-gray-900">{formatIndianCurrencyAbbrev(PAYMENT_MODE_DISTRIBUTION.reduce((s, i) => s + i.amount, 0))}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-400 block">Most Used Method</span>
            <span className="text-xs font-extrabold text-brand-700 truncate block">{PAYMENT_MODE_DISTRIBUTION[0]?.name} ({PAYMENT_MODE_DISTRIBUTION[0]?.value}%)</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-400 block">Total Transactions</span>
            <span className="text-xs font-extrabold text-gray-900">{PAYMENT_MODE_DISTRIBUTION.reduce((s, i) => s + i.txCount, 0)} Payments</span>
          </div>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={PAYMENT_MODE_DISTRIBUTION} 
              margin={{ top: 5, right: 45, left: 25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 9, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} width={140} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 p-2.5 rounded shadow-md text-xs space-y-1 z-50">
                        <div className="font-bold text-gray-900 border-b pb-1">{d.name}</div>
                        <div><span className="text-gray-400">Total Volume:</span> <strong className="text-gray-800">{safeFormatCurrency(d.amount)}</strong></div>
                        <div><span className="text-gray-400">Share of Payments:</span> <strong className="text-brand-700">{d.value}%</strong></div>
                        <div><span className="text-gray-400">Transaction Count:</span> <strong className="text-gray-800">{d.txCount} Payments</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" name="Volume Share" radius={[0, 3, 3, 0]}>
                {PAYMENT_MODE_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`pay-mode-cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="value" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#374151' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 border rounded bg-white space-y-3">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Payment Mode to Vendors</h4>
          <div className="space-y-2 text-xs">
            {vendorModes.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-gray-50 border">
                <span className="font-bold text-gray-700">{m.name}</span>
                <span className="font-mono font-bold text-gray-900">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border rounded bg-white space-y-3">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Payment Mode Received From Client</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-gray-50 border">
              <span className="font-bold text-gray-700">Direct Wire / NEFT</span>
              <span className="font-mono font-bold text-gray-900">85%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-gray-50 border">
              <span className="font-bold text-gray-700">Letter of Credit (LC)</span>
              <span className="font-mono font-bold text-gray-900">15%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
