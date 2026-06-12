/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/engines/prediction-engine.service.ts
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
 * Business logic service for engines
 *
 * Responsibilities:
 * - Execute business logic for digital twin operations
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
 - common
 *
 * Dependencies:
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Digital Twin
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
import { PrismaService } from '../../../providers/prisma/prisma.service';

export interface Prediction {
  type: string;
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  riskLevel: string;
  factors: string[];
  recommendations: string[];
}

export interface PredictionsResult {
  predictions: Prediction[];
  generatedAt: string;
}

@Injectable()
export class PredictionEngineService {
  private readonly logger = new Logger(PredictionEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async predict(userId: string): Promise<PredictionsResult> {
    const [user, conditions, vitals, vitalsHistory, lifestyle, wearableMetrics] =
      await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.condition.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
        this.prisma.vitalsRecord.findFirst({ where: { patientId: userId }, orderBy: { recordedAt: 'desc' } }),
        this.prisma.vitalsRecord.findMany({
          where: { patientId: userId },
          orderBy: { recordedAt: 'desc' },
          take: 10,
        }),
        this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
        this.prisma.wearableMetric.findMany({
          where: { userId, recordedAt: { gte: new Date(Date.now() - 30 * 86400000) } },
          orderBy: { recordedAt: 'desc' },
        }),
      ]);

    const age = user?.dateOfBirth ? this.calcAge(user.dateOfBirth) : null;
    const ageGroup = age !== null ? (age < 40 ? 'YOUNG' : age < 65 ? 'MIDDLE' : 'ELDERLY') : 'UNKNOWN';

    const activeConditions = conditions.map(c => ({
      icdCode: c.icdCode,
      displayName: c.displayName,
      onsetDate: c.onsetDate,
      severity: c.severity,
      clinicalStatus: c.clinicalStatus,
    }));

    const hasDiabetes = this.matchCondition(activeConditions, /diabetes|dm|type.?[12]/i);
    const hasHypertension = this.matchCondition(activeConditions, /hypertension|htn|bp|blood.pressure/i);
    const hasCVD = this.matchCondition(activeConditions, /heart|cardiac|chd|cad|afib|arrhythmia|failure|cva|stroke|mi/i);
    const hasCOPD = this.matchCondition(activeConditions, /copd|asthma|respiratory|lung|bronchitis/i);
    const hasKidney = this.matchCondition(activeConditions, /kidney|renal|ckd|nephropathy/i);
    const hasMental = this.matchCondition(activeConditions, /depression|anxiety|bipolar|schizophrenia|ptsd|mental/i);
    const hasCancer = this.matchCondition(activeConditions, /cancer|malignancy|carcinoma|leukemia|lymphoma|tumor/i);
    const hasObesity = this.matchCondition(activeConditions, /obes|overweight/i) || (vitals?.bmi !== null && vitals?.bmi !== undefined && vitals.bmi >= 30);

    const smoking = lifestyle?.smokingStatus === 'CURRENT';
    const sedentary = lifestyle?.activityLevel === 'SEDENTARY';
    const highStress = lifestyle?.stressLevel === 'HIGH' || lifestyle?.stressLevel === 'SEVERE';
    const poorDiet = lifestyle?.dietType === 'NON_VEG' || lifestyle?.dietType === null || lifestyle?.dietType === undefined;
    const heavyAlcohol = lifestyle?.alcoholConsumption === 'HEAVY';
    const poorSleep = lifestyle?.sleepHoursAvg !== null && lifestyle?.sleepHoursAvg !== undefined && lifestyle.sleepHoursAvg < 6;

    const bmi = vitals?.bmi ?? null;
    const latestBP = { systolic: vitals?.bpSystolic ?? null, diastolic: vitals?.bpDiastolic ?? null };
    const heartRate = vitals?.heartRate ?? null;
    const spo2 = vitals?.spo2 ?? null;

    const bpTrend = this.computeBPTrend(vitalsHistory);

    const predictions: (Prediction | null)[] = [];

