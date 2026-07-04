import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { GetUserStatsDto } from '../types';

export function listUserStats(page: number, pageSize: number) {
  return apiClient<PagedResult<GetUserStatsDto>>({
    method: 'GET',
    url: '/UserStats',
    params: { page, pageSize },
  });
}

// explorerId here is ExplorerProfile.Id (the gamification profile's own id),
// not the AspNetUsers id - that's what UserStats.ExplorerProfileId is keyed
// on server-side, and it's exactly what GetUserStatsDto.explorerId already is.
export function getUserStatsByExplorerId(explorerId: string) {
  return apiClient<GetUserStatsDto>({ method: 'GET', url: `/UserStats/${explorerId}` });
}
