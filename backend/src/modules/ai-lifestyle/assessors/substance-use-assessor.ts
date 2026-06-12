/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/assessors/substance-use-assessor.ts
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
 * substance-use-assessor — AI module
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
  SubstanceUseAssessorData, 
  LifestyleAssessment,
  LifestyleRecommendationInput
} from './lifestyle-assessor.types';

@Injectable()
export class SubstanceUseAssessor {
  /**
   * Assess substance use level based on lifestyle factors
   * @param data Assessment data
   * @returns Promise<LifestyleAssessment> Substance use score (0-1) and contributing factors
   * Note: Lower substance use = higher score (0-1 scale where 1 is low/no substance use)
   */
  async assess(data: SubstanceUseAssessorData): Promise<LifestyleAssessment> {
    const { lifestyleProfile } = data;
    
    // Calculate smoking score (0-1)
    const smokingScore = this.calculateSmokingScore(lifestyleProfile);
    
    // Calculate alcohol score (0-1)
    const alcoholScore = this.calculateAlcoholScore(lifestyleProfile);
    
    // Calculate overall substance use score (weighted average)
    // We give equal weight to smoking and alcohol
    const substanceUseScore = (smokingScore * 0.5 + alcoholScore * 0.5);
    
    return {
      score: Math.min(1, Math.max(0, substanceUseScore)), // Ensure score is between 0 and 1
      factors: {
        smokingScore,
        alcoholScore,
        smokingStatus: lifestyleProfile?.smokingStatus,
        alcoholConsumption: lifestyleProfile?.alcoholConsumption
      }
    };
  }

  /**
   * Generate substance use-based recommendations
   * @param data Recommendation generation data
   * @returns Promise<LifestyleRecommendationInput[]> Substance use recommendations
   */
  async generateRecommendations(
    data: SubstanceUseAssessorData & {
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
    
    // Only generate substance use recommendations if substance use is in focus areas or no focus areas specified
    if (!focusAreas || focusAreas.includes('substance_use')) {
      const smokingRecommendations = this.generateSmokingRecommendations(
        lifestyleProfile, 
        healthGoals,
        timeframe,
        difficultyPreference
      );
      
      const alcoholRecommendations = this.generateAlcoholRecommendations(
        lifestyleProfile,
        healthGoals,
        timeframe,
        difficultyPreference
      );
      
      recommendations.push(...smokingRecommendations, ...alcoholRecommendations);
    }
    
    return recommendations;
  }

  /**
   * Calculate smoking score (0-1)
   * Non-smoker = 1.0, Current smoker = 0.0-0.3 depending on frequency
   * @param lifestyleProfile User's lifestyle profile
   * @returns Smoking score (0-1)
   */
  private calculateSmokingScore(lifestyleProfile: any): number {
    const smokingStatus = lifestyleProfile?.smokingStatus?.toLowerCase() || '';
    
    // Map smoking status to scores
    const smokingMap: Record<string, number> = {
      'never': 1.0,
      'former': 0.8, // Former smokers get high score but not perfect due to potential lingering effects
      'occasional': 0.5,
      'light': 0.3,
      'moderate': 0.15,
      'heavy': 0.0
    };
    
    return smokingMap[smokingStatus] || 0.8; // Default to former smoker if unknown (conservative)
  }

  /**
   * Calculate alcohol score (0-1)
   * Based on consumption levels
   * @param lifestyleProfile User's lifestyle profile
   * @returns Alcohol score (0-1)
   */
  private calculateAlcoholScore(lifestyleProfile: any): number {
    const alcoholConsumption = lifestyleProfile?.alcoholConsumption?.toLowerCase() || '';
    
    // Map alcohol consumption to scores
    // Based on guidelines: moderate drinking = up to 1 drink/day for women, 2 for men
    const alcoholMap: Record<string, number> = {
      'never': 1.0,
      'occasional': 0.9, // Less than 1 drink/week
      'light': 0.7, // 1-3 drinks/week
      'moderate': 0.5, // 3-7 drinks/week (up to 1/day)
      'heavy': 0.2, // 7-14 drinks/week
      'very heavy': 0.0 // >14 drinks/week
    };
    
    return alcoholMap[alcoholConsumption] || 0.5; // Default to moderate if unknown
  }

  /**
   * Generate smoking-based recommendations
   * @param lifestyleProfile User's lifestyle profile
   * @param healthGoals User's health goals
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] Smoking recommendations
   */
  private generateSmokingRecommendations(
    lifestyleProfile: any,
    healthGoals: any[],
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    
    const smokingStatus = lifestyleProfile?.smokingStatus?.toLowerCase() || '';
    
    // If user smokes (anything other than 'never' or 'former'), generate recommendations
    if (!['never', 'former'].includes(smokingStatus)) {
      let difficulty = difficultyPreference || 'hard';
      let timeframeStr = '8-12 weeks';
      let estimatedImpact = 25; // Quitting smoking has high impact on health
      let specificGoal = 'Quit smoking completely';
      let requiredResources = [
        'nicotine replacement therapy (patch, gum, lozenge)',
        'smoking cessation app',
        'support group access',
        'prescription medications (consult doctor)'
      ];
      
      // Adjust based on current smoking level
      if (smokingStatus === 'occasional' || smokingStatus === 'light') {
        difficulty = 'moderate';
        timeframeStr = '4-6 weeks';
        estimatedImpact = 20;
        specificGoal = 'Reduce smoking to zero cigarettes per day';
      } else if (smokingStatus === 'moderate') {
        difficulty = 'hard';
        timeframeStr = '6-8 weeks';
        estimatedImpact = 22;
        specificGoal = 'Reduce smoking gradually to zero cigarettes per day';
      }
      
      // Adjust based on timeframe preference
      if (timeframe === 'short') {
        timeframeStr = '2-4 weeks';
        estimatedImpact = Math.max(15, estimatedImpact - 5);
        // Note: Short timeframe for quitting smoking is challenging but possible with support
      } else if (timeframe === 'long') {
        timeframeStr = '3-6 months';
        estimatedImpact = Math.min(30, estimatedImpact + 5);
      }
      
      // Adjust based on difficulty preference
      if (difficultyPreference === 'easy') {
        // For easy difficulty, focus on reduction rather than cessation
        timeframeStr = '4-8 weeks';
        estimatedImpact = 12;
        specificGoal = 'Reduce smoking by 50%';
        requiredResources = [
          'nicotine replacement therapy (lower dose)',
          'smoking tracking app'
        ];
      } else if (difficultyPreference === 'hard') {
        // For hard difficulty, include comprehensive approach
        timeframeStr = '6-12 weeks';
        estimatedImpact = 28;
        specificGoal = 'Quit smoking completely with comprehensive support';
        requiredResources = [
          'nicotine replacement therapy (combination)',
          'prescription medications (consult doctor)',
          'behavioral counseling',
          'support group access',
          'smoking cessation app'
        ];
      }
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'substance_use',
        title: 'Quit Smoking',
        description: `Eliminate tobacco use to significantly improve your health and reduce disease risk`,
        specificGoal: specificGoal,
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: requiredResources,
        priority: 'high' // Smoking cessation is always high priority
      });
    }
    
