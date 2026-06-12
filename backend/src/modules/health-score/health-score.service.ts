/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-score/health-score.service.ts
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
 * Business logic service for health-score
 *
 * Responsibilities:
 * - Execute business logic for health operations
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

import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { DomainEventsService } from '../../providers/events/events.service';
import { DomainEventType } from '../../providers/events/events.types';

interface VitalsAverages {
  bpSystolic: number | null;
  bpDiastolic: number | null;
  heartRate: number | null;
  spo2: number | null;
  bmi: number | null;
}

interface AdherenceSummary {
  rate: number;
  taken: number;
  total: number;
}

interface ScoreComponent {
  value: number;
  label: string;
  detail: string;
}

export interface ScoreBreakdown {
  overallScore: number;
  components: {
    vitals: ScoreComponent;
    labs: ScoreComponent;
    adherence: ScoreComponent;
    lifestyle: ScoreComponent;
    risk: ScoreComponent;
    goals: ScoreComponent;
    emergency: ScoreComponent;
  };
  subScores: {
    physical: number;
    mental: number;
    lifestyle: number;
    adherence: number;
    sleep: number;
    nutrition: number;
  };
  factors: Record<string, unknown>;
  calculatedAt: Date;
  modelVersion: string;
}

@Injectable()
export class HealthScoreService {
  private readonly logger = new Logger(HealthScoreService.name);
  private readonly MODEL_VERSION = '1.0.0';

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly events: DomainEventsService,
  ) {}

  async calculateScore(
    userId: string,
    periodStart?: Date,
    periodEnd?: Date,
  ) {
    const now = new Date();
    const end = periodEnd ?? now;
    const start = periodStart ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      vitals,
      labResults,
      conditions,
      adherenceLogs,
      wearableMetrics,
      lifestyle,
      goals,
      emergencyAccesses,
      user,
    ] = await Promise.all([
      this.getVitals(userId, start, end),
      this.getLabResults(userId, start, end),
      this.getActiveConditions(userId),
      this.getAdherenceLogs(userId, start, end),
      this.getWearableMetrics(userId, start, end),
      this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.healthGoal.findMany({
        where: { userId, deletedAt: null },
      }),
      this.prisma.emergencyAccess.findFirst({
        where: {
          patientUserId: userId,
          expiresAt: { gt: now },
        },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { chronicConditions: true },
      }),
    ]);

    const chronicConditions = user?.chronicConditions ?? [];

    const vitalsAvg = this.computeVitalsAverages(vitals);
    const adherenceSum = this.computeAdherence(adherenceLogs);

    const vitalsScore = this.scoreVitals(vitalsAvg);
    const labPenalty = this.scoreLabs(labResults);
    const adherenceBonus = this.scoreAdherence(adherenceSum);
    const lifestyleScore = this.scoreLifestyle(wearableMetrics, lifestyle);
    const riskPenalty = this.scoreRisk(chronicConditions, conditions);
    const goalBonus = this.scoreGoals(goals);
    const emergencyPenalty = emergencyAccesses ? 5 : 0;

    const totalAdditions = vitalsScore + adherenceBonus + lifestyleScore + goalBonus;
    const totalSubtractions = labPenalty + riskPenalty + emergencyPenalty;

    const rawScore = 80 + totalAdditions - totalSubtractions;
    const overallScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    const subScores = this.computeSubScores(
      vitalsAvg,
      labResults,
      adherenceSum,
      lifestyle,
      wearableMetrics,
    );

    const factors: Record<string, unknown> = {
      vitals: { average: vitalsAvg, contribution: vitalsScore },
      labs: { abnormalCount: labResults.filter((l) => l.isAbnormal).length, penalty: labPenalty },
      adherence: { rate: adherenceSum.rate, contribution: adherenceBonus },
      lifestyle: { contribution: lifestyleScore },
      risk: { chronicConditions, activeConditions: conditions.length, penalty: riskPenalty },
      goals: { total: goals.length, completed: goals.filter((g) => g.status === 'COMPLETED').length, contribution: goalBonus },
      emergency: { active: !!emergencyAccesses, penalty: emergencyPenalty },
    };

    const score = await this.prisma.healthScore.create({
      data: {
        userId,
        overallScore,
        physicalScore: Math.round(subScores.physical),
        mentalScore: Math.round(subScores.mental),
        lifestyleScore: Math.round(subScores.lifestyle),
        adherenceScore: Math.round(subScores.adherence),
        sleepScore: Math.round(subScores.sleep),
        nutritionScore: Math.round(subScores.nutrition),
        riskAdjustment: Math.round(riskPenalty),
        factors: factors as Prisma.JsonObject,
        calculatedAt: now,
        periodStart: start,
        periodEnd: end,
        modelVersion: this.MODEL_VERSION,
      },
    });

    await Promise.all([
      this.auditLog.capture({
        actorUserId: userId,
        action: 'HEALTH_SCORE_CALCULATED',
        resourceType: 'health_score',
        resourceId: score.id,
        metadata: {
          overallScore,
          modelVersion: this.MODEL_VERSION,
          factors,
        },
      }),
      this.prisma.timelineEvent.create({
        data: {
          userId,
          type: 'REPORT',
          title: 'Health Score Updated',
          summary: `Your health score is now ${overallScore}/100`,
          metadata: { score: overallScore, scoreId: score.id } as Prisma.JsonObject,
          occurredAt: now,
        },
      }),
    ]);

    this.events.publish(DomainEventType.HEALTH_SCORE_CHANGED, {
      userId,
      score: overallScore,
    });

    return score;
  }

  async getLatestScore(userId: string) {
    const latest = await this.prisma.healthScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!latest) {
      return this.calculateScore(userId);
    }

    const hoursSinceCalculation =
      (Date.now() - latest.calculatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCalculation >= 24) {
      return this.calculateScore(userId);
    }

    return latest;
  }

  async getScoreHistory(userId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.prisma.healthScore.findMany({
      where: {
        userId,
        calculatedAt: { gte: since },
      },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  async getScoreBreakdown(userId: string): Promise<ScoreBreakdown> {
    const score = await this.getLatestScore(userId);

    const factors = (score.factors ?? {}) as Record<string, unknown>;

    return {
      overallScore: score.overallScore,
      components: {
        vitals: {
          value: ((factors.vitals as Record<string, unknown>)?.contribution as number) ?? 0,
          label: 'Vitals Health',
          detail: 'Based on average BP, HR, SpO2, and BMI over the last 30 days',
        },
        labs: {
          value: ((factors.labs as Record<string, unknown>)?.penalty as number) ?? 0,
          label: 'Lab Results',
          detail: 'Penalty for abnormal lab results',
        },
        adherence: {
          value: ((factors.adherence as Record<string, unknown>)?.contribution as number) ?? 0,
          label: 'Medication Adherence',
          detail: 'Based on medication adherence rate',
        },
        lifestyle: {
          value: ((factors.lifestyle as Record<string, unknown>)?.contribution as number) ?? 0,
          label: 'Lifestyle',
          detail: 'Based on sleep, steps, and activity level',
        },
        risk: {
          value: ((factors.risk as Record<string, unknown>)?.penalty as number) ?? 0,
          label: 'Risk Adjustment',
          detail: 'Penalty for chronic conditions and active conditions',
        },
        goals: {
          value: ((factors.goals as Record<string, unknown>)?.contribution as number) ?? 0,
          label: 'Goal Completion',
          detail: 'Based on completed vs total health goals',
        },
        emergency: {
          value: ((factors.emergency as Record<string, unknown>)?.penalty as number) ?? 0,
          label: 'Emergency Mode',
          detail: 'Penalty applied when emergency access is active',
        },
      },
      subScores: {
        physical: score.physicalScore ?? 0,
        mental: score.mentalScore ?? 0,
        lifestyle: score.lifestyleScore ?? 0,
        adherence: score.adherenceScore ?? 0,
        sleep: score.sleepScore ?? 0,
        nutrition: score.nutritionScore ?? 0,
      },
      factors,
      calculatedAt: score.calculatedAt,
      modelVersion: score.modelVersion ?? this.MODEL_VERSION,
    };
  }

  private async getVitals(userId: string, start: Date, end: Date) {
    return this.prisma.vitalsRecord.findMany({
      where: {
        patientId: userId,
        recordedAt: { gte: start, lte: end },
      },
      orderBy: { recordedAt: 'desc' },
    });
  }

  private async getLabResults(userId: string, start: Date, end: Date) {
    return this.prisma.labResult.findMany({
      where: {
        DiagnosticOrder: { userId },
        createdAt: { gte: start, lte: end },
      },
    });
  }

  private async getActiveConditions(userId: string) {
    return this.prisma.condition.findMany({
      where: { patientId: userId, status: 'ACTIVE' },
    });
  }

  private async getAdherenceLogs(userId: string, start: Date, end: Date) {
    return this.prisma.adherenceLog.findMany({
      where: {
        userId,
        scheduledAt: { gte: start, lte: end },
      },
    });
  }

  private async getWearableMetrics(userId: string, start: Date, end: Date) {
    return this.prisma.wearableMetric.findMany({
      where: {
        userId,
        recordedAt: { gte: start, lte: end },
      },
      orderBy: { recordedAt: 'desc' },
    });
  }

  private computeVitalsAverages(records: Array<{
    bpSystolic: number | null;
    bpDiastolic: number | null;
    heartRate: number | null;
    spo2: number | null;
    bmi: number | null;
  }>): VitalsAverages {
    if (!records.length) {
      return { bpSystolic: null, bpDiastolic: null, heartRate: null, spo2: null, bmi: null };
    }

    const sum = (vals: (number | null)[]): number =>
      vals.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0);
    const count = (vals: (number | null)[]): number =>
      vals.filter((v): v is number => v !== null).length;

    return {
      bpSystolic: records.length > 0 ? sum(records.map((r) => r.bpSystolic)) / Math.max(1, count(records.map((r) => r.bpSystolic))) : null,
      bpDiastolic: records.length > 0 ? sum(records.map((r) => r.bpDiastolic)) / Math.max(1, count(records.map((r) => r.bpDiastolic))) : null,
      heartRate: records.length > 0 ? sum(records.map((r) => r.heartRate)) / Math.max(1, count(records.map((r) => r.heartRate))) : null,
      spo2: records.length > 0 ? sum(records.map((r) => r.spo2)) / Math.max(1, count(records.map((r) => r.spo2))) : null,
      bmi: records.length > 0 ? sum(records.map((r) => r.bmi)) / Math.max(1, count(records.map((r) => r.bmi))) : null,
    };
  }

  private computeAdherence(logs: Array<{ status: string }>): AdherenceSummary {
    if (!logs.length) {
      return { rate: 0, taken: 0, total: 0 };
    }

    const taken = logs.filter((l) => l.status === 'TAKEN').length;
    const total = logs.length;

    return {
      rate: Math.round((taken / total) * 100),
      taken,
      total,
    };
  }

  private scoreVitals(v: VitalsAverages): number {
    let score = 0;

    if (v.bpSystolic !== null && v.bpSystolic >= 90 && v.bpSystolic <= 120) score += 2;
    if (v.bpDiastolic !== null && v.bpDiastolic >= 60 && v.bpDiastolic <= 80) score += 2;
    if (v.heartRate !== null && v.heartRate >= 60 && v.heartRate <= 100) score += 2;
    if (v.spo2 !== null && v.spo2 >= 95) score += 2;
    if (v.bmi !== null && v.bmi >= 18.5 && v.bmi <= 24.9) score += 2;

    return score;
  }

  private scoreLabs(results: Array<{ isAbnormal: boolean }>): number {
    const abnormalCount = results.filter((r) => r.isAbnormal).length;
    return Math.min(abnormalCount * 3, 15);
  }

  private scoreAdherence(summary: AdherenceSummary): number {
    return Math.round((summary.rate / 100) * 10);
  }

  private scoreLifestyle(
    metrics: Array<{ metricType: string; value: number }>,
    lifestyle: { sleepHoursAvg?: number | null; activityLevel?: string | null } | null,
  ): number {
    let score = 0;

    const stepsRecords = metrics.filter((m) => m.metricType === 'steps');
    if (stepsRecords.length > 0) {
      const avgSteps =
        stepsRecords.reduce((a, b) => a + b.value, 0) / stepsRecords.length;
      if (avgSteps >= 10000) score += 2;
      else if (avgSteps >= 7000) score += 1;
    }

    const sleepAvg = lifestyle?.sleepHoursAvg ?? null;
    if (sleepAvg !== null && sleepAvg >= 7 && sleepAvg <= 9) score += 2;
    else if (sleepAvg !== null && sleepAvg >= 6) score += 1;

    if (lifestyle?.activityLevel === 'ACTIVE' || lifestyle?.activityLevel === 'MODERATE') score += 1;

    return Math.min(score, 5);
  }

  private scoreRisk(
    chronicConditions: string[],
    activeConditions: Array<{ severity?: string | null }>,
  ): number {
    const total = chronicConditions.length + activeConditions.length;
    if (total === 0) return 5;
    if (total === 1) return 8;
    if (total === 2) return 10;
    if (total === 3) return 12;
    return 15;
  }

  private scoreGoals(goals: Array<{ status: string }>): number {
    if (!goals.length) return 0;
    const completed = goals.filter((g) => g.status === 'COMPLETED').length;
    return Math.round((completed / goals.length) * 5);
  }

  private computeSubScores(
    vitals: VitalsAverages,
    labResults: Array<{ isAbnormal: boolean }>,
    adherence: AdherenceSummary,
    lifestyle: { sleepHoursAvg?: number | null; stressLevel?: string | null; activityLevel?: string | null; dietType?: string | null } | null,
    wearableMetrics: Array<{ metricType: string; value: number }>,
  ) {
    const physicalRaw = (this.scoreVitals(vitals) / 10) * 100 - this.scoreLabs(labResults);
    const physical = Math.max(0, Math.min(100, physicalRaw));

    const stressMap: Record<string, number> = { LOW: 90, MODERATE: 70, HIGH: 40, SEVERE: 20 };
    const mental = lifestyle?.stressLevel ? (stressMap[lifestyle.stressLevel] ?? 60) : 60;

    const lifestyleScore = this.scoreLifestyle(wearableMetrics, lifestyle) / 5 * 100;

    const adherenceScore = adherence.rate;

    const sleepRecords = wearableMetrics.filter((m) => m.metricType === 'sleep_hours' || m.metricType === 'sleep');
    let sleep = 60;
    if (sleepRecords.length > 0) {
      const avgSleep = sleepRecords.reduce((a, b) => a + b.value, 0) / sleepRecords.length;
      if (avgSleep >= 7 && avgSleep <= 9) sleep = 90;
      else if (avgSleep >= 6) sleep = 70;
      else sleep = 40;
    } else if (lifestyle?.sleepHoursAvg) {
      if (lifestyle.sleepHoursAvg >= 7 && lifestyle.sleepHoursAvg <= 9) sleep = 90;
      else if (lifestyle.sleepHoursAvg >= 6) sleep = 70;
      else sleep = 40;
    }

    const dietMap: Record<string, number> = {
      BALANCED: 90,
      VEGETARIAN: 80,
      VEGAN: 80,
      MEDITERRANEAN: 95,
      KETO: 60,
      HIGH_PROTEIN: 70,
      STANDARD: 50,
    };
    const nutrition = lifestyle?.dietType ? (dietMap[lifestyle.dietType] ?? 50) : 50;

    return { physical, mental, lifestyle: lifestyleScore, adherence: adherenceScore, sleep, nutrition };
  }
}
