/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph-v2/prevention.service.ts
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
 * Business logic service for health-graph-v2
 *
 * Responsibilities:
 * - Execute business logic for health graph operations
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
 - client
 - common
 - crypto
 *
 * Dependencies:
 - client
 - common
 - crypto
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Health Graph
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
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';

export interface Recommendation {
  recommendation: string;
  category: string;
  dueDate?: Date;
  riskFactor?: string;
  source: string;
}

@Injectable()
export class PreventionService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(userId: string) {
    const [lifestyle, familyHistory, existing] = await Promise.all([
      this.prisma.lifestyleProfile.findUnique({ where: { userId } }),
      this.prisma.familyHistory.findMany({ where: { userId } }),
      this.prisma.preventiveRecommendation.findMany({ where: { userId, status: { not: 'COMPLETED' } } }),
    ]);

    const existingSet = new Set(existing.map((r) => r.recommendation));
    const recommendations: Recommendation[] = [];

    const addIfNew = (rec: Recommendation) => {
      if (!existingSet.has(rec.recommendation)) recommendations.push(rec);
    };

    addIfNew({ recommendation: 'Annual health checkup', category: 'CHECKUP', dueDate: this.futureDate(30), source: 'SYSTEM' });
    addIfNew({ recommendation: 'Complete blood count (CBC)', category: 'LAB_TEST', dueDate: this.futureDate(30), source: 'SYSTEM' });
    addIfNew({ recommendation: 'Lipid profile', category: 'LAB_TEST', dueDate: this.futureDate(14), riskFactor: 'cardiovascular', source: 'SYSTEM' });

    if (familyHistory.some((f) => f.condition.toLowerCase() === 'diabetes')) {
      addIfNew({ recommendation: 'HbA1c test', category: 'LAB_TEST', dueDate: this.futureDate(7), riskFactor: 'diabetes family history', source: 'AI' });
      addIfNew({ recommendation: 'Fasting blood glucose', category: 'LAB_TEST', dueDate: this.futureDate(7), riskFactor: 'diabetes family history', source: 'AI' });
    }

    if (familyHistory.some((f) => f.condition.toLowerCase().includes('cancer'))) {
      addIfNew({ recommendation: 'Cancer screening consultation', category: 'SCREENING', dueDate: this.futureDate(14), riskFactor: 'cancer family history', source: 'AI' });
    }

    if (lifestyle?.smokingStatus === 'CURRENT') {
      addIfNew({ recommendation: 'Chest X-ray / lung screening', category: 'SCREENING', dueDate: this.futureDate(30), riskFactor: 'current smoker', source: 'AI' });
      addIfNew({ recommendation: 'Smoking cessation counseling', category: 'LIFESTYLE', dueDate: this.futureDate(7), riskFactor: 'tobacco use', source: 'SYSTEM' });
    }

    if (lifestyle?.activityLevel === 'SEDENTARY') {
      addIfNew({ recommendation: 'Exercise plan consultation', category: 'LIFESTYLE', dueDate: this.futureDate(7), riskFactor: 'sedentary lifestyle', source: 'AI' });
    }

    if (lifestyle?.stressLevel === 'HIGH' || lifestyle?.stressLevel === 'SEVERE') {
      addIfNew({ recommendation: 'Mental wellness check-in', category: 'LIFESTYLE', dueDate: this.futureDate(3), riskFactor: 'high stress', source: 'AI' });
    }

    if (lifestyle?.dietType === 'NON_VEG') {
      addIfNew({ recommendation: 'Dietary counseling for balanced nutrition', category: 'LIFESTYLE', dueDate: this.futureDate(14), source: 'SYSTEM' });
    }

    if (recommendations.length > 0) {
      await this.prisma.preventiveRecommendation.createMany({
        data: recommendations.map((r) => ({
          id: randomUUID(),
          userId,
          ...r,
          updatedAt: new Date(),
        })),
      });
    }

    return { generated: recommendations.length, recommendations };
  }

  async list(userId: string, status?: string) {
    const where: Prisma.PreventiveRecommendationWhereInput = { userId };
    if (status) where.status = status;
    return this.prisma.preventiveRecommendation.findMany({ where, orderBy: { dueDate: 'asc' } });
  }

  async complete(id: string) {
    return this.prisma.preventiveRecommendation.update({ where: { id }, data: { status: 'COMPLETED', completedAt: new Date() } });
  }

  async dismiss(id: string) {
    return this.prisma.preventiveRecommendation.update({ where: { id }, data: { status: 'DISMISSED' } });
  }

  async getStats() {
    const [total, statusDist, categoryDist] = await Promise.all([
      this.prisma.preventiveRecommendation.count(),
      this.prisma.preventiveRecommendation.groupBy({ by: ['status'], _count: true }),
      this.prisma.preventiveRecommendation.groupBy({ by: ['category'], _count: true }),
    ]);
    return {
      total,
      byStatus: Object.fromEntries(statusDist.map((r) => [r.status, r._count])),
      byCategory: Object.fromEntries(categoryDist.map((r) => [r.category, r._count])),
    };
  }

  private futureDate(days: number): Date {
    return new Date(Date.now() + days * 86400000);
  }
}
