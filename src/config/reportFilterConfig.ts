export interface ReportFilterConfig {
  supportsSiteFilter: boolean;
  getSiteIds?: (row: any) => string[];
  supportsDateFilter: boolean;
  getDate?: (row: any) => string | null;
  supportsStatusFilter: boolean;
  getStatus?: (row: any) => string | null;
  supportsVendorFilter: boolean;
  getVendor?: (row: any) => string | null;
  supportsCategoryFilter: boolean;
  getCategory?: (row: any) => string | null;
  getSearchableText: (row: any) => string;
}

export function getReportFilterConfig(tabId: string, schemaId: string): ReportFilterConfig {
  // Default fallback accessor
  const defaultConfig: ReportFilterConfig = {
    supportsSiteFilter: true,
    getSiteIds: (r: any) => [r.siteId, r.site, r.siteName, r.destinationSite, r.sourceSite, r.relatedSite].filter(Boolean),
    supportsDateFilter: true,
    getDate: (r: any) => r.poDate || r.date || r.invoiceDate || r.paymentDate || r.loginDate || r.lastContactDate || r.billDate || null,
    supportsStatusFilter: true,
    getStatus: (r: any) => r.status || r.deliveryStatus || r.budgetHealth || r.authResult || r.workflowStatus || null,
    supportsVendorFilter: true,
    getVendor: (r: any) => r.vendor || r.vendorName || null,
    supportsCategoryFilter: true,
    getCategory: (r: any) => r.category || r.itemCategory || null,
    getSearchableText: (r: any) => Object.values(r).filter((v) => typeof v === 'string' || typeof v === 'number').join(' ')
  };

  // ==========================================
  // 1. PURCHASE REPORTS
  // ==========================================
  if (tabId === 'purchase-analysis' || schemaId === 'reports-purchase-analysis') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: true,
      getDate: (r: any) => r.poDate || null,
      supportsStatusFilter: true,
      getStatus: (r: any) => r.deliveryStatus || null,
      supportsVendorFilter: true,
      getVendor: (r: any) => r.vendor || null,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.poNumber, r.vendor, r.site, r.deliveryStatus].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'item-analysis') {
    return {
      supportsSiteFilter: false,
      supportsDateFilter: false,
      supportsStatusFilter: false,
      supportsVendorFilter: false,
      supportsCategoryFilter: true,
      getCategory: (r: any) => r.category || null,
      getSearchableText: (r: any) => [r.itemCode, r.item, r.category, r.unit].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'vendor-vs-item') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: false,
      supportsVendorFilter: true,
      getVendor: (r: any) => r.vendor || null,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.vendor, r.item, r.site].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'transfer-log') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.sourceSite, r.destinationSite].filter(Boolean),
      supportsDateFilter: true,
      getDate: (r: any) => r.date || null,
      supportsStatusFilter: true,
      getStatus: (r: any) => r.status || null,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.transferRef, r.item, r.sourceSite, r.destinationSite, r.status].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'consumption-log') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: true,
      getDate: (r: any) => r.date || null,
      supportsStatusFilter: false,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.consumptionRef, r.site, r.item, r.usedFor].filter(Boolean).join(' ')
    };
  }

  // ==========================================
  // 2. BUDGET REPORTS
  // ==========================================
  if (tabId === 'all-project' || schemaId === 'reports-budget-all') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: true,
      getStatus: (r: any) => r.status || null,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.site, r.status].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'vendor-budget') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: false,
      supportsVendorFilter: true,
      getVendor: (r: any) => r.vendor || null,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.vendor, r.site].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'project-budget') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: false,
      supportsVendorFilter: false,
      supportsCategoryFilter: true,
      getCategory: (r: any) => r.category || null,
      getSearchableText: (r: any) => [r.site, r.category].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'budget-summary') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: false,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.site].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'savings-analysis') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: false,
      supportsVendorFilter: false,
      supportsCategoryFilter: true,
      getCategory: (r: any) => r.itemCategory || null,
      getSearchableText: (r: any) => [r.site, r.itemCategory].filter(Boolean).join(' ')
    };
  }

  // ==========================================
  // 3. FINANCE REPORTS
  // ==========================================
  if (tabId === 'bill-payment') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: false,
      supportsVendorFilter: true,
      getVendor: (r: any) => r.vendor || null,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.vendor, r.site].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'net-amount') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: false,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.site].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'invoice-analysis') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: true,
      getDate: (r: any) => r.invoiceDate || null,
      supportsStatusFilter: true,
      getStatus: (r: any) => r.status || null,
      supportsVendorFilter: true,
      getVendor: (r: any) => r.vendor || null,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.invoiceNo, r.vendor, r.site, r.status].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'payment-analysis') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: true,
      getDate: (r: any) => r.paymentDate || null,
      supportsStatusFilter: true,
      getStatus: (r: any) => r.status || null,
      supportsVendorFilter: true,
      getVendor: (r: any) => r.vendor || null,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.paymentRef, r.vendor, r.site, r.paymentMode, r.status].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'fund-flow') {
    return {
      supportsSiteFilter: false,
      supportsDateFilter: false,
      supportsStatusFilter: false,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.month].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'vendor-liab') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: true,
      getStatus: (r: any) => r.liabilityStatus || null,
      supportsVendorFilter: true,
      getVendor: (r: any) => r.vendor || null,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.vendor, r.site, r.liabilityStatus].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'account-close') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: true,
      getStatus: (r: any) => r.closureStatus || null,
      supportsVendorFilter: true,
      getVendor: (r: any) => r.vendor || null,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.vendor, r.site, r.closureStatus].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'vendor-ledger') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: true,
      getDate: (r: any) => r.date || null,
      supportsStatusFilter: false,
      supportsVendorFilter: true,
      getVendor: (r: any) => r.vendor || null,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.date, r.vendor, r.site, r.transactionRef, r.transactionType].filter(Boolean).join(' ')
    };
  }

  // ==========================================
  // 4. ADMINISTRATION REPORTS
  // ==========================================
  if (tabId === 'login-time') {
    return {
      supportsSiteFilter: false,
      supportsDateFilter: true,
      getDate: (r: any) => r.loginDate || null,
      supportsStatusFilter: true,
      getStatus: (r: any) => r.authResult || r.status || null,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.user, r.userName, r.designation, r.ipAddress, r.device, r.authResult].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'activity-history') {
    return {
      supportsSiteFilter: false,
      supportsDateFilter: true,
      getDate: (r: any) => (r.timestamp ? r.timestamp.split(' ')[0] : null),
      supportsStatusFilter: true,
      getStatus: (r: any) => r.result || null,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.logRef, r.user, r.module, r.action, r.record, r.result].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'contacts-diary') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.relatedSite].filter(Boolean),
      supportsDateFilter: true,
      getDate: (r: any) => r.lastContactDate || null,
      supportsStatusFilter: false,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.name, r.organization, r.category, r.phone, r.email, r.relatedSite].filter(Boolean).join(' ')
    };
  }

  if (tabId === 'project-progress') {
    return {
      supportsSiteFilter: true,
      getSiteIds: (r: any) => [r.siteId, r.site].filter(Boolean),
      supportsDateFilter: false,
      supportsStatusFilter: true,
      getStatus: (r: any) => r.status || null,
      supportsVendorFilter: false,
      supportsCategoryFilter: false,
      getSearchableText: (r: any) => [r.site, r.projectManager, r.status].filter(Boolean).join(' ')
    };
  }

  return defaultConfig;
}
