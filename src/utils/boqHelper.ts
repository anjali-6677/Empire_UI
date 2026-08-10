import { Project } from '../domain/types';
import { ERPCollections } from '../repositories/erpRepository';

export interface NormalizedBOQLine {
  id: string;
  lineNo: number;
  itemCode?: string;
  itemDescription: string;
  categoryId: string;
  categoryName: string;
  unitSymbol: string;
  boqQuantity: number;
  boqRate: number;
  boqAmount: number;
  availableQuantity: number;
  subcontractedQuantity: number;
  specifications?: string;
}

/**
 * Extracts a normalized, flat list of Project BOQ lines across all potential project BOQ structures.
 */
export function getProjectLockedBOQLines(project?: Project | any): NormalizedBOQLine[] {
  if (!project) return [];

  const rawLines: any[] = [];

  // 1. Direct lockedProjectBOQ lines
  if (project.lockedProjectBOQ?.lines && Array.isArray(project.lockedProjectBOQ.lines)) {
    rawLines.push(...project.lockedProjectBOQ.lines);
  }
  // 2. Direct lockedProjectBOQ sections items
  else if (project.lockedProjectBOQ?.sections && Array.isArray(project.lockedProjectBOQ.sections)) {
    project.lockedProjectBOQ.sections.forEach((sec: any) => {
      const items = sec.items || sec.lines || [];
      items.forEach((item: any) => {
        rawLines.push({
          ...item,
          categoryId: item.categoryId || sec.id || sec.name,
          categoryName: item.categoryName || sec.name || 'General Trade',
        });
      });
    });
  }
  // 3. boqLockSetup draft structure
  else if (project.boqLockSetup?.lockedProjectBOQ?.lines) {
    rawLines.push(...project.boqLockSetup.lockedProjectBOQ.lines);
  }
  // 4. acceptedBOQSnapshot
  else if (project.acceptedBOQSnapshot && Array.isArray(project.acceptedBOQSnapshot)) {
    project.acceptedBOQSnapshot.forEach((sec: any) => {
      if (sec.items && Array.isArray(sec.items)) {
        sec.items.forEach((item: any) => {
          rawLines.push({
            ...item,
            categoryId: item.categoryId || sec.id || sec.name,
            categoryName: item.categoryName || sec.name || 'General Trade',
          });
        });
      } else {
        rawLines.push(sec);
      }
    });
  }
  // 5. Fallback boq property
  else if (project.boq?.lines && Array.isArray(project.boq.lines)) {
    rawLines.push(...project.boq.lines);
  }

  return rawLines.map((item, idx) => {
    const boqQty = Number(item.boqQuantity ?? item.quantity ?? 0);
    const boqRate = Number(item.boqRate ?? item.unitRate ?? item.baseRate ?? item.rate ?? 0);
    const boqAmount = Number(item.boqAmount ?? item.totalCost ?? item.amount ?? boqQty * boqRate);

    return {
      id: String(item.id || `boq-line-${idx + 1}`),
      lineNo: Number(item.lineNo || idx + 1),
      itemCode: item.itemCode || item.code || `BOQ-${String(idx + 1).padStart(3, '0')}`,
      itemDescription: item.itemDescription || item.description || item.productName || item.name || 'BOQ Trade Item',
      categoryId: String(item.categoryId || item.categoryName || 'cat-general'),
      categoryName: String(item.categoryName || item.category || 'General Trade'),
      unitSymbol: String(item.unitSymbol || item.unit || 'sqft'),
      boqQuantity: boqQty,
      boqRate,
      boqAmount,
      availableQuantity: Number(item.remainingQuantity ?? item.availableQuantity ?? boqQty),
      subcontractedQuantity: Number(item.orderedQuantity ?? item.subcontractedQuantity ?? 0),
      specifications: item.specifications || item.specs,
    };
  });
}

/**
 * Calculates remaining available subcontract quantity for a specific BOQ line in a project.
 */
export function calculateBOQLineSubcontractAvailability(
  state: ERPCollections | any,
  projectId: string,
  boqLineId: string,
  excludeWorkOrderId?: string
): {
  boqQuantity: number;
  alreadySubcontractedQty: number;
  availableQty: number;
} {
  const project = (state.projects || []).find((p: any) => p.id === projectId);
  const boqLines = getProjectLockedBOQLines(project);
  const targetLine = boqLines.find((l) => l.id === boqLineId);

  const boqQuantity = targetLine ? targetLine.boqQuantity : 0;

  // Calculate sum of quantities across existing non-cancelled work orders for this line
  const workOrders = state.subcontractWorkOrders || state.workOrders || [];
  let alreadySubcontractedQty = 0;

  workOrders.forEach((wo: any) => {
    if (wo.projectId === projectId && wo.status !== 'cancelled' && wo.status !== 'rejected') {
      if (excludeWorkOrderId && (wo.id === excludeWorkOrderId || wo.documentNumber === excludeWorkOrderId)) {
        return;
      }
      (wo.items || []).forEach((item: any) => {
        if (item.boqLineId === boqLineId || item.projectBOQLineId === boqLineId) {
          alreadySubcontractedQty += Number(item.quantity || item.woQty || 0);
        }
      });
    }
  });

  const availableQty = Math.max(0, boqQuantity - alreadySubcontractedQty);

  return {
    boqQuantity,
    alreadySubcontractedQty,
    availableQty,
  };
}
