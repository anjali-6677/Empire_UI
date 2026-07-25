# Empire Interior — ERP Core Portal

Empire Interior ERP is an end-to-end, enterprise-grade interior contracting management platform designed for multi-site project execution, procurement lifecycle management, financial accounting, vendor advances, site budgeting, and organizational administration.

---

## 🛠️ Technology Stack

- **Core Framework**: React 18 + TypeScript (Strict Mode)
- **Build Tool**: Vite 5
- **Styling**: Vanilla TailwindCSS + Custom CSS tokens
- **UI Components & Icons**: Radix UI Dropdown / Modal Primitives & Lucide Icons
- **Data Visualization**: Recharts
- **Routing**: React Router v6 (SPA with Netlify rewrite fallback)

---

## 🚀 Quick Start & Development Commands

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Access the application locally at `http://localhost:3001` or `http://localhost:5173`.

### TypeScript Verification
```bash
npx tsc --noEmit
```

### Production Build
```bash
npm run build
```
Generates production-optimized static bundle under `/dist`.

### Netlify SPA Deployment
Single-page application routing is configured via `public/_redirects`:
```
/*  /index.html  200
```
This ensures direct URL navigation and hard browser refresh work seamlessly across all sub-routes on Netlify.

---

## 🏛️ Application Architecture

### 1. Centralized Data Engine (`WorkflowContext`)
All 27 business collections (Companies, Clients, Vendors, Projects, Sites, Indents, RFQs, Quotations, POs, Work Orders, Invoices, Payments, On-Account Balances, Budgets, Utility Bills, Salary Batches, Tasks, Notifications, Calendar) are initialized from a single connected demonstration dataset (`src/data/connectedDemoData.ts`) and managed statefully in memory via `WorkflowContext.tsx`.

### 2. Multi-Level Site Workflow Engine (`SitesContext`)
Manages site creation, tender conversions, and 4-tier approval decision matrix (Accounting Head, Chairman, Project Head, Engineering Head).

### 3. Schema-Driven Presentation Layer (`ModulePageRenderer`)
ERP pages are driven dynamically by schemas defined in `src/config/moduleSchemas.ts`.
- **`GenericListPage`**: Handles tabular listings, status tabs, search, export to CSV, and context-aware action menus.
- **`GenericFormPage`**: Handles multi-section registration forms and item tables.
- **`GenericDetailsPage`**: Handles record header metadata, timeline audit trails, and linked sub-records.
- **`GenericReportPage`**: Handles analytics visualization with custom Recharts graphs, date filtering, and KPI summaries.

---

## 🔑 Canonical Route Configuration

Canonical route definitions are centralized in `src/config/navigation.ts`:
- `/projects/list` — Active Construction Projects Registry
- `/sites` — Master Project Sites
- `/procurement/indents` — Material & Indent Requisitions
- `/procurement/rfqs` — Request for Quotations
- `/procurement/purchase-orders` — Purchase Orders
- `/procurement/work-orders` — Work Orders
- `/finance/invoices` — Vendor Invoices & Certification
- `/finance/payments` — Disbursal & Bank Ledger
- `/finance/on-account` — Vendor Advances & On-Account Fund Ledger
- `/finance/budgets` — Master Project Budgets
- `/finance/utility-bills` — Utility Allocation Split
- `/finance/salary` — Employee Payroll & Salary Split
- `/reports/*` — Module Analytics & Audit Reports

---

## ⚠️ Demo Data Behavior & Refresh Limitation

All state mutations (creating indents, approving purchase orders, processing on-account allocations, updating project progress) take place in-memory within `WorkflowContext`.
- **State Reset**: Reloading the browser page resets the application back to the initial connected demo dataset.
- **Backend Handoff**: Refer to `BACKEND_HANDOFF.md` for REST API endpoints, database schemas, and expected backend integration points.
