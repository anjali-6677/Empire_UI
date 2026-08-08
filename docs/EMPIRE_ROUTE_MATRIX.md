# Target Route Matrix & Navigation Mapping

`docs/EMPIRE_ROUTE_MATRIX.md`

This document maps all target Empire Interior ERP routes, their legacy URLs, redirect strategy, and component handlers.

## Route Matrix

| Category | Target Route | Old Route / Legacy URL | Handling Strategy | Component / View |
| :--- | :--- | :--- | :--- | :--- |
| **Overview** | `/` | `/` | Keep | `Dashboard.tsx` |
| **Overview** | `/overview/my-tasks` | `/overview/my-tasks` | Keep | `MyTasksPage.tsx` |
| **Overview** | `/overview/notifications` | `/overview/notifications` | Keep | `NotificationsPage.tsx` |
| **Overview** | `/overview/calendar` | `/overview/calendar` | Keep | `CalendarPage.tsx` |
| **Overview** | `/overview/messages` | `/overview/messages` | Keep | `MessagesPage.tsx` |
| **CRM & Estimation** | `/crm/enquiries` | New | Add | `EnquiriesPage.tsx` |
| **CRM & Estimation** | `/crm/estimates` | New | Add | `EstimateBuilderPage.tsx` |
| **CRM & Estimation** | `/crm/estimate-versions` | New | Add | `EstimateVersionsPage.tsx` |
| **CRM & Estimation** | `/crm/tender-decisions` | New | Add | `TenderDecisionsPage.tsx` |
| **Projects & Planning**| `/projects/active` | `/projects/list` | Redirect / Alias | `ActiveProjectsPage.tsx` |
| **Projects & Planning**| `/projects/overview` | `/projects/site-details` | Redirect / Alias | `ProjectOverviewPage.tsx` |
| **Projects & Planning**| `/projects/team` | `/projects/teams` | Redirect / Alias | `ProjectTeamPage.tsx` |
| **Projects & Planning**| `/projects/boq` | New | Add | `ProjectBOQPage.tsx` |
| **Projects & Planning**| `/projects/schedule` | New | Add | `ProjectSchedulePage.tsx` |
| **Projects & Planning**| `/projects/milestones` | New | Add | `ProjectMilestonesPage.tsx` |
| **Projects & Planning**| `/projects/map` | `/projects/map` | Keep | `ProjectMap.tsx` |
| **Procurement** | `/procurement/indents` | `/procurement/indents` | Keep | `MaterialIndentsPage.tsx` |
| **Procurement** | `/procurement/indent-approvals`| New | Add | `IndentApprovalsPage.tsx` |
| **Procurement** | `/procurement/rfqs` | `/procurement/rfqs` | Keep | `MaterialRFQsPage.tsx` |
| **Procurement** | `/procurement/vendor-quotations` | New | Add | `VendorQuotationsPage.tsx` |
| **Procurement** | `/procurement/rate-comparison` | `/procurement/rate-comparison` | Keep | `RateComparisonPage.tsx` |
| **Procurement** | `/procurement/rate-finalisation` | New | Add | `RateFinalisationPage.tsx` |
| **Procurement** | `/procurement/direct-purchase` | New | Add | `DirectPurchasePage.tsx` |
| **Procurement** | `/procurement/purchase-orders` | `/procurement/purchase-orders` | Keep | `PurchaseOrdersPage.tsx` |
| **Procurement** | `/procurement/work-orders` | `/procurement/work-orders` | Keep | `WorkOrdersPage.tsx` |
| **Procurement** | `/procurement/historical-rates` | New | Add | `HistoricalRatesPage.tsx` |
| **Inventory & Execution**| `/inventory/grns` | `/procurement/grns` | Redirect / Alias | `GRNQualityCheckPage.tsx` |
| **Inventory & Execution**| `/inventory/stock-ledger` | `/procurement/inventory` | Redirect / Alias | `StockLedgerPage.tsx` |
| **Inventory & Execution**| `/inventory/material-issues` | New | Add | `MaterialIssuesPage.tsx` |
| **Inventory & Execution**| `/inventory/consumption` | New | Add | `SiteConsumptionPage.tsx` |
| **Inventory & Execution**| `/execution/subcontractor-wip` | New | Add | `SubcontractorWIPPage.tsx` |
| **Inventory & Execution**| `/execution/wip-certification`| New | Add | `WIPCertificationPage.tsx` |
| **Finance & Billing** | `/finance/vendor-invoices` | `/finance/invoices` | Redirect / Alias | `VendorAPInvoicesPage.tsx` |
| **Finance & Billing** | `/finance/vendor-payments` | `/finance/payments` | Redirect / Alias | `VendorPaymentsPage.tsx` |
| **Finance & Billing** | `/finance/subcontractor-bills` | New | Add | `SubcontractorBillsPage.tsx` |
| **Finance & Billing** | `/finance/subcontractor-payments`| New | Add | `SubcontractorPaymentsPage.tsx` |
| **Finance & Billing** | `/finance/client-ra-bills` | New | Add | `ClientRABillsPage.tsx` |
| **Finance & Billing** | `/finance/client-receipts` | New | Add | `ClientReceiptsPage.tsx` |
| **Masters** | `/masters/categories-factors` | `/masters/item-categories` | Redirect / Alias | `CategoriesFactorsPage.tsx` |
| **Masters** | `/masters/products-materials` | `/masters/items` | Redirect / Alias | `ProductsMaterialsPage.tsx` |
| **Masters** | `/masters/vendors` | `/masters/vendors` | Keep | `VendorsPage.tsx` |
| **Masters** | `/masters/subcontractors` | New | Add | `SubcontractorsPage.tsx` |
| **Masters** | `/masters/clients` | `/masters/clients` | Keep | `ClientsPage.tsx` |
| **Masters** | `/masters/units` | `/masters/units` | Keep | `UnitsPage.tsx` |
| **Masters** | `/masters/users-employees` | `/masters/employees` | Redirect / Alias | `UsersEmployeesPage.tsx` |
| **MIS & Reports** | `/reports/project-financial` | `/reports/budget` | Redirect / Alias | `ProjectFinancialReport.tsx` |
| **MIS & Reports** | `/reports/procurement-performance`| `/reports/purchase` | Redirect / Alias | `ProcurementPerformanceReport.tsx` |
| **MIS & Reports** | `/reports/material-consumption` | New | Add | `MaterialConsumptionReport.tsx` |
| **MIS & Reports** | `/reports/vendor-outstanding` | `/reports/finance` | Redirect / Alias | `VendorOutstandingReport.tsx` |
| **MIS & Reports** | `/reports/subcontractor-outstanding`| New | Add | `SubcontractorOutstandingReport.tsx` |
| **MIS & Reports** | `/reports/client-billing-receipts` | New | Add | `ClientBillingReceiptsReport.tsx` |
| **MIS & Reports** | `/reports/project-margin` | New | Add | `ProjectMarginReport.tsx` |
| **MIS & Reports** | `/reports/schedule-performance` | New | Add | `SchedulePerformanceReport.tsx` |
| **Administration** | `/admin/departments` | `/masters/departments` | Redirect / Alias | `DepartmentsPage.tsx` |
| **Administration** | `/admin/designations` | `/masters/designations` | Redirect / Alias | `DesignationsPage.tsx` |
| **Administration** | `/admin/roles` | `/admin/roles` | Keep | `RolesPage.tsx` |
| **Administration** | `/admin/permissions` | `/admin/permissions` | Keep | `PermissionsMatrix.tsx` |
| **Administration** | `/admin/approval-matrix` | New | Add | `ApprovalMatrixPage.tsx` |
| **Administration** | `/admin/settings` | `/admin/settings` | Keep | `AppSettings.tsx` |
