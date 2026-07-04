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

export interface VendorBranchDto {
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
  address: VendorBranchAddressDto | null;
}

export type GetVendorBranchDto = VendorBranchDto;

export interface UpsertVendorBranchDto {
  vendorId?: string;
  branchName: string;
  phoneNumber: string;
  notes: string;
  isActive?: boolean;
  placeName: string;
  description: string;
  latitude: number;
  longitude: number;
  geoFenceRange: number;
  address: VendorBranchAddressDto;
}

export interface CreateVendorBranchDto extends Omit<UpsertVendorBranchDto, 'vendorId'> {
  vendorId: string;
}

export type UpdateVendorBranchDto = Omit<UpsertVendorBranchDto, 'vendorId'>;
