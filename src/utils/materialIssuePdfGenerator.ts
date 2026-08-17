/**
 * Canonical Material Issue Note A4 Document Generator & Print Engine
 * Location: src/utils/materialIssuePdfGenerator.ts
 */

import { MaterialIssue } from '../domain/types';
import { normalizeMaterialIssue, calculateIssueItemTotals } from './materialIssueHelpers';

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Builds printable HTML for A4 Material Issue Note
 */
export function buildMaterialIssueDocumentHtml(issue: MaterialIssue, returns: any[] = [], consumptions: any[] = []): string {
  const norm = normalizeMaterialIssue(issue);
  const calcs = calculateIssueItemTotals(norm, returns, consumptions);

  const docNum = norm.documentNumber || norm.issueNumber || norm.id;
  const issueDate = norm.issueDate || norm.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];
  const projectName = norm.projectName || 'Project Site';
  const sourceLocation = norm.sourceLocationName || norm.sourceWarehouseName || 'Central Store';
  const destinationLocation = norm.destinationAreaName || norm.destinationStoreName || 'Site Store';
  const issuedBy = norm.issuedBy || norm.createdBy || 'Stores Officer';
  const requestedBy = norm.requestedBy || 'Site Engineer';
  const receiverName = norm.receiverName || 'Site Supervisor';
  const status = (norm.status || 'issued').toString().toUpperCase();

  const rowsHtml = calcs.items.map((item, idx) => {
    const sn = String(idx + 1).padStart(2, '0');
    return `
      <tr style="border-bottom: 1px solid #e7e5e4;">
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; color: #57534e; text-align: center;">${sn}</td>
        <td style="padding: 8px 10px; font-size: 11px; font-weight: 600; color: #1c1917;">${item.productName}</td>
        <td style="padding: 8px 10px; font-size: 11px; color: #44403c; text-align: center; text-transform: uppercase;">${item.unitSymbol}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 700; color: #b45309; text-align: right;">${item.issuedQty.toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 600; color: #15803d; text-align: right;">${item.receivedQty.toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 600; color: #c2410c; text-align: right;">${item.consumedQty.toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 600; color: #0e7490; text-align: right;">${item.returnedQty.toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 700; color: #1c1917; text-align: right;">${item.siteBalanceQty.toLocaleString('en-IN')}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; color: #44403c; text-align: right;">₹${item.unitRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 11px; font-weight: 700; color: #1c1917; text-align: right;">₹${item.issuedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Material Issue Note - ${docNum}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; }
    .container { max-width: 800px; margin: 0 auto; padding: 15px; }
    .header-table { width: 100%; border-bottom: 2px solid #d97706; padding-bottom: 12px; margin-bottom: 16px; }
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
          <div class="company-sub">Inventory & Material Issue Control System</div>
        </td>
        <td style="text-align: right;">
          <div class="doc-title">MATERIAL ISSUE NOTE</div>
          <div class="doc-num"># ${docNum}</div>
          <div style="font-size: 10px; color: #78716c; margin-top: 2px;">STATUS: <strong>${status}</strong></div>
        </td>
      </tr>
    </table>

    <table class="info-grid">
      <tr>
        <td class="info-box">
          <div class="info-label">Source Location</div>
          <div class="info-value">${sourceLocation}</div>
          <div class="info-label" style="margin-top: 8px;">Issued By</div>
          <div class="info-value">${issuedBy}</div>
          <div class="info-label" style="margin-top: 8px;">Issue Date</div>
          <div class="info-value">${issueDate}</div>
        </td>
        <td style="width: 4%;"></td>
        <td class="info-box">
          <div class="info-label">Destination Project</div>
          <div class="info-value">${projectName}</div>
          <div class="info-label" style="margin-top: 8px;">Site Storage Area</div>
          <div class="info-value">${destinationLocation}</div>
          <div class="info-label" style="margin-top: 8px;">Receiver / Supervisor</div>
          <div class="info-value">${receiverName} (Req: ${requestedBy})</div>
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 30px; text-align: center;">#</th>
          <th style="text-align: left;">Item Description</th>
          <th style="width: 50px; text-align: center;">UOM</th>
          <th style="width: 60px; text-align: right;">Issued</th>
          <th style="width: 60px; text-align: right;">Received</th>
          <th style="width: 60px; text-align: right;">Consumed</th>
          <th style="width: 60px; text-align: right;">Returned</th>
          <th style="width: 60px; text-align: right;">Site Bal</th>
          <th style="width: 70px; text-align: right;">Rate</th>
          <th style="width: 85px; text-align: right;">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="totals-box">
      <span style="font-size: 11px; font-weight: 700; color: #78350f; text-transform: uppercase; margin-right: 12px;">Total Issue Value:</span>
      <span class="totals-val">₹${calcs.totalIssuedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>

    <table class="signatures">
      <tr>
        <td class="sig-cell">Issued By (Stores Officer)</td>
        <td class="sig-cell">Dispatched By (Transporter)</td>
        <td class="sig-cell">Received By (Site Supervisor)</td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}

/**
 * Trigger direct download of A4 Material Issue Note HTML/PDF
 */
export function downloadMaterialIssuePdf(issue: MaterialIssue, returns: any[] = [], consumptions: any[] = []): void {
  const norm = normalizeMaterialIssue(issue);
  const docNum = norm.documentNumber || norm.issueNumber || norm.id;
  const htmlContent = buildMaterialIssueDocumentHtml(norm, returns, consumptions);

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Material_Issue_${sanitizeFilename(docNum)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger direct print dialog for Material Issue Note
 */
export function printMaterialIssuePdf(issue: MaterialIssue, returns: any[] = [], consumptions: any[] = []): void {
  const norm = normalizeMaterialIssue(issue);
  const htmlContent = buildMaterialIssueDocumentHtml(norm, returns, consumptions);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print Material Issue Note.');
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
