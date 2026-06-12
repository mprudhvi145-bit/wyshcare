/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/abdm/dto/abha.dto.ts
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

export class CreateAbhaDto {
  userId!: string;
  abhaNumber!: string;
  abhaAddress!: string;
  healthIdNumber?: string;
  name?: string;
  gender?: string;
  dateOfBirth?: string;
  photo?: string;
}

export class LinkAbhaDto {
  userId!: string;
  abhaNumber!: string;
  abhaAddress!: string;
}

export class VerifyAbhaOtpDto {
  txnId!: string;
  otp!: string;
}

export class ResolveAbhaDto {
  abhaAddress!: string;
}
