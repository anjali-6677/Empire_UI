/**
 * Material Issue Canonical Normalization Helper
 * Location: src/utils/materialIssueHelpers.ts
 */

import { MaterialIssue, MaterialIssueLine, MaterialIssueItem } from '../domain/types';

export const normalizeMaterialIssue = (record: any): MaterialIssue => {
  if (!record || typeof record !== 'object') {
    const fallbackId = `mi-fallback-${Date.now()}`;
    return {
      id: fallbackId,
      issueNumber: fallbackId,
      documentNumber: fallbackId,
      projectId: '',
      projectName: 'Unknown Project',
      sourceLocationName: 'Central Store',
      destinationAreaName: 'Site Store',
      issueDate: new Date().toISOString().split('T')[0],
      issuedBy: 'System',
      status: 'issued',
      lines: [],
      items: [],
      totalIssueValue: 0,
      activityLog: [],
      createdAt: new Date().toISOString(),
      createdBy: 'System',
    };
  }

  const id = record.id || `mi-${Date.now()}`;
  const docNum = record.documentNumber || record.issueNumber || id;
  const issueNum = record.issueNumber || record.documentNumber || id;

  // Raw collections
  const rawLines: any[] = Array.isArray(record.lines) ? record.lines : [];
  const rawItems: any[] = Array.isArray(record.items) ? record.items : [];

  // Reconcile lines & items so both exist
  let canonicalLines: MaterialIssueLine[] = [...rawLines];
  let canonicalItems: MaterialIssueItem[] = [...rawItems];

  if (canonicalLines.length === 0 && canonicalItems.length > 0) {
    canonicalLines = canonicalItems.map((it: any, idx: number) => ({
      id: it.id || `line-${id}-${idx}`,
      productId: it.productId || '',
      productCode: it.productCode || it.productId || 'PROD',
      productName: it.productDescription || it.productName || 'Material Item',
      unitSymbol: it.unit || 'sqft',
      requestedQty: Number(it.issueQty || 0),
      issuedQty: Number(it.issueQty || 0),
      unitRate: Number(it.unitRate || 0),
      remarks: it.remarks || '',
    }));
  } else if (canonicalItems.length === 0 && canonicalLines.length > 0) {
    canonicalItems = canonicalLines.map((l: any, idx: number) => ({
      id: l.id || `item-${id}-${idx}`,
      productId: l.productId || '',
      productDescription: l.productName || l.productDescription || 'Material Item',
      categoryName: l.categoryName || 'General Material',
      unit: l.unitSymbol || 'sqft',
      availableStock: Number(l.availableStockQty || 0),
      issueQty: Number(l.issuedQty || l.requestedQty || 0),
      receivedQty: Number(l.receivedQty || 0),
      unitRate: Number(l.unitRate || 0),
      issueValue: Number(l.issuedQty || l.requestedQty || 0) * Number(l.unitRate || 0),
      remarks: l.remarks || '',
    }));
  }

  // Calculate total value
  const computedValue = canonicalItems.reduce((sum, item) => sum + (item.issueValue || 0), 0);
  const totalIssueValue = Number(record.totalIssueValue ?? computedValue);

  return {
    ...record,
    id,
    documentNumber: docNum,
    issueNumber: issueNum,
    projectId: record.projectId || '',
    projectName: record.projectName || 'Project Site',
    sourceLocationId: record.sourceLocationId || record.sourceWarehouseId || 'wh-main',
    sourceLocationName: record.sourceLocationName || record.sourceWarehouseName || 'Central Store',
    destinationLocationId: record.destinationLocationId || record.destinationStoreId || 'wh-site-store',
    destinationAreaName: record.destinationAreaName || record.destinationStoreName || 'Site Store',
    issueDate: record.issueDate || record.requiredByDate || new Date().toISOString().split('T')[0],
    issuedBy: record.issuedBy || record.requestedBy || 'Stores Officer',
    status: record.status || 'issued',
    lines: canonicalLines,
    items: canonicalItems,
    totalIssueValue,
    activityLog: Array.isArray(record.activityLog) ? record.activityLog : [],
    createdAt: record.createdAt || new Date().toISOString(),
    createdBy: record.createdBy || record.issuedBy || 'Stores Officer',
  };
};

