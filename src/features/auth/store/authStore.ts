import { create } from 'zustand';
import type { AuthResponseDto, SessionUser } from '../types';
import { parseJwtUser } from '../utils/jwt';

const STORAGE_KEY = 'rahal.dashboard.session';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiration: string | null;
  refreshTokenExpiration: string | null;
  user: SessionUser | null;
  hasHydrated: boolean;
  setSession: (session: AuthResponseDto) => void;
  clearSession: () => void;
  hydrate: () => void;
}

function getStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function readStoredSession(): AuthResponseDto | null {
  const storage = getStorage();
  const raw = storage?.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponseDto;
  } catch {
    storage?.removeItem(STORAGE_KEY);
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  accessTokenExpiration: null,
  refreshTokenExpiration: null,
  user: null,
  hasHydrated: false,
  setSession: (session) => {
    getStorage()?.setItem(STORAGE_KEY, JSON.stringify(session));
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiration: session.accessTokenExpiration,
      refreshTokenExpiration: session.refreshTokenExpiration,
      user: parseJwtUser(session.accessToken),
      hasHydrated: true,
    });
  },
  clearSession: () => {
    getStorage()?.removeItem(STORAGE_KEY);
    set({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiration: null,
      refreshTokenExpiration: null,
      user: null,
      hasHydrated: true,
    });
  },
  hydrate: () => {
    const session = readStoredSession();
    if (!session) {
      set({ hasHydrated: true });
      return;
    }

    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiration: session.accessTokenExpiration,
      refreshTokenExpiration: session.refreshTokenExpiration,
      user: parseJwtUser(session.accessToken),
      hasHydrated: true,
    });
  },
}));

export const authStorageKey = STORAGE_KEY;
