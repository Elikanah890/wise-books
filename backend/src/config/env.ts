import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'JWT_SECRET must be a 64-character hex string'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  UPLOAD_DIR: z.string().min(1).default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(5),

  // PayMe Africa (live). The app refuses to start without APP_ID and SECRET.
  PAYME_BASE_URL: z.string().url().default('https://portal.paymeafrica.com/api/v1'),
  PAYME_APP_ID: z.string().min(1, 'PAYME_APP_ID is required'),
  PAYME_SECRET: z.string().min(1, 'PAYME_SECRET is required'),
  PAYME_CALLBACK_URL: z
    .string()
    .url('PAYME_CALLBACK_URL must be a valid URL')
    .default('https://api-wisebook.brandtechtz.co.tz/api/payments/payme/callback'),
  PAYME_QUERY_INTERVAL_SECONDS: z.coerce.number().int().positive().default(15),
  PAYME_QUERY_MAX_ATTEMPTS: z.coerce.number().int().positive().default(40),
  // PayMe nets a transaction fee, so the confirmed amount can be slightly lower
  // than the requested amount. 0 = strict exact match (most secure). We still
  // never accept an amount below (amount - tolerance).
  PAYME_AMOUNT_TOLERANCE_PERCENT: z.coerce.number().min(0).max(100).default(0),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

const data = parsed.data;
const uploadRoot = path.resolve(process.cwd(), data.UPLOAD_DIR);

export const env = {
  ...data,
  isProduction: data.NODE_ENV === 'production',
  isTest: data.NODE_ENV === 'test',
  uploadRoot,
  coversDir: path.join(uploadRoot, 'covers'),
  maxFileSizeBytes: data.MAX_FILE_SIZE_MB * 1024 * 1024,
} as const;

export type Env = typeof env;
