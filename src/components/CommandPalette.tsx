import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export interface PaletteItem {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  run: () => void;
}

/** ⌘K / Ctrl+K search: jump to a screen, a workspace or a specific approval. */
export function CommandPalette({ open, onClose, items }: { open: boolean; onClose: () => void; items: PaletteItem[] }) {
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => !needle || i.label.toLowerCase().includes(needle) || i.hint.toLowerCase().includes(needle)).slice(0, 9);
  }, [items, q]);

  useEffect(() => {
    if (open) {
      setQ('');
      setIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    setIndex(0);
  }, [q]);

  const choose = (i: PaletteItem | undefined) => {
    if (!i) return;
    onClose();
    i.run();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-background/70 px-4 pt-[14vh] backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-label="Search"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-mitra-border bg-mitra-surface"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndex((n) => Math.min(n + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex((n) => Math.max(n - 1, 0));
              } else if (e.key === 'Enter') choose(results[index]);
            }}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search screens, workspaces and approvals"
                aria-label="Search"
                className="h-12 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Esc</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-1.5" role="listbox">
              {results.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-muted-foreground">No matches</li>}
              {results.map((r, i) => {
                const Icon = r.icon;
                return (
                  <li key={r.id} role="option" aria-selected={i === index}>
                    <button
                      type="button"
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => choose(r)}
                      className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors', i === index ? 'bg-accent' : '')}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-brand-green" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-[13px]">{r.label}</span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{r.hint}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
