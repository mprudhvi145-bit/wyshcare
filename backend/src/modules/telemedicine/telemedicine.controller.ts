/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/telemedicine/telemedicine.controller.ts
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
 * HTTP controller: exposes REST endpoints for telemedicine
 *
 * Responsibilities:
 * - Handle HTTP requests for telemedicine operations
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
Telemedicine
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
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { TelemedicineService } from './telemedicine.service';

@ApiTags('telemedicine')
@UseGuards(JwtAuthGuard)
@Controller('telemedicine')
export class TelemedicineController {
  constructor(private readonly telemedicineService: TelemedicineService) {}

  @Get('appointments')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.telemedicineService.listAppointments(user.userId);
  }

  @Post('appointments')
  createAppointment(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateAppointmentDto) {
    return this.telemedicineService.createAppointment(user.userId, body);
  }

  @Post('appointments/:appointmentId/session')
  create(@CurrentUser() user: AuthenticatedUser, @Param('appointmentId') appointmentId: string) {
    return this.telemedicineService.createSession(appointmentId, user.userId);
  }
}
