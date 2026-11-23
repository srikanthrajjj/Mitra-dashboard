import { cn } from '../lib/utils';

/**
 * The Mitra mark: a green rounded square with an "M" drawn as two peaks. The mark follows the
 * theme (its green and the letter colour come from CSS variables), so it works on light and dark.
 */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={cn('shrink-0', className)} aria-hidden>
      <rect width="32" height="32" rx="8" style={{ fill: 'var(--brand-green)' }} />
      <path
        d="M8.5 22V11l7.5 8 7.5-8v11"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: 'hsl(var(--background))' }}
      />
    </svg>
  );
}

export function Logo({ size = 24, markOnly = false, className }: { size?: number; markOnly?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} role="img" aria-label="Mitra">
      <LogoMark size={size} />
      {!markOnly && (
        <span className="font-display font-extrabold leading-none tracking-[-0.04em] text-foreground" style={{ fontSize: size * 0.95 }}>
          Mitra
        </span>
      )}
    </span>
  );
}
