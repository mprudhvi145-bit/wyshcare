/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/emergency/dto/grant-access.dto.ts
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
 - backend/src/modules/prescription/dto/interaction-query.dto.ts
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/health-graph-v2/wearables.service.ts
 - backend/src/modules/emergency/emergency.service.ts
 - backend/src/modules/ehr/cds.service.ts
 - backend/src/modules/consent/consent.service.ts
 - backend/src/modules/insurance/insurance.service.ts
 - scripts/validate-integrity.ts
 *
 * Calls:
 - client
 - class-validator
 *
 * Dependencies:
 - client
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

import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EmergencyAccessReason } from '@prisma/client';

export class GrantAccessDto {
  @IsString()
  @IsNotEmpty()
  providerUserId!: string;

  @IsEnum(EmergencyAccessReason)
  reason!: EmergencyAccessReason;

  @IsNumber()
  @Min(1)
  expiresIn!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
