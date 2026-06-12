/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/engines/preventive-care-engine.service.ts
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

interface PreventiveRecommendation {
  title: string;
  description: string;
  category: string;
  priority: string;
  dueDate?: Date;
  evidenceLevel?: string;
}

interface PreventiveCareResult {
  generated: number;
  recommendations: PreventiveRecommendation[];
}

@Injectable()
export class PreventiveCareEngineService {
  private readonly logger = new Logger(PreventiveCareEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generate(userId: string, twinId: string): Promise<PreventiveCareResult> {
    const [user, conditions, immunizations, lifestyle, familyHistory, vitalsRecord, existingActive] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.condition.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
      this.prisma.immunization.findMany({ where: { patientId: userId } }),
      this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.familyHistory.findMany({ where: { userId } }),
      this.prisma.vitalsRecord.findFirst({ where: { patientId: userId }, orderBy: { recordedAt: 'desc' } }),
      this.prisma.preventiveRecommendation.findMany({
        where: { userId, status: { in: ['PENDING', 'OVERDUE'] } },
      }),
    ]);

    const age = user?.dateOfBirth ? this.calcAge(user.dateOfBirth) : null;
    const gender = user?.gender ?? null;
    const bmi = vitalsRecord?.bmi ?? null;
    const existingTitles = new Set(existingActive.map(r => r.recommendation.toLowerCase()));

    const hasDiabetes = conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasHypertension = conditions.some(c => /hypertension|htn|bp|blood.pressure/i.test(c.displayName));
    const hasCVD = conditions.some(c => /heart|cardiac|chd|cad|afib|stroke|cva|mi/i.test(c.displayName));
    const hasCOPD = conditions.some(c => /copd|asthma|respiratory/i.test(c.displayName));
    const hasObesity = conditions.some(c => /obes|overweight|bmi/i.test(c.displayName));
    const hasMentalHealth = conditions.some(c => /depression|anxiety|bipolar|schizophrenia|ptsd|mental/i.test(c.displayName));
    const hasKidney = conditions.some(c => /kidney|renal|ckd|nephropathy/i.test(c.displayName));

    const hasFamilyDiabetes = familyHistory.some(f => /diabetes|dm/i.test(f.condition));
    const hasFamilyCVD = familyHistory.some(f => /heart|cardiac|stroke|mi|cvd/i.test(f.condition));
    const hasFamilyCancer = familyHistory.some(f => /cancer|malignancy|tumor/i.test(f.condition));

    const smoking = lifestyle?.smokingStatus === 'CURRENT';
    const sedentary = lifestyle?.activityLevel === 'SEDENTARY';
    const highStress = lifestyle?.stressLevel === 'HIGH' || lifestyle?.stressLevel === 'SEVERE';
    const poorDiet = lifestyle?.dietType === null || lifestyle?.dietType === undefined;
    const heavyAlcohol = lifestyle?.alcoholConsumption === 'HEAVY';
    const poorSleep = lifestyle?.sleepHoursAvg !== null && lifestyle?.sleepHoursAvg !== undefined && lifestyle.sleepHoursAvg < 6;

    const hasFluVaccine = immunizations.some(i => /flu|influenza/i.test(i.vaccineName) &&
      i.administeredDate >= new Date(new Date().getFullYear() - 1, 6, 1));

    const recommendations: PreventiveRecommendation[] = [];

