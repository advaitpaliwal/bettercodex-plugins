// Generates catalog.json from the registry. Themes and plugins live in
// addons/<type>s/<id>/; skills live in the Codex plugin package
// bettercodex-skills/skills/<id>/ (so the same repo is also installable via
// `codex plugin marketplace add`). The BetterCodex marketplace reads catalog.json.
// Run `npm run build` after changes. CI runs `--check` to keep it in sync.

import {readFileSync, readdirSync, writeFileSync, existsSync} from "node:fs";
import {join, dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "advaitpaliwal/bettercodex-plugins";
const SKILLS_DIR = join(root, "bettercodex-skills", "skills");

function entryDir(type, id) {
  return type === "skill" ? join(SKILLS_DIR, id) : join(root, "addons", type + "s", id);
}

function readEntry(type, id) {
  const dir = entryDir(type, id);
  const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
  const entry = {
    id,
    type,
    name: manifest.name,
    description: manifest.description,
    author: manifest.author,
    version: manifest.version || "0.1.0",
    tags: Array.isArray(manifest.tags) ? manifest.tags : [],
    homepageUrl: manifest.homepage || null,
    updatedAt: manifest.updatedAt || new Date().toISOString().slice(0, 10),
  };
  if (type === "skill") {
    entry.sourceUrl = `https://github.com/${REPO}/tree/main/bettercodex-skills/skills/${id}`;
    entry.install = `codex plugin marketplace add ${REPO}`;
    entry.skillPath = `bettercodex-skills/skills/${id}`;
  } else {
    entry.sourceUrl = manifest.source || `https://github.com/${REPO}/tree/main/addons/${type}s/${id}`;
    entry.fileName = manifest.file;
    entry.downloadUrl = `https://raw.githubusercontent.com/${REPO}/main/addons/${type}s/${id}/${manifest.file}`;
  }
  return entry;
}

function entriesFrom(base, type) {
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .filter((id) => !id.startsWith(".") && existsSync(join(base, id, "manifest.json")))
    .map((id) => readEntry(type, id));
}

function collect() {
  const addons = [
    ...entriesFrom(join(root, "addons", "themes"), "theme"),
    ...entriesFrom(join(root, "addons", "plugins"), "plugin"),
    ...entriesFrom(SKILLS_DIR, "skill"),
  ];
  addons.sort((a, b) => a.name.localeCompare(b.name));
  return addons;
}

const catalog = {
  schemaVersion: 1,
  generatedAt: process.env.CATALOG_TIMESTAMP || "generated",
  addons: collect(),
};

const out = JSON.stringify(catalog, null, 2) + "\n";
const outPath = join(root, "catalog.json");

if (process.argv.includes("--check")) {
  const current = existsSync(outPath) ? readFileSync(outPath, "utf8") : "";
  const strip = (s) => s.replace(/"generatedAt":\s*"[^"]*"/, '"generatedAt":""');
  if (strip(current) !== strip(out)) {
    console.error("catalog.json is out of date. Run `npm run build` and commit the result.");
    process.exit(1);
  }
  console.log(`catalog.json is in sync (${catalog.addons.length} addons).`);
} else {
  writeFileSync(outPath, out);
  console.log(`Wrote catalog.json with ${catalog.addons.length} addons.`);
}
