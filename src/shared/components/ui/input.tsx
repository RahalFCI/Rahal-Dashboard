import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'mt-2 w-full bg-surface px-3 py-2.5 text-sm text-on-surface',
        'border-0 border-b-2 border-transparent transition-colors duration-150',
        'placeholder:text-on-surface-variant/50',
        'outline-none focus:border-primary',
        className,
      )}
      {...props}
    />
  );
});