    // MEDICATION category
    if (hasDiabetes) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Start/Review Metformin Therapy',
        description: 'Metformin is first-line therapy for type 2 diabetes. Review current glycemic control and adjust dosage as needed.',
        category: 'MEDICATION',
        priority: 'HIGH',
        evidenceLevel: 'A — ADA Standards of Care',
      });
    }

    if (hasHypertension) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Antihypertensive Medication Review',
        description: 'Review current antihypertensive regimen. ACE inhibitors or ARBs are preferred first-line in most patients.',
        category: 'MEDICATION',
        priority: 'HIGH',
        evidenceLevel: 'A — ACC/AHA Guidelines',
      });
    }

    if (hasCVD) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Statin Therapy Evaluation',
        description: 'Evaluate need for statin therapy for secondary prevention of cardiovascular events.',
        category: 'MEDICATION',
        priority: 'HIGH',
        evidenceLevel: 'A — ACC/AHA Cholesterol Guidelines',
      });

      this.addIfNew(recommendations, existingTitles, {
        title: 'Antiplatelet Therapy Assessment',
        description: 'Assess need for aspirin or P2Y12 inhibitor for secondary cardiovascular prevention.',
        category: 'MEDICATION',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ACC/AHA Guidelines',
      });
    }

    if (age !== null && age >= 60 && hasHypertension) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Aspirin for Primary Prevention',
        description: 'Consider low-dose aspirin for primary prevention of CVD in adults aged 60+ with hypertension.',
        category: 'MEDICATION',
        priority: 'MEDIUM',
        evidenceLevel: 'B — USPSTF',
      });
    }

    // LIFESTYLE category
    if (smoking) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Smoking Cessation Program',
        description: 'Enroll in a structured smoking cessation program. Consider pharmacotherapy (nicotine replacement, bupropion, varenicline).',
        category: 'LIFESTYLE',
        priority: 'CRITICAL',
        evidenceLevel: 'A — USPSTF',
      });
    }

    if (sedentary) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Physical Activity Prescription',
        description: 'Prescribe graded exercise program: start with 10-min walks, progress to 150 min/week moderate intensity.',
        category: 'LIFESTYLE',
        priority: 'HIGH',
        evidenceLevel: 'A — WHO Physical Activity Guidelines',
      });
    }

    if (poorDiet || hasObesity) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Dietary Counseling and Nutrition Plan',
        description: 'Refer to registered dietitian for medical nutrition therapy. Consider Mediterranean or DASH diet approach.',
        category: 'LIFESTYLE',
        priority: 'HIGH',
        evidenceLevel: 'A — ADA/ACC Guidelines',
      });
    }

    if (heavyAlcohol) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Alcohol Reduction Counseling',
        description: 'Brief intervention and counseling for alcohol reduction. Refer to substance abuse services if needed.',
        category: 'LIFESTYLE',
        priority: 'HIGH',
        evidenceLevel: 'B — USPSTF',
      });
    }

    if (highStress) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Stress Management Program',
        description: 'Recommend mindfulness-based stress reduction, meditation, or counseling for stress management.',
        category: 'LIFESTYLE',
        priority: 'MEDIUM',
        evidenceLevel: 'B — APA Guidelines',
      });
    }

    if (poorSleep) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Sleep Hygiene Optimization',
        description: 'Evaluate sleep patterns. Recommend sleep hygiene: consistent schedule, no screens before bed, limit caffeine.',
        category: 'LIFESTYLE',
        priority: 'MEDIUM',
        evidenceLevel: 'C — AASM Guidelines',
      });
    }

    if (bmi !== null && bmi >= 30) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Weight Management Program',
        description: 'Refer to structured weight management program. Target 5-10% weight loss over 6 months.',
        category: 'LIFESTYLE',
        priority: 'HIGH',
        evidenceLevel: 'A — Obesity Guidelines',
      });
    }

    // SCREENING category
    if (age !== null && age >= 40 && gender?.toLowerCase() === 'female') {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Mammogram Screening',
        description: 'Schedule mammogram for breast cancer screening. Recommended every 2 years for women 40+.',
        category: 'SCREENING',
        priority: 'HIGH',
        evidenceLevel: 'B — USPSTF',
      });

      this.addIfNew(recommendations, existingTitles, {
        title: 'Cervical Cancer Screening',
        description: 'Pap smear every 3-5 years depending on age and history per USPSTF guidelines.',
        category: 'SCREENING',
        priority: 'MEDIUM',
        evidenceLevel: 'A — USPSTF',
      });
    }

    if (age !== null && age >= 50) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Colorectal Cancer Screening',
        description: 'Colonoscopy every 10 years or FIT/FOBT annually. Start at age 50 (45 for high-risk groups).',
        category: 'SCREENING',
        priority: 'HIGH',
        evidenceLevel: 'A — USPSTF',
      });
    }

    if (hasFamilyCVD || hasHypertension || hasDiabetes) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Lipid Panel Screening',
        description: 'Fasting lipid profile for cardiovascular risk assessment. Repeat every 4-6 years or more frequently if abnormal.',
        category: 'SCREENING',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ACC/AHA Guidelines',
      });
    }

    if (hasFamilyCancer) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Genetic Counseling for Familial Cancer Risk',
        description: `Family history of cancer detected. Consider genetic counseling and risk assessment for hereditary cancer syndromes.`,
        category: 'SCREENING',
        priority: 'MEDIUM',
        evidenceLevel: 'B — NCCN Guidelines',
      });
    }

    // FOLLOW_UP category
    if (hasDiabetes) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Quarterly Endocrinology Follow-up',
        description: 'Patients with diabetes should have endocrinology follow-up every 3 months for HbA1c monitoring.',
        category: 'FOLLOW_UP',
        priority: 'HIGH',
      });

      this.addIfNew(recommendations, existingTitles, {
        title: 'Annual Diabetic Foot Exam',
        description: 'Comprehensive foot exam including monofilament testing for neuropathy screening.',
        category: 'FOLLOW_UP',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ADA Standards of Care',
      });
    }

    if (hasHypertension) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Blood Pressure Follow-up',
        description: 'Patients with hypertension should have BP checked at every visit and medication adjusted if > 140/90.',
        category: 'FOLLOW_UP',
        priority: 'HIGH',
      });
    }

    if (age !== null && age >= 65) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Annual Wellness Visit',
        description: 'Annual Medicare wellness visit including cognitive and functional screening.',
        category: 'FOLLOW_UP',
        priority: 'MEDIUM',
        evidenceLevel: 'A — CMS Guidelines',
      });
    }

    // SPECIALIST category
    if (hasDiabetes) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Annual Diabetic Eye Exam',
        description: 'Refer to ophthalmology for dilated retinal exam to screen for diabetic retinopathy.',
        category: 'SPECIALIST',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ADA Standards of Care',
      });
    }

    if (hasKidney) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Nephrology Referral',
        description: 'Refer to nephrology for CKD management and staging. Evaluate need for dialysis planning.',
        category: 'SPECIALIST',
        priority: 'HIGH',
        evidenceLevel: 'A — KDIGO Guidelines',
      });
    }

    if (hasCVD) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Cardiology Follow-up',
        description: 'Regular cardiology follow-up for cardiovascular disease management and risk factor optimization.',
        category: 'SPECIALIST',
        priority: 'HIGH',
        evidenceLevel: 'A — ACC/AHA Guidelines',
      });
    }

    if (hasMentalHealth) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Psychiatry Referral',
        description: 'Referral to psychiatry for comprehensive mental health evaluation and medication management.',
        category: 'SPECIALIST',
        priority: 'HIGH',
      });
    }

    // VACCINATION category
    if (!hasFluVaccine) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Influenza Vaccination',
        description: 'Annual influenza vaccine recommended for all adults, especially those with chronic conditions.',
        category: 'VACCINATION',
        priority: 'MEDIUM',
        evidenceLevel: 'A — CDC/ACIP',
      });
    }

    this.addIfNew(recommendations, existingTitles, {
      title: 'Tdap/Tetanus Booster',
      description: 'Tdap booster recommended every 10 years. Single dose of Tdap for all adults who have not previously received it.',
      category: 'VACCINATION',
      priority: 'LOW' as string,
      evidenceLevel: 'A — CDC/ACIP',
    });

    if (age !== null && age >= 50) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Shingles (Zoster) Vaccine',
        description: 'Recombinant zoster vaccine (Shingrix) recommended for immunocompetent adults aged 50+.',
        category: 'VACCINATION',
        priority: 'MEDIUM',
        evidenceLevel: 'A — CDC/ACIP',
      });
    }

    if (age !== null && age >= 65 || hasCOPD || (hasDiabetes && age !== null && age >= 19)) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Pneumococcal Vaccination',
        description: 'PCV20 or PCV15 followed by PPSV23 recommended for adults 65+ and younger adults with chronic conditions.',
        category: 'VACCINATION',
        priority: 'MEDIUM',
        evidenceLevel: 'A — CDC/ACIP',
      });
    }

    // LAB category
    if (hasDiabetes) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'HbA1c Test',
        description: 'HbA1c testing every 3 months to monitor glycemic control. Target < 7% for most adults.',
        category: 'LAB',
        priority: 'HIGH',
        evidenceLevel: 'A — ADA Standards of Care',
      });
    }

    if (hasCVD || hasHypertension || hasDiabetes || (age !== null && age >= 40)) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Comprehensive Metabolic Panel',
        description: 'Annual CMP including renal function, electrolytes, liver enzymes, and glucose.',
        category: 'LAB',
        priority: 'MEDIUM',
      });
    }

    if ((hasCVD || hasHypertension || hasDiabetes || (age !== null && age >= 45))) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Lipid Profile',
        description: 'Fasting or non-fasting lipid panel for cardiovascular risk assessment.',
        category: 'LAB',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ACC/AHA Guidelines',
      });
    }

    if (hasDiabetes || hasKidney) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Urine Microalbumin Test',
        description: 'Annual urine albumin-to-creatinine ratio for early detection of diabetic nephropathy.',
        category: 'LAB',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ADA/KDIGO Guidelines',
      });
    }

    // EDUCATION category
    if (hasDiabetes) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Diabetes Self-Management Education',
        description: 'Refer to DSME program for blood glucose monitoring, insulin administration, and complication prevention.',
        category: 'EDUCATION',
        priority: 'HIGH',
        evidenceLevel: 'A — ADA Standards of Care',
      });
    }

    if (smoking) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Health Education on Smoking Risks',
        description: 'Patient education on smoking risks including CVD, COPD, cancer, and premature aging.',
        category: 'EDUCATION',
        priority: 'HIGH',
      });
    }

    if (hasFamilyDiabetes || hasFamilyCVD) {
      this.addIfNew(recommendations, existingTitles, {
        title: 'Family Health History Education',
        description: 'Educate patient on implications of family history. Discuss modifiable risk factors and early screening.',
        category: 'EDUCATION',
        priority: 'MEDIUM',
      });
    }

    // Persist new recommendations
    const created = [];
    for (const rec of recommendations) {
      const existing = await this.prisma.preventiveRecommendation.findFirst({
        where: {
          userId,
          recommendation: rec.title,
          status: { in: ['PENDING', 'OVERDUE'] },
        },
      });
      if (!existing) {
        const saved = await this.prisma.preventiveRecommendation.create({
          data: {
            id: randomUUID(),
            userId,
            twinId,
            recommendation: `${rec.title}: ${rec.description}`,
            category: rec.category,
            priority: rec.priority,
            dueDate: rec.dueDate ?? null,
            status: 'PENDING',
            source: 'SYSTEM',
            updatedAt: new Date(),
          },
        });
        created.push(saved);
      }
    }

    return {
      generated: created.length,
      recommendations,
    };
  }

  private addIfNew(
    list: PreventiveRecommendation[],
    existingTitles: Set<string>,
    rec: PreventiveRecommendation,
  ): void {
    if (!existingTitles.has(rec.title.toLowerCase())) {
      list.push(rec);
    }
  }

  private calcAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }
}
