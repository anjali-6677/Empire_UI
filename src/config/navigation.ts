/**
 * Empire Interior ERP Target Navigation Configuration & Backward-Compatible Route Aliases
 * Location: src/config/navigation.ts
 */

import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  Calendar,
  MessageSquare,
  Calculator,
  Award,
  Briefcase,
  CalendarDays,
  MapPin,
  ClipboardList,
  CheckCircle,
  FileText,
  Zap,
  ShoppingBag,
  Hammer,
  TrendingUp,
  PackageCheck,
  Boxes,
  Truck,
  HardHat,
  BadgeCheck,
  Receipt,
  CreditCard,
  FileCheck2,
  Banknote,
  ReceiptText,
  DollarSign,
  FolderTree,
  Package,
  Store,
  HardHat as SubcontractorIcon,
  UserCheck,
  Ruler,
  Users as UserGroupIcon,
  BarChart3,
  TrendingDown,
  PieChart,
  ShieldCheck,
  Settings,
  Building2,
  UserPlus,
} from 'lucide-react';

export const ROUTES = {
  OVERVIEW: '/',
  MY_TASKS: '/overview/my-tasks',
  NOTIFICATIONS: '/overview/notifications',
  CALENDAR: '/overview/calendar',
  MESSAGES: '/overview/messages',

  // CRM
  CRM_ENQUIRIES: '/crm/enquiries',
  CRM_ESTIMATES: '/crm/estimates',
  CRM_ESTIMATE_VERSIONS: '/crm/estimate-versions',
  CRM_TENDER_DECISIONS: '/crm/tender-decisions',

  // Projects & Planning
  PROJECTS: '/projects',
  PROJECTS_ACTIVE: '/projects/active',
  PROJECTS_ACTIVATE: '/projects/activate/:estimateVersionId',
  PROJECT_WORKSPACE: '/projects/:projectId',
  PROJECTS_LIST: '/projects/active', // Alias
  PROJECTS_OVERVIEW: '/projects/overview',
  PROJECTS_SITE_DETAILS: '/projects/overview', // Alias
  PROJECTS_TEAM: '/projects/team',
  PROJECTS_TEAMS: '/projects/team', // Alias
  PROJECTS_TENDERS: '/crm/tender-decisions', // Alias
  PROJECTS_BOQ: '/projects/boq',
  PROJECTS_SCHEDULE: '/projects/schedule',
  PROJECTS_MILESTONES: '/projects/milestones',
  PROJECTS_MAP: '/projects/map',

  // Procurement
  PROCUREMENT_INDENTS: '/procurement/indents',
  PROCUREMENT_INDENTS_NEW: '/procurement/indents/new',
  PROCUREMENT_INDENT_DETAILS: '/procurement/indents/:indentId',
  PROCUREMENT_INDENT_APPROVALS: '/procurement/indent-approvals',
  PROCUREMENT_RFQS: '/procurement/rfqs',
  PROCUREMENT_VENDOR_QUOTATIONS: '/procurement/vendor-quotations',
  PROCUREMENT_RATE_COMPARISON: '/procurement/rate-comparison',
  PROCUREMENT_DIRECT_PURCHASE: '/procurement/direct-purchase',
  PROCUREMENT_PURCHASE_ORDERS: '/procurement/purchase-orders',
  PROCUREMENT_WORK_ORDERS: '/procurement/work-orders',
  PROCUREMENT_HISTORICAL_RATES: '/procurement/historical-rates',
  PROCUREMENT_GRNS: '/inventory/grns', // Alias
  PROCUREMENT_INVENTORY: '/inventory/stock-ledger', // Alias

  // Inventory & Execution
  INVENTORY: '/inventory/stock-ledger',
  INVENTORY_GRNS: '/inventory/grns',
  INVENTORY_STOCK_LEDGER: '/inventory/stock-ledger',
  INVENTORY_MATERIAL_ISSUES: '/inventory/material-issues',
  EXECUTION_SUBCONTRACTOR_WIP: '/execution/subcontractor-wip',
  EXECUTION_WIP_CERTIFICATION: '/execution/wip-certification',

  // Finance, Billing & Payments
  ON_ACCOUNT_DASHBOARD: '/finance/on-account',
  UTILITY_BILLS: '/finance/utility-bills',
  SALARY: '/finance/salary',
  PROJECT_BUDGETS: '/finance/budgets',
  PETTY_CASH: '/finance/petty-cash',
  FINANCE_REPORTS: '/reports/finance',
  MASTER_PARTNERS: '/masters/vendors',
  REPORTS_OVERVIEW: '/reports',
  EXECUTION_PROGRESS: '/execution/progress',
  SUBCONTRACTOR_BILLS: '/finance/subcontractor-bills',
  FINANCE_INVOICES: '/finance/vendor-invoices', // Alias
  FINANCE_PAYMENTS: '/finance/vendor-payments', // Alias
  FINANCE_VENDOR_INVOICES: '/finance/vendor-invoices',
  FINANCE_VENDOR_PAYMENTS: '/finance/vendor-payments',
  FINANCE_SUBCONTRACTOR_BILLS: '/finance/subcontractor-bills',
  FINANCE_SUBCONTRACTOR_PAYMENTS: '/finance/subcontractor-payments',
  FINANCE_CLIENT_RA_BILLS: '/finance/client-ra-bills',
  FINANCE_CLIENT_RECEIPTS: '/finance/client-receipts',

  // Masters
  CLIENTS: '/masters/clients',
  MASTERS_CATEGORIES: '/masters/categories',
  MASTERS_PRICING_FACTORS: '/masters/pricing-factors',
  MASTERS_PRODUCTS: '/masters/products',
  MASTERS_VENDORS: '/masters/vendors',
  MASTERS_SUBCONTRACTORS: '/masters/subcontractors',
  MASTERS_CLIENTS: '/masters/clients',
  MASTERS_UOM: '/masters/uom',
  MASTERS_PAYMENT_TERMS: '/masters/payment-terms',
  MASTERS_TAXES: '/masters/taxes',
  MASTERS_STOCK_LOCATIONS: '/masters/stock-locations',
  MASTERS_CATEGORIES_FACTORS: '/masters/categories', // Legacy alias
  MASTERS_PRODUCTS_MATERIALS: '/masters/products', // Legacy alias
  MASTERS_ITEM_CATEGORIES: '/masters/categories', // Legacy alias
  MASTERS_ITEMS: '/masters/products', // Legacy alias
  MASTERS_UNITS: '/masters/uom', // Legacy alias
  MASTERS_DEPARTMENTS: '/admin/departments',
  MASTERS_DESIGNATIONS: '/admin/designations',
  MASTERS_EMPLOYEES: '/masters/users-employees',
  MASTERS_USERS_EMPLOYEES: '/masters/users-employees',

  // Legacy Aliases
  INDENTS: '/procurement/indents',
  WORK_ORDERS: '/procurement/work-orders',
  USERS: '/masters/users-employees',
  ROLES: '/admin/roles',
  PROJECT_TEAMS: '/projects/team',
  TENDER_DETAILS: '/crm/tender-decisions',
  BRANDS: '/masters/brands',
  LOCATIONS: '/masters/locations',
  PMC: '/masters/pmc',
  ARCHITECTS: '/masters/architects',
  MEASUREMENT_CONVERSIONS: '/masters/conversions',
  SITES: '/projects/active',
  SITE_DETAILS: '/projects/site-details',
  CLIENT_SITES: '/projects/active',
  RFQS: '/procurement/rfqs',
  VENDOR_QUOTATIONS: '/procurement/vendor-quotations',
  RATE_COMPARISON: '/procurement/rate-comparison',
  DIRECT_PURCHASE: '/procurement/direct-purchases',
  DIRECT_PURCHASES: '/procurement/direct-purchases',
  PURCHASE_ORDERS: '/procurement/purchase-orders',
  ORDERS: '/procurement/purchase-orders',
  COMPANIES: '/masters/companies',
  BANKS: '/masters/banks',
  DEPARTMENTS: '/admin/departments',
  DESIGNATIONS: '/admin/designations',
  ROLES_MASTER: '/admin/roles',
  PURCHASE_REPORTS: '/reports/purchase',
  BUDGET_REPORTS: '/reports/budget',
  INVENTORY_REPORTS: '/reports/inventory',
  ADMIN_REPORTS: '/reports/admin',
  PERMISSIONS: '/admin/permissions',
  SETTINGS: '/admin/settings',
  DEBIT_NOTES: '/finance/debit-notes',
  CREDIT_NOTES: '/finance/credit-notes',
  BUDGET_TRANSFERS: '/finance/budget-transfers',
  ITEMS: '/masters/products',
  ITEM_CATEGORIES: '/masters/categories',
  PRICING_FACTORS: '/masters/pricing-factors',
  CATEGORIES: '/masters/categories-factors',
  PRODUCTS: '/masters/products-materials',
  VENDORS: '/masters/vendors',
  SUBCONTRACTORS: '/masters/subcontractors',
  UNITS: '/masters/units',
  EMPLOYEES: '/masters/users-employees',
  ACCOUNTING_INVOICES: '/finance/vendor-invoices',
  BANK_ACCOUNTS: '/finance/vendor-payments',
  COMPANY_MASTERS: '/masters/clients',
  GRNS: '/inventory/grns',
  INVOICES: '/finance/vendor-invoices',
  PAYMENT_REQUESTS: '/finance/vendor-invoices',
  PAYMENTS: '/finance/vendor-payments',

  // MIS & Reports
  REPORTS_BUDGET: '/reports/project-financial', // Alias
  REPORTS_PURCHASE: '/reports/procurement-performance', // Alias
  REPORTS_FINANCE: '/reports/vendor-outstanding', // Alias
  REPORTS_PROJECT_FINANCIAL: '/reports/project-financial',
  REPORTS_PROCUREMENT_PERFORMANCE: '/reports/procurement-performance',
  REPORTS_MATERIAL_CONSUMPTION: '/reports/material-consumption',
  REPORTS_VENDOR_OUTSTANDING: '/reports/vendor-outstanding',
  REPORTS_SUBCONTRACTOR_OUTSTANDING: '/reports/subcontractor-outstanding',
  REPORTS_CLIENT_BILLING_RECEIPTS: '/reports/client-billing-receipts',
  REPORTS_PROJECT_MARGIN: '/reports/project-margin',
  REPORTS_SCHEDULE_PERFORMANCE: '/reports/schedule-performance',

  // Administration
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_DESIGNATIONS: '/admin/designations',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_PERMISSIONS: '/admin/permissions',
  ADMIN_APPROVAL_MATRIX: '/admin/approval-matrix',
  ADMIN_SETTINGS: '/admin/settings',
};

