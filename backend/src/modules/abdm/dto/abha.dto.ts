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

import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAbhaDto {
  @IsString() @IsNotEmpty()
  userId!: string;

  @IsString() @IsNotEmpty()
  abhaNumber!: string;

  @IsString() @IsNotEmpty()
  abhaAddress!: string;

  @IsString() @IsOptional()
  healthIdNumber?: string;

  @IsString() @IsOptional()
  name?: string;

  @IsString() @IsOptional()
  gender?: string;

  @IsString() @IsOptional()
  dateOfBirth?: string;

  @IsString() @IsOptional()
  photo?: string;
}

export class LinkAbhaDto {
  @IsString() @IsNotEmpty()
  userId!: string;

  @IsString() @IsNotEmpty()
  abhaNumber!: string;

  @IsString() @IsNotEmpty()
  abhaAddress!: string;
}

export class VerifyAbhaOtpDto {
  @IsString() @IsNotEmpty()
  txnId!: string;

  @IsString() @IsNotEmpty()
  otp!: string;
}

export class ResolveAbhaDto {
  @IsString() @IsNotEmpty()
  abhaAddress!: string;
}
