/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/middleware/correlation-id.middleware.ts
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
 * correlation-id.middleware — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/src/common/security/csrf.ts
 - backend/src/common/services/wysh-id.service.ts
 - backend/src/test/e2e/workflows.e2e-spec.ts
 - backend/src/modules/vault/vault.service.ts
 - backend/src/providers/storage/storage.service.ts
 - backend/src/providers/razorpay/razorpay.service.ts
 - backend/src/test/e2e/setup.ts
 - backend/src/modules/auth/auth.service.ts
 *
 * Calls:
 - node:crypto
 *
 * Dependencies:
 - node:crypto
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

import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export function correlationIdMiddleware(request: Request, response: Response, next: NextFunction) {
  const correlationId = request.header('x-correlation-id') ?? randomUUID();

  request.correlationId = correlationId;
  request.headers['x-correlation-id'] = correlationId;
  response.setHeader('x-correlation-id', correlationId);
  next();
}
