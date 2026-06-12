/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/discovery/discovery.service.ts
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
 * Business logic service for discovery
 *
 * Responsibilities:
 * - Execute business logic for discovery operations
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
Discovery
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
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query?: string, specialty?: string) {
    const doctors = await this.prisma.doctorProfile.findMany({
      where: {
        approvalStatus: 'VERIFIED',
        specialization: specialty ? { contains: specialty, mode: 'insensitive' } : undefined,
        OR: query
          ? [
              { specialization: { contains: query, mode: 'insensitive' } },
              { user: { fullName: { contains: query, mode: 'insensitive' } } },
            ]
          : undefined,
      },
      include: { user: true },
      take: 20,
    });

    return doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.user.fullName,
      specialization: doctor.specialization,
      rating: doctor.averageRating,
      consultationFee: doctor.consultationFee,
      telemedicineAvailable: doctor.telemedicineEnabled,
    }));
  }
}
