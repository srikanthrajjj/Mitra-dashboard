import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Bell, Check, LogOut, Search, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { CATEGORIES, TONE } from '../data';
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

function Card({
  title,
  aside,
  children,
  className,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
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
  const local = email.split('@')[0] ?? '';
  const first = local.split(/[._-]/)[0] ?? '';
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'there';
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function Dashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [cat, setCat] = useState(0);
  const [ask, setAsk] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const c = CATEGORIES[cat];
  const approvedShare = [0.57, 0.78, 0.66, 0.5, 0.72, 0.64][cat];
  const name = firstName(email);
  const initials = (email.slice(0, 2) || 'AM').toUpperCase();

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const submitAsk = (e: FormEvent) => {
    e.preventDefault();
    if (!ask.trim()) return;
    setToast(`"${ask.trim().slice(0, 48)}${ask.trim().length > 48 ? '…' : ''}" queued for your review`);
    setAsk('');
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* category rail */}
      <nav aria-label="Workspaces" className="hidden w-56 shrink-0 flex-col border-r border-border bg-mitra-sidebar p-3 md:flex">
        <Logo className="mb-5 ml-1 mt-1 h-[20px] w-auto self-start" />
        <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Workspaces</p>
        <ul className="space-y-0.5">
          {CATEGORIES.map((k, i) => {
            const Icon = k.icon;
            const on = i === cat;
            return (
              <li key={k.key}>
                <button
                  type="button"
                  onClick={() => setCat(i)}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'relative flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-[13px] transition-colors',
                    on ? 'bg-brand-green/10 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <span className={cn('absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand-green transition-opacity', on ? 'opacity-100' : 'opacity-0')} />
                  <Icon className={cn('h-4 w-4', on && 'text-brand-green')} aria-hidden />
                  <span className="flex-1">{k.label}</span>
                  <span className="rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">{k.pending}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto flex items-center gap-2 border-t border-border px-1 pt-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-[11px] font-semibold">{initials}</span>
          <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">{email}</span>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <main className="relative min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex gap-1 overflow-x-auto md:hidden" role="tablist" aria-label="Workspaces">
            {CATEGORIES.map((k, i) => (
              <button
                key={k.key}
                type="button"
                role="tab"
                aria-selected={i === cat}
                onClick={() => setCat(i)}
                className={cn(
                  'rounded-md px-2.5 py-1.5 font-mono text-[11px] transition-colors',
                  i === cat ? 'bg-brand-green/15 text-brand-green' : 'text-muted-foreground',
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
          <p className="hidden text-[12px] text-muted-foreground md:block">
            Workspace <span className="px-1">/</span> <span className="text-foreground">{c.label}</span>
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-brand-green" />
            </span>
            <button type="button" onClick={onSignOut} className="text-[12px] transition-colors hover:text-foreground md:hidden">
              Sign out
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-6 p-5 md:p-8">
          <div>
            <h1 className="flex items-center gap-2.5 font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.03em]">
              <Sparkles className="h-6 w-6 text-brand-green" aria-hidden />
              {greeting()}, {name}. Let&apos;s get to work.
            </h1>
            <form
              onSubmit={submitAsk}
              className="mt-5 flex h-12 items-center gap-3 rounded-xl border border-border bg-mitra-input px-4 transition-colors focus-within:border-brand-green/60 focus-within:ring-4 focus-within:ring-brand-green/10"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                placeholder="Ask IlluminAIte, “What is waiting on my approval?”"
                aria-label="Ask IlluminAIte"
                className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                aria-label="Send"
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full transition-colors',
                  ask.trim() ? 'bg-brand-green text-background' : 'bg-muted text-muted-foreground',
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAsk(t)}
                  className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr_0.8fr]">
            <Card title="Recent activity" aside={<span className="text-[11px] text-brand-green">View all</span>}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={c.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="space-y-3"
                >
                  {c.activity.map((a) => (
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
                <motion.ul
                  key={c.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {c.builds.map((b, i) => (
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
                <Donut value={approvedShare} />
                <div className="absolute text-center">
                  <p className="font-display text-xl font-semibold leading-none tracking-[-0.03em]">{c.pending}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">waiting</p>
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">{Math.round(approvedShare * 100)}% of stages approved</p>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
            <Card title="Waiting on you" aside={<span className="font-mono text-[10px] text-muted-foreground">{c.pending} items</span>}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={c.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="space-y-2"
                >
                  {c.builds.map((b) => {
                    const Icon = c.icon;
                    return (
                      <li key={b.name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-brand-green">
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">{b.name}</span>
                          <span className="block text-[11px] text-muted-foreground">{b.stage} stage ready for approval</span>
                        </span>
                        <button
                          type="button"
                          className="rounded-md bg-brand-green px-3 py-1.5 text-[11px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
                        >
                          Review
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              </AnimatePresence>
            </Card>

            <Card title="This week">
              <dl className="space-y-3">
                {(
                  [
                    ['Builds shipped', [4, 2, 3, 5, 3, 6][cat]],
                    ['Approvals given', [11, 6, 8, 14, 9, 17][cat]],
                    ['Skills run', [38, 21, 27, 45, 30, 52][cat]],
                  ] as const
                ).map(([label, n]) => (
                  <div key={label} className="flex items-baseline justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <dt className="text-[13px] text-muted-foreground">{label}</dt>
                    <dd className="font-display text-xl font-semibold tabular-nums tracking-[-0.03em]">{n}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>

          <p className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Sample data</p>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed bottom-5 right-5 flex max-w-sm items-center gap-3 rounded-xl border border-brand-green/40 bg-mitra-surface px-4 py-3 text-[13px]"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-green text-background">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Plan ready</span>
                <span className="block text-[12px] text-muted-foreground">{toast}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
