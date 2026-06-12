/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/encryption/field-encryption.service.ts
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
 - config
 - common
 *
 * Dependencies:
 - config
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

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

type PhiRecord = Record<string, unknown>;

@Injectable()
export class FieldEncryptionService {
  private readonly enabled: boolean;
  private readonly piiMasking: boolean;
  private readonly phiFields: Record<string, boolean> = {
    phoneNumber: true,
    email: true,
    fullName: true,
    dateOfBirth: true,
    bloodGroup: true,
    chronicConditions: true,
    allergiesSummary: true,
    currentMedications: true,
    pastSurgeries: true,
    medicalHistory: true,
    emergencyContactName: true,
    emergencyContactPhone: true,
    abhaAddress: true,
    abhaNumber: true,
    abhaNumberMasked: true,
    address: true,
    city: true,
    state: true,
    pincode: true,
    aadhaarLastDigits: true,
  };

  constructor(
    private readonly encryptionService: EncryptionService,
    config: ConfigService,
  ) {
    this.enabled = config.get<boolean>('FIELD_ENCRYPTION_ENABLED', true);
    this.piiMasking = config.get<boolean>('PII_MASKING_ENABLED', true);
  }

  encryptRecord(record: PhiRecord, entityType: string): PhiRecord {
    if (!this.enabled) return record;
    const result: PhiRecord = {};

    for (const [key, value] of Object.entries(record)) {
      if (this.phiFields[key] && typeof value === 'string' && value.length > 0) {
        result[key] = this.encryptionService.encrypt(value, `${entityType}:${key}`);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  decryptRecord(record: PhiRecord, entityType: string): PhiRecord {
    if (!this.enabled) return record;
    const result: PhiRecord = {};

    for (const [key, value] of Object.entries(record)) {
      if (this.phiFields[key] && typeof value === 'string' && value.length > 0) {
        try {
          result[key] = this.encryptionService.decrypt(value, `${entityType}:${key}`);
        } catch {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  maskPII(record: PhiRecord): PhiRecord {
    if (!this.piiMasking) return record;
    const result: PhiRecord = { ...record };

    if (typeof result.fullName === 'string') {
      const parts = (result.fullName as string).split(' ');
      result.fullName = parts
        .map((p) => (p.length > 1 ? p[0] + '***' : p))
        .join(' ');
    }

    if (typeof result.phoneNumber === 'string') {
      const s = result.phoneNumber as string;
      result.phoneNumber = s.length > 6 ? s.slice(0, 3) + '****' + s.slice(-3) : '****';
    }

    if (typeof result.email === 'string') {
      const parts = (result.email as string).split('@');
      const name = parts[0];
      const domain = parts.slice(1).join('@');
      if (name && domain) {
        result.email = `${name[0]}***@${domain}`;
      }
    }

    return result;
  }
}
