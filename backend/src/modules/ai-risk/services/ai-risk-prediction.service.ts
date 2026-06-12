/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai-risk/services/ai-risk-prediction.service.ts
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
 * Business logic service for services
 *
 * Responsibilities:
 * - Execute business logic for ai operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - event-emitter
 - crypto
 - common
 *
 * Dependencies:
 - event-emitter
 - crypto
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
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  RiskAssessment, 
  RiskAssessments, 
  RiskPredictionData,
  RiskHistoryResponse
} from '../interfaces/ai-risk.interface';
import { 
  CardiovascularRiskAssessor,
  DiabetesRiskAssessor,
  HypertensionRiskAssessor,
  KidneyDiseaseRiskAssessor,
  MentalHealthRiskAssessor,
  ReadmissionRiskAssessor,
  MedicationAdherenceRiskAssessor,
  FrailtyRiskAssessor,
  MortalityRiskAssessor
} from './assessors';
import { FamilyRiskEngineService } from '../../digital-twin/engines/family-risk-engine.service';

@Injectable()
export class AIRiskPredictionService implements OnModuleInit {
  private readonly logger = new Logger(AIRiskPredictionService.name);

constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly familyHistoryService: FamilyRiskEngineService,
    private readonly cardiovascularAssessor: CardiovascularRiskAssessor,
    private readonly diabetesAssessor: DiabetesRiskAssessor,
    private readonly hypertensionAssessor: HypertensionRiskAssessor,
    private readonly kidneyDiseaseAssessor: KidneyDiseaseRiskAssessor,
    private readonly mentalHealthAssessor: MentalHealthRiskAssessor,
    private readonly readmissionAssessor: ReadmissionRiskAssessor,
    private readonly medicationAdherenceAssessor: MedicationAdherenceRiskAssessor,
    private readonly frailtyAssessor: FrailtyRiskAssessor,
    private readonly mortalityAssessor: MortalityRiskAssessor,
) {}

  onModuleInit() {
    this.logger.log('AI Risk Prediction Engine initialized');
  }

  /**
   * Assess all risk types for a user
   * @param userId The user ID to assess risks for
   * @returns Promise<RiskAssessments> All risk assessments
   */
  async assessAllRisks(userId: string): Promise<RiskAssessments> {
    this.logger.log(`Assessing all risks for user ${userId}`);

    // Fetch all required data in parallel
    const [
      user,
      conditions,
      vitals,
      wearables,
      lifestyle,
      familyHistory,
      medicationAdmins,
      clinicalOrders,
      symptoms,
      labResults,
      prescriptions
    ] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.condition.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
      this.prisma.vitalsRecord.findFirst({ where: { patientId: userId }, orderBy: { recordedAt: 'desc' } }),
      this.prisma.wearableMetric.findMany({
        where: { userId, recordedAt: { gte: new Date(Date.now() - 30 * 86400000) } },
        orderBy: { recordedAt: 'desc' },
        take: 1000
      }),
      this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.familyHistory.findMany({ where: { userId } }),
      this.prisma.medicationAdministration.findMany({
        where: { patientId: userId, scheduledTime: { gte: new Date(Date.now() - 90 * 86400000) } },
      }),
      this.prisma.clinicalOrder.findMany({ where: { patientId: userId, status: 'ACTIVE' } }),
      this.prisma.symptomEvent.findMany({ where: { userId, resolvedAt: null } }),
      this.prisma.labResult.findMany({
        where: { DiagnosticOrder: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      this.prisma.prescription.findMany({
        where: { patientUserId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    ]);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Calculate age
    const age = user.dateOfBirth ? this.calculateAge(user.dateOfBirth) : null;

    // Run all risk assessments
    const assessments: RiskAssessments = {
      CARDIOVASCULAR: await this.cardiovascularAssessor.assess({
        userId,
        age,
        conditions,
        vitals,
        wearables,
        lifestyle,
        familyHistory,
        medicationAdmins,
        clinicalOrders,
        symptoms,
        labResults,
        prescriptions
      }),
      DIABETES: await this.diabetesAssessor.assess({
        userId,
        age,
        conditions,
        vitals,
        wearables,
        lifestyle,
        familyHistory,
        medicationAdmins,
        clinicalOrders,
        symptoms,
        labResults,
        prescriptions
      }),
      HYPERTENSION: await this.hypertensionAssessor.assess({
        userId,
        age,
        conditions,
        vitals,
        wearables,
        lifestyle,
        familyHistory,
        medicationAdmins,
        clinicalOrders,
        symptoms,
        labResults,
        prescriptions
      }),
      KIDNEY_DISEASE: await this.kidneyDiseaseAssessor.assess({
        userId,
        age,
        conditions,
        vitals,
        wearables,
        lifestyle,
        familyHistory,
        medicationAdmins,
        clinicalOrders,
        symptoms,
        labResults,
        prescriptions
      }),
      MENTAL_HEALTH: await this.mentalHealthAssessor.assess({
        userId,
        age,
        conditions,
        vitals,
        wearables,
        lifestyle,
        familyHistory,
        medicationAdmins,
        clinicalOrders,
        symptoms,
        labResults,
        prescriptions
      }),
      READMISSION: await this.readmissionAssessor.assess({
        userId,
        age,
        conditions,
        vitals,
        wearables,
        lifestyle,
        familyHistory,
        medicationAdmins,
        clinicalOrders,
        symptoms,
        labResults,
        prescriptions
      }),
      MEDICATION_ADHERENCE: await this.medicationAdherenceAssessor.assess({
        userId,
        age,
        conditions,
        vitals,
        wearables,
        lifestyle,
        familyHistory,
        medicationAdmins,
        clinicalOrders,
        symptoms,
        labResults,
        prescriptions
      }),
      FRAILTY: await this.frailtyAssessor.assess({
        userId,
        age,
        conditions,
        vitals,
        wearables,
        lifestyle,
        familyHistory,
        medicationAdmins,
        clinicalOrders,
        symptoms,
        labResults,
        prescriptions
      }),
      MORTALITY: await this.mortalityAssessor.assess({
        userId,
        age,
        conditions,
        vitals,
        wearables,
        lifestyle,
        familyHistory,
        medicationAdmins,
        clinicalOrders,
        symptoms,
        labResults,
        prescriptions
      })
    };

    // Emit events for each risk type calculated
    Object.entries(assessments).forEach(([riskType, assessment]) => {
      this.eventEmitter.emit('risk.calculated', {
        userId,
        riskType,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        drivers: assessment.drivers,
        recommendedActions: assessment.recommendedActions,
        modelVersion: assessment.modelVersion
      });
    });

    return assessments;
  }

  /**
   * Save risk predictions to database
   * @param userId The user ID
   * @param assessments The risk assessments to save
   */
  async savePredictions(userId: string, assessments: RiskAssessments): Promise<void> {
    this.logger.log(`Saving risk predictions for user ${userId}`);

    const twin = await this.prisma.digitalTwin.findUnique({ where: { userId } });
    const twinId = twin?.id ?? null;

    const now = new Date();
    const riskTypes = Object.keys(assessments);

    // Delete existing predictions for these risk types
    await this.prisma.riskPrediction.deleteMany({
      where: { userId, riskType: { in: riskTypes } },
    });

    // Create new predictions
    await this.prisma.riskPrediction.createMany({
      data: riskTypes.map(type => {
        const assessment = assessments[type]!;
        return {
          id: randomUUID(),
          userId,
          twinId,
          riskType: type,
          riskScore: assessment.riskScore,
          riskLevel: assessment.riskLevel,
          drivers: assessment.drivers,
          recommendedActions: assessment.recommendedActions,
          modelVersion: assessment.modelVersion,
          calculatedAt: now,
          expiresAt: new Date(now.getTime() + 30 * 86400000), // 30 days expiration
          predictionType: this.mapRiskTypeToPredictionType(type) as any,
        };
      }),
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'RISK_PREDICTION_CALCULATED',
        resourceType: 'RiskPrediction',
        resourceId: userId,
        patientUserId: userId,
        metadata: {
          riskTypes: riskTypes,
          timestamp: now.toISOString()
        }
      }
    });

    // Check for significant risk level changes and update timeline
    await this.checkAndUpdateTimeline(userId, assessments);
  }

  /**
   * Get risk history for a user
   * @param userId The user ID
   * @param limit Maximum number of records to return
   * @returns Promise<RiskHistoryResponse> Risk history
   */
  async getHistory(userId: string, limit = 50): Promise<RiskHistoryResponse> {
    const [predictions, totalCount] = await Promise.all([
      this.prisma.riskPrediction.findMany({
        where: { userId },
        orderBy: { calculatedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          riskType: true,
          riskScore: true,
          riskLevel: true,
          drivers: true,
          recommendedActions: true,
          calculatedAt: true,
          expiresAt: true
        }
      }),
      this.prisma.riskPrediction.count({ where: { userId } })
    ]);

    return {
      predictions,
      totalCount
    };
  }

  /**
   * Get latest risk predictions for a user
   * @param userId The user ID
   * @returns Promise<RiskAssessments> Latest risk assessments
   */
  async getLatest(userId: string): Promise<RiskAssessments> {
    const predictions = await this.prisma.riskPrediction.findMany({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      distinct: ['riskType'],
      select: {
        riskType: true,
        riskScore: true,
        riskLevel: true,
        drivers: true,
        recommendedActions: true,
        modelVersion: true
      }
    });

    const assessments: RiskAssessments = {};
    predictions.forEach(pred => {
      assessments[pred.riskType] = {
        riskScore: pred.riskScore,
        riskLevel: pred.riskLevel as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
        drivers: pred.drivers,
        recommendedActions: pred.recommendedActions,
        modelVersion: pred.modelVersion || 'v1.0'
      };
    });

    return assessments;
  }

  /**
   * Calculate age from date of birth
   * @param dob Date of birth
   * @returns Age in years
   */
  private calculateAge(dob: Date): number {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }

  /**
   * Map risk type to prediction type enum
   * @param riskType The risk type string
   * @returns Corresponding PredictionType enum value
   */
  private mapRiskTypeToPredictionType(riskType: string): string {
    const mapping: Record<string, string> = {
      CARDIOVASCULAR: 'CARDIOVASCULAR_EVENT',
      DIABETES: 'DIABETES_PROGRESSION',
      HYPERTENSION: 'HYPERTENSION_RISK',
      KIDNEY_DISEASE: 'KIDNEY_DISEASE',
      MENTAL_HEALTH: 'MENTAL_HEALTH',
      READMISSION: 'READMISSION_RISK',
      MEDICATION_ADHERENCE: 'MEDICATION_NON_ADHERENCE',
      FRAILTY: 'FALL_RISK',
      MORTALITY: 'MORTALITY'
    };

    return mapping[riskType] || 'CARDIOVASCULAR_EVENT';
  }

  /**
   * Check for significant risk level changes and update timeline
   * @param userId The user ID
   * @param currentAssessments Current risk assessments
   */
  private async checkAndUpdateTimeline(userId: string, currentAssessments: RiskAssessments): Promise<void> {
    // Get previous assessments
    const previousPredictions = await this.prisma.riskPrediction.findMany({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      take: 20 // Get recent predictions to compare
    });

    // Group previous predictions by risk type
    const previousAssessments: Record<string, { riskLevel: string }> = {};
    previousPredictions.forEach(pred => {
      if (!previousAssessments[pred.riskType]) {
        previousAssessments[pred.riskType] = { riskLevel: pred.riskLevel };
      }
    });

    // Check for significant changes (2+ level changes)
    const riskLevelValues = { LOW: 0, MODERATE: 1, HIGH: 2, CRITICAL: 3 };
    const significantChanges: string[] = [];

    Object.entries(currentAssessments).forEach(([riskType, current]) => {
      const previous = previousAssessments[riskType];
      if (previous) {
        const currentLevel = riskLevelValues[current.riskLevel];
        const previousLevel = riskLevelValues[previous.riskLevel as keyof typeof riskLevelValues] ?? 0;
        const change = Math.abs(currentLevel - previousLevel);

        if (change >= 2) {
          significantChanges.push(`${riskType}: ${previous.riskLevel} → ${current.riskLevel}`);
        }
      }
    });

    // If there are significant changes, create timeline event
    if (significantChanges.length > 0) {
      await this.prisma.timelineEvent.create({
        data: {
          userId,
          type: 'CDS_ALERT',
          title: 'Significant Risk Level Change Detected',
          summary: `Risk levels changed significantly for: ${significantChanges.join(', ')}`,
          metadata: {
            changes: significantChanges,
            timestamp: new Date().toISOString()
          },
          occurredAt: new Date()
        }
      });
    }
  }
}