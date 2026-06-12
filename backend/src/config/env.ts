/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/config/env.ts
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * env — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - shared/src/contracts/api.ts
 - shared/src/schemas/domain.ts
 *
 * Calls:
 - zod
 *
 * Dependencies:
 - zod
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
WyshID
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(30013),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1),
  COOKIE_SECRET: z.string().min(32),
  REDIS_URL: z.string().url(),
  CORS_ORIGIN: z.string().min(1),
  APP_BASE_URL: z.string().url(),

  // Storage — MinIO (dev) or S3 (prod)
  STORAGE_DRIVER: z.enum(['minio', 's3']).default('minio'),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_REGION: z.string().default('ap-south-1'),
  STORAGE_BUCKET: z.string().default('wyshcare-vault'),
  STORAGE_ACCESS_KEY_ID: z.string().min(1),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1),
  STORAGE_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
  STORAGE_SIGNING_SECRET: z.string().min(32),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(50 * 1024 * 1024),
  UPLOAD_SCAN_COMMAND: z.string().optional().default(''),

  // Encryption
  MASTER_ENCRYPTION_KEY: z.string().min(64),
  ENCRYPTION_KEY_ROTATION_DAYS: z.coerce.number().int().positive().default(90),
  FIELD_ENCRYPTION_ENABLED: z.coerce.boolean().default(true),
  PII_MASKING_ENABLED: z.coerce.boolean().default(true),

  // Consent Engine
  CONSENT_MAX_DURATION_DAYS: z.coerce.number().int().positive().default(365),
  EMERGENCY_CONSENT_DURATION_HOURS: z.coerce.number().int().positive().default(24),
  CONSENT_AUDIT_ENABLED: z.coerce.boolean().default(true),

  // Identity
  WYSHID_NAMESPACE: z.string().default('WYSH'),

  // Observability
  OTEL_ENABLED: z.coerce.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  OTEL_SERVICE_NAME: z.string().default('wyshcare-backend'),

  // AI Orchestrator
  AI_PROVIDER: z.string().default('gemini'),
  AI_FALLBACK_ORDER: z.string().optional().default('openrouter,nvidia-nim,ollama'),
  AI_CACHE_ENABLED: z.coerce.boolean().default(true),
  AI_CACHE_TTL_MS: z.coerce.number().int().positive().default(300_000),

  // ABDM (optional — plug-in layer)
  ABDM_ENABLED: z.coerce.boolean().default(false),
  ABDM_GATEWAY_URL: z.string().optional(),
  ABDM_CLIENT_ID: z.string().optional(),
  ABDM_CLIENT_SECRET: z.string().optional(),
  ABDM_X_CM_ID: z.string().default('sbx'),
  HPR_BASE_URL: z.string().optional(),
  HFR_BASE_URL: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(rawEnv: Record<string, string | undefined>): AppEnv {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  return parsed.data;
}
