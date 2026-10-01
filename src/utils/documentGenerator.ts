/**
 * Unified ERP Document Generator & Print Engine
 * Location: src/utils/documentGenerator.ts
 */

import { formatIndianCurrency } from './format';

export interface DocumentHeaderProps {
  documentType: string;
  documentNumber: string;
  revisionLabel?: string;
  dateStr: string;
  status?: string;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Builds HTML printable string and triggers browser download or iframe print
 */
export function printDocumentHtml(title: string, htmlContent: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #121214;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #AB9570;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .company-title {
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            color: #121214;
          }
          .company-sub {
            font-size: 9px;
            font-weight: 700;
            color: #AB9570;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .doc-badge {
            display: inline-block;
            padding: 4px 8px;
            background-color: #FEF3C7;
            border: 1px solid #FCD34D;
            color: #78350F;
            font-weight: 700;
            font-size: 10px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .doc-number {
            font-family: monospace;
            font-size: 14px;
            font-weight: 900;
            margin-top: 4px;
          }
          .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 16px;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
          }
          .info-cell {
            display: table-cell;
            width: 50%;
            padding: 10px 12px;
            vertical-align: top;
          }
          .info-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748B;
            margin-bottom: 4px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .items-table th {
            background: #121214;
            color: #ffffff;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            padding: 8px 10px;
            text-align: left;
          }
          .items-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #E2E8F0;
            font-size: 11px;
          }
          .items-table tr:nth-child(even) td {
            background-color: #F8FAFC;
          }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; }
          .font-bold { font-weight: 700; }
          .summary-box {
            background: #121214;
            color: #ffffff;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 16px;
          }
          .summary-total {
            font-size: 18px;
            font-family: monospace;
            font-weight: 900;
            color: #AB9570;
          }
          .terms-box {
            border-top: 1px solid #E2E8F0;
            padding-top: 12px;
            font-size: 10px;
            color: #475569;
          }
          .footer {
            margin-top: 24px;
            border-top: 1px solid #E2E8F0;
            padding-top: 8px;
            text-align: center;
            font-size: 9px;
            color: #94A3B8;
          }
          @media print {
            .page-break { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}

/**
 * Generates an actual downloadable document HTML file as a PDF/HTML fallback blob
 */
export function downloadDocumentHtml(filename: string, title: string, htmlContent: string) {
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #121214;
            line-height: 1.4;
            margin: 20px auto;
            max-width: 800px;
            padding: 24px;
            background: #fff;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header-table { width: 100%; border-collapse: collapse; border-bottom: 2px solid #AB9570; padding-bottom: 12px; margin-bottom: 16px; }
          .company-title { font-size: 16px; font-weight: 900; text-transform: uppercase; color: #121214; }
          .company-sub { font-size: 9px; font-weight: 700; color: #AB9570; text-transform: uppercase; letter-spacing: 1px; }
          .doc-badge { display: inline-block; padding: 4px 8px; background-color: #FEF3C7; border: 1px solid #FCD34D; color: #78350F; font-weight: 700; font-size: 10px; border-radius: 4px; text-transform: uppercase; }
          .doc-number { font-family: monospace; font-size: 14px; font-weight: 900; margin-top: 4px; }
          .info-grid { display: table; width: 100%; margin-bottom: 16px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; }
          .info-cell { display: table-cell; width: 50%; padding: 10px 12px; vertical-align: top; }
          .info-title { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 4px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          .items-table th { background: #121214; color: #ffffff; font-weight: 700; font-size: 10px; text-transform: uppercase; padding: 8px 10px; text-align: left; }
          .items-table td { padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 11px; }
          .items-table tr:nth-child(even) td { background-color: #F8FAFC; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; }
          .font-bold { font-weight: 700; }
          .summary-box { background: #121214; color: #ffffff; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
          .summary-total { font-size: 18px; font-family: monospace; font-weight: 900; color: #AB9570; }
          .terms-box { border-top: 1px solid #E2E8F0; padding-top: 12px; font-size: 10px; color: #475569; }
          .footer { margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 8px; text-align: center; font-size: 9px; color: #94A3B8; }
          .print-btn { display: block; margin: 0 auto 20px auto; padding: 8px 16px; background: #AB9570; color: white; font-weight: bold; border: none; border-radius: 4px; cursor: pointer; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print Document / Save as PDF</button>
        ${htmlContent}
      </body>
    </html>
  `;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename.replace('.pdf', '.html') : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}

// =========================================
// 1. RFQ Document Builder
// =========================================
export { buildRFQDocumentHtml, printRFQPdf, downloadRFQPdf } from './rfqPdfGenerator';

// =========================================
// 2. Purchase Order Document Builder
// =========================================
export function buildPODocumentHtml(po: any, vendor?: any): string {
  const documentNumber = po.documentNumber || po.poNumber || po.id;
  const vendorName = po.vendorName || vendor?.companyName || 'Flutebyte Timber & Plywood Traders';
  const vendorAddress = vendor?.officeAddress || 'Mumbai, Maharashtra';
  const vendorGst = vendor?.gstin || '27BBBBA1111B1Z2';
  const lines = Array.isArray(po.lines) ? po.lines : [];
  const poDate = po.poDate || po.createdAt?.split('T')[0] || '2026-08-05';
  const targetDeliveryDate = po.targetDeliveryDate || '2026-08-15';

  const rowsHtml = lines.map((item: any, idx: number) => {
    const rate = item.unitRate || item.basicRate || 0;
    const qty = item.quantity || item.orderedQty || item.approvedQty || 0;
    const subtotal = item.lineSubtotal || rate * qty;
    const tax = item.lineTaxAmount || subtotal * 0.18;
    const total = item.lineTotal || subtotal + tax;

    return `
      <tr>
        <td class="font-mono">${idx + 1}</td>
        <td class="font-bold">${item.materialName || item.productName || item.itemDescription || 'Material Item'}</td>
        <td class="text-right font-mono">${qty} ${item.unit || 'sqft'}</td>
        <td class="text-right font-mono">${formatIndianCurrency(rate)}</td>
        <td class="text-right font-mono">${formatIndianCurrency(subtotal)}</td>
        <td class="text-right font-mono">${formatIndianCurrency(tax)}</td>
        <td class="text-right font-mono font-bold">${formatIndianCurrency(total)}</td>
      </tr>
    `;
  }).join('');

  const itemsSubtotal = po.itemsSubtotal || lines.reduce((acc: number, l: any) => acc + (l.lineSubtotal || 0), 0);
  const taxAmount = po.taxAmount || lines.reduce((acc: number, l: any) => acc + (l.lineTaxAmount || 0), 0);
  const freightAmount = po.freightAmount || 0;
  const totalPoAmount = po.totalPoAmount || (itemsSubtotal + taxAmount + freightAmount);

  return `
    <table class="header-table">
      <tr>
        <td>
          <div class="company-title">FLUTEBYTE TECHNOLOGIES</div>
          <div class="company-sub">OFFICIAL PURCHASE ORDER</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 4px;">
            Flutebyte Technologies Pvt Ltd • Worli Sea Face, Mumbai 400018<br>
            Email: accounts@flutebyte.com • GSTIN: 27AAAAA0000A1Z5
          </div>
        </td>
        <td style="text-align: right; vertical-align: top;">
          <div class="doc-badge" style="background-color: #DCFCE7; border-color: #86EFAC; color: #166534;">PURCHASE ORDER</div>
          <div class="doc-number">${documentNumber}</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 4px;">PO Date: ${poDate}</div>
        </td>
      </tr>
    </table>

    <div class="info-grid">
      <div class="info-cell">
        <div class="info-title">VENDOR / SUPPLIER</div>
        <div style="font-weight: 700; font-size: 12px; color: #121214;">${vendorName}</div>
        <div>${vendorAddress}</div>
        <div><strong>GSTIN:</strong> ${vendorGst}</div>
        <div><strong>Payment Terms:</strong> ${po.paymentTerms || 'Net 30 Days'}</div>
      </div>
      <div class="info-cell" style="border-left: 1px solid #E2E8F0;">
        <div class="info-title">DELIVERY & PROJECT DETAILS</div>
        <div><strong>Project Name:</strong> ${po.projectName || 'Nouveau Penthouse Fitout'}</div>
        <div><strong>Project Code:</strong> ${po.projectCode || po.projectId || 'PRJ-2026-001'}</div>
        <div><strong>Target Delivery:</strong> <span style="font-weight: 700; color: #166534;">${targetDeliveryDate}</span></div>
        <div><strong>Delivery Address:</strong> ${po.deliverySiteInstructions || 'Worli Site, Mumbai'}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Material Description</th>
          <th style="text-align: right;">Qty</th>
          <th style="text-align: right;">Unit Rate</th>
          <th style="text-align: right;">Subtotal</th>
          <th style="text-align: right;">GST</th>
          <th style="text-align: right;">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml.length ? rowsHtml : '<tr><td colspan="7" style="text-align:center;">No line items</td></tr>'}
      </tbody>
    </table>

    <div class="summary-box" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 10px; color: #AB9570; text-transform: uppercase; font-weight: 700;">Subtotal: ${formatIndianCurrency(itemsSubtotal)} | Tax/GST: ${formatIndianCurrency(taxAmount)}</div>
        <div style="font-size: 11px; color: #CBD5E1;">Includes all freight, transit insurance, and applicable taxes</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 9px; color: #94A3B8; text-transform: uppercase;">GRAND TOTAL PO VALUE</div>
        <div class="summary-total">${formatIndianCurrency(totalPoAmount)}</div>
      </div>
    </div>

    <div class="terms-box">
      <div class="font-bold" style="margin-bottom: 4px; color: #121214;">Terms & Conditions:</div>
      <ol style="margin: 0; padding-left: 16px;">
        <li>Delivery must strictly match site instructions. Delivery challan and invoice required upon arrival.</li>
        <li>Inspection will be conducted upon arrival. Rejected items must be replaced within 3 business days.</li>
        <li>Invoice must quote PO Number: <strong>${documentNumber}</strong> for payment processing.</li>
      </ol>
    </div>

    <div class="footer">
      Generated automatically from Flutebyte Technologies Enterprise ERP • Authorised Purchase Contract
    </div>
  `;
}

// =========================================
// 3. Client Proposal Document Builder
// =========================================
export function buildProposalDocumentHtml(estimate: any, enquiry: any, client: any): string {
  const quotationNumber = estimate.quotationNumber || 'FBT-QUOTE-2026-001-R0';
  const revisionLabel = estimate.revisionLabel || 'R0';
  const clientName = client?.companyName || estimate.clientName || enquiry?.clientName || 'Nouveau Luxury Residences';
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const boqSections = Array.isArray(estimate.boqSections) ? estimate.boqSections : [];

  let lineNo = 1;
  const sectionsHtml = boqSections.map((sec: any) => {
    const items = Array.isArray(sec.items) ? sec.items : [];
    const itemRows = items.map((item: any) => `
      <tr>
        <td class="font-mono">${lineNo++}</td>
        <td><strong>${item.productName || item.description}</strong><br><span style="color:#64748B; font-size:10px;">${item.description || ''}</span></td>
        <td class="text-right font-mono">${item.quantity} ${item.unit}</td>
        <td class="text-right font-mono">${formatIndianCurrency(item.baseRate)}</td>
        <td class="text-right font-mono font-bold">${formatIndianCurrency(item.totalCost)}</td>
      </tr>
    `).join('');

    return `
      <tr style="background: #F1F5F9; font-weight: 700;">
        <td colspan="5" style="padding: 6px 10px; color: #0F172A;">${sec.name}</td>
      </tr>
      ${itemRows}
    `;
  }).join('');

  return `
    <table class="header-table">
      <tr>
        <td>
          <div class="company-title">FLUTEBYTE TECHNOLOGIES</div>
          <div class="company-sub">COMMERCIAL FITOUT PROPOSAL</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 4px;">
            Flutebyte Technologies Pvt Ltd • Worli Sea Face, Mumbai 400018<br>
            Email: commercial@flutebyte.com • Web: www.flutebyte.com
          </div>
        </td>
        <td style="text-align: right; vertical-align: top;">
          <div class="doc-badge">COMMERCIAL PROPOSAL</div>
          <div class="doc-number">${quotationNumber}</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 4px;">Revision: <strong>${revisionLabel}</strong> | Date: ${dateStr}</div>
        </td>
      </tr>
    </table>

    <div class="info-grid">
      <div class="info-cell">
        <div class="info-title">PREPARED FOR CLIENT</div>
        <div style="font-weight: 700; font-size: 12px; color: #121214;">${clientName}</div>
        <div><strong>Location:</strong> ${enquiry?.location || 'Mumbai'}</div>
        <div><strong>Project:</strong> ${enquiry?.projectRequirement || 'Penthouse Fitout'}</div>
      </div>
      <div class="info-cell" style="border-left: 1px solid #E2E8F0;">
        <div class="info-title">PROPOSAL SUMMARY</div>
        <div><strong>Enquiry Ref:</strong> ${enquiry?.enquiryNumber || 'ENQ-2026-001'}</div>
        <div><strong>Project Area:</strong> ${enquiry?.approximateArea || 4500} ${enquiry?.areaUnit || 'sqft'}</div>
        <div><strong>Quotation Value:</strong> <span style="font-weight: 900; color: #AB9570;">${formatIndianCurrency(estimate.finalQuotationValue)}</span></div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Scope / Item Description</th>
          <th style="text-align: right;">Qty</th>
          <th style="text-align: right;">Unit Rate</th>
          <th style="text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${sectionsHtml.length ? sectionsHtml : '<tr><td colspan="5" style="text-align:center;">No BOQ sections</td></tr>'}
      </tbody>
    </table>

    <div class="summary-box" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 10px; color: #AB9570; text-transform: uppercase; font-weight: 700;">FINAL PROPOSAL COMMERCIAL TOTAL</div>
        <div style="font-size: 11px; color: #CBD5E1;">Includes all line works, overheads, logistics, and applicable 18% GST</div>
      </div>
      <div style="text-align: right;">
        <div class="summary-total">${formatIndianCurrency(estimate.finalQuotationValue)}</div>
      </div>
    </div>

    <div class="terms-box">
      <div class="font-bold" style="margin-bottom: 4px; color: #121214;">Terms & Conditions:</div>
      <ol style="margin: 0; padding-left: 16px;">
        <li>Quotation validity: 30 days from issuance date.</li>
        <li>Any structural modifications or client scope additions will be billed separately via change order.</li>
        <li>Site access and electricity/water supply to be provided by client.</li>
      </ol>
    </div>

    <div class="footer">
      Generated automatically from Flutebyte Technologies Enterprise ERP • Commercial Client Proposal
    </div>
  `;
}

// =========================================
// 4. BOQ Document Builder
// =========================================
export function buildBOQDocumentHtml(params: {
  documentTitle: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  sourceQuotationNumber: string;
  acceptedRevisionLabel: string;
  lockedBy: string;
  lockedAt: string;
  lines: any[];
  totalBOQValue: number;
}): string {
  const {
    documentTitle,
    projectCode,
    projectName,
    clientName,
    sourceQuotationNumber,
    acceptedRevisionLabel,
    lockedBy,
    lockedAt,
    lines,
    totalBOQValue,
  } = params;

  const rowsHtml = lines.map((item: any, idx: number) => `
    <tr>
      <td class="font-mono">#${item.lineNo || idx + 1}</td>
      <td>${item.categoryName || 'General Fitout'}</td>
      <td class="font-bold">${item.itemDescription || 'BOQ Line Item'}</td>
      <td class="text-right font-mono font-bold">${item.boqQuantity}</td>
      <td class="font-mono">${item.unitSymbol || 'nos'}</td>
      <td class="text-right font-mono">${formatIndianCurrency(item.boqRate)}</td>
      <td class="text-right font-mono font-bold">${formatIndianCurrency(item.boqAmount || item.boqQuantity * item.boqRate)}</td>
    </tr>
  `).join('');

  return `
    <table class="header-table">
      <tr>
        <td>
          <div class="company-title">FLUTEBYTE TECHNOLOGIES</div>
          <div class="company-sub">${documentTitle.toUpperCase()}</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 4px;">
            Flutebyte Technologies Pvt Ltd • Worli Sea Face, Mumbai 400018<br>
            Email: projects@flutebyte.com • Web: www.flutebyte.com
          </div>
        </td>
        <td style="text-align: right; vertical-align: top;">
          <div class="doc-badge" style="background-color: #ECFDF5; border-color: #A7F3D0; color: #065F46;">LOCKED BOQ BASELINE</div>
          <div class="doc-number">${projectCode}</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 4px;">Locked: <strong>${lockedAt.split('T')[0]}</strong></div>
        </td>
      </tr>
    </table>

    <div class="info-grid">
      <div class="info-cell">
        <div class="info-title">PROJECT & CLIENT DETAILS</div>
        <div style="font-weight: 700; font-size: 12px; color: #121214;">${projectName}</div>
        <div><strong>Client:</strong> ${clientName}</div>
        <div><strong>Project Code:</strong> ${projectCode}</div>
      </div>
      <div class="info-cell" style="border-left: 1px solid #E2E8F0;">
        <div class="info-title">COMMERCIAL BOQ PROVENANCE</div>
        <div><strong>CRM Quotation Ref:</strong> ${sourceQuotationNumber}</div>
        <div><strong>Accepted Revision:</strong> ${acceptedRevisionLabel}</div>
        <div><strong>Locked By:</strong> ${lockedBy}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50px;">Line #</th>
          <th>Category</th>
          <th>Item Description</th>
          <th style="text-align: right;">Baseline Qty</th>
          <th>Unit</th>
          <th style="text-align: right;">Baseline Rate</th>
          <th style="text-align: right;">Total Baseline Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml.length ? rowsHtml : '<tr><td colspan="7" style="text-align:center;">No BOQ items found</td></tr>'}
      </tbody>
    </table>

    <div class="summary-box" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 10px; color: #AB9570; text-transform: uppercase; font-weight: 700;">CANONICAL PROJECT BOQ VALUE</div>
        <div style="font-size: 11px; color: #CBD5E1;">Permanent baseline snapshot established during project activation</div>
      </div>
      <div style="text-align: right;">
        <div class="summary-total">${formatIndianCurrency(totalBOQValue)}</div>
      </div>
    </div>

    <div class="footer">
      Generated automatically from Flutebyte Technologies Enterprise ERP • Canonical Commercial Document
    </div>
  `;
}

