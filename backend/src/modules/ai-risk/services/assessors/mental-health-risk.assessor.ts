/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/mental-health-risk.assessor.ts
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
 * mental-health-risk.assessor — AI module
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
export class MentalHealthRiskAssessor implements RiskAssessor {
  async assess(data: AssessmentData): Promise<RiskAssessment> {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    // Age risk
    if (data.age !== null) {
      if (data.age >= 65) { score += 10; drivers.push('Age ≥ 65'); }
      else if (data.age >= 45) { score += 5; drivers.push('Age ≥ 45'); }
    }

    // Existing conditions
    const hasMentalHealth = data.conditions.some(c => /depression|anxiety|bipolar|schizophrenia|mental/i.test(c.displayName));
    const hasSubstanceAbuse = data.conditions.some(c => /substance|alcohol|drug/i.test(c.displayName));
    const hasChronicPain = data.conditions.some(c => /pain|fibromyalgia|migraine/i.test(c.displayName));
    const hasNeurological = data.conditions.some(c => /parkinson|alzheimer|dementia|stroke/i.test(c.displayName));

    if (hasMentalHealth) { score += 25; drivers.push('Existing mental health condition'); }
    if (hasSubstanceAbuse) { score += 15; drivers.push('Substance use disorder'); }
    if (hasChronicPain) { score += 10; drivers.push('Chronic pain condition'); }
    if (hasNeurological) { score += 10; drivers.push('Neurological condition'); }

    // Family history
    const familyMentalHealth = data.familyHistory.some(f => /depression|anxiety|bipolar|schizophrenia|mental/i.test(f.condition));
    if (familyMentalHealth) { score += 10; drivers.push('Family history of mental illness'); }

    // Lifestyle factors
    const smoking = data.lifestyle?.smokingStatus === 'CURRENT';
    const sedentary = data.lifestyle?.activityLevel === 'SEDENTARY';
    const poorSleep = data.lifestyle?.sleepQuality === 'POOR' || data.lifestyle?.sleepHoursAvg < 6;
    const highStress = data.lifestyle?.stressLevel === 'HIGH' || data.lifestyle?.stressLevel === 'SEVERE';
    const socialIsolation = data.lifestyle?.socialActivity === 'LOW' || data.lifestyle?.socialActivity === 'NONE';

    if (smoking) { score += 8; drivers.push('Current smoker'); }
    if (sedentary) { score += 5; drivers.push('Sedentary lifestyle'); }
    if (poorSleep) { score += 10; drivers.push('Poor sleep quality'); }
    if (highStress) { score += 15; drivers.push('High stress level'); }
    if (socialIsolation) { score += 10; drivers.push('Social isolation'); }

    // Vital signs
    const heartRate = data.vitals?.heartRate ?? null;
    const bmi = data.vitals?.bmi ?? null;

    if (heartRate !== null && heartRate > 100) { score += 5; drivers.push('Elevated heart rate'); }
    if (bmi !== null && bmi >= 30) { score += 5; drivers.push('Obesity'); }

    // Wearable data trends - sleep and heart rate variability
    const sleepData = data.wearables.filter(w => w.metricType === 'SLEEP_HOURS');
    const hrvData = data.wearables.filter(w => w.metricType === 'HEART_RATE_VARIABILITY');

    if (sleepData.length > 0) {
      const avgSleep = sleepData.reduce((sum, w) => sum + w.value, 0) / sleepData.length;
      if (avgSleep < 6) { score += 5; drivers.push('Insufficient sleep from wearable data'); }
    }

    if (hrvData.length > 0) {
      const avgHRV = hrvData.reduce((sum, w) => sum + w.value, 0) / hrvData.length;
      if (avgHRV < 20) { score += 5; drivers.push('Low heart rate variability (stress indicator)'); }
    }

    // Symptoms
    const activeSymptoms = data.symptoms.map(s => s.symptom);
    const moodSymptoms = activeSymptoms.some(s => /mood|depress|anxious|irritable/i.test(s));
    const sleepSymptoms = activeSymptoms.some(s => /insomnia|sleep|tired|fatigue/i.test(s));
    const cognitiveSymptoms = activeSymptoms.some(s => /concentrat|memory|focus/i.test(s));

    if (moodSymptoms) { score += 10; drivers.push('Mood symptoms reported'); }
    if (sleepSymptoms) { score += 8; drivers.push('Sleep disturbances reported'); }
    if (cognitiveSymptoms) { score += 5; drivers.push('Cognitive symptoms reported'); }

    // Medication adherence
    const medAdminCount = data.medicationAdmins.length;
    const medAdminTaken = data.medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;
    if (adherenceRate < 80) { score += 5; drivers.push('Low medication adherence'); }

    // Lab results
    const vitaminDLab = data.labResults.find(lr => /vitamin.*d|25-oh/i.test(lr.testName ?? ''));
    const thyroidLab = data.labResults.find(lr => /tsh|thyroid/i.test(lr.testName ?? ''));

    if (vitaminDLab && vitaminDLab.value !== null && vitaminDLab.value < 20) {
      score += 5; drivers.push('Vitamin D deficiency');
    }

    if (thyroidLab && thyroidLab.value !== null) {
      // TSH outside normal range (0.4-4.0 mIU/L)
      if (thyroidLab.value < 0.4 || thyroidLab.value > 4.0) {
        score += 5; drivers.push('Thyroid dysfunction');
      }
    }

    // Recommended actions
    if (hasMentalHealth) {
      actions.push('Psychiatry or therapy follow-up');
      actions.push('Medication management review');
    }
    if (hasSubstanceAbuse) {
      actions.push('Substance abuse counseling');
      actions.push('Addiction treatment referral');
    }
    actions.push('Stress management techniques');
    actions.push('Regular exercise routine');
    actions.push('Sleep hygiene improvement');
    if (socialIsolation) {
      actions.push('Increase social engagement');
      actions.push('Community involvement activities');
    }
    if (poorSleep) {
      actions.push('Sleep study evaluation');
      actions.push('Cognitive behavioral therapy for insomnia');
    }
    actions.push('Mindfulness and meditation practice');
    if (vitaminDLab && vitaminDLab.value !== null && vitaminDLab.value < 20) {
      actions.push('Vitamin D supplementation');
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