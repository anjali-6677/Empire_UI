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
  title?: string;
  description?: string;
  summaryCards?: SummaryCardSchema[];
  columns?: ColumnSchema[];
  mockRows?: Record<string, unknown>[];
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
      { id: '1', label: 'Active Projects', value: 4 },
      { id: '2', label: 'Total Budget Portfolio', value: 195000000, isCurrency: true },
      { id: '3', label: 'Average Completion', value: '56.7%' }
    ],
    columns: [
      { key: 'projectCode', label: 'Project Code', type: 'mono' },
      { key: 'projectName', label: 'Project Name', type: 'text' },
      { key: 'clientName', label: 'Client Entity', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'projectManagerName', label: 'Project Manager', type: 'text' },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'targetCompletionDate', label: 'Target Completion', type: 'date' },
      { key: 'approvedBudget', label: 'Approved Budget', type: 'currency', align: 'right' },
      { key: 'progressPercentage', label: 'Progress (%)', type: 'text', align: 'center' },
      { key: 'executionStatus', label: 'Execution Status', type: 'badge' }
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
  [ROUTES.ON_ACCOUNT_DASHBOARD]: {
    id: 'finance-on-account',
    route: ROUTES.ON_ACCOUNT_DASHBOARD,
    pageType: 'list',
    title: 'Vendor On-Account & Advance Management',
    description: 'Track vendor advances, site allocations, inter-site advance transfers, and available on-account balances.',
    breadcrumbs: ['Finance', 'On-Account Dashboard'],
    primaryAction: { label: 'New On-Account Payment' },
    summaryCards: [
      { id: '1', label: 'Total Vendor Available Balance', value: 550000, isCurrency: true },
      { id: '2', label: 'Total Site Available Balance', value: 550000, isCurrency: true },
      { id: '3', label: 'Transfers This Month', value: 1 }
    ],
    tabs: [
      {
        id: 'vendor_balances',
        label: 'Vendor Balances',
        title: 'Empanelled Vendor On-Account Balances',
        description: 'Vendor advance receipts, invoice allocations, transfers, and available net balances.',
        columns: [
          { key: 'vendorName', label: 'Vendor Supplier', type: 'text' },
          { key: 'siteName', label: 'Project Site', type: 'text' },
          { key: 'originalAmount', label: 'Original On-Account', type: 'currency', align: 'right' },
          { key: 'allocatedToInvoices', label: 'Allocated To Invoices', type: 'currency', align: 'right' },
          { key: 'transferredAmount', label: 'Transferred', type: 'currency', align: 'right' },
          { key: 'availableBalance', label: 'Available Balance', type: 'currency', align: 'right' },
          { key: 'lastTransactionDate', label: 'Last Transaction', type: 'date' },
          { key: 'status', label: 'Status', type: 'badge' }
        ],
        mockRows: [
          { id: 'vob-1', vendorName: 'Century Plyboards India Ltd', vendor: 'Century Plyboards India Ltd', siteName: 'Nexus Tech Park', site: 'Nexus Tech Park', originalAmount: 500000, allocatedToInvoices: 300000, transferredAmount: 0, availableBalance: 200000, lastTransactionDate: '2026-07-24', status: 'active' },
          { id: 'vob-2', vendorName: 'Asian Paints Ltd', vendor: 'Asian Paints Ltd', siteName: 'Grand Hyatt Goa', site: 'Grand Hyatt Goa', originalAmount: 400000, allocatedToInvoices: 250000, transferredAmount: 0, availableBalance: 150000, lastTransactionDate: '2026-07-22', status: 'active' },
          { id: 'vob-3', vendorName: 'Saint-Gobain India Pvt Ltd', vendor: 'Saint-Gobain India Pvt Ltd', siteName: 'Imperial Heights', site: 'Imperial Heights', originalAmount: 300000, allocatedToInvoices: 100000, transferredAmount: 0, availableBalance: 200000, lastTransactionDate: '2026-07-20', status: 'active' }
        ]
      },
      {
        id: 'site_balances',
        label: 'Site Balances',
        title: 'Project Site On-Account Fund Balances',
        description: 'Site-wise advance funds received, invoice allocations, and net transfers.',
        columns: [
          { key: 'siteName', label: 'Project Site', type: 'text' },
          { key: 'receivedAmount', label: 'Received Amount', type: 'currency', align: 'right' },
          { key: 'allocatedToInvoices', label: 'Allocated To Invoices', type: 'currency', align: 'right' },
          { key: 'transferredIn', label: 'Transferred In', type: 'currency', align: 'right' },
          { key: 'transferredOut', label: 'Transferred Out', type: 'currency', align: 'right' },
          { key: 'availableBalance', label: 'Available Balance', type: 'currency', align: 'right' },
          { key: 'lastUpdatedDate', label: 'Last Updated', type: 'date' }
        ],
        mockRows: [
          { id: 'sob-1', siteName: 'Nexus Tech Park', site: 'Nexus Tech Park', receivedAmount: 500000, allocatedToInvoices: 300000, transferredIn: 0, transferredOut: 100000, availableBalance: 100000, lastUpdatedDate: '2026-07-24' },
          { id: 'sob-2', siteName: 'Grand Hyatt Goa', site: 'Grand Hyatt Goa', receivedAmount: 400000, allocatedToInvoices: 250000, transferredIn: 100000, transferredOut: 0, availableBalance: 250000, lastUpdatedDate: '2026-07-23' },
          { id: 'sob-3', siteName: 'Imperial Heights', site: 'Imperial Heights', receivedAmount: 300000, allocatedToInvoices: 100000, transferredIn: 0, transferredOut: 0, availableBalance: 200000, lastUpdatedDate: '2026-07-20' }
        ]
      },
      {
        id: 'recent_transactions',
        label: 'Recent Transactions',
        title: 'On-Account Advance Transaction History',
        description: 'Chronological ledger of receipts, invoice allocations, and inter-site transfers.',
        columns: [
          { key: 'transactionReference', label: 'Transaction Ref', type: 'mono' },
          { key: 'transactionDate', label: 'Date', type: 'date' },
          { key: 'type', label: 'Transaction Type', type: 'text' },
          { key: 'sourceSiteName', label: 'Source', type: 'text' },
          { key: 'destinationSiteName', label: 'Destination / Invoice', type: 'text' },
          { key: 'vendorName', label: 'Vendor', type: 'text' },
          { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
          { key: 'status', label: 'Status', type: 'badge' }
        ],
        mockRows: [
          { id: 'oat-1', transactionReference: 'OAT-2026-001', transactionDate: '2026-07-24', transactionType: 'invoice_allocation', type: 'Invoice Allocation', vendorName: 'Century Plyboards India Ltd', vendor: 'Century Plyboards India Ltd', destinationSiteName: 'INV-VND-2026-001', amount: 300000, status: 'processed' },
          { id: 'oat-2', transactionReference: 'OAT-2026-002', transactionDate: '2026-07-23', transactionType: 'inter_site_transfer', type: 'Inter-Site Transfer', sourceSiteName: 'Nexus Tech Park', source: 'Nexus Tech Park', destinationSiteName: 'Grand Hyatt Goa', destination: 'Grand Hyatt Goa', vendorName: 'Century Plyboards India Ltd', vendor: 'Century Plyboards India Ltd', amount: 100000, status: 'processed' },
          { id: 'oat-3', transactionReference: 'OAT-2026-003', transactionDate: '2026-07-22', transactionType: 'receipt', type: 'On-Account Receipt', sourceSiteName: 'Grand Hyatt Goa', source: 'Grand Hyatt Goa', vendorName: 'Asian Paints Ltd', vendor: 'Asian Paints Ltd', amount: 400000, status: 'approved' }
        ]
      }
    ]
  },
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
    primaryAction: { label: 'Log Utility Bill', route: `${ROUTES.UTILITY_BILLS}/new` },
    columns: [
      { key: 'billNo', label: 'Bill Reference', type: 'mono' },
      { key: 'utilityType', label: 'Utility Category', type: 'text' },
      { key: 'provider', label: 'Utility Provider', type: 'text' },
      { key: 'site', label: 'Project Site', type: 'text' },
      { key: 'billDate', label: 'Bill Date', type: 'date' },
      { key: 'dueDate', label: 'Due Date', type: 'date' },
      { key: 'amount', label: 'Bill Amount', type: 'currency', align: 'right' },
      { key: 'approvalStatus', label: 'Approval Status', type: 'badge' },
      { key: 'allocationStatus', label: 'Allocation Status', type: 'badge' },
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
      { id: 'ub-1', billNo: 'UTIL-2026-001', utilityType: 'Temporary Site Electricity', provider: 'BESCOM Electricity Board', site: 'Nexus Tech Park Lobby Renovations', billDate: '2026-07-05', dueDate: '2026-07-20', amount: 100000, approvalStatus: 'approved', allocationStatus: 'unallocated', paymentStatus: 'unpaid' },
      { id: 'ub-2', billNo: 'UTIL-2026-002', utilityType: 'Diesel Generator Fuel Supply', provider: 'Reliance Petroleum Ltd', site: 'Grand Hyatt Executive Lounge', billDate: '2026-07-10', dueDate: '2026-07-25', amount: 145000, approvalStatus: 'approved', allocationStatus: 'fully_allocated', paymentStatus: 'paid' },
      { id: 'ub-3', billNo: 'UTIL-2026-003', utilityType: 'Site Internet & Fiber Connection', provider: 'ACT Fibernet Broadband', site: 'Imperial Heights Penthouse', billDate: '2026-07-12', dueDate: '2026-07-27', amount: 28000, approvalStatus: 'approved', allocationStatus: 'partially_allocated', paymentStatus: 'partially_paid' },
      { id: 'ub-4', billNo: 'UTIL-2026-004', utilityType: 'Water Supply Tankers', provider: 'Cauvery Water Supply Services', site: 'Phoenix Marketcity Retail Store', billDate: '2026-07-15', dueDate: '2026-07-30', amount: 65000, approvalStatus: 'pending', allocationStatus: 'unallocated', paymentStatus: 'unpaid' },
      { id: 'ub-5', billNo: 'UTIL-2026-005', utilityType: 'Site Security Guard Deployment', provider: 'Security Solutions India Pvt Ltd', site: 'Sobha City Luxury Villa', billDate: '2026-07-18', dueDate: '2026-08-02', amount: 120000, approvalStatus: 'draft', allocationStatus: 'unallocated', paymentStatus: 'unpaid' }
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
      { key: 'legalName', label: 'Legal Name', type: 'text' },
      { key: 'tradingName', label: 'Trading Name', type: 'text' },
      { key: 'gstin', label: 'GSTIN', type: 'mono' },
      { key: 'city', label: 'City', type: 'text' },
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
    id: 'reports-purchase', route: ROUTES.PURCHASE_REPORTS, pageType: 'report',
    title: 'Purchase Analytics & Procurement Intelligence', description: 'Comprehensive purchase analysis, item consumption, vendor comparisons, and material movement tracking.', breadcrumbs: ['Reports', 'Purchase Reports'],
    tabs: [
      { id: 'purchase-analysis', label: 'Purchase Analysis', title: 'Purchase Analysis', description: 'PO ordering status, received values, and pending delivery balances per site.',
        columns: [
          { key: 'poNumber', label: 'PO Number', type: 'mono' },
          { key: 'vendor', label: 'Vendor Name', type: 'text' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'poDate', label: 'PO Date', type: 'date' },
          { key: 'orderedValue', label: 'Ordered Value', type: 'currency', align: 'right' },
          { key: 'receivedValue', label: 'Received Value', type: 'currency', align: 'right' },
          { key: 'pendingValue', label: 'Pending Value', type: 'currency', align: 'right' },
          { key: 'deliveryStatus', label: 'Delivery Status', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Ordered Value', value: 168000000, isCurrency: true },
          { id: 's2', label: 'Received Material Outlay', value: 124000000, isCurrency: true },
          { id: 's3', label: 'Pending Open Deliveries', value: 44000000, isCurrency: true }
        ],
        mockRows: [
          { id: 'pa-1', poNumber: 'PO-2026-088', vendor: 'Asian Paints Ltd', site: 'Nexus Tech Park', poDate: '2026-07-02', orderedValue: 12500000, receivedValue: 12500000, pendingValue: 0, deliveryStatus: 'completed' },
          { id: 'pa-2', poNumber: 'PO-2026-092', vendor: 'Century Plyboards India Ltd', site: 'Grand Hyatt Goa', poDate: '2026-07-05', orderedValue: 28400000, receivedValue: 20000000, pendingValue: 8400000, deliveryStatus: 'partially_received' },
          { id: 'pa-3', poNumber: 'PO-2026-095', vendor: 'Saint-Gobain India Pvt Ltd', site: 'Imperial Heights', poDate: '2026-07-10', orderedValue: 18500000, receivedValue: 15000000, pendingValue: 3500000, deliveryStatus: 'partially_received' },
          { id: 'pa-4', poNumber: 'PO-2026-099', vendor: 'Greenlam Industries Ltd', site: 'Phoenix Marketcity', poDate: '2026-07-14', orderedValue: 9800000, receivedValue: 9800000, pendingValue: 0, deliveryStatus: 'completed' },
          { id: 'pa-5', poNumber: 'PO-2026-104', vendor: 'Pidilite Industries Ltd', site: 'Sobha City Luxury Villa', poDate: '2026-07-18', orderedValue: 14200000, receivedValue: 8200000, pendingValue: 6000000, deliveryStatus: 'pending' }
        ]
      },
      { id: 'item-analysis', label: 'Item Analysis', title: 'Item-wise Analysis', description: 'Item consumption rates, ordered versus consumed stock levels, and purchase values.',
        columns: [
          { key: 'itemCode', label: 'Item Code', type: 'mono' },
          { key: 'item', label: 'Material Description', type: 'text' },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'orderedQty', label: 'Ordered Qty', type: 'text', align: 'center' },
          { key: 'receivedQty', label: 'Received Qty', type: 'text', align: 'center' },
          { key: 'consumedQty', label: 'Consumed Qty', type: 'text', align: 'center' },
          { key: 'availableQty', label: 'Available Stock', type: 'text', align: 'center' },
          { key: 'unit', label: 'Unit', type: 'text' },
          { key: 'purchaseValue', label: 'Purchase Value', type: 'currency', align: 'right' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Material Consumption', value: 48500000, isCurrency: true },
          { id: 's2', label: 'Active Stock Holdings', value: 18200000, isCurrency: true }
        ],
        mockRows: [
          { id: 'ia-1', itemCode: 'PLY-BWR-19', item: 'BWR Grade Commercial Plywood 19mm', category: 'Woodwork & Joinery', orderedQty: '1,200', receivedQty: '1,200', consumedQty: '950', availableQty: '250', unit: 'Sheets', purchaseValue: 4200000 },
          { id: 'ia-2', itemCode: 'STL-FE500-12', item: 'TMT Steel Reinforcement Fe500 12mm', category: 'Civil & Structural', orderedQty: '450', receivedQty: '400', consumedQty: '380', availableQty: '20', unit: 'MT', purchaseValue: 23400000 },
          { id: 'ia-3', itemCode: 'GLS-TGH-12', item: 'Toughened Structural Glass 12mm', category: 'Glass & Glazing', orderedQty: '850', receivedQty: '750', consumedQty: '600', availableQty: '150', unit: 'Sq Mtr', purchaseValue: 9800000 },
          { id: 'ia-4', itemCode: 'PNT-ROY-WHT', item: 'Royal Emulsion White Interior Paint', category: 'Paints & Finishes', orderedQty: '600', receivedQty: '600', consumedQty: '480', availableQty: '120', unit: 'Liters', purchaseValue: 3600000 },
          { id: 'ia-5', itemCode: 'CEM-OPC-53', item: 'OPC 53 Grade Structural Cement', category: 'Civil & Structural', orderedQty: '2,500', receivedQty: '2,500', consumedQty: '2,100', availableQty: '400', unit: 'Bags', purchaseValue: 7500000 }
        ]
      },
      { id: 'vendor-vs-item', label: 'Vendor Versus Item', title: 'Vendor Versus Item Sourcing Rates', description: 'Supplier pricing comparison, rate discounts, tax rates, and final billing amounts.',
        columns: [
          { key: 'vendor', label: 'Vendor Name', type: 'text' },
          { key: 'item', label: 'Supplied Material Item', type: 'text' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'quantity', label: 'Quantity', type: 'text', align: 'center' },
          { key: 'basicRate', label: 'Basic Rate', type: 'currency', align: 'right' },
          { key: 'discount', label: 'Discount (%)', type: 'text', align: 'center' },
          { key: 'tax', label: 'GST Tax (%)', type: 'text', align: 'center' },
          { key: 'finalRate', label: 'Final Unit Rate', type: 'currency', align: 'right' },
          { key: 'finalAmount', label: 'Final Amount', type: 'currency', align: 'right' }
        ],
        summaryCards: [
          { id: 's1', label: 'Average Discount Savings', value: '7.8%' },
          { id: 's2', label: 'Total Sourced Value', value: 38200000, isCurrency: true }
        ],
        mockRows: [
          { id: 'vvi-1', vendor: 'Century Plyboards India Ltd', item: 'Marine Plywood 19mm', site: 'Nexus Tech Park', quantity: '800 Sheets', basicRate: 3200, discount: '8.0%', tax: '18%', finalRate: 3474, finalAmount: 2779200 },
          { id: 'vvi-2', vendor: 'Asian Paints Ltd', item: 'Royal Exterior Emulsion Paint', site: 'Grand Hyatt Goa', quantity: '450 Drums', basicRate: 8500, discount: '10.0%', tax: '18%', finalRate: 9027, finalAmount: 4062150 },
          { id: 'vvi-3', vendor: 'Saint-Gobain India Pvt Ltd', item: 'Acoustic Glass Panelling', site: 'Imperial Heights', quantity: '650 Sq Mtr', basicRate: 11200, discount: '5.0%', tax: '18%', finalRate: 12555, finalAmount: 8160750 },
          { id: 'vvi-4', vendor: 'Greenlam Industries Ltd', item: 'HPL Exterior Wall Cladding', site: 'Phoenix Marketcity', quantity: '1,200 Sq Ft', basicRate: 480, discount: '6.0%', tax: '18%', finalRate: 532, finalAmount: 638400 },
          { id: 'vvi-5', vendor: 'Pidilite Industries Ltd', item: 'Fevicol SH Waterproof Adhesive', site: 'Sobha City Luxury Villa', quantity: '120 Tins', basicRate: 14500, discount: '12.0%', tax: '18%', finalRate: 15057, finalAmount: 1806840 }
        ]
      },
      { id: 'transfer-log', label: 'Transfer Log', title: 'Inter-Site Material Transfer Log', description: 'Logistics tracking for stock transferred between active construction yards and sites.',
        columns: [
          { key: 'transferRef', label: 'Transfer Ref', type: 'mono' },
          { key: 'date', label: 'Transfer Date', type: 'date' },
          { key: 'item', label: 'Transferred Material Item', type: 'text' },
          { key: 'sourceSite', label: 'Source Yard / Site', type: 'text' },
          { key: 'destinationSite', label: 'Destination Site', type: 'text' },
          { key: 'quantity', label: 'Quantity', type: 'text', align: 'center' },
          { key: 'unit', label: 'Unit', type: 'text' },
          { key: 'status', label: 'Transfer Status', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'Completed Transfers', value: 42 },
          { id: 's2', label: 'In-Transit Shipments', value: 3 }
        ],
        mockRows: [
          { id: 'tl-1', transferRef: 'TRX-2026-012', date: '2026-07-08', item: 'BWR Commercial Plywood 19mm', sourceSite: 'Peenya Central Warehouse', destinationSite: 'Nexus Tech Park', quantity: '300', unit: 'Sheets', status: 'delivered' },
          { id: 'tl-2', transferRef: 'TRX-2026-015', date: '2026-07-12', item: 'TMT Steel Fe500 12mm', sourceSite: 'Whitefield Site Yard', destinationSite: 'Grand Hyatt Goa', quantity: '45', unit: 'MT', status: 'delivered' },
          { id: 'tl-3', transferRef: 'TRX-2026-018', date: '2026-07-15', item: 'Toughened Glass 12mm', sourceSite: 'Peenya Central Warehouse', destinationSite: 'Imperial Heights', quantity: '200', unit: 'Sq Mtr', status: 'in_transit' },
          { id: 'tl-4', transferRef: 'TRX-2026-021', date: '2026-07-19', item: 'Royal Emulsion White Paint', sourceSite: 'Bhiwandi Regional Godown', destinationSite: 'Phoenix Marketcity', quantity: '150', unit: 'Liters', status: 'delivered' },
          { id: 'tl-5', transferRef: 'TRX-2026-024', date: '2026-07-22', item: 'OPC 53 Cement Bags', sourceSite: 'Peenya Central Warehouse', destinationSite: 'Sobha City Luxury Villa', quantity: '500', unit: 'Bags', status: 'scheduled' }
        ]
      },
      { id: 'consumption-log', label: 'Consumption Log', title: 'Site Material Consumption & Burn Tracking', description: 'Stock depletion rates, opening balances, daily usage, and closing inventory.',
        columns: [
          { key: 'consumptionRef', label: 'Log Ref', type: 'mono' },
          { key: 'date', label: 'Log Date', type: 'date' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'item', label: 'Material Description', type: 'text' },
          { key: 'openingQty', label: 'Opening Qty', type: 'text', align: 'center' },
          { key: 'consumedQty', label: 'Consumed Qty', type: 'text', align: 'center' },
          { key: 'closingQty', label: 'Closing Qty', type: 'text', align: 'center' },
          { key: 'usedFor', label: 'Execution Milestone / Area', type: 'text' }
        ],
        summaryCards: [
          { id: 's1', label: 'Daily Average Burn Value', value: 1450000, isCurrency: true },
          { id: 's2', label: 'Efficiency Index', value: '98.2%' }
        ],
        mockRows: [
          { id: 'cl-1', consumptionRef: 'CON-2026-101', date: '2026-07-12', site: 'Nexus Tech Park', item: 'BWR Grade Plywood 19mm', openingQty: '550', consumedQty: '120', closingQty: '430', usedFor: 'Executive Boardroom Panelling' },
          { id: 'cl-2', consumptionRef: 'CON-2026-104', date: '2026-07-15', site: 'Grand Hyatt Goa', item: 'TMT Steel Fe500 12mm', openingQty: '180', consumedQty: '35', closingQty: '145', usedFor: 'Banquet Hall Column Foundation' },
          { id: 'cl-3', consumptionRef: 'CON-2026-108', date: '2026-07-18', site: 'Imperial Heights', item: 'Toughened Glass 12mm', openingQty: '320', consumedQty: '75', closingQty: '245', usedFor: 'Facade Glazing Level 14' },
          { id: 'cl-4', consumptionRef: 'CON-2026-112', date: '2026-07-20', site: 'Phoenix Marketcity', item: 'Royal Interior Paint White', openingQty: '240', consumedQty: '80', closingQty: '160', usedFor: 'Anchor Store Primer Layer' },
          { id: 'cl-5', consumptionRef: 'CON-2026-115', date: '2026-07-23', site: 'Sobha City Luxury Villa', item: 'OPC 53 Structural Cement', openingQty: '800', consumedQty: '150', closingQty: '650', usedFor: 'Compound Wall Plastering' }
        ]
      }
    ]
  },
  [ROUTES.BUDGET_REPORTS]: {
    id: 'reports-budget', route: ROUTES.BUDGET_REPORTS, pageType: 'report',
    title: 'Budget Analytics & Cost Variance Intelligence', description: 'Capex budgets, vendor allocation limits, category splits, and savings analysis.', breadcrumbs: ['Reports', 'Budget Reports'],
    tabs: [
      { id: 'all-project', label: 'All Project Budget', title: 'All Project Budget Portfolio', description: 'Approved limits, committed contracts, actual spend, and available balances across all active sites.',
        columns: [
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'appBudget', label: 'Approved Budget', type: 'currency', align: 'right' },
          { key: 'revisedBudget', label: 'Revised Budget', type: 'currency', align: 'right' },
          { key: 'committed', label: 'Committed Amount', type: 'currency', align: 'right' },
          { key: 'actualSpend', label: 'Actual Outlay', type: 'currency', align: 'right' },
          { key: 'available', label: 'Available Balance', type: 'currency', align: 'right' },
          { key: 'utilization', label: 'Utilization (%)', type: 'text', align: 'center' },
          { key: 'status', label: 'Budget Health', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Approved Portfolio', value: 248000000, isCurrency: true },
          { id: 's2', label: 'Total Actual Outlay', value: 145000000, isCurrency: true },
          { id: 's3', label: 'Available Portfolio Balance', value: 103000000, isCurrency: true }
        ],
        mockRows: [
          { id: 'apb-1', site: 'Nexus Tech Park', appBudget: 50000000, revisedBudget: 52000000, committed: 35000000, actualSpend: 22000000, available: 30000000, utilization: '42.3%', status: 'healthy' },
          { id: 'apb-2', site: 'Grand Hyatt Goa', appBudget: 120000000, revisedBudget: 120000000, committed: 85000000, actualSpend: 68000000, available: 52000000, utilization: '56.7%', status: 'healthy' },
          { id: 'apb-3', site: 'Imperial Heights', appBudget: 65000000, revisedBudget: 65000000, committed: 48000000, actualSpend: 36000000, available: 29000000, utilization: '55.4%', status: 'healthy' },
          { id: 'apb-4', site: 'Phoenix Marketcity', appBudget: 18000000, revisedBudget: 18000000, committed: 17200000, actualSpend: 15000000, available: 3000000, utilization: '83.3%', status: 'near_limit' },
          { id: 'apb-5', site: 'Sobha City Luxury Villa', appBudget: 42000000, revisedBudget: 42000000, committed: 31000000, actualSpend: 24000000, available: 18000000, utilization: '57.1%', status: 'healthy' }
        ]
      },
      { id: 'vendor-budget', label: 'Vendor Budget', title: 'Vendor Budget Allocation & Commitment Thresholds', description: 'Vendor cap limits, PO commitments, invoice billing, and remaining allocation caps.',
        columns: [
          { key: 'vendor', label: 'Vendor Supplier', type: 'text' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'appAllocation', label: 'Approved Allocation', type: 'currency', align: 'right' },
          { key: 'poCommitment', label: 'PO Commitment', type: 'currency', align: 'right' },
          { key: 'invoiceAmount', label: 'Invoice Amount', type: 'currency', align: 'right' },
          { key: 'paidAmount', label: 'Paid Amount', type: 'currency', align: 'right' },
          { key: 'remainingAlloc', label: 'Remaining Cap', type: 'currency', align: 'right' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Vendor Allocations', value: 85000000, isCurrency: true },
          { id: 's2', label: 'Total Vendor Disbursements', value: 48000000, isCurrency: true }
        ],
        mockRows: [
          { id: 'vb-1', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', appAllocation: 25000000, poCommitment: 21000000, invoiceAmount: 16500000, paidAmount: 14000000, remainingAlloc: 8500000 },
          { id: 'vb-2', vendor: 'Asian Paints Ltd', site: 'Grand Hyatt Goa', appAllocation: 18000000, poCommitment: 15400000, invoiceAmount: 12800000, paidAmount: 11000000, remainingAlloc: 5200000 },
          { id: 'vb-3', vendor: 'Saint-Gobain India Pvt Ltd', site: 'Imperial Heights', appAllocation: 22000000, poCommitment: 18500000, invoiceAmount: 14200000, paidAmount: 12500000, remainingAlloc: 7800000 },
          { id: 'vb-4', vendor: 'Greenlam Industries Ltd', site: 'Phoenix Marketcity', appAllocation: 12000000, poCommitment: 9800000, invoiceAmount: 8400000, paidAmount: 7200000, remainingAlloc: 3600000 },
          { id: 'vb-5', vendor: 'Pidilite Industries Ltd', site: 'Sobha City Luxury Villa', appAllocation: 8000000, poCommitment: 6500000, invoiceAmount: 5200000, paidAmount: 4800000, remainingAlloc: 2800000 }
        ]
      },
      { id: 'project-budget', label: 'Project Budget', title: 'Project Specific Category Budget Controls', description: 'Phase-wise cost bounds, transfers in/out, committed spend, and remaining balance.',
        columns: [
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'category', label: 'Budget Category', type: 'text' },
          { key: 'appAmount', label: 'Approved Amount', type: 'currency', align: 'right' },
          { key: 'transferredIn', label: 'Transferred In', type: 'currency', align: 'right' },
          { key: 'transferredOut', label: 'Transferred Out', type: 'currency', align: 'right' },
          { key: 'committed', label: 'Committed Amount', type: 'currency', align: 'right' },
          { key: 'actualSpend', label: 'Actual Spend', type: 'currency', align: 'right' },
          { key: 'available', label: 'Available Balance', type: 'currency', align: 'right' }
        ],
        summaryCards: [
          { id: 's1', label: 'Category Outlay Total', value: 114000000, isCurrency: true },
          { id: 's2', label: 'Inter-Budget Transfers Net', value: 0, isCurrency: true }
        ],
        mockRows: [
          { id: 'pb-1', site: 'Nexus Tech Park', category: 'Raw Materials & Joinery', appAmount: 30000000, transferredIn: 2500000, transferredOut: 0, committed: 24000000, actualSpend: 18000000, available: 14500000 },
          { id: 'pb-2', site: 'Grand Hyatt Goa', category: 'Subcontractor Labour', appAmount: 45000000, transferredIn: 0, transferredOut: 2000000, committed: 38000000, actualSpend: 31000000, available: 12000000 },
          { id: 'pb-3', site: 'Imperial Heights', category: 'MEP & Facade Fitting', appAmount: 25000000, transferredIn: 1500000, transferredOut: 0, committed: 19500000, actualSpend: 15000000, available: 11500000 },
          { id: 'pb-4', site: 'Phoenix Marketcity', category: 'Site Utilities & Genset', appAmount: 8000000, transferredIn: 0, transferredOut: 1000000, committed: 6500000, actualSpend: 5400000, available: 1600000 },
          { id: 'pb-5', site: 'Sobha City Luxury Villa', category: 'Interior Finishes & Paint', appAmount: 18000000, transferredIn: 500000, transferredOut: 0, committed: 14000000, actualSpend: 11000000, available: 7500000 }
        ]
      },
      { id: 'budget-summary', label: 'Budget Summary', title: 'Budget Summary & Expenditure Breakdown', description: 'Comprehensive site budget distribution across Material, Labour, Utility, Salary, and Overheads.',
        columns: [
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'materialBudget', label: 'Material Budget', type: 'currency', align: 'right' },
          { key: 'labourBudget', label: 'Labour Budget', type: 'currency', align: 'right' },
          { key: 'utilityBudget', label: 'Utility Budget', type: 'currency', align: 'right' },
          { key: 'salaryBudget', label: 'Salary Budget', type: 'currency', align: 'right' },
          { key: 'overheadBudget', label: 'Overhead Budget', type: 'currency', align: 'right' },
          { key: 'totalApproved', label: 'Total Approved', type: 'currency', align: 'right' },
          { key: 'totalConsumed', label: 'Total Consumed', type: 'currency', align: 'right' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Material Capex', value: 125000000, isCurrency: true },
          { id: 's2', label: 'Total Operational Outlay', value: 92000000, isCurrency: true }
        ],
        mockRows: [
          { id: 'bs-1', site: 'Nexus Tech Park', materialBudget: 28000000, labourBudget: 12000000, utilityBudget: 3500000, salaryBudget: 4500000, overheadBudget: 2000000, totalApproved: 50000000, totalConsumed: 32000000 },
          { id: 'bs-2', site: 'Grand Hyatt Goa', materialBudget: 68000000, labourBudget: 32000000, utilityBudget: 8500000, salaryBudget: 7500000, overheadBudget: 4000000, totalApproved: 120000000, totalConsumed: 78000000 },
          { id: 'bs-3', site: 'Imperial Heights', materialBudget: 36000000, labourBudget: 18000000, utilityBudget: 4500000, salaryBudget: 5500000, overheadBudget: 3000000, totalApproved: 65000000, totalConsumed: 41000000 },
          { id: 'bs-4', site: 'Phoenix Marketcity', materialBudget: 9500000, labourBudget: 4800000, utilityBudget: 1500000, salaryBudget: 1400000, overheadBudget: 800000, totalApproved: 18000000, totalConsumed: 13200000 },
          { id: 'bs-5', site: 'Sobha City Luxury Villa', materialBudget: 22000000, labourBudget: 11000000, utilityBudget: 3000000, salaryBudget: 4000000, overheadBudget: 2000000, totalApproved: 42000000, totalConsumed: 26000000 }
        ]
      },
      { id: 'savings-analysis', label: 'Savings Analysis', title: 'Procurement Negotiations & Cost Savings Analysis', description: 'Tracking estimated procurement targets against finalized vendor quotes and actual purchase amounts.',
        columns: [
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'itemCategory', label: 'Item / Material Category', type: 'text' },
          { key: 'estimatedAmt', label: 'Estimated Budget', type: 'currency', align: 'right' },
          { key: 'finalizedAmt', label: 'Finalized Quote', type: 'currency', align: 'right' },
          { key: 'actualPurchase', label: 'Actual Purchase', type: 'currency', align: 'right' },
          { key: 'savingAmount', label: 'Saving Amount', type: 'currency', align: 'right' },
          { key: 'savingPct', label: 'Saving Percentage', type: 'text', align: 'center' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Cost Savings Achieved', value: 14800000, isCurrency: true },
          { id: 's2', label: 'Average Savings Yield', value: '11.4%' }
        ],
        mockRows: [
          { id: 'sa-1', site: 'Nexus Tech Park', itemCategory: 'Marine Plywood & Joinery', estimatedAmt: 28000000, finalizedAmt: 25400000, actualPurchase: 24800000, savingAmount: 3200000, savingPct: '11.4%' },
          { id: 'sa-2', site: 'Grand Hyatt Goa', itemCategory: 'Structural Steel Fe500', estimatedAmt: 45000000, finalizedAmt: 41000000, actualPurchase: 39500000, savingAmount: 5500000, savingPct: '12.2%' },
          { id: 'sa-3', site: 'Imperial Heights', itemCategory: 'Acoustic Facade Glazing', estimatedAmt: 22000000, finalizedAmt: 19800000, actualPurchase: 19400000, savingAmount: 2600000, savingPct: '11.8%' },
          { id: 'sa-4', site: 'Phoenix Marketcity', itemCategory: 'HPL Wall Cladding', estimatedAmt: 8500000, finalizedAmt: 7800000, actualPurchase: 7600000, savingAmount: 900000, savingPct: '10.6%' },
          { id: 'sa-5', site: 'Sobha City Luxury Villa', itemCategory: 'Premium Interior Paints', estimatedAmt: 14000000, finalizedAmt: 11800000, actualPurchase: 11400000, savingAmount: 2600000, savingPct: '18.6%' }
        ]
      }
    ]
  },
  [ROUTES.FINANCE_REPORTS]: {
    id: 'reports-finance', route: ROUTES.FINANCE_REPORTS, pageType: 'report',
    title: 'Finance Analytics & Treasury Reconciliation', description: 'Bill payment summaries, net payables, invoice analysis, fund flows, vendor liabilities, and T-account ledgers.', breadcrumbs: ['Reports', 'Finance Reports'],
    tabs: [
      { id: 'bill-payment', label: 'Bill Payment Summary', title: 'Bill Payment Summary & Disbursement Ledger', description: 'Consolidated tracking of certified vendor bills versus total payments disbursed.',
        columns: [
          { key: 'vendor', label: 'Vendor Supplier', type: 'text' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'totalBilled', label: 'Total Invoiced', type: 'currency', align: 'right' },
          { key: 'totalCertified', label: 'Total Certified', type: 'currency', align: 'right' },
          { key: 'totalPaid', label: 'Total Disbursed', type: 'currency', align: 'right' },
          { key: 'outstanding', label: 'Outstanding Balance', type: 'currency', align: 'right' },
          { key: 'overdue', label: 'Overdue Amount', type: 'currency', align: 'right' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Certified Bills', value: 92400000, isCurrency: true },
          { id: 's2', label: 'Total Payments Settled', value: 76500000, isCurrency: true },
          { id: 's3', label: 'Total Creditor Outstandings', value: 15900000, isCurrency: true }
        ],
        mockRows: [
          { id: 'bp-1', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', totalBilled: 22500000, totalCertified: 21000000, totalPaid: 18500000, outstanding: 2500000, overdue: 0 },
          { id: 'bp-2', vendor: 'Asian Paints Ltd', site: 'Grand Hyatt Goa', totalBilled: 16800000, totalCertified: 15400000, totalPaid: 13200000, outstanding: 2200000, overdue: 500000 },
          { id: 'bp-3', vendor: 'Saint-Gobain India Pvt Ltd', site: 'Imperial Heights', totalBilled: 28900000, totalCertified: 26500000, totalPaid: 21000000, outstanding: 5500000, overdue: 1200000 },
          { id: 'bp-4', vendor: 'Greenlam Industries Ltd', site: 'Phoenix Marketcity', totalBilled: 11400000, totalCertified: 10800000, totalPaid: 9500000, outstanding: 1300000, overdue: 0 },
          { id: 'bp-5', vendor: 'Pidilite Industries Ltd', site: 'Sobha City Luxury Villa', totalBilled: 19200000, totalCertified: 18700000, totalPaid: 14300000, outstanding: 4400000, overdue: 800000 }
        ]
      },
      { id: 'net-amount', label: 'Net Amount', title: 'Net Financial Position & Liquidity Overview', description: 'Net balance statement mapping Client Billings, Receipts, Vendor Liabilities, and Utility/Salary Outlays.',
        columns: [
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'clientBilling', label: 'Client Billing', type: 'currency', align: 'right' },
          { key: 'clientReceipts', label: 'Client Receipts', type: 'currency', align: 'right' },
          { key: 'vendorInvoices', label: 'Vendor Bills', type: 'currency', align: 'right' },
          { key: 'vendorPayments', label: 'Vendor Disbursals', type: 'currency', align: 'right' },
          { key: 'utilitySalary', label: 'Utilities & Salaries', type: 'currency', align: 'right' },
          { key: 'netPosition', label: 'Net Liquidity Position', type: 'currency', align: 'right' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Client Receipts', value: 148000000, isCurrency: true },
          { id: 's2', label: 'Total Operating Expenses', value: 108500000, isCurrency: true },
          { id: 's3', label: 'Net Cash Reserve', value: 39500000, isCurrency: true }
        ],
        mockRows: [
          { id: 'na-1', site: 'Nexus Tech Park', clientBilling: 45000000, clientReceipts: 38000000, vendorInvoices: 22000000, vendorPayments: 18500000, utilitySalary: 3800000, netPosition: 15700000 },
          { id: 'na-2', site: 'Grand Hyatt Goa', clientBilling: 95000000, clientReceipts: 82000000, vendorInvoices: 52000000, vendorPayments: 45000000, utilitySalary: 8200000, netPosition: 28800000 },
          { id: 'na-3', site: 'Imperial Heights', clientBilling: 58000000, clientReceipts: 46000000, vendorInvoices: 34000000, vendorPayments: 28000000, utilitySalary: 5100000, netPosition: 12900000 },
          { id: 'na-4', site: 'Phoenix Marketcity', clientBilling: 16000000, clientReceipts: 14500000, vendorInvoices: 10500000, vendorPayments: 9500000, utilitySalary: 1800000, netPosition: 3200000 },
          { id: 'na-5', site: 'Sobha City Luxury Villa', clientBilling: 38000000, clientReceipts: 31000000, vendorInvoices: 21000000, vendorPayments: 17500000, utilitySalary: 3500000, netPosition: 10000000 }
        ]
      },
      { id: 'invoice-analysis', label: 'Invoice Analysis', title: 'Vendor Invoice Verification & Audit Trail', description: 'Detailed breakdown of active invoices, GST amounts, certified values, and audit status.',
        columns: [
          { key: 'invoiceNo', label: 'Invoice No', type: 'mono' },
          { key: 'vendor', label: 'Vendor Supplier', type: 'text' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'invoiceDate', label: 'Invoice Date', type: 'date' },
          { key: 'dueDate', label: 'Due Date', type: 'date' },
          { key: 'grossAmount', label: 'Gross Amount', type: 'currency', align: 'right' },
          { key: 'certifiedAmount', label: 'Certified Amount', type: 'currency', align: 'right' },
          { key: 'paidAmount', label: 'Paid Amount', type: 'currency', align: 'right' },
          { key: 'outstandingAmount', label: 'Outstanding', type: 'currency', align: 'right' },
          { key: 'status', label: 'Approval Status', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'Invoices In Verification', value: 24 },
          { id: 's2', label: 'Total Invoiced Liabilities', value: 38500000, isCurrency: true }
        ],
        mockRows: [
          { id: 'ia-1', invoiceNo: 'INV-2026-401', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', invoiceDate: '2026-07-04', dueDate: '2026-08-04', grossAmount: 4800000, certifiedAmount: 4800000, paidAmount: 4800000, outstandingAmount: 0, status: 'approved' },
          { id: 'ia-2', invoiceNo: 'INV-2026-408', vendor: 'Asian Paints Ltd', site: 'Grand Hyatt Goa', invoiceDate: '2026-07-08', dueDate: '2026-08-08', grossAmount: 6200000, certifiedAmount: 5900000, paidAmount: 4000000, outstandingAmount: 1900000, status: 'approved' },
          { id: 'ia-3', invoiceNo: 'INV-2026-415', vendor: 'Saint-Gobain India Pvt Ltd', site: 'Imperial Heights', invoiceDate: '2026-07-12', dueDate: '2026-08-12', grossAmount: 9500000, certifiedAmount: 9500000, paidAmount: 6000000, outstandingAmount: 3500000, status: 'partially_paid' },
          { id: 'ia-4', invoiceNo: 'INV-2026-422', vendor: 'Greenlam Industries Ltd', site: 'Phoenix Marketcity', invoiceDate: '2026-07-16', dueDate: '2026-08-16', grossAmount: 2400000, certifiedAmount: 2400000, paidAmount: 2400000, outstandingAmount: 0, status: 'approved' },
          { id: 'ia-5', invoiceNo: 'INV-2026-429', vendor: 'Pidilite Industries Ltd', site: 'Sobha City Luxury Villa', invoiceDate: '2026-07-20', dueDate: '2026-08-20', grossAmount: 3800000, certifiedAmount: 3500000, paidAmount: 0, outstandingAmount: 3500000, status: 'pending' }
        ]
      },
      { id: 'payment-analysis', label: 'Payment Analysis', title: 'Disbursal Payment Method & Banking Analysis', description: 'Banking transaction channels, requested amounts, approved disbursals, and settlement speed.',
        columns: [
          { key: 'paymentRef', label: 'Payment Ref', type: 'mono' },
          { key: 'vendor', label: 'Payee / Vendor', type: 'text' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'paymentDate', label: 'Payment Date', type: 'date' },
          { key: 'paymentMode', label: 'Payment Mode', type: 'text' },
          { key: 'requestedAmount', label: 'Requested Amt', type: 'currency', align: 'right' },
          { key: 'approvedAmount', label: 'Approved Amt', type: 'currency', align: 'right' },
          { key: 'paidAmount', label: 'Paid Disbursal', type: 'currency', align: 'right' },
          { key: 'status', label: 'Payment Status', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Disbursed Cashflow', value: 68400000, isCurrency: true },
          { id: 's2', label: 'Bank NEFT/RTGS Ratio', value: '94.5%' }
        ],
        mockRows: [
          { id: 'pa-1', paymentRef: 'PAY-2026-801', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', paymentDate: '2026-07-06', paymentMode: 'HDFC Bank RTGS', requestedAmount: 4800000, approvedAmount: 4800000, paidAmount: 4800000, status: 'completed' },
          { id: 'pa-2', paymentRef: 'PAY-2026-805', vendor: 'Asian Paints Ltd', site: 'Grand Hyatt Goa', paymentDate: '2026-07-10', paymentMode: 'ICICI Bank NEFT', requestedAmount: 4000000, approvedAmount: 4000000, paidAmount: 4000000, status: 'completed' },
          { id: 'pa-3', paymentRef: 'PAY-2026-810', vendor: 'Saint-Gobain India Pvt Ltd', site: 'Imperial Heights', paymentDate: '2026-07-15', paymentMode: 'HDFC Bank RTGS', requestedAmount: 6000000, approvedAmount: 6000000, paidAmount: 6000000, status: 'completed' },
          { id: 'pa-4', paymentRef: 'PAY-2026-814', vendor: 'Greenlam Industries Ltd', site: 'Phoenix Marketcity', paymentDate: '2026-07-18', paymentMode: 'SBI Corporate Transfer', requestedAmount: 2400000, approvedAmount: 2400000, paidAmount: 2400000, status: 'completed' },
          { id: 'pa-5', paymentRef: 'PAY-2026-820', vendor: 'Pidilite Industries Ltd', site: 'Sobha City Luxury Villa', paymentDate: '2026-07-22', paymentMode: 'HDFC Bank Cheque', requestedAmount: 3500000, approvedAmount: 3500000, paidAmount: 0, status: 'pending' }
        ]
      },
      { id: 'fund-flow', label: 'Fund Flow', title: 'Corporate Treasury & Monthly Fund Flow Statement', description: 'Month-on-month capital inflows, operational outflows, utility expenses, and net treasury reserves.',
        columns: [
          { key: 'month', label: 'Billing Period', type: 'text' },
          { key: 'openingBalance', label: 'Opening Treasury', type: 'currency', align: 'right' },
          { key: 'clientReceipts', label: 'Client Inflows', type: 'currency', align: 'right' },
          { key: 'vendorPayments', label: 'Vendor Outflows', type: 'currency', align: 'right' },
          { key: 'utilityPayments', label: 'Utility Outlays', type: 'currency', align: 'right' },
          { key: 'salaryPayments', label: 'Salary Outlays', type: 'currency', align: 'right' },
          { key: 'transfers', label: 'Inter-Site Transfers', type: 'currency', align: 'right' },
          { key: 'closingBalance', label: 'Closing Reserves', type: 'currency', align: 'right' }
        ],
        summaryCards: [
          { id: 's1', label: 'Net Monthly Surplus', value: 18500000, isCurrency: true },
          { id: 's2', label: 'Treasury Reserve Cover', value: '4.2 Months' }
        ],
        mockRows: [
          { id: 'ff-1', month: 'March 2026', openingBalance: 12000000, clientReceipts: 35000000, vendorPayments: 22000000, utilityPayments: 1800000, salaryPayments: 2500000, transfers: 500000, closingBalance: 20200000 },
          { id: 'ff-2', month: 'April 2026', openingBalance: 20200000, clientReceipts: 42000000, vendorPayments: 28000000, utilityPayments: 2100000, salaryPayments: 2800000, transfers: 0, closingBalance: 29300000 },
          { id: 'ff-3', month: 'May 2026', openingBalance: 29300000, clientReceipts: 38000000, vendorPayments: 25000000, utilityPayments: 1900000, salaryPayments: 2600000, transfers: -800000, closingBalance: 37000000 },
          { id: 'ff-4', month: 'June 2026', openingBalance: 37000000, clientReceipts: 48000000, vendorPayments: 31000000, utilityPayments: 2400000, salaryPayments: 3100000, transfers: 0, closingBalance: 48500000 },
          { id: 'ff-5', month: 'July 2026', openingBalance: 48500000, clientReceipts: 52000000, vendorPayments: 34000000, utilityPayments: 2600000, salaryPayments: 3400000, transfers: 1200000, closingBalance: 61700000 }
        ]
      },
      { id: 'vendor-liab', label: 'Vendor Liability', title: 'Vendor Creditor Liability Exposure Ledger', description: 'Vendor account balances, certified bill totals, retention money held, and aging outstanding debt.',
        columns: [
          { key: 'vendor', label: 'Vendor Supplier', type: 'text' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'certifiedAmount', label: 'Certified Billing', type: 'currency', align: 'right' },
          { key: 'paidAmount', label: 'Total Disbursed', type: 'currency', align: 'right' },
          { key: 'retentionHeld', label: 'Retention (5%)', type: 'currency', align: 'right' },
          { key: 'outstandingAmount', label: 'Net Outstanding', type: 'currency', align: 'right' },
          { key: 'overdueAmount', label: 'Overdue >30 Days', type: 'currency', align: 'right' },
          { key: 'liabilityStatus', label: 'Exposure Risk', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total Retention Fund Held', value: 8400000, isCurrency: true },
          { id: 's2', label: 'Critical Debt Exposure', value: 2500000, isCurrency: true }
        ],
        mockRows: [
          { id: 'vl-1', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', certifiedAmount: 21000000, paidAmount: 18500000, retentionHeld: 1050000, outstandingAmount: 2500000, overdueAmount: 0, liabilityStatus: 'healthy' },
          { id: 'vl-2', vendor: 'Asian Paints Ltd', site: 'Grand Hyatt Goa', certifiedAmount: 15400000, paidAmount: 13200000, retentionHeld: 770000, outstandingAmount: 2200000, overdueAmount: 500000, liabilityStatus: 'healthy' },
          { id: 'vl-3', vendor: 'Saint-Gobain India Pvt Ltd', site: 'Imperial Heights', certifiedAmount: 26500000, paidAmount: 21000000, retentionHeld: 1325000, outstandingAmount: 5500000, overdueAmount: 1200000, liabilityStatus: 'near_limit' },
          { id: 'vl-4', vendor: 'Greenlam Industries Ltd', site: 'Phoenix Marketcity', certifiedAmount: 10800000, paidAmount: 9500000, retentionHeld: 540000, outstandingAmount: 1300000, overdueAmount: 0, liabilityStatus: 'healthy' },
          { id: 'vl-5', vendor: 'Pidilite Industries Ltd', site: 'Sobha City Luxury Villa', certifiedAmount: 18700000, paidAmount: 14300000, retentionHeld: 935000, outstandingAmount: 4400000, overdueAmount: 800000, liabilityStatus: 'healthy' }
        ]
      },
      { id: 'account-close', label: 'Vendor Account Closure', title: 'Vendor Account Closure & Final Reconciliation', description: 'Final contract reconciliation, debit/credit notes offset, retention release, and account closure certificates.',
        columns: [
          { key: 'vendor', label: 'Vendor Supplier', type: 'text' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'contractValue', label: 'Total PO Value', type: 'currency', align: 'right' },
          { key: 'totalBilled', label: 'Final Billing', type: 'currency', align: 'right' },
          { key: 'debitNotes', label: 'Debit Notes', type: 'currency', align: 'right' },
          { key: 'creditNotes', label: 'Credit Notes', type: 'currency', align: 'right' },
          { key: 'finalBalance', label: 'Final Settlement', type: 'currency', align: 'right' },
          { key: 'closureStatus', label: 'Closure Status', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'Reconciled Accounts', value: 18 },
          { id: 's2', label: 'Pending Final Releases', value: 4 }
        ],
        mockRows: [
          { id: 'ac-1', vendor: 'Bosch Power Tools Ltd', site: 'Nexus Tech Park', contractValue: 4500000, totalBilled: 4500000, debitNotes: 50000, creditNotes: 0, finalBalance: 0, closureStatus: 'completed' },
          { id: 'ac-2', vendor: 'Schneider Electric India', site: 'Grand Hyatt Goa', contractValue: 12800000, totalBilled: 12500000, debitNotes: 150000, creditNotes: 0, finalBalance: 0, closureStatus: 'completed' },
          { id: 'ac-3', vendor: 'Kirloskar Brothers Ltd', site: 'Imperial Heights', contractValue: 6200000, totalBilled: 6200000, debitNotes: 0, creditNotes: 100000, finalBalance: 100000, closureStatus: 'pending' },
          { id: 'ac-4', vendor: 'Havells India Ltd', site: 'Phoenix Marketcity', contractValue: 8500000, totalBilled: 8500000, debitNotes: 200000, creditNotes: 0, finalBalance: 0, closureStatus: 'completed' },
          { id: 'ac-5', vendor: 'Godrej & Boyce Mfg Ltd', site: 'Sobha City Luxury Villa', contractValue: 3400000, totalBilled: 3400000, debitNotes: 0, creditNotes: 0, finalBalance: 0, closureStatus: 'completed' }
        ]
      },
      { id: 'vendor-ledger', label: 'Vendor Ledger', title: 'Vendor General Ledger T-Account Transactions', description: 'Itemized debit/credit entries, opening balances, payment vouchers, and running account balances.',
        columns: [
          { key: 'date', label: 'Transaction Date', type: 'date' },
          { key: 'vendor', label: 'Vendor Name', type: 'text' },
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'transactionRef', label: 'Voucher Ref', type: 'mono' },
          { key: 'transactionType', label: 'Entry Description', type: 'text' },
          { key: 'debit', label: 'Debit (Paid)', type: 'currency', align: 'right' },
          { key: 'credit', label: 'Credit (Billed)', type: 'currency', align: 'right' },
          { key: 'runningBalance', label: 'Running Balance', type: 'currency', align: 'right' }
        ],
        summaryCards: [
          { id: 's1', label: 'Ledger Audit Balance', value: 15900000, isCurrency: true },
          { id: 's2', label: 'Voucher Integrity Index', value: '100%' }
        ],
        mockRows: [
          { id: 'vl-1', date: '2026-07-02', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', transactionRef: 'VCH-2026-01', transactionType: 'Opening Balance Carried Forward', debit: 0, credit: 1500000, runningBalance: 1500000 },
          { id: 'vl-2', date: '2026-07-04', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', transactionRef: 'INV-2026-401', transactionType: 'Vendor Bill Certified - Marine Plywood', debit: 0, credit: 4800000, runningBalance: 6300000 },
          { id: 'vl-3', date: '2026-07-06', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', transactionRef: 'PAY-2026-801', transactionType: 'Bank Disbursal - HDFC RTGS', debit: 4800000, credit: 0, runningBalance: 1500000 },
          { id: 'vl-4', date: '2026-07-14', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', transactionRef: 'INV-2026-440', transactionType: 'Vendor Bill Certified - HPL Laminates', debit: 0, credit: 2000000, runningBalance: 3500000 },
          { id: 'vl-5', date: '2026-07-18', vendor: 'Century Plyboards India Ltd', site: 'Nexus Tech Park', transactionRef: 'PAY-2026-830', transactionType: 'Bank Disbursal - HDFC RTGS', debit: 1000000, credit: 0, runningBalance: 2500000 }
        ]
      }
    ]
  },
  [ROUTES.ADMIN_REPORTS]: {
    id: 'reports-admin', route: ROUTES.ADMIN_REPORTS, pageType: 'report',
    title: 'Administration Analytics & Audit Logs', description: 'System user authentication, activity mutation logs, corporate contact diary, project physical progress, and site resource density.', breadcrumbs: ['Reports', 'Admin Reports'],
    tabs: [
      { id: 'login-time', label: 'User Login Time', title: 'User Session Authentication Log', description: 'User login timestamps, logout times, active session duration, IP addresses, and login security status.',
        columns: [
          { key: 'user', label: 'User Account', type: 'text' },
          { key: 'loginDate', label: 'Login Date', type: 'date' },
          { key: 'loginTime', label: 'Login Time', type: 'text' },
          { key: 'logoutTime', label: 'Logout Time', type: 'text' },
          { key: 'duration', label: 'Session Duration', type: 'text', align: 'center' },
          { key: 'ipAddress', label: 'IP Address', type: 'mono' },
          { key: 'device', label: 'Device / Browser', type: 'text' },
          { key: 'status', label: 'Auth Result', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'Active Concurrent Sessions', value: 4 },
          { id: 's2', label: 'Failed Login Attempts', value: 0 }
        ],
        mockRows: [
          { id: 'lt-1', user: 'Rajesh Kumar', userName: 'Rajesh Kumar', designation: 'Project Director', loginDate: '2026-07-24', loginTime: '08:45 AM', logoutTime: 'Active Session', duration: '5h 15m', sessionDurationMinutes: 315, ipAddress: '119.82.102.45', device: 'Chrome / Windows 11', deviceBrowser: 'Chrome / Windows 11', authResult: 'success', activeSession: true, status: 'completed' },
          { id: 'lt-2', user: 'Priya Sharma', userName: 'Priya Sharma', designation: 'Senior Billing Engineer', loginDate: '2026-07-24', loginTime: '09:00 AM', logoutTime: 'Active Session', duration: '5h 00m', sessionDurationMinutes: 300, ipAddress: '119.82.102.48', device: 'Chrome / Windows 11', deviceBrowser: 'Chrome / Windows 11', authResult: 'success', activeSession: true, status: 'completed' },
          { id: 'lt-4', user: 'Vikramaditya Nair', userName: 'Vikramaditya Nair', designation: 'Site Engineer', loginDate: '2026-07-24', loginTime: '09:30 AM', logoutTime: 'Active Session', duration: '4h 30m', sessionDurationMinutes: 270, ipAddress: '119.82.102.50', device: 'Firefox / Android', deviceBrowser: 'Firefox / Android', authResult: 'success', activeSession: true, status: 'completed' },
          { id: 'lt-5', user: 'Sneha Kulkarni', userName: 'Sneha Kulkarni', designation: 'Finance Manager', loginDate: '2026-07-24', loginTime: '10:00 AM', logoutTime: 'Active Session', duration: '4h 00m', sessionDurationMinutes: 240, ipAddress: '103.22.14.92', device: 'Edge / Windows 11', deviceBrowser: 'Edge / Windows 11', authResult: 'success', activeSession: true, status: 'completed' },
          { id: 'lt-3', user: 'Amitabh Sen', userName: 'Amitabh Sen', designation: 'Procurement Head', loginDate: '2026-07-24', loginTime: '09:15 AM', logoutTime: '12:30 PM', duration: '3h 15m', sessionDurationMinutes: 195, ipAddress: '103.22.14.88', device: 'Safari / macOS', deviceBrowser: 'Safari / macOS', authResult: 'success', activeSession: false, status: 'completed' }
        ]
      },
      { id: 'activity-history', label: 'User Activity History', title: 'System Mutation Audit Trail', description: 'Chronological tracking of system data insertions, approvals, modifications, and master record creations.',
        columns: [
          { key: 'logRef', label: 'Log ID', type: 'mono' },
          { key: 'timestamp', label: 'Timestamp', type: 'text' },
          { key: 'user', label: 'User Name', type: 'text' },
          { key: 'module', label: 'ERP Module', type: 'text' },
          { key: 'action', label: 'Action Performed', type: 'text' },
          { key: 'record', label: 'Affected Record', type: 'text' },
          { key: 'result', label: 'Status Result', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'Total DB Writes Today', value: 142 },
          { id: 's2', label: 'Audit Integrity Status', value: 'Verified' }
        ],
        mockRows: [
          { id: 'ah-1', logRef: 'LOG-2026-901', timestamp: '2026-07-24 09:12', user: 'Rajesh Kumar', module: 'Masters / Brands', action: 'Created New Master Record', record: 'BRD-102 (Asian Paints Dampproof)', result: 'completed' },
          { id: 'ah-2', logRef: 'LOG-2026-905', timestamp: '2026-07-24 10:05', user: 'Priya Sharma', module: 'Procurement / RFQ', action: 'Finalized Vendor Quotation', record: 'RFQ-2026-092', result: 'completed' },
          { id: 'ah-3', logRef: 'LOG-2026-910', timestamp: '2026-07-24 10:40', user: 'Sneha Kulkarni', module: 'Finance / Disbursal', action: 'Approved Payment Voucher', record: 'PAY-2026-805', result: 'completed' },
          { id: 'ah-4', logRef: 'LOG-2026-915', timestamp: '2026-07-24 11:15', user: 'Vikramaditya Nair', module: 'Finance / Utility Split', action: 'Generated Utility Bill Allocation', record: 'UTIL-2026-088', result: 'completed' },
          { id: 'ah-5', logRef: 'LOG-2026-920', timestamp: '2026-07-24 12:00', user: 'Amitabh Sen', module: 'Procurement / PO', action: 'Issued Purchase Order', record: 'PO-2026-104', result: 'completed' }
        ]
      },
      { id: 'contacts-diary', label: 'Contacts Diary', title: 'Centralized CRM & Stakeholder Address Book', description: 'Direct contact directory for Clients, Vendors, Consultants, PMCs, Architects, and Internal Executives.',
        columns: [
          { key: 'name', label: 'Contact Person', type: 'text' },
          { key: 'organization', label: 'Organization / Company', type: 'text' },
          { key: 'category', label: 'Stakeholder Role', type: 'text' },
          { key: 'phone', label: 'Direct Phone', type: 'text' },
          { key: 'email', label: 'Email Address', type: 'text' },
          { key: 'relatedSite', label: 'Assigned Site', type: 'text' },
          { key: 'lastContactDate', label: 'Last Contact', type: 'date' }
        ],
        summaryCards: [
          { id: 's1', label: 'Registered Contacts', value: 165 },
          { id: 's2', label: 'Key Stakeholders', value: 28 }
        ],
        mockRows: [
          { id: 'cd-1', name: 'Rohan Mehta', organization: 'Nexus Realty Developers Group', category: 'Client Representative', phone: '+91 98200 12345', email: 'rohan.m@nexusrealty.in', relatedSite: 'Nexus Tech Park', lastContactDate: '2026-07-22' },
          { id: 'cd-2', name: 'Sanjay Singhania', organization: 'Century Plyboards India Ltd', category: 'Vendor Regional Head', phone: '+91 98300 67890', email: 'sanjay.s@centuryply.com', relatedSite: 'Grand Hyatt Goa', lastContactDate: '2026-07-20' },
          { id: 'cd-3', name: 'Arch. Sunita Deshmukh', organization: 'Deshmukh & Associates Architects', category: 'Principal Architect', phone: '+91 98190 44332', email: 'sunita@deshmukharch.com', relatedSite: 'Imperial Heights', lastContactDate: '2026-07-21' },
          { id: 'cd-4', name: 'Capt. Rakesh Verma', organization: 'CBRE Project Management', category: 'PMC Director', phone: '+91 98450 11223', email: 'rakesh.verma@cbre.in', relatedSite: 'Phoenix Marketcity', lastContactDate: '2026-07-19' },
          { id: 'cd-5', name: 'Dr. Alok Nath', organization: 'Structural Safety Consultants', category: 'Structural Engineer', phone: '+91 98110 55667', email: 'alok@structconsult.org', relatedSite: 'Sobha City Luxury Villa', lastContactDate: '2026-07-23' }
        ]
      },
      { id: 'project-progress', label: 'Project Progress', title: 'Site Physical Execution S-Curve & Milestones', description: 'Integrated progress tracking mapping Time Elapsed, Physical Execution, Billing Progress, and Budget Utilization.',
        columns: [
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'projectManager', label: 'Site In-Charge', type: 'text' },
          { key: 'timeProgress', label: 'Time Elapsed (%)', type: 'text', align: 'center' },
          { key: 'physicalProgress', label: 'Physical Progress (%)', type: 'text', align: 'center' },
          { key: 'billingProgress', label: 'Billing Progress (%)', type: 'text', align: 'center' },
          { key: 'paymentProgress', label: 'Payment Recd (%)', type: 'text', align: 'center' },
          { key: 'budgetUtilization', label: 'Budget Used (%)', type: 'text', align: 'center' },
          { key: 'status', label: 'Execution Health', type: 'badge' }
        ],
        summaryCards: [
          { id: 's1', label: 'On-Schedule Sites Ratio', value: '80%' },
          { id: 's2', label: 'Average Execution Pace', value: '64.5%' }
        ],
        mockRows: [
          { id: 'pp-1', site: 'Nexus Tech Park', projectManager: 'Vikramaditya Nair', timeProgress: '70%', physicalProgress: '68%', billingProgress: '65%', paymentProgress: '62%', budgetUtilization: '64%', status: 'healthy' },
          { id: 'pp-2', site: 'Grand Hyatt Goa', projectManager: 'Rajesh Kumar', timeProgress: '55%', physicalProgress: '58%', billingProgress: '54%', paymentProgress: '50%', budgetUtilization: '56%', status: 'healthy' },
          { id: 'pp-3', site: 'Imperial Heights', projectManager: 'Amitabh Sen', timeProgress: '60%', physicalProgress: '55%', billingProgress: '52%', paymentProgress: '48%', budgetUtilization: '55%', status: 'healthy' },
          { id: 'pp-4', site: 'Phoenix Marketcity', projectManager: 'Priya Sharma', timeProgress: '85%', physicalProgress: '82%', billingProgress: '80%', paymentProgress: '78%', budgetUtilization: '83%', status: 'near_limit' },
          { id: 'pp-5', site: 'Sobha City Luxury Villa', projectManager: 'Sneha Kulkarni', timeProgress: '65%', physicalProgress: '60%', billingProgress: '58%', paymentProgress: '55%', budgetUtilization: '57%', status: 'healthy' }
        ]
      },
      { id: 'site-analysis', label: 'Site Analysis', title: 'Site Profitability & Resource Allocation Density', description: 'Financial comparison per site including Contract Value, Client Receipts, Vendor Outlay, and Estimated Profit Margin.',
        columns: [
          { key: 'site', label: 'Project Site', type: 'text' },
          { key: 'contractValue', label: 'Contract Value', type: 'currency', align: 'right' },
          { key: 'clientReceipts', label: 'Client Receipts', type: 'currency', align: 'right' },
          { key: 'vendorOutlay', label: 'Vendor Outlay', type: 'currency', align: 'right' },
          { key: 'utilitySalary', label: 'Utilities & Salaries', type: 'currency', align: 'right' },
          { key: 'grossMargin', label: 'Gross Margin', type: 'currency', align: 'right' },
          { key: 'marginPct', label: 'Margin Yield (%)', type: 'text', align: 'center' },
          { key: 'headcount', label: 'Site Roster', type: 'text', align: 'center' }
        ],
        summaryCards: [
          { id: 's1', label: 'Average Gross Margin', value: '24.2%' },
          { id: 's2', label: 'Total Site Manpower Roster', value: '142 FTE' }
        ],
        mockRows: [
          { id: 'sa-1', site: 'Nexus Tech Park', contractValue: 65000000, clientReceipts: 38000000, vendorOutlay: 22000000, utilitySalary: 3800000, grossMargin: 12200000, marginPct: '32.1%', headcount: '32 FTE' },
          { id: 'sa-2', site: 'Grand Hyatt Goa', contractValue: 145000000, clientReceipts: 82000000, vendorOutlay: 52000000, utilitySalary: 8200000, grossMargin: 21800000, marginPct: '26.5%', headcount: '48 FTE' },
          { id: 'sa-3', site: 'Imperial Heights', contractValue: 80000000, clientReceipts: 46000000, vendorOutlay: 34000000, utilitySalary: 5100000, grossMargin: 6900000, marginPct: '15.0%', headcount: '28 FTE' },
          { id: 'sa-4', site: 'Phoenix Marketcity', contractValue: 22000000, clientReceipts: 14500000, vendorOutlay: 10500000, utilitySalary: 1800000, grossMargin: 2200000, marginPct: '15.1%', headcount: '14 FTE' },
          { id: 'sa-5', site: 'Sobha City Luxury Villa', contractValue: 52000000, clientReceipts: 31000000, vendorOutlay: 21000000, utilitySalary: 3500000, grossMargin: 6500000, marginPct: '20.9%', headcount: '20 FTE' }
        ]
      }
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
    id: 'master-designations',
    route: ROUTES.DESIGNATIONS,
    pageType: 'list',
    title: 'Employee Designations & Job Tiers',
    description: 'Corporate designation hierarchy, organizational levels, and department designations.',
    breadcrumbs: ['Masters', 'Designations'],
    primaryAction: { label: 'Add Designation' },
    createFields: [
      { name: 'designationCode', label: 'Designation Code', type: 'text', required: true, defaultValue: 'DSG-004' },
      { name: 'title', label: 'Designation Title', type: 'text', required: true, placeholder: 'e.g. Senior Site Engineer' },
      { name: 'department', label: 'Department', type: 'select', required: true, options: [{ label: 'Project Execution', value: 'Project Execution' }, { label: 'Procurement & Stores', value: 'Procurement & Stores' }, { label: 'Finance & Accounts', value: 'Finance & Accounts' }, { label: 'Quality & Estimation', value: 'Quality & Estimation' }] },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'designationCode', label: 'Designation Code', type: 'mono' },
      { key: 'title', label: 'Designation Title', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'dsg-1', designationCode: 'DSG-001', title: 'Project Head', department: 'Project Execution', status: 'active' },
      { id: 'dsg-2', designationCode: 'DSG-002', title: 'Senior Procurement Manager', department: 'Procurement & Stores', status: 'active' },
      { id: 'dsg-3', designationCode: 'DSG-003', title: 'Accounts Executive', department: 'Finance & Accounts', status: 'active' }
    ]
  },
  [ROUTES.MEASUREMENT_CONVERSIONS]: {
    id: 'master-conversions',
    route: ROUTES.MEASUREMENT_CONVERSIONS,
    pageType: 'list',
    title: 'Measurement Unit Conversions',
    description: 'Global item unit conversion scalar rules for procurement and site inventory.',
    breadcrumbs: ['Masters', 'Conversions'],
    primaryAction: { label: 'Add Measurement Conversion' },
    createFields: [
      { name: 'conversionCode', label: 'Conversion Code', type: 'text', required: true, defaultValue: 'CNV-004' },
      { name: 'fromUnit', label: 'From Unit (Source)', type: 'text', required: true, placeholder: 'e.g. Sq Mtr' },
      { name: 'toUnit', label: 'To Unit (Target)', type: 'text', required: true, placeholder: 'e.g. Sq Ft' },
      { name: 'multiplier', label: 'Conversion Multiplier', type: 'number', required: true, defaultValue: 10.7639 },
      { name: 'formula', label: 'Conversion Logic Formula', type: 'text', required: true, placeholder: '1 Sq Mtr = 10.7639 Sq Ft' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'conversionCode', label: 'Conversion Code', type: 'mono' },
      { key: 'fromUnit', label: 'From Unit', type: 'text' },
      { key: 'toUnit', label: 'To Unit', type: 'text' },
      { key: 'multiplier', label: 'Multiplier Rate', type: 'text', align: 'center' },
      { key: 'formula', label: 'Conversion Logic Formula', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'cnv-1', conversionCode: 'CNV-001', fromUnit: 'Sq Mtr', toUnit: 'Sq Ft', multiplier: 10.7639, formula: '1 Sq Mtr = 10.7639 Sq Ft', status: 'active' },
      { id: 'cnv-2', conversionCode: 'CNV-002', fromUnit: 'Meter', toUnit: 'Feet', multiplier: 3.28084, formula: '1 Meter = 3.28084 Feet', status: 'active' },
      { id: 'cnv-3', conversionCode: 'CNV-003', fromUnit: 'Cu Mtr', toUnit: 'Cu Ft', multiplier: 35.3147, formula: '1 Cu Mtr = 35.3147 Cu Ft', status: 'active' }
    ]
  },
  [ROUTES.BRANDS]: {
    id: 'master-brands',
    route: ROUTES.BRANDS,
    pageType: 'list',
    title: 'Approved Material Brands',
    description: 'Empanelled manufacturing material brands catalog and contact details.',
    breadcrumbs: ['Masters', 'Brands'],
    primaryAction: { label: 'Add Brand' },
    createFields: [
      { name: 'brandCode', label: 'Brand Code', type: 'text', required: true, defaultValue: 'BRD-004' },
      { name: 'brandName', label: 'Brand Name', type: 'text', required: true, placeholder: 'e.g. Century Plyboards' },
      { name: 'category', label: 'Material Category', type: 'text', required: true, placeholder: 'e.g. Joinery & Woodwork' },
      { name: 'manufacturer', label: 'Manufacturer Name', type: 'text', required: true, placeholder: 'e.g. Century Ply Ltd' },
      { name: 'contactPerson', label: 'Contact Representative', type: 'text', required: false, placeholder: 'e.g. Rahul Sharma' },
      { name: 'phone', label: 'Contact Phone', type: 'text', required: false, placeholder: '+91 98000 11111' },
      { name: 'email', label: 'Contact Email', type: 'text', required: false, placeholder: 'info@centuryply.com' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'brandCode', label: 'Brand Code', type: 'mono' },
      { key: 'brandName', label: 'Brand Name', type: 'text' },
      { key: 'category', label: 'Material Category', type: 'text' },
      { key: 'manufacturer', label: 'Manufacturer', type: 'text' },
      { key: 'contactPerson', label: 'Contact Person', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'brd-1', brandCode: 'BRD-001', brandName: 'Century Ply', category: 'Joinery & Woodwork', manufacturer: 'Century Plyboards India Ltd', contactPerson: 'Suresh Kumar', email: 'suresh@centuryply.com', status: 'active' },
      { id: 'brd-2', brandCode: 'BRD-002', brandName: 'Asian Paints', category: 'Paints & Finishes', manufacturer: 'Asian Paints Ltd', contactPerson: 'Anand Varma', email: 'anand@asianpaints.com', status: 'active' },
      { id: 'brd-3', brandCode: 'BRD-003', brandName: 'Saint-Gobain', category: 'Glass & Gypsum', manufacturer: 'Saint-Gobain India Pvt Ltd', contactPerson: 'Vikram Joshi', email: 'vikram@saint-gobain.com', status: 'active' }
    ]
  },
  [ROUTES.LOCATIONS]: {
    id: 'master-locations',
    route: ROUTES.LOCATIONS,
    pageType: 'list',
    title: 'Warehouses & Stock Locations',
    description: 'Corporate warehouses, central godowns, site yards, and storage locations.',
    breadcrumbs: ['Masters', 'Locations'],
    primaryAction: { label: 'Add Location' },
    createFields: [
      { name: 'locationCode', label: 'Location Code', type: 'text', required: true, defaultValue: 'LOC-004' },
      { name: 'name', label: 'Warehouse / Yard Name', type: 'text', required: true, placeholder: 'e.g. Peenya Central Warehouse' },
      { name: 'city', label: 'City Location', type: 'text', required: true, defaultValue: 'Bengaluru' },
      { name: 'address', label: 'Full Physical Address', type: 'text', required: true, placeholder: 'Plot 42, 3rd Phase, Industrial Area' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'locationCode', label: 'Location Code', type: 'mono' },
      { key: 'name', label: 'Location Name', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'loc-1', locationCode: 'LOC-001', name: 'Peenya Central Warehouse', city: 'Bengaluru', address: 'Plot 12, Peenya Industrial Area Phase II', status: 'active' },
      { id: 'loc-2', locationCode: 'LOC-002', name: 'Whitefield Site Yard', city: 'Bengaluru', address: 'Near ITPL Main Road', status: 'active' },
      { id: 'loc-3', locationCode: 'LOC-003', name: 'Bhiwandi Regional Godown', city: 'Mumbai', address: 'Building 4B, Logistics Park', status: 'active' }
    ]
  },
  [ROUTES.PMC]: {
    id: 'master-pmc',
    route: ROUTES.PMC,
    pageType: 'list',
    title: 'Project Management Consultants (PMC)',
    description: 'Empanelled PMC firms, site inspection teams, and quality auditing consultants.',
    breadcrumbs: ['Masters', 'PMC'],
    primaryAction: { label: 'Add PMC' },
    createFields: [
      { name: 'pmcCode', label: 'PMC Code', type: 'text', required: true, defaultValue: 'PMC-004' },
      { name: 'firmName', label: 'Consultant Firm Name', type: 'text', required: true, placeholder: 'e.g. Synergiz PMC Consultants' },
      { name: 'contactPerson', label: 'Principal Lead Consultant', type: 'text', required: true, placeholder: 'e.g. K. R. Nambiar' },
      { name: 'phone', label: 'Contact Phone', type: 'text', required: true, placeholder: '+91 98440 12345' },
      { name: 'email', label: 'Corporate Email', type: 'text', required: true, placeholder: 'contact@synergizpmc.in' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'pmcCode', label: 'PMC Code', type: 'mono' },
      { key: 'firmName', label: 'Consultant Firm Name', type: 'text' },
      { key: 'contactPerson', label: 'Principal Consultant', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'pmc-1', pmcCode: 'PMC-001', firmName: 'CBRE South Asia Pvt Ltd', contactPerson: 'Alok Nanda', phone: '+91 98200 99887', email: 'alok.nanda@cbre.com', status: 'active' },
      { id: 'pmc-2', pmcCode: 'PMC-002', firmName: 'JLL Project Management', contactPerson: 'Deepak Menon', phone: '+91 98110 55443', email: 'deepak.menon@jll.com', status: 'active' },
      { id: 'pmc-3', pmcCode: 'PMC-003', firmName: 'Knight Frank PMC Services', contactPerson: 'Rohan Sen', phone: '+91 98330 11223', email: 'rohan.sen@knightfrank.com', status: 'active' }
    ]
  },
  [ROUTES.ARCHITECTS]: {
    id: 'master-architects',
    route: ROUTES.ARCHITECTS,
    pageType: 'list',
    title: 'Designers & Architectural Consultants',
    description: 'On-record architectural firms, interior designers, and structural engineers.',
    breadcrumbs: ['Masters', 'Architects'],
    primaryAction: { label: 'Add Architect' },
    createFields: [
      { name: 'architectCode', label: 'Architect Code', type: 'text', required: true, defaultValue: 'ARC-004' },
      { name: 'firmName', label: 'Architect Firm Name', type: 'text', required: true, placeholder: 'e.g. Design Matrix Architects' },
      { name: 'principalArchitect', label: 'Principal Architect', type: 'text', required: true, placeholder: 'e.g. Ar. Sanjay Puri' },
      { name: 'phone', label: 'Phone Number', type: 'text', required: true, placeholder: '+91 98200 33445' },
      { name: 'email', label: 'Email Address', type: 'text', required: true, placeholder: 'studio@designmatrix.in' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }
    ],
    columns: [
      { key: 'architectCode', label: 'Architect Code', type: 'mono' },
      { key: 'firmName', label: 'Architect Firm Name', type: 'text' },
      { key: 'principalArchitect', label: 'Principal Architect', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    mockRows: [
      { id: 'arc-1', architectCode: 'ARC-001', firmName: 'Morphogenesis Design Studio', principalArchitect: 'Sonali Rastogi', phone: '+91 98100 12345', email: 'studio@morphogenesis.org', status: 'active' },
      { id: 'arc-2', architectCode: 'ARC-002', firmName: 'Kapadia Associates Architects', principalArchitect: 'Kiran Kapadia', phone: '+91 98220 88990', email: 'kiran@kapadiaassociates.com', status: 'active' },
      { id: 'arc-3', architectCode: 'ARC-003', firmName: 'Inspace Interior Design Consultancy', principalArchitect: 'Meera Iyer', phone: '+91 98450 66778', email: 'meera@inspacedesign.in', status: 'active' }
    ]
  }
};
