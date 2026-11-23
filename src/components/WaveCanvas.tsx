import { useEffect, useRef } from 'react';

/** Reads the brand green from the theme and returns it as r, g, b. */
function brandRgb(el: HTMLElement): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue('--color-brand-green').trim().replace('#', '');
  const hex = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = parseInt(hex || '4fcf36', 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const LINES = 52;

/**
 * A ribbon of flowing lines that fans out and folds back on itself, in the style of the wave
 * background patterns in UI kits. Drawn on a canvas that fills its parent, so it is always sharp
 * and can never be cropped. Holds still when the visitor prefers reduced motion.
 */
export function WaveCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const [r, g, b] = brandRgb(canvas);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    const start = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const t = reduce ? 4 : (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      const step = 6;
      for (let i = 0; i < LINES; i++) {
        const k = i / (LINES - 1); // 0..1 across the ribbon
        const mid = 1 - Math.abs(k - 0.5) * 2; // 1 in the middle of the ribbon, 0 at its edges
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const nx = x / w;
          const spread = 0.62 * (0.6 + 0.4 * Math.sin(nx * Math.PI * 1.2 + t * 0.18));
          const y =
            h * 0.46 +
            Math.sin(nx * Math.PI * 1.6 + t * 0.32 + k * 1.9) * h * 0.2 +
            Math.sin(nx * Math.PI * 3.2 - t * 0.21 + k * 3.2) * h * 0.06 +
            (k - 0.5) * h * spread;
          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        const a = 0.16 + mid * 0.72;
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${a})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${a * 0.45})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) requestAnimationFrame(draw);
    });
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
