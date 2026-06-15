import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { UpsertVendorProfileDto, VendorProfileDto, Weekday, WorkingHours } from '../types';

const weekdays: Weekday[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getVendorProfile(userId: string) {
  return apiClient<VendorProfileDto>({
    method: 'GET',
    url: `/VendorProfile/${userId}`,
  });
}

export function listVendorProfiles(page: number, pageSize: number) {
  return apiClient<PagedResult<VendorProfileDto>>({
    method: 'GET',
    url: '/VendorProfile',
    params: { page, pageSize },
  });
}

export function listUnapprovedVendorProfiles(page: number, pageSize: number) {
  return apiClient<PagedResult<VendorProfileDto>>({
    method: 'GET',
    url: '/VendorProfile/unapproved',
    params: { page, pageSize },
  });
}

export function listDeletedVendorProfiles(page: number, pageSize: number) {
  return apiClient<PagedResult<VendorProfileDto>>({
    method: 'GET',
    url: '/VendorProfile/deleted',
    params: { page, pageSize },
  });
}

export function approveVendorProfile(userId: string) {
  return apiClient<string>({
    method: 'POST',
    url: `/VendorProfile/${userId}/approve`,
  });
}

export function createVendorProfile(body: UpsertVendorProfileDto) {
  return apiClient<string>({
    method: 'POST',
    url: '/VendorProfile/create',
    data: toVendorProfileFormData(body),
  });
}

export function updateVendorProfile(userId: string, body: UpsertVendorProfileDto) {
  return apiClient<string>({
    method: 'PUT',
    url: `/VendorProfile/${userId}`,
    data: toVendorProfileFormData(body),
  });
}

export function updateVendorProfilePicture(userId: string, profilePicture: File) {
  const formData = new FormData();
  formData.append('profilePicture', profilePicture);
  return apiClient<string>({
    method: 'PUT',
    url: `/VendorProfile/${userId}/update-picture`,
    data: formData,
  });
}

function toVendorProfileFormData(body: UpsertVendorProfileDto) {
  const formData = new FormData();
  formData.append('UserId', body.userId);
  formData.append('DisplayName', body.displayName);
  formData.append('ProfilePictureUrl', body.profilePictureUrl ?? '');
  formData.append('CountryCode', body.countryCode);
  formData.append('Address', body.address);
  formData.append('AddressUrl', body.addressUrl);
  formData.append('CategoryId', body.categoryId);

  appendWorkingHours(formData, body.workingHours);
  return formData;
}

function appendWorkingHours(formData: FormData, workingHours: WorkingHours) {
  weekdays.forEach((day) => {
    const value = workingHours[day];
    if (value) formData.append(`WorkingHours[${day}]`, value);
  });
}
