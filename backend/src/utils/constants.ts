/**
 * Database value constants.
 *
 * The Prisma enums were removed during the migration to MySQL and the
 * columns are now plain strings. These const objects are the single source of
 * truth for the allowed values, and their derived union types replace the
 * Prisma-generated enum types across the codebase.
 */

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_PROVIDER = 'PAYME' as const;
export type PaymentProvider = typeof PAYMENT_PROVIDER;

export const ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS) as OrderStatus[];
export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS) as PaymentStatus[];
export const ROLE_VALUES = Object.values(ROLE) as Role[];
