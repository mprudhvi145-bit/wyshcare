/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/middleware/request-id.middleware.ts
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
 * request-id.middleware — WyshID module
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
 - backend/src/common/middleware/correlation-id.middleware.ts
 - backend/src/providers/razorpay/razorpay.service.ts
 - backend/src/test/e2e/setup.ts
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

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction) {
  const requestId = request.header('x-request-id') ?? randomUUID();

  request.headers['x-request-id'] = requestId;
  response.setHeader('x-request-id', requestId);
  next();
}
