/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/engines/risk-engine-v4.service.ts
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
 - crypto
 *
 * Dependencies:
 - common
 - crypto
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
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../providers/prisma/prisma.service';

interface RiskAssessment {
  riskScore: number;
  riskLevel: string;
  drivers: string[];
  recommendedActions: string[];
}

interface RiskAssessments {
  [riskType: string]: RiskAssessment;
}

@Injectable()
export class RiskEngineV4Service {
  private readonly logger = new Logger(RiskEngineV4Service.name);

  constructor(private readonly prisma: PrismaService) {}

  async assess(userId: string): Promise<RiskAssessments> {
    const [user, conditions, vitals, wearables, lifestyle, familyHistory, medicationAdmins, clinicalOrders, symptoms] =
      await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.condition.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
        this.prisma.vitalsRecord.findFirst({ where: { patientId: userId }, orderBy: { recordedAt: 'desc' } }),
        this.prisma.wearableMetric.findMany({
          where: { userId, recordedAt: { gte: new Date(Date.now() - 7 * 86400000) } },
          orderBy: { recordedAt: 'desc' },
        }),
        this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
        this.prisma.familyHistory.findMany({ where: { userId } }),
        this.prisma.medicationAdministration.findMany({
          where: { patientId: userId, scheduledTime: { gte: new Date(Date.now() - 90 * 86400000) } },
        }),
        this.prisma.clinicalOrder.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
        this.prisma.symptomEvent.findMany({ where: { userId, resolvedAt: null } }),
      ]);

    const age = user?.dateOfBirth ? this.calcAge(user.dateOfBirth) : null;
    const latestBP = vitals ? { systolic: vitals.bpSystolic, diastolic: vitals.bpDiastolic } : null;
    const heartRate = vitals?.heartRate ?? null;
    const bmi = vitals?.bmi ?? null;
    const recentWearableBP = wearables.filter(w => w.metricType === 'BLOOD_PRESSURE');
    const recentWearableGlucose = wearables.filter(w => w.metricType === 'GLUCOSE').map(w => w.value);

    const hasDiabetes = conditions.some(c => /diabetes|dm|type.?[12]/i.test(c.displayName));
    const hasHypertension = conditions.some(c => /hypertension|htn|bp|blood.pressure/i.test(c.displayName));
    const hasCVD = conditions.some(c => /heart|cardiac|chd|cad|afib|arrhythmia|failure|cva|stroke/i.test(c.displayName));
    const hasCOPD = conditions.some(c => /copd|asthma|respiratory|lung/i.test(c.displayName));
    const hasKidney = conditions.some(c => /kidney|renal|ckd|nephropathy/i.test(c.displayName));
    const hasCancer = conditions.some(c => /cancer|malignancy|carcinoma|leukemia|lymphoma/i.test(c.displayName));
    const hasMentalHealth = conditions.some(c => /depression|anxiety|bipolar|schizophrenia|mental/i.test(c.displayName));
    const hasObesity = conditions.some(c => /obes|overweight|bmi/i.test(c.displayName)) || (bmi !== null && bmi > 30);

    const familyCVD = familyHistory.some(f => /heart|cardiac|stroke|mi|heart.attack|cvd/i.test(f.condition));
    const familyDiabetes = familyHistory.some(f => /diabetes|dm/i.test(f.condition));
    const familyHypertension = familyHistory.some(f => /hypertension|bp|blood.pressure/i.test(f.condition));

    const smoking = lifestyle?.smokingStatus === 'CURRENT';
    const heavyAlcohol = lifestyle?.alcoholConsumption === 'HEAVY';
    const sedentary = lifestyle?.activityLevel === 'SEDENTARY';
    const highStress = lifestyle?.stressLevel === 'HIGH' || lifestyle?.stressLevel === 'SEVERE';

    const activeSymptoms = symptoms.map(s => s.symptom);
    const chestPain = activeSymptoms.some(s => /chest.pain|angina|palpitations/i.test(s));
    const dyspnea = activeSymptoms.some(s => /sob|dyspnea|breathless|shortness.of.breath/i.test(s));
    const fallSymptoms = activeSymptoms.some(s => /dizziness|vertigo|faint|fall|unsteady/i.test(s));
    const fatigue = activeSymptoms.some(s => /fatigue|tired|weakness|exhaustion/i.test(s));

    const medAdminCount = medicationAdmins.length;
    const medAdminTaken = medicationAdmins.filter(m => m.status === 'ADMINISTERED').length;
    const adherenceRate = medAdminCount > 0 ? (medAdminTaken / medAdminCount) * 100 : 100;

    const assessments: RiskAssessments = {
      CARDIOVASCULAR: this.computeCardiovascularRisk(
        age, hasCVD, hasDiabetes, hasHypertension, hasObesity,
        familyCVD, smoking, sedentary, latestBP, heartRate, bmi, chestPain, dyspnea, adherenceRate,
      ),
      DIABETES: this.computeDiabetesRisk(
        age, hasDiabetes, hasObesity, familyDiabetes, sedentary,
        recentWearableGlucose, lifestyle?.dietType, bmi, adherenceRate,
      ),
      HYPERTENSION: this.computeHypertensionRisk(
        age, hasHypertension, hasDiabetes, hasCVD, hasKidney,
        familyHypertension, latestBP, recentWearableBP, smoking, highStress, sedentary, heavyAlcohol, bmi, adherenceRate,
      ),
      FALL: this.computeFallRisk(
        age, conditions, fallSymptoms, dyspnea, vitals, lifestyle ? { activityLevel: lifestyle.activityLevel ?? undefined } : null,
      ),
      READMISSION: this.computeReadmissionRisk(
        age, conditions, clinicalOrders, medAdminCount, medicationAdmins,
        hasCVD, hasDiabetes, hasCOPD, hasKidney, hasCancer, hasMentalHealth, adherenceRate,
      ),
      FRAILTY: this.computeFrailtyRisk(
        age, conditions, lifestyle ? { activityLevel: lifestyle.activityLevel ?? undefined, sleepHoursAvg: lifestyle.sleepHoursAvg, dietType: lifestyle.dietType } : null, vitals, fatigue, fallSymptoms,
        activeSymptoms.length, adherenceRate,
      ),
    };

    return assessments;
  }

  async saveAssessments(userId: string, results: RiskAssessments): Promise<void> {
    const twin = await this.prisma.digitalTwin.findUnique({ where: { userId } });
    const twinId = twin?.id ?? null;

    const now = new Date();
    const riskTypes = Object.keys(results);

    await this.prisma.riskPrediction.deleteMany({
      where: { userId, riskType: { in: riskTypes } },
    });

    await this.prisma.riskPrediction.createMany({
      data: riskTypes.map(type => {
        const assessment = results[type]!;
        return {
          id: randomUUID(),
          userId,
          twinId,
          riskType: type,
          riskScore: assessment.riskScore,
          riskLevel: assessment.riskLevel,
          drivers: assessment.drivers,
          recommendedActions: assessment.recommendedActions,
          calculatedAt: now,
          expiresAt: new Date(now.getTime() + 7 * 86400000),
        };
      }),
    });
  }

  private computeCardiovascularRisk(
    age: number | null, hasCVD: boolean, hasDiabetes: boolean, hasHTN: boolean, hasObesity: boolean,
    familyCVD: boolean, smoking: boolean, sedentary: boolean,
    latestBP: { systolic: number | null; diastolic: number | null } | null,
    heartRate: number | null, bmi: number | null,
    chestPain: boolean, dyspnea: boolean, adherenceRate: number,
  ): RiskAssessment {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    if (age !== null) {
      if (age >= 65) { score += 20; drivers.push('Age ≥ 65'); }
      else if (age >= 55) { score += 15; drivers.push('Age ≥ 55'); }
      else if (age >= 45) { score += 10; drivers.push('Age ≥ 45'); }
    }
    if (hasCVD) { score += 25; drivers.push('Existing cardiovascular disease'); }
    if (hasDiabetes) { score += 15; drivers.push('Diabetes present'); }
    if (hasHTN) { score += 10; drivers.push('Hypertension present'); }
    if (hasObesity) { score += 8; drivers.push('Obesity/overweight'); }
    if (familyCVD) { score += 8; drivers.push('Family history of CVD'); }
    if (smoking) { score += 12; drivers.push('Current smoker'); }
    if (sedentary) { score += 5; drivers.push('Sedentary lifestyle'); }

    if (latestBP?.systolic !== null && latestBP?.systolic !== undefined) {
      if (latestBP.systolic >= 160) { score += 10; drivers.push('BP ≥ 160 systolic'); }
      else if (latestBP.systolic >= 140) { score += 5; drivers.push('BP ≥ 140 systolic'); }
    }
    if (bmi !== null && bmi >= 30) { score += 5; drivers.push(`BMI ${bmi.toFixed(1)} (obese)`); }
    if (chestPain) { score += 10; drivers.push('Active chest pain/palpitations'); }
    if (dyspnea) { score += 5; drivers.push('Shortness of breath'); }
    if (adherenceRate < 80) { score += 5; drivers.push('Low medication adherence'); }

    if (hasCVD || (score >= 50)) actions.push('Immediate cardiology referral');
    if (!hasCVD) actions.push('Annual lipid profile and cardiac risk assessment');
    if (smoking) actions.push('Smoking cessation program');
    if (sedentary) actions.push('Cardiac rehabilitation or structured exercise program');
    if (bmi !== null && bmi >= 30) actions.push('Weight management program');
    if (hasDiabetes) actions.push('Optimize glycemic control to reduce CV risk');
    actions.push('Monitor BP weekly');

    score = Math.min(Math.max(score, 0), 100);
    return { riskScore: score, riskLevel: this.toRiskLevel(score), drivers: [...new Set(drivers)], recommendedActions: [...new Set(actions)] };
  }

  private computeDiabetesRisk(
    age: number | null, hasDiabetes: boolean, hasObesity: boolean, familyDiabetes: boolean,
    sedentary: boolean, recentGlucose: number[], dietType: string | null | undefined,
    bmi: number | null, adherenceRate: number,
  ): RiskAssessment {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    if (age !== null) {
      if (age >= 65) { score += 15; drivers.push('Age ≥ 65'); }
      else if (age >= 45) { score += 10; drivers.push('Age ≥ 45'); }
    }
    if (hasDiabetes) { score += 30; drivers.push('Existing diabetes diagnosis'); }
    else if (familyDiabetes) { score += 15; drivers.push('Family history of diabetes'); }
    if (hasObesity) { score += 10; drivers.push('Obesity/overweight'); }
    if (sedentary) { score += 8; drivers.push('Sedentary lifestyle'); }
    if (dietType === 'NON_VEG' || dietType === null) { score += 5; drivers.push('Dietary risk factor'); }
    if (bmi !== null && bmi >= 25 && bmi < 30) { score += 5; drivers.push(`BMI ${bmi.toFixed(1)} (overweight)`); }
    if (bmi !== null && bmi >= 30) { score += 10; drivers.push(`BMI ${bmi.toFixed(1)} (obese)`); }

    if (recentGlucose.length > 0) {
      const avgGlucose = recentGlucose.reduce((a, b) => a + b, 0) / recentGlucose.length;
      if (avgGlucose >= 200) { score += 20; drivers.push(`Avg glucose ${avgGlucose.toFixed(0)} mg/dL`); }
      else if (avgGlucose >= 126) { score += 15; drivers.push(`Avg glucose ${avgGlucose.toFixed(0)} mg/dL`); }
      else if (avgGlucose >= 100) { score += 5; drivers.push('Impaired fasting glucose'); }
    }

    if (adherenceRate < 80) { score += 5; drivers.push('Low medication adherence'); }

    if (hasDiabetes) actions.push('Endocrinology follow-up every 3 months');
    actions.push('HbA1c test every 3 months');
    if (!hasDiabetes && (score >= 30)) actions.push('Fasting blood glucose screening');
    actions.push('Dietary counseling and nutrition plan');
    actions.push('Structured exercise program — 150 min/week');
    if (bmi !== null && bmi >= 25) actions.push('Weight loss target — 5-7% of body weight');
    if (recentGlucose.length === 0) actions.push('Consider continuous glucose monitoring');

    score = Math.min(Math.max(score, 0), 100);
    return { riskScore: score, riskLevel: this.toRiskLevel(score), drivers: [...new Set(drivers)], recommendedActions: [...new Set(actions)] };
  }

  private computeHypertensionRisk(
    age: number | null, hasHTN: boolean, hasDiabetes: boolean, hasCVD: boolean, hasKidney: boolean,
    familyHTN: boolean, latestBP: { systolic: number | null; diastolic: number | null } | null,
    recentBP: { value: number }[], smoking: boolean, highStress: boolean, sedentary: boolean,
    heavyAlcohol: boolean, bmi: number | null, adherenceRate: number,
  ): RiskAssessment {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    if (age !== null) {
      if (age >= 65) { score += 15; drivers.push('Age ≥ 65'); }
      else if (age >= 55) { score += 10; drivers.push('Age ≥ 55'); }
    }
    if (hasHTN) { score += 25; drivers.push('Existing hypertension'); }
    if (hasDiabetes) { score += 10; drivers.push('Diabetes present (compounding risk)'); }
    if (hasCVD) { score += 10; drivers.push('Cardiovascular disease present'); }
    if (hasKidney) { score += 10; drivers.push('Kidney disease present'); }
    if (familyHTN) { score += 5; drivers.push('Family history of hypertension'); }
    if (smoking) { score += 8; drivers.push('Current smoker'); }
    if (highStress) { score += 5; drivers.push('High stress level'); }
    if (sedentary) { score += 5; drivers.push('Sedentary lifestyle'); }
    if (heavyAlcohol) { score += 5; drivers.push('Heavy alcohol consumption'); }
    if (bmi !== null && bmi >= 30) { score += 5; drivers.push('Obesity'); }

    if (latestBP?.systolic !== null && latestBP?.systolic !== undefined) {
      if (latestBP.systolic >= 180) { score += 20; drivers.push(`Critical BP: ${latestBP.systolic}/${latestBP.diastolic ?? '?'}`); }
      else if (latestBP.systolic >= 160) { score += 15; drivers.push(`BP ≥ 160 systolic`); }
      else if (latestBP.systolic >= 140) { score += 10; drivers.push(`BP ≥ 140 systolic`); }
      else if (latestBP.systolic >= 130) { score += 5; drivers.push('BP 130-139 systolic (elevated)'); }
    }
    if (latestBP?.diastolic !== null && latestBP?.diastolic !== undefined && latestBP.diastolic >= 90) {
      score += 5; drivers.push(`Diastolic BP ≥ 90`);
    }

    if (adherenceRate < 80) { score += 5; drivers.push('Low medication adherence'); }

    if (hasHTN || hasCVD || hasKidney) actions.push('Regular nephrology and cardiology follow-up');
    if (!hasHTN) actions.push('BP monitoring twice weekly');
    if (latestBP?.systolic !== null && latestBP?.systolic !== undefined && latestBP.systolic >= 140) {
      actions.push('Immediate antihypertensive therapy review');
    }
    if (highStress) actions.push('Stress management and relaxation techniques');
    if (sedentary) actions.push('Graduated aerobic exercise — start with walking');
    if (heavyAlcohol) actions.push('Alcohol reduction counseling');
    actions.push('DASH diet education');
    actions.push('Sodium intake < 2g/day');

    score = Math.min(Math.max(score, 0), 100);
    return { riskScore: score, riskLevel: this.toRiskLevel(score), drivers: [...new Set(drivers)], recommendedActions: [...new Set(actions)] };
  }

  private computeFallRisk(
    age: number | null, conditions: { displayName: string }[], fallSymptoms: boolean, dyspnea: boolean,
    vitals: { bpSystolic?: number | null } | null, lifestyle: { activityLevel?: string } | null,
  ): RiskAssessment {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    if (age !== null) {
      if (age >= 80) { score += 25; drivers.push('Age ≥ 80'); }
      else if (age >= 65) { score += 20; drivers.push('Age ≥ 65'); }
      else if (age >= 50) { score += 10; drivers.push('Age ≥ 50'); }
    }

    const hasParkinson = conditions.some(c => /parkinson|pd/i.test(c.displayName));
    const hasDementia = conditions.some(c => /dementia|alzheimer|cognitive/i.test(c.displayName));
    const hasStroke = conditions.some(c => /stroke|cva|hemiparesis/i.test(c.displayName));
    const hasArthritis = conditions.some(c => /arthritis|osteoarthritis|rheumatoid/i.test(c.displayName));
    const hasOsteoporosis = conditions.some(c => /osteoporosis|osteopenia/i.test(c.displayName));
    const hasVision = conditions.some(c => /glaucoma|cataract|vision|blind|retinopathy/i.test(c.displayName));
    const hasNeuropathy = conditions.some(c => /neuropathy|peripheral.neuropathy/i.test(c.displayName));

    if (hasParkinson) { score += 20; drivers.push('Parkinson disease'); }
    if (hasDementia) { score += 15; drivers.push('Cognitive impairment'); }
    if (hasStroke) { score += 15; drivers.push('History of stroke/CVA'); }
    if (hasArthritis) { score += 5; drivers.push('Arthritis — mobility limitation'); }
    if (hasOsteoporosis) { score += 10; drivers.push('Osteoporosis — fracture risk'); }
    if (hasVision) { score += 8; drivers.push('Vision impairment'); }
    if (hasNeuropathy) { score += 10; drivers.push('Peripheral neuropathy'); }

    if (fallSymptoms) { score += 15; drivers.push('Dizziness/vertigo/unsteadiness'); }
    if (dyspnea) { score += 5; drivers.push('Shortness of breath on exertion'); }

    const activityLevel = lifestyle?.activityLevel ?? null;
    if (activityLevel === 'SEDENTARY') { score += 5; drivers.push('Sedentary — reduced muscle strength'); }

    if (vitals?.bpSystolic !== null && vitals?.bpSystolic !== undefined && vitals.bpSystolic < 100) {
      score += 5; drivers.push('Hypotension risk');
    }

    if (age !== null && age >= 65) actions.push('Fall risk assessment with timed up-and-go test');
    actions.push('Home safety evaluation — remove tripping hazards');
    if (hasOsteoporosis || (age !== null && age >= 65)) actions.push('Vitamin D and calcium supplementation');
    if (hasVision) actions.push('Vision assessment and corrective lenses');
    actions.push('Balance and strength training — tai chi or physiotherapy');
    if (hasNeuropathy) actions.push('Foot care education and proper footwear');

    score = Math.min(Math.max(score, 0), 100);
    return { riskScore: score, riskLevel: this.toRiskLevel(score), drivers: [...new Set(drivers)], recommendedActions: [...new Set(actions)] };
  }

  private computeReadmissionRisk(
    age: number | null, conditions: { displayName: string }[], clinicalOrders: { orderType?: string; title?: string }[],
    medAdminCount: number, medicationAdmins: { status?: string }[],
    hasCVD: boolean, hasDiabetes: boolean, hasCOPD: boolean, hasKidney: boolean,
    hasCancer: boolean, hasMentalHealth: boolean, adherenceRate: number,
  ): RiskAssessment {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    if (age !== null) {
      if (age >= 75) { score += 15; drivers.push('Age ≥ 75'); }
      else if (age >= 65) { score += 10; drivers.push('Age ≥ 65'); }
    }

    const conditionCount = conditions.length;
    if (conditionCount >= 5) { score += 20; drivers.push(`${conditionCount} comorbid conditions`); }
    else if (conditionCount >= 3) { score += 10; drivers.push(`${conditionCount} comorbid conditions`); }

    if (hasCVD) { score += 10; drivers.push('Cardiovascular disease'); }
    if (hasCOPD) { score += 10; drivers.push('COPD/respiratory disease'); }
    if (hasDiabetes) { score += 8; drivers.push('Diabetes'); }
    if (hasKidney) { score += 10; drivers.push('Kidney disease'); }
    if (hasCancer) { score += 8; drivers.push('Active cancer'); }
    if (hasMentalHealth) { score += 8; drivers.push('Mental health condition'); }

    const hasRecentHospitalization = clinicalOrders.some(c => c.orderType === 'REFERRAL' || /inpatient|admit/i.test(c.title ?? ''));
    if (hasRecentHospitalization) { score += 10; drivers.push('Recent hospitalization/referral'); }

    const activeOrderCount = clinicalOrders.length;
    if (activeOrderCount > 3) { score += 5; drivers.push(`${activeOrderCount} active clinical orders`); }

    if (adherenceRate < 80) { score += 10; drivers.push('Low medication adherence (< 80%)'); }
    if (adherenceRate < 50) { score += 5; drivers.push('Critically low medication adherence'); }

    if (age !== null && age >= 65 && conditionCount >= 3) {
      actions.push('Transitional care management program');
    }
    actions.push('Structured discharge planning and follow-up within 48 hours');
    if (adherenceRate < 80) actions.push('Medication reconciliation and adherence support');
    actions.push('Patient education on red-flag symptoms and when to seek care');
    if (conditionCount >= 3) actions.push('Care coordination with specialist appointments');
    actions.push('Home health referral for post-discharge monitoring');

    score = Math.min(Math.max(score, 0), 100);
    return { riskScore: score, riskLevel: this.toRiskLevel(score), drivers: [...new Set(drivers)], recommendedActions: [...new Set(actions)] };
  }

  private computeFrailtyRisk(
    age: number | null, conditions: { displayName: string }[], lifestyle: { activityLevel?: string; sleepHoursAvg?: number | null; dietType?: string | null } | null, vitals: { bmi?: number | null; weight?: number | null } | null,
    fatigue: boolean, fallSymptoms: boolean, symptomCount: number, adherenceRate: number,
  ): RiskAssessment {
    let score = 0;
    const drivers: string[] = [];
    const actions: string[] = [];

    if (age !== null) {
      if (age >= 85) { score += 25; drivers.push('Age ≥ 85'); }
      else if (age >= 75) { score += 20; drivers.push('Age ≥ 75'); }
      else if (age >= 65) { score += 10; drivers.push('Age ≥ 65'); }
    }

    const conditionCount = conditions.length;
    if (conditionCount >= 5) { score += 15; drivers.push(`Polymorbidity (${conditionCount} conditions)`); }
    else if (conditionCount >= 3) { score += 10; drivers.push(`Multimorbidity (${conditionCount} conditions)`); }

    if (fatigue) { score += 10; drivers.push('Persistent fatigue/exhaustion'); }
    if (fallSymptoms) { score += 10; drivers.push('Dizziness/unsteady gait'); }

    const activityLevel = lifestyle?.activityLevel ?? null;
    if (activityLevel === 'SEDENTARY') { score += 10; drivers.push('Sedentary — severely inactive'); }
    else if (activityLevel === 'LIGHT') { score += 5; drivers.push('Low activity level'); }

    const sleepHours = lifestyle?.sleepHoursAvg ?? null;
    if (sleepHours !== null && sleepHours < 5) { score += 5; drivers.push(`Sleep ${sleepHours}h avg — insufficient`); }

    if (vitals?.bmi !== null && vitals?.bmi !== undefined) {
      if (vitals.bmi < 18.5) { score += 10; drivers.push(`Underweight BMI ${vitals.bmi}`); }
      else if (vitals.bmi >= 30) { score += 5; drivers.push(`Obesity BMI ${vitals.bmi}`); }
    }
    if (vitals?.weight !== null && vitals?.weight !== undefined && age !== null && age >= 65) {
      score += 5; drivers.push('Unintended weight change concern');
    }

    if (adherenceRate < 70) { score += 5; drivers.push('Low adherence — possible cognitive/access issues'); }

    const nutritionRisk = lifestyle?.dietType === null || lifestyle?.dietType === undefined;
    if (nutritionRisk) { score += 5; drivers.push('Unreported nutrition status'); }

    if (symptomCount > 3) { score += 5; drivers.push(`${symptomCount} active symptoms`); }

    actions.push('Comprehensive geriatric assessment');
    if (activityLevel === 'SEDENTARY') actions.push('Physical therapy and graded exercise program');
    actions.push('Nutritional assessment and supplementation if needed');
    if (fallSymptoms) actions.push('Fall prevention program and home safety assessment');
    actions.push('Social support assessment — evaluate living situation');
    actions.push('Medication review — deprescribe where possible');
    actions.push('Annual cognitive screening');

    score = Math.min(Math.max(score, 0), 100);
    return { riskScore: score, riskLevel: this.toRiskLevel(score), drivers: [...new Set(drivers)], recommendedActions: [...new Set(actions)] };
  }

  private toRiskLevel(score: number): string {
    if (score <= 24) return 'LOW';
    if (score <= 49) return 'MODERATE';
    if (score <= 74) return 'HIGH';
    return 'CRITICAL';
  }

  private calcAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }
}
