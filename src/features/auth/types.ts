export type UserRole = 'Admin' | 'Vendor' | 'Explorer';

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

export interface AuthRequestDto {
  email: string;
  password: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailRequestDto {
  email: string;
  otp: string;
}

export type ResendVerificationRequestDto = ForgotPasswordRequestDto;

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  emailConfirmed?: boolean;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  userRole: Exclude<UserRole, 'Explorer' | 'Admin'>;
}
