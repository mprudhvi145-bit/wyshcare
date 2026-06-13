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

import { IsString, IsArray, IsOptional, IsNumber, IsObject, IsIn, IsDate, Min, Max, IsNotEmpty } from 'class-validator';

export class AssessLifestyleDto {
  @IsString() @IsNotEmpty()
  userId: string;
}

export class GenerateRecommendationsDto {
  @IsString() @IsNotEmpty()
  userId: string;

  @IsArray() @IsString({ each: true }) @IsOptional()
  focusAreas?: string[];

  @IsString() @IsOptional() @IsIn(['short', 'medium', 'long'])
  timeframe?: 'short' | 'medium' | 'long';

  @IsString() @IsOptional() @IsIn(['easy', 'moderate', 'hard'])
  difficultyPreference?: 'easy' | 'moderate' | 'hard';
}

export class LifestyleProfileDto {
  @IsString() @IsNotEmpty()
  userId: string;

  @IsNumber() @IsOptional() @Min(0) @Max(24)
  sleepHoursAvg?: number;

  @IsString() @IsOptional()
  sleepQuality?: string;

  @IsString() @IsOptional()
  activityLevel?: string;

  @IsNumber() @IsOptional() @Min(0) @Max(7)
  exerciseDaysPerWeek?: number;

  @IsString() @IsOptional()
  dietType?: string;

  @IsNumber() @IsOptional() @Min(0) @Max(20)
  waterIntakeL?: number;

  @IsString() @IsOptional()
  stressLevel?: string;

  @IsNumber() @IsOptional() @Min(0) @Max(24)
  screenTimeHrs?: number;

  @IsString() @IsOptional()
  smokingStatus?: string;

  @IsString() @IsOptional()
  alcoholConsumption?: string;

  @IsString() @IsOptional()
  occupation?: string;

  @IsObject() @IsOptional()
  metadata?: Record<string, unknown>;
}

export class LifestyleScoreDto {
  @IsString() @IsNotEmpty()
  userId: string;

  @IsNumber() @Min(0) @Max(100)
  activityScore: number;

  @IsNumber() @Min(0) @Max(100)
  nutritionScore: number;

  @IsNumber() @Min(0) @Max(100)
  sleepScore: number;

  @IsNumber() @Min(0) @Max(100)
  stressScore: number;

  @IsNumber() @Min(0) @Max(100)
  substanceUseScore: number;

  @IsNumber() @Min(0) @Max(100)
  overallLifestyleScore: number;

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
  @IsString() @IsNotEmpty()
  id: string;

  @IsString() @IsNotEmpty()
  userId: string;

  @IsString() @IsNotEmpty() @IsIn(['activity', 'nutrition', 'sleep', 'stress', 'substance_use'])
  category: 'activity' | 'nutrition' | 'sleep' | 'stress' | 'substance_use';

  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsNotEmpty()
  description: string;

  @IsString() @IsNotEmpty()
  specificGoal: string;

  @IsString() @IsNotEmpty() @IsIn(['easy', 'moderate', 'hard'])
  difficultyLevel: 'easy' | 'moderate' | 'hard';

  @IsNumber() @Min(0) @Max(100)
  estimatedImpact: number;

  @IsString() @IsNotEmpty()
  timeframeToSeeResults: string;

  @IsArray() @IsString({ each: true })
  requiredResources: string[];

  @IsString() @IsNotEmpty() @IsIn(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @IsDate()
  createdAt: Date;
}

export class LifestyleAssessmentHistoryDto {
  @IsString() @IsNotEmpty()
  id: string;

  @IsString() @IsNotEmpty()
  userId: string;

  @IsNumber() @Min(0) @Max(100)
  overallScore: number;

  @IsNumber() @Min(0) @Max(100)
  activityScore: number;

  @IsNumber() @Min(0) @Max(100)
  nutritionScore: number;

  @IsNumber() @Min(0) @Max(100)
  sleepScore: number;

  @IsNumber() @Min(0) @Max(100)
  stressScore: number;

  @IsNumber() @Min(0) @Max(100)
  substanceUseScore: number;

  @IsDate()
  assessmentDate: Date;

  @IsObject()
  factors: Record<string, unknown>;
}