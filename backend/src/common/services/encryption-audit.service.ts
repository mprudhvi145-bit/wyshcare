/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/services/encryption-audit.service.ts
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
 * Business logic service for services
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
 - node:crypto
 *
 * Dependencies:
 - common
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

import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface EncryptionAuditEntry {
  id: string;
  operation: 'encrypt' | 'decrypt' | 'key_rotation' | 'key_access';
  resourceType: string;
  resourceId?: string;
  algorithm: string;
  keyId: string;
  actorUserId?: string;
  outcome: 'success' | 'failure';
  timestamp: string;
  details?: string;
}

@Injectable()
export class EncryptionAuditService {
  private readonly logger = new Logger(EncryptionAuditService.name);
  private readonly auditLog: EncryptionAuditEntry[] = [];

  record(entry: Omit<EncryptionAuditEntry, 'id' | 'timestamp'>) {
    const auditEntry: EncryptionAuditEntry = {
      ...entry,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.auditLog.push(auditEntry);
    this.logger.log(`Encryption ${entry.operation} for ${entry.resourceType}: ${entry.outcome}`);
  }

  getRecent(minutes = 60): EncryptionAuditEntry[] {
    const cutoff = Date.now() - minutes * 60_000;
    return this.auditLog.filter((e) => new Date(e.timestamp).getTime() > cutoff);
  }

  encrypt(resourceType: string, resourceId: string | undefined, algorithm: string, keyId: string, actorUserId?: string) {
    this.record({ operation: 'encrypt', resourceType, resourceId, algorithm, keyId, actorUserId, outcome: 'success' });
  }

  decrypt(resourceType: string, resourceId: string | undefined, algorithm: string, keyId: string, actorUserId?: string) {
    this.record({ operation: 'decrypt', resourceType, resourceId, algorithm, keyId, actorUserId, outcome: 'success' });
  }

  maskPHIInMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ['phoneNumber', 'email', 'fullName', 'aadhaar', 'pan', 'abha', 'token', 'password', 'secret'];
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        masked[key] = typeof value === 'string' ? value.slice(0, 3) + '***' + value.slice(-2) : '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskPHIInMetadata(value as Record<string, unknown>);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }
}
