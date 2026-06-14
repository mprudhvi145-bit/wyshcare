#!/usr/bin/env node

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const ROADMAP_DB_ID = process.env.NOTION_ROADMAP_DB_ID;
const SPRINT_DB_ID = process.env.NOTION_SPRINT_DB_ID;
const BUG_DB_ID = process.env.NOTION_BUG_DB_ID;

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
    process.exit(1);
  }
  return body;
}

function select(name) {
  return { select: { name } };
}

function title(content) {
  return { title: [{ type: "text", text: { content } }] };
}

function richText(content) {
  return { rich_text: [{ type: "text", text: { content } }] };
}

function dateStr(d) {
  return d.toISOString().split("T")[0];
}

async function queryDatabase(dbId, filter) {
  return notion(`/databases/${dbId}/query`, {
    method: "POST",
    body: JSON.stringify({ filter }),
  });
}

async function createPage(dbId, properties) {
  return notion("/pages", {
    method: "POST",
    body: JSON.stringify({ parent: { database_id: dbId }, properties }),
  });
}

async function updatePage(pageId, properties) {
  return notion(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

function parseGhEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return {};
  try {
    return JSON.parse(require("fs").readFileSync(eventPath, "utf8"));
  } catch {
    return {};
  }
}

function determineQuarter() {
  const m = new Date().getMonth();
  if (m < 3) return "Q1";
  if (m < 6) return "Q2";
  if (m < 9) return "Q3";
  return "Q4";
}

async function handlePrOpened(event) {
  const { pull_request } = event;
  if (!pull_request) return;
  await createPage(ROADMAP_DB_ID, {
    Name: title(pull_request.title.slice(0, 200)),
    Status: select("In Progress"),
    Priority: select("P2"),
    Quarter: select(determineQuarter()),
    Description: richText((pull_request.body || pull_request.title).slice(0, 2000)),
  });
  console.log(`PR roadmap item created: ${pull_request.title}`);
}

async function handlePrMerged(event) {
  const { pull_request } = event;
  if (!pull_request) return;
  const results = await queryDatabase(ROADMAP_DB_ID, {
    property: "Name", title: { equals: pull_request.title.slice(0, 200) },
  });
  if (results.results.length > 0) {
    await updatePage(results.results[0].id, {
      Status: select("Released"),
      "date:Release Date:start": dateStr(new Date()),
      "date:Release Date:is_datetime": 0,
    });
    console.log(`PR "${pull_request.title}" marked as Released`);
  } else {
    await createPage(ROADMAP_DB_ID, {
      Name: title(pull_request.title.slice(0, 200)),
      Status: select("Released"),
      Priority: select("P2"),
      Quarter: select(determineQuarter()),
      Description: richText((pull_request.body || pull_request.title).slice(0, 2000)),
      "date:Release Date:start": dateStr(new Date()),
      "date:Release Date:is_datetime": 0,
    });
    console.log(`New roadmap item from merged PR: ${pull_request.title}`);
  }
}

async function handleIssueOpened(event) {
  const { issue } = event;
  if (!issue || issue.pull_request) return;
  await createPage(ROADMAP_DB_ID, {
    Name: title(issue.title.slice(0, 200)),
    Status: select("Backlog"),
    Priority: select("P3"),
    Quarter: select(determineQuarter()),
    Description: richText((issue.body || issue.title).slice(0, 2000)),
  });
  console.log(`Issue "${issue.title}" added to backlog`);
}

async function handleReleaseCreated(event) {
  const { release } = event;
  if (!release) return;
  const results = await queryDatabase(ROADMAP_DB_ID, {
    property: "Name", title: { contains: release.name || release.tag_name },
  });
  for (const page of results.results) {
    await updatePage(page.id, {
      Status: select("Released"),
      "date:Release Date:start": dateStr(new Date(release.created_at)),
      "date:Release Date:is_datetime": 0,
    });
  }
  await createPage(ROADMAP_DB_ID, {
    Name: title(`Release ${release.tag_name}: ${release.name || ""}`.slice(0, 200)),
    Status: select("Released"),
    Priority: select("P1"),
    Quarter: select(determineQuarter()),
    Description: richText((release.body || `${release.tag_name}`).slice(0, 2000)),
    "date:Release Date:start": dateStr(new Date(release.created_at)),
    "date:Release Date:is_datetime": 0,
  });
  console.log(`Release ${release.tag_name} synced to roadmap`);
}

async function main() {
  if (!NOTION_API_KEY) {
    console.error("NOTION_API_KEY is required");
    process.exit(1);
  }
  const command = process.argv[2];
  const event = parseGhEvent();
  switch (command) {
    case "pr-opened": await handlePrOpened(event); break;
    case "pr-merged": await handlePrMerged(event); break;
    case "issue-opened": await handleIssueOpened(event); break;
    case "release-created": await handleReleaseCreated(event); break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
  console.log("Sync complete");
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
