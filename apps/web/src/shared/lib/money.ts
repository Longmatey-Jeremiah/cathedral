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
