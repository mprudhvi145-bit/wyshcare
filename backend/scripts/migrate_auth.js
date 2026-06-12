/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/scripts/migrate_auth.js
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
 * migrate_auth — Authentication module
 *
 * Responsibilities:
 * - Support authentication functionality
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
Authentication
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

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');

const migrateFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // req.auth.type === 'PATIENT' -> req.authSession.role === 'PATIENT'
  content = content.replace(/req\.auth\.type(\s*===?\s*)'PATIENT'/g, "req.authSession.role$1'PATIENT'");
  content = content.replace(/req\.auth\.type(\s*!==?\s*)'PATIENT'/g, "req.authSession.role$1'PATIENT'");
  
  // req.auth.type === 'STAFF' -> req.authSession.role === 'STAFF'
  content = content.replace(/req\.auth\.type(\s*===?\s*)'STAFF'/g, "req.authSession.role$1'STAFF'");
  content = content.replace(/req\.auth\.type(\s*!==?\s*)'STAFF'/g, "req.authSession.role$1'STAFF'");

  // req.auth.role === 'ADMIN' -> req.authSession.role === 'ADMIN'
  content = content.replace(/req\.auth\.role(\s*===?\s*)'ADMIN'/g, "req.authSession.role$1'ADMIN'");
  content = content.replace(/req\.auth\.role(\s*!==?\s*)'ADMIN'/g, "req.authSession.role$1'ADMIN'");

  // req.auth.role === 'DOCTOR' -> req.authSession.staffRole === 'DOCTOR'
  content = content.replace(/req\.auth\.role(\s*===?\s*)'DOCTOR'/g, "req.authSession.staffRole$1'DOCTOR'");
  content = content.replace(/req\.auth\.role(\s*!==?\s*)'DOCTOR'/g, "req.authSession.staffRole$1'DOCTOR'");

  // req.auth.role === 'NURSE' -> req.authSession.staffRole === 'NURSE'
  content = content.replace(/req\.auth\.role(\s*===?\s*)'NURSE'/g, "req.authSession.staffRole$1'NURSE'");
  content = content.replace(/req\.auth\.role(\s*!==?\s*)'NURSE'/g, "req.authSession.staffRole$1'NURSE'");

  // ['ADMIN', 'DOCTOR'].includes(req.auth.role)
  content = content.replace(/\[([^\]]+)\]\.includes\(req\.auth\.role\)/g, (match, arrayStr) => {
    const items = arrayStr.split(',').map(s => s.trim().replace(/['"]/g, ''));
    const conditions = [];
    if (items.includes('ADMIN')) conditions.push("req.authSession.role === 'ADMIN'");
    const staffItems = items.filter(i => i !== 'ADMIN');
    if (staffItems.length > 0) {
      if (staffItems.length === 1) {
        conditions.push(`req.authSession.staffRole === '${staffItems[0]}'`);
      } else {
        conditions.push(`['${staffItems.join("', '")}'].includes(req.authSession.staffRole)`);
      }
    }
    return `(${conditions.join(' || ')})`;
  });

  // !['...'].includes(...)
  content = content.replace(/!\(\((.*?)\)\)/g, "!($1)");

  // req.auth.staffWyshId -> req.authSession.userId
  content = content.replace(/req\.auth\.staffWyshId/g, "req.authSession.userId");

  // req.auth.patientWyshId -> req.authSession.patientWyshId
  content = content.replace(/req\.auth\.patientWyshId/g, "(req.authSession.patientWyshId || req.authSession.userId)");

  // actor: req.auth -> actor: req.authSession
  content = content.replace(/actor:\s*req\.auth(,|\s|\})/g, "actor: req.authSession$1");
  // user: req.auth -> user: req.authSession
  content = content.replace(/user:\s*req\.auth(,|\s|\})/g, "user: req.authSession$1");
  // getTaskAlerts(req.auth) -> getTaskAlerts(req.authSession)
  content = content.replace(/getTaskAlerts\(req\.auth\)/g, "getTaskAlerts(req.authSession)");
  // getActiveSmartConsents(req.auth) -> getActiveSmartConsents(req.authSession)
  content = content.replace(/getActiveSmartConsents\(req\.auth\)/g, "getActiveSmartConsents(req.authSession)");

  // Other isolated req.auth usages -> req.authSession
  content = content.replace(/\breq\.auth\b(?!\.)/g, "req.authSession");
  
  // Clean up any remaining req.auth.role that didn't match the above
  content = content.replace(/req\.auth\.role/g, "req.authSession.role");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Migrated', path.basename(filePath));
  }
};

const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
for (const file of files) {
  migrateFile(path.join(routesDir, file));
}
console.log('Migration script complete.');
