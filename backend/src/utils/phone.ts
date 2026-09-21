/** A PayMe-compatible Tanzanian MSISDN: 255 followed by exactly 9 digits. */
export const TZ_PHONE_REGEX = /^255\d{9}$/;

/**
 * Normalizes a raw Tanzanian phone number to the 255XXXXXXXXX form.
 *
 * Accepts: spaces, dashes, parentheses and a leading `+`; a leading `0`
 * (local form); a duplicated `255` prefix; and a bare 9-digit mobile number
 * starting with 6 or 7. Returns null when the result is not a valid MSISDN.
 */
export function normalizeTzPhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  let digits = raw.replace(/[^0-9]/g, '');

  // Remove a duplicated country code, e.g. 255255712345678 -> 255712345678
  while (digits.startsWith('255255')) {
    digits = digits.slice(3);
  }

  // Local form: 0712345678 -> 255712345678
  if (digits.startsWith('0')) {
    digits = `255${digits.slice(1)}`;
  }

  // Bare 9-digit mobile number: 712345678 / 688138821 -> 255...
  if (/^[67]\d{8}$/.test(digits)) {
    digits = `255${digits}`;
  }

  return TZ_PHONE_REGEX.test(digits) ? digits : null;
}
