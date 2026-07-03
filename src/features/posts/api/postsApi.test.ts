import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { deletePost } from './postsApi';

describe('postsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses no-content handling for soft delete', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: undefined,
      status: 204,
      statusText: 'No Content',
      headers: {},
      config: {},
    });

    await deletePost('11111111-1111-1111-1111-111111111111');

    expect(request).toHaveBeenCalledWith({
      method: 'DELETE',
      url: '/Posts/11111111-1111-1111-1111-111111111111',
    });
  });
});
