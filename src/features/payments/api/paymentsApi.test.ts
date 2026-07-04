import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { listTransactions } from './paymentsApi';

describe('paymentsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists transactions with only page and pageSize when no filters are set', async () => {
    const page = {
      items: [
        {
          transactionId: 'txn-1',
          explorerId: 'explorer-1',
          explorerDisplayName: 'Jane Explorer',
          operationId: 'op-1',
          referenceId: 'ref-1',
          amount: 19.99,
          currency: 'usd',
          status: 'Succeeded',
          gateway: 'Stripe',
          gatewayPaymentIntentId: 'pi_123',
          failureMessage: null,
          createdAt: '2026-07-01T10:00:00Z',
          updatedAt: '2026-07-01T10:00:05Z',
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

    const result = await listTransactions({}, 1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/payments/transactions',
      params: {
        explorerDisplayName: undefined,
        status: undefined,
        transactionId: undefined,
        currency: undefined,
        fromDate: undefined,
        toDate: undefined,
        page: 1,
        pageSize: 10,
      },
    });
    expect(result).toEqual(page);
  });

  it('forwards populated filters alongside pagination', async () => {
    const emptyPage = {
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: true, data: emptyPage, errorCode: 'None' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });

    await listTransactions(
      {
        explorerDisplayName: 'Jane',
        status: 'Failed',
        currency: 'usd',
        fromDate: '2026-06-01',
        toDate: '2026-06-30',
      },
      2,
      25,
    );

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/payments/transactions',
      params: {
        explorerDisplayName: 'Jane',
        status: 'Failed',
        transactionId: undefined,
        currency: 'usd',
        fromDate: '2026-06-01',
        toDate: '2026-06-30',
        page: 2,
        pageSize: 25,
      },
    });
  });

  it('throws a FORBIDDEN ApiError when the caller is not an Admin', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: { isSuccess: false, data: null, errorCode: 'Forbidden' },
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: {},
    });

    await expect(listTransactions({}, 1, 10)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
