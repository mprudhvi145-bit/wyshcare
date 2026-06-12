/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/consent/consent.service.ts
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
 * Business logic service for consent
 *
 * Responsibilities:
 * - Execute business logic for consent operations
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
 - node:crypto
 - client
 - common
 *
 * Dependencies:
 - node:crypto
 - client
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Consent
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

import { createHash, randomBytes } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { AuditLogService } from '../../common/services/audit-log.service';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class ConsentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  listForUser(userId: string) {
    return this.prisma.consentGrant.findMany({
      where: { ownerUserId: userId },
      include: {
        grantedToUser: {
          select: {
            fullName: true,
            phoneNumber: true,
            wyshId: true,
          },
        },
        shareLinks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, payload: {
    grantedToUserId?: string;
    granteePhoneNumber?: string;
    granteeWyshId?: string;
    accessLevel: 'FULL' | 'LIMITED' | 'EMERGENCY';
    accessMethod: 'MANUAL_APPROVAL' | 'OTP_APPROVAL' | 'SHARE_LINK';
    purpose: string;
    scope: Record<string, unknown>;
    expiresAt: string;
  }) {
    let grantedToUserId = payload.grantedToUserId;

    if (!grantedToUserId && (payload.granteePhoneNumber || payload.granteeWyshId)) {
      const grantedToUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            payload.granteePhoneNumber ? { phoneNumber: payload.granteePhoneNumber } : undefined,
            payload.granteeWyshId ? { wyshId: payload.granteeWyshId } : undefined,
          ].filter(Boolean) as Prisma.UserWhereInput[],
        },
      });

      if (!grantedToUser) {
        throw new NotFoundException('Grantee user not found');
      }

      grantedToUserId = grantedToUser.id;
    }

    const consent = await this.prisma.consentGrant.create({
      data: {
        ownerUserId: userId,
        grantedToUserId,
        accessLevel: payload.accessLevel,
        accessMethod: payload.accessMethod,
        purpose: payload.purpose,
        expiresAt: new Date(payload.expiresAt),
        status: 'ACTIVE',
        grantedAt: new Date(),
        scope: payload.scope as Prisma.JsonObject,
      },
      include: {
        grantedToUser: {
          select: {
            fullName: true,
          },
        },
      },
    });

    let shareUrl: string | undefined;

    if (payload.accessMethod === 'SHARE_LINK') {
      const rawToken = randomBytes(24).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      await this.prisma.shareLink.create({
        data: {
          ownerUserId: userId,
          consentGrantId: consent.id,
          tokenHash,
          accessLevel: payload.accessLevel,
          expiresAt: new Date(payload.expiresAt),
        },
      });

      shareUrl = `${process.env.SHARE_LINK_BASE_URL ?? 'https://wyshcare.app/share'}/${rawToken}`;
    }

    await this.auditLogService.capture({
      actorUserId: userId,
      patientUserId: userId,
      consentGrantId: consent.id,
      action: 'CONSENT_GRANTED',
      resourceType: 'CONSENT',
      resourceId: consent.id,
    });

    return {
      ...consent,
      grantedToName: consent.grantedToUser?.fullName ?? 'Shared access',
      shareUrl,
    };
  }

  async revoke(userId: string, consentId: string) {
    const consent = await this.prisma.consentGrant.update({
      where: { id: consentId, ownerUserId: userId },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });

    await this.auditLogService.capture({
      actorUserId: userId,
      patientUserId: userId,
      consentGrantId: consent.id,
      action: 'CONSENT_REVOKED',
      resourceType: 'CONSENT',
      resourceId: consent.id,
    });

    return consent;
  }
}
