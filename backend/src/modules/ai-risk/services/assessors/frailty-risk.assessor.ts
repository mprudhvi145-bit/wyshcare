/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/frailty-risk.assessor.ts
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
 * frailty-risk.assessor — AI module
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
export class FrailtyRiskAssessor implements RiskAssessor {
  async assess(data: AssessmentData): Promise<RiskAssessment> {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    // Age risk (primary factor for frailty)
    if (data.age !== null) {
      if (data.age >= 85) { score += 25; drivers.push('Age ≥ 85'); }
      else if (data.age >= 75) { score += 20; drivers.push('Age ≥ 75'); }
      else if (data.age >= 65) { score += 10; drivers.push('Age ≥ 65'); }
    }

    // Comorbidity burden
    const conditionCount = data.conditions.length;
    if (conditionCount >= 5) { 
      score += 15; drivers.push(`Polymorbidity (${conditionCount} conditions)`); 
    }
    else if (conditionCount >= 3) { 
      score += 10; drivers.push(`Multimorbidity (${conditionCount} conditions)`); 
    }

    // Specific conditions contributing to frailty
    const hasCancer = data.conditions.some(c => /cancer|malignancy|carcinoma|leukemia|lymphoma/i.test(c.displayName));
    const hasCOPD = data.conditions.some(c => /copd|asthma|respiratory|lung/i.test(c.displayName));
    const hasHeartFailure = data.conditions.some(c => /heart.*failure|chf/i.test(c.displayName));
    const hasLiverDisease = data.conditions.some(c => /liver|hepatic|cirrhosis/i.test(c.displayName));
    const hasStroke = data.conditions.some(c => /stroke|cva|hemiparesis/i.test(c.displayName));
    const hasParkinson = data.conditions.some(c => /parkinson|pd/i.test(c.displayName));
    const hasDementia = data.conditions.some(c => /dementia|alzheimer|cognitive/i.test(c.displayName));
    const hasDiabetes = data.conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasKidney = data.conditions.some(c => /kidney|renal|ckd|nephropathy/i.test(c.displayName));
    const hasDepression = data.conditions.some(c => /depression/i.test(c.displayName));

    if (hasCancer) { score += 10; drivers.push('Cancer'); }
    if (hasCOPD) { score += 8; drivers.push('COPD/respiratory disease'); }
    if (hasHeartFailure) { score += 12; drivers.push('Heart failure'); }
    if (hasLiverDisease) { score += 8; drivers.push('Liver disease'); }
    if (hasStroke) { score += 10; drivers.push('History of stroke/CVA'); }
    if (hasParkinson) { score += 15; drivers.push('Parkinson disease'); }
    if (hasDementia) { score += 15; drivers.push('Cognitive impairment/dementia'); }
    if (hasDiabetes) { score += 5; drivers.push('Diabetes'); }
    if (hasKidney) { score += 5; drivers.push('Kidney disease'); }
    if (hasDepression) { score += 8; drivers.push('Depression'); }

    // Lifestyle factors
    const sedentary = data.lifestyle?.activityLevel === 'SEDENTARY';
    const poorNutrition = data.lifestyle?.dietType === 'POOR' || data.lifestyle?.appetite === 'POOR';
    const lowActivity = data.lifestyle?.exerciseFrequency === 'NONE' || data.lifestyle?.exerciseFrequency === 'RARE';
    const poorSleep = data.lifestyle?.sleepQuality === 'POOR' || data.lifestyle?.sleepHoursAvg < 5;
    const weightLoss = data.lifestyle?.weightChange === 'LOSS' || data.lifestyle?.weightChange === 'SIGNIFICANT_LOSS';

    if (sedentary) { score += 12; drivers.push('Sedentary lifestyle'); }
    if (poorNutrition) { score += 10; drivers.push('Poor nutrition'); }
    if (lowActivity) { score += 8; drivers.push('Low physical activity'); }
    if (poorSleep) { score += 8; drivers.push('Poor sleep quality'); }
    if (weightLoss) { score += 15; drivers.push('Unintentional weight loss'); }

    // Vital signs
    const bmi = data.vitals?.bmi ?? null;
    const weight = data.vitals?.weight ?? null;
    const height = data.vitals?.height ?? null;
    const systolicBP = data.vitals?.bpSystolic ?? null;
    const diastolicBP = data.vitals?.bpDiastolic ?? null;

    if (bmi !== null && bmi < 18.5) { 
      score += 12; drivers.push(`Underweight BMI ${bmi.toFixed(1)}`); 
    }
    if (bmi !== null && bmi >= 30) { 
      score += 6; drivers.push(`Obesity BMI ${bmi.toFixed(1)}`); 
    }

    // Unintentional weight loss (if we have historical data)
    // This would require comparing with previous vitals - simplified for now

    if (systolicBP !== null && systolicBP < 90) { 
      score += 8; drivers.push('Hypotension (SBP < 90)'); 
    }
    if (diastolicBP !== null && diastolicBP < 60) { 
      score += 5; drivers.push('Low diastolic BP (< 60)'); 
    }

    // Wearable data
    const stepsData = data.wearables.filter(w => w.metricType === 'STEPS');
    const sleepData = data.wearables.filter(w => w.metricType === 'SLEEP_HOURS');
    const heartRateData = data.wearables.filter(w => w.metricType === 'HEART_RATE');

    if (stepsData.length > 0) {
      const avgSteps = stepsData.reduce((sum, w) => sum + w.value, 0) / stepsData.length;
      if (avgSteps < 2000) { 
        score += 10; drivers.push('Very low activity level (<2000 steps/day)'); 
      }
      else if (avgSteps < 5000) { 
        score += 5; drivers.push('Low activity level (<5000 steps/day)'); 
      }
    }

    if (sleepData.length > 0) {
      const avgSleep = sleepData.reduce((sum, w) => sum + w.value, 0) / sleepData.length;
      if (avgSleep < 5) { 
        score += 8; drivers.push('Insufficient sleep (<5 hours/night)'); 
      }
    }

    if (heartRateData.length > 0) {
      const avgHR = heartRateData.reduce((sum, w) => sum + w.value, 0) / heartRateData.length;
      if (avgHR > 100) { 
        score += 5; drivers.push('Elevated resting heart rate (>100 bpm)'); 
      }
      if (avgHR < 60) { 
        score += 5; drivers.push('Low resting heart rate (<60 bpm)'); 
      }
    }

    // Symptoms
    const activeSymptoms = data.symptoms.map(s => s.symptom);
    const fatigue = activeSymptoms.some(s => /fatigue|tired|weakness|exhaustion/i.test(s));
    const dyspnea = activeSymptoms.some(s => /sob|dyspnea|breathless|shortness.of.breath/i.test(s));
    const pain = activeSymptoms.some(s => /pain|ache|sore/i.test(s));
    const dizziness = activeSymptoms.some(s => /dizziness|vertigo|faint|unsteady/i.test(s));
    const cognitiveSymptoms = activeSymptoms.some(s => /confus|disorient|memory|concentrate/i.test(s));

    if (fatigue) { score += 10; drivers.push('Fatigue'); }
    if (dyspnea) { score += 8; drivers.push('Shortness of breath'); }
    if (pain) { score += 6; drivers.push('Chronic pain'); }
    if (dizziness) { score += 8; drivers.push('Dizziness/balance issues'); }
    if (cognitiveSymptoms) { score += 8; drivers.push('Cognitive symptoms'); }

    // Medication factors
    const medAdminCount = data.medicationAdmins.length;
    const medAdminTaken = data.medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;
    if (adherenceRate < 70) { 
      score += 8; drivers.push('Low medication adherence'); 
    }

    // Polypharmacy (>5 medications increases frailty risk)
    const uniqueMedications = new Set(data.medicationAdmins.map(m => m.medicationName));
    if (uniqueMedications.size > 5) {
      score += 8; drivers.push('Polypharmacy (>5 medications)');
    }

    // Sedating medications
    const sedatingMeds = data.medicationAdmins.filter(m => 
      /benzodiazepine|opioid|antipsychotic|antidepressant|antihistamine/i.test(m.medicationName ?? '')
    );
    if (sedatingMeds.length > 0) {
      score += 5; drivers.push('Sedating medications');
    }

    // Recommended actions
    actions.push('Comprehensive geriatric assessment');
    if (sedentary || lowActivity) {
      actions.push('Physical therapy and graded exercise program');
      actions.push('Resistance training to maintain muscle mass');
    }
    if (poorNutrition || weightLoss) {
      actions.push('Nutritional assessment and supplementation');
      actions.push('Consider meal delivery or meal preparation assistance');
    }
    if (poorSleep) {
      actions.push('Sleep hygiene evaluation');
      actions.push('Treatment for sleep disorders if present');
    }
    if (dizziness) {
      actions.push('Balance and vestibular assessment');
      actions.push('Fall prevention program');
    }
    if (cognitiveSymptoms || hasDementia) {
      actions.push('Cognitive assessment');
      actions.push('Safety evaluation for independent living');
    }
    if (uniqueMedications.size > 5) {
      actions.push('Medication review and deprescribing where possible');
    }
    if (sedatingMeds.length > 0) {
      actions.push('Review of sedating medications');
      actions.push('Consider alternatives to reduce fall risk');
    }
    actions.push('Annual vision and hearing checks');
    actions.push('Home safety evaluation');
    actions.push('Social engagement and community involvement');
    actions.push('Vitamin D and calcium supplementation if deficient');

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