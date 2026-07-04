import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { UpsertVendorBranchDto, VendorBranchDto } from '../types';

export function listVendorBranches(vendorId: string, page: number, pageSize: number) {
  return apiClient<PagedResult<VendorBranchDto>>({
    method: 'GET',
    url: `/VendorBranch/vendor/${vendorId}`,
    params: { page, pageSize },
  });
}

export function getVendorBranch(id: string) {
  return apiClient<VendorBranchDto>({ method: 'GET', url: `/VendorBranch/${id}` });
}

export function createVendorBranch(body: UpsertVendorBranchDto) {
  return apiClient<VendorBranchDto>({ method: 'POST', url: '/VendorBranch', data: body });
}

export function updateVendorBranch(id: string, body: UpsertVendorBranchDto) {
  const { vendorId: _vendorId, ...payload } = body;
  return apiClient<VendorBranchDto>({ method: 'PUT', url: `/VendorBranch/${id}`, data: payload });
}

export function deleteVendorBranch(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/VendorBranch/${id}` });
}
