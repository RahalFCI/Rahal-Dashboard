import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-surface-high px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant',
        className,
      )}
      {...props}
    />
  );
}
