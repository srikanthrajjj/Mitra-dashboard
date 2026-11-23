import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Search, Sparkles } from 'lucide-react';
import { CATEGORIES, TONE, type Approval, type View } from '../data';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;
const SUGGESTIONS = ['Review pending approvals', 'Show builds in progress', 'Summarise this week'];

function Donut({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 88 88" className="h-24 w-24 -rotate-90" aria-hidden>
      <circle cx="44" cy="44" r={r} fill="none" strokeWidth="7" className="stroke-border" />
      <motion.circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        className="stroke-brand-green"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={{ duration: 0.9, ease: EASE }}
      />
    </svg>
  );
}

function Card({ title, aside, children, className }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function firstName(email: string): string {
  const first = (email.split('@')[0] ?? '').split(/[._-]/)[0] ?? '';
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'there';
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

interface HomeProps {
  view: View;
  email: string;
  pending: number;
  waiting: Approval[];
  share: number;
  week: [number, number, number];
  focusTick: number;
  onOpenApprovals: (cat: string) => void;
  onToast: (message: string) => void;
}

export function Home({ view, email, pending, waiting, share, week, focusTick, onOpenApprovals, onToast }: HomeProps) {
  const [ask, setAsk] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // "New Chat" in the sidebar lands here and puts the cursor in the ask box.
  useEffect(() => {
    if (focusTick > 0) inputRef.current?.focus();
  }, [focusTick]);

  const submitAsk = (e: FormEvent) => {
    e.preventDefault();
    const q = ask.trim();
    if (!q) return;
    onToast(`"${q.slice(0, 48)}${q.length > 48 ? '…' : ''}" queued for your review`);
    setAsk('');
  };

  const chip = (t: string) => {
    if (t === 'Review pending approvals') onOpenApprovals(view.key);
    else setAsk(t);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 md:p-8">
      <div>
        <h1 className="flex items-center gap-2.5 font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.03em]">
          <Sparkles className="h-6 w-6 shrink-0 text-brand-green" aria-hidden />
          {greeting()}, {firstName(email)}. Let&apos;s get to work.
        </h1>
        <form
          onSubmit={submitAsk}
          className="mt-5 flex h-12 items-center gap-3 rounded-xl border border-border bg-mitra-input px-4 transition-colors focus-within:border-brand-green/60 focus-within:ring-4 focus-within:ring-brand-green/10"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="Ask IlluminAIte, “What is waiting on my approval?”"
            aria-label="Ask IlluminAIte"
            className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Send"
            className={cn('grid h-8 w-8 place-items-center rounded-full transition-colors', ask.trim() ? 'bg-brand-green text-background' : 'bg-muted text-muted-foreground')}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => chip(t)}
              className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr_0.8fr]">
        <Card title="Recent activity" aside={<span className="text-[11px] text-muted-foreground">{view.label}</span>}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={view.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="space-y-3"
            >
              {view.activity.map((a) => (
                <li key={a.text} className="flex items-start gap-2.5">
                  <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', a.tone === 'review' ? 'bg-foreground' : 'bg-brand-green')} />
                  <span className="min-w-0 flex-1 text-[13px] leading-snug">{a.text}</span>
                  <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px]', TONE[a.tone].cls)}>{TONE[a.tone].label}</span>
                  <span className="w-7 shrink-0 text-right font-mono text-[10px] text-muted-foreground">{a.when}</span>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </Card>

        <Card title="Builds in progress">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul key={view.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
              {view.builds.map((b, i) => (
                <li key={b.name}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="font-medium">{b.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{b.stage}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                    <motion.div
                      className="h-full rounded-full bg-brand-green"
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct}%` }}
                      transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: EASE }}
                    />
                  </div>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </Card>

        <Card title="Approvals">
          <div className="relative flex items-center justify-center">
            <Donut value={share} />
            <div className="absolute text-center">
              <p className="font-display text-xl font-semibold leading-none tracking-[-0.03em]">{pending}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">waiting</p>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">{Math.round(share * 100)}% of stages approved</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <Card
          title="Waiting on you"
          aside={
            <button type="button" onClick={() => onOpenApprovals(view.key)} className="text-[11px] text-brand-green transition-colors hover:text-brand-green-hover">
              View all ({pending})
            </button>
          }
        >
          {waiting.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">Nothing is waiting on you here.</p>
          ) : (
            <ul className="space-y-2">
              {waiting.map((a) => {
                const Icon = CATEGORIES.find((k) => k.key === a.cat)?.icon ?? Sparkles;
                return (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-brand-green">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{a.title}</span>
                      <span className="block text-[11px] text-muted-foreground">{a.stage} stage ready for approval</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenApprovals(a.cat)}
                      className="rounded-md bg-brand-green px-3 py-1.5 text-[11px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
                    >
                      Review
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="This week">
          <dl className="space-y-3">
            {(['Builds shipped', 'Approvals given', 'Skills run'] as const).map((label, i) => (
              <div key={label} className="flex items-baseline justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
                <dt className="text-[13px] text-muted-foreground">{label}</dt>
                <dd className="font-display text-xl font-semibold tabular-nums tracking-[-0.03em]">{week[i]}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <p className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Sample data</p>
    </div>
  );
}
