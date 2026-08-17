/**
 * Canonical Document Numbering Generator & Selectors for Empire Interior ERP
 * Location: src/domain/documentNumbers.ts
 */

import { MaterialEntryToken, PurchaseOrder, GoodsReceivedNote } from './types';

// ==========================================
// 1. MASTER DATA SHORT CODE RESOLVERS
// ==========================================

const CATEGORY_SHORT_CODE_MAP: Record<string, string> = {
  'cat-1': 'WJM',
  'cat-2': 'EL',
  'cat-3': 'CT',
  'cat-4': 'PS',
  'cat-5': 'PP',
  'CAT-WOOD': 'WJM',
  'CAT-ELEC': 'EL',
  'CAT-CIVIL': 'CT',
  'CAT-PLUMB': 'PS',
  'CAT-PAINT': 'PP',
};

const PRODUCT_SHORT_CODE_MAP: Record<string, string> = {
  'prod-1': 'PLY',
  'prod-2': 'VEN',
  'prod-3': 'LED',
  'prod-4': 'VTL',
  'prod-5': 'PNT',
  'PRD-PLY-18': 'PLY',
  'PRD-VEN-04': 'VEN',
  'PRD-LED-12W': 'LED',
  'PRD-TILE-8080': 'VTL',
  'PRD-PNT-PU': 'PNT',
};

/**
 * Resolves canonical Product Short Code from Product master object or identifier/name
 */
export function getProductShortCode(productInput?: any, fallbackProductCode?: string): string {
  if (!productInput) return fallbackProductCode || 'MAT';

  if (typeof productInput === 'object') {
    if (productInput.shortCode) return productInput.shortCode.toUpperCase();
    if (productInput.id && PRODUCT_SHORT_CODE_MAP[productInput.id]) return PRODUCT_SHORT_CODE_MAP[productInput.id];
    if (productInput.code && PRODUCT_SHORT_CODE_MAP[productInput.code]) return PRODUCT_SHORT_CODE_MAP[productInput.code];
    if (productInput.productCode && PRODUCT_SHORT_CODE_MAP[productInput.productCode]) return PRODUCT_SHORT_CODE_MAP[productInput.productCode];
    
    const name = productInput.name || productInput.materialName || productInput.productName || '';
    if (/plywood/i.test(name)) return 'PLY';
    if (/laminate/i.test(name)) return 'LAM';
    if (/veneer/i.test(name)) return 'VEN';
    if (/downlight|led|lighting|light/i.test(name)) return 'LED';
    if (/tile|vitrified|flooring/i.test(name)) return 'VTL';
    if (/paint|polish|pu/i.test(name)) return 'PNT';
    if (/glass/i.test(name)) return 'GLS';
    if (/hardware/i.test(name)) return 'HW';

    if (productInput.code) {
      const match = productInput.code.match(/PRD-([A-Z0-9]+)/i);
      if (match) return match[1].toUpperCase();
    }
  }

  if (typeof productInput === 'string') {
    if (PRODUCT_SHORT_CODE_MAP[productInput]) return PRODUCT_SHORT_CODE_MAP[productInput];
    if (/plywood|ply/i.test(productInput)) return 'PLY';
    if (/laminate|lam/i.test(productInput)) return 'LAM';
    if (/veneer|ven/i.test(productInput)) return 'VEN';
    if (/led|downlight/i.test(productInput)) return 'LED';
    if (/tile|vtl/i.test(productInput)) return 'VTL';
    if (/paint|pnt/i.test(productInput)) return 'PNT';
  }

  return (fallbackProductCode || 'MAT').toUpperCase();
}

/**
 * Resolves canonical Category Short Code from Category master object or identifier/name
 */
export function getCategoryShortCode(categoryInput?: any, fallbackCategoryCode?: string): string {
  if (!categoryInput) return fallbackCategoryCode || 'GEN';

  if (typeof categoryInput === 'object') {
    if (categoryInput.shortCode) return categoryInput.shortCode.toUpperCase();
    if (categoryInput.id && CATEGORY_SHORT_CODE_MAP[categoryInput.id]) return CATEGORY_SHORT_CODE_MAP[categoryInput.id];
    if (categoryInput.code && CATEGORY_SHORT_CODE_MAP[categoryInput.code]) return CATEGORY_SHORT_CODE_MAP[categoryInput.code];

    const name = categoryInput.name || categoryInput.categoryName || categoryInput.category || '';
    if (/wooden|joinery|millwork/i.test(name)) return 'WJM';
    if (/electrical|lighting/i.test(name)) return 'EL';
    if (/civil|tiling|flooring/i.test(name)) return 'CT';
    if (/plumbing|sanitary/i.test(name)) return 'PS';
    if (/painting|polishing/i.test(name)) return 'PP';
    if (/hardware/i.test(name)) return 'HW';
    if (/glass/i.test(name)) return 'GLS';
  }

  if (typeof categoryInput === 'string') {
    if (CATEGORY_SHORT_CODE_MAP[categoryInput]) return CATEGORY_SHORT_CODE_MAP[categoryInput];
    if (/wooden|joinery|wjm/i.test(categoryInput)) return 'WJM';
    if (/electrical|lighting|el/i.test(categoryInput)) return 'EL';
    if (/civil|tiling|ct/i.test(categoryInput)) return 'CT';
    if (/plumbing|sanitary|ps/i.test(categoryInput)) return 'PS';
    if (/painting|polishing|pp/i.test(categoryInput)) return 'PP';
  }

  return (fallbackCategoryCode || 'GEN').toUpperCase();
}

// ==========================================
// 2. BUSINESS DATE HELPER
// ==========================================

/**
 * Formats a Date object or ISO date string into DDMMYY using local business time
 */
