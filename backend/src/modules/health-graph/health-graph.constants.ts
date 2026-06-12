/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph/health-graph.constants.ts
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
 * health-graph.constants — Health Graph module
 *
 * Responsibilities:
 * - Support health graph functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Health Graph
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

export const GraphNodeType = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  CONDITION: 'CONDITION',
  MEDICATION: 'MEDICATION',
  ALLERGY: 'ALLERGY',
  LAB_TEST: 'LAB_TEST',
  LAB_RESULT: 'LAB_RESULT',
  PRESCRIPTION: 'PRESCRIPTION',
  PROCEDURE: 'PROCEDURE',
  CONSULTATION: 'CONSULTATION',
  CARE_PLAN: 'CARE_PLAN',
  FAMILY_MEMBER: 'FAMILY_MEMBER',
  HOSPITAL: 'HOSPITAL',
  SYMPTOM: 'SYMPTOM',
  VACCINATION: 'VACCINATION',
  NOTE: 'NOTE',
} as const;

export type GraphNodeTypeEnum = (typeof GraphNodeType)[keyof typeof GraphNodeType];

export const GraphRelation = {
  HAS_CONDITION: 'HAS_CONDITION',
  TAKES_MEDICATION: 'TAKES_MEDICATION',
  ALLERGIC_TO: 'ALLERGIC_TO',
  VISITED_DOCTOR: 'VISITED_DOCTOR',
  UNDERWENT_TEST: 'UNDERWENT_TEST',
  HAS_RESULT: 'HAS_RESULT',
  PRESCRIBED: 'PRESCRIBED',
  PRESCRIBED_BY: 'PRESCRIBED_BY',
  FAMILY_HISTORY_OF: 'FAMILY_HISTORY_OF',
  FOLLOWS_CARE_PLAN: 'FOLLOWS_CARE_PLAN',
  HAD_PROCEDURE: 'HAD_PROCEDURE',
  REPORTED_SYMPTOM: 'REPORTED_SYMPTOM',
  CONSULTED_FOR: 'CONSULTED_FOR',
  ADMITTED_TO: 'ADMITTED_TO',
  ORDERED_BY: 'ORDERED_BY',
  COMPLICATION_OF: 'COMPLICATION_OF',
  TREATS_CONDITION: 'TREATS_CONDITION',
  FOLLOWUP_REQUIRED: 'FOLLOWUP_REQUIRED',
  RECOMMENDED_BY: 'RECOMMENDED_BY',
  FAMILY_MEMBER: 'FAMILY_MEMBER',
  HAS_VACCINATION: 'HAS_VACCINATION',
} as const;

export type GraphRelationEnum = (typeof GraphRelation)[keyof typeof GraphRelation];

export const NODE_TYPE_TO_PATIENT_RELATION: Record<string, string> = {
  CONDITION: GraphRelation.HAS_CONDITION,
  MEDICATION: GraphRelation.TAKES_MEDICATION,
  ALLERGY: GraphRelation.ALLERGIC_TO,
  DOCTOR: GraphRelation.VISITED_DOCTOR,
  LAB_TEST: GraphRelation.UNDERWENT_TEST,
  LAB_RESULT: GraphRelation.HAS_RESULT,
  PRESCRIPTION: GraphRelation.PRESCRIBED,
  PROCEDURE: GraphRelation.HAD_PROCEDURE,
  CONSULTATION: GraphRelation.CONSULTED_FOR,
  CARE_PLAN: GraphRelation.FOLLOWS_CARE_PLAN,
  FAMILY_MEMBER: GraphRelation.FAMILY_MEMBER,
  SYMPTOM: GraphRelation.REPORTED_SYMPTOM,
  VACCINATION: GraphRelation.HAS_VACCINATION,
  HOSPITAL: GraphRelation.ADMITTED_TO,
};

