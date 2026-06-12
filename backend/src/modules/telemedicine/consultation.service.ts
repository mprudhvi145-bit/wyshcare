/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/telemedicine/consultation.service.ts
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

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, ConsultationMode, TimelineEventType, NotificationChannel, NotificationPriority } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { DomainEventsService } from '../../providers/events/events.service';
import { DomainEventType } from '../../providers/events/events.types';
import { LivekitService } from '../../providers/livekit/livekit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TimelineService } from '../timeline/timeline.service';
import { HealthTwinService } from '../health-twin/health-twin.service';
import { AiGraphService } from '../ai/services/ai-graph.service';
import { AiCopilotService } from '../ai/services/ai-copilot.service';
import { PreConsultContextService } from './pre-consult-context.service';

@Injectable()
export class ConsultationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly livekit: LivekitService,
    private readonly audit: AuditLogService,
    private readonly events: DomainEventsService,
    private readonly notifications: NotificationsService,
    private readonly timeline: TimelineService,
    private readonly twin: HealthTwinService,
    private readonly graph: AiGraphService,
    private readonly copilot: AiCopilotService,
    private readonly preConsult: PreConsultContextService,
  ) {}

  private mapSession(session: any) {
    if (!session) return null;
    return {
      ...session,
      recordings: session.ConsultationRecording || [],
      soapNotes: session.ConsultationSOAP || [],
      transcripts: session.ConsultationTranscript || [],
    };
  }

  async createSession(appointmentId: string, actorUserId: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.patientUserId !== actorUserId && appointment.doctorUserId !== actorUserId) {
      throw new ForbiddenException('Not authorized for this appointment');
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
        tenantId: appointment.tenantId,
      },
    });

    const isDoctor = appointment.doctorUserId === actorUserId;
    const patientToken = this.livekit.createParticipantToken(`patient-${appointment.patientUserId}`, roomName);
    const doctorToken = this.livekit.createParticipantToken(`doctor-${appointment.doctorProfileId}`, roomName);

    let preConsultContext = null;
    if (isDoctor) {
      preConsultContext = await this.preConsult.assemble(appointment.patientUserId);
    }

    await this.audit.capture({
      actorUserId,
      patientUserId: appointment.patientUserId,
      action: 'CONSULTATION_SESSION_CREATED',
      resourceType: 'CONSULTATION_SESSION',
      resourceId: session.id,
      metadata: { appointmentId, mode: appointment.consultationMode },
    });

    this.events.publish(DomainEventType.APPOINTMENT_BOOKED, {
      appointmentId,
      patientUserId: appointment.patientUserId,
      doctorProfileId: appointment.doctorProfileId,
      clinicId: appointment.clinicId ?? undefined,
      slotStartAt: appointment.slotStartAt.toISOString(),
      consultationMode: appointment.consultationMode,
      reason: appointment.reason,
    });

    return { session: this.mapSession(session), patientToken, doctorToken, preConsultContext };
  }

  async joinSession(sessionId: string, actorUserId: string) {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id: sessionId },
      include: {
        appointment: true,
        patientUser: { select: { id: true, fullName: true } },
        doctorProfile: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.patientUserId !== actorUserId && session.doctorProfile.userId !== actorUserId) {
      throw new ForbiddenException('Not authorized for this session');
    }

    if (!session.startedAt) {
      await this.prisma.consultationSession.update({
        where: { id: sessionId },
        data: { startedAt: new Date() },
      });
      await this.prisma.appointment.update({
        where: { id: session.appointmentId },
        data: { status: 'IN_PROGRESS' },
      });

      this.events.publish(DomainEventType.CONSULTATION_ENDED, {
        sessionId,
        appointmentId: session.appointmentId,
        patientUserId: session.patientUserId,
        doctorUserId: session.doctorProfile.userId,
        durationMs: 0,
      });
    }

    const isDoctor = session.doctorProfile.userId === actorUserId;
    const identity = isDoctor
      ? `doctor-${session.doctorProfileId}`
      : `patient-${session.patientUserId}`;
    const token = this.livekit.createParticipantToken(identity, session.livekitRoomName ?? `consult-${session.appointmentId}`);

    let preConsultContext = null;
    if (isDoctor) {
      preConsultContext = await this.preConsult.assemble(session.patientUserId);
    }

    await this.audit.capture({
      actorUserId,
      patientUserId: session.patientUserId,
      action: isDoctor ? 'CONSULTATION_DOCTOR_JOINED' : 'CONSULTATION_PATIENT_JOINED',
      resourceType: 'CONSULTATION_SESSION',
      resourceId: sessionId,
    });

    return { session: this.mapSession(session), token, preConsultContext };
  }

  async endSession(sessionId: string, actorUserId: string, input?: { notes?: string; recordingUrl?: string; durationSeconds?: number }) {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id: sessionId },
      include: {
        appointment: true,
        doctorProfile: { include: { user: { select: { id: true, fullName: true } } } },
        patientUser: { select: { id: true, fullName: true, phoneNumber: true } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.doctorProfile.userId !== actorUserId && session.patientUserId !== actorUserId) {
      throw new ForbiddenException('Not authorized to end this session');
    }

    const endedAt = new Date();
    const durationMs = session.startedAt ? endedAt.getTime() - session.startedAt.getTime() : 0;

    await this.prisma.consultationSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        notes: input?.notes ?? undefined,
        recordingReference: input?.recordingUrl ?? undefined,
      },
    });

    await this.prisma.appointment.update({
      where: { id: session.appointmentId },
      data: { status: 'COMPLETED' },
    });

    if (input?.recordingUrl) {
      await this.prisma.consultationRecording.create({
        data: {
          id: randomUUID(),
          consultationId: sessionId,
          storageUrl: input.recordingUrl,
          durationSeconds: input.durationSeconds,
          startedAt: session.startedAt,
          endedAt,
          tenantId: session.tenantId,
        },
      });
    }

    this.events.publish(DomainEventType.CONSULTATION_ENDED, {
      sessionId,
      appointmentId: session.appointmentId,
      patientUserId: session.patientUserId,
      doctorUserId: session.doctorProfile.userId,
      durationMs,
      recordingUrl: input?.recordingUrl,
    });

    await this.updateHealthTwinFromConsultation(session.patientUserId, session.doctorProfile.userId);

    await this.timeline.createEvent({
      userId: session.patientUserId,
      type: TimelineEventType.CONSULTATION,
      title: `Consultation with Dr. ${session.doctorProfile.user.fullName}`,
      summary: input?.notes ?? 'Consultation completed',
      occurredAt: endedAt,
      metadata: { sessionId, doctorId: session.doctorProfileId, durationMs },
    });

    await this.notifications.sendNotification({
      userId: session.patientUserId,
      templateKey: 'follow_up',
      payload: {
        patientName: session.patientUser.fullName,
        doctorName: session.doctorProfile.user.fullName,
        date: endedAt.toISOString().slice(0, 10),
      },
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
    });

    await this.audit.capture({
      actorUserId,
      patientUserId: session.patientUserId,
      action: 'CONSULTATION_ENDED',
      resourceType: 'CONSULTATION_SESSION',
      resourceId: sessionId,
      metadata: { durationMs, appointmentId: session.appointmentId },
    });

    return { endedAt, durationMs, sessionId };
  }

  async getSession(sessionId: string, actorUserId: string) {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id: sessionId },
      include: {
        appointment: {
          include: {
            patientUser: { select: { id: true, fullName: true, phoneNumber: true, wyshId: true } },
            clinic: true,
          },
        },
        doctorProfile: {
          include: { user: { select: { id: true, fullName: true } } },
        },
        patientUser: { select: { id: true, fullName: true } },
        ConsultationRecording: true,
        ConsultationTranscript: true,
        ConsultationSOAP: true,
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.patientUserId !== actorUserId && session.doctorProfile.userId !== actorUserId) {
      throw new ForbiddenException('Not authorized');
    }
    return this.mapSession(session);
  }

  async getHistory(actorUserId: string, page = 1, limit = 20) {
    const user = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      include: { roles: true, doctorProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const isDoctor = user.roles.some((r) => r.role === 'DOCTOR');
    const where: Prisma.ConsultationSessionWhereInput = isDoctor && user.doctorProfile
      ? { doctorProfileId: user.doctorProfile.id }
      : { patientUserId: actorUserId };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.consultationSession.findMany({
        where,
        include: {
          appointment: {
            include: {
              patientUser: { select: { id: true, fullName: true } },
            },
          },
          doctorProfile: { include: { user: { select: { id: true, fullName: true } } } },
          ConsultationRecording: { take: 1 },
          ConsultationSOAP: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.consultationSession.count({ where }),
    ]);

    return {
      items: items.map((i) => this.mapSession(i)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async generateSoap(sessionId: string, actorUserId: string, consultationNotes?: string, approve?: boolean) {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id: sessionId },
      include: { doctorProfile: { include: { user: true } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.doctorProfile.userId !== actorUserId) {
      throw new ForbiddenException('Only the doctor can generate SOAP notes');
    }

    const soap = await this.copilot.generateSOAP(
      consultationNotes ?? session.notes ?? '',
      session.patientUserId,
    );

    const record = await this.prisma.consultationSOAP.create({
      data: {
        id: randomUUID(),
        consultationId: sessionId,
        subjective: soap.subjective || null,
        objective: soap.objective || null,
        assessment: soap.assessment || null,
        plan: soap.plan || null,
        generatedByAI: true,
        approvedByDoctor: approve ?? false,
        approvedAt: approve ? new Date() : null,
        tenantId: session.tenantId,
      },
    });

    if (approve) {
      await this.prisma.consultationSession.update({
        where: { id: sessionId },
        data: { aiSummary: soap.assessment ?? undefined },
      });

      this.events.publish(DomainEventType.ANALYTICS_EVENT, {
        event: 'soap.generated',
        sessionId,
        patientUserId: session.patientUserId,
      });
    }

    await this.audit.capture({
      actorUserId,
      patientUserId: session.patientUserId,
      action: approve ? 'SOAP_APPROVED' : 'SOAP_GENERATED',
      resourceType: 'CONSULTATION_SOAP',
      resourceId: record.id,
    });

    return record;
  }

  async generateSummary(sessionId: string, actorUserId: string) {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id: sessionId },
      include: { doctorProfile: { include: { user: true } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.doctorProfile.userId !== actorUserId && session.patientUserId !== actorUserId) {
      throw new ForbiddenException('Not authorized');
    }

    const twin = await this.twin.getTwin(session.patientUserId);
    const summary = await this.copilot.generateConsultSummary(twin as unknown as Record<string, unknown>, session as unknown as Record<string, unknown>);

    await this.prisma.consultationSession.update({
      where: { id: sessionId },
      data: { aiSummary: summary.visitSummary },
    });

    await this.notifications.sendNotification({
      userId: session.patientUserId,
      templateKey: 'health_insight',
      payload: {
        patientName: twin.profile.name ?? 'Patient',
        insight: `Your visit summary is ready: ${summary.visitSummary?.slice(0, 200)}`,
      },
      channels: [NotificationChannel.IN_APP],
    });

    return summary;
  }

  async getPreConsultContext(appointmentId: string, actorUserId: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.doctorUserId !== actorUserId) {
      throw new ForbiddenException('Only the doctor can view pre-consult context');
    }
    return this.preConsult.assemble(appointment.patientUserId);
  }

  private async updateHealthTwinFromConsultation(patientUserId: string, doctorUserId: string) {
    try {
      const patientNode = await this.graph.getOrCreatePatientNode(patientUserId);
      const doctorProfile = await this.prisma.doctorProfile.findUnique({
        where: { userId: doctorUserId },
        select: { id: true, specialization: true },
      });
      if (!doctorProfile) return;

      const doctorNode = await this.graph.ensureNode(
        doctorUserId,
        'DOCTOR',
        doctorProfile.specialization ?? 'Doctor',
        'Consulting doctor',
        0.9,
      );

      if (patientNode.id !== doctorNode.id) {
        await this.graph.ensureEdge(patientNode.id, doctorNode.id, 'VISITED_DOCTOR', 1.0);
      }
    } catch {
      // graph update best-effort
    }
  }

  async getPatientDashboard(patientUserId: string) {
    const upcoming = await this.prisma.consultationSession.findMany({
      where: {
        patientUserId,
        startedAt: null,
      },
      include: {
        appointment: true,
        doctorProfile: { include: { user: { select: { id: true, fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const past = await this.prisma.consultationSession.findMany({
      where: {
        patientUserId,
        endedAt: { not: null },
      },
      include: {
        appointment: true,
        doctorProfile: { include: { user: { select: { id: true, fullName: true } } } },
        ConsultationRecording: { take: 1 },
        ConsultationSOAP: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      upcoming: upcoming.map((u) => this.mapSession(u)),
      past: past.map((p) => this.mapSession(p)),
    };
  }

  async getDoctorDashboard(doctorUserId: string) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
    });
    if (!doctorProfile) throw new NotFoundException('Doctor profile not found');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySessions = await this.prisma.consultationSession.findMany({
      where: {
        doctorProfileId: doctorProfile.id,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        patientUser: { select: { id: true, fullName: true } },
        appointment: true,
        ConsultationSOAP: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'asc' },
    });

    const waiting = todaySessions.filter((s) => s.waitingRoomOpenAt && !s.startedAt && !s.endedAt);

    const soapDrafts = await this.prisma.consultationSOAP.findMany({
      where: {
        ConsultationSession: { doctorProfileId: doctorProfile.id },
        approvedByDoctor: false,
      },
      include: {
        ConsultationSession: {
          include: { patientUser: { select: { id: true, fullName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      todayQueue: todaySessions.map((s) => this.mapSession(s)),
      waitingRoom: waiting.map((s) => this.mapSession(s)),
      soapDrafts,
      totalToday: todaySessions.length,
      completedToday: todaySessions.filter((s) => s.endedAt).length,
    };
  }
}
