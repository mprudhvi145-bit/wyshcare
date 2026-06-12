/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/scripts/generate-openapi.ts
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
 * generate-openapi — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/src/modules/dashboard/dashboard.controller.ts
 - backend/src/modules/insurance/insurance.controller.ts
 - backend/src/modules/pharmacy/pharmacy.controller.ts
 - backend/src/modules/prescription/prescription.controller.ts
 - backend/src/modules/timeline/timeline.controller.ts
 - backend/src/common/guards/jwt-auth.guard.ts
 - backend/src/main.ts
 - backend/scripts/import-synthea.ts
 *
 * Calls:
 - core
 - path
 - swagger
 - fs
 *
 * Dependencies:
 - core
 - path
 - swagger
 - fs
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

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';

async function generate() {
  process.env.NODE_ENV = 'development';
  process.env.JWT_SECRET = 'test-secret';
  process.env.STORAGE_SIGNING_SECRET = 'test-secret';

  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('WyshCare API')
    .setDescription('Consumer healthcare infrastructure platform APIs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const outputPath = path.join(__dirname, '../../../docs/openapi.json');

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');
  console.log(`OpenAPI specification generated successfully at ${outputPath}`);
  await app.close();
}

generate().catch((err) => {
  console.error('Failed to generate OpenAPI spec:', err);
  process.exit(1);
});
