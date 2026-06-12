/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/workspace/lab.service.ts
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
import type { CreateLabSampleDto, UpdateLabSampleDto, CreateLabResultDto, ApproveLabResultDto } from './dto/workspace.dto';
import { SampleStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class LabService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // ── Samples ──

  async createSample(dto: CreateLabSampleDto, actorId: string) {
    const sample = await this.prisma.labSample.create({
      data: {
        id: randomUUID(),
        diagnosticOrderId: dto.diagnosticOrderId,
        sampleType: dto.sampleType,
        collectedById: dto.collectedById ?? actorId,
        collectionDate: dto.collectionDate ? new Date(dto.collectionDate) : new Date(),
        status: 'COLLECTED',
        updatedAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, action: 'CREATE_LAB_SAMPLE', resourceType: 'LabSample', resourceId: sample.id });
    return sample;
  }

  async listPendingCollections() {
    const samples = await this.prisma.labSample.findMany({
      where: { status: 'PENDING_COLLECTION' },
      include: { DiagnosticOrder: { include: { user: { select: { id: true, fullName: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    return samples.map(s => ({
      ...s,
      diagnosticOrder: s.DiagnosticOrder,
    }));
  }

  async updateSample(id: string, dto: UpdateLabSampleDto) {
    const existing = await this.prisma.labSample.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lab sample not found');
    return this.prisma.labSample.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as SampleStatus | undefined,
        receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async listSamplesByOrder(diagnosticOrderId: string) {
    return this.prisma.labSample.findMany({ where: { diagnosticOrderId }, orderBy: { createdAt: 'desc' } });
  }

  async getSampleStats() {
    const samples = await this.prisma.labSample.findMany({ select: { status: true } });
    const dist: Record<string, number> = {};
    for (const s of samples) dist[s.status] = (dist[s.status] ?? 0) + 1;
    return { total: samples.length, statusDistribution: dist };
  }

  // ── Results ──

  async createResult(dto: CreateLabResultDto, actorId: string) {
    const result = await this.prisma.labResult.create({
      data: {
        id: randomUUID(),
        ...dto,
        updatedAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, action: 'CREATE_LAB_RESULT', resourceType: 'LabResult', resourceId: result.id });
    return result;
  }

  async approveResult(id: string, dto: ApproveLabResultDto) {
    const existing = await this.prisma.labResult.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lab result not found');
    return this.prisma.labResult.update({
      where: { id },
      data: {
        approvedById: dto.approvedById,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async listResultsByOrder(diagnosticOrderId: string) {
    return this.prisma.labResult.findMany({
      where: { diagnosticOrderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingResults() {
    const results = await this.prisma.labResult.findMany({
      where: { approvedById: null },
      include: { DiagnosticOrder: { include: { user: { select: { id: true, fullName: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    return results.map(r => ({
      ...r,
      diagnosticOrder: r.DiagnosticOrder,
    }));
  }

  async getResultStats() {
    const results = await this.prisma.labResult.findMany({ select: { isAbnormal: true, approvedById: true } });
    let abnormal = 0, approved = 0;
    for (const r of results) {
      if (r.isAbnormal) abnormal++;
      if (r.approvedById) approved++;
    }
    return { total: results.length, abnormal, normal: results.length - abnormal, approved, pending: results.length - approved };
  }
}
