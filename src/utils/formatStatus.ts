import { formatIndianCurrency } from './format';

/**
 * Formats status enum codes to clean, human-readable labels.
 * E.g., 'in_progress' -> 'In Progress', 'pending_approval' -> 'Pending For Approval'
 */
export function formatStatusLabel(status: string | null | undefined): string {
  if (!status || status === 'null' || status === 'undefined') {
    return 'Not Available';
  }

  const statusMap: Record<string, string> = {
    // Execution & General Workflow
    in_progress: 'In Progress',
    not_started: 'Not Started',
    pending_approval: 'Pending For Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    draft: 'Draft',
    on_hold: 'On Hold',

    // General Master & Admin
    active: 'Active',
    inactive: 'Inactive',
    discontinued: 'Discontinued',
    on_leave: 'On Leave',

    // Vendors
    empanelled: 'Empanelled',
    suspended: 'Suspended',
    blocked: 'Blocked',

    // Finance & Budgets
    healthy: 'Healthy',
    near_limit: 'Near Limit',
    over_budget: 'Over Budget',
    revision_pending: 'Revision Pending',
    critical: 'Critical Overbudget',

    // Payments & Invoices
    unpaid: 'Unpaid',
    partially_paid: 'Partially Paid',
    paid: 'Paid',
    overdue: 'Overdue',
    scheduled: 'Scheduled',
    processing: 'Processing',
    processed: 'Processed',
    failed: 'Failed',
    cancelled: 'Cancelled',

    // Inventory
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
    reorder_required: 'Reorder Required',
    reserved: 'Reserved',
    excess_stock: 'Excess Stock',

    // Reports & Audit
    reconciled: 'Reconciled',
    partially_reconciled: 'Partially Reconciled',
    outstanding: 'Outstanding',
    success: 'Success',
    warning: 'Warning'
  };

  const normalized = String(status).toLowerCase().trim();
  if (statusMap[normalized]) {
    return statusMap[normalized];
  }

  // Fallback for unmapped underscores
  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Safely formats numeric currency values without ever producing NaN or ₹NaN.
 */
export function safeFormatCurrency(val: unknown): string {
  if (val === null || val === undefined || val === '') {
    return 'Not Available';
  }

  const num = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(num)) {
    return '₹0';
  }

  return formatIndianCurrency(num);
}

/**
 * Safely formats non-financial missing values.
 */
export function safeFormatText(val: unknown, fallback: string = 'Not Available'): string {
  if (val === null || val === undefined || val === '' || val === '--' || val === 'null' || val === 'undefined') {
    return fallback;
  }
  return String(val);
}

/**
 * Resolves color classes for status badges.
 */
export function getStatusStyle(status: string | null | undefined): { bg: string; text: string; border: string } {
  const norm = String(status || '').toLowerCase().trim();

  switch (norm) {
    case 'approved':
    case 'active':
    case 'empanelled':
    case 'healthy':
    case 'paid':
    case 'processed':
    case 'in_stock':
    case 'reconciled':
    case 'success':
    case 'completed':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };

    case 'pending_approval':
    case 'in_progress':
    case 'near_limit':
    case 'revision_pending':
    case 'partially_paid':
    case 'processing':
    case 'scheduled':
    case 'low_stock':
    case 'reorder_required':
    case 'partially_reconciled':
    case 'warning':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };

    case 'rejected':
    case 'inactive':
    case 'suspended':
    case 'blocked':
    case 'over_budget':
    case 'critical':
    case 'overdue':
    case 'failed':
    case 'cancelled':
    case 'out_of_stock':
    case 'outstanding':
    case 'discontinued':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };

    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-250' };
  }
}
