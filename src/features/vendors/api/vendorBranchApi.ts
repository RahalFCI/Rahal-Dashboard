import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { CreateVendorBranchDto, GetVendorBranchDto, UpdateVendorBranchDto } from '../types';

export function createVendorBranch(body: CreateVendorBranchDto) {
  return apiClient<GetVendorBranchDto>({ method: 'POST', url: '/VendorBranch', data: body });
}

export function getVendorBranch(id: string) {
  return apiClient<GetVendorBranchDto>({ method: 'GET', url: `/VendorBranch/${id}` });
}

export function listVendorBranches(vendorId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<GetVendorBranchDto>>({
    method: 'GET',
    url: `/VendorBranch/vendor/${vendorId}`,
    params: { page, pageSize },
  });
}

export function updateVendorBranch(id: string, body: UpdateVendorBranchDto) {
  return apiClient<GetVendorBranchDto>({ method: 'PUT', url: `/VendorBranch/${id}`, data: body });
}

export function deleteVendorBranch(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/VendorBranch/${id}` });
}
