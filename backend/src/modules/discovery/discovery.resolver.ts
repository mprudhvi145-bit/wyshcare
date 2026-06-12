/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/discovery/discovery.resolver.ts
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
 * discovery.resolver — Discovery module
 *
 * Responsibilities:
 * - Support discovery functionality
 *
 * Used By:
 - backend/src/modules/ai/ai.resolver.ts
 - backend/src/app.module.ts
 - backend/src/modules/discovery/discovery.controller.ts
 - backend/src/modules/discovery/discovery.module.ts
 - backend/src/modules/ai/entities/symptom-analysis.entity.ts
 - backend/src/modules/discovery/entities/discovery-result.entity.ts
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
Discovery
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

import { Args, Query, Resolver } from '@nestjs/graphql';

import { DiscoveryResult } from './entities/discovery-result.entity';
import { DiscoveryService } from './discovery.service';

@Resolver(() => DiscoveryResult)
export class DiscoveryResolver {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Query(() => [DiscoveryResult])
  searchProviders(@Args('query', { nullable: true }) query?: string) {
    return this.discoveryService.search(query);
  }
}
