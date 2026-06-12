/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/search/search.service.ts
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
 * Business logic service for search
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

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

export interface SearchResult {
  entityType: string;
  entityId: string;
  title: string;
  subtitle?: string;
  description?: string;
  score: number;
  url?: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(
    query: string,
    options?: {
      types?: string[];
      limit?: number;
      page?: number;
      userId?: string;
      clinicId?: string;
      tenantId?: string;
    },
  ): Promise<PaginatedResponseDto<SearchResult>> {
    const limit = options?.limit ?? 20;
    const page = options?.page ?? 1;
    const skip = (page - 1) * limit;

    const results: SearchResult[] = [];
    const searchTerm = `%${query.toLowerCase()}%`;

    const searches: Promise<{ type: string; items: SearchResult[] }>[] = [];

    if (!options?.types || options.types.includes('patients')) {
      searches.push(this.searchPatients(searchTerm, limit, options));
    }

    if (!options?.types || options.types.includes('doctors')) {
      searches.push(this.searchDoctors(searchTerm, limit, options));
    }

    if (!options?.types || options.types.includes('records')) {
      searches.push(this.searchRecords(searchTerm, limit, options));
    }

    if (!options?.types || options.types.includes('appointments')) {
      searches.push(this.searchAppointments(searchTerm, limit, options));
    }

    if (!options?.types || options.types.includes('prescriptions')) {
      searches.push(this.searchPrescriptions(searchTerm, limit, options));
    }

    if (!options?.types || options.types.includes('reports')) {
      searches.push(this.searchReports(searchTerm, limit, options));
    }

    const allResults = await Promise.all(searches);
    for (const group of allResults) {
      results.push(...group.items);
    }

    results.sort((a, b) => b.score - a.score);
    const total = results.length;
    const paginated = results.slice(skip, skip + limit);

    return new PaginatedResponseDto(paginated, total, page, limit);
  }

  private async searchPatients(
    searchTerm: string,
    limit: number,
    options?: { userId?: string; clinicId?: string; tenantId?: string },
  ): Promise<{ type: string; items: SearchResult[] }> {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: searchTerm, mode: 'insensitive' } },
          { phoneNumber: { contains: searchTerm, mode: 'insensitive' } },
          { wyshId: { contains: searchTerm, mode: 'insensitive' } },
        ],
        ...(options?.tenantId ? { tenantId: options.tenantId } : {}),
      },
      take: limit,
      select: { id: true, fullName: true, phoneNumber: true, wyshId: true },
    });

    return {
      type: 'patients',
      items: users.map((u) => ({
        entityType: 'patient',
        entityId: u.id,
        title: u.fullName,
        subtitle: u.phoneNumber,
        description: u.wyshId,
        score: u.fullName.toLowerCase().includes(searchTerm) ? 1.0 : 0.8,
        url: `/patients/${u.id}`,
      })),
    };
  }

  private async searchDoctors(
    searchTerm: string,
    limit: number,
    _options?: { clinicId?: string; tenantId?: string },
  ): Promise<{ type: string; items: SearchResult[] }> {
    const doctors = await this.prisma.doctorProfile.findMany({
      where: {
        OR: [
          { specialization: { contains: searchTerm, mode: 'insensitive' } },
          { qualifications: { has: searchTerm } },
          { user: { fullName: { contains: searchTerm, mode: 'insensitive' } } },
        ],
      },
      take: limit,
      include: { user: { select: { id: true, fullName: true } } },
    });

    return {
      type: 'doctors',
      items: doctors.map((d) => ({
        entityType: 'doctor',
        entityId: d.userId,
        title: d.user.fullName,
        subtitle: d.specialization,
        description: d.qualifications?.join(', '),
        score: 0.9,
        url: `/doctors/${d.userId}`,
      })),
    };
  }

  private async searchRecords(
    searchTerm: string,
    limit: number,
    options?: { userId?: string; tenantId?: string },
  ): Promise<{ type: string; items: SearchResult[] }> {
    const records = await this.prisma.healthRecord.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
        ...(options?.userId ? { userId: options.userId } : {}),
      },
      take: limit,
      select: { id: true, title: true, description: true, recordType: true },
    });

    return {
      type: 'records',
      items: records.map((r) => ({
        entityType: 'record',
        entityId: r.id,
        title: r.title,
        subtitle: r.recordType,
        description: r.description?.slice(0, 200),
        score: 0.7,
        url: `/records/${r.id}`,
      })),
    };
  }

  private async searchAppointments(
    searchTerm: string,
    limit: number,
    options?: { userId?: string; clinicId?: string; tenantId?: string },
  ): Promise<{ type: string; items: SearchResult[] }> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        reason: { contains: searchTerm, mode: 'insensitive' },
        ...(options?.userId ? { patientUserId: options.userId } : {}),
        ...(options?.clinicId ? { clinicId: options.clinicId } : {}),
      },
      take: limit,
      select: { id: true, reason: true, status: true, slotStartAt: true },
    });

    return {
      type: 'appointments',
      items: appointments.map((a) => ({
        entityType: 'appointment',
        entityId: a.id,
        title: a.reason ?? 'Appointment',
        subtitle: a.status,
        description: a.slotStartAt.toISOString().slice(0, 10),
        score: 0.6,
        url: `/appointments/${a.id}`,
      })),
    };
  }

  private async searchPrescriptions(
    searchTerm: string,
    limit: number,
    options?: { userId?: string; tenantId?: string },
  ): Promise<{ type: string; items: SearchResult[] }> {
    const records = await this.prisma.healthRecord.findMany({
      where: {
        recordType: 'PRESCRIPTION',
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
        ...(options?.userId ? { userId: options.userId } : {}),
      },
      take: limit,
      select: { id: true, title: true, description: true, createdAt: true },
    });

    return {
      type: 'prescriptions',
      items: records.map((r) => ({
        entityType: 'prescription',
        entityId: r.id,
        title: r.title,
        subtitle: r.createdAt.toISOString().slice(0, 10),
        description: r.description?.slice(0, 200),
        score: 0.75,
        url: `/records/${r.id}`,
      })),
    };
  }

  private async searchReports(
    searchTerm: string,
    limit: number,
    options?: { userId?: string; tenantId?: string },
  ): Promise<{ type: string; items: SearchResult[] }> {
    const reports = await this.prisma.diagnosticReport.findMany({
      where: {
        OR: [
          { reportType: { contains: searchTerm, mode: 'insensitive' } },
          { summary: { contains: searchTerm, mode: 'insensitive' } },
        ],
        ...(options?.userId ? { patientUserId: options.userId } : {}),
      },
      take: limit,
      select: { id: true, reportType: true, summary: true, createdAt: true },
    });

    return {
      type: 'reports',
      items: reports.map((r) => ({
        entityType: 'report',
        entityId: r.id,
        title: r.reportType,
        subtitle: r.createdAt.toISOString().slice(0, 10),
        description: r.summary?.slice(0, 200),
        score: 0.65,
        url: `/reports/${r.id}`,
      })),
    };
  }
}
