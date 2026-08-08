# Empire Interior ERP Frontend Audit Report

`docs/EMPIRE_FRONTEND_AUDIT.md`

This document provides a comprehensive audit of the existing features, routes, data sources, implementation types, and required migration actions to align the Empire Interior ERP frontend with the authoritative company sequence (Teams.pdf).

## Audit Summary Table

| Existing Feature | Existing Route | Current Implementation Type | Current Data Source | Company-Flow Stage | Action | Missing Behaviour |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Site Dashboard** | `/` | Custom Page (`Dashboard.tsx`) | `dashboardAnalyticsData.ts` & `SitesContext` | Overview / Executive Dashboard | **Refactor** | KPI cards & charts must read dynamically from central transaction store selectors instead of static mock data. |
| **My Tasks** | `/overview/my-tasks` | Custom Page (`MyTasksPage.tsx`) | `WorkflowContext` (`tasks`) | Overview | **Keep & Reconnect** | Enforce role-based filter and status action buttons. |
| **Notifications** | `/overview/notifications` | Custom Page (`NotificationsPage.tsx`) | `WorkflowContext` (`alerts`) | Overview | **Keep & Reconnect** | Link notifications directly to operational document views. |
| **Calendar** | `/overview/calendar` | Custom Page (`CalendarPage.tsx`) | `WorkflowContext` (`calendarEvents`) | Overview | **Keep & Reconnect** | Auto-generate event dates from project milestones, PO expected deliveries, and invoice due dates. |
| **Messages** | `/overview/messages` | Custom Page (`MessagesPage.tsx`) | `WorkflowContext` (`messages`) | Overview | **Keep & Reconnect** | Link conversation channels to project sites. |
| **Enquiries** | `/crm/enquiries` (new) | Generic List | `MODULE_SCHEMAS` | CRM & Estimation | **New / Add** | Enquiry intake form, status tracking (New -> Estimating -> Submitted -> Won -> Lost). |
| **Estimate Builder** | `/crm/estimates` (new) | Purpose-built Page | Central Store | CRM & Estimation | **New / Add** | Material selection, base prices, default category factors, estimate factor overrides, landed cost calculation, margin calculation, package compilation. |
| **Estimate Versions** | `/crm/estimate-versions` (new) | Purpose-built Page | Central Store | CRM & Estimation | **New / Add** | Version history, version comparison (V1 vs V2), preserving historical snapshots upon revision request. |
| **Tender Decisions** | `/crm/tender-decisions` (new) | Purpose-built Page | Central Store | CRM & Estimation | **New / Add** | Record Client Acceptance/Rejection/Revision decision. Client Acceptance enables Project Activation. |
| **Active Projects** | `/projects/list` / `/projects/active` | Generic List (`ModulePageRenderer`) | `connectedDemoData` / `WorkflowContext` | Projects & Planning | **Refactor** | Only active projects converted from won tenders appear here. |
| **Sites & Create Site** | `/sites`, `/sites/new` | Custom Pages (`Sites.tsx`, `CreateSite.tsx`) | `SitesContext` | Projects & Planning | **Refactor** | Integrate site creation into Project Activation flow; connect approval workflow to single store. |
| **Site Details** | `/projects/site-details` | Custom Page (`SiteDetails.tsx`) | `SitesContext` / `WorkflowContext` | Projects & Planning | **Refactor** | Display linked BOQ, schedule, milestones, team, indents, work orders, and financial summary. |
| **Project Teams** | `/projects/teams` | Generic List (`ModulePageRenderer`) | `connectedDemoData` | Projects & Planning | **Replace / Refactor** | Purpose-built Team Lock interface with Project Director & Project Supervisor roles locked upon activation. |
| **Tender Details** | `/projects/tenders` | Generic List (`ModulePageRenderer`) | `connectedDemoData` | Projects & Planning | **Refactor** | Map to CRM Tender submittals and extra item tenders. |
| **Project BOQ** | `/projects/boq` (new) | Purpose-built Page | Central Store | Projects & Planning | **New / Add** | Locked BOQ baseline snapshot from accepted estimate. Track BOQ vs Indented vs Ordered vs Received vs Issued vs Remaining. |
| **Project Schedule** | `/projects/schedule` (new) | Purpose-built Page | Central Store | Projects & Planning | **New / Add** | Activity schedule, start/end dates, milestone links, % complete, status, delay tracking. |
| **Project Milestones** | `/projects/milestones` (new) | Purpose-built Page | Central Store | Projects & Planning | **New / Add** | Milestone definitions linked to Client RA billing triggers. |
| **Project Map** | `/projects/map` | Custom Page (`ProjectMap.tsx`) | `SitesContext` | Projects & Planning | **Keep** | Geo-visualization of sites. Kept as secondary view. |
| **Material Indents** | `/procurement/indents` | Generic List & Schema Details | `WorkflowContext` | Procurement | **Refactor** | Real-time BOQ limit validation. If indent qty > available BOQ qty, require exception approval and display over-limit %. |
| **Indent Approvals** | `/procurement/indent-approvals` (new) | Purpose-built Queue | Central Store | Procurement | **New / Add** | Approval queue for over-limit indents and high-value requisitions. |
| **Material RFQs** | `/procurement/rfqs` | Generic List & Schema Details | `WorkflowContext` | Procurement | **Refactor** | Generate RFQ from approved indent; track invited vendors and quote due dates. |
| **Vendor Quotations** | `/procurement/vendor-quotations` (new) | Purpose-built Form | Central Store | Procurement | **New / Add** | Record 3+ vendor bids against RFQ lines with basic rate, discount, tax, freight, lead time, and payment terms. |
| **Rate Comparison** | `/procurement/rate-comparison` | Generic Report (`MODULE_SCHEMAS`) | `connectedDemoData` | Procurement | **Replace / Refactor** | Dedicated interactive rate comparison matrix. Highlight L1 vendor, compare against last purchase rate, select vendor, issue PO. |
| **Direct Purchase** | `/procurement/direct-purchase` (new) | Dedicated Form | Central Store | Procurement | **New / Add** | Direct PO creation bypassing RFQ with mandatory permission check, justification reason, rate validity date, and audit log. |
| **Purchase Orders** | `/procurement/purchase-orders` | Generic List & Schema Details | `WorkflowContext` | Procurement | **Refactor** | Retain source RFQ/Direct PO references; track statuses (Draft -> Approved -> Issued -> Partial GRN -> Closed). |
| **Work Orders** | `/procurement/work-orders` | Generic List & Schema Details | `WorkflowContext` | Procurement | **Refactor** | Separate subcontractor WO stream from material POs. Include scope, retention %, certification rules, planned dates. |
| **Historical Rates** | `/procurement/historical-rates` (new) | Analytics Table | Central Store | Procurement | **New / Add** | Item purchase rate history across vendors and dates for estimation and rate evaluation. |
| **GRNs & Quality Checks** | `/procurement/grns` / `/inventory/grns` | Generic List (`ModulePageRenderer`) | `connectedDemoData` | Inventory & Execution | **Replace / Refactor** | Dedicated GRN entry page with line-by-line Accepted vs Rejected quantity inspection. Immutable stock ledger posting. |
| **Stock Ledger** | `/inventory/stock-ledger` (new) | Ledger Table | Central Store | Inventory & Execution | **New / Add** | Calculated stock balance = Opening + GRN Accepted - Material Issue. No static available stock. |
| **Material Issues** | `/inventory/material-issues` (new) | Dedicated Form & List | Central Store | Inventory & Execution | **New / Add** | Issue material from site stock to BOQ work activity. Prevent issuing more than available stock. |
| **Subcontractor WIP** | `/execution/subcontractor-wip` (new) | Purpose-built Form & List | Central Store | Inventory & Execution | **New / Add** | Subcontractor measured WIP entry with completion %, site evidence, and measurement notes. |
| **WIP Certification** | `/execution/wip-certification` (new) | Dedicated Signoff Page | Central Store | Inventory & Execution | **New / Add** | Site engineer / director certification of measured WIP. Certified WIP forms cap for subcontractor bills. |
| **Vendor AP Invoices** | `/finance/invoices` | Generic List (`ModulePageRenderer`) | `WorkflowContext` | Finance, Billing & Payments | **Replace / Refactor** | 3-way matching interface (PO vs Accepted GRN vs Invoice). Display match status (Matched, Rate Mismatch, Qty Overrun Risk). |
| **Vendor Payments** | `/finance/payments` | Generic List & Details | `WorkflowContext` | Finance, Billing & Payments | **Refactor** | Approved invoice selection, partial payment, deduction/retention recording, bank account reference. |
| **Subcontractor Bills** | `/finance/subcontractor-bills` (new) | Dedicated Page | Central Store | Finance, Billing & Payments | **New / Add** | Subcontractor billing based exclusively on certified WIP. |
| **Subcontractor Payments**| `/finance/subcontractor-payments` (new)| Dedicated Page | Central Store | Finance, Billing & Payments | **New / Add** | Payment disbursement against certified subcontractor bills. |
| **Client RA Bills** | `/finance/client-ra-bills` (new) | Purpose-built Page | Central Store | Finance, Billing & Payments | **New / Add** | Running Account bill generator linked to project milestone completion. Track previous billed, current claimed, certified revenue. |
| **Client Receipts** | `/finance/client-receipts` (new) | Dedicated Form & List | Central Store | Finance, Billing & Payments | **New / Add** | Record client payment receipts against RA bills, bank account, and TDS deductions. |
| **Categories & Factors** | `/masters/categories-factors` | Generic List (`MODULE_SCHEMAS`) | `connectedDemoData` | Masters | **Refactor** | Category master with configurable default percentage factors (Wastage, Freight, Handling, Installation, Overhead, Profit, Contingency). |
| **Products & Raw Materials**| `/masters/products-materials` | Generic List (`MODULE_SCHEMAS`) | `connectedDemoData` | Masters | **Refactor** | Product/material master with code, base price, effective date, category factors, price history. |
| **Vendors** | `/masters/vendors` | Generic List | `connectedDemoData` | Masters | **Keep & Reconnect** | Vendor directory with ratings, categories, and payment terms. |
| **Subcontractors** | `/masters/subcontractors` (new)| Generic List | Central Store | Masters | **New / Add** | Subcontractor master directory. |
| **Clients** | `/masters/clients` | Generic List | `connectedDemoData` | Masters | **Keep & Reconnect** | Client organization directory. |
| **Units** | `/masters/units` | Generic List | `connectedDemoData` | Masters | **Keep & Reconnect** | Unit of measurement master. |
| **Users & Employees** | `/masters/users-employees` | Generic List | `connectedDemoData` | Masters | **Keep & Reconnect** | Personnel and user account directory with role assignments. |
| **MIS & Reports** | `/reports/*` | Generic Reports | `connectedDemoData` | MIS & Reports | **Refactor** | Connect all 8 required reports directly to transaction selectors over single central store. |
| **Administration** | `/admin/*` | Custom Pages | `connectedDemoData` | Administration | **Keep & Reconnect** | Roles, permissions matrix, approval rules, system settings. |
