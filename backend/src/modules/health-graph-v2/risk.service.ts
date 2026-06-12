/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph-v2/risk.service.ts
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

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';

export interface RiskResult {
  riskScore: number;
  riskLevel: string;
  drivers: string[];
  recommendedActions: string[];
}

interface LifestyleRiskInput {
  stressLevel?: string;
  smokingStatus?: string;
  activityLevel?: string;
  sleepQuality?: string;
  dietType?: string;
}

interface FamilyHistoryRiskInput {
  condition: string;
}

interface MetricRiskInput {
  metricType: string;
  value: number;
}

@Injectable()
export class RiskService {
  constructor(private readonly prisma: PrismaService) {}

  async assess(userId: string): Promise<Record<string, RiskResult>> {
    const [lifestyle, familyHistory, symptoms, metrics] = await Promise.all([
      this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.familyHistory.findMany({ where: { userId } }),
      this.prisma.symptomEvent.findMany({ where: { userId }, orderBy: { reportedAt: 'desc' }, take: 20 }),
      this.prisma.wearableMetric.findMany({ where: { userId }, orderBy: { recordedAt: 'desc' }, take: 100 }),
    ]);
    void this.prisma.riskPrediction.findMany({ where: { userId }, orderBy: { calculatedAt: 'desc' }, take: 10 });

    const lifestyleInput: LifestyleRiskInput | null = lifestyle ? {
      stressLevel: lifestyle.stressLevel ?? undefined,
      smokingStatus: lifestyle.smokingStatus ?? undefined,
      activityLevel: lifestyle.activityLevel ?? undefined,
      sleepQuality: lifestyle.sleepQuality ?? undefined,
      dietType: lifestyle.dietType ?? undefined,
    } : null;

    return {
      hospitalization: this.predictHospitalization(lifestyleInput, familyHistory, symptoms, metrics),
      diabetesProgression: this.predictDiabetes(lifestyleInput, familyHistory, metrics),
      cardiovascular: this.predictCardiovascular(lifestyleInput, familyHistory, metrics),
      medicationNonAdherence: this.predictNonAdherence(lifestyleInput, symptoms),
      readmission: this.predictReadmission(symptoms, metrics),
      preventiveCare: this.predictPreventiveCare(lifestyleInput, familyHistory),
    };
  }

  private scoreToLevel(score: number): string {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MODERATE';
    return 'LOW';
  }

  private predictHospitalization(lifestyle: LifestyleRiskInput | null, familyHistory: FamilyHistoryRiskInput[], symptoms: unknown[], metrics: MetricRiskInput[]): RiskResult {
    let score = 10;
    const drivers: string[] = [];

    if (lifestyle?.stressLevel === 'HIGH' || lifestyle?.stressLevel === 'SEVERE') { score += 15; drivers.push('high stress'); }
    if (lifestyle?.smokingStatus === 'CURRENT') { score += 10; drivers.push('current smoker'); }
    if (lifestyle?.activityLevel === 'SEDENTARY') { score += 10; drivers.push('sedentary lifestyle'); }
    if (familyHistory.some((f) => ['diabetes', 'hypertension', 'cardiac disease'].includes(f.condition.toLowerCase()))) {
      score += 10; drivers.push('family history of chronic disease');
    }
    if (symptoms.length > 5) { score += 10; drivers.push('frequent symptom reports'); }
    if (lifestyle?.sleepQuality === 'POOR') { score += 8; drivers.push('poor sleep quality'); }

    const bpReadings = metrics.filter((m) => m.metricType === 'BLOOD_PRESSURE');
    if (bpReadings.some((m) => m.value > 140)) { score += 8; drivers.push('elevated blood pressure'); }

    return { riskScore: Math.min(100, score), riskLevel: this.scoreToLevel(score), drivers, recommendedActions: ['schedule checkup', 'monitor vitals', 'reduce stress'] };
  }

  private predictDiabetes(lifestyle: LifestyleRiskInput | null, familyHistory: FamilyHistoryRiskInput[], metrics: MetricRiskInput[]): RiskResult {
    let score = 5;
    const drivers: string[] = [];

    if (familyHistory.some((f) => f.condition.toLowerCase() === 'diabetes')) { score += 25; drivers.push('family history of diabetes'); }
    if (lifestyle?.activityLevel === 'SEDENTARY') { score += 15; drivers.push('sedentary lifestyle'); }
    if (lifestyle?.dietType === 'NON_VEG') { score += 5; }
    if (lifestyle?.stressLevel === 'HIGH' || lifestyle?.stressLevel === 'SEVERE') { score += 10; drivers.push('chronic stress'); }
    if (metrics.some((m) => m.metricType === 'GLUCOSE' && m.value > 126)) { score += 25; drivers.push('elevated glucose'); }

    return { riskScore: Math.min(100, score), riskLevel: this.scoreToLevel(score), drivers, recommendedActions: ['HbA1c test', 'fasting glucose test', 'diet consultation', 'exercise plan'] };
  }