    predictions.push(this.predictCardiovascularEvent(age, ageGroup, hasCVD, hasDiabetes, hasHypertension, hasObesity, smoking, sedentary, latestBP, bmi, bpTrend, spo2, heartRate));
    predictions.push(this.predictDiabetesProgression(age, ageGroup, hasDiabetes, hasObesity, sedentary, poorDiet, bmi, wearableMetrics, lifestyle ? { smokingStatus: lifestyle.smokingStatus ?? undefined, activityLevel: lifestyle.activityLevel ?? undefined, dietType: lifestyle.dietType ?? undefined, alcoholConsumption: lifestyle.alcoholConsumption ?? undefined } : null));
    predictions.push(this.predictHypertensionRisk(age, ageGroup, hasHypertension, hasDiabetes, hasCVD, hasKidney, hasObesity, latestBP, bpTrend, smoking, heavyAlcohol, sedentary, highStress, bmi));
    predictions.push(this.predictKidneyDisease(age, ageGroup, hasKidney, hasDiabetes, hasHypertension, hasCVD, bmi));
    predictions.push(this.predictRespiratoryDecline(age, ageGroup, hasCOPD, smoking, spo2, bmi, lifestyle ? { smokingStatus: lifestyle.smokingStatus ?? undefined } : null));
    predictions.push(this.predictMentalHealth(age, ageGroup, hasMental, highStress, poorSleep, lifestyle ? { activityLevel: lifestyle.activityLevel ?? undefined, alcoholConsumption: lifestyle.alcoholConsumption ?? undefined } : null));
    predictions.push(this.predictFallRisk(age, ageGroup, conditions, vitals, lifestyle ? { activityLevel: lifestyle.activityLevel ?? undefined } : null));
    predictions.push(this.predictReadmissionRisk(age, ageGroup, activeConditions.map(c => ({ ...c, icdCode: c.icdCode ?? undefined } as { displayName: string; icdCode?: string })), hasCVD, hasDiabetes, hasCOPD, hasKidney, hasCancer, hasMental));
    predictions.push(this.predictMedicationNonAdherence(age, ageGroup, hasMental, conditions.length, sedentary, lifestyle ? { smokingStatus: lifestyle.smokingStatus ?? undefined, alcoholConsumption: lifestyle.alcoholConsumption ?? undefined } : null));
    predictions.push(this.predictFrailty(age, ageGroup, activeConditions, lifestyle ? { activityLevel: lifestyle.activityLevel ?? undefined, sleepHoursAvg: lifestyle.sleepHoursAvg ?? undefined, smokingStatus: lifestyle.smokingStatus ?? undefined } : null, bmi));
    predictions.push(this.predictMortality(age, ageGroup, activeConditions, lifestyle ? { smokingStatus: lifestyle.smokingStatus ?? undefined } : null, bmi, latestBP, smoking));

