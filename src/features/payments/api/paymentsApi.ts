import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { PaymentTransactionDto, PaymentTransactionFilters } from '../types';

export function listTransactions(filters: PaymentTransactionFilters, page: number, pageSize: number) {
  return apiClient<PagedResult<PaymentTransactionDto>>({
    method: 'GET',
    url: '/payments/transactions',
    params: {
      explorerDisplayName: filters.explorerDisplayName || undefined,
      status: filters.status || undefined,
      transactionId: filters.transactionId || undefined,
      currency: filters.currency || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      page,
      pageSize,
    },
  });
}
