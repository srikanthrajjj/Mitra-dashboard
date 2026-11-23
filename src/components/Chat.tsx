import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, CheckCheck, LayoutGrid, MessageSquare, Wrench } from 'lucide-react';
import { AnswerView } from './AnswerView';
import { LogoMark } from './Logo';
import type { Decisions } from '../data';
import { SHOW_APPS } from '../config';
import { STARTERS } from '../lib/ask';
import type { Chat as ChatModel } from '../lib/chats';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;
const STARTER_ICONS = [CheckCheck, LayoutGrid, Wrench, MessageSquare];

interface ChatProps {
  chat: ChatModel;
  decisions: Decisions;
  onSend: (text: string) => void;
  onSettled: (msgId: string) => void;
  onOpenApp: (id: string) => void;
  onOpenApprovals: (cat: string) => void;
  onStartBuild: (name: string) => void;
}

/** A conversation, laid out the way people expect from a chat app: thread above, composer below. */
export function Chat({ chat, decisions, onSend, onSettled, onOpenApp, onOpenApprovals, onStartBuild }: ChatProps) {
  const [text, setText] = useState('');
  const bottom = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const empty = chat.messages.length === 0;
  const busy = chat.messages.some((m) => m.fresh);

  // Start typing straight away in a new chat.
  useEffect(() => {
    area.current?.focus();
  }, [chat.id]);

  // Keep the newest message in view as it arrives and as its answer fills in.
  const toBottom = () => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };
  useEffect(() => {
    toBottom();
  }, [chat.messages.length]);

  // Grow the box with the text, up to about six lines.
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    onSend(t);
    setText('');
  };

  return (
    <div className="flex h-[calc(100dvh-58px)] flex-col">
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-5 pb-10 text-center">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              <LogoMark size={44} className="mx-auto" />
              <h1 className="mt-5 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold tracking-[-0.035em]">What can I help you build?</h1>
              <p className="mx-auto mt-2 max-w-md text-[14.5px] text-muted-foreground">{SHOW_APPS ? 'Ask about your apps and approvals' : 'Ask about your approvals and workspaces'}, or describe something new and I will plan it.</p>
            </motion.div>
            <ul className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
              {STARTERS.map((s, i) => {
                const Icon = STARTER_ICONS[i] ?? MessageSquare;
                return (
                  <motion.li key={s.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: EASE }}>
                    <button
                      type="button"
                      onClick={() => onSend(s.text)}
                      className="flex h-full w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-brand-green/40 hover:bg-accent"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
                      <span>
                        <span className="block text-[13.5px] leading-snug">{s.text}</span>
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{s.hint}</span>
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-8 px-5 py-8">
            {chat.messages.map((m) =>
              m.role === 'user' ? (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-muted px-4 py-2.5 text-[14.5px] leading-relaxed">{m.text}</p>
                </motion.div>
              ) : (
                <div key={m.id} className="flex gap-3.5">
                  <LogoMark size={26} className="mt-0.5" />
                  <div className="min-w-0 flex-1 pt-0.5">
                    {m.answer ? (
                      <AnswerView
                        answer={m.answer}
                        animate={!!m.fresh}
                        onDone={() => {
                          onSettled(m.id);
                          window.setTimeout(toBottom, 60);
                        }}
                        decisions={decisions}
                        onOpenApp={onOpenApp}
                        onOpenApprovals={onOpenApprovals}
                        onStartBuild={onStartBuild}
                        onAsk={onSend}
                      />
                    ) : (
                      <p className="text-[14.5px] leading-relaxed">{m.text}</p>
                    )}
                  </div>
                </div>
              ),
            )}
            <div ref={bottom} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background px-5 pb-4 pt-3">
        <form
          onSubmit={submit}
          className={cn('mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border bg-card px-4 py-3 transition-all focus-within:border-brand-green/60 focus-within:ring-4 focus-within:ring-brand-green/10', 'border-border')}
        >
          <textarea
            ref={area}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Message Acme"
            aria-label="Message Acme"
            className="max-h-40 min-h-[28px] flex-1 resize-none bg-transparent py-1 text-[15px] leading-snug outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!text.trim() || busy}
            className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors', text.trim() && !busy ? 'bg-brand-green text-background hover:bg-brand-green-hover' : 'bg-muted text-muted-foreground')}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">Demo assistant. Answers come from sample data.</p>
      </div>
    </div>
  );
}
