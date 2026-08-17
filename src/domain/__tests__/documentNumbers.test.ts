import {
  generateGateTokenNumber,
  generatePONumber,
  generateGRNNumber,
  resolveTokenNumber,
  resolvePONumber,
  resolveGRNNumber,
  getProductShortCode,
  getCategoryShortCode,
} from '../documentNumbers';

export function runDocumentNumberTests(): { passed: boolean; message: string } {
  try {
    // 1. Short Codes
    if (getProductShortCode({ name: '18mm Plywood' }) !== 'PLY') throw new Error('Product PLY short code failed');
    if (getProductShortCode({ name: 'Veneer Teak' }) !== 'VEN') throw new Error('Product VEN short code failed');
    if (getCategoryShortCode({ name: 'Wooden & Joinery Work' }) !== 'WJM') throw new Error('Category WJM short code failed');
    if (getCategoryShortCode({ name: 'Electrical Work' }) !== 'EL') throw new Error('Category EL short code failed');

    // 2. Gate Token Generator
    const token1 = generateGateTokenNumber([], { name: 'Plywood' }, '2026-08-17');
    if (token1 !== '1-PLY-170826') throw new Error(`Gate Token test 1 failed: got ${token1}`);

    const existingTokens: any[] = [
      { tokenNumber: '1-PLY-170826', entryDate: '2026-08-17' },
      { tokenNumber: '2-VEN-170826', entryDate: '2026-08-17' },
    ];
    const token2 = generateGateTokenNumber(existingTokens, { name: 'Vitrified Tile' }, '2026-08-17');
    if (token2 !== '3-VTL-170826') throw new Error(`Gate Token test 2 failed: got ${token2}`);

    // 3. Purchase Order Generator
    const po1 = generatePONumber([], 'cat-1', 'prod-1', '2026-08-17');
    if (po1 !== 'FBT/WJM/PLY/0826/1') throw new Error(`PO test 1 failed: got ${po1}`);

    const existingPOs: any[] = [
      { poNumber: 'FBT/WJM/PLY/0826/1' },
      { poNumber: 'FBT/WJM/PLY/0826/2' },
    ];
    const po2 = generatePONumber(existingPOs, 'cat-1', 'prod-1', '2026-08-17');
    if (po2 !== 'FBT/WJM/PLY/0826/3') throw new Error(`PO test 2 failed: got ${po2}`);

    // 4. GRN Number Generator
    const grn1 = generateGRNNumber([]);
    if (grn1 !== 'REC/1') throw new Error(`GRN test 1 failed: got ${grn1}`);

    const existingGRNs: any[] = [{ grnNumber: 'REC/1' }, { grnNumber: 'REC/2' }, { grnNumber: 'REC/15' }];
    const grn2 = generateGRNNumber(existingGRNs);
    if (grn2 !== 'REC/16') throw new Error(`GRN test 2 failed: got ${grn2}`);

    // 5. Resolvers
    const tokens: any[] = [{ id: 'tok-1', tokenNumber: '1-PLY-170826' }];
    const pos: any[] = [{ id: 'po-1', poNumber: 'FBT/WJM/PLY/0826/1' }];
    const grns: any[] = [{ id: 'grn-1', grnNumber: 'REC/1' }];

    if (resolveTokenNumber(tokens, 'tok-1') !== '1-PLY-170826') throw new Error('Token resolver by ID failed');
    if (resolvePONumber(pos, 'po-1') !== 'FBT/WJM/PLY/0826/1') throw new Error('PO resolver by ID failed');
    if (resolveGRNNumber(grns, 'grn-1') !== 'REC/1') throw new Error('GRN resolver by ID failed');

    return { passed: true, message: 'All canonical document numbering tests passed successfully!' };
  } catch (err: any) {
    return { passed: false, message: err?.message || 'Document numbering tests failed' };
  }
}