export function formatBusinessDateDDMMYY(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}${month}${year}`;
}

/**
 * Formats a Date object or ISO date string into MMYY using local business time
 */
export function formatBusinessDateMMYY(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}${year}`;
}

// ==========================================
// 3. CANONICAL DOCUMENT NUMBER GENERATORS
// ==========================================

/**
 * Gate Token Number Generator
 * Format: DAILY_SEQUENCE-PRODUCT_SHORT_CODE-DDMMYY
 * Example: 1-PLY-170826
 */
export function generateGateTokenNumber(
  existingTokens: MaterialEntryToken[],
  productInput: any,
  dateInput?: string | Date
): string {
  const dateDDMMYY = formatBusinessDateDDMMYY(dateInput);
  const productCode = getProductShortCode(productInput, 'PLY');

  // Filter tokens created on the same business date (DDMMYY)
  const tokensToday = (existingTokens || []).filter((tok) => {
    const tokDateDDMMYY = formatBusinessDateDDMMYY(tok.entryDate || tok.createdAt);
    return tokDateDDMMYY === dateDDMMYY;
  });

  // Calculate day sequence
  let maxSeq = 0;
  tokensToday.forEach((tok) => {
    const tokNum = tok.tokenNumber || (tok as any).documentNumber || '';
    const match = tokNum.match(/^(\d+)-[A-Z0-9]+-\d{6}$/i);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  return `${nextSeq}-${productCode}-${dateDDMMYY}`;
}

/**
 * Purchase Order Number Generator
 * Format: FBT/CATEGORY_SHORT_CODE/PRODUCT_SHORT_CODE/MMYY/SEQUENCE
 * Example: FBT/WJM/PLY/0826/1
 */
export function generatePONumber(
  existingPOs: PurchaseOrder[],
  categoryInput: any,
  productInput: any,
  orderDateInput?: string | Date
): string {
  const mmyy = formatBusinessDateMMYY(orderDateInput);
  const catCode = getCategoryShortCode(categoryInput, 'WJM');
  const prodCode = getProductShortCode(productInput, 'PLY');

  const prefix = `FBT/${catCode}/${prodCode}/${mmyy}/`;

  // Find highest integer sequence for matching prefix
  let maxSeq = 0;
  (existingPOs || []).forEach((po) => {
    const poNum = po.poNumber || po.documentNumber || '';
    if (poNum.startsWith(prefix)) {
      const seqStr = poNum.replace(prefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  return `${prefix}${nextSeq}`;
}

/**
 * Goods Receipt Note (GRN) Number Generator
 * Format: REC/SEQUENCE
 * Example: REC/1, REC/2, REC/100
 */
export function generateGRNNumber(existingGRNs: GoodsReceivedNote[]): string {
  let maxSeq = 0;
  (existingGRNs || []).forEach((grn) => {
    const grnNum = grn.grnNumber || grn.documentNumber || '';
    const match = grnNum.match(/^REC\/(\d+)$/i);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    } else {
      // Legacy fallback check e.g. REC-2026-001 or GRN-2026-001
      const legacyMatch = grnNum.match(/(\d+)$/);
      if (legacyMatch) {
        const seq = parseInt(legacyMatch[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  return `REC/${nextSeq}`;
}

// ==========================================
// 4. ENTITY SELECTORS & RESOLVERS
// ==========================================

export function getTokenById(tokens: MaterialEntryToken[], tokenId?: string): MaterialEntryToken | undefined {
  if (!tokenId) return undefined;
  return (tokens || []).find((t) => t.id === tokenId);
}

export function getPurchaseOrderById(pos: PurchaseOrder[], poId?: string): PurchaseOrder | undefined {
  if (!poId) return undefined;
  return (pos || []).find((p) => p.id === poId);
}

export function getGRNById(grns: GoodsReceivedNote[], grnId?: string): GoodsReceivedNote | undefined {
  if (!grnId) return undefined;
  return (grns || []).find((g) => g.id === grnId);
}

/**
 * Resolves canonical Token Number given a token ID or object
 */
export function resolveTokenNumber(tokens: MaterialEntryToken[], tokenIdOrToken: any, fallback: string = 'N/A'): string {
  if (!tokenIdOrToken) return fallback;
  if (typeof tokenIdOrToken === 'object') {
    return tokenIdOrToken.tokenNumber || (tokenIdOrToken as any).documentNumber || fallback;
  }
  const found = getTokenById(tokens, tokenIdOrToken);
  return found?.tokenNumber || (found as any)?.documentNumber || tokenIdOrToken || fallback;
}

/**
 * Resolves canonical PO Number given a PO ID or object
 */
export function resolvePONumber(pos: PurchaseOrder[], poIdOrPO: any, fallback: string = 'N/A'): string {
  if (!poIdOrPO) return fallback;
  if (typeof poIdOrPO === 'object') {
    return poIdOrPO.poNumber || poIdOrPO.documentNumber || fallback;
  }
  const found = getPurchaseOrderById(pos, poIdOrPO);
  return found?.poNumber || found?.documentNumber || poIdOrPO || fallback;
}

/**
 * Resolves canonical GRN Number given a GRN ID or object
 */
export function resolveGRNNumber(grns: GoodsReceivedNote[], grnIdOrGRN: any, fallback: string = 'N/A'): string {
  if (!grnIdOrGRN) return fallback;
  if (typeof grnIdOrGRN === 'object') {
    return grnIdOrGRN.grnNumber || grnIdOrGRN.documentNumber || fallback;
  }
  const found = getGRNById(grns, grnIdOrGRN);
  return found?.grnNumber || found?.documentNumber || grnIdOrGRN || fallback;
}
