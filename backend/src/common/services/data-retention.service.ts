/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/services/data-retention.service.ts
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
 *
 * Dependencies:
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

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';

export interface RetentionPolicy {
  model: string;
  field: string;
  retentionDays: number;
  action: 'delete' | 'anonymize';
}

const POLICIES: RetentionPolicy[] = [
  { model: 'auditLog', field: 'createdAt', retentionDays: 1825, action: 'delete' },
  { model: 'otpChallenge', field: 'createdAt', retentionDays: 7, action: 'delete' },
  { model: 'refreshToken', field: 'expiresAt', retentionDays: 90, action: 'delete' },
  { model: 'deviceSession', field: 'expiresAt', retentionDays: 365, action: 'delete' },
  { model: 'notification', field: 'createdAt', retentionDays: 365, action: 'delete' },
  { model: 'aiJob', field: 'createdAt', retentionDays: 90, action: 'delete' },
];

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  getPolicies(): RetentionPolicy[] {
    return POLICIES;
  }

  async executeRetention(): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    const now = new Date();

    for (const policy of POLICIES) {
      try {
        const cutoff = new Date(now.getTime() - policy.retentionDays * 86400_000);
        // @ts-expect-error dynamic Prisma access
        const model = this.prisma[policy.model];
        if (!model) {
          this.logger.warn(`Unknown model: ${policy.model}`);
          continue;
        }
        const result = await model.deleteMany({
          where: { [policy.field]: { lt: cutoff } },
        });
        results[policy.model] = result.count;
        this.logger.log(`Retention: deleted ${result.count} ${policy.model} records older than ${cutoff.toISOString()}`);
      } catch (err) {
        this.logger.error(`Retention failed for ${policy.model}: ${(err as Error).message}`);
        results[policy.model] = -1;
      }
    }

    return results;
  }
}