  private predictCardiovascular(lifestyle: LifestyleRiskInput | null, familyHistory: FamilyHistoryRiskInput[], metrics: MetricRiskInput[]): RiskResult {
    let score = 5;
    const drivers: string[] = [];

    if (familyHistory.some((f) => ['cardiac disease', 'hypertension', 'stroke'].includes(f.condition.toLowerCase()))) {
      score += 20; drivers.push('family history of CVD');
    }
    if (lifestyle?.smokingStatus === 'CURRENT') { score += 20; drivers.push('current smoker'); }
    if (lifestyle?.activityLevel === 'SEDENTARY') { score += 10; drivers.push('sedentary'); }
    if (lifestyle?.stressLevel === 'HIGH' || lifestyle?.stressLevel === 'SEVERE') { score += 10; drivers.push('high stress'); }
    if (metrics.some((m) => m.metricType === 'BLOOD_PRESSURE' && m.value > 140)) { score += 15; drivers.push('hypertension'); }

    return { riskScore: Math.min(100, score), riskLevel: this.scoreToLevel(score), drivers, recommendedActions: ['lipid profile', 'ECG', 'bp monitoring', 'cardiac consultation'] };
  }

  private predictNonAdherence(lifestyle: LifestyleRiskInput | null, symptoms: unknown[]): RiskResult {
    let score = 10;
    const drivers: string[] = [];

    if (lifestyle?.stressLevel === 'HIGH' || lifestyle?.stressLevel === 'SEVERE') { score += 20; drivers.push('high stress reduces adherence'); }
    if (lifestyle?.sleepQuality === 'POOR') { score += 15; drivers.push('poor sleep impacts routine'); }
    if (symptoms.length > 8) { score += 15; drivers.push('high symptom burden'); }

    return { riskScore: Math.min(100, score), riskLevel: this.scoreToLevel(score), drivers, recommendedActions: ['medication reminder setup', 'counseling', 'simplify regimen'] };
  }

  private predictReadmission(symptoms: unknown[], metrics: MetricRiskInput[]): RiskResult {
    let score = 5;
    const drivers: string[] = [];

    if (symptoms.length > 10) { score += 20; drivers.push('frequent symptoms'); }
    if (metrics.filter((m) => m.metricType === 'HEART_RATE').some((m) => m.value > 100)) { score += 15; drivers.push('elevated heart rate'); }

    return { riskScore: Math.min(100, score), riskLevel: this.scoreToLevel(score), drivers, recommendedActions: ['follow-up scheduling', 'care coordination', 'home monitoring'] };
  }

  private predictPreventiveCare(lifestyle: LifestyleRiskInput | null, familyHistory: FamilyHistoryRiskInput[]): RiskResult {
    let score = 0;
    const drivers: string[] = [];

    if (familyHistory.some((f) => f.condition.toLowerCase() === 'diabetes')) { score += 15; drivers.push('family diabetes history'); }
    if (familyHistory.some((f) => f.condition.toLowerCase().includes('cancer'))) { score += 15; drivers.push('family cancer history'); }
    if (lifestyle?.smokingStatus === 'CURRENT' || lifestyle?.smokingStatus === 'FORMER') { score += 10; drivers.push('smoking history'); }
    if (lifestyle?.activityLevel === 'SEDENTARY') { score += 10; drivers.push('sedentary'); }
    if (lifestyle?.dietType !== 'VEG' && lifestyle?.dietType !== 'VEGAN') { score += 5; }

    return { riskScore: Math.min(100, score), riskLevel: this.scoreToLevel(score), drivers, recommendedActions: ['annual health checkup', 'age-based screenings', 'vaccination review'] };
  }

  async savePrediction(userId: string, riskType: string, result: RiskResult) {
    return this.prisma.riskPrediction.create({
      data: {
        id: randomUUID(),
        userId,
        riskType,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        drivers: result.drivers,
        recommendedActions: result.recommendedActions,
        modelVersion: 'v4.0',
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  async getHistory(userId: string) {
    return this.prisma.riskPrediction.findMany({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      take: 50,
    });
  }

  async getStats() {
    const [total, levelDist, typeDist] = await Promise.all([
      this.prisma.riskPrediction.count(),
      this.prisma.riskPrediction.groupBy({ by: ['riskLevel'], _count: true }),
      this.prisma.riskPrediction.groupBy({ by: ['riskType'], _count: true }),
    ]);
    return {
      totalPredictions: total,
      byRiskLevel: Object.fromEntries(levelDist.map((r) => [r.riskLevel, r._count])),
      byRiskType: Object.fromEntries(typeDist.map((r) => [r.riskType, r._count])),
    };
  }
}
