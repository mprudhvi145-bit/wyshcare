/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/next.config.ts
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
 * next.config — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/fix-unused-v2.mjs
 - backend/scripts/generate-openapi.ts
 - backend/scripts/import-synthea.ts
 - backend/scripts/auto-comment-invalid-routes.mjs
 - backend/scripts/scan-route-service-mismatches.mjs
 - backend/scripts/import-fhir.ts
 *
 * Calls:
 - path
 *
 * Dependencies:
 - path
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

import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '..'),
  poweredByHeader: false,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`
          : 'http://localhost:30013/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
