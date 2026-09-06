import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {fileURLToPath} from "node:url";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("catalog.json", root), "utf8"));
const repo = "advaitpaliwal/bettercodex-plugins";

test("generated catalog uses personal source, download, and install destinations", () => {
  assert.ok(catalog.addons.length > 0);
  for (const addon of catalog.addons) {
    const path = addon.type === "skill"
      ? `bettercodex-skills/skills/${addon.id}`
      : `addons/${addon.type}s/${addon.id}`;
    assert.equal(addon.sourceUrl, `https://github.com/${repo}/tree/main/${path}`);
    assert.ok(existsSync(fileURLToPath(new URL(`${path}/manifest.json`, root))));
    if (addon.type === "skill") {
      assert.equal(addon.install, `codex plugin marketplace add ${repo}`);
      assert.equal(addon.skillPath, path);
    } else {
      assert.equal(addon.downloadUrl, `https://raw.githubusercontent.com/${repo}/main/${path}/${addon.fileName}`);
      assert.ok(existsSync(fileURLToPath(new URL(`${path}/${addon.fileName}`, root))));
    }
  }
});

test("registry tooling remains private and native plugin links use personal hosting", () => {
  const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
  const plugin = JSON.parse(readFileSync(new URL("bettercodex-skills/.codex-plugin/plugin.json", root), "utf8"));
  assert.equal(pkg.private, true);
  for (const url of [plugin.author.url, plugin.homepage, plugin.repository, plugin.interface.websiteURL]) {
    assert.equal(url, `https://github.com/${repo}`);
  }
});
