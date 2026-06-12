/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/readmission-risk.assessor.ts
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
 * readmission-risk.assessor — AI module
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
export class ReadmissionRiskAssessor implements RiskAssessor {
  async assess(data: AssessmentData): Promise<RiskAssessment> {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    // Age risk
    if (data.age !== null) {
      if (data.age >= 75) { score += 15; drivers.push('Age ≥ 75'); }
      else if (data.age >= 65) { score += 10; drivers.push('Age ≥ 65'); }
    }

    // Comorbidity burden
    const conditionCount = data.conditions.length;
    if (conditionCount >= 5) { 
      score += 20; drivers.push(`${conditionCount} comorbid conditions`); 
    }
    else if (conditionCount >= 3) { 
      score += 10; drivers.push(`${conditionCount} comorbid conditions`); 
    }

    // Specific high-risk conditions
    const hasCVD = data.conditions.some(c => /heart|cardiac|chd|cad|afib|arrhythmia|failure|cva|stroke/i.test(c.displayName));
    const hasCOPD = data.conditions.some(c => /copd|asthma|respiratory|lung/i.test(c.displayName));
    const hasDiabetes = data.conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasKidney = data.conditions.some(c => /kidney|renal|ckd|nephropathy/i.test(c.displayName));
    const hasCancer = data.conditions.some(c => /cancer|malignancy|carcinoma|leukemia|lymphoma/i.test(c.displayName));
    const hasMentalHealth = data.conditions.some(c => /depression|anxiety|bipolar|schizophrenia|mental/i.test(c.displayName));

    if (hasCVD) { score += 10; drivers.push('Cardiovascular disease'); }
    if (hasCOPD) { score += 10; drivers.push('COPD/respiratory disease'); }
    if (hasDiabetes) { score += 8; drivers.push('Diabetes'); }
    if (hasKidney) { score += 10; drivers.push('Kidney disease'); }
    if (hasCancer) { score += 8; drivers.push('Active cancer'); }
    if (hasMentalHealth) { score += 8; drivers.push('Mental health condition'); }

    // Recent healthcare utilization
    const hasRecentHospitalization = data.clinicalOrders.some(c => 
      c.orderType === 'REFERRAL' || 
      /inpatient|admit|hospital/i.test(c.title ?? '')
    );
    if (hasRecentHospitalization) { 
      score += 10; drivers.push('Recent hospitalization/referral'); 
    }

    const activeOrderCount = data.clinicalOrders.length;
    if (activeOrderCount > 3) { 
      score += 5; drivers.push(`${activeOrderCount} active clinical orders`); 
    }

    // Medication factors
    const medAdminCount = data.medicationAdmins.length;
    const medAdminTaken = data.medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;
    
    if (adherenceRate < 80) { 
      score += 10; drivers.push('Low medication adherence (< 80%)'); 
    }
    if (adherenceRate < 50) { 
      score += 5; drivers.push('Critically low medication adherence'); 
    }

    // Polypharmacy risk (more than 5 medications)
    const uniqueMedications = new Set(data.medicationAdmins.map(m => m.medicationName));
    if (uniqueMedications.size > 5) {
      score += 5; drivers.push('Polypharmacy (>5 medications)');
    }

    // Symptoms
    const activeSymptoms = data.symptoms.map(s => s.symptom);
    const fatigue = activeSymptoms.some(s => /fatigue|tired|weakness|exhaustion/i.test(s));
    const dyspnea = activeSymptoms.some(s => /sob|dyspnea|breathless|shortness.of.breath/i.test(s));
    const chestPain = activeSymptoms.some(s => /chest.pain|angina|palpitations/i.test(s));

    if (fatigue) { score += 5; drivers.push('Fatigue reported'); }
    if (dyspnea) { score += 5; drivers.push('Shortness of breath reported'); }
    if (chestPain) { score += 5; drivers.push('Chest pain reported'); }

    // Lab results indicating instability
    const bunLab = data.labResults.find(lr => /bun|urea/i.test(lr.testName ?? ''));
    const creatinineLab = data.labResults.find(lr => /creatinine/i.test(lr.testName ?? ''));
    const wbclab = data.labResults.find(lr => /wbc|white.*blood/i.test(lr.testName ?? ''));

    if (bunLab && bunLab.value !== null && bunLab.value > 30) {
      score += 5; drivers.push('Elevated BUN (possible dehydration/kidney issue)');
    }

    if (creatinineLab && creatinineLab.value !== null && creatinineLab.value > 2.0) {
      score += 5; drivers.push('Elevated creatinine (possible kidney dysfunction)');
    }

    if (wbclab && wbclab.value !== null && wbclab.value > 11000) {
      score += 5; drivers.push('Elevated WBC (possible infection/inflammation)');
    }

    // Recommended actions
    if (data.age !== null && data.age >= 65 && conditionCount >= 3) {
      actions.push('Transitional care management program');
    }
    actions.push('Structured discharge planning and follow-up within 48 hours');
    if (adherenceRate < 80) {
      actions.push('Medication reconciliation and adherence support');
    }
    actions.push('Patient education on red-flag symptoms and when to seek care');
    if (conditionCount >= 3) {
      actions.push('Care coordination with specialist appointments');
    }
    actions.push('Home health referral for post-discharge monitoring');
    actions.push('Schedule follow-up appointment within 7-14 days of discharge');

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