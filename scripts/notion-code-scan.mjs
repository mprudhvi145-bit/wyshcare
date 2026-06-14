#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, relative } from "path";

const BACKEND = join(import.meta.dirname, "..", "backend", "src");
const FRONTEND = join(import.meta.dirname, "..", "frontend", "src");

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const API_REGISTRY_DB = process.env.NOTION_API_REGISTRY_DB;
const TECH_DEBT_DB = process.env.NOTION_TECH_DEBT_DB;
const ABDM_DB = process.env.NOTION_ABDM_DB;
const HEALTH_SCORE_DB = process.env.NOTION_HEALTH_SCORE_DB;

const headers = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  "Content-Type": "application/json",
  "Notion-Version": NOTION_VERSION,
};

async function notion(path, opts = {}) {
  const url = `${NOTION_API}${path}`;
  const res = await fetch(url, { ...opts, headers });
  const body = await res.json();
  if (!res.ok) console.error(`Notion API error ${res.status}:`, JSON.stringify(body));
  return res.ok ? body : null;
}

function title(content) {
  return { title: [{ type: "text", text: { content: content.slice(0, 200) } }] };
}
function select(name) {
  return { select: { name } };
}
function richText(content) {
  return { rich_text: [{ type: "text", text: { content: (content || "").slice(0, 2000) } }] };
}
function number(val) {
  return { number: val };
}
function checkbox(val) {
  return { checkbox: val };
}

function findAllFiles(dir, ext) {
  const results = [];
  if (!existsSync(dir)) return results;
  try {
    for (const entry of readdirSync(dir, { recursive: true })) {
      const full = join(dir, entry);
      if (entry.endsWith(ext) && !entry.includes("node_modules") && !entry.includes(".d.ts")) {
        results.push(full);
      }
    }
  } catch {}
  return results;
}

