import { beforeEach, describe, expect, it } from 'vitest';
import { authStorageKey, useAuthStore } from './authStore';

const tokenPayload = btoa(JSON.stringify({ sub: 'user-1', email: 'admin@test.com', role: 'Admin' }))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

const accessToken = `header.${tokenPayload}.signature`;

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
  });

  it('persists and clears dashboard sessions', () => {
    useAuthStore.getState().setSession({
      accessToken,
      refreshToken: 'refresh',
      accessTokenExpiration: '2026-05-11T10:00:00Z',
      refreshTokenExpiration: '2026-05-12T10:00:00Z',
    });

    expect(useAuthStore.getState().user?.role).toBe('Admin');
    expect(localStorage.getItem(authStorageKey)).toContain('refresh');

    useAuthStore.getState().clearSession();

    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem(authStorageKey)).toBeNull();
  });
});
