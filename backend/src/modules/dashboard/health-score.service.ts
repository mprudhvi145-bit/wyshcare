/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/dashboard/health-score.service.ts
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
 * Business logic service for dashboard
 *
 * Responsibilities:
 * - Execute business logic for health operations
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
 *
 * Dependencies:
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Health
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
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class HealthScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async compute(userId: string): Promise<{
    score: number;
    breakdown: Record<string, number>;
    factors: string[];
  }> {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);

    const [totalAppts, completedAppts, noShowAppts] = await Promise.all([
      this.prisma.appointment.count({ where: { patientUserId: userId } }),
      this.prisma.appointment.count({ where: { patientUserId: userId, status: 'COMPLETED' } }),
      this.prisma.appointment.count({ where: { patientUserId: userId, status: 'NO_SHOW' } }),
    ]);

    const apptRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 100;
    const appointmentScore = Math.max(0, apptRate - noShowAppts * 5);

    const totalLogs = await this.prisma.medicationAdherenceLog.count({ where: { userId } });
    const takenLogs = await this.prisma.medicationAdherenceLog.count({ where: { userId, status: 'TAKEN' } });
    const medicationScore = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

    const carePlans = await this.prisma.carePlan.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { adherenceScore: true },
    });
    const carePlanScore = carePlans.length > 0
      ? Math.round(carePlans.reduce((s, p) => s + (p.adherenceScore ?? 0), 0) / carePlans.length)
      : 100;

    const timelineCount = await this.prisma.timelineEvent.count({
      where: { userId, createdAt: { gte: ninetyDaysAgo } },
    });
    const activityScore = Math.min(100, Math.round((timelineCount / 10) * 100));

    const labs = await this.prisma.diagnosticReport.findMany({
      where: { patientUserId: userId, createdAt: { gte: ninetyDaysAgo } },
      select: { summary: true },
    });
    const normalLabs = labs.filter((l) => l.summary && l.summary.toLowerCase().includes('normal')).length;
    const labScore = labs.length > 0 ? Math.round((normalLabs / labs.length) * 100) : 80;

    const weighted =
      appointmentScore * 0.20 +
      medicationScore * 0.25 +
      carePlanScore * 0.20 +
      activityScore * 0.10 +
      labScore * 0.25;

    const score = Math.round(Math.max(0, Math.min(100, weighted)));

    const factors: string[] = [];
    if (noShowAppts > 0) factors.push(`${noShowAppts} missed appointment(s)`);
    if (appointmentScore < 70) factors.push('Low appointment adherence');
    if (medicationScore < 70) factors.push('Low medication adherence');
    if (carePlanScore < 70) factors.push('Care plan needs attention');
    if (timelineCount < 3) factors.push('Limited health tracking activity');
    if (labScore < 60) factors.push('Abnormal lab results detected');
    if (factors.length === 0) factors.push('Good overall health management');

    return {
      score,
      breakdown: {
        appointments: appointmentScore,
        medications: medicationScore,
        carePlans: carePlanScore,
        activity: activityScore,
        labs: labScore,
      },
      factors,
    };
  }
}
