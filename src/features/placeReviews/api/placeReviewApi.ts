import { apiClient } from '@/shared/api/client';
import type { GetPlaceReviewDto } from '../types';

// Looks up the single review for this (explorerId, placeId, checkInId) triple.
// Pass through whatever explorerId the row already carries (currently always
// Guid.Empty for every review - see the note on getReviewsByExplorerId) rather
// than a real explorer id, or this will 404.
export function getReview(explorerId: string, placeId: string, checkInId: string) {
  return apiClient<GetPlaceReviewDto>({
    method: 'GET',
    url: `/PlaceReview/${explorerId}/${placeId}/${checkInId}`,
  });
}

// Not paginated server-side - returns every review for the place in one array.
export function getReviewsByPlaceId(placeId: string) {
  return apiClient<GetPlaceReviewDto[]>({ method: 'GET', url: `/PlaceReview/place/${placeId}` });
}

// Filters to PlaceReview.IsVerified == true. No endpoint anywhere in this API
// ever sets IsVerified - it defaults to false on create and there's no
// update/verify action - so this will return [] for every place until the
// backend adds a way to mark a review verified.
export function getVerifiedReviewsByPlaceId(placeId: string) {
  return apiClient<GetPlaceReviewDto[]>({ method: 'GET', url: `/PlaceReview/verified/${placeId}` });
}

// CreatePlaceReviewAsync never persists ExplorerId onto the review entity (see
// PlaceReviewMapper.ToEntity / PlaceReviewService.CreatePlaceReviewAsync), so
// every review is saved with ExplorerId == Guid.Empty regardless of who wrote
// it. Querying by a real explorer's id will return [] until that's fixed
// server-side; only Guid.Empty currently returns anything.
export function getReviewsByExplorerId(explorerId: string) {
  return apiClient<GetPlaceReviewDto[]>({ method: 'GET', url: `/PlaceReview/explorer/${explorerId}` });
}

// Authorize(Roles = "Explorer,Admin") - unlike Create/Update on this resource,
// Admin can call this directly. Soft delete (sets IsDeleted server-side); there's
// no restore endpoint for this resource, so this is irreversible from the UI.
// Pass through whatever explorerId the row already carries (see getReview).
export function deleteReview(explorerId: string, placeId: string, checkInId: string) {
  return apiClient<string>({
    method: 'DELETE',
    url: `/PlaceReview/${explorerId}/${placeId}/${checkInId}`,
  });
}
