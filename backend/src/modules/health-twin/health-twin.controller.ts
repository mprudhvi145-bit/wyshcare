/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-twin/health-twin.controller.ts
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
 * HTTP controller: exposes REST endpoints for health-twin
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

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { HealthTwinService } from './health-twin.service';

@ApiTags('health-twin')
@UseGuards(JwtAuthGuard)
@Controller('health-twin')
export class HealthTwinController {
  constructor(private readonly twin: HealthTwinService) {}

  @Get()
  getTwin(@CurrentUser() user: AuthenticatedUser) {
    return this.twin.getTwin(user.userId);
  }

  @Get(':userId')
  getTwinForUser(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string) {
    return this.twin.getTwin(userId);
  }

  @Post('ask')
  askQuestion(@CurrentUser() user: AuthenticatedUser, @Body() body: { question: string; userId?: string }) {
    return this.twin.askQuestion(body.userId ?? user.userId, body.question);
  }
}
