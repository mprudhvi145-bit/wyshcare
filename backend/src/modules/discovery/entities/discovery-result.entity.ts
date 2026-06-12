/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/discovery/entities/discovery-result.entity.ts
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
 * TypeORM entity: database model for discovery-result
 *
 * Responsibilities:
 * - Define TypeORM entity for discovery-result
 *
 * Used By:
 - backend/src/app.module.ts
 - backend/src/modules/ai/entities/symptom-analysis.entity.ts
 - backend/src/modules/ai/ai.resolver.ts
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

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DiscoveryResult {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  specialization!: string;

  @Field(() => Float)
  rating!: number;

  @Field(() => Float)
  consultationFee!: number;

  @Field()
  telemedicineAvailable!: boolean;
}
