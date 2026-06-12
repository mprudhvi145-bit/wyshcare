/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/assessors/nutrition-assessor.ts
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
 * nutrition-assessor — AI module
 *
 * Responsibilities:
 * - Support ai functionality
 *
 * Used By:
 - backend/src/modules/ehr/timeline.service.ts
 - backend/src/modules/ai/ai.service.ts
 - backend/src/modules/ai-risk/services/assessors/hypertension-risk.assessor.ts
 - backend/src/providers/observability/observability.module.ts
 - backend/src/modules/dashboard/dashboard.service.ts
 - backend/src/modules/specialties/ophthalmology/ophthalmology.controller.ts
 - backend/src/modules/consent/consent.controller.ts
 - backend/src/modules/prescription/prescription.module.ts
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

import { Injectable } from '@nestjs/common';
import { 
  NutritionAssessorData, 
  LifestyleAssessment,
  LifestyleRecommendationInput
} from './lifestyle-assessor.types';

@Injectable()
export class NutritionAssessor {
  /**
   * Assess nutrition level based on lifestyle factors and goals
   * @param data Assessment data
   * @returns Promise<LifestyleAssessment> Nutrition score (0-1) and contributing factors
   */
  async assess(data: NutritionAssessorData): Promise<LifestyleAssessment> {
    const { lifestyleProfile, healthGoals, vitalRecords } = data;
    
    // Calculate diet quality score (0-1)
    const dietScore = this.calculateDietScore(lifestyleProfile);
    
    // Calculate hydration score (0-1)
    const hydrationScore = this.calculateHydrationScore(lifestyleProfile);
    
    // Calculate nutrition goal alignment score (0-1)
    const goalScore = this.calculateNutritionGoalScore(healthGoals);
    
    // Calculate overall nutrition score (weighted average)
    const nutritionScore = (dietScore * 0.5 + hydrationScore * 0.3 + goalScore * 0.2);
    
    return {
      score: Math.min(1, Math.max(0, nutritionScore)), // Ensure score is between 0 and 1
      factors: {
        dietScore,
        hydrationScore,
        goalAlignmentScore: goalScore,
        dietType: lifestyleProfile?.dietType,
        waterIntakeL: lifestyleProfile?.waterIntakeL,
        nutritionGoalsCount: healthGoals.filter(g => g.category === 'NUTRITION').length
      }
    };
  }

  /**
   * Generate nutrition-based recommendations
   * @param data Recommendation generation data
   * @returns Promise<LifestyleRecommendationInput[]> Nutrition recommendations
   */
  async generateRecommendations(
    data: NutritionAssessorData & {
      focusAreas?: string[];
      timeframe?: 'short' | 'medium' | 'long';
      difficultyPreference?: 'easy' | 'moderate' | 'hard';
      recentAssessment?: any;
    }
  ): Promise<LifestyleRecommendationInput[]> {
    const { 
      lifestyleProfile, 
      healthGoals,
      focusAreas,
      timeframe,
      difficultyPreference,
      recentAssessment
    } = data;
    
    const recommendations: LifestyleRecommendationInput[] = [];
    
    // Only generate nutrition recommendations if nutrition is in focus areas or no focus areas specified
    if (!focusAreas || focusAreas.includes('nutrition')) {
      const dietRecommendations = this.generateDietRecommendations(
        lifestyleProfile, 
        healthGoals,
        timeframe,
        difficultyPreference
      );
      
      const hydrationRecommendations = this.generateHydrationRecommendations(
        lifestyleProfile,
        timeframe,
        difficultyPreference
      );
      
      recommendations.push(...dietRecommendations, ...hydrationRecommendations);
    }
    
    return recommendations;
  }

  /**
   * Calculate diet quality score based on diet type
   * @param lifestyleProfile User's lifestyle profile
   * @returns Diet score (0-1)
   */
  private calculateDietScore(lifestyleProfile: any): number {
    const dietType = lifestyleProfile?.dietType?.toLowerCase() || '';
    
    // Score based on diet quality
    // Plant-based, Mediterranean, DASH diets = high score (0.8-1.0)
    // Balanced, moderate diets = medium score (0.5-0.7)
    // Poor diets (high processed food, sugar, etc.) = low score (0.0-0.4)
    
    if (['plant-based', 'vegan', 'vegetarian', 'mediterranean', 'dash', 'whole food'].some(dt => dietType.includes(dt))) {
      return 0.9;
    } else if (['balanced', 'moderate', 'healthy', 'clean eating'].some(dt => dietType.includes(dt))) {
      return 0.7;
    } else if (dietType === '' || dietType === 'unknown' || dietType === 'not specified') {
      return 0.5; // Neutral score for unknown
    } else {
      return 0.3; // Poor diet assumption
    }
  }

  /**
   * Calculate hydration score based on water intake
   * @param lifestyleProfile User's lifestyle profile
   * @returns Hydration score (0-1)
   */
  private calculateHydrationScore(lifestyleProfile: any): number {
    const waterIntakeL = lifestyleProfile?.waterIntakeL || 0;
    
    // Recommended water intake: ~2-3 liters per day for adults
    // Score: 0-1L = 0.0-0.33, 1-2L = 0.33-0.67, 2-3L = 0.67-1.0, >3L = 1.0
    if (waterIntakeL <= 1) {
      return waterIntakeL / 3; // 0-0.33 range
    } else if (waterIntakeL <= 2) {
      return 0.33 + ((waterIntakeL - 1) / 3); // 0.33-0.67 range
    } else if (waterIntakeL <= 3) {
      return 0.67 + ((waterIntakeL - 2) / 3); // 0.67-1.0 range
    } else {
      return 1.0; // Cap at 1.0 for >3L
    }
  }

