/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ehr/encounter.service.ts
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
 * Business logic service for ehr
 *
 * Responsibilities:
 * - Execute business logic for ehr operations
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
EHR
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
import { randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import type { CreateEncounterDto, UpdateEncounterDto, CreateEncounterDiagnosisDto } from './dto/ehr.dto';

@Injectable()
export class EncounterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async listEncounters(patientId: string) {
    return this.prisma.encounter.findMany({
      where: { patientId },
      orderBy: { periodStart: 'desc' },
      include: {
        EncounterDiagnosis: { include: { Condition: true } },
        ClinicalDocument: true,
        _count: { select: { EncounterOrder: true, EncounterNote: true } },
      },
    });
  }

  async getEncounter(id: string) {
    const encounter = await this.prisma.encounter.findUnique({
      where: { id },
      include: {
        EncounterDiagnosis: { include: { Condition: true } },
        EncounterProcedure: { include: { ProcedureRecord: true } },
        EncounterOrder: { include: { ClinicalOrder: true } },
        EncounterNote: { include: { ClinicalNote: true } },
        ClinicalDocument: true,
        User_Encounter_patientIdToUser: { select: { id: true, fullName: true } },
        User_Encounter_providerIdToUser: { select: { id: true, fullName: true } },
      },
    });
    if (!encounter) throw new NotFoundException('Encounter not found');
    return encounter;
  }

  async createEncounter(dto: CreateEncounterDto, actorId: string) {
    const encounter = await this.prisma.encounter.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        encounterClass: dto.encounterClass,
        periodStart: new Date(dto.periodStart),
        periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : undefined,
        reason: dto.reason,
        reasonCode: dto.reasonCode,
        location: dto.location,
        providerId: dto.providerId,
        consultationSessionId: dto.consultationSessionId,
        updatedAt: new Date(),
      },
    });
    await this.prisma.timelineEvent.create({
      data: {
        userId: dto.patientId,
        type: 'ENCOUNTER',
        title: `Encounter: ${dto.encounterClass}`,
        summary: dto.reason ?? 'No reason recorded',
        occurredAt: new Date(),
        metadata: { encounterClass: dto.encounterClass },
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'CREATE_ENCOUNTER', resourceType: 'Encounter', resourceId: encounter.id });
    return encounter;
  }

  async updateEncounter(id: string, dto: UpdateEncounterDto, actorId: string) {
    const existing = await this.prisma.encounter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Encounter not found');
    const encounter = await this.prisma.encounter.update({
      where: { id },
      data: {
        ...dto,
        periodStart: dto.periodStart ? new Date(dto.periodStart) : undefined,
        periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : undefined,
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'UPDATE_ENCOUNTER', resourceType: 'Encounter', resourceId: id });
    return encounter;
  }

  async closeEncounter(id: string, actorId: string) {
    const existing = await this.prisma.encounter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Encounter not found');
    const encounter = await this.prisma.encounter.update({
      where: { id },
      data: { status: 'FINISHED', periodEnd: new Date() },
    });
    await this.prisma.timelineEvent.create({
      data: {
        userId: existing.patientId,
        type: 'ENCOUNTER_CLOSED',
        title: 'Encounter closed',
        summary: existing.reason ?? '',
        occurredAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'CLOSE_ENCOUNTER', resourceType: 'Encounter', resourceId: id });
    return encounter;
  }

  async cancelEncounter(id: string, actorId: string) {
    const existing = await this.prisma.encounter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Encounter not found');
    const encounter = await this.prisma.encounter.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'CANCEL_ENCOUNTER', resourceType: 'Encounter', resourceId: id });
    return encounter;
  }

  // ── Encounter Diagnoses ──

  async addDiagnosis(dto: CreateEncounterDiagnosisDto, actorId: string) {
    const encounter = await this.prisma.encounter.findUnique({ where: { id: dto.encounterId }, select: { patientId: true } });
    const diagnosis = await this.prisma.encounterDiagnosis.create({
      data: {
        id: randomUUID(),
        ...dto,
      },
    });
    if (encounter) {
      await this.prisma.timelineEvent.create({
        data: {
          userId: encounter.patientId,
          type: 'ENCOUNTER_DIAGNOSIS',
          title: 'Diagnosis added to encounter',
          summary: dto.notes ?? '',
          occurredAt: new Date(),
        },
      });
    }
    await this.auditLog.capture({ actorUserId: actorId, action: 'ADD_ENCOUNTER_DIAGNOSIS', resourceType: 'EncounterDiagnosis', resourceId: diagnosis.id });
    return this.prisma.encounterDiagnosis.findUnique({ where: { id: diagnosis.id }, include: { Condition: true } });
  }

  async removeDiagnosis(id: string, actorId: string) {
    const existing = await this.prisma.encounterDiagnosis.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Encounter diagnosis not found');
    await this.prisma.encounterDiagnosis.delete({ where: { id } });
    await this.auditLog.capture({ actorUserId: actorId, action: 'REMOVE_ENCOUNTER_DIAGNOSIS', resourceType: 'EncounterDiagnosis', resourceId: id });
  }

  async listEncountersByProvider(providerId: string) {
    return this.prisma.encounter.findMany({
      where: { providerId },
      orderBy: { periodStart: 'desc' },
      include: {
        User_Encounter_patientIdToUser: { select: { id: true, fullName: true } },
        EncounterDiagnosis: { include: { Condition: true } },
        _count: { select: { EncounterOrder: true, EncounterNote: true } },
      },
      take: 50,
    });
  }

  async getEncounterStats() {
    const encounters = await this.prisma.encounter.findMany({ select: { encounterClass: true, status: true } });
    const classDist: Record<string, number> = {};
    const statusDist: Record<string, number> = {};
    for (const e of encounters) {
      classDist[e.encounterClass] = (classDist[e.encounterClass] ?? 0) + 1;
      statusDist[e.status] = (statusDist[e.status] ?? 0) + 1;
    }
    return { total: encounters.length, classDistribution: classDist, statusDistribution: statusDist };
  }
}
