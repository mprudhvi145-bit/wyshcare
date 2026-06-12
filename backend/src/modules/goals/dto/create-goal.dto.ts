/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/goals/dto/create-goal.dto.ts
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

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';

export enum GoalCategory {
  MEDICAL = 'MEDICAL',
  FITNESS = 'FITNESS',
  NUTRITION = 'NUTRITION',
  LIFESTYLE = 'LIFESTYLE',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateGoalDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: GoalCategory })
  @IsEnum(GoalCategory)
  category: GoalCategory;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  targetValue?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  currentValue?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  targetDate?: string;
}

export class UpdateGoalProgressDto {
  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateMilestoneDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  targetValue?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  currentValue?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
