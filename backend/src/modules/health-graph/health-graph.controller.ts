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
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { HealthGraphService } from './health-graph.service';

@ApiTags('health-graph')
@Controller('health-graph')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HealthGraphController {
  constructor(private readonly graph: HealthGraphService) {}

  @Roles('PATIENT', 'DOCTOR')
  @Get()
  getGraph(@CurrentUser() user: AuthenticatedUser) {
    return this.graph.getPatientGraph(user.userId);
  }

  @Roles('PATIENT', 'DOCTOR')
  @Get('summary')
  getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.graph.getPatientSummary(user.userId);
  }

  @Roles('PATIENT', 'DOCTOR')
  @Get('risks')
  getRisks(@CurrentUser() user: AuthenticatedUser) {
    return this.graph.assessRisks(user.userId);
  }

  @Roles('PATIENT', 'DOCTOR')
  @Get('nodes')
  findNodes(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type') nodeType?: string,
    @Query('search') search?: string,
  ) {
    return this.graph.findNodes(user.userId, nodeType, search);
  }

  @Roles('DOCTOR', 'ADMIN', 'SYSTEM')
  @Get('nodes/:nodeId')
  getNodeConnections(@Param('nodeId') nodeId: string) {
    return this.graph.findNodeConnections(nodeId);
  }

  @Roles('PATIENT', 'DOCTOR')
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

  @Roles('PATIENT', 'DOCTOR')
  @Post('query')
  queryGraph(
    @CurrentUser() user: AuthenticatedUser,
    @Body('question') question: string,
  ) {
    return this.graph.queryGraph(user.userId, question);
  }

  @Roles('DOCTOR', 'ADMIN', 'SYSTEM')
  @Post('sync/consultation/:consultationId')
  syncFromConsultation(@Param('consultationId') consultationId: string) {
    return this.graph.syncFromConsultation(consultationId);
  }

  @Roles('DOCTOR', 'ADMIN', 'SYSTEM')
  @Post('sync/lab-report/:reportId')
  syncFromLabReport(@Param('reportId') reportId: string) {
    return this.graph.syncFromLabReport(reportId);
  }

  @Roles('DOCTOR', 'ADMIN', 'SYSTEM')
  @Post('sync/appointment/:appointmentId')
  syncFromAppointment(@Param('appointmentId') appointmentId: string) {
    return this.graph.syncFromAppointment(appointmentId);
  }

  @Roles('DOCTOR', 'ADMIN', 'SYSTEM')
  @Post('sync/prescription/:prescriptionId')
  syncFromPrescription(@Param('prescriptionId') prescriptionId: string) {
    return this.graph.syncFromPrescription(prescriptionId);
  }
}
