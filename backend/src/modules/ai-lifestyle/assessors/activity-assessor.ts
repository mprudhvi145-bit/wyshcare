/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/assessors/activity-assessor.ts
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
 * activity-assessor — AI module
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
  ActivityAssessorData, 
  LifestyleAssessment,
  LifestyleRecommendationInput
} from './lifestyle-assessor.types';

@Injectable()
export class ActivityAssessor {
  /**
   * Assess activity level based on wearable data and lifestyle factors
   * @param data Assessment data
   * @returns Promise<LifestyleAssessment> Activity score (0-1) and contributing factors
   */
  async assess(data: ActivityAssessorData): Promise<LifestyleAssessment> {
    const { wearableMetrics, lifestyleProfile, healthGoals } = data;
    
    // Calculate steps score (0-1)
    const stepsScore = this.calculateStepsScore(wearableMetrics);
    
    // Calculate exercise frequency score (0-1)
    const exerciseScore = this.calculateExerciseScore(lifestyleProfile);
    
    // Calculate heart rate variability score (0-1) if available
    const hrScore = this.calculateHeartRateScore(wearableMetrics);
    
    // Calculate overall activity score (weighted average)
    const activityScore = (stepsScore * 0.4 + exerciseScore * 0.4 + hrScore * 0.2);
    
    return {
      score: Math.min(1, Math.max(0, activityScore)), // Ensure score is between 0 and 1
      factors: {
        stepsScore,
        exerciseScore,
        heartRateScore: hrScore,
        dailyStepsAvg: this.calculateAverageSteps(wearableMetrics),
        exerciseDaysPerWeek: lifestyleProfile?.exerciseDaysPerWeek || 0,
        wearableDataPoints: wearableMetrics.length
      }
    };
  }

  /**
   * Generate activity-based recommendations
   * @param data Recommendation generation data
   * @returns Promise<LifestyleRecommendationInput[]> Activity recommendations
   */
  async generateRecommendations(
    data: ActivityAssessorData & {
      focusAreas?: string[];
      timeframe?: 'short' | 'medium' | 'long';
      difficultyPreference?: 'easy' | 'moderate' | 'hard';
      recentAssessment?: any;
    }
  ): Promise<LifestyleRecommendationInput[]> {
    const { 
      wearableMetrics, 
      lifestyleProfile, 
      healthGoals,
      focusAreas,
      timeframe,
      difficultyPreference,
      recentAssessment
    } = data;
    
    const recommendations: LifestyleRecommendationInput[] = [];
    
    // Only generate activity recommendations if activity is in focus areas or no focus areas specified
    if (!focusAreas || focusAreas.includes('activity')) {
      const stepsRecommendations = this.generateStepsRecommendations(
        wearableMetrics, 
        lifestyleProfile, 
        healthGoals,
        timeframe,
        difficultyPreference
      );
      
      const exerciseRecommendations = this.generateExerciseRecommendations(
        lifestyleProfile,
        healthGoals,
        timeframe,
        difficultyPreference
      );
      
      recommendations.push(...stepsRecommendations, ...exerciseRecommendations);
    }
    
    return recommendations;
  }

  /**
   * Calculate steps score based on daily average
   * @param wearableMetrics Wearable metrics array
   * @returns Steps score (0-1)
   */
  private calculateStepsScore(wearableMetrics: any[]): number {
    const stepsMetrics = wearableMetrics
      .filter(m => m.metricType === 'STEPS' || m.metricType === 'step_count')
      .map(m => m.value);
    
    if (stepsMetrics.length === 0) return 0.5; // Neutral score if no data
    
    const avgSteps = stepsMetrics.reduce((sum, val) => sum + val, 0) / stepsMetrics.length;
    
    // WHO recommends 10,000 steps/day for general health
    // Score: 0-5000 steps = 0-0.5, 5000-10000 steps = 0.5-1.0, >10000 steps = 1.0
    if (avgSteps <= 5000) {
      return avgSteps / 10000; // 0-0.5 range
    } else if (avgSteps <= 10000) {
      return 0.5 + ((avgSteps - 5000) / 10000); // 0.5-1.0 range
    } else {
      return 1.0; // Cap at 1.0 for >10000 steps
    }
  }

  /**
   * Calculate exercise frequency score
   * @param lifestyleProfile User's lifestyle profile
   * @returns Exercise score (0-1)
   */
  private calculateExerciseScore(lifestyleProfile: any): number {
    const exerciseDays = lifestyleProfile?.exerciseDaysPerWeek || 0;
    
    // WHO recommends 150 minutes moderate or 75 minutes vigorous activity per week
    // Assuming ~30 minutes per session, that's ~5 sessions per week
    // Score: 0 days = 0, 1-2 days = 0.33, 3-4 days = 0.67, 5+ days = 1.0
    if (exerciseDays === 0) return 0;
    if (exerciseDays <= 2) return 0.33;
    if (exerciseDays <= 4) return 0.67;
    return 1.0;
  }

