/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/care-plans/care-plans.controller.ts
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
 * HTTP controller: exposes REST endpoints for care-plans
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

import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CarePlansService } from './care-plans.service';

@ApiTags('care-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('care-plans')
export class CarePlansController {
  constructor(private readonly carePlans: CarePlansService) {}

  @Roles('PATIENT', 'DOCTOR', 'NURSE')
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: Record<string, unknown>) {
    return this.carePlans.create(user.userId, body as Parameters<typeof this.carePlans.create>[1]);
  }

  @Roles('PATIENT', 'DOCTOR', 'NURSE')
  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.carePlans.findByUser(user.userId);
  }

  @Roles('PATIENT', 'DOCTOR', 'NURSE')
  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.carePlans.findById(id, user.userId);
  }

  @Roles('PATIENT', 'DOCTOR', 'NURSE')
  @Patch(':id/status')
  updateStatus(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: { status: string }) {
    return this.carePlans.updateStatus(id, user.userId, body.status);
  }

  @Roles('PATIENT', 'DOCTOR', 'NURSE')
  @Post(':id/milestones')
  addMilestone(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.carePlans.addMilestone(id, user.userId, body as Parameters<typeof this.carePlans.addMilestone>[2]);
  }

  @Roles('PATIENT', 'DOCTOR', 'NURSE')
  @Patch('milestones/:id/complete')
  completeMilestone(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.carePlans.completeMilestone(id, user.userId);
  }

  @Roles('PATIENT', 'DOCTOR', 'NURSE')
  @Post(':id/adherence')
  logAdherence(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.carePlans.logAdherence(id, user.userId, body as Parameters<typeof this.carePlans.logAdherence>[2]);
  }

  @Roles('PATIENT', 'DOCTOR', 'NURSE')
  @Get(':id/adherence')
  getAdherence(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.carePlans.getAdherenceHistory(id, user.userId);
  }
}
