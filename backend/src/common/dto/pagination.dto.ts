/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/dto/pagination.dto.ts
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
 - class-transformer
 - swagger
 *
 * Dependencies:
 - class-validator
 - class-transformer
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

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}

export class SortDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  field?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}

export class FilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  field?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  operator?: string;

  @ApiPropertyOptional()
  @IsOptional()
  value?: unknown;
}

export class SearchDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fields?: string[];
}

export class PaginatedQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }
}
