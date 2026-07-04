export interface GetPlaceReviewDto {
  explorerId: string;
  placeId: string;
  checkInId: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  placeName: string;
}
