/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/digital-twin.service.ts
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
 * Business logic service for digital-twin
 *
 * Responsibilities:
 * - Execute business logic for digital twin operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 - backend/src/modules/search/search.controller.ts
 *
 * Calls:
 - crypto
 - client
 - common
 *
 * Dependencies:
 - crypto
 - client
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Digital Twin
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
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { TwinMetricType } from '@prisma/client';
import { RiskEngineV4Service } from './engines/risk-engine-v4.service';
import { PredictionEngineService } from './engines/prediction-engine.service';
import { CareGapEngineService } from './engines/care-gap-engine.service';
import { AdherenceEngineService } from './engines/adherence-engine.service';
import { PreventiveCareEngineService } from './engines/preventive-care-engine.service';
import { FamilyRiskEngineService } from './engines/family-risk-engine.service';
import { TwinContextEngineService } from './engines/twin-context-engine.service';

export interface TwinScore {
  healthScore: number;
  riskScore: number;
  adherenceScore: number;
  readinessScore: number;
}

@Injectable()
export class DigitalTwinService {
  private readonly logger = new Logger(DigitalTwinService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly riskEngine: RiskEngineV4Service,
    private readonly predictionEngine: PredictionEngineService,
    private readonly careGapEngine: CareGapEngineService,
    private readonly adherenceEngine: AdherenceEngineService,
    private readonly preventiveEngine: PreventiveCareEngineService,
    private readonly familyRiskEngine: FamilyRiskEngineService,
    private readonly contextEngine: TwinContextEngineService,
  ) {}

  async getTwin(userId: string) {
    const needsRecompute = async () => {
      const existing = await this.prisma.digitalTwin.findUnique({
        where: { userId },
        select: { lastComputedAt: true },
      });
      return !existing || !existing.lastComputedAt || this.isStale(existing.lastComputedAt);
    };

    if (await needsRecompute()) {
      await this.recompute(userId);
    }

    const twin = await this.prisma.digitalTwin.findUnique({
      where: { userId },
      include: {
        RiskPrediction: { orderBy: { calculatedAt: 'desc' }, take: 20 },
        CareGap: { where: { status: 'OPEN' }, orderBy: { priority: 'asc' } },
        TwinScoreHistory: { orderBy: { recordedAt: 'desc' }, take: 30 },
        TwinMetricHistory: { orderBy: { recordedAt: 'desc' }, take: 100 },
      },
    });

    const [predictions, recommendations, adherence, familyRisk] = await Promise.all([
      this.predictionEngine.predict(userId),
      this.prisma.preventiveRecommendation.findMany({
        where: { userId, status: { in: ['PENDING', 'ACTIVE'] } },
        orderBy: { dueDate: 'asc' },
      }),
      this.adherenceEngine.assess(userId),
      this.familyRiskEngine.assess(userId),
    ]);

    if (!twin) {
      const created = await this.prisma.digitalTwin.create({
        data: {
          id: randomUUID(),
          userId,
          updatedAt: new Date(),
        },
      });
      return {
        id: created.id,
        userId: created.userId,
        scores: { health: 0, risk: 0, adherence: 0, readiness: 0 },
        lastComputedAt: null,
        risks: [],
        careGaps: [],
        predictions,
        recommendations,
        adherence,
        familyRisk,
        scoreHistory: [],
        metricHistory: [],
      };
    }

    return {
      id: twin.id,
      userId: twin.userId,
      scores: {
        health: twin.healthScore,
        risk: twin.riskScore,
        adherence: twin.adherenceScore,
        readiness: twin.readinessScore,
      },
      lastComputedAt: twin.lastComputedAt,
      risks: twin.RiskPrediction,
      careGaps: twin.CareGap,
      predictions,
      recommendations,
      adherence,
      familyRisk,
      scoreHistory: twin.TwinScoreHistory,
      metricHistory: twin.TwinMetricHistory,
    };
  }

  async getScore(userId: string): Promise<TwinScore> {
    const twin = await this.getOrCreateTwin(userId);
    return {
      healthScore: twin.healthScore,
      riskScore: twin.riskScore,
      adherenceScore: twin.adherenceScore,
      readinessScore: twin.readinessScore,
    };
  }

  async getPredictions(userId: string) {
    return this.predictionEngine.predict(userId);
  }

  async getRisks(userId: string) {
    const twin = await this.prisma.digitalTwin.findUnique({
      where: { userId },
      include: { RiskPrediction: { orderBy: { calculatedAt: 'desc' }, take: 20 } },
    });
    if (!twin) return [];
    return twin.RiskPrediction;
  }

  async getCareGaps(userId: string) {
    const twin = await this.prisma.digitalTwin.findUnique({
      where: { userId },
      include: { CareGap: { orderBy: { priority: 'asc' } } },
    });
    if (!twin) return [];
    return twin.CareGap;
  }

