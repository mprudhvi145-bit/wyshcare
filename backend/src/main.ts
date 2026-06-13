/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/main.ts
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
 * main — AI module
 *
 * Responsibilities:
 * - Support ai functionality
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 - backend/src/modules/search/search.controller.ts
 *
 * Calls:
 - cookie-parser
 - core
 - helmet
 - swagger
 - common
 *
 * Dependencies:
 - cookie-parser
 - core
 - helmet
 - swagger
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

import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import express from 'express';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ApiEnvelopeInterceptor } from './common/interceptors/api-envelope.interceptor';
import { MetricsController } from './modules/metrics/metrics.controller';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { correlationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

function assertSecrets() {
  const required = [
    'JWT_SECRET',
    'STORAGE_SIGNING_SECRET',
    'MASTER_ENCRYPTION_KEY',
  ];

  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`[FATAL] Missing required environment secrets: ${missing.join(', ')}`);
    process.exit(1);
  }

  const insecureDefaults = [
    'replace-with-strong-secret',
    'replace-with-storage-signing-secret',
    'replace-me',
    'DEV_SECRET_CHANGE_IN_PROD',
  ];

  const insecure = required.filter((k) => {
    const val = process.env[k];
    return val && insecureDefaults.some((def) => val.includes(def) || val === def);
  });

  if (insecure.length) {
    console.error(`[FATAL] Insecure placeholder values detected for environment secrets: ${insecure.join(', ')}`);
    process.exit(1);
  }
}

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV ?? 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  enabled: !!process.env.SENTRY_DSN,
});

process.on('unhandledRejection', (reason) => {
  Sentry.captureException(reason);
});

process.on('uncaughtException', (error) => {
  Sentry.captureException(error);
});

async function bootstrap() {
  assertSecrets();
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://127.0.0.1:3000,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(correlationIdMiddleware);
  app.use(requestIdMiddleware);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'same-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      noSniff: true,
      xssFilter: true,
      hidePoweredBy: true,
      frameguard: { action: 'deny' },
      ieNoOpen: true,
      dnsPrefetchControl: { allow: false },
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
  app.useGlobalInterceptors(new MetricsInterceptor(app.get(MetricsController)));
  app.useGlobalFilters(new HttpExceptionFilter());

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('WyshCare API')
      .setDescription('Consumer healthcare infrastructure platform APIs')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 30013);
}

void bootstrap();
