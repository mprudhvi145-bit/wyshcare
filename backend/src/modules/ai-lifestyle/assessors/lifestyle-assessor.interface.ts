/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/assessors/lifestyle-assessor.interface.ts
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
 * lifestyle-assessor.interface — AI module
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

import { 
  ActivityAssessorData, 
  NutritionAssessorData, 
  SleepAssessorData, 
  StressAssessorData, 
  SubstanceUseAssessorData,
  LifestyleAssessment,
  LifestyleRecommendationInput
} from './lifestyle-assessor.types';

export interface LifestyleAssessor {
  assess(data: any): Promise<LifestyleAssessment>;
  generateRecommendations(data: any): Promise<LifestyleRecommendationInput[]>;
}