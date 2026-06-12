/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/services/error-budget.service.ts
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
 * - Execute business logic for wyshid operations
 * - Coordinate data access and external API calls
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
WyshID
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

export interface ErrorBudget {
  totalRequests: number;
  errorCount: number;
  errorBudget: number;
  budgetRemaining: number;
  slo: number;
}

interface ServiceBudget {
  totalRequests: number;
  errorCount: number;
  windowStart: number;
}

@Injectable()
export class ErrorBudgetService {
  private readonly services = new Map<string, ServiceBudget>();
  private readonly windowMs = 30 * 24 * 60 * 60_000;
  private readonly defaultSlo = 0.995;

  recordSuccess(service: string) {
    this.ensureWindow(service);
    const budget = this.services.get(service)!;
    budget.totalRequests += 1;
  }

  recordError(service: string) {
    this.ensureWindow(service);
    const budget = this.services.get(service)!;
    budget.totalRequests += 1;
    budget.errorCount += 1;
  }

  getBudget(service: string): ErrorBudget | null {
    this.ensureWindow(service);
    const budget = this.services.get(service);
    if (!budget || budget.totalRequests === 0) return null;

    const slo = this.defaultSlo;
    const actualAvailability = 1 - budget.errorCount / budget.totalRequests;
    const errorBudget = 1 - slo;
    const budgetUsed = 1 - actualAvailability;
    const budgetRemaining = Math.max(0, errorBudget - budgetUsed);

    return {
      totalRequests: budget.totalRequests,
      errorCount: budget.errorCount,
      errorBudget,
      budgetRemaining,
      slo,
    };
  }

  getAllBudgets(): Array<{ service: string } & ErrorBudget> {
    return Array.from(this.services.keys())
      .map((service) => {
        const budget = this.getBudget(service);
        return budget ? { service, ...budget } : null;
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);
  }

  private ensureWindow(service: string) {
    const existing = this.services.get(service);
    const now = Date.now();

    if (!existing || now - existing.windowStart > this.windowMs) {
      this.services.set(service, { totalRequests: 0, errorCount: 0, windowStart: now });
    }
  }
}
