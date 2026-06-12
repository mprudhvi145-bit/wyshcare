/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-preventive/ai-preventive.service.ts
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
 * Business logic service for ai-preventive
 *
 * Responsibilities:
 * - Execute business logic for ai operations
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
 - event-emitter
 - common
 *
 * Dependencies:
 - event-emitter
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
AI
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
import { PrismaService } from '../../providers/prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { AiService } from '../ai/ai.service';

interface PreventiveRecommendationInput {
  title: string;
  description: string;
  category: string;
  priority: string;
  dueDate?: Date;
  evidenceLevel?: string;
  riskFactor?: string;
  source?: string;
}

interface PreventiveCareResult {
  generated: number;
  recommendations: any[];
}

@Injectable()
export class AiPreventiveService {
  private readonly logger = new Logger(AiPreventiveService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generatePreventiveRecommendations(userId: string): Promise<PreventiveCareResult> {
    const [
      user,
      conditions,
      medications,
      vitalRecords,
      labResults,
      familyHistory,
      wearableMetrics,
      healthGoals,
      existingActive,
    ] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.condition.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
      this.prisma.medication.findMany({
        where: {
          healthRecord: {
            userId: userId
          }
        }
      }),
      this.prisma.vitalsRecord.findMany({ 
        where: { patientId: userId },
        orderBy: { recordedAt: 'desc' },
        take: 10
      }),
      this.prisma.labResult.findMany({
        where: {
          DiagnosticOrder: { userId: userId }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      this.prisma.familyHistory.findMany({ where: { userId } }),
      this.prisma.wearableMetric.findMany({
        where: { userId },
        orderBy: { recordedAt: 'desc' },
        take: 20
      }),
      this.prisma.healthGoal.findMany({ where: { userId } }),
      this.prisma.preventiveRecommendation.findMany({
        where: { userId, status: { in: ['PENDING', 'OVERDUE'] } },
      }),
    ]);

    const age = user?.dateOfBirth ? this.calculateAge(user.dateOfBirth) : null;
    const gender = user?.gender ?? null;
    const latestVital = vitalRecords?.[0] ?? null;
    const bmi = latestVital?.bmi ?? null;
    const systolicBP = latestVital?.bpSystolic ?? null;
    const diastolicBP = latestVital?.bpDiastolic ?? null;
    const heartRate = latestVital?.heartRate ?? null;
    const temperature = latestVital?.temperature ?? null;
    const spo2 = latestVital?.spo2 ?? null;

    const existingTitles = new Set(existingActive.map(r => r.recommendation.toLowerCase()));

    const hasDiabetes = conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasHypertension = conditions.some(c => /hypertension|htn|bp|blood.pressure/i.test(c.displayName));
    const hasCVD = conditions.some(c => /heart|cardiac|chd|cad|afib|stroke|cva|mi/i.test(c.displayName));
    const hasCOPD = conditions.some(c => /copd|asthma|respiratory/i.test(c.displayName));
    const hasObesity = conditions.some(c => /obes|overweight|bmi/i.test(c.displayName));
    const hasMentalHealth = conditions.some(c => /depression|anxiety|bipolar|schizophrenia|ptsd|mental/i.test(c.displayName));
    const hasKidney = conditions.some(c => /kidney|renal|ckd|nephropathy/i.test(c.displayName));
    const hasCancer = conditions.some(c => /cancer|malignancy|tumor|leukemia|lymphoma/i.test(c.displayName));

    const hasFamilyDiabetes = familyHistory.some(f => /diabetes|dm/i.test(f.condition));
    const hasFamilyCVD = familyHistory.some(f => /heart|cardiac|stroke|mi|cvd/i.test(f.condition));
    const hasFamilyCancer = familyHistory.some(f => /cancer|malignancy|tumor/i.test(f.condition));

    const smoking = wearableMetrics?.some(w => w.metricType === 'SMOKING' && w.value > 0) ?? false;
    const sedentary = wearableMetrics?.some(w => w.metricType === 'STEPS' && w.value < 5000) ?? false;
    const highStress = wearableMetrics?.some(w => w.metricType === 'STRESS_LEVEL' && w.value > 7) ?? false;
    const poorSleep = wearableMetrics?.some(w => w.metricType === 'SLEEP_HOURS' && w.value < 6) ?? false;
    const highAlcohol = wearableMetrics?.some(w => w.metricType === 'ALCOHOL_CONSUMPTION' && w.value > 3) ?? false;

    const hasFluVaccine = labResults?.some(l => 
      /flu|influenza/i.test(l.testName) && 
      l.createdAt >= new Date(new Date().getFullYear() - 1, 8, 1)
    ) ?? false;

    const recommendations: any[] = [];

    // Helper function to add recommendation if not already exists
    const addIfNew = (rec: PreventiveRecommendationInput) => {
      if (!existingTitles.has(rec.title.toLowerCase())) {
        recommendations.push(rec);
        existingTitles.add(rec.title.toLowerCase());
      }
    };

    // MEDICATION category
    if (hasDiabetes) {
      addIfNew({
        title: 'Start/Review Metformin Therapy',
        description: 'Metformin is first-line therapy for type 2 diabetes. Review current glycemic control and adjust dosage as needed.',
        category: 'MEDICATION',
        priority: 'HIGH',
        evidenceLevel: 'A — ADA Standards of Care',
        riskFactor: 'Type 2 Diabetes',
        source: 'USPSTF'
      });
    }

    if (hasHypertension) {
      addIfNew({
        title: 'Antihypertensive Medication Review',
        description: 'Review current antihypertensive regimen. ACE inhibitors or ARBs are preferred first-line in most patients.',
        category: 'MEDICATION',
        priority: 'HIGH',
        evidenceLevel: 'A — ACC/AHA Guidelines',
        riskFactor: 'Hypertension',
        source: 'ACC/AHA'
      });
    }

    if (hasCVD) {
      addIfNew({
        title: 'Statin Therapy Evaluation',
        description: 'Evaluate need for statin therapy for secondary prevention of cardiovascular events.',
        category: 'MEDICATION',
        priority: 'HIGH',
        evidenceLevel: 'A — ACC/AHA Cholesterol Guidelines',
        riskFactor: 'Cardiovascular Disease',
        source: 'ACC/AHA'
      });

      addIfNew({
        title: 'Antiplatelet Therapy Assessment',
        description: 'Assess need for aspirin or P2Y12 inhibitor for secondary cardiovascular prevention.',
        category: 'MEDICATION',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ACC/AHA Guidelines',
        riskFactor: 'Cardiovascular Disease',
        source: 'ACC/AHA'
      });
    }

    if (age !== null && age >= 50 && hasHypertension) {
      addIfNew({
        title: 'Aspirin for Primary Prevention',
        description: 'Consider low-dose aspirin for primary prevention of CVD in adults aged 50+ with hypertension.',
        category: 'MEDICATION',
        priority: 'MEDIUM',
        evidenceLevel: 'B — USPSTF',
        riskFactor: 'Hypertension + Age',
        source: 'USPSTF'
      });
    }

    // LIFESTYLE category
    if (smoking) {
      addIfNew({
        title: 'Smoking Cessation Program',
        description: 'Enroll in a structured smoking cessation program. Consider pharmacotherapy (nicotine replacement, bupropion, varenicline).',
        category: 'LIFESTYLE',
        priority: 'CRITICAL',
        evidenceLevel: 'A — USPSTF',
        riskFactor: 'Current Smoker',
        source: 'USPSTF'
      });
    }

    if (sedentary) {
      addIfNew({
        title: 'Physical Activity Prescription',
        description: 'Prescribe graded exercise program: start with 10-min walks, progress to 150 min/week moderate intensity.',
        category: 'LIFESTYLE',
        priority: 'HIGH',
        evidenceLevel: 'A — WHO Physical Activity Guidelines',
        riskFactor: 'Sedentary Lifestyle',
        source: 'WHO'
      });
    }

    if ((bmi !== null && bmi >= 30) || hasObesity) {
      addIfNew({
        title: 'Weight Management Program',
        description: 'Refer to structured weight management program. Target 5-10% weight loss over 6 months.',
        category: 'LIFESTYLE',
        priority: 'HIGH',
        evidenceLevel: 'A — Obesity Guidelines',
        riskFactor: 'Obesity (BMI ≥ 30)',
        source: 'CDC'
      });
    }

    if (highAlcohol) {
      addIfNew({
        title: 'Alcohol Reduction Counseling',
        description: 'Brief intervention and counseling for alcohol reduction. Refer to substance abuse services if needed.',
        category: 'LIFESTYLE',
        priority: 'HIGH',
        evidenceLevel: 'B — USPSTF',
        riskFactor: 'Heavy Alcohol Consumption',
        source: 'USPSTF'
      });
    }

    if (highStress) {
      addIfNew({
        title: 'Stress Management Program',
        description: 'Recommend mindfulness-based stress reduction, meditation, or counseling for stress management.',
        category: 'LIFESTYLE',
        priority: 'MEDIUM',
        evidenceLevel: 'B — APA Guidelines',
        riskFactor: 'High Stress Levels',
        source: 'APA'
      });
    }

    if (poorSleep) {
      addIfNew({
        title: 'Sleep Hygiene Optimization',
        description: 'Evaluate sleep patterns. Recommend sleep hygiene: consistent schedule, no screens before bed, limit caffeine.',
        category: 'LIFESTYLE',
        priority: 'MEDIUM',
        evidenceLevel: 'C — AASM Guidelines',
        riskFactor: 'Insufficient Sleep (< 6 hours)',
        source: 'AASM'
      });
    }

    // SCREENING category
    if (age !== null && age >= 40 && gender?.toLowerCase() === 'female') {
      addIfNew({
        title: 'Mammogram Screening',
        description: 'Schedule mammogram for breast cancer screening. Recommended every 2 years for women 40+.',
        category: 'SCREENING',
        priority: 'HIGH',
        evidenceLevel: 'B — USPSTF',
        riskFactor: 'Female Age ≥ 40',
        source: 'USPSTF'
      });

      addIfNew({
        title: 'Cervical Cancer Screening',
        description: 'Pap smear every 3-5 years depending on age and history per USPSTF guidelines.',
        category: 'SCREENING',
        priority: 'MEDIUM',
        evidenceLevel: 'A — USPSTF',
        riskFactor: 'Female Age ≥ 21',
        source: 'USPSTF'
      });
    }

    if (age !== null && age >= 45) {
      addIfNew({
        title: 'Colorectal Cancer Screening',
        description: 'Colonoscopy every 10 years or FIT/FOBT annually. Start at age 45 for average risk.',
        category: 'SCREENING',
        priority: 'HIGH',
        evidenceLevel: 'A — USPSTF',
        riskFactor: 'Age ≥ 45',
        source: 'USPSTF'
      });
    }

    if (hasFamilyCVD || hasHypertension || hasDiabetes || (age !== null && age >= 40)) {
      addIfNew({
        title: 'Lipid Panel Screening',
        description: 'Fasting lipid profile for cardiovascular risk assessment. Repeat every 4-6 years or more frequently if abnormal.',
        category: 'SCREENING',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ACC/AHA Guidelines',
        riskFactor: 'Cardiovascular Risk Factors',
        source: 'ACC/AHA'
      });
    }

    if (hasFamilyCancer) {
      addIfNew({
        title: 'Genetic Counseling for Familial Cancer Risk',
        description: `Family history of cancer detected. Consider genetic counseling and risk assessment for hereditary cancer syndromes.`,
        category: 'SCREENING',
        priority: 'MEDIUM',
        evidenceLevel: 'B — NCCN Guidelines',
        riskFactor: 'Family History of Cancer',
        source: 'NCCN'
      });
    }

    if (hasDiabetes || hasFamilyDiabetes || (age !== null && age >= 45)) {
      addIfNew({
        title: 'HbA1c Test',
        description: 'HbA1c testing to screen for diabetes and prediabetes. Repeat every 3 years if normal, annually if prediabetic.',
        category: 'SCREENING',
        priority: 'HIGH',
        evidenceLevel: 'A — USPSTF',
        riskFactor: 'Diabetes Risk Factors',
        source: 'USPSTF'
      });
    }

    // FOLLOW_UP category
    if (hasDiabetes) {
      addIfNew({
        title: 'Quarterly Endocrinology Follow-up',
        description: 'Patients with diabetes should have endocrinology follow-up every 3 months for HbA1c monitoring.',
        category: 'FOLLOW_UP',
        priority: 'HIGH',
        riskFactor: 'Type 1 or Type 2 Diabetes'
      });

      addIfNew({
        title: 'Annual Diabetic Foot Exam',
        description: 'Comprehensive foot exam including monofilament testing for neuropathy screening.',
        category: 'FOLLOW_UP',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ADA Standards of Care',
        riskFactor: 'Diabetes',
        source: 'ADA'
      });
    }

    if (hasHypertension) {
      addIfNew({
        title: 'Blood Pressure Follow-up',
        description: 'Patients with hypertension should have BP checked at every visit and medication adjusted if > 130/80.',
        category: 'FOLLOW_UP',
        priority: 'HIGH',
        riskFactor: 'Hypertension'
      });
    }

    if (age !== null && age >= 65) {
      addIfNew({
        title: 'Annual Wellness Visit',
        description: 'Annual Medicare wellness visit including cognitive and functional screening.',
        category: 'FOLLOW_UP',
        priority: 'MEDIUM',
        evidenceLevel: 'A — CMS Guidelines',
        riskFactor: 'Age ≥ 65',
        source: 'CMS'
      });
    }

    // SPECIALIST category
    if (hasDiabetes) {
      addIfNew({
        title: 'Annual Diabetic Eye Exam',
        description: 'Refer to ophthalmology for dilated retinal exam to screen for diabetic retinopathy.',
        category: 'SPECIALIST',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ADA Standards of Care',
        riskFactor: 'Diabetes',
        source: 'ADA'
      });
    }

    if (hasKidney) {
      addIfNew({
        title: 'Nephrology Referral',
        description: 'Refer to nephrology for CKD management and staging. Evaluate need for dialysis planning.',
        category: 'SPECIALIST',
        priority: 'HIGH',
        evidenceLevel: 'A — KDIGO Guidelines',
        riskFactor: 'Chronic Kidney Disease',
        source: 'KDIGO'
      });
    }

    if (hasCVD) {
      addIfNew({
        title: 'Cardiology Follow-up',
        description: 'Regular cardiology follow-up for cardiovascular disease management and risk factor optimization.',
        category: 'SPECIALIST',
        priority: 'HIGH',
        evidenceLevel: 'A — ACC/AHA Guidelines',
        riskFactor: 'Cardiovascular Disease',
        source: 'ACC/AHA'
      });
    }

    if (hasMentalHealth) {
      addIfNew({
        title: 'Psychiatry Referral',
        description: 'Referral to psychiatry for comprehensive mental health evaluation and medication management.',
        category: 'SPECIALIST',
        priority: 'HIGH',
        riskFactor: 'Mental Health Condition'
      });
    }

    // VACCINATION category
    if (!hasFluVaccine) {
      addIfNew({
        title: 'Influenza Vaccination',
        description: 'Annual influenza vaccine recommended for all adults, especially those with chronic conditions.',
        category: 'VACCINATION',
        priority: 'MEDIUM',
        evidenceLevel: 'A — CDC/ACIP',
        riskFactor: 'Missing Annual Flu Vaccine',
        source: 'CDC/ACIP'
      });
    }

    addIfNew({
      title: 'Tdap/Tetanus Booster',
      description: 'Tdap booster recommended every 10 years. Single dose of Tdap for all adults who have not previously received it.',
      category: 'VACCINATION',
      priority: 'LOW',
      evidenceLevel: 'A — CDC/ACIP',
      riskFactor: 'Missing Tetanus Booster',
      source: 'CDC/ACIP'
    });

    if (age !== null && age >= 50) {
      addIfNew({
        title: 'Shingles (Zoster) Vaccine',
        description: 'Recombinant zoster vaccine (Shingrix) recommended for immunocompetent adults aged 50+.',
        category: 'VACCINATION',
        priority: 'MEDIUM',
        evidenceLevel: 'A — CDC/ACIP',
        riskFactor: 'Age ≥ 50',
        source: 'CDC/ACIP'
      });
    }

    if (age !== null && age >= 65 || hasCOPD || (hasDiabetes && age !== null && age >= 19)) {
      addIfNew({
        title: 'Pneumococcal Vaccination',
        description: 'PCV20 or PCV15 followed by PPSV23 recommended for adults 65+ and younger adults with chronic conditions.',
        category: 'VACCINATION',
        priority: 'MEDIUM',
        evidenceLevel: 'A — CDC/ACIP',
        riskFactor: 'Age ≥ 65 or Chronic Conditions',
        source: 'CDC/ACIP'
      });
    }

    // LAB category
    if (hasDiabetes) {
      addIfNew({
        title: 'HbA1c Test',
        description: 'HbA1c testing every 3 months to monitor glycemic control. Target < 7% for most adults.',
        category: 'LAB',
        priority: 'HIGH',
        evidenceLevel: 'A — ADA Standards of Care',
        riskFactor: 'Diabetes',
        source: 'ADA'
      });
    }

    if (hasCVD || hasHypertension || hasDiabetes || (age !== null && age >= 40)) {
      addIfNew({
        title: 'Comprehensive Metabolic Panel',
        description: 'Annual CMP including renal function, electrolytes, liver enzymes, and glucose.',
        category: 'LAB',
        priority: 'MEDIUM',
        riskFactor: 'Cardiovascular Risk Factors'
      });
    }

    if ((hasCVD || hasHypertension || hasDiabetes) || (age !== null && age >= 40)) {
      addIfNew({
        title: 'Lipid Profile',
        description: 'Fasting or non-fasting lipid panel for cardiovascular risk assessment.',
        category: 'LAB',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ACC/AHA Guidelines',
        riskFactor: 'Cardiovascular Risk Factors',
        source: 'ACC/AHA'
      });
    }

    if (hasDiabetes || hasKidney) {
      addIfNew({
        title: 'Urine Microalbumin Test',
        description: 'Annual urine albumin-to-creatinine ratio for early detection of diabetic nephropathy.',
        category: 'LAB',
        priority: 'MEDIUM',
        evidenceLevel: 'A — ADA/KDIGO Guidelines',
        riskFactor: 'Diabetes or Kidney Disease',
        source: 'ADA/KDIGO'
      });
    }

    // EDUCATION category
    if (hasDiabetes) {
      addIfNew({
        title: 'Diabetes Self-Management Education',
        description: 'Refer to DSME program for blood glucose monitoring, insulin administration, and complication prevention.',
        category: 'EDUCATION',
        priority: 'HIGH',
        evidenceLevel: 'A — ADA Standards of Care',
        riskFactor: 'Diabetes',
        source: 'ADA'
      });
    }

    if (smoking) {
      addIfNew({
        title: 'Health Education on Smoking Risks',
        description: 'Patient education on smoking risks including CVD, COPD, cancer, and premature aging.',
        category: 'EDUCATION',
        priority: 'HIGH',
        riskFactor: 'Current Smoker'
      });
    }

    if (hasFamilyDiabetes || hasFamilyCVD) {
      addIfNew({
        title: 'Family Health History Education',
        description: 'Educate patient on implications of family history. Discuss modifiable risk factors and early screening.',
        category: 'EDUCATION',
        priority: 'MEDIUM',
        riskFactor: 'Family History of Chronic Disease'
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
            id: `prev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            userId,
            recommendation: `${rec.title}: ${rec.description}`,
            category: rec.category,
            priority: rec.priority,
            dueDate: rec.dueDate ?? null,
            status: 'PENDING',
            riskFactor: rec.riskFactor,
            source: rec.source,
            updatedAt: new Date(),
          },
        });
        created.push(saved);
      }
    }

    // Emit event for audit logging and timeline updates
    if (created.length > 0) {
      this.aiService.emitEvent('preventive.recommendations.generated', {
        userId,
        recommendations: created,
        timestamp: new Date(),
      });
    }

    return {
      generated: created.length,
      recommendations,
    };
  }

  async listRecommendations(userId: string, status?: string, category?: string) {
    const where: any = { userId };
    if (status) where.status = status;
    if (category) where.category = category;
    
    return this.prisma.preventiveRecommendation.findMany({ 
      where, 
      orderBy: { dueDate: 'asc' } 
    });
  }

  async completeRecommendation(id: string) {
    return this.prisma.preventiveRecommendation.update({ 
      where: { id }, 
      data: { 
        status: 'COMPLETED', 
        completedAt: new Date() 
      } 
    });
  }

  async dismissRecommendation(id: string) {
    return this.prisma.preventiveRecommendation.update({ 
      where: { id }, 
      data: { 
        status: 'DISMISSED' 
      } 
    });
  }

  async getStats(userId: string) {
    const [total, statusDist, categoryDist] = await Promise.all([
      this.prisma.preventiveRecommendation.count({ where: { userId } }),
      this.prisma.preventiveRecommendation.groupBy({ 
        by: ['status'], 
        _count: true,
        where: { userId }
      }),
      this.prisma.preventiveRecommendation.groupBy({ 
        by: ['category'], 
        _count: true,
        where: { userId }
      }),
    ]);
    
    return {
      total,
      byStatus: Object.fromEntries(statusDist.map((r) => [r.status, r._count])),
      byCategory: Object.fromEntries(categoryDist.map((r) => [r.category, r._count])),
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}