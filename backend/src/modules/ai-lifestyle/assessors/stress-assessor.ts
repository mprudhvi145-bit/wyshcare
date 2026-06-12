/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/assessors/stress-assessor.ts
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
 * stress-assessor — AI module
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
  StressAssessorData, 
  LifestyleAssessment,
  LifestyleRecommendationInput
} from './lifestyle-assessor.types';

@Injectable()
export class StressAssessor {
  /**
   * Assess stress level based on wearable data and lifestyle factors
   * @param data Assessment data
   * @returns Promise<LifestyleAssessment> Stress score (0-1) and contributing factors
   * Note: Lower stress = higher score (0-1 scale where 1 is low stress)
   */
  async assess(data: StressAssessorData): Promise<LifestyleAssessment> {
    const { wearableMetrics, lifestyleProfile, healthGoals, conditions, vitalRecords } = data;
    
    // Calculate heart rate variability stress score (0-1)
    const hrvScore = this.calculateHRVStressScore(wearableMetrics);
    
    // Calculate resting heart rate stress score (0-1)
    const hrScore = this.calculateHeartRateStressScore(wearableMetrics);
    
    // Calculate self-reported stress score (0-1)
    const reportedScore = this.calculateReportedStressScore(lifestyleProfile);
    
    // Calculate condition-related stress score (0-1)
    const conditionScore = this.calculateConditionStressScore(conditions);
    
    // Calculate overall stress score (weighted average)
    // Note: We invert the stress scores so that lower stress = higher score
    const stressScore = (
      hrvScore * 0.3 +
      hrScore * 0.2 +
      reportedScore * 0.3 +
      conditionScore * 0.2
    );
    
    return {
      score: Math.min(1, Math.max(0, stressScore)), // Ensure score is between 0 and 1
      factors: {
        hrvScore,
        heartRateScore: hrScore,
        reportedStressScore: reportedScore,
        conditionStressScore: conditionScore,
        stressLevel: lifestyleProfile?.stressLevel,
        wearableDataPoints: wearableMetrics.length,
        activeConditions: conditions.filter(c => c.status === 'ACTIVE').length
      }
    };
  }

  /**
   * Generate stress-based recommendations
   * @param data Recommendation generation data
   * @returns Promise<LifestyleRecommendationInput[]> Stress recommendations
   */
  async generateRecommendations(
    data: StressAssessorData & {
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
      conditions,
      focusAreas,
      timeframe,
      difficultyPreference,
      recentAssessment
    } = data;
    
    const recommendations: LifestyleRecommendationInput[] = [];
    
    // Only generate stress recommendations if stress is in focus areas or no focus areas specified
    if (!focusAreas || focusAreas.includes('stress')) {
      const hrvRecommendations = this.generateHRVStressRecommendations(
        wearableMetrics, 
        lifestyleProfile,
        healthGoals,
        timeframe,
        difficultyPreference
      );
      
      const lifestyleRecommendations = this.generateLifestyleStressRecommendations(
        lifestyleProfile,
        healthGoals,
        conditions,
        timeframe,
        difficultyPreference
      );
      
      recommendations.push(...hrvRecommendations, ...lifestyleRecommendations);
    }
    
    return recommendations;
  }

