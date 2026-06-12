/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/fix-unused-v3.mjs
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
 * fix-unused-v3 — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/fix-unused-v2.mjs
 - backend/scripts/generate-openapi.ts
 - frontend/fix-unused-imports.mjs
 - backend/scripts/import-synthea.ts
 - backend/scripts/auto-comment-invalid-routes.mjs
 - backend/scripts/scan-route-service-mismatches.mjs
 - backend/scripts/import-fhir.ts
 *
 * Calls:
 - fs
 *
 * Dependencies:
 - fs
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
import { readFileSync, writeFileSync } from 'fs';

const output = readFileSync('/tmp/eslint-output.txt', 'utf-8');

const fileIssues = new Map();

const lines = output.split('\n');
let currentFile = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // File path line
  if (line.startsWith('/Users/')) {
    currentFile = line.trim();
    fileIssues.set(currentFile, new Set());
    continue;
  }
  
  // Warning/error line
  const warnMatch = line.match(/^\s+\d+:\d+\s+(warning|error)\s+'([^']+)'/);
  if (warnMatch && currentFile) {
    const varName = warnMatch[2];
    fileIssues.get(currentFile).add(varName);
  }
}

console.log(`Found issues in ${fileIssues.size} files`);

for (const [filePath, unusedVars] of fileIssues) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;
  
  for (const varName of unusedVars) {
    // Pattern 1: Remove from named imports: import { A, varName, B } from '...'
    const namedImportRegex = new RegExp(
      `(import\\s*\\{)([^}]*\\b${varName}\\b[^}]*)(\\}\\s*from\\s*['\"][^'\"]*['\"]\\s*;?)`,
      'g'
    );
    content = content.replace(namedImportRegex, (match, before, middle, after) => {
      // Remove varName from middle
      let cleaned = middle
        .replace(new RegExp(`\\b${varName}\\b,?\\s*`), '')
        .replace(/,+/g, ',')
        .replace(/,\s*}/g, '}')
        .replace(/{\s*,/g, '{')
        .trim();
      
      // If nothing left, remove entire import
      if (!cleaned || cleaned === '{' || cleaned === '}') {
        modified = true;
        return '';
      }
      
      modified = true;
      return before + ' ' + cleaned + ' ' + after;
    });
    
    // Pattern 2: Default import: import varName from '...'
    const defaultImportRegex = new RegExp(
      `^import\\s+${varName}\\s+from\\s+['\"][^'\"]*['\"]\\s*;?`,
      'gm'
    );
    if (defaultImportRegex.test(content)) {
      content = content.replace(defaultImportRegex, '');
      modified = true;
    }
    
    // Pattern 3: const varName = ... (unused assignment)
    // Comment out the line
    const assignmentRegex = new RegExp(
      `^(\\s*)(const|let|var)\\s+${varName}\\s*=`,
      'gm'
    );
    if (assignmentRegex.test(content)) {
      content = content.replace(assignmentRegex, '$1// $2 $3 $4 =  // REMOVED: unused');
      modified = true;
    }
  }
  
  // Clean up empty import lines
  content = content.replace(/^import\s*\{\s*\}\s*from\s+['"][^'"]*['"]\s*;?\s*$/gm, '');
  content = content.replace(/^\s*import\s+from\s+['"][^'"]*['"]\s*;?\s*$/gm, '');
  // Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  if (content !== originalContent) {
    writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath} (removed: ${Array.from(unusedVars).join(', ')})`);
  }
}

console.log('Done');