import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { GetCheckInChallengeDto } from '../types';

export function getCheckInChallengeById(id: string) {
  return apiClient<GetCheckInChallengeDto>({ method: 'GET', url: `/CheckInChallenge/${id}` });
}

// checkInId is the CheckIn entity's own Id - note that GetCheckInDto (used
// throughout the CheckIns feature) never exposes this id, only ExplorerId/
// PlaceId, so there's currently no list row to link this in from.
export function getCheckInChallengesByCheckInId(checkInId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetCheckInChallengeDto>>({
    method: 'GET',
    url: `/CheckInChallenge/checkin/${checkInId}`,
    params: { page, pageSize },
  });
}

// Same situation as getCheckInChallengesByCheckInId - challengeId is shown in
// the by-id lookup result below, but no list view exposes it to link in from.
export function getCheckInChallengesByChallengeId(challengeId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetCheckInChallengeDto>>({
    method: 'GET',
    url: `/CheckInChallenge/challenge/${challengeId}`,
    params: { page, pageSize },
  });
}

export function deleteCheckInChallenge(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/CheckInChallenge/${id}` });
}

export function restoreCheckInChallenge(id: string) {
  return apiClient<string>({ method: 'POST', url: `/CheckInChallenge/${id}/restore` });
}

export function permanentDeleteCheckInChallenge(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/CheckInChallenge/${id}/permanent` });
}
