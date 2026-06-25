import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { deleteUser, getUser, listAdmins, updateUser, updateUserPassword } from './usersApi';

function mockApiResponse<T>(data: T) {
  return vi.spyOn(axiosInstance, 'request').mockResolvedValue({
    data: { isSuccess: true, data, errorCode: 'None' },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  });
}

describe('usersApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses generic User account endpoints', async () => {
    const request = mockApiResponse('ok');

    await getUser('admin', 'user-1');
    await updateUser('admin', {
      id: 'user-1',
      name: 'Admin',
      email: 'admin@test.com',
      phoneNumber: '123456789',
      role: 'Admin',
      profilePictureUrl: 'ignored',
    });
    await updateUserPassword('admin', 'user-1', {
      oldPassword: 'Password1!',
      newPassword: 'Password2!',
      confirmPassword: 'Password2!',
    });

    expect(request).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/User/user-1',
    });
    expect(request).toHaveBeenNthCalledWith(2, {
      method: 'PUT',
      url: '/User/user-1',
      data: {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@test.com',
        phoneNumber: '123456789',
        role: 'Admin',
      },
    });
    expect(request).toHaveBeenNthCalledWith(3, {
      method: 'PUT',
      url: '/User/password/user-1',
      data: {
        oldPassword: 'Password1!',
        newPassword: 'Password2!',
        confirmPassword: 'Password2!',
      },
    });
  });

  it('uses no-content handling for soft delete', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: undefined,
      status: 204,
      statusText: 'No Content',
      headers: {},
      config: {},
    });

    await deleteUser('admin', 'user-1');

    expect(request).toHaveBeenCalledWith({
      method: 'DELETE',
      url: '/User/user-1',
    });
  });

  it('calls GET /User/admins, which (per UserController.cs) returns every user, not just admins', async () => {
    // GetAllAdminsAsync delegates to the same GetAllUsers() call as the plain
    // GET /User endpoint, so a non-admin row coming back here is the real,
    // documented backend behavior - not a mistake in this test.
    const mixedRolePage = {
      items: [
        { id: 'user-1', name: 'Admin', email: 'admin@test.com', phoneNumber: '111', role: 'Admin' },
        { id: 'user-2', name: 'Some Explorer', email: 'explorer@test.com', phoneNumber: '222', role: 'Explorer' },
      ],
      totalCount: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    const request = mockApiResponse(mixedRolePage);

    const result = await listAdmins(1, 10);

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/User/admins',
      params: { page: 1, pageSize: 10 },
    });
    expect(result).toEqual(mixedRolePage);
    expect(result.items.some((user) => user.role !== 'Admin')).toBe(true);
  });
});
