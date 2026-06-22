import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { GetCheckInDto } from '../types';

export function listCheckIns(page: number, pageSize: number) {
  return apiClient<PagedResult<GetCheckInDto>>({
    method: 'GET',
    url: '/CheckIn',
    params: { page, pageSize },
  });
}

// Unlike listCheckIns/etc, this single-record fetch does .Include(c => c.Place)
// server-side, so placeName comes back populated here - no client-side lookup needed.
export function getCheckIn(explorerId: string, placeId: string) {
  return apiClient<GetCheckInDto>({ method: 'GET', url: `/CheckIn/${explorerId}/${placeId}` });
}

// Same missing-Include gap as listCheckIns - placeName comes back empty for
// every row here too, even though the handler already loads the Place entity
// server-side (just to validate placeId exists) without using its Name.
export function getCheckInsByPlace(placeId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetCheckInDto>>({
    method: 'GET',
    url: `/CheckIn/place/${placeId}`,
    params: { page, pageSize },
  });
}

// Same missing-Include gap as listCheckIns/getCheckInsByPlace - placeName is
// empty for every row, and unlike getCheckInsByPlace there's no NotFound
// branch here (always resolves to a page, even an empty one).
export function getCheckInsByExplorerId(explorerId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetCheckInDto>>({
    method: 'GET',
    url: `/CheckIn/explorer/${explorerId}`,
    params: { page, pageSize },
  });
}

// Same missing-Include gap as the other list endpoints - placeName is empty
// for every row. Filtered server-side to ValidationStatus == Pending.
export function getPendingCheckIns(page: number, pageSize: number) {
  return apiClient<PagedResult<GetCheckInDto>>({
    method: 'GET',
    url: '/CheckIn/pending',
    params: { page, pageSize },
  });
}
