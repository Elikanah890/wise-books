import { env } from '../config/env';
import { AppError } from '../utils/AppError';

/**
 * SELCOM INTEGRATION — INTENTIONALLY STUBBED.
 *
 * Do NOT invent endpoints, headers, request bodies, signature algorithms,
 * callback fields, or error codes. Every function below must be implemented
 * literally from the official Selcom API documentation once the user provides
 * it. Until then the server must never attempt a real call to Selcom.
 *
 * Runtime behaviour while unconfigured: every function throws a 503
 * `SELCOM_NOT_CONFIGURED` error so the rest of the system stays usable.
 */

export interface SelcomOrderInit {
  orderId: string;
  amount: number;
  buyerEmail: string;
  buyerPhone: string;
  bookTitle: string;
}

export interface SelcomOrderInitResult {
  paymentReference: string;
  transactionReference?: string;
  raw: unknown;
}

export interface SelcomStatusResult {
  paid: boolean;
  transactionReference?: string;
  paymentReference?: string;
  raw: unknown;
}

export const isSelcomConfigured = env.selcomConfigured;

function assertConfigured(): void {
  if (!env.selcomConfigured) {
    throw new AppError(
      503,
      'SELCOM_NOT_CONFIGURED',
      'Selcom payment integration is not configured yet. Awaiting official API documentation.'
    );
  }
}

/**
 * Signs an outgoing request to Selcom.
 *
 * TODO(official-docs): implement exactly per documentation.
 *  - Which fields are concatenated/ordered for the signing string.
 *  - Which hashing algorithm (e.g. HMAC-SHA256) and which secret key.
 *  - Where the signature is placed (header name / body field).
 */
export function signRequest(_payload: unknown): string {
  assertConfigured();
  // TODO(official-docs): replace with the documented signing algorithm.
  throw new AppError(501, 'SELCOM_NOT_IMPLEMENTED', 'Selcom request signing is not implemented');
}

/**
 * Verifies the signature of an incoming Selcom callback.
 *
 * TODO(official-docs): implement exactly per documentation.
 *  - How the raw body + timestamp are combined to form the signed string.
 *  - Which header carries the signature.
 *  - Reject when the timestamp is older than 5 minutes (handled by caller).
 */
export function verifyCallbackSignature(
  _rawBody: Buffer,
  _signature: string | undefined,
  _timestamp: string | undefined
): boolean {
  assertConfigured();
  // TODO(official-docs): replace with the documented verification algorithm.
  return false;
}

/**
 * Initiates a payment (create-order) with Selcom.
 *
 * TODO(official-docs): implement the documented create-order endpoint,
 * request body, headers, and response mapping.
 */
export async function createOrder(_input: SelcomOrderInit): Promise<SelcomOrderInitResult> {
  assertConfigured();
  // TODO(official-docs): POST to the documented create-order endpoint.
  throw new AppError(501, 'SELCOM_NOT_IMPLEMENTED', 'Selcom payment initiation is not implemented');
}

/**
 * Queries the status of a payment (order-status endpoint).
 *
 * TODO(official-docs): implement the documented order-status endpoint.
 * Used by the callback flow and by the polling fallback for stale PENDING orders.
 */
export async function queryOrderStatus(_orderId: string): Promise<SelcomStatusResult> {
  assertConfigured();
  // TODO(official-docs): GET the documented order-status endpoint.
  throw new AppError(501, 'SELCOM_NOT_IMPLEMENTED', 'Selcom status query is not implemented');
}
