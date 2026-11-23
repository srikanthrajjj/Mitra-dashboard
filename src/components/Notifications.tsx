import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell } from 'lucide-react';
import { APPROVALS, type Decisions } from '../data';
import { cn } from '../lib/utils';

/** The bell: lists the newest approvals still waiting on the user. */
export function Notifications({
  decisions,
  onOpen,
  className,
}: {
  decisions: Decisions;
  onOpen: (cat: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 320 });
  const waiting = APPROVALS.filter((a) => !decisions[a.id]).slice(0, 4);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || panel.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // The panel is drawn on the page itself (not inside the sidebar), placed under the bell and kept
  // inside the window, so it is never cut off by the sidebar or the screen edge.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const width = Math.min(340, window.innerWidth - 16);
      // Wide screens: open beside the sidebar so it covers nothing. Phones: under the bell.
      const side = window.innerWidth >= 768 ? ref.current?.closest('aside')?.getBoundingClientRect() : undefined;
      if (side) setPos({ top: Math.max(8, r.top), left: side.right + 8, width });
      else setPos({ top: r.bottom + 8, left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)), width });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
        className={cn('relative grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground', className)}
      >
        <Bell className="h-4 w-4" />
        {waiting.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-green" />}
      </button>
      {createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, maxHeight: `calc(100dvh - ${pos.top + 12}px)` }}
            className="z-[70] overflow-y-auto rounded-xl border border-mitra-border bg-mitra-surface shadow-[0_16px_40px_-12px_rgba(15,23,42,0.3)]"
          >
            <p className="border-b border-border px-4 py-3 text-[13px] font-semibold">Waiting on you</p>
            {waiting.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">You are all caught up.</p>
            ) : (
              <ul>
                {waiting.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onOpen(a.cat);
                      }}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">{a.title}</span>
                        <span className="block text-[11.5px] text-muted-foreground">
                          {a.stage} stage · {a.by} · {a.age} ago
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpen('all');
              }}
              className="w-full border-t border-border px-4 py-3 text-left text-[12.5px] text-brand-green transition-colors hover:bg-accent"
            >
              View all approvals
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </div>
  );
}
