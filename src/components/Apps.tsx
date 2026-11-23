import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, FileText, X } from 'lucide-react';
import { APPS, APP_STATUS_LABEL, CATEGORIES, STAGES, appStatus, type AppItem, type AppStatus, type Decisions } from '../data';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

type StatusFilter = 'all' | 'live' | 'progress' | 'approval';

function matchesStatus(s: AppStatus, f: StatusFilter): boolean {
  if (f === 'all') return true;
  if (f === 'live') return s === 'live';
  if (f === 'approval') return s === 'approval';
  return s === 'building' || s === 'approved' || s === 'changes';
}

function StageDots({ stage }: { stage: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={stage >= 5 ? 'Live' : `Stage ${stage + 1} of 5: ${STAGES[stage]}`}>
      {STAGES.map((s, i) => (
        <span key={s} className={cn('h-1 flex-1 rounded-full', i < stage ? 'bg-brand-green' : i === stage ? 'bg-brand-green/50' : 'bg-border')} />
      ))}
    </div>
  );
}

function StatusChip({ status }: { status: AppStatus }) {
  const s = APP_STATUS_LABEL[status];
  return <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium', s.cls)}>{s.label}</span>;
}

function Drawer({ app, decisions, onClose, onReview }: { app: AppItem; decisions: Decisions; onClose: () => void; onReview: (cat: string) => void }) {
  const cat = CATEGORIES.find((k) => k.key === app.cat);
  const Icon = cat?.icon ?? FileText;
  const status = appStatus(app, decisions);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-background/70"
        aria-hidden
      />
      <motion.aside
        role="dialog"
        aria-label={`${app.name} details`}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: EASE }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l border-border bg-mitra-surface"
      >
        <div className="flex items-start gap-3 border-b border-border p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-muted text-brand-green">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">{app.name}</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {cat?.label} · v{app.version} · {app.owner}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <div className="flex items-center justify-between">
            <StatusChip status={status} />
            <span className="text-[12px] text-muted-foreground">Updated {app.updated} ago</span>
          </div>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">{app.description}</p>

          {status === 'approval' && app.approvalId && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-green/40 bg-brand-green/[0.06] p-4">
              <p className="text-[13px]">
                The <span className="font-semibold">{STAGES[app.stage]}</span> stage is waiting for your approval.
              </p>
              <button
                type="button"
                onClick={() => onReview(app.cat)}
                className="shrink-0 rounded-md bg-brand-green px-3 py-1.5 text-[12px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
              >
                Review
              </button>
            </div>
          )}

          <section>
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Build progress</h3>
            <ol>
              {STAGES.map((s, i) => {
                const done = app.stage > i;
                const here = app.stage === i;
                return (
                  <li key={s} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < STAGES.length - 1 && <span className={cn('absolute left-[9px] top-5 h-full w-px', done ? 'bg-brand-green' : 'bg-border')} aria-hidden />}
                    <span
                      className={cn(
                        'relative z-[1] mt-0.5 grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full border',
                        done ? 'border-brand-green bg-brand-green text-background' : here ? 'border-brand-green bg-background' : 'border-border bg-background',
                      )}
                    >
                      {done && <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden />}
                      {here && <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />}
                    </span>
                    <span className={cn('text-[13px]', done || here ? 'text-foreground' : 'text-muted-foreground')}>
                      {s}
                      {here && <span className="ml-2 text-[11px] text-brand-green">Current</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section>
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Artifacts ({app.artifacts.length})</h3>
            <ul className="space-y-1.5">
              {app.artifacts.map((a) => (
                <li key={a} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-[13px]">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Recent activity</h3>
            <ul className="space-y-2.5">
              {app.activity.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                  {a}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </motion.aside>
    </>
  );
}

interface AppsProps {
  cat: string;
  onCat: (cat: string) => void;
  decisions: Decisions;
  openId: string | null;
  onOpen: (id: string | null) => void;
  onReview: (cat: string) => void;
}

export function Apps({ cat, onCat, decisions, openId, onOpen, onReview }: AppsProps) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const inCat = APPS.filter((a) => cat === 'all' || a.cat === cat);
  const rows = inCat.filter((a) => matchesStatus(appStatus(a, decisions), status));
  const count = (f: StatusFilter) => inCat.filter((a) => matchesStatus(appStatus(a, decisions), f)).length;
  const open = APPS.find((a) => a.id === openId) ?? null;

  const tabs: [StatusFilter, string][] = [
    ['all', 'All'],
    ['live', 'Live'],
    ['progress', 'In progress'],
    ['approval', 'Needs approval'],
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.03em]">Apps</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">Everything Mitra has built for your instance, from first draft to live.</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by workspace">
        {[{ key: 'all', label: 'All workspaces' }, ...CATEGORIES].map((k) => (
          <button
            key={k.key}
            type="button"
            role="tab"
            aria-selected={cat === k.key}
            onClick={() => onCat(k.key)}
            className={cn(
              'rounded-full border px-3 py-1 text-[12px] transition-colors',
              cat === k.key ? 'border-brand-green/60 bg-brand-green/10 text-foreground' : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6 border-b border-border" role="tablist" aria-label="Status">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={status === key}
            onClick={() => setStatus(key)}
            className={cn(
              '-mb-px border-b-2 pb-3 text-[13px] transition-colors',
              status === key ? 'border-brand-green text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label} <span className="ml-1 font-mono text-[10px] text-muted-foreground">{count(key)}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-[13px] text-muted-foreground">No apps match these filters.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((a, i) => {
            const c = CATEGORIES.find((k) => k.key === a.cat);
            const Icon = c?.icon ?? FileText;
            const st = appStatus(a, decisions);
            return (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03, ease: EASE }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(a.id)}
                  className="group flex h-full w-full flex-col rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-brand-green/40 hover:bg-mitra-highlight"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-brand-green">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[14px] font-semibold">{a.name}</h2>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        {c?.label} · v{a.version}
                      </p>
                    </div>
                    <StatusChip status={st} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">{a.description}</p>
                  <div className="mt-4">
                    <StageDots stage={a.stage} />
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{a.stage >= 5 ? 'Live' : `${STAGES[a.stage]} stage`}</span>
                      <span>
                        {a.owner} · {a.updated}
                      </span>
                    </div>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}

      <AnimatePresence>{open && <Drawer key={open.id} app={open} decisions={decisions} onClose={() => onOpen(null)} onReview={(c) => { onOpen(null); onReview(c); }} />}</AnimatePresence>
    </div>
  );
}
