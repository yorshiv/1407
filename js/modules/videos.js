App.renderVideos = function renderVideos() {
  const grid = document.getElementById("video-grid");
  const manifest = App.state.manifest;
  const dsId = App.state.currentDatasetId;
  const videos = (manifest && manifest.videos) || [];

  document.getElementById("videos-subtitle").textContent = `${videos.length} video${videos.length === 1 ? "" : "s"} in this dataset`;

  if (videos.length === 0) {
    grid.innerHTML = `<div class="view-empty">No videos found in videos/ for this dataset.</div>`;
    return;
  }

  grid.innerHTML = videos.map((v) => {
    const src = App.assetPath(dsId, `videos/${v.name}`);
    return `
      <div class="video-tile" data-src="${src}">
        <div class="video-tile__thumb">
          <video src="${src}#t=0.5" preload="metadata" muted playsinline></video>
          <div class="video-tile__play">&#9658;</div>
        </div>
        <div class="video-tile__name">${App.escapeHTML(v.name)}</div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll(".video-tile").forEach((tile) => {
    tile.addEventListener("click", () => App.openVideoModal(tile.dataset.src));
  });
};

App.openVideoModal = function openVideoModal(src) {
  const player = document.getElementById("video-modal-player");
  player.src = src;
  player.autoplay = false;
  player.currentTime = 0;
  document.getElementById("video-modal").classList.add("video-modal--active");
};

App.closeVideoModal = function closeVideoModal() {
  const player = document.getElementById("video-modal-player");
  player.pause();
  player.removeAttribute("src");
  player.load();
  document.getElementById("video-modal").classList.remove("video-modal--active");
};

App.initVideoModalControls = function initVideoModalControls() {
  document.getElementById("video-modal").addEventListener("click", (e) => {
    if (e.target.id === "video-modal") App.closeVideoModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("video-modal").classList.contains("video-modal--active")) {
      App.closeVideoModal();
    }
  });
};
