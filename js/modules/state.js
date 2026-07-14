/* Global namespace + shared state. Every module attaches to window.App. */
window.App = {
  config: null,
  datasets: [],
  state: {
    currentDatasetId: null,
    currentDatasetMeta: null,
    profile: null,
    chats: null,
    manifest: null,
    activeView: "overview",
    pinBuffer: ""
  },

  screens: ["landing", "pin", "datasets", "processing", "terminal", "dashboard"],

  showScreen(name) {
    App.screens.forEach((s) => {
      const el = document.getElementById(`screen-${s}`);
      if (!el) return;
      el.classList.toggle("screen--active", s === name);
    });
  },

  toast(message, ms = 2400) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("toast--visible");
    clearTimeout(App._toastTimer);
    App._toastTimer = setTimeout(() => el.classList.remove("toast--visible"), ms);
  },

  assetPath(datasetId, relativePath) {
    return `assets/${encodeURIComponent(datasetId)}/${relativePath}`;
  },

  async fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return res.json();
  }
};
