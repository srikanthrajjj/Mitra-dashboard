import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCheck, ChevronDown, Home, LayoutGrid, LogOut, PanelLeftClose, PanelLeftOpen, Plus, X, type LucideIcon } from 'lucide-react';
import { Logo, LogoMark } from './Logo';
import { Notifications } from './Notifications';
import { CATEGORIES, type Decisions } from '../data';
import { cn } from '../lib/utils';

export type ViewKey = 'home' | 'apps' | 'approvals';

interface SidebarProps {
  view: ViewKey;
  cat: string;
  counts: Record<string, number>;
  total: number;
  decisions: Decisions;
  onOpenApprovals: (cat: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNew: () => void;
  onGo: (view: ViewKey, cat: string) => void;
  email: string;
  onSignOut: () => void;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
}

function Row({
  icon: Icon,
  label,
  count,
  active,
  collapsed,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  count?: number;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        'relative flex w-full items-center rounded-md py-2 text-left text-[13px] transition-colors',
        collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5',
        active ? 'bg-brand-green/10 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <span className={cn('absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand-green transition-opacity', active ? 'opacity-100' : 'opacity-0')} />
      <Icon className={cn('h-4 w-4 shrink-0', active && 'text-brand-green')} aria-hidden />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && count !== undefined && count > 0 && (
        <span className="rounded bg-muted px-1.5 font-mono text-[10px] text-foreground">{count}</span>
      )}
      {collapsed && count !== undefined && count > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-green" />}
    </button>
  );
}

function AvatarMenu({ email, collapsed, onSignOut }: { email: string; collapsed: boolean; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = (email.slice(0, 2) || 'AM').toUpperCase();

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
    <div ref={ref} className="relative border-t border-border p-2">
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={cn('absolute bottom-full z-30 mb-1 rounded-xl border border-mitra-border bg-mitra-surface p-1.5', collapsed ? 'left-2 w-56' : 'inset-x-2')}
          >
            <div className="px-2.5 py-2">
              <p className="text-[11px] text-muted-foreground">Signed in as</p>
              <p className="truncate text-[13px] font-medium">{email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={collapsed ? email : undefined}
        className={cn('flex w-full items-center rounded-md p-1.5 transition-colors hover:bg-accent', collapsed ? 'justify-center' : 'gap-2.5')}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold">{initials}</span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-[12.5px] text-muted-foreground">{email}</span>
            <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden />
          </>
        )}
      </button>
    </div>
  );
}

function Body({
  collapsed,
  onToggleCollapsed,
  onClose,
  ...p
}: SidebarProps & { onClose?: () => void }) {
  const [wsOpen, setWsOpen] = useState(true);
  const go = (view: ViewKey, cat: string) => {
    p.onGo(view, cat);
    onClose?.();
  };

  return (
    <div className="flex h-full flex-col">
      <div className={cn('p-3', collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between')}>
        {collapsed ? <LogoMark size={26} /> : <Logo size={24} className="ml-1" />}
        <div className={cn('flex items-center', collapsed ? 'flex-col gap-1' : 'gap-0.5')}>
          <Notifications
            decisions={p.decisions}
            onOpen={(c) => {
              p.onOpenApprovals(c);
              onClose?.();
            }}
            placement={collapsed ? 'right' : 'below'}
            className="h-8 w-8"
          />
          {onClose ? (
            <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      <div className="px-2">
        <button
          type="button"
          onClick={() => {
            p.onNew();
            onClose?.();
          }}
          title={collapsed ? 'New Chat' : undefined}
          className={cn(
            'flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-green text-[13px] font-semibold text-background transition-colors hover:bg-brand-green-hover',
          )}
        >
          <Plus className="h-4 w-4" aria-hidden />
          {!collapsed && 'New Chat'}
        </button>
      </div>

      <nav aria-label="Main" className="mt-3 flex-1 space-y-4 overflow-y-auto px-2">
        <div className="space-y-0.5">
          <Row icon={Home} label="Home" active={p.view === 'home' && p.cat === 'all'} collapsed={collapsed} onClick={() => go('home', 'all')} />
          <Row icon={LayoutGrid} label="Apps" active={p.view === 'apps'} collapsed={collapsed} onClick={() => go('apps', 'all')} />
          <Row icon={CheckCheck} label="Approvals" count={p.total} active={p.view === 'approvals'} collapsed={collapsed} onClick={() => go('approvals', 'all')} />
        </div>

        <div>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setWsOpen((v) => !v)}
              aria-expanded={wsOpen}
              className="mb-1 flex w-full items-center justify-between px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Workspaces
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', !wsOpen && '-rotate-90')} aria-hidden />
            </button>
          )}
          {(wsOpen || collapsed) && (
            <ul className="space-y-0.5">
              {CATEGORIES.map((k) => (
                <li key={k.key}>
                  <Row
                    icon={k.icon}
                    label={k.label}
                    count={p.counts[k.key]}
                    active={p.view === 'home' && p.cat === k.key}
                    collapsed={collapsed}
                    onClick={() => go('home', k.key)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      <AvatarMenu email={p.email} collapsed={collapsed} onSignOut={p.onSignOut} />
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-border bg-mitra-sidebar transition-[width] duration-200 md:block',
          props.collapsed ? 'w-14' : 'w-60',
        )}
      >
        <Body {...props} />
      </aside>

      <AnimatePresence>
        {props.drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={props.onCloseDrawer}
              className="fixed inset-0 z-40 bg-background/70 md:hidden"
              aria-hidden
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-mitra-sidebar md:hidden"
            >
              <Body {...props} collapsed={false} onClose={props.onCloseDrawer} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
