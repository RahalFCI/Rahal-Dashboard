import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { deleteComment } from './commentsApi';

describe('commentsApi', () => {
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

    await deleteComment('22222222-2222-4222-a222-222222222222');

    expect(request).toHaveBeenCalledWith({
      method: 'DELETE',
      url: '/comments/22222222-2222-4222-a222-222222222222',
    });
  });
});
