export type Weekday =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export type WorkingHours = Partial<Record<Weekday, string>>;

export interface VendorProfileDto {
  userId: string;
  displayName: string;
  profilePictureUrl: string;
  countryCode: string;
  address: string;
  addressUrl: string;
  workingHours: WorkingHours;
  categoryId: string;
  isApproved: boolean;
}

export interface UpsertVendorProfileDto {
  userId: string;
  displayName: string;
  profilePictureUrl?: string;
  countryCode: string;
  address: string;
  addressUrl: string;
  workingHours: WorkingHours;
  categoryId: string;
}

export interface VendorCategoryDto {
  id: string;
  name: string;
}

export interface VendorBranchAddressDto {
  addressLine: string;
  government: string;
  city: string;
  country: string;
}

export interface GetVendorBranchDto {
  id: string;
  vendorId: string;
  placeId: string;
  branchName: string;
  phoneNumber: string;
  notes: string;
  isActive: boolean;
  placeName: string;
  description: string;
  latitude: number;
  longitude: number;
  geoFenceRange: number;
  address?: VendorBranchAddressDto | null;
}

export interface CreateVendorBranchDto {
  vendorId: string;
  branchName: string;
  phoneNumber: string;
  notes: string;
  placeName: string;
  description: string;
  latitude: number;
  longitude: number;
  geoFenceRange: number;
  address?: VendorBranchAddressDto;
}

export interface UpdateVendorBranchDto {
  branchName: string;
  phoneNumber: string;
  notes: string;
  isActive: boolean;
  placeName: string;
  description: string;
  latitude: number;
  longitude: number;
  geoFenceRange: number;
  address?: VendorBranchAddressDto;
}
