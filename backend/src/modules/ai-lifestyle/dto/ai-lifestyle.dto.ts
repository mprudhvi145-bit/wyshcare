/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/dto/ai-lifestyle.dto.ts
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
 * Data Transfer Object: defines request/response shape for AI
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for AI
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

export class AssessLifestyleDto {
  userId: string;
}

export class GenerateRecommendationsDto {
  userId: string;
  focusAreas?: string[]; // e.g., ['nutrition', 'exercise', 'sleep']
  timeframe?: 'short' | 'medium' | 'long'; // short: 1-2 weeks, medium: 1-3 months, long: 3+ months
  difficultyPreference?: 'easy' | 'moderate' | 'hard';
}

export class LifestyleProfileDto {
  userId: string;
  sleepHoursAvg?: number;
  sleepQuality?: string;
  activityLevel?: string;
  exerciseDaysPerWeek?: number;
  dietType?: string;
  waterIntakeL?: number;
  stressLevel?: string;
  screenTimeHrs?: number;
  smokingStatus?: string;
  alcoholConsumption?: string;
  occupation?: string;
  metadata?: Record<string, unknown>;
}

export class LifestyleScoreDto {
  userId: string;
  activityScore: number; // 0-100
  nutritionScore: number; // 0-100
  sleepScore: number; // 0-100
  stressScore: number; // 0-100
  substanceUseScore: number; // 0-100
  overallLifestyleScore: number; // 0-100
  
  constructor() {
    this.userId = '';
    this.activityScore = 0;
    this.nutritionScore = 0;
    this.sleepScore = 0;
    this.stressScore = 0;
    this.substanceUseScore = 0;
    this.overallLifestyleScore = 0;
  }
}

export class LifestyleRecommendationDto {
  id: string;
  userId: string;
  category: 'activity' | 'nutrition' | 'sleep' | 'stress' | 'substance_use';
  title: string;
  description: string;
  specificGoal: string;
  difficultyLevel: 'easy' | 'moderate' | 'hard';
  estimatedImpact: number; // Estimated points improvement on lifestyle score
  timeframeToSeeResults: string; // e.g., '2 weeks', '1 month'
  requiredResources: string[]; // e.g., ['fitness tracker', 'meal planning app']
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export class LifestyleAssessmentHistoryDto {
  id: string;
  userId: string;
  overallScore: number;
  activityScore: number;
  nutritionScore: number;
  sleepScore: number;
  stressScore: number;
  substanceUseScore: number;
  assessmentDate: Date;
  factors: Record<string, unknown>; // Raw data used for assessment
}