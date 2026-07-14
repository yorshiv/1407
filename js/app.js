(async function bootstrap() {
  try {
    const [config, datasets] = await Promise.all([
      App.fetchJSON("config/app-config.json"),
      App.fetchJSON("config/datasets.json")
    ]);

    App.config = config;
    App.datasets = Array.isArray(datasets) ? datasets : [];

    App.applyTheme(config);
    App.applyConfigText(config);
    App.initParticles((config.animation && config.animation.particleCount) || 40);
    App.initPinScreen(config);
    App.renderDatasetGrid(App.datasets);

    App.initLightboxControls();
    App.initVideoModalControls();
    App.initDocPreviewControls();

    document.getElementById("btn-enter").addEventListener("click", () => {
      App.showScreen("pin");
    });

    document.getElementById("btn-change-dataset").addEventListener("click", () => {
      App.goToDatasets();
    });

    document.getElementById("btn-logout").addEventListener("click", () => {
      App.logout();
    });

    document.getElementById("sidebar-nav").addEventListener("click", (e) => {
      const btn = e.target.closest(".sidebar__link");
      if (btn) App.switchView(btn.dataset.view);
    });

    document.getElementById("search-input").addEventListener("input", (e) => {
      App.runSearch(e.target.value);
    });

  } catch (err) {
    console.error("Failed to initialize application:", err);
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
        flex-direction:column;gap:12px;font-family:sans-serif;color:#e8edf4;background:#05070a;text-align:center;padding:24px;">
        <h2>Could not start the application</h2>
        <p style="color:#8592a6;max-width:420px;">
          config/app-config.json or config/datasets.json could not be loaded.
          Make sure you're serving this project over HTTP (not opening index.html
          directly as a file), and that both config files are valid JSON.
        </p>
      </div>
    `;
  }
})();
