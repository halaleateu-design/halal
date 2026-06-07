/**
 * Push docs/PLANEAMENTO-EATHALAL-GO.md to a Notion page.
 *
 * Setup (once):
 * 1. https://www.notion.so/my-integrations → New integration → copy "Internal Integration Secret"
 * 2. Open your Notion page → ••• → Connections → add that integration
 * 3. Copy page ID from URL: notion.so/workspace/Page-Title-XXXXXXXXXXXXXXXXXXXXXXXX
 *
 * Run:
 *   NOTION_TOKEN=secret_xxx NOTION_PAGE_ID=page-id node scripts/sync-notion-planeamento.mjs
 *
 * Optional: NOTION_MODE=append (default replace) — append blocks instead of replacing page body
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOC = path.resolve(__dirname, "../docs/PLANEAMENTO-EATHALAL-GO.md");
const TOKEN = process.env.NOTION_TOKEN?.trim();
const PAGE_ID = process.env.NOTION_PAGE_ID?.replace(/-/g, "").trim();
const MODE = (process.env.NOTION_MODE || "replace").toLowerCase();

if (!TOKEN || !PAGE_ID) {
  console.error(
    "Missing NOTION_TOKEN or NOTION_PAGE_ID.\n" +
      "Example:\n" +
      '  $env:NOTION_TOKEN="secret_..."; $env:NOTION_PAGE_ID="abc123..."; node scripts/sync-notion-planeamento.mjs'
  );
  process.exit(1);
}

const API = "https://api.notion.com/v1";
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

async function notion(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || res.statusText || `HTTP ${res.status}`);
  }
  return data;
}

function rich(text) {
  const t = String(text || "").trim();
  if (!t) return [{ type: "text", text: { content: " " } }];
  const parts = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(t)) !== null) {
    if (m.index > last) parts.push({ type: "text", text: { content: t.slice(last, m.index) } });
    parts.push({ type: "text", text: { content: m[1] }, annotations: { bold: true } });
    last = m.index + m[0].length;
  }
  if (last < t.length) parts.push({ type: "text", text: { content: t.slice(last) } });
  return parts.length ? parts : [{ type: "text", text: { content: t } }];
}

function paragraph(text) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: rich(text) } };
}

function heading(level, text) {
  const key = `heading_${level}`;
  return { object: "block", type: key, [key]: { rich_text: rich(text) } };
}

function todo(text, checked) {
  return {
    object: "block",
    type: "to_do",
    to_do: { rich_text: rich(text || " "), checked: Boolean(checked) },
  };
}

function bullet(text) {
  return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rich(text) } };
}

function quote(text) {
  return { object: "block", type: "quote", quote: { rich_text: rich(text) } };
}

function divider() {
  return { object: "block", type: "divider", divider: {} };
}

function mdToBlocks(md) {
  const blocks = [];
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }
    if (trimmed === "---") {
      blocks.push(divider());
      i++;
      continue;
    }
    if (trimmed.startsWith("> ")) {
      blocks.push(quote(trimmed.slice(2)));
      i++;
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      blocks.push(heading(3, trimmed.slice(5)));
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(heading(3, trimmed.slice(4)));
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(heading(2, trimmed.slice(3)));
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(heading(1, trimmed.slice(2)));
      i++;
      continue;
    }
    if (/^- \[ \]\s/.test(trimmed)) {
      blocks.push(todo(trimmed.replace(/^- \[ \]\s*/, ""), false));
      i++;
      continue;
    }
    if (/^- \[x\]\s/i.test(trimmed)) {
      blocks.push(todo(trimmed.replace(/^- \[x\]\s*/i, ""), true));
      i++;
      continue;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      blocks.push(paragraph(trimmed));
      i++;
      continue;
    }
    if (trimmed.startsWith("- ")) {
      blocks.push(bullet(trimmed.slice(2)));
      i++;
      continue;
    }
    if (trimmed.startsWith("|") && lines[i + 1]?.includes("---")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].trim());
        i++;
      }
      blocks.push(paragraph(rows.join("\n")));
      continue;
    }
    if (trimmed.startsWith("**PONTO") || trimmed.startsWith("**O ")) {
      blocks.push(paragraph(trimmed));
      i++;
      continue;
    }
    blocks.push(paragraph(trimmed));
    i++;
  }
  return blocks;
}

async function listChildBlocks(blockId) {
  const ids = [];
  let cursor;
  do {
    const q = cursor ? `?start_cursor=${cursor}` : "";
    const data = await notion(`/blocks/${blockId}/children${q}`);
    for (const b of data.results || []) ids.push(b.id);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return ids;
}

async function archiveBlocks(ids) {
  for (const id of ids) {
    await notion(`/blocks/${id}`, { method: "PATCH", body: JSON.stringify({ archived: true }) });
  }
}

async function appendBlocks(blockId, blocks) {
  const chunk = 80;
  for (let i = 0; i < blocks.length; i += chunk) {
    await notion(`/blocks/${blockId}/children`, {
      method: "PATCH",
      body: JSON.stringify({ children: blocks.slice(i, i + chunk) }),
    });
  }
}

async function main() {
  const md = fs.readFileSync(DOC, "utf8");
  const blocks = mdToBlocks(md);
  console.log(`Read ${DOC} → ${blocks.length} Notion blocks`);

  if (MODE === "replace") {
    const existing = await listChildBlocks(PAGE_ID);
    if (existing.length) {
      console.log(`Archiving ${existing.length} existing blocks…`);
      await archiveBlocks(existing);
    }
  }

  console.log(`Appending to Notion page ${PAGE_ID}…`);
  await appendBlocks(PAGE_ID, blocks);
  console.log("Done — Notion page updated.");
}

main().catch((err) => {
  console.error("Notion sync failed:", err.message);
  process.exit(1);
});
