# Build a theme

A theme is a single `*.theme.css` file. BetterCodex injects it into Codex through a constructable stylesheet (it bypasses Codex's content‑security policy), so plain CSS works and you don't need any build step. Themes are the fastest kind to ship.

## Target Codex's design tokens

Codex styles itself with CSS variables. Restyle by overriding those tokens rather than hard‑coding colors — your theme then tracks Codex's own light/dark handling and component states. The common ones:

```css
:root {
  --color-token-main-surface-primary: #0b0f1a;   /* app background */
  --color-token-bg-secondary: #121826;           /* panels, cards */
  --color-token-foreground: #e8edf6;             /* primary text */
  --color-token-text-secondary: #93a1b8;         /* muted text */
  --color-token-border-default: #1f2a3d;         /* hairlines */
  --color-token-interactive-label-accent-default: #2b7fff; /* accent */
  --color-token-list-hover-background: #18213270; /* row hover */
}
```

You can also target Codex's utility classes and DOM directly for finer control — inspect the app to find them.

## File format

Start the file with a metadata comment so the marketplace and the in‑app manager can describe it:

```css
/**
 * @name Midnight
 * @author yourhandle
 * @version 1.0.0
 * @description A deeper, higher-contrast dark theme for Codex.
 */

:root {
  --color-token-main-surface-primary: #05070d;
  --color-token-foreground: #f2f6ff;
  --color-token-interactive-label-accent-default: #3b82f6;
}
```

## Test it locally

1. Install BetterCodex (`npm run desktop -- install` in the [BetterCodex repo](https://github.com/advaitpaliwal/bettercodex)).
2. Drop your file in `~/.codex/bettercodex/themes/`.
3. Open BetterCodex → **Themes** and enable it. Edits reload without restarting Codex.

## Submit it

Add it to the registry and open a PR — see [CONTRIBUTING.md](../CONTRIBUTING.md):

```
addons/themes/midnight/
  manifest.json        # type: "theme", file: "midnight.theme.css"
  midnight.theme.css
```
