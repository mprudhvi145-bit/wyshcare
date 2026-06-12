/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/pharmacy/pharmacy.service.ts
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
 * Business logic service for pharmacy
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
 *
 * Dependencies:
 - common
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

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class PharmacyService {
  constructor(private readonly prisma: PrismaService) {}

  listPartners() {
    return this.prisma.pharmacyPartner.findMany({ take: 25 });
  }

  listOrders(userId: string) {
    return this.prisma.pharmacyOrder.findMany({
      where: { userId },
      include: { partner: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createOrder(userId: string, payload: Record<string, unknown>) {
    return this.prisma.pharmacyOrder.create({
      data: {
        userId,
        prescriptionId: payload.prescriptionId as string | undefined,
        deliveryAddress: payload.deliveryAddress ?? {},
        medicinePayload: payload.medicinePayload ?? {},
        status: 'PENDING_VERIFICATION',
      },
      include: { partner: true },
    });
  }
}
