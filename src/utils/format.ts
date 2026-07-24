/**
 * Format raw INR numeric values to Indian currency terms (Lakhs, Crores) with rupee sign.
 * Example:
 * 248000000 -> ₹24.8 Cr
 * 16500000 -> ₹1.65 Cr
 * 4200000 -> ₹42 L
 * 1540000 -> ₹15.4 L
 */
export function formatIndianCurrency(value: number): string {
  if (Math.abs(value) >= 10000000) {
    const cr = value / 10000000;
    const num = parseFloat(cr.toFixed(2));
    return `₹${num} Cr`;
  } else if (Math.abs(value) >= 100000) {
    const l = value / 100000;
    const num = parseFloat(l.toFixed(2));
    return `₹${num} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}