  /**
   * Calculate nutrition goal alignment score
   * @param healthGoals User's health goals
   * @returns Goal alignment score (0-1)
   */
  private calculateNutritionGoalScore(healthGoals: any[]): number {
    const nutritionGoals = healthGoals.filter(g => g.category === 'NUTRITION');
    
    if (nutritionGoals.length === 0) return 0.5; // Neutral if no nutrition goals
    
    // Check if goals are active and progressing
    const activeGoals = nutritionGoals.filter(g => g.status === 'ACTIVE');
    if (activeGoals.length === 0) return 0.3; // Low if no active goals
    
    // Check progress toward goals
    const progressingGoals = activeGoals.filter(g => 
      g.currentValue !== undefined && g.targetValue !== undefined && g.currentValue > 0
    );
    
    if (progressingGoals.length === 0) return 0.6; // Medium if goals set but no progress data
    
    // Calculate average progress percentage
    const totalProgress = progressingGoals.reduce((sum, goal) => {
      if (goal.targetValue > 0) {
        return sum + Math.min(1.0, goal.currentValue / goal.targetValue);
      }
      return sum;
    }, 0);
    
    const avgProgress = totalProgress / progressingGoals.length;
    
    // Score: 0% progress = 0.5, 50% progress = 0.75, 100% progress = 1.0
    return 0.5 + (avgProgress * 0.5);
  }

  /**
   * Generate diet-based recommendations
   * @param lifestyleProfile User's lifestyle profile
   * @param healthGoals User's health goals
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] Diet recommendations
   */
  private generateDietRecommendations(
    lifestyleProfile: any,
    healthGoals: any[],
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    const dietType = lifestyleProfile?.dietType?.toLowerCase() || '';
    
    // Check if diet needs improvement
    const dietScore = this.calculateDietScore(lifestyleProfile);
    
    if (dietScore < 0.7) { // Diet needs improvement
      let targetDiet = 'balanced';
      let specificChange = 'incorporate more vegetables and whole grains';
      
      if (dietScore < 0.4) {
        targetDiet = 'plant-based or Mediterranean';
        specificChange = 'reduce processed foods and added sugars, increase vegetables, fruits, and lean proteins';
      } else if (dietScore < 0.6) {
        targetDiet = 'Mediterranean or DASH';
        specificChange = 'increase fish, nuts, olive oil, and reduce red meat and sodium';
      }
      
      const difficulty = difficultyPreference || 'moderate';
      let timeframeStr = '2 weeks';
      let estimatedImpact = 15; // Points improvement on lifestyle score
      
      if (timeframe === 'short') {
        timeframeStr = '1 week';
        estimatedImpact = 10;
      } else if (timeframe === 'long') {
        timeframeStr = '1 month';
        estimatedImpact = 25;
      }
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'nutrition',
        title: 'Improve Diet Quality',
        description: `Gradually shift toward a ${targetDiet} eating pattern to improve overall nutrition`,
        specificGoal: specificChange,
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: ['healthy cookbook or meal planning app', 'basic cooking equipment'],
        priority: dietScore < 0.4 ? 'high' : 'medium'
      });
    }
    
    // Check if there are active nutrition goals that need attention
    const activeNutritionGoals = healthGoals.filter(g => 
      g.category === 'NUTRITION' && g.status === 'ACTIVE'
    );
    
    if (activeNutritionGoals.length > 0) {
      const goal = activeNutritionGoals[0]; // Take first active goal
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'nutrition',
        title: `Work Toward Nutrition Goal: ${goal.title}`,
        description: goal.description || `Focus on achieving your nutrition goal: ${goal.title}`,
        specificGoal: `Reach target value of ${goal.targetValue} ${goal.unit || ''}`,
        difficultyLevel: goal.targetValue > 50 ? 'hard' : goal.targetValue > 20 ? 'moderate' : 'easy',
        estimatedImpact: 12,
        timeframeToSeeResults: goal.targetDate ? 
          this.formatTimeframe(new Date(goal.targetDate)) : 
          '1-3 months',
        requiredResources: ['food tracking app', 'kitchen scale'],
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate hydration-based recommendations
   * @param lifestyleProfile User's lifestyle profile
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] Hydration recommendations
   */
  private generateHydrationRecommendations(
    lifestyleProfile: any,
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    
    const waterIntakeL = lifestyleProfile?.waterIntakeL || 0;
    
    // Check if hydration needs improvement
    if (waterIntakeL < 2) { // Less than 2 liters per day
      const targetIncrease = Math.min(1, 3 - waterIntakeL); // Aim for 2-3L but cap increase
      const difficulty = difficultyPreference || 'easy';
      let timeframeStr = '1 week';
      let estimatedImpact = 8; // Points improvement on lifestyle score
      
      if (timeframe === 'short') {
        timeframeStr = '3 days';
        estimatedImpact = 5;
      } else if (timeframe === 'long') {
        timeframeStr = '2 weeks';
        estimatedImpact = 12;
      }
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'nutrition',
        title: 'Increase Daily Water Intake',
        description: `Gradually increase your water consumption to reach ${(waterIntakeL + targetIncrease).toFixed(1)} liters per day`,
        specificGoal: `Drink an additional ${targetIncrease.toFixed(1)} liters of water daily`,
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: ['reusable water bottle', 'water tracking app or reminders'],
        priority: waterIntakeL < 1 ? 'high' : 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Format timeframe from date to string
   * @param targetDate Target date
   * @returns Formatted timeframe string
   */
  private formatTimeframe(targetDate: Date): string {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return '1 week';
    if (diffDays <= 30) return '2-4 weeks';
    if (diffDays <= 90) return '1-3 months';
    return '3+ months';
  }
}