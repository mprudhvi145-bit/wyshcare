/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph-v2/lifestyle.service.ts
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
 * Business logic service for health-graph-v2
 *
 * Responsibilities:
 * - Execute business logic for health graph operations
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
 - crypto
 *
 * Dependencies:
 - client
 - common
 - crypto
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Health Graph
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
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import type { UpdateLifestyleDto } from './dto/health-graph.dto';

@Injectable()
export class LifestyleService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    let profile = await this.prisma.lifestyleProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await this.prisma.lifestyleProfile.create({
        data: {
          id: randomUUID(),
          userId,
          updatedAt: new Date(),
        },
      });
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateLifestyleDto) {
    const existing = await this.prisma.lifestyleProfile.findUnique({ where: { userId } });
    const data = {
      ...dto,
      metadata: dto.metadata as Prisma.InputJsonValue | undefined,
    };
    if (!existing) {
      return this.prisma.lifestyleProfile.create({
        data: {
          id: randomUUID(),
          userId,
          ...data,
          updatedAt: new Date(),
        },
      });
    }
    return this.prisma.lifestyleProfile.update({ where: { userId }, data });
  }

  async getStats() {
    const profiles = await this.prisma.lifestyleProfile.findMany({
      select: { activityLevel: true, smokingStatus: true, stressLevel: true, dietType: true },
    });

    const activityDist: Record<string, number> = {};
    const smokingDist: Record<string, number> = {};
    const stressDist: Record<string, number> = {};

    for (const p of profiles) {
      if (p.activityLevel) activityDist[p.activityLevel] = (activityDist[p.activityLevel] ?? 0) + 1;
      if (p.smokingStatus) smokingDist[p.smokingStatus] = (smokingDist[p.smokingStatus] ?? 0) + 1;
      if (p.stressLevel) stressDist[p.stressLevel] = (stressDist[p.stressLevel] ?? 0) + 1;
    }

    return { totalProfiles: profiles.length, activityDistribution: activityDist, smokingDistribution: smokingDist, stressDistribution: stressDist };
  }
}
