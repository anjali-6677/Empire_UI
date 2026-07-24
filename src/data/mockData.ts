import { 
  MetricCard, 
  ProjectHealthSchema, 
  PendingApprovalSchema, 
  ActivityFeedSchema, 
  UpcomingDeadlineSchema, 
  ChartRecord,
  SiteSchema
} from '../types';

// ==========================================
// 1. KPI Metric Cards (Raw numeric counts and INR values)
// ==========================================
export const mockKPIs: MetricCard[] = [
  {
    id: 'kpi-1',
    label: 'Total Project Value',
    value: 248000000, // ₹24.8 Cr
    change: 12.5,
    changeType: 'positive',
    icon: 'DollarSign'
  },
  {
    id: 'kpi-2',
    label: 'Active Projects',
    value: 18,
    change: 2,
    changeType: 'positive',
    icon: 'FolderKanban'
  },
  {
    id: 'kpi-3',
    label: 'Pending Approvals',
    value: 14,
    change: 4, // high priority in description logic
    changeType: 'negative',
    icon: 'Clock'
  },
  {
    id: 'kpi-4',
    label: 'Outstanding Payments',
    value: 16500000, // ₹1.65 Cr
    change: -5.2,
    changeType: 'positive', // positive interpretation (decrease in outstandings)
    icon: 'FileText'
  },
  {
    id: 'kpi-5',
    label: 'Budget Utilized',
    value: 67.8, // Percentage
    change: 0.4, // within forecast
    changeType: 'neutral',
    icon: 'TrendingUp'
  },
  {
    id: 'kpi-6',
    label: 'Open Purchase Orders',
    value: 32, // count
    change: 4200000, // ₹42 L (Value metric stored as change metadata)
    changeType: 'neutral',
    icon: 'ShoppingCart'
  }
];

// ==========================================
// 2. Active Projects Health Tracker List
// ==========================================
export const mockProjects: ProjectHealthSchema[] = [
  {
    id: 'proj-1',
    name: 'Nexus Tech Park Lobby Renovations',
    client: 'Nexus Realty Group',
    location: 'Bengaluru',
    completion: 45,
    budgetSpent: 22000000, // ₹2.2 Cr
    budgetTotal: 50000000, // ₹5.0 Cr
    manager: 'Rajesh Kumar',
    status: 'progress'
  },
  {
    id: 'proj-2',
    name: 'Grand Hyatt Executive Lounge Café',
    client: 'Hyatt Hospitality India',
    location: 'Goa',
    completion: 92,
    budgetSpent: 12500000, // ₹1.25 Cr
    budgetTotal: 12000000, // ₹1.2 Cr (over budget spent)
    manager: 'Anita Rao',
    status: 'critical'
  },
  {
    id: 'proj-3',
    name: 'Imperial Heights Penthouse Fit-Out',
    client: 'Imperial Realty Holdings',
    location: 'Mumbai',
    completion: 72,
    budgetSpent: 48000000, // ₹4.8 Cr
    budgetTotal: 65000000, // ₹6.5 Cr
    manager: 'Sanjay Mehta',
    status: 'progress'
  },
  {
    id: 'proj-4',
    name: 'Synergy Co-Working Workspace',
    client: 'Synergy Infra Developers',
    location: 'Hyderabad',
    completion: 15,
    budgetSpent: 8000000, // ₹80 L
    budgetTotal: 45000000, // ₹4.5 Cr
    manager: 'Vikram Reddy',
    status: 'progress'
  },
  {
    id: 'proj-5',
    name: 'Oasis Luxury Villa Construction',
    client: 'Oasis Estates Ltd',
    location: 'Pune',
    completion: 100,
    budgetSpent: 15000000, // ₹1.5 Cr
    budgetTotal: 15000000, // ₹1.5 Cr
    manager: 'Rohan Deshmukh',
    status: 'completed'
  }
];

