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
  SELCOM_API_KEY: z.string().optional().default(''),
  SELCOM_API_SECRET: z.string().optional().default(''),
  SELCOM_VENDOR_ID: z.string().optional().default(''),
  SELCOM_PIN: z.string().optional().default(''),
  SELCOM_BASE_URL: z.string().optional().default(''),
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

const selcomConfigured = Boolean(
  data.SELCOM_API_KEY &&
    data.SELCOM_API_SECRET &&
    data.SELCOM_VENDOR_ID &&
    data.SELCOM_PIN &&
    data.SELCOM_BASE_URL
);

export const env = {
  ...data,
  isProduction: data.NODE_ENV === 'production',
  isTest: data.NODE_ENV === 'test',
  uploadRoot,
  coversDir: path.join(uploadRoot, 'covers'),
  maxFileSizeBytes: data.MAX_FILE_SIZE_MB * 1024 * 1024,
  selcomConfigured,
} as const;

export type Env = typeof env;
