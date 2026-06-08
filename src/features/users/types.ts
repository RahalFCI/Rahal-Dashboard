import type { UserRole } from '@/features/auth/types';

export type ManageableRole = 'explorer' | 'vendor' | 'admin';

export interface BaseUserSummaryDto {
  id: string;
  name: string;
  profilePictureUrl?: string;
  phoneNumber: string;
  email: string;
  role: UserRole | number;
  isDeleted?: boolean;
}

export interface ExplorerSummaryDto extends BaseUserSummaryDto {
  bio: string;
  cumlativeXp: number;
  level: number;
  isPublic: boolean;
  isPremium: boolean;
}

export interface VendorSummaryDto extends BaseUserSummaryDto {
  countryCode: string;
  address: string;
  addressUrl: string;
  categoryId: string;
  isApproved: boolean;
}

export type AdminSummaryDto = BaseUserSummaryDto;
export type UserSummaryDto = ExplorerSummaryDto | VendorSummaryDto | AdminSummaryDto;

export interface BaseUserDto extends BaseUserSummaryDto {
  role: UserRole | number;
}

export interface ExplorerDto extends BaseUserDto {
  birthDate: string;
  gender: number;
  bio: string;
  countryCode: string;
  availableXp: number;
  cumlativeXp: number;
  level: number;
  isPublic: boolean;
  isPremium: boolean;
}

export interface VendorDto extends BaseUserDto {
  countryCode: string;
  address: string;
  addressUrl: string;
  workingHours: Record<string, string>;
  categoryId: string;
  isApproved: boolean;
}

export type AdminDto = BaseUserDto;
export type UserDto = ExplorerDto | VendorDto | AdminDto;

export interface AccountUserDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole | number;
}

export interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
