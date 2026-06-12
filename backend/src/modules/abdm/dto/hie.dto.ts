/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/abdm/dto/hie.dto.ts
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
 * Data Transfer Object: defines request/response shape for WyshID
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for WyshID
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

export class RequestHealthInfoDto {
  consentId!: string;
  requesterUserId!: string;
  patientUserId!: string;
  purpose!: string;
  hiTypes!: string[];
  dateFrom?: string;
  dateTo?: string;
}

export class PushHealthDataDto {
  requestId!: string;
  hipId!: string;
  hipName!: string;
  careContextReference!: string;
  dataPayload!: Record<string, unknown>;
  encryptionDetails?: Record<string, unknown>;
}

export class CareContextDto {
  patientUserId!: string;
  abhaAddress!: string;
  displayName!: string;
  type!: string;
  healthRecordId?: string;
}
