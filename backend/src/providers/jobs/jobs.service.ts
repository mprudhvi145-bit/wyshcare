/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/jobs/jobs.service.ts
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
 * Business logic service for jobs
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

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('Maintenance jobs initialized');
    await this.runCleanup('startup');
    const intervalMs = Number(process.env.JOBS_INTERVAL_MS ?? 5 * 60_000);
    this.timer = setInterval(() => {
      void this.runCleanup('interval').catch((error) => {
        this.logger.error(`Maintenance job failed: ${String(error)}`);
      });
    }, intervalMs);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async runCleanup(reason: 'startup' | 'interval') {
    const now = new Date();
    const [expiredChallenges, expiredRefreshTokens, expiredSessions, oldAuditLogs] = await Promise.all([
      this.prisma.otpChallenge.deleteMany({ where: { expiresAt: { lt: now }, verifiedAt: null } }),
      this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now }, revokedAt: null } }),
      this.prisma.deviceSession.updateMany({
        where: { expiresAt: { lt: now }, revokedAt: null },
        data: { revokedAt: now },
      }),
      this.prisma.auditLog.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60_000) } },
      }),
    ]);

    this.logger.log(
      `Maintenance cleanup (${reason}) complete: otp=${expiredChallenges.count}, refresh=${expiredRefreshTokens.count}, sessions=${expiredSessions.count}, audit=${oldAuditLogs.count}`,
    );
    return { expiredChallenges, expiredRefreshTokens, expiredSessions, oldAuditLogs };
  }
}
