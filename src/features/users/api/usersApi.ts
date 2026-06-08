import { apiClient, apiClientNoContent } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { UserRole } from '@/features/auth/types';
import type { AccountUserDto, ManageableRole, UpdatePasswordDto, UserDto, UserSummaryDto } from '../types';

export function listUsers(role: ManageableRole, page: number, pageSize: number, includeDeleted: boolean) {
  return apiClient<PagedResult<UserSummaryDto>>({
    method: 'GET',
    url: resolveUserListUrl(role, includeDeleted),
    params: { page, pageSize },
  }).then((result) => (includeDeleted ? result : filterRolePage(result, role)));
}

function resolveUserListUrl(role: ManageableRole, includeDeleted: boolean) {
  if (!includeDeleted) return '/User';
  if (role === 'explorer') return '/User/explorers-include-deleted';
  if (role === 'vendor') return '/User/vendors-include-deleted';
  if (role === 'admin') return '/User/admins-include-deleted';
  return '/User/include-deleted';
}

function filterRolePage(result: PagedResult<UserSummaryDto>, role: ManageableRole): PagedResult<UserSummaryDto> {
  const expectedRole = roleToUserRole(role);
  const items = result.items.filter((user) => normalizeRole(user.role) === expectedRole);
  return { ...result, items, totalCount: items.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
}

function roleToUserRole(role: ManageableRole): UserRole {
  if (role === 'admin') return 'Admin';
  if (role === 'vendor') return 'Vendor';
  return 'Explorer';
}

function normalizeRole(role: UserSummaryDto['role']): UserRole | undefined {
  if (role === 0) return 'Explorer';
  if (role === 1) return 'Vendor';
  if (role === 2) return 'Admin';
  if (role === 'Admin' || role === 'Vendor' || role === 'Explorer') return role;
  return undefined;
}

export function getUser(_role: ManageableRole, id: string) {
  return apiClient<AccountUserDto>({
    method: 'GET',
    url: `/User/${id}`,
  });
}

export function updateUser(_role: ManageableRole, user: AccountUserDto | UserDto) {
  return apiClient<string>({
    method: 'PUT',
    url: `/User/${user.id}`,
    data: toAccountUserDto(user),
  });
}

export function updateUserPassword(_role: ManageableRole, id: string, body: UpdatePasswordDto) {
  return apiClient<string>({
    method: 'PUT',
    url: `/User/password/${id}`,
    data: body,
  });
}

export function deleteUser(_role: ManageableRole, id: string) {
  return apiClientNoContent({
    method: 'DELETE',
    url: `/User/${id}`,
  });
}

export function restoreUser(_role: ManageableRole, id: string) {
  return apiClient<string>({
    method: 'PUT',
    url: `/User/restore/${id}`,
  });
}

function toAccountUserDto(user: AccountUserDto | UserDto): AccountUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };
}
