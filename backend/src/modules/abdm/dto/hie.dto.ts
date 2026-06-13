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

import { IsString, IsArray, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class RequestHealthInfoDto {
  @IsString() @IsNotEmpty()
  consentId!: string;

  @IsString() @IsNotEmpty()
  requesterUserId!: string;

  @IsString() @IsNotEmpty()
  patientUserId!: string;

  @IsString() @IsNotEmpty()
  purpose!: string;

  @IsArray() @IsString({ each: true }) @IsNotEmpty()
  hiTypes!: string[];

  @IsString() @IsOptional()
  dateFrom?: string;

  @IsString() @IsOptional()
  dateTo?: string;
}

export class PushHealthDataDto {
  @IsString() @IsNotEmpty()
  requestId!: string;

  @IsString() @IsNotEmpty()
  hipId!: string;

  @IsString() @IsNotEmpty()
  hipName!: string;

  @IsString() @IsNotEmpty()
  careContextReference!: string;

  @IsObject() @IsNotEmpty()
  dataPayload!: Record<string, unknown>;

  @IsObject() @IsOptional()
  encryptionDetails?: Record<string, unknown>;
}

export class CareContextDto {
  @IsString() @IsNotEmpty()
  patientUserId!: string;

  @IsString() @IsNotEmpty()
  abhaAddress!: string;

  @IsString() @IsNotEmpty()
  displayName!: string;

  @IsString() @IsNotEmpty()
  type!: string;

  @IsString() @IsOptional()
  healthRecordId?: string;
}
