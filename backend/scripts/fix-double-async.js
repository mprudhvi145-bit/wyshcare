/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/scripts/fix-double-async.js
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
 * fix-double-async — WyshID module
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

const fs = require('fs');
const path = require('path');

const assessorsDir = path.join(__dirname, '../src/modules/ai-risk/services/assessors');

const files = fs.readdirSync(assessorsDir);

files.forEach(file => {
  if (!file.endsWith('.ts')) return;
  const filePath = path.join(assessorsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/async async assess/g, 'async assess');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed double async in ${file}`);
  }
});
