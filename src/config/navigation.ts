import { NavigationGroup } from '../types';

export const ROUTES = {
  // Overview
  DASHBOARD: '/',
  MY_TASKS: '/overview/my-tasks',
  NOTIFICATIONS: '/overview/notifications',
  CALENDAR: '/overview/calendar',
  MESSAGES: '/overview/messages',

  // Projects
  PROJECTS: '/projects/list',
  SITES: '/sites',
  CREATE_SITE: '/sites/new',
  SITE_DETAILS: '/projects/site-details',
  PROJECT_TEAMS: '/projects/teams',
  TENDER_DETAILS: '/projects/tenders',
  PROJECT_MAP: '/projects/map',

  // Procurement
  INDENTS: '/procurement/indents',
  RFQS: '/procurement/rfqs',
  RATE_COMPARISON: '/procurement/rate-comparison',
  PURCHASE_ORDERS: '/procurement/purchase-orders',
  WORK_ORDERS: '/procurement/work-orders',
  ORDERS: '/procurement/orders',
  GRNS: '/procurement/grns',
  INVENTORY: '/procurement/inventory',

  // Finance
  ON_ACCOUNT_DASHBOARD: '/finance/on-account',
  BUDGET_TRANSFERS: '/finance/budget-transfers',
  ACCOUNTING_INVOICES: '/finance/accounting',
  CREDIT_NOTES: '/finance/credit-notes',
  DEBIT_NOTES: '/finance/debit-notes',
  INVOICES: '/finance/invoices',
  PAYMENT_REQUESTS: '/finance/payment-requests',
  PAYMENTS: '/finance/payments',
  PROJECT_BUDGETS: '/finance/budgets',
  UTILITY_BILLS: '/finance/utility-bills',
  SALARY: '/finance/salary',

  // Masters
  CLIENTS: '/masters/clients',
  VENDORS: '/masters/vendors',
  EMPLOYEES: '/masters/employees',
  ITEMS: '/masters/items',
  ITEM_CATEGORIES: '/masters/item-categories',
  UNITS: '/masters/units',
  COMPANIES: '/masters/companies',
  BANKS: '/masters/banks',
  DEPARTMENTS: '/masters/departments',
  ROLES_MASTER: '/masters/roles',

  // Reports
  PURCHASE_REPORTS: '/reports/purchase',
  BUDGET_REPORTS: '/reports/budget',
  FINANCE_REPORTS: '/reports/finance',
  ADMIN_REPORTS: '/reports/administration',

  // Administration
  USERS: '/admin/users',
  ROLES: '/admin/roles',
  PERMISSIONS: '/admin/permissions',
  SETTINGS: '/admin/settings'
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

export const NAVIGATION_CONFIG: NavigationGroup[] = [
  {
    id: 'group-overview',
    label: 'Overview',
    items: [
      { id: 'nav-dashboard', label: 'Site Dashboard', path: ROUTES.DASHBOARD, icon: 'Home' },
      { id: 'nav-tasks', label: 'My Tasks', path: ROUTES.MY_TASKS, icon: 'CheckSquare' },
      { id: 'nav-notifications', label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: 'Bell' },
      { id: 'nav-calendar', label: 'Calendar', path: ROUTES.CALENDAR, icon: 'Calendar' },
      { id: 'nav-messages', label: 'Messages', path: ROUTES.MESSAGES, icon: 'MessageSquare' }
    ]
  },
  {
    id: 'group-projects',
    label: 'Projects',
    items: [
      { id: 'nav-projects-list', label: 'Projects', path: ROUTES.PROJECTS, icon: 'FolderKanban' },
      { id: 'nav-sites', label: 'Sites', path: ROUTES.SITES, icon: 'Building' },
      { id: 'nav-site-details', label: 'Site Details', path: ROUTES.SITE_DETAILS, icon: 'Layers' },
      { id: 'nav-teams', label: 'Project Teams', path: ROUTES.PROJECT_TEAMS, icon: 'Users' },
      { id: 'nav-tenders', label: 'Tender Details', path: ROUTES.TENDER_DETAILS, icon: 'FilePieChart' },
      { id: 'nav-map', label: 'Project Map', path: ROUTES.PROJECT_MAP, icon: 'Map' }
    ]
  },
  {
    id: 'group-procurement',
    label: 'Procurement',
    items: [
      { id: 'nav-indents', label: 'Indents', path: ROUTES.INDENTS, icon: 'FileSignature' },
      { id: 'nav-rfqs', label: 'RFQs', path: ROUTES.RFQS, icon: 'Send' },
      { id: 'nav-rate-comparison', label: 'Rate Comparison', path: ROUTES.RATE_COMPARISON, icon: 'ArrowLeftRight' },
      { id: 'nav-pos', label: 'Purchase Orders', path: ROUTES.PURCHASE_ORDERS, icon: 'ShoppingCart' },
      { id: 'nav-wos', label: 'Work Orders', path: ROUTES.WORK_ORDERS, icon: 'Wrench' },
      { id: 'nav-orders', label: 'Orders', path: ROUTES.ORDERS, icon: 'Package' },
      { id: 'nav-grns', label: 'GRNs', path: ROUTES.GRNS, icon: 'ClipboardCheck' },
      { id: 'nav-inventory', label: 'Inventory', path: ROUTES.INVENTORY, icon: 'Boxes' }
    ]
  },
  {
    id: 'group-finance',
    label: 'Finance',
    items: [
      { id: 'nav-invoices', label: 'Procurement Invoices', path: ROUTES.INVOICES, icon: 'Receipt' },
      { id: 'nav-acc-invoices', label: 'Accounting Invoices', path: ROUTES.ACCOUNTING_INVOICES, icon: 'FileCheck' },
      { id: 'nav-credit-notes', label: 'Credit Notes', path: ROUTES.CREDIT_NOTES, icon: 'ArrowDownCircle' },
      { id: 'nav-debit-notes', label: 'Debit Notes', path: ROUTES.DEBIT_NOTES, icon: 'ArrowUpCircle' },
      { id: 'nav-payment-reqs', label: 'Payment Requests', path: ROUTES.PAYMENT_REQUESTS, icon: 'FileSpreadsheet' },
      { id: 'nav-payments', label: 'Payments', path: ROUTES.PAYMENTS, icon: 'DollarSign' },
      { id: 'nav-on-account', label: 'On-Account', path: ROUTES.ON_ACCOUNT_DASHBOARD, icon: 'Wallet' },
      { id: 'nav-budget-transfers', label: 'Budget Transfers', path: ROUTES.BUDGET_TRANSFERS, icon: 'ArrowRightLeft' },
      { id: 'nav-budgets', label: 'Project Budgets', path: ROUTES.PROJECT_BUDGETS, icon: 'TrendingUp' },
      { id: 'nav-bills', label: 'Utility Bills', path: ROUTES.UTILITY_BILLS, icon: 'Lightbulb' },
      { id: 'nav-salary', label: 'Salary', path: ROUTES.SALARY, icon: 'CreditCard' }
    ]
  },
  {
    id: 'group-masters',
    label: 'Masters',
    items: [
      { id: 'nav-clients', label: 'Clients', path: ROUTES.CLIENTS, icon: 'Building2' },
      { id: 'nav-vendors', label: 'Vendors', path: ROUTES.VENDORS, icon: 'Store' },
      { id: 'nav-employees', label: 'Employees', path: ROUTES.EMPLOYEES, icon: 'Briefcase' },
      { id: 'nav-items', label: 'Items', path: ROUTES.ITEMS, icon: 'Grid' },
      { id: 'nav-item-categories', label: 'Item Categories', path: ROUTES.ITEM_CATEGORIES, icon: 'Tags' },
      { id: 'nav-units', label: 'Units', path: ROUTES.UNITS, icon: 'Ruler' },
      { id: 'nav-companies', label: 'Companies', path: ROUTES.COMPANIES, icon: 'Award' },
      { id: 'nav-banks', label: 'Banks', path: ROUTES.BANKS, icon: 'Landmark' },
      { id: 'nav-departments', label: 'Departments', path: ROUTES.DEPARTMENTS, icon: 'GitBranch' },
      { id: 'nav-roles-master', label: 'Roles Master', path: ROUTES.ROLES_MASTER, icon: 'ShieldCheck' }
    ]
  },
  {
    id: 'group-reports',
    label: 'Reports',
    items: [
      { id: 'nav-rep-purchase', label: 'Purchase Reports', path: ROUTES.PURCHASE_REPORTS, icon: 'FileBarChart' },
      { id: 'nav-rep-budget', label: 'Budget Reports', path: ROUTES.BUDGET_REPORTS, icon: 'Presentation' },
      { id: 'nav-rep-finance', label: 'Finance Reports', path: ROUTES.FINANCE_REPORTS, icon: 'PiggyBank' },
      { id: 'nav-rep-admin', label: 'Administration Reports', path: ROUTES.ADMIN_REPORTS, icon: 'BarChart3' }
    ]
  },
  {
    id: 'group-admin',
    label: 'Administration',
    items: [
      { id: 'nav-users', label: 'Users', path: ROUTES.USERS, icon: 'UserCog' },
      { id: 'nav-roles', label: 'Roles', path: ROUTES.ROLES, icon: 'Lock' },
      { id: 'nav-permissions', label: 'Permissions', path: ROUTES.PERMISSIONS, icon: 'Key' },
      { id: 'nav-settings', label: 'Settings', path: ROUTES.SETTINGS, icon: 'Settings' }
    ]
  }
];
