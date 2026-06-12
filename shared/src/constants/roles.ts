/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: shared/src/constants/roles.ts
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
 * roles — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
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

export const roles = [
  'PATIENT',
  'DOCTOR',
  'NURSE',
  'CAREGIVER',
  'CLINIC_MANAGER',
  'PHARMACY_PARTNER',
  'LAB_PARTNER',
  'ADMIN',
  'SUPER_ADMIN',
  'SUPPORT',
  'SYSTEM',
] as const;

export type Role = (typeof roles)[number];
