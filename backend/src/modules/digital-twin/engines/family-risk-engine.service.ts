/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/digital-twin/engines/family-risk-engine.service.ts
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
 * - Execute business logic for family operations
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
Family
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

interface FamilyRisk {
  condition: string;
  relationship: string;
  relativeRisk: number;
  inheritedProbability: number;
  recommendation: string;
}

export interface FamilyRiskResult {
  totalRisks: number;
  overallScore: number;
  risks: FamilyRisk[];
}

interface ConditionRiskMap {
  relativeRisk: number;
  category: string;
  baseRecommendation: string;
  screeningRecommendation: string;
}

const CONDITION_RISK_MAP: Record<string, ConditionRiskMap> = {
  diabetes: { relativeRisk: 2.3, category: 'metabolic', baseRecommendation: 'Regular blood glucose screening', screeningRecommendation: 'HbA1c or FPG every 3 years starting at age 35 (or earlier if overweight)' },
  'type 2 diabetes': { relativeRisk: 2.3, category: 'metabolic', baseRecommendation: 'Regular blood glucose screening', screeningRecommendation: 'HbA1c or FPG every 3 years starting at age 35 (or earlier if overweight)' },
  'type 1 diabetes': { relativeRisk: 1.5, category: 'metabolic', baseRecommendation: 'Monitor for autoimmune markers', screeningRecommendation: 'Islet autoantibody screening in research setting' },
  'gestational diabetes': { relativeRisk: 1.8, category: 'metabolic', baseRecommendation: 'Post-partum glucose tolerance test', screeningRecommendation: 'OGTT 4-12 weeks postpartum, then every 1-3 years' },
  hypertension: { relativeRisk: 1.5, category: 'cardiovascular', baseRecommendation: 'Regular BP monitoring', screeningRecommendation: 'Annual BP screening; home BP monitoring if pre-hypertensive' },
  'high blood pressure': { relativeRisk: 1.5, category: 'cardiovascular', baseRecommendation: 'Regular BP monitoring', screeningRecommendation: 'Annual BP screening; home BP monitoring if pre-hypertensive' },
  'heart disease': { relativeRisk: 2.0, category: 'cardiovascular', baseRecommendation: 'Cardiovascular risk assessment', screeningRecommendation: 'Lipid panel, CRP, and cardiac risk score (ASCVD) every 4-6 years' },
  'coronary artery disease': { relativeRisk: 2.0, category: 'cardiovascular', baseRecommendation: 'Cardiovascular risk assessment', screeningRecommendation: 'Lipid panel, CRP, and cardiac risk score (ASCVD) every 4-6 years' },
  'heart attack': { relativeRisk: 2.0, category: 'cardiovascular', baseRecommendation: 'Cardiovascular risk assessment', screeningRecommendation: 'Lipid panel, CRP, and cardiac risk score (ASCVD) every 4-6 years' },
  'myocardial infarction': { relativeRisk: 2.0, category: 'cardiovascular', baseRecommendation: 'Cardiovascular risk assessment', screeningRecommendation: 'Lipid panel, CRP, and cardiac risk score (ASCVD) every 4-6 years' },
  stroke: { relativeRisk: 1.8, category: 'cardiovascular', baseRecommendation: 'Stroke risk assessment', screeningRecommendation: 'BP monitoring, lipid panel, and carotid ultrasound if indicated' },
  cva: { relativeRisk: 1.8, category: 'cardiovascular', baseRecommendation: 'Stroke risk assessment', screeningRecommendation: 'BP monitoring, lipid panel, and carotid ultrasound if indicated' },
  'breast cancer': { relativeRisk: 2.5, category: 'cancer', baseRecommendation: 'Enhanced breast cancer screening', screeningRecommendation: 'Annual mammogram starting at age 40 (or 10 years earlier than relative diagnosis)' },
  'ovarian cancer': { relativeRisk: 2.8, category: 'cancer', baseRecommendation: 'Gynecologic oncology evaluation', screeningRecommendation: 'CA-125 and transvaginal ultrasound if high-risk; consider genetic testing' },
  'colon cancer': { relativeRisk: 2.2, category: 'cancer', baseRecommendation: 'Enhanced colorectal screening', screeningRecommendation: 'Colonoscopy starting at age 40 (or 10 years earlier), every 5 years' },
  'colorectal cancer': { relativeRisk: 2.2, category: 'cancer', baseRecommendation: 'Enhanced colorectal screening', screeningRecommendation: 'Colonoscopy starting at age 40 (or 10 years earlier), every 5 years' },
  'lung cancer': { relativeRisk: 1.5, category: 'cancer', baseRecommendation: 'Lung cancer screening discussion', screeningRecommendation: 'Annual low-dose CT if age 50-80 with 20 pack-year smoking history' },
  'prostate cancer': { relativeRisk: 2.0, category: 'cancer', baseRecommendation: 'Enhanced prostate screening', screeningRecommendation: 'PSA screening starting at age 45 (or 10 years earlier) discuss risks/benefits' },
  'pancreatic cancer': { relativeRisk: 2.5, category: 'cancer', baseRecommendation: 'Genetic counseling and evaluation', screeningRecommendation: 'EUS or MRI/MRCP screening in high-risk individuals; consider genetic testing' },
  depression: { relativeRisk: 1.8, category: 'mental_health', baseRecommendation: 'Mental health screening', screeningRecommendation: 'PHQ-9 screening annually; earlier if symptoms develop' },
  'bipolar disorder': { relativeRisk: 2.5, category: 'mental_health', baseRecommendation: 'Psychiatric evaluation', screeningRecommendation: 'Mood disorder questionnaire; refer to psychiatry if positive' },
  schizophrenia: { relativeRisk: 2.8, category: 'mental_health', baseRecommendation: 'Psychiatric evaluation', screeningRecommendation: 'Early psychosis intervention program referral for prodromal symptoms' },
  anxiety: { relativeRisk: 1.5, category: 'mental_health', baseRecommendation: 'Anxiety screening', screeningRecommendation: 'GAD-7 screening; CBT or medication if indicated' },
  alzheimer: { relativeRisk: 1.5, category: 'neurological', baseRecommendation: 'Cognitive screening', screeningRecommendation: 'Annual cognitive screening starting at age 65; earlier if symptoms' },
  dementia: { relativeRisk: 1.5, category: 'neurological', baseRecommendation: 'Cognitive screening', screeningRecommendation: 'Annual cognitive screening starting at age 65; earlier if symptoms' },
  parkinson: { relativeRisk: 1.3, category: 'neurological', baseRecommendation: 'Neurological monitoring', screeningRecommendation: 'Annual neurological exam if symptoms develop' },
  asthma: { relativeRisk: 2.0, category: 'respiratory', baseRecommendation: 'Pulmonary function monitoring', screeningRecommendation: 'Spirometry screening; avoid triggers' },
  copd: { relativeRisk: 1.5, category: 'respiratory', baseRecommendation: 'Pulmonary risk assessment', screeningRecommendation: 'Spirometry if symptomatic or smoking history; alpha-1 antitrypsin testing' },
  'kidney disease': { relativeRisk: 1.8, category: 'renal', baseRecommendation: 'Renal function monitoring', screeningRecommendation: 'Annual eGFR and UACR; BP control' },
  'thyroid disease': { relativeRisk: 1.5, category: 'endocrine', baseRecommendation: 'Thyroid function screening', screeningRecommendation: 'TSH screening every 5 years or earlier if symptoms' },
  osteoporosis: { relativeRisk: 1.6, category: 'musculoskeletal', baseRecommendation: 'Bone density screening', screeningRecommendation: 'DXA scan starting at age 50 (or earlier if additional risk factors)' },
};

