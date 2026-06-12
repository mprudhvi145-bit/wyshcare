/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/cardiovascular-risk.assessor.ts
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
 * cardiovascular-risk.assessor — AI module
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
export class CardiovascularRiskAssessor implements RiskAssessor {
  async assess(data: AssessmentData): Promise<RiskAssessment> {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    // Age risk
    if (data.age !== null) {
      if (data.age >= 65) { score += 20; drivers.push('Age ≥ 65'); }
      else if (data.age >= 55) { score += 15; drivers.push('Age ≥ 55'); }
      else if (data.age >= 45) { score += 10; drivers.push('Age ≥ 45'); }
    }

    // Existing conditions
    const hasCVD = data.conditions.some(c => /heart|cardiac|chd|cad|afib|arrhythmia|failure|cva|stroke/i.test(c.displayName));
    const hasDiabetes = data.conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasHTN = data.conditions.some(c => /hypertension|htn|bp|blood.pressure/i.test(c.displayName));

    if (hasCVD) { score += 25; drivers.push('Existing cardiovascular disease'); }
    if (hasDiabetes) { score += 15; drivers.push('Diabetes present'); }
    if (hasHTN) { score += 10; drivers.push('Hypertension present'); }

    // Family history
    const familyCVD = data.familyHistory.some(f => /heart|cardiac|stroke|mi|heart.attack|cvd/i.test(f.condition));
    if (familyCVD) { score += 8; drivers.push('Family history of CVD'); }

    // Lifestyle factors
    const smoking = data.lifestyle?.smokingStatus === 'CURRENT';
    const sedentary = data.lifestyle?.activityLevel === 'SEDENTARY';
    const highStress = data.lifestyle?.stressLevel === 'HIGH' || data.lifestyle?.stressLevel === 'SEVERE';

    if (smoking) { score += 12; drivers.push('Current smoker'); }
    if (sedentary) { score += 5; drivers.push('Sedentary lifestyle'); }
    if (highStress) { score += 10; drivers.push('High stress level'); }

    // Vital signs
    const latestBP = data.vitals ? { systolic: data.vitals.bpSystolic, diastolic: data.vitals.bpDiastolic } : null;
    const heartRate = data.vitals?.heartRate ?? null;
    const bmi = data.vitals?.bmi ?? null;

    if (latestBP?.systolic !== null && latestBP?.systolic !== undefined) {
      if (latestBP.systolic >= 160) { score += 10; drivers.push('BP ≥ 160 systolic'); }
      else if (latestBP.systolic >= 140) { score += 5; drivers.push('BP ≥ 140 systolic'); }
    }

    if (bmi !== null && bmi >= 30) { score += 5; drivers.push(`BMI ${bmi.toFixed(1)} (obese)`); }

    // Wearable data trends
    const recentWearableBP = data.wearables.filter(w => w.metricType === 'BLOOD_PRESSURE');
    if (recentWearableBP.length > 0) {
      const avgSys = recentWearableBP.reduce((sum, w) => sum + w.value, 0) / recentWearableBP.length;
      if (avgSys >= 140) { score += 5; drivers.push('Elevated BP trend from wearables'); }
    }

    // Symptoms
    const activeSymptoms = data.symptoms.map(s => s.symptom);
    const chestPain = activeSymptoms.some(s => /chest.pain|angina|palpitations/i.test(s));
    const dyspnea = activeSymptoms.some(s => /sob|dyspnea|breathless|shortness.of.breath/i.test(s));

    if (chestPain) { score += 10; drivers.push('Active chest pain/palpitations'); }
    if (dyspnea) { score += 5; drivers.push('Shortness of breath'); }

    // Lab results
    const lipidPanel = data.labResults.find(lr => /cholesterol|lipid|ldl/i.test(lr.testName ?? ''));
    if (lipidPanel && lipidPanel.value !== null) {
      // Assuming value is LDL in mg/dL
      if (lipidPanel.value >= 190) { score += 10; drivers.push('Very high LDL cholesterol'); }
      else if (lipidPanel.value >= 160) { score += 7; drivers.push('High LDL cholesterol'); }
      else if (lipidPanel.value >= 130) { score += 4; drivers.push('Borderline high LDL cholesterol'); }
    }

    // Medication adherence
    const medAdminCount = data.medicationAdmins.length;
    const medAdminTaken = data.medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;
    if (adherenceRate < 80) { score += 5; drivers.push('Low medication adherence'); }

    // Recommended actions
    if (hasCVD || (score >= 50)) actions.push('Immediate cardiology referral');
    if (!hasCVD) actions.push('Annual lipid profile and cardiac risk assessment');
    if (smoking) actions.push('Smoking cessation program');
    if (sedentary) actions.push('Cardiac rehabilitation or structured exercise program');
    if (bmi !== null && bmi >= 30) actions.push('Weight management program');
    if (hasDiabetes) actions.push('Optimize glycemic control to reduce CV risk');
    actions.push('Monitor BP weekly');
    if (recentWearableBP.length === 0) actions.push('Consider wearable BP monitoring');

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