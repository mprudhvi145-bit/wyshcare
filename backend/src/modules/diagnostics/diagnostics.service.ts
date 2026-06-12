/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/diagnostics/diagnostics.service.ts
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
 * Business logic service for diagnostics
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
 - node:crypto
 - client
 - common
 *
 * Dependencies:
 - node:crypto
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

import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { StorageService } from '../../providers/storage/storage.service';

@Injectable()
export class DiagnosticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  listPartners() {
    return this.prisma.diagnosticsPartner.findMany({ take: 25 });
  }

  listOrders(userId: string) {
    return this.prisma.diagnosticOrder.findMany({
      where: { userId },
      include: { partner: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  bookTest(userId: string, payload: Record<string, unknown>) {
    return this.prisma.diagnosticOrder.create({
      data: {
        userId,
        partnerId: payload.partnerId as string | undefined,
        testCodes: (payload.testCodes as string[]) ?? [],
        homeCollection: Boolean(payload.homeCollection),
        slotStartAt: payload.slotStartAt ? new Date(payload.slotStartAt as string) : undefined,
        slotEndAt: payload.slotEndAt ? new Date(payload.slotEndAt as string) : undefined,
        notes: payload.notes as string | undefined,
        status: 'PENDING_VERIFICATION',
      },
      include: { partner: true },
    });
  }

  async uploadReport(
    userId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    input: { reportType: string; diagnosticOrderId?: string; partnerId?: string; title?: string; summary?: string },
  ) {
    const objectKey = this.storage.buildObjectKey(userId, file.originalname);
    const extractedText = file.buffer.toString('utf8', 0, Math.min(file.buffer.length, 2048));
    const hash = createHash('sha256').update(file.buffer).digest('hex');

    await this.storage.scanObject(file.buffer, file.originalname);
    await this.storage.saveObject({
      key: objectKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    try {
      const record = await this.prisma.healthRecord.create({
        data: {
          userId,
          recordType: 'DIAGNOSTIC_REPORT',
          title: input.title ?? file.originalname,
          description: input.summary,
          source: 'DIAGNOSTICS_UPLOAD',
          sourceReferenceId: input.diagnosticOrderId,
          storageKey: objectKey,
          mimeType: file.mimetype,
          fileSize: file.size,
          extractedText,
          hash,
          recordedAt: new Date(),
        },
      });

      const report = await this.prisma.diagnosticReport.create({
        data: {
          healthRecordId: record.id,
          patientUserId: userId,
          labPartnerId: input.partnerId,
          reportType: input.reportType,
          summary: input.summary,
          recordedAt: new Date(),
        },
      });

      await this.prisma.timelineEvent.create({
        data: {
          userId,
          healthRecordId: record.id,
          type: 'REPORT',
          title: record.title,
          summary: input.summary ?? `${input.reportType} uploaded to WyshVault`,
          occurredAt: new Date(),
          metadata: {
            diagnosticReportId: report.id,
            diagnosticOrderId: input.diagnosticOrderId,
          } as Prisma.JsonObject,
        },
      });

      return { record, report };
    } catch (error) {
      await this.storage.deleteObject(objectKey);
      throw error;
    }
  }

  listReports(userId: string) {
    return this.prisma.diagnosticReport.findMany({
      where: { patientUserId: userId },
      include: { healthRecord: true },
      orderBy: { recordedAt: 'desc' },
    });
  }
}
