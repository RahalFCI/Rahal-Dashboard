import type { InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/authStore';
import { apiClient, axiosInstance } from './client';
import { ApiError } from './errors';

const fakeAccessToken = `header.${btoa(JSON.stringify({ sub: 'admin-1', email: 'admin@test.com', role: 'Admin' }))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '')}.signature`;

// Real adapters (xhr/http) reject on a non-2xx status themselves via their own
// validateStatus/settle handling - axios's core does not do this generically for
// a custom adapter. A custom adapter that just resolves with `status: 401` never
// rejects, so it would never reach this module's response interceptor at all.
// This replicates the real rejection so the interceptor logic actually runs.
function rejectingAdapter(status: number, errorCode: string) {
  return async (config: InternalAxiosRequestConfig) => {
    const response = {
      data: { isSuccess: false, errorCode },
      status,
      statusText: 'Error',
      headers: {},
      config,
    };
    const err = Object.assign(new Error(`Request failed with status code ${status}`), {
      isAxiosError: true,
      response,
      config,
      toJSON: () => ({}),
    });
    throw err;
  };
}

describe('apiClient', () => {
  it('unwraps successful ApiResponse envelopes', async () => {
    const data = await apiClient<{ id: string }>({
      url: '/example',
      adapter: async (config) => ({
        data: { isSuccess: true, data: { id: 'abc' }, errorCode: 'None' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }),
    });

    expect(data).toEqual({ id: 'abc' });
  });

  it('throws typed errors for failed envelopes', async () => {
    await expect(
      apiClient({
        url: '/example',
        adapter: async (config) => ({
          data: { isSuccess: false, errorCode: 'Forbidden' },
          status: 403,
          statusText: 'Forbidden',
          headers: {},
          config,
        }),
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 } satisfies Partial<ApiError>);
  });
});

describe('401 refresh interceptor', () => {
  const originalAdapter = axiosInstance.defaults.adapter;

  afterEach(() => {
    axiosInstance.defaults.adapter = originalAdapter;
    useAuthStore.getState().clearSession();
  });

  it('rejects instead of hanging forever when the refresh token is also invalid', async () => {
    useAuthStore.getState().setSession({
      accessToken: fakeAccessToken,
      refreshToken: 'stale-refresh-token',
      accessTokenExpiration: '2020-01-01T00:00:00Z',
      refreshTokenExpiration: '2020-01-01T00:00:00Z',
    });

    // Every request - the original call and the /auth/generate refresh call alike -
    // comes back 401, simulating an access token and refresh token that are both
    // invalid (e.g. the refresh token's DB row is gone). Before the fix, the
    // refresh call's own 401 re-entered this interceptor and awaited the
    // refreshPromise it was itself part of, deadlocking forever instead of
    // rejecting.
    axiosInstance.defaults.adapter = rejectingAdapter(401, 'Unauthorized');

    await expect(apiClient({ method: 'GET', url: '/Badge' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    } satisfies Partial<ApiError>);

    expect(useAuthStore.getState().user).toBeNull();
  });
});
