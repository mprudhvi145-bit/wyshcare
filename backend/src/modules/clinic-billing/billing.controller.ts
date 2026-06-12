/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinic-billing/billing.controller.ts
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
 * HTTP controller: exposes REST endpoints for clinic-billing
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

import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { BillingService } from './billing.service';

@ApiTags('Clinic OS - Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinic/billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post('invoices/:clinicId')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new invoice' })
  createInvoice(
    @Param('clinicId') clinicId: string,
    @Body() data: {
      patientUserId: string; appointmentId?: string;
      items: Array<{ description: string; category?: string; quantity?: number; unitPrice: number; referenceId?: string; referenceType?: string }>;
      discountAmount?: number; notes?: string;
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.billing.createInvoice(clinicId, data, user.userId);
  }

  @Patch('invoices/:id/issue')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Issue a draft invoice' })
  issueInvoice(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.billing.issueInvoice(id, user.userId);
  }

  @Post('invoices/:id/payment')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a payment against an invoice' })
  recordPayment(
    @Param('id') id: string,
    @Body() data: { amount: number; method: string; reference?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.billing.recordPayment(id, data, user.userId);
  }

  @Patch('invoices/:id/cancel')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Cancel an invoice' })
  cancelInvoice(@Param('id') id: string, @Body() data: { reason: string }, @CurrentUser() user: AuthenticatedUser) {
    return this.billing.cancelInvoice(id, data.reason, user.userId);
  }

  @Get('invoices/:id')
  @Roles('ADMIN', 'DOCTOR', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get invoice details' })
  getInvoice(@Param('id') id: string) {
    return this.billing.getInvoice(id);
  }

  @Get('invoices')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'List invoices for a clinic' })
  listInvoices(
    @Query('clinicId') clinicId: string,
    @Query('status') status?: string,
    @Query('patientUserId') patientUserId?: string,
  ) {
    return this.billing.listInvoices(clinicId, status, patientUserId);
  }

  @Get('revenue/:clinicId')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get revenue report for a clinic' })
  revenueReport(@Param('clinicId') clinicId: string, @Query('days') days?: string) {
    return this.billing.getRevenueReport(clinicId, days ? parseInt(days) : 30);
  }

  @Get('revenue/:clinicId/by-doctor')
  @Roles('ADMIN', 'CLINIC_MANAGER')
  @ApiOperation({ summary: 'Get revenue breakdown by doctor' })
  revenueByDoctor(@Param('clinicId') clinicId: string, @Query('days') days?: string) {
    return this.billing.getDoctorRevenue(clinicId, days ? parseInt(days) : 30);
  }
}
