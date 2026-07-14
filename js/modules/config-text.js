App.resolvePath = function resolvePath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

App.applyConfigText = function applyConfigText(config) {
  document.querySelectorAll("[data-cfg]").forEach((el) => {
    const path = el.getAttribute("data-cfg");
    const value = App.resolvePath(config, path);
    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  const footerText = App.resolvePath(config, "footer.text");
  if (footerText) {
    let footerEl = document.getElementById("app-footer-text");
    if (!footerEl) {
      footerEl = document.createElement("div");
      footerEl.id = "app-footer-text";
      footerEl.style.cssText =
        "position:fixed;left:16px;bottom:8px;font-family:var(--font-mono);font-size:10px;color:var(--text-dim);opacity:0.6;z-index:2;pointer-events:none;";
      document.body.appendChild(footerEl);
    }
    footerEl.textContent = footerText;
  }
};
