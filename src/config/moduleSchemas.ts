import { ROUTES } from './navigation';

export type PageType = 'list' | 'form' | 'details' | 'report' | 'custom';

export interface SummaryCardSchema {
  id: string;
  label: string;
  value: string | number;
  isCurrency?: boolean;
  change?: string;
  color?: string;
}

export interface TabSchema {
  id: string;
  label: string;
  count?: number;
}

export interface ColumnSchema {
  key: string;
  label: string;
  type?: 'text' | 'currency' | 'badge' | 'date' | 'progress' | 'mono';
  align?: 'left' | 'center' | 'right';
}

export interface FieldSchema {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'toggle' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  colSpan?: 1 | 2;
}

export interface SectionSchema {
  id: string;
  title: string;
  description?: string;
  fields?: FieldSchema[];
  hasItemTable?: boolean;
  itemTableType?: 'material' | 'labour' | 'overhead' | 'generic';
}

export interface ModuleSchema {
  id: string;
  route: string;
  pageType: PageType;
  title: string;
  description?: string;
  breadcrumbs: string[];
  primaryAction?: {
    label: string;
    route?: string;
  };
  summaryCards?: SummaryCardSchema[];
  tabs?: TabSchema[];
  columns?: ColumnSchema[];
  tabColumns?: Record<string, ColumnSchema[]>;
  sections?: SectionSchema[];
  createFields?: FieldSchema[];
  mockRows?: Record<string, any>[];
}

