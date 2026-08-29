import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const htmlPath = join(root, "index.html");
const htmlDir = dirname(htmlPath);
const html = readFileSync(htmlPath, "utf8");
const failures = [];

const fail = (message) => {
  failures.push(message);
};

const stripTags = (value) => value.replace(/<[^>]+>/g, " ").trim();
const getAttribute = (markup, attribute) => {
  const match = markup.match(new RegExp(`${attribute}="([^"]*)"`, "i"));
  return match?.[1] ?? "";
};
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ids = new Map();
for (const match of html.matchAll(/\sid="([^"]+)"/g)) {
  ids.set(match[1], (ids.get(match[1]) ?? 0) + 1);
}

for (const [id, count] of ids) {
  if (count > 1) {
    fail(`Duplicate id found: ${id}`);
  }
}

const mainElements = [...html.matchAll(/<main\b[^>]*>/g)];
if (mainElements.length !== 1) {
  fail(`Expected exactly one main landmark, found ${mainElements.length}.`);
}

const htmlLang = html.match(/<html\b[^>]*\slang="([^"]+)"/i)?.[1] ?? "";
if (!htmlLang.trim()) {
  fail("The html element is missing a non-empty lang attribute.");
}

const documentTitle = stripTags(html.match(/<title\b[^>]*>[\s\S]*?<\/title>/i)?.[0] ?? "");
if (!documentTitle) {
  fail("Document is missing a non-empty title.");
}

const descriptionMeta = html.match(/<meta\b(?=[^>]*\bname="description")[^>]*>/i)?.[0] ?? "";
if (!getAttribute(descriptionMeta, "content").trim()) {
  fail("Document is missing a non-empty meta description.");
}

for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (
    value.startsWith("#") ||
    value.startsWith("data:") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    /^(https?:)?\/\//.test(value)
  ) {
    continue;
  }

  const assetPath = join(htmlDir, value.split("#")[0]);
  if (!existsSync(assetPath)) {
    fail(`Referenced asset is missing: ${value}`);
  }
}

const scriptSources = new Map();
for (const match of html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"[^>]*><\/script>/g)) {
  scriptSources.set(match[1], (scriptSources.get(match[1]) ?? 0) + 1);
}

for (const [source, count] of scriptSources) {
  if (count > 1) {
    fail(`Duplicate script source found: ${source}`);
  }
}

for (const match of html.matchAll(/\son[a-z]+\s*=/gi)) {
  fail(`Inline event handler found: ${match[0].trim()}`);
}

for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  const alt = getAttribute(match[0], "alt");
  if (!alt.trim()) {
    fail(`Image is missing alt text: ${match[0]}`);
  }
}

for (const match of html.matchAll(/<i\b[^>]*>/g)) {
  const ariaHidden = getAttribute(match[0], "aria-hidden");
  if (ariaHidden !== "true") {
    fail(`Decorative icon is missing aria-hidden="true": ${match[0]}`);
  }
}

for (const match of html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)) {
  const type = getAttribute(match[0], "type");
  const ariaLabel = getAttribute(match[0], "aria-label");
  const title = getAttribute(match[0], "title");
  const visibleText = stripTags(match[0]);

  if (type !== "button") {
    fail(`Button is missing type="button": ${match[0]}`);
  }

  if (!ariaLabel && !title && !visibleText) {
    fail(`Button is missing an accessible name: ${match[0]}`);
  }
}

for (const match of html.matchAll(/<a\b[^>]*\starget="_blank"[^>]*>/g)) {
  const rel = getAttribute(match[0], "rel").toLowerCase().split(/\s+/);

  if (!rel.includes("noopener")) {
    fail(`New-tab link is missing rel="noopener": ${match[0]}`);
  }
}

for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) {
  if (!ids.has(match[1])) {
    fail(`aria-controls points to a missing id: ${match[1]}`);
  }
}

for (const match of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
  const labelIds = match[1].trim().split(/\s+/);

  for (const id of labelIds) {
    if (!ids.has(id)) {
      fail(`aria-labelledby points to a missing id: ${id}`);
    }
  }
}

for (const match of html.matchAll(/<button\b[^>]*\brole="tab"[^>]*>/g)) {
  const tabMarkup = match[0];
  const tabId = getAttribute(tabMarkup, "id");
  const panelId = getAttribute(tabMarkup, "aria-controls");
  const selected = getAttribute(tabMarkup, "aria-selected");

  if (!tabId) {
    fail(`Tab is missing an id: ${tabMarkup}`);
  }

  if (!panelId) {
    fail(`Tab is missing aria-controls: ${tabMarkup}`);
  }

  if (selected !== "true" && selected !== "false") {
    fail(`Tab has invalid aria-selected value: ${tabMarkup}`);
  }

  const panelPattern = new RegExp(
    `<pre\\b(?=[^>]*\\bid="${escapeRegExp(panelId)}")(?=[^>]*\\brole="tabpanel")(?=[^>]*\\baria-labelledby="${escapeRegExp(tabId)}")`,
    "i",
  );

  if (tabId && panelId && !panelPattern.test(html)) {
    fail(`Tab ${tabId} is not linked to a matching tabpanel ${panelId}`);
  }
}

for (const match of html.matchAll(/data-language="([^"]+)"/g)) {
  const language = match[1];
  if (!html.includes(`code-container__code--${language}`)) {
    fail(`Code tab is missing a matching panel for language: ${language}`);
  }
}

for (const match of html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"[^>]*><\/script>/g)) {
  const value = match[1];
  if (/^(https?:)?\/\//.test(value)) {
    continue;
  }

  const scriptPath = join(htmlDir, value);
  try {
    execFileSync(process.execPath, ["--check", scriptPath], { stdio: "pipe" });
  } catch (error) {
    fail(`JavaScript syntax check failed for ${value}: ${error.message}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Static validation passed.");
