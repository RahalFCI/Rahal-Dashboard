import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'mt-2 w-full bg-surface px-3 py-2.5 text-sm text-on-surface',
        'border-0 border-b-2 border-transparent transition-colors duration-150',
        'outline-none focus:border-primary',
        '[color-scheme:light] [&>option]:bg-white [&>option]:text-[#1f1b15]',
        className,
      )}
      {...props}
    />
  );
}
