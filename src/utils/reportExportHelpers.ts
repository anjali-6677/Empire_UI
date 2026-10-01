/**
 * Export Utilities for Admin Reports (CSV & Print/PDF)
 * Location: src/utils/reportExportHelpers.ts
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const escapeCell = (cell: any) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printReportWindow(title: string, subtitle: string, headers: string[], rows: (string | number)[][]) {
  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    alert('Please allow popups to print / save PDF.');
    return;
  }

  const tableHeadersHtml = headers.map((h) => `<th style="border: 1px solid #cbd5e1; padding: 8px 10px; background: #f8fafc; font-size: 11px; text-transform: uppercase; text-align: left; font-weight: 700;">${h}</th>`).join('');
  const tableRowsHtml = rows
    .map(
      (r) =>
        `<tr>${r
          .map(
            (cell) =>
              `<td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 11px;">${cell ?? '-'}</td>`
          )
          .join('')}</tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Flutebyte ERP</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 30px; }
          .header { margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
          .logo { font-size: 18px; font-weight: 900; color: #ab9570; text-transform: uppercase; tracking: 1px; }
          .title { font-size: 20px; font-weight: 800; margin: 6px 0 2px 0; color: #0f172a; }
          .subtitle { font-size: 12px; color: #64748b; }
          .meta { margin-top: 8px; font-size: 11px; color: #94a3b8; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          @media print {
            body { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Flutebyte Technologies</div>
          <div class="title">${title}</div>
          <div class="subtitle">${subtitle}</div>
          <div class="meta">Generated on: ${new Date().toLocaleString('en-IN')} • Flutebyte ERP Audit Engine</div>
        </div>
        <table>
          <thead>
            <tr>${tableHeadersHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
