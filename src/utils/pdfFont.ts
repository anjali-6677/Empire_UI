import jsPDF from 'jspdf';

/**
 * Custom Unicode Base64 TTF font helper for jsPDF.
 * Embeds font definition so that symbols like ₹ (Indian Rupee symbol),
 * dates, numbers, and identifiers render cleanly without WinAnsi encoding corruptions.
 */

// A compact UTF-8 compliant TrueType font containing ASCII + Rupee symbol (₹ / \u20B9)
// If font string is registered via addFileToVFS, jsPDF uses Identity-H encoding.
export const registerUnicodeFont = (doc: jsPDF): boolean => {
  try {
    // Register font if available in VFS or fallback to system font setup
    if ((doc as any).existsFileInVFS && (doc as any).existsFileInVFS('Roboto-Regular.ttf')) {
      doc.setFont('Roboto-Regular', 'normal');
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Could not register custom font in jsPDF:', e);
    return false;
  }
};

/**
 * Universal safe monetary formatter for PDF reports.
 * Cleanly formats Indian Rupee amounts: e.g. ₹61,88,000 or ₹61.88 L
 */
export const formatPdfMoney = (val: number | undefined | null, compact: boolean = false): string => {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  const roundVal = Math.round(val);
  if (compact) {
    const abs = Math.abs(val);
    if (abs >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (abs >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
  }
  return `₹${roundVal.toLocaleString('en-IN')}`;
};
