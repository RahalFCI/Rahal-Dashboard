import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { BadgeFormValues } from '../schemas';
import type { GetBadgeDto } from '../types';

export function listBadges(page: number, pageSize: number) {
  return apiClient<PagedResult<GetBadgeDto>>({
    method: 'GET',
    url: '/Badge',
    params: { page, pageSize },
  });
}

export function getBadgeById(id: string) {
  return apiClient<GetBadgeDto>({ method: 'GET', url: `/Badge/${id}` });
}

// Exact, case-sensitive match against Name on the backend - same shape as
// Challenge's and VendorCategory's by-name endpoints. Not used for live/
// case-insensitive search in the UI (see BadgesPage's client-side filter for
// that); kept here as the literal exact-match lookup this endpoint actually is.
export function getBadgeByName(name: string) {
  return apiClient<GetBadgeDto>({ method: 'GET', url: `/Badge/name/${encodeURIComponent(name)}` });
}

// CreateBadgeAsync/UpdateBadgeAsync bind their dto with [FromBody], so these
// must be sent as application/json, not multipart/form-data - the dto's
// Image (IFormFile) can never be populated through these endpoints as a result.
export function createBadge(values: BadgeFormValues) {
  return apiClient<GetBadgeDto>({
    method: 'POST',
    url: '/Badge',
    data: values,
  });
}

export function updateBadge(id: string, values: BadgeFormValues) {
  return apiClient<string>({
    method: 'PUT',
    url: `/Badge/${id}`,
    data: values,
  });
}

// Soft delete - sets IsDeleted/DeletedAt server-side, so the row disappears
// from GetAllBadgesAsync (it filters !IsDeleted) once this succeeds.
export function deleteBadge(id: string) {
  return apiClient<string>({
    method: 'DELETE',
    url: `/Badge/${id}`,
  });
}

// Reverses deleteBadge. 404s unless the id refers to a row that is currently
// soft-deleted - there's no "list deleted" endpoint for this resource, so the
// only place this is reachable from is the Undo action offered after a delete.
export function restoreBadge(id: string) {
  return apiClient<string>({ method: 'POST', url: `/Badge/${id}/restore` });
}
