/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai/constants/graph.constants.ts
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
 * graph.constants — AI module
 *
 * Responsibilities:
 * - Support ai functionality
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

export const GraphRelation = {
  HAS_CONDITION: 'HAS_CONDITION',
  TAKES_MEDICATION: 'TAKES_MEDICATION',
  PRESCRIBED_BY: 'PRESCRIBED_BY',
  ORDERED_TEST: 'ORDERED_TEST',
  HAS_REPORT: 'HAS_REPORT',
  VISITED_DOCTOR: 'VISITED_DOCTOR',
  FAMILY_MEMBER: 'FAMILY_MEMBER',
  FOLLOWUP_REQUIRED: 'FOLLOWUP_REQUIRED',
  TREATED_BY: 'TREATED_BY',
  RECOMMENDED_BY: 'RECOMMENDED_BY',
} as const;

export type GraphRelationType = (typeof GraphRelation)[keyof typeof GraphRelation];

export const GraphNodeType = {
  PATIENT: 'PATIENT',
  CONDITION: 'CONDITION',
  MEDICATION: 'MEDICATION',
  DOCTOR: 'DOCTOR',
  HOSPITAL: 'HOSPITAL',
  TEST: 'TEST',
  LAB_RESULT: 'LAB_RESULT',
  REPORT: 'REPORT',
  APPOINTMENT: 'APPOINTMENT',
  NOTE: 'NOTE',
  FAMILY: 'FAMILY',
} as const;

export type GraphNodeType = (typeof GraphNodeType)[keyof typeof GraphNodeType];
