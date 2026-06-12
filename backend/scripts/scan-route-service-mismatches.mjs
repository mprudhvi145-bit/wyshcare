/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/scripts/scan-route-service-mismatches.mjs
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
 * scan-route-service-mismatches — WyshID module
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - frontend/fix-unused-imports.mjs
 - frontend/fix-unused-v3.mjs
 - backend/scripts/import-fhir.ts
 - frontend/fix-unused-v2.mjs
 - backend/scripts/generate-openapi.ts
 - backend/scripts/import-synthea.ts
 - frontend/next.config.ts
 - backend/scripts/auto-comment-invalid-routes.mjs
 *
 * Calls:
 - fs
 - path
 *
 * Dependencies:
 - fs
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

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ROUTES_DIR = path.join(ROOT, 'routes');
const SERVICES_DIR = path.join(ROOT, 'services');

const routeImportRegex =
  /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"](\.\.\/services\/[^'"]+)['"]/g;

const exportRegex =
  /export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([a-zA-Z0-9_]+)/g;

function walk(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results.push(...walk(full));
    else if (file.endsWith('.js')) results.push(full);
  }
  return results;
}

const serviceExports = new Map();

// 1️⃣ Index ALL service exports
for (const file of walk(SERVICES_DIR)) {
  const content = fs.readFileSync(file, 'utf8');
  const exports = new Set();
  let match;
  while ((match = exportRegex.exec(content))) {
    exports.add(match[1]);
  }
  serviceExports.set(path.resolve(file), exports);
}

// 2️⃣ Scan routes and compare
let missing = [];

for (const routeFile of walk(ROUTES_DIR)) {
  const content = fs.readFileSync(routeFile, 'utf8');
  let match;

  while ((match = routeImportRegex.exec(content))) {
    const imported = match[1]
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const servicePath = path.resolve(
      path.dirname(routeFile),
      match[2] + '.js'
    );

    const exports = serviceExports.get(servicePath);
    if (!exports) {
      missing.push({
        route: routeFile,
        service: servicePath,
        missing: imported,
        reason: 'SERVICE FILE NOT FOUND',
      });
      continue;
    }

    for (const fn of imported) {
      if (!exports.has(fn)) {
        missing.push({
          route: routeFile,
          service: servicePath,
          missing: [fn],
          reason: 'EXPORT NOT FOUND',
        });
      }
    }
  }
}

// 3️⃣ Report
if (missing.length === 0) {
  console.log('\n✅ ALL ROUTE ↔ SERVICE CONTRACTS SATISFIED\n');
  process.exit(0);
}

console.log('\n❌ ROUTE ↔ SERVICE EXPORT MISMATCHES FOUND\n');

for (const m of missing) {
  console.log('----------------------------------------');
  console.log('Route   :', path.relative(ROOT, m.route));
  console.log('Service :', path.relative(ROOT, m.service));
  console.log('Missing :', m.missing.join(', '));
  console.log('Reason  :', m.reason);
}

console.log(`\n❗ Total issues: ${missing.length}\n`);
process.exit(1);