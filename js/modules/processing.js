App.runProcessingSequence = function runProcessingSequence() {
  return new Promise((resolve) => {
    const config = App.config;
    const messages = (config.loadingMessages && config.loadingMessages.length)
      ? config.loadingMessages
      : ["Loading..."];
    const totalMs = (config.animation && config.animation.processingDurationMs) || 5000;
    const msgIntervalRaw = (config.animation && config.animation.loadingMessageIntervalMs) || 650;
    const speed = (config.animation && config.animation.speed) || 1;
    const duration = totalMs / speed;
    const msgInterval = msgIntervalRaw / speed;

    const ring = document.getElementById("ring-fg");
    const percentEl = document.getElementById("processing-percent");
    const barEl = document.getElementById("processing-bar");
    const msgEl = document.getElementById("processing-message");

    const radius = 96;
    const circumference = 2 * Math.PI * radius;
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference}`;

    let msgIndex = 0;
    msgEl.textContent = messages[0];
    const msgTimer = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      msgEl.textContent = messages[msgIndex];
    }, msgInterval);

    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const pct = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - pct, 2);
      const percent = Math.round(eased * 100);

      ring.style.strokeDashoffset = `${circumference * (1 - eased)}`;
      barEl.style.width = `${percent}%`;
      percentEl.textContent = `${percent}%`;

      if (pct < 1) {
        requestAnimationFrame(tick);
      } else {
        clearInterval(msgTimer);
        msgEl.textContent = messages[messages.length - 1];
        setTimeout(resolve, 250 / speed);
      }
    }
    requestAnimationFrame(tick);
  });
};
