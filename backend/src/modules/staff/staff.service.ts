/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/staff/staff.service.ts
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
 * Business logic service for staff
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

import { Injectable, ForbiddenException } from '@nestjs/common';

import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const staffAssignments = await this.prisma.staffAssignment.findMany({
      where: { userId, isActive: true },
      include: { Clinic: true },
    });

    if (staffAssignments.length === 0) {
      throw new ForbiddenException('No active staff assignment found for this user');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    const assignment = staffAssignments[0]!;
    const clinicId = assignment.clinicId;
    const role = assignment.role;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const todayAppointments = await this.prisma.appointment.findMany({
      where: { clinicId, slotStartAt: { gte: todayStart, lt: todayEnd } },
      orderBy: { slotStartAt: 'asc' },
      include: {
        patientUser: { select: { id: true, fullName: true, phoneNumber: true, gender: true, dateOfBirth: true } },
        doctorProfile: { include: { user: { select: { fullName: true } } } },
      },
    });

    const base = {
      staffName: user?.fullName ?? 'Staff',
      role,
      clinic: { id: clinicId, name: assignment.Clinic!.name, city: assignment.Clinic!.city },
    };

    if (role === 'RECEPTION') {
      const waiting = todayAppointments.filter((a) => a.status === 'CHECKED_IN');
      return {
        ...base,
        todaySummary: {
          total: todayAppointments.length,
          checkedIn: waiting.length,
          confirmed: todayAppointments.filter((a) => a.status === 'CONFIRMED').length,
          completed: todayAppointments.filter((a) => a.status === 'COMPLETED').length,
          noShow: todayAppointments.filter((a) => a.status === 'NO_SHOW').length,
        },
        queue: todayAppointments
          .filter((a) => ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status))
          .map((a) => ({
            id: a.id,
            patientName: a.patientUser.fullName,
            patientPhone: a.patientUser.phoneNumber,
            doctorName: a.doctorProfile.user.fullName,
            time: `${a.slotStartAt.toISOString().slice(11, 16)}-${a.slotEndAt.toISOString().slice(11, 16)}`,
            status: a.status,
            mode: a.consultationMode,
            reason: a.reason,
          })),
        allAppointments: todayAppointments.map((a) => ({
          id: a.id,
          patientName: a.patientUser.fullName,
          phone: a.patientUser.phoneNumber,
          doctorName: a.doctorProfile.user.fullName,
          time: a.slotStartAt.toISOString().slice(11, 16),
          status: a.status,
          mode: a.consultationMode,
        })),
      };
    }

    if (role === 'NURSE') {
      return {
        ...base,
        todaySummary: {
          totalPatients: todayAppointments.length,
          waitingVitals: todayAppointments.filter((a) => a.status === 'CHECKED_IN').length,
          upcoming: todayAppointments.filter((a) => a.status === 'CONFIRMED').length,
        },
        patients: todayAppointments.map((a) => ({
          id: a.id,
          patientName: a.patientUser.fullName,
          age: a.patientUser.dateOfBirth ? this.calcAge(a.patientUser.dateOfBirth) : null,
          gender: a.patientUser.gender,
          doctorName: a.doctorProfile.user.fullName,
          time: a.slotStartAt.toISOString().slice(11, 16),
          status: a.status,
          reason: a.reason,
          needsVitals: a.status === 'CHECKED_IN',
        })),
      };
    }

    if (role === 'COORDINATOR') {
      const todayDoctors = [...new Set(todayAppointments.map((a) => a.doctorProfile.user.fullName))];
      const queueLength = todayAppointments.filter((a) => ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status)).length;
      const avgWaitMinutes = 15; // simplified — would track actual wait times in production

      return {
        ...base,
        todaySummary: {
          totalAppointments: todayAppointments.length,
          doctorsAvailable: todayDoctors.length,
          queueLength,
          estimatedAvgWaitMinutes: avgWaitMinutes,
          patientsSeen: todayAppointments.filter((a) => a.status === 'COMPLETED').length,
        },
        doctors: todayDoctors.map((name) => ({
          name,
          patientCount: todayAppointments.filter((a) => a.doctorProfile.user.fullName === name).length,
        })),
      };
    }

    return base;
  }

  private calcAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }
}
