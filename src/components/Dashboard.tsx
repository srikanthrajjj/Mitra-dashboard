import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Check, CheckCheck, Home as HomeIcon, Menu, Search } from 'lucide-react';
import { Sidebar, type ViewKey } from './Sidebar';
import { Home } from './Home';
import { Approvals } from './Approvals';
import { CommandPalette, type PaletteItem } from './CommandPalette';
import { ALL_VIEW, APPROVALS, APPROVED_SHARE, CATEGORIES, WEEK, pendingCount, type Decision, type Decisions } from '../data';
import { cn } from '../lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;
const COLLAPSE_KEY = 'mitra-dashboard:sidebar-collapsed';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Notifications: the newest approvals still waiting on the user. */
function Bell_({ decisions, onOpen }: { decisions: Decisions; onOpen: (cat: string) => void }) {
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
        className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {waiting.length > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-green" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-1.5 w-80 overflow-hidden rounded-xl border border-mitra-border bg-mitra-surface"
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

export function Dashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [view, setView] = useState<ViewKey>('home');
  const [cat, setCat] = useState('all');
  const [decisions, setDecisions] = useState<Decisions>({});
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map((k) => [k.key, pendingCount(decisions, k.key)])), [decisions]);
  const total = pendingCount(decisions);
  const current = CATEGORIES.find((k) => k.key === cat) ?? ALL_VIEW;
  const waiting = APPROVALS.filter((a) => !decisions[a.id] && (cat === 'all' || a.cat === cat)).slice(0, 3);

  const go = useCallback((v: ViewKey, c: string) => {
    setView(v);
    setCat(c);
    window.scrollTo({ top: 0 });
  }, []);

  const newChat = () => {
    go('home', 'all');
    setFocusTick((n) => n + 1);
  };

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      try {
        window.localStorage.setItem(COLLAPSE_KEY, v ? '0' : '1');
      } catch {
        /* storage unavailable, the preference just will not persist */
      }
      return !v;
    });
  };

  const decide = (id: string, d: Decision | null) => {
    const a = APPROVALS.find((x) => x.id === id);
    setDecisions((prev) => {
      const next = { ...prev };
      if (d) next[id] = d;
      else delete next[id];
      return next;
    });
    if (a && d) setToast({ title: d === 'approved' ? 'Approved' : 'Changes requested', body: `${a.title} · ${a.stage} stage` });
  };

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const paletteItems: PaletteItem[] = useMemo(
    () => [
      { id: 'home', label: 'Home', hint: 'Screen', icon: HomeIcon, run: () => go('home', 'all') },
      { id: 'approvals', label: 'Approvals', hint: `${total} pending`, icon: CheckCheck, run: () => go('approvals', 'all') },
      ...CATEGORIES.map((k) => ({ id: `ws-${k.key}`, label: k.label, hint: 'Workspace', icon: k.icon, run: () => go('home', k.key) })),
      ...APPROVALS.filter((a) => !decisions[a.id]).map((a) => ({
        id: a.id,
        label: a.title,
        hint: `Approval · ${a.stage}`,
        icon: CheckCheck,
        run: () => go('approvals', a.cat),
      })),
    ],
    [decisions, go, total],
  );

  const crumb = view === 'approvals' ? 'Approvals' : current.label;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        view={view}
        cat={cat}
        counts={counts}
        total={total}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        onNew={newChat}
        onGo={go}
        email={email}
        onSignOut={onSignOut}
        drawerOpen={drawer}
        onCloseDrawer={() => setDrawer(false)}
      />

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <p className="truncate text-[12px] text-muted-foreground">
              {view === 'approvals' ? 'Approvals' : 'Workspace'} {view === 'home' && <span className="px-1">/</span>}
              {view === 'home' && <span className="text-foreground">{crumb}</span>}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPalette(true)}
              aria-label="Search"
              className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Search className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded border border-border px-1 font-mono text-[10px] sm:inline">⌘K</kbd>
            </button>
            <Bell_ decisions={decisions} onOpen={(c) => go('approvals', c)} />
          </div>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {view === 'home' ? (
              <Home
                view={current}
                email={email}
                pending={pendingCount(decisions, cat)}
                waiting={waiting}
                share={APPROVED_SHARE[cat] ?? 0.64}
                week={WEEK[cat] ?? WEEK.all}
                focusTick={focusTick}
                onOpenApprovals={(c) => go('approvals', c)}
                onToast={(body) => setToast({ title: 'Plan ready', body })}
              />
            ) : (
              <Approvals cat={cat} onCat={setCat} decisions={decisions} onDecide={decide} onHome={() => go('home', 'all')} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <CommandPalette open={palette} onClose={() => setPalette(false)} items={paletteItems} />

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={cn('fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-brand-green/40 bg-mitra-surface px-4 py-3 text-[13px]')}
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-green text-background">
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
            </span>
            <span>
              <span className="block font-semibold">{toast.title}</span>
              <span className="block text-[12px] text-muted-foreground">{toast.body}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
