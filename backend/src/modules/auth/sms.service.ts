/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/sms.service.ts
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
 * Business logic service for auth
 *
 * Responsibilities:
 * - Execute business logic for authentication operations
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
 - common
 - node:https
 *
 * Dependencies:
 - common
 - node:https
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Authentication
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

import { request as httpsRequest } from 'node:https';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Minimal SMS delivery service.
 * Controlled by SMS_PROVIDER env var: 'twilio' | 'msg91' | unset (log-only).
 * No external SDK dependency — uses native https.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly provider = process.env.SMS_PROVIDER ?? '';

  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    const message = `Your WyshCare OTP is ${otp}. Valid for 10 minutes. Do not share it with anyone.`;

    switch (this.provider) {
      case 'twilio':
        await this.sendViaTwilio(phoneNumber, message);
        break;
      case 'msg91':
        await this.sendViaMSG91(phoneNumber, otp);
        break;
      default:
        // Development / unconfigured: log OTP instead of sending
        this.logger.warn(`[SMS_PROVIDER not set] OTP for ${phoneNumber}: ${otp}`);
    }
  }

  private sendViaTwilio(to: string, body: string): Promise<void> {
    const sid = process.env.TWILIO_ACCOUNT_SID ?? '';
    const token = process.env.TWILIO_AUTH_TOKEN ?? '';
    const from = process.env.TWILIO_FROM_NUMBER ?? '';
    const payload = new URLSearchParams({ To: to, From: from, Body: body }).toString();

    return new Promise((resolve, reject) => {
      const req = httpsRequest(
        {
          hostname: 'api.twilio.com',
          path: `/2010-04-01/Accounts/${sid}/Messages.json`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(payload),
            Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          },
        },
        (res) => {
          res.resume();
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Twilio responded with HTTP ${res.statusCode}`));
          } else {
            resolve();
          }
        },
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  private sendViaMSG91(to: string, otp: string): Promise<void> {
    const authKey = process.env.MSG91_AUTH_KEY ?? '';
    const templateId = process.env.MSG91_TEMPLATE_ID ?? '';
    // MSG91 expects mobile without leading +
    const mobile = to.replace(/^\+/, '');
    const payload = JSON.stringify({ template_id: templateId, mobile, authkey: authKey, otp });

    return new Promise((resolve, reject) => {
      const req = httpsRequest(
        {
          hostname: 'api.msg91.com',
          path: '/api/v5/otp',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          res.resume();
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`MSG91 responded with HTTP ${res.statusCode}`));
          } else {
            resolve();
          }
        },
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
}
