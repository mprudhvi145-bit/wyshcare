/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/vault/vault.service.ts
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
 * Business logic service for vault
 *
 * Responsibilities:
 * - Execute business logic for health locker operations
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
Health Locker
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

import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { AuditLogService } from '../../common/services/audit-log.service';
import { EncryptionService } from '../../common/encryption/encryption.service';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { StorageService } from '../../providers/storage/storage.service';

@Injectable()
export class VaultService {
  private readonly allowedMimeTypes = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
  ]);
  private readonly maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES ?? 10 * 1024 * 1024);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly auditLog: AuditLogService,
    private readonly encryptionService: EncryptionService,
  ) {}

  list(userId: string) {
    return this.prisma.healthRecord.findMany({
      where: { userId, deletedAt: null },
      orderBy: { recordedAt: 'desc' },
      include: { diagnostics: true, medications: true },
    });
  }

  async createRecord(userId: string, input: { title: string; recordType: string; description?: string }) {
    const objectKey = this.storage.buildObjectKey(userId, `${input.title}.json`);
    const record = await this.prisma.healthRecord.create({
      data: {
        userId,
        title: input.title,
        recordType: input.recordType as never,
        description: input.description,
        source: 'MANUAL_UPLOAD',
        storageKey: objectKey,
        recordedAt: new Date(),
      },
    });

    await this.prisma.timelineEvent.create({
      data: {
        userId,
        healthRecordId: record.id,
        type: 'UPLOAD',
        title: record.title,
        summary: record.description ?? `${record.recordType} added to WyshVault`,
        occurredAt: new Date(),
      },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'RECORD_CREATED',
      resourceType: 'HealthRecord',
      resourceId: record.id,
      metadata: { recordType: input.recordType, source: 'MANUAL_UPLOAD' },
    });

    return record;
  }

  async uploadRecord(
    userId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    input: { title?: string; recordType: string; description?: string },
  ) {
    if (!file?.buffer?.length) {
      throw new Error('No upload file provided');
    }

    if (!this.allowedMimeTypes.has(file.mimetype)) {
      throw new Error(`Unsupported upload type: ${file.mimetype}`);
    }

    if (file.size > this.maxUploadBytes) {
      throw new Error(`Upload exceeds max size of ${this.maxUploadBytes} bytes`);
    }

    await this.storage.scanObject(file.buffer, file.originalname);

    const objectKey = this.storage.buildObjectKey(userId, file.originalname);
    const extractedText = file.buffer.toString('utf8', 0, Math.min(file.buffer.length, 2048));
    const hash = createHash('sha256').update(file.buffer).digest('hex');

    // Encrypt the file
    const dek = randomBytes(32); // 256-bit key
    const { iv, authTag, ciphertext } = this.encryptionService.encryptBuffer(file.buffer, 'file-content');
    const encryptedDek = this.encryptionService.encrypt(dek.toString('base64'), 'dek');

    await this.storage.saveObject({
      key: objectKey,
      body: ciphertext,
      contentType: file.mimetype,
    });

    try {
       const record = await this.prisma.healthRecord.create({
         data: {
           userId,
           title: input.title || file.originalname,
           recordType: input.recordType as never,
           description: input.description,
           source: 'FILE_UPLOAD',
           storageKey: objectKey,
           mimeType: file.mimetype,
           fileSize: file.size,
           extractedText,
           hash,
           encryptedDek,
           fileIv: iv.toString('base64'),
           fileAuthTag: authTag.toString('base64'),
           recordedAt: new Date(),
         },
       });

      await this.prisma.timelineEvent.create({
        data: {
          userId,
          healthRecordId: record.id,
          type: 'UPLOAD',
          title: record.title,
          summary: `Uploaded ${record.recordType.toLowerCase().replaceAll('_', ' ')} to WyshVault`,
          occurredAt: new Date(),
          metadata: {
            mimeType: file.mimetype,
            fileSize: file.size,
          } as Prisma.JsonObject,
        },
      });

      await this.auditLog.capture({
        actorUserId: userId,
        patientUserId: userId,
        action: 'RECORD_UPLOADED',
        resourceType: 'HealthRecord',
        resourceId: record.id,
        metadata: { mimeType: file.mimetype, fileSize: file.size, originalName: file.originalname },
      });

      return record;
    } catch (error) {
      await this.storage.deleteObject(objectKey);
      throw error;
    }
  }

  listPrescriptions(userId: string) {
    return this.prisma.prescription.findMany({
      where: { patientUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        medications: true,
        doctorProfile: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getDownloadLink(userId: string, recordId: string) {
    const record = await this.prisma.healthRecord.findFirstOrThrow({
      where: {
        id: recordId,
        userId,
        deletedAt: null,
      },
    });

    if (!record.storageKey) {
      throw new Error('Record has no stored file');
    }

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: record.userId,
      action: 'RECORD_DOWNLOAD_LINK_GENERATED',
      resourceType: 'HealthRecord',
      resourceId: record.id,
    });

    return {
      url: await this.storage.getDownloadUrl(record.id, record.storageKey),
      expiresIn: 300,
    };
  }

  async downloadRecord(recordId: string, signature: string, expiresAt: number) {
    const record = await this.prisma.healthRecord.findUniqueOrThrow({
      where: { id: recordId },
    });

    if (!record.storageKey) {
      throw new Error('Record has no stored file');
    }

    this.storage.assertValidDownload(record.id, record.storageKey, expiresAt, signature);

    await this.auditLog.capture({
      actorUserId: undefined,
      patientUserId: record.userId,
      action: 'RECORD_DOWNLOADED',
      resourceType: 'HealthRecord',
      resourceId: record.id,
    });

    const encryptedBuffer = await this.storage.loadObject(record.storageKey);
    // Decrypt DEK
    const dekEncrypted = record.encryptedDek ?? '';
    const dekBase64 = this.encryptionService.decrypt(dekEncrypted, 'dek');
    const dek = Buffer.from(dekBase64, 'base64');
    // Decrypt file
    const iv = Buffer.from(record.fileIv ?? '', 'base64');
    const authTag = Buffer.from(record.fileAuthTag ?? '', 'base64');
    const decryptedBuffer = this.encryptionService.decryptBuffer(
      { iv, authTag, ciphertext: encryptedBuffer },
      'file-content',
    );

    return {
      record,
      body: decryptedBuffer,
    };
  }
}
