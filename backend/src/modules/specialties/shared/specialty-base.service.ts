/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/shared/specialty-base.service.ts
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
 * Business logic service for shared
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
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
 - client
 - common
 *
 * Dependencies:
 - client
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

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../providers/prisma/prisma.service';

export interface SpecialtyFindingInput {
  specialtyCode: string;
  encounterId: string;
  patientId: string;
  providerId: string;
  category: string;
  findingKey: string;
  findingValue: Record<string, unknown>;
  severity?: string;
  status?: string;
}

@Injectable()
export class SpecialtyBaseService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Encounter Data (JSON blob) ──

  async saveEncounterData(data: {
    specialtyCode: string;
    encounterId: string;
    patientId: string;
    providerId: string;
    templateId?: string;
    formData: Record<string, unknown>;
    diagrams?: Record<string, unknown>[];
  }) {
    return this.prisma.specialtyEncounterData.create({
      data: {
        specialtyCode: data.specialtyCode,
        encounterId: data.encounterId,
        patientId: data.patientId,
        providerId: data.providerId,
        templateId: data.templateId,
        data: data.formData as Prisma.InputJsonValue,
        diagrams: (data.diagrams ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  async getEncounterData(encounterId: string) {
    return this.prisma.specialtyEncounterData.findMany({
      where: { encounterId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPatientHistory(patientId: string, specialtyCode?: string) {
    return this.prisma.specialtyEncounterData.findMany({
      where: { patientId, ...(specialtyCode ? { specialtyCode } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { Encounter: { select: { periodStart: true, reason: true } } },
    });
  }

  async updateEncounterData(id: string, data: Partial<{ formData: Record<string, unknown>; diagrams: Record<string, unknown>[] }>) {
    return this.prisma.specialtyEncounterData.update({
      where: { id },
      data: { data: data.formData as Prisma.InputJsonValue, diagrams: data.diagrams as Prisma.InputJsonValue },
    });
  }

  // ── Structured Findings ──

  async saveFindings(findings: SpecialtyFindingInput[]) {
    if (findings.length === 0) return [];
    return this.prisma.$transaction(
      findings.map(f =>
        this.prisma.specialtyFinding.create({
          data: {
            specialtyCode: f.specialtyCode,
            encounterId: f.encounterId,
            patientId: f.patientId,
            providerId: f.providerId,
            category: f.category,
            findingKey: f.findingKey,
            findingValue: f.findingValue as Prisma.InputJsonValue,
            severity: f.severity,
            status: f.status,
          },
        })
      )
    );
  }

  async saveEncounterWithFindings(data: {
    specialtyCode: string;
    encounterId: string;
    patientId: string;
    providerId: string;
    templateId?: string;
    formData: Record<string, unknown>;
    diagrams?: Record<string, unknown>[];
    findings?: SpecialtyFindingInput[];
  }) {
    return this.prisma.$transaction(async tx => {
      const encounter = await tx.specialtyEncounterData.create({
        data: {
          specialtyCode: data.specialtyCode,
          encounterId: data.encounterId,
          patientId: data.patientId,
          providerId: data.providerId,
          templateId: data.templateId,
          data: data.formData as Prisma.InputJsonValue,
          diagrams: (data.diagrams ?? []) as Prisma.InputJsonValue,
        },
      });

      if (data.findings && data.findings.length > 0) {
        await tx.specialtyFinding.createMany({
          data: data.findings.map(f => ({
            specialtyCode: f.specialtyCode,
            encounterId: f.encounterId,
            patientId: f.patientId,
            providerId: f.providerId,
            category: f.category,
            findingKey: f.findingKey,
            findingValue: f.findingValue as Prisma.InputJsonValue,
            severity: f.severity,
            status: f.status,
          })),
        });
      }

      return encounter;
    });
  }

  async getFindings(patientId: string, specialtyCode?: string) {
    return this.prisma.specialtyFinding.findMany({
      where: { patientId, ...(specialtyCode ? { specialtyCode } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFindingsByCategory(patientId: string, specialtyCode: string, category: string) {
    return this.prisma.specialtyFinding.findMany({
      where: { patientId, specialtyCode, category },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFindingsByEncounter(encounterId: string) {
    return this.prisma.specialtyFinding.findMany({
      where: { encounterId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteFindingsByEncounter(encounterId: string) {
    return this.prisma.specialtyFinding.deleteMany({
      where: { encounterId },
    });
  }
}
