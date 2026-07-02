import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { env } from '@/config/env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Uploaded media (e.g. place photos) is stored with a relative path like
// "/uploads/xyz.png" and served from the API's origin, not under its "/api"
// prefix - resolve it against that origin so <img> tags don't resolve against
// the dashboard's own dev server instead. Seed/external URLs are already
// absolute and pass through unchanged.
export function resolveMediaUrl(url: string): string {
  if (!url || /^https?:\/\//i.test(url)) return url;
  const origin = env.API_BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}
