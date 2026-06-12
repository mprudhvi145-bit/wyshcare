/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph-v2/wearables.service.ts
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
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';
import type { SyncWearableDto } from './dto/health-graph.dto';

@Injectable()
export class WearablesService {
  constructor(private readonly prisma: PrismaService) {}

  async sync(userId: string, dto: SyncWearableDto) {
    const created = await this.prisma.wearableMetric.createMany({
      data: dto.metrics.map((m) => ({
        id: randomUUID(),
        userId,
        source: dto.source,
        metricType: m.metricType,
        value: m.value,
        unit: m.unit,
        recordedAt: new Date(m.recordedAt),
        metadata: m.metadata as Prisma.InputJsonValue,
      })),
    });

    return { synced: created.count, source: dto.source };
  }

  async getMetrics(userId: string, metricType: string, days = 7) {
    const since = new Date(Date.now() - days * 86400000);
    return this.prisma.wearableMetric.findMany({
      where: { userId, metricType, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
    });
  }

  async getLatestMetrics(userId: string) {
    const types = ['HEART_RATE', 'STEPS', 'SLEEP', 'SPO2', 'WEIGHT', 'BLOOD_PRESSURE', 'GLUCOSE'];
    const results: Record<string, unknown> = {};

    for (const t of types) {
      const latest = await this.prisma.wearableMetric.findFirst({
        where: { userId, metricType: t },
        orderBy: { recordedAt: 'desc' },
      });
      if (latest) results[t] = { value: latest.value, unit: latest.unit, recordedAt: latest.recordedAt, source: latest.source };
    }

    return results;
  }

  async getStats() {
    const [total, sourceDist] = await Promise.all([
      this.prisma.wearableMetric.count(),
      this.prisma.wearableMetric.groupBy({ by: ['source'], _count: true }),
    ]);
    return { total, bySource: sourceDist.map((s) => ({ source: s.source, count: s._count })) };
  }
}
