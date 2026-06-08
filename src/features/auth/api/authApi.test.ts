import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/client';
import { forgotPassword, login, resendVerification, resetPassword, verifyEmail } from './authApi';

function mockApiResponse<T>(data: T) {
  return vi.spyOn(axiosInstance, 'request').mockResolvedValue({
    data: { isSuccess: true, data, errorCode: 'None' },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  });
}

describe('authApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the backend User login endpoint for dashboard roles', async () => {
    const request = mockApiResponse({
      accessToken: 'token',
      refreshToken: 'refresh',
      accessTokenExpiration: '2026-06-04T10:00:00Z',
      refreshTokenExpiration: '2026-06-05T10:00:00Z',
    });

    await login('Admin', { email: 'admin@test.com', password: 'Password1!' });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/User/login',
      data: { email: 'admin@test.com', password: 'Password1!' },
    });
  });

  it('maps password recovery and email verification endpoints', async () => {
    const request = mockApiResponse('ok');

    await forgotPassword({ email: 'user@test.com' });
    await resetPassword({ email: 'user@test.com', otp: '123456', newPassword: 'Password1!', confirmPassword: 'Password1!' });
    await verifyEmail({ email: 'user@test.com', otp: '123456' });
    await resendVerification({ email: 'user@test.com' });

    expect(request).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: '/Auth/forgot-password',
      data: { email: 'user@test.com' },
    });
    expect(request).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/Auth/reset-password',
      data: { email: 'user@test.com', otp: '123456', newPassword: 'Password1!', confirmPassword: 'Password1!' },
    });
    expect(request).toHaveBeenNthCalledWith(3, {
      method: 'POST',
      url: '/EmailVerification/verify-email',
      data: { email: 'user@test.com', otp: '123456' },
    });
    expect(request).toHaveBeenNthCalledWith(4, {
      method: 'POST',
      url: '/EmailVerification/resend-verification',
      data: { email: 'user@test.com' },
    });
  });
});
