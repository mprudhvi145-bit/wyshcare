/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/diagnostics/diagnostics.controller.ts
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
 * HTTP controller: exposes REST endpoints for diagnostics
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
 - platform-express
 - common
 *
 * Dependencies:
 - swagger
 - platform-express
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

import { Body, Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { DiagnosticsService } from './diagnostics.service';

@ApiTags('diagnostics')
@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Get('partners')
  partners() {
    return this.diagnosticsService.listPartners();
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  orders(@CurrentUser() user: AuthenticatedUser) {
    return this.diagnosticsService.listOrders(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  createOrder(@CurrentUser() user: AuthenticatedUser, @Body() body: Record<string, unknown>) {
    return this.diagnosticsService.bookTest(user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reports')
  reports(@CurrentUser() user: AuthenticatedUser) {
    return this.diagnosticsService.listReports(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reports/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadReport(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    @Query('reportType') reportType = 'Diagnostic Report',
    @Query('diagnosticOrderId') diagnosticOrderId?: string,
    @Query('partnerId') partnerId?: string,
    @Query('title') title?: string,
    @Query('summary') summary?: string,
  ) {
    return this.diagnosticsService.uploadReport(user.userId, file, {
      reportType,
      diagnosticOrderId,
      partnerId,
      title,
      summary,
    });
  }
}