// ==========================================
// 3. Pending Approvals Pipeline
// ==========================================
export const mockApprovals: PendingApprovalSchema[] = [
  {
    id: 'appr-1',
    referenceNo: 'IND-2026-0042',
    type: 'Material Procurement Indent',
    project: 'Nexus Tech Park Lobby',
    requester: 'Rajesh Kumar (PM)',
    amount: 1540000, // ₹15.4 L
    date: '2026-07-20',
    status: 'pending'
  },
  {
    id: 'appr-2',
    referenceNo: 'PO-2026-0189',
    type: 'Purchase Order Approval Request',
    project: 'Grand Hyatt Executive Lounge',
    requester: 'Anita Rao (PM)',
    amount: 4200000, // ₹42 L
    date: '2026-07-21',
    status: 'approved_pending'
  },
  {
    id: 'appr-3',
    referenceNo: 'IND-2026-0045',
    type: 'Electrical Fitting Indent Approval',
    project: 'Imperial Heights Penthouse',
    requester: 'Sanjay Mehta (PM)',
    amount: 520000, // ₹5.2 L
    date: '2026-07-23',
    status: 'pending'
  },
  {
    id: 'appr-4',
    referenceNo: 'CON-2026-0105',
    type: 'HVAC Work Subcontract Request',
    project: 'Synergy Co-Working Workspace',
    requester: 'Vikram Reddy (PM)',
    amount: 12800000, // ₹1.28 Cr
    date: '2026-07-23',
    status: 'pending'
  }
];

// ==========================================
// 4. Operational Activities Feed
// ==========================================
export const mockActivities: ActivityFeedSchema[] = [
  {
    id: 'act-1',
    user: 'Amit Dev',
    action: 'Approved Material Indent',
    target: 'IND-2026-0038 Fit-Out Finishes',
    project: 'Oasis Luxury Villa',
    timestamp: '25 mins ago'
  },
  {
    id: 'act-2',
    user: 'Rajesh Kumar',
    action: 'Issued Purchase Order Call',
    target: 'PO-2026-0188 Acoustic Panels Supply',
    project: 'Nexus Tech Park Lobby',
    timestamp: '1 hour ago'
  },
  {
    id: 'act-3',
    user: 'Anita Rao',
    action: 'Submitted Budget Revision Approval',
    target: 'BR-2026-005 Modular Ceiling Outlay',
    project: 'Grand Hyatt Executive Lounge',
    timestamp: '3 hours ago'
  },
  {
    id: 'act-4',
    user: 'System Update',
    action: 'Auto-synchronized Stock Audit Log',
    target: 'INV-2026-Q3 Physical Stocktake',
    project: 'Central Warehouse Pune',
    timestamp: '4 hours ago'
  },
  {
    id: 'act-5',
    user: 'Sanjay Mehta',
    action: 'Registered Project Action Plan',
    target: 'Milestone MS-03 Drywall Work signoff',
    project: 'Imperial Heights Penthouse',
    timestamp: '1 day ago'
  }
];

// ==========================================
// 5. Urgent Milestones & Deliveries
// ==========================================
export const mockDeadlines: UpcomingDeadlineSchema[] = [
  {
    id: 'dl-1',
    title: 'Acoustic Panel Boarding Delivery',
    project: 'Nexus Tech Park Lobby',
    dueDate: '2026-07-25',
    priority: 'high',
    type: 'delivery'
  },
  {
    id: 'dl-2',
    title: 'HVAC Air Balancing Sign-Off',
    project: 'Grand Hyatt Executive Lounge',
    dueDate: '2026-07-28',
    priority: 'high',
    type: 'milestone'
  },
  {
    id: 'dl-3',
    title: 'Security System Compliance Audit',
    project: 'Synergy Co-Working Workspace',
    dueDate: '2026-07-31',
    priority: 'medium',
    type: 'compliance'
  },
  {
    id: 'dl-4',
    title: 'Client Billing Invoice Milestone',
    project: 'Imperial Heights Penthouse',
    dueDate: '2026-08-02',
    priority: 'high',
    type: 'payment'
  },
  {
    id: 'dl-5',
    title: 'Final Handover Documentation Submission',
    project: 'Oasis Luxury Villa',
    dueDate: '2026-08-05',
    priority: 'low',
    type: 'milestone'
  }
];

