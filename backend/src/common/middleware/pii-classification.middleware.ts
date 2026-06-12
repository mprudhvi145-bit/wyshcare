/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/middleware/pii-classification.middleware.ts
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
 * pii-classification.middleware — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
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

import type { NextFunction, Request, Response } from 'express';

import { classifyPii, maskPii, type PiiCategory } from '../security/pii-classifier';

declare module 'express' {
  interface Request {
    piiCategories?: PiiCategory[];
    hasPiiInBody?: boolean;
  }
}

export function piiClassificationMiddleware(request: Request, _response: Response, next: NextFunction) {
  const combinedText = [
    request.body ? JSON.stringify(request.body) : '',
    request.query ? JSON.stringify(request.query) : '',
    request.headers['x-pii-context'] as string ?? '',
  ].join(' ');

  if (combinedText.length > 10_000) {
    request.piiCategories = [];
    request.hasPiiInBody = false;
    next();
    return;
  }

  const classification = classifyPii(combinedText);
  request.piiCategories = classification.categories;
  request.hasPiiInBody = classification.hasPii;

  if (classification.hasPii && request.body) {
    for (const key of Object.keys(request.body)) {
      if (typeof request.body[key] === 'string' && ['aadhaar', 'pan', 'phone', 'email', 'abha'].some((cat) => classification.categories.includes(cat as PiiCategory))) {
        const masked = maskPii(request.body[key]);
        if (masked !== request.body[key]) {
          request.body[`${key}_masked`] = masked;
        }
      }
    }
  }

  next();
}
