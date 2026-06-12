/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/redis/redis.service.ts
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
 * Business logic service for redis
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
 - ioredis
 *
 * Dependencies:
 - common
 - ioredis
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

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client?: Redis;

  async onModuleInit() {
    const client = this.getClient();

    if (client) {
      try {
        await client.ping();
        this.logger.log('Redis connection established');
      } catch (error) {
        this.logger.warn(`Redis unavailable during startup: ${String(error)}`);
      }
    }
  }

  getClient() {
    if (!this.client && process.env.REDIS_URL) {
      this.client = new Redis(process.env.REDIS_URL, { lazyConnect: true });
      void this.client.connect().catch((error: unknown) => {
        this.logger.warn(`Redis unavailable: ${String(error)}`);
      });
    }

    return this.client;
  }

  async healthcheck() {
    const client = this.getClient();

    if (!client) {
      return { status: 'disabled' as const };
    }

    const pong = await client.ping();
    return { status: pong === 'PONG' ? ('ok' as const) : ('degraded' as const) };
  }
}
