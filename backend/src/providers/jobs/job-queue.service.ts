/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/jobs/job-queue.service.ts
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

import { Injectable, Logger } from '@nestjs/common';
import type { AIJobType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { DomainEventsService } from '../events/events.service';
import { DomainEventType } from '../events/events.types';

export type QueueName = 'ocr' | 'health-twin' | 'notification' | 'analytics' | 'care-plan' | 'abdm' | 'pharmacy';

export interface EnqueueOptions {
  userId?: string;
  priority?: number;
  scheduledAt?: Date;
  model?: string;
  languageCode?: string;
}

export interface JobPayload {
  id: string;
  type: string;
  status: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  userId?: string | null;
  model?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
  errorMessage?: string | null;
  retryCount: number;
  maxRetries: number;
}

const QUEUE_JOB_TYPE_MAP: Record<QueueName, string> = {
  'ocr': 'OCR',
  'health-twin': 'HEALTH_TWIN',
  'notification': 'NOTIFICATION',
  'analytics': 'ANALYTICS',
  'care-plan': 'CARE_PLAN',
  'abdm': 'ABDM_SYNC',
  'pharmacy': 'PHARMACY_RX_PARSE',
};

@Injectable()
export class JobQueueService {
  private readonly logger = new Logger(JobQueueService.name);
  private pollTimers = new Map<QueueName, NodeJS.Timeout>();
  private readonly pollIntervalMs = 2_000;
  private readonly batchSize = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: DomainEventsService,
  ) {}

  async enqueue(queue: QueueName, input: Record<string, unknown>, options?: EnqueueOptions): Promise<string> {
    const jobType = QUEUE_JOB_TYPE_MAP[queue];
    const job = await this.prisma.aIJob.create({
      data: {
        userId: options?.userId,
        jobType: jobType as AIJobType,
        status: 'QUEUED',
        inputPayload: input as Prisma.InputJsonValue,
        model: options?.model,
        languageCode: options?.languageCode,
        priority: options?.priority ?? 0,
        scheduledAt: options?.scheduledAt ?? new Date(),
        maxRetries: 3,
        queue,
      },
    });

    this.events.publish(DomainEventType.ANALYTICS_EVENT, {
      event: 'job.enqueued',
      queue,
      jobId: job.id,
      jobType,
    });

    return job.id;
  }

  async dequeue(queue: QueueName, workerCount = 1): Promise<JobPayload[]> {
    const jobType = QUEUE_JOB_TYPE_MAP[queue];

    const now = new Date();
    const jobs = await this.prisma.aIJob.findMany({
      where: {
        jobType: jobType as AIJobType,
        status: 'QUEUED',
        scheduledAt: { lte: now },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: Math.min(workerCount, this.batchSize),
    });

    if (jobs.length === 0) return [];

    const ids = jobs.map((j) => j.id);
    await this.prisma.aIJob.updateMany({
      where: { id: { in: ids }, status: 'QUEUED' },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    return jobs.map((j) => ({
      id: j.id,
      type: j.jobType,
      status: 'PROCESSING',
      input: j.inputPayload as Record<string, unknown>,
      output: j.outputPayload as Record<string, unknown> | null,
      userId: j.userId,
      model: j.model,
      createdAt: j.createdAt,
      completedAt: j.completedAt,
      errorMessage: j.errorMessage,
      retryCount: j.retryCount,
      maxRetries: j.maxRetries,
    }));
  }

  async complete(jobId: string, output?: Record<string, unknown>): Promise<void> {
    const durationMs = await this.calcDuration(jobId);
    await this.prisma.aIJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        outputPayload: (output ?? {}) as Prisma.InputJsonValue,
        completedAt: new Date(),
        durationMs,
      },
    });
  }

  async fail(jobId: string, errorMessage: string): Promise<void> {
    const job = await this.prisma.aIJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    const retryCount = (job.retryCount ?? 0) + 1;
    const maxRetries = job.maxRetries ?? 3;

    if (retryCount >= maxRetries) {
      const durationMs = await this.calcDuration(jobId);
      await this.prisma.aIJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          errorMessage,
          retryCount,
          completedAt: new Date(),
          durationMs,
        },
      });
    } else {
      await this.prisma.aIJob.update({
        where: { id: jobId },
        data: {
          status: 'QUEUED',
          errorMessage,
          retryCount,
          scheduledAt: new Date(Date.now() + retryCount * 30_000),
        },
      });
    }
  }

  startPolling(queue: QueueName, handler: (job: JobPayload) => Promise<void>): () => void {
    if (this.pollTimers.has(queue)) {
      this.logger.warn(`Queue ${queue} already being polled`);
    }

    const poll = async () => {
      try {
        const jobs = await this.dequeue(queue);
        for (const job of jobs) {
          handler(job).catch((err) => {
            this.logger.error(`Job ${job.id} handler failed: ${(err as Error).message}`);
          });
        }
      } catch (err) {
        this.logger.error(`Poll error for ${queue}: ${(err as Error).message}`);
      }
    };

    this.pollTimers.set(queue, setInterval(poll, this.pollIntervalMs));
    poll().catch((err) => this.logger.error(`Initial poll failed for ${queue}: ${(err as Error).message}`));

    return () => {
      const timer = this.pollTimers.get(queue);
      if (timer) {
        clearInterval(timer);
        this.pollTimers.delete(queue);
      }
    };
  }

  async getQueueStats(queue: QueueName) {
    const jobType = QUEUE_JOB_TYPE_MAP[queue];
    const [queued, processing, completed, failed] = await Promise.all([
      this.prisma.aIJob.count({ where: { jobType: jobType as AIJobType, status: 'QUEUED' } }),
      this.prisma.aIJob.count({ where: { jobType: jobType as AIJobType, status: 'PROCESSING' } }),
      this.prisma.aIJob.count({ where: { jobType: jobType as AIJobType, status: 'COMPLETED' } }),
      this.prisma.aIJob.count({ where: { jobType: jobType as AIJobType, status: { in: ['FAILED', 'ESCALATED'] } } }),
    ]);

    return { queue, queued, processing, completed, failed };
  }

  private async calcDuration(jobId: string): Promise<number | null> {
    const job = await this.prisma.aIJob.findUnique({
      where: { id: jobId },
      select: { createdAt: true, startedAt: true },
    });
    if (!job?.startedAt) return null;
    return Date.now() - job.startedAt.getTime();
  }
}
