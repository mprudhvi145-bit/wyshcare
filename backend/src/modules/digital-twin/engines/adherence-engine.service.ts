/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/engines/adherence-engine.service.ts
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
 * Business logic service for engines
 *
 * Responsibilities:
 * - Execute business logic for digital twin operations
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
Digital Twin
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
import { PrismaService } from '../../../providers/prisma/prisma.service';

interface MedicationAdherenceDetail {
  name: string;
  rate: number;
  status: string;
}

export interface AdherenceResult {
  overallRate: number;
  status: string;
  byMedication: MedicationAdherenceDetail[];
  totalExpected: number;
  totalTaken: number;
  totalMissed: number;
}

@Injectable()
export class AdherenceEngineService {
  private readonly logger = new Logger(AdherenceEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async assess(userId: string): Promise<AdherenceResult> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000);

    const [medicationAdmins, adherenceLogs, dispensingRecords, pharmacyOrders] = await Promise.all([
      this.prisma.medicationAdministration.findMany({
        where: { patientId: userId, scheduledTime: { gte: ninetyDaysAgo } },
        orderBy: { scheduledTime: 'desc' },
      }),
      this.prisma.adherenceLog.findMany({
        where: { userId, scheduledAt: { gte: thirtyDaysAgo } },
        include: { MedicationSchedule: true },
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.dispensingRecord.findMany({
        where: { patientId: userId, createdAt: { gte: ninetyDaysAgo } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pharmacyOrder.findMany({
        where: { userId, createdAt: { gte: ninetyDaysAgo } },
      }),
      this.prisma.medicationSchedule.findMany({
        where: { userId, status: 'TAKEN' },
      }),
    ]);

    // MedicationAdministration data
    const adminExpected = medicationAdmins.length;
    const adminTaken = medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adminMissed = medicationAdmins.filter(m => m.status === 'SKIPPED' || m.status === 'REFUSED').length;

    // AdherenceLog data
    const logExpected = adherenceLogs.length;
    const logTaken = adherenceLogs.filter(l => l.status === 'TAKEN').length;
    const logMissed = adherenceLogs.filter(l => l.status === 'MISSED' || l.status === 'SKIPPED').length;

    // Per-medication breakdown from MedicationAdministration
    const medMap = new Map<string, { expected: number; taken: number }>();
    for (const admin of medicationAdmins) {
      const name = admin.medicationName;
      if (!medMap.has(name)) medMap.set(name, { expected: 0, taken: 0 });
      const entry = medMap.get(name)!;
      entry.expected++;
      if (admin.status === 'ADMINISTERED') entry.taken++;
    }

    const byMedication: MedicationAdherenceDetail[] = [];
    for (const [name, data] of medMap) {
      const rate = data.expected > 0 ? Math.round((data.taken / data.expected) * 100) : 0;
      byMedication.push({
        name,
        rate,
        status: this.rateToStatus(rate),
      });
    }

    // Refill gaps from DispensingRecord
    const expectedRefills = Math.ceil(ninetyDaysAgo.getTime() / (30 * 86400000));
    const actualRefills = dispensingRecords.filter(d => d.status === 'DISPENSED').length;
    const refillGap = expectedRefills - actualRefills;

    // Pharmacy order completion
    const completedOrders = pharmacyOrders.filter(o => o.status === 'COMPLETED').length;
    const totalOrders = pharmacyOrders.length;
    const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 100;

    // Combined adherence rate
    const totalExpected = adminExpected + logExpected;
    const totalTaken = adminTaken + logTaken;
    const totalMissed = adminMissed + logMissed;

    let rawRate = totalExpected > 0 ? (totalTaken / totalExpected) * 100 : 100;

    // Adjust for refill gaps and order completion
    if (refillGap > 0) rawRate -= refillGap * 2;
    if (orderCompletionRate < 80) rawRate -= (80 - orderCompletionRate) * 0.2;

    const overallRate = Math.max(0, Math.min(100, Math.round(rawRate)));
    const status = this.rateToStatus(overallRate);

    return {
      overallRate,
      status,
      byMedication: byMedication.sort((a, b) => a.rate - b.rate),
      totalExpected,
      totalTaken,
      totalMissed,
    };
  }

  async computeAdherenceScore(userId: string): Promise<number> {
    const result = await this.assess(userId);
    return result.overallRate;
  }

  private rateToStatus(rate: number): string {
    if (rate >= 80) return 'ADHERENT';
    if (rate >= 50) return 'PARTIAL';
    return 'NON_ADHERENT';
  }
}
