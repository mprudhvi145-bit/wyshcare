/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: shared/src/contracts/api.ts
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
 * api — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - shared/src/schemas/domain.ts
 - backend/src/config/env.ts
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

import { consentGrantSchema, doctorProfileSchema, healthTimelineEventSchema, userProfileSchema } from '../schemas/domain';

export const apiEnvelopeSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.boolean().default(true),
    data,
    meta: z.record(z.string(), z.unknown()).optional(),
  });

export const sessionTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
});

export const loginRequestSchema = z.object({
  phoneNumber: z.string().min(10).max(16),
  countryCode: z.string().default('+91'),
  purpose: z.enum(['LOGIN', 'REGISTER', 'ACCESS_SHARE']).default('LOGIN'),
});

export const verifyOtpRequestSchema = z.object({
  phoneNumber: z.string().min(10).max(16),
  otpCode: z.string().length(6),
  deviceName: z.string().min(2).max(80),
});

export const dashboardResponseSchema = z.object({
  profile: userProfileSchema,
  timeline: z.array(healthTimelineEventSchema),
  activeConsents: z.array(consentGrantSchema),
  careTeam: z.array(doctorProfileSchema),
  alerts: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    }),
  ),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpRequestSchema>;
export type SessionTokens = z.infer<typeof sessionTokensSchema>;
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
