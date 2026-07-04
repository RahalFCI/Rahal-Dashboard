import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
  variant: 'error' | 'success' | 'info';
  action?: { label: string; onClick: () => void };
}

interface ToastStore {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
