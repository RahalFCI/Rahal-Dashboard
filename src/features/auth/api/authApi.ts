import { apiClient, apiClientNoContent } from '@/shared/api/client';
import type { TokenDto } from '@/shared/api/types';
import type {
  AuthRequestDto,
  AuthResponseDto,
  ForgotPasswordRequestDto,
  RegisterRequestDto,
  ResendVerificationRequestDto,
  ResetPasswordRequestDto,
  UserRole,
  VerifyEmailRequestDto,
} from '../types';

export function register(body: RegisterRequestDto) {
  return apiClient<string>({
    method: 'POST',
    url: '/User/register',
    data: body,
  });
}

export function login(role: Exclude<UserRole, 'Explorer'>, body: AuthRequestDto) {
  void role;
  return apiClient<AuthResponseDto>({
    method: 'POST',
    url: '/User/login',
    data: body,
  });
}

export function logout(role: Exclude<UserRole, 'Explorer'>) {
  void role;
  return apiClientNoContent({
    method: 'POST',
    url: '/User/logout',
  });
}

export function refreshTokens(body: TokenDto) {
  return apiClient<AuthResponseDto>({
    method: 'POST',
    url: '/auth/generate',
    data: body,
  });
}

export function forgotPassword(body: ForgotPasswordRequestDto) {
  return apiClientNoContent({
    method: 'POST',
    url: '/Auth/forgot-password',
    data: body,
  });
}

export function resetPassword(body: ResetPasswordRequestDto) {
  return apiClient<string>({
    method: 'POST',
    url: '/Auth/reset-password',
    data: body,
  });
}

export function verifyEmail(body: VerifyEmailRequestDto) {
  return apiClient<string>({
    method: 'POST',
    url: '/EmailVerification/verify-email',
    data: body,
  });
}

export function resendVerification(body: ResendVerificationRequestDto) {
  return apiClient<string>({
    method: 'POST',
    url: '/EmailVerification/resend-verification',
    data: body,
  });
}
