import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';

export interface ExplorerProfileDto {
  userId: string;
  displayName: string;
  profilePictureUrl: string;
  birthDate: string;
  gender: string;
  bio: string;
  countryCode: string;
  level: number;
  isPublic: boolean;
  isPremium: boolean;
}

export interface UpsertExplorerProfileDto extends ExplorerProfileDto {
  availableXp?: number;
  cumlativeXp?: number;
}

export function getExplorerProfile(userId: string) {
  return apiClient<ExplorerProfileDto>({
    method: 'GET',
    url: `/ExplorerProfile/${userId}`,
  });
}

export interface ExplorerNameDto {
  id: string;
  displayName: string;
}

// Bulk-resolve ExplorerProfile.Id -> display name. Meant for modules outside
// Gamification (e.g. check-ins, place reviews) that store an explorer id but
// have no relationship to the ExplorerProfile table to join against.
export function getExplorerNamesByIds(ids: string[]) {
  if (ids.length === 0) return Promise.resolve([] as ExplorerNameDto[]);
  return apiClient<ExplorerNameDto[]>({
    method: 'GET',
    url: '/ExplorerProfile/names',
    params: { ids },
    paramsSerializer: { indexes: null },
  });
}

export function listExplorerProfiles(page: number, pageSize: number) {
  return apiClient<PagedResult<ExplorerProfileDto>>({
    method: 'GET',
    url: '/ExplorerProfile',
    params: { page, pageSize },
  });
}

export function listDeletedExplorerProfiles(page: number, pageSize: number) {
  return apiClient<PagedResult<ExplorerProfileDto>>({
    method: 'GET',
    url: '/ExplorerProfile/deleted',
    params: { page, pageSize },
  });
}

export function updateExplorerProfile(userId: string, body: UpsertExplorerProfileDto) {
  return apiClient<string>({
    method: 'PUT',
    url: `/ExplorerProfile/${userId}`,
    data: toExplorerProfileFormData(body),
  });
}

export function updateExplorerProfilePicture(userId: string, profilePicture: File) {
  const formData = new FormData();
  formData.append('profilePicture', profilePicture);
  return apiClient<string>({
    method: 'PUT',
    url: `/ExplorerProfile/${userId}/update-picture`,
    data: formData,
  });
}

function toExplorerProfileFormData(body: UpsertExplorerProfileDto) {
  const formData = new FormData();
  formData.append('UserId', body.userId);
  formData.append('DisplayName', body.displayName);
  formData.append('ProfilePictureUrl', body.profilePictureUrl);
  formData.append('BirthDate', body.birthDate);
  formData.append('Gender', body.gender);
  formData.append('Bio', body.bio);
  formData.append('CountryCode', body.countryCode);
  formData.append('AvailableXp', String(body.availableXp ?? 0));
  formData.append('CumlativeXp', String(body.cumlativeXp ?? 0));
  formData.append('Level', String(body.level));
  formData.append('IsPublic', String(body.isPublic));
  formData.append('IsPremium', String(body.isPremium));
  return formData;
}
