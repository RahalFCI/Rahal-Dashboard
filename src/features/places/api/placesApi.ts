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

export function getPlacesByCategory(categoryId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetPlaceDto>>({
    method: 'GET',
    url: `/place/category/${categoryId}`,
    params: { page, pageSize },
  });
}

export interface LocationSearchParams {
  latitude: number;
  longitude: number;
  radiusInMeters: number;
  page: number;
  pageSize: number;
}

// POST /api/place/search binds its body via [FromQuery], including the nested
// offsetPaginationRequest object, so everything is sent as query params, not a body.
export function searchPlacesByLocation(params: LocationSearchParams) {
  return apiClient<PagedResult<GetPlaceDto>>({
    method: 'POST',
    url: '/place/search',
    params: {
      Latitude: params.latitude,
      Longitude: params.longitude,
      RadiusInMeters: params.radiusInMeters,
      'offsetPaginationRequest.Page': params.page,
      'offsetPaginationRequest.PageSize': params.pageSize,
    },
  });
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
