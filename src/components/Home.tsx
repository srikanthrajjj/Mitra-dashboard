import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { AskBar } from './AskBar';
import { LogoMark } from './Logo';
import { APPROVALS, APPROVED_SHARE, CATEGORIES, pendingCount, type Decision, type Decisions, type View } from '../data';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

const CHIPS = ['What is waiting on me?', 'Show the oldest approvals', 'Summarise this week'];

const SKILLS: { name: string; tasks: number }[] = [
  { name: 'Requirements', tasks: 172 },
  { name: 'Build & Test', tasks: 7 },
  { name: 'Documentation', tasks: 9 },
  { name: 'Release', tasks: 12 },
];

function ageMinutes(age: string): number {
  const n = parseInt(age, 10) || 0;
  return age.endsWith('d') ? n * 1440 : age.endsWith('w') ? n * 10080 : age.endsWith('h') ? n * 60 : n;
}

function firstName(email: string): string {
  const first = (email.split('@')[0] ?? '').split(/[._-]/)[0] ?? '';
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'there';
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening';
}

/** The shared card: bold title, arrow at the top right, content below. */
function Card({ title, onOpen, children, className, delay = 0 }: { title: string; onOpen?: () => void; children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className={cn('flex flex-col rounded-2xl border border-border bg-card p-5', className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
        {onOpen && (
          <button type="button" onClick={onOpen} aria-label={`Open ${title}`} className="text-muted-foreground transition-colors hover:text-foreground">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      {children}
    </motion.section>
  );
}

function Gauge({ pct }: { pct: number }) {
  return (
    <div className="relative mx-auto w-full max-w-[210px]">
      <svg viewBox="0 0 200 108" className="w-full" aria-hidden>
        <path d="M18 100 A82 82 0 0 1 182 100" fill="none" strokeWidth="24" strokeLinecap="round" className="stroke-chart-blue/25" />
        <motion.path
          d="M18 100 A82 82 0 0 1 182 100"
          fill="none"
          strokeWidth="24"
          strokeLinecap="round"
          className="stroke-chart-orange"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct / 100 }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </svg>
      <p className="absolute inset-x-0 bottom-0 text-center font-display text-[2.1rem] font-semibold leading-none tabular-nums tracking-[-0.04em]">{pct}%</p>
    </div>
  );
}

function Donut({ parts, total }: { parts: { n: number; cls: string }[]; total: number }) {
  const sum = Math.max(1, parts.reduce((a, p) => a + p.n, 0));
  let start = 0;
  return (
    <div className="relative grid h-[124px] w-[124px] shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="40" fill="none" strokeWidth="13" className="stroke-border" />
        {parts.map((p, i) => {
          const len = (p.n / sum) * 100;
          const el = (
            <motion.circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="13"
              pathLength={100}
              className={p.cls}
              strokeDasharray={`${Math.max(0, len - 1)} ${100 - Math.max(0, len - 1)}`}
              strokeDashoffset={-start}
              initial={{ opacity: 0 }}
              animate={{ opacity: p.n > 0 ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            />
          );
          start += len;
          return el;
        })}
      </svg>
      <div className="text-center">
        <p className="font-display text-[2rem] font-semibold leading-none tabular-nums tracking-[-0.04em]">{total}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Open</p>
      </div>
    </div>
  );
}

interface HomeProps {
  cat: string;
  view: View;
  email: string;
  decisions: Decisions;
  onDecide: (id: string, d: Decision | null) => void;
  onOpenApp: (id: string) => void;
  onOpenApps: () => void;
  onOpenApprovals: (cat: string) => void;
  onWorkspace: (cat: string) => void;
  onAsk: (text: string) => void;
}

export function Home({ cat, email, decisions, onOpenApp, onOpenApprovals, onWorkspace, onAsk }: HomeProps) {
  const pending = useMemo(
    () => APPROVALS.filter((a) => !decisions[a.id] && (cat === 'all' || a.cat === cat)).sort((a, b) => ageMinutes(b.age) - ageMinutes(a.age)),
    [decisions, cat],
  );
  const share = Math.round((APPROVED_SHARE[cat] ?? 0.64) * 100);

  const buckets = [
    { label: 'Over 3 hours', cls: 'stroke-chart-red', dot: 'bg-chart-red', n: pending.filter((a) => ageMinutes(a.age) >= 180).length },
    { label: '1 to 3 hours', cls: 'stroke-chart-orange', dot: 'bg-chart-orange', n: pending.filter((a) => ageMinutes(a.age) >= 60 && ageMinutes(a.age) < 180).length },
    { label: '15 to 60 min', cls: 'stroke-chart-yellow', dot: 'bg-chart-yellow', n: pending.filter((a) => ageMinutes(a.age) >= 15 && ageMinutes(a.age) < 60).length },
    { label: 'Under 15 min', cls: 'stroke-chart-grey', dot: 'bg-chart-grey', n: pending.filter((a) => ageMinutes(a.age) < 15).length },
  ];

  const rows = CATEGORIES.slice(0, 4).map((c) => {
    const waiting = pendingCount(decisions, c.key);
    const open = Math.round((1 - (APPROVED_SHARE[c.key] ?? 0.6)) * 100);
    return { key: c.key, label: c.label, waiting, pct: open };
  });

  const openApprovals = () => onOpenApprovals(cat);

  // Scale the whole layout up with the space available, so it fills big screens instead of sitting small.
  const outer = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const fit = () => setZoom(Math.min(1.75, Math.max(1, (el.clientWidth - 64) / 1040)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="w-full">
    <div className="mx-auto max-w-[1104px] px-5 pb-10 pt-10 md:px-8 md:pt-14" style={{ zoom }}>
      {/* greeting + ask */}
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-3 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-medium tracking-[-0.02em]">
          <LogoMark size={26} />
          {greeting()}, {firstName(email)}. Let&rsquo;s get to work.
        </h1>
        <div className="mx-auto mt-7 max-w-[560px] text-left">
          <AskBar decisions={decisions} onAsk={onAsk} onOpenApp={onOpenApp} onOpenApprovals={onOpenApprovals} />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onAsk(c)}
              className="rounded-md border border-border bg-card px-3.5 py-2 text-[12.5px] text-foreground transition-colors hover:bg-accent"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* cards */}
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr]">
        <Card title="Top Activity" onOpen={openApprovals} className="md:row-span-2" delay={0}>
          <ul className="flex-1 divide-y divide-border">
            {pending.slice(0, 4).map((a) => (
              <li key={a.id} className="py-3.5 first:pt-0">
                <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
                  <span className="rounded bg-chart-blue/15 px-1.5 py-0.5 font-medium text-chart-blue">In progress</span>
                  <span className="truncate">
                    {a.by} · {a.stage} stage
                  </span>
                </div>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold leading-snug">{a.title}</p>
                  <button
                    type="button"
                    onClick={() => onOpenApprovals(a.cat)}
                    className="shrink-0 rounded-md bg-muted px-2.5 py-1 text-[11px] text-foreground transition-colors hover:bg-accent"
                  >
                    Review with AI
                  </button>
                </div>
              </li>
            ))}
            {pending.length === 0 && <li className="py-10 text-center text-[13px] text-muted-foreground">You are all caught up.</li>}
          </ul>
          <button type="button" onClick={openApprovals} className="mt-3 self-start text-[11.5px] text-muted-foreground transition-colors hover:text-foreground">
            See all in Approvals
          </button>
        </Card>

        <Card title="Delivery posture" onOpen={openApprovals} delay={0.06}>
          <Gauge pct={share} />
          <p className="mt-5 text-[12px] leading-snug text-muted-foreground">
            {share}% of delivery stages are approved. {pending.length} {pending.length === 1 ? 'decision is' : 'decisions are'} still open.
          </p>
          <button type="button" onClick={openApprovals} className="mt-3 self-end rounded-md bg-muted px-2.5 py-1 text-[11px] transition-colors hover:bg-accent">
            Review with AI
          </button>
        </Card>

        <Card title="Open approvals" onOpen={openApprovals} delay={0.12}>
          <div className="flex items-center gap-5">
            <Donut parts={buckets.map((b) => ({ n: b.n, cls: b.cls }))} total={pending.length} />
            <ul className="space-y-2 text-[12px]">
              {buckets.map((b) => (
                <li key={b.label} className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', b.dot)} />
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-semibold tabular-nums">{b.n}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-5 text-[12px] leading-snug text-muted-foreground">
            {pending[0] ? `The longest wait is ${pending[0].age}, on ${pending[0].title}.` : 'Nothing is waiting on you.'}
          </p>
        </Card>

        <Card title="Workspace status" onOpen={() => onWorkspace('all')} delay={0.18}>
          <ul className="space-y-3.5">
            {rows.map((r) => (
              <li key={r.key} className="flex items-center gap-3 text-[12px]">
                <span className="w-16 shrink-0 text-muted-foreground">{r.label}</span>
                <span className="flex h-3.5 flex-1 overflow-hidden rounded-sm bg-chart-blue">
                  <motion.span className="h-full bg-chart-red" initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 0.8, ease: EASE }} />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-center gap-5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-chart-red" /> Waiting
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-chart-blue" /> Approved
            </span>
          </div>
        </Card>

        <Card title="Skills" onOpen={openApprovals} delay={0.24}>
          <ul className="divide-y divide-border">
            {SKILLS.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-3 py-3 text-[12.5px] first:pt-0 last:pb-0">
                <span>{s.name}</span>
                <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">Active · {s.tasks} tasks</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Sample data</p>
    </div>
    </div>
  );
}
