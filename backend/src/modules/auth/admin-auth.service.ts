/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/auth/admin-auth.service.ts
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
 - argon2
 - jwt
 - common
 *
 * Dependencies:
 - argon2
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

import { ConflictException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { AuditLogService } from '../../common/services/audit-log.service';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { MfaService } from './mfa.service';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
    private readonly mfaService: MfaService,
  ) {}

  async createCredential(email: string, password: string, userId?: string) {
    const existing = await this.prisma.adminCredential.findUnique({ where: { userId: userId ?? '' } });
    if (existing) {
      throw new ConflictException('Admin credential already exists for this user');
    }

    const passwordHash = await argon2.hash(password);

    return this.prisma.adminCredential.create({
      data: {
        userId: userId ?? email,
        passwordHash,
      },
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: { roles: true } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked due to too many failed attempts');
    }

    const credential = await this.prisma.adminCredential.findUnique({ where: { userId: user.id } });
    if (!credential) {
      throw new UnauthorizedException('Admin account not configured');
    }

    const passwordValid = await argon2.verify(credential.passwordHash, password);
    if (!passwordValid) {
      await this.recordFailedAttempt(user.id);
      await this.auditLogService.capture({
        actorUserId: user.id,
        patientUserId: user.id,
        action: 'ADMIN_LOGIN_FAILED',
        resourceType: 'AUTH',
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.clearFailedAttempts(user.id);

    const requiresMfa = credential.mfaEnabled;
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role),
      tenantId: user.tenantId ?? undefined,
      mfaRequired: requiresMfa,
      mfaVerified: false,
    });

    await this.auditLogService.capture({
      actorUserId: user.id,
      patientUserId: user.id,
      action: 'ADMIN_LOGIN_SUCCESS',
      resourceType: 'AUTH',
    });

    return {
      accessToken,
      expiresIn: 15 * 60,
      requiresMfa,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles.map((r) => r.role),
      },
    };
  }

  async verifyMfaStep(userId: string, totpCode: string) {
    const credential = await this.prisma.adminCredential.findUnique({ where: { userId } });
    if (!credential?.mfaSecret) {
      throw new UnauthorizedException('MFA not configured');
    }

    const valid = this.mfaService.verifyToken(credential.mfaSecret, totpCode);
    if (!valid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { roles: true } });
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role),
      tenantId: user.tenantId ?? undefined,
      mfaVerified: true,
    });

    await this.auditLogService.capture({
      actorUserId: userId,
      action: 'MFA_VERIFIED',
      resourceType: 'AUTH',
    });

    return {
      accessToken,
      expiresIn: 15 * 60,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles.map((r) => r.role),
      },
    };
  }

  async setupMfa(userId: string, password: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const credential = await this.prisma.adminCredential.findUnique({ where: { userId } });

    if (!credential) {
      throw new UnauthorizedException('Admin account not configured');
    }

    const passwordValid = await argon2.verify(credential.passwordHash, password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { secret, otpauthUrl } = this.mfaService.generateSecret(user.email ?? user.phoneNumber);
    const { hashed, plain } = this.mfaService.generateBackupCodes();

    await this.prisma.adminCredential.update({
      where: { userId },
      data: {
        mfaSecret: secret,
        mfaEnabled: false,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaBackupCodes: JSON.stringify(hashed) },
    });

    const qrCode = await this.mfaService.generateQrCodeDataUrl(otpauthUrl);

    await this.auditLogService.capture({
      actorUserId: userId,
      action: 'MFA_SETUP',
      resourceType: 'AUTH',
    });

    return {
      secret,
      qrCode,
      backupCodes: plain,
      message: 'Scan the QR code with your authenticator app and verify a code to enable MFA.',
    };
  }

  async verifyMfa(userId: string, totpCode: string) {
    const credential = await this.prisma.adminCredential.findUnique({ where: { userId } });
    if (!credential?.mfaSecret) {
      throw new UnauthorizedException('MFA not configured');
    }

    const valid = this.mfaService.verifyToken(credential.mfaSecret, totpCode);
    if (!valid) {
      throw new UnauthorizedException('Invalid MFA code. Ensure your authenticator app is synchronized.');
    }

    await this.prisma.adminCredential.update({
      where: { userId },
      data: { mfaEnabled: true },
    });

    await this.auditLogService.capture({
      actorUserId: userId,
      action: 'MFA_ENABLED',
      resourceType: 'AUTH',
    });

    return { enabled: true };
  }

  async disableMfa(userId: string, password: string) {
    const credential = await this.prisma.adminCredential.findUnique({ where: { userId } });

    if (!credential) {
      throw new UnauthorizedException('Admin account not configured');
    }

    const passwordValid = await argon2.verify(credential.passwordHash, password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.prisma.adminCredential.update({
      where: { userId },
      data: { mfaSecret: null, mfaEnabled: false },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaBackupCodes: null },
    });

    await this.auditLogService.capture({
      actorUserId: userId,
      action: 'MFA_DISABLED',
      resourceType: 'AUTH',
    });

    return { disabled: true };
  }

  private async recordFailedAttempt(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
    });

    if (user.failedLoginAttempts >= 10) {
      const lockoutMinutes = Math.min(30 * Math.pow(2, Math.floor(user.failedLoginAttempts / 10) - 1), 480);
      await this.prisma.user.update({
        where: { id: userId },
        data: { lockedUntil: new Date(Date.now() + lockoutMinutes * 60_000) },
      });

      await this.auditLogService.capture({
        actorUserId: userId,
        action: 'AUTH_LOCKOUT_TRIGGERED',
        resourceType: 'AUTH',
        metadata: { failedAttempts: user.failedLoginAttempts, lockoutMinutes },
      });
    }
  }

  private async clearFailedAttempts(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }
}