/**
 * Interface for detailed per-item calculation breakdown of a Material Issue
 */
export interface IssueItemCalculation {
  productId: string;
  productName: string;
  unitSymbol: string;
  unitRate: number;
  issuedQty: number;
  receivedQty: number;
  consumedQty: number;
  returnedQty: number;
  siteBalanceQty: number;
  issuedValue: number;
  consumedValue: number;
  returnedValue: number;
  siteBalanceValue: number;
}

/**
 * Calculates item-by-item Issued, Received, Consumed, Returned, and Site Balance
 * quantities and values for a given Material Issue record against returns and consumptions.
 */
export const calculateIssueItemTotals = (
  issue: MaterialIssue,
  returns: any[] = [],
  consumptions: any[] = []
): {
  items: IssueItemCalculation[];
  totalIssuedQty: number;
  totalReceivedQty: number;
  totalConsumedQty: number;
  totalReturnedQty: number;
  totalSiteBalanceQty: number;
  totalIssuedValue: number;
  totalConsumedValue: number;
  totalReturnedValue: number;
  totalSiteBalanceValue: number;
  isMultiUOM: boolean;
  primaryUnit: string;
} => {
  const normIssue = normalizeMaterialIssue(issue);
  const rawItems = normIssue.items || normIssue.lines || [];

  // Match returns & consumptions linked to this issue ID or document number
  const issueId = normIssue.id;
  const docNum = normIssue.documentNumber || normIssue.issueNumber;

  const linkedReturns = returns.filter(
    (r) => r && (r.originalIssueId === issueId || r.originalIssueNumber === docNum || r.issueId === issueId)
  );

  const linkedConsumptions = consumptions.filter(
    (c) => c && (c.originalIssueId === issueId || c.issueId === issueId || c.documentNumber === docNum)
  );

  const units = new Set<string>();

  const itemCalcs: IssueItemCalculation[] = rawItems.map((item: any) => {
    const pId = item.productId || item.productCode || '';
    const pName = item.productDescription || item.productName || 'Material Item';
    const unit = item.unit || item.unitSymbol || 'sqft';
    const rate = Number(item.unitRate || 0);

    units.add(unit);

    const issuedQty = Number(item.issueQty ?? item.issuedQty ?? item.requestedQty ?? 0);

    // Evaluate received qty based on status
    let receivedQty = Number(item.receivedQty || 0);
    const statusLower = (normIssue.status || '').toString().toLowerCase();
    if (statusLower === 'received_at_site' || statusLower === 'completed' || statusLower === 'partially_consumed' || statusLower === 'consumed' || statusLower === 'closed') {
      receivedQty = Math.max(receivedQty, issuedQty);
    } else if (statusLower === 'dispatched' || statusLower === 'draft') {
      receivedQty = Number(item.receivedQty || 0);
    } else if (receivedQty === 0 && (normIssue as any).receivedAt) {
      receivedQty = issuedQty;
    }

    // Sum returned qty for this product
    let returnedQty = 0;
    linkedReturns.forEach((ret) => {
      const lines = ret.lines || ret.items || [];
      lines.forEach((l: any) => {
        if (l.productId === pId || l.productCode === pId || l.productName === pName) {
          returnedQty += Number(l.returnedQty ?? l.returnQty ?? 0);
        }
      });
    });

    // Sum consumed qty for this product
    let consumedQty = 0;
    linkedConsumptions.forEach((con) => {
      const lines = con.lines || con.items || [];
      lines.forEach((l: any) => {
        if (l.productId === pId || l.productCode === pId || l.productName === pName) {
          consumedQty += Number(l.consumedQty ?? l.accountedQty ?? 0);
        }
      });
    });

    const siteBalanceQty = Math.max(0, receivedQty - consumedQty - returnedQty);

    return {
      productId: pId,
      productName: pName,
      unitSymbol: unit,
      unitRate: rate,
      issuedQty,
      receivedQty,
      consumedQty,
      returnedQty,
      siteBalanceQty,
      issuedValue: issuedQty * rate,
      consumedValue: consumedQty * rate,
      returnedValue: returnedQty * rate,
      siteBalanceValue: siteBalanceQty * rate,
    };
  });

  const totalIssuedQty = itemCalcs.reduce((acc, i) => acc + i.issuedQty, 0);
  const totalReceivedQty = itemCalcs.reduce((acc, i) => acc + i.receivedQty, 0);
  const totalConsumedQty = itemCalcs.reduce((acc, i) => acc + i.consumedQty, 0);
  const totalReturnedQty = itemCalcs.reduce((acc, i) => acc + i.returnedQty, 0);
  const totalSiteBalanceQty = itemCalcs.reduce((acc, i) => acc + i.siteBalanceQty, 0);

  const totalIssuedValue = itemCalcs.reduce((acc, i) => acc + i.issuedValue, 0) || normIssue.totalIssueValue || 0;
  const totalConsumedValue = itemCalcs.reduce((acc, i) => acc + i.consumedValue, 0);
  const totalReturnedValue = itemCalcs.reduce((acc, i) => acc + i.returnedValue, 0);
  const totalSiteBalanceValue = itemCalcs.reduce((acc, i) => acc + i.siteBalanceValue, 0);

  const isMultiUOM = units.size > 1;
  const primaryUnit = itemCalcs[0]?.unitSymbol || 'units';

  return {
    items: itemCalcs,
    totalIssuedQty,
    totalReceivedQty,
    totalConsumedQty,
    totalReturnedQty,
    totalSiteBalanceQty,
    totalIssuedValue,
    totalConsumedValue,
    totalReturnedValue,
    totalSiteBalanceValue,
    isMultiUOM,
    primaryUnit,
  };
};

