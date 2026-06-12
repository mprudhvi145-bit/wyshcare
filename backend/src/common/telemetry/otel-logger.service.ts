/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/telemetry/otel-logger.service.ts
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
 * Business logic service for telemetry
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

import { ObservabilityService } from '../../providers/observability/observability.service';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

@Injectable()
export class OtelLoggerService {
  private readonly logger = new Logger('Otel');

  constructor(private readonly observability: ObservabilityService) {}

  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: 'wyshcare-api',
      ...context,
    };
    switch (level) {
      case 'error':
        this.logger.error(JSON.stringify(entry));
        break;
      case 'warn':
        this.logger.warn(JSON.stringify(entry));
        break;
      case 'debug':
        this.logger.debug(JSON.stringify(entry));
        break;
      default:
        this.logger.log(JSON.stringify(entry));
    }
    this.observability.emitLog(level, message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }
}
