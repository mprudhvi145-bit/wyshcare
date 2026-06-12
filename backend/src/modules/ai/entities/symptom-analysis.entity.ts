/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/ai/entities/symptom-analysis.entity.ts
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
 * TypeORM entity: database model for symptom-analysis
 *
 * Responsibilities:
 * - Define TypeORM entity for symptom-analysis
 *
 * Used By:
 - backend/src/app.module.ts
 - backend/src/modules/ai/ai.resolver.ts
 - backend/src/modules/discovery/entities/discovery-result.entity.ts
 - backend/src/modules/discovery/discovery.resolver.ts
 *
 * Calls:
 - graphql
 *
 * Dependencies:
 - graphql
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Database
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

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SymptomAnalysis {
  @Field()
  summary!: string;

  @Field()
  urgency!: string;

  @Field(() => [String])
  nextSteps!: string[];

  @Field(() => [String])
  recommendedSpecialties!: string[];

  @Field(() => [String])
  safetyNotes!: string[];

  @Field()
  emergencyEscalation!: boolean;
}
