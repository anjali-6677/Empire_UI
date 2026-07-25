/**
 * connectedDemoData.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all Empire Interior ERP demonstration data.
 * Every collection is typed and interconnected via stable ID references.
 * Presentation config (columns, labels, routes) stays in moduleSchemas.ts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── MASTER: COMPANIES ────────────────────────────────────────────────────────

export interface CompanyRecord {
  id: string;
  code: string;
  legalName: string;
  tradingName: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  defaultBankAccountId: string;
  status: string;
}

export const COMPANIES: CompanyRecord[] = [
  {
    id: 'cmp-1', code: 'CMP-01',
    legalName: 'Empire Interior Contracting Pvt Ltd',
    tradingName: 'Empire Interior',
    gstin: '29AAACE1234A1Z5', pan: 'AAACE1234A',
    address: '42, Indiranagar 100 Feet Road', city: 'Bengaluru', state: 'Karnataka',
    email: 'info@empireinterior.in', phone: '+91 80 4100 2200',
    defaultBankAccountId: 'bnk-1', status: 'active'
  },
  {
    id: 'cmp-2', code: 'CMP-02',
    legalName: 'Empire Joinery & Furniture Works',
    tradingName: 'Empire Joinery',
    gstin: '29AAACE5678B2Z4', pan: 'AAACE5678B',
    address: '18, KIADB Industrial Area, Peenya', city: 'Bengaluru', state: 'Karnataka',
    email: 'joinery@empiregroup.in', phone: '+91 80 2839 1100',
    defaultBankAccountId: 'bnk-2', status: 'active'
  },
  {
    id: 'cmp-3', code: 'CMP-03',
    legalName: 'Empire Construction Ltd',
    tradingName: 'Empire Construction',
    gstin: '29AAACE9012C3Z3', pan: 'AAACE9012C',
    address: '7, Koramangala 5th Block', city: 'Bengaluru', state: 'Karnataka',
    email: 'construction@empiregroup.in', phone: '+91 80 6710 5500',
    defaultBankAccountId: 'bnk-3', status: 'active'
  }
];

// ─── MASTER: BANK ACCOUNTS ───────────────────────────────────────────────────

export interface BankAccountRecord {
  id: string;
  code: string;
  companyId: string;
  bankName: string;
  branch: string;
  accountNo: string;
  ifsc: string;
  accountType: string;
  status: string;
}

export const BANK_ACCOUNTS: BankAccountRecord[] = [
  { id: 'bnk-1', code: 'BNK-HDFC', companyId: 'cmp-1', bankName: 'HDFC Bank Ltd', branch: 'MG Road, Bengaluru', accountNo: '50200012345678', ifsc: 'HDFC0001234', accountType: 'Current (Operating)', status: 'active' },
  { id: 'bnk-2', code: 'BNK-ICICI', companyId: 'cmp-2', bankName: 'ICICI Bank Ltd', branch: 'BKC, Mumbai', accountNo: '00040509876543', ifsc: 'ICIC0000004', accountType: 'Current (Project)', status: 'active' },
  { id: 'bnk-3', code: 'BNK-AXIS', companyId: 'cmp-3', bankName: 'Axis Bank Ltd', branch: 'Indiranagar, Bengaluru', accountNo: '92000012345678', ifsc: 'UTIB0000123', accountType: 'Savings (Payroll)', status: 'active' }
];

// ─── MASTER: CLIENTS ─────────────────────────────────────────────────────────

export interface ClientRecord {
  id: string;
  clientCode: string;
  clientName: string;
  companyId: string;
  company: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  city: string;
  status: string;
}

export const CLIENTS: ClientRecord[] = [
  { id: 'cl-1', clientCode: 'CLI-2026-001', clientName: 'Nexus Realty Group', companyId: 'cmp-1', company: 'Empire Interior Contracting Pvt Ltd', contactPerson: 'Vikram Shah (VP Projects)', phone: '+91 98200 11223', email: 'v.shah@nexusrealty.in', gstin: '29AAACN1234F1Z1', city: 'Bengaluru', status: 'active' },
  { id: 'cl-2', clientCode: 'CLI-2026-002', clientName: 'Hyatt Hospitality India', companyId: 'cmp-2', company: 'Empire Joinery & Furniture Works', contactPerson: 'Meera Patel (Director Ops)', phone: '+91 98190 44556', email: 'm.patel@hyatt.com', gstin: '30AAACH5678G2Z3', city: 'Goa', status: 'active' },
  { id: 'cl-3', clientCode: 'CLI-2026-003', clientName: 'Imperial Realty Holdings', companyId: 'cmp-1', company: 'Empire Interior Contracting Pvt Ltd', contactPerson: 'Suresh Raina (Asset Mgr)', phone: '+91 98330 99881', email: 's.raina@imperialholdings.com', gstin: '27AAACI9911H3Z5', city: 'Mumbai', status: 'active' },
  { id: 'cl-4', clientCode: 'CLI-2026-004', clientName: 'HDFC Bank Ltd', companyId: 'cmp-1', company: 'Empire Interior Contracting Pvt Ltd', contactPerson: 'Anand Krishnamurthy (GM Facilities)', phone: '+91 98400 55667', email: 'a.krishnamurthy@hdfcbank.com', gstin: '27AAACH0123J4Z6', city: 'Navi Mumbai', status: 'active' },
  { id: 'cl-5', clientCode: 'CLI-2026-005', clientName: 'Phoenix Marketcity', companyId: 'cmp-1', company: 'Empire Interior Contracting Pvt Ltd', contactPerson: 'Rajeev Singh (Leasing Head)', phone: '+91 98120 33445', email: 'rajeev@phoenixmalls.com', gstin: '27AAACP4456K5Z2', city: 'Mumbai', status: 'active' },
  { id: 'cl-6', clientCode: 'CLI-2026-006', clientName: 'Sobha Ltd', companyId: 'cmp-3', company: 'Empire Construction Ltd', contactPerson: 'Pradeep Nair (Projects Head)', phone: '+91 98880 22334', email: 'p.nair@sobha.com', gstin: '29AAACS8800L6Z9', city: 'Bengaluru', status: 'active' }
];

// ─── MASTER: VENDORS ─────────────────────────────────────────────────────────

export interface VendorRecord {
  id: string;
  vendorCode: string;
  name: string;
  category: string;
  gstin: string;
  city: string;
  contactPerson: string;
  phone: string;
  email: string;
  rating: string;
  status: string;
}

export const VENDORS: VendorRecord[] = [
  { id: 'v-1', vendorCode: 'VEN-2026-001', name: 'Century Plyboards India Ltd', category: 'Joinery & Woodwork', gstin: '19AAACC1234A1Z5', city: 'Kolkata', contactPerson: 'Sanjay Singhania', phone: '+91 98300 67890', email: 'sanjay.s@centuryply.com', rating: '4.9 / 5.0', status: 'empanelled' },
  { id: 'v-2', vendorCode: 'VEN-2026-002', name: 'Asian Paints Ltd', category: 'Paint & Finishes', gstin: '27AAACA5678B2Z4', city: 'Mumbai', contactPerson: 'Anand Varma', phone: '+91 98200 12345', email: 'anand@asianpaints.com', rating: '4.8 / 5.0', status: 'empanelled' },
  { id: 'v-3', vendorCode: 'VEN-2026-003', name: 'Saint-Gobain India Pvt Ltd', category: 'Ceiling & Partitions', gstin: '33AAACS4321D4Z8', city: 'Chennai', contactPerson: 'Vikram Joshi', phone: '+91 98440 88990', email: 'vikram@saint-gobain.com', rating: '4.9 / 5.0', status: 'empanelled' },
  { id: 'v-4', vendorCode: 'VEN-2026-004', name: 'Greenlam Industries Ltd', category: 'Joinery & Woodwork', gstin: '08AAACG9911C3Z2', city: 'Jaipur', contactPerson: 'Preet Arora', phone: '+91 98760 11223', email: 'preet@greenlam.com', rating: '4.7 / 5.0', status: 'empanelled' },
  { id: 'v-5', vendorCode: 'VEN-2026-005', name: 'Schneider Electric India Ltd', category: 'Electrical', gstin: '29AAACS8765E5Z6', city: 'Bengaluru', contactPerson: 'Rohan Mistry', phone: '+91 98450 33221', email: 'rohan.m@schneider.com', rating: '4.8 / 5.0', status: 'empanelled' },
  { id: 'v-6', vendorCode: 'VEN-2026-006', name: 'Pidilite Industries Ltd', category: 'Hardware & Fittings', gstin: '27AAACP9988A1Z2', city: 'Mumbai', contactPerson: 'Ketan Shah', phone: '+91 98200 55667', email: 'ketan.s@pidilite.com', rating: '4.6 / 5.0', status: 'empanelled' },
  { id: 'v-7', vendorCode: 'VEN-2026-007', name: 'Unique Carpentry Services', category: 'Labour Services', gstin: '29AAACU1122F7Z3', city: 'Bengaluru', contactPerson: 'Murugan K', phone: '+91 98867 77889', email: 'murugan@uniquecarpentry.in', rating: '4.4 / 5.0', status: 'empanelled' },
  { id: 'v-8', vendorCode: 'VEN-2026-008', name: 'Bright Spark Electrical Works', category: 'Labour Services', gstin: '29AAACB4455G8Z1', city: 'Bengaluru', contactPerson: 'Suresh Babu', phone: '+91 98450 00112', email: 'suresh@brightspark.in', rating: '4.5 / 5.0', status: 'empanelled' }
];

// ─── MASTER: ITEM CATEGORIES ─────────────────────────────────────────────────

export interface ItemCategoryRecord {
  id: string;
  code: string;
  name: string;
  parent: string;
  itemCount: string;
  status: string;
}

export const ITEM_CATEGORIES: ItemCategoryRecord[] = [
  { id: 'cat-1', code: 'CAT-01', name: 'Joinery & Woodwork', parent: 'Civil & Architectural', itemCount: '18 Items', status: 'active' },
  { id: 'cat-2', code: 'CAT-02', name: 'Ceiling & Partitions', parent: 'Civil & Architectural', itemCount: '12 Items', status: 'active' },
  { id: 'cat-3', code: 'CAT-03', name: 'Paint & Finishes', parent: 'Civil & Architectural', itemCount: '10 Items', status: 'active' },
  { id: 'cat-4', code: 'CAT-04', name: 'Electrical', parent: 'MEP Services', itemCount: '14 Items', status: 'active' },
  { id: 'cat-5', code: 'CAT-05', name: 'Flooring', parent: 'Civil & Architectural', itemCount: '9 Items', status: 'active' },
  { id: 'cat-6', code: 'CAT-06', name: 'Hardware & Fittings', parent: 'Civil & Architectural', itemCount: '22 Items', status: 'active' },
  { id: 'cat-7', code: 'CAT-07', name: 'Furniture', parent: 'Furnishings', itemCount: '8 Items', status: 'active' },
  { id: 'cat-8', code: 'CAT-08', name: 'Labour Services', parent: 'Subcontracting', itemCount: '6 Items', status: 'active' }
];

// ─── MASTER: UNITS ───────────────────────────────────────────────────────────

export interface UnitRecord {
  id: string;
  code: string;
  name: string;
  symbol: string;
  status: string;
}

export const UNITS: UnitRecord[] = [
  { id: 'uom-1', code: 'UOM-SQFT', name: 'Square Feet', symbol: 'Sq Ft', status: 'active' },
  { id: 'uom-2', code: 'UOM-RM', name: 'Running Metre', symbol: 'RM', status: 'active' },
  { id: 'uom-3', code: 'UOM-NOS', name: 'Number', symbol: 'Nos', status: 'active' },
  { id: 'uom-4', code: 'UOM-SHT', name: 'Sheets', symbol: 'Sht', status: 'active' },
  { id: 'uom-5', code: 'UOM-LTR', name: 'Litres', symbol: 'Ltr', status: 'active' },
  { id: 'uom-6', code: 'UOM-KG', name: 'Kilograms', symbol: 'Kg', status: 'active' },
  { id: 'uom-7', code: 'UOM-BOX', name: 'Boxes', symbol: 'Box', status: 'active' },
  { id: 'uom-8', code: 'UOM-DAY', name: 'Days', symbol: 'Day', status: 'active' },
  { id: 'uom-9', code: 'UOM-LS', name: 'Lump Sum', symbol: 'LS', status: 'active' }
];

// ─── MASTER: ITEMS ───────────────────────────────────────────────────────────

export interface ItemMasterRecord {
  id: string;
  itemCode: string;
  item: string;
  categoryId: string;
  category: string;
  unitId: string;
  unit: string;
  brand: string;
  specification: string;
  standardRate: number;
  taxRate: number;
  status: string;
}

export const ITEMS: ItemMasterRecord[] = [
  { id: 'mat-1', itemCode: 'MAT-101', item: 'Plywood 18mm Commercial Grade', categoryId: 'cat-1', category: 'Joinery & Woodwork', unitId: 'uom-4', unit: 'Sht', brand: 'Century Ply', specification: 'IS:303 BWR grade, 8x4 ft', standardRate: 1450, taxRate: 18, status: 'active' },
  { id: 'mat-2', itemCode: 'MAT-102', item: 'Marine Plywood 18mm', categoryId: 'cat-1', category: 'Joinery & Woodwork', unitId: 'uom-4', unit: 'Sht', brand: 'Century Ply', specification: 'IS:710 BWP grade, 8x4 ft', standardRate: 2200, taxRate: 18, status: 'active' },
  { id: 'mat-3', itemCode: 'MAT-103', item: 'Gypsum Board 12mm', categoryId: 'cat-2', category: 'Ceiling & Partitions', unitId: 'uom-1', unit: 'Sq Ft', brand: 'Saint-Gobain Gyproc', specification: 'Standard board, 8x4 ft', standardRate: 45, taxRate: 18, status: 'active' },
  { id: 'mat-4', itemCode: 'MAT-104', item: 'Teak Veneer 4mm', categoryId: 'cat-1', category: 'Joinery & Woodwork', unitId: 'uom-4', unit: 'Sht', brand: 'Greenlam', specification: 'Natural teak face, 8x4 ft', standardRate: 850, taxRate: 18, status: 'active' },
  { id: 'mat-5', itemCode: 'MAT-105', item: 'Interior Emulsion Paint', categoryId: 'cat-3', category: 'Paint & Finishes', unitId: 'uom-5', unit: 'Ltr', brand: 'Asian Paints Royale', specification: 'Sheen finish, 20L pail', standardRate: 280, taxRate: 18, status: 'active' },
  { id: 'mat-6', itemCode: 'MAT-106', item: 'Primer', categoryId: 'cat-3', category: 'Paint & Finishes', unitId: 'uom-5', unit: 'Ltr', brand: 'Asian Paints', specification: 'Acrylic wall primer, 20L', standardRate: 120, taxRate: 18, status: 'active' },
  { id: 'mat-7', itemCode: 'MAT-107', item: 'Modular Switch', categoryId: 'cat-4', category: 'Electrical', unitId: 'uom-3', unit: 'Nos', brand: 'Schneider', specification: 'Vivace series 6A', standardRate: 320, taxRate: 18, status: 'active' },
  { id: 'mat-8', itemCode: 'MAT-108', item: 'LED Panel Light 18W', categoryId: 'cat-4', category: 'Electrical', unitId: 'uom-3', unit: 'Nos', brand: 'Schneider', specification: '600x600mm, 18W, Cool White', standardRate: 1800, taxRate: 18, status: 'active' },
  { id: 'mat-9', itemCode: 'MAT-109', item: 'Glass Partition 12mm', categoryId: 'cat-2', category: 'Ceiling & Partitions', unitId: 'uom-1', unit: 'Sq Ft', brand: 'Saint-Gobain', specification: 'Tempered clear glass', standardRate: 320, taxRate: 18, status: 'active' },
  { id: 'mat-10', itemCode: 'MAT-110', item: 'Carpet Tile', categoryId: 'cat-5', category: 'Flooring', unitId: 'uom-1', unit: 'Sq Ft', brand: 'Interface', specification: '50x50cm, nylon pile', standardRate: 185, taxRate: 18, status: 'active' },
  { id: 'mat-11', itemCode: 'MAT-111', item: 'Door Hardware Set', categoryId: 'cat-6', category: 'Hardware & Fittings', unitId: 'uom-3', unit: 'Nos', brand: 'Hafele', specification: 'Mortise lock + handle set', standardRate: 4500, taxRate: 18, status: 'active' },
  { id: 'mat-12', itemCode: 'MAT-112', item: 'Adhesive', categoryId: 'cat-6', category: 'Hardware & Fittings', unitId: 'uom-6', unit: 'Kg', brand: 'Pidilite Fevicol', specification: 'SH Woodworking adhesive', standardRate: 220, taxRate: 18, status: 'active' },
  { id: 'mat-13', itemCode: 'MAT-113', item: 'Laminate Sheet', categoryId: 'cat-1', category: 'Joinery & Woodwork', unitId: 'uom-4', unit: 'Sht', brand: 'Greenlam', specification: 'High Pressure Laminate 1mm', standardRate: 1100, taxRate: 18, status: 'active' },
  { id: 'mat-14', itemCode: 'MAT-114', item: 'Carpentry Labour', categoryId: 'cat-8', category: 'Labour Services', unitId: 'uom-8', unit: 'Day', brand: '', specification: 'Skilled carpenter per day', standardRate: 1800, taxRate: 18, status: 'active' },
  { id: 'mat-15', itemCode: 'MAT-115', item: 'Electrical Installation Labour', categoryId: 'cat-8', category: 'Labour Services', unitId: 'uom-8', unit: 'Day', brand: '', specification: 'Licensed electrician per day', standardRate: 2200, taxRate: 18, status: 'active' }
];

// ─── MASTER: DEPARTMENTS ─────────────────────────────────────────────────────

export interface DepartmentRecord {
  id: string;
  code: string;
  name: string;
  head: string;
  userCount: string;
  status: string;
}

export const DEPARTMENTS: DepartmentRecord[] = [
  { id: 'dept-1', code: 'DEPT-BRD', name: 'Board Management', head: 'Sanjay Mehta', userCount: '2 Staff', status: 'active' },
  { id: 'dept-2', code: 'DEPT-EXE', name: 'Project Execution', head: 'Rajesh Kumar', userCount: '18 Staff', status: 'active' },
  { id: 'dept-3', code: 'DEPT-PRO', name: 'Procurement', head: 'Amitabh Sen', userCount: '8 Staff', status: 'active' },
  { id: 'dept-4', code: 'DEPT-BIL', name: 'Billing', head: 'Priya Sharma', userCount: '6 Staff', status: 'active' },
  { id: 'dept-5', code: 'DEPT-FIN', name: 'Finance & Accounts', head: 'Sanjay Mehta', userCount: '10 Staff', status: 'active' },
  { id: 'dept-6', code: 'DEPT-EST', name: 'Estimation', head: 'Rohan Deshmukh', userCount: '5 Staff', status: 'active' },
  { id: 'dept-7', code: 'DEPT-HR', name: 'Human Resources', head: 'Sneha Kulkarni', userCount: '4 Staff', status: 'active' },
  { id: 'dept-8', code: 'DEPT-ADM', name: 'Administration', head: 'Amit Dev', userCount: '6 Staff', status: 'active' }
];

// ─── MASTER: DESIGNATIONS ────────────────────────────────────────────────────

export interface DesignationRecord {
  id: string;
  designationCode: string;
  title: string;
  department: string;
  status: string;
}

export const DESIGNATIONS: DesignationRecord[] = [
  { id: 'dsg-1', designationCode: 'DSG-001', title: 'Chairman', department: 'Board Management', status: 'active' },
  { id: 'dsg-2', designationCode: 'DSG-002', title: 'Project Director', department: 'Project Execution', status: 'active' },
  { id: 'dsg-3', designationCode: 'DSG-003', title: 'Project Head', department: 'Project Execution', status: 'active' },
  { id: 'dsg-4', designationCode: 'DSG-004', title: 'Project Manager', department: 'Project Execution', status: 'active' },
  { id: 'dsg-5', designationCode: 'DSG-005', title: 'Site Engineer', department: 'Project Execution', status: 'active' },
  { id: 'dsg-6', designationCode: 'DSG-006', title: 'Procurement Head', department: 'Procurement', status: 'active' },
  { id: 'dsg-7', designationCode: 'DSG-007', title: 'Purchase Executive', department: 'Procurement', status: 'active' },
  { id: 'dsg-8', designationCode: 'DSG-008', title: 'Billing Engineer', department: 'Billing', status: 'active' },
  { id: 'dsg-9', designationCode: 'DSG-009', title: 'Finance Manager', department: 'Finance & Accounts', status: 'active' },
  { id: 'dsg-10', designationCode: 'DSG-010', title: 'Accounts Executive', department: 'Finance & Accounts', status: 'active' },
  { id: 'dsg-11', designationCode: 'DSG-011', title: 'Storekeeper', department: 'Procurement', status: 'active' },
  { id: 'dsg-12', designationCode: 'DSG-012', title: 'Administrator', department: 'Administration', status: 'active' }
];

// ─── MASTER: ROLES ───────────────────────────────────────────────────────────

export interface RoleRecord {
  id: string;
  roleId: string;
  roleName: string;
  description: string;
  userCount: string;
  status: string;
}

export const ROLES: RoleRecord[] = [
  { id: 'rl-1', roleId: 'ROLE-BOARD', roleName: 'Board Approver', description: 'Full board signoff: indents, POs, budgets, invoices above ₹5L', userCount: '2 Users', status: 'active' },
  { id: 'rl-2', roleId: 'ROLE-PROJHEAD', roleName: 'Project Head', description: 'Project site approval: indents up to ₹2L, GRN signoff, team management', userCount: '3 Users', status: 'active' },
  { id: 'rl-3', roleId: 'ROLE-SITEENG', roleName: 'Site Engineer', description: 'GRN recording, indent creation, inventory management', userCount: '4 Users', status: 'active' },
  { id: 'rl-4', roleId: 'ROLE-PROCMGR', roleName: 'Procurement Manager', description: 'RFQ, rate comparison, PO creation, vendor management', userCount: '2 Users', status: 'active' },
  { id: 'rl-5', roleId: 'ROLE-BILMGR', roleName: 'Billing Manager', description: 'Client billing, invoice certification, tender management', userCount: '2 Users', status: 'active' },
  { id: 'rl-6', roleId: 'ROLE-ACCMGR', roleName: 'Accounts Manager', description: 'Payments, vendor ledger, salary, utility, budget transfers', userCount: '2 Users', status: 'active' },
  { id: 'rl-7', roleId: 'ROLE-ADMIN', roleName: 'Administrator', description: 'Full system access: users, roles, settings, reports', userCount: '1 User', status: 'active' },
  { id: 'rl-8', roleId: 'ROLE-VIEWER', roleName: 'Viewer', description: 'Read-only access across all modules', userCount: '3 Users', status: 'active' }
];

// ─── MASTER: EMPLOYEES ───────────────────────────────────────────────────────

export interface EmployeeRecord {
  id: string;
  empCode: string;
  name: string;
  departmentId: string;
  department: string;
  designationId: string;
  designation: string;
  email: string;
  phone: string;
  joiningDate: string;
  status: string;
}

export const EMPLOYEES: EmployeeRecord[] = [
  { id: 'emp-1', empCode: 'EMP-101', name: 'Rajesh Kumar', departmentId: 'dept-2', department: 'Project Execution', designationId: 'dsg-2', designation: 'Project Director', email: 'rajesh.k@empireinterior.in', phone: '+91 98450 12345', joiningDate: '2020-04-01', status: 'active' },
  { id: 'emp-2', empCode: 'EMP-102', name: 'Anita Rao', departmentId: 'dept-2', department: 'Project Execution', designationId: 'dsg-4', designation: 'Project Manager', email: 'anita.r@empireinterior.in', phone: '+91 98220 54321', joiningDate: '2021-06-15', status: 'active' },
  { id: 'emp-3', empCode: 'EMP-103', name: 'Amitabh Sen', departmentId: 'dept-3', department: 'Procurement', designationId: 'dsg-6', designation: 'Procurement Head', email: 'amitabh.s@empireinterior.in', phone: '+91 98110 78901', joiningDate: '2019-03-20', status: 'active' },
  { id: 'emp-4', empCode: 'EMP-104', name: 'Priya Sharma', departmentId: 'dept-4', department: 'Billing', designationId: 'dsg-8', designation: 'Billing Engineer', email: 'priya.s@empireinterior.in', phone: '+91 98330 22334', joiningDate: '2022-01-10', status: 'active' },
  { id: 'emp-5', empCode: 'EMP-105', name: 'Sanjay Mehta', departmentId: 'dept-1', department: 'Board Management', designationId: 'dsg-1', designation: 'Chairman', email: 'sanjay.m@empireinterior.in', phone: '+91 98100 88776', joiningDate: '2015-01-01', status: 'active' },
  { id: 'emp-6', empCode: 'EMP-106', name: 'Sneha Kulkarni', departmentId: 'dept-5', department: 'Finance & Accounts', designationId: 'dsg-9', designation: 'Finance Manager', email: 'sneha.k@empireinterior.in', phone: '+91 98450 56789', joiningDate: '2021-09-01', status: 'active' },
  { id: 'emp-7', empCode: 'EMP-107', name: 'Vikramaditya Nair', departmentId: 'dept-2', department: 'Project Execution', designationId: 'dsg-5', designation: 'Site Engineer', email: 'vikram.n@empireinterior.in', phone: '+91 98670 34567', joiningDate: '2023-03-01', status: 'active' },
  { id: 'emp-8', empCode: 'EMP-108', name: 'Rohan Deshmukh', departmentId: 'dept-5', department: 'Finance & Accounts', designationId: 'dsg-10', designation: 'Accounts Executive', email: 'rohan.d@empireinterior.in', phone: '+91 98880 90123', joiningDate: '2022-07-15', status: 'active' },
  { id: 'emp-9', empCode: 'EMP-109', name: 'Amit Dev', departmentId: 'dept-8', department: 'Administration', designationId: 'dsg-12', designation: 'Administrator', email: 'amit.d@empireinterior.in', phone: '+91 98560 11223', joiningDate: '2018-05-01', status: 'active' },
  { id: 'emp-10', empCode: 'EMP-110', name: 'Karan Malhotra', departmentId: 'dept-2', department: 'Project Execution', designationId: 'dsg-3', designation: 'Project Head', email: 'karan.m@empireinterior.in', phone: '+91 98210 44556', joiningDate: '2020-11-01', status: 'active' },
  { id: 'emp-11', empCode: 'EMP-111', name: 'Vikram Reddy', departmentId: 'dept-2', department: 'Project Execution', designationId: 'dsg-4', designation: 'Project Manager', email: 'vikram.r@empireinterior.in', phone: '+91 98780 67890', joiningDate: '2021-12-01', status: 'active' },
  { id: 'emp-12', empCode: 'EMP-112', name: 'Divya Krishnan', departmentId: 'dept-3', department: 'Procurement', designationId: 'dsg-7', designation: 'Purchase Executive', email: 'divya.k@empireinterior.in', phone: '+91 98660 78901', joiningDate: '2023-06-01', status: 'active' }
];

// ─── MASTER: USERS ───────────────────────────────────────────────────────────

export interface UserRecord {
  id: string;
  empCode: string;
  name: string;
  email: string;
  employeeId: string;
  departmentId: string;
  department: string;
  designationId: string;
  designation: string;
  roleId: string;
  role: string;
  assignedSiteIds: string[];
  lastLogin: string;
  status: string;
}

export const USERS: UserRecord[] = [
  { id: 'usr-1', empCode: 'EMP-101', name: 'Rajesh Kumar', email: 'rajesh.k@empireinterior.in', employeeId: 'emp-1', departmentId: 'dept-2', department: 'Project Execution', designationId: 'dsg-2', designation: 'Project Director', roleId: 'rl-2', role: 'Project Head', assignedSiteIds: ['site-1', 'site-2', 'site-3'], lastLogin: '2026-07-25 08:45', status: 'active' },
  { id: 'usr-2', empCode: 'EMP-102', name: 'Anita Rao', email: 'anita.r@empireinterior.in', employeeId: 'emp-2', departmentId: 'dept-2', department: 'Project Execution', designationId: 'dsg-4', designation: 'Project Manager', roleId: 'rl-2', role: 'Project Head', assignedSiteIds: ['site-2', 'site-4'], lastLogin: '2026-07-25 09:00', status: 'active' },
  { id: 'usr-3', empCode: 'EMP-103', name: 'Amitabh Sen', email: 'amitabh.s@empireinterior.in', employeeId: 'emp-3', departmentId: 'dept-3', department: 'Procurement', designationId: 'dsg-6', designation: 'Procurement Head', roleId: 'rl-4', role: 'Procurement Manager', assignedSiteIds: ['site-1', 'site-2', 'site-3', 'site-4', 'site-5', 'site-6'], lastLogin: '2026-07-25 09:15', status: 'active' },
  { id: 'usr-4', empCode: 'EMP-104', name: 'Priya Sharma', email: 'priya.s@empireinterior.in', employeeId: 'emp-4', departmentId: 'dept-4', department: 'Billing', designationId: 'dsg-8', designation: 'Billing Engineer', roleId: 'rl-5', role: 'Billing Manager', assignedSiteIds: ['site-1', 'site-3'], lastLogin: '2026-07-25 09:30', status: 'active' },
  { id: 'usr-5', empCode: 'EMP-105', name: 'Sanjay Mehta', email: 'sanjay.m@empireinterior.in', employeeId: 'emp-5', departmentId: 'dept-1', department: 'Board Management', designationId: 'dsg-1', designation: 'Chairman', roleId: 'rl-1', role: 'Board Approver', assignedSiteIds: ['site-1', 'site-2', 'site-3', 'site-4', 'site-5', 'site-6'], lastLogin: '2026-07-24 10:00', status: 'active' },
  { id: 'usr-6', empCode: 'EMP-106', name: 'Sneha Kulkarni', email: 'sneha.k@empireinterior.in', employeeId: 'emp-6', departmentId: 'dept-5', department: 'Finance & Accounts', designationId: 'dsg-9', designation: 'Finance Manager', roleId: 'rl-6', role: 'Accounts Manager', assignedSiteIds: ['site-1', 'site-2', 'site-3'], lastLogin: '2026-07-25 10:00', status: 'active' },
  { id: 'usr-7', empCode: 'EMP-107', name: 'Vikramaditya Nair', email: 'vikram.n@empireinterior.in', employeeId: 'emp-7', departmentId: 'dept-2', department: 'Project Execution', designationId: 'dsg-5', designation: 'Site Engineer', roleId: 'rl-3', role: 'Site Engineer', assignedSiteIds: ['site-1'], lastLogin: '2026-07-25 09:30', status: 'active' },
  { id: 'usr-8', empCode: 'EMP-108', name: 'Rohan Deshmukh', email: 'rohan.d@empireinterior.in', employeeId: 'emp-8', departmentId: 'dept-5', department: 'Finance & Accounts', designationId: 'dsg-10', designation: 'Accounts Executive', roleId: 'rl-6', role: 'Accounts Manager', assignedSiteIds: ['site-1', 'site-2'], lastLogin: '2026-07-24 14:20', status: 'active' },
  { id: 'usr-9', empCode: 'EMP-109', name: 'Amit Dev', email: 'amit.d@empireinterior.in', employeeId: 'emp-9', departmentId: 'dept-8', department: 'Administration', designationId: 'dsg-12', designation: 'Administrator', roleId: 'rl-7', role: 'Administrator', assignedSiteIds: ['site-1', 'site-2', 'site-3', 'site-4', 'site-5', 'site-6'], lastLogin: '2026-07-25 08:00', status: 'active' },
  { id: 'usr-10', empCode: 'EMP-110', name: 'Karan Malhotra', email: 'karan.m@empireinterior.in', employeeId: 'emp-10', departmentId: 'dept-2', department: 'Project Execution', designationId: 'dsg-3', designation: 'Project Head', roleId: 'rl-2', role: 'Project Head', assignedSiteIds: ['site-4', 'site-6'], lastLogin: '2026-07-24 11:00', status: 'active' }
];

// ─── PROJECTS & SITES (aligned with SitesContext) ────────────────────────────

export interface ProjectRecord {
  id: string;
  projectCode: string;
  projectName: string;
  name: string;
  siteId: string;
  siteCode: string;
  clientId: string;
  clientName: string;
  client: string;
  companyId: string;
  companyName: string;
  company: string;
  city: string;
  projectManagerId: string;
  projectManagerName: string;
  manager: string;
  startDate: string;
  targetCompletionDate: string;
  completionDate: string;
  approvedBudget: number;
  budget: number;
  progressPercentage: number;
  progress: string;
  executionStatus: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  status: string;
  approvalStatus?: string;
}

export const PROJECTS: ProjectRecord[] = [
  { id: 'p-1', projectCode: 'PRJ-2026-001', projectName: 'Nexus Tech Park Lobby Renovations', name: 'Nexus Tech Park Lobby Renovations', siteId: 'site-1', siteCode: 'SITE-2026-001', clientId: 'cl-1', clientName: 'Nexus Realty Group', client: 'Nexus Realty Group', companyId: 'cmp-1', companyName: 'Empire Interior Contracting Pvt Ltd', company: 'Empire Interior Contracting Pvt Ltd', projectManagerId: 'emp-1', projectManagerName: 'Rajesh Kumar', manager: 'Rajesh Kumar', city: 'Bengaluru', startDate: '2026-01-10', targetCompletionDate: '2026-08-30', completionDate: '2026-08-30', approvedBudget: 50000000, budget: 50000000, progressPercentage: 58, progress: '58%', executionStatus: 'active', status: 'active' },
  { id: 'p-2', projectCode: 'PRJ-2026-002', projectName: 'Grand Hyatt Executive Lounge Café', name: 'Grand Hyatt Executive Lounge Café', siteId: 'site-2', siteCode: 'SITE-2026-002', clientId: 'cl-2', clientName: 'Hyatt Hospitality India', client: 'Hyatt Hospitality India', companyId: 'cmp-2', companyName: 'Empire Joinery & Furniture Works', company: 'Empire Joinery & Furniture Works', projectManagerId: 'emp-2', projectManagerName: 'Anita Rao', manager: 'Anita Rao', city: 'Goa', startDate: '2025-11-15', targetCompletionDate: '2026-04-10', completionDate: '2026-04-10', approvedBudget: 12000000, budget: 12000000, progressPercentage: 84, progress: '84%', executionStatus: 'active', status: 'active' },
  { id: 'p-3', projectCode: 'PRJ-2026-003', projectName: 'Imperial Heights Penthouse Fit-Out', name: 'Imperial Heights Penthouse Fit-Out', siteId: 'site-3', siteCode: 'SITE-2026-003', clientId: 'cl-3', clientName: 'Imperial Realty Holdings', client: 'Imperial Realty Holdings', companyId: 'cmp-1', companyName: 'Empire Interior Contracting Pvt Ltd', company: 'Empire Interior Contracting Pvt Ltd', projectManagerId: 'emp-7', projectManagerName: 'Vikramaditya Nair', manager: 'Vikramaditya Nair', city: 'Mumbai', startDate: '2026-02-05', targetCompletionDate: '2026-10-15', completionDate: '2026-10-15', approvedBudget: 38000000, budget: 38000000, progressPercentage: 46, progress: '46%', executionStatus: 'active', status: 'active' },
  { id: 'p-4', projectCode: 'PRJ-2026-004', projectName: 'Synergy Co-Working Workspace', name: 'Synergy Co-Working Workspace', siteId: 'site-4', siteCode: 'SITE-2026-004', clientId: 'cl-5', clientName: 'Synergy Workspaces', client: 'Synergy Workspaces', companyId: 'cmp-1', companyName: 'Empire Interior Contracting Pvt Ltd', company: 'Empire Interior Contracting Pvt Ltd', projectManagerId: 'emp-11', projectManagerName: 'Vikram Reddy', manager: 'Vikram Reddy', city: 'Bengaluru', startDate: '2026-06-01', targetCompletionDate: '2027-01-15', completionDate: '2027-01-15', approvedBudget: 45000000, budget: 45000000, progressPercentage: 52, progress: '52%', executionStatus: 'active', status: 'active' },
  { id: 'p-5', projectCode: 'PRJ-2026-005', projectName: 'Oasis Luxury Villa Construction', name: 'Oasis Luxury Villa Construction', siteId: 'site-5', siteCode: 'SITE-2026-005', clientId: 'cl-6', clientName: 'Oasis Developers', client: 'Oasis Developers', companyId: 'cmp-3', companyName: 'Empire Construction Ltd', company: 'Empire Construction Ltd', projectManagerId: 'emp-8', projectManagerName: 'Rohan Deshmukh', manager: 'Rohan Deshmukh', city: 'Hyderabad', startDate: '2025-05-10', targetCompletionDate: '2026-06-30', completionDate: '2026-06-30', approvedBudget: 15000000, budget: 15000000, progressPercentage: 100, progress: '100%', executionStatus: 'completed', status: 'completed' },
  { id: 'p-6', projectCode: 'PRJ-2026-006', projectName: 'HDFC Regional Office Expansion', name: 'HDFC Regional Office Expansion', siteId: 'site-6', siteCode: 'SITE-2026-006', clientId: 'cl-4', clientName: 'HDFC Bank', client: 'HDFC Bank', companyId: 'cmp-1', companyName: 'Empire Interior Contracting Pvt Ltd', company: 'Empire Interior Contracting Pvt Ltd', projectManagerId: 'emp-10', projectManagerName: 'Karan Malhotra', manager: 'Karan Malhotra', city: 'Chennai', startDate: '2026-08-01', targetCompletionDate: '2027-03-31', completionDate: '2027-03-31', approvedBudget: 35000000, budget: 35000000, progressPercentage: 0, progress: '0%', executionStatus: 'planning', status: 'planning' }
];

// ─── PROJECT TEAMS ────────────────────────────────────────────────────────────

export interface ProjectTeamRecord {
  id: string;
  empCode: string;
  employee: string;
  employeeId: string;
  teamGroup: string;
  siteId: string;
  role: string;
  designationId: string;
  department: string;
  departmentId: string;
  email: string;
  phone: string;
  assignedDate: string;
  status: string;
}

export const PROJECT_TEAMS: ProjectTeamRecord[] = [
  // Nexus Tech Park
  { id: 'tm-1', empCode: 'EMP-101', employee: 'Rajesh Kumar', employeeId: 'emp-1', teamGroup: 'Nexus Tech Park Team', siteId: 'site-1', role: 'Project Director', designationId: 'dsg-2', department: 'Project Execution', departmentId: 'dept-2', email: 'rajesh.k@empireinterior.in', phone: '+91 98450 12345', assignedDate: '2026-01-10', status: 'active' },
  { id: 'tm-2', empCode: 'EMP-102', employee: 'Anita Rao', employeeId: 'emp-2', teamGroup: 'Nexus Tech Park Team', siteId: 'site-1', role: 'Project Manager', designationId: 'dsg-4', department: 'Project Execution', departmentId: 'dept-2', email: 'anita.r@empireinterior.in', phone: '+91 98220 54321', assignedDate: '2026-01-10', status: 'active' },
  { id: 'tm-3', empCode: 'EMP-107', employee: 'Vikramaditya Nair', employeeId: 'emp-7', teamGroup: 'Nexus Tech Park Team', siteId: 'site-1', role: 'Site Engineer', designationId: 'dsg-5', department: 'Project Execution', departmentId: 'dept-2', email: 'vikram.n@empireinterior.in', phone: '+91 98670 34567', assignedDate: '2026-01-15', status: 'active' },
  { id: 'tm-4', empCode: 'EMP-104', employee: 'Priya Sharma', employeeId: 'emp-4', teamGroup: 'Nexus Tech Park Team', siteId: 'site-1', role: 'Billing Engineer', designationId: 'dsg-8', department: 'Billing', departmentId: 'dept-4', email: 'priya.s@empireinterior.in', phone: '+91 98330 22334', assignedDate: '2026-02-01', status: 'active' },
  { id: 'tm-5', empCode: 'EMP-103', employee: 'Amitabh Sen', employeeId: 'emp-3', teamGroup: 'Nexus Tech Park Team', siteId: 'site-1', role: 'Procurement Lead', designationId: 'dsg-6', department: 'Procurement', departmentId: 'dept-3', email: 'amitabh.s@empireinterior.in', phone: '+91 98110 78901', assignedDate: '2026-01-20', status: 'active' },
  { id: 'tm-6', empCode: 'EMP-106', employee: 'Sneha Kulkarni', employeeId: 'emp-6', teamGroup: 'Nexus Tech Park Team', siteId: 'site-1', role: 'Finance Coordinator', designationId: 'dsg-9', department: 'Finance & Accounts', departmentId: 'dept-5', email: 'sneha.k@empireinterior.in', phone: '+91 98450 56789', assignedDate: '2026-02-15', status: 'active' },
  // Grand Hyatt
  { id: 'tm-7', empCode: 'EMP-101', employee: 'Rajesh Kumar', employeeId: 'emp-1', teamGroup: 'Grand Hyatt Goa Team', siteId: 'site-2', role: 'Project Director', designationId: 'dsg-2', department: 'Project Execution', departmentId: 'dept-2', email: 'rajesh.k@empireinterior.in', phone: '+91 98450 12345', assignedDate: '2025-11-15', status: 'active' },
  { id: 'tm-8', empCode: 'EMP-102', employee: 'Anita Rao', employeeId: 'emp-2', teamGroup: 'Grand Hyatt Goa Team', siteId: 'site-2', role: 'Project Manager', designationId: 'dsg-4', department: 'Project Execution', departmentId: 'dept-2', email: 'anita.r@empireinterior.in', phone: '+91 98220 54321', assignedDate: '2025-11-15', status: 'active' },
  // Imperial Heights
  { id: 'tm-9', empCode: 'EMP-110', employee: 'Karan Malhotra', employeeId: 'emp-10', teamGroup: 'Imperial Heights Team', siteId: 'site-3', role: 'Project Head', designationId: 'dsg-3', department: 'Project Execution', departmentId: 'dept-2', email: 'karan.m@empireinterior.in', phone: '+91 98210 44556', assignedDate: '2026-02-05', status: 'active' },
  { id: 'tm-10', empCode: 'EMP-111', employee: 'Vikram Reddy', employeeId: 'emp-11', teamGroup: 'Imperial Heights Team', siteId: 'site-3', role: 'Project Manager', designationId: 'dsg-4', department: 'Project Execution', departmentId: 'dept-2', email: 'vikram.r@empireinterior.in', phone: '+91 98780 67890', assignedDate: '2026-02-10', status: 'active' }
];

// ─── TENDERS ─────────────────────────────────────────────────────────────────

export interface TenderRecord {
  id: string;
  tenderNo: string;
  siteId: string;
  site: string;
  version: string;
  type: string;
  category: string;
  subDate: string;
  clientResponseDate: string;
  subValue: number;
  appValue: number;
  approvalPct: string;
  margin: string;
  comments: string;
  status: string;
}

export const TENDERS: TenderRecord[] = [
  { id: 'td-1', tenderNo: 'TND-2026-001', siteId: 'site-1', site: 'Nexus Tech Park', version: 'R3', type: 'Main Tender', category: 'Main Interior Fit-Out', subDate: '2026-01-20', clientResponseDate: '2026-02-10', subValue: 48000000, appValue: 46000000, approvalPct: '95.83%', margin: '18.5%', comments: 'Award confirmed after technical evaluation', status: 'approved' },
  { id: 'td-2', tenderNo: 'TND-2026-002', siteId: 'site-2', site: 'Grand Hyatt Goa', version: 'R1', type: 'Main Tender', category: 'Hospitality Fit-Out', subDate: '2026-01-10', clientResponseDate: '2026-01-25', subValue: 12500000, appValue: 12000000, approvalPct: '96.00%', margin: '20.2%', comments: 'Full scope awarded', status: 'approved' },
  { id: 'td-3', tenderNo: 'TND-2026-003', siteId: 'site-3', site: 'Imperial Heights', version: 'R2', type: 'Main Tender', category: 'Luxury Residential Fit-Out', subDate: '2026-03-05', clientResponseDate: '2026-03-20', subValue: 68000000, appValue: 65000000, approvalPct: '95.59%', margin: '22.0%', comments: 'Stone and joinery detailed post award', status: 'approved' },
  { id: 'td-4', tenderNo: 'TND-2026-004', siteId: 'site-4', site: 'Synergy Co-Working', version: 'R1', type: 'Main Tender', category: 'Commercial Interior', subDate: '2026-05-15', clientResponseDate: '2026-06-01', subValue: 46000000, appValue: 44000000, approvalPct: '95.65%', margin: '16.8%', comments: 'Phase 1 fit-out only', status: 'approved' },
  { id: 'td-5', tenderNo: 'TND-2026-005', siteId: 'site-5', site: 'Oasis Luxury Villa', version: 'R2', type: 'Main Tender', category: 'Residential Construction', subDate: '2025-04-20', clientResponseDate: '2025-05-10', subValue: 15500000, appValue: 15000000, approvalPct: '96.77%', margin: '19.5%', comments: 'Completed project', status: 'approved' },
  { id: 'td-6', tenderNo: 'TND-2026-006', siteId: 'site-6', site: 'HDFC Regional Office', version: 'R1', type: 'Main Tender', category: 'Institutional Interior', subDate: '2026-07-01', clientResponseDate: '', subValue: 37000000, appValue: 35000000, approvalPct: '94.59%', margin: '17.2%', comments: 'Mobilization pending approvals', status: 'pending_approval' },
  // Extra item tenders
  { id: 'td-7', tenderNo: 'TND-2026-007', siteId: 'site-1', site: 'Nexus Tech Park', version: 'R1', type: 'Extra Item Tender', category: 'Acoustic Ceiling Extra', subDate: '2026-06-15', clientResponseDate: '2026-07-01', subValue: 3500000, appValue: 3000000, approvalPct: '85.71%', margin: '12.0%', comments: 'Client requested acoustic treatment in boardroom', status: 'approved' },
  { id: 'td-8', tenderNo: 'TND-2026-008', siteId: 'site-2', site: 'Grand Hyatt Goa', version: 'R1', type: 'Extra Item Tender', category: 'AV System Addition', subDate: '2026-03-01', clientResponseDate: '2026-03-10', subValue: 1500000, appValue: 1400000, approvalPct: '93.33%', margin: '14.0%', comments: 'Additional AV in lounge', status: 'approved' },
  { id: 'td-9', tenderNo: 'TND-2026-009', siteId: 'site-3', site: 'Imperial Heights', version: 'R1', type: 'Extra Item Tender', category: 'Stone Cladding Extra', subDate: '2026-05-20', clientResponseDate: '2026-06-10', subValue: 8000000, appValue: 7500000, approvalPct: '93.75%', margin: '20.0%', comments: 'Italian marble scope', status: 'pending_approval' },
  { id: 'td-10', tenderNo: 'TND-2026-010', siteId: 'site-4', site: 'Synergy Co-Working', version: 'R1', type: 'Extra Item Tender', category: 'Modular Furniture Extra', subDate: '2026-07-10', clientResponseDate: '', subValue: 2800000, appValue: 0, approvalPct: 'Pending', margin: '—', comments: 'Awaiting client decision', status: 'pending_approval' },
  { id: 'td-11', tenderNo: 'TND-2026-011', siteId: 'site-1', site: 'Nexus Tech Park', version: 'R1', type: 'Extra Item Tender', category: 'Terrace Landscape Extra', subDate: '2026-07-20', clientResponseDate: '', subValue: 2200000, appValue: 0, approvalPct: 'Pending', margin: '—', comments: 'Roof terrace landscaping scope', status: 'draft' },
  { id: 'td-12', tenderNo: 'TND-2026-012', siteId: 'site-5', site: 'Oasis Luxury Villa', version: 'R1', type: 'Extra Item Tender', category: 'Pool Deck Finishes', subDate: '2025-09-15', clientResponseDate: '2025-10-01', subValue: 900000, appValue: 850000, approvalPct: '94.44%', margin: '18.0%', comments: 'Pool deck natural stone', status: 'approved' }
];

// ─── INDENTS ──────────────────────────────────────────────────────────────────

export interface IndentRecord {
  id: string;
  indentNo: string;
  siteId: string;
  site: string;
  requesterId: string;
  requester: string;
  requestDate: string;
  requiredDate: string;
  itemCount: number;
  estValue: number;
  pendingWith: string;
  indentNumber: string;
  items: Array<{ id: string; item: string; unit: string; qty: number; rate: number; amount: number; }>;
  status: string;
}

export const INDENTS: IndentRecord[] = [
  {
    id: 'ind-1', indentNo: 'IND-2026-001', indentNumber: 'IND-2026-001',
    siteId: 'site-1', site: 'Nexus Tech Park',
    requesterId: 'emp-1', requester: 'Rajesh Kumar (Project Director)',
    requestDate: '2026-07-11', requiredDate: '2026-08-06',
    itemCount: 5, estValue: 450000, pendingWith: 'Rohan Deshmukh (Accounting Head)',
    items: [
      { id: 'ii-1a', item: 'Plywood 18mm Commercial Grade', unit: 'Sht', qty: 120, rate: 1450, amount: 174000 },
      { id: 'ii-1b', item: 'Laminate Sheet', unit: 'Sht', qty: 60, rate: 1100, amount: 66000 },
      { id: 'ii-1c', item: 'Adhesive', unit: 'Kg', qty: 50, rate: 220, amount: 11000 },
      { id: 'ii-1d', item: 'Door Hardware Set', unit: 'Nos', qty: 12, rate: 4500, amount: 54000 },
      { id: 'ii-1e', item: 'Gypsum Board 12mm', unit: 'Sq Ft', qty: 2000, rate: 45, amount: 90000 }
    ],
    status: 'approved'
  },
  {
    id: 'ind-2', indentNo: 'IND-2026-002', indentNumber: 'IND-2026-002',
    siteId: 'site-3', site: 'Imperial Heights Penthouse',
    requesterId: 'emp-10', requester: 'Karan Malhotra (Project Head)',
    requestDate: '2026-07-12', requiredDate: '2026-08-07',
    itemCount: 4, estValue: 680000, pendingWith: 'Sanjay Mehta (Chairman)',
    items: [
      { id: 'ii-2a', item: 'Glass Partition 12mm', unit: 'Sq Ft', qty: 800, rate: 320, amount: 256000 },
      { id: 'ii-2b', item: 'Teak Veneer 4mm', unit: 'Sht', qty: 80, rate: 850, amount: 68000 },
      { id: 'ii-2c', item: 'Marine Plywood 18mm', unit: 'Sht', qty: 100, rate: 2200, amount: 220000 },
      { id: 'ii-2d', item: 'Door Hardware Set', unit: 'Nos', qty: 15, rate: 4500, amount: 67500 }
    ],
    status: 'pending_approval'
  },
  {
    id: 'ind-3', indentNo: 'IND-2026-003', indentNumber: 'IND-2026-003',
    siteId: 'site-2', site: 'Grand Hyatt Goa',
    requesterId: 'emp-2', requester: 'Anita Rao (Project Manager)',
    requestDate: '2026-07-13', requiredDate: '2026-08-08',
    itemCount: 3, estValue: 520000, pendingWith: '',
    items: [
      { id: 'ii-3a', item: 'Interior Emulsion Paint', unit: 'Ltr', qty: 1200, rate: 280, amount: 336000 },
      { id: 'ii-3b', item: 'Primer', unit: 'Ltr', qty: 800, rate: 120, amount: 96000 },
      { id: 'ii-3c', item: 'LED Panel Light 18W', unit: 'Nos', qty: 48, rate: 1800, amount: 86400 }
    ],
    status: 'converted'
  },
  {
    id: 'ind-4', indentNo: 'IND-2026-004', indentNumber: 'IND-2026-004',
    siteId: 'site-4', site: 'Synergy Co-Working',
    requesterId: 'emp-11', requester: 'Vikram Reddy (Project Manager)',
    requestDate: '2026-07-15', requiredDate: '2026-08-10',
    itemCount: 4, estValue: 340000, pendingWith: 'Amitabh Sen (Procurement Head)',
    items: [
      { id: 'ii-4a', item: 'Carpet Tile', unit: 'Sq Ft', qty: 1500, rate: 185, amount: 277500 },
      { id: 'ii-4b', item: 'Modular Switch', unit: 'Nos', qty: 80, rate: 320, amount: 25600 },
      { id: 'ii-4c', item: 'Plywood 18mm Commercial Grade', unit: 'Sht', qty: 20, rate: 1450, amount: 29000 },
      { id: 'ii-4d', item: 'Adhesive', unit: 'Kg', qty: 30, rate: 220, amount: 6600 }
    ],
    status: 'approved'
  },
  {
    id: 'ind-5', indentNo: 'IND-2026-005', indentNumber: 'IND-2026-005',
    siteId: 'site-1', site: 'Nexus Tech Park',
    requesterId: 'emp-7', requester: 'Vikramaditya Nair (Site Engineer)',
    requestDate: '2026-07-18', requiredDate: '2026-08-12',
    itemCount: 2, estValue: 180000, pendingWith: 'Rajesh Kumar (Project Director)',
    items: [
      { id: 'ii-5a', item: 'LED Panel Light 18W', unit: 'Nos', qty: 60, rate: 1800, amount: 108000 },
      { id: 'ii-5b', item: 'Modular Switch', unit: 'Nos', qty: 120, rate: 320, amount: 38400 }
    ],
    status: 'draft'
  },
  {
    id: 'ind-6', indentNo: 'IND-2026-006', indentNumber: 'IND-2026-006',
    siteId: 'site-3', site: 'Imperial Heights Penthouse',
    requesterId: 'emp-10', requester: 'Karan Malhotra (Project Head)',
    requestDate: '2026-07-20', requiredDate: '2026-08-15',
    itemCount: 3, estValue: 420000, pendingWith: '',
    items: [
      { id: 'ii-6a', item: 'Carpet Tile', unit: 'Sq Ft', qty: 1200, rate: 185, amount: 222000 },
      { id: 'ii-6b', item: 'Interior Emulsion Paint', unit: 'Ltr', qty: 500, rate: 280, amount: 140000 },
      { id: 'ii-6c', item: 'Primer', unit: 'Ltr', qty: 400, rate: 120, amount: 48000 }
    ],
    status: 'converted'
  },
  {
    id: 'ind-7', indentNo: 'IND-2026-007', indentNumber: 'IND-2026-007',
    siteId: 'site-2', site: 'Grand Hyatt Goa',
    requesterId: 'emp-2', requester: 'Anita Rao (Project Manager)',
    requestDate: '2026-07-22', requiredDate: '2026-08-16',
    itemCount: 2, estValue: 190000, pendingWith: 'Amitabh Sen (Procurement Head)',
    items: [
      { id: 'ii-7a', item: 'Gypsum Board 12mm', unit: 'Sq Ft', qty: 3000, rate: 45, amount: 135000 },
      { id: 'ii-7b', item: 'Adhesive', unit: 'Kg', qty: 80, rate: 220, amount: 17600 }
    ],
    status: 'pending_approval'
  },
  {
    id: 'ind-8', indentNo: 'IND-2026-008', indentNumber: 'IND-2026-008',
    siteId: 'site-5', site: 'Oasis Luxury Villa',
    requesterId: 'emp-8', requester: 'Rohan Deshmukh (Accounts Executive)',
    requestDate: '2026-04-10', requiredDate: '2026-05-10',
    itemCount: 3, estValue: 215000, pendingWith: '',
    items: [
      { id: 'ii-8a', item: 'Interior Emulsion Paint', unit: 'Ltr', qty: 400, rate: 280, amount: 112000 },
      { id: 'ii-8b', item: 'Primer', unit: 'Ltr', qty: 300, rate: 120, amount: 36000 },
      { id: 'ii-8c', item: 'Adhesive', unit: 'Kg', qty: 30, rate: 220, amount: 6600 }
    ],
    status: 'converted'
  }
];

// ─── RFQs ─────────────────────────────────────────────────────────────────────

export interface RFQRecord {
  id: string;
  rfqNo: string;
  indentId: string;
  indentNumber: string;
  type: string;
  siteId: string;
  site: string;
  vendor: string;
  requestDate: string;
  dueDate: string;
  itemCount: number;
  totalValue: number;
  bidsOut: number;
  bidsRecd: number;
  status: string;
}

export const RFQS: RFQRecord[] = [
  { id: 'rfq-1', rfqNo: 'RFQ-2026-001', indentId: 'ind-1', indentNumber: 'IND-2026-001', type: 'Material', siteId: 'site-1', site: 'Nexus Tech Park', vendor: 'Century Plyboards India Ltd', requestDate: '2026-07-12', dueDate: '2026-07-22', itemCount: 5, totalValue: 450000, bidsOut: 3, bidsRecd: 3, status: 'quotations_received' },
  { id: 'rfq-2', rfqNo: 'RFQ-2026-002', indentId: 'ind-3', indentNumber: 'IND-2026-003', type: 'Material', siteId: 'site-2', site: 'Grand Hyatt Goa', vendor: 'Asian Paints Ltd', requestDate: '2026-07-14', dueDate: '2026-07-24', itemCount: 3, totalValue: 520000, bidsOut: 2, bidsRecd: 2, status: 'po_issued' },
  { id: 'rfq-3', rfqNo: 'RFQ-2026-003', indentId: 'ind-2', indentNumber: 'IND-2026-002', type: 'Material', siteId: 'site-3', site: 'Imperial Heights', vendor: 'Saint-Gobain India Pvt Ltd', requestDate: '2026-07-16', dueDate: '2026-07-26', itemCount: 4, totalValue: 680000, bidsOut: 3, bidsRecd: 2, status: 'quotations_received' },
  { id: 'rfq-4', rfqNo: 'RFQ-2026-004', indentId: 'ind-6', indentNumber: 'IND-2026-006', type: 'Material', siteId: 'site-3', site: 'Imperial Heights', vendor: 'Asian Paints Ltd', requestDate: '2026-07-21', dueDate: '2026-07-31', itemCount: 3, totalValue: 420000, bidsOut: 3, bidsRecd: 1, status: 'po_issued' },
  { id: 'rfq-5', rfqNo: 'RFQ-2026-005', indentId: 'ind-4', indentNumber: 'IND-2026-004', type: 'Material', siteId: 'site-4', site: 'Synergy Co-Working', vendor: 'Pidilite Industries Ltd', requestDate: '2026-07-16', dueDate: '2026-07-26', itemCount: 4, totalValue: 340000, bidsOut: 2, bidsRecd: 2, status: 'quotations_received' },
  { id: 'rfq-6', rfqNo: 'RFQ-2026-006', indentId: 'ind-8', indentNumber: 'IND-2026-008', type: 'Material', siteId: 'site-5', site: 'Oasis Luxury Villa', vendor: 'Asian Paints Ltd', requestDate: '2026-04-12', dueDate: '2026-04-20', itemCount: 3, totalValue: 215000, bidsOut: 2, bidsRecd: 2, status: 'po_issued' }
];

// ─── QUOTATIONS ───────────────────────────────────────────────────────────────

export interface QuotationRecord {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  item: string;
  qty: number;
  unit: string;
  basicRate: number;
  discount: string;
  tax: string;
  finalRate: number;
  finalAmount: number;
  deliveryDays: string;
  paymentTerms: string;
  selected: string;
  status: string;
}

export const QUOTATIONS: QuotationRecord[] = [
  // RFQ-2026-001 (Nexus, Plywood): 3 vendors
  { id: 'q-1', rfqId: 'rfq-1', vendorId: 'v-1', vendorName: 'Century Plyboards India Ltd', item: 'Plywood 18mm Commercial Grade', qty: 120, unit: 'Sht', basicRate: 1420, discount: '3%', tax: '18% GST', finalRate: 1624, finalAmount: 194880, deliveryDays: '7 Days', paymentTerms: '30 Days Net', selected: 'yes', status: 'finalized' },
  { id: 'q-2', rfqId: 'rfq-1', vendorId: 'v-4', vendorName: 'Greenlam Industries Ltd', item: 'Plywood 18mm Commercial Grade', qty: 120, unit: 'Sht', basicRate: 1480, discount: '2%', tax: '18% GST', finalRate: 1708, finalAmount: 204960, deliveryDays: '10 Days', paymentTerms: '45 Days Net', selected: 'no', status: 'rejected' },
  { id: 'q-3', rfqId: 'rfq-1', vendorId: 'v-2', vendorName: 'Asian Paints Ltd (Wood Div)', item: 'Plywood 18mm Commercial Grade', qty: 120, unit: 'Sht', basicRate: 1550, discount: '5%', tax: '18% GST', finalRate: 1730, finalAmount: 207600, deliveryDays: '12 Days', paymentTerms: '30 Days Net', selected: 'no', status: 'rejected' },
  // RFQ-2026-001 Laminate
  { id: 'q-4', rfqId: 'rfq-1', vendorId: 'v-4', vendorName: 'Greenlam Industries Ltd', item: 'Laminate Sheet', qty: 60, unit: 'Sht', basicRate: 1080, discount: '5%', tax: '18% GST', finalRate: 1205, finalAmount: 72300, deliveryDays: '7 Days', paymentTerms: '30 Days Net', selected: 'yes', status: 'finalized' },
  { id: 'q-5', rfqId: 'rfq-1', vendorId: 'v-6', vendorName: 'Pidilite Industries Ltd', item: 'Adhesive', qty: 50, unit: 'Kg', basicRate: 215, discount: '2%', tax: '18% GST', finalRate: 248, finalAmount: 12400, deliveryDays: '3 Days', paymentTerms: '15 Days Net', selected: 'yes', status: 'finalized' },
  // RFQ-2026-002 (Grand Hyatt, Paint): 2 vendors
  { id: 'q-6', rfqId: 'rfq-2', vendorId: 'v-2', vendorName: 'Asian Paints Ltd', item: 'Interior Emulsion Paint', qty: 1200, unit: 'Ltr', basicRate: 275, discount: '4%', tax: '18% GST', finalRate: 307, finalAmount: 368400, deliveryDays: '5 Days', paymentTerms: '30 Days Net', selected: 'yes', status: 'finalized' },
  { id: 'q-7', rfqId: 'rfq-2', vendorId: 'v-2', vendorName: 'Asian Paints Ltd', item: 'Primer', qty: 800, unit: 'Ltr', basicRate: 115, discount: '4%', tax: '18% GST', finalRate: 128, finalAmount: 102400, deliveryDays: '5 Days', paymentTerms: '30 Days Net', selected: 'yes', status: 'finalized' },
  // RFQ-2026-003 (Imperial, Glass)
  { id: 'q-8', rfqId: 'rfq-3', vendorId: 'v-3', vendorName: 'Saint-Gobain India Pvt Ltd', item: 'Glass Partition 12mm', qty: 800, unit: 'Sq Ft', basicRate: 315, discount: '3%', tax: '18% GST', finalRate: 360, finalAmount: 288000, deliveryDays: '14 Days', paymentTerms: '30 Days Net', selected: 'yes', status: 'finalized' },
  { id: 'q-9', rfqId: 'rfq-3', vendorId: 'v-1', vendorName: 'Century Plyboards India Ltd', item: 'Marine Plywood 18mm', qty: 100, unit: 'Sht', basicRate: 2150, discount: '2%', tax: '18% GST', finalRate: 2479, finalAmount: 247900, deliveryDays: '10 Days', paymentTerms: '30 Days Net', selected: 'yes', status: 'finalized' },
  // RFQ-2026-004 (Imperial, Paint)
  { id: 'q-10', rfqId: 'rfq-4', vendorId: 'v-2', vendorName: 'Asian Paints Ltd', item: 'Interior Emulsion Paint', qty: 500, unit: 'Ltr', basicRate: 275, discount: '5%', tax: '18% GST', finalRate: 308, finalAmount: 154000, deliveryDays: '5 Days', paymentTerms: '30 Days Net', selected: 'yes', status: 'finalized' },
  { id: 'q-11', rfqId: 'rfq-5', vendorId: 'v-6', vendorName: 'Pidilite Industries Ltd', item: 'Adhesive', qty: 30, unit: 'Kg', basicRate: 210, discount: '3%', tax: '18% GST', finalRate: 240, finalAmount: 7200, deliveryDays: '3 Days', paymentTerms: '15 Days Net', selected: 'yes', status: 'finalized' },
  { id: 'q-12', rfqId: 'rfq-6', vendorId: 'v-2', vendorName: 'Asian Paints Ltd', item: 'Interior Emulsion Paint', qty: 400, unit: 'Ltr', basicRate: 272, discount: '4%', tax: '18% GST', finalRate: 304, finalAmount: 121600, deliveryDays: '4 Days', paymentTerms: '30 Days Net', selected: 'yes', status: 'finalized' }
];

// ─── RATE COMPARISONS ────────────────────────────────────────────────────────

export interface RateComparisonRecord {
  id: string;
  rfqId: string;
  indentId: string;
  quotationIds: string[];
  selectedVendorId: string;
  selectedVendorName: string;
  selectedQuotationId: string;
  approvedByEmployeeId: string;
  siteId: string;
  site: string;
  finalisedDate: string;
  selectionReason: string;
  item: string;
  qty: string;
  uom: string;
  vendor: string;
  basicRate: number;
  discount: string;
  tax: string;
  deliveryDays: string;
  finalRate: number;
  finalAmount: number;
  selected: string;
  lowestValue?: number;
  selectedAmount?: number;
  status: string;
}

export const RATE_COMPARISONS: RateComparisonRecord[] = [
  { id: 'rc-1', rfqId: 'rfq-1', indentId: 'ind-1', quotationIds: ['q-1', 'q-2', 'q-3'], selectedVendorId: 'v-1', selectedVendorName: 'Century Plyboards India Ltd', selectedQuotationId: 'q-1', approvedByEmployeeId: 'emp-5', siteId: 'site-1', site: 'Nexus Tech Park', finalisedDate: '2026-07-24', selectionReason: 'L1 rate with best delivery schedule', item: 'Plywood 18mm Commercial Grade', qty: '120', uom: 'Sht', vendor: 'Century Plyboards India Ltd', basicRate: 1420, discount: '3%', tax: '18% GST', deliveryDays: '7 Days', finalRate: 1624, finalAmount: 194880, selected: 'yes', lowestValue: 194880, selectedAmount: 450000, status: 'finalized' },
  { id: 'rc-2', rfqId: 'rfq-1', indentId: 'ind-1', quotationIds: ['q-2', 'q-3'], selectedVendorId: 'v-4', selectedVendorName: 'Greenlam Industries Ltd', selectedQuotationId: 'q-4', approvedByEmployeeId: 'emp-5', siteId: 'site-1', site: 'Nexus Tech Park', finalisedDate: '2026-07-24', selectionReason: 'Best laminate quality at competitive rate', item: 'Laminate Sheet', qty: '60', uom: 'Sht', vendor: 'Greenlam Industries Ltd', basicRate: 1080, discount: '5%', tax: '18% GST', deliveryDays: '7 Days', finalRate: 1205, finalAmount: 72300, selected: 'yes', lowestValue: 72300, selectedAmount: 72300, status: 'finalized' },
  { id: 'rc-3', rfqId: 'rfq-2', indentId: 'ind-3', quotationIds: ['q-6', 'q-7'], selectedVendorId: 'v-2', selectedVendorName: 'Asian Paints Ltd', selectedQuotationId: 'q-6', approvedByEmployeeId: 'emp-5', siteId: 'site-2', site: 'Grand Hyatt Goa', finalisedDate: '2026-07-16', selectionReason: 'Asian Paints preferred brand for hospitality', item: 'Interior Emulsion Paint', qty: '1200', uom: 'Ltr', vendor: 'Asian Paints Ltd', basicRate: 275, discount: '4%', tax: '18% GST', deliveryDays: '5 Days', finalRate: 307, finalAmount: 368400, selected: 'yes', lowestValue: 368400, selectedAmount: 520000, status: 'converted' },
  { id: 'rc-4', rfqId: 'rfq-3', indentId: 'ind-2', quotationIds: ['q-8', 'q-9'], selectedVendorId: 'v-3', selectedVendorName: 'Saint-Gobain India Pvt Ltd', selectedQuotationId: 'q-8', approvedByEmployeeId: 'emp-5', siteId: 'site-3', site: 'Imperial Heights', finalisedDate: '2026-07-20', selectionReason: 'Specified brand in architectural drawings', item: 'Glass Partition 12mm', qty: '800', uom: 'Sq Ft', vendor: 'Saint-Gobain India Pvt Ltd', basicRate: 315, discount: '3%', tax: '18% GST', deliveryDays: '14 Days', finalRate: 360, finalAmount: 288000, selected: 'yes', lowestValue: 288000, selectedAmount: 680000, status: 'finalized' },
  { id: 'rc-5', rfqId: 'rfq-4', indentId: 'ind-6', quotationIds: ['q-10'], selectedVendorId: 'v-2', selectedVendorName: 'Asian Paints Ltd', selectedQuotationId: 'q-10', approvedByEmployeeId: 'emp-5', siteId: 'site-3', site: 'Imperial Heights', finalisedDate: '2026-07-24', selectionReason: 'Only qualified vendor for luxury residential', item: 'Interior Emulsion Paint', qty: '500', uom: 'Ltr', vendor: 'Asian Paints Ltd', basicRate: 275, discount: '5%', tax: '18% GST', deliveryDays: '5 Days', finalRate: 308, finalAmount: 154000, selected: 'yes', lowestValue: 154000, selectedAmount: 420000, status: 'converted' },
  { id: 'rc-6', rfqId: 'rfq-6', indentId: 'ind-8', quotationIds: ['q-12'], selectedVendorId: 'v-2', selectedVendorName: 'Asian Paints Ltd', selectedQuotationId: 'q-12', approvedByEmployeeId: 'emp-5', siteId: 'site-5', site: 'Oasis Luxury Villa', finalisedDate: '2026-04-22', selectionReason: 'L1 vendor with appropriate supply capacity', item: 'Interior Emulsion Paint', qty: '400', uom: 'Ltr', vendor: 'Asian Paints Ltd', basicRate: 272, discount: '4%', tax: '18% GST', deliveryDays: '4 Days', finalRate: 304, finalAmount: 121600, selected: 'yes', lowestValue: 121600, selectedAmount: 215000, status: 'converted' }
];

// ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────

export interface PurchaseOrderRecord {
  id: string;
  poNo: string;
  poNumber: string;
  indentId: string;
  rfqId: string;
  selectedVendorId: string;
  vendor: string;
  siteId: string;
  site: string;
  poDate: string;
  expectedDelivery: string;
  totalAmount: number;
  amount: number;
  paymentTerms: string;
  status: string;
}

export const PURCHASE_ORDERS: PurchaseOrderRecord[] = [
  { id: 'po-1', poNo: 'PO-2026-088', poNumber: 'PO-2026-088', indentId: 'ind-1', rfqId: 'rfq-1', selectedVendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', poDate: '2026-07-15', expectedDelivery: '2026-08-05', totalAmount: 12500000, amount: 12500000, paymentTerms: '30 Days Net', status: 'approved' },
  { id: 'po-2', poNo: 'PO-2026-089', poNumber: 'PO-2026-089', indentId: 'ind-3', rfqId: 'rfq-2', selectedVendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-2', site: 'Grand Hyatt Goa', poDate: '2026-07-18', expectedDelivery: '2026-08-02', totalAmount: 480000, amount: 480000, paymentTerms: '30 Days Net', status: 'delivered' },
  { id: 'po-3', poNo: 'PO-2026-090', poNumber: 'PO-2026-090', indentId: 'ind-2', rfqId: 'rfq-3', selectedVendorId: 'v-3', vendor: 'Saint-Gobain India Pvt Ltd', siteId: 'site-3', site: 'Imperial Heights', poDate: '2026-07-20', expectedDelivery: '2026-08-10', totalAmount: 980000, amount: 980000, paymentTerms: '45 Days Net', status: 'approved' },
  { id: 'po-4', poNo: 'PO-2026-091', poNumber: 'PO-2026-091', indentId: 'ind-6', rfqId: 'rfq-4', selectedVendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-3', site: 'Imperial Heights', poDate: '2026-07-22', expectedDelivery: '2026-08-05', totalAmount: 425000, amount: 425000, paymentTerms: '30 Days Net', status: 'partially_delivered' },
  { id: 'po-5', poNo: 'PO-2026-092', poNumber: 'PO-2026-092', indentId: 'ind-4', rfqId: 'rfq-5', selectedVendorId: 'v-6', vendor: 'Pidilite Industries Ltd', siteId: 'site-4', site: 'Synergy Co-Working', poDate: '2026-07-23', expectedDelivery: '2026-08-08', totalAmount: 165000, amount: 165000, paymentTerms: '15 Days Net', status: 'approved' },
  { id: 'po-6', poNo: 'PO-2026-093', poNumber: 'PO-2026-093', indentId: 'ind-8', rfqId: 'rfq-6', selectedVendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-5', site: 'Oasis Luxury Villa', poDate: '2026-04-25', expectedDelivery: '2026-05-05', totalAmount: 215000, amount: 215000, paymentTerms: '30 Days Net', status: 'delivered' }
];

// ─── WORK ORDERS ─────────────────────────────────────────────────────────────

export interface WorkOrderRecord {
  id: string;
  woNumber: string;
  contractorId: string;
  contractor: string;
  siteId: string;
  site: string;
  scope: string;
  startDate: string;
  completionDate: string;
  totalValue: number;
  retention: string;
  mobilisationAdvance: string;
  status: string;
}

export const WORK_ORDERS: WorkOrderRecord[] = [
  { id: 'wo-1', woNumber: 'WO-2026-041', contractorId: 'v-7', contractor: 'Unique Carpentry Services', siteId: 'site-1', site: 'Nexus Tech Park', scope: 'Complete carpentry installation — reception joinery, workstation panelling, and boardroom millwork', startDate: '2026-05-01', completionDate: '2026-08-31', totalValue: 8500000, retention: '10%', mobilisationAdvance: '15%', status: 'active' },
  { id: 'wo-2', woNumber: 'WO-2026-042', contractorId: 'v-8', contractor: 'Bright Spark Electrical Works', siteId: 'site-1', site: 'Nexus Tech Park', scope: 'Electrical installation — LT panel, lighting circuit, power points, and AV cabling', startDate: '2026-04-15', completionDate: '2026-09-15', totalValue: 4200000, retention: '10%', mobilisationAdvance: '10%', status: 'active' },
  { id: 'wo-3', woNumber: 'WO-2026-043', contractorId: 'v-7', contractor: 'Unique Carpentry Services', siteId: 'site-3', site: 'Imperial Heights', scope: 'Luxury residential joinery — master bedroom wardrobe, kitchen cabinetry, and dining sideboard', startDate: '2026-06-01', completionDate: '2026-10-15', totalValue: 6800000, retention: '10%', mobilisationAdvance: '20%', status: 'active' },
  { id: 'wo-4', woNumber: 'WO-2026-044', contractorId: 'v-2', contractor: 'Asian Paints Ltd', siteId: 'site-2', site: 'Grand Hyatt Goa', scope: 'Complete painting works — surface preparation, primer coat, and two finish coats throughout lounge', startDate: '2026-01-10', completionDate: '2026-04-10', totalValue: 1800000, retention: '5%', mobilisationAdvance: '20%', status: 'completed' }
];

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export interface OrderRecord {
  id: string;
  orderNo: string;
  orderNumber: string;
  purchaseOrderId: string;
  poRef: string;
  vendorId: string;
  vendor: string;
  siteId: string;
  site: string;
  orderDate: string;
  expectedDelivery: string;
  totalQty: string;
  receivedQty: string;
  amount: number;
  status: string;
}

export const ORDERS: OrderRecord[] = [
  { id: 'ord-1', orderNo: 'ORD-2026-081', orderNumber: 'ORD-2026-081', purchaseOrderId: 'po-1', poRef: 'PO-2026-088', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', orderDate: '2026-07-17', expectedDelivery: '2026-08-05', totalQty: '500 Sheets', receivedQty: '300 Sheets', amount: 12500000, status: 'partially_received' },
  { id: 'ord-2', orderNo: 'ORD-2026-082', orderNumber: 'ORD-2026-082', purchaseOrderId: 'po-2', poRef: 'PO-2026-089', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-2', site: 'Grand Hyatt Goa', orderDate: '2026-07-19', expectedDelivery: '2026-08-02', totalQty: '1200 Litres', receivedQty: '1200 Litres', amount: 480000, status: 'completed' },
  { id: 'ord-3', orderNo: 'ORD-2026-083', orderNumber: 'ORD-2026-083', purchaseOrderId: 'po-3', poRef: 'PO-2026-090', vendorId: 'v-3', vendor: 'Saint-Gobain India Pvt Ltd', siteId: 'site-3', site: 'Imperial Heights', orderDate: '2026-07-22', expectedDelivery: '2026-08-10', totalQty: '800 Sq Ft', receivedQty: '0 Sq Ft', amount: 980000, status: 'created' },
  { id: 'ord-4', orderNo: 'ORD-2026-084', orderNumber: 'ORD-2026-084', purchaseOrderId: 'po-4', poRef: 'PO-2026-091', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-3', site: 'Imperial Heights', orderDate: '2026-07-23', expectedDelivery: '2026-08-05', totalQty: '1200 Litres', receivedQty: '600 Litres', amount: 425000, status: 'partially_received' },
  { id: 'ord-5', orderNo: 'ORD-2026-085', orderNumber: 'ORD-2026-085', purchaseOrderId: 'po-5', poRef: 'PO-2026-092', vendorId: 'v-6', vendor: 'Pidilite Industries Ltd', siteId: 'site-4', site: 'Synergy Co-Working', orderDate: '2026-07-24', expectedDelivery: '2026-08-08', totalQty: '80 Kg', receivedQty: '0 Kg', amount: 165000, status: 'created' },
  { id: 'ord-6', orderNo: 'ORD-2026-086', orderNumber: 'ORD-2026-086', purchaseOrderId: 'po-6', poRef: 'PO-2026-093', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-5', site: 'Oasis Luxury Villa', orderDate: '2026-04-26', expectedDelivery: '2026-05-05', totalQty: '400 Litres', receivedQty: '400 Litres', amount: 215000, status: 'completed' }
];

// ─── GRNs ─────────────────────────────────────────────────────────────────────

export interface GRNRecord {
  id: string;
  grnNo: string;
  grnNumber: string;
  orderId: string;
  orderNo: string;
  purchaseOrderId: string;
  vendorId: string;
  vendor: string;
  siteId: string;
  site: string;
  receivedDate: string;
  totalItems: string;
  acceptedQty: string;
  rejectedQty: string;
  status: string;
}

export const GRNS: GRNRecord[] = [
  { id: 'grn-1', grnNo: 'GRN-2026-101', grnNumber: 'GRN-2026-101', orderId: 'ord-1', orderNo: 'ORD-2026-081', purchaseOrderId: 'po-1', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', receivedDate: '2026-07-25', totalItems: '3 Items', acceptedQty: '290 Sheets', rejectedQty: '10 Sheets', status: 'completed' },
  { id: 'grn-2', grnNo: 'GRN-2026-102', grnNumber: 'GRN-2026-102', orderId: 'ord-1', orderNo: 'ORD-2026-081', purchaseOrderId: 'po-1', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', receivedDate: '2026-08-05', totalItems: '3 Items', acceptedQty: '200 Sheets', rejectedQty: '0 Sheets', status: 'pending_approval' },
  { id: 'grn-3', grnNo: 'GRN-2026-103', grnNumber: 'GRN-2026-103', orderId: 'ord-2', orderNo: 'ORD-2026-082', purchaseOrderId: 'po-2', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-2', site: 'Grand Hyatt Goa', receivedDate: '2026-07-28', totalItems: '2 Items', acceptedQty: '1200 Litres', rejectedQty: '0 Litres', status: 'completed' },
  { id: 'grn-4', grnNo: 'GRN-2026-104', grnNumber: 'GRN-2026-104', orderId: 'ord-4', orderNo: 'ORD-2026-084', purchaseOrderId: 'po-4', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-3', site: 'Imperial Heights', receivedDate: '2026-07-30', totalItems: '2 Items', acceptedQty: '590 Litres', rejectedQty: '10 Litres', status: 'completed' },
  { id: 'grn-5', grnNo: 'GRN-2026-105', grnNumber: 'GRN-2026-105', orderId: 'ord-6', orderNo: 'ORD-2026-086', purchaseOrderId: 'po-6', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-5', site: 'Oasis Luxury Villa', receivedDate: '2026-05-05', totalItems: '3 Items', acceptedQty: '400 Litres', rejectedQty: '0 Litres', status: 'completed' },
  { id: 'grn-6', grnNo: 'GRN-2026-106', grnNumber: 'GRN-2026-106', orderId: 'ord-1', orderNo: 'ORD-2026-081', purchaseOrderId: 'po-1', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', receivedDate: '2026-07-20', totalItems: '2 Items', acceptedQty: '480 Sq Ft', rejectedQty: '20 Sq Ft', status: 'completed' },
  { id: 'grn-7', grnNo: 'GRN-2026-107', grnNumber: 'GRN-2026-107', orderId: 'ord-3', orderNo: 'ORD-2026-083', purchaseOrderId: 'po-3', vendorId: 'v-3', vendor: 'Saint-Gobain India Pvt Ltd', siteId: 'site-3', site: 'Imperial Heights', receivedDate: '2026-08-12', totalItems: '2 Items', acceptedQty: '0 Sq Ft', rejectedQty: '0 Sq Ft', status: 'pending_approval' },
  { id: 'grn-8', grnNo: 'GRN-2026-108', grnNumber: 'GRN-2026-108', orderId: 'ord-4', orderNo: 'ORD-2026-084', purchaseOrderId: 'po-4', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-3', site: 'Imperial Heights', receivedDate: '2026-08-01', totalItems: '1 Item', acceptedQty: '600 Litres', rejectedQty: '0 Litres', status: 'completed' }
];

// ─── VENDOR INVOICES ─────────────────────────────────────────────────────────

export interface VendorInvoiceRecord {
  id: string;
  invoiceNo: string;
  invoiceNumber: string;
  grnId: string;
  purchaseOrderId: string;
  vendorId: string;
  vendor: string;
  siteId: string;
  site: string;
  invoiceDate: string;
  dueDate: string;
  grossAmount: number;
  tax: number;
  certifiedAmount: number;
  creditNoteAmount: number;
  debitNoteAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  approvalStatus: string;
  paymentStatus: string;
  status: string;
}

export const VENDOR_INVOICES: VendorInvoiceRecord[] = [
  { id: 'inv-1', invoiceNo: 'INV-VND-2026-001', invoiceNumber: 'INV-VND-2026-001', grnId: 'grn-1', purchaseOrderId: 'po-1', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', invoiceDate: '2026-07-26', dueDate: '2026-08-25', grossAmount: 7080000, tax: 1080000, certifiedAmount: 7080000, creditNoteAmount: 0, debitNoteAmount: 25000, paidAmount: 5000000, outstandingAmount: 2055000, approvalStatus: 'approved', paymentStatus: 'partially_paid', status: 'certified' },
  { id: 'inv-2', invoiceNo: 'INV-VND-2026-002', invoiceNumber: 'INV-VND-2026-002', grnId: 'grn-3', purchaseOrderId: 'po-2', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-2', site: 'Grand Hyatt Goa', invoiceDate: '2026-07-29', dueDate: '2026-08-28', grossAmount: 480000, tax: 73220, certifiedAmount: 480000, creditNoteAmount: 0, debitNoteAmount: 0, paidAmount: 480000, outstandingAmount: 0, approvalStatus: 'approved', paymentStatus: 'paid', status: 'paid' },
  { id: 'inv-3', invoiceNo: 'INV-VND-2026-003', invoiceNumber: 'INV-VND-2026-003', grnId: 'grn-4', purchaseOrderId: 'po-4', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-3', site: 'Imperial Heights', invoiceDate: '2026-07-31', dueDate: '2026-08-30', grossAmount: 210000, tax: 32034, certifiedAmount: 198000, creditNoteAmount: 12000, debitNoteAmount: 0, paidAmount: 0, outstandingAmount: 186000, approvalStatus: 'approved', paymentStatus: 'unpaid', status: 'certified' },
  { id: 'inv-4', invoiceNo: 'INV-VND-2026-004', invoiceNumber: 'INV-VND-2026-004', grnId: 'grn-5', purchaseOrderId: 'po-6', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-5', site: 'Oasis Luxury Villa', invoiceDate: '2026-05-06', dueDate: '2026-06-05', grossAmount: 215000, tax: 32797, certifiedAmount: 215000, creditNoteAmount: 0, debitNoteAmount: 0, paidAmount: 215000, outstandingAmount: 0, approvalStatus: 'approved', paymentStatus: 'paid', status: 'paid' },
  { id: 'inv-5', invoiceNo: 'INV-VND-2026-005', invoiceNumber: 'INV-VND-2026-005', grnId: 'grn-6', purchaseOrderId: 'po-1', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', invoiceDate: '2026-07-22', dueDate: '2026-08-21', grossAmount: 5420000, tax: 826780, certifiedAmount: 5420000, creditNoteAmount: 0, debitNoteAmount: 15000, paidAmount: 4000000, outstandingAmount: 1435000, approvalStatus: 'approved', paymentStatus: 'partially_paid', status: 'certified' },
  { id: 'inv-6', invoiceNo: 'INV-VND-2026-006', invoiceNumber: 'INV-VND-2026-006', grnId: 'grn-8', purchaseOrderId: 'po-4', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-3', site: 'Imperial Heights', invoiceDate: '2026-08-02', dueDate: '2026-09-01', grossAmount: 215000, tax: 32797, certifiedAmount: 215000, creditNoteAmount: 0, debitNoteAmount: 0, paidAmount: 0, outstandingAmount: 215000, approvalStatus: 'pending_approval', paymentStatus: 'unpaid', status: 'draft' },
  { id: 'inv-7', invoiceNo: 'INV-VND-2026-007', invoiceNumber: 'INV-VND-2026-007', grnId: 'grn-4', purchaseOrderId: 'po-3', vendorId: 'v-3', vendor: 'Saint-Gobain India Pvt Ltd', siteId: 'site-3', site: 'Imperial Heights', invoiceDate: '2026-07-30', dueDate: '2026-08-29', grossAmount: 570000, tax: 86949, certifiedAmount: 570000, creditNoteAmount: 0, debitNoteAmount: 0, paidAmount: 0, outstandingAmount: 570000, approvalStatus: 'approved', paymentStatus: 'unpaid', status: 'certified' },
  { id: 'inv-8', invoiceNo: 'INV-VND-2026-008', invoiceNumber: 'INV-VND-2026-008', grnId: 'grn-1', purchaseOrderId: 'po-1', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', invoiceDate: '2026-07-26', dueDate: '2026-08-25', grossAmount: 7080000, tax: 1080000, certifiedAmount: 6000000, creditNoteAmount: 0, debitNoteAmount: 0, paidAmount: 0, outstandingAmount: 6000000, approvalStatus: 'pending_approval', paymentStatus: 'unpaid', status: 'draft' }
];

// ─── ACCOUNTING INVOICES ─────────────────────────────────────────────────────

export interface AccountingInvoiceRecord {
  id: string;
  invoiceNo: string;
  vendor: string;
  vendorId: string;
  companyId: string;
  siteId: string;
  site: string;
  date: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
}

export const ACCOUNTING_INVOICES: AccountingInvoiceRecord[] = [
  { id: 'acc-1', invoiceNo: 'ACC-INV-2026-001', vendor: 'Century Plyboards India Ltd', vendorId: 'v-1', companyId: 'cmp-1', siteId: 'site-1', site: 'Nexus Tech Park', date: '2026-07-05', amount: 420000, tax: 75600, total: 495600, status: 'approved' },
  { id: 'acc-2', invoiceNo: 'ACC-INV-2026-002', vendor: 'Asian Paints Ltd', vendorId: 'v-2', companyId: 'cmp-1', siteId: 'site-2', site: 'Grand Hyatt Goa', date: '2026-07-10', amount: 185000, tax: 33300, total: 218300, status: 'approved' },
  { id: 'acc-3', invoiceNo: 'ACC-INV-2026-003', vendor: 'Schneider Electric India Ltd', vendorId: 'v-5', companyId: 'cmp-1', siteId: 'site-3', site: 'Imperial Heights', date: '2026-07-15', amount: 560000, tax: 100800, total: 660800, status: 'approved' },
  { id: 'acc-4', invoiceNo: 'ACC-INV-2026-004', vendor: 'Unique Carpentry Services', vendorId: 'v-7', companyId: 'cmp-1', siteId: 'site-1', site: 'Nexus Tech Park', date: '2026-07-18', amount: 1200000, tax: 216000, total: 1416000, status: 'pending_approval' },
  { id: 'acc-5', invoiceNo: 'ACC-INV-2026-005', vendor: 'Bright Spark Electrical Works', vendorId: 'v-8', companyId: 'cmp-1', siteId: 'site-1', site: 'Nexus Tech Park', date: '2026-07-20', amount: 950000, tax: 171000, total: 1121000, status: 'approved' }
];

// ─── CREDIT NOTES ─────────────────────────────────────────────────────────────

export interface CreditNoteRecord {
  id: string;
  cnNumber: string;
  linkedInvoiceId: string;
  reference: string;
  vendorId: string;
  vendor: string;
  siteId: string;
  site: string;
  date: string;
  amount: number;
  reason: string;
  status: string;
}

export const CREDIT_NOTES: CreditNoteRecord[] = [
  { id: 'cn-1', cnNumber: 'CN-2026-001', linkedInvoiceId: 'inv-3', reference: 'INV-VND-2026-003', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-3', site: 'Imperial Heights', date: '2026-08-02', amount: 12000, reason: 'Rate adjustment — approved discount not applied in original invoice', status: 'approved' },
  { id: 'cn-2', cnNumber: 'CN-2026-002', linkedInvoiceId: 'inv-2', reference: 'INV-VND-2026-002', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-2', site: 'Grand Hyatt Goa', date: '2026-08-01', amount: 8500, reason: 'Short supply on Primer batch — quantity reconciliation', status: 'approved' },
  { id: 'cn-3', cnNumber: 'CN-2026-003', linkedInvoiceId: 'inv-1', reference: 'INV-VND-2026-001', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', date: '2026-07-28', amount: 25000, reason: 'Damaged material deduction — 10 sheets rejected at GRN', status: 'approved' }
];

// ─── DEBIT NOTES ─────────────────────────────────────────────────────────────

export interface DebitNoteRecord {
  id: string;
  dnNumber: string;
  linkedInvoiceId: string;
  reference: string;
  vendorId: string;
  vendor: string;
  siteId: string;
  site: string;
  date: string;
  amount: number;
  reason: string;
  status: string;
}

export const DEBIT_NOTES: DebitNoteRecord[] = [
  { id: 'dn-1', dnNumber: 'DN-2026-001', linkedInvoiceId: 'inv-1', reference: 'INV-VND-2026-001', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', date: '2026-07-28', amount: 25000, reason: 'Rejected material recovery — 10 sheets out-of-spec plywood', status: 'approved' },
  { id: 'dn-2', dnNumber: 'DN-2026-002', linkedInvoiceId: 'inv-5', reference: 'INV-VND-2026-005', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', date: '2026-07-23', amount: 15000, reason: 'Delivery delay penalty — 3 days late against agreed schedule', status: 'approved' },
  { id: 'dn-3', dnNumber: 'DN-2026-003', linkedInvoiceId: 'inv-3', reference: 'INV-VND-2026-003', vendorId: 'v-2', vendor: 'Asian Paints Ltd', siteId: 'site-3', site: 'Imperial Heights', date: '2026-08-01', amount: 8000, reason: 'Poor workmanship on primer application — rectification cost recovery', status: 'pending_approval' }
];

// ─── PAYMENT REQUESTS ────────────────────────────────────────────────────────

export interface PaymentRequestRecord {
  id: string;
  reqNo: string;
  requestNumber: string;
  invoiceId: string;
  vendorId: string;
  vendor: string;
  payee: string;
  siteId: string;
  site: string;
  reqDate: string;
  requestDate: string;
  reqAmount: number;
  amount: number;
  paymentFor: string;
  pendingWith: string;
  status: string;
}

export const PAYMENT_REQUESTS: PaymentRequestRecord[] = [
  { id: 'pr-1', reqNo: 'PREQ-2026-001', requestNumber: 'PREQ-2026-001', invoiceId: 'inv-1', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', payee: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', reqDate: '2026-07-27', requestDate: '2026-07-27', reqAmount: 5000000, amount: 5000000, paymentFor: 'Invoice INV-VND-2026-001 — Partial Payment', pendingWith: 'Sanjay Mehta (Chairman)', status: 'approved' },
  { id: 'pr-2', reqNo: 'PREQ-2026-002', requestNumber: 'PREQ-2026-002', invoiceId: 'inv-2', vendorId: 'v-2', vendor: 'Asian Paints Ltd', payee: 'Asian Paints Ltd', siteId: 'site-2', site: 'Grand Hyatt Goa', reqDate: '2026-07-30', requestDate: '2026-07-30', reqAmount: 480000, amount: 480000, paymentFor: 'Invoice INV-VND-2026-002 — Full Settlement', pendingWith: '', status: 'paid' },
  { id: 'pr-3', reqNo: 'PREQ-2026-003', requestNumber: 'PREQ-2026-003', invoiceId: 'inv-4', vendorId: 'v-2', vendor: 'Asian Paints Ltd', payee: 'Asian Paints Ltd', siteId: 'site-5', site: 'Oasis Luxury Villa', reqDate: '2026-05-07', requestDate: '2026-05-07', reqAmount: 215000, amount: 215000, paymentFor: 'Invoice INV-VND-2026-004 — Full Settlement', pendingWith: '', status: 'paid' },
  { id: 'pr-4', reqNo: 'PREQ-2026-004', requestNumber: 'PREQ-2026-004', invoiceId: 'inv-5', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', payee: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', reqDate: '2026-07-23', requestDate: '2026-07-23', reqAmount: 4000000, amount: 4000000, paymentFor: 'Invoice INV-VND-2026-005 — Partial Payment', pendingWith: '', status: 'paid' },
  { id: 'pr-5', reqNo: 'PREQ-2026-005', requestNumber: 'PREQ-2026-005', invoiceId: 'inv-7', vendorId: 'v-3', vendor: 'Saint-Gobain India Pvt Ltd', payee: 'Saint-Gobain India Pvt Ltd', siteId: 'site-3', site: 'Imperial Heights', reqDate: '2026-07-31', requestDate: '2026-07-31', reqAmount: 570000, amount: 570000, paymentFor: 'Invoice INV-VND-2026-007 — Full Settlement', pendingWith: 'Sanjay Mehta (Chairman)', status: 'pending_approval' }
];

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  paymentRef: string;
  paymentReference: string;
  paymentRequestId: string;
  invoiceId: string;
  vendorId: string;
  vendor: string;
  payee: string;
  siteId: string;
  site: string;
  paymentDate: string;
  mode: string;
  amount: number;
  bankAccountId: string;
  approvalStatus: string;
  txnStatus: string;
  status: string;
}

export const PAYMENTS: PaymentRecord[] = [
  { id: 'pay-1', paymentRef: 'PAY-2026-001', paymentReference: 'PAY-2026-001', paymentRequestId: 'pr-1', invoiceId: 'inv-1', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', payee: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', paymentDate: '2026-07-28', mode: 'Bank Transfer / RTGS', amount: 5000000, bankAccountId: 'bnk-1', approvalStatus: 'approved', txnStatus: 'processed', status: 'processed' },
  { id: 'pay-2', paymentRef: 'PAY-2026-002', paymentReference: 'PAY-2026-002', paymentRequestId: 'pr-2', invoiceId: 'inv-2', vendorId: 'v-2', vendor: 'Asian Paints Ltd', payee: 'Asian Paints Ltd', siteId: 'site-2', site: 'Grand Hyatt Goa', paymentDate: '2026-07-31', mode: 'Bank Transfer / NEFT', amount: 480000, bankAccountId: 'bnk-1', approvalStatus: 'approved', txnStatus: 'processed', status: 'processed' },
  { id: 'pay-3', paymentRef: 'PAY-2026-003', paymentReference: 'PAY-2026-003', paymentRequestId: 'pr-3', invoiceId: 'inv-4', vendorId: 'v-2', vendor: 'Asian Paints Ltd', payee: 'Asian Paints Ltd', siteId: 'site-5', site: 'Oasis Luxury Villa', paymentDate: '2026-05-08', mode: 'Bank Transfer / NEFT', amount: 215000, bankAccountId: 'bnk-1', approvalStatus: 'approved', txnStatus: 'processed', status: 'processed' },
  { id: 'pay-4', paymentRef: 'PAY-2026-004', paymentReference: 'PAY-2026-004', paymentRequestId: 'pr-4', invoiceId: 'inv-5', vendorId: 'v-1', vendor: 'Century Plyboards India Ltd', payee: 'Century Plyboards India Ltd', siteId: 'site-1', site: 'Nexus Tech Park', paymentDate: '2026-07-24', mode: 'Bank Transfer / RTGS', amount: 4000000, bankAccountId: 'bnk-1', approvalStatus: 'approved', txnStatus: 'processed', status: 'processed' },
  { id: 'pay-5', paymentRef: 'PAY-2026-005', paymentReference: 'PAY-2026-005', paymentRequestId: '', invoiceId: '', vendorId: 'v-7', vendor: 'Unique Carpentry Services', payee: 'Unique Carpentry Services', siteId: 'site-1', site: 'Nexus Tech Park', paymentDate: '2026-07-15', mode: 'Bank Transfer / NEFT', amount: 1275000, bankAccountId: 'bnk-1', approvalStatus: 'approved', txnStatus: 'processed', status: 'processed' }
];

// ─── CLIENT BILLS ─────────────────────────────────────────────────────────────

export interface ClientBillRecord {
  id: string;
  billNo: string;
  clientId: string;
  clientName: string;
  projectId: string;
  siteId: string;
  site: string;
  tenderId: string;
  billDate: string;
  dueDate: string;
  billAmount: number;
  certifiedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  milestone: string;
  status: string;
}

export const CLIENT_BILLS: ClientBillRecord[] = [
  { id: 'cb-1', billNo: 'CBI-2026-001', clientId: 'cl-1', clientName: 'Nexus Realty Group', projectId: 'p-1', siteId: 'site-1', site: 'Nexus Tech Park', tenderId: 'td-1', billDate: '2026-04-01', dueDate: '2026-04-30', billAmount: 7500000, certifiedAmount: 7500000, paidAmount: 6000000, outstandingAmount: 1500000, milestone: 'Stage 1 — Civil & Framing 30%', status: 'partially_paid' },
  { id: 'cb-2', billNo: 'CBI-2026-002', clientId: 'cl-1', clientName: 'Nexus Realty Group', projectId: 'p-1', siteId: 'site-1', site: 'Nexus Tech Park', tenderId: 'td-1', billDate: '2026-05-20', dueDate: '2026-06-19', billAmount: 6000000, certifiedAmount: 6000000, paidAmount: 4500000, outstandingAmount: 1500000, milestone: 'Stage 2 — MEP Roughing & Services 45%', status: 'partially_paid' },
  { id: 'cb-3', billNo: 'CBI-2026-003', clientId: 'cl-1', clientName: 'Nexus Realty Group', projectId: 'p-1', siteId: 'site-1', site: 'Nexus Tech Park', tenderId: 'td-1', billDate: '2026-07-10', dueDate: '2026-08-09', billAmount: 4500000, certifiedAmount: 4500000, paidAmount: 0, outstandingAmount: 4500000, milestone: 'Stage 3 — Joinery & Finishes 60%', status: 'unpaid' },
  { id: 'cb-4', billNo: 'CBI-2026-004', clientId: 'cl-2', clientName: 'Hyatt Hospitality India', projectId: 'p-2', siteId: 'site-2', site: 'Grand Hyatt Goa', tenderId: 'td-2', billDate: '2026-02-15', dueDate: '2026-03-17', billAmount: 4000000, certifiedAmount: 4000000, paidAmount: 4000000, outstandingAmount: 0, milestone: 'Stage 1 — Mobilisation 33%', status: 'paid' },
  { id: 'cb-5', billNo: 'CBI-2026-005', clientId: 'cl-2', clientName: 'Hyatt Hospitality India', projectId: 'p-2', siteId: 'site-2', site: 'Grand Hyatt Goa', tenderId: 'td-2', billDate: '2026-04-05', dueDate: '2026-05-05', billAmount: 5500000, certifiedAmount: 5500000, paidAmount: 4500000, outstandingAmount: 1000000, milestone: 'Stage 2 — Fit-Out Complete 90%', status: 'partially_paid' },
  { id: 'cb-6', billNo: 'CBI-2026-006', clientId: 'cl-3', clientName: 'Imperial Realty Holdings', projectId: 'p-3', siteId: 'site-3', site: 'Imperial Heights', tenderId: 'td-3', billDate: '2026-06-01', dueDate: '2026-07-01', billAmount: 12000000, certifiedAmount: 11500000, paidAmount: 9000000, outstandingAmount: 2500000, milestone: 'Stage 1 — Structure & Services 40%', status: 'partially_paid' }
];

// ─── CLIENT PAYMENTS ─────────────────────────────────────────────────────────

export interface ClientPaymentRecord {
  id: string;
  paymentRef: string;
  clientId: string;
  clientName: string;
  projectId: string;
  siteId: string;
  site: string;
  billId: string;
  bankAccountId: string;
  paymentDate: string;
  amount: number;
  mode: string;
  status: string;
}

export const CLIENT_PAYMENTS: ClientPaymentRecord[] = [
  { id: 'cp-1', paymentRef: 'CPR-2026-001', clientId: 'cl-1', clientName: 'Nexus Realty Group', projectId: 'p-1', siteId: 'site-1', site: 'Nexus Tech Park', billId: 'cb-1', bankAccountId: 'bnk-1', paymentDate: '2026-04-25', amount: 6000000, mode: 'Bank Transfer / RTGS', status: 'processed' },
  { id: 'cp-2', paymentRef: 'CPR-2026-002', clientId: 'cl-1', clientName: 'Nexus Realty Group', projectId: 'p-1', siteId: 'site-1', site: 'Nexus Tech Park', billId: 'cb-2', bankAccountId: 'bnk-1', paymentDate: '2026-06-10', amount: 4500000, mode: 'Bank Transfer / RTGS', status: 'processed' },
  { id: 'cp-3', paymentRef: 'CPR-2026-003', clientId: 'cl-2', clientName: 'Hyatt Hospitality India', projectId: 'p-2', siteId: 'site-2', site: 'Grand Hyatt Goa', billId: 'cb-4', bankAccountId: 'bnk-1', paymentDate: '2026-03-10', amount: 4000000, mode: 'Bank Transfer / NEFT', status: 'processed' },
  { id: 'cp-4', paymentRef: 'CPR-2026-004', clientId: 'cl-2', clientName: 'Hyatt Hospitality India', projectId: 'p-2', siteId: 'site-2', site: 'Grand Hyatt Goa', billId: 'cb-5', bankAccountId: 'bnk-1', paymentDate: '2026-04-28', amount: 4500000, mode: 'Bank Transfer / RTGS', status: 'processed' },
  { id: 'cp-5', paymentRef: 'CPR-2026-005', clientId: 'cl-3', clientName: 'Imperial Realty Holdings', projectId: 'p-3', siteId: 'site-3', site: 'Imperial Heights', billId: 'cb-6', bankAccountId: 'bnk-2', paymentDate: '2026-06-25', amount: 9000000, mode: 'Bank Transfer / RTGS', status: 'processed' }
];

// ─── ON-ACCOUNT BALANCES & TRANSACTIONS ──────────────────────────────────────

export interface VendorOnAccountBalance {
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

export const VENDOR_ON_ACCOUNT_BALANCES: VendorOnAccountBalance[] = [
  {
    id: 'vob-1',
    vendorId: 'v-2',
    vendorName: 'Century Plyboards India Ltd',
    siteId: 'site-1',
    siteName: 'Nexus Tech Park',
    originalAmount: 500000,
    allocatedToInvoices: 300000,
    transferredAmount: 0,
    availableBalance: 200000,
    lastTransactionDate: '2026-07-24',
    status: 'active'
  },
  {
    id: 'vob-2',
    vendorId: 'v-1',
    vendorName: 'Asian Paints Ltd',
    siteId: 'site-2',
    siteName: 'Grand Hyatt Goa',
    originalAmount: 400000,
    allocatedToInvoices: 250000,
    transferredAmount: 0,
    availableBalance: 150000,
    lastTransactionDate: '2026-07-22',
    status: 'active'
  },
  {
    id: 'vob-3',
    vendorId: 'v-3',
    vendorName: 'Saint-Gobain India Pvt Ltd',
    siteId: 'site-3',
    siteName: 'Imperial Heights',
    originalAmount: 300000,
    allocatedToInvoices: 100000,
    transferredAmount: 0,
    availableBalance: 200000,
    lastTransactionDate: '2026-07-20',
    status: 'active'
  }
];

export interface SiteOnAccountBalance {
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

export const SITE_ON_ACCOUNT_BALANCES: SiteOnAccountBalance[] = [
  {
    id: 'sob-1',
    siteId: 'site-1',
    siteName: 'Nexus Tech Park',
    receivedAmount: 500000,
    allocatedToInvoices: 300000,
    transferredIn: 0,
    transferredOut: 100000,
    availableBalance: 100000,
    lastUpdatedDate: '2026-07-24'
  },
  {
    id: 'sob-2',
    siteId: 'site-2',
    siteName: 'Grand Hyatt Goa',
    receivedAmount: 400000,
    allocatedToInvoices: 250000,
    transferredIn: 100000,
    transferredOut: 0,
    availableBalance: 250000,
    lastUpdatedDate: '2026-07-23'
  },
  {
    id: 'sob-3',
    siteId: 'site-3',
    siteName: 'Imperial Heights',
    receivedAmount: 300000,
    allocatedToInvoices: 100000,
    transferredIn: 0,
    transferredOut: 0,
    availableBalance: 200000,
    lastUpdatedDate: '2026-07-20'
  }
];

export interface OnAccountTransaction {
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

export const ON_ACCOUNT_TRANSACTIONS: OnAccountTransaction[] = [
  {
    id: 'oat-1',
    transactionReference: 'OAT-2026-001',
    transactionDate: '2026-07-24',
    transactionType: 'invoice_allocation',
    vendorId: 'v-2',
    vendorName: 'Century Plyboards India Ltd',
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2026-041',
    destinationSiteName: 'INV-2026-041',
    amount: 300000,
    status: 'processed'
  },
  {
    id: 'oat-2',
    transactionReference: 'OAT-2026-002',
    transactionDate: '2026-07-23',
    transactionType: 'inter_site_transfer',
    sourceSiteId: 'site-1',
    sourceSiteName: 'Nexus Tech Park',
    destinationSiteId: 'site-2',
    destinationSiteName: 'Grand Hyatt Goa',
    vendorId: 'v-2',
    vendorName: 'Century Plyboards India Ltd',
    amount: 100000,
    status: 'processed'
  },
  {
    id: 'oat-3',
    transactionReference: 'OAT-2026-003',
    transactionDate: '2026-07-22',
    transactionType: 'receipt',
    destinationSiteId: 'site-2',
    destinationSiteName: 'Grand Hyatt Goa',
    vendorId: 'v-1',
    vendorName: 'Asian Paints Ltd',
    amount: 400000,
    status: 'approved'
  }
];

// ─── BUDGET TRANSFERS ────────────────────────────────────────────────────────

export interface BudgetTransferRecord {
  id: string;
  referenceNo: string;
  date: string;
  sourceSiteId: string;
  sourceSite: string;
  sourceCategory: string;
  destinationSiteId: string;
  destinationSite: string;
  destinationCategory: string;
  amount: number;
  reason: string;
  approvedBy: string;
  status: string;
}

export const BUDGET_TRANSFERS: BudgetTransferRecord[] = [
  { id: 'btr-1', referenceNo: 'BTR-2026-001', date: '2026-07-05', sourceSiteId: 'site-1', sourceSite: 'Nexus Tech Park', sourceCategory: 'Contingency Reserve', destinationSiteId: 'site-2', destinationSite: 'Grand Hyatt Goa', destinationCategory: 'Materials — Paint & Finishes', amount: 1000000, reason: 'Hyatt paint scope increase requiring additional material budget', approvedBy: 'Sanjay Mehta (Chairman)', status: 'approved' },
  { id: 'btr-2', referenceNo: 'BTR-2026-002', date: '2026-07-15', sourceSiteId: 'site-3', sourceSite: 'Imperial Heights', sourceCategory: 'Overhead Reserve', destinationSiteId: 'site-1', destinationSite: 'Nexus Tech Park', destinationCategory: 'Labour — Carpentry', amount: 500000, reason: 'Transfer to cover carpentry labour shortfall in Nexus joinery package', approvedBy: 'Rajesh Kumar (Project Director)', status: 'approved' },
  { id: 'btr-3', referenceNo: 'BTR-2026-003', date: '2026-07-22', sourceSiteId: 'site-5', sourceSite: 'Oasis Luxury Villa', sourceCategory: 'Surplus — Project Completed', destinationSiteId: 'site-4', destinationSite: 'Synergy Co-Working', destinationCategory: 'Materials — Flooring', amount: 750000, reason: 'Oasis project surplus reallocated to Synergy flooring package', approvedBy: 'Sanjay Mehta (Chairman)', status: 'approved' }
];

// ─── UTILITY BILLS ────────────────────────────────────────────────────────────

export interface UtilityBillRecord {
  id: string;
  billNo: string;
  utilityType: string;
  provider: string;
  siteId: string;
  site: string;
  billDate: string;
  dueDate: string;
  amount: number;
  allocatedAmount: number;
  remainingAmount: number;
  approvalStatus: string;
  allocationStatus: string;
  paymentStatus: string;
  status: string;
}

export const UTILITY_BILLS: UtilityBillRecord[] = [
  { id: 'ub-1', billNo: 'UTIL-2026-001', utilityType: 'Temporary Site Electricity', provider: 'BESCOM Electricity Board', siteId: 'site-1', site: 'Nexus Tech Park', billDate: '2026-07-05', dueDate: '2026-07-20', amount: 100000, allocatedAmount: 0, remainingAmount: 100000, approvalStatus: 'Approved', allocationStatus: 'Unallocated', paymentStatus: 'Unpaid', status: 'approved' },
  { id: 'ub-2', billNo: 'UTIL-2026-002', utilityType: 'Diesel Generator Fuel', provider: 'Reliance Petroleum Ltd', siteId: 'site-2', site: 'Grand Hyatt Goa', billDate: '2026-07-10', dueDate: '2026-07-25', amount: 145000, allocatedAmount: 145000, remainingAmount: 0, approvalStatus: 'Approved', allocationStatus: 'Fully Allocated', paymentStatus: 'Paid', status: 'paid' },
  { id: 'ub-3', billNo: 'UTIL-2026-003', utilityType: 'Internet & Fibre Connection', provider: 'ACT Fibernet Broadband', siteId: 'site-3', site: 'Imperial Heights', billDate: '2026-07-12', dueDate: '2026-07-27', amount: 28000, allocatedAmount: 14000, remainingAmount: 14000, approvalStatus: 'Approved', allocationStatus: 'Partially Allocated', paymentStatus: 'Partially Paid', status: 'approved' },
  { id: 'ub-4', billNo: 'UTIL-2026-004', utilityType: 'Site Security Guard Services', provider: 'Security Solutions India Pvt Ltd', siteId: 'site-1', site: 'Nexus Tech Park', billDate: '2026-07-15', dueDate: '2026-07-30', amount: 65000, allocatedAmount: 0, remainingAmount: 65000, approvalStatus: 'Pending For Approval', allocationStatus: 'Unallocated', paymentStatus: 'Unpaid', status: 'pending_approval' },
  { id: 'ub-5', billNo: 'UTIL-2026-005', utilityType: 'Water Supply Tankers', provider: 'Cauvery Water Supply Services', siteId: 'site-4', site: 'Synergy Co-Working', billDate: '2026-07-18', dueDate: '2026-08-02', amount: 38000, allocatedAmount: 0, remainingAmount: 38000, approvalStatus: 'Draft', allocationStatus: 'Unallocated', paymentStatus: 'Unpaid', status: 'draft' }
];

// ─── SALARY DISBURSEMENTS ────────────────────────────────────────────────────

export interface SalaryDisbursementRecord {
  id: string;
  payrollNo: string;
  payrollPeriod: string;
  department: string;
  employeeCount: string;
  disbursementDate: string;
  totalGross: number;
  totalNet: number;
  allocatedAmount: number;
  remainingAmount: number;
  allocationStatus: string;
  status: string;
}

export const SALARY_DISBURSEMENTS: SalaryDisbursementRecord[] = [
  { id: 'sal-1', payrollNo: 'SAL-2026-06', payrollPeriod: 'June 2026', department: 'All Departments', employeeCount: '28 Staff', disbursementDate: '2026-07-01', totalGross: 4850000, totalNet: 4200000, allocatedAmount: 3800000, remainingAmount: 400000, allocationStatus: 'Partially Allocated', status: 'Disbursed' },
  { id: 'sal-2', payrollNo: 'SAL-2026-07', payrollPeriod: 'July 2026', department: 'All Departments', employeeCount: '30 Staff', disbursementDate: '2026-08-01', totalGross: 5100000, totalNet: 4420000, allocatedAmount: 0, remainingAmount: 4420000, allocationStatus: 'Unallocated', status: 'Approved' }
];

// ─── SALARY ALLOCATIONS ──────────────────────────────────────────────────────

export interface SalaryAllocationRecord {
  id: string;
  salaryDisbursementId: string;
  employeeId: string;
  employeeName: string;
  siteId: string;
  site: string;
  percentage: number;
  amount: number;
  status: string;
}

export const SALARY_ALLOCATIONS: SalaryAllocationRecord[] = [
  { id: 'sa-1', salaryDisbursementId: 'sal-1', employeeId: 'emp-1', employeeName: 'Rajesh Kumar', siteId: 'site-1', site: 'Nexus Tech Park', percentage: 60, amount: 180000, status: 'allocated' },
  { id: 'sa-2', salaryDisbursementId: 'sal-1', employeeId: 'emp-1', employeeName: 'Rajesh Kumar', siteId: 'site-2', site: 'Grand Hyatt Goa', percentage: 40, amount: 120000, status: 'allocated' },
  { id: 'sa-3', salaryDisbursementId: 'sal-1', employeeId: 'emp-2', employeeName: 'Anita Rao', siteId: 'site-1', site: 'Nexus Tech Park', percentage: 50, amount: 140000, status: 'allocated' },
  { id: 'sa-4', salaryDisbursementId: 'sal-1', employeeId: 'emp-2', employeeName: 'Anita Rao', siteId: 'site-2', site: 'Grand Hyatt Goa', percentage: 50, amount: 140000, status: 'allocated' },
  { id: 'sa-5', salaryDisbursementId: 'sal-1', employeeId: 'emp-4', employeeName: 'Priya Sharma', siteId: 'site-1', site: 'Nexus Tech Park', percentage: 100, amount: 110000, status: 'allocated' },
  { id: 'sa-6', salaryDisbursementId: 'sal-1', employeeId: 'emp-7', employeeName: 'Vikramaditya Nair', siteId: 'site-1', site: 'Nexus Tech Park', percentage: 100, amount: 85000, status: 'allocated' },
  { id: 'sa-7', salaryDisbursementId: 'sal-1', employeeId: 'emp-6', employeeName: 'Sneha Kulkarni', siteId: 'site-1', site: 'Nexus Tech Park', percentage: 60, amount: 102000, status: 'allocated' },
  { id: 'sa-8', salaryDisbursementId: 'sal-1', employeeId: 'emp-6', employeeName: 'Sneha Kulkarni', siteId: 'site-3', site: 'Imperial Heights', percentage: 40, amount: 68000, status: 'allocated' },
  { id: 'sa-9', salaryDisbursementId: 'sal-1', employeeId: 'emp-10', employeeName: 'Karan Malhotra', siteId: 'site-3', site: 'Imperial Heights', percentage: 80, amount: 160000, status: 'allocated' },
  { id: 'sa-10', salaryDisbursementId: 'sal-1', employeeId: 'emp-10', employeeName: 'Karan Malhotra', siteId: 'site-4', site: 'Synergy Co-Working', percentage: 20, amount: 40000, status: 'allocated' }
];

// ─── BUDGET REVISIONS (Project Budgets) ──────────────────────────────────────

export interface BudgetRevisionRecord {
  id: string;
  budgetReference: string;
  site: string;
  siteId: string;
  projectId: string;
  estimatedBudget: number;
  approvedBudget: number;
  appBudget: number;
  revisedBudget: number;
  committed: number;
  actualSpend: number;
  available: number;
  utilization: string;
  status: string;
}

export const BUDGET_REVISIONS: BudgetRevisionRecord[] = [
  { id: 'bg-1', budgetReference: 'BUD-2026-001', site: 'Nexus Tech Park Lobby Renovations', siteId: 'site-1', projectId: 'p-1', estimatedBudget: 50000000, approvedBudget: 50000000, appBudget: 50000000, revisedBudget: 52500000, committed: 35000000, actualSpend: 22000000, available: 17500000, utilization: '41.9%', status: 'healthy' },
  { id: 'bg-2', budgetReference: 'BUD-2026-002', site: 'Grand Hyatt Executive Lounge Café', siteId: 'site-2', projectId: 'p-2', estimatedBudget: 12000000, approvedBudget: 12000000, appBudget: 12000000, revisedBudget: 13000000, committed: 10500000, actualSpend: 9800000, available: 2500000, utilization: '75.4%', status: 'near_limit' },
  { id: 'bg-3', budgetReference: 'BUD-2026-003', site: 'Imperial Heights Penthouse Fit-Out', siteId: 'site-3', projectId: 'p-3', estimatedBudget: 65000000, approvedBudget: 65000000, appBudget: 65000000, revisedBudget: 65000000, committed: 46000000, actualSpend: 34000000, available: 19000000, utilization: '52.3%', status: 'healthy' },
  { id: 'bg-4', budgetReference: 'BUD-2026-004', site: 'Synergy Co-Working Workspace', siteId: 'site-4', projectId: 'p-4', estimatedBudget: 45000000, approvedBudget: 45000000, appBudget: 45000000, revisedBudget: 45750000, committed: 18000000, actualSpend: 8000000, available: 27750000, utilization: '17.5%', status: 'healthy' },
  { id: 'bg-5', budgetReference: 'BUD-2026-005', site: 'Oasis Luxury Villa Construction', siteId: 'site-5', projectId: 'p-5', estimatedBudget: 15000000, approvedBudget: 15000000, appBudget: 15000000, revisedBudget: 15000000, committed: 15000000, actualSpend: 15000000, available: 0, utilization: '100.0%', status: 'completed' },
  { id: 'bg-6', budgetReference: 'BUD-2026-006', site: 'HDFC Regional Office Expansion', siteId: 'site-6', projectId: 'p-6', estimatedBudget: 24000000, approvedBudget: 0, appBudget: 0, revisedBudget: 0, committed: 0, actualSpend: 0, available: 0, utilization: '0.0%', status: 'draft' }
];

// ─── VALIDATION FUNCTION (development only) ──────────────────────────────────

export function validateDemoData(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const errors: string[] = [];
  const siteIds = new Set(['site-1', 'site-2', 'site-3', 'site-4', 'site-5', 'site-6']);
  const clientIds = new Set(CLIENTS.map(c => c.id));
  const companyIds = new Set(COMPANIES.map(c => c.id));
  const vendorIds = new Set(VENDORS.map(v => v.id));
  const employeeIds = new Set(EMPLOYEES.map(e => e.id));
  const poIds = new Set(PURCHASE_ORDERS.map(p => p.id));
  const orderIds = new Set(ORDERS.map(o => o.id));
  const invoiceIds = new Set(VENDOR_INVOICES.map(i => i.id));
  const indentIds = new Set(INDENTS.map(i => i.id));

  // Check projects reference valid clients and companies
  PROJECTS.forEach(p => {
    if (!clientIds.has(p.clientId)) errors.push(`Project ${p.projectCode} references unknown clientId: ${p.clientId}`);
    if (!companyIds.has(p.companyId)) errors.push(`Project ${p.projectCode} references unknown companyId: ${p.companyId}`);
    if (!siteIds.has(p.siteId)) errors.push(`Project ${p.projectCode} references unknown siteId: ${p.siteId}`);
    if (!employeeIds.has(p.projectManagerId)) errors.push(`Project ${p.projectCode} references unknown projectManagerId: ${p.projectManagerId}`);
  });

  // Check teams reference valid employees and sites
  PROJECT_TEAMS.forEach(t => {
    if (!employeeIds.has(t.employeeId)) errors.push(`Team ${t.id} references unknown employeeId: ${t.employeeId}`);
    if (!siteIds.has(t.siteId)) errors.push(`Team ${t.id} references unknown siteId: ${t.siteId}`);
  });

  // Check tenders reference valid sites
  TENDERS.forEach(t => {
    if (!siteIds.has(t.siteId)) errors.push(`Tender ${t.tenderNo} references unknown siteId: ${t.siteId}`);
  });

  // Check POs reference valid vendors and sites
  PURCHASE_ORDERS.forEach(po => {
    if (!vendorIds.has(po.selectedVendorId)) errors.push(`PO ${po.poNo} references unknown vendorId: ${po.selectedVendorId}`);
    if (!siteIds.has(po.siteId)) errors.push(`PO ${po.poNo} references unknown siteId: ${po.siteId}`);
    if (!indentIds.has(po.indentId)) errors.push(`PO ${po.poNo} references unknown indentId: ${po.indentId}`);
  });

  // Check GRNs reference valid orders and POs
  GRNS.forEach(grn => {
    if (!orderIds.has(grn.orderId)) errors.push(`GRN ${grn.grnNo} references unknown orderId: ${grn.orderId}`);
    if (!poIds.has(grn.purchaseOrderId)) errors.push(`GRN ${grn.grnNo} references unknown purchaseOrderId: ${grn.purchaseOrderId}`);
  });

  // Check projects reference valid site, client, manager
  PROJECTS.forEach(proj => {
    if (!siteIds.has(proj.siteId)) errors.push(`Project ${proj.projectCode} references unknown siteId: ${proj.siteId}`);
    if (!clientIds.has(proj.clientId)) errors.push(`Project ${proj.projectCode} references unknown clientId: ${proj.clientId}`);
    if (!employeeIds.has(proj.projectManagerId)) errors.push(`Project ${proj.projectCode} references unknown projectManagerId: ${proj.projectManagerId}`);
  });

  // Check invoices reference valid vendors and sites
  VENDOR_INVOICES.forEach(inv => {
    if (!vendorIds.has(inv.vendorId)) errors.push(`Invoice ${inv.invoiceNo} references unknown vendorId: ${inv.vendorId}`);
    if (!siteIds.has(inv.siteId)) errors.push(`Invoice ${inv.invoiceNo} references unknown siteId: ${inv.siteId}`);
    // Check outstanding consistency
    const computedOutstanding = inv.certifiedAmount - inv.creditNoteAmount + inv.debitNoteAmount - inv.paidAmount;
    if (Math.abs(computedOutstanding - inv.outstandingAmount) > 1) {
      errors.push(`Invoice ${inv.invoiceNo}: outstanding mismatch. Expected ${computedOutstanding}, got ${inv.outstandingAmount}`);
    }
  });

  // Check credit/debit notes reference valid invoices
  CREDIT_NOTES.forEach(cn => {
    if (!invoiceIds.has(cn.linkedInvoiceId)) errors.push(`Credit Note ${cn.cnNumber} references unknown invoiceId: ${cn.linkedInvoiceId}`);
  });
  DEBIT_NOTES.forEach(dn => {
    if (!invoiceIds.has(dn.linkedInvoiceId)) errors.push(`Debit Note ${dn.dnNumber} references unknown invoiceId: ${dn.linkedInvoiceId}`);
  });

  // Check payments reference valid invoices
  PAYMENTS.forEach(pay => {
    if (pay.invoiceId && !invoiceIds.has(pay.invoiceId)) errors.push(`Payment ${pay.paymentRef} references unknown invoiceId: ${pay.invoiceId}`);
    if (!vendorIds.has(pay.vendorId)) errors.push(`Payment ${pay.paymentRef} references unknown vendorId: ${pay.vendorId}`);
  });

  // Check no negative amounts
  (([...VENDOR_INVOICES, ...PAYMENTS, ...CLIENT_BILLS, ...CLIENT_PAYMENTS]) as unknown as Array<Record<string, number | string>>).forEach((rec) => {
    const amt = (rec['amount'] ?? rec['certifiedAmount'] ?? rec['billAmount'] ?? rec['outstandingAmount']) as number | undefined;
    if (typeof amt === 'number' && amt < 0) errors.push(`Negative amount in record ${String(rec['id'])}`);
  });


  if (errors.length > 0) {
    console.group('[ERP Data Validation] Referential Integrity Errors:');
    errors.forEach(e => console.warn('  ⚠', e));
    console.groupEnd();
  } else {
    console.log('[ERP Data Validation] ✅ All referential integrity checks passed.');
  }
}

// ─── AGGREGATED INITIAL COLLECTIONS ─────────────────────────────────────────
// Used by WorkflowContext to initialize state

export const INITIAL_COLLECTIONS = {
  // Master data
  companies: COMPANIES,
  clients: CLIENTS,
  vendors: VENDORS,
  employees: EMPLOYEES,
  items: ITEMS,
  itemCategories: ITEM_CATEGORIES,
  units: UNITS,
  departments: DEPARTMENTS,
  designations: DESIGNATIONS,
  roles: ROLES,
  users: USERS,
  bankAccounts: BANK_ACCOUNTS,

  // Projects & teams
  projects: PROJECTS,
  projectTeams: PROJECT_TEAMS,
  tenders: TENDERS,

  // Procurement chain
  indents: INDENTS,
  rfqs: RFQS,
  quotations: QUOTATIONS,
  rateComparisons: RATE_COMPARISONS,
  purchaseOrders: PURCHASE_ORDERS,
  workOrders: WORK_ORDERS,
  orders: ORDERS,
  grns: GRNS,

  // Finance
  vendorInvoices: VENDOR_INVOICES,
  clientBills: CLIENT_BILLS,
  clientPayments: CLIENT_PAYMENTS,
  paymentRequests: PAYMENT_REQUESTS,
  payments: PAYMENTS,
  accountingInvoices: ACCOUNTING_INVOICES,
  creditNotes: CREDIT_NOTES,
  debitNotes: DEBIT_NOTES,
  onAccountPayments: VENDOR_ON_ACCOUNT_BALANCES,
  onAccountTransfers: ON_ACCOUNT_TRANSACTIONS,
  vendorOnAccountBalances: VENDOR_ON_ACCOUNT_BALANCES,
  siteOnAccountBalances: SITE_ON_ACCOUNT_BALANCES,
  onAccountTransactions: ON_ACCOUNT_TRANSACTIONS,
  budgetTransfers: BUDGET_TRANSFERS,
  budgetRevisions: BUDGET_REVISIONS,
  utilityBills: UTILITY_BILLS,
  utilityAllocations: [] as unknown[],
  salaryDisbursements: SALARY_DISBURSEMENTS,
  salaryAllocations: SALARY_ALLOCATIONS,
};