    return {
      predictions: predictions.filter((p): p is Prediction => p !== null),
      generatedAt: new Date().toISOString(),
    };
  }

  private predictCardiovascularEvent(
    age: number | null, ageGroup: string, hasCVD: boolean, hasDiabetes: boolean, hasHTN: boolean,
    hasObesity: boolean, smoking: boolean, sedentary: boolean,
    latestBP: { systolic: number | null; diastolic: number | null }, bmi: number | null,
    bpTrend: string, _spo2: number | null, _heartRate: number | null,
  ): Prediction | null {
    let probability = 0.05;
    const factors: string[] = [];

    if (age !== null && age >= 65) { probability += 0.15; factors.push('Age ≥ 65'); }
    else if (age !== null && age >= 55) { probability += 0.10; factors.push('Age 55-64'); }
    else if (age !== null && age >= 45) { probability += 0.05; factors.push('Age 45-54'); }

    if (hasCVD) { probability += 0.25; factors.push('Existing cardiovascular disease'); }
    if (hasDiabetes) { probability += 0.15; factors.push('Diabetes mellitus'); }
    if (hasHTN) { probability += 0.10; factors.push('Hypertension'); }
    if (hasObesity) { probability += 0.08; factors.push('Obesity'); }
    if (smoking) { probability += 0.15; factors.push('Current smoker'); }
    if (sedentary) { probability += 0.05; factors.push('Sedentary lifestyle'); }

    if (latestBP.systolic !== null && latestBP.systolic >= 160) { probability += 0.08; factors.push('Severe hypertension'); }
    else if (latestBP.systolic !== null && latestBP.systolic >= 140) { probability += 0.05; factors.push('Elevated BP'); }
    if (bmi !== null && bmi >= 30) { probability += 0.05; factors.push(`BMI ${bmi.toFixed(1)}`); }

    if (bpTrend === 'RISING') { probability += 0.05; factors.push('Rising BP trend'); }

    probability = Math.min(probability, 0.95);

    return {
      type: 'CARDIOVASCULAR_EVENT',
      title: 'Cardiovascular Event Risk',
      description: this.buildDescription('cardiovascular event (heart attack, stroke, or acute coronary syndrome)', probability, age),
      probability: Math.round(probability * 100) / 100,
      timeframe: hasCVD ? '30 days' : '1 year',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        'Lipid profile every 3-6 months',
        'BP control target < 130/80 mmHg',
        hasCVD ? 'Cardiology follow-up monthly' : 'Annual cardiac risk assessment',
        smoking ? 'Smoking cessation program' : null,
        'Daily aspirin if primary prevention indicated',
        'Mediterranean diet counseling',
      ].filter((r): r is string => r !== null),
    };
  }

  private predictDiabetesProgression(
    age: number | null, ageGroup: string, hasDiabetes: boolean, hasObesity: boolean,
    sedentary: boolean, poorDiet: boolean, bmi: number | null,
    wearableMetrics: { metricType: string; value: number }[], _lifestyle: { smokingStatus?: string; activityLevel?: string; dietType?: string | null; alcoholConsumption?: string } | null,
  ): Prediction | null {
    if (!hasDiabetes) {
      let probability = 0.02;
      const factors: string[] = [];

      if (age !== null && age >= 45) { probability += 0.10; factors.push('Age ≥ 45'); }
      if (hasObesity) { probability += 0.10; factors.push('Obesity'); }
      if (sedentary) { probability += 0.05; factors.push('Sedentary'); }
      if (poorDiet) { probability += 0.05; factors.push('Poor dietary habits'); }
      if (bmi !== null && bmi >= 25) { probability += 0.08; factors.push(`Overweight (BMI ${bmi.toFixed(1)})`); }

      const glucoseValues = wearableMetrics.filter(w => w.metricType === 'GLUCOSE').map(w => w.value);
      if (glucoseValues.length > 0) {
        const avgGlucose = glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length;
        if (avgGlucose >= 126) { probability += 0.20; factors.push(`Elevated glucose ${avgGlucose.toFixed(0)} mg/dL`); }
        else if (avgGlucose >= 100) { probability += 0.10; factors.push(`Impaired fasting glucose ${avgGlucose.toFixed(0)} mg/dL`); }
      }

      probability = Math.min(probability, 0.70);
      return {
        type: 'DIABETES_PROGRESSION',
        title: 'Type 2 Diabetes Onset Risk',
        description: `Risk of developing type 2 diabetes within ${probability > 0.3 ? '6 months' : '1 year'} based on metabolic risk factors.`,
        probability: Math.round(probability * 100) / 100,
        timeframe: probability > 0.3 ? '6 months' : '1 year',
        riskLevel: this.probabilityToRiskLevel(probability),
        factors: [...new Set(factors)],
        recommendations: [
          'Fasting blood glucose and HbA1c testing',
          'Weight management program — target 5-7% loss',
          'Dietary counseling — reduce refined carbohydrates',
          'Physical activity 150 min/week moderate intensity',
          'Annual diabetes screening',
        ],
      };
    }

    let probability = 0.10;
    const factors: string[] = ['Existing diabetes diagnosis'];

    if (age !== null && age >= 65) { probability += 0.10; factors.push('Age ≥ 65'); }
    if (hasObesity) { probability += 0.10; factors.push('Obesity'); }
    if (sedentary) { probability += 0.05; factors.push('Sedentary'); }
    if (bmi !== null && bmi >= 30) { probability += 0.10; factors.push(`BMI ${bmi.toFixed(1)}`); }

    probability = Math.min(probability, 0.85);
    return {
      type: 'DIABETES_PROGRESSION',
      title: 'Diabetes Progression Risk',
      description: `Risk of diabetes progression (complications or worsening glycemic control) in the next year.`,
      probability: Math.round(probability * 100) / 100,
      timeframe: '1 year',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        'HbA1c testing every 3 months',
        'Endocrinology follow-up quarterly',
        'Annual eye exam for retinopathy screening',
        'Annual foot exam and neuropathy assessment',
        'Continuous glucose monitoring if HbA1c > 8%',
        'Renal function monitoring annually (eGFR, UACR)',
      ],
    };
  }

  private predictHypertensionRisk(
    age: number | null, ageGroup: string, hasHTN: boolean, hasDiabetes: boolean,
    hasCVD: boolean, hasKidney: boolean, hasObesity: boolean,
    latestBP: { systolic: number | null; diastolic: number | null }, bpTrend: string,
    smoking: boolean, heavyAlcohol: boolean, sedentary: boolean, highStress: boolean, bmi: number | null,
  ): Prediction | null {
    let probability = hasHTN ? 0.20 : 0.03;
    const factors: string[] = [];

    if (hasHTN) factors.push('Existing hypertension diagnosis');
    if (age !== null && age >= 65) { probability += 0.15; factors.push('Age ≥ 65'); }
    else if (age !== null && age >= 55) { probability += 0.08; factors.push('Age 55-64'); }
    if (hasDiabetes) { probability += 0.10; factors.push('Diabetes'); }
    if (hasCVD) { probability += 0.10; factors.push('Cardiovascular disease'); }
    if (hasKidney) { probability += 0.10; factors.push('Kidney disease'); }
    if (hasObesity) { probability += 0.08; factors.push('Obesity'); }
    if (smoking) { probability += 0.08; factors.push('Smoking'); }
    if (heavyAlcohol) { probability += 0.05; factors.push('Heavy alcohol'); }
    if (sedentary) { probability += 0.05; factors.push('Sedentary'); }
    if (highStress) { probability += 0.05; factors.push('High stress'); }
    if (bmi !== null && bmi >= 30) { probability += 0.05; factors.push(`BMI ${bmi.toFixed(1)}`); }

    if (latestBP.systolic !== null) {
      if (latestBP.systolic >= 160) { probability += 0.15; factors.push('Stage 2 hypertension'); }
      else if (latestBP.systolic >= 140) { probability += 0.10; factors.push('Stage 1 hypertension'); }
      else if (latestBP.systolic >= 130) { probability += 0.05; factors.push('Elevated BP'); }
    }

    if (bpTrend === 'RISING') { probability += 0.08; factors.push('Rising BP trend'); }

    probability = Math.min(probability, 0.90);
    return {
      type: 'HYPERTENSION_RISK',
      title: hasHTN ? 'Hypertension Control Risk' : 'Hypertension Onset Risk',
      description: hasHTN
        ? `Risk of uncontrolled hypertension or progression to resistant hypertension.`
        : `Risk of developing hypertension based on current risk factor profile.`,
      probability: Math.round(probability * 100) / 100,
      timeframe: hasHTN ? '6 months' : '1 year',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        'Home BP monitoring — log readings twice daily',
        hasHTN ? 'Antihypertensive medication review' : 'Lifestyle modification — DASH diet',
        'Sodium restriction < 2g/day',
        'Regular aerobic exercise 30 min/day',
        'Stress management techniques',
        'Weight management if overweight',
        'Annual renal function and electrolyte panel',
      ],
    };
  }

  private predictKidneyDisease(
    age: number | null, ageGroup: string, hasKidney: boolean,
    hasDiabetes: boolean, hasHTN: boolean, hasCVD: boolean, bmi: number | null,
  ): Prediction | null {
    let probability = hasKidney ? 0.15 : 0.02;
    const factors: string[] = [];

    if (hasKidney) factors.push('Existing kidney disease');
    if (hasDiabetes) { probability += 0.20; factors.push('Diabetes — leading CKD cause'); }
    if (hasHTN) { probability += 0.15; factors.push('Hypertension'); }
    if (hasCVD) { probability += 0.08; factors.push('Cardiovascular disease'); }
    if (age !== null && age >= 65) { probability += 0.10; factors.push('Age ≥ 65'); }
    if (age !== null && age >= 55) { probability += 0.05; factors.push('Age 55-64'); }
    if (bmi !== null && bmi >= 30) { probability += 0.05; factors.push('Obesity'); }

    probability = Math.min(probability, 0.80);
    return {
      type: 'KIDNEY_DISEASE',
      title: hasKidney ? 'CKD Progression Risk' : 'Chronic Kidney Disease Risk',
      description: hasKidney
        ? `Risk of CKD progression to advanced stages based on comorbidity burden.`
        : `Risk of developing chronic kidney disease given metabolic and cardiovascular risk factors.`,
      probability: Math.round(probability * 100) / 100,
      timeframe: hasKidney ? '1 year' : '5 years',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        'eGFR and UACR testing annually (every 6 months if high risk)',
        'BP target < 130/80 mmHg',
        'ACE inhibitor or ARB if proteinuria present',
        'Avoid nephrotoxic medications (NSAIDs)',
        'Glycemic control optimization if diabetic',
        'Dietary counseling — renal-friendly diet',
      ],
    };
  }

  private predictRespiratoryDecline(
    age: number | null, ageGroup: string, hasCOPD: boolean,
    smoking: boolean, spo2: number | null, bmi: number | null,
    lifestyle: { smokingStatus?: string } | null,
  ): Prediction | null {
    let probability = hasCOPD ? 0.10 : 0.02;
    const factors: string[] = [];

    if (hasCOPD) { probability += 0.20; factors.push('COPD/respiratory disease'); }
    if (smoking) { probability += 0.20; factors.push('Current smoker'); }
    else if (smoking === false && lifestyle?.smokingStatus === 'FORMER') {
      probability += 0.05; factors.push('Former smoker');
    }
    if (age !== null && age >= 65) { probability += 0.10; factors.push('Age ≥ 65'); }
    else if (age !== null && age >= 55) { probability += 0.05; factors.push('Age 55-64'); }

    if (spo2 !== null && spo2 <= 92) { probability += 0.15; factors.push(`Low SpO2 (${spo2}%)`); }
    else if (spo2 !== null && spo2 <= 95) { probability += 0.05; factors.push(`Borderline SpO2 (${spo2}%)`); }

    if (bmi !== null && bmi >= 30) { probability += 0.05; factors.push('Obesity — restrictive lung disease risk'); }

    probability = Math.min(probability, 0.80);
    return {
      type: 'RESPIRATORY_DECLINE',
      title: hasCOPD ? 'Respiratory Decline Risk' : 'COPD Onset Risk',
      description: hasCOPD
        ? `Risk of acute exacerbation or FEV1 decline in the next year.`
        : `Risk of developing chronic respiratory disease based on smoking history and pulmonary function indicators.`,
      probability: Math.round(probability * 100) / 100,
      timeframe: hasCOPD ? '6 months' : '5 years',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        smoking ? 'Smoking cessation — pulmonary rehab referral' : null,
        'Spirometry testing annually',
        'Pneumococcal and influenza vaccination',
        'Pulmonary rehabilitation program',
        'Oxygen saturation monitoring',
      ].filter((r): r is string => r !== null),
    };
  }

  private predictMentalHealth(
    age: number | null, ageGroup: string, hasMental: boolean,
    highStress: boolean, poorSleep: boolean, lifestyle: { activityLevel?: string; alcoholConsumption?: string } | null,
  ): Prediction | null {
    let probability = hasMental ? 0.10 : 0.03;
    const factors: string[] = [];

    if (hasMental) { probability += 0.20; factors.push('Existing mental health condition'); }
    if (highStress) { probability += 0.15; factors.push('High/severe stress level'); }
    if (poorSleep) { probability += 0.10; factors.push('Poor sleep (< 6h avg)'); }
    if (lifestyle?.activityLevel === 'SEDENTARY') { probability += 0.05; factors.push('Sedentary lifestyle'); }
    if (lifestyle?.alcoholConsumption === 'HEAVY') { probability += 0.10; factors.push('Heavy alcohol use'); }
    if (age !== null && age >= 65) { probability += 0.05; factors.push('Age ≥ 65 — social isolation risk'); }

    probability = Math.min(probability, 0.75);
    return {
      type: 'MENTAL_HEALTH',
      title: hasMental ? 'Mental Health Deterioration Risk' : 'Mental Health Onset Risk',
      description: hasMental
        ? `Risk of symptom exacerbation or acute episode in the next 6 months.`
        : `Risk of developing depression or anxiety based on lifestyle and stress indicators.`,
      probability: Math.round(probability * 100) / 100,
      timeframe: '6 months',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        hasMental ? 'Regular psychiatric follow-up' : 'PHQ-9 and GAD-7 screening',
        'Stress management and mindfulness program',
        'Sleep hygiene optimization',
        'Physical activity — 30 min/day shown to improve mood',
        'Social connection and support group referral',
        'Consider therapy or counseling',
      ],
    };
  }

  private predictFallRisk(
    age: number | null, ageGroup: string, conditions: { displayName: string }[],
    vitals: { bpSystolic?: number | null } | null, lifestyle: { activityLevel?: string } | null,
  ): Prediction | null {
    let probability = 0.02;
    const factors: string[] = [];

    if (age !== null && age >= 80) { probability += 0.25; factors.push('Age ≥ 80'); }
    else if (age !== null && age >= 65) { probability += 0.15; factors.push('Age ≥ 65'); }
    else if (age !== null && age >= 50) { probability += 0.05; factors.push('Age 50-64'); }

    const parkinson = conditions.some(c => /parkinson/i.test(c.displayName));
    const dementia = conditions.some(c => /dementia|alzheimer/i.test(c.displayName));
    const stroke = conditions.some(c => /stroke|cva|hemiparesis/i.test(c.displayName));
    const osteoporosis = conditions.some(c => /osteoporosis/i.test(c.displayName));
    const neuropathy = conditions.some(c => /neuropathy|peripheral/i.test(c.displayName));
    const vision = conditions.some(c => /glaucoma|cataract|vision|blind/i.test(c.displayName));
    const arthritis = conditions.some(c => /arthritis|osteoarthritis/i.test(c.displayName));

    if (parkinson) { probability += 0.20; factors.push('Parkinson disease'); }
    if (dementia) { probability += 0.15; factors.push('Dementia/cognitive impairment'); }
    if (stroke) { probability += 0.15; factors.push('History of stroke'); }
    if (osteoporosis) { probability += 0.10; factors.push('Osteoporosis'); }
    if (neuropathy) { probability += 0.10; factors.push('Peripheral neuropathy'); }
    if (vision) { probability += 0.08; factors.push('Vision impairment'); }
    if (arthritis) { probability += 0.05; factors.push('Arthritis/mobility limitation'); }

    if (vitals?.bpSystolic !== null && vitals?.bpSystolic !== undefined && vitals.bpSystolic < 100) {
      probability += 0.05; factors.push('Hypotension');
    }
    if (lifestyle?.activityLevel === 'SEDENTARY') { probability += 0.05; factors.push('Sedentary — deconditioned'); }

    probability = Math.min(probability, 0.90);
    return {
      type: 'FALL_RISK',
      title: 'Fall Risk Assessment',
      description: `Risk of experiencing a fall event based on age, mobility, and neurological factors.`,
      probability: Math.round(probability * 100) / 100,
      timeframe: age !== null && age >= 65 ? '30 days' : '6 months',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        'Comprehensive fall risk assessment (Timed Up and Go test)',
        'Home safety evaluation',
        'Physical therapy — balance and strength training',
        'Vitamin D and calcium supplementation if osteoporotic',
        'Vision assessment and corrective lenses update',
        'Review medications for fall-risk increasing drugs',
        'Assistive device evaluation (cane/walker)',
      ],
    };
  }

  private predictReadmissionRisk(
    age: number | null, ageGroup: string, activeConditions: { displayName: string; icdCode?: string }[],
    hasCVD: boolean, hasDiabetes: boolean, hasCOPD: boolean,
    hasKidney: boolean, hasCancer: boolean, hasMental: boolean,
  ): Prediction | null {
    let probability = 0.05;
    const factors: string[] = [];

    if (age !== null && age >= 75) { probability += 0.10; factors.push('Age ≥ 75'); }
    else if (age !== null && age >= 65) { probability += 0.05; factors.push('Age ≥ 65'); }

    const numConditions = activeConditions.length;
    if (numConditions >= 5) { probability += 0.20; factors.push(`Polymorbidity (${numConditions} conditions)`); }
    else if (numConditions >= 3) { probability += 0.10; factors.push(`Multimorbidity (${numConditions} conditions)`); }
    else if (numConditions >= 2) { probability += 0.05; factors.push(`${numConditions} comorbid conditions`); }

    if (hasCVD) { probability += 0.10; factors.push('Cardiovascular disease'); }
    if (hasCOPD) { probability += 0.10; factors.push('COPD'); }
    if (hasKidney) { probability += 0.10; factors.push('Kidney disease'); }
    if (hasCancer) { probability += 0.08; factors.push('Active cancer'); }
    if (hasMental) { probability += 0.08; factors.push('Mental health condition'); }
    if (hasDiabetes) { probability += 0.05; factors.push('Diabetes'); }

    probability = Math.min(probability, 0.80);
    return {
      type: 'READMISSION_RISK',
      title: 'Hospital Readmission Risk',
      description: `Predicted risk of 30-day hospital readmission based on comorbidity burden and age.`,
      probability: Math.round(probability * 100) / 100,
      timeframe: '30 days',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        'Transitional care management program',
        'Follow-up appointment within 48 hours of discharge',
        'Medication reconciliation and adherence support',
        'Home health referral for monitoring',
        'Patient education on warning signs',
        'Care coordination across specialists',
      ],
    };
  }

  private predictMedicationNonAdherence(
    age: number | null, ageGroup: string, hasMental: boolean,
    conditionCount: number, sedentary: boolean, lifestyle: { smokingStatus?: string; alcoholConsumption?: string } | null,
  ): Prediction | null {
    let probability = 0.05;
    const factors: string[] = [];

    if (hasMental) { probability += 0.20; factors.push('Mental health condition — higher non-adherence risk'); }
    if (conditionCount >= 5) { probability += 0.15; factors.push('Complex polypharmacy regimen'); }
    else if (conditionCount >= 3) { probability += 0.10; factors.push('Multiple chronic conditions'); }
    if (age !== null && age >= 75) { probability += 0.10; factors.push('Age ≥ 75 — cognitive/access barriers'); }
    else if (age !== null && age < 30) { probability += 0.08; factors.push('Younger age — lifestyle interference'); }
    if (lifestyle?.smokingStatus === 'CURRENT') { probability += 0.05; factors.push('Smoking — risk behavior cluster'); }
    if (lifestyle?.alcoholConsumption === 'HEAVY') { probability += 0.08; factors.push('Heavy alcohol use'); }

    probability = Math.min(probability, 0.75);
    return {
      type: 'MEDICATION_NON_ADHERENCE',
      title: 'Medication Non-Adherence Risk',
      description: `Predicted risk of medication non-adherence leading to suboptimal treatment outcomes.`,
      probability: Math.round(probability * 100) / 100,
      timeframe: '30 days',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        'Simplify medication regimen — once-daily dosing where possible',
        'Blister packaging or pill organizer',
        'Medication synchronization — align refill dates',
        'Mobile app reminders or automated calling system',
        'Involve caregiver or family member',
        'Monthly medication review and reconciliation',
      ],
    };
  }

  private predictFrailty(
    age: number | null, ageGroup: string, activeConditions: { displayName: string }[],
    lifestyle: { activityLevel?: string; sleepHoursAvg?: number | null; smokingStatus?: string } | null, bmi: number | null,
  ): Prediction | null {
    let probability = 0.03;
    const factors: string[] = [];

    if (age !== null && age >= 85) { probability += 0.25; factors.push('Age ≥ 85'); }
    else if (age !== null && age >= 75) { probability += 0.20; factors.push('Age ≥ 75'); }
    else if (age !== null && age >= 65) { probability += 0.10; factors.push('Age ≥ 65'); }

    const numConditions = activeConditions.length;
    if (numConditions >= 5) { probability += 0.15; factors.push('Polymorbidity'); }
    else if (numConditions >= 3) { probability += 0.10; factors.push('Multimorbidity'); }

    if (lifestyle?.activityLevel === 'SEDENTARY') { probability += 0.15; factors.push('Sedentary — severely inactive'); }
    else if (lifestyle?.activityLevel === 'LIGHT') { probability += 0.05; factors.push('Low activity level'); }

    const sleepHours = lifestyle?.sleepHoursAvg ?? null;
    if (sleepHours !== null && sleepHours < 5) { probability += 0.08; factors.push('Severe sleep deprivation'); }
    else if (sleepHours !== null && sleepHours < 6) { probability += 0.03; factors.push('Insufficient sleep'); }

    if (bmi !== null && bmi < 18.5) { probability += 0.10; factors.push('Underweight — malnutrition risk'); }
    if (lifestyle?.smokingStatus === 'CURRENT') { probability += 0.05; factors.push('Smoking'); }

    probability = Math.min(probability, 0.85);
    return {
      type: 'FRAILTY',
      title: 'Frailty Syndrome Risk',
      description: `Risk of frailty syndrome (reduced physiologic reserve, increased vulnerability to stressors).`,
      probability: Math.round(probability * 100) / 100,
      timeframe: '1 year',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        'Comprehensive geriatric assessment',
        'Physical therapy — resistance and balance training',
        'Nutritional assessment and protein supplementation',
        'Social support evaluation',
        'Medication deprescribing review',
        'Annual cognitive and functional screening',
      ],
    };
  }

  private predictMortality(
    age: number | null, ageGroup: string, activeConditions: { displayName: string }[],
    lifestyle: { smokingStatus?: string } | null, bmi: number | null, latestBP: { systolic: number | null; diastolic: number | null },
    smoking: boolean,
  ): Prediction | null {
    let probability = 0.01;
    const factors: string[] = [];

    if (age !== null && age >= 85) { probability += 0.15; factors.push('Age ≥ 85'); }
    else if (age !== null && age >= 75) { probability += 0.08; factors.push('Age ≥ 75'); }
    else if (age !== null && age >= 65) { probability += 0.03; factors.push('Age ≥ 65'); }

    const numConditions = activeConditions.length;
    if (numConditions >= 5) { probability += 0.10; factors.push('Severe polymorbidity'); }
    else if (numConditions >= 3) { probability += 0.05; factors.push('Multiple comorbidities'); }

    const hasCancer = activeConditions.some(c => /cancer|malignancy|metasta/i.test(c.displayName));
    const hasCVD = activeConditions.some(c => /heart.failure|cardiomyopathy|severe.cad/i.test(c.displayName));
    const hasCOPD = activeConditions.some(c => /copd|emphysema|severe.asthma/i.test(c.displayName));
    const hasKidney = activeConditions.some(c => /esrd|dialysis|stage.?[45]|ckd.?[45]/i.test(c.displayName));

    if (hasCancer) { probability += 0.15; factors.push('Active malignancy'); }
    if (hasCVD) { probability += 0.10; factors.push('Severe cardiovascular disease'); }
    if (hasCOPD) { probability += 0.08; factors.push('Severe respiratory disease'); }
    if (hasKidney) { probability += 0.10; factors.push('End-stage kidney disease'); }

    if (smoking) { probability += 0.05; factors.push('Current smoker'); }
    if (bmi !== null && bmi >= 35) { probability += 0.03; factors.push('Severe obesity'); }
    else if (bmi !== null && bmi < 16) { probability += 0.05; factors.push('Severe underweight'); }

    if (latestBP.systolic !== null && latestBP.systolic >= 180) { probability += 0.03; factors.push('Hypertensive crisis'); }

    probability = Math.min(probability, 0.50);
    return {
      type: 'MORTALITY',
      title: 'Mortality Risk',
      description: `Predicted all-cause mortality risk over a 5-year horizon based on age, comorbidity burden, and lifestyle factors.`,
      probability: Math.round(probability * 100) / 100,
      timeframe: '5 years',
      riskLevel: this.probabilityToRiskLevel(probability),
      factors: [...new Set(factors)],
      recommendations: [
        'Advance care planning discussion',
        'Palliative care referral if appropriate',
        'Optimize management of chronic conditions',
        'Ensure medication safety and deprescribing',
        'Social and spiritual support services',
      ],
    };
  }

  private matchCondition(conditions: { displayName: string; icdCode?: string | null }[], pattern: RegExp): boolean {
    return conditions.some(c => pattern.test(c.displayName) || (c.icdCode && pattern.test(c.icdCode)));
  }

  private computeBPTrend(vitalsHistory: { bpSystolic?: number | null }[]): string {
    if (vitalsHistory.length < 3) return 'STABLE';
    const recent = vitalsHistory.slice(0, 3).map(v => v.bpSystolic ?? 120) as [number, number, number];
    const increasing = recent[0] >= recent[1] && recent[1] >= recent[2];
    const decreasing = recent[0] <= recent[1] && recent[1] <= recent[2];
    if (increasing) return 'RISING';
    if (decreasing) return 'FALLING';
    return 'STABLE';
  }

  private probabilityToRiskLevel(probability: number): string {
    const score = probability * 100;
    if (score <= 24) return 'LOW';
    if (score <= 49) return 'MODERATE';
    if (score <= 74) return 'HIGH';
    return 'CRITICAL';
  }

  private buildDescription(event: string, probability: number, age: number | null): string {
    const level = this.probabilityToRiskLevel(probability);
    const ageStr = age !== null ? ` for a ${age}-year-old patient` : '';
    return `Predicted ${level.toLowerCase()} risk of ${event}${ageStr}. Current probability: ${(probability * 100).toFixed(0)}%.`;
  }

  private calcAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }
}
