import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { deleteUser, getUser, updateUser, updateUserPassword } from './usersApi';

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
});
