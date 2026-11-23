import { cn } from '../lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}illuminaite-logo.png`}
      alt="IlluminAIte"
      className={cn('object-contain', className)}
    />
  );
}
