/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/timeline/timeline.service.ts
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
 * Business logic service for timeline
 *
 * Responsibilities:
 * - Execute business logic for timeline operations
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
Timeline
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
import { TimelineEventType } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.timelineEvent.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: 30,
    });
  }

  async createEvent(data: {
    userId: string;
    type: TimelineEventType;
    title: string;
    summary: string;
    occurredAt?: Date;
    metadata?: any;
  }) {
    return this.prisma.timelineEvent.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        summary: data.summary,
        occurredAt: data.occurredAt ?? new Date(),
        metadata: data.metadata,
      },
    });
  }
}