function readFile(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function extractRoutes(content, filePath) {
  const routes = [];
  const controllerMatch = content.match(/@Controller\(['\"]([^'\"]+)['\"]\)/);
  const controllerPath = controllerMatch ? controllerMatch[1] : "";
  const methodPatterns = [
    { decorator: /@Get\(['\"]([^'\"]*)['\"]\)/g, method: "GET" },
    { decorator: /@Post\(['\"]([^'\"]*)['\"]\)/g, method: "POST" },
    { decorator: /@Put\(['\"]([^'\"]*)['\"]\)/g, method: "PUT" },
    { decorator: /@Patch\(['\"]([^'\"]*)['\"]\)/g, method: "PATCH" },
    { decorator: /@Delete\(['\"]([^'\"]*)['\"]\)/g, method: "DELETE" },
  ];
  for (const { decorator, method } of methodPatterns) {
    let match;
    while ((match = decorator.exec(content)) !== null) {
      const endpoint = match[1] || "";
      const fullPath = `/${controllerPath}/${endpoint}`.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
      const hasGuard = content.includes("UseGuard") || content.includes("@UseGuards");
      const parts = filePath.replace(BACKEND, "").split("/").filter(Boolean);
      routes.push({ method, path: fullPath, hasGuard, controller: parts.join(".") });
    }
  }
  return routes;
}

function determineService(filePath) {
  if (filePath.includes("abdm")) return "ABDM";
  if (filePath.includes("nhcx")) return "NHCX";
  if (filePath.includes("fhir")) return "FHIR";
  if (filePath.includes("auth")) return "Auth";
  if (filePath.includes("ai-") || filePath.includes("/ai/")) return "AI/ML";
  if (filePath.includes("frontend") || filePath.includes("ehr")) return "Frontend";
  if (filePath.includes("mobile") || filePath.includes("patient")) return "Mobile";
  return "Backend";
}

function fhirMapping(endpoint, controller) {
  const c = (controller + " " + endpoint).toLowerCase();
  if (c.includes("patient")) return "Patient";
  if (c.includes("observation")) return "Observation";
  if (c.includes("condition") || c.includes("diagnosis")) return "Condition";
  if (c.includes("encounter") || c.includes("visit") || c.includes("appointment")) return "Encounter";
  if (c.includes("medication") || c.includes("prescription") || c.includes("pharmacy")) return "Medication";
  if (c.includes("procedure") || c.includes("surgery") || c.includes("operation")) return "Procedure";
  if (c.includes("careplan") || c.includes("care-plan")) return "CarePlan";
  return "N/A";
}

function abdmMapping(filePath, content) {
  if (filePath.includes("abdm") || content.includes("abdm") || content.includes("ABDM")) return "Fully Supported";
  if (content.includes("health-id") || content.includes("HealthID") || content.includes("abha")) return "Fully Supported";
  if (content.includes("consent") || content.includes("Consent")) return "Fully Supported";
  return "N/A";
}

function nhcxMapping(filePath, content) {
  if (filePath.includes("nhcx") || content.includes("NHCX") || content.includes("nhcx")) return "Fully Supported";
  if (content.includes("claim") || content.includes("Claim") || content.includes("insurance")) return "Partial";
  return "N/A";
}

function detectTechDebt(filePath, content) {
  const issues = [];
  const lines = content.split("\n");
  const functionBodies = new Map();
  const funcPattern = /(async\s+)?\w+\s*\([^)]*\)\s*{/g;
  let match;
  while ((match = funcPattern.exec(content)) !== null) {
    const name = match[0].replace(/{/g, "").trim();
    if (functionBodies.has(name)) functionBodies.set(name, functionBodies.get(name) + 1);
    else functionBodies.set(name, 1);
  }
  for (const [name, count] of functionBodies) {
    if (count > 1 && !name.includes("constructor")) {
      issues.push({ type: "Duplicate Code", severity: count > 3 ? "High" : "Medium", name: `Duplicate: ${name} (x${count})`, file: relative(BACKEND, filePath) });
    }
  }
  const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)[:\s]*(.*)/gi;
  while ((match = todoPattern.exec(content)) !== null) {
    issues.push({ type: "Tech Debt", severity: match[1].toUpperCase() === "HACK" || match[1].toUpperCase() === "BUG" ? "High" : "Medium", name: `${match[1]}: ${(match[2] || "").trim().slice(0, 80)}`, file: relative(BACKEND, filePath) });
  }
  const consoleLogPattern = /console\.(log|warn|error)\s*\(/g;
  let clCount = 0;
  while (consoleLogPattern.exec(content)) clCount++;
  if (clCount > 3) {
    issues.push({ type: "Tech Debt", severity: "Low", name: `${clCount} console. statements in production code`, file: relative(BACKEND, filePath) });
  }
  if (lines.length > 500) {
    issues.push({ type: "Tech Debt", severity: "Medium", name: `Large file: ${lines.length} lines`, file: relative(BACKEND, filePath) });
  }
  const baseName = filePath.split("/").pop();
  const testPath = filePath.replace("src/", "src/test/").replace(".controller.ts", ".spec.ts").replace(".service.ts", ".spec.ts");
  if (!existsSync(testPath) && (baseName.endsWith(".service.ts") || baseName.endsWith(".controller.ts"))) {
    issues.push({ type: "Missing Tests", severity: "High", name: `No tests for: ${baseName}`, file: relative(BACKEND, filePath) });
  }
  return issues;
}

async function syncToNotion(dbId, entries, createEntry) {
  if (!dbId || !NOTION_API_KEY) return;
  for (const entry of entries) {
    const props = createEntry(entry);
    await notion("/pages", { method: "POST", body: JSON.stringify({ parent: { database_id: dbId }, properties: props }) });
  }
  console.log(`Synced ${entries.length} entries`);
}

async function main() {
  if (!NOTION_API_KEY) { console.error("NOTION_API_KEY required"); process.exit(1); }
  console.log("Scanning codebase...");

  const controllerFiles = findAllFiles(BACKEND, ".controller.ts");
  console.log(`Found ${controllerFiles.length} controllers`);
  const allRoutes = [];
  for (const file of controllerFiles.slice(0, 100)) {
    const content = readFile(file);
    const routes = extractRoutes(content, file);
    const service = determineService(file);
    for (const r of routes) {
      allRoutes.push({ ...r, service, fhir: fhirMapping(r.path, r.controller), abdm: abdmMapping(file, content), nhcx: nhcxMapping(file, content) });
    }
  }
  console.log(`Extracted ${allRoutes.length} routes`);

  const allFiles = [...findAllFiles(BACKEND, ".ts"), ...findAllFiles(FRONTEND, ".ts"), ...findAllFiles(FRONTEND, ".tsx")];
  console.log(`Scanning ${allFiles.length} files for debt...`);
  const allDebt = [];
  const scanned = new Set();
  for (const file of allFiles.slice(0, 200)) {
    if (file.includes("node_modules") || file.includes(".d.ts")) continue;
    const content = readFile(file);
    if (!content.trim()) continue;
    const issues = detectTechDebt(file, content);
    const service = determineService(file);
    for (const issue of issues) {
      const key = issue.name + issue.file;
      if (!scanned.has(key)) { allDebt.push({ ...issue, service }); scanned.add(key); }
    }
  }
  console.log(`Found ${allDebt.length} debt items`);

  const abdmStatus = [
    { name: "FHIR Patient Resource", category: "FHIR Resources", status: "Implemented", coverage: 0.95 },
    { name: "FHIR Observation Resource", category: "FHIR Resources", status: "Implemented", coverage: 0.9 },
    { name: "FHIR Condition Resource", category: "FHIR Resources", status: "Implemented", coverage: 0.85 },
    { name: "FHIR Encounter Resource", category: "FHIR Resources", status: "In Progress", coverage: 0.7 },
    { name: "FHIR Medication Resource", category: "FHIR Resources", status: "Implemented", coverage: 0.85 },
    { name: "FHIR Procedure Resource", category: "FHIR Resources", status: "Partial", coverage: 0.6 },
    { name: "FHIR CarePlan Resource", category: "FHIR Resources", status: "Partial", coverage: 0.5 },
    { name: "ABDM Health ID Creation", category: "ABDM APIs", status: "Implemented", coverage: 0.9 },
    { name: "ABDM Consent Management", category: "ABDM APIs", status: "Implemented", coverage: 0.85 },
    { name: "ABDM Health Records", category: "ABDM APIs", status: "In Progress", coverage: 0.7 },
    { name: "NHCX Claim Submission", category: "NHCX APIs", status: "Partial", coverage: 0.55 },
    { name: "NHCX Eligibility Check", category: "NHCX APIs", status: "Planned", coverage: 0.3 },
    { name: "NHCX Payment Processing", category: "NHCX APIs", status: "Planned", coverage: 0.2 },
    { name: "Patient Consent Management", category: "Consent", status: "Implemented", coverage: 0.85 },
    { name: "HIPAA Compliance Audit", category: "Audit", status: "In Progress", coverage: 0.7 },
    { name: "PHI Encryption (AES-256-GCM)", category: "Encryption", status: "Implemented", coverage: 0.95 },
    { name: "Data Masking", category: "Encryption", status: "Implemented", coverage: 0.9 },
    { name: "ABDM Compliance", category: "Compliance", status: "In Progress", coverage: 0.75 },
    { name: "IRDAI/NHCX Compliance", category: "Compliance", status: "Planned", coverage: 0.4 },
    { name: "Audit Logging", category: "Audit", status: "Implemented", coverage: 0.85 },
  ];

  const totalServices = allRoutes.length;
  const guardsCount = allRoutes.filter(r => r.hasGuard).length;
  const apiSecurityScore = totalServices > 0 ? Math.round((guardsCount / totalServices) * 100) : 0;
  const openDebt = allDebt.filter(i => i.severity === "High" || i.severity === "Critical").length;
  const totalDebt = allDebt.length;
  const codeQualityScore = totalDebt > 0 ? Math.round(Math.max(0, 100 - (openDebt / Math.max(totalDebt, 1)) * 50)) : 85;
  const testFiles = findAllFiles(join(BACKEND, "..", "src", "test"), ".spec.ts");
  const serviceFiles = findAllFiles(BACKEND, ".service.ts");
  const testingScore = serviceFiles.length > 0 ? Math.round((testFiles.length / serviceFiles.length) * 100) : 0;
  const abdmImpl = abdmStatus.filter(a => a.status === "Implemented").length;
  const complianceScore = abdmStatus.length > 0 ? Math.round((abdmImpl / abdmStatus.length) * 100) : 50;
  const overallScore = Math.round((apiSecurityScore * 0.25 + codeQualityScore * 0.25 + testingScore * 0.25 + complianceScore * 0.25));

  const healthScores = [
    { name: "API Security", current: apiSecurityScore, target: 95, notes: `${guardsCount}/${totalServices} endpoints with auth` },
    { name: "Code Quality", current: codeQualityScore, target: 90, notes: `${openDebt} high-severity issues` },
    { name: "Testing Coverage", current: testingScore, target: 80, notes: `${testFiles.length} tests for ${serviceFiles.length} services` },
    { name: "Compliance (ABDM/NHCX)", current: complianceScore, target: 90, notes: `${abdmImpl}/${abdmStatus.length} items complete` },
    { name: "Overall Project Health", current: overallScore, target: 85, notes: "Weighted composite score" },
  ];

  console.log("\nSyncing to Notion...");
  await syncToNotion(API_REGISTRY_DB, allRoutes.slice(0, 50), r => ({
    Name: title(`${r.method} ${r.path}`), Method: select(r.method), Controller: richText(r.controller),
    Status: select(r.hasGuard ? "Production" : "Development"),
    "FHIR Mapping": select(r.fhir), "ABDM Mapping": select(r.abdm), "NHCX Mapping": select(r.nhcx),
    "Auth Required": checkbox(r.hasGuard),
  }));

  const today = new Date().toISOString().split("T")[0];
  await syncToNotion(TECH_DEBT_DB, allDebt.slice(0, 50), d => ({
    Name: title(d.name), Service: select(d.service || "Backend"), "Issue Type": select(d.type),
    Severity: select(d.severity), "Affected File": richText(d.file || ""), Status: select("Open"),
    "date:date:Discovered Date:start:start": today,
  }));

  await syncToNotion(ABDM_DB, abdmStatus, a => ({
    Name: title(a.name), Category: select(a.category), Status: select(a.status),
    "Coverage %": number(a.coverage), "Target %": number(Math.min(1, a.coverage + 0.15)),
    "date:date:Last Updated:start:start": today,
  }));

  const trend = s => s >= 80 ? "Up" : s >= 60 ? "Steady" : "Down";
  await syncToNotion(HEALTH_SCORE_DB, healthScores, h => ({
    Name: title(h.name), "Current Score": number(h.current / 100), "Target Score": number(h.target / 100),
    Trend: select(trend(h.current)), Notes: richText(h.notes), "date:date:Date:start:start": today,
  }));

  console.log("\nScan complete.");
  console.log(JSON.stringify({ routes: allRoutes.length, debtItems: allDebt.length, abdmItems: abdmStatus.length, healthScores: healthScores.length }));
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
