/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/queue-monitor/queue-monitor.controller.ts
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
 * HTTP controller: exposes REST endpoints for queue-monitor
 *
 * Responsibilities:
 * - Handle HTTP requests for wyshid operations
 * - Validate and transform request/response payloads
 * - Delegate business logic to service layer
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
 - swagger
 - common
 *
 * Dependencies:
 - swagger
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

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JobQueueService } from '../../providers/jobs/job-queue.service';
import type { QueueName } from '../../providers/jobs/job-queue.service';

@ApiTags('queue-monitor')
@UseGuards(RolesGuard)
@Controller('queue')
export class QueueMonitorController {
  constructor(private readonly jobQueue: JobQueueService) {}

  @Get('stats')
  async getQueueStats() {
    const queues: QueueName[] = ['ocr', 'health-twin', 'notification', 'analytics', 'care-plan', 'abdm', 'pharmacy'];
    const stats = await Promise.all(queues.map((q) => this.jobQueue.getQueueStats(q)));
    return stats;
  }

  @Roles('ADMIN')
  @Get('stats/:queue')
  async getSingleQueueStats(@Param('queue') queue: QueueName) {
    return this.jobQueue.getQueueStats(queue);
  }
}
