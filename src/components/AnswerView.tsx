import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Check, CheckCheck, LayoutGrid, Loader2 } from 'lucide-react';
import { APP_STATUS_LABEL, appStatus, type Decisions } from '../data';
import { SHOW_APPS } from '../config';
import { STARTERS, type Answer } from '../lib/ask';

const EASE = [0.22, 1, 0.36, 1] as const;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border px-3 py-2.5">
      <p className="font-display text-xl font-semibold tabular-nums tracking-[-0.03em]">{value}</p>
      <p className="text-[11.5px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ResultRow({ icon, title, sub, action, onAction }: { icon: ReactNode; title: string; sub: string; action?: string; onAction?: () => void }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-brand-green">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{title}</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">{sub}</span>
      </span>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md bg-brand-green px-3 py-1.5 text-[11.5px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
        >
          {action}
        </button>
      )}
    </li>
  );
}

interface AnswerViewProps {
  answer: Answer;
  /** Reveal the steps one by one, then the result. False shows everything at once (older messages). */
  animate: boolean;
  onDone?: () => void;
  decisions: Decisions;
  onOpenApp: (id: string) => void;
  onOpenApprovals: (cat: string) => void;
  onStartBuild: (name: string) => void;
  onAsk: (text: string) => void;
}

/** One assistant answer: the steps it worked through, then the result. Shared by every chat message. */
export function AnswerView({ answer, animate, onDone, decisions, onOpenApp, onOpenApprovals, onStartBuild, onAsk }: AnswerViewProps) {
  const total = answer.steps.length + 1;
  const [shown, setShown] = useState(animate ? 0 : total);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!animate) {
      setShown(total);
      return;
    }
    setShown(0);
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= total) {
        window.clearInterval(t);
        doneRef.current?.();
      }
    }, 520);
    return () => window.clearInterval(t);
  }, [animate, total]);

  const done = shown >= total;

  return (
    <div aria-live="polite">
      {answer.steps.length > 0 && (
        <ul className="space-y-2">
          {answer.steps.map((s, i) =>
            shown > i ? (
              <motion.li
                key={s}
                initial={animate ? { opacity: 0, x: -6 } : false}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5 text-[13px] text-muted-foreground"
              >
                {shown > i + 1 ? <Check className="h-3.5 w-3.5 text-brand-green" strokeWidth={3} aria-hidden /> : <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-green" aria-hidden />}
                {s}
              </motion.li>
            ) : null,
          )}
        </ul>
      )}

      {done && (
        <motion.div initial={animate ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className={answer.steps.length > 0 ? 'mt-4' : ''}>
          {answer.kind === 'text' && <p className="text-[14.5px] leading-relaxed">{answer.text}</p>}

          {answer.kind === 'approvals' && (
            <>
              <p className="mb-3 text-[14.5px] leading-relaxed">
                {answer.total === 0 ? (
                  'Nothing is waiting on you here. You are all caught up.'
                ) : (
                  <>
                    <span className="font-semibold">{answer.total} approvals</span> are waiting on you in {answer.scope}. The longest-waiting are first.
                  </>
                )}
              </p>
              <ul className="space-y-2">
                {answer.items.map((a) => (
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

          {answer.kind === 'apps' && (
            <>
              <p className="mb-3 text-[14.5px] leading-relaxed">
                {answer.items.length === 0 ? `No apps match in ${answer.scope}.` : `Here ${answer.items.length === 1 ? 'is the app' : 'are the apps'} in ${answer.scope}.`}
              </p>
              <ul className="space-y-2">
                {answer.items.map((a) => (
                  <ResultRow
                    key={a.id}
                    icon={<LayoutGrid className="h-4 w-4" aria-hidden />}
                    title={a.name}
                    sub={`${APP_STATUS_LABEL[appStatus(a, decisions)].label} · v${a.version} · ${a.owner}`}
                    action={SHOW_APPS ? 'Open' : undefined}
                    onAction={SHOW_APPS ? () => onOpenApp(a.id) : undefined}
                  />
                ))}
              </ul>
            </>
          )}

          {answer.kind === 'plan' && (
            <>
              <p className="mb-3 text-[14.5px] leading-relaxed">
                Here is the plan for <span className="font-semibold">{answer.name}</span>. Nothing goes live until you approve each stage.
              </p>
              <ol className="space-y-2.5 rounded-xl border border-border bg-card p-4">
                {answer.tasks.map((t, i) => (
                  <li key={t} className="flex items-center gap-3 text-[13px]">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => onStartBuild(answer.name)}
                className="mt-4 rounded-lg bg-brand-green px-4 py-2 text-[13px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
              >
                Start build
              </button>
            </>
          )}

          {answer.kind === 'summary' && (
            <>
              <p className="mb-3 text-[14.5px] leading-relaxed">Here is {answer.scope} this week.</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {answer.lines.map((l) => (
                  <Stat key={l.label} label={l.label} value={l.value} />
                ))}
              </div>
            </>
          )}

          {(answer.kind === 'none' || answer.kind === 'text') && (
            <>
              {answer.kind === 'none' && <p className="text-[14.5px] leading-relaxed text-muted-foreground">I could not find a close match. Here are some things I can do.</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s.text}
                    type="button"
                    onClick={() => onAsk(s.text)}
                    className="rounded-full border border-border px-3 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
