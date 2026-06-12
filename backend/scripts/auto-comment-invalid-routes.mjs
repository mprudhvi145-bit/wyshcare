/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/scripts/auto-comment-invalid-routes.mjs
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
 * auto-comment-invalid-routes — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/fix-unused-imports.mjs
 - frontend/fix-unused-v3.mjs
 - backend/scripts/scan-route-service-mismatches.mjs
 - backend/scripts/import-fhir.ts
 - frontend/fix-unused-v2.mjs
 - backend/scripts/generate-openapi.ts
 - backend/scripts/import-synthea.ts
 - frontend/next.config.ts
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

/* -----------------------------------------
   1. COLLECT ALL SERVICE EXPORTS
------------------------------------------ */

const serviceExports = new Map();

function walk(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      results.push(full);
    }
  }
  return results;
}

const exportRegex =
  /export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z0-9_]+)/g;

for (const file of walk(SERVICES_DIR)) {
  const content = fs.readFileSync(file, 'utf8');
  const exports = new Set();
  let match;
  while ((match = exportRegex.exec(content))) {
    exports.add(match[1]);
  }
  serviceExports.set(
    path.basename(file),
    exports
  );
}

/* -----------------------------------------
   2. PROCESS ROUTES
------------------------------------------ */

const routeImportRegex =
  /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"](\.\.\/services\/[^'"]+)['"]/g;

for (const routeFile of walk(ROUTES_DIR)) {
  let content = fs.readFileSync(routeFile, 'utf8');
  let modified = false;

  const imports = [...content.matchAll(routeImportRegex)];

  for (const imp of imports) {
    const importedFns = imp[1]
      .split(',')
      .map(s => s.trim());

    const servicePath = imp[2].split('/').pop();
    const serviceFile = servicePath.replace(/\.js$/, '') + '.js';

    const validExports =
      serviceExports.get(serviceFile) || new Set();

    for (const fn of importedFns) {
      if (!validExports.has(fn)) {
        const routeCallRegex = new RegExp(
          `^\\s*(router\\.(get|post|put|delete|patch)\$begin:math:text$\[\^\\\\n\]\*\$\{fn\}\[\^\\\\n\]\*\\$end:math:text$);?`,
          'gm'
        );

        content = content.replace(routeCallRegex, match => {
          modified = true;
          return (
            `// ❌ AUTO-COMMENTED: Service function not implemented\n` +
            `// ${match}\n`
          );
        });
      }
    }
  }

  if (modified) {
    fs.writeFileSync(routeFile, content, 'utf8');
    console.log(`🛑 Disabled invalid routes in: ${path.basename(routeFile)}`);
  }
}

console.log('\n✅ Route stabilization complete.');import express from 'express';

import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeStaff } from '../middleware/role.middleware.js';

// Rewritten to only import functions that are actually exported by the service.
import {
  assignAmbulance,
  getActiveAmbulanceRequests,
} from '../services/ambulance-routing.service.js';

import { audit } from '../services/audit.service.js';

const router = express.Router();

/*
====================================================
AMBULANCE ROUTES
----------------------------------------------------
• Emergency-first
• Patient-safe
• NABH / EMS compliant
• Full audit
====================================================
*/

/* ====================================================
   REQUEST AMBULANCE (PATIENT / STAFF)
   POST /ambulance/request
==================================================== */
// @future: Route handler for POST /ambulance/request removed.
// The service `ambulance-routing.service.js` does not export `requestAmbulance`.
// An equivalent `createAmbulanceRequest` exists but has a different signature.
// This route must be re-evaluated against the existing service contract.

/* ====================================================
   ASSIGN AMBULANCE (DISPATCH)
   POST /ambulance/:requestId/assign
==================================================== */
router.post(
  '/ambulance/:requestId/assign',
  authenticate,
  authorizeStaff(['ADMIN']),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { ambulanceId } = req.body;

      if (!ambulanceId) {
        return res.status(400).json({
          error: 'ambulanceId is required',
        });
      }

      // The call signature has been corrected to match the service export.
      const assignment = await assignAmbulance({
        requestId,
        ambulanceId,
        assignedByWyshId: req.auth.staffWyshId,
      });

      await audit({
        action: 'UPDATE',
        resource: 'AmbulanceRequest',
        metadata: {
          requestId,
          ambulanceId,
          assignedBy: req.auth.staffWyshId,
        },
      });

      res.json(assignment);
    } catch (err) {
      console.error('ASSIGN AMBULANCE ERROR →', err);
      res.status(400).json({ error: err.message });
    }
  }
);

