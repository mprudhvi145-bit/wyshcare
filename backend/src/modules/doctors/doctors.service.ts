/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/doctors/doctors.service.ts
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
 * Business logic service for doctors
 *
 * Responsibilities:
 * - Execute business logic for doctor operations
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
Doctor
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
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.doctorProfile.findMany({
      where: { approvalStatus: 'VERIFIED' },
      include: { user: true, clinicMappings: { include: { clinic: true } } },
      take: 50,
    });
  }

  onboard(userId: string, input: Record<string, unknown>) {
    return this.prisma.doctorProfile.upsert({
      where: { userId },
      update: {
        specialization: input.specialization as string,
        qualifications: (input.qualifications as string[]) ?? [],
        languages: (input.languages as string[]) ?? ['English'],
        yearsOfExperience: Number(input.yearsOfExperience ?? 0),
        consultationFee: Number(input.consultationFee ?? 0),
        registrationNumber: input.registrationNumber as string,
      },
      create: {
        userId,
        specialization: input.specialization as string,
        qualifications: (input.qualifications as string[]) ?? [],
        subSpecializations: (input.subSpecializations as string[]) ?? [],
        languages: (input.languages as string[]) ?? ['English'],
        yearsOfExperience: Number(input.yearsOfExperience ?? 0),
        consultationFee: Number(input.consultationFee ?? 0),
        registrationNumber: input.registrationNumber as string,
      },
    });
  }
}