/**
 * Returns clean material summary text for table display
 */
export const getMaterialSummaryText = (issue: MaterialIssue): { title: string; subtitle: string; count: number } => {
  const items = issue.items || issue.lines || [];
  if (items.length === 0) {
    return { title: 'No Materials', subtitle: '0 Items', count: 0 };
  }

  const firstItem = items[0];
  const firstTitle = firstItem.productDescription || firstItem.productName || 'Material Item';
  const firstQty = firstItem.issueQty ?? firstItem.issuedQty ?? firstItem.requestedQty ?? 0;
  const firstUnit = firstItem.unit || firstItem.unitSymbol || '';

  if (items.length === 1) {
    return {
      title: firstTitle,
      subtitle: `${firstQty} ${firstUnit}`.trim(),
      count: 1,
    };
  }

  return {
    title: firstTitle,
    subtitle: `+ ${items.length - 1} more item(s)`,
    count: items.length,
  };
};

/**
 * Calculates global KPI totals across filtered Material Issues
 */
export const calculateMaterialMovementKPIs = (
  issues: MaterialIssue[],
  returns: any[] = [],
  consumptions: any[] = []
): {
  totalIssues: number;
  inTransit: number;
  receivedAtSite: number;
  totalIssuedValue: number;
  totalReturnedValue: number;
  totalConsumedValue: number;
} => {
  let totalIssues = 0;
  let inTransit = 0;
  let receivedAtSite = 0;
  let totalIssuedValue = 0;
  let totalReturnedValue = 0;
  let totalConsumedValue = 0;

  issues.forEach((issue) => {
    if (!issue || typeof issue !== 'object') return;
    const norm = normalizeMaterialIssue(issue);
    if (norm.status === 'Cancelled' || norm.status === 'cancelled') return;

    totalIssues += 1;

    const statusLower = (norm.status || '').toString().toLowerCase();
    if (statusLower === 'dispatched' || statusLower === 'in_transit') {
      inTransit += 1;
    } else if (
      statusLower === 'received_at_site' ||
      statusLower === 'completed' ||
      statusLower === 'partially_consumed' ||
      statusLower === 'consumed' ||
      statusLower === 'closed'
    ) {
      receivedAtSite += 1;
    }

    const calcs = calculateIssueItemTotals(norm, returns, consumptions);
    totalIssuedValue += calcs.totalIssuedValue;
    totalReturnedValue += calcs.totalReturnedValue;
    totalConsumedValue += calcs.totalConsumedValue;
  });

  return {
    totalIssues,
    inTransit,
    receivedAtSite,
    totalIssuedValue,
    totalReturnedValue,
    totalConsumedValue,
  };
};

