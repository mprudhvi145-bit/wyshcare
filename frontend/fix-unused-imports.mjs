/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/fix-unused-imports.mjs
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
 * fix-unused-imports — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/fix-unused-v2.mjs
 - backend/scripts/generate-openapi.ts
 - backend/scripts/import-synthea.ts
 - frontend/fix-unused-v3.mjs
 - backend/scripts/auto-comment-invalid-routes.mjs
 - backend/scripts/scan-route-service-mismatches.mjs
 - backend/scripts/import-fhir.ts
 *
 * Calls:
 - fs
 - eslint
 *
 * Dependencies:
 - fs
 - eslint
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

#!/usr/bin/env node
import { ESLint } from 'eslint';
import { readFileSync, writeFileSync } from 'fs';

async function fixUnusedImports() {
  const eslint = new ESLint({
    fix: true,
    overrideConfigFile: '/Users/vimarshakprudhvi/wyshcare /frontend/eslint.config.mjs',
  });

  const files = [
    'src/app/(platform)/app/ai-navigator/page.tsx',
    'src/app/(platform)/app/diagnostics/page.tsx',
    'src/app/(platform)/app/discovery/page.tsx',
    'src/app/(platform)/app/family/page.tsx',
    'src/app/(platform)/app/health-graph/page.tsx',
    'src/app/(platform)/app/insurance/page.tsx',
    'src/app/(platform)/app/pharmacy/page.tsx',
    'src/app/(platform)/app/prescriptions/page.tsx',
    'src/app/(platform)/app/records/page.tsx',
    'src/app/(platform)/app/subscriptions/page.tsx',
    'src/app/(platform)/app/telemedicine/page.tsx',
    'src/app/(platform)/app/timeline/page.tsx',
    'src/app/(platform)/app/wallet/page.tsx',
    'src/app/admin/abdm/page.tsx',
    'src/app/admin/analytics/page.tsx',
    'src/app/admin/ehr/cds/page.tsx',
    'src/app/admin/ehr/encounters/page.tsx',
    'src/app/admin/ehr/notes/page.tsx',
    'src/app/admin/ehr/orders/page.tsx',
    'src/app/admin/ehr/patients/page.tsx',
    'src/app/admin/nhcx/page.tsx',
    'src/app/admin/page.tsx',
    'src/app/admin/provider-graph/page.tsx',
    'src/app/admin/risk-analytics/page.tsx',
    'src/app/admin/subscriptions/page.tsx',
    'src/app/admin/users/page.tsx',
    'src/app/clinic/admin/page.tsx',
    'src/app/clinic/billing/page.tsx',
    'src/app/clinic/clinical-twin/page.tsx',
    'src/app/clinic/reception/page.tsx',
    'src/app/doctor/patients/page.tsx',
    'src/app/doctor/prescriptions/page.tsx',
    'src/app/insurance/claims/page.tsx',
    'src/app/insurance/copilot/page.tsx',
    'src/app/insurance/coverage-rules/page.tsx',
    'src/app/insurance/eligibility/page.tsx',
    'src/app/insurance/page.tsx',
    'src/app/insurance/plans/page.tsx',
    'src/app/insurance/pre-auth/page.tsx',
    'src/app/insurance/providers/page.tsx',
    'src/app/insurance/settlements/page.tsx',
    'src/app/os/admin/page.tsx',
    'src/app/os/billing/page.tsx',
    'src/app/os/dashboard/page.tsx',
    'src/app/os/doctor/page.tsx',
    'src/app/os/lab/page.tsx',
  ];

  const results = await eslint.lintFiles(files.map(f => `/Users/vimarshakprudhvi/wyshcare /frontend/${f}`));
  
  for (const result of results) {
    if (result.output && result.output !== result.source) {
      writeFileSync(result.filePath, result.output);
      console.log(`Fixed: ${result.filePath}`);
    }
  }
  
  console.log('Done');
}

fixUnusedImports().catch(console.error);