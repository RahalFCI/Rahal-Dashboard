import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { GetChallengeDto } from '../types';

export function listChallenges(page: number, pageSize: number) {
  return apiClient<PagedResult<GetChallengeDto>>({
    method: 'GET',
    url: '/Challenge',
    params: { page, pageSize },
  });
}

export function getChallengeById(id: string) {
  return apiClient<GetChallengeDto>({ method: 'GET', url: `/Challenge/${id}` });
}

export function getChallengesByPlaceId(placeId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetChallengeDto>>({
    method: 'GET',
    url: `/Challenge/place/${placeId}`,
    params: { page, pageSize },
  });
}

// Exact, case-sensitive match against Name on the backend - same shape as
// VendorCategory's by-name endpoint. Not used for live/case-insensitive
// search in the UI (see ChallengesPage's client-side filter for that);
// kept here as the literal exact-match lookup this endpoint actually is.
export function getChallengeByName(name: string) {
  return apiClient<GetChallengeDto>({ method: 'GET', url: `/Challenge/name/${encodeURIComponent(name)}` });
}

// Soft delete - sets IsDeleted/DeletedAt server-side, so the row disappears
// from listChallenges (which filters !IsDeleted) once this succeeds.
export function deleteChallenge(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/Challenge/${id}` });
}

// Reverses deleteChallenge. 404s unless the id refers to a row that is
// currently soft-deleted - there's no "list deleted" endpoint for this
// resource, so the only place this is reachable from is the Undo action
// offered right after a delete.
export function restoreChallenge(id: string) {
  return apiClient<string>({ method: 'POST', url: `/Challenge/${id}/restore` });
}
