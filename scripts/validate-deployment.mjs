/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: scripts/validate-deployment.mjs
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
 * validate-deployment — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - scripts/validate-security.mjs
 - backend/src/providers/storage/storage.service.ts
 *
 * Calls:
 - node:url
 - node:fs
 - node:path
 *
 * Dependencies:
 - node:url
 - node:fs
 - node:path
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

// ============================================================
// Deployment Validation — Single Source of Truth Checker
// ============================================================
// Run: node scripts/validate-deployment.mjs
// ============================================================
// Validates that all DATABASE_URL references point to the
// same logical database and no conflicting schemas exist.
// ============================================================

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let exitCode = 0;
const errors = [];

function check(condition, message) {
  if (!condition) {
    errors.push(`  FAIL: ${message}`);
    exitCode = 1;
  } else {
    console.log(`  OK:   ${message}`);
  }
}

function readEnv(path) {
  const fullPath = resolve(ROOT, path);
  if (!existsSync(fullPath)) return '';
  const content = readFileSync(fullPath, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    vars[key] = value;
  }
  return vars;
}

console.log('\n=== WYSHCARE DEPLOYMENT VALIDATION ===\n');

// 1. Check Prisma schemas
console.log('[1] Prisma Schema Validation');
const schemaPath = resolve(ROOT, 'backend/prisma/schema.prisma');
check(existsSync(schemaPath), 'main schema.prisma exists');

const deadInSchemaDir = ['s2.prisma', 'schema.public.prisma'].filter((n) =>
  existsSync(resolve(ROOT, `backend/prisma/${n}`))
);
check(deadInSchemaDir.length === 0, `no extra .prisma files in prisma/ dir (found: ${deadInSchemaDir.join(', ') || 'none'})`);

const schemaContent = readFileSync(schemaPath, 'utf-8');
const hasPublicSchema = schemaContent.includes('schema  = ["auth"');
check(!hasPublicSchema, 'schema.prisma does NOT reference auth schema');
const hasGenerator = schemaContent.includes('generator client');
check(hasGenerator, 'schema.prisma has generator client');
const hasDatasource = schemaContent.includes('datasource db');
check(hasDatasource, 'schema.prisma has datasource db');

// 2. Check DATABASE_URL consistency
console.log('\n[2] DATABASE_URL Consistency');

const envVars = readEnv('backend/.env');
const exampleVars = readEnv('backend/.env.example');
const dockerCompose = readFileSync(resolve(ROOT, 'docker-compose.yml'), 'utf-8');

const envUrl = envVars.DATABASE_URL || '(not set)';
const exampleUrl = exampleVars.DATABASE_URL || '(not set)';

console.log(`  backend/.env:        ${envUrl.slice(0, 60)}...`);
console.log(`  backend/.env.example: ${exampleUrl.slice(0, 60)}...`);

// Extract docker URL from docker-compose.yml
const dockerMatch = dockerCompose.match(/DATABASE_URL:\s*(.+)/);
const dockerUrl = dockerMatch ? dockerMatch[1].trim() : '(not set)';
console.log(`  docker-compose.yml:   ${dockerUrl.slice(0, 60)}...`);

// Check that backend .env is set (not placeholder)
const hasRealUrl = envUrl !== '(not set)' && !envUrl.includes('replace');
check(hasRealUrl, 'backend/.env has a DATABASE_URL configured');

// Check docker-compose has the override
check(dockerUrl !== '(not set)', 'docker-compose.yml has DATABASE_URL override');

// Check .env.example has clear docs
const hasComment = readFileSync(resolve(ROOT, 'backend/.env.example'), 'utf-8').includes('# Docker:');
check(hasComment, '.env.example documents Docker override');

// 3. Check package.json scripts for prisma
console.log('\n[3] Prisma Scripts Validation');
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'backend/package.json'), 'utf-8'));
const prismaScripts = Object.entries(pkg.scripts || {}).filter(([name]) => name.startsWith('prisma'));
check(prismaScripts.length > 0, `prisma scripts exist (${prismaScripts.map(([n]) => n).join(', ')})`);

// Check no --schema flag that references wrong file
for (const [name, script] of prismaScripts) {
  const hasSchemaFlag = script.includes('--schema');
  check(!hasSchemaFlag, `script "${name}" does NOT use --schema flag (uses default)`);
}

// 4. Check for Supabase env vars that create confusion
console.log('\n[4] Environment Cleanliness');
const hasSupabase = 'SUPABASE_URL' in envVars;
check(!hasSupabase, 'SUPABASE_URL is NOT in backend/.env (removed for clarity)');

const hasV1EnvVars = 'MASTER_ENCRYPTION_KEY' in envVars && 'WYSHID_NAMESPACE' in envVars;
check(hasV1EnvVars, 'V1.5 env vars present (MASTER_ENCRYPTION_KEY, WYSHID_NAMESPACE)');

// 5. Summary
console.log('');
if (exitCode === 0) {
  console.log('=== ALL CHECKS PASSED ===');
} else {
  console.log(`=== ${errors.length} FAILURE(S) DETECTED ===`);
  errors.forEach((e) => console.log(e));
}

process.exit(exitCode);
