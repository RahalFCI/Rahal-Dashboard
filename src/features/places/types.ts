export interface AddressDto {
  addressLine: string;
  government: string;
  city: string;
  country: string;
}

export interface GetPlaceDto {
  id: string;
  name: string;
  description: string;
  placeCategoryId: string;
  categoryName: string;
  ticketPrice: number;
  latitude: number;
  longitude: number;
  geoFenceRange: number;
  address?: AddressDto | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpsertPlaceDto {
  name: string;
  description: string;
  placeCategoryId: string;
  ticketPrice: number;
  latitude: number;
  longitude: number;
  geoFenceRange: number;
  address: AddressDto;
}

export interface GetPlaceCategoryDto {
  id: string;
  name: string;
  description: string;
  placeCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpsertPlaceCategoryDto {
  name: string;
  description: string;
}

export interface PlacePhotoDto {
  id?: string;
  placeId?: string;
  photoUrl?: string;
  url?: string;
  createdAt?: string;
}
