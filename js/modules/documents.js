App._docExtKind = function docExtKind(name) {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["txt", "md", "csv", "json"].includes(ext)) return "text";
  if (["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "m4v", "ogg"].includes(ext)) return "video";
  return "other";
};

App.renderDocuments = function renderDocuments() {
  const grid = document.getElementById("doc-grid");
  const manifest = App.state.manifest;
  const dsId = App.state.currentDatasetId;
  const docs = (manifest && manifest.documents) || [];

  document.getElementById("documents-subtitle").textContent = `${docs.length} document${docs.length === 1 ? "" : "s"} in this dataset`;

  if (docs.length === 0) {
    grid.innerHTML = `<div class="view-empty">No documents found in documents/ for this dataset.</div>`;
    return;
  }

  grid.innerHTML = docs.map((d) => {
    const ext = d.name.split(".").pop().toUpperCase();
    const src = App.assetPath(dsId, `documents/${d.name}`);
    const sizeKb = d.size ? `${Math.max(1, Math.round(d.size / 1024))} KB` : "";
    return `
      <div class="doc-card">
        <div class="doc-card__icon">${App.escapeHTML(ext.slice(0, 4))}</div>
        <div class="doc-card__name">${App.escapeHTML(d.name)}</div>
        <div class="doc-card__meta">${sizeKb}</div>
        <div class="doc-card__actions">
          <button class="btn btn--sm btn--ghost" data-preview="${src}" data-name="${App.escapeHTML(d.name)}">Preview</button>
          <a class="btn btn--sm btn--ghost" href="${src}" download>Download</a>
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll("[data-preview]").forEach((btn) => {
    btn.addEventListener("click", () => App.openDocPreview(btn.dataset.preview, btn.dataset.name));
  });
};

App.openDocPreview = async function openDocPreview(src, name) {
  const kind = App._docExtKind(name);
  const content = document.getElementById("doc-preview-content");
  document.getElementById("doc-preview-name").textContent = name;
  document.getElementById("doc-preview-download").href = src;
  content.innerHTML = "";

  if (kind === "pdf") {
    content.innerHTML = `<iframe src="${src}" title="${App.escapeHTML(name)}"></iframe>`;
  } else if (kind === "image") {
    content.style.background = "#000";
    content.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:contain;" alt="${App.escapeHTML(name)}" />`;
  } else if (kind === "video") {
    content.style.background = "#000";
    content.innerHTML = `<video src="${src}" controls style="width:100%;height:100%;object-fit:contain;"></video>`;
  } else if (kind === "text") {
    content.style.background = "#fff";
    try {
      const res = await fetch(src, { cache: "no-store" });
      const text = await res.text();
      content.innerHTML = `<pre></pre>`;
      content.querySelector("pre").textContent = text.slice(0, 200000);
    } catch (err) {
      content.innerHTML = `<div style="padding:24px;color:#333;">Could not load a preview for this file.</div>`;
    }
  } else {
    content.style.background = "var(--panel)";
    content.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-dim);font-family:var(--font-mono);">No inline preview available for this file type.<br/>Use the download button above.</div>`;
  }

  document.getElementById("doc-preview").classList.add("doc-preview--active");
};

App.closeDocPreview = function closeDocPreview() {
  document.getElementById("doc-preview").classList.remove("doc-preview--active");
  document.getElementById("doc-preview-content").innerHTML = "";
};

App.initDocPreviewControls = function initDocPreviewControls() {
  document.getElementById("doc-preview-close").addEventListener("click", App.closeDocPreview);
  document.getElementById("doc-preview").addEventListener("click", (e) => {
    if (e.target.id === "doc-preview") App.closeDocPreview();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("doc-preview").classList.contains("doc-preview--active")) {
      App.closeDocPreview();
    }
  });
};
