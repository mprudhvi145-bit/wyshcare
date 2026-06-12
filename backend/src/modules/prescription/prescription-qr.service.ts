/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/prescription/prescription-qr.service.ts
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
 * Business logic service for prescription
 *
 * Responsibilities:
 * - Execute business logic for prescription operations
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
Prescription
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
import { createHash, randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class PrescriptionQRService {
  private readonly logger = new Logger(PrescriptionQRService.name);
  private readonly BASE_URL = 'https://wyshcare.com/rx/verify';

  constructor(private readonly prisma: PrismaService) {}

  async generateVerification(prescriptionId: string): Promise<{
    qrHash: string;
    verificationUrl: string;
    tamperHash: string;
  }> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        PrescriptionItem: true,
        doctorProfile: { select: { id: true } },
        patientUser: { select: { id: true } },
      },
    });

    if (!prescription) throw new Error(`Prescription ${prescriptionId} not found`);

    const payload = {
      prescriptionId,
      items: prescription.PrescriptionItem.map((i) => ({
        drugName: i.drugName,
        dosage: i.dosage,
        frequency: i.frequency,
        durationDays: i.durationDays,
        quantity: i.quantity,
      })),
      doctorId: prescription.doctorProfileId,
      patientId: prescription.patientUserId,
      issuedAt: prescription.issuedAt?.toISOString() ?? prescription.createdAt.toISOString(),
    };

    const qrSecret = process.env.PRESCRIPTION_SECRET ?? 'wyshcare-secret';
    const tamperHash = createHash('sha256').update(JSON.stringify(payload) + qrSecret).digest('hex');
    const qrHash = randomBytes(16).toString('hex');
    const verificationUrl = `${this.BASE_URL}/${qrHash}`;

    await this.prisma.prescriptionVerification.upsert({
      where: { prescriptionId },
      create: { id: randomUUID(), prescriptionId, qrHash, verificationUrl, tamperHash },
      update: { qrHash, verificationUrl, tamperHash, isTampered: false, verifiedAt: null, verifiedBy: null },
    });

    return { qrHash, verificationUrl, tamperHash };
  }

  async verifyPrescription(qrHash: string): Promise<{
    valid: boolean;
    prescriptionId: string;
    tampered: boolean;
    verifiedAt?: Date;
    details?: {
      doctorId?: string;
      patientId?: string;
      issuedAt?: string;
      items: Array<{ drugName: string; dosage: string; frequency: string }>;
    };
  }> {
    const verification = await this.prisma.prescriptionVerification.findUnique({
      where: { qrHash },
      include: {
        Prescription: {
          include: {
            PrescriptionItem: true,
            PrescriptionVerification: true,
          },
        },
      },
    });

    if (!verification) {
      return { valid: false, prescriptionId: '', tampered: false };
    }

    const rx = verification.Prescription;
    const payload = {
      prescriptionId: rx.id,
      items: rx.PrescriptionItem.map((i) => ({
        drugName: i.drugName,
        dosage: i.dosage,
        frequency: i.frequency,
        durationDays: i.durationDays,
        quantity: i.quantity,
      })),
      doctorId: rx.doctorProfileId,
      patientId: rx.patientUserId,
      issuedAt: rx.issuedAt?.toISOString() ?? rx.createdAt.toISOString(),
    };

    const secret = process.env.PRESCRIPTION_SECRET ?? 'wyshcare-secret';
    const expectedHash = createHash('sha256').update(JSON.stringify(payload) + secret).digest('hex');
    const isTampered = verification.tamperHash !== expectedHash;

    return {
      valid: true,
      prescriptionId: rx.id,
      tampered: isTampered,
      verifiedAt: verification.verifiedAt ?? undefined,
      details: {
        doctorId: rx.doctorProfileId ?? undefined,
        patientId: rx.patientUserId ?? undefined,
        issuedAt: rx.issuedAt?.toISOString(),
        items: rx.PrescriptionItem.map((i) => ({
          drugName: i.drugName,
          dosage: i.dosage,
          frequency: i.frequency,
        })),
      },
    };
  }

  async markVerified(qrHash: string, verifiedBy: string): Promise<void> {
    await this.prisma.prescriptionVerification.update({
      where: { qrHash },
      data: { verifiedAt: new Date(), verifiedBy },
    });
  }
}
