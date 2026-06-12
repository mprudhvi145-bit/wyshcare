/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/gynecology/gynecology.controller.ts
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
 * HTTP controller: exposes REST endpoints for gynecology
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

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GynecologyService } from './gynecology.service';

@ApiTags('Specialty: Gynecology')
@ApiBearerAuth()
@Controller('specialties/gynecology')
export class GynecologyController {
  constructor(private readonly gynecology: GynecologyService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get gynecology exam templates' })
  getTemplates() { return this.gynecology.getTemplates(); }

  @Post('encounters')
  @ApiOperation({ summary: 'Save gynecology encounter findings' })
  saveFindings(@Body() body: { encounterId: string; patientId: string; providerId: string; data: Record<string, any> }) {
    return this.gynecology.saveEncounter(body.encounterId, body.patientId, body.providerId, body.data);
  }

  @Get('history/:patientId')
  @ApiOperation({ summary: 'Get gynecology history for patient' })
  getHistory(@Param('patientId') patientId: string) { return this.gynecology.getHistory(patientId); }
}