export type ProjectContextRequirement = 'required' | 'optional' | 'none';

export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon?: any;
  badge?: string | number;
  projectContext?: ProjectContextRequirement;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

export const NAVIGATION_CONFIG: NavigationGroup[] = [
  {
    id: 'overview-group',
    label: 'Overview',
    items: [
      { id: 'dash', label: 'Executive Dashboard', path: ROUTES.OVERVIEW, icon: LayoutDashboard, projectContext: 'optional' },
      { id: 'tasks', label: 'My Tasks', path: ROUTES.MY_TASKS, icon: CheckSquare, projectContext: 'none' },
      { id: 'notif', label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: Bell, projectContext: 'none' },
      { id: 'cal', label: 'Calendar', path: ROUTES.CALENDAR, icon: Calendar, projectContext: 'none' },
      { id: 'msg', label: 'Messages', path: ROUTES.MESSAGES, icon: MessageSquare, projectContext: 'none' },
    ],
  },
  {
    id: 'crm-group',
    label: '1. CRM & Commercial Estimation',
    items: [
      { id: 'crm-dash', label: 'CRM Workspace', path: '/crm', icon: LayoutDashboard, projectContext: 'none' },
      { id: 'crm-factors', label: 'Pricing Factors', path: '/crm/pricing-factors', icon: ShieldCheck, projectContext: 'none' },
      { id: 'crm-won', label: 'Tender Won Projects', path: '/crm/won', icon: Award, projectContext: 'none' },
      { id: 'crm-lost', label: 'Lost Opportunities', path: '/crm/lost', icon: TrendingDown, projectContext: 'none' },
    ],
  },
  {
    id: 'projects-group',
    label: '2. Projects & Planning',
    items: [
      { id: 'proj-all', label: 'Projects Directory', path: '/projects', icon: Briefcase, projectContext: 'none' },
      { id: 'proj-map', label: 'Project Map', path: '/projects/map', icon: MapPin, projectContext: 'none' },
    ],
  },
  {
    id: 'procurement-group',
    label: '3. Procurement',
    items: [
      { id: 'proc-ind', label: 'Material Indents', path: ROUTES.PROCUREMENT_INDENTS, icon: ClipboardList, projectContext: 'required' },
      { id: 'proc-rfq', label: 'Material RFQs', path: ROUTES.PROCUREMENT_RFQS, icon: FileText, projectContext: 'required' },
      { id: 'proc-dir', label: 'Authorised Direct Purchase', path: ROUTES.PROCUREMENT_DIRECT_PURCHASE, icon: Zap, projectContext: 'required' },
      { id: 'proc-po', label: 'Purchase Orders', path: ROUTES.PROCUREMENT_PURCHASE_ORDERS, icon: ShoppingBag, projectContext: 'required' },
      { id: 'proc-wo', label: 'Subcontractor Work Orders', path: ROUTES.PROCUREMENT_WORK_ORDERS, icon: Hammer, projectContext: 'required' },
      { id: 'proc-his', label: 'Historical Rates', path: ROUTES.PROCUREMENT_HISTORICAL_RATES, icon: TrendingUp, projectContext: 'optional' },
    ],
  },
  {
    id: 'inventory-execution-group',
    label: '4. Inventory & Execution',
    items: [
      { id: 'inv-grn', label: 'GRNs & Quality Check', path: ROUTES.INVENTORY_GRNS, icon: PackageCheck, projectContext: 'required' },
      { id: 'inv-stk', label: 'Stock Ledger', path: ROUTES.INVENTORY_STOCK_LEDGER, icon: Boxes, projectContext: 'required' },
      { id: 'inv-isu', label: 'Material Issues to Site', path: ROUTES.INVENTORY_MATERIAL_ISSUES, icon: Truck, projectContext: 'required' },
      { id: 'exe-wip', label: 'Subcontractor WIP', path: ROUTES.EXECUTION_SUBCONTRACTOR_WIP, icon: HardHat, projectContext: 'required' },
      { id: 'exe-crt', label: 'WIP Certification', path: ROUTES.EXECUTION_WIP_CERTIFICATION, icon: BadgeCheck, projectContext: 'required' },
    ],
  },
  {
    id: 'finance-group',
    label: '5. Finance, Billing & Payments',
    items: [
      { id: 'fin-vinv', label: '3-Way Match Vendor Invoices', path: ROUTES.FINANCE_VENDOR_INVOICES, icon: Receipt, projectContext: 'required' },
      { id: 'fin-vpay', label: 'Vendor Payments', path: ROUTES.FINANCE_VENDOR_PAYMENTS, icon: CreditCard, projectContext: 'required' },
      { id: 'fin-sbil', label: 'Subcontractor Bills', path: ROUTES.FINANCE_SUBCONTRACTOR_BILLS, icon: FileCheck2, projectContext: 'required' },
      { id: 'fin-spay', label: 'Subcontractor Payments', path: ROUTES.FINANCE_SUBCONTRACTOR_PAYMENTS, icon: Banknote, projectContext: 'required' },
      { id: 'fin-rab', label: 'Client RA Bills', path: ROUTES.FINANCE_CLIENT_RA_BILLS, icon: ReceiptText, projectContext: 'required' },
      { id: 'fin-rec', label: 'Client Payment Receipts', path: ROUTES.FINANCE_CLIENT_RECEIPTS, icon: DollarSign, projectContext: 'required' },
    ],
  },
  {
    id: 'masters-group',
    label: '6. Master Data',
    items: [
      { id: 'mst-cat', label: 'Item Categories', path: ROUTES.MASTERS_CATEGORIES, icon: FolderTree, projectContext: 'none' },
      { id: 'mst-prd', label: 'Product / Material Master', path: ROUTES.MASTERS_PRODUCTS, icon: Package, projectContext: 'none' },
      { id: 'mst-ven', label: 'Vendor Master', path: ROUTES.MASTERS_VENDORS, icon: Store, projectContext: 'none' },
      { id: 'mst-sub', label: 'Subcontractor Master', path: ROUTES.MASTERS_SUBCONTRACTORS, icon: SubcontractorIcon, projectContext: 'none' },
      { id: 'mst-cli', label: 'Client Master', path: ROUTES.MASTERS_CLIENTS, icon: UserCheck, projectContext: 'none' },
      { id: 'mst-unt', label: 'Unit Master', path: ROUTES.MASTERS_UOM, icon: Ruler, projectContext: 'none' },
      { id: 'mst-pay', label: 'Payment Terms', path: ROUTES.MASTERS_PAYMENT_TERMS, icon: Receipt, projectContext: 'none' },
      { id: 'mst-tax', label: 'Tax Master', path: ROUTES.MASTERS_TAXES, icon: Calculator, projectContext: 'none' },
      { id: 'mst-loc', label: 'Store Locations', path: ROUTES.MASTERS_STOCK_LOCATIONS, icon: MapPin, projectContext: 'none' },
      { id: 'mst-emp', label: 'Employee Master', path: ROUTES.MASTERS_USERS_EMPLOYEES, icon: UserGroupIcon, projectContext: 'none' },
    ],
  },
  {
    id: 'reports-group',
    label: '7. MIS & Executive Reports',
    items: [
      { id: 'rep-fin', label: 'Project Financial Performance', path: ROUTES.REPORTS_PROJECT_FINANCIAL, icon: BarChart3, projectContext: 'optional' },
      { id: 'rep-prc', label: 'Procurement Performance', path: ROUTES.REPORTS_PROCUREMENT_PERFORMANCE, icon: TrendingUp, projectContext: 'optional' },
      { id: 'rep-mat', label: 'Material Consumption Variance', path: ROUTES.REPORTS_MATERIAL_CONSUMPTION, icon: Boxes, projectContext: 'optional' },
      { id: 'rep-vod', label: 'Vendor Outstanding AP', path: ROUTES.REPORTS_VENDOR_OUTSTANDING, icon: TrendingDown, projectContext: 'optional' },
      { id: 'rep-sod', label: 'Subcontractor Outstanding', path: ROUTES.REPORTS_SUBCONTRACTOR_OUTSTANDING, icon: HardHat, projectContext: 'optional' },
      { id: 'rep-crb', label: 'Client Billing & AR Receipts', path: ROUTES.REPORTS_CLIENT_BILLING_RECEIPTS, icon: PieChart, projectContext: 'optional' },
      { id: 'rep-mrg', label: 'Project Margin & Cost Variance', path: ROUTES.REPORTS_PROJECT_MARGIN, icon: BarChart3, projectContext: 'optional' },
      { id: 'rep-sch', label: 'Project Schedule Performance', path: ROUTES.REPORTS_SCHEDULE_PERFORMANCE, icon: CalendarDays, projectContext: 'optional' },
    ],
  },
  {
    id: 'admin-group',
    label: '8. Administration',
    items: [
      { id: 'adm-dpt', label: 'Departments', path: ROUTES.ADMIN_DEPARTMENTS, icon: Building2, projectContext: 'none' },
      { id: 'adm-dsg', label: 'Designations', path: ROUTES.ADMIN_DESIGNATIONS, icon: UserPlus, projectContext: 'none' },
      { id: 'adm-rol', label: 'Roles', path: ROUTES.ADMIN_ROLES, icon: ShieldCheck, projectContext: 'none' },
      { id: 'adm-prm', label: 'Permissions Matrix', path: ROUTES.ADMIN_PERMISSIONS, icon: ShieldCheck, projectContext: 'none' },
      { id: 'adm-app', label: 'Approval Matrix Rules', path: ROUTES.ADMIN_APPROVAL_MATRIX, icon: CheckCircle, projectContext: 'none' },
      { id: 'adm-set', label: 'System Settings', path: ROUTES.ADMIN_SETTINGS, icon: Settings, projectContext: 'none' },
    ],
  },
];

export function getProjectContextForPath(pathname: string): ProjectContextRequirement {
  if (pathname.startsWith('/crm/') || pathname.startsWith('/masters/') || pathname.startsWith('/admin/')) {
    return 'none';
  }
  if (pathname.startsWith('/projects/') || pathname.startsWith('/procurement/') || pathname.startsWith('/inventory/') || pathname.startsWith('/execution/') || pathname.startsWith('/finance/')) {
    return 'required';
  }
  for (const group of NAVIGATION_CONFIG) {
    for (const item of group.items) {
      if (item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) {
        return item.projectContext || 'none';
      }
    }
  }
  return 'none';
}