  /**
   * Calculate HRV-based stress score (0-1)
   * Higher HRV = lower stress = higher score
   * @param wearableMetrics Wearable metrics array
   * @returns HRV stress score (0-1)
   */
  private calculateHRVStressScore(wearableMetrics: any[]): number {
    // Look for HRV metrics (typically in ms)
    const hrvMetrics = wearableMetrics
      .filter(m => 
        m.metricType === 'HRV' || 
        m.metricType === 'hrv' ||
        m.metricType === 'HEART_RATE_VARIABILITY' ||
        m.metricType === 'heart_rate_variability'
      )
      .map(m => m.value);
    
    if (hrvMetrics.length === 0) return 0.5; // Neutral if no data
    
    // Calculate average HRV
    const avgHRV = hrvMetrics.reduce((sum, val) => sum + val, 0) / hrvMetrics.length;
    
    // HRV values vary by age, but generally:
    // <20 ms = poor (high stress) -> score 0.0-0.3
    // 20-50 ms = fair -> score 0.3-0.6
    // 50-100 ms = good -> score 0.6-0.8
    // >100 ms = excellent (low stress) -> score 0.8-1.0
    
    if (avgHRV < 20) {
      return avgHRV / 66.7; // 0-0.3 range
    } else if (avgHRV < 50) {
      return 0.3 + ((avgHRV - 20) / 100); // 0.3-0.6 range
    } else if (avgHRV < 100) {
      return 0.6 + ((avgHRV - 50) / 83.3); // 0.6-0.8 range
    } else {
      return 0.8 + Math.min(0.2, (avgHRV - 100) / 500); // 0.8-1.0 range
    }
  }

  /**
   * Calculate heart rate-based stress score (0-1)
   * Lower resting HR = lower stress = higher score
   * @param wearableMetrics Wearable metrics array
   * @returns Heart rate stress score (0-1)
   */
  private calculateHeartRateStressScore(wearableMetrics: any[]): number {
    // Look for resting heart rate metrics
    const hrMetrics = wearableMetrics
      .filter(m => 
        m.metricType === 'HEART_RATE' || 
        m.metricType === 'heart_rate' ||
        m.metricType === 'RESTING_HEART_RATE' ||
        m.metricType === 'resting_heart_rate'
      )
      .map(m => m.value);
    
    if (hrMetrics.length === 0) return 0.5; // Neutral if no data
    
    // Calculate average resting heart rate
    const avgHR = hrMetrics.reduce((sum, val) => sum + val, 0) / hrMetrics.length;
    
    // Resting HR interpretation:
    // <60 = excellent (athlete) -> score 0.9-1.0
    // 60-80 = good -> score 0.6-0.9
    // 80-100 = average -> score 0.3-0.6
    // >100 = poor (high stress) -> score 0.0-0.3
    
    if (avgHR < 60) {
      return 0.9 + Math.min(0.1, (60 - avgHR) / 60); // 0.9-1.0 range
    } else if (avgHR <= 80) {
      return 0.6 + ((avgHR - 60) * 0.3 / 20); // 0.6-0.9 range
    } else if (avgHR <= 100) {
      return 0.3 + ((avgHR - 80) * 0.3 / 20); // 0.3-0.6 range
    } else {
      return Math.max(0, 0.3 - ((avgHR - 100) / 100)); // 0.0-0.3 range
    }
  }

  /**
   * Calculate self-reported stress score (0-1)
   * Lower stress = higher score
   * @param lifestyleProfile User's lifestyle profile
   * @returns Self-reported stress score (0-1)
   */
  private calculateReportedStressScore(lifestyleProfile: any): number {
    const stressLevel = lifestyleProfile?.stressLevel?.toLowerCase() || '';
    
    // Map stress levels to scores (inverted: low stress = high score)
    const stressMap: Record<string, number> = {
      'very low': 0.9,
      'low': 0.7,
      'moderate': 0.5,
      'high': 0.3,
      'very high': 0.1
    };
    
    return stressMap[stressLevel] || 0.5; // Default to moderate if unknown
  }

  /**
   * Calculate condition-related stress score (0-1)
   * More/severe conditions = higher stress = lower score
   * @param conditions User's conditions
   * @returns Condition stress score (0-1)
   */
  private calculateConditionStressScore(conditions: any[]): number {
    const activeConditions = conditions.filter(c => c.status === 'ACTIVE');
    
    if (activeConditions.length === 0) return 1.0; // No active conditions = low stress
    
    // Each condition contributes to stress score
    // We'll use a simple model: each condition reduces score by 0.15, minimum 0.1
    const conditionImpact = activeConditions.length * 0.15;
    return Math.max(0.1, 1.0 - conditionImpact);
  }

