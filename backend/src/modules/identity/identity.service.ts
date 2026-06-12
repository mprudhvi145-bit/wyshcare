/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/identity/identity.service.ts
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
 * Business logic service for identity
 *
 * Responsibilities:
 * - Execute business logic for identity operations
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
 - qrcode
 - common
 *
 * Dependencies:
 - qrcode
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Identity
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

import { Injectable } from '@nestjs/common';
import QRCode from 'qrcode';

import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        relatedTo: true,
        providerProfile: true,
        doctorProfile: true,
      },
    });
  }

  async generateQr(userId: string, emergency = false) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const payload = emergency
      ? {
          wyshId: user.wyshId,
          bloodGroup: user.bloodGroup,
          chronicConditions: user.chronicConditions,
          allergiesSummary: user.allergiesSummary,
        }
      : { wyshId: user.wyshId, phoneNumber: user.phoneNumber };

    return {
      payload,
      qrDataUrl: await QRCode.toDataURL(JSON.stringify(payload)),
    };
  }

  async getDashboard(userId: string) {
    const [profile, timeline, consents, careTeam] = await Promise.all([
      this.getProfile(userId),
      this.prisma.timelineEvent.findMany({
        where: { userId },
        orderBy: { occurredAt: 'desc' },
        take: 8,
      }),
      this.prisma.consentGrant.findMany({
        where: {
          ownerUserId: userId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
        include: {
          grantedToUser: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.doctorProfile.findMany({
        where: { approvalStatus: 'VERIFIED' },
        include: { user: true, clinicMappings: { include: { clinic: true }, take: 1 } },
        take: 4,
      }),
    ]);

    return {
      profile,
      timeline,
      activeConsents: consents.map((consent) => ({
        ...consent,
        grantedToName: consent.grantedToUser?.fullName ?? 'Shared access',
      })),
      careTeam: careTeam.map((doctor) => ({
        id: doctor.id,
        fullName: doctor.user.fullName,
        specialization: doctor.specialization,
        languages: doctor.languages,
        yearsOfExperience: doctor.yearsOfExperience,
        consultationFee: doctor.consultationFee,
        telemedicineAvailable: doctor.telemedicineEnabled,
        clinicName: doctor.clinicMappings[0]?.clinic.name,
        rating: doctor.averageRating,
      })),
      alerts: [
        ...(profile?.chronicConditions?.length
          ? [
              {
                id: 'chronic-care',
                title: 'Chronic care profile active',
                description: `${profile.chronicConditions.join(', ')} tracked in your WyshVault timeline.`,
                severity: 'MEDIUM',
              },
            ]
          : []),
        ...(timeline.length === 0
          ? [
              {
                id: 'empty-vault',
                title: 'Add your first health record',
                description: 'Upload a prescription, report, or consultation note to initialize longitudinal memory.',
                severity: 'LOW',
              },
            ]
          : []),
      ],
    };
  }
}
