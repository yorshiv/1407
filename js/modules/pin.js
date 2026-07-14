App.initPinScreen = function initPinScreen(config) {
  const pinLength = config.pinLength || String(config.pin || "").length || 4;
  const dotsWrap = document.getElementById("pin-dots");
  const keypad = document.getElementById("pin-keypad");
  const panel = document.getElementById("pin-panel");
  const errorEl = document.getElementById("pin-error");

  App.state.pinBuffer = "";

  dotsWrap.innerHTML = "";
  for (let i = 0; i < pinLength; i++) {
    const dot = document.createElement("span");
    dot.className = "pin-dot";
    dotsWrap.appendChild(dot);
  }

  function renderDots() {
    const dots = dotsWrap.querySelectorAll(".pin-dot");
    dots.forEach((d, i) => d.classList.toggle("pin-dot--filled", i < App.state.pinBuffer.length));
  }

  function showError() {
    panel.classList.add("pin-panel--error", "pin-panel--shake");
    errorEl.classList.add("pin-error--visible");
    setTimeout(() => panel.classList.remove("pin-panel--shake"), 500);
    setTimeout(() => {
      App.state.pinBuffer = "";
      renderDots();
      panel.classList.remove("pin-panel--error");
      errorEl.classList.remove("pin-error--visible");
    }, 900);
  }

  function submitIfComplete() {
    if (App.state.pinBuffer.length !== pinLength) return;
    const expected = String(config.pin || "");
    if (App.state.pinBuffer === expected) {
      App.toast("Access granted");
      setTimeout(() => App.goToDatasets(), 300);
    } else {
      showError();
    }
  }

  function pressKey(val) {
    if (val === "back") {
      App.state.pinBuffer = App.state.pinBuffer.slice(0, -1);
      renderDots();
      return;
    }
    if (App.state.pinBuffer.length >= pinLength) return;
    App.state.pinBuffer += val;
    renderDots();
    submitIfComplete();
  }

  keypad.innerHTML = "";
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];
  keys.forEach((k) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pin-key";
    if (k === "clear") {
      btn.classList.add("pin-key--wide");
      btn.textContent = "CLR";
      btn.addEventListener("click", () => {
        App.state.pinBuffer = "";
        renderDots();
      });
    } else if (k === "back") {
      btn.classList.add("pin-key--wide");
      btn.textContent = "\u2190";
      btn.addEventListener("click", () => pressKey("back"));
    } else {
      btn.textContent = k;
      btn.addEventListener("click", () => pressKey(k));
    }
    keypad.appendChild(btn);
  });

  App._pinKeyHandler && document.removeEventListener("keydown", App._pinKeyHandler);
  App._pinKeyHandler = (e) => {
    if (!document.getElementById("screen-pin").classList.contains("screen--active")) return;
    if (/^[0-9]$/.test(e.key)) pressKey(e.key);
    if (e.key === "Backspace") pressKey("back");
  };
  document.addEventListener("keydown", App._pinKeyHandler);

  renderDots();
};