export const MODULE_SCHEMAS: Record<string, ModuleSchema> = {
  // ==========================================
  // 1. OVERVIEW
  // ==========================================
  [ROUTES.MY_TASKS]: {
    id: 'overview-my-tasks',
    route: ROUTES.MY_TASKS,
    pageType: 'list',
    title: 'My Assigned Tasks & Action Items',
    description: 'Track urgent site tasks, approval signoffs and deliverable milestones assigned to your account.',
    breadcrumbs: ['Overview', 'My Tasks'],
    summaryCards: [
      { id: '1', label: 'Pending Tasks', value: 8, color: 'text-amber-600' },
      { id: '2', label: 'Overdue Tasks', value: 3, color: 'text-rose-600' },
      { id: '3', label: 'Completed Today', value: 12, color: 'text-emerald-700' }
    ],
    columns: [
      { key: 'taskCode', label: 'Task ID', type: 'mono' },
      { key: 'subject', label: 'Task Subject', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'from', label: 'Assigned By', type: 'text' },
      { key: 'dueDate', label: 'Due Date', type: 'date' },
      { key: 'priority', label: 'Priority', type: 'badge' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 't-1', taskCode: 'TSK-101', subject: 'Finalize Joinery Vendor Rates for Lobby', site: 'Nexus Tech Park', from: 'Rajesh Kumar', dueDate: '2026-07-26', priority: 'high', status: 'pending_approval' },
      { id: 't-2', taskCode: 'TSK-102', subject: 'Verify Material GRN PO-2026-089', site: 'Grand Hyatt Goa', from: 'Anita Rao', dueDate: '2026-07-27', priority: 'medium', status: 'in_progress' },
      { id: 't-3', taskCode: 'TSK-103', subject: 'Approve Payment Request REQ-2026-042', site: 'Imperial Heights', from: 'Sanjay Mehta', dueDate: '2026-07-25', priority: 'urgent', status: 'pending_approval' }
    ]
  },
  [ROUTES.NOTIFICATIONS]: {
    id: 'overview-notifications',
    route: ROUTES.NOTIFICATIONS,
    pageType: 'list',
    title: 'System Activity & Notifications',
    description: 'Log of operational alerts, workflow submissions, and signoff events.',
    breadcrumbs: ['Overview', 'Notifications'],
    columns: [
      { key: 'notifId', label: 'Alert ID', type: 'mono' },
      { key: 'title', label: 'Alert Title', type: 'text' },
      { key: 'module', label: 'Module', type: 'text' },
      { key: 'timestamp', label: 'Timestamp', type: 'date' },
      { key: 'status', label: 'Read Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'n-1', notifId: 'ALT-801', title: 'Site SITE-2026-006 pending approval', module: 'Sites', timestamp: '2026-07-24 10:30', status: 'active' },
      { id: 'n-2', notifId: 'ALT-802', title: 'Material GRN pending for Order PO-892', module: 'Procurement', timestamp: '2026-07-24 09:15', status: 'active' },
      { id: 'n-3', notifId: 'ALT-803', title: 'Rate Finalization approved by Chairman', module: 'Rates', timestamp: '2026-07-24 07:00', status: 'completed' }
    ]
  },

  // ==========================================
  // 2. PROJECTS
  // ==========================================
  [ROUTES.PROJECTS]: {
    id: 'projects-list',
    route: ROUTES.PROJECTS,
    pageType: 'list',
    title: 'Active Construction Projects Registry',
    description: 'Master portfolio of active interior construction projects, progress indicators, managers and budgets.',
    breadcrumbs: ['Projects', 'Project List'],
    primaryAction: { label: 'Register New Project', route: '/sites/new' },
    summaryCards: [
      { id: '1', label: 'Active Projects', value: 18 },
      { id: '2', label: 'Total Budget Portfolio', value: 248000000, isCurrency: true },
      { id: '3', label: 'Average Completion', value: '58.4%' }
    ],
    columns: [
      { key: 'projectCode', label: 'Project Code', type: 'mono' },
      { key: 'name', label: 'Project Name', type: 'text' },
      { key: 'client', label: 'Client Entity', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'manager', label: 'Project Manager', type: 'text' },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'completionDate', label: 'Target Completion', type: 'date' },
      { key: 'budget', label: 'Approved Budget', type: 'currency', align: 'right' },
      { key: 'progress', label: 'Progress (%)', type: 'text', align: 'center' },
      { key: 'status', label: 'Execution Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'p-1', projectCode: 'PRJ-2026-001', name: 'Nexus Tech Park Lobby Renovations', client: 'Nexus Realty Group', city: 'Bengaluru', manager: 'Rajesh Kumar', startDate: '2026-02-01', completionDate: '2026-10-30', budget: 50000000, progress: '45%', status: 'in_progress' },
      { id: 'p-2', projectCode: 'PRJ-2026-002', name: 'Grand Hyatt Executive Lounge Café', client: 'Hyatt Hospitality India', city: 'Goa', manager: 'Anita Rao', startDate: '2026-01-15', completionDate: '2026-08-20', budget: 12000000, progress: '92%', status: 'in_progress' },
      { id: 'p-3', projectCode: 'PRJ-2026-003', name: 'Imperial Heights Penthouse Fit-Out', client: 'Imperial Realty Holdings', city: 'Mumbai', manager: 'Sanjay Mehta', startDate: '2026-03-10', completionDate: '2026-11-15', budget: 65000000, progress: '72%', status: 'in_progress' }
    ]
  },
  [ROUTES.SITE_DETAILS]: {
    id: 'projects-site-details',
    route: ROUTES.SITE_DETAILS,
    pageType: 'details',
    title: 'Site Identity & Master Details Overview',
    description: 'Detailed commercial, architectural, PMC, management and compliance record for selected site.',
    breadcrumbs: ['Projects', 'Site Details'],
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'schedule', label: 'Project Schedule' },
      { id: 'budgets', label: 'Approved Budgets' },
      { id: 'indents', label: 'Material Indents' },
      { id: 'work_orders', label: 'Work Orders' },
      { id: 'invoices', label: 'Billing Invoices' }
    ]
  },
  [ROUTES.PROJECT_TEAMS]: {
    id: 'projects-teams',
    route: ROUTES.PROJECT_TEAMS,
    pageType: 'list',
    title: 'Project Personnel & Field Teams',
    description: 'Site project managers, billing engineers, site supervisors, and architectural coordinators.',
    breadcrumbs: ['Projects', 'Project Teams'],
    primaryAction: { label: 'Assign Team Member' },
    createFields: [
      { name: 'empCode', label: 'Employee ID', type: 'text', required: true, defaultValue: 'EMP-115' },
      { name: 'employee', label: 'Personnel Name', type: 'text', required: true, placeholder: 'e.g. Vikram Sharma' },
      { name: 'teamGroup', label: 'Project Team', type: 'text', required: true, defaultValue: 'Nexus Tech Park Team' },
      { name: 'role', label: 'Designation Role', type: 'text', required: true, placeholder: 'e.g. Site Engineer' },
      { name: 'department', label: 'Department', type: 'select', required: true, options: [{ label: 'Project Execution', value: 'Project Execution' }, { label: 'Civil & Joinery', value: 'Civil & Joinery' }] },
      { name: 'email', label: 'Contact Email', type: 'text', required: true, placeholder: 'name@empireinterior.in' },
      { name: 'phone', label: 'Phone Number', type: 'text', required: true, placeholder: '+91 98000 00000' },
      { name: 'assignedDate', label: 'Assigned Date', type: 'date', required: true, defaultValue: '2026-07-24' }
    ],
    columns: [
      { key: 'empCode', label: 'Employee ID', type: 'mono' },
      { key: 'employee', label: 'Personnel Name', type: 'text' },
      { key: 'teamGroup', label: 'Project Team', type: 'text' },
      { key: 'role', label: 'Designation Role', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'email', label: 'Contact Email', type: 'text' },
      { key: 'phone', label: 'Phone Number', type: 'text' },
      { key: 'assignedDate', label: 'Assigned Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'tm-1', empCode: 'EMP-104', employee: 'Rajesh Kumar', teamGroup: 'Nexus Tech Park Team', role: 'Project Head', department: 'Project Execution', email: 'rajesh.k@empireinterior.in', phone: '+91 98450 12345', assignedDate: '2026-02-01', status: 'active' },
      { id: 'tm-2', empCode: 'EMP-108', employee: 'Anita Rao', teamGroup: 'Hyatt Goa Team', role: 'Project Manager', department: 'Project Execution', email: 'anita.r@empireinterior.in', phone: '+91 98220 54321', assignedDate: '2026-01-15', status: 'active' },
      { id: 'tm-3', empCode: 'EMP-112', employee: 'Karan Sharma', teamGroup: 'Imperial Heights Team', role: 'Site Engineer', department: 'Civil & Joinery', email: 'karan.s@empireinterior.in', phone: '+91 98110 99887', assignedDate: '2026-03-10', status: 'active' }
    ]
  },
  [ROUTES.TENDER_DETAILS]: {
    id: 'projects-tenders',
    route: ROUTES.TENDER_DETAILS,
    pageType: 'list',
    title: 'Client Tender Specifications & Revisions',
    description: 'Original client tenders, extra item tenders, approved client scope and margin revisions.',
    breadcrumbs: ['Projects', 'Tender Details'],
    primaryAction: { label: 'Register Extra Item Tender' },
    summaryCards: [
      { id: '1', label: 'Total Tendered Value', value: 185000000, isCurrency: true },
      { id: '2', label: 'Approved Tender Value', value: 172000000, isCurrency: true },
      { id: '3', label: 'Extra Item Submittals', value: 14 }
    ],
    createFields: [
      { name: 'tenderNo', label: 'Tender Ref #', type: 'text', required: true, defaultValue: 'TND-2026-004' },
      { name: 'site', label: 'Project Site', type: 'text', required: true, defaultValue: 'Nexus Tech Park' },
      { name: 'version', label: 'Revision Version', type: 'text', required: true, defaultValue: 'v1.0' },
      { name: 'type', label: 'Tender Category', type: 'select', required: true, options: [{ label: 'Extra Item Tender', value: 'Extra Item Tender' }, { label: 'Main Tender', value: 'Main Tender' }] },
      { name: 'subDate', label: 'Submitted Date', type: 'date', required: true, defaultValue: '2026-07-24' },
      { name: 'subValue', label: 'Submitted Value (₹)', type: 'number', required: true, defaultValue: 2500000 },
      { name: 'appValue', label: 'Approved Value (₹)', type: 'number', required: true, defaultValue: 2200000 },
      { name: 'approvalPct', label: 'Approval %', type: 'text', defaultValue: '88%' }
    ],
    columns: [
      { key: 'tenderNo', label: 'Tender Ref #', type: 'mono' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'version', label: 'Revision', type: 'text', align: 'center' },
      { key: 'type', label: 'Tender Category', type: 'text' },
      { key: 'subDate', label: 'Submitted Date', type: 'date' },
      { key: 'subValue', label: 'Submitted Value', type: 'currency', align: 'right' },
      { key: 'appValue', label: 'Approved Value', type: 'currency', align: 'right' },
      { key: 'approvalPct', label: 'Approval %', type: 'text', align: 'center' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'td-1', tenderNo: 'TND-2026-001', site: 'Nexus Tech Park', version: 'v2.1', type: 'Main Tender', subDate: '2026-01-20', subValue: 50000000, appValue: 48000000, approvalPct: '96%', status: 'approved' },
      { id: 'td-2', tenderNo: 'TND-2026-002', site: 'Grand Hyatt Goa', version: 'v1.0', type: 'Main Tender', subDate: '2026-01-10', subValue: 12000000, appValue: 12000000, approvalPct: '100%', status: 'approved' },
      { id: 'td-3', tenderNo: 'TND-2026-003', site: 'Nexus Tech Park', version: 'v1.0', type: 'Extra Item Tender', subDate: '2026-06-15', subValue: 3500000, appValue: 3000000, approvalPct: '85.7%', status: 'pending_approval' }
    ]
  },

  // ==========================================
  // 3. PROCUREMENT
  // ==========================================
  [ROUTES.INDENTS]: {
    id: 'procurement-indents',
    route: ROUTES.INDENTS,
    pageType: 'list',
    title: 'Indent & Material Requisitions',
    description: 'Site material requisitions, board approval workflow, and purchase order conversions.',
    breadcrumbs: ['Procurement', 'Indents List'],
    primaryAction: { label: 'Create New Indent', route: '/procurement/indents/new' },
    summaryCards: [
      { id: '1', label: 'Total Indents Raised', value: 48 },
      { id: '2', label: 'Pending Approval', value: 6, color: 'text-amber-600' },
      { id: '3', label: 'Approved Value', value: 8500000, isCurrency: true },
      { id: '4', label: 'Converted to PO', value: 34 }
    ],
    tabs: [
      { id: 'all', label: 'All Indents' },
      { id: 'draft', label: 'Draft' },
      { id: 'pending_approval', label: 'Pending For Approval' },
      { id: 'approved', label: 'Approved' },
      { id: 'rejected', label: 'Rejected' }
    ],
    columns: [
      { key: 'indentNo', label: 'Indent Number', type: 'mono' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'requester', label: 'Request Raised By', type: 'text' },
      { key: 'requestDate', label: 'Request Date', type: 'date' },
      { key: 'requiredDate', label: 'Required Date', type: 'date' },
      { key: 'itemCount', label: 'Items', type: 'text', align: 'center' },
      { key: 'estValue', label: 'Estimated Value', type: 'currency', align: 'right' },
      { key: 'pendingWith', label: 'Pending With', type: 'text' },
      { key: 'status', label: 'Workflow Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'ind-1', indentNo: 'IND-2026-001', site: 'Nexus Tech Park', requester: 'Rajesh Kumar (Project Head)', requestDate: '2026-07-11', requiredDate: '2026-08-06', itemCount: 5, estValue: 450000, pendingWith: 'Rohan Deshmukh (Accounting Head)', status: 'pending_approval' },
      { id: 'ind-2', indentNo: 'IND-2026-002', site: 'Imperial Heights Penthouse', requester: 'Rajesh Kumar (Project Head)', requestDate: '2026-07-12', requiredDate: '2026-08-07', itemCount: 6, estValue: 900000, pendingWith: 'Rohan Deshmukh (Accounting Head)', status: 'draft' },
      { id: 'ind-3', indentNo: 'IND-2026-003', site: 'Grand Hyatt Goa', requester: 'Rajesh Kumar (Project Head)', requestDate: '2026-07-13', requiredDate: '2026-08-08', itemCount: 4, estValue: 1350000, pendingWith: 'Sanjay Mehta (Chairman)', status: 'approved' }
    ]
  },
  [ROUTES.RFQS]: {
    id: 'procurement-rfqs',
    route: ROUTES.RFQS,
    pageType: 'list',
    title: 'Request For Quotation (RFQ) Dashboard',
    description: 'Material and labour RFQs issued to vendors with quotation submittals.',
    breadcrumbs: ['Procurement', 'RFQs'],
    primaryAction: { label: 'Create New RFQ', route: '/procurement/rfqs/new' },
    summaryCards: [
      { id: '1', label: 'Open Material RFQs', value: 14 },
      { id: '2', label: 'Quotations Received', value: 28 },
      { id: '3', label: 'Finalized Rate Cards', value: 42 }
    ],
    columns: [
      { key: 'rfqNo', label: 'RFQ Number', type: 'mono' },
      { key: 'type', label: 'RFQ Type', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'vendor', label: 'Vendor Entity', type: 'text' },
      { key: 'requestDate', label: 'Inquiry Date', type: 'date' },
      { key: 'dueDate', label: 'Response Due', type: 'date' },
      { key: 'itemCount', label: 'Items', type: 'text', align: 'center' },
      { key: 'totalValue', label: 'Quoted Value', type: 'currency', align: 'right' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'rfq-1', rfqNo: 'RFQ-2026-001', type: 'Material', site: 'Nexus Tech Park', vendor: 'Asian Paints Ltd', requestDate: '2026-07-10', dueDate: '2026-07-28', itemCount: 6, totalValue: 480000, status: 'pending_approval' },
      { id: 'rfq-2', rfqNo: 'RFQ-2026-002', type: 'Material', site: 'Grand Hyatt Goa', vendor: 'Century Plyboards India Ltd', requestDate: '2026-07-12', dueDate: '2026-07-30', itemCount: 10, totalValue: 1250000, status: 'approved' }
    ]
  },
  [ROUTES.RATE_COMPARISON]: {
    id: 'procurement-rate-comparison',
    route: ROUTES.RATE_COMPARISON,
    pageType: 'report',
    title: 'Vendor Rate Comparison & Finalization Matrix',
    description: 'Side-by-side vendor quotation comparison showing basic rates, tax, discounts, delivery lead times and recommended L1 supplier.',
    breadcrumbs: ['Procurement', 'Rate Comparison'],
    summaryCards: [
      { id: '1', label: 'Inquiries Compared', value: 18 },
      { id: '2', label: 'L1 Savings Achieved', value: 640000, isCurrency: true }
    ],
    columns: [
      { key: 'item', label: 'Material Description', type: 'text' },
      { key: 'qty', label: 'Quantity', type: 'text', align: 'center' },
      { key: 'uom', label: 'UOM', type: 'text', align: 'center' },
      { key: 'vendor', label: 'Quoting Vendor', type: 'text' },
      { key: 'basicRate', label: 'Basic Rate (₹)', type: 'currency', align: 'right' },
      { key: 'discount', label: 'Discount', type: 'text', align: 'center' },
      { key: 'tax', label: 'GST Tax', type: 'text', align: 'center' },
      { key: 'deliveryDays', label: 'Lead Time', type: 'text', align: 'center' },
      { key: 'finalRate', label: 'Final Net Rate', type: 'currency', align: 'right' },
      { key: 'finalAmount', label: 'Total Amount', type: 'currency', align: 'right' },
      { key: 'selected', label: 'L1 Selected', type: 'badge' },
      { key: 'status', label: 'Finalization Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'rc-1', item: 'Plywood 18mm Commercial Grade', qty: '500', uom: 'Sq Ft', vendor: 'Century Plyboards India Ltd', basicRate: 120, discount: '5%', tax: '18% GST', deliveryDays: '4 Days', finalRate: 128.2, finalAmount: 64100, selected: 'active', status: 'approved' },
      { id: 'rc-2', item: 'Plywood 18mm Commercial Grade', qty: '500', uom: 'Sq Ft', vendor: 'Asian Paints Ltd (Wood Div)', basicRate: 135, discount: '2%', tax: '18% GST', deliveryDays: '6 Days', finalRate: 144.3, finalAmount: 72150, selected: 'inactive', status: 'rejected' },
      { id: 'rc-3', item: 'Plywood 18mm Commercial Grade', qty: '500', uom: 'Sq Ft', vendor: 'Greenlam Industries Ltd', basicRate: 128, discount: '3%', tax: '18% GST', deliveryDays: '5 Days', finalRate: 134.7, finalAmount: 67350, selected: 'inactive', status: 'pending_approval' },
      { id: 'rc-4', item: 'Gypsum Board 12mm Standard', qty: '1200', uom: 'Sq Ft', vendor: 'Saint-Gobain India Pvt Ltd', basicRate: 42, discount: '2%', tax: '18% GST', deliveryDays: '3 Days', finalRate: 48.5, finalAmount: 58200, selected: 'active', status: 'approved' },
      { id: 'rc-5', item: 'Gypsum Board 12mm Standard', qty: '1200', uom: 'Sq Ft', vendor: 'Schneider Building Solutions', basicRate: 46, discount: '4%', tax: '18% GST', deliveryDays: '5 Days', finalRate: 52.1, finalAmount: 62520, selected: 'inactive', status: 'rejected' }
    ]
  },
  [ROUTES.PURCHASE_ORDERS]: {
    id: 'procurement-purchase-orders',
    route: ROUTES.PURCHASE_ORDERS,
    pageType: 'list',
    title: 'Purchase Order Management',
    description: 'Issued commercial purchase orders, vendor acknowledgements, and delivery tracking.',
    breadcrumbs: ['Procurement', 'Purchase Orders'],
    primaryAction: { label: 'Issue Purchase Order', route: '/procurement/purchase-orders/new' },
    summaryCards: [
      { id: '1', label: 'Total Issued POs', value: 84 },
      { id: '2', label: 'Active PO Value', value: 14200000, isCurrency: true },
      { id: '3', label: 'Open Deliveries', value: 12, color: 'text-blue-600' }
    ],
    columns: [
      { key: 'poNo', label: 'PO Number', type: 'mono' },
      { key: 'vendor', label: 'Vendor Supplier', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'poDate', label: 'PO Date', type: 'date' },
      { key: 'expectedDelivery', label: 'Expected Delivery', type: 'date' },
      { key: 'totalAmount', label: 'Total PO Amount', type: 'currency', align: 'right' },
      { key: 'status', label: 'Approval Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'po-1', poNo: 'PO-2026-089', vendor: 'Asian Paints Ltd', site: 'Nexus Tech Park', poDate: '2026-07-15', expectedDelivery: '2026-07-28', totalAmount: 480000, status: 'approved' },
      { id: 'po-2', poNo: 'PO-2026-092', vendor: 'Century Plyboards India Ltd', site: 'Grand Hyatt Goa', poDate: '2026-07-18', expectedDelivery: '2026-08-02', totalAmount: 1250000, status: 'approved' },
      { id: 'po-3', poNo: 'PO-2026-095', vendor: 'Schneider Electric India', site: 'Imperial Heights', poDate: '2026-07-20', expectedDelivery: '2026-08-05', totalAmount: 980000, status: 'pending_approval' }
    ]
  },
  [ROUTES.WORK_ORDERS]: {
    id: 'mod-work-orders',
    title: 'Work Orders',
    description: 'Contractor instructions defined by specific service milestones instead of line items.',
    route: ROUTES.WORK_ORDERS,
    pageType: 'list',
    breadcrumbs: ['Procurement', 'Work Orders'],
    primaryAction: { label: 'Create WO', route: `${ROUTES.WORK_ORDERS}/new` },
    columns: [
      { key: 'woNumber', label: 'WO Ref', type: 'mono' },
      { key: 'contractor', label: 'Contractor' },
      { key: 'site', label: 'Site Profile' },
      { key: 'totalValue', label: 'Total Value', type: 'currency', align: 'right' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    sections: [
      {
        id: 'wo-details',
        title: 'Work Order Details',
        fields: [
          { name: 'woNumber', label: 'WO Number', type: 'text', required: true },
          { name: 'contractor', label: 'Contractor (Vendor)', type: 'select', required: true, options: [{value:'Ace Builders', label:'Ace Builders'}, {value:'Modern Interiors', label:'Modern Interiors'}] },
          { name: 'site', label: 'Project Site', type: 'select', required: true, options: [{value:'Grand Hyatt Goa', label:'Grand Hyatt Goa'}] }
        ]
      },
      {
        id: 'wo-milestones',
        title: 'Service Milestones / Payment Stages',
        description: 'Provide each payment milestone in the Item Description, use Lumpsum for UOM, 1 for quantity and Milestone Value for Rate.',
        hasItemTable: true
      }
    ],
    mockRows: []
  },
  [ROUTES.ORDERS]: {
    id: 'procurement-orders',
    route: ROUTES.ORDERS,
    pageType: 'list',
    title: 'Material Orders & Delivery Tracking',
    description: 'Track dispatched material shipments, partial deliveries and site arrivals.',
    breadcrumbs: ['Procurement', 'Orders'],
    columns: [
      { key: 'orderNo', label: 'Order Reference', type: 'mono' },
      { key: 'poRef', label: 'PO / WO Reference', type: 'mono' },
      { key: 'vendor', label: 'Vendor Supplier', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'orderDate', label: 'Order Date', type: 'date' },
      { key: 'expectedDelivery', label: 'Expected Delivery', type: 'date' },
      { key: 'totalQty', label: 'Ordered Qty', type: 'text', align: 'center' },
      { key: 'receivedQty', label: 'Received Qty', type: 'text', align: 'center' },
      { key: 'status', label: 'Delivery Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'ord-1', orderNo: 'ORD-2026-045', poRef: 'PO-2026-089', vendor: 'Asian Paints Ltd', site: 'Nexus Tech Park', orderDate: '2026-07-16', expectedDelivery: '2026-07-28', totalQty: '500 Pcs', receivedQty: '500 Pcs', status: 'completed' },
      { id: 'ord-2', orderNo: 'ORD-2026-048', poRef: 'PO-2026-092', vendor: 'Century Plyboards India Ltd', site: 'Grand Hyatt Goa', orderDate: '2026-07-19', expectedDelivery: '2026-08-02', totalQty: '200 Sheets', receivedQty: '0 Sheets', status: 'in_progress' }
    ]
  },
  [ROUTES.GRNS]: {
    id: 'procurement-grns',
    route: ROUTES.GRNS,
    pageType: 'list',
    title: 'Goods Received Notes (GRN) Registry',
    description: 'Site shipment inspection, accepted vs rejected material quantities and GRN signoffs.',
    breadcrumbs: ['Procurement', 'GRNs'],
    primaryAction: { label: 'Record New GRN', route: '/procurement/grns/new' },
    columns: [
      { key: 'grnNo', label: 'GRN Number', type: 'mono' },
      { key: 'orderNo', label: 'Order Ref', type: 'mono' },
      { key: 'vendor', label: 'Vendor Supplier', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'receivedDate', label: 'Received Date', type: 'date' },
      { key: 'totalItems', label: 'Total Items', type: 'text', align: 'center' },
      { key: 'acceptedQty', label: 'Accepted Qty', type: 'text', align: 'center' },
      { key: 'rejectedQty', label: 'Rejected Qty', type: 'text', align: 'center' },
      { key: 'status', label: 'Inspection Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'grn-1', grnNo: 'GRN-2026-104', orderNo: 'ORD-2026-045', vendor: 'Asian Paints Ltd', site: 'Nexus Tech Park', receivedDate: '2026-07-22', totalItems: '3 Items', acceptedQty: '490 Pcs', rejectedQty: '10 Pcs', status: 'completed' },
      { id: 'grn-2', grnNo: 'GRN-2026-108', orderNo: 'ORD-2026-048', vendor: 'Century Plyboards India Ltd', site: 'Grand Hyatt Goa', receivedDate: '2026-07-24', totalItems: '2 Items', acceptedQty: '200 Sheets', rejectedQty: '0', status: 'pending_approval' }
    ]
  },
  [ROUTES.INVENTORY]: {
    id: 'procurement-inventory',
    route: ROUTES.INVENTORY,
    pageType: 'list',
    title: 'Site Inventory & Stock Balance',
    description: 'On-site stock levels, reserved material quantities, reorder thresholds and stock transfers.',
    breadcrumbs: ['Procurement', 'Inventory'],
    summaryCards: [
      { id: '1', label: 'Total In-Stock Value', value: 34500000, isCurrency: true },
      { id: '2', label: 'Low Stock Alerts', value: 4, color: 'text-amber-600' }
    ],
    columns: [
      { key: 'itemCode', label: 'Item Code', type: 'mono' },
      { key: 'item', label: 'Material Description', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'site', label: 'Project Site Location', type: 'text' },
      { key: 'availableQty', label: 'Available Stock', type: 'text', align: 'center' },
      { key: 'unit', label: 'Unit', type: 'text', align: 'center' },
      { key: 'reorderLevel', label: 'Reorder Threshold', type: 'text', align: 'center' },
      { key: 'status', label: 'Stock Health Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'inv-1', itemCode: 'MAT-101', item: 'Gypsum Board 12mm Standard', category: 'Ceiling Materials', site: 'Nexus Tech Park', availableQty: '4,500', unit: 'Sq Ft', reorderLevel: '1,000 Sq Ft', status: 'in_stock' },
      { id: 'inv-2', itemCode: 'MAT-105', item: 'Teak Wood Veneer 4mm', category: 'Joinery & Wood', site: 'Grand Hyatt Goa', availableQty: '280', unit: 'Sheets', reorderLevel: '300 Sheets', status: 'low_stock' },
      { id: 'inv-3', itemCode: 'MAT-109', item: 'Asian Paints Royale Emulsion', category: 'Paints & Finishes', site: 'Imperial Heights', availableQty: '1,200', unit: 'Liters', reorderLevel: '500 Liters', status: 'in_stock' }
    ]
  },

  // ==========================================
  // 4. FINANCE
  // ==========================================
  [ROUTES.INVOICES]: {
    id: 'finance-invoices',
    route: ROUTES.INVOICES,
    pageType: 'list',
    title: 'Invoice Certification & Ledger',
    description: 'Vendor material and labour bills, site certification signoffs, Tax/GST verification and due dates.',
    breadcrumbs: ['Finance', 'Invoices'],
    primaryAction: { label: 'Register Vendor Invoice', route: '/finance/invoices/new' },
    summaryCards: [
      { id: '1', label: 'Total Invoices Registered', value: 92 },
      { id: '2', label: 'Certified Invoices', value: 74 },
      { id: '3', label: 'Gross Invoice Value', value: 28400000, isCurrency: true }
    ],
    columns: [
      { key: 'invoiceNo', label: 'Invoice #', type: 'mono' },
      { key: 'vendor', label: 'Vendor / Subcontractor', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'invoiceDate', label: 'Invoice Date', type: 'date' },
      { key: 'dueDate', label: 'Payment Due Date', type: 'date' },
      { key: 'grossAmount', label: 'Gross Bill Amount', type: 'currency', align: 'right' },
      { key: 'certifiedAmount', label: 'Certified Amount', type: 'currency', align: 'right' },
      { key: 'approvalStatus', label: 'Approval Status', type: 'badge' },
      { key: 'paymentStatus', label: 'Payment Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'inv-1', invoiceNo: 'INV-2026-104', vendor: 'Asian Paints Ltd', site: 'Nexus Tech Park', invoiceDate: '2026-07-18', dueDate: '2026-08-15', grossAmount: 480000, certifiedAmount: 480000, approvalStatus: 'approved', paymentStatus: 'paid' },
      { id: 'inv-2', invoiceNo: 'INV-2026-108', vendor: 'Century Plyboards India Ltd', site: 'Grand Hyatt Goa', invoiceDate: '2026-07-20', dueDate: '2026-08-18', grossAmount: 1250000, certifiedAmount: 1200000, approvalStatus: 'pending_approval', paymentStatus: 'partially_paid' },
      { id: 'inv-3', invoiceNo: 'INV-2026-112', vendor: 'Saint-Gobain India Pvt Ltd', site: 'Imperial Heights', invoiceDate: '2026-07-22', dueDate: '2026-08-22', grossAmount: 850000, certifiedAmount: 850000, approvalStatus: 'approved', paymentStatus: 'unpaid' }
    ]
  },
  [ROUTES.PAYMENT_REQUESTS]: {
    id: 'finance-payment-requests',
    route: ROUTES.PAYMENT_REQUESTS,
    pageType: 'list',
    title: 'Payment Approval Requests',
    description: 'Disbursement approval requests against certified vendor invoices and on-account advances.',
    breadcrumbs: ['Finance', 'Payment Requests'],
    primaryAction: { label: 'Request Payment Against Invoice', route: '/finance/payments/new' },
    columns: [
      { key: 'reqNo', label: 'Request #', type: 'mono' },
      { key: 'payee', label: 'Beneficiary Payee', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'reqDate', label: 'Request Date', type: 'date' },
      { key: 'reqAmount', label: 'Requested Amount', type: 'currency', align: 'right' },
      { key: 'paymentFor', label: 'Payment Purpose', type: 'text' },
      { key: 'pendingWith', label: 'Pending With', type: 'text' },
      { key: 'status', label: 'Workflow Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'pr-1', reqNo: 'REQ-2026-042', payee: 'Asian Paints Ltd', site: 'Nexus Tech Park', reqDate: '2026-07-22', reqAmount: 450000, paymentFor: 'Invoice INV-2026-104 Payment', pendingWith: 'Rohan Deshmukh (Accounting Head)', status: 'pending_approval' },
      { id: 'pr-2', reqNo: 'REQ-2026-045', payee: 'Century Plyboards India Ltd', site: 'Grand Hyatt Goa', reqDate: '2026-07-23', reqAmount: 1000000, paymentFor: 'On-Account Advance', pendingWith: 'Sanjay Mehta (Chairman)', status: 'pending_approval' }
    ]
  },
  [ROUTES.PAYMENTS]: {
    id: 'finance-payments',
    route: ROUTES.PAYMENTS,
    pageType: 'list',
    title: 'Payment Disbursements & Bank Ledger',
    description: 'Completed bank transfers, cheque issuances, RTGS payments and vendor disbursements.',
    breadcrumbs: ['Finance', 'Payments'],
    summaryCards: [
      { id: '1', label: 'Total Disbursed', value: 18500000, isCurrency: true },
      { id: '2', label: 'Bank Transfers (RTGS)', value: 15400000, isCurrency: true }
    ],
    columns: [
      { key: 'paymentRef', label: 'Payment Ref', type: 'mono' },
      { key: 'payee', label: 'Payee Entity', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'paymentDate', label: 'Disbursement Date', type: 'date' },
      { key: 'mode', label: 'Payment Mode', type: 'text' },
      { key: 'amount', label: 'Disbursed Amount', type: 'currency', align: 'right' },
      { key: 'approvalStatus', label: 'Approval Status', type: 'badge' },
      { key: 'txnStatus', label: 'Transaction Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'py-1', paymentRef: 'TXN-2026-881', payee: 'Asian Paints Ltd', site: 'Nexus Tech Park', paymentDate: '2026-07-21', mode: 'Bank Transfer / RTGS', amount: 450000, approvalStatus: 'approved', txnStatus: 'processed' },
      { id: 'py-2', paymentRef: 'TXN-2026-885', payee: 'Greenlam Industries Ltd', site: 'Grand Hyatt Goa', paymentDate: '2026-07-22', mode: 'Corporate Credit Card', amount: 280000, approvalStatus: 'approved', txnStatus: 'processed' },
      { id: 'py-3', paymentRef: 'TXN-2026-889', payee: 'Century Plyboards India Ltd', site: 'Imperial Heights', paymentDate: '2026-07-24', mode: 'Bank Transfer / RTGS', amount: 1200000, approvalStatus: 'approved', txnStatus: 'scheduled' }
    ]
  },
  [ROUTES.PROJECT_BUDGETS]: {
    id: 'finance-budgets',
    route: ROUTES.PROJECT_BUDGETS,
    pageType: 'list',
    title: 'Project Budget Allocations & Revisions',
    description: 'Site budget limits, committed costs, actual outlays, available balances, and revision requests.',
    breadcrumbs: ['Finance', 'Project Budgets'],
    primaryAction: { label: 'Request Budget Revision', route: '/finance/budgets/new' },
    summaryCards: [
      { id: '1', label: 'Approved Budget Portfolio', value: 248000000, isCurrency: true },
      { id: '2', label: 'Committed Cost', value: 168000000, isCurrency: true },
      { id: '3', label: 'Available Balance', value: 80000000, isCurrency: true }
    ],
    columns: [
      { key: 'site', label: 'Project Site Name', type: 'text' },
      { key: 'appBudget', label: 'Approved Budget', type: 'currency', align: 'right' },
      { key: 'committed', label: 'Committed Amount', type: 'currency', align: 'right' },
      { key: 'actualSpend', label: 'Actual Outlay', type: 'currency', align: 'right' },
      { key: 'available', label: 'Available Budget', type: 'currency', align: 'right' },
      { key: 'utilization', label: 'Utilization (%)', type: 'text', align: 'center' },
      { key: 'status', label: 'Budget Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'bg-1', site: 'Nexus Tech Park Lobby Renovations', appBudget: 50000000, committed: 35000000, actualSpend: 22000000, available: 15000000, utilization: '44.0%', status: 'healthy' },
      { id: 'bg-2', site: 'Grand Hyatt Executive Lounge Café', appBudget: 12000000, committed: 12500000, actualSpend: 12500000, available: -500000, utilization: '104.2%', status: 'over_budget' },
      { id: 'bg-3', site: 'Imperial Heights Penthouse Fit-Out', appBudget: 65000000, committed: 48000000, actualSpend: 36000000, available: 17000000, utilization: '73.8%', status: 'healthy' },
      { id: 'bg-4', site: 'Phoenix Marketcity Retail Store', appBudget: 18000000, committed: 17200000, actualSpend: 15000000, available: 800000, utilization: '95.5%', status: 'near_limit' },
      { id: 'bg-5', site: 'Sobha City Luxury Villa', appBudget: 42000000, committed: 31000000, actualSpend: 24000000, available: 11000000, utilization: '73.8%', status: 'healthy' }
    ]
  },
  [ROUTES.UTILITY_BILLS]: {
    id: 'finance-utility-bills',
    route: ROUTES.UTILITY_BILLS,
    pageType: 'list',
    title: 'Site Utility Bills & Overhead Allocations',
    description: 'Electricity, water, diesel generator, site security, and internet utility bills.',
    breadcrumbs: ['Finance', 'Utility Bills'],
    primaryAction: { label: 'Log Bill', route: `${ROUTES.UTILITY_BILLS}/new` },
    columns: [
      { key: 'billNo', label: 'Bill Reference', type: 'mono' },
      { key: 'utilityType', label: 'Utility Category', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'billDate', label: 'Bill Date', type: 'date' },
      { key: 'amount', label: 'Bill Amount', type: 'currency', align: 'right' },
      { key: 'approvalStatus', label: 'Approval Status', type: 'badge' },
      { key: 'paymentStatus', label: 'Payment Status', type: 'badge' }
    ],
    sections: [
      {
        id: 'bill-details',
        title: 'Utility Bill Information',
        fields: [
          { name: 'billNo', label: 'Bill Reference No', type: 'text', required: true },
          { name: 'utilityType', label: 'Utility Category', type: 'select', required: true, options: [{value:'Power', label:'Site Power (BESCOM)'}, {value:'Fuel', label:'DG Fuel'}] },
          { name: 'billDate', label: 'Billing Period', type: 'date', required: true },
          { name: 'amount', label: 'Total Billed Amount', type: 'number', required: true }
        ]
      },
      {
        id: 'allocations',
        title: 'Cost Center Splitting (Use Items to list sites)',
        hasItemTable: true
      }
    ],
    mockRows: [
      { id: 'ub-1', billNo: 'UTIL-2026-04', utilityType: 'Temporary Site Power', site: 'Multiple Sites', billDate: '2026-07-05', amount: 85000, approvalStatus: 'approved', paymentStatus: 'paid' },
      { id: 'ub-2', billNo: 'UTIL-2026-05', utilityType: 'Diesel Generator Fuel Supply', site: 'Grand Hyatt Goa', billDate: '2026-07-10', amount: 145000, approvalStatus: 'approved', paymentStatus: 'paid' }
    ]
  },
  [ROUTES.SALARY]: {
    id: 'finance-salary',
    route: ROUTES.SALARY,
    pageType: 'list',
    title: 'Staff Salary Disbursements & Site Cost Allocations',
    description: 'Monthly payroll disbursements, site engineer salary allocations, and staff allowances.',
    breadcrumbs: ['Finance', 'Salary'],
    primaryAction: { label: 'Log Payroll', route: `${ROUTES.SALARY}/new` },
    columns: [
      { key: 'payrollNo', label: 'Payroll Period', type: 'mono' },
      { key: 'department', label: 'Department / Unit', type: 'text' },
      { key: 'employeeCount', label: 'Staff Count', type: 'text', align: 'center' },
      { key: 'disbursementDate', label: 'Disbursement Date', type: 'date' },
      { key: 'totalGross', label: 'Gross Payroll Value', type: 'currency', align: 'right' },
      { key: 'status', label: 'Payroll Status', type: 'badge' }
    ],
    sections: [
      {
        id: 'payroll-details',
        title: 'Payroll Disbursement Record',
        fields: [
          { name: 'payrollNo', label: 'Payroll Identifier', type: 'text', required: true },
          { name: 'department', label: 'Business Unit', type: 'select', required: true, options: [{value:'Engineers', label:'Site Engineers'}, {value:'Corporate', label:'Corporate Staff'}] },
          { name: 'employeeCount', label: 'Number of Employees', type: 'number' },
          { name: 'disbursementDate', label: 'Disbursement Date', type: 'date', required: true },
          { name: 'totalGross', label: 'Gross Total Payroll', type: 'number', required: true }
        ]
      },
      {
        id: 'salary-splitting',
        title: 'Payroll Splitting (Enumerate site allocations as Items)',
        hasItemTable: true
      }
    ],
    mockRows: [
      { id: 'sal-1', payrollNo: 'PAYROLL-2026-06', department: 'Site Engineers', employeeCount: '24 Staff', disbursementDate: '2026-07-01', totalGross: 3850000, status: 'paid' }
    ]
  },

  // ==========================================
  // 5. MASTERS
  // ==========================================
  [ROUTES.CLIENTS]: {
    id: 'masters-clients',
    route: ROUTES.CLIENTS,
    pageType: 'list',
    title: 'Clients & Corporate Entities Master',
    description: 'Registered corporate clients, key project sponsors, contract references, and contact persons.',
    breadcrumbs: ['Masters', 'Clients'],
    primaryAction: { label: 'Add Client Entity' },
    summaryCards: [
      { id: '1', label: 'Registered Clients', value: 16 },
      { id: '2', label: 'Active Project Sponsors', value: 12 }
    ],
    createFields: [
      { name: 'clientCode', label: 'Client Code', type: 'text', required: true, defaultValue: 'CLI-2026-004' },
      { name: 'clientName', label: 'Client Organization', type: 'text', required: true, placeholder: 'e.g. Prestige Group Pvt Ltd' },
      { name: 'company', label: 'Company Entity', type: 'text', required: true, defaultValue: 'Empire Interior Contracting Pvt Ltd' },
      { name: 'contactPerson', label: 'Contact Person', type: 'text', required: true, placeholder: 'e.g. Ramesh Chandra' },
      { name: 'phone', label: 'Phone Number', type: 'text', required: true, placeholder: '+91 98000 00000' },
      { name: 'email', label: 'Email Address', type: 'text', required: true, placeholder: 'contact@prestige.com' },
      { name: 'gstin', label: 'GSTIN Reference', type: 'text', required: true, placeholder: '29AAACP1234F1Z1' },
      { name: 'city', label: 'Corporate City', type: 'text', required: true, placeholder: 'Bengaluru' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'clientCode', label: 'Client Code', type: 'mono' },
      { key: 'clientName', label: 'Client Organization', type: 'text' },
      { key: 'company', label: 'Company Entity', type: 'text' },
      { key: 'contactPerson', label: 'Contact Person', type: 'text' },
      { key: 'phone', label: 'Phone Number', type: 'text' },
      { key: 'email', label: 'Email Address', type: 'text' },
      { key: 'gstin', label: 'GSTIN Reference', type: 'mono' },
      { key: 'city', label: 'Corporate City', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'cl-1', clientCode: 'CLI-2026-001', clientName: 'Nexus Realty Group', company: 'Empire Interior Contracting', contactPerson: 'Vikram Shah (VP Projects)', phone: '+91 98200 11223', email: 'v.shah@nexusrealty.in', gstin: '29AAACN1234F1Z1', city: 'Bengaluru', status: 'active' },
      { id: 'cl-2', clientCode: 'CLI-2026-002', clientName: 'Hyatt Hospitality India', company: 'Empire Joinery & Furniture', contactPerson: 'Meera Patel (Director Ops)', phone: '+91 98190 44556', email: 'm.patel@hyatt.com', gstin: '30AAACH5678G2Z3', city: 'Goa', status: 'active' },
      { id: 'cl-3', clientCode: 'CLI-2026-003', clientName: 'Imperial Realty Holdings', company: 'Empire Interior Contracting', contactPerson: 'Suresh Raina (Asset Mgr)', phone: '+91 98330 99881', email: 's.raina@imperialholdings.com', gstin: '27AAACI9911H3Z5', city: 'Mumbai', status: 'active' }
    ]
  },
  [ROUTES.VENDORS]: {
    id: 'masters-vendors',
    route: ROUTES.VENDORS,
    pageType: 'list',
    title: 'Vendor & Subcontractor Directory',
    description: 'Empanelled vendors, suppliers, GSTIN references and performance ratings.',
    breadcrumbs: ['Masters', 'Vendors'],
    primaryAction: { label: 'Register Vendor Supplier' },
    summaryCards: [
      { id: '1', label: 'Empanelled Vendors', value: 128 },
      { id: '2', label: 'GST Compliant Suppliers', value: 124 }
    ],
    createFields: [
      { name: 'vendorCode', label: 'Vendor Code', type: 'text', required: true, defaultValue: 'VEN-2026-006' },
      { name: 'name', label: 'Company Name', type: 'text', required: true, placeholder: 'e.g. Pidilite Industries Ltd' },
      { name: 'gstin', label: 'GSTIN Number', type: 'text', required: true, placeholder: '27AAACP9988A1Z2' },
      { name: 'city', label: 'City Location', type: 'text', required: true, placeholder: 'Mumbai' },
      { name: 'rating', label: 'Quality Rating', type: 'text', defaultValue: '4.8 / 5.0' },
      { name: 'status', label: 'Empanelment Status', type: 'select', required: true, options: [{ label: 'Empanelled', value: 'empanelled' }, { label: 'Pending For Approval', value: 'pending_approval' }, { label: 'Suspended', value: 'suspended' }] }
    ],
    columns: [
      { key: 'vendorCode', label: 'Vendor Code', type: 'mono' },
      { key: 'name', label: 'Company Name', type: 'text' },
      { key: 'gstin', label: 'GSTIN Number', type: 'mono' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'rating', label: 'Quality Rating', type: 'text' },
      { key: 'status', label: 'Empanelment Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'v-1', vendorCode: 'VEN-2026-001', name: 'Century Plyboards India Ltd', gstin: '19AAACC1234A1Z5', city: 'Kolkata', rating: '4.9 / 5.0', status: 'empanelled' },
      { id: 'v-2', vendorCode: 'VEN-2026-002', name: 'Asian Paints Ltd', gstin: '27AAACA5678B2Z4', city: 'Mumbai', rating: '4.8 / 5.0', status: 'empanelled' },
      { id: 'v-3', vendorCode: 'VEN-2026-003', name: 'Greenlam Industries Ltd', gstin: '08AAACG9911C3Z2', city: 'Jaipur', rating: '4.7 / 5.0', status: 'empanelled' },
      { id: 'v-4', vendorCode: 'VEN-2026-004', name: 'Saint-Gobain India Pvt Ltd', gstin: '33AAACS4321D4Z8', city: 'Chennai', rating: '4.9 / 5.0', status: 'empanelled' },
      { id: 'v-5', vendorCode: 'VEN-2026-005', name: 'Schneider Electric India Ltd', gstin: '29AAACS8765E5Z6', city: 'Bengaluru', rating: '4.8 / 5.0', status: 'empanelled' }
    ]
  },
  [ROUTES.EMPLOYEES]: {
    id: 'masters-employees',
    route: ROUTES.EMPLOYEES,
    pageType: 'list',
    title: 'Employee Directory Master',
    description: 'Corporate staff directory, project heads, site engineers, and administrative personnel.',
    breadcrumbs: ['Masters', 'Employees'],
    primaryAction: { label: 'Add Employee Record' },
    createFields: [
      { name: 'empCode', label: 'Employee ID', type: 'text', required: true, defaultValue: 'EMP-114' },
      { name: 'name', label: 'Staff Name', type: 'text', required: true, placeholder: 'e.g. Priya Nair' },
      { name: 'department', label: 'Department', type: 'select', required: true, options: [{ label: 'Project Execution', value: 'Project Execution' }, { label: 'Procurement & Stores', value: 'Procurement & Stores' }, { label: 'Finance & Accounts', value: 'Finance & Accounts' }] },
      { name: 'designation', label: 'Designation', type: 'text', required: true, placeholder: 'e.g. Quality Engineer' },
      { name: 'email', label: 'Corporate Email', type: 'text', required: true, placeholder: 'name@empireinterior.in' },
      { name: 'phone', label: 'Phone Number', type: 'text', required: true, placeholder: '+91 98000 00000' },
      { name: 'joiningDate', label: 'Joining Date', type: 'date', required: true, defaultValue: '2026-07-24' },
      { name: 'status', label: 'Employment Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'On Leave', value: 'on_leave' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'empCode', label: 'Employee ID', type: 'mono' },
      { key: 'name', label: 'Staff Name', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'designation', label: 'Designation', type: 'text' },
      { key: 'email', label: 'Corporate Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'joiningDate', label: 'Joining Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'emp-1', empCode: 'EMP-101', name: 'Rajesh Kumar', department: 'Project Execution', designation: 'Project Head', email: 'rajesh.k@empireinterior.in', phone: '+91 98450 12345', joiningDate: '2022-04-15', status: 'active' },
      { id: 'emp-2', empCode: 'EMP-102', name: 'Anita Rao', department: 'Project Execution', designation: 'Project Manager', email: 'anita.r@empireinterior.in', phone: '+91 98220 54321', joiningDate: '2023-01-10', status: 'active' },
      { id: 'emp-3', empCode: 'EMP-103', name: 'Sanjay Mehta', department: 'Board Management', designation: 'Chairman', email: 'sanjay.m@empireinterior.in', phone: '+91 98100 88776', joiningDate: '2020-01-01', status: 'active' }
    ]
  },
  [ROUTES.ITEMS]: {
    id: 'masters-items',
    route: ROUTES.ITEMS,
    pageType: 'list',
    title: 'Materials & Products Master Catalog',
    description: 'Standard material catalog, specifications, UOMs and baseline rate definitions.',
    breadcrumbs: ['Masters', 'Items'],
    primaryAction: { label: 'Add Material Item' },
    createFields: [
      { name: 'itemCode', label: 'Item Code', type: 'text', required: true, defaultValue: 'MAT-104' },
      { name: 'item', label: 'Material Description', type: 'text', required: true, placeholder: 'e.g. Architectural Hardware Hinges' },
      { name: 'category', label: 'Category', type: 'select', required: true, options: [{ label: 'Joinery & Woodwork', value: 'Joinery & Woodwork' }, { label: 'Ceiling & Partitions', value: 'Ceiling & Partitions' }, { label: 'Hardware & Fittings', value: 'Hardware & Fittings' }] },
      { name: 'brand', label: 'Brand Name', type: 'text', required: true, placeholder: 'e.g. Hafele' },
      { name: 'unit', label: 'UOM', type: 'text', required: true, defaultValue: 'Pcs' },
      { name: 'standardRate', label: 'Standard Rate (₹)', type: 'number', required: true, defaultValue: 320 },
      { name: 'status', label: 'Catalog Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Discontinued', value: 'discontinued' }] }
    ],
    columns: [
      { key: 'itemCode', label: 'Item Code', type: 'mono' },
      { key: 'item', label: 'Material Description', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'unit', label: 'UOM', type: 'text', align: 'center' },
      { key: 'standardRate', label: 'Standard Rate', type: 'currency', align: 'right' },
      { key: 'status', label: 'Catalog Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'mat-1', itemCode: 'MAT-101', item: 'Gypsum Board 12mm Standard', category: 'Ceiling Materials', brand: 'Saint-Gobain Gyproc', unit: 'Sq Ft', standardRate: 45, status: 'active' },
      { id: 'mat-2', itemCode: 'MAT-102', item: 'Plywood 18mm Commercial Grade', category: 'Joinery & Wood', brand: 'Century Ply', unit: 'Sq Ft', standardRate: 120, status: 'active' },
      { id: 'mat-3', itemCode: 'MAT-103', item: 'Teak Wood Veneer 4mm', category: 'Joinery & Wood', brand: 'Greenlam', unit: 'Sheets', standardRate: 850, status: 'active' }
    ]
  },
  [ROUTES.ITEM_CATEGORIES]: {
    id: 'masters-item-categories',
    route: ROUTES.ITEM_CATEGORIES,
    pageType: 'list',
    title: 'Material & Service Taxonomy Categories',
    description: 'Category hierarchy for interior execution materials and subcontracting services.',
    breadcrumbs: ['Masters', 'Item Categories'],
    primaryAction: { label: 'Add Item Category' },
    createFields: [
      { name: 'code', label: 'Category Code', type: 'text', required: true, defaultValue: 'CAT-03' },
      { name: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'e.g. Electrical & Lighting' },
      { name: 'parent', label: 'Parent Group', type: 'text', required: true, defaultValue: 'MEP Services' },
      { name: 'itemCount', label: 'Item Count', type: 'text', defaultValue: '0 Items' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'code', label: 'Cat Code', type: 'mono' },
      { key: 'name', label: 'Category Name', type: 'text' },
      { key: 'parent', label: 'Parent Group', type: 'text' },
      { key: 'itemCount', label: 'Item Count', type: 'text', align: 'center' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'cat-1', code: 'CAT-01', name: 'Joinery & Woodwork', parent: 'Civil & Architectural', itemCount: '142 Items', status: 'active' },
      { id: 'cat-2', code: 'CAT-02', name: 'Ceiling & Partitions', parent: 'Civil & Architectural', itemCount: '88 Items', status: 'active' }
    ]
  },
  [ROUTES.UNITS]: {
    id: 'masters-units',
    route: ROUTES.UNITS,
    pageType: 'list',
    title: 'Units of Measurement (UOM)',
    description: 'Standard measurement units used across procurement, BOQs, and site inventories.',
    breadcrumbs: ['Masters', 'Units'],
    primaryAction: { label: 'Add Unit' },
    createFields: [
      { name: 'code', label: 'UOM Code', type: 'text', required: true, defaultValue: 'UOM-LTR' },
      { name: 'name', label: 'Unit Name', type: 'text', required: true, placeholder: 'e.g. Liter' },
      { name: 'symbol', label: 'Symbol', type: 'text', required: true, placeholder: 'Ltr' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'code', label: 'UOM Code', type: 'mono' },
      { key: 'name', label: 'Unit Name', type: 'text' },
      { key: 'symbol', label: 'Symbol', type: 'text', align: 'center' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'uom-1', code: 'UOM-SQFT', name: 'Square Feet', symbol: 'Sq Ft', status: 'active' },
      { id: 'uom-2', code: 'UOM-SHT', name: 'Sheets', symbol: 'Sht', status: 'active' },
      { id: 'uom-3', code: 'UOM-RM', name: 'Running Meter', symbol: 'RM', status: 'active' }
    ]
  },
  [ROUTES.COMPANIES]: {
    id: 'masters-companies',
    route: ROUTES.COMPANIES,
    pageType: 'list',
    title: 'Empire Group Corporate Entities',
    description: 'Operating corporate legal entities and contracting company profiles.',
    breadcrumbs: ['Masters', 'Companies'],
    primaryAction: { label: 'Add Company Entity' },
    createFields: [
      { name: 'code', label: 'Entity Code', type: 'text', required: true, defaultValue: 'CMP-03' },
      { name: 'name', label: 'Company Entity Name', type: 'text', required: true, placeholder: 'e.g. Empire MEP Services India' },
      { name: 'gstin', label: 'Corporate GSTIN', type: 'text', required: true, placeholder: '29AAACE9911C1Z3' },
      { name: 'city', label: 'Headquarters', type: 'text', required: true, defaultValue: 'Bengaluru' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'code', label: 'Entity Code', type: 'mono' },
      { key: 'name', label: 'Company Entity Name', type: 'text' },
      { key: 'gstin', label: 'Corporate GSTIN', type: 'mono' },
      { key: 'city', label: 'Headquarters', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'cmp-1', code: 'CMP-01', name: 'Empire Interior Contracting Pvt Ltd', gstin: '29AAACE1234A1Z5', city: 'Bengaluru', status: 'active' },
      { id: 'cmp-2', code: 'CMP-02', name: 'Empire Joinery & Furniture Works', gstin: '29AAACE5678B2Z4', city: 'Bengaluru', status: 'active' }
    ]
  },
  [ROUTES.BANKS]: {
    id: 'masters-banks',
    route: ROUTES.BANKS,
    pageType: 'list',
    title: 'Corporate Bank Accounts & Payment Gateways',
    description: 'Corporate bank accounts for RTGS vendor disbursements and client receipts.',
    breadcrumbs: ['Masters', 'Banks'],
    primaryAction: { label: 'Add Bank Account' },
    createFields: [
      { name: 'code', label: 'Bank Code', type: 'text', required: true, defaultValue: 'BNK-AXIS' },
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true, placeholder: 'Axis Bank Ltd' },
      { name: 'accountNo', label: 'Account Number', type: 'text', required: true, placeholder: '92000012345678' },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true, placeholder: 'UTIB0000123' },
      { name: 'branch', label: 'Branch Location', type: 'text', required: true, defaultValue: 'Indiranagar, Bengaluru' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'code', label: 'Bank Code', type: 'mono' },
      { key: 'bankName', label: 'Bank Name', type: 'text' },
      { key: 'accountNo', label: 'Account Number', type: 'mono' },
      { key: 'ifsc', label: 'IFSC Code', type: 'mono' },
      { key: 'branch', label: 'Branch Location', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'bnk-1', code: 'BNK-HDFC', bankName: 'HDFC Bank Ltd', accountNo: '50200012345678', ifsc: 'HDFC0001234', branch: 'MG Road, Bengaluru', status: 'active' },
      { id: 'bnk-2', code: 'BNK-ICICI', bankName: 'ICICI Bank Ltd', accountNo: '00040509876543', ifsc: 'ICIC0000004', branch: 'BKC, Mumbai', status: 'active' }
    ]
  },
  [ROUTES.DEPARTMENTS]: {
    id: 'masters-departments',
    route: ROUTES.DEPARTMENTS,
    pageType: 'list',
    title: 'Department Master Registry',
    description: 'Corporate organizational units and operational departments.',
    breadcrumbs: ['Masters', 'Departments'],
    primaryAction: { label: 'Add Department' },
    createFields: [
      { name: 'code', label: 'Dept Code', type: 'text', required: true, defaultValue: 'DEPT-QS' },
      { name: 'name', label: 'Department Name', type: 'text', required: true, placeholder: 'e.g. Quantity Survey & Estimation' },
      { name: 'head', label: 'Department Head', type: 'text', required: true, placeholder: 'e.g. Anita Rao' },
      { name: 'userCount', label: 'Staff Count', type: 'text', defaultValue: '8 Staff' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'code', label: 'Dept Code', type: 'mono' },
      { key: 'name', label: 'Department Name', type: 'text' },
      { key: 'head', label: 'Department Head', type: 'text' },
      { key: 'userCount', label: 'Staff Count', type: 'text', align: 'center' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'dp-1', code: 'DEPT-EXE', name: 'Project Execution & Engineering', head: 'Rajesh Kumar', userCount: '24 Staff', status: 'active' },
      { id: 'dp-2', code: 'DEPT-PRO', name: 'Procurement & Vendor Management', head: 'Anita Rao', userCount: '12 Staff', status: 'active' }
    ]
  },
  [ROUTES.ROLES_MASTER]: {
    id: 'masters-roles',
    route: ROUTES.ROLES_MASTER,
    pageType: 'list',
    title: 'User Roles & Operational Job Matrix',
    description: 'Operational job functions, site approval limits, and approval authority tiers.',
    breadcrumbs: ['Masters', 'Roles Master'],
    primaryAction: { label: 'Add Role' },
    createFields: [
      { name: 'roleId', label: 'Role Key', type: 'text', required: true, defaultValue: 'ROLE-QS' },
      { name: 'roleName', label: 'Role Name', type: 'text', required: true, placeholder: 'e.g. Senior QS Auditor' },
      { name: 'description', label: 'Scope', type: 'text', required: true, placeholder: 'e.g. Invoice certification rights' },
      { name: 'userCount', label: 'Assigned Users', type: 'text', defaultValue: '4 Users' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'roleId', label: 'Role Key', type: 'mono' },
      { key: 'roleName', label: 'Role Name', type: 'text' },
      { key: 'description', label: 'Scope', type: 'text' },
      { key: 'userCount', label: 'Assigned Users', type: 'text', align: 'center' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'rl-1', roleId: 'ROLE-CHAIRMAN', roleName: 'Chairman / Board Approver', description: 'Full board signoff rights', userCount: '2 Users', status: 'active' },
      { id: 'rl-2', roleId: 'ROLE-PROJHEAD', roleName: 'Project Head', description: 'Project site approval rights', userCount: '6 Users', status: 'active' }
    ]
  },

  // ==========================================
  // 6. REPORTS
  // ==========================================
  [ROUTES.PURCHASE_REPORTS]: {
    id: 'reports-purchase',
    route: ROUTES.PURCHASE_REPORTS,
    pageType: 'report',
    title: 'Purchase Analysis & Material Spend Report',
    description: 'Comprehensive purchase analysis across active sites, material categories, and vendor suppliers.',
    breadcrumbs: ['Reports', 'Purchase Reports'],
    summaryCards: [
      { id: '1', label: 'Total Purchase Outlay', value: 168000000, isCurrency: true },
      { id: '2', label: 'Material Savings', value: '8.4%' }
    ],
    columns: [
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'poCount', label: 'Issued POs', type: 'text', align: 'center' },
      { key: 'materialSpend', label: 'Material Outlay', type: 'currency', align: 'right' },
      { key: 'freightSpend', label: 'Freight & Overheads', type: 'currency', align: 'right' },
      { key: 'totalSpend', label: 'Total Outlay', type: 'currency', align: 'right' },
      { key: 'status', label: 'Variance Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'pr-1', site: 'Nexus Tech Park', poCount: '12 POs', materialSpend: 45000000, freightSpend: 1200000, totalSpend: 46200000, status: 'healthy' },
      { id: 'pr-2', site: 'Grand Hyatt Goa', poCount: '8 POs', materialSpend: 11000000, freightSpend: 400000, totalSpend: 11400000, status: 'healthy' },
      { id: 'pr-3', site: 'Imperial Heights Penthouse', poCount: '15 POs', materialSpend: 34000000, freightSpend: 900000, totalSpend: 34900000, status: 'healthy' },
      { id: 'pr-4', site: 'Phoenix Marketcity Store', poCount: '6 POs', materialSpend: 14000000, freightSpend: 350000, totalSpend: 14350000, status: 'near_limit' },
      { id: 'pr-5', site: 'Sobha City Villa', poCount: '10 POs', materialSpend: 22000000, freightSpend: 600000, totalSpend: 22600000, status: 'healthy' }
    ]
  },
  [ROUTES.BUDGET_REPORTS]: {
    id: 'reports-budget',
    route: ROUTES.BUDGET_REPORTS,
    pageType: 'report',
    title: 'Project Budget vs Outlay Analysis Report',
    description: 'Detailed site budget utilization, committed costs, and variance tracking.',
    breadcrumbs: ['Reports', 'Budget Reports'],
    summaryCards: [
      { id: '1', label: 'Portfolio Approved Budget', value: 187000000, isCurrency: true },
      { id: '2', label: 'Actual Outlay', value: 109500000, isCurrency: true },
      { id: '3', label: 'Net Available Balance', value: 77500000, isCurrency: true }
    ],
    columns: [
      { key: 'site', label: 'Project Site Name', type: 'text' },
      { key: 'approvedBudget', label: 'Approved Budget', type: 'currency', align: 'right' },
      { key: 'committedCost', label: 'Committed Cost', type: 'currency', align: 'right' },
      { key: 'actualOutlay', label: 'Actual Outlay', type: 'currency', align: 'right' },
      { key: 'availableBalance', label: 'Available Balance', type: 'currency', align: 'right' },
      { key: 'utilization', label: 'Utilization (%)', type: 'text', align: 'center' },
      { key: 'healthStatus', label: 'Health Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'br-1', site: 'Nexus Tech Park Lobby Renovations', approvedBudget: 50000000, committedCost: 35000000, actualOutlay: 22000000, availableBalance: 15000000, utilization: '44.0%', healthStatus: 'healthy' },
      { id: 'br-2', site: 'Grand Hyatt Executive Lounge Café', approvedBudget: 12000000, committedCost: 12500000, actualOutlay: 12500000, availableBalance: -500000, utilization: '104.2%', healthStatus: 'over_budget' },
      { id: 'br-3', site: 'Imperial Heights Penthouse Fit-Out', approvedBudget: 65000000, committedCost: 48000000, actualOutlay: 36000000, availableBalance: 17000000, utilization: '55.4%', healthStatus: 'healthy' },
      { id: 'br-4', site: 'Phoenix Marketcity Retail Store', approvedBudget: 18000000, committedCost: 17200000, actualOutlay: 15000000, availableBalance: 800000, utilization: '83.3%', healthStatus: 'near_limit' },
      { id: 'br-5', site: 'Sobha City Luxury Villa', approvedBudget: 42000000, committedCost: 31000000, actualOutlay: 24000000, availableBalance: 11000000, utilization: '57.1%', healthStatus: 'healthy' }
    ]
  },
  [ROUTES.FINANCE_REPORTS]: {
    id: 'reports-finance', route: ROUTES.FINANCE_REPORTS, pageType: 'report',
    title: 'Vendor Bill Payment Summary & Liabilities Report',
    description: 'Reconciliation report of certified vendor bills, disbursed payments, and outstanding liabilities.',
    breadcrumbs: ['Reports', 'Finance Reports'],
    summaryCards: [
      { id: '1', label: 'Total Certified Invoices', value: 31000000, isCurrency: true },
      { id: '2', label: 'Total Disbursed Payments', value: 20400000, isCurrency: true },
      { id: '3', label: 'Outstanding Liabilities', value: 10600000, isCurrency: true, color: 'text-rose-600' }
    ],
    columns: [
      { key: 'vendor', label: 'Vendor Supplier', type: 'text' },
      { key: 'billedAmount', label: 'Total Billed', type: 'currency', align: 'right' },
      { key: 'certifiedAmount', label: 'Total Certified', type: 'currency', align: 'right' },
      { key: 'paidAmount', label: 'Total Disbursed', type: 'currency', align: 'right' },
      { key: 'dueAmount', label: 'Outstanding Due', type: 'currency', align: 'right' },
      { key: 'status', label: 'Ledger Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'fr-1', vendor: 'Asian Paints Ltd', billedAmount: 5200000, certifiedAmount: 4800000, paidAmount: 3600000, dueAmount: 1200000, status: 'partially_reconciled' },
      { id: 'fr-2', vendor: 'Century Plyboards India Ltd', billedAmount: 8500000, certifiedAmount: 8000000, paidAmount: 5000000, dueAmount: 3000000, status: 'outstanding' },
      { id: 'fr-3', vendor: 'Greenlam Industries Ltd', billedAmount: 4200000, certifiedAmount: 4200000, paidAmount: 4200000, dueAmount: 0, status: 'reconciled' },
      { id: 'fr-4', vendor: 'Saint-Gobain India Pvt Ltd', billedAmount: 6800000, certifiedAmount: 6500000, paidAmount: 4500000, dueAmount: 2000000, status: 'partially_reconciled' },
      { id: 'fr-5', vendor: 'Schneider Electric India Ltd', billedAmount: 7500000, certifiedAmount: 7500000, paidAmount: 3100000, dueAmount: 4400000, status: 'outstanding' }
    ]
  },
  [ROUTES.ADMIN_REPORTS]: {
    id: 'reports-admin',
    route: ROUTES.ADMIN_REPORTS,
    pageType: 'report',
    title: 'User Activity & Audit Trail Report',
    description: 'Administrative audit logs of user signins, workflow approvals, and system changes.',
    breadcrumbs: ['Reports', 'Admin Reports'],
    columns: [
      { key: 'logId', label: 'Log ID', type: 'mono' },
      { key: 'user', label: 'User Name', type: 'text' },
      { key: 'action', label: 'Operational Action', type: 'text' },
      { key: 'module', label: 'Module', type: 'text' },
      { key: 'target', label: 'Target Record', type: 'text' },
      { key: 'timestamp', label: 'Timestamp', type: 'date' },
      { key: 'status', label: 'Audit Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'log-1', logId: 'LOG-2026-001', user: 'Rajesh Kumar', action: 'Submitted indent for approval', module: 'Procurement', target: 'IND-2026-001', timestamp: '2026-07-24 10:30', status: 'success' },
      { id: 'log-2', logId: 'LOG-2026-002', user: 'Anita Rao', action: 'Updated vendor quotation', module: 'RFQ', target: 'RFQ-2026-002', timestamp: '2026-07-24 09:45', status: 'success' },
      { id: 'log-3', logId: 'LOG-2026-003', user: 'Sanjay Mehta', action: 'Rejected budget revision', module: 'Finance', target: 'BUD-2026-009', timestamp: '2026-07-23 17:20', status: 'warning' },
      { id: 'log-4', logId: 'LOG-2026-004', user: 'Rohan Deshmukh', action: 'Certified vendor bill', module: 'Finance', target: 'INV-2026-104', timestamp: '2026-07-23 14:10', status: 'success' },
      { id: 'log-5', logId: 'LOG-2026-005', user: 'System Admin', action: 'Role permission updated', module: 'Administration', target: 'ROLE-QS', timestamp: '2026-07-22 11:00', status: 'success' }
    ]
  },

  // ==========================================
  // 7. ADMINISTRATION
  // ==========================================
  [ROUTES.USERS]: {
    id: 'admin-users',
    route: ROUTES.USERS,
    pageType: 'list',
    title: 'System Users Directory',
    description: 'Manage active ERP user accounts, credentials, and project site assignments.',
    breadcrumbs: ['Administration', 'Users'],
    primaryAction: { label: 'Add User Account' },
    createFields: [
      { name: 'empCode', label: 'Employee ID', type: 'text', required: true, defaultValue: 'EMP-116' },
      { name: 'name', label: 'User Name', type: 'text', required: true, placeholder: 'e.g. Rahul Verma' },
      { name: 'email', label: 'Corporate Email', type: 'text', required: true, placeholder: 'rahul.v@empireinterior.in' },
      { name: 'department', label: 'Department', type: 'select', required: true, options: [{ label: 'Project Execution', value: 'Project Execution' }, { label: 'Finance & Accounts', value: 'Finance & Accounts' }] },
      { name: 'designation', label: 'Designation', type: 'text', required: true, placeholder: 'e.g. Site Billing Engineer' },
      { name: 'status', label: 'Account Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'empCode', label: 'Employee ID', type: 'mono' },
      { key: 'name', label: 'User Name', type: 'text' },
      { key: 'email', label: 'Corporate Email', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'designation', label: 'Designation', type: 'text' },
      { key: 'status', label: 'Account Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'u-1', empCode: 'EMP-101', name: 'Rajesh Kumar', email: 'rajesh.k@empireinterior.in', department: 'Project Execution', designation: 'Project Head', status: 'active' },
      { id: 'u-2', empCode: 'EMP-102', name: 'Anita Rao', email: 'anita.r@empireinterior.in', department: 'Project Execution', designation: 'Project Manager', status: 'active' }
    ]
  },
  [ROUTES.ROLES]: {
    id: 'admin-roles',
    route: ROUTES.ROLES,
    pageType: 'list',
    title: 'System Access Roles & Privilege Matrix',
    description: 'Assign module privileges, view/edit/delete flags, and approval authority.',
    breadcrumbs: ['Administration', 'Roles'],
    primaryAction: { label: 'Add Role' },
    columns: [
      { key: 'roleId', label: 'Role Key', type: 'mono' },
      { key: 'roleName', label: 'Role Name', type: 'text' },
      { key: 'description', label: 'Permissions Scope', type: 'text' },
      { key: 'userCount', label: 'Assigned Users', type: 'text', align: 'center' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'r-1', roleId: 'ROLE-ADMIN', roleName: 'System Administrator', description: 'Full system access', userCount: '3 Users', status: 'active' },
      { id: 'r-2', roleId: 'ROLE-BOARD', roleName: 'Board Approver', description: 'Signoff rights for indents, POs & budgets', userCount: '4 Users', status: 'active' }
    ]
  },
  [ROUTES.PERMISSIONS]: {
    id: 'admin-permissions',
    route: ROUTES.PERMISSIONS,
    pageType: 'list',
    title: 'Module Permission Matrix & Feature Flags',
    description: 'Granular view, create, edit, approve, and delete permissions per module.',
    breadcrumbs: ['Administration', 'Permissions'],
    columns: [
      { key: 'permId', label: 'Permission Key', type: 'mono' },
      { key: 'module', label: 'Module Scope', type: 'text' },
      { key: 'rights', label: 'Access Level', type: 'text' },
      { key: 'status', label: 'Flag Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'pm-1', permId: 'PERM-SITES-WRITE', module: 'Sites', rights: 'Create, Edit, Delete', status: 'active' },
      { id: 'pm-2', permId: 'PERM-FINANCE-APPROVE', module: 'Finance', rights: 'Disbursement Signoff', status: 'active' }
    ]
  },
  [ROUTES.SETTINGS]: {
    id: 'admin-settings',
    route: ROUTES.SETTINGS,
    pageType: 'form',
    title: 'ERP Core Preferences & System Configuration',
    description: 'Group entity details, tax settings, currency formats, and notification policies.',
    breadcrumbs: ['Administration', 'Settings'],
    sections: [
      {
        id: 'group-info',
        title: 'Empire Group Corporate Entity Information',
        fields: [
          { name: 'groupName', label: 'Corporate Group Name', type: 'text', defaultValue: 'Empire Interior Contracting Pvt Ltd' },
          { name: 'gstin', label: 'Corporate GSTIN', type: 'text', defaultValue: '29AAACE1234A1Z5' },
          { name: 'currency', label: 'Base Currency', type: 'text', defaultValue: 'INR (₹)' },
          { name: 'fiscalYear', label: 'Fiscal Year Period', type: 'text', defaultValue: 'Apr 2026 - Mar 2027' }
        ]
      }
    ]
  },

  // ==========================================
  // 8. SPECIALIZED FORMS
  // ==========================================
  '/procurement/rfqs/new': {
    id: 'form-create-rfq',
    route: '/procurement/rfqs/new',
    pageType: 'form',
    title: 'Create Request For Quotation',
    description: 'Issue material and service inquiries to empanelled vendor suppliers.',
    breadcrumbs: ['Procurement', 'RFQs', 'Create Request For Quotation'],
    sections: [
      {
        id: 'sec-rfq-details',
        title: '1. RFQ Specifications & Delivery Terms',
        fields: [
          { name: 'rfqType', label: 'RFQ Type', type: 'select', required: true, options: [{ label: 'Material Supply RFQ', value: 'Material' }, { label: 'Subcontract Labour RFQ', value: 'Labour' }] },
          { name: 'site', label: 'Project Site Location', type: 'select', required: true, options: [{ label: 'Nexus Tech Park Lobby', value: 'Nexus Tech Park' }, { label: 'Grand Hyatt Goa', value: 'Grand Hyatt Goa' }] },
          { name: 'rfqNumber', label: 'RFQ Reference #', type: 'text', required: true, defaultValue: 'RFQ-2026-088' },
          { name: 'inquiryDate', label: 'Inquiry Date', type: 'date', required: true, defaultValue: '2026-07-24' },
          { name: 'dueDate', label: 'Quotation Response Due Date', type: 'date', required: true, defaultValue: '2026-08-05' },
          { name: 'deliveryLocation', label: 'Delivery Location Address', type: 'text', required: true, defaultValue: 'Outer Ring Road Site Store, Mahadevapura' }
        ]
      },
      {
        id: 'sec-vendor-select',
        title: '2. Vendor Supplier Selection',
        fields: [
          { name: 'vendors', label: 'Select Target Vendor Suppliers (Multiple)', type: 'select', required: true, options: [{ label: 'Century Plyboards India Ltd', value: 'Century Ply' }, { label: 'Asian Paints Ltd', value: 'Asian Paints' }, { label: 'Greenlam Industries Ltd', value: 'Greenlam' }] }
        ]
      },
      {
        id: 'sec-items',
        title: '3. Material & Item Requirements',
        hasItemTable: true,
        itemTableType: 'material'
      },
      {
        id: 'sec-commercial-instructions',
        title: '4. Commercial & Tax Instructions',
        fields: [
          { name: 'taxReq', label: 'GST Requirement', type: 'select', required: true, options: [{ label: 'Inclusive of 18% GST', value: '18%' }, { label: 'Exclusive of GST', value: 'ex' }] },
          { name: 'deliveryTerms', label: 'Delivery Terms', type: 'text', defaultValue: 'FOR Site Store (Freight Paid by Supplier)' },
          { name: 'paymentTerms', label: 'Payment Terms', type: 'text', defaultValue: '30 Days Net Credit against Certified GRN' },
          { name: 'vendorInstructions', label: 'Vendor Instructions', type: 'textarea', placeholder: 'Specify brand preferences, quality test certificates required...', colSpan: 2 }
        ]
      }
    ]
  },

  '/procurement/purchase-orders/new': {
    id: 'form-create-po',
    route: '/procurement/purchase-orders/new',
    pageType: 'form',
    title: 'Create Purchase Order',
    description: 'Issue binding commercial purchase order to approved vendor supplier.',
    breadcrumbs: ['Procurement', 'Purchase Orders', 'Create Purchase Order'],
    sections: [
      {
        id: 'sec-vendor-site',
        title: '1. Vendor & Site Selection',
        fields: [
          { name: 'vendor', label: 'Vendor Supplier', type: 'select', required: true, options: [{ label: 'Asian Paints Ltd', value: 'Asian Paints' }, { label: 'Century Plyboards India Ltd', value: 'Century Ply' }] },
          { name: 'site', label: 'Project Site', type: 'select', required: true, options: [{ label: 'Nexus Tech Park Lobby', value: 'Nexus Tech Park' }] }
        ]
      },
      {
        id: 'sec-po-ref',
        title: '2. PO Reference & Dates',
        fields: [
          { name: 'poNumber', label: 'PO Reference Number', type: 'text', required: true, defaultValue: 'PO-2026-102' },
          { name: 'poDate', label: 'PO Issue Date', type: 'date', required: true, defaultValue: '2026-07-24' },
          { name: 'expectedDelivery', label: 'Expected Delivery Date', type: 'date', required: true, defaultValue: '2026-08-10' }
        ]
      },
      {
        id: 'sec-po-items',
        title: '3. Order Line Items',
        hasItemTable: true,
        itemTableType: 'material'
      },
      {
        id: 'sec-addresses',
        title: '4. Delivery & Billing Addresses',
        fields: [
          { name: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', defaultValue: 'Nexus Tech Park, Mahadevapura, Bengaluru - 560048', colSpan: 1 },
          { name: 'billingAddress', label: 'Billing Address (GSTIN: 29AAACE1234A1Z5)', type: 'textarea', defaultValue: 'Empire Interior Contracting Pvt Ltd, Indiranagar, Bengaluru', colSpan: 1 }
        ]
      },
      {
        id: 'sec-terms',
        title: '5. Payment Terms & Commercial Notes',
        fields: [
          { name: 'paymentTerms', label: 'Payment Terms', type: 'text', defaultValue: '20% Advance, 80% against Site Delivery' },
          { name: 'notes', label: 'Special Instructions / Notes', type: 'textarea', defaultValue: 'All deliveries must include batch inspection certificates.', colSpan: 2 }
        ]
      }
    ]
  },
  [ROUTES.ON_ACCOUNT_DASHBOARD]: {
    id: 'mod-on-account-dashboard',
    title: 'On-Account Dashboard',
    description: 'Centralized overview of vendor and site on-account balances, and recent transfers.',
    route: ROUTES.ON_ACCOUNT_DASHBOARD,
    pageType: 'list',
    breadcrumbs: ['Finance', 'On-Account Dashboard'],
    summaryCards: [
      { id: 'sc1', label: 'Total Vendor Balance', value: 1205000, isCurrency: true, color: 'text-brand-700' },
      { id: 'sc2', label: 'Total Site Balance', value: 3450000, isCurrency: true, color: 'text-brand-700' },
      { id: 'sc3', label: 'Transfers This Month', value: 18, color: 'text-gray-900' }
    ],
    tabs: [
      { id: 'vendors', label: 'Vendor Balances' },
      { id: 'sites', label: 'Site Balances' },
      { id: 'transactions', label: 'Recent Transactions' }
    ],
    tabColumns: {
      vendors: [
        { key: 'referenceNo', label: 'Ref No', type: 'mono' },
        { key: 'vendor', label: 'Vendor' },
        { key: 'opening', label: 'Total Received', type: 'currency' },
        { key: 'allocated', label: 'Allocated', type: 'currency' },
        { key: 'balance', label: 'Available', type: 'currency' },
        { key: 'status', label: 'Status', type: 'badge' }
      ],
      sites: [
        { key: 'referenceNo', label: 'Ref No', type: 'mono' },
        { key: 'site', label: 'Site' },
        { key: 'opening', label: 'Opening', type: 'currency' },
        { key: 'transferredIn', label: 'Transferred In', type: 'currency' },
        { key: 'transferredOut', label: 'Transferred Out', type: 'currency' },
        { key: 'balance', label: 'Available', type: 'currency' },
        { key: 'status', label: 'Status', type: 'badge' }
      ],
      transactions: [
        { key: 'referenceNo', label: 'Transaction ID', type: 'mono' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'type', label: 'Type' },
        { key: 'source', label: 'Source' },
        { key: 'destination', label: 'Destination' },
        { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
        { key: 'status', label: 'Status', type: 'badge' }
      ]
    },
    primaryAction: { label: 'New Transfer', route: '' },
    createFields: [
      { name: 'type', label: 'Transfer Type', type: 'select', required: true, options: [{ value: 'Payment', label: 'Payment' }, { value: 'Site Transfer', label: 'Site Transfer' }] },
      { name: 'source', label: 'Source', type: 'text', required: true },
      { name: 'destination', label: 'Destination', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true }
    ],
    mockRows: [
      { id: 'v1', tab: 'vendors', referenceNo: 'OAP-V1001', vendor: 'Global Trade Co', opening: 500000, allocated: 200000, balance: 300000, status: 'active' },
      { id: 'v2', tab: 'vendors', referenceNo: 'OAP-V1002', vendor: 'Apex Supplies', opening: 100000, allocated: 100000, balance: 0, status: 'completed' },
      { id: 's1', tab: 'sites', referenceNo: 'OAP-S1001', site: 'Downtown Tower', opening: 2000000, transferredIn: 500000, transferredOut: 100000, balance: 2400000, status: 'healthy' },
      { id: 's2', tab: 'sites', referenceNo: 'OAP-S1002', site: 'Riverside Complex', opening: 1000000, transferredIn: 0, transferredOut: 200000, balance: 800000, status: 'active' },
      { id: 't1', tab: 'transactions', referenceNo: 'TX-4921', date: '2024-03-24', type: 'Site Transfer', source: 'Downtown Tower', destination: 'Riverside Complex', amount: 100000, status: 'processed' },
      { id: 't2', tab: 'transactions', referenceNo: 'TX-4922', date: '2024-03-25', type: 'Payment', source: 'Bank', destination: 'Global Trade Co', amount: 500000, status: 'processed' }
    ]
  },
  [ROUTES.BUDGET_TRANSFERS]: {
    id: 'mod-budget-transfers',
    title: 'Budget Transfers',
    description: 'Relocate approved budgets between sites or categories.',
    route: ROUTES.BUDGET_TRANSFERS,
    pageType: 'list',
    breadcrumbs: ['Finance', 'Budget Transfers'],
    primaryAction: { label: 'New Transfer', route: '' },
    createFields: [
      { name: 'sourceSite', label: 'Source Site', type: 'select', required: true, options: [{ value: 'S-001', label: 'Riverside Complex' }, { value: 'S-002', label: 'Downtown Tower' }] },
      { name: 'destinationSite', label: 'Destination Site', type: 'select', required: true, options: [{ value: 'S-001', label: 'Riverside Complex' }, { value: 'S-002', label: 'Downtown Tower' }] },
      { name: 'amount', label: 'Transfer Amount', type: 'number', required: true },
      { name: 'reason', label: 'Justification', type: 'textarea', required: true }
    ],
    columns: [
      { key: 'referenceNo', label: 'Transfer ID', type: 'mono' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'sourceSite', label: 'From Site' },
      { key: 'destinationSite', label: 'To Site' },
      { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: []
  },

  [ROUTES.ACCOUNTING_INVOICES]: {
    id: 'mod-acc-invoices',
    title: 'Accounting Invoices',
    description: 'Non-inventory financial invoices logged directly against the ledger.',
    route: ROUTES.ACCOUNTING_INVOICES,
    pageType: 'list',
    breadcrumbs: ['Finance', 'Accounting Invoices'],
    primaryAction: { label: 'New Invoice', route: `${ROUTES.ACCOUNTING_INVOICES}/new` },
    columns: [
      { key: 'invoiceNo', label: 'Invoice No', type: 'mono' },
      { key: 'vendor', label: 'Vendor / Contact' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'amount', label: 'Base Amount', type: 'currency', align: 'right' },
      { key: 'tax', label: 'Taxes', type: 'currency', align: 'right' },
      { key: 'total', label: 'Total Value', type: 'currency', align: 'right' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    sections: [
      {
        id: 'acc-details',
        title: 'Invoice Registration',
        fields: [
          { name: 'invoiceNo', label: 'Invoice Reference', type: 'text', required: true },
          { name: 'vendor', label: 'Registered Contact', type: 'text', required: true },
          { name: 'date', label: 'Invoice Date', type: 'date', required: true },
          { name: 'amount', label: 'Base Amount', type: 'number', required: true },
          { name: 'tax', label: 'Calculated Tax', type: 'number', required: true }
        ]
      }
    ],
    mockRows: []
  },
  [ROUTES.CREDIT_NOTES]: {
    id: 'mod-credit-notes',
    title: 'Credit Notes',
    description: 'Adjust ledger balances reflecting amounts credited to us.',
    route: ROUTES.CREDIT_NOTES,
    pageType: 'list',
    breadcrumbs: ['Finance', 'Credit Notes'],
    primaryAction: { label: 'Issue Note', route: '' },
    createFields: [
      { name: 'reference', label: 'Against Invoice/Reference', type: 'text', required: true },
      { name: 'amount', label: 'Credit Amount', type: 'number', required: true },
      { name: 'reason', label: 'Reason for Adjustment', type: 'textarea', required: true }
    ],
    columns: [
      { key: 'cnNumber', label: 'CN Code', type: 'mono' },
      { key: 'reference', label: 'Original Ref', type: 'mono' },
      { key: 'amount', label: 'Credited Value', type: 'currency', align: 'right' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: []
  },
  [ROUTES.DEBIT_NOTES]: {
    id: 'mod-debit-notes',
    title: 'Debit Notes',
    description: 'Adjust ledger balances for additional sums charged to the party.',
    route: ROUTES.DEBIT_NOTES,
    pageType: 'list',
    breadcrumbs: ['Finance', 'Debit Notes'],
    primaryAction: { label: 'Issue Note', route: '' },
    createFields: [
      { name: 'reference', label: 'Against Invoice/Reference', type: 'text', required: true },
      { name: 'amount', label: 'Debit Amount', type: 'number', required: true },
      { name: 'reason', label: 'Reason for Adjustment', type: 'textarea', required: true }
    ],
    columns: [
      { key: 'dnNumber', label: 'DN Code', type: 'mono' },
      { key: 'reference', label: 'Original Ref', type: 'mono' },
      { key: 'amount', label: 'Debited Value', type: 'currency', align: 'right' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: []
  },
  [ROUTES.CALENDAR]: {
    id: 'overview-calendar', route: ROUTES.CALENDAR, pageType: 'list',
    title: 'Project Calendar', description: 'Corporate events and project milestones.',
    breadcrumbs: ['Overview', 'Calendar'],
    columns: [{ key: 'event', label: 'Event' }, { key: 'date', type: 'date', label: 'Date' }], mockRows: []
  },
  [ROUTES.MESSAGES]: {
    id: 'overview-messages', route: ROUTES.MESSAGES, pageType: 'list',
    title: 'Messages', description: 'Internal team communication channels.',
    breadcrumbs: ['Overview', 'Messages'],
    columns: [{ key: 'user', label: 'Acting User' }], mockRows: []
  },
  [ROUTES.DESIGNATIONS]: {
    id: 'master-designations', route: ROUTES.DESIGNATIONS, pageType: 'list',
    title: 'Designations', description: 'Employee tier titles.', breadcrumbs: ['Masters', 'Designations'],
    columns: [{ key: 'title', label: 'Title' }], mockRows: []
  },
  [ROUTES.MEASUREMENT_CONVERSIONS]: {
    id: 'master-conversions', route: ROUTES.MEASUREMENT_CONVERSIONS, pageType: 'list',
    title: 'Measurement Conversions', description: 'Global item unit scalar logics.', breadcrumbs: ['Masters', 'Conversions'],
    columns: [{ key: 'formula', label: 'Formula' }], mockRows: []
  },
  [ROUTES.BRANDS]: {
    id: 'master-brands', route: ROUTES.BRANDS, pageType: 'list',
    title: 'Approved Brands', description: 'Material manufacturing brands registry.', breadcrumbs: ['Masters', 'Brands'],
    columns: [{ key: 'brandName', label: 'Brand Name' }], mockRows: []
  },
  [ROUTES.LOCATIONS]: {
    id: 'master-locations', route: ROUTES.LOCATIONS, pageType: 'list',
    title: 'Locations', description: 'Warehousing addresses and yards.', breadcrumbs: ['Masters', 'Locations'],
    columns: [{ key: 'pin', label: 'Address' }], mockRows: []
  },
  [ROUTES.PMC]: {
    id: 'master-pmc', route: ROUTES.PMC, pageType: 'list',
    title: 'Project Mgmt. Consultants', description: 'External PMC firms validation matrices.', breadcrumbs: ['Masters', 'PMC'],
    columns: [{ key: 'firm', label: 'Consultant Firm' }], mockRows: []
  },
  [ROUTES.ARCHITECTS]: {
    id: 'master-architects', route: ROUTES.ARCHITECTS, pageType: 'list',
    title: 'Design & Architects', description: 'On-record exterior/interior consulting.', breadcrumbs: ['Masters', 'Architects'],
    columns: [{ key: 'firm', label: 'Architect Firm' }], mockRows: []
  }
};
