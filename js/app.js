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
  alert("Button clicked");
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
    document.body.innerHTML = `
      <pre style="color:white;background:#111;padding:20px;white-space:pre-wrap">
${err.stack || err.message}
      </pre>
    `;
  }
})();
