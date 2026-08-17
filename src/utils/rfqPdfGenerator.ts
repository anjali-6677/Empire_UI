/**
 * Canonical Supplier-Specific RFQ Document Generator & Print Engine
 * Location: src/utils/rfqPdfGenerator.ts
 */

import { RFQ, Vendor, Project } from '../domain/types';

export function formatSpecificationString(specs: any): string {
  if (!specs) return '-';
  if (typeof specs === 'string') return specs.trim() || '-';
  if (typeof specs === 'object') {
    try {
      const entries = Object.entries(specs).filter(([_, v]) => v !== undefined && v !== null && v !== '');
      if (entries.length === 0) return '-';
      return entries.map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').trim()}: ${v}`).join(' | ');
    } catch (e) {
      return '-';
    }
  }
  return String(specs);
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Builds printable HTML for Supplier-Specific A4 Request for Quotation (RFQ)
 */
export function buildRFQDocumentHtml(rfq: RFQ, vendor?: Vendor, project?: Project): string {
  const docNum = rfq.documentNumber || (rfq as any).rfqNumber || rfq.id;
  const issueDate = rfq.issueDate || rfq.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];
  const quoteDueDate = rfq.quoteDueDate || rfq.requiredDate || 'Not Specified';
  const requiredDeliveryDate = rfq.requiredDate || 'As per Schedule';
  const validUntil = (rfq as any).validUntil || '30 Days from Issue';

  // Vendor Details
  const vendorName = vendor?.name || (rfq as any).vendorName || 'Invited Supplier';
  const vendorAddress = vendor?.address || vendor?.city || 'Address on file';
  const vendorEmail = vendor?.email || 'N/A';
  const vendorPhone = vendor?.phone || 'N/A';
  const vendorContact = vendor?.contactPerson || 'Sales Department';
  const vendorGstin = vendor?.gstin || 'N/A';

  // Delivery / Project Details
  const projectName = project?.projectName || rfq.projectName || 'Project Site';
  const deliveryLocation = rfq.deliveryLocation || project?.siteAddress || 'Site Store Office';
  const siteAddress = project?.siteAddress || rfq.deliveryLocation || 'As per Purchase Contract';
  const siteContact = project?.clientContactPerson || project?.projectSupervisorName || 'Site In-Charge';
  const sitePhone = project?.clientPhone || 'N/A';

  const lines = Array.isArray(rfq.lines) && rfq.lines.length > 0
    ? rfq.lines
    : Array.isArray((rfq as any).items) && (rfq as any).items.length > 0
    ? (rfq as any).items
    : [];

  const rowsHtml = lines.map((item: any, idx: number) => {
    const sn = String(idx + 1).padStart(2, '0');
    const category = item.categoryName || item.category || 'General Material';
    const description = item.productName || item.itemDescription || item.description || 'Material Item';
    const make = item.make || item.brand || item.manufacturer || '-';
    const specsFormatted = formatSpecificationString(item.specifications || item.specification || item.specs);
    const uom = item.unitSymbol || item.unit || 'sqft';
    const qty = Number(item.quantity || item.reqQuantity || 0);

    return `
      <tr>
        <td style="text-align: center; font-family: monospace; font-weight: 700; color: #64748B;">${sn}</td>
        <td>${category}</td>
        <td><strong>${description}</strong></td>
        <td style="text-align: center;">${make}</td>
        <td style="font-size: 10px; color: #334155;">${specsFormatted}</td>
        <td style="text-align: center; font-weight: 600;">${uom}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0F172A;">${qty.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  const termsText = rfq.commercialTerms || rfq.specialTerms ||
    `1. Rates must be quoted on F.O.R Site Delivery basis inclusive of packing, forwarding & transit insurance.\n` +
    `2. Indicate clear breakup of applicable GST percentage and lead time for delivery.\n` +
    `3. Quotations must remain valid for a minimum of 30 days from the submission due date.\n` +
    `4. All supplied materials must strictly conform to approved technical samples and ISO/IS specifications.`;

  return `
    <div class="rfq-document-container">
      <!-- 1. Header Banner -->
      <table class="header-table">
        <tr>
          <td style="width: 60%; vertical-align: top;">
            <div style="display: flex; items-center; gap: 12px;">
              <div>
                <div class="company-title">FLUTEBYTE TECHNOLOGIES</div>
                <div class="company-sub">Procurement & Material Operations Division</div>
                <div class="company-details">
                  Flutebyte Technologies Pvt Ltd • Corporate Office: Worli Sea Face, Mumbai 400018<br>
                  Phone: +91 22 6789 0100 • Email: procurement@flutebyte.com • GSTIN: 27AAAAA0000A1Z5
                </div>
              </div>
            </div>
          </td>
          <td style="width: 40%; text-align: right; vertical-align: top;">
            <div class="doc-badge">OFFICIAL RFQ DOCUMENT</div>
            <div class="doc-number">${docNum}</div>
            <div class="doc-date">Issue Date: <strong>${issueDate}</strong></div>
          </td>
        </tr>
      </table>

      <!-- 2. Centered Title -->
      <div class="title-banner">
        REQUEST FOR QUOTATION
      </div>

      <!-- 3. Three-Column Info Boxes -->
      <div class="info-grid-3">
        <div class="info-box">
          <div class="info-box-header">SUPPLIER DETAILS</div>
          <div class="info-box-body">
            <div class="vendor-name">${vendorName}</div>
            <div><strong>Address:</strong> ${vendorAddress}</div>
            <div><strong>Email:</strong> ${vendorEmail}</div>
            <div><strong>Contact Person:</strong> ${vendorContact} (${vendorPhone})</div>
            <div><strong>GSTIN:</strong> ${vendorGstin}</div>
          </div>
        </div>

        <div class="info-box">
          <div class="info-box-header">DELIVERY ADDRESS</div>
          <div class="info-box-body">
            <div class="project-name">${projectName}</div>
            <div><strong>Location:</strong> ${deliveryLocation}</div>
            <div><strong>Site Address:</strong> ${siteAddress}</div>
            <div><strong>Site Contact:</strong> ${siteContact} (${sitePhone})</div>
          </div>
        </div>

        <div class="info-box">
          <div class="info-box-header">RFQ DETAILS</div>
          <div class="info-box-body">
            <div><strong>RFQ No:</strong> <span class="highlight-code">${docNum}</span></div>
            <div><strong>RFQ Date:</strong> ${issueDate}</div>
            <div><strong>Submission Due:</strong> <span class="due-date-text">${quoteDueDate}</span></div>
            <div><strong>Required Delivery:</strong> ${requiredDeliveryDate}</div>
            <div><strong>Rate Validity:</strong> ${validUntil}</div>
          </div>
        </div>
      </div>

      <!-- 4. Line Items Table -->
      <div class="table-section">
        <div class="table-header-title">REQUIRED MATERIAL ITEMS</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">S.N</th>
              <th style="width: 120px;">Category</th>
              <th>Description</th>
              <th style="width: 90px; text-align: center;">Make</th>
              <th>Specification</th>
              <th style="width: 60px; text-align: center;">UOM</th>
              <th style="width: 80px; text-align: right;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length ? rowsHtml : '<tr><td colspan="7" style="text-align:center; padding: 16px;">No material line items selected</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- 5. Commercial Terms & Instructions -->
      <div class="terms-section">
        <div class="terms-header">TERMS & CONDITIONS</div>
        <pre class="terms-content">${termsText}</pre>
      </div>

      <!-- 6. Footer -->
      <div class="document-footer">
        <div>This is a computer-generated Request for Quotation issued by Flutebyte Technologies ERP.</div>
        <div style="font-weight: 700; margin-top: 2px;">Authorized Procurement Officer • Flutebyte Technologies Pvt Ltd</div>
      </div>
    </div>
  `;
}

/**
 * Returns full standalone HTML document with embedded CSS for printing/saving PDF
 */
export function buildStandaloneRFQHtml(rfq: RFQ, vendor?: Vendor, project?: Project): string {
  const docNum = rfq.documentNumber || (rfq as any).rfqNumber || rfq.id;
  const vendorName = vendor?.name ? ` - ${vendor.name}` : '';
  const title = `RFQ_${docNum}${vendorName}`;
  const bodyHtml = buildRFQDocumentHtml(rfq, vendor, project);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #0F172A;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .rfq-document-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2px solid #AB9570;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .company-title {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0F172A;
      text-transform: uppercase;
    }
    .company-sub {
      font-size: 9px;
      font-weight: 700;
      color: #AB9570;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .company-details {
      font-size: 9.5px;
      color: #64748B;
      margin-top: 4px;
      line-height: 1.35;
    }
    .doc-badge {
      display: inline-block;
      padding: 3px 8px;
      background-color: #FEF3C7;
      border: 1px solid #FCD34D;
      color: #78350F;
      font-weight: 800;
      font-size: 9.5px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-number {
      font-family: monospace;
      font-size: 15px;
      font-weight: 900;
      color: #78350F;
      margin-top: 4px;
    }
    .doc-date {
      font-size: 10px;
      color: #64748B;
      margin-top: 2px;
    }
    .title-banner {
      text-align: center;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #0F172A;
      text-transform: uppercase;
      padding: 6px 0;
      margin-bottom: 14px;
      border-bottom: 1px solid #E2E8F0;
    }
    .info-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .info-box {
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      background: #F8FAFC;
      overflow: hidden;
    }
    .info-box-header {
      background: #E2E8F0;
      color: #334155;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 8px;
      border-bottom: 1px solid #CBD5E1;
    }
    .info-box-body {
      padding: 8px;
      font-size: 10px;
      color: #334155;
      line-height: 1.45;
    }
    .vendor-name, .project-name {
      font-weight: 800;
      font-size: 11px;
      color: #0F172A;
      margin-bottom: 2px;
    }
    .highlight-code {
      font-family: monospace;
      font-weight: 800;
      color: #78350F;
    }
    .due-date-text {
      font-weight: 800;
      color: #92400E;
    }
    .table-section {
      margin-bottom: 16px;
    }
    .table-header-title {
      font-size: 10px;
      font-weight: 800;
      color: #334155;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #CBD5E1;
    }
    .items-table th {
      background: #1E293B;
      color: #FFFFFF;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 6px 8px;
      border: 1px solid #334155;
      text-align: left;
    }
    .items-table td {
      padding: 6px 8px;
      border: 1px solid #E2E8F0;
      font-size: 10.5px;
      vertical-align: top;
    }
    .items-table tr:nth-child(even) td {
      background-color: #F8FAFC;
    }
    .terms-section {
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      background: #F8FAFC;
      padding: 10px 12px;
      margin-bottom: 16px;
    }
    .terms-header {
      font-size: 9.5px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .terms-content {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 10px;
      color: #475569;
      margin: 0;
      line-height: 1.5;
    }
    .document-footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
      text-align: center;
      font-size: 9px;
      color: #94A3B8;
    }
    @media print {
      body {
        padding: 0;
        background: none;
      }
      .rfq-document-container {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

/**
 * Triggers clean browser print flow for RFQ document
 */
export function printRFQPdf(rfq: RFQ, vendor?: Vendor, project?: Project): void {
  const fullHtml = buildStandaloneRFQHtml(rfq, vendor, project);
  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(fullHtml);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 250);
  }
}

/**
 * Triggers clean browser download of RFQ document as a HTML/PDF blob
 */
export function downloadRFQPdf(rfq: RFQ, vendor?: Vendor, project?: Project): void {
  const docNum = rfq.documentNumber || (rfq as any).rfqNumber || rfq.id;
  const vendorNameClean = vendor?.name ? sanitizeFilename(vendor.name) : 'All_Vendors';
  const filename = `${docNum}_${vendorNameClean}.html`;
  const fullHtml = buildStandaloneRFQHtml(rfq, vendor, project);

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}
