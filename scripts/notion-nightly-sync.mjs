#!/usr/bin/env node

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const ROADMAP_DB_ID = process.env.NOTION_ROADMAP_DB_ID;
const SPRINT_DB_ID = process.env.NOTION_SPRINT_DB_ID;
const BUG_DB_ID = process.env.NOTION_BUG_DB_ID;
const CEO_PAGE_ID = process.env.NOTION_CEO_PAGE_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPOSITORY;

const headers = {
  "Authorization": `Bearer ${NOTION_API_KEY}`,
  "Content-Type": "application/json",
  "Notion-Version": NOTION_VERSION,
};

async function notion(path, opts = {}) {
  const url = `${NOTION_API}${path}`;
  const res = await fetch(url, { ...opts, headers });
  const body = await res.json();
  if (!res.ok) {
    console.error(`Notion API error ${res.status}:`, JSON.stringify(body));
    return null;
  }
  return body;
}

function title(content) {
  return { title: [{ type: "text", text: { content } }] };
}

function select(name) {
  return { select: { name } };
}

async function getDbContents(dbId) {
  let results = [];
  let cursor = undefined;
  for (let i = 0; i < 10; i++) {
    const body = cursor ? { start_cursor: cursor } : {};
    const res = await notion(`/databases/${dbId}/query`, { method: "POST", body: JSON.stringify(body) });
    if (!res) break;
    results = results.concat(res.results);
    if (!res.has_more) break;
    cursor = res.next_cursor;
  }
  return results;
}

function propVal(page, name) {
  const p = page.properties[name];
  if (!p) return null;
  switch (p.type) {
    case "title": return p.title[0]?.text?.content || "";
    case "select": return p.select?.name || null;
    case "number": return p.number;
    case "rich_text": return p.rich_text[0]?.text?.content || "";
    case "date": return p.date?.start || null;
    case "status": return p.status?.name || null;
    default: return null;
  }
}

function countByProp(pages, name) {
  const counts = {};
  for (const p of pages) {
    const val = propVal(p, name);
    if (val) counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}

async function githubApi(path) {
  if (!GITHUB_TOKEN) return null;
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

function statusEmoji(status) {
  const map = { Backlog: "📋", "In Progress": "🔄", Testing: "🧪", Released: "✅", Blocked: "🚫" };
  return map[status] || "❓";
}

async function main() {
  if (!NOTION_API_KEY) {
    console.error("NOTION_API_KEY is required");
    process.exit(1);
  }

  const [roadmapItems, sprints, bugs] = await Promise.all([
    ROADMAP_DB_ID ? getDbContents(ROADMAP_DB_ID) : [],
    SPRINT_DB_ID ? getDbContents(SPRINT_DB_ID) : [],
    BUG_DB_ID ? getDbContents(BUG_DB_ID) : [],
  ]);

  const statusCounts = countByProp(roadmapItems, "Status");
  const bugStatusCounts = countByProp(bugs, "Status");
  const severityCounts = countByProp(bugs, "Severity");

  const [prs, openIssues] = await Promise.all([
    githubApi(`/repos/${GITHUB_REPO}/pulls?state=all&per_page=5`),
    githubApi(`/repos/${GITHUB_REPO}/issues?state=open&per_page=1`),
  ]);

  const totalItems = roadmapItems.length;
  const completed = statusCounts["Released"] || 0;
  const inProgress = statusCounts["In Progress"] || 0;
  const testing = statusCounts["Testing"] || 0;
  const backlog = statusCounts["Backlog"] || 0;
  const completionPct = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
  const newBugs = bugStatusCounts["New"] || 0;
  const resolvedBugs = bugStatusCounts["Resolved"] || 0;
  const criticalBugs = severityCounts["Critical"] || 0;
  const activeSprint = sprints.find(s => propVal(s, "Status") === "Active");

  const body = [
    `# WyshCare — Nightly Sync (${new Date().toISOString().split("T")[0]})`,
    ``,
    `## 📊 Progress`,
    `- Roadmap: **${completionPct}%** complete (${completed}/${totalItems})`,
    `- In Progress: **${inProgress}** | Testing: **${testing}** | Backlog: **${backlog}**`,
    `- Bugs: **${newBugs}** open, **${criticalBugs}** critical, **${resolvedBugs}** resolved (today)`,
    activeSprint ? `- Active Sprint: **${propVal(activeSprint, "Name")}**` : null,
    ``,
    `## 🚀 Feature Status`,
    ...roadmapItems.map(i => `- ${statusEmoji(propVal(i, "Status"))} **${propVal(i, "Name")}** — ${propVal(i, "Status") || "?"}`),
    ``,
    `## 🔄 Recent PRs`,
    ...(prs || []).map(p => `- ${p.merged_at ? "✅" : p.state === "open" ? "🔄" : "❌"} ${p.title} (#${p.number})`),
    ``,
    `## ⚠️ Action Items`,
    criticalBugs > 0 ? `- 🚨 ${criticalBugs} critical bugs need attention` : "- ✅ No critical bugs",
    backlog > 10 ? `- 📋 ${backlog} items in backlog — needs prioritization` : "- ✅ Backlog healthy",
  ].filter(Boolean).join("\n");

  console.log(body);
  console.log("Nightly sync complete");
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
