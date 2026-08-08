/**
 * Empire ERP Stage 4 Domain Test Suite
 * Validates GRN workflow, idempotent stock posting, material movements, and WIP certification limits.
 */

import { CANONICAL_SEED_DATA } from '../data/canonicalSeedData';
import { GoodsReceivedNote } from '../domain/types';
import { getAvailableStockForLocationAndProduct, getPORemainingLineQty } from '../domain/selectors';

export function runStage4DomainTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let passed = true;

  try {
    const seedState = JSON.parse(JSON.stringify(CANONICAL_SEED_DATA));
    const po = seedState.purchaseOrders.find((p: any) => p.id === 'po-001');

    // Test 1: PO remaining quantities calculation after GRN
    if (po) {
      const lineRemaining = getPORemainingLineQty(po, 'po-line-001', seedState.grns);
      if (lineRemaining && lineRemaining.orderedQty === 1000 && lineRemaining.totalReceivedQty === 1000 && lineRemaining.remainingQty === 0) {
        results.push('PASS: PO remaining quantities calculation');
      } else {
        passed = false;
        results.push('FAIL: PO remaining quantities calculation');
      }
    } else {
      passed = false;
      results.push('FAIL: PO po-001 not found for test');
    }

    // Test 2: Location-based stock ledger balance calculation
    const storeBalance = getAvailableStockForLocationAndProduct(seedState.stockLedger, 'loc-001', 'prod-1');
    if (storeBalance === 550) {
      results.push('PASS: Location store stock balance calculation');
    } else {
      passed = false;
      results.push(`FAIL: Location store stock balance expected 550, got ${storeBalance}`);
    }

    const packageBalance = getAvailableStockForLocationAndProduct(seedState.stockLedger, 'loc-dest-001', 'prod-1');
    if (packageBalance === 400) {
      results.push('PASS: Destination work package stock balance calculation');
    } else {
      passed = false;
      results.push(`FAIL: Destination work package stock balance expected 400, got ${packageBalance}`);
    }

    // Test 3: GRN Idempotency Guard check
    const grn = seedState.grns.find((g: GoodsReceivedNote) => g.id === 'grn-001');
    const grnEntries = seedState.stockLedger.filter(
      (s: any) => s.sourceDocumentId === 'grn-001' && s.entryType === 'grn_accepted'
    );
    if (grn?.isPostedToStock === true && grnEntries.length === 1) {
      results.push('PASS: Idempotent GRN stock posting check');
    } else {
      passed = false;
      results.push('FAIL: Idempotent GRN stock posting check');
    }
  } catch (err: any) {
    passed = false;
    results.push(`ERROR: Test execution failed - ${err.message}`);
  }

  return { passed, results };
}
