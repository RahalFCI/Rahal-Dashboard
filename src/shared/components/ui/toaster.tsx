import * as Toast from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useToastStore } from '@/shared/stores/toastStore';

const variantStyles = {
  error: 'border-error/30 bg-error-container text-error',
  success: 'border-green-200 bg-[#e8f5e9] text-[#2e7d32]',
  info: 'border-outline-variant bg-surface-high text-on-surface',
};

export function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <Toast.Provider swipeDirection="right" duration={4000}>
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          open
          onOpenChange={(open) => {
            if (!open) remove(toast.id);
          }}
          className={cn(
            'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-ambient',
            variantStyles[toast.variant],
          )}
        >
          <Toast.Description className="leading-snug">{toast.message}</Toast.Description>
          <Toast.Close className="shrink-0 rounded opacity-60 hover:opacity-100">
            <X size={14} />
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2 outline-none" />
    </Toast.Provider>
  );
}
