import crypto from 'node:crypto';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { AppError } from '../utils/AppError';

const REQUEST_TIMEOUT_MS = 15_000;

export interface PaymeCollectionInput {
  amount: number;
  msisdn: string;
  reference: string;
  callbackUrl: string;
}

export interface PaymeCollectionResponse {
  status?: string;
  transaction_id?: string;
  payment_status?: string;
  provider_response?: {
    result?: string;
    resultcode?: string;
    message?: string;
  };
  [key: string]: unknown;
}

export interface PaymeQueryResponse {
  status?: string;
  reference?: string;
  amount?: number | string;
  currency?: string;
  payment_status?: string;
  provider_checked?: boolean;
  provider_message?: string | null;
  [key: string]: unknown;
}

/** Base64(HMAC_SHA256(data, secret)). */
function sign(data: string): string {
  return crypto.createHmac('sha256', env.PAYME_SECRET).update(data).digest('base64');
}

/**
 * Builds the signed headers for an outbound request. The signature is computed
 * over the exact minified JSON body concatenated with the timestamp (no separator).
 */
function buildHeaders(minifiedBody: string): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  return {
    'Content-Type': 'application/json',
    'X-App-ID': env.PAYME_APP_ID,
    'X-Timestamp': timestamp,
    'X-Signature': sign(minifiedBody + timestamp),
  };
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const minified = JSON.stringify(body); // minified once, reused for signing + sending
  const url = `${env.PAYME_BASE_URL.replace(/\/$/, '')}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(minified),
      body: minified,
      signal: controller.signal,
    });

    const text = await response.text();
    let json: unknown = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    if (!response.ok) {
      const record = json as {
        message?: string;
        error?: string;
        provider_response?: { message?: string };
      };
      const providerMessage =
        record.message ??
        record.provider_response?.message ??
        record.error ??
        `Payment provider returned HTTP ${response.status}`;
      logger.warn(
        { path, status: response.status, providerMessage },
        'PayMe request rejected'
      );
      throw new AppError(502, 'PAYME_ERROR', providerMessage);
    }

    return json as T;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.warn({ path, err: (error as Error).message }, 'PayMe request failed');
    throw new AppError(502, 'PAYME_UNAVAILABLE', 'Could not reach the payment provider');
  } finally {
    clearTimeout(timer);
  }
}

/** Sends a mobile-money collection (USSD push) request. */
export function createCollection(input: PaymeCollectionInput): Promise<PaymeCollectionResponse> {
  return post<PaymeCollectionResponse>('/transact', {
    action: 'collection',
    amount: input.amount,
    msisdn: input.msisdn,
    reference: input.reference,
    callback_url: input.callbackUrl,
  });
}

/** Asks PayMe for the authoritative status of a transaction. */
export function queryTransaction(reference: string): Promise<PaymeQueryResponse> {
  return post<PaymeQueryResponse>('/query', { reference });
}

/**
 * Verifies a webhook signature: Base64(HMAC_SHA256(rawPayload + X-Timestamp, secret)).
 * Uses timingSafeEqual to avoid leaking timing information.
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string | undefined,
  timestamp: string | undefined
): boolean {
  if (!signature || !timestamp || rawBody.length === 0) return false;

  const expected = Buffer.from(sign(rawBody.toString('utf8') + timestamp), 'utf8');
  const provided = Buffer.from(signature, 'utf8');
  if (expected.length !== provided.length) return false;

  return crypto.timingSafeEqual(expected, provided);
}
