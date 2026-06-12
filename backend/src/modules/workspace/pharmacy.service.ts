/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/workspace/pharmacy.service.ts
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
 * Business logic service for workspace
 *
 * Responsibilities:
 * - Execute business logic for pharmacy operations
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
 - crypto
 *
 * Dependencies:
 - common
 - crypto
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Pharmacy
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
import type { CreateDispensingRecordDto, CreateProcurementOrderDto } from './dto/workspace.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PharmacyWorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // ── Dispensing ──

  async createDispensing(dto: CreateDispensingRecordDto, actorId: string) {
    const record = await this.prisma.dispensingRecord.create({
      data: {
        id: randomUUID(),
        prescriptionId: dto.prescriptionId,
        patientId: dto.patientId,
        pharmacistId: actorId,
        medicationName: dto.medicationName,
        quantityDispensed: dto.quantityDispensed,
        batchNumber: dto.batchNumber,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        status: 'DISPENSED',
        dispensedAt: new Date(),
        notes: dto.notes,
        updatedAt: new Date(),
      },
    });
    await this.auditLog.capture({ actorUserId: actorId, patientUserId: dto.patientId, action: 'DISPENSE_MEDICATION', resourceType: 'DispensingRecord', resourceId: record.id });
    return record;
  }

  async listDispensingQueue() {
    const records = await this.prisma.dispensingRecord.findMany({
      where: { status: 'PENDING' },
      include: {
        User_DispensingRecord_patientIdToUser: { select: { id: true, fullName: true } },
        Prescription: { select: { id: true, issuedAt: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return records.map(r => ({
      ...r,
      patient: r.User_DispensingRecord_patientIdToUser,
      prescription: r.Prescription,
    }));
  }

  async listDispensingHistory(pharmacistId: string) {
    return this.prisma.dispensingRecord.findMany({
      where: { pharmacistId },
      orderBy: { dispensedAt: 'desc' },
      take: 50,
    });
  }

  async getDispensingStats() {
    const records = await this.prisma.dispensingRecord.findMany({ select: { status: true } });
    const dist: Record<string, number> = {};
    for (const r of records) dist[r.status] = (dist[r.status] ?? 0) + 1;
    return { total: records.length, statusDistribution: dist };
  }

  // ── Procurement ──

  async createProcurementOrder(dto: CreateProcurementOrderDto) {
    return this.prisma.procurementOrder.create({
      data: {
        id: randomUUID(),
        pharmacyId: dto.pharmacyId,
        supplier: dto.supplier,
        items: JSON.parse(JSON.stringify(dto.items)),
        totalCost: dto.totalCost,
        notes: dto.notes,
        updatedAt: new Date(),
      },
    });
  }

  async listProcurementOrders(pharmacyId: string) {
    return this.prisma.procurementOrder.findMany({
      where: { pharmacyId },
      orderBy: { orderedDate: 'desc' },
    });
  }

  async receiveProcurementOrder(id: string) {
    const existing = await this.prisma.procurementOrder.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Procurement order not found');
    return this.prisma.procurementOrder.update({
      where: { id },
      data: {
        status: 'RECEIVED',
        receivedDate: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getProcurementStats() {
    const orders = await this.prisma.procurementOrder.findMany({ select: { status: true } });
    const dist: Record<string, number> = {};
    for (const o of orders) dist[o.status] = (dist[o.status] ?? 0) + 1;
    return { total: orders.length, statusDistribution: dist };
  }

  // ── Inventory ──

  async getLowStockItems(pharmacyId: string, threshold = 10) {
    return this.prisma.pharmacyInventory.findMany({
      where: { partnerId: pharmacyId, stock: { lte: threshold }, isActive: true },
      orderBy: { stock: 'asc' },
    });
  }

  async updateStock(inventoryId: string, quantity: number) {
    const item = await this.prisma.pharmacyInventory.findUnique({ where: { id: inventoryId } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return this.prisma.pharmacyInventory.update({
      where: { id: inventoryId },
      data: {
        stock: item.stock + quantity,
        updatedAt: new Date(),
      },
    });
  }
}
