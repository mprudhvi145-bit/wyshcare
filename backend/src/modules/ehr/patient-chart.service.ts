/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ehr/patient-chart.service.ts
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
 * - Execute business logic for patient operations
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
Patient
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
import type { CreateAllergyDto, UpdateAllergyDto, CreateConditionDto, UpdateConditionDto, CreateProcedureDto, CreateImmunizationDto, CreateClinicalDocumentDto } from './dto/ehr.dto';

@Injectable()
export class PatientChartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // ── Allergies ──

  async listAllergies(patientId: string) {
    return this.prisma.allergy.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllergy(id: string) {
    const allergy = await this.prisma.allergy.findUnique({ where: { id } });
    if (!allergy) throw new NotFoundException('Allergy not found');
    return allergy;
  }

  async createAllergy(dto: CreateAllergyDto, actorId: string) {
    const allergy = await this.prisma.allergy.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        allergen: dto.allergen,
        reaction: dto.reaction,
        severity: dto.severity ?? 'MILD',
        onsetDate: dto.onsetDate ? new Date(dto.onsetDate) : undefined,
        notes: dto.notes,
        verifiedById: actorId,
        updatedAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'CREATE_ALLERGY', resourceType: 'Allergy', resourceId: allergy.id });
    return allergy;
  }

  async updateAllergy(id: string, dto: UpdateAllergyDto, actorId: string) {
    const existing = await this.prisma.allergy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Allergy not found');
    const allergy = await this.prisma.allergy.update({
      where: { id },
      data: {
        ...dto,
        onsetDate: dto.onsetDate ? new Date(dto.onsetDate) : undefined,
        verifiedById: dto.status !== undefined ? actorId : undefined,
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'UPDATE_ALLERGY', resourceType: 'Allergy', resourceId: id });
    return allergy;
  }

  async deleteAllergy(id: string, actorId: string) {
    const existing = await this.prisma.allergy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Allergy not found');
    await this.prisma.allergy.delete({ where: { id } });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'DELETE_ALLERGY', resourceType: 'Allergy', resourceId: id });
  }

  async getAllergyStats() {
    const allergies = await this.prisma.allergy.findMany({ select: { severity: true, status: true, allergen: true } });
    const severityDist: Record<string, number> = {};
    const statusDist: Record<string, number> = {};
    for (const a of allergies) {
      severityDist[a.severity] = (severityDist[a.severity] ?? 0) + 1;
      statusDist[a.status] = (statusDist[a.status] ?? 0) + 1;
    }
    return { total: allergies.length, severityDistribution: severityDist, statusDistribution: statusDist };
  }

  // ── Conditions ──

  async listConditions(patientId: string) {
    return this.prisma.condition.findMany({
      where: { patientId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getCondition(id: string) {
    const condition = await this.prisma.condition.findUnique({ where: { id } });
    if (!condition) throw new NotFoundException('Condition not found');
    return condition;
  }

  async createCondition(dto: CreateConditionDto, actorId: string) {
    const condition = await this.prisma.condition.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        icdCode: dto.icdCode,
        codeSystem: dto.codeSystem ?? 'ICD-10-EN',
        displayName: dto.displayName,
        bodySite: dto.bodySite,
        onsetDate: dto.onsetDate ? new Date(dto.onsetDate) : undefined,
        resolutionDate: dto.resolutionDate ? new Date(dto.resolutionDate) : undefined,
        status: dto.status ?? 'ACTIVE',
        clinicalStatus: dto.clinicalStatus ?? 'ACTIVE',
        severity: dto.severity,
        notes: dto.notes,
        verifiedById: actorId,
        updatedAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'CREATE_CONDITION', resourceType: 'Condition', resourceId: condition.id });
    return condition;
  }

  async updateCondition(id: string, dto: UpdateConditionDto, actorId: string) {
    const existing = await this.prisma.condition.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Condition not found');
    const condition = await this.prisma.condition.update({
      where: { id },
      data: {
        ...dto,
        onsetDate: dto.onsetDate ? new Date(dto.onsetDate) : undefined,
        resolutionDate: dto.resolutionDate ? new Date(dto.resolutionDate) : undefined,
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'UPDATE_CONDITION', resourceType: 'Condition', resourceId: id });
    return condition;
  }

  async deleteCondition(id: string, actorId: string) {
    const existing = await this.prisma.condition.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Condition not found');
    await this.prisma.condition.delete({ where: { id } });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'DELETE_CONDITION', resourceType: 'Condition', resourceId: id });
  }

  async getConditionStats() {
    const conditions = await this.prisma.condition.findMany({ select: { status: true, severity: true, icdCode: true } });
    const statusDist: Record<string, number> = {};
    const icdDist: Record<string, number> = {};
    for (const c of conditions) {
      statusDist[c.status] = (statusDist[c.status] ?? 0) + 1;
      if (c.icdCode) icdDist[c.icdCode] = (icdDist[c.icdCode] ?? 0) + 1;
    }
    return { total: conditions.length, statusDistribution: statusDist, topICDCodes: Object.entries(icdDist).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([code, count]) => ({ code, count })) };
  }

  // ── Procedures ──

  async listProcedures(patientId: string) {
    return this.prisma.procedureRecord.findMany({
      where: { patientId },
      orderBy: { performedDate: 'desc' },
    });
  }

  async getProcedure(id: string) {
    const proc = await this.prisma.procedureRecord.findUnique({ where: { id } });
    if (!proc) throw new NotFoundException('Procedure not found');
    return proc;
  }

  async createProcedure(dto: CreateProcedureDto, actorId: string) {
    const proc = await this.prisma.procedureRecord.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        code: dto.code,
        codeSystem: dto.codeSystem ?? 'SNOMED',
        displayName: dto.displayName,
        bodySite: dto.bodySite,
        performedDate: dto.performedDate ? new Date(dto.performedDate) : undefined,
        performerId: dto.performerId,
        outcome: dto.outcome,
        complications: dto.complications,
        notes: dto.notes,
        updatedAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'CREATE_PROCEDURE', resourceType: 'ProcedureRecord', resourceId: proc.id });
    return proc;
  }

  async getProcedureStats() {
    const procs = await this.prisma.procedureRecord.findMany({ select: { outcome: true, code: true } });
    const outcomeDist: Record<string, number> = {};
    for (const p of procs) {
      if (p.outcome) outcomeDist[p.outcome] = (outcomeDist[p.outcome] ?? 0) + 1;
    }
    return { total: procs.length, outcomeDistribution: outcomeDist };
  }

  // ── Immunizations ──

  async listImmunizations(patientId: string) {
    return this.prisma.immunization.findMany({
      where: { patientId },
      orderBy: { administeredDate: 'desc' },
    });
  }

  async createImmunization(dto: CreateImmunizationDto, actorId: string) {
    const imm = await this.prisma.immunization.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        vaccineName: dto.vaccineName,
        cvxCode: dto.cvxCode,
        manufacturer: dto.manufacturer,
        lotNumber: dto.lotNumber,
        doseNumber: dto.doseNumber,
        doseSeries: dto.doseSeries,
        administrationSite: dto.administrationSite,
        route: dto.route,
        administeredDate: new Date(dto.administeredDate),
        administeredById: actorId,
        notes: dto.notes,
        updatedAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'CREATE_IMMUNIZATION', resourceType: 'Immunization', resourceId: imm.id });
    return imm;
  }

  async getImmunizationStats() {
    const imms = await this.prisma.immunization.findMany({ select: { vaccineName: true } });
    const vaccineDist: Record<string, number> = {};
    for (const i of imms) {
      vaccineDist[i.vaccineName] = (vaccineDist[i.vaccineName] ?? 0) + 1;
    }
    return { total: imms.length, vaccineDistribution: vaccineDist };
  }

  // ── Clinical Documents ──

  async listDocuments(patientId: string, documentType?: string) {
    return this.prisma.clinicalDocument.findMany({
      where: { patientId, ...(documentType ? { documentType } : {}), status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDocument(dto: CreateClinicalDocumentDto, actorId: string) {
    const doc = await this.prisma.clinicalDocument.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        documentType: dto.documentType,
        title: dto.title,
        storageKey: dto.storageKey,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        description: dto.description,
        tags: dto.tags ?? [],
        uploadedById: actorId,
        encounterId: dto.encounterId,
        updatedAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'CREATE_DOCUMENT', resourceType: 'ClinicalDocument', resourceId: doc.id });
    return doc;
  }

  async deleteDocument(id: string, actorId: string) {
    const existing = await this.prisma.clinicalDocument.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Document not found');
    await this.prisma.clinicalDocument.update({ where: { id }, data: { status: 'ARCHIVED' } });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'ARCHIVE_DOCUMENT', resourceType: 'ClinicalDocument', resourceId: id });
  }

  async getDocumentStats() {
    const docs = await this.prisma.clinicalDocument.findMany({ select: { documentType: true, mimeType: true } });
    const typeDist: Record<string, number> = {};
    for (const d of docs) {
      typeDist[d.documentType] = (typeDist[d.documentType] ?? 0) + 1;
    }
    return { total: docs.length, typeDistribution: typeDist };
  }
}
