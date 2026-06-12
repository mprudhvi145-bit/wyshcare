/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph/health-graph.controller.ts
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
 * HTTP controller: exposes REST endpoints for health-graph
 *
 * Responsibilities:
 * - Handle HTTP requests for health graph operations
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
Health Graph
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { HealthGraphService } from './health-graph.service';

@ApiTags('health-graph')
@Controller('health-graph')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HealthGraphController {
  constructor(private readonly graph: HealthGraphService) {}

  @Get()
  getGraph(@CurrentUser() user: AuthenticatedUser) {
    return this.graph.getPatientGraph(user.userId);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.graph.getPatientSummary(user.userId);
  }

  @Get('risks')
  getRisks(@CurrentUser() user: AuthenticatedUser) {
    return this.graph.assessRisks(user.userId);
  }

  @Get('nodes')
  findNodes(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type') nodeType?: string,
    @Query('search') search?: string,
  ) {
    return this.graph.findNodes(user.userId, nodeType, search);
  }

  @Get('nodes/:nodeId')
  getNodeConnections(@Param('nodeId') nodeId: string) {
    return this.graph.findNodeConnections(nodeId);
  }

  @Get('paths')
  findPaths(
    @CurrentUser() user: AuthenticatedUser,
    @Query('fromType') fromType?: string,
    @Query('fromTitle') fromTitle?: string,
    @Query('toType') toType?: string,
    @Query('toTitle') toTitle?: string,
  ) {
    return this.graph.findPaths(user.userId, fromType, fromTitle, toType, toTitle);
  }

  @Post('query')
  queryGraph(
    @CurrentUser() user: AuthenticatedUser,
    @Body('question') question: string,
  ) {
    return this.graph.queryGraph(user.userId, question);
  }

  @Post('sync/consultation/:consultationId')
  syncFromConsultation(@Param('consultationId') consultationId: string) {
    return this.graph.syncFromConsultation(consultationId);
  }

  @Post('sync/lab-report/:reportId')
  syncFromLabReport(@Param('reportId') reportId: string) {
    return this.graph.syncFromLabReport(reportId);
  }

  @Post('sync/appointment/:appointmentId')
  syncFromAppointment(@Param('appointmentId') appointmentId: string) {
    return this.graph.syncFromAppointment(appointmentId);
  }

  @Post('sync/prescription/:prescriptionId')
  syncFromPrescription(@Param('prescriptionId') prescriptionId: string) {
    return this.graph.syncFromPrescription(prescriptionId);
  }
}
