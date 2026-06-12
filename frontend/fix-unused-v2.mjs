/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/fix-unused-v2.mjs
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
 * fix-unused-v2 — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - frontend/fix-unused-imports.mjs
 - frontend/fix-unused-v3.mjs
 - backend/scripts/scan-route-service-mismatches.mjs
 - backend/scripts/import-fhir.ts
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

#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const output = readFileSync('/tmp/eslint-output.txt', 'utf-8');

const fileIssues = new Map();

const lines = output.split('\n');
let currentFile = null;

for (const line of lines) {
  const fileMatch = line.match(/^(\/Users[^:]+):\s+(\d+):(\d+)\s+(warning|error)\s+'([^']+)'/);
  if (fileMatch) {
    currentFile = fileMatch[1];
    const varName = fileMatch[5];
    if (!fileIssues.has(currentFile)) {
      fileIssues.set(currentFile, new Set());
    }
    fileIssues.get(currentFile).add(varName);
  }
}

console.log(`Found issues in ${fileIssues.size} files`);

for (const [filePath, unusedVars] of fileIssues) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  
  for (const varName of unusedVars) {
    // Try to remove from import statements
    // Pattern: import { ..., varName, ... } from '...'
    // or import { varName } from '...'
    
    // First try: remove from named imports
    const importRegex = new RegExp(
      `import\\s*\\{[^}]*\\b${varName}\\b[^}]*\\}\\s*from\\s*['"'][^'"']*['"']\\s*;?`,
      'g'
    );
    
    if (importRegex.test(content)) {
      // More precise: remove just the varName from the import
      const namedImportRegex = new RegExp(
        `(import\\s*\\{[^}]*)\\b${varName}\\b,?\\s*([^}]*\\}\\s*from\\s*['"'][^'"']*['"']\\s*;?)`,
        'g'
      );
      content = content.replace(namedImportRegex, (match, before, after) => {
        // Clean up extra commas
        let cleaned = before.replace(/,+\s*$/, '').replace(/,\s*,/g, ',');
        after = after.replace(/^\s*,\s*/, '');
        if (cleaned.trim() === '{' && after.trim().startsWith('}')) {
          return ''; // Remove entire import if empty
        }
        modified = true;
        return cleaned + after;
      });
    }
    
    // Also try default imports
    const defaultImportRegex = new RegExp(
      `import\\s+${varName}\\s+from\\s+['"'][^'"']*['"']\\s*;?`,
      'g'
    );
    if (defaultImportRegex.test(content)) {
      content = content.replace(defaultImportRegex, '');
      modified = true;
    }
    
    // Try: const { varName } = useX()
    const destructuredRegex = new RegExp(
      `(const|let|var)\\s*\\{[^}]*\\b${varName}\\b[^}]*\\}\\s*=`,
      'g'
    );
    if (destructuredRegex.test(content)) {
      // Remove just the varName from destructuring
      content = content.replace(
        new RegExp(`\\b${varName}\\b,?\\s*`, 'g'),
        (match, offset, string) => {
          // Check if we're in a destructuring context
          const before = string.slice(Math.max(0, offset - 20), offset);
          if (before.includes('{') || before.includes('const') || before.includes('let') || before.includes('var')) {
            modified = true;
            return '';
          }
          return match;
        }
      );
    }
    
    // Try: const varName = ...
    const assignmentRegex = new RegExp(
      `(const|let|var)\\s+${varName}\\s*=`,
      'g'
    );
    if (assignmentRegex.test(content)) {
      // Comment out or remove the whole line
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (new RegExp(`(const|let|var)\\s+${varName}\\s*=`).test(lines[i])) {
          // Check if the variable is used later
          const varUsageRegex = new RegExp(`\\b${varName}\\b`);
          let usedLater = false;
          for (let j = i + 1; j < lines.length; j++) {
            if (varUsageRegex.test(lines[j]) && !lines[j].includes(`const ${varName}`) && !lines[j].includes(`let ${varName}`) && !lines[j].includes(`var ${varName}`)) {
              usedLater = true;
              break;
            }
          }
          if (!usedLater) {
            lines[i] = `// ${lines[i].trim()}  // REMOVED: unused`;
            modified = true;
          }
        }
      }
      content = lines.join('\n');
    }
  }
  
  if (modified) {
    writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath} (removed: ${Array.from(unusedVars).join(', ')})`);
  }
}

console.log('Done');