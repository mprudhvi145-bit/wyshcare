/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/assessors/sleep-assessor.ts
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
 * sleep-assessor — AI module
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
  SleepAssessorData, 
  LifestyleAssessment,
  LifestyleRecommendationInput
} from './lifestyle-assessor.types';

@Injectable()
export class SleepAssessor {
  /**
   * Assess sleep level based on wearable data and lifestyle factors
   * @param data Assessment data
   * @returns Promise<LifestyleAssessment> Sleep score (0-1) and contributing factors
   */
  async assess(data: SleepAssessorData): Promise<LifestyleAssessment> {
    const { wearableMetrics, lifestyleProfile, vitalRecords } = data;
    
    // Calculate sleep duration score (0-1)
    const durationScore = this.calculateSleepDurationScore(wearableMetrics, lifestyleProfile);
    
    // Calculate sleep quality score (0-1)
    const qualityScore = this.calculateSleepQualityScore(wearableMetrics, lifestyleProfile);
    
    // Calculate sleep consistency score (0-1)
    const consistencyScore = this.calculateSleepConsistencyScore(wearableMetrics);
    
    // Calculate overall sleep score (weighted average)
    const sleepScore = (durationScore * 0.4 + qualityScore * 0.4 + consistencyScore * 0.2);
    
    return {
      score: Math.min(1, Math.max(0, sleepScore)), // Ensure score is between 0 and 1
      factors: {
        durationScore,
        qualityScore,
        consistencyScore,
        avgSleepHours: this.calculateAverageSleepHours(wearableMetrics, lifestyleProfile),
        sleepQualityRating: lifestyleProfile?.sleepQuality,
        sleepDataPoints: wearableMetrics.length
      }
    };
  }

  /**
   * Generate sleep-based recommendations
   * @param data Recommendation generation data
   * @returns Promise<LifestyleRecommendationInput[]> Sleep recommendations
   */
  async generateRecommendations(
    data: SleepAssessorData & {
      focusAreas?: string[];
      timeframe?: 'short' | 'medium' | 'long';
      difficultyPreference?: 'easy' | 'moderate' | 'hard';
      recentAssessment?: any;
    }
  ): Promise<LifestyleRecommendationInput[]> {
    const { 
      wearableMetrics, 
      lifestyleProfile,
      focusAreas,
      timeframe,
      difficultyPreference,
      recentAssessment
    } = data;
    
    const recommendations: LifestyleRecommendationInput[] = [];
    
    // Only generate sleep recommendations if sleep is in focus areas or no focus areas specified
    if (!focusAreas || focusAreas.includes('sleep')) {
      const durationRecommendations = this.generateSleepDurationRecommendations(
        wearableMetrics, 
        lifestyleProfile,
        timeframe,
        difficultyPreference
      );
      
      const qualityRecommendations = this.generateSleepQualityRecommendations(
        wearableMetrics,
        lifestyleProfile,
        timeframe,
        difficultyPreference
      );
      
      recommendations.push(...durationRecommendations, ...qualityRecommendations);
    }
    
    return recommendations;
  }

  /**
   * Calculate sleep duration score based on hours slept
   * @param wearableMetrics Wearable metrics array
   * @param lifestyleProfile User's lifestyle profile
   * @returns Sleep duration score (0-1)
   */
  private calculateSleepDurationScore(wearableMetrics: any[], lifestyleProfile: any): number {
    // Try to get sleep duration from wearable metrics first
    let sleepHours = this.calculateAverageSleepHours(wearableMetrics, lifestyleProfile);
    
    // If no wearable data, use lifestyle profile
    if (sleepHours === 0) {
      sleepHours = lifestyleProfile?.sleepHoursAvg || 0;
    }
    
    // National Sleep Foundation recommends 7-9 hours for adults
    // Score: <5 hours = 0.0, 5-6 hours = 0.0-0.4, 6-7 hours = 0.4-0.7, 7-9 hours = 0.7-1.0, >9 hours = 1.0
    if (sleepHours < 5) {
      return 0.0;
    } else if (sleepHours <= 6) {
      return (sleepHours - 5) * 0.4; // 0.0-0.4 range
    } else if (sleepHours <= 7) {
      return 0.4 + ((sleepHours - 6) * 0.3); // 0.4-0.7 range
    } else if (sleepHours <= 9) {
      return 0.7 + ((sleepHours - 7) * 0.3 / 2); // 0.7-1.0 range
    } else {
      return 1.0; // Cap at 1.0 for >9 hours (though excessive sleep may not be better)
    }
  }

