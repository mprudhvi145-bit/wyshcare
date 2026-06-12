/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/consent/consent.controller.ts
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
 * HTTP controller: exposes REST endpoints for consent
 *
 * Responsibilities:
 * - Handle HTTP requests for consent operations
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
Consent
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

import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { ConsentService } from './consent.service';

@ApiTags('consent')
@UseGuards(JwtAuthGuard)
@Controller('consents')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.consentService.listForUser(user.userId);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: Record<string, unknown>) {
    return this.consentService.create(user.userId, body as never);
  }

  @Patch(':id/revoke')
  revoke(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.consentService.revoke(user.userId, id);
  }
}
