import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'focus-ring mt-2 h-10 w-full rounded-lg border border-outline/70 bg-surface-lowest px-3 text-sm text-on-surface',
        className,
      )}
      {...props}
    />
  );
}