  /**
   * Calculate sleep quality score based on wearable data and self-report
   * @param wearableMetrics Wearable metrics array
   * @param lifestyleProfile User's lifestyle profile
   * @returns Sleep quality score (0-1)
   */
  private calculateSleepQualityScore(wearableMetrics: any[], lifestyleProfile: any): number {
    // Try to get sleep quality from wearable metrics (restlessness, heart rate variability, etc.)
    let qualityFromWearables = this.calculateWearableSleepQuality(wearableMetrics);
    
    // If no wearable data, use lifestyle profile self-report
    if (qualityFromWearables === 0.5) { // Neutral default
      const qualityMap: Record<string, number> = {
        'excellent': 1.0,
        'very good': 0.8,
        'good': 0.6,
        'fair': 0.4,
        'poor': 0.2,
        'very poor': 0.0
      };
      return qualityMap[lifestyleProfile?.sleepQuality?.toLowerCase() || ''] || 0.5;
    }
    
    // Combine wearable data with self-report if available
    const selfReportScore = lifestyleProfile?.sleepQuality ? 
      this.mapSleepQualityToScore(lifestyleProfile.sleepQuality) : 
      0.5;
    
    return (qualityFromWearables * 0.7) + (selfReportScore * 0.3);
  }

  /**
   * Calculate sleep consistency score based on night-to-night variability
   * @param wearableMetrics Wearable metrics array
   * @returns Sleep consistency score (0-1)
   */
  private calculateSleepConsistencyScore(wearableMetrics: any[]): number {
    const sleepMetrics = wearableMetrics
      .filter(m => m.metricType === 'SLEEP_DURATION' || m.metricType === 'sleep_duration')
      .map(m => m.value);
    
    if (sleepMetrics.length < 2) return 0.5; // Need at least 2 data points to calculate consistency
    
    // Calculate standard deviation of sleep duration
    const mean = sleepMetrics.reduce((sum, val) => sum + val, 0) / sleepMetrics.length;
    const variance = sleepMetrics.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sleepMetrics.length;
    const stdDev = Math.sqrt(variance);
    
    // Consistency score: lower stdDev = higher consistency
    // Ideal: stdDev < 1 hour = score 1.0
    // Poor: stdDev > 3 hours = score 0.0
    if (stdDev <= 1) {
      return 1.0;
    } else if (stdDev >= 3) {
      return 0.0;
    } else {
      return 1.0 - ((stdDev - 1) / 2); // Linear scale from 1.0 at stdDev=1 to 0.0 at stdDev=3
    }
  }

  /**
   * Calculate average sleep hours from wearable metrics and lifestyle profile
   * @param wearableMetrics Wearable metrics array
   * @param lifestyleProfile User's lifestyle profile
   * @returns Average sleep hours
   */
  private calculateAverageSleepHours(wearableMetrics: any[], lifestyleProfile: any): number {
    // Try to get sleep duration from wearable metrics first
    const sleepMetrics = wearableMetrics
      .filter(m => m.metricType === 'SLEEP_DURATION' || m.metricType === 'sleep_duration')
      .map(m => m.value);
    
    if (sleepMetrics.length > 0) {
      return sleepMetrics.reduce((sum, val) => sum + val, 0) / sleepMetrics.length;
    }
    
    // Fall back to lifestyle profile
    return lifestyleProfile?.sleepHoursAvg || 0;
  }

  /**
   * Calculate sleep quality from wearable metrics (restlessness, heart rate, etc.)
   * @param wearableMetrics Wearable metrics array
   * @returns Sleep quality score from wearables (0-1)
   */
  private calculateWearableSleepQuality(wearableMetrics: any[]): number {
    // Look for sleep quality metrics
    const qualityMetrics = wearableMetrics
      .filter(m => 
        m.metricType === 'SLEEP_QUALITY' || 
        m.metricType === 'sleep_quality' ||
        m.metricType === 'RESTLESSNESS' ||
        m.metricType === 'restlessness'
      );
    
    if (qualityMetrics.length === 0) return 0.5; // Neutral if no data
    
    // Process different types of quality metrics
    let qualityScore = 0.5;
    let count = 0;
    
    for (const metric of qualityMetrics) {
      if (metric.metricType === 'SLEEP_QUALITY' || metric.metricType === 'sleep_quality') {
        // Assume 0-100 scale where higher is better
        const normalized = Math.min(1, Math.max(0, metric.value / 100));
        qualityScore += normalized;
        count++;
      } else if (metric.metricType === 'RESTLESSNESS' || metric.metricType === 'restlessness') {
        // Assume 0-100 scale where lower is better
        const normalized = 1 - Math.min(1, Math.max(0, metric.value / 100));
        qualityScore += normalized;
        count++;
      }
    }
    
    return count > 0 ? qualityScore / count : 0.5;
  }

