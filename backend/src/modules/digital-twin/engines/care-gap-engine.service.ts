/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/engines/care-gap-engine.service.ts
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
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - client
 - common
 - crypto
 *
 * Dependencies:
 - client
 - common
 - crypto
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
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { CareGapCategory, RecommendationPriority } from '@prisma/client';

interface CareGapResult {
  category: string;
  title: string;
  description: string;
  priority: string;
  dueDate?: Date;
  sourceGuideline?: string;
  sourceCondition?: string;
}

@Injectable()
export class CareGapEngineService {
  private readonly logger = new Logger(CareGapEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findGaps(userId: string, twinId: string): Promise<{ gaps: CareGapResult[]; count: number }> {
    const [user, conditions, immunizations, encounters, clinicalOrders, allergies] =
      await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.condition.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
        this.prisma.immunization.findMany({ where: { patientId: userId } }),
        this.prisma.encounter.findMany({
          where: { patientId: userId },
          orderBy: { periodStart: 'desc' },
        }),
        this.prisma.clinicalOrder.findMany({
          where: { patientId: userId, status: 'ACTIVE' },
        }),
        this.prisma.allergy.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
      ]);

    const age = user?.dateOfBirth ? this.calcAge(user.dateOfBirth) : null;
    const gender = user?.gender ?? null;

    const gaps: CareGapResult[] = [];
    const now = new Date();

    const hasDiabetes = conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasHypertension = conditions.some(c => /hypertension|htn|bp|blood.pressure/i.test(c.displayName));
    const hasCVD = conditions.some(c => /heart|cardiac|chd|cad|afib|stroke|cva|mi/i.test(c.displayName));
    const hasObesity = conditions.some(c => /obes|overweight/i.test(c.displayName));

    const lastEncounter = encounters[0] ?? null;
    const lastEncounterDate = lastEncounter?.periodStart ?? null;
    const recentOrders = clinicalOrders.filter(o => o.orderType === 'LAB');
    const hasRecentLipid = recentOrders.some(o => /lipid|cholesterol|ldl|hdl/i.test(o.title));

    const hasFluVaccine = immunizations.some(i => /flu|influenza/i.test(i.vaccineName) &&
      i.administeredDate >= new Date(now.getFullYear() - 1, 6, 1));
    const hasTetanusVaccine = immunizations.some(i => /tetanus|tdap|td/i.test(i.vaccineName) &&
      i.administeredDate >= new Date(now.getFullYear() - 10, 0, 1));
    const hasHPVStarted = immunizations.some(i => /hpv|human.papillomavirus/i.test(i.vaccineName));

