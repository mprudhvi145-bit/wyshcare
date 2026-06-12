/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/health-graph-v2/dto/health-graph.dto.ts
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
 * Data Transfer Object: defines request/response shape for Health Graph
 *
 * Responsibilities:
 * - Define request validation schema
 * - Document API contract for Health Graph
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

export class UpdateLifestyleDto {
  sleepHoursAvg?: number;
  sleepQuality?: string;
  activityLevel?: string;
  exerciseDaysPerWeek?: number;
  dietType?: string;
  waterIntakeL?: number;
  stressLevel?: string;
  screenTimeHrs?: number;
  smokingStatus?: string;
  alcoholConsumption?: string;
  occupation?: string;
  metadata?: Record<string, unknown>;
}

export class RecordSymptomDto {
  symptom!: string;
  severity?: number;
  duration?: string;
  bodyPart?: string;
  triggers?: string[];
  notes?: string;
}

export class SyncWearableDto {
  source!: string;
  metrics!: Array<{
    metricType: string;
    value: number;
    unit: string;
    recordedAt: string;
    metadata?: Record<string, unknown>;
  }>;
}

export class AddFamilyHistoryDto {
  relation!: string;
  condition!: string;
  diagnosisAge?: number;
  isDeceased?: boolean;
  notes?: string;
}

export class RiskQueryDto {
  includeDrivers?: boolean;
  includeActions?: boolean;
}
