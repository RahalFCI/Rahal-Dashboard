import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { GetExplorerAchievementDto } from '../types';

export function listExplorerAchievements(page: number, pageSize: number) {
  return apiClient<PagedResult<GetExplorerAchievementDto>>({
    method: 'GET',
    url: '/ExplorerAchievement',
    params: { page, pageSize },
  });
}

export function getExplorerAchievementById(id: string) {
  return apiClient<GetExplorerAchievementDto>({ method: 'GET', url: `/ExplorerAchievement/${id}` });
}

// explorerId is ExplorerProfile.Id, same id space as GetExplorerAchievementDto.explorerId.
export function getExplorerAchievementsByExplorerId(explorerId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetExplorerAchievementDto>>({
    method: 'GET',
    url: `/ExplorerAchievement/explorer/${explorerId}`,
    params: { page, pageSize },
  });
}

export function getExplorerAchievementsByAchievementId(achievementId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetExplorerAchievementDto>>({
    method: 'GET',
    url: `/ExplorerAchievement/achievement/${achievementId}`,
    params: { page, pageSize },
  });
}

// Soft delete - sets IsDeleted/DeletedAt server-side, so the row disappears
// from every list endpoint above (they all filter !IsDeleted) once this succeeds.
export function deleteExplorerAchievement(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/ExplorerAchievement/${id}` });
}

// Reverses deleteExplorerAchievement. 404s unless the id refers to a row that
// is currently soft-deleted - there's no "list deleted" endpoint for this
// resource, so the only place this is reachable from is the Undo action
// offered right after a delete.
export function restoreExplorerAchievement(id: string) {
  return apiClient<string>({ method: 'POST', url: `/ExplorerAchievement/${id}/restore` });
}
