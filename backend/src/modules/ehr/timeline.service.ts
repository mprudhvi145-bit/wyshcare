/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ehr/timeline.service.ts
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
 * Business logic service for ehr
 *
 * Responsibilities:
 * - Execute business logic for ehr operations
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
EHR
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
import { Prisma, TimelineEventType } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';
import type { TimelineQueryDto } from './dto/ehr.dto';

@Injectable()
export class EhrTimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getTimeline(query: TimelineQueryDto) {
    const where: Prisma.TimelineEventWhereInput = {};
    if (query.patientId) where.userId = query.patientId;
    if (query.types) where.type = { in: query.types.split(',') as TimelineEventType[] };
    if (query.startDate) {
      const existing = where.createdAt as Prisma.TimelineEventWhereInput['createdAt'];
      where.createdAt = { ...(typeof existing === 'object' && existing !== null ? existing : {}), gte: new Date(query.startDate) };
    }
    if (query.endDate) {
      const existing = where.createdAt as Prisma.TimelineEventWhereInput['createdAt'];
      where.createdAt = { ...(typeof existing === 'object' && existing !== null ? existing : {}), lte: new Date(query.endDate) };
    }

    const limit = query.limit ? Math.min(parseInt(query.limit, 10), 100) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    const [events, total] = await Promise.all([
      this.prisma.timelineEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.timelineEvent.count({ where }),
    ]);

    return { events, total, limit, offset };
  }

  async getPatientTimeline(patientId: string) {
    const events = await this.prisma.timelineEvent.findMany({
      where: { userId: patientId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return events;
  }
}