@Injectable()
export class FamilyRiskEngineService {
  private readonly logger = new Logger(FamilyRiskEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async assess(userId: string): Promise<FamilyRiskResult> {
    const familyHistory = await this.prisma.familyHistory.findMany({ where: { userId } });

    if (familyHistory.length === 0) {
      return { totalRisks: 0, overallScore: 0, risks: [] };
    }

    const firstDegreeRelations = ['PARENT', 'SIBLING', 'CHILD'];
    const secondDegreeRelations = ['GRANDPARENT', 'AUNT', 'UNCLE'];

    const risks: FamilyRisk[] = [];
    let totalScore = 0;

    for (const fh of familyHistory) {
      const mapped = this.mapCondition(fh.condition);
      if (!mapped) continue;

      const isFirstDegree = firstDegreeRelations.includes(fh.relation.toUpperCase());
      const isSecondDegree = secondDegreeRelations.includes(fh.relation.toUpperCase());

      const relationshipMultiplier = isFirstDegree ? 1.0 : isSecondDegree ? 0.5 : 0.3;
      const ageMultiplier = fh.diagnosisAge !== null && fh.diagnosisAge !== undefined
        ? (fh.diagnosisAge < 50 ? 1.3 : fh.diagnosisAge < 65 ? 1.1 : 0.9)
        : 1.0;

      const effectiveRisk = mapped.relativeRisk * relationshipMultiplier * ageMultiplier;
      const inheritedProbability = this.computeInheritedProbability(effectiveRisk);

      const recommendation = fh.diagnosisAge !== null && fh.diagnosisAge !== undefined && fh.diagnosisAge < 55
        ? `${mapped.screeningRecommendation} (family member diagnosed at ${fh.diagnosisAge}, start screening earlier)`
        : mapped.screeningRecommendation;

      risks.push({
        condition: fh.condition,
        relationship: fh.relation,
        relativeRisk: Math.round(effectiveRisk * 10) / 10,
        inheritedProbability: Math.round(inheritedProbability * 100) / 100,
        recommendation,
      });

      totalScore += effectiveRisk * 15;
    }

    const overallScore = Math.min(100, Math.max(0, Math.round(totalScore / Math.max(risks.length, 1))));

    return {
      totalRisks: risks.length,
      overallScore,
      risks: risks.sort((a, b) => b.relativeRisk - a.relativeRisk),
    };
  }

  private mapCondition(condition: string): ConditionRiskMap | null {
    const lower = condition.toLowerCase().trim();
    for (const [key, value] of Object.entries(CONDITION_RISK_MAP)) {
      if (lower.includes(key) || key.includes(lower)) return value;
    }
    return null;
  }

  private computeInheritedProbability(effectiveRisk: number): number {
    return Math.min(0.8, Math.max(0.05, (effectiveRisk - 1) / 5));
  }
}
