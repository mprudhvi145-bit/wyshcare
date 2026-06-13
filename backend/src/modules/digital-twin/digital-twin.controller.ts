/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/digital-twin.controller.ts
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
 * HTTP controller: exposes REST endpoints for digital-twin
 *
 * Responsibilities:
 * - Handle HTTP requests for digital twin operations
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
Digital Twin
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

import { Controller, Get, Post, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { DigitalTwinService } from './digital-twin.service';

@ApiTags('Digital Twin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('digital-twin')
export class DigitalTwinController {
  constructor(private readonly twin: DigitalTwinService) {}

  @Roles('PATIENT')
  @Get()
  @ApiOperation({ summary: 'Get full digital twin profile' })
  getTwin(@CurrentUser() user: AuthenticatedUser) {
    return this.twin.getTwin(user.userId);
  }

  @Roles('PATIENT')
  @Get('score')
  @ApiOperation({ summary: 'Get twin health/risk/adherence/readiness scores' })
  getScore(@CurrentUser() user: AuthenticatedUser) {
    return this.twin.getScore(user.userId);
  }

  @Roles('PATIENT')
  @Get('predictions')
  @ApiOperation({ summary: 'Get health predictions' })
  getPredictions(@CurrentUser() user: AuthenticatedUser) {
    return this.twin.getPredictions(user.userId);
  }

  @Roles('PATIENT')
  @Get('risks')
  @ApiOperation({ summary: 'Get risk assessments' })
  getRisks(@CurrentUser() user: AuthenticatedUser) {
    return this.twin.getRisks(user.userId);
  }

  @Roles('PATIENT')
  @Get('care-gaps')
  @ApiOperation({ summary: 'Get care gaps' })
  getCareGaps(@CurrentUser() user: AuthenticatedUser) {
    return this.twin.getCareGaps(user.userId);
  }

  @Roles('PATIENT')
  @Get('recommendations')
  @ApiOperation({ summary: 'Get preventive recommendations' })
  getRecommendations(@CurrentUser() user: AuthenticatedUser) {
    return this.twin.getRecommendations(user.userId);
  }

  @Roles('PATIENT')
  @Post('recompute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force recompute digital twin' })
  recompute(@CurrentUser() user: AuthenticatedUser) {
    return this.twin.recompute(user.userId);
  }

  @Roles('DOCTOR', 'ADMIN')
  @Get(':userId')
  @ApiOperation({ summary: 'Get digital twin for specific user (admin)' })
  getTwinForUser(@Param('userId') userId: string) {
    return this.twin.getTwin(userId);
  }

  @Roles('DOCTOR', 'ADMIN')
  @Post('recompute/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recompute twin for specific user (admin)' })
  recomputeForUser(@Param('userId') userId: string) {
    return this.twin.recompute(userId);
  }
}