  async getRecommendations(userId: string) {
    return this.prisma.preventiveRecommendation.findMany({
      where: { userId, status: { in: ['PENDING', 'ACTIVE'] } },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async recompute(userId: string) {
    this.logger.log(`Recomputing digital twin for user ${userId}`);

    const twin = await this.getOrCreateTwin(userId);

    const [riskAssessments, adherence, familyRisk, context] = await Promise.all([
      this.riskEngine.assess(userId),
      this.adherenceEngine.assess(userId),
      this.familyRiskEngine.assess(userId),
      this.contextEngine.build(userId),
    ]);

    const riskScore = this.computeOverallRiskScore(riskAssessments);
    const healthScore = this.computeHealthScore(riskAssessments, adherence, familyRisk, context);
    const adherenceScore = adherence.overallRate;
    const readinessScore = this.computeReadinessScore(adherence, familyRisk, riskScore);

    const updated = await this.prisma.digitalTwin.update({
      where: { id: twin.id },
      data: {
        healthScore,
        riskScore,
        adherenceScore,
        readinessScore,
        lastComputedAt: new Date(),
        version: { increment: 1 },
        contextSnapshot: context,
      },
    });

    await this.saveRiskAssessments(userId, twin.id, riskAssessments);
    await this.careGapEngine.findGaps(userId, twin.id);
    await this.preventiveEngine.generate(userId, twin.id);
    await this.contextEngine.saveSnapshot(userId, twin.id);

    await this.prisma.twinScoreHistory.create({
      data: {
        id: randomUUID(),
        twinId: twin.id,
        healthScore,
        riskScore,
        adherenceScore,
        readinessScore,
      },
    });

    const metrics: Array<{ id: string; twinId: string; metric: TwinMetricType; value: number; unit: string | null }> = [
      { id: randomUUID(), twinId: twin.id, metric: 'HEALTH_SCORE' as TwinMetricType, value: healthScore, unit: 'points' },
      { id: randomUUID(), twinId: twin.id, metric: 'RISK_SCORE' as TwinMetricType, value: riskScore, unit: 'points' },
      { id: randomUUID(), twinId: twin.id, metric: 'ADHERENCE_SCORE' as TwinMetricType, value: adherenceScore, unit: 'percent' },
      { id: randomUUID(), twinId: twin.id, metric: 'READINESS_SCORE' as TwinMetricType, value: readinessScore, unit: 'points' },
    ];
    await this.prisma.twinMetricHistory.createMany({ data: metrics });

    this.logger.log(`Twin recomputed: health=${healthScore} risk=${riskScore} adherence=${adherenceScore}`);

    return updated;
  }

  private async getOrCreateTwin(userId: string) {
    let twin = await this.prisma.digitalTwin.findUnique({ where: { userId } });
    if (!twin) {
      twin = await this.prisma.digitalTwin.create({
        data: {
          id: randomUUID(),
          userId,
          updatedAt: new Date(),
        },
      });
    }
    return twin;
  }

  private isStale(lastComputedAt: Date): boolean {
    const staleThreshold = 6 * 60 * 60 * 1000;
    return Date.now() - lastComputedAt.getTime() > staleThreshold;
  }

  private computeOverallRiskScore(riskAssessments: Record<string, { riskScore: number }>): number {
    const scores = Object.values(riskAssessments).map(r => r.riskScore);
    if (scores.length === 0) return 0;
    const max = Math.max(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(max * 0.6 + avg * 0.4);
  }

  private computeHealthScore(
    riskAssessments: Record<string, { riskScore: number }>,
    adherence: { overallRate: number },
    familyRisk: { overallScore: number },
    _context: unknown,
  ): number {
    const riskFactor = 1 - this.computeOverallRiskScore(riskAssessments) / 100;
    const adherenceFactor = adherence.overallRate / 100;
    const familyFactor = 1 - familyRisk.overallScore / 100;

    return Math.round(
      riskFactor * 35 +
      adherenceFactor * 25 +
      familyFactor * 10 +
      30
    );
  }

  private computeReadinessScore(adherence: { overallRate: number }, familyRisk: { overallScore: number }, riskScore: number): number {
    return Math.round(
      (adherence.overallRate) * 0.4 +
      (1 - familyRisk.overallScore / 100) * 0.2 +
      (1 - riskScore / 100) * 0.4
    );
  }

  private async saveRiskAssessments(userId: string, twinId: string, assessments: Record<string, { riskScore: number; riskLevel: string; drivers: string[]; recommendedActions: string[] }>) {
    const userIdStr = userId;
    const data = Object.entries(assessments).map(([type, result]) => ({
      id: randomUUID(),
      userId: userIdStr,
      twinId,
      riskType: type.toUpperCase(),
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      drivers: result.drivers,
      recommendedActions: result.recommendedActions,
      modelVersion: 'v4.0',
      expiresAt: new Date(Date.now() + 30 * 86400000),
    }));
    if (data.length > 0) {
      await this.prisma.riskPrediction.createMany({ data });
    }
  }
}
