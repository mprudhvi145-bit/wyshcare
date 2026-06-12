/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/diabetes-risk.assessor.ts
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
 * diabetes-risk.assessor — AI module
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

import { Injectable } from '@nestjs/common';
import { RiskAssessor } from './risk-assessor.interface';
import { RiskAssessment } from '../../interfaces/ai-risk.interface';

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
export class DiabetesRiskAssessor implements RiskAssessor {
  async assess(data: AssessmentData): Promise<RiskAssessment> {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    // Age risk
    if (data.age !== null) {
      if (data.age >= 65) { score += 15; drivers.push('Age ≥ 65'); }
      else if (data.age >= 45) { score += 10; drivers.push('Age ≥ 45'); }
    }

    // Existing conditions
    const hasDiabetes = data.conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasObesity = data.conditions.some(c => /obes|overweight|bmi/i.test(c.displayName)) || 
                      (data.vitals?.bmi !== null && data.vitals.bmi > 30);

    if (hasDiabetes) { score += 30; drivers.push('Existing diabetes diagnosis'); }
    else if (data.familyHistory.some(f => /diabetes|dm/i.test(f.condition))) { 
      score += 15; drivers.push('Family history of diabetes'); 
    }
    if (hasObesity) { score += 10; drivers.push('Obesity/overweight'); }

    // Lifestyle factors
    const sedentary = data.lifestyle?.activityLevel === 'SEDENTARY';
    const highStress = data.lifestyle?.stressLevel === 'HIGH' || data.lifestyle?.stressLevel === 'SEVERE';
    const poorDiet = data.lifestyle?.dietType === 'NON_VEG' || data.lifestyle?.dietType === null;

    if (sedentary) { score += 8; drivers.push('Sedentary lifestyle'); }
    if (highStress) { score += 10; drivers.push('Chronic stress'); }
    if (poorDiet) { score += 5; drivers.push('Poor diet'); }

    // Vital signs
    const bmi = data.vitals?.bmi ?? null;
    const waistCircumference = data.vitals?.waistCircumference ?? null;

    if (bmi !== null && bmi >= 25 && bmi < 30) { 
      score += 5; drivers.push(`BMI ${bmi.toFixed(1)} (overweight)`); 
    }
    if (bmi !== null && bmi >= 30) { 
      score += 10; drivers.push(`BMI ${bmi.toFixed(1)} (obese)`); 
    }

    // Wearable data trends - glucose
    const recentWearableGlucose = data.wearables.filter(w => w.metricType === 'GLUCOSE');
    if (recentWearableGlucose.length > 0) {
      const avgGlucose = recentWearableGlucose.reduce((sum, w) => sum + w.value, 0) / recentWearableGlucose.length;
      if (avgGlucose >= 200) { 
        score += 20; drivers.push(`Avg glucose ${avgGlucose.toFixed(0)} mg/dL`); 
      }
      else if (avgGlucose >= 126) { 
        score += 15; drivers.push(`Avg glucose ${avgGlucose.toFixed(0)} mg/dL`); 
      }
      else if (avgGlucose >= 100) { 
        score += 5; drivers.push('Impaired fasting glucose'); 
      }
    }

    // Lab results
    const glucoseLab = data.labResults.find(lr => /glucose|sugar/i.test(lr.testName ?? ''));
    const hba1cLab = data.labResults.find(lr => /hba1c|hemoglobin.*a1c/i.test(lr.testName ?? ''));

    if (glucoseLab && glucoseLab.value !== null) {
      // Fasting glucose in mg/dL
      if (glucoseLab.value >= 126) { 
        score += 15; drivers.push(`Fasting glucose ${glucoseLab.value} mg/dL`); 
      }
      else if (glucoseLab.value >= 100) { 
        score += 5; drivers.push('Impaired fasting glucose'); 
      }
    }

    if (hba1cLab && hba1cLab.value !== null) {
      // HbA1c in %
      if (hba1cLab.value >= 6.5) { 
        score += 20; drivers.push(`HbA1c ${hba1cLab.value}%`); 
      }
      else if (hba1cLab.value >= 5.7) { 
        score += 10; drivers.push(`HbA1c ${hba1cLab.value}% (prediabetes)`); 
      }
    }

    // Medication adherence
    const medAdminCount = data.medicationAdmins.length;
    const medAdminTaken = data.medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;
    if (adherenceRate < 80) { score += 5; drivers.push('Low medication adherence'); }

    // Recommended actions
    if (hasDiabetes) {
      actions.push('Endocrinology follow-up every 3 months');
      actions.push('HbA1c test every 3 months');
    }
    if (!hasDiabetes && (score >= 30)) {
      actions.push('Fasting blood glucose screening');
    }
    actions.push('Dietary counseling and nutrition plan');
    actions.push('Structured exercise program — 150 min/week');
    if (bmi !== null && bmi >= 25) {
      actions.push('Weight loss target — 5-7% of body weight');
    }
    if (recentWearableGlucose.length === 0) {
      actions.push('Consider continuous glucose monitoring');
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