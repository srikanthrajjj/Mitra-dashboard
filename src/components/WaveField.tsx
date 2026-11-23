import { motion, useReducedMotion } from 'motion/react';

const WAVES = [
  { amp: 26, base: 150, phase: 0, dur: 18, opacity: 0.6, w: 1.4, fill: true },
  { amp: 18, base: 172, phase: 1.2, dur: 26, opacity: 0.42, w: 1.2, fill: false },
  { amp: 34, base: 128, phase: 2.4, dur: 32, opacity: 0.3, w: 1.2, fill: false },
  { amp: 14, base: 192, phase: 3.6, dur: 14, opacity: 0.5, w: 1, fill: false },
  { amp: 22, base: 108, phase: 4.8, dur: 40, opacity: 0.22, w: 1, fill: false },
];
const PERIOD = 800;

function wavePath(amp: number, base: number, phase: number, closed: boolean): string {
  const pts: string[] = [];
  for (let x = 0; x <= 2400; x += 20) {
    const y = base + amp * Math.sin((x / PERIOD) * Math.PI * 2 + phase);
    pts.push(`${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`);
  }
  return closed ? `${pts.join('')}L2400 300L0 300Z` : pts.join('');
}

const DOTS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 8) % 96}%`,
  top: `${(i * 53 + 12) % 80}%`,
  size: 2 + (i % 3),
  delay: (i % 7) * 0.7,
  dur: 5 + (i % 5),
}));

export function WaveField() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in srgb, var(--color-foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-foreground) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 70% 65% at 50% 45%, black, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 45%, black, transparent 78%)',
        }}
      />
      <div
        className="absolute left-1/2 top-[38%] h-[26rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green blur-[130px]"
        style={{ opacity: 0.13 }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[58%] overflow-hidden">
        {WAVES.map((w, i) => (
          <motion.svg
            key={i}
            width={2400}
            height={300}
            viewBox="0 0 2400 300"
            className="absolute bottom-0 left-0"
            style={{ opacity: w.opacity }}
            animate={reduce ? undefined : { x: [0, -PERIOD] }}
            transition={{ duration: w.dur, repeat: Infinity, ease: 'linear' }}
          >
            <defs>
              <linearGradient id={`wave-s-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="2400" y2="0">
                <stop offset="0" stopColor="var(--color-brand-green)" stopOpacity="0" />
                <stop offset="0.5" stopColor="var(--color-brand-green)" stopOpacity="1" />
                <stop offset="1" stopColor="var(--color-brand-green)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`wave-f-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--color-brand-green)" stopOpacity="0.1" />
                <stop offset="1" stopColor="var(--color-brand-green)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {w.fill && <path d={wavePath(w.amp, w.base, w.phase, true)} fill={`url(#wave-f-${i})`} />}
            <path d={wavePath(w.amp, w.base, w.phase, false)} fill="none" stroke={`url(#wave-s-${i})`} strokeWidth={w.w} />
          </motion.svg>
        ))}
      </div>
      {DOTS.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-brand-green"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
          animate={reduce ? { opacity: 0.25 } : { opacity: [0, 0.6, 0], y: [0, -26, -52] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
