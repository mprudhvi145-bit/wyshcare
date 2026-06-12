/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/workspace/nurse.service.ts
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
 * Business logic service for workspace
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { MedAdminStatus, TaskPriority, TaskStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import type {
  RecordVitalsDto, CreateMedicationAdministrationDto, AdministerMedicationDto,
  CreateCareTaskDto, UpdateCareTaskDto, CreateShiftHandoverDto,
} from './dto/workspace.dto';

@Injectable()
export class NurseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // ── Vitals ──

  async recordVitals(dto: RecordVitalsDto, actorId: string) {
    const bmi = dto.weight && dto.height ? dto.weight / ((dto.height / 100) ** 2) : undefined;
    const vitals = await this.prisma.vitalsRecord.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        recordedById: actorId,
        bpSystolic: dto.bpSystolic, bpDiastolic: dto.bpDiastolic,
        heartRate: dto.heartRate, temperature: dto.temperature,
        spo2: dto.spo2, respiratoryRate: dto.respiratoryRate,
        weight: dto.weight, height: dto.height, bmi,
        painScore: dto.painScore, notes: dto.notes,
        updatedAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'RECORD_VITALS', resourceType: 'VitalsRecord', resourceId: vitals.id });
    return vitals;
  }

  async getVitals(patientId: string, days?: number) {
    const since = days ? new Date(Date.now() - days * 86400000) : undefined;
    return this.prisma.vitalsRecord.findMany({
      where: { patientId, ...(since ? { recordedAt: { gte: since } } : {}) },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });
  }

  async getLatestVitals(patientId: string) {
    return this.prisma.vitalsRecord.findFirst({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  // ── Medication Administration ──

  async scheduleMedication(dto: CreateMedicationAdministrationDto, _actorId: string) {
    return this.prisma.medicationAdministration.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        medicationName: dto.medicationName,
        dose: dto.dose,
        route: dto.route ?? 'ORAL',
        scheduledTime: new Date(dto.scheduledTime),
        medicationOrderId: dto.medicationOrderId,
        updatedAt: new Date(),
      },
    });
  }

  async getScheduledMeds(patientId: string) {
    return this.prisma.medicationAdministration.findMany({
      where: { patientId, status: 'SCHEDULED' },
      orderBy: { scheduledTime: 'asc' },
    });
  }

  async administerMedication(id: string, dto: AdministerMedicationDto, actorId: string) {
    const existing = await this.prisma.medicationAdministration.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Medication administration not found');
    return this.prisma.medicationAdministration.update({
      where: { id },
      data: {
        status: (dto.status as MedAdminStatus) ?? MedAdminStatus.ADMINISTERED,
        administeredTime: dto.administeredTime ? new Date(dto.administeredTime) : new Date(),
        administeredById: actorId,
        skippedReason: dto.skippedReason,
        notes: dto.notes,
        updatedAt: new Date(),
      },
    });
  }

  async getMedicationHistory(patientId: string) {
    return this.prisma.medicationAdministration.findMany({
      where: { patientId },
      orderBy: { scheduledTime: 'desc' },
      take: 50,
    });
  }

  // ── Care Tasks ──

  async createTask(dto: CreateCareTaskDto) {
    return this.prisma.careTask.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        assignedToId: dto.assignedToId,
        taskType: dto.taskType,
        description: dto.description,
        priority: (dto.priority as TaskPriority) ?? TaskPriority.MEDIUM,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async listTasks(nurseId: string, status?: string) {
    return this.prisma.careTask.findMany({
      where: { assignedToId: nurseId, ...(status ? { status: status as TaskStatus } : {}) },
      orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
    });
  }

  async updateTask(id: string, dto: UpdateCareTaskDto, actorId: string) {
    const existing = await this.prisma.careTask.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Care task not found');
    return this.prisma.careTask.update({
      where: { id },
      data: {
        status: dto.status as TaskStatus,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : dto.status === 'COMPLETED' ? new Date() : undefined,
        completedById: dto.status === 'COMPLETED' ? actorId : undefined,
        notes: dto.notes,
        updatedAt: new Date(),
      },
    });
  }

  async getPatientTasks(patientId: string) {
    return this.prisma.careTask.findMany({
      where: { patientId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
      orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
    });
  }

  // ── Shift Handover ──

  async createHandover(dto: CreateShiftHandoverDto) {
    return this.prisma.shiftHandover.create({
      data: {
        id: randomUUID(),
        fromUserId: dto.fromUserId,
        toUserId: dto.toUserId,
        ward: dto.ward,
        patientCount: dto.patientCount,
        notes: dto.notes,
        criticalAlerts: dto.criticalAlerts,
      },
    });
  }

  async getHandovers(userId: string) {
    return this.prisma.shiftHandover.findMany({
      where: { toUserId: userId },
      orderBy: { handoverAt: 'desc' },
      take: 20,
    });
  }

  async acknowledgeHandover(id: string) {
    const existing = await this.prisma.shiftHandover.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Handover not found');
    return this.prisma.shiftHandover.update({
      where: { id },
      data: { acknowledgedAt: new Date() },
    });
  }
}
