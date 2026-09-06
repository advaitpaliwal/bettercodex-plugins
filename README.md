# BetterCodex Plugins

The community registry of **plugins, themes, and skills** for [BetterCodex](https://github.com/advaitpaliwal/bettercodex) — a BetterDiscord‑style plugin platform for the Codex desktop app.

Everything in the [BetterCodex marketplace](https://bettercodex-web.companion-inc.workers.dev) comes from this repo. There is no upload form and no "submit an issue" — you add your plugin with a **pull request**, CI checks it, a maintainer merges, and it's live. This repo is intentionally separate from the BetterCodex app code so the registry stays community‑owned.

## Plugin types

| Type | File | What it is | How it runs |
|------|------|------------|-------------|
| **Theme** | `*.theme.css` | CSS that restyles Codex | Loaded by the BetterCodex client |
| **Plugin** | `*.plugin.js` | A UI/behavior plugin | Loaded by the BetterCodex client |
| **Skill** | `SKILL.md` | A Codex AI skill | Installed via Codex's own marketplace |

New to authoring? Start with a **theme** — it's just CSS and the fastest way to ship.

## Submit a plugin in 3 steps

1. **Fork** this repo and add a folder:
   ```
   addons/themes/my-theme/
     manifest.json
     my-theme.theme.css
   ```
2. Run `npm run build` to regenerate `catalog.json`, then commit.
3. Open a **pull request**. CI validates it; a maintainer reviews and merges.

Full walkthrough: **[CONTRIBUTING.md](CONTRIBUTING.md)**. Per‑type guides:

- [Build a theme](docs/authoring-themes.md)
- [Build a plugin](docs/authoring-plugins.md)
- [Build a skill](docs/authoring-skills.md)

## How it's wired

```
addons/<type>s/<id>/manifest.json   ← you add this in a PR
        │
   npm run build  (scripts/build-catalog.mjs)
        ▼
   catalog.json                     ← generated, committed
        │
   raw.githubusercontent.com/advaitpaliwal/bettercodex-plugins/main/catalog.json
        ▼
   BetterCodex marketplace site + desktop client
```

Skills additionally install through Codex directly:

```bash
codex plugin marketplace add advaitpaliwal/bettercodex-plugins
codex plugin add <skill-name>@bettercodex-plugins
```

## Local checks

```bash
npm run validate   # validate every addon manifest
npm run build      # regenerate catalog.json
npm run check      # what CI runs (validate + catalog is in sync)
```
