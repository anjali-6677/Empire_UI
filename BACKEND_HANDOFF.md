# Empire Interior — Backend Handoff & API Specification

This document details the architectural contracts, data schemas, entity relationships, workflow state transitions, and expected REST API endpoints required to transition the Empire ERP frontend to a full-stack backend service.

---

## 1. Overview of Frontend Modules

The frontend consists of **27 fully integrated ERP modules** grouped under 6 core functional domains:

1. **Executive & Site Overview**: Dashboard, Project Sites (`/sites`), Site Details (`/sites/:id`), Project Map (`/projects/map`), Project Teams (`/projects/teams`), Tenders (`/projects/tenders`).
2. **Procurement Lifecycle**: Indents (`/procurement/indents`), RFQs (`/procurement/rfqs`), Quotations, Rate Comparisons (`/procurement/rate-comparison`), Purchase Orders (`/procurement/purchase-orders`), Work Orders (`/procurement/work-orders`), GRNs (`/procurement/grns`), Material Inventory (`/procurement/inventory`).
3. **Financial Management & Accounting**: Vendor Invoices (`/finance/invoices`), Payment Requests (`/finance/payment-requests`), Disbursements (`/finance/payments`), Vendor On-Account & Advances (`/finance/on-account`), Master Budgets (`/finance/budgets`), Budget Transfers (`/finance/budget-transfers`), Utility Split (`/finance/utility-bills`), Salary Disbursal & Split (`/finance/salary`), Credit/Debit Notes.
4. **Master Registries**: Companies, Clients, Vendors, Employees, Users, Item Master, Item Categories, Units, Bank Accounts, Departments, Roles, Designations, Brands, Locations, PMCs, Architects.
5. **System Reports**: Purchase Analytics, Budget Outlay Reports, Financial Ledger Reports, Administration Session & Audit Trail Reports (`/reports/*`).
6. **Collaboration & Governance**: Tasks (`/overview/my-tasks`), Notifications (`/overview/notifications`), Calendar (`/overview/calendar`), Messages (`/overview/messages`), User Roles & Permissions Matrix (`/administration/permissions`).

---

## 2. Core Entity Relationships & Canonical IDs

The backend database must maintain foreign-key referential integrity using these canonical string IDs:

| Entity | ID Prefix | Primary Foreign Keys | Description |
|---|---|---|---|
| Company | `c-1`, `c-2` | — | Internal contracting legal entity |
| Client | `cl-1` .. `cl-6` | — | Customer entity commissioning projects |
| Vendor | `v-1` .. `v-8` | `categoryId` | Material supplier or subcontractor |
| Site | `site-1` .. `site-6` | `clientId`, `companyId` | Physical construction site location |
| Project | `p-1` .. `p-6` | `siteId`, `clientId`, `projectManagerId` | Construction project record |
| Indent | `ind-1` .. `ind-8` | `siteId`, `requesterId` | Material requisition request |
| RFQ | `rfq-1` .. `rfq-6` | `siteId`, `indentId` | Request for Quotation sent to vendors |
| Purchase Order | `po-1` .. `po-6` | `siteId`, `selectedVendorId`, `rfqId` | Binding commercial purchase contract |
| GRN | `grn-1` .. `grn-8` | `siteId`, `purchaseOrderId`, `vendorId` | Goods Received Note at site |
| Vendor Invoice | `inv-1` .. `inv-10` | `siteId`, `vendorId`, `purchaseOrderId` | Commercial vendor tax invoice |
| Payment Request | `pr-1` .. `pr-8` | `siteId`, `vendorId`, `invoiceId` | Disbursal approval request |
| Vendor Payment | `pay-1` .. `pay-7` | `siteId`, `vendorId`, `invoiceId` | Processed bank transfer/RTGS |
| Vendor On-Account | `vob-1` .. `vob-3` | `vendorId`, `siteId` | Empanelled vendor advance fund balance |
| Site On-Account | `sob-1` .. `sob-3` | `siteId` | Project site advance fund balance |
| On-Account Txn | `oat-1` .. `oat-3` | `vendorId`, `sourceSiteId`, `destinationSiteId` | Advance receipt, allocation, or transfer |

