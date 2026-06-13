/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/analytics/analytics.controller.ts
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
 * HTTP controller: exposes REST endpoints for analytics
 *
 * Responsibilities:
 * - Handle HTTP requests for wyshid operations
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
 - common
 *
 * Dependencies:
 - common
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

import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Roles('ADMIN', 'CLINIC_MANAGER')
  @Get(':userId/metrics')
  async getMetrics(
    @Param('userId') userId: string,
    @Query('metric') metric?: string,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('dimension') dimension?: string,
  ) {
    return this.analytics.getMetrics(
      userId,
      metric,
      period,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
      dimension,
    );
  }

  @Roles('ADMIN', 'CLINIC_MANAGER')
  @Get(':userId/trend/:metric')
  async getTrend(
    @Param('userId') userId: string,
    @Param('metric') metric: string,
    @Query('days') days?: string,
  ) {
    return this.analytics.getMetricTrend(userId, metric, days ? parseInt(days, 10) : 30);
  }

  @Roles('ADMIN', 'CLINIC_MANAGER')
  @Get(':userId/appointments')
  async getAppointmentMetrics(@Param('userId') userId: string) {
    return this.analytics.aggregateAppointmentMetrics(userId);
  }

  @Roles('ADMIN', 'CLINIC_MANAGER')
  @Get(':userId/health-score-trend')
  async getHealthScoreTrend(
    @Param('userId') userId: string,
    @Query('days') days?: string,
  ) {
    return this.analytics.aggregateHealthScoreTrend(userId, days ? parseInt(days, 10) : 90);
  }

  @Roles('ADMIN', 'CLINIC_MANAGER')
  @Get(':userId/summary')
  async getDashboardSummary(@Param('userId') userId: string) {
    const [appointments, healthScore] = await Promise.all([
      this.analytics.aggregateAppointmentMetrics(userId),
      this.analytics.aggregateHealthScoreTrend(userId),
    ]);

    return {
      appointments,
      healthScore,
    };
  }
}
