/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-lifestyle/ai-lifestyle.service.ts
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
 * Business logic service for ai-lifestyle
 *
 * Responsibilities:
 * - Execute business logic for ai operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - event-emitter
 - crypto
 - client
 - common
 *
 * Dependencies:
 - event-emitter
 - crypto
 - client
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

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GeminiService } from '../../providers/gemini/gemini.service';
import { 
  AssessLifestyleDto, 
  GenerateRecommendationsDto,
  LifestyleProfileDto,
  LifestyleScoreDto,
  LifestyleRecommendationDto,
  LifestyleAssessmentHistoryDto
} from './dto/ai-lifestyle.dto';
import { 
  ActivityAssessor,
  NutritionAssessor,
  SleepAssessor,
  StressAssessor,
  SubstanceUseAssessor
} from './assessors';

@Injectable()
export class AiLifestyleService implements OnModuleInit {
  private readonly logger = new Logger(AiLifestyleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly geminiService: GeminiService,
    private readonly activityAssessor: ActivityAssessor,
    private readonly nutritionAssessor: NutritionAssessor,
    private readonly sleepAssessor: SleepAssessor,
    private readonly stressAssessor: StressAssessor,
    private readonly substanceUseAssessor: SubstanceUseAssessor,
  ) {}

  onModuleInit() {
    this.logger.log('AI Lifestyle Engine initialized');
  }

