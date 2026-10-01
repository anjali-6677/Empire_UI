import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PurchaseOrder, Vendor } from '../domain/types';
import { calculatePurchaseOrderTotals } from '../domain/selectors';

export const generatePurchaseOrderPDF = (po: PurchaseOrder, vendor?: Vendor): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totals = calculatePurchaseOrderTotals(po);

  // Palette
  const darkPrimary = '#121214';
  const goldAccent = '#AB9570';
  const lightGrey = '#F8FAFC';
  const borderGrey = '#E2E8F0';

  // 1. Header Banner
  doc.setFillColor(darkPrimary);
  doc.rect(0, 0, 210, 32, 'F');

  // Gold accent stripe
  doc.setFillColor(goldAccent);
  doc.rect(0, 32, 210, 2, 'F');

  // Title & Logo text
  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FLUTEBYTE TECHNOLOGIES ERP', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#94A3B8');
  doc.text('Flutebyte Technologies | Procurement Dept', 14, 21);

  // Document Title (Right Header)
  doc.setTextColor(goldAccent);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PURCHASE ORDER', 196, 15, { align: 'right' });

  doc.setTextColor('#FFFFFF');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(po.documentNumber || po.id, 196, 22, { align: 'right' });

  let y = 40;

  // 2. Info Grid: Vendor Details vs Order Metadata
  doc.setFillColor(lightGrey);
  doc.roundedRect(14, y, 90, 42, 2, 2, 'F');
  doc.roundedRect(108, y, 88, 42, 2, 2, 'F');

  doc.setDrawColor(borderGrey);
  doc.roundedRect(14, y, 90, 42, 2, 2, 'D');
  doc.roundedRect(108, y, 88, 42, 2, 2, 'D');

  // Vendor Details Card (Left)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkPrimary);
  doc.text('VENDOR DETAILS', 18, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(vendor?.name || po.vendorName || 'Selected Vendor', 18, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#475569');
  doc.text(`Contact: ${vendor?.contactPerson || 'N/A'} (${vendor?.phone || 'N/A'})`, 18, y + 20);
  doc.text(`Email: ${vendor?.email || 'N/A'}`, 18, y + 26);
  doc.text(`GSTIN: ${vendor?.gstin || 'N/A'}`, 18, y + 32);
  doc.text(`Address: ${vendor?.address || vendor?.city || 'N/A'}`, 18, y + 38);

  // Order Details Card (Right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkPrimary);
  doc.text('ORDER INFORMATION', 112, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#475569');

  const orderDate = po.orderDate || (po.createdAt ? po.createdAt.split('T')[0] : 'N/A');
  const validUntil = po.validUntil || po.rateValidityDate || 'N/A';
  const deliveryDate = po.expectedDeliveryDate || po.deliveryDueDate || 'N/A';
  const sourceRef = po.rfqDocumentNumber || po.sourceIndentNumber || (po.originType === 'direct_po' ? 'Direct PO' : 'RFQ-2026-001');

  doc.text(`PO Date: ${orderDate}`, 112, y + 14);
  doc.text(`Valid Until: ${validUntil}`, 112, y + 20);
  doc.text(`Expected Delivery: ${deliveryDate}`, 112, y + 26);
  doc.text(`Project: ${po.projectName || 'N/A'}`, 112, y + 32);
  doc.text(`Source Reference: ${sourceRef}`, 112, y + 38);

  y += 48;

  // 3. Line Items Table
  const tableHeaders = [['#', 'Description', 'Category', 'Qty', 'Unit', 'Rate', 'GST %', 'Amount']];

  const lines = po.lines || [];
  const tableData = lines.map((line, idx) => {
    const qty = Number(line.quantity || 0);
    const rate = Number(line.unitRate || line.basicRate || 0);
    const taxPct = Number(line.taxPercentage || 0);
    const lineTotal = line.lineTotal || (qty * rate * (1 + taxPct / 100));

    return [
      idx + 1,
      line.productName || 'Material Item',
      line.categoryName || 'General',
      qty,
      line.unitSymbol || 'sqft',
      `₹${rate.toLocaleString('en-IN')}`,
      `${taxPct}%`,
      `₹${Math.round(lineTotal).toLocaleString('en-IN')}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: darkPrimary,
      textColor: '#FFFFFF',
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: '#1E293B',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 52 },
      2: { cellWidth: 32 },
      3: { cellWidth: 16, halign: 'right' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 14, halign: 'right' },
      7: { cellWidth: 24, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 8;

  // 4. Commercial Summary Block (Right Align)
  const summaryX = 120;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#475569');

  doc.text('Subtotal:', summaryX, y);
  doc.text(`₹${totals.subtotal.toLocaleString('en-IN')}`, 196, y, { align: 'right' });
  y += 5;

  if (totals.discount > 0) {
    doc.text('Discount:', summaryX, y);
    doc.text(`- ₹${totals.discount.toLocaleString('en-IN')}`, 196, y, { align: 'right' });
    y += 5;
  }

  if (totals.freight > 0) {
    doc.text('Freight / Delivery:', summaryX, y);
    doc.text(`₹${totals.freight.toLocaleString('en-IN')}`, 196, y, { align: 'right' });
    y += 5;
  }

  doc.text('GST / Tax:', summaryX, y);
  doc.text(`₹${totals.tax.toLocaleString('en-IN')}`, 196, y, { align: 'right' });
  y += 5;

  if (totals.roundOff !== 0) {
    doc.text('Round Off:', summaryX, y);
    doc.text(`₹${totals.roundOff}`, 196, y, { align: 'right' });
    y += 5;
  }

  doc.setDrawColor(borderGrey);
  doc.line(summaryX, y, 196, y);
  y += 4;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkPrimary);
  doc.text('GRAND TOTAL:', summaryX, y);
  doc.text(`₹${totals.grandTotal.toLocaleString('en-IN')}`, 196, y, { align: 'right' });

  y += 12;

  // 5. Terms & Conditions Section
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkPrimary);
  doc.text('TERMS & CONDITIONS', 14, y);
  y += 5;

  const terms = [
    '1. Material must be supplied according to approved specifications and quotation.',
    '2. Delivery must be completed within the agreed timeline mentioned in this Purchase Order.',
    '3. The company may inspect and reject damaged or non-conforming material upon delivery.',
    '4. Payment will be processed according to agreed credit terms after successful delivery and invoice verification.',
    '5. Vendor must mention Purchase Order number and Project name on invoice and delivery challan.',
    '6. Shortage or transit damage remains the vendor\'s responsibility until accepted delivery.',
  ];

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#475569');

  terms.forEach((term) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(term, 14, y);
    y += 4.5;
  });

  // Footer Branding
  doc.setFontSize(8);
  doc.setTextColor('#94A3B8');
  doc.text('This is a computer-generated Purchase Order by Flutebyte ERP.', 105, 287, { align: 'center' });

  return doc;
};

export const downloadPurchaseOrderPDF = (po: PurchaseOrder, vendor?: Vendor) => {
  const doc = generatePurchaseOrderPDF(po, vendor);
  doc.save(`${po.documentNumber || po.id}.pdf`);
};

export const printPurchaseOrderPDF = (po: PurchaseOrder, vendor?: Vendor) => {
  const doc = generatePurchaseOrderPDF(po, vendor);
  doc.autoPrint();
  const blob = doc.output('bloburl');
  window.open(blob, '_blank');
};