    // 1. Age 40+ — Mammogram (women)
    if (age !== null && age >= 40 && gender?.toLowerCase() === 'female') {
      const lastMammogram = await this.prisma.clinicalOrder.findFirst({
        where: { patientId: userId, title: { contains: 'mammogram', mode: 'insensitive' }, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
      });
      if (!lastMammogram || !lastMammogram.completedAt || this.daysBetween(lastMammogram.completedAt, now) > 730) {
        gaps.push({
          category: 'SCREENING',
          title: 'Mammogram screening due',
          description: 'Annual mammogram recommended for women aged 40+ per USPSTF guidelines.',
          priority: 'HIGH',
          dueDate: lastMammogram?.completedAt ? new Date(lastMammogram.completedAt.getTime() + 730 * 86400000) : undefined,
          sourceGuideline: 'USPSTF — Breast Cancer Screening',
          sourceCondition: 'Age 40+ Female',
        });
      }
    }

    // 2. Age 50+ — Colorectal screening
    if (age !== null && age >= 50) {
      const lastColonoscopy = await this.prisma.clinicalOrder.findFirst({
        where: { patientId: userId, title: { contains: 'colonoscop', mode: 'insensitive' }, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
      });
      if (!lastColonoscopy || !lastColonoscopy.completedAt || this.daysBetween(lastColonoscopy.completedAt, now) > 3650) {
        gaps.push({
          category: 'SCREENING',
          title: 'Colorectal cancer screening due',
          description: 'Colonoscopy every 10 years or FIT/FOBT annually for adults aged 50-75 per USPSTF.',
          priority: 'HIGH',
          dueDate: lastColonoscopy?.completedAt ? new Date(lastColonoscopy.completedAt.getTime() + 3650 * 86400000) : undefined,
          sourceGuideline: 'USPSTF — Colorectal Cancer Screening',
          sourceCondition: 'Age 50+',
        });
      }
    }

    // 3. Diabetes → HbA1c due (last 3 months)
    if (hasDiabetes) {
      const lastHbA1cOrder = await this.prisma.clinicalOrder.findFirst({
        where: { patientId: userId, title: { contains: 'hba1c', mode: 'insensitive' }, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
      });
      if (!lastHbA1cOrder || !lastHbA1cOrder.completedAt || this.daysBetween(lastHbA1cOrder.completedAt, now) > 90) {
        gaps.push({
          category: 'LAB_TEST',
          title: 'HbA1c test overdue',
          description: 'Diabetes patients require HbA1c testing every 3 months for glycemic monitoring.',
          priority: 'HIGH',
          dueDate: lastHbA1cOrder?.completedAt ? new Date(lastHbA1cOrder.completedAt.getTime() + 90 * 86400000) : undefined,
          sourceGuideline: 'ADA Standards of Care',
          sourceCondition: 'Diabetes',
        });
      }

      gaps.push({
        category: 'SCREENING',
        title: 'Annual diabetic eye exam due',
        description: 'Annual dilated eye exam recommended for all diabetic patients to screen for retinopathy.',
        priority: 'MEDIUM',
        sourceGuideline: 'ADA Standards of Care',
        sourceCondition: 'Diabetes',
      });

      gaps.push({
        category: 'FOLLOW_UP',
        title: 'Annual foot exam due',
        description: 'Comprehensive foot exam recommended annually for diabetes-related neuropathy screening.',
        priority: 'MEDIUM',
        sourceGuideline: 'ADA Standards of Care',
        sourceCondition: 'Diabetes',
      });
    }

    // 4. Hypertension → BP check due
    if (hasHypertension) {
      const lastBPRecord = await this.prisma.vitalsRecord.findFirst({
        where: { patientId: userId },
        orderBy: { recordedAt: 'desc' },
      });
      if (!lastBPRecord || !lastBPRecord.recordedAt || this.daysBetween(lastBPRecord.recordedAt, now) > 90) {
        gaps.push({
          category: 'FOLLOW_UP',
          title: 'Blood pressure check overdue',
          description: 'Hypertension patients should have BP checked at least every 3 months.',
          priority: 'HIGH',
          dueDate: lastBPRecord?.recordedAt ? new Date(lastBPRecord.recordedAt.getTime() + 90 * 86400000) : undefined,
          sourceGuideline: 'JNC 8 / ACC/AHA Guidelines',
          sourceCondition: 'Hypertension',
        });
      }

      gaps.push({
        category: 'LAB_TEST',
        title: 'Annual metabolic panel due',
        description: 'Annual comprehensive metabolic panel recommended for hypertension monitoring.',
        priority: 'MEDIUM',
        sourceGuideline: 'ACC/AHA Guidelines',
        sourceCondition: 'Hypertension',
      });
    }

    // 5. Annual checkup — all adults
    if (age !== null && age >= 18) {
      const lastCheckup = lastEncounterDate;
      if (!lastCheckup || this.daysBetween(lastCheckup, now) > 365) {
        gaps.push({
          category: 'HEALTH_CHECKUP',
          title: 'Annual health checkup due',
          description: 'Comprehensive annual wellness visit recommended for all adults.',
          priority: 'MEDIUM',
          dueDate: lastCheckup ? new Date(lastCheckup.getTime() + 365 * 86400000) : undefined,
          sourceGuideline: 'USPSTF — Preventive Services',
          sourceCondition: 'General Adult',
        });
      }
    }

    // 6. No encounter in 6 months → follow-up gap
    if (!lastEncounterDate || this.daysBetween(lastEncounterDate, now) > 180) {
      gaps.push({
        category: 'FOLLOW_UP',
        title: 'Follow-up visit recommended',
        description: `No clinical encounter in the last ${lastEncounterDate ? Math.floor(this.daysBetween(lastEncounterDate, now)) : 'unknown'} days. Routine follow-up recommended.`,
        priority: 'LOW' as string,
        sourceGuideline: 'Continuity of Care Standards',
        sourceCondition: 'General',
      });
    }

    // 7. Immunizations
    if (!hasFluVaccine) {
      gaps.push({
        category: 'VACCINATION',
        title: 'Annual flu vaccine due',
        description: 'Influenza vaccine recommended annually, especially for patients with chronic conditions.',
        priority: 'MEDIUM',
        sourceGuideline: 'CDC / ACIP Adult Immunization Schedule',
      });
    }

    if (!hasTetanusVaccine) {
      gaps.push({
        category: 'VACCINATION',
        title: 'Tetanus booster due',
        description: 'Td or Tdap booster recommended every 10 years.',
        priority: 'LOW' as string,
        sourceGuideline: 'CDC / ACIP Adult Immunization Schedule',
      });
    }

    if (age !== null && age >= 11 && age <= 26 && !hasHPVStarted) {
      gaps.push({
        category: 'VACCINATION',
        title: 'HPV vaccination due',
        description: `HPV vaccine series recommended for ${gender === 'male' ? 'males' : 'females'} up to age 26.`,
        priority: 'MEDIUM',
        sourceGuideline: 'CDC / ACIP HPV Vaccine Recommendations',
      });
    }

    // 8. Active allergies without recent follow-up
    if (allergies.length > 0) {
      const hasAllergyFollowUp = clinicalOrders.some(o =>
        /allergy|immunotherapy|desensitization/i.test(o.title),
      );
      if (!hasAllergyFollowUp) {
        gaps.push({
          category: 'SPECIALIST_REFERRAL',
          title: 'Allergy follow-up evaluation',
          description: `${allergies.length} active allergen(s) identified. Consider allergy specialist evaluation.`,
          priority: 'LOW' as string,
          sourceCondition: allergies.map(a => a.allergen).join(', '),
        });
      }
    }

    // 9. Patients with conditions not seen recently
    if (conditions.length > 0 && lastEncounterDate && this.daysBetween(lastEncounterDate, now) > 90) {
      const primaryCondition = conditions[0]!;
      gaps.push({
        category: 'FOLLOW_UP',
        title: `Chronic condition follow-up: ${primaryCondition.displayName}`,
        description: `Last encounter ${Math.floor(this.daysBetween(lastEncounterDate, now))} days ago. Follow-up within 3 months recommended for active condition management.`,
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 30 * 86400000),
        sourceCondition: primaryCondition.displayName,
      });
    }

    // 10. Lipid panel for CVD/hypertension/diabetes/Obesity
    if ((hasCVD || hasHypertension || hasDiabetes || hasObesity) && !hasRecentLipid) {
      gaps.push({
        category: 'LAB_TEST',
        title: 'Lipid panel due',
        description: 'Fasting lipid panel recommended for cardiovascular risk assessment in patients with metabolic conditions.',
        priority: 'MEDIUM',
        sourceGuideline: 'ACC/AHA Cholesterol Guidelines',
        sourceCondition: conditions.filter(c => /diabetes|hypertension|heart|obes/i.test(c.displayName)).map(c => c.displayName).join(', '),
      });
    }

    // Deduplicate gaps by title
    const seen = new Set<string>();
    const uniqueGaps = gaps.filter(g => {
      const key = g.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Map priorities to valid CareGapCategory and RecommendationPriority enum values
    const mappedGaps = uniqueGaps.map(g => ({
      id: randomUUID(),
      twinId,
      category: g.category as CareGapCategory,
      title: g.title,
      description: g.description,
      priority: this.mapPriority(g.priority) as RecommendationPriority,
      dueDate: g.dueDate ?? null,
      sourceGuideline: g.sourceGuideline ?? null,
      sourceCondition: g.sourceCondition ?? null,
      status: 'OPEN',
      updatedAt: new Date(),
    }));

    // Upsert existing open gaps, skip duplicates by title
    const existingGaps = await this.prisma.careGap.findMany({
      where: { twinId, status: 'OPEN' },
      select: { title: true },
    });
    const existingTitles = new Set(existingGaps.map(g => g.title));

    const newGaps = mappedGaps.filter(g => !existingTitles.has(g.title));

    if (newGaps.length > 0) {
      await this.prisma.careGap.createMany({ data: newGaps });
    }

    const allGaps = await this.prisma.careGap.findMany({
      where: { twinId },
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
    });

    return {
      gaps: allGaps.map(g => ({
        ...g,
        dueDate: g.dueDate ?? undefined,
        sourceGuideline: g.sourceGuideline ?? undefined,
        sourceCondition: g.sourceCondition ?? undefined,
      })),
      count: allGaps.length,
    };
  }

  private mapPriority(priority: string): string {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return 'CRITICAL';
      case 'HIGH': return 'HIGH';
      case 'MEDIUM': return 'MEDIUM';
      case 'LOW': return 'LOW';
      default: return 'MEDIUM';
    }
  }

  private daysBetween(a: Date, b: Date): number {
    return (b.getTime() - a.getTime()) / 86400000;
  }

  private calcAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }
}
