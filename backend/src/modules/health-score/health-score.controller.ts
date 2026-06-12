/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-score/health-score.controller.ts
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
 * HTTP controller: exposes REST endpoints for health-score
 *
 * Responsibilities:
 * - Handle HTTP requests for health operations
 * - Validate and transform request/response payloads
 * - Delegate business logic to service layer
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - swagger
 - common
 *
 * Dependencies:
 - swagger
 - common
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

import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import type { Role } from '@wyshcare/shared';
import { HealthScoreService } from './health-score.service';
import { CalculateScoreDto } from './dto/calculate-score.dto';

@ApiTags('health-score')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PATIENT' as Role)
@Controller('health-score')
export class HealthScoreController {
  constructor(private readonly healthScoreService: HealthScoreService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.healthScoreService.getLatestScore(user.userId);
  }

  @Get('history')
  getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') days?: string,
  ) {
    return this.healthScoreService.getScoreHistory(
      user.userId,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Post('calculate')
  calculate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CalculateScoreDto,
  ) {
    return this.healthScoreService.calculateScore(
      user.userId,
      dto.periodStart ? new Date(dto.periodStart) : undefined,
      dto.periodEnd ? new Date(dto.periodEnd) : undefined,
    );
  }

  @Get('breakdown')
  getBreakdown(@CurrentUser() user: AuthenticatedUser) {
    return this.healthScoreService.getScoreBreakdown(user.userId);
  }
}
