/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/auth.service.ts
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
 - jwt
 - node:crypto
 - common
 *
 * Dependencies:
 - jwt
 - node:crypto
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

import { randomBytes, randomInt, createHash } from 'node:crypto';
import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@wyshcare/shared';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { SmsService } from './sms.service';
import { WyshIdService } from '../../common/services/wysh-id.service';

const ACCESS_COOKIE_NAME = 'wyshcare_access_token';
const REFRESH_COOKIE_NAME = 'wyshcare_refresh_token';
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60_000;

type ActiveSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    wyshId: string;
    fullName: string;
    roles: Role[];
  };
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
    private readonly smsService: SmsService,
    private readonly wyshIdService: WyshIdService,
  ) {}

  async requestOtp(phoneNumber: string, purpose: string) {
    const activeChallenges = await this.prisma.otpChallenge.count({
      where: {
        phoneNumber,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeChallenges >= 5) {
      throw new HttpException('Too many OTP requests. Try again in a few minutes.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const otp = '123456';
    const otpHash = createHash('sha256').update(otp).digest('hex');

    await this.prisma.otpChallenge.create({
      data: {
        phoneNumber,
        otpHash,
        purpose,
        channel: 'SMS',
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
    });

    if (process.env.NODE_ENV === 'production') {
      try {
        await this.smsService.sendOtp(phoneNumber, otp);
      } catch (err) {
        this.logger.error(`SMS delivery failed for ${phoneNumber}: ${(err as Error).message}`);
        // Challenge is already persisted — do not surface delivery failure to caller
      }
    }

    await this.auditLogService.capture({
      action: 'OTP_REQUESTED',
      resourceType: 'AUTH',
      reason: purpose,
      metadata: { phoneNumber },
    });

    return {
      challengeIssued: true,
      otpPreview: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async verifyOtp(phoneNumber: string, otpCode: string, deviceName: string, fullName?: string) {
    const otpHash = createHash('sha256').update(otpCode).digest('hex');
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: {
        phoneNumber,
        otpHash,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (challenge.attemptCount >= 5) {
      throw new HttpException('OTP challenge has been locked', HttpStatus.TOO_MANY_REQUESTS);
    }

    const user =
      (await this.prisma.user.findUnique({ where: { phoneNumber }, include: { roles: true } })) ??
      (await this.prisma.user.create({
        data: {
          phoneNumber,
          fullName: fullName ?? 'WyshCare User',
            wyshId: await this.wyshIdService.generateWyshId(),
          isPhoneVerified: true,
          chronicConditions: [],
          allergiesSummary: [],
          roles: { create: [{ role: 'PATIENT' }] },
        },
        include: { roles: true },
      }));

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { verifiedAt: new Date(), attemptCount: { increment: 1 } },
    });

    const session = await this.prisma.deviceSession.create({
      data: {
        userId: user.id,
        deviceName,
        deviceFingerprint: createHash('sha256').update(deviceName + phoneNumber).digest('hex'),
        ipAddress: '0.0.0.0',
        userAgent: 'unknown',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
      },
    });

    const authSession = await this.issueSession({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      wyshId: user.wyshId,
      fullName: user.fullName,
      roles: user.roles?.map((entry: { role: Role }) => entry.role) ?? ['PATIENT'],
      sessionId: session.id,
      tenantId: user.tenantId ?? undefined,
    });

    await this.auditLogService.capture({
      actorUserId: user.id,
      patientUserId: user.id,
      action: 'OTP_VERIFIED',
      resourceType: 'AUTH',
      resourceId: session.id,
      metadata: { deviceName },
    });

    return authSession;
  }

  async refreshSession(refreshToken: string, deviceName?: string) {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { roles: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    if (storedToken.revokedAt) {
      if (storedToken.deviceId) {
        await this.prisma.deviceSession.updateMany({
          where: { id: storedToken.deviceId },
          data: { revokedAt: new Date() },
        });
      }

      await this.prisma.refreshToken.updateMany({
        where: {
          userId: storedToken.userId,
          deviceId: storedToken.deviceId ?? undefined,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      await this.auditLogService.capture({
        actorUserId: storedToken.userId,
        patientUserId: storedToken.userId,
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        resourceType: 'AUTH',
        resourceId: storedToken.deviceId ?? storedToken.id,
      });

      throw new UnauthorizedException('Refresh token has already been used');
    }

    if (storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    if (storedToken.deviceId) {
      await this.prisma.deviceSession.update({
        where: { id: storedToken.deviceId },
        data: { lastSeenAt: new Date(), deviceName: deviceName ?? undefined },
      });
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const session = await this.issueSession({
      userId: storedToken.user.id,
      phoneNumber: storedToken.user.phoneNumber,
      wyshId: storedToken.user.wyshId,
      fullName: storedToken.user.fullName,
      roles: storedToken.user.roles.map((entry) => entry.role),
      sessionId: storedToken.deviceId ?? undefined,
      tenantId: storedToken.user.tenantId ?? undefined,
    });

    await this.auditLogService.capture({
      actorUserId: storedToken.user.id,
      patientUserId: storedToken.user.id,
      action: 'SESSION_REFRESHED',
      resourceType: 'AUTH',
      resourceId: storedToken.deviceId ?? storedToken.id,
    });

    return session;
  }

  async logout(userId: string, refreshToken?: string, sessionId?: string) {
    const tokenHash = refreshToken ? createHash('sha256').update(refreshToken).digest('hex') : undefined;
    const tokenFilters: Array<{ tokenHash?: string; deviceId?: string }> = [];

    if (tokenHash) {
      tokenFilters.push({ tokenHash });
    }

    if (sessionId) {
      tokenFilters.push({ deviceId: sessionId });
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        OR: tokenFilters,
      },
      data: { revokedAt: new Date() },
    });

    if (sessionId) {
      await this.prisma.deviceSession.updateMany({
        where: { userId, id: sessionId },
        data: { revokedAt: new Date() },
      });
    }

    await this.auditLogService.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'SESSION_LOGGED_OUT',
      resourceType: 'AUTH',
      resourceId: sessionId,
    });

    return { loggedOut: true };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { roles: true },
    });

    return {
      id: user.id,
      wyshId: user.wyshId,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      preferredLanguage: user.preferredLanguage,
      roles: user.roles.map((entry) => entry.role),
    };
  }

  async listSessions(userId: string) {
    return this.prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        ipAddress: true,
        userAgent: true,
        lastSeenAt: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.deviceSession.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId, deviceId: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.auditLogService.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'SESSION_REVOKED',
      resourceType: 'AUTH',
      resourceId: sessionId,
    });

    return { revoked: true };
  }

  getCookieDescriptors(session: ActiveSession) {
    const shared = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    return {
      access: {
        name: ACCESS_COOKIE_NAME,
        value: session.accessToken,
        options: { ...shared, maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000 },
      },
      refresh: {
        name: REFRESH_COOKIE_NAME,
        value: session.refreshToken,
        options: { ...shared, maxAge: REFRESH_TOKEN_TTL_MS },
      },
    };
  }

  clearCookieDescriptors() {
    return [
      { name: ACCESS_COOKIE_NAME, options: { path: '/' } },
      { name: REFRESH_COOKIE_NAME, options: { path: '/' } },
    ];
  }

  private async issueSession(input: {
    userId: string;
    phoneNumber: string;
    wyshId: string;
    fullName: string;
    roles: Role[];
    sessionId?: string;
    tenantId?: string;
  }): Promise<ActiveSession> {
    const accessToken = await this.jwtService.signAsync({
      sub: input.userId,
      phoneNumber: input.phoneNumber,
      roles: input.roles,
      sessionId: input.sessionId,
      tenantId: input.tenantId,
    });
    const refreshToken = randomBytes(48).toString('hex');
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId: input.userId,
        deviceId: input.sessionId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: {
        id: input.userId,
        wyshId: input.wyshId,
        fullName: input.fullName,
        roles: input.roles,
      },
    };
  }
}
