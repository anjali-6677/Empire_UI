/**
 * Canonical Seed Data for Empire Interior ERP
 * Location: src/data/canonicalSeedData.ts
 */

import {
  DEMO_CLIENTS,
  DEMO_ENQUIRIES,
  DEMO_ESTIMATES,
  DEMO_TENDER_DECISIONS,
  DEMO_PROJECT_SETUP_DRAFTS,
  DEMO_PROJECTS,
  DEMO_PROJECT_BOQS,
  DEMO_PROJECT_BOQ_LINES,
  DEMO_PROJECT_SCHEDULES,
  DEMO_MATERIAL_INDENTS,
  DEMO_RFQS,
  DEMO_VENDOR_QUOTATIONS,
  DEMO_RATE_COMPARISONS,
  DEMO_PURCHASE_ORDERS,
  DEMO_DIRECT_PURCHASES,
} from './demoData';

export const CANONICAL_SEED_DATA: any = {
  categories: [
    { id: 'cat-1', code: 'CAT-WOOD', name: 'Wooden Joinery & Millwork', description: 'Doors, wall panelling, wardrobes', isActive: true, defaultFactorIds: ['fact-1', 'fact-2', 'fact-3'] },
    { id: 'cat-2', code: 'CAT-ELEC', name: 'Electrical & Lighting', description: 'Wiring, fixtures, conduits', isActive: true, defaultFactorIds: ['fact-1', 'fact-2'] },
    { id: 'cat-3', code: 'CAT-CIVIL', name: 'Civil & Tiling', description: 'Flooring, plaster, masonry', isActive: true, defaultFactorIds: ['fact-1', 'fact-2'] },
    { id: 'cat-4', code: 'CAT-PLUMB', name: 'Plumbing & Sanitary', description: 'Pipes, fittings, CPware', isActive: true },
    { id: 'cat-5', code: 'CAT-PAINT', name: 'Painting & Polishing', description: 'Emulsion, PU polish, primer', isActive: true },
  ],
  factors: [
    { id: 'fact-1', code: 'FACT-WAST', name: 'Wastage Factor', calculationType: 'percentage', defaultValue: 5, basis: 'materialCost', isActive: true, effectiveDate: '2026-01-01', displayOrder: 1 },
    { id: 'fact-2', code: 'FACT-FRGT', name: 'Freight & Transport', calculationType: 'percentage', defaultValue: 3, basis: 'materialCost', isActive: true, effectiveDate: '2026-01-01', displayOrder: 2 },
    { id: 'fact-3', code: 'FACT-HNDL', name: 'Site Handling & Storage', calculationType: 'percentage', defaultValue: 2, basis: 'materialCost', isActive: true, effectiveDate: '2026-01-01', displayOrder: 3 },
    { id: 'fact-4', code: 'FACT-OVER', name: 'Project Overhead', calculationType: 'percentage', defaultValue: 8, basis: 'subtotal', isActive: true, effectiveDate: '2026-01-01', displayOrder: 4 },
  ],
  products: [
    { id: 'prod-1', code: 'PRD-PLY-18', name: 'BWP Marine Plywood 18mm', categoryId: 'cat-1', unitId: 'unit-sqft', unitSymbol: 'sqft', basePrice: 125, basePriceEffectiveDate: '2026-01-01', brand: 'CenturyPly', isActive: true, lastPurchaseRate: 122, lastPurchaseDate: '2026-06-15' },
    { id: 'prod-2', code: 'PRD-VEN-04', name: 'Teak Wood Veneer 4mm', categoryId: 'cat-1', unitId: 'unit-sqft', unitSymbol: 'sqft', basePrice: 280, basePriceEffectiveDate: '2026-01-01', brand: 'Greenlam', isActive: true, lastPurchaseRate: 275, lastPurchaseDate: '2026-06-20' },
    { id: 'prod-3', code: 'PRD-LED-12W', name: 'Recessed LED Downlight 12W', categoryId: 'cat-2', unitId: 'unit-nos', unitSymbol: 'nos', basePrice: 650, basePriceEffectiveDate: '2026-01-01', brand: 'Philips', isActive: true },
    { id: 'prod-4', code: 'PRD-TILE-8080', name: 'Vitrified Floor Tile 800x800mm', categoryId: 'cat-3', unitId: 'unit-sqft', unitSymbol: 'sqft', basePrice: 95, basePriceEffectiveDate: '2026-01-01', brand: 'Kajaria', isActive: true },
    { id: 'prod-5', code: 'PRD-PNT-PU', name: 'PU Wood Finish Gloss Clear', categoryId: 'cat-5', unitId: 'unit-ltr', unitSymbol: 'ltr', basePrice: 420, basePriceEffectiveDate: '2026-01-01', brand: 'Asian Paints', isActive: true },
  ],
  units: [
    { id: 'unit-sqft', code: 'SQFT', name: 'Square Feet', symbol: 'sqft', isActive: true },
    { id: 'unit-nos', code: 'NOS', name: 'Numbers', symbol: 'nos', isActive: true },
    { id: 'unit-ltr', code: 'LTR', name: 'Liters', symbol: 'ltr', isActive: true },
    { id: 'unit-rmt', code: 'RMT', name: 'Running Meters', symbol: 'rmt', isActive: true },
    { id: 'unit-kg', code: 'KG', name: 'Kilograms', symbol: 'kg', isActive: true },
  ],
  vendors: [
    { id: 'ven-1', code: 'VND-001', vendorCode: 'VND-001', name: 'Empire Timber & Plywood Traders', category: 'Wooden Joinery & Millwork', approvedCategoryIds: ['cat-1'], gstin: '27AAAAA0000A1Z5', city: 'Mumbai', contactPerson: 'Ramesh Patel', phone: '+91 98200 12345', email: 'sales@empiretimber.com', rating: 'A+', paymentTermsDays: 30, status: 'empanelled', active: true },
    { id: 'ven-2', code: 'VND-002', vendorCode: 'VND-002', name: 'Apex Electricals Pvt Ltd', category: 'Electrical & Lighting', approvedCategoryIds: ['cat-2'], gstin: '27BBBBB1111B1Z2', city: 'Mumbai', contactPerson: 'Suresh Shah', phone: '+91 98201 54321', email: 'orders@apexelectricals.com', rating: 'A', paymentTermsDays: 45, status: 'empanelled', active: true },
    { id: 'ven-3', code: 'VND-003', vendorCode: 'VND-003', name: 'Global Ceramics & Tiles', category: 'Civil & Tiling', approvedCategoryIds: ['cat-3'], gstin: '27CCCCC2222C1Z9', city: 'Thane', contactPerson: 'Vikas Jain', phone: '+91 98202 98765', email: 'info@globalceramics.com', rating: 'B+', paymentTermsDays: 30, status: 'empanelled', active: true },
  ],
  subcontractors: [
    { id: 'sub-1', code: 'SUB-001', name: 'Reliable Carpentry Works', tradeCategory: 'Carpentry', gstin: '27DDDDD3333D1Z4', contactPerson: 'Aslam Khan', phone: '+91 98330 11223', email: 'aslam@reliablecarpentry.com', rating: 'A+', retentionPercentage: 5, status: 'active' },
    { id: 'sub-2', code: 'SUB-002', name: 'Shree Electrical Contractors', tradeCategory: 'Electrical', gstin: '27EEEEE4444E1Z1', contactPerson: 'Mahesh Shinde', phone: '+91 98331 44556', email: 'shreeelec@gmail.com', rating: 'A', retentionPercentage: 5, status: 'active' },
  ],
  employees: [
    { id: 'emp-1', code: 'EMP-001', name: 'Rajesh Sharma', departmentId: 'dept-eng', designationId: 'desig-dir', email: 'rajesh.sharma@empireinterior.com', phone: '+91 98210 11111', roleId: 'ROLE-DIRECTOR', joiningDate: '2020-01-15', status: 'active' },
    { id: 'emp-2', code: 'EMP-002', name: 'Amit Verma', departmentId: 'dept-eng', designationId: 'desig-sup', email: 'amit.verma@empireinterior.com', phone: '+91 98210 22222', roleId: 'ROLE-SUPERVISOR', joiningDate: '2021-03-01', status: 'active' },
    { id: 'emp-3', code: 'EMP-003', name: 'Priya Nair', departmentId: 'dept-est', designationId: 'desig-est', email: 'priya.nair@empireinterior.com', phone: '+91 98210 33333', roleId: 'ROLE-ESTIMATOR', joiningDate: '2022-06-10', status: 'active' },
    { id: 'emp-4', code: 'EMP-004', name: 'Sunil Mehta', departmentId: 'dept-proc', designationId: 'desig-proc', email: 'sunil.mehta@empireinterior.com', phone: '+91 98210 44444', roleId: 'ROLE-PROCUREMENT', joiningDate: '2021-09-01', status: 'active' },
  ],
  roles: [
    { id: 'role-dir', roleId: 'ROLE-DIRECTOR', name: 'Project Director', description: 'Overall project approval and exception signoff', permissions: ['*'] },
    { id: 'role-sup', roleId: 'ROLE-SUPERVISOR', name: 'Project Supervisor', description: 'Site execution and WIP measurement', permissions: ['projects:edit', 'wip:create', 'grn:create'] },
    { id: 'role-est', roleId: 'ROLE-ESTIMATOR', name: 'Estimator', description: 'CRM enquiry intake and estimate generation', permissions: ['crm:create', 'estimates:create'] },
    { id: 'role-proc', roleId: 'ROLE-PROCUREMENT', name: 'Procurement Officer', description: 'RFQs, vendor quotations, rate comparison, and PO generation', permissions: ['procurement:all'] },
  ],
  approvalRules: [
    { id: 'app-1', documentType: 'indent', requiresOverLimitApproval: true, approverRoleIds: ['ROLE-DIRECTOR'] },
    { id: 'app-2', documentType: 'po', minAmount: 500000, approverRoleIds: ['ROLE-DIRECTOR'] },
  ],

  // Controlled v2 Demo Data Collections
  clients: DEMO_CLIENTS,
  enquiries: DEMO_ENQUIRIES,
  estimates: DEMO_ESTIMATES,
  tenderDecisions: DEMO_TENDER_DECISIONS,
  projectSetupDrafts: DEMO_PROJECT_SETUP_DRAFTS,
  projects: DEMO_PROJECTS,
  projectBOQs: DEMO_PROJECT_BOQS,
  projectBOQLines: DEMO_PROJECT_BOQ_LINES,
  projectSchedule: DEMO_PROJECT_SCHEDULES,
  indents: DEMO_MATERIAL_INDENTS,
  materialIndents: DEMO_MATERIAL_INDENTS,
  rfqs: DEMO_RFQS,
  vendorQuotations: DEMO_VENDOR_QUOTATIONS,
  rateComparisons: DEMO_RATE_COMPARISONS,
  purchaseOrders: DEMO_PURCHASE_ORDERS,
  directPurchases: DEMO_DIRECT_PURCHASES,
  grns: [],
  stockLedger: [],
  materialIssues: [],
  subcontractorWIPs: [],
  vendorInvoices: [],
  vendorPayments: [],
  subcontractorBills: [],
  subcontractorPayments: [],
  clientRABills: [],
  clientReceipts: [],
  auditEvents: [],
};
