App.initParticles = function initParticles(count) {
  const field = document.getElementById("particle-field");
  if (!field) return;
  field.innerHTML = "";
  const n = count || 40;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = 2 + Math.random() * 5;
    const left = Math.random() * 100;
    const dur = 10 + Math.random() * 16;
    const delay = Math.random() * 14;
    const driftX = (Math.random() - 0.5) * 160;
    p.style.setProperty("--size", `${size}px`);
    p.style.setProperty("--dur", `${dur}s`);
    p.style.setProperty("--delay", `${delay}s`);
    p.style.setProperty("--drift-x", `${driftX}px`);
    p.style.left = `${left}%`;
    field.appendChild(p);
  }
};