export const CLINICAL_RULES: Array<{
  name: string;
  conditions: Array<{ nodeType: string; titlePattern?: RegExp; minCount?: number }>;
  context?: { minAge?: number; adherenceBelow?: number };
  risk: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}> = [
  {
    name: 'Diabetic with poor adherence',
    conditions: [
      { nodeType: 'CONDITION', titlePattern: /diabetes/i },
    ],
    context: { adherenceBelow: 70 },
    risk: 'Uncontrolled diabetes — high risk of complications. Intensive medication management and monitoring recommended.',
    severity: 'high',
  },
  {
    name: 'Cardiovascular with age and adherence risk',
    conditions: [
      { nodeType: 'CONDITION', titlePattern: /hypertension|bp|blood pressure|heart|cardiac|chd|cad|hyperlipidemia|cholesterol/i },
    ],
    context: { minAge: 60, adherenceBelow: 80 },
    risk: 'Geriatric cardiovascular patient with low adherence — elevated risk of MI/stroke. Consider cardiology referral.',
    severity: 'high',
  },
  {
    name: 'Multiple comorbidities',
    conditions: [
      { nodeType: 'CONDITION' },
      { nodeType: 'CONDITION' },
      { nodeType: 'CONDITION' },
    ],
    risk: 'Multiple chronic conditions detected — increased care coordination complexity. Comprehensive care plan review recommended.',
    severity: 'medium',
  },
  {
    name: 'Diabetes with family cardiac history',
    conditions: [
      { nodeType: 'CONDITION', titlePattern: /diabetes/i },
      { nodeType: 'FAMILY_MEMBER' },
    ],
    risk: 'Diabetes with family history of cardiac disease — consider cardiovascular risk assessment and lipid panel.',
    severity: 'high',
  },
  {
    name: 'Post-surgery follow-up needed',
    conditions: [
      { nodeType: 'PROCEDURE' },
    ],
    context: { minAge: 50 },
    risk: 'Post-surgical patient with age-related recovery risk. Ensure follow-up is scheduled within 2 weeks.',
    severity: 'medium',
  },
  {
    name: 'Elevated LDL with family history',
    conditions: [
      { nodeType: 'LAB_RESULT', titlePattern: /ldl|cholesterol/i },
      { nodeType: 'FAMILY_MEMBER' },
    ],
    risk: 'Elevated LDL with family cardiac history — consider statin therapy and lifestyle modification.',
    severity: 'high',
  },
  {
    name: 'Polypharmacy risk',
    conditions: [
      { nodeType: 'MEDICATION' },
      { nodeType: 'MEDICATION' },
      { nodeType: 'MEDICATION' },
      { nodeType: 'MEDICATION' },
      { nodeType: 'MEDICATION' },
    ],
    risk: 'Patient on 5+ medications — polypharmacy risk. Review for drug interactions and deprescribing opportunities.',
    severity: 'medium',
  },
  {
    name: 'Allergy-susceptible with new medication',
    conditions: [
      { nodeType: 'ALLERGY' },
      { nodeType: 'MEDICATION' },
    ],
    risk: 'Patient has known allergies and is on medication — monitor for adverse reactions.',
    severity: 'low',
  },
  {
    name: 'Elderly patient',
    conditions: [
      { nodeType: 'PATIENT' },
    ],
    context: { minAge: 70 },
    risk: 'Elderly patient — geriatric assessment, fall risk screening, and medication review recommended.',
    severity: 'medium',
  },
  {
    name: 'Multiple recent hospital visits',
    conditions: [
      { nodeType: 'CONSULTATION' },
      { nodeType: 'CONSULTATION' },
      { nodeType: 'CONSULTATION' },
    ],
    risk: 'Frequent healthcare utilization (3+ consultations) — investigate underlying cause and care coordination.',
    severity: 'medium',
  },
  {
    name: 'Diabetes with hypertension',
    conditions: [
      { nodeType: 'CONDITION', titlePattern: /diabetes/i },
      { nodeType: 'CONDITION', titlePattern: /hypertension|bp|blood pressure/i },
    ],
    risk: 'Diabetes with comorbid hypertension — increased cardiovascular and renal risk. Monitor HbA1c, BP, and renal function.',
    severity: 'high',
  },
  {
    name: 'Critical: No recent follow-up with chronic condition',
    conditions: [
      { nodeType: 'CONDITION', titlePattern: /diabetes|hypertension|heart|cardiac|ckd|kidney/i },
    ],
    context: { minAge: 45 },
    risk: 'Chronic condition with no recent consultation — risk of decompensation. Schedule follow-up within 1 week.',
    severity: 'critical',
  },
];

export const QUERY_PATTERNS: Array<{
  pattern: RegExp;
  graphQuery: string;
  description: string;
}> = [
  {
    pattern: /blood pressure|hypertension/i,
    graphQuery: 'CONDITION:hypertension -> MEDICATION, CONSULTATION',
    description: 'Find hypertension-related medications and consultations',
  },
  {
    pattern: /diabetes|sugar/i,
    graphQuery: 'CONDITION:diabetes -> MEDICATION, LAB_RESULT, CONSULTATION',
    description: 'Find diabetes-related data points',
  },
  {
    pattern: /adherence|medication/i,
    graphQuery: 'MEDICATION -> PRESCRIPTION, CONDITION',
    description: 'Find medication adherence context',
  },
  {
    pattern: /allerg/i,
    graphQuery: 'ALLERGY -> MEDICATION, CONDITION',
    description: 'Find allergy-related risk factors',
  },
  {
    pattern: /family|history/i,
    graphQuery: 'FAMILY_MEMBER -> CONDITION',
    description: 'Find family history conditions',
  },
  {
    pattern: /heart|cardiac|cardio/i,
    graphQuery: 'CONDITION:cardiac -> MEDICATION, PROCEDURE, LAB_RESULT, CONSULTATION',
    description: 'Find cardiac-related data',
  },
  {
    pattern: /kidney|renal|ckd/i,
    graphQuery: 'CONDITION:kidney -> MEDICATION, LAB_RESULT',
    description: 'Find kidney-related data',
  },
];
