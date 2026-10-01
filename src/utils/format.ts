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
  return formatINR(value);
}

/**
 * Safe, pure Indian Rupee (INR) monetary formatter without locale encoding artifacts.
 * Formats numbers into standard Indian numbering system (groups of 2 after initial 3 digits).
 * Examples:
 *   formatINR(70800) -> "₹70,800"
 *   formatINR(184000) -> "₹1,84,000"
 *   formatINR(1296300) -> "₹12,96,300"
 *   formatINR(12045700) -> "₹1,20,45,700"
 *   formatINR(123456789.5, { decimals: 2 }) -> "₹12,34,56,789.50"
 *   formatINR(6188000, { compact: true }) -> "₹61.88 L"
 *   formatINR(47800000, { compact: true }) -> "₹4.78 Cr"
 */
export function formatINR(
  val: number | undefined | null,
  options?: { compact?: boolean; decimals?: number }
): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';

  if (options?.compact) {
    const abs = Math.abs(val);
    if (abs >= 10000000) {
      const cr = val / 10000000;
      return `₹${Number(cr.toFixed(2))} Cr`;
    } else if (abs >= 100000) {
      const l = val / 100000;
      return `₹${Number(l.toFixed(2))} L`;
    }
  }

  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const decimals = options?.decimals ?? 0;
  const fixedStr = absVal.toFixed(decimals);
  const parts = fixedStr.split('.');
  let numStr = parts[0];

  if (numStr.length > 3) {
    const lastThree = numStr.substring(numStr.length - 3);
    const otherDigits = numStr.substring(0, numStr.length - 3);
    const formattedOther = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    numStr = formattedOther + ',' + lastThree;
  }

  const decStr = parts[1] ? '.' + parts[1] : '';
  const prefix = isNegative ? '-₹' : '₹';
  return `${prefix}${numStr}${decStr}`;
}

