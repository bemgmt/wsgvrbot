(function () {
  const script = document.currentScript;
  if (!script) return;

  const cfg = {
    client: script.dataset.client || "default",
    api: script.dataset.api || "",
    position: script.dataset.position || "bottom-right",
    offsetX: parseInt(script.dataset.offsetX || "20", 10),
    offsetY: parseInt(script.dataset.offsetY || "20", 10),
    width: parseInt(script.dataset.width || "380", 10),
    height: parseInt(script.dataset.height || "600", 10),
    z: parseInt(script.dataset.z || "9999", 10),
  };

  // Prevent double-inject
  if (window.__DONNA_WIDGET_LOADED__) return;
  window.__DONNA_WIDGET_LOADED__ = true;

  const style = document.createElement("style");
  style.textContent = `
    #donna-widget-launcher {
      position: fixed;
      z-index: ${cfg.z};
      width: 64px;
      height: 64px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(11, 18, 32, 0.3), 0 8px 30px rgba(11, 18, 32, 0.2);
      font: 600 28px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
      background: linear-gradient(135deg, #0b1220 0%, #1a2332 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #donna-widget-launcher:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(11, 18, 32, 0.4), 0 12px 40px rgba(11, 18, 32, 0.3);
    }
    #donna-widget-launcher:active {
      transform: scale(1.05);
    }
    #donna-widget-panel {
      position: fixed;
      z-index: ${cfg.z};
      width: ${cfg.width}px;
      height: ${cfg.height}px;
      border-radius: 16px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 20px 60px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.05);
      display: none;
      flex-direction: column;
    }
    #donna-widget-header {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      background: linear-gradient(135deg, #0b1220 0%, #1a2332 100%);
      color: #fff;
      font: 600 16px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
      box-shadow: 0 2px 8px rgba(0,0,0,.1);
    }
    #donna-widget-close {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #donna-widget-close:hover {
      opacity: 0.8;
    }
    #donna-widget-body {
      height: calc(100% - 46px);
      background: #fff;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  `;
  document.head.appendChild(style);

  // Position helper
  function applyPosition(el, kind) {
    const pos = cfg.position;
    const ox = cfg.offsetX;
    const oy = cfg.offsetY;

    // Clear
    el.style.top = "";
    el.style.right = "";
    el.style.bottom = "";
    el.style.left = "";

    if (pos === "bottom-right") {
      el.style.right = ox + "px";
      el.style.bottom = oy + "px";
    } else if (pos === "bottom-left") {
      el.style.left = ox + "px";
      el.style.bottom = oy + "px";
    } else if (pos === "top-right") {
      el.style.right = ox + "px";
      el.style.top = oy + "px";
    } else if (pos === "top-left") {
      el.style.left = ox + "px";
      el.style.top = oy + "px";
    }

    // Slightly offset launcher vs panel
    if (kind === "panel" && pos.startsWith("bottom")) {
      el.style.bottom = (oy + 80) + "px";
    }
  }

  // Launcher
  const launcher = document.createElement("button");
  launcher.id = "donna-widget-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open chat");
  launcher.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  applyPosition(launcher, "launcher");

  // Panel
  const panel = document.createElement("div");
  panel.id = "donna-widget-panel";
  applyPosition(panel, "panel");

  const header = document.createElement("div");
  header.id = "donna-widget-header";
  header.innerHTML = `<div>Support</div>`;
  const closeBtn = document.createElement("button");
  closeBtn.id = "donna-widget-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close chat");
  closeBtn.textContent = "×";
  header.appendChild(closeBtn);

  const body = document.createElement("div");
  body.id = "donna-widget-body";
  body.innerHTML = `<div style="padding:14px;font:14px system-ui;">Loading…</div>`;

  panel.appendChild(header);
  panel.appendChild(body);

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  let loadedOnce = false;

  async function loadUI() {
    if (loadedOnce) return;
    loadedOnce = true;

    // Request embeddable UI HTML from your backend
    if (!cfg.api) {
      body.innerHTML = `<div style="padding:14px;font:14px system-ui;color:#b00;">Missing data-api on widget script tag.</div>`;
      return;
    }

    try {
      const res = await fetch(`${cfg.api}/widget-ui?client=${encodeURIComponent(cfg.client)}`, {
        credentials: "omit",
      });
      if (!res.ok) throw new Error(`UI load failed: ${res.status}`);
      const html = await res.text();
      body.innerHTML = html;
      
      // Execute any scripts in the loaded HTML
      const scripts = body.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    } catch (e) {
      body.innerHTML = `<div style="padding:14px;font:14px system-ui;color:#b00;">Could not load chat UI. ${String(e.message || e)}</div>`;
    }
  }

  function open() {
    panel.style.display = "flex";
    launcher.style.display = "none";
    loadUI();
  }
  function close() {
    panel.style.display = "none";
    launcher.style.display = "flex";
  }

  launcher.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
})();

