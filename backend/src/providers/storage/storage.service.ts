/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/storage/storage.service.ts
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
 * Business logic service for storage
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/ai/ai.service.ts
 - backend/src/modules/ai-risk/services/assessors/hypertension-risk.assessor.ts
 - backend/src/providers/observability/observability.module.ts
 - backend/src/modules/dashboard/dashboard.service.ts
 - backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts
 - backend/src/modules/consent/consent.controller.ts
 - backend/src/modules/prescription/prescription.module.ts
 *
 * Calls:
 - promises
 - client-s3
 - node:os
 - node:crypto
 - node:child_process
 - node:path
 - s3-request-presigner
 - common
 *
 * Dependencies:
 - promises
 - client-s3
 - node:os
 - node:crypto
 - node:child_process
 - node:path
 - s3-request-presigner
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

import { createHmac, randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type SaveObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

@Injectable()
export class StorageService {
  private readonly driver = process.env.STORAGE_DRIVER ?? 'local';
  private readonly localRoot = resolve(process.env.STORAGE_LOCAL_ROOT ?? '/var/lib/wyshcare/uploads');
  private readonly downloadSecret = (() => {
    const secret = process.env.STORAGE_SIGNING_SECRET ?? process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Missing STORAGE_SIGNING_SECRET or JWT_SECRET configuration');
    }
    return secret;
  })();
  private readonly appBaseUrl = process.env.APP_BASE_URL ?? 'http://127.0.0.1:3001';
  private readonly uploadScanCommand = process.env.UPLOAD_SCAN_COMMAND;
  private readonly s3Bucket = process.env.STORAGE_BUCKET;
  private readonly s3Client =
    this.driver === 's3' && this.s3Bucket
      ? new S3Client({
          region: process.env.STORAGE_REGION ?? 'ap-south-1',
          endpoint: process.env.STORAGE_ENDPOINT || undefined,
          forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true',
          credentials:
            process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY
              ? {
                  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
                  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
                }
              : undefined,
        })
      : undefined;

  buildObjectKey(scope: string, filename: string) {
    const normalized = filename.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    return `${scope}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${normalized}`;
  }

  async scanObject(buffer: Buffer, filename: string) {
    if (!this.uploadScanCommand) {
      return { status: 'skipped' as const };
    }

    const tempDir = await mkdtemp(join(tmpdir(), 'wyshcare-scan-'));
    const tempFile = join(tempDir, filename.replace(/[^a-zA-Z0-9.-]+/g, '-'));

    try {
      await writeFile(tempFile, buffer);
      await execFileAsync(this.uploadScanCommand, [tempFile]);
      return { status: 'clean' as const };
    } finally {
      await unlink(tempFile).catch(() => undefined);
      await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  async saveObject(input: SaveObjectInput) {
    if (this.s3Client && this.s3Bucket) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: input.key,
          Body: input.body,
          ContentType: input.contentType,
          ServerSideEncryption: 'AES256',
        }),
      );

      return { storageKey: input.key, provider: 's3' as const };
    }

    const targetPath = join(this.localRoot, input.key);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, input.body);

    return { storageKey: input.key, provider: 'local' as const };
  }

  async loadObject(key: string) {
    if (this.s3Client && this.s3Bucket) {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
        }),
      );

      return Buffer.from(await response.Body!.transformToByteArray());
    }

    return readFile(join(this.localRoot, key));
  }

  async deleteObject(key: string) {
    if (!this.s3Client) {
      await unlink(join(this.localRoot, key)).catch(() => undefined);
    }
  }

  async getDownloadUrl(recordId: string, key: string, ttlSeconds = 300) {
    if (this.s3Client && this.s3Bucket) {
      return getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
        }),
        { expiresIn: ttlSeconds },
      );
    }

    const expiresAt = Date.now() + ttlSeconds * 1000;
    const signature = this.signDownload(recordId, key, expiresAt);

    return `${this.appBaseUrl}/api/v1/vault/records/${recordId}/download?expiresAt=${expiresAt}&signature=${signature}`;
  }

  assertValidDownload(recordId: string, key: string, expiresAt: number, signature: string) {
    if (Date.now() > expiresAt) {
      throw new UnauthorizedException('Download link has expired');
    }

    const expected = this.signDownload(recordId, key, expiresAt);

    if (signature !== expected) {
      throw new UnauthorizedException('Download link is invalid');
    }
  }

  private signDownload(recordId: string, key: string, expiresAt: number) {
    return createHmac('sha256', this.downloadSecret).update(`${recordId}:${key}:${expiresAt}`).digest('hex');
  }
}
