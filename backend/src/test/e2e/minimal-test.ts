/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/test/e2e/minimal-test.ts
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
 * minimal-test — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
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
 - testing
 - common
 *
 * Dependencies:
 - testing
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

import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { Controller, Get, Injectable } from '@nestjs/common';

@Injectable()
class TestService {}

@Controller('test')
class TestController {
  constructor(private readonly svc: TestService) {}
  @Get()
  get() { return this.svc ? 'ok' : 'undefined'; }
}

const paramTypes = Reflect.getMetadata('design:paramtypes', TestController);
console.log('design:paramtypes:', paramTypes);
console.log('design:paramtypes[0]:', paramTypes?.[0]?.name);

async function main() {
  const builder = Test.createTestingModule({
    controllers: [TestController],
    providers: [TestService],
  });
  const mod = await builder.compile();
  const app = mod.createNestApplication();
  await app.init();

  try {
    const ctrl = app.get(TestController);
    console.log('Controller.svc:', typeof (ctrl as any).svc);
  } catch (e: any) {
    console.log('Error getting controller:', e.message);
  }

  try {
    const svc = app.get(TestService);
    console.log('Service from app.get:', typeof svc);
  } catch (e: any) {
    console.log('Error getting service:', e.message);
  }

  await app.close();
}

main().catch(console.error);
