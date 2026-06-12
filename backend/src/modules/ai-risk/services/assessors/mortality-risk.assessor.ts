/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/mortality-risk.assessor.ts
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
 * mortality-risk.assessor — AI module
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
export class MortalityRiskAssessor implements RiskAssessor {
  async assess(data: AssessmentData): Promise<RiskAssessment> {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    // Age is the strongest predictor of mortality
    if (data.age !== null) {
      if (data.age >= 85) { score += 25; drivers.push('Age ≥ 85'); }
      else if (data.age >= 75) { score += 20; drivers.push('Age ≥ 75'); }
      else if (data.age >= 65) { score += 15; drivers.push('Age ≥ 65'); }
      else if (data.age >= 55) { score += 10; drivers.push('Age ≥ 55'); }
    }

    // Major life-threatening conditions
    const hasMetastaticCancer = data.conditions.some(c => /metastatic|stage.?[iv]|advanced.*cancer|carcinomatosis/i.test(c.displayName));
    const hasHeartFailure = data.conditions.some(c => /heart.*failure|chf|cardiomyopathy/i.test(c.displayName));
    const hasCKDStage4or5 = data.conditions.some(c => /ckd.*[45]|end.*stage.*renal|esrd/i.test(c.displayName));
    const hasLiverCirrhosis = data.conditions.some(c => /cirrhosis|end.*stage.*liver|hepatic.*failure/i.test(c.displayName));
    const hasCOPDSevere = data.conditions.some(c => /copd.*severe|very.*severe.*copd|respiratory.*failure/i.test(c.displayName));
    const hasStrokeRecent = data.conditions.some(c => /stroke|cva|cerebral.*infarction/i.test(c.displayName) && 
                                                    // Would need onset date to determine recency - simplified
                                                    true);
    const hasHIVAdvanced = data.conditions.some(c => /aids|hiv.*advanced|cd4.*<.*200/i.test(c.displayName));

    if (hasMetastaticCancer) { score += 30; drivers.push('Metastatic or advanced cancer'); }
    if (hasHeartFailure) { score += 25; drivers.push('Heart failure'); }
    if (hasCKDStage4or5) { score += 20; drivers.push('End-stage kidney disease'); }
    if (hasLiverCirrhosis) { score += 20; drivers.push('Liver cirrhosis'); }
    if (hasCOPDSevere) { score += 15; drivers.push('Severe COPD'); }
    if (hasStrokeRecent) { score += 10; drivers.push('Recent stroke'); }
    if (hasHIVAdvanced) { score += 15; drivers.push('Advanced HIV/AIDS'); }

    // Other significant conditions
    const hasCancer = data.conditions.some(c => /cancer|malignancy|carcinoma|leukemia|lymphoma/i.test(c.displayName)) && !hasMetastaticCancer;
    const hasDiabetes = data.conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasHTN = data.conditions.some(c => /hypertension|htn|bp|blood.pressure/i.test(c.displayName));
    const hasCAD = data.conditions.some(c => /coronary.*artery.*disease|mi|heart.*attack|angina/i.test(c.displayName));
    const hasDementia = data.conditions.some(c => /dementia|alzheimer|cognitive/i.test(c.displayName));
    const hasPSychosis = data.conditions.some(c => /schizophrenia|bipolar|psychotic/i.test(c.displayName));

    if (hasCancer) { score += 15; drivers.push('Cancer (non-metastatic)'); }
    if (hasDiabetes) { score += 10; drivers.push('Diabetes'); }
    if (hasHTN) { score += 8; drivers.push('Hypertension'); }
    if (hasCAD) { score += 12; drivers.push('Coronary artery disease'); }
    if (hasDementia) { score += 10; drivers.push('Dementia'); }
    if (hasPSychosis) { score += 8; drivers.push('Psychotic disorder'); }

    // Functional status
    const mobilityImpaired = data.lifestyle?.mobility === 'IMPAIRED' || data.lifestyle?.mobility === 'SEVERELY_IMPAIRED';
    const needsAssistance = data.lifestyle?.needsAssistance === 'YES' || data.lifestyle?.needsAssistance === 'EXTENSIVE';
    const weightLoss = data.lifestyle?.weightChange === 'LOSS' || data.lifestyle?.weightChange === 'SIGNIFICANT_LOSS';
    const poorAppetite = data.lifestyle?.appetite === 'POOR' || data.lifestyle?.appetite === 'VERY_POOR';
    const fatigue = data.lifestyle?.fatigueLevel === 'HIGH' || data.lifestyle?.fatigueLevel === 'SEVERE';

    if (mobilityImpaired) { score += 12; drivers.push('Mobility impairment'); }
    if (needsAssistance) { score += 15; drivers.push('Requires assistance with daily activities'); }
    if (weightLoss) { score += 10; drivers.push('Unintentional weight loss'); }
    if (poorAppetite) { score += 8; drivers.push('Poor appetite'); }
    if (fatigue) { score += 6; drivers.push('Severe fatigue'); }

    // Lifestyle factors
    const smoking = data.lifestyle?.smokingStatus === 'CURRENT';
    const heavyAlcohol = data.lifestyle?.alcoholConsumption === 'HEAVY';
    const sedentary = data.lifestyle?.activityLevel === 'SEDENTARY';
    const poorDiet = data.lifestyle?.dietType === 'POOR' || data.lifestyle?.dietType === 'PROCESSED_HIGH_FAT';

    if (smoking) { score += 10; drivers.push('Current smoker'); }
    if (heavyAlcohol) { score += 8; drivers.push('Heavy alcohol use'); }
    if (sedentary) { score += 6; drivers.push('Sedentary lifestyle'); }
    if (poorDiet) { score += 5; drivers.push('Poor diet quality'); }

    // Vital signs
    const bmi = data.vitals?.bmi ?? null;
    const systolicBP = data.vitals?.bpSystolic ?? null;
    const diastolicBP = data.vitals?.bpDiastolic ?? null;
    const heartRate = data.vitals?.heartRate ?? null;
    const temperature = data.vitals?.temperature ?? null;
    const spo2 = data.vitals?.spo2 ?? null;

    if (bmi !== null && bmi < 18.5) { 
      score += 8; drivers.push('Underweight (BMI < 18.5)'); 
    }
    if (bmi !== null && bmi >= 35) { 
      score += 8; drivers.push('Severe obesity (BMI ≥ 35)'); 
    }

    if (systolicBP !== null && systolicBP < 90) { 
      score += 10; drivers.push('Hypotension (SBP < 90)'); 
    }
    if (systolicBP !== null && systolicBP > 180) { 
      score += 8; drivers.push('Severe hypertension (SBP > 180)'); 
    }
    if (diastolicBP !== null && diastolicBP > 110) { 
      score += 6; drivers.push('Severe hypertension (DBP > 110)'); 
    }

    if (heartRate !== null && heartRate > 120) { 
      score += 6; drivers.push('Tachycardia (HR > 120)'); 
    }
    if (heartRate !== null && heartRate < 40) { 
      score += 6; drivers.push('Bradycardia (HR < 40)'); 
    }

    if (temperature !== null && temperature > 38.3) { 
      score += 6; drivers.push('Fever (>38.3°C / 101°F)'); 
    }
    if (temperature !== null && temperature < 35.0) { 
      score += 6; drivers.push('Hypothermia (<35.0°C / 95°F)'); 
    }

    if (spo2 !== null && spo2 < 90) { 
      score += 10; drivers.push('Hypoxemia (SpO2 < 90%)'); 
    }
    if (spo2 !== null && spo2 < 80) { 
      score += 10; drivers.push('Severe hypoxemia (SpO2 < 80%)'); 
    }

    // Wearable data trends
    const stepsData = data.wearables.filter(w => w.metricType === 'STEPS');
    if (stepsData.length > 0) {
      const avgSteps = stepsData.reduce((sum, w) => sum + w.value, 0) / stepsData.length;
      if (avgSteps < 1000) { 
        score += 8; drivers.push('Very low activity (<1000 steps/day)'); 
      }
    }

    const sleepData = data.wearables.filter(w => w.metricType === 'SLEEP_HOURS');
    if (sleepData.length > 0) {
      const avgSleep = sleepData.reduce((sum, w) => sum + w.value, 0) / sleepData.length;
      if (avgSleep < 4) { 
        score += 6; drivers.push('Very low sleep (<4 hours/night)'); 
      }
    }

    // Lab results
    const albuminLab = data.labResults.find(lr => /albumin/i.test(lr.testName ?? ''));
    const hemoglobinLab = data.labResults.find(lr => /hemoglobin|hgb/i.test(lr.testName ?? ''));
    const lymphocyteLab = data.labResults.find(lr => /lymphocyte/i.test(lr.testName ?? ''));
    const wbcLab = data.labResults.find(lr => /wbc|white.*blood/i.test(lr.testName ?? ''));
    const lactateLab = data.labResults.find(lr => /lactate/i.test(lr.testName ?? ''));
    const bilirubinLab = data.labResults.find(lr => /bilirubin/i.test(lr.testName ?? ''));
    const inrLab = data.labResults.find(lr => /inr|prothrombin/i.test(lr.testName ?? ''));

    if (albuminLab && albuminLab.value !== null && albuminLab.value < 3.0) {
      score += 8; drivers.push('Hypoalbuminemia (<3.0 g/dL)');
    }

    if (hemoglobinLab && hemoglobinLab.value !== null) {
      if (hemoglobinLab.value < 7.0) { 
        score += 10; drivers.push('Severe anemia (<7.0 g/dL)'); 
      }
      else if (hemoglobinLab.value < 10.0) { 
        score += 6; drivers.push('Moderate anemia (<10.0 g/dL)'); 
      }
    }

    if (lymphocyteLab && lymphocyteLab.value !== null && lymphocyteLab.value < 800) {
      score += 6; drivers.push('Lymphopenia (<800 cells/µL)');
    }

    if (wbcLab && wbcLab.value !== null) {
      if (wbcLab.value < 1000) { 
        score += 8; drivers.push('Severe leukopenia (<1000 cells/µL)'); 
      }
      else if (wbcLab.value > 20000) { 
        score += 8; drivers.push('Leukocytosis (>20,000 cells/µL)'); 
      }
    }

    if (lactateLab && lactateLab.value !== null && lactateLab.value > 2.0) {
      score += 8; drivers.push('Elevated lactate (>2.0 mmol/L)');
    }
    if (lactateLab && lactateLab.value !== null && lactateLab.value > 4.0) {
      score += 10; drivers.push('Severe lactate elevation (>4.0 mmol/L)');
    }

    if (bilirubinLab && bilirubinLab.value !== null && bilirubinLab.value > 3.0) {
      score += 6; drivers.push('Elevated bilirubin (>3.0 mg/dL)');
    }
    if (bilirubinLab && bilirubinLab.value !== null && bilirubinLab.value > 5.0) {
      score += 8; drivers.push('Severe hyperbilirubinemia (>5.0 mg/dL)');
    }

    if (inrLab && inrLab.value !== null && inrLab.value > 3.0) {
      score += 6; drivers.push('Elevated INR (>3.0)');
    }
    if (inrLab && inrLab.value !== null && inrLab.value > 5.0) {
      score += 8; drivers.push('Severe coagulopathy (INR > 5.0)');
    }

    // Medication factors
    const medAdminCount = data.medicationAdmins.length;
    const medAdminTaken = data.medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;
    if (adherenceRate < 50) { 
      score += 10; drivers.push('Critically low medication adherence'); 
    }

    // Chemotherapy or immunosuppressants (in context of cancer)
    const chemoMeds = data.medicationAdmins.filter(m => 
      /methotrexate|cyclophosphamide|doxorubicin|cisplatin|5-fluorouracil/i.test(m.medicationName ?? '')
    );
    if (hasCancer && chemoMeds.length > 0) {
      score += 5; drivers.push('Receiving chemotherapy');
    }

    // Corticosteroid use (long-term)
    const steroidMeds = data.medicationAdmins.filter(m => 
      /prednisone|dexamethasone|hydrocortisone|methylprednisolone/i.test(m.medicationName ?? '')
    );
    if (steroidMeds.length > 0) {
      score += 5; drivers.push('Long-term corticosteroid use');
    }

    // Recommended actions
    if (hasMetastaticCancer || hasHeartFailure || hasCKDStage4or5 || hasLiverCirrhosis) {
      actions.push('Palliative care consultation');
      actions.push('Goals of care discussion');
      actions.push('Advance care planning');
    }
    if (hasCancer) {
      actions.push('Oncology follow-up');
      actions.push('Consider cancer screening if not up to date');
    }
    if (hasHeartFailure) {
      actions.push('Cardiology follow-up');
      actions.push('Daily weight monitoring');
      actions.push('Limit sodium and fluid intake');
    }
    if (hasCKDStage4or5) {
      actions.push('Nephrology follow-up');
      actions.push('Prepare for dialysis evaluation');
    }
    if (hasLiverCirrhosis) {
      actions.push('Hepatology follow-up');
      actions.push('Screen for hepatocellular carcinoma');
      actions.push('Avoid alcohol and hepatotoxic medications');
    }
    if (smoking) {
      actions.push('Smoking cessation');
    }
    if (heavyAlcohol) {
      actions.push('Alcohol use disorder treatment');
    }
    if (sedentary) {
      actions.push('Gradual increase in physical activity');
    }
    if (weightLoss || poorAppetite) {
      actions.push('Nutritional assessment');
      actions.push('Consider appetite stimulants or nutritional supplements');
    }
    actions.push('Regular vital signs monitoring');
    actions.push('Medication reconciliation');
    actions.push('Advanced care planning discussion');
    actions.push('Influenza and pneumococcal vaccinations up to date');

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