/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph-v2/family-history.service.ts
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
 * - Execute business logic for family operations
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
 - common
 - crypto
 *
 * Dependencies:
 - common
 - crypto
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import type { AddFamilyHistoryDto } from './dto/health-graph.dto';

import { randomUUID } from 'crypto';

@Injectable()
export class FamilyHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.familyHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, dto: AddFamilyHistoryDto) {
    return this.prisma.familyHistory.create({
      data: {
        id: randomUUID(),
        userId,
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    const entry = await this.prisma.familyHistory.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Family history entry not found');
    return this.prisma.familyHistory.delete({ where: { id } });
  }

  async getStats() {
    const entries = await this.prisma.familyHistory.findMany({
      select: { condition: true, relation: true },
    });

    const conditionDist: Record<string, number> = {};
    for (const e of entries) {
      conditionDist[e.condition] = (conditionDist[e.condition] ?? 0) + 1;
    }

    return { totalEntries: entries.length, conditionDistribution: conditionDist };
  }
}
