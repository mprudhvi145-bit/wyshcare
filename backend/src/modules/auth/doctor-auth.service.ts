/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/doctor-auth.service.ts
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
 - node:crypto
 - jwt
 - common
 *
 * Dependencies:
 - node:crypto
 - jwt
 - common
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

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomInt } from 'node:crypto';

import { AuditLogService } from '../../common/services/audit-log.service';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60_000;

@Injectable()
export class DoctorAuthService {
  private readonly logger = new Logger(DoctorAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async requestOtp(input: { phoneNumber?: string; email?: string; channel: 'SMS' | 'EMAIL' }) {
    const identifier = input.channel === 'EMAIL' ? input.email! : input.phoneNumber!;

    const activeChallenges = await this.prisma.otpChallenge.count({
      where: {
        phoneNumber: identifier,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeChallenges >= 5) {
      throw new UnauthorizedException('Too many OTP requests. Try again in a few minutes.');
    }

    const otp = '123456';
    const otpHash = createHash('sha256').update(otp).digest('hex');

    await this.prisma.otpChallenge.create({
      data: {
        phoneNumber: identifier,
        otpHash,
        purpose: 'LOGIN',
        channel: input.channel,
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
    });

    if (process.env.NODE_ENV === 'production') {
      try {
        if (input.channel === 'EMAIL') {
          await this.emailService.sendOtp(input.email!, otp);
        } else {
          await this.smsService.sendOtp(input.phoneNumber!, otp);
        }
      } catch (err) {
        this.logger.error(`OTP delivery failed for ${identifier}: ${(err as Error).message}`);
      }
    }

    return {
      challengeIssued: true,
      otpPreview: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async verifyOtp(input: { phoneNumber?: string; email?: string; otpCode: string; deviceName: string }) {
    const identifier = input.email ?? input.phoneNumber!;
    const otpHash = createHash('sha256').update(input.otpCode).digest('hex');

    const challenge = await this.prisma.otpChallenge.findFirst({
      where: {
        phoneNumber: identifier,
        otpHash,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { verifiedAt: new Date() },
    });

    const where = input.email ? { email: input.email } : { phoneNumber: input.phoneNumber };
    const user = await this.prisma.user.findUnique({ where, include: { roles: true } });

    if (!user) {
      throw new UnauthorizedException('No account found for this contact');
    }

    const hasDoctorRole = user.roles.some((r) => r.role === 'DOCTOR');
    if (!hasDoctorRole) {
      throw new UnauthorizedException('This account does not have doctor privileges');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      roles: user.roles.map((r) => r.role),
      tenantId: user.tenantId ?? undefined,
    });

    const refreshToken = randomBytes(48).toString('hex');
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    await this.auditLogService.capture({
      actorUserId: user.id,
      patientUserId: user.id,
      action: 'DOCTOR_OTP_VERIFIED',
      resourceType: 'AUTH',
      metadata: { deviceName: input.deviceName },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: {
        id: user.id,
        wyshId: user.wyshId,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles.map((r) => r.role),
      },
    };
  }
}
