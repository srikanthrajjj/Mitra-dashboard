import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Check, CheckCheck, CornerDownLeft, LayoutGrid, Loader2, Sparkles, X } from 'lucide-react';
import { LogoMark } from './Logo';
import { APP_STATUS_LABEL, CATEGORIES, appStatus, type Decisions } from '../data';
import { route, suggest, type Answer, type Suggestion } from '../lib/ask';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

interface AskBarProps {
  scope: string;
  decisions: Decisions;
  focusTick: number;
  onOpenApp: (id: string) => void;
  onOpenApprovals: (cat: string) => void;
  onToast: (title: string, body: string) => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border px-3 py-2.5">
      <p className="font-display text-xl font-semibold tabular-nums tracking-[-0.03em]">{value}</p>
      <p className="text-[11.5px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ResultRow({ icon, title, sub, action, onAction }: { icon: ReactNode; title: string; sub: string; action: string; onAction: () => void }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-brand-green">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{title}</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">{sub}</span>
      </span>
      <button
        type="button"
        onClick={onAction}
        className="rounded-md bg-brand-green px-3 py-1.5 text-[11.5px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
      >
        {action}
      </button>
    </li>
  );
}

export function AskBar({ scope, decisions, focusTick, onOpenApp, onOpenApprovals, onToast }: AskBarProps) {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [idx, setIdx] = useState(0);
  const [asked, setAsked] = useState<{ query: string; answer: Answer } | null>(null);
  const [shown, setShown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => suggest(q, decisions), [q, decisions]);

  useEffect(() => {
    if (focusTick > 0) inputRef.current?.focus();
  }, [focusTick]);

  // "/" jumps to the bar from anywhere that is not a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === '/' && t && !/INPUT|TEXTAREA/.test(t.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!focused) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [focused]);

  useEffect(() => setIdx(0), [q]);

  // Reveal the answer's steps one after another, then its content.
  useEffect(() => {
    if (!asked) return;
    setShown(0);
    const total = asked.answer.steps.length + 1;
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= total) window.clearInterval(t);
    }, 520);
    return () => window.clearInterval(t);
  }, [asked]);

  const run = (text: string) => {
    const query = text.trim();
    if (!query) return;
    setAsked({ query, answer: route(query, decisions, scope) });
    setQ('');
    setFocused(false);
    inputRef.current?.blur();
  };

  const choose = (s: Suggestion | undefined) => {
    if (!s) return run(q);
    if (s.kind === 'ask') run(s.text);
    else if (s.kind === 'app') {
      setFocused(false);
      setQ('');
      onOpenApp(s.app.id);
    } else {
      setFocused(false);
      setQ('');
      onOpenApprovals(s.approval.cat);
    }
  };

  const done = asked ? shown > asked.answer.steps.length : false;

  return (
    <div ref={wrapRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          choose(focused && q.trim() ? suggestions[idx] : undefined);
        }}
        className={cn(
          'flex h-14 items-center gap-3 rounded-2xl border bg-card px-4 transition-all',
          focused ? 'border-brand-green/60 ring-4 ring-brand-green/10' : 'border-border',
        )}
      >
        <Sparkles className="h-5 w-5 shrink-0 text-brand-green" aria-hidden />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIdx((n) => Math.min(n + 1, suggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIdx((n) => Math.max(n - 1, 0));
            } else if (e.key === 'Escape') {
              setFocused(false);
              setQ('');
              inputRef.current?.blur();
            } else if (e.key === 'Enter' && !q.trim() && focused) {
              e.preventDefault();
              choose(suggestions[idx]);
            }
          }}
          placeholder="Ask Mitra anything, or tell it what to build…"
          aria-label="Ask Mitra"
          aria-expanded={focused}
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        {!focused && !q && <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:block">/</kbd>}
        <button
          type="submit"
          aria-label="Send"
          className={cn('grid h-9 w-9 place-items-center rounded-full transition-colors', q.trim() ? 'bg-brand-green text-background' : 'bg-muted text-muted-foreground')}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>

      {/* live suggestions */}
      <AnimatePresence>
        {focused && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-mitra-border bg-mitra-surface p-1.5"
          >
            <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{q.trim() ? 'Suggestions' : 'Try asking'}</p>
            {suggestions.map((s, i) => {
              const active = i === idx;
              let icon: ReactNode = <Sparkles className="h-4 w-4 text-brand-green" aria-hidden />;
              let text = '';
              let hint = '';
              if (s.kind === 'ask') {
                text = s.text;
                hint = s.hint;
              } else if (s.kind === 'app') {
                icon = <LayoutGrid className="h-4 w-4 text-brand-green" aria-hidden />;
                text = s.app.name;
                hint = `App · ${CATEGORIES.find((c) => c.key === s.app.cat)?.label ?? ''}`;
              } else {
                icon = <CheckCheck className="h-4 w-4 text-brand-green" aria-hidden />;
                text = s.approval.title;
                hint = `Approval · ${s.approval.stage}`;
              }
              return (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setIdx(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(s)}
                  className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors', active && 'bg-accent')}
                >
                  {icon}
                  <span className="min-w-0 flex-1 truncate text-[13.5px]">{text}</span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{hint}</span>
                  {active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the answer */}
      <AnimatePresence>
        {asked && (
          <motion.section
            key={asked.query}
            aria-live="polite"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-4 rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start gap-3">
              <LogoMark size={22} className="mt-0.5" />
              <p className="min-w-0 flex-1 text-[14px]">
                <span className="text-muted-foreground">You asked </span>
                <span className="font-medium">“{asked.query}”</span>
              </p>
              <button
                type="button"
                onClick={() => setAsked(null)}
                aria-label="Dismiss answer"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-4 space-y-2 pl-1">
              {asked.answer.steps.map((s, i) =>
                shown > i ? (
                  <motion.li key={s} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                    {shown > i + 1 ? <Check className="h-3.5 w-3.5 text-brand-green" strokeWidth={3} aria-hidden /> : <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-green" aria-hidden />}
                    {s}
                  </motion.li>
                ) : null,
              )}
            </ul>

            {done && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mt-4">
                {asked.answer.kind === 'approvals' && (
                  <>
                    <p className="mb-3 text-[13.5px]">
                      {asked.answer.total === 0 ? (
                        'Nothing is waiting on you here. You are all caught up.'
                      ) : (
                        <>
                          <span className="font-semibold">{asked.answer.total} approvals</span> are waiting on you in {asked.answer.scope}. The oldest are first.
                        </>
                      )}
                    </p>
                    <ul className="space-y-2">
                      {asked.answer.items.map((a) => (
                        <ResultRow
                          key={a.id}
                          icon={<CheckCheck className="h-4 w-4" aria-hidden />}
                          title={a.title}
                          sub={`${a.stage} stage · ${a.by} · ${a.age} ago`}
                          action="Review"
                          onAction={() => onOpenApprovals(a.cat)}
                        />
                      ))}
                    </ul>
                  </>
                )}

                {asked.answer.kind === 'apps' && (
                  <>
                    <p className="mb-3 text-[13.5px]">
                      {asked.answer.items.length === 0 ? `No apps match in ${asked.answer.scope}.` : `Here ${asked.answer.items.length === 1 ? 'is the app' : 'are the apps'} in ${asked.answer.scope}.`}
                    </p>
                    <ul className="space-y-2">
                      {asked.answer.items.map((a) => (
                        <ResultRow
                          key={a.id}
                          icon={<LayoutGrid className="h-4 w-4" aria-hidden />}
                          title={a.name}
                          sub={`${APP_STATUS_LABEL[appStatus(a, decisions)].label} · v${a.version} · ${a.owner}`}
                          action="Open"
                          onAction={() => onOpenApp(a.id)}
                        />
                      ))}
                    </ul>
                  </>
                )}

                {asked.answer.kind === 'plan' && (
                  <>
                    <p className="mb-3 text-[13.5px]">
                      Here is the plan for <span className="font-semibold">{asked.answer.name}</span>. Nothing goes live until you approve each stage.
                    </p>
                    <ol className="space-y-2">
                      {asked.answer.tasks.map((t, i) => (
                        <li key={t} className="flex items-center gap-3 text-[13px]">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ol>
                    <button
                      type="button"
                      onClick={() => {
                        const name = asked.answer.kind === 'plan' ? asked.answer.name : 'App';
                        setAsked(null);
                        onToast('Build started', `${name} is in the Define stage`);
                      }}
                      className="mt-4 rounded-lg bg-brand-green px-4 py-2 text-[13px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
                    >
                      Start build
                    </button>
                  </>
                )}

                {asked.answer.kind === 'summary' && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {asked.answer.lines.map((l) => (
                      <Stat key={l.label} label={l.label} value={l.value} />
                    ))}
                  </div>
                )}

                {asked.answer.kind === 'none' && (
                  <p className="text-[13.5px] text-muted-foreground">
                    I could not find a close match. Try “What is waiting on my approval?”, “Show apps in HRSD” or “Build a vendor intake app”.
                  </p>
                )}
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

