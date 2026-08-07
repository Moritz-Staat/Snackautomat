interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  speed: number;
  angle: number;
  spin: number;
  drift: number;
}

const COLORS = ['#62b55a', '#2e7d32', '#ffd700', '#ff6b35', '#4fc3f7', '#ffffff'] as const;
const PARTICLE_COUNT = 130;
const DURATION_MS = 4000;
/** Ab diesem Anteil der Laufzeit blenden die Schnipsel aus. */
const FADE_START = 0.7;

export function startConfetti(): void {
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  // Auf dem 4K-Panel ist devicePixelRatio > 1; ohne Skalierung waeren die
  // Schnipsel unscharf.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.scale(dpr, dpr);

  const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height - height,
    w: Math.random() * 12 + 6,
    h: Math.random() * 6 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0],
    speed: Math.random() * 3 + 2,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    drift: (Math.random() - 0.5) * 1.5,
  }));

  let start: number | null = null;

  function frame(timestamp: number): void {
    if (start === null) start = timestamp;
    const elapsed = timestamp - start;
    ctx!.clearRect(0, 0, width, height);

    let alive = false;
    for (const p of particles) {
      p.y += p.speed;
      p.x += p.drift;
      p.angle += p.spin;
      if (p.y < height + 20) alive = true;

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.angle);
      ctx!.fillStyle = p.color;
      if (elapsed > DURATION_MS * FADE_START) {
        const fadeProgress = (elapsed - DURATION_MS * FADE_START) / (DURATION_MS * (1 - FADE_START));
        ctx!.globalAlpha = Math.max(0, 1 - fadeProgress);
      }
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    }

    if (elapsed < DURATION_MS && alive) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
}
