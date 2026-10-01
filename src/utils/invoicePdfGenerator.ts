import { DirectInvoice } from '../domain/types';
import { formatIndianCurrency } from './format';

export const generateDirectInvoiceHTML = (inv: DirectInvoice): string => {
  const lineItemRows = (inv.lineItems || [])
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">${item.description}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${item.category || '-'}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${item.qty} ${item.unit}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${formatIndianCurrency(item.rate)}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${formatIndianCurrency(item.discount || 0)}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${item.taxPercent}%</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: 700;">${formatIndianCurrency(item.lineTotal)}</td>
      </tr>
    `
    )
    .join('');

  const additionalChargeRows = (inv.additionalCharges || [])
    .map(
      (chg) => `
      <tr>
        <td colspan="7" style="padding: 6px 8px; border: 1px solid #e5e7eb; text-align: right; font-size: 12px; color: #4b5563;">
          ${chg.description} (${chg.taxPercent}% Tax):
        </td>
        <td style="padding: 6px 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: 600; font-size: 12px;">
          ${formatIndianCurrency(chg.total)}
        </td>
      </tr>
    `
    )
    .join('');

  const isReceivable = inv.direction === 'Receivable';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${inv.direction} Invoice - ${inv.invoiceNumber}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1f2937; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #b45309; padding-bottom: 15px; margin-bottom: 20px; }
    .logo-title { font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
    .subtitle { font-size: 12px; color: #b45309; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .doc-badge { text-align: right; }
    .doc-number { font-size: 18px; font-weight: 800; color: #111827; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
    .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; letter-spacing: 0.5px; }
    .card-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #e5e7eb; }
    .card-row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-size: 12px; }
    .val { font-weight: 600; color: #111827; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #f3f4f6; padding: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #374151; border: 1px solid #d1d5db; text-align: left; }
    .totals-grid { margin-top: 20px; display: flex; justify-content: flex-end; }
    .totals-table { width: 320px; border-collapse: collapse; }
    .totals-table td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    .totals-table td.title { color: #4b5563; font-weight: 500; }
    .totals-table td.val { text-align: right; font-weight: 600; color: #111827; }
    .grand-total-row { background: #fffbeb; border-top: 2px solid #b45309; }
    .grand-total-row td { font-size: 14px; font-weight: 800; color: #b45309; padding: 10px; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    .stamp-box { border: 2px dashed #9ca3af; border-radius: 6px; width: 180px; height: 70px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo-title">${inv.legalEntity || 'FLUTEBYTE TECHNOLOGIES PVT. LTD.'}</div>
      <div class="subtitle">${inv.direction.toUpperCase()} INVOICE — ${inv.invoiceType.toUpperCase()}</div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">GSTIN: 29AAACE1234A1Z5 | Corporate Legal Entity</div>
    </div>
    <div class="doc-badge">
      <div class="doc-number">${inv.invoiceNumber}</div>
      ${inv.supplierInvoiceNumber ? `<div style="font-size: 12px; font-weight: 600; color: #4b5563; margin-top: 2px;">Party Ref #: ${inv.supplierInvoiceNumber}</div>` : ''}
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Date: ${inv.invoiceDate}</div>
      <div style="font-size: 11px; color: #6b7280;">Due: ${inv.dueDate}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">${isReceivable ? 'BILL TO (CLIENT / PARTY)' : 'BILL FROM (VENDOR / SUPPLIER)'}</div>
      <div class="card-row"><span class="label">Party Name:</span> <span class="val">${inv.partyName}</span></div>
      <div class="card-row"><span class="label">Party Type:</span> <span class="val">${inv.partyType}</span></div>
      <div class="card-row"><span class="label">Project / Site:</span> <span class="val">${inv.projectName || 'General Enterprise'}</span></div>
      <div class="card-row"><span class="label">Payment Terms:</span> <span class="val">${inv.paymentTerms || 'Standard'}</span></div>
    </div>

    <div class="card">
      <div class="card-title">INVOICE SPECIFICATIONS & STATUS</div>
      <div class="card-row"><span class="label">Direction:</span> <span class="val" style="color: ${isReceivable ? '#2563eb' : '#059669'};">${inv.direction}</span></div>
      <div class="card-row"><span class="label">Invoice Type:</span> <span class="val">${inv.invoiceType}</span></div>
      <div class="card-row"><span class="label">Reference Type:</span> <span class="val">${inv.referenceType} ${inv.referenceNumber ? `(${inv.referenceNumber})` : ''}</span></div>
      <div class="card-row"><span class="label">Invoice Status:</span> <span class="val">${inv.invoiceStatus}</span></div>
      <div class="card-row"><span class="label">Payment Status:</span> <span class="val">${inv.paymentStatus}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align: center; width: 30px;">#</th>
        <th>Description</th>
        <th style="text-align: center;">Category</th>
        <th style="text-align: right;">Qty</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Disc</th>
        <th style="text-align: center;">Tax</th>
        <th style="text-align: right;">Line Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemRows}
      ${additionalChargeRows}
    </tbody>
  </table>

  <div class="totals-grid">
    <table class="totals-table">
      <tr>
        <td class="title">Subtotal</td>
        <td class="val">${formatIndianCurrency(inv.subtotal)}</td>
      </tr>
      ${inv.discountTotal > 0 ? `
      <tr>
        <td class="title">Total Discount</td>
        <td class="val" style="color: #b91c1c;">-${formatIndianCurrency(inv.discountTotal)}</td>
      </tr>` : ''}
      ${inv.additionalChargesTotal > 0 ? `
      <tr>
        <td class="title">Additional Charges</td>
        <td class="val">${formatIndianCurrency(inv.additionalChargesTotal)}</td>
      </tr>` : ''}
      <tr>
        <td class="title">Tax Amount</td>
        <td class="val">${formatIndianCurrency(inv.taxTotal)}</td>
      </tr>
      ${inv.roundOff !== 0 ? `
      <tr>
        <td class="title">Round Off</td>
        <td class="val">${inv.roundOff > 0 ? '+' : ''}${inv.roundOff.toFixed(2)}</td>
      </tr>` : ''}
      <tr class="grand-total-row">
        <td class="title" style="color: #b45309;">FINAL INVOICE VALUE</td>
        <td class="val" style="color: #b45309;">${formatIndianCurrency(inv.finalInvoiceValue)}</td>
      </tr>
      <tr>
        <td class="title">Paid Amount</td>
        <td class="val" style="color: #059669;">${formatIndianCurrency(inv.paidAmount)}</td>
      </tr>
      <tr>
        <td class="title">Outstanding Balance</td>
        <td class="val" style="color: ${inv.outstandingAmount > 0 ? '#b45309' : '#059669'}; font-weight: 700;">${formatIndianCurrency(inv.outstandingAmount)}</td>
      </tr>
    </table>
  </div>

  ${inv.notes ? `
  <div style="margin-top: 20px; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">NOTES / COMMERCIAL INSTRUCTIONS</div>
    <div style="font-size: 12px; color: #374151;">${inv.notes}</div>
  </div>` : ''}

  <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div class="stamp-box">AUTHORIZED STAMP & SIGN</div>
    <div style="text-align: right;">
      <div style="font-weight: 700; color: #111827;">Flutebyte Technologies Pvt. Ltd.</div>
      <div style="font-size: 11px; color: #6b7280;">Finance & Accounts Division</div>
    </div>
  </div>

  <div class="footer">
    <div>Flutebyte Technologies ERP System Document — Confidential</div>
    <div>Page 1 of 1</div>
  </div>
</body>
</html>
  `;
};

export const printDirectInvoiceDocument = (inv: DirectInvoice) => {
  const html = generateDirectInvoiceHTML(inv);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  }
};
