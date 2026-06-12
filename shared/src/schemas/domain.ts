/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: shared/src/schemas/domain.ts
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
 * domain — AI module
 *
 * Responsibilities:
 * - Support ai functionality
 *
 * Used By:
 - shared/src/contracts/api.ts
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
AI
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

import { roles } from '../constants/roles';

export const roleSchema = z.enum(roles);

export const userProfileSchema = z.object({
  id: z.string(),
  wyshId: z.string(),
  fullName: z.string(),
  phoneNumber: z.string(),
  preferredLanguage: z.string(),
  abhaAddress: z.string().nullable().optional(),
  bloodGroup: z.string().nullable().optional(),
  chronicConditions: z.array(z.string()).default([]),
  roles: z.array(roleSchema),
});

export const consentGrantSchema = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED']),
  accessLevel: z.enum(['FULL', 'LIMITED', 'EMERGENCY']),
  purpose: z.string(),
  expiresAt: z.string(),
  grantedToName: z.string(),
});

export const healthTimelineEventSchema = z.object({
  id: z.string(),
  type: z.enum([
    'APPOINTMENT',
    'CONSULTATION',
    'PRESCRIPTION',
    'REPORT',
    'UPLOAD',
    'REFILL',
    'LAB_BOOKING',
    'PAYMENT',
  ]),
  title: z.string(),
  summary: z.string(),
  occurredAt: z.string(),
  tags: z.array(z.string()).default([]),
});

export const doctorProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  specialization: z.string(),
  languages: z.array(z.string()),
  yearsOfExperience: z.number(),
  consultationFee: z.number(),
  telemedicineAvailable: z.boolean(),
  clinicName: z.string().optional(),
  rating: z.number().min(0).max(5),
});

export const discoverySearchSchema = z.object({
  query: z.string().min(2),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  pincode: z.string().optional(),
  specialty: z.string().optional(),
  language: z.string().optional(),
  telemedicine: z.boolean().optional(),
});

export const aiSymptomRequestSchema = z.object({
  text: z.string().min(4),
  languageCode: z.string().default('en'),
  patientId: z.string().optional(),
});

export const aiSymptomResponseSchema = z.object({
  summary: z.string(),
  urgency: z.enum(['LOW', 'MODERATE', 'HIGH', 'EMERGENCY']),
  nextSteps: z.array(z.string()),
  recommendedSpecialties: z.array(z.string()),
  safetyNotes: z.array(z.string()),
  emergencyEscalation: z.boolean(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type ConsentGrant = z.infer<typeof consentGrantSchema>;
export type HealthTimelineEvent = z.infer<typeof healthTimelineEventSchema>;
export type DoctorProfile = z.infer<typeof doctorProfileSchema>;
