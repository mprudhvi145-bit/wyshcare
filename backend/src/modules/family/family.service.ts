/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/family/family.service.ts
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
 * Business logic service for family
 *
 * Responsibilities:
 * - Execute business logic for family operations
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
 - client
 - common
 *
 * Dependencies:
 - client
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Family
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
import { RelationshipType } from '@prisma/client';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { WyshIdService } from '../../common/services/wysh-id.service';

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService, private readonly wyshIdService: WyshIdService) {}

  list(userId: string) {
    return this.prisma.familyRelation.findMany({
      where: { actorUserId: userId },
      include: { subject: true },
    });
  }

  async create(
    userId: string,
    payload: {
      phoneNumber: string;
      fullName: string;
      relationship: RelationshipType;
      canViewTimeline?: boolean;
      canBookAppointments?: boolean;
      canOrderMedicines?: boolean;
      canUseEmergency?: boolean;
    },
  ) {
    const subject =
      (await this.prisma.user.findUnique({
        where: { phoneNumber: payload.phoneNumber },
      })) ??
      (await this.prisma.user.create({
        data: {
            wyshId: await this.wyshIdService.generateWyshId(),
          phoneNumber: payload.phoneNumber,
          fullName: payload.fullName,
          chronicConditions: [],
          allergiesSummary: [],
          roles: { create: [{ role: 'PATIENT' }] },
        },
      }));

    return this.prisma.familyRelation.upsert({
      where: {
        actorUserId_subjectUserId_relationship: {
          actorUserId: userId,
          subjectUserId: subject.id,
          relationship: payload.relationship,
        },
      },
      update: {
        canViewTimeline: payload.canViewTimeline ?? true,
        canBookAppointments: payload.canBookAppointments ?? true,
        canOrderMedicines: payload.canOrderMedicines ?? true,
        canUseEmergency: payload.canUseEmergency ?? true,
      },
      create: {
        actorUserId: userId,
        subjectUserId: subject.id,
        relationship: payload.relationship,
        canViewTimeline: payload.canViewTimeline ?? true,
        canBookAppointments: payload.canBookAppointments ?? true,
        canOrderMedicines: payload.canOrderMedicines ?? true,
        canUseEmergency: payload.canUseEmergency ?? true,
      },
      include: { subject: true },
    });
  }
}
