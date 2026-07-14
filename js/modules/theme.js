App.applyTheme = function applyTheme(config) {
  const root = document.documentElement.style;
  const theme = config.theme || {};
  const map = {
    colorBg: "--bg",
    colorPanel: "--panel",
    colorPanelAlt: "--panel-alt",
    colorBorder: "--border",
    colorText: "--text",
    colorTextDim: "--text-dim",
    colorAccent: "--accent",
    colorAccent2: "--accent-2",
    colorDanger: "--danger",
    colorTerminal: "--terminal",
    fontDisplay: "--font-display",
    fontBody: "--font-body",
    fontMono: "--font-mono"
  };
  Object.entries(map).forEach(([key, cssVar]) => {
    if (theme[key]) root.setProperty(cssVar, theme[key]);
  });

  const speed = (config.animation && config.animation.speed) || 1;
  root.setProperty("--speed", String(speed));

  if (config.appName) {
    document.title = config.appName;
  }
};