---

## 3. Key TypeScript Data Interfaces

### Vendor On-Account Balance (`VendorOnAccountBalance`)
```typescript
interface VendorOnAccountBalance {
  id: string;
  vendorId: string;
  vendorName: string;
  siteId: string;
  siteName: string;
  originalAmount: number;
  allocatedToInvoices: number;
  transferredAmount: number;
  availableBalance: number;
  lastTransactionDate: string;
  status: 'active' | 'fully_allocated' | 'closed';
}
```

### Site On-Account Balance (`SiteOnAccountBalance`)
```typescript
interface SiteOnAccountBalance {
  id: string;
  siteId: string;
  siteName: string;
  receivedAmount: number;
  allocatedToInvoices: number;
  transferredIn: number;
  transferredOut: number;
  availableBalance: number;
  lastUpdatedDate: string;
}
```

### On-Account Transaction (`OnAccountTransaction`)
```typescript
interface OnAccountTransaction {
  id: string;
  transactionReference: string;
  transactionDate: string;
  transactionType: 'receipt' | 'invoice_allocation' | 'inter_site_transfer' | 'vendor_transfer';
  sourceSiteId?: string;
  sourceSiteName?: string;
  destinationSiteId?: string;
  destinationSiteName?: string;
  vendorId?: string;
  vendorName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'processed';
}
```

---

## 4. Business Workflow State Transitions

1. **Site Approval Chain**:
   `draft` ➔ `pending_approval` (triggers 4-tier decision workflow: Accounting Head ➔ Chairman ➔ Project Head ➔ Engineering Head) ➔ `approved` or `rejected` ➔ `tender` ➔ `active` ➔ `completed`.
2. **Procurement Pipeline**:
   `Indent` (`pending_approval` ➔ `approved`) ➔ `RFQ` (`sent` ➔ `quotations_received` ➔ `compared`) ➔ `Purchase Order` (`draft` ➔ `approved` ➔ `sent`) ➔ `GRN` (`inspected` ➔ `accepted`) ➔ `Vendor Invoice` (`pending_approval` ➔ `approved` ➔ `certified`) ➔ `Payment Request` ➔ `Disbursal` (`processed`).
3. **On-Account Advance Lifecycle**:
   `Advance Receipt` ➔ `Vendor On-Account Balance` ➔ `Invoice Allocation` (reduces invoice outstanding & vendor advance balance) or `Inter-Site Transfer` (relocates advance between sites).

---

## 5. Fields Calculated in Frontend (Backend Candidate Metrics)

The backend should compute and serve the following derived fields:

- `availableBalance` = `originalAmount` - `allocatedToInvoices` - `transferredAmount`
- `outstandingAmount` = `certifiedAmount` - `creditNoteAmount` + `debitNoteAmount` - `paidAmount`
- `progressPercentage` = Weighted sum of completed site milestones
- `sessionDurationMinutes` = Calculated from login/logout timestamps
- Card KPI Summaries = Sums and counts over filtered collections

---

## 6. Recommended REST API Endpoints

```
GET /api/v1/projects                  # List active projects
GET /api/v1/sites                     # List project sites
POST /api/v1/sites                    # Register new site
PATCH /api/v1/sites/:id/approve       # Submit multi-level site approval
GET /api/v1/finance/on-account        # Get vendor & site on-account balances
POST /api/v1/finance/on-account/transfer # Process inter-site advance transfer
POST /api/v1/finance/on-account/allocate # Allocate advance to vendor invoice
GET /api/v1/reports/administration    # Get session duration & login audit report
```

---

## 7. Authentication & Deployment Notes

- **Current State**: Frontend uses client-side mock user session (Rajesh Kumar / Admin) in `WorkflowContext`.
- **Backend Handoff**: Replace `WorkflowContext` in-memory initial state with REST API calls / React Query / SWR fetching from backend services.
- **Netlify SPA Rewrite**: `public/_redirects` ensures `/* /index.html 200` is preserved so client-side routing functions correctly under direct URL visits.
