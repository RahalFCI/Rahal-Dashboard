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
