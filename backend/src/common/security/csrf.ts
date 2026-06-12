/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/security/csrf.ts
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
 * csrf — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - backend/src/common/services/wysh-id.service.ts
 - backend/src/test/e2e/workflows.e2e-spec.ts
 - backend/src/modules/vault/vault.service.ts
 - backend/src/providers/storage/storage.service.ts
 - backend/src/common/middleware/correlation-id.middleware.ts
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

import { createHmac, randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';

export const CSRF_COOKIE_NAME = 'wyshcare_csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

function getCookieSecret() {
  return process.env.COOKIE_SECRET?.trim() || '';
}

export function issueCsrfToken() {
  const token = randomBytes(32).toString('hex');
  const signature = createHmac('sha256', getCookieSecret()).update(token).digest('hex');
  return `${token}.${signature}`;
}

export function validateCsrfToken(token: string | undefined, cookieValue: string | undefined) {
  if (!token || !cookieValue || token !== cookieValue) {
    return false;
  }

  const [rawToken, signature] = token.split('.');
  if (!rawToken || !signature) {
    return false;
  }

  const expected = createHmac('sha256', getCookieSecret()).update(rawToken).digest('hex');
  return expected === signature;
}

export function shouldCheckCsrf(request: Request) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return false;
  }

  const path = request.path ?? request.url;
  return !['/api/v1/auth/csrf', '/api/v1/payments/webhooks/razorpay'].includes(path);
}

export function csrfMiddleware(request: Request, response: Response, next: (error?: unknown) => void) {
  if (!shouldCheckCsrf(request)) {
    next();
    return;
  }

  const token = request.header(CSRF_HEADER_NAME);
  const cookie = request.cookies?.[CSRF_COOKIE_NAME];

  if (!validateCsrfToken(token, cookie)) {
    response.status(403).json({
      success: false,
      error: {
        statusCode: 403,
        message: 'CSRF token is missing or invalid',
      },
      requestId: request.header('x-request-id'),
    });
    return;
  }

  next();
}
