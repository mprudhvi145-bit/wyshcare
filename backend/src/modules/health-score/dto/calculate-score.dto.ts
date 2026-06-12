/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-score/dto/calculate-score.dto.ts
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
 * Data Transfer Object: defines request/response shape for Health
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for Health
 *
 * Used By:
 - backend/src/modules/provider-graph/provider-graph.controller.ts
 - backend/src/modules/abdm/abdm.controller.ts
 - backend/src/modules/specialties/specialties.controller.ts
 - backend/src/modules/interoperability/interoperability.controller.ts
 - backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts
 - backend/src/modules/consent/consent.controller.ts
 - backend/src/modules/emergency/dto/update-profile.dto.ts
 - backend/src/modules/specialties/dental/dental.controller.ts
 *
 * Calls:
 - class-validator
 - swagger
 *
 * Dependencies:
 - class-validator
 - swagger
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Health
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

import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateScoreDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  periodStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  periodEnd?: string;
}
