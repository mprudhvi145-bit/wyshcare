/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/clinic-admin/admin-os.service.ts
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
 * Business logic service for clinic-admin
 *
 * Responsibilities:
 * - Execute business logic for admin operations
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
Admin
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

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminOsService {
  private readonly logger = new Logger(AdminOsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getClinicDashboard(clinicId: string) {
    const [clinic, docMappings, staff, queueEntries] = await Promise.all([
      this.prisma.clinic.findUnique({ where: { id: clinicId } }),
      this.prisma.doctorClinic.findMany({
        where: { clinicId },
        include: { doctor: { include: { user: { select: { fullName: true } } } } },
      }),
      this.prisma.staffAssignment.findMany({
        where: { clinicId },
        include: { User: { select: { fullName: true } } },
      }),
      this.prisma.queueEntry.findMany({ where: { clinicId, status: { in: ['WAITING', 'IN_PROGRESS'] } } }),
    ]);
    if (!clinic) throw new NotFoundException('Clinic not found');

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const [todayAppts, todayInvoices] = await Promise.all([
      this.prisma.appointment.count({ where: { clinicId, slotStartAt: { gte: dayStart, lt: dayEnd } } }),
      this.prisma.billingInvoice.aggregate({
        where: { clinicId, createdAt: { gte: dayStart, lt: dayEnd } },
        _sum: { paidAmount: true, totalAmount: true },
      }),
    ]);

    return {
      clinic: { id: clinic.id, name: clinic.name, city: clinic.city, state: clinic.state },
      staff: {
        doctors: docMappings.map(d => ({ id: d.doctorId, name: d.doctor.user.fullName, isPrimary: d.isPrimary })),
        assignments: staff.map(s => ({ id: s.id, name: s.User.fullName, role: s.role })),
      },
      today: {
        appointments: todayAppts,
        inQueue: queueEntries.filter(q => q.status === 'WAITING').length,
        inProgress: queueEntries.filter(q => q.status === 'IN_PROGRESS').length,
        revenue: todayInvoices._sum.paidAmount ?? 0,
        billed: todayInvoices._sum.totalAmount ?? 0,
      },
    };
  }

  async listBranches(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};
    return this.prisma.clinic.findMany({
      where,
      include: {
        StaffAssignment: { select: { id: true, role: true, userId: true } },
      },
    });
  }

  async getBranchAnalytics(clinicId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 86400000);
    const [appointments, invoices, qEntries] = await Promise.all([
      this.prisma.appointment.findMany({ where: { clinicId, slotStartAt: { gte: startDate } } }),
      this.prisma.billingInvoice.findMany({ where: { clinicId, createdAt: { gte: startDate } } }),
      this.prisma.queueEntry.findMany({ where: { clinicId, createdAt: { gte: startDate } } }),
    ]);

    const avgWait = qEntries
      .filter(q => q.checkedInAt && q.assignedAt)
      .reduce((sum, q) => sum + (q.assignedAt!.getTime() - q.checkedInAt!.getTime()) / 60000, 0);
    const avgWaitMinutes = Math.round(avgWait / Math.max(qEntries.filter(q => q.assignedAt).length, 1));
    const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);

    return {
      period: days,
      appointments: {
        total: appointments.length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
        noShow: appointments.filter(a => a.status === 'NO_SHOW').length,
      },
      revenue: {
        totalBilled,
        totalCollected,
        collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
      },
      operations: {
        totalVisits: qEntries.length,
        avgWaitMinutes,
        walkIns: qEntries.filter(q => q.source === 'WALK_IN').length,
        noShows: qEntries.filter(q => q.status === 'NO_SHOW').length,
      },
    };
  }

  async manageStaff(clinicId: string) {
    return this.prisma.staffAssignment.findMany({
      where: { clinicId },
      include: { User: { select: { id: true, fullName: true, phoneNumber: true, email: true } } },
    });
  }

  async updateClinic(clinicId: string, data: Partial<{ name: string; description: string; phoneNumber: string; email: string; timezone: string; services: string[]; facilities: string[]; operatingHours: Record<string, unknown> }>) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) throw new NotFoundException('Clinic not found');
    const updateData = data.operatingHours !== undefined
      ? { ...data, operatingHours: data.operatingHours as Prisma.InputJsonValue }
      : data;
    return this.prisma.clinic.update({
      where: { id: clinicId },
      data: {
        ...updateData,
        operatingHours: updateData.operatingHours as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
