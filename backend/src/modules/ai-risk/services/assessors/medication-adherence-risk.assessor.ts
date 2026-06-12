/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/assessors/medication-adherence-risk.assessor.ts
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
 * medication-adherence-risk.assessor — AI module
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
export class MedicationAdherenceRiskAssessor implements RiskAssessor {
  async assess(data: AssessmentData): Promise<RiskAssessment> {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    // Age risk
    if (data.age !== null) {
      if (data.age >= 75) { score += 10; drivers.push('Age ≥ 75'); }
      else if (data.age >= 65) { score += 5; drivers.push('Age ≥ 65'); }
    }

    // Cognitive impairment risk
    const hasCognitiveImpairment = data.conditions.some(c => /dementia|alzheimer|cognitive|memory/i.test(c.displayName));
    const hasDepression = data.conditions.some(c => /depression/i.test(c.displayName));
    const hasAnxiety = data.conditions.some(c => /anxiety/i.test(c.displayName));
    const hasPsychosis = data.conditions.some(c => /schizophrenia|bipolar|psychosis/i.test(c.displayName));

    if (hasCognitiveImpairment) { score += 20; drivers.push('Cognitive impairment'); }
    if (hasDepression) { score += 15; drivers.push('Depression'); }
    if (hasAnxiety) { score += 10; drivers.push('Anxiety'); }
    if (hasPsychosis) { score += 15; drivers.push('Psychotic disorder'); }

    // Complexity of regimen
    const uniqueMedications = new Set(data.medicationAdmins.map(m => m.medicationName));
    const medicationCount = uniqueMedications.size;
    const dosesPerDay = this.estimateDosesPerDay(data.medicationAdmins);

    if (medicationCount >= 5) { score += 10; drivers.push('Polypharmacy (≥5 medications)'); }
    if (dosesPerDay > 4) { score += 8; drivers.push('Complex dosing schedule (>4 doses/day)'); }
    if (dosesPerDay > 2) { score += 4; drivers.push('Multiple daily doses (>2 doses/day)'); }

    // Medication-specific factors
    const hasInsulin = data.medicationAdmins.some(m => /insulin/i.test(m.medicationName ?? ''));
    const hasAnticoagulants = data.medicationAdmins.some(m => /warfarin|heparin|apixaban|rivaroxaban|dabigatran/i.test(m.medicationName ?? ''));
    const hasAntiepileptics = data.medicationAdmins.some(m => /levetiracetam|lamotrigine|carbamazepine|phenytoin/i.test(m.medicationName ?? ''));

    if (hasInsulin) { score += 10; drivers.push('Insulin therapy'); }
    if (hasAnticoagulants) { score += 15; drivers.push('Anticoagulant therapy'); }
    if (hasAntiepileptics) { score += 10; drivers.push('Antiepileptic therapy'); }

    // Lifestyle factors
    const lowHealthLiteracy = data.lifestyle?.educationLevel === 'LOW' || data.lifestyle?.educationLevel === 'NONE';
    const financialConstraints = data.lifestyle?.financialStrain === 'HIGH' || data.lifestyle?.financialStrain === 'SEVERE';
    const lackOfSupport = data.lifestyle?.socialSupport === 'LOW' || data.lifestyle?.socialSupport === 'NONE';
    const substanceUse = data.lifestyle?.substanceUse === 'YES';

    if (lowHealthLiteracy) { score += 10; drivers.push('Low health literacy'); }
    if (financialConstraints) { score += 15; drivers.push('Financial constraints'); }
    if (lackOfSupport) { score += 10; drivers.push('Lack of social support'); }
    if (substanceUse) { score += 15; drivers.push('Active substance use'); }

    // Current adherence rate (if available from historical data)
    const medAdminCount = data.medicationAdmins.length;
    const medAdminTaken = data.medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;
    
    // Invert adherence rate to get risk (lower adherence = higher risk)
    const adherenceRisk = 100 - adherenceRate;
    score += adherenceRisk * 0.5; // Weight adherence at 50% of total score
    if (adherenceRate < 80) { 
      drivers.push(`Low medication adherence (${adherenceRate.toFixed(0)}%)`); 
    }
    if (adherenceRate < 50) { 
      drivers.push(`Critically low medication adherence (${adherenceRate.toFixed(0)}%)`); 
    }

    // Symptoms affecting ability to take medications
    const activeSymptoms = data.symptoms.map(s => s.symptom);
    const nausea = activeSymptoms.some(s => /nausea|vomiting|sick/i.test(s));
    const fatigue = activeSymptoms.some(s => /fatigue|tired|weakness|exhaustion/i.test(s));
    const cognitiveSymptoms = activeSymptoms.some(s => /confus|disorient|memory/i.test(s));
    const dexterityIssues = activeSymptoms.some(s => /tremor|shaking|parkinson/i.test(s));

    if (nausea) { score += 10; drivers.push('Nausea/vomiting'); }
    if (fatigue) { score += 8; drivers.push('Fatigue'); }
    if (cognitiveSymptoms) { score += 10; drivers.push('Cognitive symptoms'); }
    if (dexterityIssues) { score += 8; drivers.push('Manual dexterity issues'); }

    // Lab results indicating toxicity or subtherapeutic levels
    const lithiumLab = data.labResults.find(lr => /lithium/i.test(lr.testName ?? ''));
    const digoxinLab = data.labResults.find(lr => /digoxin/i.test(lr.testName ?? ''));
    const phenytoinLab = data.labResults.find(lr => /phenytoin|dilantin/i.test(lr.testName ?? ''));
    const carbamazepineLab = data.labResults.find(lr => /carbamazepine|tegretol/i.test(lr.testName ?? ''));

    if (lithiumLab && lithiumLab.value !== null && lithiumLab.value > 1.2) {
      score += 10; drivers.push('Lithium toxicity risk');
    }

    if (digoxinLab && digoxinLab.value !== null && digoxinLab.value > 2.0) {
      score += 10; drivers.push('Digoxin toxicity risk');
    }

    // Recommended actions
    if (adherenceRate < 80) {
      actions.push('Medication therapy management review');
      actions.push('Simplify medication regimen');
      actions.push('Use pill organizer or blister packs');
    }
    if (adherenceRate < 50) {
      actions.push('Consider home health nursing for medication administration');
    }
    if (lowHealthLiteracy) {
      actions.push('Provide clear, simple medication instructions');
      actions.push('Use visual aids and teach-back method');
    }
    if (financialConstraints) {
      actions.push('Investigate patient assistance programs');
      actions.push('Consider generic alternatives');
    }
    if (lackOfSupport) {
      actions.push('Involve family caregivers in medication management');
      actions.push('Consider medication delivery services');
    }
    if (substanceUse) {
      actions.push('Substance abuse counseling');
      actions.push('Integrated treatment for substance use and medication adherence');
    }
    if (uniqueMedications.size >= 5) {
      actions.push('Comprehensive medication review');
      actions.push('Consider deprescribing where appropriate');
    }
    if (dosesPerDay > 4) {
      actions.push('Consult with pharmacist about dosing schedule optimization');
    }
    if (hasInsulin) {
      actions.push('Diabetes education and insulin administration training');
    }
    if (hasAnticoagulants) {
      actions.push('Regular INR monitoring (if warfarin)');
      actions.push('Bleeding precautions education');
    }
    actions.push('Set medication reminders/alarms');
    actions.push('Link medication habits to daily routines');
    actions.push('Regular follow-up with healthcare provider');

    // Cap score at 100
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

  private estimateDosesPerDay(medicationAdmins: any[]): number {
    if (medicationAdmins.length === 0) return 0;
    
    // Group by medication and calculate average frequency
    const medicationFrequencies: Record<string, number[]> = {};
    
    medicationAdmins.forEach(admin => {
      const medName = admin.medicationName || 'unknown';
      if (!medicationFrequencies[medName]) {
        medicationFrequencies[medName] = [];
      }
      
      // Extract frequency from scheduledTime or frequency field
      let freqPerDay = 1; // default
      if (admin.frequency) {
        const freqMatch = admin.frequency.toString().match(/(\d+)\s*times?\s*daily/i);
        if (freqMatch) {
          freqPerDay = parseInt(freqMatch[1]);
        } else if (admin.frequency.toString().includes('once daily')) {
          freqPerDay = 1;
        } else if (admin.frequency.toString().includes('twice daily') || admin.frequency.toString().includes('bid')) {
          freqPerDay = 2;
        } else if (admin.frequency.toString().includes('three times daily') || admin.frequency.toString().includes('tid')) {
          freqPerDay = 3;
        } else if (admin.frequency.toString().includes('four times daily') || admin.frequency.toString().includes('qid')) {
          freqPerDay = 4;
        }
      }
      
      medicationFrequencies[medName].push(freqPerDay);
    });
    
    // Calculate average doses per day across all medications
    let totalDoses = 0;
    let medCount = 0;
    
    for (const med in medicationFrequencies) {
      const freqs = medicationFrequencies[med]!;
      const avgFreq = freqs.reduce((sum, val) => sum + val, 0) / freqs.length;
      totalDoses += avgFreq;
      medCount++;
    }
    
    return medCount > 0 ? totalDoses / medCount : 0;
  }

  private scoreToLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MODERATE';
    return 'LOW';
  }
}