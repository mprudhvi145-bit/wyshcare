/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinical-twin/clinical-twin.service.ts
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
 * Business logic service for clinical-twin
 *
 * Responsibilities:
 * - Execute business logic for clinical operations
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
Clinical
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
export class ClinicalTwinService {
  constructor(private readonly prisma: PrismaService) {}

  async getClinicTwin(clinicId: string) {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const monthAgo = new Date(Date.now() - 30 * 86400000);
    const tomorrowStart = new Date(dayStart.getTime() + 86400000);

    const [todayAppointments, weekAppointments, monthInvoices, todayQueue, doctors, clinic] = await Promise.all([
      this.prisma.appointment.findMany({ where: { clinicId, slotStartAt: { gte: dayStart, lt: tomorrowStart } } }),
      this.prisma.appointment.findMany({ where: { clinicId, slotStartAt: { gte: weekAgo } } }),
      this.prisma.billingInvoice.findMany({ where: { clinicId, createdAt: { gte: monthAgo } } }),
      this.prisma.queueEntry.findMany({ where: { clinicId, createdAt: { gte: dayStart } } }),
      this.prisma.doctorClinic.findMany({ where: { clinicId }, include: { doctor: { include: { user: { select: { fullName: true, id: true } } } } } }),
      this.prisma.clinic.findUnique({ where: { id: clinicId } }),
    ]);

    const totalBilled = monthInvoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalCollected = monthInvoices.reduce((s, i) => s + i.paidAmount, 0);
    const activePatients = new Set(todayAppointments.map(a => a.patientUserId)).size;
    const completedToday = todayAppointments.filter(a => a.status === 'COMPLETED').length;

    const avgWait = todayQueue
      .filter(q => q.checkedInAt && q.assignedAt)
      .reduce((sum, q) => sum + (q.assignedAt!.getTime() - q.checkedInAt!.getTime()) / 60000, 0);
    const avgWaitMinutes = Math.round(avgWait / Math.max(todayQueue.filter(q => q.assignedAt).length, 1));

    const docUtilization = doctors.map(doc => {
      const docAppts = todayAppointments.filter(a => a.doctorProfileId === doc.doctor.id);
      return {
        doctorId: doc.doctor.id,
        doctorName: doc.doctor.user.fullName,
        patientsToday: docAppts.length,
        completed: docAppts.filter(a => a.status === 'COMPLETED').length,
        utilizationPercent: Math.min(Math.round((docAppts.length / 20) * 100), 100),
      };
    });

    const tomorrowPrediction = this.predictTomorrow(todayAppointments, weekAppointments, clinic!);

    return {
      twinId: `clinic-${clinicId}`,
      clinic: { id: clinicId, name: clinic?.name, city: clinic?.city },
      snapshot: {
        timestamp: now.toISOString(),
        patientsToday: todayAppointments.length,
        activePatients,
        completedToday,
        inQueue: todayQueue.filter(q => q.status === 'WAITING').length,
        inProgress: todayQueue.filter(q => q.status === 'IN_PROGRESS').length,
        avgWaitMinutes,
        doctorsActive: docUtilization.filter(d => d.patientsToday > 0).length,
      },
      revenue: {
        monthBilled: totalBilled,
        monthCollected: totalCollected,
        collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
        averagePerPatient: activePatients > 0 ? Math.round(totalBilled / activePatients) : 0,
      },
      doctorUtilization: docUtilization,
      predictions: tomorrowPrediction,
      insights: this.generateInsights(todayAppointments, weekAppointments, monthInvoices, totalBilled, totalCollected),
    };
  }

  private predictTomorrow(today: Record<string, unknown>[], week: Record<string, unknown>[], _clinic: Record<string, unknown>) {
    const weekday = new Date().getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const todayCount = today.length;
    const weekAvg = Math.round(week.length / 7);
    const predictedLoad = isWeekend ? Math.round(todayCount * 0.7) : Math.round((todayCount + weekAvg) / 2);

    return {
      predictedPatients: Math.max(predictedLoad, 5),
      predictedRevenue: Math.round(predictedLoad * 500),
      staffRequired: Math.max(Math.ceil(predictedLoad / 20), 2),
      confidence: week.length > 0 ? Math.round(Math.min(weekAvg / todayCount, 1) * 80 + 20) : 50,
    };
  }

  private generateInsights(_today: Array<{ status: string }>, week: Array<{ status: string }>, _monthInvoices: Record<string, unknown>[], totalBilled: number, totalCollected: number): string[] {
    const insights: string[] = [];
    const completed = week.filter(a => a.status === 'COMPLETED').length;
    const noShow = week.filter(a => a.status === 'NO_SHOW').length;
    const cancellationRate = week.length > 0 ? Math.round((week.filter(a => a.status === 'CANCELLED').length / week.length) * 100) : 0;

    if (noShow > 3) insights.push(`${noShow} no-shows this week — consider sending reminders.`);
    if (cancellationRate > 20) insights.push(`Cancellation rate is ${cancellationRate}% — review scheduling policies.`);
    if (totalBilled > 0 && totalCollected / totalBilled < 0.6) insights.push('Collection rate below 60% — flag overdue invoices.');
    if (completed > 0 && week.length / 7 > 20) insights.push(`High volume (avg ${Math.round(week.length / 7)} patients/day) — consider additional staffing.`);

    return insights.length > 0 ? insights : ['Clinic operating normally.'];
  }

  async getPatientFunnel(clinicId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 86400000);
    const appointments = await this.prisma.appointment.findMany({ where: { clinicId, slotStartAt: { gte: startDate } } });

    return {
      period: days,
      funnel: {
        requested: appointments.filter(a => a.status === 'REQUESTED').length,
        confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
        checkedIn: appointments.filter(a => a.status === 'CHECKED_IN').length,
        inProgress: appointments.filter(a => a.status === 'IN_PROGRESS').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        noShow: appointments.filter(a => a.status === 'NO_SHOW').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
      },
      conversionRate: appointments.length > 0
        ? Math.round((appointments.filter(a => a.status === 'COMPLETED').length / appointments.length) * 100)
        : 0,
    };
  }

  async getDiseaseTrends(clinicId: string, days: number = 90) {
    const startDate = new Date(Date.now() - days * 86400000);
    const consultations = await this.prisma.prescription.findMany({
      where: { doctorProfile: { clinicMappings: { some: { clinicId } } }, createdAt: { gte: startDate } },
      select: { diagnosis: true },
    });

    const conditions: Record<string, number> = {};
    for (const c of consultations) {
      const diagnoses = c.diagnosis as Array<{ code?: string; name?: string }> | null;
      if (diagnoses) {
        for (const d of diagnoses) {
          const name = d.name ?? d.code ?? 'Unknown';
          conditions[name] = (conditions[name] ?? 0) + 1;
        }
      }
    }

    const topConditions = Object.entries(conditions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([condition, count]) => ({ condition, count }));

    return { days, totalConsultations: consultations.length, topConditions };
  }
}
