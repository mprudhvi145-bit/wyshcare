/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ehr/clinical-notes.service.ts
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
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import type { CreateClinicalNoteDto, UpdateClinicalNoteDto } from './dto/ehr.dto';

@Injectable()
export class ClinicalNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async listNotes(patientId: string, noteType?: string) {
    return this.prisma.clinicalNote.findMany({
      where: { patientId, ...(noteType ? { noteType: noteType as Prisma.ClinicalNoteCreateInput['noteType'] } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getNote(id: string) {
    const note = await this.prisma.clinicalNote.findUnique({
      where: { id },
      include: {
        User_ClinicalNote_authoredByIdToUser: { select: { id: true, fullName: true } },
        User_ClinicalNote_signedByIdToUser: { select: { id: true, fullName: true } },
      },
    });
    if (!note) throw new NotFoundException('Clinical note not found');
    return note;
  }

  async createNote(dto: CreateClinicalNoteDto, actorId: string) {
    const note = await this.prisma.clinicalNote.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        noteType: dto.noteType,
        title: dto.title,
        content: JSON.parse(JSON.stringify(dto.content)),
        authoredById: dto.authoredById,
        parentNoteId: dto.parentNoteId,
        updatedAt: new Date(),
      },
    });
    await this.prisma.timelineEvent.create({
      data: {
        userId: dto.patientId,
        type: 'NOTE',
        title: `Note: ${dto.noteType}`,
        summary: dto.title ?? `${dto.noteType} note created`,
        occurredAt: new Date(),
        metadata: { noteType: dto.noteType },
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'CREATE_CLINICAL_NOTE', resourceType: 'ClinicalNote', resourceId: note.id });
    return note;
  }

  async updateNote(id: string, dto: UpdateClinicalNoteDto, actorId: string) {
    const existing = await this.prisma.clinicalNote.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Clinical note not found');

    const updateData: Record<string, unknown> = { ...dto };
    if (dto.content) updateData.content = JSON.parse(JSON.stringify(dto.content));
    if (dto.isSigned) {
      updateData.signedAt = new Date().toISOString();
      updateData.signedById = dto.signedById ?? actorId;

      await this.prisma.timelineEvent.create({
        data: {
          userId: existing.patientId,
          type: 'NOTE',
          title: `Note signed: ${existing.noteType}`,
          summary: `Clinical note ${id} signed`,
          occurredAt: new Date(),
        },
      });
    }
    if (dto.signedAt) updateData.signedAt = new Date(dto.signedAt);

    const note = await this.prisma.clinicalNote.update({ where: { id }, data: updateData });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'UPDATE_CLINICAL_NOTE', resourceType: 'ClinicalNote', resourceId: id });
    return note;
  }

  async signNote(id: string, actorId: string) {
    const existing = await this.prisma.clinicalNote.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Clinical note not found');
    const note = await this.prisma.clinicalNote.update({
      where: { id },
      data: { isSigned: true, signedAt: new Date(), signedById: actorId },
    });
    await this.prisma.timelineEvent.create({
      data: {
        userId: existing.patientId,
        type: 'NOTE',
        title: `Note signed: ${existing.noteType}`,
        summary: `Clinical note ${id} signed`,
        occurredAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'SIGN_NOTE', resourceType: 'ClinicalNote', resourceId: id });
    return note;
  }

  async deleteNote(id: string, actorId: string) {
    const existing = await this.prisma.clinicalNote.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Clinical note not found');
    await this.prisma.clinicalNote.delete({ where: { id } });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'DELETE_NOTE', resourceType: 'ClinicalNote', resourceId: id });
  }

  async getNoteStats() {
    const notes = await this.prisma.clinicalNote.findMany({ select: { noteType: true, isSigned: true } });
    const typeDist: Record<string, number> = {};
    let signed = 0;
    for (const n of notes) {
      typeDist[n.noteType] = (typeDist[n.noteType] ?? 0) + 1;
      if (n.isSigned) signed++;
    }
    return { total: notes.length, signed, unsigned: notes.length - signed, typeDistribution: typeDist };
  }
}
