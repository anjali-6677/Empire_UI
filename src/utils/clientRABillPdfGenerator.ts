import { ClientRABill } from '../domain/types';
import { formatIndianCurrency } from './format';

export const generateClientRABillDocumentHTML = (bill: ClientRABill): string => {
  const paymentHistoryRows = (bill.paymentHistory || [])
    .map(
      (pay, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">${pay.receiptNumber}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${pay.receiptDate}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${pay.paymentMode}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; font-family: monospace;">${pay.referenceNumber || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${pay.receivingBankAccount}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #047857;">${formatIndianCurrency(pay.amountReceived)}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Client RA Bill - ${bill.billNumber}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1f2937; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 15px; margin-bottom: 20px; }
    .logo-title { font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
    .subtitle { font-size: 12px; color: #6b7280; font-weight: 500; }
    .doc-badge { text-align: right; }
    .doc-number { font-size: 20px; font-weight: 800; color: #2563eb; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
    .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; letter-spacing: 0.5px; }
    .card-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #e5e7eb; }
    .card-row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-size: 12px; }
    .val { font-weight: 600; color: #111827; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #f3f4f6; padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #374151; border: 1px solid #d1d5db; text-align: left; }
    .breakdown-box { margin-top: 20px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; }
    .breakdown-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
    .breakdown-row.total { font-weight: 800; font-size: 16px; border-top: 2px solid #111827; padding-top: 8px; margin-top: 5px; color: #1d4ed8; }
    .total-box { margin-top: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
    .total-title { font-size: 14px; font-weight: 700; color: #1e40af; }
    .total-val { font-size: 22px; font-weight: 800; color: #1d4ed8; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    .stamp-box { border: 2px dashed #9ca3af; border-radius: 6px; width: 180px; height: 70px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo-title">FLUTEBYTE TECHNOLOGIES ERP</div>
      <div class="subtitle">CLIENT ACCOUNTS RECEIVABLE / RUNNING ACCOUNT (RA) BILL VOUCHER</div>
    </div>
    <div class="doc-badge">
      <div class="doc-number">${bill.billNumber}</div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Bill Date: ${bill.billDate} | Due: ${bill.dueDate}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Client & Project Details</div>
      <div class="card-row"><span class="label">Client Name:</span> <span class="val">${bill.clientName}</span></div>
      <div class="card-row"><span class="label">Project Name:</span> <span class="val">${bill.projectName}</span></div>
      <div class="card-row"><span class="label">Milestone Linked:</span> <span class="val">${bill.milestoneName}</span></div>
      <div class="card-row"><span class="label">Created Date:</span> <span class="val">${bill.createdAt.split('T')[0]}</span></div>
    </div>

    <div class="card">
      <div class="card-title">Bill & Payment Status</div>
      <div class="card-row"><span class="label">Bill Status:</span> <span class="val" style="color: ${bill.billStatus === 'Approved' || bill.billStatus === 'Sent to Client' ? '#2563eb' : bill.billStatus === 'Rejected' ? '#b91c1c' : '#b45309'};">${bill.billStatus}</span></div>
      <div class="card-row"><span class="label">Payment Status:</span> <span class="val">${bill.paymentStatus}</span></div>
      <div class="card-row"><span class="label">Approved By:</span> <span class="val">${bill.approvedBy || 'Pending Approval'}</span></div>
      <div class="card-row"><span class="label">Sent Date:</span> <span class="val">${bill.sentAt ? bill.sentAt.split('T')[0] : 'Not Sent'}</span></div>
    </div>
  </div>

  <div class="breakdown-box">
    <div class="card-title" style="margin-bottom: 10px;">COMMERCIAL RECEIVABLE CALCULATION BREAKDOWN</div>
    <div class="breakdown-row">
      <span style="color: #4b5563;">Gross Work Value Billed / Claimed:</span>
      <span style="font-weight: 600;">${formatIndianCurrency(bill.grossWorkValue)}</span>
    </div>
    ${
      bill.approvedVariations > 0
        ? `
    <div class="breakdown-row">
      <span style="color: #4b5563;">Approved Scope Variations:</span>
      <span style="font-weight: 600; color: #047857;">+ ${formatIndianCurrency(bill.approvedVariations)}</span>
    </div>
    `
        : ''
    }
    <div class="breakdown-row">
      <span style="color: #4b5563;">Retention Deduction:</span>
      <span style="font-weight: 600; color: #b91c1c;">- ${formatIndianCurrency(bill.retentionAmount)}</span>
    </div>
    <div class="breakdown-row">
      <span style="color: #4b5563;">Advance Mobilization Recovery:</span>
      <span style="font-weight: 600; color: #b91c1c;">- ${formatIndianCurrency(bill.advanceRecoveryAmount)}</span>
    </div>
    ${
      bill.otherDeductions > 0
        ? `
    <div class="breakdown-row">
      <span style="color: #4b5563;">Other Client Deductions:</span>
      <span style="font-weight: 600; color: #b91c1c;">- ${formatIndianCurrency(bill.otherDeductions)}</span>
    </div>
    `
        : ''
    }
    <div class="breakdown-row">
      <span style="color: #4b5563;">Applicable Goods & Services Tax (GST 18%):</span>
      <span style="font-weight: 600; color: #047857;">+ ${formatIndianCurrency(bill.taxAmount)}</span>
    </div>
    <div class="breakdown-row total">
      <span>NET RECEIVABLE BILL VALUE:</span>
      <span>${formatIndianCurrency(bill.netReceivable)}</span>
    </div>
  </div>

  <div class="total-box">
    <div>
      <div class="total-title">OUTSTANDING CLIENT RECEIVABLE</div>
      <div style="font-size: 12px; color: #1e40af; margin-top: 2px;">
        Total Paid: ${formatIndianCurrency(bill.paidAmount)} | Outstanding Balance: ${formatIndianCurrency(bill.outstandingAmount)}
      </div>
    </div>
    <div class="total-val">${formatIndianCurrency(bill.outstandingAmount)}</div>
  </div>

  <div style="margin-top: 25px;">
    <div style="font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 8px;">CLIENT PAYMENT RECEIPTS LOG</div>
    ${
      bill.paymentHistory && bill.paymentHistory.length > 0
        ? `
      <table>
        <thead>
          <tr>
            <th style="text-align: center;">#</th>
            <th>Receipt #</th>
            <th>Receipt Date</th>
            <th>Mode</th>
            <th>Reference / UTR</th>
            <th>Bank Account</th>
            <th style="text-align: right;">Amount Received</th>
          </tr>
        </thead>
        <tbody>
          ${paymentHistoryRows}
        </tbody>
      </table>
    `
        : `<div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; text-align: center; color: #6b7280; font-size: 12px;">No payment receipts recorded for this RA Bill yet.</div>`
    }
  </div>

  ${
    bill.rejectionReason
      ? `
    <div style="margin-top: 20px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #991b1b; font-size: 12px;">
      <strong>Rejection Reason:</strong> ${bill.rejectionReason}
    </div>
  `
      : ''
  }

  <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div class="stamp-box">ACCOUNTS STAMP & SEAL</div>
    <div style="text-align: right;">
      <div style="font-weight: 700; color: #111827;">Authorized Billing Authority</div>
      <div style="font-size: 11px; color: #6b7280;">Finance & Accounts Department</div>
    </div>
  </div>

  <div class="footer">
    <div>Flutebyte Technologies ERP System Document</div>
    <div>Page 1 of 1</div>
  </div>
</body>
</html>
  `;
};

export const printClientRABillDocument = (bill: ClientRABill) => {
  const html = generateClientRABillDocumentHTML(bill);
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