  /**
   * Generate HRV-based stress recommendations
   * @param wearableMetrics Wearable metrics array
   * @param lifestyleProfile User's lifestyle profile
   * @param healthGoals User's health goals
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] HRV stress recommendations
   */
  private generateHRVStressRecommendations(
    wearableMetrics: any[],
    lifestyleProfile: any,
    healthGoals: any[],
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    
    const hrvScore = this.calculateHRVStressScore(wearableMetrics);
    
    // If HRV is low (indicating high stress), generate recommendations
    if (hrvScore < 0.6) { // Below 60% HRV score
      const difficulty = difficultyPreference || 'moderate';
      let timeframeStr = '2 weeks';
      let estimatedImpact = 15; // Points improvement on lifestyle score
      
      if (timeframe === 'short') {
        timeframeStr = '1 week';
        estimatedImpact = 10;
      } else if (timeframe === 'long') {
        timeframeStr = '1 month';
        estimatedImpact = 22;
      }
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'stress',
        title: 'Improve Heart Rate Variability',
        description: 'Increase your heart rate variability through breathing exercises and mindfulness to reduce stress',
        specificGoal: 'Practice daily breathing exercises to improve HRV',
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: ['breathing app', 'meditation guide', 'HRV tracking device'],
        priority: hrvScore < 0.4 ? 'high' : 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate lifestyle-based stress recommendations
   * @param lifestyleProfile User's lifestyle profile
   * @param healthGoals User's health goals
   * @param conditions User's conditions
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] Lifestyle stress recommendations
   */
  private generateLifestyleStressRecommendations(
    lifestyleProfile: any,
    healthGoals: any[],
    conditions: any[],
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    
    const reportedScore = this.calculateReportedStressScore(lifestyleProfile);
    const conditionScore = this.calculateConditionStressScore(conditions);
    
    // If self-reported stress is high, generate recommendations
    if (reportedScore < 0.5) { // Above moderate stress level
      const difficulty = difficultyPreference || 'moderate';
      let timeframeStr = '2 weeks';
      let estimatedImpact = 18; // Points improvement on lifestyle score
      
      if (timeframe === 'short') {
        timeframeStr = '1 week';
        estimatedImpact = 12;
      } else if (timeframe === 'long') {
        timeframeStr = '1 month';
        estimatedImpact = 25;
      }
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'stress',
        title: 'Reduce Stress Through Lifestyle Changes',
        description: 'Implement stress reduction techniques in your daily routine',
        specificGoal: 'Practice stress reduction techniques for 10-15 minutes daily',
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: [
          'meditation app', 
          'yoga mat', 
          'journal for stress tracking',
          'aromatherapy oils (optional)'
        ],
        priority: reportedScore < 0.3 ? 'high' : 'medium'
      });
    }
    
    // If there are multiple active conditions, generate condition management recommendations
    if (conditionScore < 0.7 && conditions.length > 1) { // Multiple conditions contributing to stress
      const difficulty = difficultyPreference || 'moderate';
      let timeframeStr = '3 weeks';
      let estimatedImpact = 12; // Points improvement on lifestyle score
      
      if (timeframe === 'short') {
        timeframeStr = '10 days';
        estimatedImpact = 8;
      } else if (timeframe === 'long') {
        timeframeStr = '6 weeks';
        estimatedImpact = 18;
      }
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'stress',
        title: 'Manage Condition-Related Stress',
        description: 'Develop strategies to cope with the stress of managing multiple health conditions',
        specificGoal: 'Create a condition management plan with your healthcare provider',
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: [
          'condition tracking app', 
          'medication organizer',
          'support group access'
        ],
        priority: conditionScore < 0.4 ? 'high' : 'medium'
      });
    }
    
    return recommendations;
  }
}