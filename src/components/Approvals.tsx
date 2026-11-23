import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, CheckCheck, FileText, RotateCcw } from 'lucide-react';
import { APPROVALS, CATEGORIES, type Decision, type Decisions } from '../data';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

interface ApprovalsProps {
  cat: string;
  onCat: (cat: string) => void;
  decisions: Decisions;
  onDecide: (id: string, decision: Decision | null) => void;
  onHome: () => void;
}

export function Approvals({ cat, onCat, decisions, onDecide, onHome }: ApprovalsProps) {
  const [tab, setTab] = useState<'pending' | 'decided'>('pending');
  const inCat = APPROVALS.filter((a) => cat === 'all' || a.cat === cat);
  const pending = inCat.filter((a) => !decisions[a.id]);
  const decided = inCat.filter((a) => decisions[a.id]);
  const rows = tab === 'pending' ? pending : decided;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-5 md:p-8">
      <div>
        <h1 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.03em]">Approvals</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Nothing is promoted until you approve it. Review each stage and approve it or ask for changes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by workspace">
        {[{ key: 'all', label: 'All' }, ...CATEGORIES].map((k) => (
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
        {(
          [
            ['pending', `Pending (${pending.length})`],
            ['decided', `Decided (${decided.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              '-mb-px border-b-2 pb-3 text-[13px] transition-colors',
              tab === key ? 'border-brand-green text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="rounded-xl border border-dashed border-border py-16 text-center"
        >
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-green/15 text-brand-green">
            <CheckCheck className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-4 font-display text-lg font-semibold tracking-[-0.02em]">
            {tab === 'pending' ? 'You are all caught up' : 'No decisions yet'}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {tab === 'pending' ? 'There is nothing waiting for your approval here.' : 'Approved items and change requests will appear here.'}
          </p>
          {tab === 'pending' && (
            <button type="button" onClick={onHome} className="mt-5 rounded-lg border border-border px-4 py-2 text-[13px] transition-colors hover:bg-accent">
              Back to Home
            </button>
          )}
        </motion.div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {rows.map((a) => {
              const c = CATEGORIES.find((k) => k.key === a.cat);
              const Icon = c?.icon ?? FileText;
              const d = decisions[a.id];
              return (
                <motion.li
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-brand-green">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[14px] font-semibold">{a.title}</h2>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{a.stage}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{c?.label}</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{a.summary}</p>
                      <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                        {a.by} · {a.age} ago · {a.artifacts} artifacts
                      </p>
                    </div>
                    {d ? (
                      <div className="flex shrink-0 items-center gap-3">
                        <span className={cn('rounded px-2 py-1 text-[11px] font-medium', d === 'approved' ? 'bg-brand-green/15 text-brand-green' : 'bg-muted text-foreground')}>
                          {d === 'approved' ? 'Approved' : 'Changes requested'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDecide(a.id, null)}
                          className="flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Undo
                        </button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onDecide(a.id, 'changes')}
                          className="rounded-lg border border-border px-3 py-2 text-[12.5px] transition-colors hover:bg-accent"
                        >
                          Request changes
                        </button>
                        <button
                          type="button"
                          onClick={() => onDecide(a.id, 'approved')}
                          className="flex items-center gap-1.5 rounded-lg bg-brand-green px-3.5 py-2 text-[12.5px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> Approve
                        </button>
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
