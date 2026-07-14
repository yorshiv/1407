App.resetSearch = function resetSearch() {
  const input = document.getElementById("search-input");
  if (input) input.value = "";
  document.getElementById("search-results").innerHTML = "";
};

App.runSearch = function runSearch(query) {
  const resultsEl = document.getElementById("search-results");
  const q = query.trim().toLowerCase();
  if (!q) {
    resultsEl.innerHTML = "";
    return;
  }

  const dsId = App.state.currentDatasetId;
  const results = [];

  const chats = App.state.chats;
  if (chats && Array.isArray(chats.messages)) {
    chats.messages.forEach((m) => {
      if ((m.text || "").toLowerCase().includes(q)) {
        results.push({ tag: "Chat", text: m.text, action: () => { App.switchView("chats"); App._chatFilter = query; App.renderChats(); } });
      }
    });
  }

  const manifest = App.state.manifest || {};
  (manifest.photos || []).forEach((p) => {
    if (p.name.toLowerCase().includes(q)) {
      results.push({ tag: "Photo", text: p.name, action: () => App.switchView("photos") });
    }
  });
  (manifest.videos || []).forEach((v) => {
    if (v.name.toLowerCase().includes(q)) {
      results.push({ tag: "Video", text: v.name, action: () => App.switchView("videos") });
    }
  });
  (manifest.documents || []).forEach((d) => {
    if (d.name.toLowerCase().includes(q)) {
      results.push({ tag: "Document", text: d.name, action: () => App.switchView("documents") });
    }
  });

  const profile = App.state.profile;
  if (profile) {
    (profile.fields || []).forEach((f) => {
      if ((`${f.label} ${f.value}`).toLowerCase().includes(q)) {
        results.push({ tag: "Profile", text: `${f.label}: ${f.value}`, action: () => App.switchView("overview") });
      }
    });
    if ((profile.displayName || "").toLowerCase().includes(q)) {
      results.push({ tag: "Profile", text: profile.displayName, action: () => App.switchView("overview") });
    }
  }

  if (results.length === 0) {
    resultsEl.innerHTML = `<div class="view-empty">No matches in dataset "${App.escapeHTML(dsId)}".</div>`;
    return;
  }

  resultsEl.innerHTML = results.slice(0, 100).map((r, i) => `
    <div class="search-result" data-index="${i}">
      <span class="search-result__tag">${App.escapeHTML(r.tag)}</span>
      <span class="search-result__text">${App.highlightMatch(r.text, query)}</span>
    </div>
  `).join("");

  resultsEl.querySelectorAll(".search-result").forEach((el) => {
    el.addEventListener("click", () => results[Number(el.dataset.index)].action());
  });
};

App.highlightMatch = function highlightMatch(text, query) {
  const safe = App.escapeHTML(text);
  const q = App.escapeHTML(query).trim();
  if (!q) return safe;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return safe.replace(re, "<mark>$1</mark>");
};
