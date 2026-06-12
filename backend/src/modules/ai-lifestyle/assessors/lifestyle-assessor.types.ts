/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/assessors/lifestyle-assessor.types.ts
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
 * lifestyle-assessor.types — AI module
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

export interface ActivityAssessorData {
  userId: string;
  wearableMetrics: any[];
  lifestyleProfile: any;
  healthGoals: any[];
  conditions: any[];
  vitalRecords: any[];
}

export interface NutritionAssessorData {
  userId: string;
  wearableMetrics: any[];
  lifestyleProfile: any;
  healthGoals: any[];
  conditions: any[];
  vitalRecords: any[];
}

export interface SleepAssessorData {
  userId: string;
  wearableMetrics: any[];
  lifestyleProfile: any;
  healthGoals: any[];
  conditions: any[];
  vitalRecords: any[];
}

export interface StressAssessorData {
  userId: string;
  wearableMetrics: any[];
  lifestyleProfile: any;
  healthGoals: any[];
  conditions: any[];
  vitalRecords: any[];
}

export interface SubstanceUseAssessorData {
  userId: string;
  wearableMetrics: any[];
  lifestyleProfile: any;
  healthGoals: any[];
  conditions: any[];
  vitalRecords: any[];
}

export interface LifestyleAssessment {
  score: number; // 0-1
  factors: Record<string, unknown>;
}

export interface LifestyleRecommendationInput {
  userId: string;
  category: 'activity' | 'nutrition' | 'sleep' | 'stress' | 'substance_use';
  title: string;
  description: string;
  specificGoal: string;
  difficultyLevel: 'easy' | 'moderate' | 'hard';
  estimatedImpact: number; // Estimated points improvement on lifestyle score (0-100)
  timeframeToSeeResults: string; // e.g., '2 weeks', '1 month'
  requiredResources: string[]; // e.g., ['fitness tracker', 'meal planning app']
  priority: 'low' | 'medium' | 'high';
}