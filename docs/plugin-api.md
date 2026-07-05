# Plugin API reference (`BdApi`)

Every plugin's `start`/`stop` runs with a `BdApi` object in scope. It mirrors the BetterDiscord API so existing plugin knowledge transfers. This is the stable surface — stick to it.

## DOM

| Method | Description |
|--------|-------------|
| `BdApi.DOM.addStyle(id, css)` | Inject a `<style>` (keyed by `id`). |
| `BdApi.DOM.removeStyle(id)` | Remove a previously injected style. |

## Data

Per‑plugin persistent storage (scoped to your plugin).

| Method | Description |
|--------|-------------|
| `BdApi.Data.load(key)` | Read a saved value (or `null`). |
| `BdApi.Data.save(key, value)` | Persist a JSON‑serializable value. |
| `BdApi.Data.delete(key)` | Remove a value. |

## UI

| Method | Description |
|--------|-------------|
| `BdApi.UI.showToast(message)` | Show a transient notification. |

## Patcher

Wrap functions on an object. Each returns an unpatch function; `stop()` should call it (or `BdApi.Patcher.unpatchAll(id)`).

| Method | When the callback runs |
|--------|------------------------|
| `BdApi.Patcher.before(id, obj, method, fn)` | Before the original. |
| `BdApi.Patcher.after(id, obj, method, fn)` | After the original (gets its return value). |
| `BdApi.Patcher.instead(id, obj, method, fn)` | Replaces the original. |
| `BdApi.Patcher.unpatchAll(id)` | Remove all patches for your plugin. |

## Registry

| Method | Description |
|--------|-------------|
| `BdApi.Plugins.getAll()` | Installed plugins. |
| `BdApi.Themes.getAll()` | Installed themes. |

## Accounts

Native Codex account profile management. These methods are available to desktop
plugins because account switching has to write Codex's local `auth.json`; a
renderer-only plugin cannot do that safely.

| Method | Description |
|--------|-------------|
| `BdApi.Accounts.list()` | List saved account profiles and the current Codex auth path. |
| `BdApi.Accounts.importCurrent(name)` | Save the current `~/.codex/auth.json` as a named profile. |
| `BdApi.Accounts.switch(accountId)` | Write a saved profile to `~/.codex/auth.json`, backing up the previous file first. |
| `BdApi.Accounts.rename(accountId, name)` | Rename a saved profile. |
| `BdApi.Accounts.delete(accountId)` | Delete a saved profile from BetterCodex storage. |

## Lifecycle contract

- Export `start()` and `stop()`.
- `stop()` must reverse everything `start()` did — remove styles, nodes, patches, and listeners — so the plugin can be toggled without a restart.
