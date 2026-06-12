/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/wysh/wysh.service.ts
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
 * Business logic service for wysh
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
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

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class WyshService {
  private readonly logger = new Logger(WyshService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const now = new Date();

    const [user, upcomingAppointments, activeMedications, activePolicy, pendingClaims, pendingPreAuths, familyAlerts, recentReports] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, chronicConditions: true, allergiesSummary: true, dateOfBirth: true, gender: true, bloodGroup: true, wyshId: true },
      }),
      this.prisma.appointment.findMany({
        where: { patientUserId: userId, slotStartAt: { gte: now }, status: { in: ['CONFIRMED', 'REQUESTED'] } },
        orderBy: { slotStartAt: 'asc' },
        take: 3,
        include: { doctorProfile: { include: { user: { select: { fullName: true } } } }, clinic: { select: { name: true, city: true } } },
      }),
      this.prisma.medication.findMany({
        where: { healthRecord: { userId, deletedAt: null } },
        distinct: ['name'],
        take: 5,
        select: { id: true, name: true, dosage: true, frequency: true },
      }),
      this.prisma.insurancePolicy.findFirst({
        where: { userId, status: 'ACTIVE', isActive: true, endDate: { gte: now } },
        orderBy: { createdAt: 'desc' },
        include: { InsurancePlan: { include: { InsuranceProvider: { select: { name: true } } } } },
      }),
      this.prisma.claim.findMany({
        where: { patientUserId: userId, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED'] } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, claimNumber: true, totalAmount: true, claimedAmount: true, approvedAmount: true, status: true, createdAt: true },
      }),
      this.prisma.preAuthorization.findMany({
        where: { patientUserId: userId, status: 'PENDING' },
        orderBy: { submittedAt: 'desc' },
        take: 3,
        select: { id: true, procedureCode: true, diagnosisCode: true, requestedAmount: true, status: true, submittedAt: true, expiresAt: true },
      }),
      this.getFamilyAlerts(userId),
      this.prisma.healthRecord.findMany({
        where: { userId, deletedAt: null, recordType: { in: ['DIAGNOSTIC_REPORT', 'PRESCRIPTION'] } },
        orderBy: { recordedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, recordType: true, recordedAt: true },
      }),
    ]);

    const healthScore = this.computeHealthScore(user);
    const greeting = this.getGreeting(user?.fullName ?? 'User');

    const todayTasks = this.buildTodayTasks(upcomingAppointments, activeMedications, pendingPreAuths, pendingClaims);
    const aiInsight = this.generateAiInsight(upcomingAppointments, activeMedications, pendingPreAuths, pendingClaims, familyAlerts, user);

    return {
      greeting,
      user: {
        name: user?.fullName,
        wyshId: user?.wyshId,
        gender: user?.gender,
        bloodGroup: user?.bloodGroup,
        conditions: user?.chronicConditions ?? [],
        allergies: user?.allergiesSummary ?? [],
      },
      healthScore,
      todayTasks,
      upcomingAppointments: upcomingAppointments.map((a) => ({
        id: a.id,
        doctorName: a.doctorProfile.user.fullName,
        clinicName: a.clinic?.name,
        startAt: a.slotStartAt.toISOString(),
        status: a.status,
        consultationMode: a.consultationMode,
        reason: a.reason,
      })),
      activeMedications: activeMedications.map((m) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
      })),
      insurance: activePolicy
        ? {
            provider: activePolicy.InsurancePlan.InsuranceProvider.name,
            plan: activePolicy.InsurancePlan.name,
            planType: activePolicy.InsurancePlan.type,
            policyNumber: activePolicy.policyNumber,
            sumInsured: activePolicy.sumInsured,
            endDate: activePolicy.endDate.toISOString(),
            status: activePolicy.status,
          }
        : null,
      pendingClaims: pendingClaims.map((c) => ({
        id: c.id,
        claimNumber: c.claimNumber,
        totalAmount: c.totalAmount,
        claimedAmount: c.claimedAmount,
        approvedAmount: c.approvedAmount,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
      })),
      pendingPreAuths: pendingPreAuths.map((p) => ({
        id: p.id,
        procedureCode: p.procedureCode,
        diagnosisCode: p.diagnosisCode,
        requestedAmount: p.requestedAmount,
        status: p.status,
        submittedAt: p.submittedAt.toISOString(),
        expiresAt: p.expiresAt?.toISOString(),
      })),
      familyAlerts,
      recentReports: recentReports.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.recordType,
        date: r.recordedAt.toISOString().slice(0, 10),
      })),
      aiInsight,
    };
  }

  private async getFamilyAlerts(userId: string) {
    const familyRelations = await this.prisma.familyRelation.findMany({
      where: { actorUserId: userId },
      include: {
        subject: {
          select: {
            id: true,
            fullName: true,
            chronicConditions: true,
            allergiesSummary: true,
          },
        },
      },
    });

    const alerts: Array<{ id: string; memberName: string; title: string; severity: 'HIGH' | 'MEDIUM' | 'LOW' }> = [];

    for (const relation of familyRelations) {
      const subject = relation.subject;
      if (subject.chronicConditions.length > 0) {
        alerts.push({
          id: `family-condition-${relation.id}`,
          memberName: subject.fullName,
          title: `${subject.chronicConditions.join(', ')} — monitor needed`,
          severity: 'MEDIUM',
        });
      }
      const upcomingAppts = await this.prisma.appointment.count({
        where: { patientUserId: subject.id, slotStartAt: { gte: new Date() }, status: 'CONFIRMED' },
      });
      if (upcomingAppts > 0) {
        alerts.push({
          id: `family-appt-${relation.id}`,
          memberName: subject.fullName,
          title: `Has ${upcomingAppts} upcoming appointment${upcomingAppts > 1 ? 's' : ''}`,
          severity: 'LOW',
        });
      }
    }

    return alerts;
  }

  private buildTodayTasks(
    appointments: Array<{ id: string; slotStartAt: Date; reason: string; doctorProfile: { user: { fullName: string } } }>,
    medications: Array<{ id: string; name: string; dosage: string | null; frequency: string | null }>,
    preAuths: Array<{ id: string; diagnosisCode: string | null }>,
    claims: Array<{ id: string; claimNumber: string; status: string; approvedAmount: number | null; claimedAmount: number }>,
  ) {
    const tasks: Array<{ id: string; type: 'medication' | 'appointment' | 'report' | 'pre_auth' | 'claim'; title: string; description: string; actionUrl?: string; urgent: boolean }> = [];

    for (const med of medications) {
      tasks.push({
        id: `med-${med.id}`,
        type: 'medication',
        title: `Take ${med.name}`,
        description: `${med.dosage ?? ''} — ${med.frequency ?? ''}`,
        urgent: false,
      });
    }

    for (const apt of appointments) {
      const dt = new Date(apt.slotStartAt);
      const isToday = dt.toDateString() === new Date().toDateString();
      tasks.push({
        id: `apt-${apt.id}`,
        type: 'appointment',
        title: apt.reason,
        description: `${apt.doctorProfile.user.fullName} at ${dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        actionUrl: '/app/telemedicine',
        urgent: isToday,
      });
    }

    for (const claim of claims) {
      tasks.push({
        id: `claim-${claim.id}`,
        type: 'claim',
        title: `Claim #${claim.claimNumber} ${claim.status === 'APPROVED' ? 'approved' : claim.status === 'PARTIALLY_APPROVED' ? 'partially approved' : 'under review'}`,
        description: claim.approvedAmount ? `Approved: ₹${(claim.approvedAmount / 100).toLocaleString()}` : `Claimed: ₹${(claim.claimedAmount / 100).toLocaleString()}`,
        actionUrl: '/app/insurance',
        urgent: claim.status === 'SUBMITTED',
      });
    }

    return tasks;
  }

  private generateAiInsight(
    appointments: Array<{ id: string; slotStartAt: Date; reason: string; doctorProfile: { user: { fullName: string } } }>,
    medications: Array<{ id: string; name: string; dosage: string | null; frequency: string | null }>,
    preAuths: Array<{ id: string; diagnosisCode: string | null }>,
    claims: Array<{ id: string; claimNumber: string; status: string; approvedAmount: number | null; claimedAmount: number }>,
    familyAlerts: Array<{ memberName: string; title: string }>,
    user: { fullName?: string; chronicConditions?: string[]; allergiesSummary?: string[]; bloodGroup?: string | null; dateOfBirth?: Date | string | null } | null,
  ): { message: string; type: 'appointment' | 'medication' | 'preventive' | 'insurance' | 'family' } {
    if (medications.length === 0 && !user?.chronicConditions?.length) {
      return {
        message: 'No health data recorded yet. Upload your first record or consult a doctor to get started.',
        type: 'preventive',
      };
    }

    if (user?.chronicConditions?.includes('Diabetes') || user?.chronicConditions?.includes('Hypertension')) {
      if (!appointments.some((a: { reason?: string }) => a.reason?.toLowerCase().includes('follow-up'))) {
        const firstCondition = user.chronicConditions?.[0];
        return {
          message: `Schedule a follow-up for your ${firstCondition?.toLowerCase() ?? 'condition'} — regular monitoring is key.`,
          type: 'appointment',
        };
      }
    }

    if (preAuths.length > 0) {
      const oldest = preAuths[0];
      if (!oldest) {
        return {
          message: 'Pre-authorization is pending — respond to avoid treatment delays.',
          type: 'insurance',
        };
      }
      return {
        message: `Pre-authorization for ${oldest.diagnosisCode ?? 'procedure'} is pending — respond to avoid treatment delays.`,
        type: 'insurance',
      };
    }

    if (claims.some((c: { status: string }) => c.status === 'APPROVED')) {
      return {
        message: `A claim was approved — check your settlement status in the Insurance section.`,
        type: 'insurance',
      }
    }

    if (familyAlerts.length > 0) {
      const firstAlert = familyAlerts[0];
      if (!firstAlert) {
        return {
          message: 'A family member needs attention.',
          type: 'family',
        };
      }
      return {
        message: `${firstAlert.memberName} needs attention — ${firstAlert.title.toLowerCase()}.`,
        type: 'family',
      };
    }

    if (appointments.length > 0) {
      const next = appointments[0];
      if (!next) {
        return {
          message: 'You\'re up to date! Keep tracking your health regularly.',
          type: 'preventive',
        };
      }
      const dt = new Date(next.slotStartAt);
      const dayDiff = Math.ceil((dt.getTime() - Date.now()) / 86400000);
      if (dayDiff <= 3) {
        return {
          message: `Upcoming ${next.reason.toLowerCase()} with ${next.doctorProfile.user.fullName} in ${dayDiff === 0 ? 'today' : dayDiff === 1 ? 'tomorrow' : `${dayDiff} days`}.`,
          type: 'appointment',
        };
      }
    }

    return {
      message: 'You\'re up to date! Keep tracking your health regularly.',
      type: 'preventive',
    };
  }

  private computeHealthScore(user: { chronicConditions?: string[]; allergiesSummary?: string[]; bloodGroup?: string | null; dateOfBirth?: Date | string | null } | null): { score: number; label: string; color: string } {
    let score = 75;

    if (user?.chronicConditions?.length) {
      score -= user.chronicConditions.length * 10;
    }
    if (user?.allergiesSummary?.length) {
      score -= Math.min(user.allergiesSummary.length * 3, 10);
    }
    if (user?.bloodGroup) {
      score += 5;
    }
    if (user?.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
      if (age > 60) score -= 10;
      else if (age > 45) score -= 5;
    }

    score = Math.max(10, Math.min(100, score));

    const label = score >= 70 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention';
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

    return { score, label, color };
  }

  private getGreeting(name: string): string {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    return `${timeGreeting}, ${name.split(' ')[0]}`;
  }
}
