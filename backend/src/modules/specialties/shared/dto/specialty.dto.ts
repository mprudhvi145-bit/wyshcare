/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/shared/dto/specialty.dto.ts
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
 - backend/src/modules/auth/dto/admin-auth.dto.ts
 - backend/src/modules/prescription/dto/interaction-query.dto.ts
 - backend/src/modules/telemedicine/dto/create-appointment.dto.ts
 - backend/src/modules/notifications/dto/create-template.dto.ts
 - backend/src/modules/emergency/dto/update-profile.dto.ts
 - backend/src/modules/ai-risk/dto/assess-risk.dto.ts
 - backend/src/modules/emergency/dto/create-emergency-contact.dto.ts
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

import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateSpecialtyEncounterDto {
  @IsString() specialtyCode: string;
  @IsString() encounterId: string;
  @IsString() patientId: string;
  @IsString() providerId: string;
  @IsOptional() @IsString() templateId?: string;
  @IsObject() data: Record<string, unknown>;
  @IsOptional() @IsArray() diagrams?: Record<string, unknown>[];
}

export class UpdateSpecialtyEncounterDto {
  @IsOptional() @IsObject() data?: Record<string, unknown>;
  @IsOptional() @IsArray() diagrams?: Record<string, unknown>[];
}

export class GetSpecialtyEncountersQueryDto {
  @IsString() patientId: string;
  @IsOptional() @IsString() templateId?: string;
  @IsOptional() @IsString() providerId?: string;
}
