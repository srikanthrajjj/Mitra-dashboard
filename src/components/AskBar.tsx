import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, CheckCheck, CornerDownLeft, LayoutGrid, Mic, Plus, Sparkles } from 'lucide-react';
import { CATEGORIES, type Decisions } from '../data';
import { suggest, type Suggestion } from '../lib/ask';
import { cn } from '../lib/utils';

interface AskBarProps {
  decisions: Decisions;
  /** Sending a question starts a new chat with it. */
  onAsk: (text: string) => void;
  onOpenApp: (id: string) => void;
  onOpenApprovals: (cat: string) => void;
}

/**
 * The ask bar on Home. It suggests as you type (apps and approvals jump straight there), and
 * sending anything else opens a new chat with that message, so the answer lands in a thread you
 * can keep talking in.
 */
export function AskBar({ decisions, onAsk, onOpenApp, onOpenApprovals }: AskBarProps) {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => suggest(q, decisions), [q, decisions]);

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

  useEffect(() => {
    setIdx(0);
  }, [q]);

  const choose = (s: Suggestion | undefined) => {
    if (!s) {
      if (q.trim()) onAsk(q.trim());
      return;
    }
    setFocused(false);
    setQ('');
    if (s.kind === 'ask') onAsk(s.text);
    else if (s.kind === 'app') onOpenApp(s.app.id);
    else onOpenApprovals(s.approval.cat);
  };

  return (
    <div ref={wrapRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          choose(focused && q.trim() ? suggestions[idx] : undefined);
        }}
        className={cn(
          'flex h-[52px] items-center gap-3 rounded-full border bg-card pl-5 pr-2 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.18)] transition-all',
          focused ? 'border-brand-green/60 ring-4 ring-brand-green/10' : 'border-border',
        )}
      >
        <Plus className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
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
          placeholder={'Ask Acme, "What is waiting on me?"'}
          aria-label="Ask Acme"
          aria-expanded={focused}
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        {!focused && !q && <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:block">/</kbd>}
        {q.trim() ? (
          <button type="submit" aria-label="Send" className="grid h-9 w-9 place-items-center rounded-full bg-brand-green text-background transition-colors hover:bg-brand-green-hover">
            <ArrowUp className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" aria-label="Start typing" onClick={() => inputRef.current?.focus()} className="grid h-9 w-9 place-items-center rounded-full bg-brand-green text-background transition-colors hover:bg-brand-green-hover">
            <Mic className="h-4 w-4" />
          </button>
        )}
      </form>

      <AnimatePresence>
        {focused && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-mitra-border bg-mitra-surface p-1.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.25)]"
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
    </div>
  );
}
