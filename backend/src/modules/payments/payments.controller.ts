/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/payments/payments.controller.ts
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
 * HTTP controller: exposes REST endpoints for payments
 *
 * Responsibilities:
 * - Handle HTTP requests for billing operations
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
Billing
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

import { Body, Controller, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('consultations')
  createConsultationOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { amount: number; providerShareAmount: number; appointmentId?: string },
  ) {
    return this.paymentsService.createConsultationOrder(user.userId, body.amount, body.providerShareAmount, body.appointmentId);
  }

  @Post('pharmacy/:orderId')
  createPharmacyPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() body: { amount: number },
  ) {
    return this.paymentsService.createPharmacyOrderPayment(user.userId, orderId, body.amount);
  }

  @Post('webhooks/razorpay')
  @Public()
  webhook(
    @Headers('x-razorpay-signature') signature: string | undefined,
    @Req() request: Request & { rawBody?: Buffer },
    @Body() body: Record<string, unknown>,
  ) {
    return this.paymentsService.processWebhook(signature, request.rawBody ?? Buffer.from(JSON.stringify(body)), body);
  }

  @Post(':paymentOrderId/refund')
  refund(
    @CurrentUser() user: AuthenticatedUser,
    @Param('paymentOrderId') paymentOrderId: string,
    @Body() body: { amount?: number },
  ) {
    return this.paymentsService.refundPayment(user.userId, paymentOrderId, body.amount);
  }
}
