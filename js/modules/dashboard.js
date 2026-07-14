App.mountDashboard = function mountDashboard() {
  const ds = App.state.currentDatasetMeta;
  const manifest = App.state.manifest || { counts: {}, lastUpdated: null };
  const profile = App.state.profile;
  const chats = App.state.chats;

  document.getElementById("sidebar-dataset-name").textContent = `/ ${ds.id}`;

  const chatCount = chats && Array.isArray(chats.messages) ? chats.messages.length : 0;
  const photoCount = (manifest.counts && manifest.counts.photos) || 0;
  const videoCount = (manifest.counts && manifest.counts.videos) || 0;
  const docCount = (manifest.counts && manifest.counts.documents) || 0;
  const totalFiles = photoCount + videoCount + docCount;
  const lastUpdated = manifest.lastUpdated ? new Date(manifest.lastUpdated) : null;

  const labels = (App.config.dashboard && App.config.dashboard.cards) || {};
  const statGrid = document.getElementById("stat-grid");
  const stats = [
    { label: labels.chats || "Chats", value: chatCount },
    { label: labels.photos || "Photos", value: photoCount },
    { label: labels.videos || "Videos", value: videoCount },
    { label: labels.documents || "Documents", value: docCount },
    { label: labels.totalFiles || "Total Files", value: totalFiles },
    { label: labels.lastUpdated || "Last Updated", value: lastUpdated ? lastUpdated.toLocaleDateString() : "—" }
  ];
  statGrid.innerHTML = stats.map((s) => `
    <div class="stat-card glass">
      <div class="stat-card__label">${App.escapeHTML(s.label)}</div>
      <div class="stat-card__value">${App.escapeHTML(s.value)}</div>
    </div>
  `).join("");

  document.getElementById("overview-subtitle").textContent =
    `Viewing "${ds.title || ds.id}" \u00b7 folder: assets/${ds.id}/`;

  const profilePanel = document.getElementById("profile-panel");
  if (profile) {
    const avatarSrc = profile.avatar ? App.assetPath(ds.id, profile.avatar) : "";
    const fields = Array.isArray(profile.fields) ? profile.fields : [];
    profilePanel.innerHTML = `
      ${avatarSrc ? `<img class="profile-panel__avatar" src="${avatarSrc}" alt="${App.escapeHTML(profile.displayName || "Profile")}" />` : ""}
      <div>
        <div class="profile-panel__name">${App.escapeHTML(profile.displayName || "Unknown Subject")}</div>
        <div class="profile-panel__status">${App.escapeHTML(profile.status || "")}</div>
      </div>
      <div class="profile-panel__fields">
        ${fields.map((f) => `
          <div>
            <div class="profile-field__label">${App.escapeHTML(f.label)}</div>
            <div class="profile-field__value">${App.escapeHTML(f.value)}</div>
          </div>
        `).join("")}
      </div>
    `;
  } else {
    profilePanel.innerHTML = `<div class="chat-empty">No profile.json found for this dataset.</div>`;
  }

  // Populate every view from the freshly loaded dataset.
  App.renderChats();
  App.renderPhotos();
  App.renderVideos();
  App.renderDocuments();
  App.resetSearch();

  App.switchView("overview");
};

App.switchView = function switchView(viewName) {
  App.state.activeView = viewName;
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.toggle("view--active", v.dataset.view === viewName);
  });
  document.querySelectorAll(".sidebar__link").forEach((btn) => {
    btn.classList.toggle("sidebar__link--active", btn.dataset.view === viewName);
  });
};
