/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/care-plans/care-plans.service.ts
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
 * Business logic service for care-plans
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
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
WyshID
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
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class CarePlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: {
    type: string; title: string; description?: string; goals: string[];
    interventions?: Record<string, unknown>; startDate: string; endDate?: string;
  }) {
    return this.prisma.carePlan.create({
      data: {
        id: randomUUID(),
        userId,
        type: input.type as 'DIABETES' | 'HYPERTENSION' | 'PREGNANCY' | 'GENERAL',
        title: input.title,
        description: input.description,
        goals: input.goals,
        interventions: (input.interventions ?? {}) as Prisma.JsonObject,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        updatedAt: new Date(),
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.carePlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { CarePlanMilestone: { orderBy: { dueDate: 'asc' } }, _count: { select: { CarePlanLog: true } } },
    });
  }

  async findById(id: string, userId: string) {
    const plan = await this.prisma.carePlan.findFirst({
      where: { id, userId },
      include: {
        CarePlanMilestone: { orderBy: { dueDate: 'asc' } },
        CarePlanLog: { orderBy: { date: 'desc' }, take: 30 },
      },
    });
    if (!plan) throw new NotFoundException('Care plan not found');
    return plan;
  }

  async updateStatus(id: string, userId: string, status: string) {
    const plan = await this.prisma.carePlan.findFirst({ where: { id, userId } });
    if (!plan) throw new NotFoundException('Care plan not found');
    return this.prisma.carePlan.update({
      where: { id },
      data: { status: status as 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' },
    });
  }

  async addMilestone(carePlanId: string, userId: string, input: {
    title: string; description?: string; dueDate: string;
  }) {
    const plan = await this.prisma.carePlan.findFirst({ where: { id: carePlanId, userId } });
    if (!plan) throw new NotFoundException('Care plan not found');
    return this.prisma.carePlanMilestone.create({
      data: {
        id: randomUUID(),
        carePlanId,
        title: input.title,
        description: input.description,
        dueDate: new Date(input.dueDate),
      },
    });
  }

  async completeMilestone(id: string, userId: string) {
    const milestone = await this.prisma.carePlanMilestone.findUnique({
      where: { id },
      include: { CarePlan: true },
    });
    if (!milestone || milestone.CarePlan.userId !== userId) {
      throw new NotFoundException('Milestone not found');
    }
    return this.prisma.carePlanMilestone.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  }

  async logAdherence(carePlanId: string, userId: string, input: {
    status: string; notes?: string; symptoms?: string[]; metrics?: Record<string, unknown>;
  }) {
    const plan = await this.prisma.carePlan.findFirst({ where: { id: carePlanId, userId } });
    if (!plan) throw new NotFoundException('Care plan not found');

    const log = await this.prisma.carePlanLog.create({
      data: {
        id: randomUUID(),
        carePlanId,
        status: input.status as 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'NOT_STARTED',
        notes: input.notes,
        symptoms: input.symptoms ?? [],
        metrics: (input.metrics ?? {}) as Prisma.JsonObject,
      },
    });

    const recentLogs = await this.prisma.carePlanLog.findMany({
      where: { carePlanId },
      orderBy: { date: 'desc' },
      take: 7,
    });

    const onTrackCount = recentLogs.filter((l) => l.status === 'ON_TRACK').length;
    const adherenceScore = Math.round((onTrackCount / Math.max(recentLogs.length, 1)) * 100);

    await this.prisma.carePlan.update({
      where: { id: carePlanId },
      data: {
        adherence: adherenceScore >= 70 ? 'ON_TRACK' : adherenceScore >= 40 ? 'AT_RISK' : 'OFF_TRACK',
        adherenceScore,
      },
    });

    return log;
  }

  async getAdherenceHistory(carePlanId: string, userId: string) {
    const plan = await this.prisma.carePlan.findFirst({ where: { id: carePlanId, userId } });
    if (!plan) throw new NotFoundException('Care plan not found');

    const logs = await this.prisma.carePlanLog.findMany({
      where: { carePlanId },
      orderBy: { date: 'desc' },
      take: 90,
    });

    return {
      score: plan.adherenceScore ?? 0,
      status: plan.adherence,
      dailyLogs: logs.map((l) => ({
        date: l.date.toISOString().slice(0, 10),
        status: l.status,
        notes: l.notes,
        symptoms: l.symptoms,
      })),
    };
  }
}
