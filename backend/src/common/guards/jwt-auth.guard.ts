/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/guards/jwt-auth.guard.ts
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
 * NestJS guard: enforces authentication/authorization on routes
 *
 * Responsibilities:
 * - Enforce authorization rules on protected routes
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
 - core
 - jwt
 - common
 *
 * Dependencies:
 - core
 - jwt
 - common
 *
 * Security Notes:
Enforces access control on guarded routes
 *
 * Business Domain:
Security
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

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      headers: Record<string, string | undefined>;
      cookies?: Record<string, string | undefined>;
    }>();
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const cookieToken = request.cookies?.wyshcare_access_token;
    const accessToken = bearerToken ?? cookieToken;

    if (!accessToken) {
      throw new UnauthorizedException('Missing authenticated session');
    }

    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      phoneNumber: string;
      roles: AuthenticatedUser['roles'];
      sessionId?: string;
      tenantId?: string;
    }>(accessToken);

    if (payload.sessionId) {
      const session = await this.prisma.deviceSession.findFirst({
        where: {
          id: payload.sessionId,
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new UnauthorizedException('Session has expired');
      }
    }

    request.user = {
      userId: payload.sub,
      phoneNumber: payload.phoneNumber,
      roles: payload.roles,
      sessionId: payload.sessionId,
      tenantId: payload.tenantId,
    };

    return true;
  }
}
