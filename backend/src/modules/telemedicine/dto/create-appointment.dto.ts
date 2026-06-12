/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/telemedicine/dto/create-appointment.dto.ts
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
 * Data Transfer Object: defines request/response shape for Appointment
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for Appointment
 *
 * Used By:
 - backend/src/modules/auth/dto/admin-auth.dto.ts
 - backend/src/modules/prescription/dto/interaction-query.dto.ts
 - backend/src/modules/notifications/dto/create-template.dto.ts
 - backend/src/modules/emergency/dto/update-profile.dto.ts
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
Appointment
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

import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  doctorProfileId!: string;

  @IsIn(['VIDEO', 'AUDIO', 'CHAT', 'IN_PERSON'])
  consultationMode!: 'VIDEO' | 'AUDIO' | 'CHAT' | 'IN_PERSON';

  @IsString()
  @MinLength(5)
  reason!: string;

  @IsDateString()
  slotStartAt!: string;

  @IsDateString()
  @IsOptional()
  slotEndAt?: string;

  @IsString()
  @IsOptional()
  clinicId?: string;
}
