/**
 * Domain Calculation Engine for Empire Interior ERP
 * Location: src/domain/calculations.ts
 */

import { PricingFactor } from './types';

export interface EstimateFactorOverride {
  factorId: string;
  overrideValue: number;
  overrideType: 'percentage' | 'fixed';
}

export interface EstimateMaterial {
  quantity: number;
  basePriceSnapshot: number;
}

export type MatchStatus = 'matched' | 'rate_mismatch' | 'quantity_mismatch' | 'unmatched';

/**
 * Calculates applied factor values for an estimate line given base material total and factors.
 */
export function calculateLineFactors(
  baseMaterialTotal: number,
  categoryFactors: PricingFactor[],
  overrides: EstimateFactorOverride[]
): { appliedFactors: Array<{ name: string; amount: number }>; factorTotal: number } {
  const appliedFactors: Array<{ name: string; amount: number }> = [];
  let factorTotal = 0;

  // Process category factors
  for (const factor of categoryFactors) {
    const override = overrides.find((o) => o.factorId === factor.id);
    const value = override ? override.overrideValue : factor.defaultValue;
    const type = override ? override.overrideType : factor.calculationType;

    let amount = 0;
    if (type === 'fixed') {
      amount = value;
    } else {
      // percentage
      amount = (baseMaterialTotal * value) / 100;
    }

    appliedFactors.push({
      name: factor.name + (override ? ' (Overridden)' : ''),
      amount: Math.round(amount * 100) / 100,
    });
    factorTotal += amount;
  }

  return {
    appliedFactors,
    factorTotal: Math.round(factorTotal * 100) / 100,
  };
}

/**
 * Calculates landed cost, total cost, and selling rate for an estimate line.
 */
export function calculateEstimateLine(
  quantity: number,
  materials: EstimateMaterial[],
  categoryFactors: PricingFactor[],
  overrides: EstimateFactorOverride[],
  marginPercentage: number
) {
  const materialBaseTotal = materials.reduce((sum, m) => sum + m.quantity * m.basePriceSnapshot, 0);

  const { appliedFactors, factorTotal } = calculateLineFactors(materialBaseTotal, categoryFactors, overrides);

  const landedTotalCost = materialBaseTotal + factorTotal;
  const landedCostPerUnit = quantity > 0 ? landedTotalCost / quantity : 0;

  // Selling rate calculation: Landed Cost + Margin
  const marginAmount = (landedTotalCost * marginPercentage) / 100;
  const sellingLineTotal = landedTotalCost + marginAmount;
  const sellingRate = quantity > 0 ? sellingLineTotal / quantity : 0;

  return {
    materialBaseTotal: Math.round(materialBaseTotal * 100) / 100,
    factorTotal: Math.round(factorTotal * 100) / 100,
    appliedFactors,
    landedTotalCost: Math.round(landedTotalCost * 100) / 100,
    landedCostPerUnit: Math.round(landedCostPerUnit * 100) / 100,
    marginPercentage,
    sellingRate: Math.round(sellingRate * 100) / 100,
    sellingLineTotal: Math.round(sellingLineTotal * 100) / 100,
  };
}

/**
 * Validates whether a material indent line exceeds the project BOQ limit.
 */
export function calculateIndentBOQValidation(
  boqQty: number,
  previouslyIndentedQty: number,
  requestedQty: number
): {
  availableBOQQty: number;
  isOverLimit: boolean;
  overLimitQty: number;
  overLimitPercentage: number;
} {
  const availableBOQQty = Math.max(0, boqQty - previouslyIndentedQty);
  const isOverLimit = requestedQty > availableBOQQty;
  const overLimitQty = isOverLimit ? requestedQty - availableBOQQty : 0;
  const overLimitPercentage = boqQty > 0 ? Math.round((overLimitQty / boqQty) * 1000) / 10 : 0;

  return {
    availableBOQQty,
    isOverLimit,
    overLimitQty,
    overLimitPercentage,
  };
}

/**
 * Computes 3-way matching status for a vendor AP invoice line against PO and Accepted GRN.
 */
export function perform3WayMatch(
  poRate: number,
  acceptedGRNQty: number,
  previouslyInvoicedQty: number,
  currentInvoiceQty: number,
  invoiceRate: number
): {
  maxInvoicableQty: number;
  matchStatus: MatchStatus;
  rateVariance: number;
  qtyVariance: number;
} {
  const maxInvoicableQty = Math.max(0, acceptedGRNQty - previouslyInvoicedQty);
  const rateVariance = invoiceRate - poRate;
  const qtyVariance = currentInvoiceQty - maxInvoicableQty;

  let matchStatus: MatchStatus = 'matched';

  if (rateVariance > 0) {
    matchStatus = 'rate_mismatch';
  } else if (currentInvoiceQty > maxInvoicableQty) {
    matchStatus = 'quantity_mismatch';
  }

  return {
    maxInvoicableQty,
    matchStatus,
    rateVariance,
    qtyVariance,
  };
}

/**
 * Calculates subcontractor certified WIP and net bill capping.
 */
export function calculateSubcontractorBill(
  certifiedWIPAmount: number,
  retentionPercentage: number,
  previousBilledAmount: number,
  taxPercentage: number = 18
) {
  const netCertifiedWIP = Math.max(0, certifiedWIPAmount - previousBilledAmount);
  const retentionDeducted = (netCertifiedWIP * retentionPercentage) / 100;
  const taxableAmount = netCertifiedWIP - retentionDeducted;
  const taxAmount = (taxableAmount * taxPercentage) / 100;
  const netBillAmount = taxableAmount + taxAmount;

  return {
    netCertifiedWIP: Math.round(netCertifiedWIP * 100) / 100,
    retentionDeducted: Math.round(retentionDeducted * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    netBillAmount: Math.round(netBillAmount * 100) / 100,
  };
}

/**
 * Calculates Client RA Bill figures.
 */
export function calculateClientRABill(
  grossClaimedAmount: number,
  certifiedRevenueAmount: number,
  previousBilledAmount: number,
  retentionPercentage: number = 5,
  taxPercentage: number = 18
) {
  const currentCertifiedRevenue = Math.max(0, certifiedRevenueAmount - previousBilledAmount);
  const claimedVsCertifiedDiff = grossClaimedAmount - currentCertifiedRevenue;
  const retentionDeduction = (currentCertifiedRevenue * retentionPercentage) / 100;
  const taxableAmount = currentCertifiedRevenue - retentionDeduction;
  const taxAmount = (taxableAmount * taxPercentage) / 100;
  const netBillAmount = taxableAmount + taxAmount;

  return {
    claimedVsCertifiedDiff,
    currentCertifiedRevenue: Math.round(currentCertifiedRevenue * 100) / 100,
    retentionDeduction: Math.round(retentionDeduction * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    netBillAmount: Math.round(netBillAmount * 100) / 100,
  };
}
