/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinic-reception/reception.service.ts
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
 * Business logic service for clinic-reception
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

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { QueueStatus, AppointmentStatus } from '@prisma/client';

@Injectable()
export class ReceptionService {
  private readonly logger = new Logger(ReceptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async getTodaySchedule(clinicId: string) {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const [appointments, walkIns, queue] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { clinicId, slotStartAt: { gte: dayStart, lt: dayEnd } },
        orderBy: { slotStartAt: 'asc' },
        include: {
          patientUser: { select: { id: true, fullName: true, phoneNumber: true, gender: true, dateOfBirth: true, avatarUrl: true } },
          doctorProfile: { include: { user: { select: { fullName: true } } } },
        },
      }),
      this.prisma.queueEntry.count({ where: { clinicId, source: 'WALK_IN', createdAt: { gte: dayStart, lt: dayEnd } } }),
      this.prisma.queueEntry.findMany({
        where: { clinicId, status: { in: [QueueStatus.WAITING, QueueStatus.IN_PROGRESS] } },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        include: {
          User: { select: { id: true, fullName: true, phoneNumber: true, gender: true, dateOfBirth: true } },
          DoctorProfile: { include: { user: { select: { fullName: true } } } },
        },
      }),
    ]);

    return {
      date: dayStart.toISOString().slice(0, 10),
      summary: {
        totalAppointments: appointments.length,
        checkedIn: appointments.filter(a => a.status === 'CHECKED_IN').length,
        confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
        noShow: appointments.filter(a => a.status === 'NO_SHOW').length,
        walkIns,
        inQueue: queue.filter(q => q.status === 'WAITING').length,
        inProgress: queue.filter(q => q.status === 'IN_PROGRESS').length,
      },
      appointments: appointments.map(a => ({
        id: a.id,
        patientName: a.patientUser.fullName,
        patientPhone: a.patientUser.phoneNumber,
        gender: a.patientUser.gender,
        age: a.patientUser.dateOfBirth ? this.calcAge(a.patientUser.dateOfBirth) : null,
        doctorName: a.doctorProfile.user.fullName,
        doctorProfileId: a.doctorProfileId,
        time: `${a.slotStartAt.toISOString().slice(11, 16)}-${a.slotEndAt.toISOString().slice(11, 16)}`,
        status: a.status,
        mode: a.consultationMode,
        reason: a.reason,
      })),
      queue: queue.map(q => ({
        id: q.id,
        patientName: q.User.fullName,
        patientPhone: q.User.phoneNumber,
        gender: q.User.gender,
        age: q.User.dateOfBirth ? this.calcAge(q.User.dateOfBirth) : null,
        doctorName: q.DoctorProfile?.user?.fullName ?? 'Unassigned',
        priority: q.priority,
        severityScore: q.severityScore,
        waitTimeMinutes: q.waitTimeMinutes,
        source: q.source,
        status: q.status,
        checkedInAt: q.checkedInAt?.toISOString(),
      })),
    };
  }

  async checkInAppointment(appointmentId: string, actorUserId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patientUser: { select: { fullName: true } } },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.status !== AppointmentStatus.CONFIRMED) throw new BadRequestException('Only confirmed appointments can be checked in');
    if (!appointment.clinicId) throw new BadRequestException('Appointment has no associated clinic');

    const [updated] = await Promise.all([
      this.prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CHECKED_IN },
      }),
      this.prisma.queueEntry.create({
        data: {
          id: randomUUID(),
          clinicId: appointment.clinicId,
          patientUserId: appointment.patientUserId,
          doctorProfileId: appointment.doctorProfileId,
          appointmentId,
          source: 'APPOINTMENT',
          status: QueueStatus.WAITING,
          checkedInAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ]);

    await this.auditLog.capture({
      actorUserId,
      patientUserId: appointment.patientUserId,
      action: 'APPOINTMENT_CHECKED_IN',
      resourceType: 'Appointment',
      resourceId: appointmentId,
    });

    return updated;
  }

  async registerWalkIn(clinicId: string, data: { patientUserId: string; doctorProfileId?: string; notes?: string }, actorUserId: string) {
    const queueEntry = await this.prisma.queueEntry.create({
      data: {
        id: randomUUID(),
        clinicId,
        patientUserId: data.patientUserId,
        doctorProfileId: data.doctorProfileId,
        source: 'WALK_IN',
        status: QueueStatus.WAITING,
        notes: data.notes,
        checkedInAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        User: { select: { id: true, fullName: true, phoneNumber: true } },
      },
    });

    await this.auditLog.capture({
      actorUserId,
      patientUserId: data.patientUserId,
      action: 'WALK_IN_REGISTERED',
      resourceType: 'QueueEntry',
      resourceId: queueEntry.id,
    });

    return queueEntry;
  }

  async getQueue(clinicId: string, doctorProfileId?: string) {
    const where: {
      clinicId: string;
      status: { in: QueueStatus[] };
      doctorProfileId?: string;
    } = { clinicId, status: { in: [QueueStatus.WAITING, QueueStatus.IN_PROGRESS] } };
    if (doctorProfileId) where.doctorProfileId = doctorProfileId;

    const entries = await this.prisma.queueEntry.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      include: {
        User: { select: { id: true, fullName: true, phoneNumber: true, gender: true, dateOfBirth: true } },
        DoctorProfile: { include: { user: { select: { fullName: true } } } },
      },
    });

    return entries.map(e => ({
      id: e.id,
      patientName: e.User.fullName,
      phone: e.User.phoneNumber,
      gender: e.User.gender,
      age: e.User.dateOfBirth ? this.calcAge(e.User.dateOfBirth) : null,
      doctorName: e.DoctorProfile?.user?.fullName ?? 'Unassigned',
      priority: e.priority,
      severityScore: e.severityScore,
      waitTimeMinutes: e.waitTimeMinutes,
      source: e.source,
      status: e.status,
      checkedInAt: e.checkedInAt?.toISOString(),
    }));
  }

  async prioritizeQueue(clinicId: string) {
    const waiting = await this.prisma.queueEntry.findMany({
      where: { clinicId, status: QueueStatus.WAITING },
      include: { User: { select: { dateOfBirth: true } } },
    });

    for (const entry of waiting) {
      const age = entry.User.dateOfBirth ? this.calcAge(entry.User.dateOfBirth) : 30;
      const waitMinutes = Math.floor((Date.now() - entry.checkedInAt!.getTime()) / 60000);
      const ageScore = age >= 70 ? 10 : age >= 60 ? 8 : age >= 50 ? 5 : age >= 18 ? 2 : 9;
      const waitScore = Math.min(waitMinutes / 15, 10);
      const priority = Math.round((ageScore * 0.3 + waitScore * 0.3 + (entry.severityScore ?? 0) * 0.4));

      await this.prisma.queueEntry.update({
        where: { id: entry.id },
        data: {
          priority,
          ageScore,
          waitTimeMinutes: waitMinutes,
        },
      });
    }

    return this.getQueue(clinicId);
  }

  async callPatient(queueEntryId: string) {
    const entry = await this.prisma.queueEntry.findUnique({ where: { id: queueEntryId } });
    if (!entry) throw new NotFoundException('Queue entry not found');
    if (entry.status !== QueueStatus.WAITING) throw new BadRequestException('Patient is not in waiting status');

    return this.prisma.queueEntry.update({
      where: { id: queueEntryId },
      data: { status: QueueStatus.IN_PROGRESS, assignedAt: new Date() },
    });
  }

  async completeVisit(queueEntryId: string) {
    return this.prisma.queueEntry.update({
      where: { id: queueEntryId },
      data: { status: QueueStatus.COMPLETED, completedAt: new Date() },
    });
  }

  private calcAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }
}