    return recommendations;
  }

  /**
   * Generate alcohol-based recommendations
   * @param lifestyleProfile User's lifestyle profile
   * @param healthGoals User's health goals
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] Alcohol recommendations
   */
  private generateAlcoholRecommendations(
    lifestyleProfile: any,
    healthGoals: any[],
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    
    const alcoholConsumption = lifestyleProfile?.alcoholConsumption?.toLowerCase() || '';
    
    // If user drinks at heavy or very heavy levels, generate recommendations
    if (['heavy', 'very heavy'].includes(alcoholConsumption)) {
      let difficulty = difficultyPreference || 'moderate';
      let timeframeStr = '4-8 weeks';
      let estimatedImpact = 18; // Reducing heavy drinking has significant impact
      let specificGoal = 'Reduce alcohol consumption to moderate levels';
      let requiredResources = [
        'alcohol tracking app',
        'alternative beverages (sparkling water, etc.)',
        'support group access (if needed)'
      ];
      
      // Adjust based on current drinking level
      if (alcoholConsumption === 'heavy') {
        difficulty = 'moderate';
        timeframeStr = '4-6 weeks';
        estimatedImpact = 15;
        specificGoal = 'Reduce alcohol consumption to moderate levels (<3 drinks/day for men, <2 for women)';
      } else if (alcoholConsumption === 'very heavy') {
        difficulty = 'hard';
        timeframeStr = '6-10 weeks';
        estimatedImpact = 22;
        specificGoal = 'Reduce alcohol consumption significantly and seek professional guidance if needed';
        requiredResources = [
          'alcohol tracking app',
          'alternative beverages',
          'support group access',
          'professional counseling (consult doctor)'
        ];
      }
      
      // Adjust based on timeframe preference
      if (timeframe === 'short') {
        timeframeStr = '2-4 weeks';
        estimatedImpact = Math.max(10, estimatedImpact - 5);
      } else if (timeframe === 'long') {
        timeframeStr = '8-12 weeks';
        estimatedImpact = Math.min(25, estimatedImpact + 5);
      }
      
      // Adjust based on difficulty preference
      if (difficultyPreference === 'easy') {
        // For easy difficulty, focus on gradual reduction
        timeframeStr = '4-6 weeks';
        estimatedImpact = 12;
        specificGoal = 'Reduce alcohol consumption by 25%';
        requiredResources = [
          'alcohol tracking app',
          'alternative beverages'
        ];
      } else if (difficultyPreference === 'hard') {
        // For hard difficulty, include professional support
        timeframeStr = '6-12 weeks';
        estimatedImpact = 25;
        specificGoal = 'Reduce alcohol consumption to low or moderate levels with professional support';
        requiredResources = [
          'alcohol tracking app',
          'alternative beverages',
          'support group access',
          'professional counseling (consult doctor)'
        ];
      }
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'substance_use',
        title: 'Reduce Alcohol Consumption',
        description: `Lower your alcohol intake to improve health, sleep, and reduce risk of various conditions`,
        specificGoal: specificGoal,
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: requiredResources,
        priority: alcoholConsumption === 'very heavy' ? 'high' : 'medium'
      });
    }
    // If user drinks at moderate levels but could benefit from reduction, generate mild recommendations
    else if (alcoholConsumption === 'moderate' && difficultyPreference !== 'easy') {
      // Only generate if not preferring easy difficulty (to avoid nagging low-risk drinkers)
      const difficulty = difficultyPreference || 'moderate';
      let timeframeStr = '4-6 weeks';
      let estimatedImpact = 8; // Small but positive impact
      let specificGoal = 'Maintain moderate drinking or reduce slightly for optimal health';
      let requiredResources = [
        'alcohol tracking app',
        'alternative beverages'
      ];
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'substance_use',
        title: 'Maintain Healthy Alcohol Habits',
        description: `Keep your alcohol consumption in the moderate range for optimal health benefits`,
        specificGoal: specificGoal,
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: requiredResources,
        priority: 'low'
      });
    }
    
    return recommendations;
  }
}