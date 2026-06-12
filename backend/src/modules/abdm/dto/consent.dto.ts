/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/abdm/dto/consent.dto.ts
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
 * Data Transfer Object: defines request/response shape for Consent
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for Consent
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
Consent
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

export class RequestConsentDto {
  patientUserId!: string;
  hiuId!: string;
  purpose!: string;
  hiTypes!: string[];
  dateFrom?: string;
  dateTo?: string;
  frequency?: string;
  expiryDays?: number;
}

export class GrantConsentDto {
  consentId!: string;
}

export class RevokeConsentDto {
  consentId!: string;
  reason?: string;
}
