/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph-v2/symptom.service.ts
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import type { RecordSymptomDto } from './dto/health-graph.dto';

@Injectable()
export class SymptomService {
  constructor(private readonly prisma: PrismaService) {}

  async record(userId: string, dto: RecordSymptomDto) {
    return this.prisma.symptomEvent.create({
      data: {
        id: randomUUID(),
        userId,
        symptom: dto.symptom,
        severity: dto.severity,
        duration: dto.duration,
        bodyPart: dto.bodyPart,
        triggers: dto.triggers ?? [],
        notes: dto.notes,
      },
    });
  }

  async list(userId: string, days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    return this.prisma.symptomEvent.findMany({
      where: { userId, reportedAt: { gte: since } },
      orderBy: { reportedAt: 'desc' },
    });
  }

  async resolve(id: string) {
    const event = await this.prisma.symptomEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Symptom event not found');
    return this.prisma.symptomEvent.update({ where: { id }, data: { resolvedAt: new Date() } });
  }

  async getFrequent(userId: string) {
    const events = await this.prisma.symptomEvent.findMany({
      where: { userId },
      select: { symptom: true, severity: true },
    });

    const freq: Record<string, { count: number; avgSeverity: number }> = {};
    for (const e of events) {
      const key = e.symptom;
      if (!freq[key]) freq[key] = { count: 0, avgSeverity: 0 };
      freq[key].count++;
      freq[key].avgSeverity += e.severity ?? 0;
    }
    for (const [, item] of Object.entries(freq)) {
      item.avgSeverity = +(item.avgSeverity / item.count).toFixed(1);
    }

    return Object.entries(freq)
      .map(([symptom, data]) => ({ symptom, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  async getStats() {
    const [total, topSymptoms] = await Promise.all([
      this.prisma.symptomEvent.count(),
      this.prisma.symptomEvent.groupBy({ by: ['symptom'], _count: true, orderBy: { _count: { symptom: 'desc' } }, take: 10 }),
    ]);
    return { total, topSymptoms: topSymptoms.map((s) => ({ symptom: s.symptom, count: s._count })) };
  }
}