  /**
   * Calculate heart rate score based on resting heart rate and variability
   * @param wearableMetrics Wearable metrics array
   * @returns Heart rate score (0-1)
   */
  private calculateHeartRateScore(wearableMetrics: any[]): number {
    const hrMetrics = wearableMetrics
      .filter(m => m.metricType === 'HEART_RATE' || m.metricType === 'heart_rate')
      .map(m => m.value);
    
    if (hrMetrics.length === 0) return 0.5; // Neutral score if no data
    
    const avgHR = hrMetrics.reduce((sum, val) => sum + val, 0) / hrMetrics.length;
    
    // Normal resting heart rate: 60-100 bpm
    // Athletes: 40-60 bpm
    // Score: <60 = 1.0 (excellent), 60-80 = 0.8-1.0, 80-100 = 0.5-0.8, >100 = 0.0-0.5
    if (avgHR < 60) return 1.0;
    if (avgHR <= 80) return 0.8 + ((80 - avgHR) / 40); // 0.8-1.0 range
    if (avgHR <= 100) return 0.5 + ((100 - avgHR) / 40); // 0.5-0.8 range
    return Math.max(0, 1.0 - ((avgHR - 100) / 50)); // 0.0-0.5 range
  }

  /**
   * Calculate average steps from wearable metrics
   * @param wearableMetrics Wearable metrics array
   * @returns Average daily steps
   */
  private calculateAverageSteps(wearableMetrics: any[]): number {
    const stepsMetrics = wearableMetrics
      .filter(m => m.metricType === 'STEPS' || m.metricType === 'step_count')
      .map(m => m.value);
    
    if (stepsMetrics.length === 0) return 0;
    
    return stepsMetrics.reduce((sum, val) => sum + val, 0) / stepsMetrics.length;
  }

  /**
   * Generate steps-based recommendations
   * @param wearableMetrics Wearable metrics array
   * @param lifestyleProfile User's lifestyle profile
   * @param healthGoals User's health goals
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] Steps recommendations
   */
  private generateStepsRecommendations(
    wearableMetrics: any[],
    lifestyleProfile: any,
    healthGoals: any[],
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    
    const avgSteps = this.calculateAverageSteps(wearableMetrics);
    
    // If steps are below recommended level, generate recommendations
    if (avgSteps < 8000) { // Below 8000 steps/day
      const targetIncrease = Math.min(2000, 10000 - avgSteps); // Aim for 10k but cap increase
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
        category: 'activity',
        title: 'Increase Daily Steps',
        description: `Gradually increase your daily step count to reach ${Math.round(avgSteps + targetIncrease)} steps per day`,
        specificGoal: `Increase daily steps by ${Math.round(targetIncrease)} steps`,
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: ['comfortable walking shoes', 'step tracker or smartphone'],
        priority: avgSteps < 5000 ? 'high' : 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate exercise-based recommendations
   * @param lifestyleProfile User's lifestyle profile
   * @param healthGoals User's health goals
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] Exercise recommendations
   */
  private generateExerciseRecommendations(
    lifestyleProfile: any,
    healthGoals: any[],
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    
    const exerciseDays = lifestyleProfile?.exerciseDaysPerWeek || 0;
    
    // If exercise frequency is below recommended level, generate recommendations
    if (exerciseDays < 3) { // Below 3 days/week
      const targetIncrease = Math.min(2, 5 - exerciseDays); // Aim for 5 days but cap increase
      const difficulty = difficultyPreference || 'moderate';
      let timeframeStr = '2 weeks';
      let estimatedImpact = 20; // Points improvement on lifestyle score
      
      if (timeframe === 'short') {
        timeframeStr = '1 week';
        estimatedImpact = 15;
      } else if (timeframe === 'long') {
        timeframeStr = '1 month';
        estimatedImpact = 30;
      }
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'activity',
        title: 'Increase Exercise Frequency',
        description: `Gradually increase your exercise sessions to ${exerciseDays + targetIncrease} times per week`,
        specificGoal: `Add ${targetIncrease} exercise sessions per week`,
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: ['exercise equipment or gym access', 'workout plan'],
        priority: exerciseDays === 0 ? 'high' : 'medium'
      });
    }
    
    return recommendations;
  }
}