/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ehr/cds.service.ts
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
import type { CreateCDSAlertDto, DismissCDSAlertDto } from './dto/ehr.dto';

@Injectable()
export class CDSService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async listAlerts(patientId: string, alertType?: string) {
    return this.prisma.cDSAlert.findMany({
      where: {
        patientId,
        ...(alertType ? { alertType: alertType as Prisma.CDSAlertCreateInput['alertType'] } : {}),
        dismissedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAlert(id: string) {
    const alert = await this.prisma.cDSAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('CDS alert not found');
    return alert;
  }

  async createAlert(dto: CreateCDSAlertDto, actorId: string) {
    const alert = await this.prisma.cDSAlert.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        alertType: dto.alertType,
        severity: dto.severity ?? 'MODERATE',
        title: dto.title,
        description: dto.description,
        triggeredById: dto.triggeredById,
        triggeredByType: dto.triggeredByType,
        orderId: dto.orderId,
        updatedAt: new Date(),
      },
    });
    await this.prisma.timelineEvent.create({
      data: {
        userId: dto.patientId,
        type: 'NOTE',
        title: `Alert: ${dto.title}`,
        summary: dto.description,
        occurredAt: new Date(),
        metadata: { alertType: dto.alertType, severity: dto.severity },
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'CREATE_CDS_ALERT', resourceType: 'CDSAlert', resourceId: alert.id });
    return alert;
  }

  async dismissAlert(id: string, dto: DismissCDSAlertDto, actorId: string) {
    const existing = await this.prisma.cDSAlert.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('CDS alert not found');
    const alert = await this.prisma.cDSAlert.update({
      where: { id },
      data: { dismissedAt: new Date(), dismissedById: dto.dismissedById ?? actorId, dismissedReason: dto.reason },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'DISMISS_CDS_ALERT', resourceType: 'CDSAlert', resourceId: id });
    return alert;
  }

  async resolveAlert(id: string, actorId: string) {
    const existing = await this.prisma.cDSAlert.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('CDS alert not found');
    const alert = await this.prisma.cDSAlert.update({
      where: { id },
      data: { resolvedAt: new Date() },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'RESOLVE_CDS_ALERT', resourceType: 'CDSAlert', resourceId: id });
    return alert;
  }

  async listAlertsByType(alertType: string) {
    return this.prisma.cDSAlert.findMany({
      where: { alertType: alertType as Prisma.CDSAlertCreateInput['alertType'], dismissedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        User_CDSAlert_patientIdToUser: { select: { id: true, fullName: true } },
      },
      take: 50,
    });
  }

  async getAlertStats() {
    const alerts = await this.prisma.cDSAlert.findMany({ select: { alertType: true, severity: true, dismissedAt: true, resolvedAt: true } });
    const typeDist: Record<string, number> = {};
    const severityDist: Record<string, number> = {};
    let active = 0;
    for (const a of alerts) {
      typeDist[a.alertType] = (typeDist[a.alertType] ?? 0) + 1;
      severityDist[a.severity] = (severityDist[a.severity] ?? 0) + 1;
      if (!a.dismissedAt && !a.resolvedAt) active++;
    }
    return { total: alerts.length, active, resolved: alerts.length - active, typeDistribution: typeDist, severityDistribution: severityDist };
  }
}
