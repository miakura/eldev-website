const LANGUAGES = [
  "Python",
  "Go",
  "TypeScript",
  "JavaScript",
  "React",
  "SQL",
  "FastAPI",
  "Gin",
  "PostgreSQL",
  "Docker",
  "gRPC",
  "Node",
  "HTML",
  "CSS",
  "Redis",
  "Vite",
  "Next.js",
  "Three.js",
] as const;

type Drop = {
  text: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
  drift: number;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobile(): boolean {
  return window.matchMedia("(max-width: 760px)").matches;
}

export function initLangRain(root?: HTMLElement): () => void {
  if (prefersReducedMotion()) {
    return () => undefined;
  }

  const host = root || document.querySelector<HTMLElement>(".lang-rain-host") || document.body;
  const canvas = document.createElement("canvas");
  canvas.className = "lang-rain";
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return () => undefined;
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let running = false;
  let drops: Drop[] = [];

  const count = (): number => (isMobile() ? 14 : 26);

  const resize = (): void => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.1 : 1.35);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  };

  const seed = (): void => {
    const n = count();
    drops = Array.from({ length: n }, (_, index) => makeDrop(index / n));
  };

  const makeDrop = (phase = Math.random()): Drop => ({
    text: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
    x: Math.random() * width,
    y: phase * height * 1.2 - height * 0.2,
    speed: 0.25 + Math.random() * 0.55,
    size: isMobile() ? 11 + Math.random() * 5 : 12 + Math.random() * 8,
    alpha: 0.08 + Math.random() * 0.14,
    drift: (Math.random() - 0.5) * 0.2,
  });

  const draw = (): void => {
    frame = window.requestAnimationFrame(draw);
    if (!running) {
      return;
    }
    ctx.clearRect(0, 0, width, height);
    ctx.textBaseline = "top";
    ctx.font = "600 14px Manrope, system-ui, sans-serif";
    for (const drop of drops) {
      drop.y += drop.speed;
      drop.x += drop.drift;
      if (drop.y > height + 40 || drop.x < -80 || drop.x > width + 80) {
        Object.assign(drop, makeDrop(0), { y: -40 - Math.random() * 80 });
      }
      ctx.globalAlpha = drop.alpha;
      ctx.font = `600 ${drop.size}px Manrope, system-ui, sans-serif`;
      ctx.fillStyle = drop.text === "Python" || drop.text === "Go" ? "#b7a0ff" : "#8a9bb8";
      ctx.fillText(drop.text, drop.x, drop.y);
    }
    ctx.globalAlpha = 1;
  };

  const start = (): void => {
    if (running) {
      return;
    }
    running = true;
    draw();
  };

  const stop = (): void => {
    running = false;
    window.cancelAnimationFrame(frame);
  };

  const onVisibility = (): void => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  };

  resize();
  start();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility, { passive: true });

  return () => {
    stop();
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.remove();
  };
}
