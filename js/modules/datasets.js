App.renderDatasetGrid = function renderDatasetGrid(datasets) {
  const grid = document.getElementById("dataset-grid");
  grid.innerHTML = "";

  if (!datasets || datasets.length === 0) {
    const empty = document.createElement("div");
    empty.className = "dataset-empty";
    empty.textContent = App.resolvePath(App.config, "datasetScreen.emptyMessage") || "No datasets found.";
    grid.appendChild(empty);
    return;
  }

  datasets.forEach((ds, index) => {
    const card = document.createElement("div");
    card.className = "dataset-card glass";
    card.style.animationDelay = `${index * 0.06}s`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.innerHTML = `
      <div class="dataset-card__id">${App.escapeHTML(ds.id)}</div>
      <div class="dataset-card__title">${App.escapeHTML(ds.title || ds.id)}</div>
      <div class="dataset-card__desc">${App.escapeHTML(ds.description || "")}</div>
      <div class="dataset-card__status">${App.escapeHTML(ds.status || "Ready")}</div>
    `;
    const select = () => App.selectDataset(ds);
    card.addEventListener("click", select);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); }
    });
    grid.appendChild(card);
  });
};

App.escapeHTML = function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
};

App.selectDataset = async function selectDataset(ds) {
  App.state.currentDatasetId = ds.id;
  App.state.currentDatasetMeta = ds;
  App.state.profile = null;
  App.state.chats = null;
  App.state.manifest = null;

  App.showScreen("processing");
  await App.runProcessingSequence();

  try {
    const base = `assets/${encodeURIComponent(ds.id)}/`;

    const manifestPromise = App.fetchJSON(base + "manifest.json").catch(() => ({
      dataset: ds.id, counts: { photos: 0, videos: 0, documents: 0 }, photos: [], videos: [], documents: [], lastUpdated: null
    }));
    const profilePromise = App.fetchJSON(base + "profile.json").catch(() => null);
    const chatsPromise = App.fetchJSON(base + "chats.json").catch(() => null);

    const [manifest, profile, chats] = await Promise.all([manifestPromise, profilePromise, chatsPromise]);

    // Guard against a dataset switch happening mid-load.
    if (App.state.currentDatasetId !== ds.id) return;

    App.state.manifest = manifest;
    App.state.profile = profile;
    App.state.chats = chats;
  } catch (err) {
    console.error(err);
    App.toast("Could not fully load this dataset.");
  }

  App.showScreen("terminal");
  await App.runTerminalSequence(ds.id);

  App.showScreen("dashboard");
  App.mountDashboard();
};

App.logout = function logout() {
  const active = document.getElementById("screen-dashboard");
  active.classList.add("fade-out");
  setTimeout(() => {
    active.classList.remove("fade-out");
    App.state.currentDatasetId = null;
    App.state.currentDatasetMeta = null;
    App.state.profile = null;
    App.state.chats = null;
    App.state.manifest = null;
    App.state.pinBuffer = "";
    App.showScreen("landing");
  }, 380);
};

App.goToDatasets = function goToDatasets() {
  App.showScreen("datasets");
  App.renderDatasetGrid(App.datasets);
};
