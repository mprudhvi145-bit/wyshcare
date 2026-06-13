/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/dermatology/dermatology.controller.ts
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
 * HTTP controller: exposes REST endpoints for dermatology
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

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { DermatologyService } from './dermatology.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Specialty: Dermatology')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR', 'NURSE')
@UseGuards(ThrottlerGuard)
@Controller('specialties/dermatology')
export class DermatologyController {
  constructor(private readonly derm: DermatologyService) {}

  @Get('body-regions')
  @ApiOperation({ summary: 'Get body regions for mapping' })
  getBodyRegions() { return this.derm.getBodyRegions(); }

  @Get('lesion-types')
  @ApiOperation({ summary: 'Get skin lesion types' })
  getLesionTypes() { return this.derm.getLesionTypes(); }

  @Get('procedures')
  @ApiOperation({ summary: 'Get cosmetic/dermatology procedures' })
  getProcedures(@Query('category') category?: string) { return this.derm.getCosmeticProcedures(category); }

  @Get('templates')
  @ApiOperation({ summary: 'Get dermatology exam templates' })
  getTemplates() { return this.derm.getTemplates(); }

  @Post('encounters')
  @ApiOperation({ summary: 'Save dermatology encounter' })
  saveEncounter(@Body() body: { encounterId: string; patientId: string; providerId: string; data: Record<string, unknown> }) {
    return this.derm.saveDermatologyEncounter(body.encounterId, body.patientId, body.providerId, body.data);
  }

  @Get('history/:patientId')
  @ApiOperation({ summary: 'Get dermatology history' })
  getHistory(@Param('patientId') patientId: string) { return this.derm.getDermatologyHistory(patientId); }
}