  /**
   * Assess current lifestyle and generate score
   * @param userId The user ID to assess lifestyle for
   * @returns Promise<LifestyleScoreDto> Lifestyle scores
   */
  async assessLifestyle(userId: string): Promise<LifestyleScoreDto> {
    this.logger.log(`Assessing lifestyle for user ${userId}`);

    // Fetch all required data in parallel
    const [
      user,
      wearableMetrics,
      lifestyleProfile,
      healthGoals,
      conditions,
      vitalRecords
    ] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.wearableMetric.findMany({
        where: { userId, recordedAt: { gte: new Date(Date.now() - 30 * 86400000) } },
        orderBy: { recordedAt: 'desc' },
        take: 1000
      }),
      this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.healthGoal.findMany({ where: { userId, status: 'ACTIVE' } }),
      this.prisma.condition.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
      this.prisma.vitalsRecord.findMany({
        where: { patientId: userId },
        orderBy: { recordedAt: 'desc' },
        take: 100
      })
    ]);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Run all lifestyle assessments
    const [
      activityAssessment,
      nutritionAssessment,
      sleepAssessment,
      stressAssessment,
      substanceUseAssessment
    ] = await Promise.all([
      this.activityAssessor.assess({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords
      }),
      this.nutritionAssessor.assess({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords
      }),
      this.sleepAssessor.assess({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords
      }),
      this.stressAssessor.assess({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords
      }),
      this.substanceUseAssessor.assess({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords
      })
    ]);

    // Calculate overall lifestyle score (weighted average)
    const overallScore = Math.round(
      (activityAssessment.score * 0.25 +
       nutritionAssessment.score * 0.25 +
       sleepAssessment.score * 0.20 +
       stressAssessment.score * 0.15 +
       substanceUseAssessment.score * 0.15) * 100
    );

    // Create lifestyle assessment record for history
    const assessmentRecord = await this.prisma.healthScore.create({
      data: {
        userId,
        overallScore,
        physicalScore: Math.round((activityAssessment.score + nutritionAssessment.score) / 2 * 100),
        mentalScore: Math.round((stressAssessment.score + sleepAssessment.score) / 2 * 100),
        lifestyleScore: overallScore,
        sleepScore: Math.round(sleepAssessment.score * 100),
        nutritionScore: Math.round(nutritionAssessment.score * 100),
        adherenceScore: null,
        riskAdjustment: 0,
        factors: {
          activity: JSON.parse(JSON.stringify(activityAssessment.factors)),
          nutrition: JSON.parse(JSON.stringify(nutritionAssessment.factors)),
          sleep: JSON.parse(JSON.stringify(sleepAssessment.factors)),
          stress: JSON.parse(JSON.stringify(stressAssessment.factors)),
          substanceUse: JSON.parse(JSON.stringify(substanceUseAssessment.factors))
        } as Prisma.InputJsonValue,
        periodStart: new Date(Date.now() - 30 * 86400000), // Last 30 days
        periodEnd: new Date(),
        modelVersion: 'v1.0'
      }
    });

    // Emit domain event
    this.eventEmitter.emit('lifestyle.score.updated', {
      userId,
      overallScore,
      activityScore: Math.round(activityAssessment.score * 100),
      nutritionScore: Math.round(nutritionAssessment.score * 100),
      sleepScore: Math.round(sleepAssessment.score * 100),
      stressScore: Math.round(stressAssessment.score * 100),
      substanceUseScore: Math.round(substanceUseAssessment.score * 100),
      assessmentId: assessmentRecord.id
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'LIFESTYLE_ASSESSMENT_COMPLETED',
        resourceType: 'LifestyleAssessment',
        resourceId: assessmentRecord.id,
        patientUserId: userId,
        metadata: {
          overallScore,
          activityScore: Math.round(activityAssessment.score * 100),
          nutritionScore: Math.round(nutritionAssessment.score * 100),
          sleepScore: Math.round(sleepAssessment.score * 100),
          stressScore: Math.round(stressAssessment.score * 100),
          substanceUseScore: Math.round(substanceUseAssessment.score * 100),
          timestamp: new Date().toISOString()
        }
      }
    });

    return {
      userId,
      activityScore: Math.round(activityAssessment.score * 100),
      nutritionScore: Math.round(nutritionAssessment.score * 100),
      sleepScore: Math.round(sleepAssessment.score * 100),
      stressScore: Math.round(stressAssessment.score * 100),
      substanceUseScore: Math.round(substanceUseAssessment.score * 100),
      overallLifestyleScore: overallScore
    };
  }

  /**
   * Generate personalized lifestyle recommendations
   * @param userId The user ID to generate recommendations for
   * @param dto Options for recommendation generation
   * @returns Promise<LifestyleRecommendationDto[]> Array of recommendations
   */
  async generateRecommendations(
    userId: string,
    dto: GenerateRecommendationsDto
  ): Promise<LifestyleRecommendationDto[]> {
    this.logger.log(`Generating lifestyle recommendations for user ${userId}`);

    // Fetch required data
    const [
      user,
      wearableMetrics,
      lifestyleProfile,
      healthGoals,
      conditions,
      vitalRecords,
      recentAssessment
    ] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.wearableMetric.findMany({
        where: { userId, recordedAt: { gte: new Date(Date.now() - 30 * 86400000) } },
        orderBy: { recordedAt: 'desc' },
        take: 1000
      }),
      this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.healthGoal.findMany({ where: { userId, status: 'ACTIVE' } }),
      this.prisma.condition.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
      this.prisma.vitalsRecord.findMany({
        where: { patientId: userId },
        orderBy: { recordedAt: 'desc' },
        take: 100
      }),
      this.prisma.healthScore.findFirst({
        where: { userId },
        orderBy: { calculatedAt: 'desc' }
      })
    ]);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Generate recommendations from each assessor
    const [
      activityRecommendations,
      nutritionRecommendations,
      sleepRecommendations,
      stressRecommendations,
      substanceUseRecommendations
    ] = await Promise.all([
      this.activityAssessor.generateRecommendations({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords,
        recentAssessment,
        focusAreas: dto.focusAreas,
        timeframe: dto.timeframe,
        difficultyPreference: dto.difficultyPreference
      }),
      this.nutritionAssessor.generateRecommendations({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords,
        recentAssessment,
        focusAreas: dto.focusAreas,
        timeframe: dto.timeframe,
        difficultyPreference: dto.difficultyPreference
      }),
      this.sleepAssessor.generateRecommendations({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords,
        recentAssessment,
        focusAreas: dto.focusAreas,
        timeframe: dto.timeframe,
        difficultyPreference: dto.difficultyPreference
      }),
      this.stressAssessor.generateRecommendations({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords,
        recentAssessment,
        focusAreas: dto.focusAreas,
        timeframe: dto.timeframe,
        difficultyPreference: dto.difficultyPreference
      }),
      this.substanceUseAssessor.generateRecommendations({
        userId,
        wearableMetrics,
        lifestyleProfile,
        healthGoals,
        conditions,
        vitalRecords,
        recentAssessment,
        focusAreas: dto.focusAreas,
        timeframe: dto.timeframe,
        difficultyPreference: dto.difficultyPreference
      })
    ]);

    // Flatten and filter recommendations based on focus areas
    let allRecommendations = [
      ...activityRecommendations,
      ...nutritionRecommendations,
      ...sleepRecommendations,
      ...stressRecommendations,
      ...substanceUseRecommendations
    ];

    // Filter by focus areas if specified
    if (dto.focusAreas && dto.focusAreas.length > 0) {
      allRecommendations = allRecommendations.filter(rec =>
        dto.focusAreas!.includes(rec.category as any)
      );
    }

    // Sort by priority and estimated impact
    allRecommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimatedImpact - a.estimatedImpact;
    });

    // Limit to top 10 recommendations
    const limitedRecommendations = allRecommendations.slice(0, 10);

    // Save recommendations to database and emit events
    const savedRecommendations: LifestyleRecommendationDto[] = [];
    for (const rec of limitedRecommendations) {
      const savedRec = await this.prisma.aIRecommendation.create({
        data: {
          userId,
          category: rec.category,
          title: rec.title,
          description: rec.description,
          confidence: 0.8, // Default confidence
          reasoning: {
            specificGoal: rec.specificGoal,
            difficultyLevel: rec.difficultyLevel,
            estimatedImpact: rec.estimatedImpact,
            timeframeToSeeResults: rec.timeframeToSeeResults,
            requiredResources: rec.requiredResources
          } as Prisma.InputJsonValue,
          supportingData: {
            wearableDataPoints: wearableMetrics.length,
            assessmentDate: new Date().toISOString()
          } as Prisma.InputJsonValue,
          source: 'AI_LIFESTYLE_ENGINE',
          modelVersion: 'v1.0',
          priority: rec.priority
        }
      });

      // Emit domain event
      this.eventEmitter.emit('lifestyle.recommendation.generated', {
        userId,
        recommendationId: savedRec.id,
        category: rec.category,
        title: rec.title
      });

      savedRecommendations.push({
        id: savedRec.id,
        userId: savedRec.userId,
        category: savedRec.category as any,
        title: savedRec.title,
        description: savedRec.description ?? '',
        specificGoal: rec.specificGoal,
        difficultyLevel: rec.difficultyLevel,
        estimatedImpact: rec.estimatedImpact,
        timeframeToSeeResults: rec.timeframeToSeeResults,
        requiredResources: rec.requiredResources,
        priority: rec.priority,
        createdAt: savedRec.createdAt
      });
    }

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'LIFESTYLE_RECOMMENDATION_GENERATED',
        resourceType: 'LifestyleRecommendation',
        resourceId: userId,
        patientUserId: userId,
        metadata: {
          recommendationsCount: savedRecommendations.length,
          focusAreas: dto.focusAreas,
          timeframe: dto.timeframe,
          difficultyPreference: dto.difficultyPreference,
          timestamp: new Date().toISOString()
        }
      }
    });

    return savedRecommendations;
  }

  /**
   * Get lifestyle profile for a user
   * @param userId The user ID
   * @returns Promise<LifestyleProfileDto> Lifestyle profile
   */
  async getProfile(userId: string): Promise<LifestyleProfileDto> {
    let profile = await this.prisma.lifestyleProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      // Create default profile if none exists
      profile = await this.prisma.lifestyleProfile.create({
        data: {
          id: randomUUID(),
          userId,
          updatedAt: new Date()
        }
      });
    }

    return {
      userId: profile.userId,
      sleepHoursAvg: profile.sleepHoursAvg ?? undefined,
      sleepQuality: profile.sleepQuality ?? undefined,
      activityLevel: profile.activityLevel ?? undefined,
      exerciseDaysPerWeek: profile.exerciseDaysPerWeek ?? undefined,
      dietType: profile.dietType ?? undefined,
      waterIntakeL: profile.waterIntakeL ?? undefined,
      stressLevel: profile.stressLevel ?? undefined,
      screenTimeHrs: profile.screenTimeHrs ?? undefined,
      smokingStatus: profile.smokingStatus ?? undefined,
      alcoholConsumption: profile.alcoholConsumption ?? undefined,
      occupation: profile.occupation ?? undefined,
      metadata: (profile.metadata as Record<string, unknown>) ?? undefined,
    };
  }

  /**
   * Get lifestyle assessment history for a user
   * @param userId The user ID
   * @param limit Maximum number of records to return
   * @returns Promise<LifestyleAssessmentHistoryDto[]> Assessment history
   */
  async getHistory(userId: string, limit = 50): Promise<LifestyleAssessmentHistoryDto[]> {
    const assessments = await this.prisma.healthScore.findMany({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        overallScore: true,
        physicalScore: true,
        mentalScore: true,
        lifestyleScore: true,
        sleepScore: true,
        nutritionScore: true,
        calculatedAt: true,
        factors: true
      }
    });

    return assessments.map(assessment => ({
      id: assessment.id,
      userId: assessment.userId,
      overallScore: assessment.overallScore || 0,
      activityScore: ((assessment.physicalScore || 0) + (assessment.nutritionScore || 0)) / 2,
      nutritionScore: assessment.nutritionScore || 0,
      sleepScore: assessment.sleepScore || 0,
      stressScore: (assessment.mentalScore || 0) - ((assessment.sleepScore || 0) / 2), // Approximation
      substanceUseScore: 100 - (((assessment.physicalScore || 0) + (assessment.nutritionScore || 0) + (assessment.mentalScore || 0)) / 3), // Approximation
      assessmentDate: assessment.calculatedAt,
      factors: assessment.factors as any
    }));
  }

  /**
   * Get current lifestyle score breakdown for a user
   * @param userId The user ID
   * @returns Promise<LifestyleScoreDto> Current lifestyle scores
   */
  async getScore(userId: string): Promise<LifestyleScoreDto> {
    const latestScore = await this.prisma.healthScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' }
    });

    if (!latestScore) {
      // If no score exists, perform assessment
      return this.assessLifestyle(userId);
    }

    return {
      userId,
      activityScore: ((latestScore.physicalScore || 0) + (latestScore.nutritionScore || 0)) / 2,
      nutritionScore: latestScore.nutritionScore || 0,
      sleepScore: latestScore.sleepScore || 0,
      stressScore: (latestScore.mentalScore || 0) - ((latestScore.sleepScore || 0) / 2), // Approximation
      substanceUseScore: 100 - (((latestScore.physicalScore || 0) + (latestScore.nutritionScore || 0) + (latestScore.mentalScore || 0)) / 3), // Approximation
      overallLifestyleScore: latestScore.overallScore || 0
    };
  }
}