// ==========================================
// 6. Monthly Financials (Invoiced Billing, Payments Collection, Budget Limits, and Real Outlays)
// ==========================================
export const mockMonthlyFinancials: ChartRecord[] = [
  { month: 'Jan', billing: 12000000, payments: 10000000, budget: 15000005, actual: 13500005 },
  { month: 'Feb', billing: 18000000, payments: 14500000, budget: 18000000, actual: 17200000 },
  { month: 'Mar', billing: 25000000, payments: 21500000, budget: 20000000, actual: 23500000 }, // actual over budget limit
  { month: 'Apr', billing: 21000000, payments: 19000000, budget: 22000000, actual: 21000000 },
  { month: 'May', billing: 28000000, payments: 24000000, budget: 25000000, actual: 24800000 },
  { month: 'Jun', billing: 34000000, payments: 31000000, budget: 30000000, actual: 29500000 },
  { month: 'Jul', billing: 30000000, payments: 28000000, budget: 32000000, actual: 31500000 }
];

// ==========================================
// 7. Mock Project Sites List (Stage 2)
// ==========================================
export const mockSites: SiteSchema[] = [
  {
    id: 'site-1',
    code: 'SITE-2026-001',
    name: 'Nexus Tech Park Lobby Renovations',
    category: 'Corporate Office',
    client: 'Nexus Realty Group',
    city: 'Bengaluru',
    manager: 'Rajesh Kumar',
    startDate: '2026-01-10',
    targetCompletion: '2026-08-30',
    budget: 50000000, // ₹5 Cr
    progress: 45,
    workflowStatus: 'approved',
    executionStatus: 'active',
    company: 'Empire Interior Pvt Ltd',
    projectHead: 'Rajesh Kumar',
    address: 'Nexus Tech Park, Phase 2, Outer Ring Road',
    projectArea: 12000,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2026-01-10'
  },
  {
    id: 'site-2',
    code: 'SITE-2026-002',
    name: 'Grand Hyatt Executive Lounge Café',
    category: 'Hospitality Fit-Out',
    client: 'Hyatt Hospitality India',
    city: 'Goa',
    manager: 'Anita Rao',
    startDate: '2025-11-15',
    targetCompletion: '2026-04-10',
    budget: 12000000, // ₹1.2 Cr
    progress: 92,
    workflowStatus: 'approved',
    executionStatus: 'active',
    company: 'Empire Construction Ltd',
    projectHead: 'Anita Rao',
    address: 'Grand Hyatt Resort, Bambolim',
    projectArea: 4500,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2025-11-01'
  },
  {
    id: 'site-3',
    code: 'SITE-2026-003',
    name: 'Imperial Heights Penthouse Fit-Out',
    category: 'Luxury Residential',
    client: 'Imperial Realty Holdings',
    city: 'Mumbai',
    manager: 'Sanjay Mehta',
    startDate: '2026-02-05',
    targetCompletion: '2026-10-15',
    budget: 65000000, // ₹6.5 Cr
    progress: 72,
    workflowStatus: 'approved',
    executionStatus: 'active',
    company: 'Empire Interior Pvt Ltd',
    projectHead: 'Sanjay Mehta',
    address: 'Imperial Heights, Tower C, Worli',
    projectArea: 8000,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2026-01-20'
  },
  {
    id: 'site-4',
    code: 'SITE-2026-004',
    name: 'Synergy Co-Working Workspace',
    category: 'Commercial Interior',
    client: 'Synergy Infra Developers',
    city: 'Hyderabad',
    manager: 'Vikram Reddy',
    startDate: '2026-06-01',
    targetCompletion: '2027-01-15',
    budget: 45000000, // ₹4.5 Cr
    progress: 15,
    workflowStatus: 'approved',
    executionStatus: 'active',
    company: 'Empire Interior Pvt Ltd',
    projectHead: 'Vikram Reddy',
    address: 'Synergy Tech Park, HITEC City',
    projectArea: 15000,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2026-05-10'
  },
  {
    id: 'site-5',
    code: 'SITE-2026-005',
    name: 'Oasis Luxury Villa Construction',
    category: 'Residential Architecture',
    client: 'Oasis Estates Ltd',
    city: 'Pune',
    manager: 'Rohan Deshmukh',
    startDate: '2025-05-10',
    targetCompletion: '2026-06-30',
    budget: 15000000, // ₹1.5 Cr
    progress: 100,
    workflowStatus: 'approved',
    executionStatus: 'completed',
    company: 'Empire Construction Ltd',
    projectHead: 'Rohan Deshmukh',
    address: 'Oasis Meadows, Baner Hills',
    projectArea: 6000,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2025-04-20'
  },
  {
    id: 'site-6',
    code: 'SITE-2026-006',
    name: 'HDFC Regional Office Expansion',
    category: 'Financial Institutional',
    client: 'HDFC Bank Ltd',
    city: 'Navi Mumbai',
    manager: 'Karan Malhotra',
    startDate: '2026-08-01',
    targetCompletion: '2027-03-31',
    budget: 35000000, // ₹3.5 Cr
    progress: 0,
    workflowStatus: 'draft',
    executionStatus: 'not_started',
    company: 'Empire Interior Pvt Ltd',
    projectHead: 'Karan Malhotra',
    address: 'Mindspace IT Park, Airoli',
    projectArea: 10000,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2026-07-24'
  },
  {
    id: 'site-7',
    code: 'SITE-2026-007',
    name: 'Jio World Centre Retail Outlet',
    category: 'Retail Showroom',
    client: 'Reliance Retail Ltd',
    city: 'Mumbai',
    manager: 'Sanjay Mehta',
    startDate: '2026-05-15',
    targetCompletion: '2026-11-30',
    budget: 28000000, // ₹2.8 Cr
    progress: 30,
    workflowStatus: 'pending_approval',
    executionStatus: 'not_started',
    company: 'Empire Interior Pvt Ltd',
    projectHead: 'Sanjay Mehta',
    address: 'Jio World Centre, BKC',
    projectArea: 5500,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2026-05-01',
    approvalRequestDate: '2026-07-20',
    noteToApprover: 'Premium retail fitout requiring urgent mobilization budget release.',
    approvalWorkflow: {
      accountingHead: { approverName: 'Rohan Deshmukh', status: 'approved', actionDate: '2026-07-21' },
      chairman: { approverName: 'Sanjay Mehta', status: 'pending' },
      projectHead: { approverName: 'Karan Malhotra', status: 'approved', actionDate: '25 mins ago' },
      engineeringHead: { approverName: 'Amit Dev', status: 'pending' }
    }
  },
  {
    id: 'site-8',
    code: 'SITE-2026-008',
    name: 'DLF CyberCity HQ Interior',
    category: 'Corporate Office',
    client: 'DLF Limited',
    city: 'Delhi NCR',
    manager: 'Priya Sharma',
    startDate: '2026-03-01',
    targetCompletion: '2026-09-15',
    budget: 82000000, // ₹8.2 Cr
    progress: 60,
    workflowStatus: 'approved',
    executionStatus: 'active',
    company: 'Empire Interior Pvt Ltd',
    projectHead: 'Priya Sharma',
    address: 'DLF CyberCity, Phase 3',
    projectArea: 24000,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2026-02-15'
  },
  {
    id: 'site-9',
    code: 'SITE-2026-009',
    name: 'Manipal Hospital VIP Ward Design',
    category: 'Healthcare Facility',
    client: 'Manipal Hospitals Group',
    city: 'Bengaluru',
    manager: 'Rajesh Kumar',
    startDate: '2026-04-10',
    targetCompletion: '2027-02-28',
    budget: 18000000, // ₹1.8 Cr
    progress: 20,
    workflowStatus: 'approved',
    executionStatus: 'on_hold',
    company: 'Empire Interior Pvt Ltd',
    projectHead: 'Rajesh Kumar',
    address: 'Manipal Hospital Main Campus, HAL Road',
    projectArea: 7000,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2026-03-25'
  },
  {
    id: 'site-10',
    code: 'SITE-2026-010',
    name: 'BITS Pilani Library Renovation',
    category: 'Educational Facility',
    client: 'BITS Pilani Institute',
    city: 'Goa',
    manager: 'Anita Rao',
    startDate: '2026-07-01',
    targetCompletion: '2026-10-31',
    budget: 9500000, // ₹95 L
    progress: 5,
    workflowStatus: 'draft',
    executionStatus: 'not_started',
    company: 'Empire Construction Ltd',
    projectHead: 'Anita Rao',
    address: 'BITS Pilani Campus, Zuarinagar',
    projectArea: 3800,
    projectAreaUnit: 'Sq Ft',
    processStartDate: '2026-06-15'
  }
];
