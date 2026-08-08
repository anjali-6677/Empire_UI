import { Estimate, CostSummary } from '../domain/types';

export const createEmptyCostSummary = (): CostSummary => ({
  baseBOQCost: 0,
  materialCostSum: 0,
  lineLabourSum: 0,
  lineInstallationSum: 0,
  wastageAmount: 0,
  transportationAmount: 0,
  miscellaneousAmount: 0,
  overheadAmount: 0,
  subtotalBeforeProfit: 0,
  discountAmount: 0,
  profitAmount: 0,
  profitPercentage: 18,
  taxableAmount: 0,
  gstAmount: 0,
  finalQuotationValue: 0,
  internalTotalCost: 0,
});

export const normalizeEstimate = (raw: any): Estimate => {
  if (!raw || typeof raw !== 'object') {
    const defaultCost = createEmptyCostSummary();
    return {
      id: `est-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      enquiryId: '',
      clientId: '',
      clientName: 'Unassigned Client',
      estimateNumber: 'EST-UNASSIGNED',
      quotationNumber: 'QT-UNASSIGNED',
      revisionNumber: 0,
      revisionLabel: 'R0',
      status: 'draft',
      boqSections: [],
      pricingFactors: [],
      isCustomPricing: false,
      costSummary: defaultCost,
      schedule: [],
      paymentTerms: [],
      finalQuotationValue: 0,
      createdBy: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'System',
    };
  }

  const rawCost = raw.costSummary || {};
  const baseBOQ = Number(rawCost.baseBOQCost ?? rawCost.materialCost ?? 0);
  const materialSum = Number(rawCost.materialCostSum ?? rawCost.materialCost ?? baseBOQ);
  const internalCost = Number(rawCost.internalTotalCost ?? (baseBOQ + (rawCost.overheadAmount ?? 0) + (rawCost.wastageAmount ?? 0)));
  const finalVal = Number(rawCost.finalQuotationValue ?? raw.finalQuotationValue ?? raw.totalAmount ?? 0);

  const costSummary: CostSummary = {
    baseBOQCost: baseBOQ,
    materialCostSum: materialSum,
    lineLabourSum: Number(rawCost.lineLabourSum ?? rawCost.labourCost ?? 0),
    lineInstallationSum: Number(rawCost.lineInstallationSum ?? rawCost.installationCost ?? 0),
    wastageAmount: Number(rawCost.wastageAmount ?? 0),
    transportationAmount: Number(rawCost.transportationAmount ?? 0),
    miscellaneousAmount: Number(rawCost.miscellaneousAmount ?? rawCost.otherCost ?? 0),
    overheadAmount: Number(rawCost.overheadAmount ?? 0),
    subtotalBeforeProfit: Number(rawCost.subtotalBeforeProfit ?? internalCost),
    discountAmount: Number(rawCost.discountAmount ?? 0),
    profitAmount: Number(rawCost.profitAmount ?? Math.max(0, finalVal - internalCost)),
    profitPercentage: Number(rawCost.profitPercentage ?? 18),
    taxableAmount: Number(rawCost.taxableAmount ?? finalVal),
    gstAmount: Number(rawCost.gstAmount ?? 0),
    finalQuotationValue: finalVal,
    internalTotalCost: internalCost,
  };

  return {
    id: String(raw.id || `est-${Date.now()}`),
    enquiryId: String(raw.enquiryId || ''),
    clientId: raw.clientId ? String(raw.clientId) : undefined,
    clientName: raw.clientName ? String(raw.clientName) : 'Unassigned Client',
    estimateNumber: raw.estimateNumber ? String(raw.estimateNumber) : undefined,
    quotationNumber: String(raw.quotationNumber || `QT-DRAFT-${raw.id || Date.now()}`),
    revisionNumber: Number(raw.revisionNumber ?? 0),
    revisionLabel: String(raw.revisionLabel || `R${raw.revisionNumber ?? 0}`),
    status: raw.status || 'draft',
    boqSections: Array.isArray(raw.boqSections) ? raw.boqSections : [],
    pricingFactors: Array.isArray(raw.pricingFactors) ? raw.pricingFactors : [],
    isCustomPricing: Boolean(raw.isCustomPricing),
    overrideReason: raw.overrideReason ? String(raw.overrideReason) : undefined,
    costSummary,
    schedule: Array.isArray(raw.schedule) ? raw.schedule : [],
    paymentTerms: Array.isArray(raw.paymentTerms) ? raw.paymentTerms : [],
    commercialNotes: raw.commercialNotes ? String(raw.commercialNotes) : undefined,
    termsAndConditions: raw.termsAndConditions ? String(raw.termsAndConditions) : undefined,
    finalQuotationValue: Number(raw.finalQuotationValue ?? costSummary.finalQuotationValue ?? 0),
    sentDetails: raw.sentDetails || undefined,
    clientDecision: raw.clientDecision || undefined,
    createdBy: String(raw.createdBy || 'System'),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
    updatedBy: String(raw.updatedBy || raw.createdBy || 'System'),
  };
};
