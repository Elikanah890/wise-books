/** A PayMe-compatible Tanzanian MSISDN: 255 followed by exactly 9 digits. */
export const TZ_PHONE_REGEX = /^255\d{9}$/;

/**
 * Normalizes a raw Tanzanian phone number to the 255XXXXXXXXX form.
 * Mirrors backend/src/utils/phone.ts — the backend re-validates regardless.
 */
export function normalizeTzPhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  let digits = raw.replace(/[^0-9]/g, '');

  while (digits.startsWith('255255')) {
    digits = digits.slice(3);
  }

  if (digits.startsWith('0')) {
    digits = `255${digits.slice(1)}`;
  }

  if (/^[67]\d{8}$/.test(digits)) {
    digits = `255${digits}`;
  }

  return TZ_PHONE_REGEX.test(digits) ? digits : null;
}
