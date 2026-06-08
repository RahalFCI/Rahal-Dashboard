import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type {
  GetPlaceCategoryDto,
  GetPlaceDto,
  PlacePhotoDto,
  UpsertPlaceCategoryDto,
  UpsertPlaceDto,
} from '../types';

export function listPlaces(page: number, pageSize: number) {
  return apiClient<PagedResult<GetPlaceDto>>({
    method: 'GET',
    url: '/place',
    params: { page, pageSize },
  });
}

export function getPlace(id: string) {
  return apiClient<GetPlaceDto>({ method: 'GET', url: `/place/${id}` });
}

export function createPlace(body: UpsertPlaceDto) {
  return apiClient<string>({ method: 'POST', url: '/place', data: body });
}

export function updatePlace(id: string, body: UpsertPlaceDto) {
  return apiClient<string>({ method: 'PUT', url: `/place/${id}`, data: body });
}

export function deletePlace(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/place/${id}` });
}

export function listCategories() {
  return apiClient<GetPlaceCategoryDto[]>({ method: 'GET', url: '/placecategory' });
}

export function createCategory(body: UpsertPlaceCategoryDto) {
  return apiClient<string>({ method: 'POST', url: '/placecategory', data: body });
}

export function updateCategory(id: string, body: UpsertPlaceCategoryDto) {
  return apiClient<string>({ method: 'PUT', url: `/placecategory/${id}`, data: body });
}

export function deleteCategory(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/placecategory/${id}` });
}

export function listPlacePhotos(placeId: string) {
  return apiClient<PlacePhotoDto[]>({ method: 'GET', url: `/placephoto/place/${placeId}` });
}

export async function addPlacePhoto(placeId: string, photo: File) {
  const formData = new FormData();
  formData.append('PlaceId', placeId);
  formData.append('Photo', photo);
  return apiClient<string>({
    method: 'POST',
    url: '/placephoto',
    data: formData,
  });
}

export function deletePlacePhoto(placeId: string, url: string) {
  return apiClient<string>({
    method: 'DELETE',
    url: `/placephoto/place/${placeId}/url`,
    params: { url },
  });
}
