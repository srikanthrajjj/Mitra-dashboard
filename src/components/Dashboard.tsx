import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, CheckCheck, Home as HomeIcon, LayoutGrid, Menu, MessageSquarePlus, Search } from 'lucide-react';
import { Sidebar, type ViewKey } from './Sidebar';
import { Home } from './Home';
import { Approvals } from './Approvals';
import { Apps } from './Apps';
import { Chat } from './Chat';
import { route } from '../lib/ask';
import { SHOW_APPS } from '../config';
import { readChats, titleFrom, uid, writeChats, type Chat as ChatModel } from '../lib/chats';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../lib/theme';
import { CommandPalette, type PaletteItem } from './CommandPalette';
import { ALL_VIEW, APPROVALS, APPS, CATEGORIES, DEFAULT_ROLE, ROLES, appStatus, pendingCount, setRole, type Decision, type Decisions } from '../data';
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

/** Header app switcher: the grid icon opens a launcher with the most recently touched apps. */
function AppSwitcher({ decisions, onOpenApp, onAll }: { decisions: Decisions; onOpenApp: (id: string) => void; onAll: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const recent = APPS.slice(0, 6);

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
        aria-label="Apps"
        aria-expanded={open}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <LayoutGrid className="h-4 w-4" />
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
            <p className="border-b border-border px-4 py-3 text-[13px] font-semibold">Your apps</p>
            <ul className="grid grid-cols-3 gap-1 p-2">
              {recent.map((a) => {
                const Icon = CATEGORIES.find((k) => k.key === a.cat)?.icon ?? LayoutGrid;
                const live = appStatus(a, decisions) === 'live';
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onOpenApp(a.id);
                      }}
                      className="flex w-full flex-col items-center gap-1.5 rounded-lg px-1 py-3 text-center transition-colors hover:bg-accent"
                    >
                      <span className="relative grid h-10 w-10 place-items-center rounded-lg bg-muted text-brand-green">
                        <Icon className="h-5 w-5" aria-hidden />
                        {live && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-green" />}
                      </span>
                      <span className="line-clamp-2 text-[11.5px] leading-tight">{a.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onAll();
              }}
              className="w-full border-t border-border px-4 py-3 text-left text-[12.5px] text-brand-green transition-colors hover:bg-accent"
            >
              View all apps
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ROLE_KEY = 'mitra-dashboard:role';

function readRole(): string {
  try {
    const k = window.sessionStorage.getItem(ROLE_KEY);
    return ROLES.some((r) => r.key === k) ? (k as string) : DEFAULT_ROLE;
  } catch {
    return DEFAULT_ROLE;
  }
}

interface DashboardProps {
  email: string;
  onSignOut: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

/** Holds the signed-in role. Switching role rebuilds the dashboard on that role's workspaces only. */
export function Dashboard(props: DashboardProps) {
  const [role, setRoleKey] = useState(readRole);
  setRole(role); // scope the data before anything below renders
  const pick = (k: string) => {
    try {
      window.sessionStorage.setItem(ROLE_KEY, k);
    } catch {
      /* the choice just will not survive a reload */
    }
    setRoleKey(k);
  };
  return <DashboardInner key={role} {...props} role={role} onRole={pick} />;
}

function DashboardInner({ email, onSignOut, theme, onToggleTheme, role, onRole }: DashboardProps & { role: string; onRole: (k: string) => void }) {
  const [view, setView] = useState<ViewKey>('home');
  const [cat, setCat] = useState('all');
  const [decisions, setDecisions] = useState<Decisions>({});
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [chats, setChats] = useState<ChatModel[]>(readChats);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map((k) => [k.key, pendingCount(decisions, k.key)])), [decisions]);
  const total = pendingCount(decisions);
  const current = CATEGORIES.find((k) => k.key === cat) ?? ALL_VIEW;
  const waiting = APPROVALS.filter((a) => !decisions[a.id] && (cat === 'all' || a.cat === cat)).slice(0, 3);

  const go = useCallback((v: ViewKey, c: string) => {
    setView(v);
    setCat(c);
    setOpenApp(null);
    setChats((prev) => (prev.some((x) => x.messages.length === 0) ? prev.filter((x) => x.messages.length > 0) : prev));
    window.scrollTo({ top: 0 });
  }, []);

  const showApp = useCallback((id: string) => {
    const a = APPS.find((x) => x.id === id);
    setView('apps');
    setCat(a?.cat ?? 'all');
    setOpenApp(id);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    writeChats(chats);
  }, [chats]);

  const openChat = useCallback((id: string) => {
    setView('chat');
    setActiveChat(id);
    setOpenApp(null);
    setChats((prev) => prev.filter((c) => c.id === id || c.messages.length > 0));
    window.scrollTo({ top: 0 });
  }, []);

  /** New Chat: a blank conversation, like opening a fresh chat in any chat app. Reuses an empty one. */
  const newChat = () => {
    const empty = chats.find((c) => c.messages.length === 0);
    if (empty) return openChat(empty.id);
    const fresh: ChatModel = { id: uid(), title: 'New chat', messages: [], at: Date.now() };
    setChats((prev) => [fresh, ...prev]);
    openChat(fresh.id);
  };

  const exchange = (text: string) => [
    { id: uid(), role: 'user' as const, text },
    { id: uid(), role: 'assistant' as const, answer: route(text, decisions, 'all'), fresh: true },
  ];

  /** Asking from Home opens a new chat with the question already sent. */
  const askFromHome = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const chat: ChatModel = { id: uid(), title: titleFrom(t), messages: exchange(t), at: Date.now() };
    setChats((prev) => [chat, ...prev.filter((c) => c.messages.length > 0)]);
    openChat(chat.id);
  };

  /** A message in the chat you are already in. */
  const sendInChat = (text: string) => {
    const t = text.trim();
    if (!t || !activeChat) return;
    setChats((prev) =>
      prev.map((c) => (c.id === activeChat ? { ...c, title: c.messages.length === 0 ? titleFrom(t) : c.title, messages: [...c.messages, ...exchange(t)] } : c)),
    );
  };

  const settle = (msgId: string) =>
    setChats((prev) => prev.map((c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId && m.fresh ? { ...m, fresh: false } : m)) })));

  const startBuild = (name: string) => {
    setToast({ title: 'Build started', body: `${name} is in the Define stage` });
    if (!activeChat) return;
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat
          ? { ...c, messages: [...c.messages, { id: uid(), role: 'assistant' as const, text: `Build started for ${name}. It is in the Define stage now, and I will flag it in Approvals when it needs your decision.` }] }
          : c,
      ),
    );
  };

  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChat === id) {
      setActiveChat(null);
      go('home', 'all');
    }
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
      { id: 'new-chat', label: 'New chat', hint: 'Action', icon: MessageSquarePlus, run: () => newChat() },
      { id: 'home', label: 'Home', hint: 'Screen', icon: HomeIcon, run: () => go('home', 'all') },
      ...(SHOW_APPS ? [{ id: 'apps', label: 'Apps', hint: `${APPS.length} apps`, icon: LayoutGrid, run: () => go('apps', 'all') }] : []),
      { id: 'approvals', label: 'Approvals', hint: `${total} pending`, icon: CheckCheck, run: () => go('approvals', 'all') },
      ...chats.filter((c) => c.messages.length > 0).slice(0, 5).map((c) => ({ id: `chat-${c.id}`, label: c.title, hint: 'Chat', icon: MessageSquarePlus, run: () => openChat(c.id) })),
      ...CATEGORIES.map((k) => ({ id: `ws-${k.key}`, label: k.label, hint: 'Workspace', icon: k.icon, run: () => go('home', k.key) })),
      ...(SHOW_APPS ? APPS : []).map((a) => ({
        id: a.id,
        label: a.name,
        hint: 'App',
        icon: LayoutGrid,
        run: () => showApp(a.id),
      })),
      ...APPROVALS.filter((a) => !decisions[a.id]).map((a) => ({
        id: a.id,
        label: a.title,
        hint: `Approval · ${a.stage}`,
        icon: CheckCheck,
        run: () => go('approvals', a.cat),
      })),
    ],
    [chats, decisions, go, openChat, showApp, total],
  );

  const crumb = view === 'approvals' ? 'Approvals' : current.label;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        view={view}
        cat={cat}
        counts={counts}
        total={total}
        chats={chats.filter((c) => c.messages.length > 0).map((c) => ({ id: c.id, title: c.title }))}
        activeChatId={activeChat}
        onOpenChat={openChat}
        onDeleteChat={deleteChat}
        decisions={decisions}
        onOpenApprovals={(c) => go('approvals', c)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        onNew={newChat}
        onGo={go}
        email={email}
        role={role}
        onRole={onRole}
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
              {view === 'approvals' ? 'Approvals' : view === 'apps' ? 'Apps' : view === 'chat' ? 'Chat' : 'Workspace'} {(view === 'home' || view === 'chat') && <span className="px-1">/</span>}
              {view === 'home' && <span className="text-foreground">{crumb}</span>}
              {view === 'chat' && <span className="text-foreground">{chats.find((c) => c.id === activeChat)?.title ?? 'New chat'}</span>}
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
            {SHOW_APPS && <AppSwitcher decisions={decisions} onOpenApp={showApp} onAll={() => go('apps', 'all')} />}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
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
                cat={cat}
                view={current}
                email={email}
                decisions={decisions}
                onDecide={decide}
                onOpenApp={showApp}
                onOpenApps={() => go('apps', cat)}
                onOpenApprovals={(c) => go('approvals', c)}
                onWorkspace={(c) => go('home', c)}
                onAsk={askFromHome}
              />
            ) : view === 'chat' && chats.find((c) => c.id === activeChat) ? (
              <Chat
                key={activeChat}
                chat={chats.find((c) => c.id === activeChat) as ChatModel}
                decisions={decisions}
                onSend={sendInChat}
                onSettled={settle}
                onOpenApp={showApp}
                onOpenApprovals={(c) => go('approvals', c)}
                onStartBuild={startBuild}
              />
            ) : view === 'apps' ? (
              <Apps cat={cat} onCat={setCat} decisions={decisions} openId={openApp} onOpen={setOpenApp} onReview={(c) => go('approvals', c)} />
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
