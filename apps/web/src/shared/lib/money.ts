/**
 * Money crosses the wire as integer minor units (kobo/cents). Convert only at
 * the render boundary — never store or arithmetic on the major-unit float.
 */
export function formatMinor(amountMinor: number, currency = 'NGN'): string {
  // No maximumFractionDigits override: rounding 1250.50 to "1,251" in a ledger
  // misstates the entry. Intl already uses the currency's own precision.
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amountMinor / 100);
}

/**
 * Currencies offered in branch settings. ponytail: a short list beats shipping
 * the full ISO 4217 table — add rows when a branch asks for one.
 */
export const CURRENCIES = [
  { code: 'NGN', label: 'Nigerian Naira' },
  { code: 'GHS', label: 'Ghanaian Cedi' },
  { code: 'KES', label: 'Kenyan Shilling' },
  { code: 'ZAR', label: 'South African Rand' },
  { code: 'USD', label: 'US Dollar' },
  { code: 'GBP', label: 'Pound Sterling' },
  { code: 'EUR', label: 'Euro' },
  { code: 'CAD', label: 'Canadian Dollar' },
] as const;

/** Parse a user-typed major-unit amount ("1,250.50") into minor units. */
export function toMinor(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  // Round after scaling: 12.34 * 100 is 1233.9999… in binary floating point.
  return Math.round(Number(cleaned) * 100);
}