  /**
   * Map sleep quality string to score
   * @param quality Sleep quality string
   * @returns Score (0-1)
   */
  private mapSleepQualityToScore(quality: string): number {
    const qualityMap: Record<string, number> = {
      'excellent': 1.0,
      'very good': 0.8,
      'good': 0.6,
      'fair': 0.4,
      'poor': 0.2,
      'very poor': 0.0
    };
    return qualityMap[quality.toLowerCase() || ''] || 0.5;
  }

  /**
   * Generate sleep duration-based recommendations
   * @param wearableMetrics Wearable metrics array
   * @param lifestyleProfile User's lifestyle profile
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] Sleep duration recommendations
   */
  private generateSleepDurationRecommendations(
    wearableMetrics: any[],
    lifestyleProfile: any,
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    
    const avgSleepHours = this.calculateAverageSleepHours(wearableMetrics, lifestyleProfile);
    
    // If sleep duration is below recommended level, generate recommendations
    if (avgSleepHours < 7) { // Less than 7 hours/night
      const targetIncrease = Math.min(1.5, 8 - avgSleepHours); // Aim for 8 hours but cap increase
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
        category: 'sleep',
        title: 'Increase Sleep Duration',
        description: `Gradually increase your sleep to reach ${(avgSleepHours + targetIncrease).toFixed(1)} hours per night`,
        specificGoal: `Sleep an additional ${targetIncrease.toFixed(1)} hours per night`,
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: ['blackout curtains', 'white noise machine', 'sleep tracking app'],
        priority: avgSleepHours < 6 ? 'high' : 'medium'
      });
    }
    // If sleep duration is above recommended level, generate recommendations
    else if (avgSleepHours > 9) { // More than 9 hours/night
      const targetDecrease = Math.min(1.5, avgSleepHours - 7); // Aim for 7-8 hours but cap decrease
      const difficulty = difficultyPreference || 'moderate';
      let timeframeStr = '2 weeks';
      let estimatedImpact = 12; // Points improvement on lifestyle score
      
      if (timeframe === 'short') {
        timeframeStr = '1 week';
        estimatedImpact = 8;
      } else if (timeframe === 'long') {
        timeframeStr = '1 month';
        estimatedImpact = 18;
      }
      
      recommendations.push({
        userId: '', // Will be filled by service
        category: 'sleep',
        title: 'Optimize Sleep Duration',
        description: `Gradually reduce your sleep to reach ${(avgSleepHours - targetDecrease).toFixed(1)} hours per night for optimal health`,
        specificGoal: `Reduce sleep by ${targetDecrease.toFixed(1)} hours per night`,
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: ['alarm clock', 'sleep tracking app', 'morning light exposure'],
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate sleep quality-based recommendations
   * @param wearableMetrics Wearable metrics array
   * @param lifestyleProfile User's lifestyle profile
   * @param timeframe Timeframe for recommendations
   * @param difficultyPreference Preferred difficulty level
   * @returns LifestyleRecommendationInput[] Sleep quality recommendations
   */
  private generateSleepQualityRecommendations(
    wearableMetrics: any[],
    lifestyleProfile: any,
    timeframe: 'short' | 'medium' | 'long' | undefined,
    difficultyPreference: 'easy' | 'moderate' | 'hard' | undefined
  ): LifestyleRecommendationInput[] {
    const recommendations: LifestyleRecommendationInput[] = [];
    
    const qualityScore = this.calculateWearableSleepQuality(wearableMetrics);
    
    // If sleep quality is below recommended level, generate recommendations
    if (qualityScore < 0.6) { // Below 60% quality
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
        category: 'sleep',
        title: 'Improve Sleep Quality',
        description: 'Improve your sleep hygiene to enhance sleep quality and feel more rested',
        specificGoal: 'Achieve restful sleep with fewer awakenings',
        difficultyLevel: difficulty,
        estimatedImpact,
        timeframeToSeeResults: timeframeStr,
        requiredResources: [
          'blackout curtains', 
          'white noise machine', 
          'cooling mattress pad',
          'blue light blocking glasses',
          'sleep tracking app'
        ],
        priority: qualityScore < 0.4 ? 'high' : 'medium'
      });
    }
    
    return recommendations;
  }
}