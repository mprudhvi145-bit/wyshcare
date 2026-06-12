/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/payments/payments.service.ts
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
 * Business logic service for payments
 *
 * Responsibilities:
 * - Execute business logic for billing operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - client
 - common
 *
 * Dependencies:
 - client
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

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { AuditLogService } from '../../common/services/audit-log.service';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { RazorpayService } from '../../providers/razorpay/razorpay.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayService: RazorpayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async createConsultationOrder(userId: string, amount: number, providerShareAmount: number, appointmentId?: string) {
    if (appointmentId) {
      const appointment = await this.prisma.appointment.findFirst({
        where: { id: appointmentId, patientUserId: userId },
      });

      if (!appointment) {
        throw new UnauthorizedException('Appointment not found for this user');
      }
    }

    const localOrder = await this.prisma.paymentOrder.create({
      data: {
        userId,
        orderType: 'CONSULTATION',
        amount,
        providerShareAmount,
        platformFeeAmount: amount - providerShareAmount,
        metadata: {
          appointmentId,
        } as Prisma.JsonObject,
      },
    });

    const gatewayOrder = await this.razorpayService.createOrder(amount * 100, localOrder.id);
    const updatedOrder = await this.prisma.paymentOrder.update({
      where: { id: localOrder.id },
      data: { providerReference: gatewayOrder.id },
    });

    if (appointmentId) {
      await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: { paymentOrderId: updatedOrder.id },
      });
    }

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'PAYMENT_ORDER_CREATED',
      resourceType: 'PaymentOrder',
      resourceId: updatedOrder.id,
      metadata: { orderType: 'CONSULTATION', amount },
    });

    return updatedOrder;
  }

  async createPharmacyOrderPayment(userId: string, pharmacyOrderId: string, amount: number) {
    const pharmacyOrder = await this.prisma.pharmacyOrder.findFirst({
      where: { id: pharmacyOrderId, userId },
    });

    if (!pharmacyOrder) {
      throw new UnauthorizedException('Pharmacy order not found for this user');
    }

    const localOrder = await this.prisma.paymentOrder.create({
      data: {
        userId,
        orderType: 'PHARMACY',
        amount,
        providerShareAmount: amount,
        platformFeeAmount: 0,
        metadata: {
          pharmacyOrderId,
        } as Prisma.JsonObject,
      },
    });

    const gatewayOrder = await this.razorpayService.createOrder(amount * 100, localOrder.id);

    const updatedOrder = await this.prisma.paymentOrder.update({
      where: { id: localOrder.id },
      data: { providerReference: gatewayOrder.id },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'PAYMENT_ORDER_CREATED',
      resourceType: 'PaymentOrder',
      resourceId: updatedOrder.id,
      metadata: { orderType: 'PHARMACY', amount },
    });

    return updatedOrder;
  }

  async processWebhook(signature: string | undefined, rawBody: Buffer, payload: Record<string, unknown>) {
    if (!this.razorpayService.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid payment webhook signature');
    }

    const event = payload.event as string | undefined;
    const entity = (((payload.payload as Record<string, unknown> | undefined)?.payment as Record<string, unknown> | undefined)
      ?.entity ?? {}) as Record<string, unknown>;
    const orderId = entity.order_id as string | undefined;
    const paymentId = entity.id as string | undefined;

    if (!event || !orderId) {
      throw new BadRequestException('Invalid webhook payload');
    }

    const paymentOrder = await this.prisma.paymentOrder.findFirst({
      where: { providerReference: orderId },
    });

    if (!paymentOrder) {
      throw new BadRequestException('Payment order not found');
    }

    if (event === 'payment.captured') {
      if (paymentOrder.status !== 'CAPTURED') {
        await this.prisma.paymentOrder.update({
          where: { id: paymentOrder.id },
          data: {
            status: 'CAPTURED',
            capturedAt: new Date(),
            metadata: {
              ...(paymentOrder.metadata as Prisma.JsonObject | null),
              paymentId,
              webhookEvent: event,
            } as Prisma.JsonObject,
          },
        });

        await this.auditLog.capture({
          actorUserId: paymentOrder.userId,
          patientUserId: paymentOrder.userId,
          action: 'PAYMENT_CAPTURED',
          resourceType: 'PaymentOrder',
          resourceId: paymentOrder.id,
          metadata: { orderType: paymentOrder.orderType, amount: paymentOrder.amount },
        });
      }
    } else if (event === 'payment.failed') {
      if (paymentOrder.status !== 'FAILED') {
        await this.prisma.paymentOrder.update({
          where: { id: paymentOrder.id },
          data: {
            status: 'FAILED',
            metadata: {
              ...(paymentOrder.metadata as Prisma.JsonObject | null),
              paymentId,
              webhookEvent: event,
            } as Prisma.JsonObject,
          },
        });

        await this.auditLog.capture({
          actorUserId: paymentOrder.userId,
          patientUserId: paymentOrder.userId,
          action: 'PAYMENT_FAILED',
          resourceType: 'PaymentOrder',
          resourceId: paymentOrder.id,
          metadata: { orderType: paymentOrder.orderType, amount: paymentOrder.amount },
        });
      }
    }

    return { accepted: true, orderId: paymentOrder.id, event };
  }

  async refundPayment(userId: string, paymentOrderId: string, amount?: number) {
    const order = await this.prisma.paymentOrder.findFirst({
      where: { id: paymentOrderId, userId },
    });

    if (!order) {
      throw new UnauthorizedException('Payment order not found for this user');
    }

    const paymentId = (order.metadata as Prisma.JsonObject | null)?.paymentId;

    if (typeof paymentId !== 'string') {
      throw new BadRequestException('Payment has not been captured yet');
    }

    await this.razorpayService.createRefund(paymentId, amount ? amount * 100 : undefined);

    const refunded = await this.prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: 'REFUNDED',
        refundAmount: amount ?? order.amount,
      },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'PAYMENT_REFUNDED',
      resourceType: 'PaymentOrder',
      resourceId: refunded.id,
      metadata: { refundAmount: amount ?? order.amount, originalAmount: order.amount },
    });

    return refunded;
  }
}
