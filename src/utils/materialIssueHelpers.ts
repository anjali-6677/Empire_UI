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
