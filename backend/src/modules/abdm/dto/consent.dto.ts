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

import { IsString, IsArray, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class RequestConsentDto {
  @IsString() @IsNotEmpty()
  patientUserId!: string;

  @IsString() @IsNotEmpty()
  hiuId!: string;

  @IsString() @IsNotEmpty()
  purpose!: string;

  @IsArray() @IsString({ each: true }) @IsNotEmpty()
  hiTypes!: string[];

  @IsString() @IsOptional()
  dateFrom?: string;

  @IsString() @IsOptional()
  dateTo?: string;

  @IsString() @IsOptional()
  frequency?: string;

  @IsNumber() @IsOptional()
  expiryDays?: number;
}

export class GrantConsentDto {
  @IsString() @IsNotEmpty()
  consentId!: string;
}

export class RevokeConsentDto {
  @IsString() @IsNotEmpty()
  consentId!: string;

  @IsString() @IsOptional()
  reason?: string;
}
