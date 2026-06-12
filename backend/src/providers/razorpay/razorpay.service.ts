/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/razorpay/razorpay.service.ts
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
 * Business logic service for razorpay
 *
 * Responsibilities:
 * - Execute business logic for billing operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/ai/ai.service.ts
 - backend/src/modules/ai-risk/services/assessors/hypertension-risk.assessor.ts
 - backend/src/providers/observability/observability.module.ts
 - backend/src/modules/dashboard/dashboard.service.ts
 - backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts
 - backend/src/modules/consent/consent.controller.ts
 - backend/src/modules/prescription/prescription.module.ts
 *
 * Calls:
 - razorpay
 - common
 - node:crypto
 *
 * Dependencies:
 - razorpay
 - common
 - node:crypto
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

import { createHmac } from 'node:crypto';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private client: Razorpay | null = null;
  private initialized = false;
  private readonly logger = new Logger(RazorpayService.name);

  private getClient(): Razorpay {
    if (this.client) return this.client;

    if (this.initialized) {
      // Initialization was attempted before and failed
      throw new ServiceUnavailableException('Payment provider not configured');
    }
    this.initialized = true;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
      this.logger.log('Razorpay client initialized successfully.');
      return this.client;
    }

    this.logger.warn('Razorpay credentials are not configured. Payment provider will be disabled.');
    throw new ServiceUnavailableException('Payment provider not configured');
  }

  createOrder(amount: number, receipt: string) {
    return this.getClient().orders.create({ amount, currency: 'INR', receipt, payment_capture: true });
  }

  createRefund(paymentId: string, amount?: number) {
    return this.getClient().payments.refund(paymentId, amount ? { amount } : {});
  }

  verifyWebhookSignature(rawBody: Buffer | string, signature?: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? process.env.RAZORPAY_KEY_SECRET;
    if (!signature || !webhookSecret) return false;

    const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    return signature === expected;
  }
}
