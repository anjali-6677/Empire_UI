import { generateNextCategoryCode, getProductsForCategory, getVendorsByCategory } from '../domain/selectors';
import { ERPCollections } from '../repositories/erpRepository';

// Assert helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

export function runMasterDataTests() {
  console.log('=== Running Master Data Domain & UI Component Tests ===');

  // 1. Test Category Code Generation (CAT-09 when CAT-01..CAT-08 exist)
  const dummyState: Partial<ERPCollections> = {
    categories: [
      { id: 'c1', code: 'CAT-01', name: 'Civil', isActive: true, createdAt: '' },
      { id: 'c2', code: 'CAT-02', name: 'MEP Services', isActive: true, createdAt: '' },
      { id: 'c3', code: 'CAT-03', name: 'Furniture & Joinery', isActive: true, createdAt: '' },
      { id: 'c4', code: 'CAT-04', name: 'General Materials', isActive: true, createdAt: '' },
      { id: 'c5', code: 'CAT-05', name: 'Subcontracting', isActive: true, createdAt: '' },
      { id: 'c6', code: 'CAT-06', name: 'Hardware', isActive: true, createdAt: '' },
      { id: 'c7', code: 'CAT-07', name: 'Glass & Glazing', isActive: true, createdAt: '' },
      { id: 'c8', code: 'CAT-08', name: 'Finishes', isActive: true, createdAt: '' },
    ] as any,
  };

  const nextCode = generateNextCategoryCode(dummyState as ERPCollections);
  assert(nextCode === 'CAT-09', `Expected next category code to be CAT-09, got ${nextCode}`);
  console.log('✓ Category Code Generation Test Passed (Generated CAT-09)');

  // 2. Test Derived Product Count (No itemCount stored)
  const productState: Partial<ERPCollections> = {
    categories: [{ id: 'cat-plywood', code: 'CAT-01', name: 'Plywood', isActive: true, createdAt: '' }] as any,
    products: [
      { id: 'p1', code: 'PRD-01', name: '18mm Plywood', categoryId: 'cat-plywood', isActive: true } as any,
      { id: 'p2', code: 'PRD-02', name: '12mm Plywood', categoryId: 'cat-plywood', isActive: true } as any,
      { id: 'p3', code: 'PRD-03', name: '6mm Plywood', categoryId: 'cat-plywood', isActive: false } as any,
    ],
  };

  const derivedProducts = getProductsForCategory(productState as ERPCollections, 'cat-plywood');
  const activeProductsCount = derivedProducts.filter((p) => p.isActive !== false).length;
  assert(derivedProducts.length === 3, `Expected 3 total products for category, got ${derivedProducts.length}`);
  assert(activeProductsCount === 2, `Expected 2 active products for category, got ${activeProductsCount}`);
  console.log('✓ Derived Active Products Count Test Passed (2 Active, 1 Inactive, 3 Total)');

  // 3. Test Vendor Category Eligibility Filter
  const vendorState: Partial<ERPCollections> = {
    categories: [{ id: 'cat-mep', code: 'CAT-02', name: 'MEP Services', isActive: true, createdAt: '' }] as any,
    vendors: [
      { id: 'v1', code: 'VND-01', name: 'Electra Corp', approvedCategoryIds: ['cat-mep'], active: true } as any,
      { id: 'v2', code: 'VND-02', name: 'Woodland Inc', approvedCategoryIds: ['cat-plywood'], active: true } as any,
    ],
  };

  const mepVendors = getVendorsByCategory(vendorState as ERPCollections, 'cat-mep');
  assert(mepVendors.length === 1, `Expected 1 vendor for MEP category, got ${mepVendors.length}`);
  assert(mepVendors[0].id === 'v1', `Expected vendor v1 to be eligible for MEP`);
  console.log('✓ Vendor Category Eligibility Test Passed');

  console.log('=== All Master Data Domain & UI Component Tests Passed Successfully! ===\n');
}

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('masterDataValidation.test')) {
  runMasterDataTests();
}
