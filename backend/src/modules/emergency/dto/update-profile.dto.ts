/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/emergency/dto/update-profile.dto.ts
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
 * Data Transfer Object: defines request/response shape for Emergency
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for Emergency
 *
 * Used By:
 - backend/src/modules/auth/dto/admin-auth.dto.ts
 - backend/src/modules/prescription/dto/interaction-query.dto.ts
 - backend/src/modules/telemedicine/dto/create-appointment.dto.ts
 - backend/src/modules/notifications/dto/create-template.dto.ts
 - backend/src/modules/ai-risk/dto/assess-risk.dto.ts
 - backend/src/modules/emergency/dto/create-emergency-contact.dto.ts
 - backend/src/modules/specialties/shared/dto/specialty.dto.ts
 - backend/src/modules/goals/dto/create-goal.dto.ts
 *
 * Calls:
 - class-validator
 *
 * Dependencies:
 - class-validator
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Emergency
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

import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateEmergencyProfileDto {
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsBoolean()
  organDonor?: boolean;

  @IsOptional()
  @IsObject()
  advanceDirectives?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  primaryPhysician?: string;

  @IsOptional()
  @IsString()
  physicianPhone?: string;

  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @IsOptional()
  @IsString()
  insurancePolicy?: string;

  @IsOptional()
  @IsString()
  emergencyNotes?: string;
}
