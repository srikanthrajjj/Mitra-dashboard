import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react';
import { ArrowRight, Check, CheckCheck, FileText, LayoutGrid, Rocket, Wrench } from 'lucide-react';
import { AskBar } from './AskBar';
import { SHOW_APPS } from '../config';
import {
  APPROVALS,
  APPS,
  APPROVED_SHARE,
  CATEGORIES,
  STAGES,
  TONE,
  WEEK,
  pendingCount,
  type Decision,
  type Decisions,
  type View,
} from '../data';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

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
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Count({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => String(Math.round(v)));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: EASE });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span>{text}</motion.span>;
}

function Panel({ title, aside, children, className }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card p-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-14 w-14 shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="4" className="stroke-border" />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-brand-green"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 1, ease: EASE }}
        />
      </svg>
      <span className="font-display text-[12px] font-semibold tabular-nums">{pct}%</span>
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

export function Home({ cat, view, email, decisions, onDecide, onOpenApp, onOpenApps, onOpenApprovals, onWorkspace, onAsk }: HomeProps) {
  const inScope = <T extends { cat: string }>(x: T) => cat === 'all' || x.cat === cat;
  const pending = APPROVALS.filter((a) => !decisions[a.id] && inScope(a)).sort((a, b) => ageMinutes(b.age) - ageMinutes(a.age));
  const next = pending[0];
  const scopedApps = APPS.filter(inScope);
  const inBuild = scopedApps.filter((a) => a.stage < 5);
  const live = scopedApps.filter((a) => a.stage >= 5);
  const week = WEEK[cat] ?? WEEK.all;
  const share = APPROVED_SHARE[cat] ?? 0.64;
  const motion3 = [...inBuild].sort((a, b) => b.pct - a.pct).slice(0, 3);
  const stageCounts = [0, 1, 2, 3, 4, 5].map((s) => scopedApps.filter((a) => a.stage === s).length);
  const peak = Math.max(1, ...stageCounts);
  const needApproval = inBuild.filter((a) => a.approvalId && !decisions[a.approvalId]).length;
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const toApps = SHOW_APPS ? onOpenApps : undefined;
  const kpis: { label: string; value: number; note: string; icon: ReactNode; onClick?: () => void }[] = [
    {
      label: 'Waiting on you',
      value: pending.length,
      note: next ? `Oldest has waited ${next.age}` : 'You are all caught up',
      icon: <CheckCheck className="h-4 w-4" aria-hidden />,
      onClick: () => onOpenApprovals(cat),
    },
    ...(SHOW_APPS
      ? [
          { label: 'Apps in build', value: inBuild.length, note: `${needApproval} need approval`, icon: <Wrench className="h-4 w-4" aria-hidden />, onClick: toApps },
          { label: 'Live apps', value: live.length, note: `${Math.round(share * 100)}% of stages approved`, icon: <Rocket className="h-4 w-4" aria-hidden />, onClick: toApps },
        ]
      : [
          { label: 'Approvals given', value: week[1], note: 'This week', icon: <Wrench className="h-4 w-4" aria-hidden />, onClick: undefined },
          { label: 'Skills run', value: week[2], note: 'This week', icon: <Rocket className="h-4 w-4" aria-hidden />, onClick: undefined },
        ]),
    { label: 'Shipped this week', value: week[0], note: `${Math.round(share * 100)}% of stages approved`, icon: <LayoutGrid className="h-4 w-4" aria-hidden />, onClick: toApps },
  ];

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{ background: 'radial-gradient(ellipse 55% 100% at 25% 0%, color-mix(in srgb, var(--brand-green) 12%, transparent), transparent 72%)' }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl space-y-6 p-5 md:p-8">
        {/* greeting + ask */}
        <div className="pt-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{date}</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
            {greeting()}, {firstName(email)}.
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {pending.length > 0 ? (
              <>
                <span className="font-medium text-foreground">{pending.length} {pending.length === 1 ? 'approval needs' : 'approvals need'} you</span>
                {' '}and {inBuild.length} {inBuild.length === 1 ? 'build is' : 'builds are'} in progress.
              </>
            ) : (
              'Nothing is waiting on you. Your agents are still building.'
            )}
          </p>
          <div className="mt-6 max-w-3xl">
            <AskBar decisions={decisions} onAsk={onAsk} onOpenApp={onOpenApp} onOpenApprovals={onOpenApprovals} />
          </div>
        </div>

        {/* at a glance */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
              className="contents"
            >
              {k.onClick ? (
                <button type="button" onClick={k.onClick} className="group rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-brand-green/40">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[12px]">{k.label}</span>
                <span className="text-brand-green">{k.icon}</span>
              </div>
              <p className="mt-3 font-display text-[2.4rem] font-semibold leading-none tabular-nums tracking-[-0.04em]">
                <Count value={k.value} />
              </p>
              <p className="mt-2 truncate text-[11.5px] text-muted-foreground">{k.note}</p>
                </button>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-4 text-left">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[12px]">{k.label}</span>
                <span className="text-brand-green">{k.icon}</span>
              </div>
              <p className="mt-3 font-display text-[2.4rem] font-semibold leading-none tabular-nums tracking-[-0.04em]">
                <Count value={k.value} />
              </p>
              <p className="mt-2 truncate text-[11.5px] text-muted-foreground">{k.note}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            {/* the one thing to do next */}
            <Panel title="Up next" aside={next && <span className="text-[11px] text-muted-foreground">{pending.length - 1} more after this</span>}>
              <AnimatePresence mode="wait" initial={false}>
                {next ? (
                  <motion.div
                    key={next.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-green/10 text-brand-green">
                        {(() => {
                          const Icon = CATEGORIES.find((c) => c.key === next.cat)?.icon ?? FileText;
                          return <Icon className="h-6 w-6" aria-hidden />;
                        })()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{next.title}</h3>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{next.stage} stage</span>
                        </div>
                        <p className="mt-1.5 text-[13.5px] leading-snug text-muted-foreground">{next.summary}</p>
                        <p className="mt-2 text-[12px] text-muted-foreground">
                          {next.by} · waiting {next.age} · {next.artifacts} artifacts
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onDecide(next.id, 'approved')}
                        className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-[13px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
                      >
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onDecide(next.id, 'changes')}
                        className="rounded-lg border border-border px-4 py-2.5 text-[13px] transition-colors hover:bg-accent"
                      >
                        Request changes
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenApprovals(next.cat)}
                        className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Review in full <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="clear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
                    <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-brand-green/15 text-brand-green">
                      <CheckCheck className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="mt-4 font-display text-lg font-semibold tracking-[-0.02em]">You are all caught up</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">Mitra will tell you the moment something needs a decision.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>

            {/* delivery pipeline */}
            <Panel title="Delivery pipeline" aside={SHOW_APPS ? <button type="button" onClick={onOpenApps} className="text-[11px] text-brand-green transition-colors hover:text-brand-green-hover">All apps</button> : undefined}>
              <div className="grid grid-cols-6 items-end gap-2 sm:gap-3">
                {[...STAGES, 'Live'].map((label, i) => (
                  <button key={label} type="button" onClick={toApps} disabled={!SHOW_APPS} className="group flex flex-col items-center gap-2 disabled:cursor-default" title={`${stageCounts[i]} ${stageCounts[i] === 1 ? 'app' : 'apps'} · ${label}`}>
                    <span className="font-display text-lg font-semibold tabular-nums tracking-[-0.03em]">{stageCounts[i]}</span>
                    <span className="flex h-24 w-full items-end overflow-hidden rounded-lg bg-muted">
                      <motion.span
                        className={cn('w-full rounded-lg', i === 5 ? 'bg-brand-green' : 'bg-brand-green/45 group-hover:bg-brand-green/70')}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(6, (stageCounts[i] / peak) * 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: EASE }}
                      />
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          {/* live activity */}
          <Panel title="Activity" aside={<span className="text-[11px] text-muted-foreground">{view.label}</span>} className="h-fit">
            <AnimatePresence mode="wait" initial={false}>
              <motion.ol key={view.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {view.activity.map((a, i) => (
                  <li key={a.text} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < view.activity.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-border" aria-hidden />}
                    <span className={cn('relative z-[1] mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-card', a.tone === 'review' ? 'bg-foreground' : 'bg-brand-green')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug">{a.text}</p>
                      <p className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px]', TONE[a.tone].cls)}>{TONE[a.tone].label}</span>
                        {a.when} ago
                      </p>
                    </div>
                  </li>
                ))}
              </motion.ol>
            </AnimatePresence>
          </Panel>
        </div>

        {/* apps in motion */}
        {SHOW_APPS && motion3.length > 0 && (
          <Panel title="Apps in motion" aside={<button type="button" onClick={onOpenApps} className="text-[11px] text-brand-green transition-colors hover:text-brand-green-hover">View all</button>}>
            <ul className="grid gap-3 md:grid-cols-3">
              {motion3.map((a) => {
                const Icon = CATEGORIES.find((c) => c.key === a.cat)?.icon ?? FileText;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onOpenApp(a.id)}
                      className="flex w-full items-center gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:border-brand-green/40 hover:bg-accent"
                    >
                      <Ring pct={a.pct} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[13.5px] font-semibold">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-brand-green" aria-hidden />
                          <span className="truncate">{a.name}</span>
                        </span>
                        <span className="mt-1 block text-[11.5px] text-muted-foreground">
                          {STAGES[a.stage]} stage · {a.owner}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        {/* workspaces overview, only on the roll-up */}
        {cat === 'all' && (
          <Panel title="Workspaces">
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {CATEGORIES.map((c) => {
                const n = pendingCount(decisions, c.key);
                const Icon = c.icon;
                return (
                  <li key={c.key}>
                    <button
                      type="button"
                      onClick={() => onWorkspace(c.key)}
                      className="w-full rounded-xl border border-border p-3.5 text-left transition-colors hover:border-brand-green/40 hover:bg-accent"
                    >
                      <Icon className="h-5 w-5 text-brand-green" aria-hidden />
                      <p className="mt-3 text-[13.5px] font-semibold">{c.label}</p>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{n === 0 ? 'All clear' : `${n} waiting`}</p>
                      <span className="mt-3 block h-1 overflow-hidden rounded-full bg-border">
                        <span className="block h-full rounded-full bg-brand-green" style={{ width: `${Math.round((APPROVED_SHARE[c.key] ?? 0.6) * 100)}%` }} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        <p className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Sample data</p>
      </div>
    </div>
  );
}
