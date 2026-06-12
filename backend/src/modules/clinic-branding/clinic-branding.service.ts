/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinic-branding/clinic-branding.service.ts
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
 * Business logic service for clinic-branding
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class ClinicBrandingService {
  constructor(private readonly prisma: PrismaService) {}

  async getBranding(clinicId: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true, name: true, logoUrl: true, slug: true, operatingHours: true, timezone: true },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');

    const templates = await this.prisma.clinicTemplate.findMany({
      where: { clinicId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const brandingConfig = await this.getBrandingConfig(clinicId);
    return { clinic, templates, branding: brandingConfig };
  }

  private async getBrandingConfig(clinicId: string) {
    const config = await this.prisma.clinicBranding.findUnique({ where: { clinicId } });
    return config ?? { primaryColor: '#8FD3D1', logoUrl: null, faviconUrl: null, theme: {} };
  }

  async upsertBranding(clinicId: string, data: { primaryColor?: string; logoUrl?: string; faviconUrl?: string; theme?: Record<string, unknown> }) {
    return this.prisma.clinicBranding.upsert({
      where: { clinicId },
      create: { clinicId, primaryColor: data.primaryColor, logoUrl: data.logoUrl, faviconUrl: data.faviconUrl, theme: data.theme as Prisma.InputJsonValue },
      update: { primaryColor: data.primaryColor, logoUrl: data.logoUrl, faviconUrl: data.faviconUrl, theme: data.theme as Prisma.InputJsonValue },
    });
  }

  async createTemplate(clinicId: string, data: { specialtyCode: string; name: string; description?: string; templateData: Record<string, unknown> }) {
    return this.prisma.clinicTemplate.create({
      data: { clinicId, specialtyCode: data.specialtyCode, name: data.name, description: data.description, templateData: data.templateData as Prisma.InputJsonValue, isActive: true },
    });
  }

  async getTemplates(clinicId: string, specialtyCode?: string) {
    return this.prisma.clinicTemplate.findMany({
      where: { clinicId, isActive: true, ...(specialtyCode ? { specialtyCode } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTemplate(templateId: string, data: { name?: string; description?: string; templateData?: Record<string, unknown>; isActive?: boolean }) {
    return this.prisma.clinicTemplate.update({
      where: { id: templateId },
      data: { name: data.name, description: data.description, templateData: data.templateData as Prisma.InputJsonValue, isActive: data.isActive },
    });
  }

  async deleteTemplate(templateId: string) {
    return this.prisma.clinicTemplate.update({ where: { id: templateId }, data: { isActive: false } });
  }
}
