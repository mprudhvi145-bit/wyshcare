/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/engines/twin-context-engine.service.ts
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
 * Business logic service for engines
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
import { PrismaService } from '../../../providers/prisma/prisma.service';

@Injectable()
export class TwinContextEngineService {
  private readonly logger = new Logger(TwinContextEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async build(userId: string): Promise<object> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 86400000);

    const [
      user,
      conditions,
      allergies,
      immunizations,
      encounters,
      vitals,
      lifestyle,
      prescriptions,
      activeRx,
      adherenceLogs,
      dispensingRecords,
      clinicalOrders,
      wearableMetrics,
      familyHistory,
      riskPredictions,
      careGaps,
      recommendations,
      twin,
    ] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.condition.findMany({ where: { patientId: userId } }),
      this.prisma.allergy.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
      this.prisma.immunization.findMany({ where: { patientId: userId } }),
      this.prisma.encounter.findMany({
        where: { patientId: userId },
        orderBy: { periodStart: 'desc' },
      }),
      this.prisma.vitalsRecord.findFirst({
        where: { patientId: userId },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.prescription.findMany({
        where: { patientUserId: userId, status: 'ACTIVE' },
      }),
      this.prisma.medication.findMany({
        where: { healthRecord: { userId } },
        distinct: ['name'],
      }),
      this.prisma.adherenceLog.findMany({
        where: { userId, scheduledAt: { gte: last30d } },
      }),
      this.prisma.dispensingRecord.findMany({
        where: { patientId: userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.clinicalOrder.findMany({
        where: { patientId: userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wearableMetric.findMany({
        where: { userId, recordedAt: { gte: last24h } },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.familyHistory.findMany({ where: { userId } }),
      this.prisma.riskPrediction.findMany({
        where: { userId },
        orderBy: { calculatedAt: 'desc' },
        take: 10,
      }),
      this.prisma.careGap.findMany({
        where: { DigitalTwin: { userId }, status: 'OPEN' },
      }),
      this.prisma.preventiveRecommendation.findMany({
        where: { userId, status: { in: ['PENDING', 'OVERDUE'] } },
      }),
      this.prisma.digitalTwin.findUnique({ where: { userId } }),
    ]);

    const age = user?.dateOfBirth ? this.calcAge(user.dateOfBirth) : null;

    const activeConditions = conditions.filter(c => c.status === 'ACTIVE');
    const resolvedConditions = conditions.filter(c => c.status === 'RESOLVED' || c.status === 'INACTIVE');

    const latestEncounter = encounters[0] ?? null;

    const adherenceTotal = adherenceLogs.length;
    const adherenceTaken = adherenceLogs.filter(l => l.status === 'TAKEN').length;
    const adherenceRate = adherenceTotal > 0 ? Math.round((adherenceTaken / adherenceTotal) * 100) : null;

    const wearableByType: Record<string, { value: number; unit: string; recordedAt: string }[]> = {};
    for (const w of wearableMetrics) {
      const key = w.metricType;
      if (!wearableByType[key]) wearableByType[key] = [];
      wearableByType[key]!.push({
        value: w.value,
        unit: w.unit,
        recordedAt: w.recordedAt.toISOString(),
      });
    }

    const riskScores: Record<string, { score: number; level: string }> = {};
    for (const rp of riskPredictions) {
      if (!riskScores[rp.riskType]) {
        riskScores[rp.riskType] = { score: rp.riskScore, level: rp.riskLevel };
      }
    }

    const upcomingEncounters = encounters.filter(e => e.periodStart >= now);
    const labOrders = clinicalOrders.filter(o => o.orderType === 'LAB');
    const recentLabs = labOrders.filter(o =>
      o.createdAt >= last30d || (o.completedAt && o.completedAt >= last30d),
    );

    const topFamilyConditions = this.getTopFamilyConditions(familyHistory);

    return {
      profile: {
        name: user?.fullName ?? null,
        age,
        gender: user?.gender ?? null,
        bloodGroup: user?.bloodGroup ?? null,
        chronicConditions: user?.chronicConditions ?? [],
        dateOfBirth: user?.dateOfBirth?.toISOString() ?? null,
      },
      ehr: {
        conditions: {
          active: activeConditions.length,
          resolved: resolvedConditions.length,
          list: activeConditions.slice(0, 20).map(c => ({
            icdCode: c.icdCode,
            displayName: c.displayName,
            severity: c.severity,
            onsetDate: c.onsetDate?.toISOString() ?? null,
          })),
        },
        allergies: {
          count: allergies.length,
          items: allergies.slice(0, 10).map(a => ({
            allergen: a.allergen,
            severity: a.severity,
            status: a.status,
          })),
        },
        immunizations: {
          count: immunizations.length,
          recent: immunizations.slice(0, 5).map(i => ({
            vaccineName: i.vaccineName,
            administeredDate: i.administeredDate.toISOString(),
          })),
        },
        encounters: {
          count: encounters.length,
          lastEncounter: latestEncounter ? {
            class: latestEncounter.encounterClass,
            status: latestEncounter.status,
            date: latestEncounter.periodStart.toISOString(),
          } : null,
        },
      },
      vitals: {
        bloodPressure: vitals?.bpSystolic != null && vitals?.bpDiastolic != null
          ? { systolic: vitals.bpSystolic, diastolic: vitals.bpDiastolic, unit: 'mmHg' }
          : null,
        heartRate: vitals?.heartRate != null ? { value: vitals.heartRate, unit: 'bpm' } : null,
        temperature: vitals?.temperature != null ? { value: vitals.temperature, unit: '°C' } : null,
        spo2: vitals?.spo2 != null ? { value: vitals.spo2, unit: '%' } : null,
        weight: vitals?.weight != null ? { value: vitals.weight, unit: 'kg' } : null,
        bmi: vitals?.bmi ?? null,
        recordedAt: vitals?.recordedAt?.toISOString() ?? null,
      },
      lifestyle: lifestyle
        ? {
            sleepHoursAvg: lifestyle.sleepHoursAvg,
            activityLevel: lifestyle.activityLevel,
            dietType: lifestyle.dietType,
            stressLevel: lifestyle.stressLevel,
            smokingStatus: lifestyle.smokingStatus,
            alcoholConsumption: lifestyle.alcoholConsumption,
            waterIntakeL: lifestyle.waterIntakeL,
            exerciseDaysPerWeek: lifestyle.exerciseDaysPerWeek,
          }
        : null,
      medications: {
        activePrescriptions: prescriptions.length,
        activeMedications: activeRx.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
        adherenceRate,
        adherenceLogs30d: adherenceTotal,
        dispensingRecords30d: dispensingRecords.length,
      },
      labs: {
        totalOrders: labOrders.length,
        recent30d: recentLabs.length,
        recentOrders: recentLabs.slice(0, 10).map(o => ({
          title: o.title,
          orderType: o.orderType,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        })),
      },
      appointments: {
        upcoming: upcomingEncounters.length,
        total: encounters.length,
      },
      family: {
        historyCount: familyHistory.length,
        topConditions: topFamilyConditions,
        items: familyHistory.slice(0, 10).map(f => ({
          relation: f.relation,
          condition: f.condition,
          diagnosisAge: f.diagnosisAge,
        })),
      },
      wearable: {
        metrics24h: wearableByType,
        sources: [...new Set(wearableMetrics.map(w => w.source))],
      },
      risk: {
        scores: riskScores,
        predictions: riskPredictions.slice(0, 5).map(rp => ({
          type: rp.riskType,
          score: rp.riskScore,
          level: rp.riskLevel,
          calculatedAt: rp.calculatedAt.toISOString(),
        })),
      },
      careGaps: {
        openCount: careGaps.length,
        items: careGaps.slice(0, 20).map(g => ({
          category: g.category,
          title: g.title,
          priority: g.priority,
          status: g.status,
          dueDate: g.dueDate?.toISOString() ?? null,
        })),
      },
      recommendations: {
        activeCount: recommendations.length,
        items: recommendations.slice(0, 20).map(r => ({
          recommendation: r.recommendation,
          category: r.category,
          priority: r.priority,
          status: r.status,
          dueDate: r.dueDate?.toISOString() ?? null,
        })),
      },
      twin: twin
        ? {
            twinId: twin.id,
            healthScore: twin.healthScore,
            riskScore: twin.riskScore,
            adherenceScore: twin.adherenceScore,
            readinessScore: twin.readinessScore,
            lastComputedAt: twin.lastComputedAt?.toISOString() ?? null,
            version: twin.version,
          }
        : null,
      generatedAt: now.toISOString(),
    };
  }

  async saveSnapshot(userId: string, twinId: string): Promise<void> {
    const snapshot = await this.build(userId);
    await this.prisma.digitalTwin.update({
      where: { id: twinId },
      data: { contextSnapshot: JSON.parse(JSON.stringify(snapshot)) },
    });
  }

  private getTopFamilyConditions(familyHistory: { condition: string }[]): { condition: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const fh of familyHistory) {
      counts[fh.condition] = (counts[fh.condition] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([condition, count]) => ({ condition, count }));
  }

  private calcAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }
}
