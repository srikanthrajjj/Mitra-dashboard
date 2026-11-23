import { cn } from '../lib/utils';

/**
 * The Acme mark: an indigo rounded square with an "A" drawn as one peak and a crossbar. The colours are
 * fixed so the logo stays the same on light and dark.
 */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={cn('shrink-0', className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#4f46e5" />
      <path
        d="M8.5 23 16 8.5 23.5 23M11.6 18.2h8.8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ size = 24, markOnly = false, className }: { size?: number; markOnly?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} role="img" aria-label="Acme">
      <LogoMark size={size} />
      {!markOnly && (
        <span className="font-display font-extrabold leading-none tracking-[-0.04em] text-foreground" style={{ fontSize: size * 0.95 }}>
          Acme
        </span>
      )}
    </span>
  );
}
