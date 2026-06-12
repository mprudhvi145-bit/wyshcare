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

import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { AuditLogService } from '../../common/services/audit-log.service';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
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

    const credential = await this.prisma.adminCredential.findUnique({ where: { userId: user.id } });
    if (!credential) {
      throw new UnauthorizedException('Admin account not configured');
    }

    const passwordValid = await argon2.verify(credential.passwordHash, password);
    if (!passwordValid) {
      await this.auditLogService.capture({
        actorUserId: user.id,
        patientUserId: user.id,
        action: 'ADMIN_LOGIN_FAILED',
        resourceType: 'AUTH',
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role),
      tenantId: user.tenantId ?? undefined,
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
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles.map((r) => r.role),
      },
    };
  }

  async setupMfa(userId: string, _password: string) {
    this.logger.log(`MFA setup requested for admin ${userId}`);

    return {
      mfaAvailable: true,
      message: 'MFA setup is not yet implemented. A TOTP secret and QR code URI will be returned here.',
    };
  }

  async verifyMfa(_userId: string, _totpCode: string) {
    return {
      verified: false,
      message: 'MFA verification is not yet implemented.',
    };
  }

  async disableMfa(userId: string, _password: string) {
    this.logger.log(`MFA disable requested for admin ${userId}`);

    return {
      disabled: true,
      message: 'MFA disable stub — no action taken as MFA is not yet implemented.',
    };
  }
}
