/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/analytics/analytics.service.ts
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
 * Business logic service for analytics
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
 *
 * Dependencies:
 - client
 - common
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

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { DomainEventsService } from '../../providers/events/events.service';
import { DomainEventType } from '../../providers/events/events.types';

export interface MetricDefinition {
  metric: string;
  value: number;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  dimension?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly events: DomainEventsService,
  ) {}

  async trackEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    const userId = (payload as any).userId || (payload as any).patientUserId;
    if (!userId) return;

    switch (eventType) {
      case 'appointment_booked':
        await this.recordMetric(userId, 'appointment_booked_total', 1, 'daily', { dimension: (payload as any).consultationMode });
        break;
      case 'appointment_completed':
        await this.recordMetric(userId, 'appointment_completed_total', 1, 'daily');
        break;
      case 'appointment_cancelled':
        await this.recordMetric(userId, 'appointment_cancelled_total', 1, 'daily');
        break;
      case 'health_score_changed':
        await this.recordMetric(userId, 'health_score_current', (payload as any).score, 'daily');
        break;
      case 'prescription_created':
        await this.recordMetric(userId, 'prescription_total', 1, 'daily');
        break;
      case 'lab_report_uploaded': {
        const isAbnormal = (payload as any).isAbnormal;
        await this.recordMetric(userId, 'lab_report_total', 1, 'daily');
        if (isAbnormal) {
          await this.recordMetric(userId, 'lab_report_abnormal_total', 1, 'daily');
        }
        break;
      }
      case 'consultation_ended': {
        const durationMs = (payload as any).durationMs || 0;
        await this.recordMetric(userId, 'consultation_duration_ms', durationMs, 'daily');
        break;
      }
      case 'patient_registered':
        await this.recordMetric(userId, 'patient_registered', 1, 'daily');
        break;
    }
  }

  async recordMetric(
    userId: string,
    metric: string,
    value: number,
    period: 'daily' | 'weekly' | 'monthly' | 'all_time',
    options?: { dimension?: string; metadata?: Record<string, unknown> },
  ): Promise<void> {
    const { periodStart, periodEnd } = this.getPeriodRange(period);

    const existing = await this.prisma.healthAnalytics.findFirst({
      where: {
        userId,
        metric,
        period,
        periodStart,
        periodEnd,
        dimension: options?.dimension ?? 'OVERALL',
      },
    });

    if (existing) {
      await this.prisma.healthAnalytics.update({
        where: { id: existing.id },
        data: {
          value: period === 'daily' ? { increment: value } : value,
        },
      });
    } else {
      await this.prisma.healthAnalytics.create({
        data: {
          userId,
          metric,
          value,
          period,
          periodStart,
          periodEnd,
          dimension: options?.dimension ?? 'OVERALL',
          metadata: (options?.metadata ?? {}) as Prisma.JsonObject,
        },
      });
    }
  }

  async getMetrics(
    userId: string,
    metric?: string,
    period?: string,
    from?: Date,
    to?: Date,
    dimension?: string,
  ) {
    const where: any = { userId };
    if (metric) where.metric = metric;
    if (period) where.period = period;
    if (dimension) where.dimension = dimension;
    if (from || to) {
      where.periodStart = {};
      if (from) where.periodStart.gte = from;
      if (to) where.periodStart.lte = to;
    }

    return this.prisma.healthAnalytics.findMany({
      where,
      orderBy: { periodStart: 'desc' },
    });
  }

  async getMetricTrend(userId: string, metric: string, days = 30): Promise<{ date: string; value: number }[]> {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const records = await this.prisma.healthAnalytics.findMany({
      where: {
        userId,
        metric,
        period: 'daily',
        periodStart: { gte: from },
      },
      orderBy: { periodStart: 'asc' },
    });

    return records.map(r => ({
      date: r.periodStart.toISOString().split('T')[0] || '',
      value: r.value,
    }));
  }

  async aggregateAppointmentMetrics(userId: string): Promise<{
    total: number;
    completed: number;
    cancelled: number;
    completionRate: number;
  }> {
    const [total, completed, cancelled] = await Promise.all([
      this.sumMetric(userId, 'appointment_booked_total'),
      this.sumMetric(userId, 'appointment_completed_total'),
      this.sumMetric(userId, 'appointment_cancelled_total'),
    ]);

    return {
      total,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  async aggregateHealthScoreTrend(userId: string, days = 90): Promise<{
    current: number | null;
    average: number | null;
    trend: 'up' | 'down' | 'stable';
    dataPoints: { date: string; score: number }[];
  }> {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const records = await this.prisma.healthAnalytics.findMany({
      where: {
        userId,
        metric: 'health_score_current',
        periodStart: { gte: from },
      },
      orderBy: { periodStart: 'asc' },
    });

    if (records.length === 0) {
      return { current: null, average: null, trend: 'stable', dataPoints: [] };
    }

    const values = records.map(r => r.value);
    const currentScore = values.length > 0 ? values[values.length - 1]! : null;
    const averageScore = values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : null;
    const trend: 'up' | 'down' | 'stable' = values.length >= 2
      ? (
          values[values.length - 1]! > values[0]!
            ? 'up'
            : values[values.length - 1]! < values[0]!
            ? 'down'
            : 'stable'
        )
      : 'stable';

    return {
      current: currentScore,
      average: averageScore,
      trend,
      dataPoints: records.map(r => ({
        date: r.periodStart.toISOString().split('T')[0] || '',
        score: r.value,
      })),
    };
  }

  private async sumMetric(userId: string, metric: string): Promise<number> {
    const result = await this.prisma.healthAnalytics.aggregate({
      where: { userId, metric },
      _sum: { value: true },
    });
    return result._sum.value ?? 0;
  }

  private getPeriodRange(period: string): { periodStart: Date; periodEnd: Date } {
    const now = new Date();
    const start = new Date(now);

    switch (period) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        return { periodStart: start, periodEnd: now };
      case 'weekly': {
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return { periodStart: start, periodEnd: now };
      }
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return { periodStart: start, periodEnd: now };
      case 'all_time':
        return { periodStart: new Date(0), periodEnd: now };
      default:
        return { periodStart: start, periodEnd: now };
    }
  }
}
