import { randomBytes, createHash } from 'node:crypto';
import { ForbiddenException, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@wyshcare/shared';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { RedisService } from '../../providers/redis/redis.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { SupabaseService } from '../../providers/supabase/supabase.service';
import { SmsService } from './sms.service';
import { WyshIdService } from '../../common/services/wysh-id.service';
import { MfaService } from './mfa.service';

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
    private readonly redisService: RedisService,
    private readonly mfaService: MfaService,
    private readonly supabase: SupabaseService,
  ) {}

  async requestOtp(phoneNumber: string, purpose: string) {
    const user = await this.prisma.user.findUnique({ where: { phoneNumber } });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked due to too many failed attempts');
    }

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

    if (this.supabase.isAvailable()) {
      const result = await this.supabase.sendOtp(phoneNumber);
      if (!result.success) {
        throw new HttpException('Failed to send OTP', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
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
          const maskedPhone = phoneNumber.length > 4 ? phoneNumber.slice(0, 2) + '****' + phoneNumber.slice(-2) : '****';
this.logger.error(`SMS delivery failed for ${maskedPhone}: ${(err as Error).message}`);
        }
      }

      return {
        challengeIssued: true,
        otpPreview: process.env.NODE_ENV === 'production' ? undefined : otp,
      };
    }

    await this.auditLogService.capture({
      action: 'OTP_REQUESTED',
      resourceType: 'AUTH',
      reason: purpose,
      metadata: { phoneNumber },
    });

    return { challengeIssued: true };
  }

  async verifyOtp(phoneNumber: string, otpCode: string, deviceName: string, fullName?: string) {
    if (!this.supabase.isAvailable()) {
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

      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { verifiedAt: new Date(), attemptCount: { increment: 1 } },
      });
    } else {
      const result = await this.supabase.verifyOtp(phoneNumber, otpCode);
      if (!result.success) {
        throw new UnauthorizedException(result.error ?? 'Invalid or expired OTP');
      }
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

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked due to too many failed attempts');
    }

    await this.clearFailedAttempts(user.id);

    const mfaRequired = user.mfaEnabled;

    const session = await this.prisma.deviceSession.create({
      data: {
        userId: user.id,
        deviceName,
        deviceFingerprint: createHash('sha256').update(deviceName + phoneNumber).digest('hex'),
        ipAddress: '0.0.0.0',
        userAgent: 'unknown',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
        mfaVerified: !mfaRequired,
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
      mfaVerified: !mfaRequired,
    });

    await this.auditLogService.capture({
      actorUserId: user.id,
      patientUserId: user.id,
      action: 'OTP_VERIFIED',
      resourceType: 'AUTH',
      resourceId: session.id,
      metadata: { deviceName },
    });

    return { ...authSession, mfaRequired };
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

    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        OR: tokenFilters.length ? tokenFilters : undefined,
      },
    });

    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        OR: tokenFilters.length ? tokenFilters : undefined,
      },
      data: { revokedAt: new Date() },
    });

    for (const token of tokens) {
      const blacklistTtl = Math.max(0, Math.floor((token.expiresAt.getTime() - Date.now()) / 1000));
      if (blacklistTtl > 0) {
        const client = this.redisService.getClient();
        if (client) {
          const jti = `logout:${token.id}`;
          await client.set(`blacklist:${jti}`, 'true', 'EX', blacklistTtl).catch(() => {});
        }
      }
    }

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
      mfaEnabled: user.mfaEnabled,
    };
  }

  async setupUserMfa(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const { secret, otpauthUrl } = this.mfaService.generateSecret(user.phoneNumber);
    const { hashed, plain } = this.mfaService.generateBackupCodes();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret,
        mfaEnabled: false,
        mfaBackupCodes: JSON.stringify(hashed),
      },
    });

    const qrCode = await this.mfaService.generateQrCodeDataUrl(otpauthUrl);

    await this.auditLogService.capture({
      actorUserId: userId,
      action: 'MFA_SETUP',
      resourceType: 'AUTH',
    });

    return { secret, qrCode, backupCodes: plain };
  }

  async verifyUserMfa(userId: string, totpCode: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!user.mfaSecret) {
      throw new UnauthorizedException('MFA not configured');
    }

    const valid = this.mfaService.verifyToken(user.mfaSecret, totpCode);
    if (!valid && user.mfaBackupCodes) {
      const usedHash = this.mfaService.verifyBackupCode(totpCode, user.mfaBackupCodes);
      if (usedHash) {
        const remaining = this.mfaService.removeUsedBackupCode(usedHash, user.mfaBackupCodes);
        await this.prisma.user.update({
          where: { id: userId },
          data: { mfaBackupCodes: remaining, mfaEnabled: true },
        });

        await this.auditLogService.capture({
          actorUserId: userId,
          action: 'MFA_VERIFIED_BACKUP',
          resourceType: 'AUTH',
        });

        return { verified: true, backupUsed: true, remainingCodes: JSON.parse(remaining).length };
      }
    }

    if (!valid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    await this.auditLogService.capture({
      actorUserId: userId,
      action: 'MFA_ENABLED',
      resourceType: 'AUTH',
    });

    return { verified: true, backupUsed: false };
  }

  async disableUserMfa(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: null, mfaEnabled: false, mfaBackupCodes: null },
    });

    await this.auditLogService.capture({
      actorUserId: userId,
      action: 'MFA_DISABLED',
      resourceType: 'AUTH',
    });

    return { disabled: true };
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
        mfaVerified: true,
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
    mfaVerified?: boolean;
  }): Promise<ActiveSession> {
    const jti = randomBytes(16).toString('hex');
    const accessToken = await this.jwtService.signAsync({
      sub: input.userId,
      phoneNumber: input.phoneNumber,
      roles: input.roles,
      sessionId: input.sessionId,
      tenantId: input.tenantId,
      mfaVerified: input.mfaVerified ?? false,
      jti,
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

  private async clearFailedAttempts(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }
}
