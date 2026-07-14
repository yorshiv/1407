App.runTerminalSequence = function runTerminalSequence(datasetId) {
  return new Promise((resolve) => {
    const config = App.config;
    const lines = (config.terminalLines && config.terminalLines.length)
      ? config.terminalLines
      : ["$ loading dataset...", "> analysis complete."];
    const speed = (config.animation && config.animation.speed) || 1;
    const charMs = ((config.animation && config.animation.terminalCharSpeedMs) || 14) / speed;

    const body = document.getElementById("terminal-body");
    body.innerHTML = "";

    const resolvedLines = lines.map((l) => l.replace(/\{dataset\}/g, datasetId));

    let lineIndex = 0;

    function typeLine(line, onDone) {
      const lineEl = document.createElement("div");
      lineEl.className = "terminal__line";
      const cursor = document.createElement("span");
      cursor.className = "terminal__cursor";
      body.appendChild(lineEl);
      body.appendChild(cursor);

      let charIndex = 0;
      const timer = setInterval(() => {
        charIndex++;
        lineEl.textContent = line.slice(0, charIndex);
        body.scrollTop = body.scrollHeight;
        if (charIndex >= line.length) {
          clearInterval(timer);
          cursor.remove();
          onDone();
        }
      }, charMs);
    }

    function next() {
      if (lineIndex >= resolvedLines.length) {
        setTimeout(resolve, 400 / speed);
        return;
      }
      typeLine(resolvedLines[lineIndex], () => {
        lineIndex++;
        setTimeout(next, 120 / speed);
      });
    }

    next();
  });
};
