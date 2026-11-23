import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell } from 'lucide-react';
import { APPROVALS, type Decisions } from '../data';
import { cn } from '../lib/utils';

/** The bell: lists the newest approvals still waiting on the user. */
export function Notifications({
  decisions,
  onOpen,
  placement,
  className,
}: {
  decisions: Decisions;
  onOpen: (cat: string) => void;
  /** Where the panel opens: below the bell, or to the right of it (used in the narrow sidebar). */
  placement: 'below' | 'right';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const waiting = APPROVALS.filter((a) => !decisions[a.id]).slice(0, 4);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
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
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'below' ? -6 : 0, x: placement === 'right' ? -6 : 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-[55] w-80 overflow-hidden rounded-xl border border-mitra-border bg-mitra-surface',
              placement === 'below' ? 'right-0 top-full mt-1.5' : 'left-0 top-full mt-1.5',
            )}
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
      </AnimatePresence>
    </div>
  );
}
