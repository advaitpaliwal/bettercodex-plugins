/**
 * @name Account Switcher
 * @description Save Codex auth profiles and switch the active Codex account from inside BetterCodex.
 * @version 0.1.1
 * @author BetterCodex
 */
module.exports = class AccountSwitcher {
  constructor() {
    this.root = null;
    this.navItem = null;
    this.panel = null;
    this.observer = null;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
  }

  async start() {
    BdApi.DOM.addStyle("account-switcher", this.css());
    this.root = document.createElement("div");
    this.root.className = "bc-account-switcher-root";
    this.root.innerHTML = '<div class="bc-account-switcher-panel" hidden></div>';
    document.body.appendChild(this.root);
    this.panel = this.root.querySelector(".bc-account-switcher-panel");
    this.mountSidebarItem();
    this.observer = new MutationObserver(() => this.mountSidebarItem());
    this.observer.observe(document.body, {childList: true, subtree: true});
    document.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("resize", this.updatePosition);
    await this.render();
  }

  stop() {
    document.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize", this.updatePosition);
    if (this.observer) this.observer.disconnect();
    if (this.navItem) this.navItem.remove();
    if (this.root) this.root.remove();
    this.observer = null;
    this.navItem = null;
    this.root = null;
    this.panel = null;
    BdApi.DOM.removeStyle("account-switcher");
  }

  onKeyDown(event) {
    if (event.key === "Escape" && this.panel && !this.panel.hidden) {
      this.panel.hidden = true;
    }
  }

  async toggle() {
    if (!this.panel) return;
    this.updatePosition();
    this.panel.hidden = !this.panel.hidden;
    if (!this.panel.hidden) await this.render();
  }

  mountSidebarItem() {
    const settings = this.findSettingsButton();
    if (!settings) return;
    if (!this.navItem) {
      this.navItem = document.createElement("button");
      this.navItem.type = "button";
      this.navItem.className = "bc-account-switcher-nav";
      this.navItem.setAttribute("aria-label", "Open Account Switcher");
      this.navItem.innerHTML = [
        '<span class="bc-account-switcher-mark">AS</span>',
        '<span class="bc-account-switcher-label">Account Switcher</span>',
      ].join("");
      this.navItem.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.navItem);
    }
    this.updatePosition();
  }

  findSettingsButton() {
    return Array.from(document.querySelectorAll("button")).find((button) => button.getAttribute("aria-label") === "Open settings");
  }

  updatePosition() {
    if (!this.navItem) return;
    const settings = this.findSettingsButton();
    if (!settings) {
      this.navItem.hidden = true;
      return;
    }
    this.navItem.hidden = false;
    const settingsRect = settings.getBoundingClientRect();
    const sidebarLeft = Math.max(0, Math.round(settingsRect.left - 8));
    const sidebarWidth = Math.max(180, Math.round(settingsRect.width + 16));
    this.navItem.style.left = sidebarLeft + "px";
    this.navItem.style.top = Math.max(48, Math.round(settingsRect.top - 44)) + "px";
    this.navItem.style.width = sidebarWidth + "px";
    if (this.panel) {
      this.panel.style.left = Math.round(settingsRect.right + 18) + "px";
      this.panel.style.bottom = Math.max(16, Math.round(window.innerHeight - settingsRect.bottom + 10)) + "px";
    }
  }

  async render() {
    if (!this.panel) return;
    let data;
    try {
      data = await BdApi.Accounts.list();
    } catch (error) {
      this.panel.innerHTML = this.shell('<div class="bc-account-switcher-empty">' + this.escape(error.message || "Account API unavailable") + "</div>");
      return;
    }

    const rows = data.accounts.length
      ? data.accounts.map((account) => this.accountRow(account)).join("")
      : '<div class="bc-account-switcher-empty">No saved accounts yet. Import the current Codex auth profile first.</div>';

    this.panel.innerHTML = this.shell([
      '<div class="bc-account-switcher-path">' + this.escape(data.authJsonPath) + '</div>',
      '<div class="bc-account-switcher-list">' + rows + '</div>',
      '<div class="bc-account-switcher-actions">',
      '<button type="button" data-action="import">Import current account</button>',
      '<button type="button" data-action="refresh">Refresh</button>',
      '</div>',
    ].join(""));

    this.panel.querySelector("[data-close]").addEventListener("click", () => {
      this.panel.hidden = true;
    });
    this.panel.querySelector("[data-action='import']").addEventListener("click", () => this.importCurrent());
    this.panel.querySelector("[data-action='refresh']").addEventListener("click", () => this.render());
    this.panel.querySelectorAll("[data-switch]").forEach((button) => {
      button.addEventListener("click", () => this.switchAccount(button.dataset.switch));
    });
    this.panel.querySelectorAll("[data-rename]").forEach((button) => {
      button.addEventListener("click", () => this.renameAccount(button.dataset.rename));
    });
    this.panel.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", () => this.deleteAccount(button.dataset.delete));
    });
  }

  shell(body) {
    return [
      '<div class="bc-account-switcher-head">',
      '<div><div class="bc-account-switcher-title">Account Switcher</div>',
      '<div class="bc-account-switcher-subtitle">Saved Codex auth profiles</div></div>',
      '<button type="button" data-close aria-label="Close Account Switcher">Close</button>',
      '</div>',
      body,
    ].join("");
  }

  accountRow(account) {
    const active = account.active ? '<span class="bc-account-switcher-active">Active</span>' : "";
    const switchButton = account.active
      ? '<button type="button" disabled>Current</button>'
      : '<button type="button" data-switch="' + this.escapeAttr(account.id) + '">Switch</button>';
    return [
      '<div class="bc-account-switcher-row">',
      '<div class="bc-account-switcher-row-main">',
      '<div class="bc-account-switcher-name">' + this.escape(account.name) + active + '</div>',
      '<div class="bc-account-switcher-meta">' + this.escape(account.authMode || "unknown") + '</div>',
      '</div>',
      '<div class="bc-account-switcher-row-actions">',
      switchButton,
      '<button type="button" data-rename="' + this.escapeAttr(account.id) + '">Rename</button>',
      '<button type="button" data-delete="' + this.escapeAttr(account.id) + '">Delete</button>',
      '</div>',
      '</div>',
    ].join("");
  }

  async importCurrent() {
    const name = window.prompt("Name this Codex account", "Codex Account");
    if (name === null) return;
    try {
      await BdApi.Accounts.importCurrent(name);
      BdApi.UI.showToast("Account imported");
      await this.render();
    } catch (error) {
      BdApi.UI.showToast(error.message || "Import failed");
    }
  }

  async switchAccount(id) {
    try {
      await BdApi.Accounts.switch(id);
      BdApi.UI.showToast("Codex account switched. Restart running Codex tasks to use the new auth.");
      await this.render();
    } catch (error) {
      BdApi.UI.showToast(error.message || "Switch failed");
    }
  }

  async renameAccount(id) {
    const name = window.prompt("Rename account");
    if (name === null) return;
    try {
      await BdApi.Accounts.rename(id, name);
      await this.render();
    } catch (error) {
      BdApi.UI.showToast(error.message || "Rename failed");
    }
  }

  async deleteAccount(id) {
    if (!window.confirm("Delete this saved account profile?")) return;
    try {
      await BdApi.Accounts.delete(id);
      await this.render();
    } catch (error) {
      BdApi.UI.showToast(error.message || "Delete failed");
    }
  }

  escape(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  escapeAttr(value) {
    return this.escape(value).replaceAll("'", "&#39;");
  }

  css() {
    return [
      ".bc-account-switcher-root{position:fixed;z-index:2147483646;font:inherit;color:var(--color-token-foreground,inherit)}",
      ".bc-account-switcher-nav{position:fixed;z-index:2147483645;display:flex;align-items:center;gap:10px;height:38px;border:0;border-radius:10px;background:transparent;color:var(--color-token-foreground,inherit);padding:0 10px;font:inherit;font-size:14px;line-height:18px;text-align:left;cursor:pointer}",
      ".bc-account-switcher-nav:hover{background:var(--color-token-list-hover-background,#ffffff12)}",
      ".bc-account-switcher-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".bc-account-switcher-mark{display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:7px;background:var(--color-token-foreground,#f4f4f5);color:var(--color-token-main-surface-primary,#111);font-size:10px;font-weight:700}",
      ".bc-account-switcher-panel{position:fixed;width:min(420px,calc(100vw - 330px));max-height:min(620px,calc(100vh - 90px));overflow:auto;border:1px solid var(--color-token-border-default,#ffffff24);border-radius:16px;background:var(--color-token-main-surface-primary,#181818);box-shadow:0 20px 60px #00000066;padding:14px}",
      ".bc-account-switcher-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}",
      ".bc-account-switcher-title{font-size:15px;line-height:20px;font-weight:600}",
      ".bc-account-switcher-subtitle,.bc-account-switcher-path,.bc-account-switcher-meta,.bc-account-switcher-empty{font-size:12px;line-height:17px;color:var(--color-token-text-secondary,#9ca3af)}",
      ".bc-account-switcher-path{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:12px}",
      ".bc-account-switcher-list{display:flex;flex-direction:column;gap:8px}",
      ".bc-account-switcher-row{display:flex;align-items:center;justify-content:space-between;gap:12px;border-radius:12px;background:var(--color-token-foreground-5,rgba(255,255,255,.05));padding:10px}",
      ".bc-account-switcher-name{display:flex;align-items:center;gap:8px;font-size:14px;line-height:19px;font-weight:500}",
      ".bc-account-switcher-active{border-radius:999px;background:var(--color-token-foreground,#f4f4f5);color:var(--color-token-main-surface-primary,#111);padding:2px 7px;font-size:11px;line-height:14px}",
      ".bc-account-switcher-row-actions,.bc-account-switcher-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}",
      ".bc-account-switcher-actions{justify-content:flex-end;margin-top:12px}",
      ".bc-account-switcher-root button{font:inherit}",
      ".bc-account-switcher-panel button{height:28px;border:1px solid var(--color-token-border-default,#ffffff24);border-radius:999px;background:transparent;color:inherit;padding:0 9px;cursor:pointer}",
      ".bc-account-switcher-panel button:hover{background:var(--color-token-list-hover-background,#ffffff12)}",
      ".bc-account-switcher-panel button:disabled{opacity:.55;cursor:default}",
      ".bc-account-switcher-empty{padding:12px 4px}",
    ].join("\n");
  }
};
