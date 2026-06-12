/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/hypertension-risk.assessor.ts
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
 * hypertension-risk.assessor — AI module
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
export class HypertensionRiskAssessor implements RiskAssessor {
  async assess(data: AssessmentData): Promise<RiskAssessment> {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    // Age risk
    if (data.age !== null) {
      if (data.age >= 65) { score += 15; drivers.push('Age ≥ 65'); }
      else if (data.age >= 55) { score += 10; drivers.push('Age ≥ 55'); }
    }

    // Existing conditions
    const hasHTN = data.conditions.some(c => /hypertension|htn|bp|blood.pressure/i.test(c.displayName));
    const hasDiabetes = data.conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasCVD = data.conditions.some(c => /heart|cardiac|chd|cad|afib|arrhythmia|failure|cva|stroke/i.test(c.displayName));
    const hasKidney = data.conditions.some(c => /kidney|renal|ckd|nephropathy/i.test(c.displayName));

    if (hasHTN) { score += 25; drivers.push('Existing hypertension'); }
    if (hasDiabetes) { score += 10; drivers.push('Diabetes present (compounding risk)'); }
    if (hasCVD) { score += 10; drivers.push('Cardiovascular disease present'); }
    if (hasKidney) { score += 10; drivers.push('Kidney disease present'); }

    // Family history
    const familyHTN = data.familyHistory.some(f => /hypertension|bp|blood.pressure/i.test(f.condition));
    if (familyHTN) { score += 5; drivers.push('Family history of hypertension'); }

    // Lifestyle factors
    const smoking = data.lifestyle?.smokingStatus === 'CURRENT';
    const highStress = data.lifestyle?.stressLevel === 'HIGH' || data.lifestyle?.stressLevel === 'SEVERE';
    const sedentary = data.lifestyle?.activityLevel === 'SEDENTARY';
    const heavyAlcohol = data.lifestyle?.alcoholConsumption === 'HEAVY';

    if (smoking) { score += 8; drivers.push('Current smoker'); }
    if (highStress) { score += 5; drivers.push('High stress level'); }
    if (sedentary) { score += 5; drivers.push('Sedentary lifestyle'); }
    if (heavyAlcohol) { score += 5; drivers.push('Heavy alcohol consumption'); }

    // Vital signs
    const latestBP = data.vitals ? { systolic: data.vitals.bpSystolic, diastolic: data.vitals.bpDiastolic } : null;
    const bmi = data.vitals?.bmi ?? null;

    if (latestBP?.systolic !== null && latestBP?.systolic !== undefined) {
      if (latestBP.systolic >= 180) { score += 20; drivers.push(`Critical BP: ${latestBP.systolic}/${latestBP.diastolic ?? '?'}`); }
      else if (latestBP.systolic >= 160) { score += 15; drivers.push(`BP ≥ 160 systolic`); }
      else if (latestBP.systolic >= 140) { score += 10; drivers.push(`BP ≥ 140 systolic`); }
      else if (latestBP.systolic >= 130) { score += 5; drivers.push('BP 130-139 systolic (elevated)'); }
    }
    
    if (latestBP?.diastolic !== null && latestBP?.diastolic !== undefined && latestBP.diastolic >= 90) {
      score += 5; drivers.push(`Diastolic BP ≥ 90`);
    }

    // Wearable BP trends
    const recentWearableBP = data.wearables.filter(w => w.metricType === 'BLOOD_PRESSURE');
    if (recentWearableBP.length > 0) {
      const avgSys = recentWearableBP.reduce((sum, w) => sum + w.value, 0) / recentWearableBP.length;
      if (avgSys >= 140) { score += 5; drivers.push('Elevated BP trend from wearables'); }
    }

    if (bmi !== null && bmi >= 30) { score += 5; drivers.push('Obesity'); }

    // Medication adherence
    const medAdminCount = data.medicationAdmins.length;
    const medAdminTaken = data.medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;
    if (adherenceRate < 80) { score += 5; drivers.push('Low medication adherence'); }

    // Recommended actions
    if (hasHTN || hasCVD || hasKidney) {
      actions.push('Regular nephrology and cardiology follow-up');
    }
    if (!hasHTN) {
      actions.push('BP monitoring twice weekly');
    }
    if (latestBP?.systolic !== null && latestBP?.systolic !== undefined && latestBP.systolic >= 140) {
      actions.push('Immediate antihypertensive therapy review');
    }
    if (highStress) {
      actions.push('Stress management and relaxation techniques');
    }
    if (sedentary) {
      actions.push('Graduated aerobic exercise — start with walking');
    }
    if (heavyAlcohol) {
      actions.push('Alcohol reduction counseling');
    }
    actions.push('DASH diet education');
    actions.push('Sodium intake < 2g/day');

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