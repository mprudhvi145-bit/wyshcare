/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/telemedicine/telemedicine.service.ts
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
 * Business logic service for telemedicine
 *
 * Responsibilities:
 * - Execute business logic for telemedicine operations
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
Telemedicine
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
import { AppointmentStatus, ConsultationMode } from '@prisma/client';

import { AuditLogService } from '../../common/services/audit-log.service';
import { LivekitService } from '../../providers/livekit/livekit.service';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class TelemedicineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly livekitService: LivekitService,
    private readonly auditLog: AuditLogService,
  ) {}

  listAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: { patientUserId: userId },
      include: {
        doctorProfile: {
          include: { user: true },
        },
        clinic: true,
        consultationSession: true,
      },
      orderBy: { slotStartAt: 'asc' },
      take: 20,
    });
  }

  async createAppointment(
    userId: string,
    input: {
      doctorProfileId: string;
      consultationMode: ConsultationMode;
      reason: string;
      slotStartAt: string;
      slotEndAt?: string;
      clinicId?: string;
    },
  ) {
    const doctor = await this.prisma.doctorProfile.findUniqueOrThrow({
      where: { id: input.doctorProfileId },
    });

    const slotStartAt = new Date(input.slotStartAt);
    const slotEndAt = input.slotEndAt ? new Date(input.slotEndAt) : new Date(slotStartAt.getTime() + 30 * 60_000);

    const appointment = await this.prisma.appointment.create({
      data: {
        patientUserId: userId,
        doctorProfileId: doctor.id,
        doctorUserId: doctor.userId,
        clinicId: input.clinicId,
        consultationMode: input.consultationMode,
        status: AppointmentStatus.CONFIRMED,
        reason: input.reason,
        slotStartAt,
        slotEndAt,
      },
      include: {
        doctorProfile: {
          include: { user: true },
        },
        clinic: true,
      },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'APPOINTMENT_BOOKED',
      resourceType: 'Appointment',
      resourceId: appointment.id,
      metadata: { consultationMode: input.consultationMode, doctorProfileId: input.doctorProfileId },
    });

    return appointment;
  }

  async createSession(appointmentId: string, accessorUserId: string) {
    const appointment = await this.prisma.appointment.findUniqueOrThrow({
      where: { id: appointmentId },
    });

    if (appointment.patientUserId !== accessorUserId && appointment.doctorUserId !== accessorUserId) {
      throw new Error('You do not have access to this appointment session');
    }

    const roomName = `consult-${appointment.id}`;
    const session = await this.prisma.consultationSession.upsert({
      where: { appointmentId },
      update: { livekitRoomName: roomName, waitingRoomOpenAt: new Date() },
      create: {
        appointmentId,
        doctorProfileId: appointment.doctorProfileId,
        patientUserId: appointment.patientUserId,
        mode: appointment.consultationMode,
        livekitRoomName: roomName,
        waitingRoomOpenAt: new Date(),
      },
    });

    return {
      session,
      patientToken: this.livekitService.createParticipantToken(`patient-${appointment.patientUserId}`, roomName),
      doctorToken: this.livekitService.createParticipantToken(`doctor-${appointment.doctorProfileId}`, roomName),
    };
  }
}
