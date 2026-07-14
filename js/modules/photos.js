App._photoList = [];
App._photoIndex = 0;

App.renderPhotos = function renderPhotos() {
  const grid = document.getElementById("photo-grid");
  const manifest = App.state.manifest;
  const dsId = App.state.currentDatasetId;
  const photos = (manifest && manifest.photos) || [];

  document.getElementById("photos-subtitle").textContent = `${photos.length} photo${photos.length === 1 ? "" : "s"} in this dataset`;

  App._photoList = photos.map((p) => App.assetPath(dsId, `photos/${p.name}`));

  if (photos.length === 0) {
    grid.innerHTML = `<div class="view-empty">No photos found in photos/ for this dataset.</div>`;
    return;
  }

  grid.innerHTML = photos.map((p, i) => `
    <div class="photo-tile" data-index="${i}">
      <img src="${App.assetPath(dsId, `photos/${p.name}`)}" alt="${App.escapeHTML(p.name)}" loading="lazy" />
      <div class="photo-tile__overlay">${App.escapeHTML(p.name)}</div>
    </div>
  `).join("");

  grid.querySelectorAll(".photo-tile").forEach((tile) => {
    tile.addEventListener("click", () => App.openLightbox(Number(tile.dataset.index)));
  });
};

App.openLightbox = function openLightbox(index) {
  if (App._photoList.length === 0) return;
  App._photoIndex = ((index % App._photoList.length) + App._photoList.length) % App._photoList.length;
  const img = document.getElementById("lightbox-img");
  img.src = App._photoList[App._photoIndex];
  img.style.transform = "scale(1)";
  img.style.cursor = "zoom-in";
  document.getElementById("lightbox").classList.add("lightbox--active");
};

App.openLightboxFromSrc = function openLightboxFromSrc(src) {
  const idx = App._photoList.indexOf(src);
  if (idx >= 0) {
    App.openLightbox(idx);
  } else {
    App._photoList = [src];
    App.openLightbox(0);
  }
};

App.closeLightbox = function closeLightbox() {
  document.getElementById("lightbox").classList.remove("lightbox--active");
};

App.lightboxStep = function lightboxStep(delta) {
  App.openLightbox(App._photoIndex + delta);
};

App.initLightboxControls = function initLightboxControls() {
  document.getElementById("lightbox-close").addEventListener("click", App.closeLightbox);
  document.getElementById("lightbox-prev").addEventListener("click", () => App.lightboxStep(-1));
  document.getElementById("lightbox-next").addEventListener("click", () => App.lightboxStep(1));
  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") App.closeLightbox();
  });

  const img = document.getElementById("lightbox-img");
  img.style.cursor = "zoom-in";
  img.addEventListener("click", (e) => {
    e.stopPropagation();
    img.style.transform = img.style.transform === "scale(1.8)" ? "scale(1)" : "scale(1.8)";
    img.style.cursor = img.style.transform === "scale(1.8)" ? "zoom-out" : "zoom-in";
    img.style.transition = "transform 0.25s ease";
  });

  document.addEventListener("keydown", (e) => {
    if (!document.getElementById("lightbox").classList.contains("lightbox--active")) return;
    if (e.key === "Escape") App.closeLightbox();
    if (e.key === "ArrowLeft") App.lightboxStep(-1);
    if (e.key === "ArrowRight") App.lightboxStep(1);
  });
};
