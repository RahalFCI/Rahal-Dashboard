import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'focus-ring mt-2 min-h-24 w-full resize-y rounded-lg border border-outline/70 bg-surface-lowest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant',
        className,
      )}
      {...props}
    />
  );
}
