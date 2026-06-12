/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/encryption/encryption.service.ts
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
 * Business logic service for encryption
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
 - common
 - config
 - node:crypto
 *
 * Dependencies:
 - common
 - config
 - node:crypto
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

import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly masterKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyRotationDays: number;

  constructor(config: ConfigService) {
    const hex = config.getOrThrow<string>('MASTER_ENCRYPTION_KEY');
    this.masterKey = Buffer.from(hex, 'hex');
    this.keyRotationDays = config.get<number>('ENCRYPTION_KEY_ROTATION_DAYS', 90);

    if (this.masterKey.length !== 32) {
      throw new Error('MASTER_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
  }

  /**
   * Encrypt plaintext using AES-256-GCM with a random IV per operation.
   * Returns base64-encoded IV + ciphertext + authTag.
   */
  encrypt(plaintext: string, context?: string): string {
    const iv = randomBytes(12);
    const key = context ? this.deriveKey(context) : this.masterKey;
    const cipher = createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'base64'),
    ]);

    return combined.toString('base64');
  }

  /**
   * Decrypt a string previously produced by encrypt().
   */
  decrypt(payload: string, context?: string): string {
    const combined = Buffer.from(payload, 'base64');
    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28);
    const ciphertext = combined.subarray(28);

    const key = context ? this.deriveKey(context) : this.masterKey;
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Encrypt a Buffer (used for file-level encryption).
   * Returns { iv, authTag, ciphertext } as Buffers.
   */
  encryptBuffer(plaintext: Buffer, context?: string): { iv: Buffer; authTag: Buffer; ciphertext: Buffer } {
    const iv = randomBytes(12);
    const key = context ? this.deriveKey(context) : this.masterKey;
    const cipher = createCipheriv(this.algorithm, key, iv);

    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return { iv, authTag, ciphertext };
  }

  /**
   * Decrypt a Buffer previously encrypted with encryptBuffer.
   */
  decryptBuffer(encrypted: { iv: Buffer; authTag: Buffer; ciphertext: Buffer }, context?: string): Buffer {
    const key = context ? this.deriveKey(context) : this.masterKey;
    const decipher = createDecipheriv(this.algorithm, key, encrypted.iv);
    decipher.setAuthTag(encrypted.authTag);

    return Buffer.concat([decipher.update(encrypted.ciphertext), decipher.final()]);
  }

  /**
   * Derive a context-specific key from the master key using PBKDF2.
   * Enables per-field and per-document encryption without storing extra keys.
   */
  private deriveKey(context: string): Buffer {
    return pbkdf2Sync(this.masterKey, context, 100_000, 32, 'sha512');
  }
}
