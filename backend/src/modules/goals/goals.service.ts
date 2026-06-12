/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/goals/goals.service.ts
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
 * Business logic service for goals
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

import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { DomainEventsService } from '../../providers/events/events.service';
import type { CreateGoalDto, UpdateGoalProgressDto, CreateMilestoneDto } from './dto/create-goal.dto';

interface ListOptions {
  page?: number;
  limit?: number;
  status?: string;
}

@Injectable()
export class GoalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly events: DomainEventsService,
  ) {}

  async list(userId: string, options: ListOptions = {}) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId, deletedAt: null };
    if (options.status) {
      where.status = options.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.healthGoal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          milestones: {
            orderBy: { dueDate: 'asc' },
          },
          progress: {
            orderBy: { recordedAt: 'desc' },
            take: 10,
          },
        },
      }),
      this.prisma.healthGoal.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(userId: string, dto: CreateGoalDto) {
    const goal = await this.prisma.healthGoal.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        targetValue: dto.targetValue,
        currentValue: dto.currentValue ?? 0,
        unit: dto.unit,
        startDate: new Date(dto.startDate),
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        status: 'ACTIVE',
      },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      action: 'GOAL_CREATED',
      resourceType: 'health_goal',
      resourceId: goal.id,
      metadata: { title: goal.title, category: goal.category },
    });

    this.events.publish('goal.created', { userId, goalId: goal.id });

    return goal;
  }

  async updateProgress(userId: string, id: string, dto: UpdateGoalProgressDto) {
    const goal = await this.prisma.healthGoal.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const updated = await this.prisma.healthGoal.update({
      where: { id },
      data: {
        currentValue: dto.value,
        status: dto.value >= (goal.targetValue ?? Infinity) ? 'COMPLETED' : goal.status,
      },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      action: 'GOAL_PROGRESS_UPDATED',
      resourceType: 'health_goal',
      resourceId: id,
      metadata: { previousValue: goal.currentValue, newValue: dto.value },
    });

    this.events.publish('goal.progress.updated', { userId, goalId: id, value: dto.value });

    return updated;
  }

  async remove(userId: string, id: string) {
    const goal = await this.prisma.healthGoal.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const now = new Date();
    await this.prisma.healthGoal.update({
      where: { id },
      data: { deletedAt: now },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      action: 'GOAL_DELETED',
      resourceType: 'health_goal',
      resourceId: id,
    });

    this.events.publish('goal.deleted', { userId, goalId: id });
  }

  async getMilestones(userId: string, goalId: string) {
    const goal = await this.prisma.healthGoal.findFirst({
      where: { id: goalId, userId, deletedAt: null },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goalMilestone.findMany({
      where: { goalId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async addMilestone(userId: string, goalId: string, dto: CreateMilestoneDto) {
    const goal = await this.prisma.healthGoal.findFirst({
      where: { id: goalId, userId, deletedAt: null },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const milestone = await this.prisma.goalMilestone.create({
      data: {
        goalId,
        title: dto.title,
        targetValue: dto.targetValue,
        currentValue: dto.currentValue ?? 0,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: 'PENDING',
      },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      action: 'GOAL_MILESTONE_CREATED',
      resourceType: 'goal_milestone',
      resourceId: milestone.id,
      metadata: { goalId, title: milestone.title },
    });

    return milestone;
  }

  async recordProgress(userId: string, goalId: string, dto: UpdateGoalProgressDto) {
    const goal = await this.prisma.healthGoal.findFirst({
      where: { id: goalId, userId, deletedAt: null },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const [progress] = await Promise.all([
      this.prisma.goalProgress.create({
        data: {
          goalId,
          value: dto.value,
          notes: dto.notes,
          recordedAt: new Date(),
        },
      }),
      this.prisma.healthGoal.update({
        where: { id: goalId },
        data: {
          currentValue: dto.value,
          status: dto.value >= (goal.targetValue ?? Infinity) ? 'COMPLETED' : goal.status,
        },
      }),
    ]);

    await this.auditLog.capture({
      actorUserId: userId,
      action: 'GOAL_PROGRESS_RECORDED',
      resourceType: 'goal_progress',
      resourceId: progress.id,
      metadata: { goalId, value: dto.value },
    });

    this.events.publish('goal.progress.recorded', { userId, goalId, value: dto.value });

    return progress;
  }
}
