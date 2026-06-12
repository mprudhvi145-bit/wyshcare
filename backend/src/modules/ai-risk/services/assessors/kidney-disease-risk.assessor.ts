/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/kidney-disease-risk.assessor.ts
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
 * kidney-disease-risk.assessor — AI module
 *
 * Responsibilities:
 * - Support ai functionality
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

import { RiskAssessment } from '../../interfaces/ai-risk.interface';
import { Injectable } from '@nestjs/common';
import { RiskAssessor } from './risk-assessor.interface';

interface AssessmentData {
  userId: string;
  age: number | null;
  conditions: any[];
  vitals: any;
  wearables: any[];
  lifestyle: any;
  familyHistory: any[];
  medicationAdmins: any[];
  clinicalOrders: any[];
  symptoms: any[];
  labResults: any[];
  prescriptions: any[];
}

@Injectable()
export class KidneyDiseaseRiskAssessor implements RiskAssessor {
  async assess(data: AssessmentData): Promise<RiskAssessment> {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    // Age risk
    if (data.age !== null) {
      if (data.age >= 65) { score += 15; drivers.push('Age ≥ 65'); }
      else if (data.age >= 50) { score += 10; drivers.push('Age ≥ 50'); }
    }

    // Existing conditions
    const hasKidney = data.conditions.some(c => /kidney|renal|ckd|nephropathy/i.test(c.displayName));
    const hasDiabetes = data.conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasHTN = data.conditions.some(c => /hypertension|htn|bp|blood.pressure/i.test(c.displayName));
    const hasCVD = data.conditions.some(c => /heart|cardiac|chd|cad|afib|arrhythmia|failure|cva|stroke/i.test(c.displayName));
    const hasObesity = data.conditions.some(c => /obes|overweight|bmi/i.test(c.displayName)) || 
                     (data.vitals?.bmi !== null && data.vitals.bmi > 30);

    if (hasKidney) { score += 30; drivers.push('Existing kidney disease'); }
    if (hasDiabetes) { score += 20; drivers.push('Diabetes (leading cause of kidney disease)'); }
    if (hasHTN) { score += 15; drivers.push('Hypertension (leading cause of kidney disease)'); }
    if (hasCVD) { score += 10; drivers.push('Cardiovascular disease'); }
    if (hasObesity) { score += 8; drivers.push('Obesity'); }

    // Family history
    const familyKidney = data.familyHistory.some(f => /kidney|renal/i.test(f.condition));
    if (familyKidney) { score += 10; drivers.push('Family history of kidney disease'); }

    // Lifestyle factors
    const smoking = data.lifestyle?.smokingStatus === 'CURRENT';
    const sedentary = data.lifestyle?.activityLevel === 'SEDENTARY';
    const highSodium = data.lifestyle?.dietType === 'HIGH_SODIUM' || data.lifestyle?.dietType === 'PROCESSED';

    if (smoking) { score += 8; drivers.push('Current smoker'); }
    if (sedentary) { score += 5; drivers.push('Sedentary lifestyle'); }
    if (highSodium) { score += 5; drivers.push('High sodium diet'); }

    // Vital signs
    const latestBP = data.vitals ? { systolic: data.vitals.bpSystolic, diastolic: data.vitals.bpDiastolic } : null;
    const bmi = data.vitals?.bmi ?? null;

    if (latestBP?.systolic !== null && latestBP?.systolic !== undefined && latestBP.systolic >= 140) {
      score += 5; drivers.push('Hypertension (BP ≥ 140)');
    }
    if (latestBP?.diastolic !== null && latestBP?.diastolic !== undefined && latestBP.diastolic >= 90) {
      score += 5; drivers.push('Hypertension (Diastolic BP ≥ 90)');
    }

    // Wearable data trends
    const recentWearableBP = data.wearables.filter(w => w.metricType === 'BLOOD_PRESSURE');
    if (recentWearableBP.length > 0) {
      const avgSys = recentWearableBP.reduce((sum, w) => sum + w.value, 0) / recentWearableBP.length;
      if (avgSys >= 130) { score += 5; drivers.push('Elevated BP trend from wearables'); }
    }

    // Lab results - kidney function
    const creatinineLab = data.labResults.find(lr => /creatinine/i.test(lr.testName ?? ''));
    const bunLab = data.labResults.find(lr => /bun|urea/i.test(lr.testName ?? ''));
    const egfrLab = data.labResults.find(lr => /egfr|glomerular/i.test(lr.testName ?? ''));
    const uacrLab = data.labResults.find(lr => /albumin.*creatinine|uacr/i.test(lr.testName ?? ''));

    if (creatinineLab && creatinineLab.value !== null) {
      // Creatinine in mg/dL - elevated suggests kidney impairment
      if (creatinineLab.value >= 2.0) { 
        score += 15; drivers.push(`Elevated creatinine ${creatinineLab.value} mg/dL`); 
      }
      else if (creatinineLab.value >= 1.5) { 
        score += 10; drivers.push(`Mildly elevated creatinine ${creatinineLab.value} mg/dL`); 
      }
    }

    if (egfrLab && egfrLab.value !== null) {
      // eGFR in mL/min/1.73m² - lower suggests kidney impairment
      if (egfrLab.value < 30) { 
        score += 20; drivers.push(`Severely reduced eGFR ${egfrLab.value} mL/min/1.73m²`); 
      }
      else if (egfrLab.value < 45) { 
        score += 15; drivers.push(`Reduced eGFR ${egfrLab.value} mL/min/1.73m²`); 
      }
      else if (egfrLab.value < 60) { 
        score += 10; drivers.push(`Mildly reduced eGFR ${egfrLab.value} mL/min/1.73m²`); 
      }
    }

    if (uacrLab && uacrLab.value !== null) {
      // UACR in mg/g - elevated suggests kidney damage
      if (uacrLab.value >= 300) { 
        score += 15; drivers.push(`Severely elevated UACR ${uacrLab.value} mg/g`); 
      }
      else if (uacrLab.value >= 30) { 
        score += 10; drivers.push(`Elevated UACR ${uacrLab.value} mg/g`); 
      }
    }

    // Medication adherence
    const medAdminCount = data.medicationAdmins.length;
    const medAdminTaken = data.medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;
    if (adherenceRate < 80) { score += 5; drivers.push('Low medication adherence'); }

    // Recommended actions
    if (hasKidney) {
      actions.push('Nephrology follow-up');
      actions.push('Monitor kidney function regularly');
    }
    if (hasDiabetes || hasHTN) {
      actions.push('Control blood sugar and blood pressure');
    }
    actions.push('Annual kidney function tests (creatinine, eGFR, UACR)');
    if (smoking) {
      actions.push('Smoking cessation');
    }
    actions.push('Limit sodium intake (< 2g/day)');
    actions.push('Stay hydrated');
    if (hasObesity) {
      actions.push('Weight management');
    }

    // Normalize score
    score = Math.min(Math.max(score, 0), 100);

    // Convert to 0-1 scale for riskScore
    const riskScore = score / 100;

    return {
      riskScore,
      riskLevel: this.scoreToLevel(score),
      drivers: [...new Set(drivers)],
      recommendedActions: [...new Set(actions)],
      modelVersion: 'v1.0'
    };
  }

  private scoreToLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MODERATE';
    return 'LOW';
  }
}