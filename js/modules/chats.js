App._chatFilter = "";

App.renderChats = function renderChats() {
  const container = document.getElementById("chat-container");
  const chats = App.state.chats;
  const dsId = App.state.currentDatasetId;

  if (!chats || !Array.isArray(chats.messages) || chats.messages.length === 0) {
    container.innerHTML = `<div class="chat-empty">No chats.json found for this dataset.</div>`;
    return;
  }

  const filter = App._chatFilter.trim().toLowerCase();
  const messages = chats.messages.filter((m) =>
    !filter || (m.text || "").toLowerCase().includes(filter)
  );

  let bodyHTML = "";
  let lastDate = null;

  if (messages.length === 0) {
    bodyHTML = `<div class="chat-empty">No messages match your search.</div>`;
  }

  messages.forEach((m) => {
    const date = new Date(m.timestamp);
    const dateKey = date.toDateString();
    if (dateKey !== lastDate) {
      bodyHTML += `<div class="chat-date-sep">${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>`;
      lastDate = dateKey;
    }

    const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const bubbleClass = m.sender === "me" ? "chat-msg--me" : "chat-msg--them";
    let mediaHTML = "";
    if (m.type === "image" && m.media) {
      const src = App.assetPath(dsId, m.media);
      mediaHTML = `<img src="${src}" alt="${App.escapeHTML(m.text || "shared image")}" data-full="${src}" class="chat-media-img" />`;
    } else if (m.type === "video" && m.media) {
      const src = App.assetPath(dsId, m.media);
      mediaHTML = `<video src="${src}" controls style="border-radius:10px;max-height:220px;margin-bottom:6px;"></video>`;
    }

    bodyHTML += `
      <div class="chat-msg ${bubbleClass}">
        ${mediaHTML}
        ${App.escapeHTML(m.text || "")}
        <span class="chat-msg__time">${time}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="chat-shell glass">
      <div class="chat-header">
        <div>
          <div class="chat-header__name">${App.escapeHTML(chats.contactName || "Contact")}</div>
          <div class="chat-header__sub">${messages.length} of ${chats.messages.length} messages</div>
        </div>
        <div class="chat-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" id="chat-search-input" placeholder="Search chat" value="${App.escapeHTML(App._chatFilter)}" />
        </div>
      </div>
      <div class="chat-body" id="chat-body">${bodyHTML}</div>
    </div>
  `;

  const body = document.getElementById("chat-body");
  body.scrollTop = body.scrollHeight;

  document.getElementById("chat-search-input").addEventListener("input", (e) => {
    App._chatFilter = e.target.value;
    App.renderChats();
    document.getElementById("chat-search-input").focus();
  });

  container.querySelectorAll(".chat-media-img").forEach((img) => {
    img.addEventListener("click", () => App.openLightboxFromSrc(img.dataset.full));
  });
};
