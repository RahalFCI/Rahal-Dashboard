import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { GetXpTransactionDto } from '../types';

// explorerId is ExplorerProfile.UserId (same id as the explorer's AspNetUsers id).
export function getXpTransactionsByExplorerId(explorerId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetXpTransactionDto>>({
    method: 'GET',
    url: `/XpTransaction/explorer/${explorerId}`,
    params: { page, pageSize },
  });
}
