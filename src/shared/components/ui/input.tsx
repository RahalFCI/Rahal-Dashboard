import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'focus-ring mt-2 h-10 w-full rounded-lg border border-outline/70 bg-surface-lowest px-3 text-sm text-on-surface placeholder:text-on-surface-variant',
        className,
      )}
      {...props}
    />
  );
}
