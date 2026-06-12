/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/providers/rabbitmq/rabbitmq.module.ts
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
 * NestJS module: wires providers, controllers, and imports for rabbitmq
 *
 * Responsibilities:
 * - Configure dependency injection for rabbitmq
 * - Register controllers, services, and providers
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
 - nestjs-rabbitmq
 *
 * Dependencies:
 - common
 - nestjs-rabbitmq
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

import { Module, DynamicModule } from '@nestjs/common';
import { RabbitMQModule as GolevelupRabbitMQ } from '@golevelup/nestjs-rabbitmq';

@Module({})
export class RabbitMQModule {
  static forRoot(): DynamicModule {
    const rabbitmqUrl = process.env.RABBITMQ_URL;
    const enabled = process.env.RABBITMQ_ENABLED === 'true';

    if (!enabled || !rabbitmqUrl) {
      return {
        module: RabbitMQModule,
        providers: [
          {
            provide: 'RABBITMQ_ENABLED',
            useValue: false,
          },
        ],
        exports: ['RABBITMQ_ENABLED'],
      };
    }

    return {
      module: RabbitMQModule,
      imports: [
        GolevelupRabbitMQ.forRoot({
          exchanges: [
            {
              name: 'domain-events',
              type: 'topic',
            },
            {
              name: 'notifications',
              type: 'topic',
            },
            {
              name: 'analytics',
              type: 'topic',
            },
          ],
          uri: rabbitmqUrl,
          connectionInitOptions: { wait: false },
          enableControllerDiscovery: true,
          defaultRpcTimeout: 30000,
        }),
      ],
      providers: [
        {
          provide: 'RABBITMQ_ENABLED',
          useValue: true,
        },
      ],
      exports: ['RABBITMQ_ENABLED'],
    };
  }
}