/* ====================================================
   UPDATE AMBULANCE STATUS
   PATCH /ambulance/:requestId/status
==================================================== */
// @future: Route handler for PATCH /ambulance/:requestId/status removed.
// The service `ambulance-routing.service.js` does not export `updateAmbulanceStatus`.
// This functionality needs to be implemented in the service before this route can be re-enabled.

/* ====================================================
   GET ACTIVE AMBULANCE REQUESTS (DISPATCH DASHBOARD)
   GET /ambulance/active
==================================================== */
router.get(
  '/ambulance/active',
  authenticate,
  authorizeStaff(['ADMIN', 'DOCTOR']),
  async (_req, res) => {
    try {
      const requests = await getActiveAmbulanceRequests();
      res.json({
        count: requests.length,
        requests,
      });
    } catch (err) {
      console.error('GET ACTIVE AMBULANCES ERROR →', err);
      res.status(500).json({ error: 'Failed to fetch ambulance requests' });
    }
  }
);

/* ====================================================
   GET SINGLE AMBULANCE REQUEST
   GET /ambulance/:requestId
==================================================== */
// @future: Route handler for GET /ambulance/:requestId removed.
// The service `ambulance-routing.service.js` does not export `getAmbulanceRequestById`.
// This functionality needs to be implemented in the service before this route can be re-enabled.

export default router;
import express from 'express';

import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeStaff } from '../middleware/role.middleware.js';

// Rewritten to only import functions that are actually exported by the service.
import {
  assignAmbulance,
  getActiveAmbulanceRequests,
} from '../services/ambulance-routing.service.js';

import { audit } from '../services/audit.service.js';

const router = express.Router();

/*
====================================================
AMBULANCE ROUTES
----------------------------------------------------
• Emergency-first
• Patient-safe
• NABH / EMS compliant
• Full audit
====================================================
*/

/* ====================================================
   REQUEST AMBULANCE (PATIENT / STAFF)
   POST /ambulance/request
==================================================== */
// @future: Route handler for POST /ambulance/request removed.
// The service `ambulance-routing.service.js` does not export `requestAmbulance`.
// An equivalent `createAmbulanceRequest` exists but has a different signature.
// This route must be re-evaluated against the existing service contract.

/* ====================================================
   ASSIGN AMBULANCE (DISPATCH)
   POST /ambulance/:requestId/assign
==================================================== */
router.post(
  '/ambulance/:requestId/assign',
  authenticate,
  authorizeStaff(['ADMIN']),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { ambulanceId } = req.body;

      if (!ambulanceId) {
        return res.status(400).json({
          error: 'ambulanceId is required',
        });
      }

      // The call signature has been corrected to match the service export.
      const assignment = await assignAmbulance({
        requestId,
        ambulanceId,
        assignedByWyshId: req.auth.staffWyshId,
      });

      await audit({
        action: 'UPDATE',
        resource: 'AmbulanceRequest',
        metadata: {
          requestId,
          ambulanceId,
          assignedBy: req.auth.staffWyshId,
        },
      });

      res.json(assignment);
    } catch (err) {
      console.error('ASSIGN AMBULANCE ERROR →', err);
      res.status(400).json({ error: err.message });
    }
  }
);

/* ====================================================
   UPDATE AMBULANCE STATUS
   PATCH /ambulance/:requestId/status
==================================================== */
// @future: Route handler for PATCH /ambulance/:requestId/status removed.
// The service `ambulance-routing.service.js` does not export `updateAmbulanceStatus`.
// This functionality needs to be implemented in the service before this route can be re-enabled.

/* ====================================================
   GET ACTIVE AMBULANCE REQUESTS (DISPATCH DASHBOARD)
   GET /ambulance/active
==================================================== */
router.get(
  '/ambulance/active',
  authenticate,
  authorizeStaff(['ADMIN', 'DOCTOR']),
  async (_req, res) => {
    try {
      const requests = await getActiveAmbulanceRequests();
      res.json({
        count: requests.length,
        requests,
      });
    } catch (err) {
      console.error('GET ACTIVE AMBULANCES ERROR →', err);
      res.status(500).json({ error: 'Failed to fetch ambulance requests' });
    }
  }
);

/* ====================================================
   GET SINGLE AMBULANCE REQUEST
   GET /ambulance/:requestId
==================================================== */
// @future: Route handler for GET /ambulance/:requestId removed.
// The service `ambulance-routing.service.js` does not export `getAmbulanceRequestById`.
// This functionality needs to be implemented in the service before this route can be re-enabled.

export default router;
