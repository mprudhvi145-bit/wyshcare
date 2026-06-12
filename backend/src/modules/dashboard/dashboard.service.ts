/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/dashboard/dashboard.service.ts
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
 * - Execute business logic for dashboard operations
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
Dashboard
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
import { AiGraphService } from '../ai/services/ai-graph.service';
import { AiIntelligenceService } from '../ai/services/ai-intelligence.service';
import { HealthScoreService } from './health-score.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graph: AiGraphService,
    private readonly memory: AiIntelligenceService,
    private readonly healthScore: HealthScoreService,
  ) {}

  async getPatientDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, chronicConditions: true, allergiesSummary: true, dateOfBirth: true, gender: true, bloodGroup: true },
    });

    const now = new Date();

    const upcomingAppointment = await this.prisma.appointment.findFirst({
      where: { patientUserId: userId, slotStartAt: { gte: now }, status: { in: ['CONFIRMED', 'REQUESTED'] } },
      orderBy: { slotStartAt: 'asc' },
      include: { doctorProfile: { include: { user: { select: { fullName: true } } } }, clinic: { select: { name: true, city: true } } },
    });

    const activeMedications = await this.prisma.medication.findMany({
      where: { healthRecord: { userId, deletedAt: null } },
      distinct: ['name'],
      select: { id: true, name: true, dosage: true, frequency: true, durationDays: true },
    });

    const pendingReports = await this.prisma.diagnosticReport.findMany({
      where: { patientUserId: userId, summary: null },
      take: 10,
      select: { id: true, reportType: true, createdAt: true },
    });

    const recentReports = await this.prisma.healthRecord.findMany({
      where: { userId, deletedAt: null, recordType: { in: ['DIAGNOSTIC_REPORT', 'PRESCRIPTION'] } },
      orderBy: { recordedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, recordType: true, recordedAt: true, structuredPayload: true },
    });

    const familyCount = await this.prisma.familyRelation.count({
      where: { OR: [{ actorUserId: userId }, { subjectUserId: userId }] },
    });

    const reminders = await this.prisma.medicationReminder.findMany({
      where: { userId, enabled: true },
      include: { Medication: { select: { name: true, dosage: true, frequency: true } } },
    });

    const timelineCount = await this.prisma.timelineEvent.count({ where: { userId } });
    const appointmentCount = await this.prisma.appointment.count({ where: { patientUserId: userId } });
    const recordCount = await this.prisma.healthRecord.count({ where: { userId, deletedAt: null } });

    let healthMemory;
    try {
      healthMemory = await this.memory.getHealthMemory(userId);
    } catch {
      healthMemory = { summary: 'No insights available yet.' };
    }

    const healthScoreResult = await this.healthScore.compute(userId);

    return {
      greeting: this.getGreeting(user?.fullName ?? 'User'),
      healthScore: healthScoreResult.score,
      healthScoreBreakdown: healthScoreResult.breakdown,
      healthScoreFactors: healthScoreResult.factors,
      profile: {
        name: user?.fullName,
        gender: user?.gender,
        dob: user?.dateOfBirth?.toISOString().slice(0, 10),
        bloodGroup: user?.bloodGroup,
        conditions: user?.chronicConditions ?? [],
        allergies: user?.allergiesSummary ?? [],
      },
      upcomingAppointment: upcomingAppointment ? {
        id: upcomingAppointment.id,
        doctorName: upcomingAppointment.doctorProfile.user.fullName,
        clinicName: upcomingAppointment.clinic?.name,
        clinicCity: upcomingAppointment.clinic?.city,
        startAt: upcomingAppointment.slotStartAt.toISOString(),
        endAt: upcomingAppointment.slotEndAt.toISOString(),
        status: upcomingAppointment.status,
        consultationMode: upcomingAppointment.consultationMode,
        reason: upcomingAppointment.reason,
      } : null,
      medications: {
        count: activeMedications.length,
        items: activeMedications.slice(0, 10),
      },
      pendingReports: {
        count: pendingReports.length,
        items: pendingReports.slice(0, 5),
      },
      familyCount,
      reminders: reminders.map((r) => ({
        medicationName: r.Medication.name,
        dosage: r.Medication.dosage,
        frequency: r.Medication.frequency,
        times: r.times,
        daysOfWeek: r.daysOfWeek,
      })),
      recentReports: recentReports.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.recordType,
        date: r.recordedAt.toISOString().slice(0, 10),
      })),
      stats: {
        timelineEvents: timelineCount,
        appointments: appointmentCount,
        records: recordCount,
      },
      aiInsights: this.parseAiInsights(healthMemory),
    };
  }

  private getGreeting(name: string): string {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    return `${timeGreeting} ${name}`;
  }

  private parseAiInsights(memory: Record<string, unknown>): string[] {
    const summary = typeof memory?.summary === 'string' ? memory.summary : '';
    if (!summary) return ['Start uploading health records to receive AI-powered insights.'];
    const lines = summary.split('\n').filter((l: string) => l.trim().length > 10).slice(0, 5);
    return lines.length > 0 ? lines : ['No specific insights available.'];
  }
}
