import { describe, expect, it } from 'vitest';
import { apiClient } from './client';
import { ApiError } from './errors';

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
