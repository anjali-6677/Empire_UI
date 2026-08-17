/**
 * Subcontract Work Order Document HTML, Download & Print Utility
 * Location: src/utils/subcontractWorkOrderPdfGenerator.ts
 */

import { SubcontractWorkOrder, SubcontractorWIP } from '../domain/types';
import { calculateWIPTotalsForWO, normalizeSubcontractWorkOrder } from './subcontractorHelpers';

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Builds printable A4 HTML for Subcontract Work Order
 */
export function buildSubcontractWorkOrderDocumentHtml(
  wo: SubcontractWorkOrder,
  allWips: SubcontractorWIP[] = []
): string {
  const norm = normalizeSubcontractWorkOrder(wo);
  const metrics = calculateWIPTotalsForWO(norm, allWips);

  const docNum = norm.documentNumber;
  const projectName = norm.projectName;
  const subcontractorName = norm.subcontractorName;
  const startDate = norm.startDate || 'Immediate';
  const completionDate = norm.completionDate || 'As per site schedule';
  const status = (norm.status || 'approved').toString().toUpperCase();

  const rowsHtml = metrics.itemCalculations.map((item, idx) => {
    const sn = String(idx + 1).padStart(2, '0');
    return `
      <tr style="border-bottom: 1px solid #e7e5e4;">
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; color: #57534e; text-align: center;">${sn}</td>
        <td style="padding: 8px 10px; font-size: 11px; font-weight: 600; color: #1c1917;">${item.scopeDescription}</td>
        <td style="padding: 8px 10px; font-size: 11px; color: #44403c; text-align: center; text-transform: uppercase;">${item.unitSymbol}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 700; color: #1c1917; text-align: right;">${item.woQty.toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; color: #44403c; text-align: right;">₹${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 600; color: #15803d; text-align: right;">${item.cumulativeApprovedQty.toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 600; color: #b45309; text-align: right;">${item.remainingQty.toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 700; color: #1c1917; text-align: right;">₹${item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Subcontract Work Order - ${docNum}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; }
    .container { max-width: 800px; margin: 0 auto; padding: 15px; }
    .header-table { width: 100%; border-bottom: 2px solid #b45309; padding-bottom: 12px; margin-bottom: 16px; }
    .company-title { font-size: 20px; font-weight: 800; color: #78350f; letter-spacing: -0.5px; margin: 0; }
    .company-sub { font-size: 10px; color: #78716c; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
    .doc-title { font-size: 16px; font-weight: 800; color: #b45309; text-align: right; margin: 0; text-transform: uppercase; }
    .doc-num { font-size: 12px; font-family: monospace; font-weight: 700; color: #44403c; text-align: right; margin-top: 2px; }
    .info-grid { width: 100%; margin-bottom: 16px; border-collapse: collapse; }
    .info-box { width: 48%; vertical-align: top; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 10px 12px; }
    .info-label { font-size: 9px; font-weight: 700; color: #78716c; text-transform: uppercase; margin-bottom: 3px; }
    .info-value { font-size: 11px; font-weight: 600; color: #1c1917; }
    .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; border: 1px solid #e7e5e4; }
    .items-table th { background: #f5f5f4; color: #44403c; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 8px 10px; border-bottom: 1px solid #d6d3d1; }
    .totals-box { width: 100%; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px 12px; margin-bottom: 24px; text-align: right; }
    .totals-val { font-size: 14px; font-weight: 800; color: #92400e; font-family: monospace; }
    .signatures { width: 100%; margin-top: 30px; border-collapse: collapse; }
    .sig-cell { width: 33%; text-align: center; vertical-align: bottom; height: 60px; font-size: 10px; color: #57534e; border-top: 1px dashed #a8a29e; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <table class="header-table">
      <tr>
        <td>
          <div class="company-title">FLUTEBYTE TECHNOLOGIES ERP</div>
          <div class="company-sub">Subcontractor Work Order & WIP Control System</div>
        </td>
        <td style="text-align: right;">
          <div class="doc-title">SUBCONTRACT WORK ORDER</div>
          <div class="doc-num"># ${docNum}</div>
          <div style="font-size: 10px; color: #78716c; margin-top: 2px;">STATUS: <strong>${status}</strong></div>
        </td>
      </tr>
    </table>

    <table class="info-grid">
      <tr>
        <td class="info-box">
          <div class="info-label">Subcontractor Name</div>
          <div class="info-value">${subcontractorName}</div>
          <div class="info-label" style="margin-top: 8px;">Work Category</div>
          <div class="info-value">${norm.workCategory || 'General Subcontract Works'}</div>
          <div class="info-label" style="margin-top: 8px;">Start Date</div>
          <div class="info-value">${startDate}</div>
        </td>
        <td style="width: 4%;"></td>
        <td class="info-box">
          <div class="info-label">Project Site</div>
          <div class="info-value">${projectName}</div>
          <div class="info-label" style="margin-top: 8px;">Target Completion Date</div>
          <div class="info-value">${completionDate}</div>
          <div class="info-label" style="margin-top: 8px;">Retention & Advance Terms</div>
          <div class="info-value">Retention: ${norm.retentionPercentage || 5}% | Advance: ${norm.advancePercentage || 0}%</div>
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 30px; text-align: center;">#</th>
          <th style="text-align: left;">Scope Description</th>
          <th style="width: 50px; text-align: center;">UOM</th>
          <th style="width: 70px; text-align: right;">WO Qty</th>
          <th style="width: 80px; text-align: right;">Rate (₹)</th>
          <th style="width: 75px; text-align: right;">App. WIP Qty</th>
          <th style="width: 75px; text-align: right;">Remaining</th>
          <th style="width: 95px; text-align: right;">Total Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="totals-box">
      <span style="font-size: 11px; font-weight: 700; color: #78350f; text-transform: uppercase; margin-right: 12px;">Total Work Order Value:</span>
      <span class="totals-val">₹${norm.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>

    <table class="signatures">
      <tr>
        <td class="sig-cell">Prepared By (QS Engineer)</td>
        <td class="sig-cell">Accepted By (Subcontractor)</td>
        <td class="sig-cell">Approved By (Project Director)</td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}

/**
 * Trigger direct download of Subcontract Work Order HTML
 */
export function downloadSubcontractWorkOrderPdf(wo: SubcontractWorkOrder, allWips: SubcontractorWIP[] = []): void {
  const norm = normalizeSubcontractWorkOrder(wo);
  const docNum = norm.documentNumber;
  const htmlContent = buildSubcontractWorkOrderDocumentHtml(norm, allWips);

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Work_Order_${sanitizeFilename(docNum)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger direct print dialog for Subcontract Work Order
 */
export function printSubcontractWorkOrderPdf(wo: SubcontractWorkOrder, allWips: SubcontractorWIP[] = []): void {
  const norm = normalizeSubcontractWorkOrder(wo);
  const htmlContent = buildSubcontractWorkOrderDocumentHtml(norm, allWips);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print Subcontract Work Order.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
