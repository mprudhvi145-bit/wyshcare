/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ehr/orders.service.ts
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
 * Business logic service for ehr
 *
 * Responsibilities:
 * - Execute business logic for ehr operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - crypto
 - client
 - common
 *
 * Dependencies:
 - crypto
 - client
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
EHR
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
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import type { CreateClinicalOrderDto, UpdateClinicalOrderDto } from './dto/ehr.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async listOrders(patientId: string, orderType?: string) {
    return this.prisma.clinicalOrder.findMany({
      where: { patientId, ...(orderType ? { orderType: orderType as Prisma.ClinicalOrderCreateInput['orderType'] } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(id: string) {
    const order = await this.prisma.clinicalOrder.findUnique({
      where: { id },
      include: {
        User_ClinicalOrder_patientIdToUser: { select: { id: true, fullName: true } },
        User_ClinicalOrder_orderedByIdToUser: { select: { id: true, fullName: true } },
        User_ClinicalOrder_completedByIdToUser: { select: { id: true, fullName: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async createOrder(dto: CreateClinicalOrderDto, actorId: string) {
    const order = await this.prisma.clinicalOrder.create({
      data: {
        id: randomUUID(),
        patientId: dto.patientId,
        orderType: dto.orderType,
        priority: dto.priority ?? 'ROUTINE',
        title: dto.title,
        description: dto.description,
        orderedById: dto.orderedById,
        orderDetails: dto.orderDetails ? JSON.parse(JSON.stringify(dto.orderDetails)) : undefined,
        notes: dto.notes,
        updatedAt: new Date(),
      },
    });
    await this.prisma.timelineEvent.create({
      data: {
        userId: dto.patientId,
        type: 'CLINICAL_ORDER',
        title: `Order: ${dto.title}`,
        summary: `${dto.orderType} order created`,
        occurredAt: new Date(),
        metadata: { orderType: dto.orderType, priority: dto.priority },
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'CREATE_ORDER', resourceType: 'ClinicalOrder', resourceId: order.id });
    return order;
  }

  async updateOrder(id: string, dto: UpdateClinicalOrderDto, actorId: string) {
    const existing = await this.prisma.clinicalOrder.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Order not found');

    if (dto.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      dto.completedAt = new Date().toISOString();
      dto.completedById = dto.completedById ?? actorId;
      await this.prisma.timelineEvent.create({
        data: {
          userId: existing.patientId,
          type: 'ORDER_COMPLETED',
          title: `Order completed: ${existing.title}`,
          summary: existing.resultSummary ?? '',
          occurredAt: new Date(),
        },
      });
    }

    const order = await this.prisma.clinicalOrder.update({
      where: { id },
      data: {
        ...dto,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        orderDetails: dto.orderDetails ? JSON.parse(JSON.stringify(dto.orderDetails)) : undefined,
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: existing.patientId, action: 'UPDATE_ORDER', resourceType: 'ClinicalOrder', resourceId: id });
    return order;
  }

  async listOrdersByType(orderType: string) {
    return this.prisma.clinicalOrder.findMany({
      where: { orderType: orderType as Prisma.ClinicalOrderCreateInput['orderType'] },
      orderBy: { createdAt: 'desc' },
      include: {
        User_ClinicalOrder_patientIdToUser: { select: { id: true, fullName: true } },
        User_ClinicalOrder_orderedByIdToUser: { select: { id: true, fullName: true } },
      },
      take: 50,
    });
  }

  async getOrderStats() {
    const orders = await this.prisma.clinicalOrder.findMany({ select: { orderType: true, status: true, priority: true } });
    const typeDist: Record<string, number> = {};
    const statusDist: Record<string, number> = {};
    const priorityDist: Record<string, number> = {};
    for (const o of orders) {
      typeDist[o.orderType] = (typeDist[o.orderType] ?? 0) + 1;
      statusDist[o.status] = (statusDist[o.status] ?? 0) + 1;
      priorityDist[o.priority] = (priorityDist[o.priority] ?? 0) + 1;
    }
    return { total: orders.length, typeDistribution: typeDist, statusDistribution: statusDist, priorityDistribution: priorityDist };
  }
}
