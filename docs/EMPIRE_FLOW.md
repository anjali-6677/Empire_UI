# Authoritative Empire Interior ERP Business Flow

`docs/EMPIRE_FLOW.md`

This document defines the strict, authoritative operating sequence for Empire Interior ERP based on Teams.pdf.

## Operating Sequence Overview

```
1. Master Data Setup
   ├── Categories & Configurable Factors
   ├── Products & Raw Materials with Base Prices
   └── Master Directories (Vendors, Subcontractors, Clients, Units, Employees)
        │
        ▼
2. CRM & Estimation Flow
   ├── Enquiry Intake
   ├── Estimate Builder (Base rates + Category factors + Override factors -> Landed Cost & Selling Rate)
   ├── Estimate Package Compilation (Proposed BOQ + Time Schedule + Payment Terms)
   ├── Submit Estimate to Client
   └── Client Decision:
        ├── Revised ──> Preserves V1 ──> Creates V2 (Version Comparison)
        ├── Rejected ──> Enquiry Marked Lost
        └── Accepted / Won ──> Enables Project Activation
             │
             ▼
3. Project & Planning Flow
   ├── Project Activation (Locks Accepted Estimate as Project BOQ Baseline)
   ├── Project Team Assignment & Lock (Director, Supervisor)
   ├── Project Schedule & Milestones Definition
   └── Project BOQ Tracking (BOQ vs Indented vs Ordered vs Received vs Issued vs Remaining)
        │
        ▼
4. Procurement Flow
   ├── Raise Material Indent
   ├── BOQ Limit Validation Check:
   │    ├── Within BOQ Limit ──> Proceed
   │    └── Exceeds BOQ Limit ──> Requires Exception Approval (Shows Over-limit % & Qty)
   └── Select Procurement Route:
        ├── Route A (Normal RFQ): Issue RFQ ──> Record 3+ Vendor Quotations ──> Rate Comparison Matrix ──> Select Rate & Issue PO
        └── Route B (Direct PO): Authorised Direct Purchase ──> Reason & Rate Validity ──> Issue PO
   └── Subcontractor Work Orders (Scope + BOQ line + Certification rules)
        │
        ▼
5. Inventory & Execution Flow
   ├── Purchase Order Delivery ──> GRN & Quality Check (Accepted vs Rejected Stock)
   ├── Accepted Stock ──> Immutable Stock Ledger Posting
   ├── Material Issue to Site / Activity ──> Project Material Consumption
   └── Subcontractor WIP Recording ──> Site Certification of WIP
        │
        ▼
6. Finance, Billing & Payments Flow
   ├── Vendor AP Invoices ──> 3-Way Matching (PO vs Accepted GRN vs Invoice) ──> Approval ──> Vendor Payment
   ├── Subcontractor Bills (Capped by Certified WIP) ──> Subcontractor Payment
   └── Project Milestone Reached ──> Client RA Bill Generation ──> Client Receipt
        │
        ▼
7. MIS & Executive Dashboard
   └── Transaction-driven KPI cards, financial metrics, charts, and 8 operational reports
```

## Business Rules & Principles
1. **Single Connected Data Source**: All modules read from one central store.
2. **Version Preservation**: Historical estimate versions (V1, V2) remain untouched when revised.
3. **Locked Baselines**: Accepted estimate becomes an immutable project BOQ snapshot.
4. **BOQ Enforcement**: Indents exceeding BOQ limits require explicit exception approval.
5. **Quality Separation**: Only accepted GRN stock enters usable inventory; rejected stock is quarantined.
6. **3-Way Matching**: Vendor invoices cannot exceed accepted and uninvoiced GRN quantities.
7. **Certified WIP Limit**: Subcontractor bills cannot claim more than certified WIP value.
