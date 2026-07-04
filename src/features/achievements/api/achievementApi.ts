import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { AchievementFormValues, CriteriaTypeFormValues } from '../schemas';
import type { GetAchievementCriteriaTypeDto, GetAchievementDto } from '../types';

export function listAchievements(page: number, pageSize: number) {
  return apiClient<PagedResult<GetAchievementDto>>({
    method: 'GET',
    url: '/Achievement',
    params: { page, pageSize },
  });
}

export function getAchievementById(id: string) {
  return apiClient<GetAchievementDto>({ method: 'GET', url: `/Achievement/${id}` });
}

function toAchievementDto(values: AchievementFormValues) {
  return {
    title: values.title,
    description: values.description,
    badgeId: values.badgeId || null,
    xpReward: values.xpReward,
    criteriaTypeId: values.criteriaTypeId,
    criteriaThreshold: values.criteriaThreshold,
  };
}

export function createAchievement(values: AchievementFormValues) {
  return apiClient<GetAchievementDto>({
    method: 'POST',
    url: '/Achievement',
    data: toAchievementDto(values),
  });
}

// Two confirmed backend quirks affecting this endpoint (not fixable from
// here): (1) UpdateAchievementDto's BadgeId is required - unlike create,
// where it's optional - so an achievement with no badge can't be edited
// without assigning one. (2) The duplicate-title check does not exclude the
// row being updated, so saving without changing the title 409s
// (ALREADY_EXISTS) even though nothing actually conflicts.
export function updateAchievement(id: string, values: AchievementFormValues) {
  return apiClient<string>({
    method: 'PUT',
    url: `/Achievement/${id}`,
    data: toAchievementDto(values),
  });
}

// Not paginated server-side - used to populate the criteria type select in
// AchievementDialog.
export function listCriteriaTypes() {
  return apiClient<GetAchievementCriteriaTypeDto[]>({ method: 'GET', url: '/AchievementCriteriaType' });
}

export function getCriteriaTypeById(id: string) {
  return apiClient<GetAchievementCriteriaTypeDto>({ method: 'GET', url: `/AchievementCriteriaType/${id}` });
}

// Exact, case-sensitive match against Name on the backend - same shape as
// Badge's and Challenge's by-name endpoints. The criteria type list is small
// and already fully visible without pagination, so there's no live search
// box here to wire this into; kept as the literal exact-match lookup this
// endpoint actually is.
export function getCriteriaTypeByName(name: string) {
  return apiClient<GetAchievementCriteriaTypeDto>({
    method: 'GET',
    url: `/AchievementCriteriaType/name/${encodeURIComponent(name)}`,
  });
}

export function createCriteriaType(values: CriteriaTypeFormValues) {
  return apiClient<GetAchievementCriteriaTypeDto>({
    method: 'POST',
    url: '/AchievementCriteriaType',
    data: values,
  });
}

export function updateCriteriaType(id: string, values: CriteriaTypeFormValues) {
  return apiClient<string>({
    method: 'PUT',
    url: `/AchievementCriteriaType/${id}`,
    data: values,
  });
}

// Confirmed permanently non-functional against the live backend (tested
// twice): the handler only matches rows where IsDeleted is already true
// (`.Where(a => a.Id == id && a.IsDeleted)`), but nothing in this resource's
// API ever sets IsDeleted - there's no soft-delete step at all for criteria
// types, unlike Badge/Achievement. This will 404 on every currently-active
// row, with no workaround. Kept here as the literal binding for this
// endpoint at the user's request; not fixable from the frontend.
export function deleteCriteriaType(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/AchievementCriteriaType/${id}` });
}

// Soft delete - sets IsDeleted/DeletedAt server-side, so the row disappears
// from listAchievements (which filters !IsDeleted) once this succeeds.
export function deleteAchievement(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/Achievement/${id}` });
}

// Reverses deleteAchievement. 404s unless the id refers to a row that is
// currently soft-deleted - there's no "list deleted" endpoint for this
// resource, so the only place this is reachable from is the Undo action
// offered after a delete.
export function restoreAchievement(id: string) {
  return apiClient<string>({ method: 'POST', url: `/Achievement/${id}/restore` });
}

export function permanentDeleteAchievement(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/Achievement/${id}/permanent` });
}
