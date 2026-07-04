import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { getXpTransactionsByExplorerId } from './xpTransactionApi';

describe('xpTransactionApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists XP transactions for one explorer, scoped by explorerId in the URL', async () => {
    const page = {
      items: [
        {
          id: 'xp-1',
          explorerId: 'explorer-1',
          amount: 50,
          sourceType: 'Achievement',
          referenceId: 'ach-1',
          createdAt: '2026-06-19T20:30:15Z',
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: page, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getXpTransactionsByExplorerId('explorer-1', 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/XpTransaction/explorer/explorer-1',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('resolves to an empty page (not an error) when the explorer has no XP transactions', async () => {
    const emptyPage = {
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: emptyPage, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    const result = await getXpTransactionsByExplorerId('explorer-with-none', 1, 10);

    expect(result.items).toEqual([]);
  });
});
