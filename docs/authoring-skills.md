# Build a skill

A skill is a Codex‑native capability: a `SKILL.md` (instructions Codex follows) plus any helper scripts. Unlike themes and plugins, skills don't touch the app's UI — they extend what Codex can *do*. They install through Codex's own marketplace, so a skill works whether or not someone has the BetterCodex client.

## Folder layout

Skills live inside the Codex plugin package so the whole repo is installable with `codex plugin marketplace add`:

```
bettercodex-skills/skills/repo-warmup/
  manifest.json       # marketplace metadata (name, tags, ...)
  SKILL.md            # the skill itself (Codex reads this)
  scripts/            # optional helpers your SKILL.md calls
```

## SKILL.md

A skill is a Markdown file with YAML frontmatter. The `description` is what Codex uses to decide when the skill is relevant, so make it specific and trigger‑rich.

```markdown
---
name: repo-warmup
description: >
  Reads AGENTS.md, package scripts, and test commands in the current repo and
  prints an exact first-run checklist. Use when opening an unfamiliar project.
---

# Repo Warmup

When the user opens a new repo:

1. Read `AGENTS.md` / `README.md` for setup and conventions.
2. List `package.json` scripts (or the equivalent) and the test command.
3. Output a numbered "first run" checklist: install, build, test, run.

Keep it to commands the user can paste.
```

## manifest.json

```jsonc
{
  "type": "skill",
  "name": "Repo Warmup",
  "description": "Reads AGENTS.md, scripts, and tests, then prints a first-run checklist.",
  "author": "yourhandle",
  "version": "1.0.0",
  "tags": ["onboarding", "workflow"]
}
```

## How users install it

Once merged, this whole repo is a Codex marketplace, so any skill in it installs with:

```bash
codex plugin marketplace add advaitpaliwal/bettercodex-plugins
codex plugin add repo-warmup@bettercodex-plugins
```

## Submit it

Add your folder under `bettercodex-skills/skills/<id>/`, run `npm run build` to refresh `catalog.json`, and open a PR — see [CONTRIBUTING.md](../CONTRIBUTING.md). CI checks that your skill folder has a `SKILL.md` and a valid manifest.
